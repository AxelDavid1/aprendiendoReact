const pool = require("../config/db");
const logger = require("../config/logger");
// Cache functions removed - not implemented in cache.js

// @desc    Crear una nueva solicitud de inscripción
// @route   POST /api/inscripciones
// @access  Private (Alumno)
const crearInscripcion = async (req, res) => {
  const { id_curso } = req.body;
  const id_alumno = req.user.id_alumno; // Obtenido del middleware 'protect'

  if (!id_curso) {
    return res.status(400).json({ error: "El ID del curso es obligatorio." });
  }

  try {
    // Verificar si ya existe una inscripción para este alumno y curso
    const [existing] = await pool.query(
      "SELECT id_inscripcion FROM inscripcion WHERE id_alumno = ? AND id_curso = ?",
      [id_alumno, id_curso],
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe una solicitud para este curso." });
    }

    // Crear la nueva inscripción con estatus 'solicitada'
    const [result] = await pool.query(
      "INSERT INTO inscripcion (id_alumno, id_curso, estatus_inscripcion, fecha_solicitud) VALUES (?, ?, 'solicitada', NOW())",
      [id_alumno, id_curso],
    );

    const newInscripcionId = result.insertId;

    // Devolver la inscripción recién creada
    const [newInscripcion] = await pool.query(
      "SELECT * FROM inscripcion WHERE id_inscripcion = ?",
      [newInscripcionId],
    );

    // Cache functionality removed for now
    logger.info("Nueva solicitud de inscripción creada.");

    res.status(201).json({
      message: "Solicitud de inscripción creada con éxito.",
      inscripcion: newInscripcion[0],
    });
  } catch (error) {
    logger.error(`Error al crear la inscripción: ${error.message}`);
    res
      .status(500)
      .json({ error: "Error interno del servidor al crear la inscripción." });
  }
};

// @desc    Obtener todas las inscripciones de un alumno
// @route   GET /api/inscripciones/alumno
// @access  Private (Alumno)
const getInscripcionesAlumno = async (req, res) => {
  const id_alumno = req.user.id_alumno; // Obtenido del middleware 'protect'

  try {
    const [inscripciones] = await pool.query(
    `SELECT 
      i.id_curso, 
      i.estatus_inscripcion, 
      i.fecha_solicitud,
      c.nombre_curso,
      c.estatus_curso,
      c.fecha_inicio,
      c.fecha_fin,
      c.modalidad,
      u.nombre as nombre_universidad
    FROM inscripcion i
    JOIN curso c ON i.id_curso = c.id_curso
    LEFT JOIN universidad u ON c.id_universidad = u.id_universidad
    WHERE i.id_alumno = ?
    ORDER BY i.fecha_solicitud DESC`,
    [id_alumno],
  );

    res.json({ inscripciones });
  } catch (error) {
    logger.error(
      `Error al obtener las inscripciones del alumno: ${error.message}`,
    );
    res.status(500).json({
      error: "Error interno del servidor al obtener las inscripciones.",
    });
  }
};

// @desc    Obtener TODAS las inscripciones (para administradores)
// @route   GET /api/inscripciones/all
// @access  Private (Admin)
const getAllInscripciones = async (req, res) => {
  const { id_credencial, id_curso, estado } = req.query;

  try {
    let query = `
            SELECT
                i.id_inscripcion,
                i.fecha_solicitud,
                i.estatus_inscripcion AS estado,
                i.motivo_rechazo,
                u.username AS nombre_alumno,
                u.email AS email_alumno,
                c.id_curso,
                c.nombre_curso,
                cat.nombre_categoria,
                uni.nombre AS nombre_universidad,
                cert.nombre AS nombre_credencial,
                cert.id_certificacion AS id_credencial
            FROM inscripcion i
            JOIN alumno a ON i.id_alumno = a.id_alumno
            JOIN usuario u ON a.id_usuario = u.id_usuario
            JOIN curso c ON i.id_curso = c.id_curso
            LEFT JOIN categoria_curso cat ON c.id_categoria = cat.id_categoria
            LEFT JOIN universidad uni ON c.id_universidad = uni.id_universidad
            LEFT JOIN requisitos_certificado rc ON c.id_curso = rc.id_curso
            LEFT JOIN certificacion cert ON rc.id_certificacion = cert.id_certificacion
        `;

    const conditions = [];
    const params = [];

    if (id_credencial && id_credencial !== "todas") {
      conditions.push("cert.id_certificacion = ?");
      params.push(id_credencial);
    }
    if (id_curso && id_curso !== "todos") {
      conditions.push("c.id_curso = ?");
      params.push(id_curso);
    }
    if (estado && estado !== "todos") {
      conditions.push("i.estatus_inscripcion = ?");
      params.push(estado);
    }

    // Filtros por rol
    if (req.user && req.user.tipo_usuario === "maestro" && req.user.id_maestro) {
      conditions.push("c.id_maestro = ?");
      params.push(req.user.id_maestro);
    } else if (req.user && req.user.tipo_usuario === "admin_universidad" && req.user.id_universidad) {
      conditions.push("c.id_universidad = ?");
      params.push(req.user.id_universidad);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY i.fecha_solicitud DESC";

    const [inscripciones] = await pool.query(query, params);

    const responseData = { inscripciones };

    res.json(responseData);
  } catch (error) {
    logger.error(`Error en getAllInscripciones: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// @desc    Actualizar el estado de una inscripción
// @route   PUT /api/inscripciones/:id/estado
// @access  Private (Admin)
const actualizarEstadoInscripcion = async (req, res) => {
  const { id } = req.params;
  const { estado, motivo_rechazo } = req.body;

  if (!estado || !["aprobada", "rechazada"].includes(estado)) {
    return res
      .status(400)
      .json({ error: "El estado proporcionado no es válido." });
  }
  if (
    estado === "rechazada" &&
    (!motivo_rechazo || motivo_rechazo.trim() === "")
  ) {
    return res
      .status(400)
      .json({ error: "El motivo de rechazo es obligatorio." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Obtener el contexto completo de la inscripción (alumno, curso, universidades)
    const [inscripciones] = await connection.query(
      `SELECT
          i.id_alumno,
          i.id_curso,
          i.estatus_inscripcion AS estadoActual,
          a.id_universidad AS id_universidad_alumno,
          c.id_universidad AS id_universidad_curso,
          c.cupo_maximo AS cupo_maximo_curso
       FROM inscripcion i
       JOIN alumno a ON i.id_alumno = a.id_alumno
       JOIN curso c ON i.id_curso = c.id_curso
       WHERE i.id_inscripcion = ?`,
      [id],
    );

    if (inscripciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Inscripción no encontrada." });
    }

    const {
      id_alumno,
      id_curso,
      estadoActual,
      id_universidad_alumno,
      id_universidad_curso,
      cupo_maximo_curso,
    } = inscripciones[0];

    // Si el estado no cambia, no hacer nada.
    if (estado === estadoActual) {
      await connection.commit();
      return res.json({
        message: "El estado de la inscripción ya es el solicitado.",
      });
    }

    // 2. Determinar si la inscripción es a través de una convocatoria
    const [convocatoriaResult] = await connection.query(
      `SELECT sc.convocatoria_id
       FROM solicitudes_convocatorias sc
       JOIN convocatorias c ON sc.convocatoria_id = c.id
       JOIN capacidad_universidad cu ON c.id = cu.convocatoria_id
       WHERE sc.alumno_id = ?
         AND sc.estado = 'aceptada'
         AND c.estado = 'activa'
         AND cu.universidad_id = ?
       LIMIT 1`,
      [id_alumno, id_universidad_curso],
    );

    const esInscripcionPorConvocatoria = convocatoriaResult.length > 0;
    const id_convocatoria = esInscripcionPorConvocatoria
      ? convocatoriaResult[0].convocatoria_id
      : null;

    if (esInscripcionPorConvocatoria) {
      // --- RUTA A: LÓGICA DE CONVOCATORIA ---
      const id_universidad_afectada = id_universidad_alumno; // El cupo se descuenta de la universidad del ALUMNO

      // APROBANDO: Verificar e incrementar cupo
      if (estado === "aprobada") {
        const [capacidad] = await connection.query(
          `SELECT cupo_actual, capacidad_maxima FROM capacidad_universidad WHERE convocatoria_id = ? AND universidad_id = ? FOR UPDATE`,
          [id_convocatoria, id_universidad_afectada],
        );
        if (
          capacidad.length === 0 ||
          capacidad[0].cupo_actual >= capacidad[0].capacidad_maxima
        ) {
          await connection.rollback();
          return res.status(409).json({
            error:
              "El cupo para la universidad del alumno en esta convocatoria está lleno.",
          });
        }
        await connection.query(
          "UPDATE capacidad_universidad SET cupo_actual = cupo_actual + 1 WHERE convocatoria_id = ? AND universidad_id = ?",
          [id_convocatoria, id_universidad_afectada],
        );
      }
      // RECHAZANDO (si antes estaba aprobada): Decrementar para liberar cupo
      else if (estadoActual === "aprobada") {
        await connection.query(
          "UPDATE capacidad_universidad SET cupo_actual = GREATEST(0, cupo_actual - 1) WHERE convocatoria_id = ? AND universidad_id = ?",
          [id_convocatoria, id_universidad_afectada],
        );
      }
    } else {
      // --- RUTA B: LÓGICA DE INSCRIPCIÓN DIRECTA ---
      if (id_universidad_alumno !== id_universidad_curso) {
        await connection.rollback();
        return res.status(403).json({
          error:
            "El alumno no puede inscribirse a un curso de otra universidad sin una convocatoria activa.",
        });
      }

      if (estado === "aprobada") {
        const [conteo] = await connection.query(
          `SELECT COUNT(*) as total FROM inscripcion WHERE id_curso = ? AND estatus_inscripcion = 'aprobada' FOR UPDATE`,
          [id_curso],
        );
        if (conteo[0].total >= cupo_maximo_curso) {
          await connection.rollback();
          return res
            .status(409)
            .json({ error: "El cupo para este curso ya está lleno." });
        }
      }
      // No es necesario decrementar, el conteo es en tiempo real.
    }

    // 3. Actualizar el estado de la inscripción
    await connection.query(
      "UPDATE inscripcion SET estatus_inscripcion = ?, motivo_rechazo = ? WHERE id_inscripcion = ?",
      [estado, estado === "rechazada" ? motivo_rechazo.trim() : null, id],
    );

    await connection.commit();

    logger.info(
      `Estado de inscripción actualizado para ID: ${id} a '${estado}'.`,
    );
    res.json({ message: "Estado de la inscripción actualizado con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    logger.error(`Error al actualizar estado de inscripción: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  crearInscripcion,
  getInscripcionesAlumno,
  getAllInscripciones,
  actualizarEstadoInscripcion,
};
