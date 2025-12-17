const pool = require("../config/db");
const logger = require("../config/logger");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configuración de almacenamiento para archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar carpeta temporal, moveremos después cuando tengamos la categoría
    const uploadPath = path.join(__dirname, "../uploads/material");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const courseId = req.body.id_curso || "unknown";
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");

    cb(
      null,
      `curso${courseId}_${timestamp}_${random}_${safeBaseName}${fileExt}`,
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF, imágenes y videos"), false);
    }
  },
});

// @desc    Subir material del curso (planeación, material de descarga, actividades)
// @route   POST /api/material
// @access  Private (Maestro)
const subirMaterial = async (req, res) => {
  try {
    const {
      id_curso,
      categoria_material,
      nombre_archivo,
      descripcion,
      es_enlace,
      url_enlace,
      instrucciones_texto,
      fecha_limite,
      id_actividad, // <-- Recibimos el nuevo campo
    } = req.body;

    const subido_por = req.user.id_usuario;

    // Debug: Log incoming request data
    console.log(`🔍 Debug Material Upload:`);
    console.log(`   - ID Curso: ${id_curso}`);
    console.log(`   - Usuario ID: ${subido_por}`);
    console.log(`   - Tipo Usuario: ${req.user.tipo_usuario}`);
    console.log(`   - Categoría: ${categoria_material}`);
    console.log(`   - ID Actividad (si aplica): ${id_actividad}`);
    console.log(`   - Es enlace: ${es_enlace}`);
    console.log(
      `📁 Archivo recibido:`,
      req.file
        ? `${req.file.originalname} (${req.file.size} bytes)`
        : "Ninguno",
    );

    // Validaciones
    if (!id_curso || !categoria_material) {
      return res.status(400).json({
        error: "El ID del curso y categoría del material son obligatorios.",
      });
    }

    // Validar categoría
    const categoriasValidas = ["planeacion", "material_descarga", "actividad"];
    if (!categoriasValidas.includes(categoria_material)) {
      return res.status(400).json({
        error: "Categoría de material no válida.",
      });
    }

    // Debug: Verificar datos del usuario y curso
    console.log(`🔍 Debug Material Upload:
    - ID Curso: ${id_curso}
    - Usuario ID: ${subido_por}
    - Tipo Usuario: ${req.user.tipo_usuario}`);

    // También verificar si es admin o maestro
    const isAdmin =
      req.user.tipo_usuario === "admin_sedeq" ||
      req.user.tipo_usuario === "admin_universidad" ||
      req.user.tipo_usuario === "maestro";

    // Verificar que el usuario es maestro del curso solo si no es admin
    let tienePermisos = isAdmin;

    if (!isAdmin) {
      const [cursoRows] = await pool.query(
        `SELECT c.id_curso, c.id_maestro, m.id_maestro, m.id_usuario
         FROM curso c
         INNER JOIN maestro m ON c.id_maestro = m.id_maestro
         WHERE c.id_curso = ? AND m.id_usuario = ?`,
        [id_curso, subido_por],
      );

      console.log(`🔍 Resultado consulta maestro:`, cursoRows);
      tienePermisos = cursoRows.length > 0;
    }

    if (!tienePermisos) {
      console.log(
        `❌ Sin permisos: Usuario ${subido_por} no es maestro del curso ${id_curso} ni admin`,
      );
      return res.status(403).json({
        error: "No tienes permisos para subir material a este curso.",
      });
    }

    // Procesar parámetros
    const esEnlace = es_enlace === "true" || es_enlace === true;

    let ruta_archivo = null;
    let tipo_archivo = null;
    let tamaño_archivo = null;
    let nombre_final = nombre_archivo || "Material del curso";

    // Debug antes del procesamiento
    console.log(`🔄 Procesando: ${esEnlace ? "ENLACE" : "ARCHIVO"}`);
    console.log(`📂 Archivo req.file:`, req.file ? "SÍ EXISTE" : "NO EXISTE");

    // Si es un archivo subido (PDF)
    if (req.file && !esEnlace) {
      // Mover archivo a la carpeta correcta de la categoría
      const finalPath = path.join(
        __dirname,
        "../uploads/material",
        categoria_material,
      );
      if (!fs.existsSync(finalPath)) {
        fs.mkdirSync(finalPath, { recursive: true });
      }

      const finalFileName = path.basename(req.file.filename);
      const finalFilePath = path.join(finalPath, finalFileName);

      // Mover archivo de uploads/material/ a uploads/material/categoria/
      fs.renameSync(req.file.path, finalFilePath);

      ruta_archivo = finalFilePath;
      tipo_archivo = "pdf";
      tamaño_archivo = req.file.size;
      nombre_final = req.file.originalname;
      console.log(
        `✅ Archivo PDF procesado: ${nombre_final} -> ${finalFilePath}`,
      );
    }

    // Si es un enlace
    if (esEnlace) {
      if (!url_enlace || !url_enlace.trim()) {
        return res.status(400).json({
          error: "URL del enlace es obligatoria cuando es_enlace es true.",
        });
      }
      ruta_archivo = null;
      tipo_archivo = "enlace";
      tamaño_archivo = null;
      console.log(`✅ Enlace procesado: ${url_enlace}`);
    }

    // Validar que tenemos archivo o enlace (excepto para actividades sin contenido)
    if (!esEnlace && !req.file && categoria_material !== "actividad") {
      return res.status(400).json({
        error: "Se requiere un archivo cuando no es un enlace.",
      });
    }

    console.log(`💾 Insertando en BD con valores:`);
    console.log(`  - id_curso: ${id_curso}`);
    console.log(`  - nombre_archivo: ${nombre_final}`);
    console.log(`  - ruta_archivo: ${ruta_archivo}`);
    console.log(`  - tipo_archivo: ${tipo_archivo}`);
    console.log(`  - categoria_material: ${categoria_material}`);
    console.log(`  - es_enlace: ${esEnlace ? 1 : 0}`);
    console.log(`  - url_enlace: ${url_enlace || null}`);
    console.log(`  - tamaño_archivo: ${tamaño_archivo}`);
    console.log(`  - descripcion: ${descripcion || null}`);
    console.log(`  - fecha_limite: ${fecha_limite || null}`);
    console.log(`  - subido_por: ${subido_por}`);

    const insertQuery = `
      INSERT INTO material_curso (
        id_curso,
        nombre_archivo,
        ruta_archivo,
        tipo_archivo,
        categoria_material,
        es_enlace,
        url_enlace,
        tamaño_archivo,
        descripcion,
        instrucciones_texto,
        fecha_limite,
        subido_por,
        id_actividad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      id_curso,
      nombre_final,
      ruta_archivo,
      tipo_archivo,
      categoria_material,
      esEnlace ? 1 : 0,
      url_enlace || null,
      tamaño_archivo,
      descripcion || null,
      instrucciones_texto || null,
      fecha_limite || null,
      subido_por,
      id_actividad || null, // <-- Guardamos el ID de la actividad
    ]);

    logger.info(
      `Material subido exitosamente: ID ${result.insertId}, Curso: ${id_curso}, Categoría: ${categoria_material}`,
    );

    res.status(201).json({
      message: "Material subido exitosamente",
      material: {
        id_material: result.insertId,
        id_curso,
        nombre_archivo: nombre_final,
        categoria_material,
        es_enlace: esEnlace ? true : false,
        url_enlace,
        descripcion,
        fecha_subida: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`Error al subir material: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al subir el material.",
    });
  }
};

// @desc    Subir PDF para materiales de planeación (prácticas/proyecto/fuentes)
// @route   POST /api/material/planeacion
// @access  Private (Maestro)
const subirMaterialPlaneacion = async (req, res) => {
  try {
    const {
      id_curso,
      categoria_material, // 'planeacion' siempre
      tipo_material, // 'practica' | 'proyecto' | 'fuente'
      id_actividad, // Opcional, para prácticas/proyecto
      descripcion,
    } = req.body;

    const subido_por = req.user.id_usuario;

    // Validaciones
    if (!id_curso || !req.file) {
      return res.status(400).json({
        error: "El ID del curso y el archivo PDF son obligatorios.",
      });
    }

    // Verificar permisos del maestro
    const isAdmin =
      req.user.tipo_usuario === "admin_sedeq" ||
      req.user.tipo_usuario === "admin_universidad" ||
      req.user.tipo_usuario === "maestro";

    let tienePermisos = isAdmin;

    if (!isAdmin) {
      const [cursoRows] = await pool.query(
        `SELECT c.id_curso FROM curso c
         INNER JOIN maestro m ON c.id_maestro = m.id_maestro
         WHERE c.id_curso = ? AND m.id_usuario = ?`,
        [id_curso, subido_por]
      );
      tienePermisos = cursoRows.length > 0;
    }

    if (!tienePermisos) {
      return res.status(403).json({
        error: "No tienes permisos para subir material a este curso.",
      });
    }

    // Mover archivo a carpeta correcta
    const finalPath = path.join(__dirname, "../uploads/material", "planeacion");
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }

    const finalFileName = path.basename(req.file.filename);
    const finalFilePath = path.join(finalPath, finalFileName);
    fs.renameSync(req.file.path, finalFilePath);

    // Insertar en BD
    const [result] = await pool.query(
      `INSERT INTO material_curso (
        id_curso,
        nombre_archivo,
        ruta_archivo,
        tipo_archivo,
        categoria_material,
        es_enlace,
        tamaño_archivo,
        descripcion,
        subido_por,
        id_actividad
      ) VALUES (?, ?, ?, 'pdf', 'planeacion', 0, ?, ?, ?, ?)`,
      [
        id_curso,
        req.file.originalname,
        finalFilePath,
        req.file.size,
        descripcion || null,
        subido_por,
        id_actividad || null,
      ]
    );

    logger.info(`PDF subido para planeación: ID ${result.insertId}, Curso: ${id_curso}`);

    res.status(201).json({
      success: true,
      message: "PDF subido exitosamente",
      material: {
        id_material: result.insertId,
        nombre_archivo: req.file.originalname,
        tipo_archivo: "pdf",
        categoria_material: "planeacion",
        ruta_descarga: `/api/material/download/${result.insertId}`,
      },
    });
  } catch (error) {
    logger.error(`Error al subir PDF de planeación: ${error.message}`);
    res.status(500).json({
      error: "Error al subir el PDF",
    });
  }
};

module.exports = {
  // ... exports existentes
  subirMaterialPlaneacion,
};

// @desc    Obtener todo el material de un curso
// @route   GET /api/material/curso/:id_curso
// @access  Private (Alumno/Maestro)
const getMaterialCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { categoria } = req.query; // Filtro opcional por categoría

    if (!id_curso) {
      return res.status(400).json({
        error: "El ID del curso es obligatorio.",
      });
    }

    let query = `
      SELECT
        m.*,
        u.username as subido_por_nombre
      FROM material_curso m
      INNER JOIN usuario u ON m.subido_por = u.id_usuario
      WHERE m.id_curso = ? AND m.activo = 1
    `;

    const params = [id_curso];

    // Filtrar por categoría si se especifica
    if (categoria) {
      query += " AND m.categoria_material = ?";
      params.push(categoria);
    }

    query += " ORDER BY m.categoria_material, m.fecha_subida DESC";

    const [materialRows] = await pool.query(query, params);

    // Organizar material por categorías
    const materialOrganizado = {
      planeacion: [],
      material_descarga: [],
      actividad: [],
    };

    materialRows.forEach((material) => {
      const materialItem = {
        id_material: material.id_material,
        nombre_archivo: material.nombre_archivo,
        tipo_archivo: material.tipo_archivo,
        categoria_material: material.categoria_material,
        es_enlace: material.es_enlace === 1,
        url_enlace: material.url_enlace,
        descripcion: material.descripcion,
        instrucciones_texto: material.instrucciones_texto,
        id_actividad: material.id_actividad, // <-- Devolvemos el ID de la actividad
        fecha_limite: material.fecha_limite,
        fecha_subida: material.fecha_subida,
        subido_por_nombre: material.subido_por_nombre,
        // Solo incluir ruta si no es enlace y el usuario tiene permisos
        ruta_descarga: !material.es_enlace
          ? `/api/material/download/${material.id_material}`
          : null,
      };

      if (materialOrganizado[material.categoria_material]) {
        materialOrganizado[material.categoria_material].push(materialItem);
      }
    });

    res.status(200).json({
      id_curso,
      material: materialOrganizado,
      total_items: materialRows.length,
    });
  } catch (error) {
    logger.error(`Error al obtener material del curso: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al obtener el material.",
    });
  }
};

// @desc    Descargar archivo de material
// @route   GET /api/material/download/:id_material
// @access  Private (Alumno/Maestro inscrito en el curso)
const descargarMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;
    const id_usuario = req.user.id_usuario;

    if (!id_material) {
      return res.status(400).json({
        error: "El ID del material es obligatorio.",
      });
    }

    // Verificar que el material existe y obtener información
    const [materialRows] = await pool.query(
      "SELECT * FROM material_curso WHERE id_material = ? AND activo = 1",
      [id_material],
    );

    if (materialRows.length === 0) {
      return res.status(404).json({
        error: "Material no encontrado.",
      });
    }

    const material = materialRows[0];

    // Si es un enlace, no se puede descargar
    if (material.es_enlace) {
      return res.status(400).json({
        error: "Este material es un enlace, no un archivo descargable.",
      });
    }

    // Verificar permisos: debe estar inscrito en el curso o ser el maestro
    const [permisoRows] = await pool.query(
      `SELECT 1 FROM (
        SELECT i.id_inscripcion
        FROM inscripcion i
        INNER JOIN alumno a ON i.id_alumno = a.id_alumno
        WHERE i.id_curso = ? AND a.id_usuario = ? AND i.estatus_inscripcion = 'aprobada'
        UNION
        SELECT 1
        FROM curso c
        INNER JOIN maestro m ON c.id_maestro = m.id_maestro
        WHERE c.id_curso = ? AND m.id_usuario = ?
      ) permisos LIMIT 1`,
      [material.id_curso, id_usuario, material.id_curso, id_usuario],
    );

    if (permisoRows.length === 0) {
      return res.status(403).json({
        error: "No tienes permisos para descargar este material.",
      });
    }

    // Usar res.download() para mejor manejo de headers y nombres de archivo
    const filePath = path.resolve(material.ruta_archivo);

    // Verificar que el archivo existe antes de intentar descargarlo
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "El archivo no se encuentra en el servidor.",
      });
    }

    // Headers para prevenir caché del navegador
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.download(filePath, material.nombre_archivo, (err) => {
      if (err) {
        console.error("Error al descargar archivo:", err);
        logger.error(`Error al descargar material: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Error interno del servidor al descargar el material.",
          });
        }
      } else {
        logger.info(
          `Archivo descargado: ${material.nombre_archivo} por usuario ${id_usuario}`,
        );
      }
    });
  } catch (error) {
    logger.error(`Error al descargar material: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al descargar el material.",
    });
  }
};

// @desc    Actualizar material del curso
// @route   PUT /api/material/:id_material
// @access  Private (Maestro propietario)
const actualizarMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;
    const { descripcion, instrucciones_texto, fecha_limite, activo } = req.body;
    const id_usuario = req.user.id_usuario;

    // Verificar si es admin
    const isAdmin =
      req.user.tipo_usuario === "admin_sedeq" ||
      req.user.tipo_usuario === "admin_universidad" ||
      req.user.tipo_usuario === "maestro";

    let tienePermisos = isAdmin;
    let materialRows = [];

    if (!isAdmin) {
      // Verificar permisos para maestros
      const [rows] = await pool.query(
        `SELECT m.*, c.id_maestro
         FROM material_curso m
         INNER JOIN curso c ON m.id_curso = c.id_curso
         INNER JOIN maestro ma ON c.id_maestro = ma.id_maestro
         WHERE m.id_material = ? AND ma.id_usuario = ?`,
        [id_material, id_usuario],
      );
      materialRows = rows;
      tienePermisos = materialRows.length > 0;
    } else {
      // Para admins, obtener el material sin restricción de propietario
      const [rows] = await pool.query(
        `SELECT m.*, c.id_maestro
         FROM material_curso m
         INNER JOIN curso c ON m.id_curso = c.id_curso
         WHERE m.id_material = ?`,
        [id_material],
      );
      materialRows = rows;
    }

    if (!tienePermisos || materialRows.length === 0) {
      return res.status(403).json({
        error: "No tienes permisos para actualizar este material.",
      });
    }

    // Actualizar campos permitidos
    const updateQuery = `
      UPDATE material_curso
      SET descripcion = ?,
          instrucciones_texto = ?,
          fecha_limite = ?,
          activo = ?
      WHERE id_material = ?
    `;

    await pool.query(updateQuery, [
      descripcion || materialRows[0].descripcion,
      instrucciones_texto || materialRows[0].instrucciones_texto,
      fecha_limite || materialRows[0].fecha_limite,
      activo !== undefined ? activo : materialRows[0].activo,
      id_material,
    ]);

    logger.info(
      `Material actualizado: ID ${id_material} por usuario ${id_usuario}`,
    );

    res.status(200).json({
      message: "Material actualizado exitosamente",
    });
  } catch (error) {
    logger.error(`Error al actualizar material: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el material.",
    });
  }
};

// @desc    Eliminar material del curso (soft delete)
// @route   DELETE /api/material/:id_material
// @access  Private (Maestro propietario)
const eliminarMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;
    const id_usuario = req.user.id_usuario;

    // Verificar si es admin
    const isAdmin =
      req.user.tipo_usuario === "admin_sedeq" ||
      req.user.tipo_usuario === "admin_universidad" ||
      req.user.tipo_usuario === "maestro";

    let tienePermisos = isAdmin;

    if (!isAdmin) {
      // Verificar permisos para maestros
      const [materialRows] = await pool.query(
        `SELECT m.*, c.id_maestro
         FROM material_curso m
         INNER JOIN curso c ON m.id_curso = c.id_curso
         INNER JOIN maestro ma ON c.id_maestro = ma.id_maestro
         WHERE m.id_material = ? AND ma.id_usuario = ?`,
        [id_material, id_usuario],
      );

      tienePermisos = materialRows.length > 0;
    }

    if (!tienePermisos) {
      return res.status(403).json({
        error: "No tienes permisos para eliminar este material.",
      });
    }

    // Hard delete
    await pool.query("DELETE FROM material_curso WHERE id_material = ?", [
      id_material,
    ]);

    logger.info(
      `Material eliminado (hard delete): ID ${id_material} por usuario ${id_usuario}`,
    );

    res.status(200).json({
      message: "Material eliminado exitosamente",
    });
  } catch (error) {
    logger.error(`Error al eliminar material: ${error.message}`);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el material.",
    });
  }
};

// @desc    Verificar estructura de tabla (temporal para debug)
// @route   GET /api/material/debug-table
// @access  Private (Admin)
const debugTableStructure = async (req, res) => {
  try {
    // Verificar estructura de la tabla
    const [describe] = await pool.query("DESCRIBE material_curso");

    // Contar registros
    const [count] = await pool.query(
      "SELECT COUNT(*) as total FROM material_curso",
    );

    // Ver algunos registros recientes
    const [recent] = await pool.query(`
      SELECT id_material, id_curso, nombre_archivo, ruta_archivo, categoria_material,
             es_enlace, fecha_subida, activo
      FROM material_curso
      ORDER BY fecha_subida DESC
      LIMIT 5
    `);

    res.json({
      table_structure: describe,
      total_records: count[0].total,
      recent_records: recent,
    });
  } catch (error) {
    console.error("Error en debug:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Arreglar estructura de tabla para permitir NULL en ruta_archivo
// @route   POST /api/material/fix-table
// @access  Private (Admin)
const fixTableStructure = async (req, res) => {
  try {
    console.log("🔧 Iniciando arreglo de estructura de tabla...");

    // Modificar la tabla para permitir NULL en ruta_archivo
    await pool.query(`
      ALTER TABLE material_curso
      MODIFY COLUMN ruta_archivo varchar(500) DEFAULT NULL
    `);

    console.log("✅ Tabla modificada: ruta_archivo ahora permite NULL");

    // También modificar tipo_archivo para permitir NULL
    await pool.query(`
      ALTER TABLE material_curso
      MODIFY COLUMN tipo_archivo enum('pdf','imagen','video','documento') DEFAULT NULL
    `);

    console.log("✅ Tabla modificada: tipo_archivo ahora permite NULL");

    // Verificar la nueva estructura
    const [describe] = await pool.query("DESCRIBE material_curso");

    res.json({
      message: "Estructura de tabla arreglada exitosamente",
      new_structure: describe,
    });
  } catch (error) {
    console.error("❌ Error al arreglar tabla:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  upload,
  subirMaterial,
  subirMaterialPlaneacion,
  getMaterialCurso,
  descargarMaterial,
  actualizarMaterial,
  eliminarMaterial,
  debugTableStructure,
  fixTableStructure,
};
