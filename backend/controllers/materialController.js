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
  let connection;
  // Guardamos la ruta del archivo físico por si hay que borrarlo tras error en BD
  let finalFilePathSystem = null;

  try {
    const { 
      id_curso, 
      categoria_material, 
      nombre_archivo, 
      descripcion, 
      es_enlace, 
      url_enlace,
      tipo_archivo 
    } = req.body;
    
    const subido_por = req.user.id_usuario;

    // Validación básica
    if (!id_curso) {
      return res.status(400).json({ error: "El ID del curso es obligatorio." });
    }

    // Determinar si es archivo o enlace
    const isLink = es_enlace === 'true' || es_enlace === '1' || es_enlace === 1;
    
    // Si es archivo PDF, validar que Multer lo haya procesado
    if (!isLink && !req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo PDF." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let dbRelativePath = null;
    let finalSize = 0;
    let finalName = nombre_archivo || "Material";

    // Lógica para Archivos Físicos (PDF)
    if (!isLink && req.file) {
      const uploadDir = path.join(__dirname, `../uploads/material/${categoria_material || 'varios'}`);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único
      const uniqueName = `curso${id_curso}_${Date.now()}_${Math.round(Math.random() * 1E9)}_${req.file.originalname.replace(/\s+/g, '_')}`;
      finalFilePathSystem = path.join(uploadDir, uniqueName);
      
      // Mover archivo
      fs.renameSync(req.file.path, finalFilePathSystem);
      
      // Ruta relativa para BD
      dbRelativePath = `uploads/material/${categoria_material || 'varios'}/${uniqueName}`;
      finalSize = req.file.size;
      finalName = nombre_archivo || req.file.originalname;
    }

    // Lógica para Enlaces
    if (isLink) {
        finalName = nombre_archivo || "Enlace Web";
        // Validar URL si es necesario
    }

    // --- AQUÍ ESTABA EL ERROR ---
    // Eliminamos 'id_actividad' de la consulta porque esa columna NO existe en material_curso
    const [result] = await connection.query(
      `INSERT INTO material_curso (
        id_curso,
        nombre_archivo,
        ruta_archivo,
        tipo_archivo,
        categoria_material,
        es_enlace,
        url_enlace,
        tamaño_archivo,
        descripcion,
        subido_por,
        fecha_subida,
        activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [
        id_curso,
        finalName,
        dbRelativePath, // Será null si es enlace
        isLink ? 'enlace' : 'pdf',
        categoria_material || 'material_descarga',
        isLink ? 1 : 0,
        isLink ? url_enlace : null,
        finalSize,
        descripcion || null,
        subido_por
      ]
    );

    const id_material = result.insertId;

    await connection.commit();

    // Responder
    res.status(201).json({
      success: true,
      message: "Material subido exitosamente",
      material: {
        id_material,
        nombre_archivo: finalName,
        ruta_archivo: dbRelativePath,
        url_enlace: isLink ? url_enlace : null,
        es_enlace: isLink ? 1 : 0,
        fecha_subida: new Date()
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    
    // Limpieza de archivo si falló la BD
    if (finalFilePathSystem && fs.existsSync(finalFilePathSystem)) {
        fs.unlinkSync(finalFilePathSystem);
    } else if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }

    logger.error(`Error al subir material: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor al subir el material." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Subir PDF para materiales de planeación (prácticas/proyecto/fuentes)
const subirMaterialPlaneacion = async (req, res) => {
  let connection;
  // Definimos rutas fuera del try para usarlas en el catch si es necesario borrar
  let finalFilePathSystem = null; 

  try {
    const {
      id_curso,
      categoria_material, // 'planeacion' típicamente
      id_actividad,       // Opcional: Si viene, vinculamos a la actividad
      descripcion,
    } = req.body;

    const subido_por = req.user.id_usuario;

    // 1. Validaciones básicas
    if (!id_curso || !req.file) {
      return res.status(400).json({
        error: "El ID del curso y el archivo PDF son obligatorios.",
      });
    }

    // 2. Verificar permisos (Lógica existente)
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
      // Si se subió el archivo temporal por Multer pero no tiene permisos, lo borramos
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(403).json({
        error: "No tienes permisos para subir material a este curso.",
      });
    }

    // 3. Obtener una conexión dedicada para la transacción
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 4. Mover archivo a carpeta definitiva
    // Usamos path.join para el sistema operativo (funciona en Linux/Windows)
    const uploadDir = path.join(__dirname, "../uploads/material/planeacion");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalFileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`; // Nombre único y limpio
    finalFilePathSystem = path.join(uploadDir, finalFileName);
    
    // Mover del temp de Multer a la carpeta final
    fs.renameSync(req.file.path, finalFilePathSystem);

    // Ruta RELATIVA para guardar en BD (Esto es lo que el frontend usará o el servidor servirá)
    // Ejemplo en BD: uploads/material/planeacion/1728392-archivo.pdf
    const dbRelativePath = `uploads/material/planeacion/${finalFileName}`;

    // 5. Insertar en material_curso (SIN id_actividad)
    // IMPORTANTE: Usar 'connection.query', no 'pool.query' dentro de la transacción
    const [result] = await connection.query(
      `INSERT INTO material_curso (
        id_curso,
        nombre_archivo,
        ruta_archivo,
        tipo_archivo,
        categoria_material,
        es_enlace,
        tamaño_archivo,
        descripcion,
        subido_por
      ) VALUES (?, ?, ?, 'pdf', ?, 0, ?, ?, ?)`,
      [
        id_curso,
        req.file.originalname,
        dbRelativePath, // <--- Guardamos ruta relativa
        categoria_material || 'planeacion',
        req.file.size,
        descripcion || null,
        subido_por
      ]
    );

    const id_material = result.insertId;

    // 6. Si hay id_actividad, crear el vínculo en la tabla pivote
    if (id_actividad) {
      // Validar que la actividad exista antes de insertar (opcional pero recomendado)
      const [actividadExists] = await connection.query(
        "SELECT id_actividad FROM calificaciones_actividades WHERE id_actividad = ?",
        [id_actividad]
      );

      if (actividadExists.length === 0) {
        throw new Error(`La actividad ${id_actividad} no existe.`);
      }

      await connection.query(
        `INSERT INTO actividad_materiales (id_actividad, id_material) VALUES (?, ?)`,
        [id_actividad, id_material]
      );
    }

    // 7. Confirmar transacción
    await connection.commit();

    logger.info(`PDF subido ID: ${id_material} vinculado a Curso: ${id_curso} ${id_actividad ? `y Actividad: ${id_actividad}` : ''}`);

    res.status(201).json({
      success: true,
      message: "PDF subido exitosamente",
      material: {
        id_material: id_material,
        nombre_archivo: req.file.originalname,
        tipo_archivo: "pdf",
        categoria_material: categoria_material || "planeacion",
        // Aquí construyes la URL pública o ruta de descarga
        url: dbRelativePath 
      },
    });

  } catch (error) {
    // 8. Rollback y Limpieza en caso de error
    if (connection) await connection.rollback();
    
    logger.error(`Error al subir PDF de planeación: ${error.message}`);

    // Si el archivo se llegó a mover a la carpeta final pero la BD falló, lo borramos
    if (finalFilePathSystem && fs.existsSync(finalFilePathSystem)) {
        try {
            fs.unlinkSync(finalFilePathSystem);
            logger.info("Archivo huérfano eliminado tras error en BD.");
        } catch (unlinkError) {
            logger.error("Error al borrar archivo huérfano:", unlinkError);
        }
    } else if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        // Si falló antes de moverlo, borramos el temporal
        fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Error al guardar el archivo en la base de datos.",
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
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
