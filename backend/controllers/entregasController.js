const pool = require("../config/db");
const logger = require("../config/logger");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

// Configuración de almacenamiento para archivos de entregas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/material/entregas_Alumno");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const hash = crypto.createHash("md5").update(file.originalname + Date.now()).digest("hex").substring(0, 8);
    cb(null, `entrega-${hash}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/x-rar-compressed", "image/jpeg", "image/png", "image/gif", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
  },
});

// @desc    Crear o actualizar una entrega de tarea
// @route   POST /api/entregas
// @access  Private (Alumno)
const crearEntrega = async (req, res) => {
  let connection;
  try {
    const { id_actividad, comentario_estudiante } = req.body;
    const { id_usuario } = req.user;
    const links = req.body.links ? JSON.parse(req.body.links) : [];

    if (!id_actividad) {
      return res.status(400).json({ error: "El ID de la actividad es obligatorio." });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [actividadRows] = await connection.query(
      `SELECT ca.*, cc.id_curso FROM calificaciones_actividades ca
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       WHERE ca.id_actividad = ?`,
      [id_actividad]
    );

    if (actividadRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Actividad no encontrada." });
    }
    const actividad = actividadRows[0];

    const [inscripcionRows] = await connection.query(
      `SELECT i.id_inscripcion FROM inscripcion i
       JOIN alumno a ON i.id_alumno = a.id_alumno
       WHERE i.id_curso = ? AND a.id_usuario = ? AND i.estatus_inscripcion = 'aprobada'`,
      [actividad.id_curso, id_usuario]
    );

    if (inscripcionRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: "No estás inscrito en este curso." });
    }
    const id_inscripcion = inscripcionRows[0].id_inscripcion;

    const [entregaExistente] = await connection.query(
      "SELECT id_entrega, estatus_entrega FROM entregas_estudiantes WHERE id_actividad = ? AND id_inscripcion = ?",
      [id_actividad, id_inscripcion]
    );

    let id_entrega;
    let es_nueva_entrega = false;

    if (entregaExistente.length > 0) {
      id_entrega = entregaExistente[0].id_entrega;
      if (entregaExistente[0].estatus_entrega === "calificada") {
        await connection.rollback();
        return res.status(400).json({ error: "No puedes modificar una entrega ya calificada." });
      }
      if (comentario_estudiante) {
        await connection.query(
          "UPDATE entregas_estudiantes SET comentario_estudiante = ?, fecha_entrega = NOW() WHERE id_entrega = ?",
          [comentario_estudiante, id_entrega]
        );
      }
    } else {
      es_nueva_entrega = true;
      const es_extemporanea = actividad.fecha_limite ? new Date() > new Date(actividad.fecha_limite) : false;
      const [insertResult] = await connection.query(
        `INSERT INTO entregas_estudiantes (id_actividad, id_inscripcion, comentario_estudiante, es_extemporanea, estatus_entrega)
         VALUES (?, ?, ?, ?, ?)`,
        [id_actividad, id_inscripcion, comentario_estudiante || null, es_extemporanea, 'no_entregada']
      );
      id_entrega = insertResult.insertId;
    }

    const archivosSubidos = [];
    const enlacesSubidos = [];

    // Procesar archivos PDF
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileBuffer = fs.readFileSync(file.path);
        const hash_archivo = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        const [archivoResult] = await connection.query(
          `INSERT INTO archivos_entrega (id_entrega, nombre_archivo_original, nombre_archivo_sistema, ruta_archivo, tipo_archivo, tamano_archivo, hash_archivo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id_entrega, file.originalname, file.filename, file.path, file.mimetype, file.size, hash_archivo]
        );
        archivosSubidos.push({ id_archivo: archivoResult.insertId, nombre_original: file.originalname });
      }
    }

    // Procesar enlaces
    if (links && Array.isArray(links) && links.length > 0) {
      for (const link of links) {
        if (link && link.trim().startsWith('http')) {
          const [enlaceResult] = await connection.query(
            `INSERT INTO archivos_entrega (id_entrega, nombre_archivo_original, nombre_archivo_sistema, ruta_archivo, tipo_archivo, tamano_archivo, hash_archivo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_entrega, link, 'enlace', link, 'link', 0, null]
          );
          enlacesSubidos.push({ id_enlace: enlaceResult.insertId, url: link });
        }
      }
    }

    // Actualizar estado si se subieron archivos o enlaces
    if ((req.files && req.files.length > 0) || (links && links.length > 0)) {
      await connection.query(
        "UPDATE entregas_estudiantes SET estatus_entrega = 'no_entregada', fecha_entrega = NOW() WHERE id_entrega = ?",
        [id_entrega]
      );
    }

    await connection.commit();
    logger.info(`Entrega ${es_nueva_entrega ? "creada" : "actualizada"}: ID ${id_entrega}`);
    res.status(es_nueva_entrega ? 201 : 200).json({
      message: `Entrega ${es_nueva_entrega ? "enviada" : "actualizada"} con éxito.`,
      id_entrega,
      archivos_subidos: archivosSubidos,
      enlaces_subidos: enlacesSubidos,
    });

  } catch (error) {
    if (connection) await connection.rollback();
    if (req.files) {
      req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
    }
    logger.error(`Error al crear/actualizar entrega: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor al procesar la entrega." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Obtener entregas de un alumno para un curso
// @route   GET /api/entregas/alumno/:id_curso
// @access  Private (Alumno)
const getEntregasAlumno = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { id_usuario } = req.user;

    const [inscripcionRows] = await pool.query(
      `SELECT i.id_inscripcion FROM inscripcion i
       JOIN alumno a ON i.id_alumno = a.id_alumno
       WHERE i.id_curso = ? AND a.id_usuario = ?`,
      [id_curso, id_usuario]
    );

    if (inscripcionRows.length === 0) {
      return res.status(403).json({ error: "No estás inscrito en este curso." });
    }
    const id_inscripcion = inscripcionRows[0].id_inscripcion;

    const [entregasRows] = await pool.query(
      `SELECT
        e.*, ca.nombre as nombre_actividad, ca.fecha_limite,
        COUNT(a.id_archivo_entrega) as total_archivos
       FROM entregas_estudiantes e
       JOIN calificaciones_actividades ca ON e.id_actividad = ca.id_actividad
       LEFT JOIN archivos_entrega a ON e.id_entrega = a.id_entrega
       WHERE e.id_inscripcion = ?
       GROUP BY e.id_entrega
       ORDER BY e.fecha_entrega DESC`,
      [id_inscripcion]
    );

    const entregas = await Promise.all(entregasRows.map(async (entrega) => {
      const [archivosRows] = await pool.query(
        `SELECT id_archivo_entrega, nombre_archivo_original, tipo_archivo, tamano_archivo, fecha_subida
         FROM archivos_entrega WHERE id_entrega = ?`,
        [entrega.id_entrega]
      );
      return {
        ...entrega,
        es_extemporanea: entrega.es_extemporanea === 1,
        archivos: archivosRows,
      };
    }));

    res.status(200).json({ entregas, total: entregas.length });
  } catch (error) {
    logger.error(`Error al obtener entregas del alumno: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener entregas para una actividad
// @route   GET /api/entregas/actividad/:id_actividad
// @access  Private (Maestro)
const getEntregasActividad = async (req, res) => {
  try {
    const { id_actividad } = req.params;
    const { id_usuario } = req.user;

    const [permisoRows] = await pool.query(
      `SELECT c.id_curso FROM calificaciones_actividades ca
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       JOIN curso c ON cc.id_curso = c.id_curso
       JOIN maestro m ON c.id_maestro = m.id_maestro
       WHERE ca.id_actividad = ? AND m.id_usuario = ?`,
      [id_actividad, id_usuario]
    );

    if (permisoRows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para ver estas entregas." });
    }

    const [entregasRows] = await pool.query(
      `SELECT e.*, u.nombre as nombre_alumno, u.email as email_alumno,
        COUNT(ar.id_archivo_entrega) as total_archivos
       FROM entregas_estudiantes e
       JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion
       JOIN alumno al ON i.id_alumno = al.id_alumno
       JOIN usuario u ON al.id_usuario = u.id_usuario
       LEFT JOIN archivos_entrega ar ON e.id_entrega = ar.id_entrega
       WHERE e.id_actividad = ?
       GROUP BY e.id_entrega ORDER BY e.fecha_entrega DESC`,
      [id_actividad]
    );

    const entregas = await Promise.all(entregasRows.map(async (entrega) => {
      const [archivosRows] = await pool.query(
        "SELECT * FROM archivos_entrega WHERE id_entrega = ?", [entrega.id_entrega]
      );
      return { ...entrega, archivos: archivosRows };
    }));

    res.status(200).json({ entregas, total: entregas.length });
  } catch (error) {
    logger.error(`Error al obtener entregas de la actividad: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Calificar una entrega
// @route   PUT /api/entregas/:id_entrega/calificar
// @access  Private (Maestro)
const calificarEntrega = async (req, res) => {
  try {
    const { id_entrega } = req.params;
    const { calificacion, feedback } = req.body;
    const { id_usuario, tipo_usuario } = req.user;

    if (calificacion === undefined || calificacion === null) {
      return res.status(400).json({ error: "La calificación es obligatoria." });
    }

    const [permisoRows] = await pool.query(
      `SELECT e.id_entrega FROM entregas_estudiantes e
       JOIN calificaciones_actividades ca ON e.id_actividad = ca.id_actividad
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       JOIN curso c ON cc.id_curso = c.id_curso
       JOIN maestro m ON c.id_maestro = m.id_maestro
       WHERE e.id_entrega = ? AND (m.id_usuario = ? OR ? IN ('admin_sedeq', 'admin_universidad'))`,
      [id_entrega, id_usuario, tipo_usuario]
    );

    if (permisoRows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para calificar esta entrega." });
    }

    await pool.query(
      `UPDATE entregas_estudiantes SET calificacion = ?, comentario_profesor = ?, estatus_entrega = 'calificada', fecha_calificacion = NOW(), calificado_por = ?
       WHERE id_entrega = ?`,
      [calificacion, feedback, id_usuario, id_entrega]
    );

    logger.info(`Entrega calificada: ID ${id_entrega}, Calificación: ${calificacion}`);
    res.status(200).json({ message: "Entrega calificada exitosamente" });
  } catch (error) {
    logger.error(`Error al calificar entrega: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Descargar archivo de entrega
// @route   GET /api/entregas/download/:id_archivo
// @access  Private (Maestro o Alumno propietario)
const descargarArchivoEntrega = async (req, res) => {
  try {
    const { id_archivo } = req.params;
    const { id_usuario, tipo_usuario } = req.user;

    const [archivoRows] = await pool.query(
      `SELECT a.*, e.id_inscripcion, al.id_usuario as alumno_usuario_id, m.id_usuario as maestro_usuario_id
       FROM archivos_entrega a
       JOIN entregas_estudiantes e ON a.id_entrega = e.id_entrega
       JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion
       JOIN alumno al ON i.id_alumno = al.id_alumno
       JOIN calificaciones_actividades ca ON e.id_actividad = ca.id_actividad
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       JOIN curso c ON cc.id_curso = c.id_curso
       JOIN maestro m ON c.id_maestro = m.id_maestro
       WHERE a.id_archivo_entrega = ?`,
      [id_archivo]
    );

    if (archivoRows.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }
    const archivo = archivoRows[0];

    const esPropietario = id_usuario === archivo.alumno_usuario_id;
    const esMaestroDelCurso = id_usuario === archivo.maestro_usuario_id;
    const esAdmin = tipo_usuario === 'admin_sedeq' || tipo_usuario === 'admin_universidad';

    if (!esPropietario && !esMaestroDelCurso && !esAdmin) {
      return res.status(403).json({ error: "No tienes permisos para descargar este archivo." });
    }

    // Si es un enlace, devolver la URL directamente
    if (archivo.tipo_archivo === 'link') {
      return res.json({ url: archivo.nombre_archivo_original, tipo: 'link' });
    }

    // Si es un archivo físico, verificar que existe y servirlo
    if (!fs.existsSync(archivo.ruta_archivo)) {
      return res.status(404).json({ error: "El archivo no se encuentra en el servidor." });
    }

    // Generar URL relativa para servir el archivo estáticamente
    const relativePath = path.relative(path.join(__dirname, '../'), archivo.ruta_archivo);
    const fileUrl = `/${relativePath.replace(/\\/g, '/')}`;

    res.json({
      url: fileUrl,
      filename: archivo.nombre_archivo_original,
      tipo: 'file'
    });

  } catch (error) {
    logger.error(`Error al obtener información del archivo: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


// @desc    Eliminar archivo o enlace individual de una entrega
// @route   DELETE /api/entregas/archivo/:id_archivo
// @access  Private (Alumno propietario)
const eliminarArchivoEntrega = async (req, res) => {
  const { id_archivo } = req.params;
  const { id_usuario } = req.user;

  try {
    const [archivoRows] = await pool.query(
      `SELECT ae.*, ee.id_entrega, ee.estatus_entrega, a.id_usuario
       FROM archivos_entrega ae
       JOIN entregas_estudiantes ee ON ae.id_entrega = ee.id_entrega
       JOIN inscripcion i ON ee.id_inscripcion = i.id_inscripcion
       JOIN alumno a ON i.id_alumno = a.id_alumno
       WHERE ae.id_archivo_entrega = ?`,
      [id_archivo]
    );

    if (archivoRows.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado." });
    }
    const archivo = archivoRows[0];

    if (archivo.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este archivo." });
    }

    if (archivo.estatus_entrega === 'calificada') {
      return res.status(400).json({ error: "No puedes eliminar archivos de una entrega calificada." });
    }

    // Si es un archivo físico, eliminarlo del sistema
    if (archivo.tipo_archivo !== 'link' && fs.existsSync(archivo.ruta_archivo)) {
      fs.unlinkSync(archivo.ruta_archivo);
    }
    
    await pool.query("DELETE FROM archivos_entrega WHERE id_archivo_entrega = ?", [id_archivo]);

    logger.info(`${archivo.tipo_archivo === 'link' ? 'Enlace' : 'Archivo'} eliminado: ${archivo.nombre_archivo_original} por usuario ${id_usuario}`);
    res.json({ message: `${archivo.tipo_archivo === 'link' ? 'Enlace' : 'Archivo'} eliminado exitosamente.` });
  } catch (error) {
    logger.error(`Error al eliminar archivo: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// This function is no longer needed as getEntregasActividad and getEntregasAlumno cover the cases
const getEntregasPorAlumnoYCurso = async (req, res) => {
    res.status(404).json({ message: "This endpoint is deprecated." });
}

// @desc    Marcar una entrega como finalizada
// @route   PUT /api/entregas/:id_entrega/submit
// @access  Private (Alumno)
const submitEntrega = async (req, res) => {
  const { id_entrega } = req.params;
  const { id_usuario } = req.user;

  try {
    // Primero, verificar que el usuario es el propietario de la entrega y que no está calificada
    const [entregaRows] = await pool.query(
      `SELECT e.id_entrega, e.estatus_entrega, a.id_usuario
       FROM entregas_estudiantes e
       JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion
       JOIN alumno a ON i.id_alumno = a.id_alumno
       WHERE e.id_entrega = ?`,
      [id_entrega]
    );

    if (entregaRows.length === 0) {
      return res.status(404).json({ error: "Entrega no encontrada." });
    }

    const entrega = entregaRows[0];
    if (entrega.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para modificar esta entrega." });
    }

    if (entrega.estatus_entrega === 'calificada') {
      return res.status(400).json({ error: "No puedes modificar una entrega que ya ha sido calificada." });
    }

    // Actualizar el estado a 'entregada'
    await pool.query(
      "UPDATE entregas_estudiantes SET estatus_entrega = 'entregada', fecha_entrega = NOW() WHERE id_entrega = ?",
      [id_entrega]
    );

    logger.info(`Entrega marcada como finalizada: ID ${id_entrega}`);
    res.status(200).json({ message: "Tarea entregada exitosamente." });

  } catch (error) {
    logger.error(`Error al finalizar entrega: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Anular la entrega de una tarea (volver a borrador)
// @route   PUT /api/entregas/:id_entrega/unsubmit
// @access  Private (Alumno)
const unsubmitEntrega = async (req, res) => {
  const { id_entrega } = req.params;
  const { id_usuario } = req.user;

  try {
    // Verificar que el usuario es el propietario y que la tarea no está calificada
    const [entregaRows] = await pool.query(
      `SELECT e.id_entrega, e.estatus_entrega, a.id_usuario
       FROM entregas_estudiantes e
       JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion
       JOIN alumno a ON i.id_alumno = a.id_alumno
       WHERE e.id_entrega = ?`,
      [id_entrega]
    );

    if (entregaRows.length === 0) {
      return res.status(404).json({ error: "Entrega no encontrada." });
    }

    const entrega = entregaRows[0];
    if (entrega.id_usuario !== id_usuario) {
      return res.status(403).json({ error: "No tienes permisos para modificar esta entrega." });
    }

    if (entrega.estatus_entrega === 'calificada') {
      return res.status(400).json({ error: "No puedes anular una entrega que ya ha sido calificada." });
    }
    
    if (entrega.estatus_entrega !== 'entregada') {
        return res.status(400).json({ error: "Esta entrega no se puede anular porque no ha sido entregada." });
    }

    // Actualizar el estado a 'no_entregada' (borrador)
    await pool.query(
      "UPDATE entregas_estudiantes SET estatus_entrega = 'no_entregada' WHERE id_entrega = ?",
      [id_entrega]
    );

    logger.info(`Entrega anulada: ID ${id_entrega}`);
    res.status(200).json({ message: "Entrega anulada. Ahora puedes hacer cambios." });

  } catch (error) {
    logger.error(`Error al anular entrega: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = {
  upload,
  crearEntrega,
  getEntregasAlumno,
  getEntregasActividad,
  calificarEntrega,
  submitEntrega,
  unsubmitEntrega,
  descargarArchivoEntrega,
  eliminarArchivoEntrega,
  getEntregasPorAlumnoYCurso,
};
