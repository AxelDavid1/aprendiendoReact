const pool = require("../config/db");

// @desc    Crear o actualizar la configuración de calificación de un curso y sus actividades
// @route   POST /api/calificaciones
// @access  Private (SEDEQ/Admin)
const upsertCalificacionCurso = async (req, res) => {
  const { id_curso, umbral_aprobatorio, actividades } = req.body;

  if (!id_curso || !umbral_aprobatorio || !actividades) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Paso 1: Insertar o actualizar en `calificaciones_curso`
    const upsertCursoQuery = `
      INSERT INTO calificaciones_curso (id_curso, umbral_aprobatorio)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE umbral_aprobatorio = VALUES(umbral_aprobatorio)
    `;
    await connection.query(upsertCursoQuery, [id_curso, umbral_aprobatorio]);

    // Obtener el ID de la configuración de calificación (ya sea nueva o existente)
    const [califCursoRows] = await connection.query(
      "SELECT id_calificaciones FROM calificaciones_curso WHERE id_curso = ?",
      [id_curso],
    );
    const id_calificaciones_curso = califCursoRows[0].id_calificaciones;

    // Paso 2: Procesar actividades (Upsert: Update, Insert, Delete)
    const idsActividadesRecibidas = [];

    if (actividades && actividades.length > 0) {
      const allowedTypes = ["pdf", "link"];

      for (const act of actividades) {
        // Validar que tipos_permitidos existe y es un array
        const tiposPermitidos =
          act.tipos_permitidos || act.tipos_archivo_permitidos || ["pdf", "link"];
        const tiposArray = Array.isArray(tiposPermitidos)
          ? tiposPermitidos
          : JSON.parse(tiposPermitidos || '["pdf", "link"]');

        const tiposValidos = tiposArray.every((tipo) =>
          allowedTypes.includes(tipo),
        );
        if (!tiposValidos) {
          throw new Error(
            `Tipo de archivo no permitido en la actividad: ${act.nombre}`,
          );
        }

        if (act.id_actividad) {
          // --- UPDATE ---
          idsActividadesRecibidas.push(act.id_actividad);
          const updateQuery = `
            UPDATE calificaciones_actividades SET
              nombre = ?, porcentaje = ?, fecha_limite = ?, max_archivos = ?, 
              max_tamano_mb = ?, tipos_archivo_permitidos = ?, instrucciones = ?
            WHERE id_actividad = ? AND id_calificaciones_curso = ?
          `;
          await connection.query(updateQuery, [
            act.nombre,
            act.porcentaje,
            act.fecha_limite || null,
            act.max_archivos,
            act.max_tamano_mb,
            JSON.stringify(tiposArray),
            act.instrucciones || null,
            act.id_actividad,
            id_calificaciones_curso,
          ]);
        } else {
          // --- INSERT ---
          const insertQuery = `
            INSERT INTO calificaciones_actividades (
              id_calificaciones_curso, nombre, porcentaje, fecha_limite, 
              max_archivos, max_tamano_mb, tipos_archivo_permitidos, instrucciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await connection.query(insertQuery, [
            id_calificaciones_curso,
            act.nombre,
            act.porcentaje,
            act.fecha_limite || null,
            act.max_archivos,
            act.max_tamano_mb,
            JSON.stringify(tiposArray),
            act.instrucciones || null,
          ]);
          idsActividadesRecibidas.push(result.insertId);
        }
      }
    }

    // Paso 3: --- DELETE ---
    // Eliminar actividades que ya no están en la lista enviada por el frontend
    if (idsActividadesRecibidas.length > 0) {
      const deleteQuery = `DELETE FROM calificaciones_actividades WHERE id_calificaciones_curso = ? AND id_actividad NOT IN (?)`;
      await connection.query(deleteQuery, [
        id_calificaciones_curso,
        idsActividadesRecibidas,
      ]);
    } else {
      // Si no se recibieron actividades, se borran todas las del curso
      const deleteAllQuery = `DELETE FROM calificaciones_actividades WHERE id_calificaciones_curso = ?`;
      await connection.query(deleteAllQuery, [id_calificaciones_curso]);
    }

    await connection.commit();

    // Paso 4: Devolver la lista actualizada de actividades
    const [actividadesActualizadas] = await pool.query(
      "SELECT * FROM calificaciones_actividades WHERE id_calificaciones_curso = ?",
      [id_calificaciones_curso],
    );

    res.status(200).json({
      message: "Configuración de calificación guardada con éxito.",
      actividades: actividadesActualizadas,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al guardar la configuración de calificación:", error);
    res.status(500).json({
      error: "Error interno del servidor al guardar la configuración.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// backend/controllers/calificacionesController.js

const getCalificacionCurso = async (req, res) => {
  const { id_curso } = req.params;
  const { id_usuario, tipo_usuario, id_alumno: id_alumno_sesion } = req.user;
  const { id_alumno: id_alumno_query } = req.query; 

  if (!id_curso) {
    return res.status(400).json({ error: "El ID del curso es obligatorio." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Obtener porcentajes generales del curso
    const [califCursoRows] = await connection.query(
      "SELECT * FROM calificaciones_curso WHERE id_curso = ?",
      [id_curso]
    );

    if (califCursoRows.length === 0) {
      return res.status(404).json({ error: "No se encontró configuración de calificación para este curso." });
    }
    const califCurso = califCursoRows[0];

    // 2. Obtener las actividades (SIN pedir la columna 'porcentaje')
    const [actividadesRows] = await connection.query(
      `SELECT id_actividad, nombre, instrucciones, fecha_limite, 
              max_archivos, max_tamano_mb, tipos_archivo_permitidos, 
              tipo_actividad
       FROM calificaciones_actividades WHERE id_calificaciones_curso = ?`,
      [califCurso.id_calificaciones]
    );

    // --- CÁLCULO DE PONDERACIÓN DINÁMICA ---
    // Contamos cuántas actividades y proyectos hay
    const numActividades = actividadesRows.filter(a => a.tipo_actividad === 'actividad').length;
    const numProyectos = actividadesRows.filter(a => a.tipo_actividad === 'proyecto').length;

    // Calculamos cuánto vale cada una individualmente
    // Ej: Si porcentaje_actividades es 50% y hay 5 tareas, cada una vale 10%
    const valorPorActividad = numActividades > 0 ? (califCurso.porcentaje_actividades / numActividades) : 0;
    const valorPorProyecto = numProyectos > 0 ? (califCurso.porcentaje_proyecto / numProyectos) : 0;
    // ----------------------------------------

    // Determinar el ID del alumno a consultar
    let id_alumno_para_buscar = null;
    if (tipo_usuario === 'alumno') {
      id_alumno_para_buscar = id_alumno_sesion;
    } else if (['maestro', 'admin_sedeq', 'admin_universidad', 'SEDEQ'].includes(tipo_usuario) && id_alumno_query) {
      id_alumno_para_buscar = parseInt(id_alumno_query);
    }

    let id_inscripcion_objetivo = null;
    if (id_alumno_para_buscar) {
      const [inscripcionRows] = await connection.query(
        "SELECT id_inscripcion FROM inscripcion WHERE id_alumno = ? AND id_curso = ? AND estatus_inscripcion = 'aprobada'",
        [id_alumno_para_buscar, id_curso]
      );
      if (inscripcionRows.length > 0) {
        id_inscripcion_objetivo = inscripcionRows[0].id_inscripcion;
      }
    }

    const actividadesConEntregas = [];
    
    for (const actividad of actividadesRows) {
      
      // A) Inyectar el porcentaje calculado para que el Frontend lo muestre
      actividad.porcentaje = actividad.tipo_actividad === 'proyecto' 
          ? parseFloat(valorPorProyecto.toFixed(2)) 
          : parseFloat(valorPorActividad.toFixed(2));

      // B) Buscar Entrega (Si hay alumno)
      let entregaCompleta = null;
      if (id_inscripcion_objetivo) {
        const [entregaRows] = await connection.query(
          `SELECT id_entrega, fecha_entrega, calificacion, comentario_profesor, estatus_entrega
           FROM entregas_estudiantes
           WHERE id_actividad = ? AND id_inscripcion = ?
           ORDER BY fecha_entrega DESC
           LIMIT 1`,
          [actividad.id_actividad, id_inscripcion_objetivo]
        );

        if (entregaRows.length > 0) {
          const entregaBase = entregaRows[0];
          // Traer archivos que subió el alumno
          const [archivosRows] = await connection.query(
            "SELECT id_archivo_entrega, nombre_archivo_original, ruta_archivo, tipo_archivo FROM archivos_entrega WHERE id_entrega = ?",
            [entregaBase.id_entrega]
          );
          entregaCompleta = { ...entregaBase, archivos: archivosRows };
        }
      }

      // C) Traer Materiales de Apoyo (Lo que subió el profesor)
      const [materialesApoyo] = await connection.query(
        `SELECT m.id_material, m.nombre_archivo, m.tipo_archivo, m.es_enlace, m.url_enlace, m.descripcion
         FROM material_curso m
         JOIN actividad_materiales am ON m.id_material = am.id_material
         WHERE am.id_actividad = ?
         ORDER BY am.orden ASC`,
        [actividad.id_actividad]
      );

      actividadesConEntregas.push({
        ...actividad,
        entrega: entregaCompleta,
        materiales: materialesApoyo || [] 
      });
    }

    // Cálculo de calificación final del alumno (Promedio ponderado real)
    let puntosAcumulados = 0;
    
    for (const act of actividadesConEntregas) {
      if (act.entrega && act.entrega.calificacion !== null) {
        // La calificación suele ser 0-100.
        // Puntos ganados = (CalificaciónObtenida / 100) * ValorDeLaActividad
        const puntosGanados = (parseFloat(act.entrega.calificacion) / 100) * act.porcentaje;
        puntosAcumulados += puntosGanados;
      }
    }

    const response = {
      id_curso: califCurso.id_curso,
      umbral_aprobatorio: califCurso.umbral_aprobatorio,
      actividades: actividadesConEntregas,
      calificacion_final: parseFloat(puntosAcumulados.toFixed(2)),
      aprobado: puntosAcumulados >= califCurso.umbral_aprobatorio,
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error al obtener la configuración de calificación:", error);
    res.status(500).json({ error: "Error interno del servidor al obtener la configuración." });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { upsertCalificacionCurso, getCalificacionCurso };