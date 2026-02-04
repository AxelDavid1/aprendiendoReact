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
  const { id_credencial, id_curso, estado, sin_credencial } = req.query;

  // DEBUG: Agregar logging para diagnóstico
  console.log("🔍 getAllInscripciones - Parámetros recibidos:", {
    id_credencial,
    id_curso,
    estado,
    sin_credencial,
    usuario_tipo: req.user?.tipo_usuario,
    usuario_id: req.user?.id_maestro || req.user?.id_universidad
  });

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

    // Filtro por credencial (mutuamente excluyente con sin_credencial)
    if (id_credencial && sin_credencial !== 'true') {
      conditions.push("cert.id_certificacion = ?");
      params.push(id_credencial);
    }
    
    // Filtro por cursos SIN credencial
    if (sin_credencial === 'true') {
      conditions.push("cert.id_certificacion IS NULL");
      
      // Si además especifican un curso sin credencial
      if (id_curso) {
        conditions.push("c.id_curso = ?");
        params.push(id_curso);
      }
    }
    
    // Filtro por estado
    if (estado && estado !== "todos") {
      conditions.push("i.estatus_inscripcion = ?");
      params.push(estado);
    }

    // Filtro por curso específico (aplicable a todos los casos)
    if (id_curso) {
      conditions.push("c.id_curso = ?");
      params.push(id_curso);
    }

    // Filtros por rol (mantener la lógica existente)
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

    // DEBUG: Agregar logging de la query SQL
    console.log("🔍 getAllInscripciones - Query SQL:", query);
    console.log("🔍 getAllInscripciones - Parámetros:", params);

    const [inscripciones] = await pool.query(query, params);

    // DEBUG: Agregar logging de resultados
    console.log("🔍 getAllInscripciones - Inscripciones encontradas:", inscripciones.length);

    res.json({ inscripciones });
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

// @desc    Obtener datos de analytics para el dashboard de análisis
// @route   GET /api/inscripciones/analytics
// @access  Private (Admin, Maestro)
const getAnalyticsData = async (req, res) => {
  const { 
    periodo = '6meses', 
    universidad,
    facultad,
    carrera,
    subgrupo,
    maestro
  } = req.query;

  console.log("🔍 getAnalyticsData - Iniciando consulta");

  try {
    // Calcular fechas según período
    const fechaFin = new Date();
    let fechaInicio = new Date();
    let fechaInicioAnterior = new Date();

    switch (periodo) {
      case '1mes':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        fechaInicioAnterior.setMonth(fechaInicioAnterior.getMonth() - 2);
        break;
      case '3meses':
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        fechaInicioAnterior.setMonth(fechaInicioAnterior.getMonth() - 6);
        break;
      case '1ano':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        fechaInicioAnterior.setFullYear(fechaInicioAnterior.getFullYear() - 2);
        break;
      default: // 6meses
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        fechaInicioAnterior.setMonth(fechaInicioAnterior.getMonth() - 12);
    }

    // Construir filtros base según rol
    const construirWhereClause = () => {
      const conditions = [];
      const params = [];

      if (req.user.tipo_usuario === 'maestro' && req.user.id_maestro) {
        conditions.push('c.id_maestro = ?');
        params.push(req.user.id_maestro);
      } else if (req.user.tipo_usuario === 'admin_universidad' && req.user.id_universidad) {
        conditions.push('c.id_universidad = ?');
        params.push(req.user.id_universidad);
      }

      if (universidad) {
        conditions.push('c.id_universidad = ?');
        params.push(universidad);
      }
      if (facultad) {
        conditions.push('c.id_facultad = ?');
        params.push(facultad);
      }
      if (carrera) {
        conditions.push('c.id_carrera = ?');
        params.push(carrera);
      }
      if (subgrupo) {
        conditions.push('c.id_subgrupo = ?');
        params.push(subgrupo);
      }
      if (maestro) {
        conditions.push('c.id_maestro = ?');
        params.push(maestro);
      }

      return { conditions, params };
    };

    const { conditions: baseConditions, params: baseParams } = construirWhereClause();
    const whereClause = baseConditions.length > 0 ? `AND ${baseConditions.join(' AND ')}` : '';

    // 1. KPIs Principales - Consulta Simplificada
    const kpisQuery = `
      SELECT 
        COUNT(CASE WHEN i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as total_actual,
        COUNT(CASE WHEN i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as total_anterior,
        COUNT(CASE WHEN i.estatus_inscripcion = 'aprobada' AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as aprobadas_actual,
        COUNT(CASE WHEN i.estatus_inscripcion = 'aprobada' AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as aprobadas_anterior,
        COUNT(CASE WHEN co.id_constancia IS NOT NULL AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as completados_actual,
        COUNT(CASE WHEN co.id_constancia IS NOT NULL AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as completados_anterior,
        COUNT(CASE WHEN c.fecha_fin < CURDATE() AND co.id_constancia IS NULL AND i.estatus_inscripcion = 'aprobada' AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as abandonados_actual,
        COUNT(CASE WHEN c.fecha_fin < CURDATE() AND co.id_constancia IS NULL AND i.estatus_inscripcion = 'aprobada' AND i.fecha_solicitud BETWEEN ? AND ? THEN 1 END) as abandonados_anterior
      FROM inscripcion i
      JOIN curso c ON i.id_curso = c.id_curso
      LEFT JOIN constancia_alumno co ON i.id_alumno = co.id_alumno AND i.id_curso = co.id_curso
      WHERE (i.fecha_solicitud BETWEEN ? AND ? OR i.fecha_solicitud BETWEEN ? AND ?)
        ${whereClause}
    `;

    const [kpisResult] = await pool.query(kpisQuery, [
      // Total inscripciones
      fechaInicio, fechaFin, fechaInicioAnterior, fechaInicio,
      // Aprobadas
      fechaInicio, fechaFin, fechaInicioAnterior, fechaInicio,
      // Completadas
      fechaInicio, fechaFin, fechaInicioAnterior, fechaInicio,
      // Abandonados
      fechaInicio, fechaFin, fechaInicioAnterior, fechaInicio,
      // WHERE clause
      fechaInicio, fechaFin, fechaInicioAnterior, fechaInicio,
      ...baseParams, ...baseParams
    ]);

    const kpisData = kpisResult[0];
    
    // Calcular métricas simplificadas
    const totalInscripciones = kpisData.total_actual || 0;
    const totalInscripcionesAnterior = kpisData.total_anterior || 0;
    const aprobadasActual = kpisData.aprobadas_actual || 0;
    const aprobadasAnterior = kpisData.aprobadas_anterior || 0;
    const completadosActual = kpisData.completados_actual || 0;
    const completadosAnterior = kpisData.completados_anterior || 0;
    const abandonadosActual = kpisData.abandonados_actual || 0;
    const abandonadosAnterior = kpisData.abandonados_anterior || 0;
    
    const kpis = {
      total_inscripciones: totalInscripciones,
      cambio_total: totalInscripcionesAnterior > 0 
        ? Math.round(((totalInscripciones - totalInscripcionesAnterior) / totalInscripcionesAnterior) * 100)
        : 0,
      tasa_aprobacion: aprobadasActual > 0
        ? Math.round((completadosActual / aprobadasActual) * 100)
        : 0,
      cambio_aprobacion: aprobadasAnterior > 0
        ? Math.round(((aprobadasActual - aprobadasAnterior) / aprobadasAnterior) * 100)
        : 0,
      tasa_completacion: aprobadasActual > 0
        ? Math.round((completadosActual / aprobadasActual) * 100)
        : 0,
      cambio_completacion: completadosAnterior > 0
        ? Math.round(((completadosActual - completadosAnterior) / completadosAnterior) * 100)
        : 0,
      tasa_abandono: aprobadasActual > 0
        ? Math.min(100, Math.round((abandonadosActual / aprobadasActual) * 100))
        : 0,
      cambio_abandono: abandonadosAnterior > 0
        ? Math.round(((abandonadosActual - abandonadosAnterior) / abandonadosAnterior) * 100)
        : 0
    };

    // 2. Top Cursos Más Solicitados - Consulta Simplificada
    const cursosSolicitadosQuery = `
      SELECT 
        c.nombre_curso,
        COUNT(i.id_inscripcion) as inscripciones,
        COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) as completados,
        ROUND(
          COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(i.id_inscripcion), 0), 2
        ) as tasa_exito
      FROM inscripcion i
      JOIN curso c ON i.id_curso = c.id_curso
      LEFT JOIN constancia_alumno co ON i.id_alumno = co.id_alumno AND i.id_curso = co.id_curso
      WHERE i.fecha_solicitud BETWEEN ? AND ?
        ${whereClause}
      GROUP BY c.id_curso, c.nombre_curso
      ORDER BY inscripciones DESC
      LIMIT 10
    `;

    const [cursosSolicitadosResult] = await pool.query(cursosSolicitadosQuery, [
      fechaInicio, fechaFin, ...baseParams
    ]);

    // 3. Distribución por Rol - Consulta Condicional
    let distribucionResult = [];
    
    if (req.user.tipo_usuario === 'admin_sedeq') {
      // Distribución por universidad para SEDAQ
      const distribucionQuery = `
        SELECT 
          u.nombre as entidad,
          COUNT(i.id_inscripcion) as inscripciones,
          COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) as completados,
          ROUND(
            COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) * 100.0 / 
            NULLIF(COUNT(i.id_inscripcion), 0), 2
          ) as tasa_exito
        FROM inscripcion i
        JOIN curso c ON i.id_curso = c.id_curso
        JOIN universidad u ON c.id_universidad = u.id_universidad
        LEFT JOIN constancia_alumno co ON i.id_alumno = co.id_alumno AND i.id_curso = co.id_curso
        WHERE i.fecha_solicitud BETWEEN ? AND ?
        GROUP BY u.id_universidad, u.nombre
        ORDER BY inscripciones DESC
        LIMIT 15
      `;
      [distribucionResult] = await pool.query(distribucionQuery, [fechaInicio, fechaFin]);
      
    } else if (req.user.tipo_usuario === 'admin_universidad') {
      // Distribución por carreras para Admin Universidad
      const distribucionQuery = `
        SELECT 
          car.nombre as entidad,
          COUNT(i.id_inscripcion) as inscripciones,
          COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) as completados,
          ROUND(
            COUNT(CASE WHEN co.id_constancia IS NOT NULL THEN 1 END) * 100.0 / 
            NULLIF(COUNT(i.id_inscripcion), 0), 2
          ) as tasa_exito
        FROM inscripcion i
        JOIN curso c ON i.id_curso = c.id_curso
        JOIN alumno a ON i.id_alumno = a.id_alumno
        LEFT JOIN carreras car ON a.id_carrera = car.id_carrera
        LEFT JOIN constancia_alumno co ON i.id_alumno = co.id_alumno AND i.id_curso = co.id_curso
        WHERE i.fecha_solicitud BETWEEN ? AND ?
          AND c.id_universidad = ?
        GROUP BY car.id_carrera, car.nombre
        ORDER BY inscripciones DESC
        LIMIT 15
      `;
      [distribucionResult] = await pool.query(distribucionQuery, [fechaInicio, fechaFin, req.user.id_universidad]);
    }
    // Para maestro no se incluye distribución

    // 4. Respuesta simplificada y útil
    const analyticsData = {
      kpis,
      cursos_mas_solicitados: cursosSolicitadosResult,
      distribucion_subgrupos: distribucionResult,
      tipo_distribucion: req.user.tipo_usuario === 'admin_sedeq' ? 'universidad' : 'carrera'
    };

    console.log("🔍 getAnalyticsData - Datos generados:", {
      kpis: analyticsData.kpis,
      cursos_count: analyticsData.cursos_mas_solicitados.length,
    });

    res.json(analyticsData);
  } catch (error) {
    console.error("🔍 getAnalyticsData - Error:", error);
    res.status(500).json({ error: "Error interno del servidor al obtener analytics" });
  }
};

module.exports = {
  crearInscripcion,
  getInscripcionesAlumno,
  getAllInscripciones,
  actualizarEstadoInscripcion,
  getAnalyticsData,
};
