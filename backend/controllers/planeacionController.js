// /backend/controllers/planeacionController.js
const pool = require("../config/db");
const logger = require("../config/logger");

// @desc    Guardar o actualizar la planeación de un curso
// @route   POST /api/planeacion
// @access  Private
const guardarPlaneacion = async (req, res) => {
  console.log("Body recibido:", JSON.stringify(req.body, null, 2));
  console.log("Params:", req.params);
  const id_curso = req.params.id || req.params.id_curso;
  const {
    temario,
    porcentaje_actividades,
    porcentaje_proyecto,
    practicas,
    proyecto,
    caracterizacion,
    intencion_didactica,
    competencias_desarrollar,
    competencias_previas,
    evaluacion_competencias,
    proyecto_fundamentacion,
    proyecto_planeacion,
    proyecto_ejecucion,
    proyecto_evaluacion,
    convocatoria_id,
  } = req.body;

  const { id_usuario } = req.user;
  if (!id_curso) {
    return res.status(400).json({
      error: "Se requiere el ID del curso",
    });
  }
  // Validar que la suma de porcentajes sea 100%
  if (
    parseInt(porcentaje_actividades) + parseInt(porcentaje_proyecto) !==
    100
  ) {
    return res.status(400).json({
      error:
        "La suma de los porcentajes de actividades y proyecto debe ser 100%",
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // **1. ACTUALIZAR TABLA CURSO CON TODOS LOS CAMPOS**
    await connection.query(
      `UPDATE curso SET
    caracterizacion = ?,
    intencion_didactica = ?,
    competencias_desarrollar = ?,
    competencias_previas = ?,
    evaluacion_competencias = ?,
    proyecto_fundamentacion = ?,
    proyecto_planeacion = ?,
    proyecto_ejecucion = ?,
    proyecto_evaluacion = ?,
    id_convocatoria = ?
   WHERE id_curso = ?`,
      [
        caracterizacion || null,
        intencion_didactica || null,
        competencias_desarrollar || null,
        competencias_previas || null,
        evaluacion_competencias || null,
        (proyecto && proyecto.fundamentacion) ||
        proyecto_fundamentacion ||
        null,
        (proyecto && proyecto.planeacion) || proyecto_planeacion || null,
        (proyecto && proyecto.ejecucion) || proyecto_ejecucion || null,
        (proyecto && proyecto.evaluacion) || proyecto_evaluacion || null,
        convocatoria_id || null,
        id_curso,
      ]
    );

    console.log("DEBUG: Actualización del curso ejecutada con éxito");
    console.log("DEBUG: Valores guardados:", {
      caracterizacion: caracterizacion || null,
      intencion_didactica: intencion_didactica || null,
      competencias_desarrollar: competencias_desarrollar || null,
      competencias_previas: competencias_previas || null,
    });

    // 2. Guardar configuración de calificaciones
    const [califCurso] = await connection.query(
      `INSERT INTO calificaciones_curso 
       (id_curso, umbral_aprobatorio, porcentaje_actividades, porcentaje_proyecto)
       VALUES (?, 70, ?, ?)
       ON DUPLICATE KEY UPDATE 
         porcentaje_actividades = VALUES(porcentaje_actividades),
         porcentaje_proyecto = VALUES(porcentaje_proyecto),
         fecha_actualizacion = NOW()`,
      [id_curso, porcentaje_actividades, porcentaje_proyecto]
    );

    const id_calificaciones_curso =
      califCurso.insertId ||
      (
        await connection.query(
          "SELECT id_calificaciones FROM calificaciones_curso WHERE id_curso = ?",
          [id_curso]
        )
      )[0][0].id_calificaciones;

    // 3. Eliminar actividades existentes (para actualización)
    await connection.query(
      `DELETE ca FROM calificaciones_actividades ca
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       WHERE cc.id_curso = ?`,
      [id_curso]
    );

    // 4. Guardar prácticas si existen
    if (practicas && practicas.length > 0) {
      const porcentajePorActividad = porcentaje_actividades / practicas.length;

      for (const [index, practica] of practicas.entries()) {
        const [actividad] = await connection.query(
          `INSERT INTO calificaciones_actividades (
            id_calificaciones_curso, nombre, tipo_actividad, 
            instrucciones, fecha_limite, max_archivos, max_tamano_mb, 
            tipos_archivo_permitidos
          ) VALUES (?, ?, 'actividad', ?, NULL, 5, 10, ?)`,
          [
            id_calificaciones_curso,
            `Actividad ${index + 1}`,
            practica.descripcion,
            JSON.stringify(["pdf", "link"]),
          ]
        );

        if (practica.materiales) {
          await guardarMateriales(
            connection,
            actividad.insertId,
            id_curso,
            practica.materiales,
            id_usuario
          );
        }
      }
    }

    // 5. Guardar proyecto
    if (proyecto) {
      const [proyectoActividad] = await connection.query(
        `INSERT INTO calificaciones_actividades (
          id_calificaciones_curso, nombre, tipo_actividad, 
          instrucciones, fecha_limite, max_archivos, max_tamano_mb, 
          tipos_archivo_permitidos
        ) VALUES (?, 'Proyecto Final', 'proyecto', ?, NULL, 10, 25, ?)`,
        [
          id_calificaciones_curso,
          proyecto.instrucciones || "Proyecto final del curso",
          JSON.stringify(["pdf", "link", "zip"]),
        ]
      );

      if (proyecto.materiales) {
        await guardarMateriales(
          connection,
          proyectoActividad.insertId,
          id_curso,
          proyecto.materiales,
          id_usuario
        );
      }
    }

    // 6. Guardar temario CON COMPETENCIAS
    await connection.query("DELETE FROM unidades_curso WHERE id_curso = ?", [
      id_curso,
    ]);

    if (temario && temario.length > 0) {
      for (const [index, tema] of temario.entries()) {
        const [temaInsertado] = await connection.query(
          `INSERT INTO unidades_curso (
            id_curso, nombre_unidad, descripcion_unidad, 
            competenciasEspecificas, competenciasGenericas, orden
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id_curso,
            tema.nombre,
            tema.descripcion || null,
            tema.competenciasEspecificas ||
            tema.competencias_especificas ||
            null,
            tema.competenciasGenericas || tema.competencias_genericas || null,
            index,
          ]
        );

        // Guardar subtemas si existen
        if (tema.subtemas && tema.subtemas.length > 0) {
          for (const [subIndex, subtema] of tema.subtemas.entries()) {
            await connection.query(
              `INSERT INTO subtemas_unidad (
                id_unidad, nombre_subtema, descripcion_subtema, orden
              ) VALUES (?, ?, ?, ?)`,
              [
                temaInsertado.insertId,
                subtema.nombre,
                subtema.descripcion || null,
                subIndex,
              ]
            );
          }
        }
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: "Planeación guardada exitosamente",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    logger.error(`Error al guardar planeación: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      error: "Error al guardar la planeación",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Función auxiliar para guardar materiales
const guardarMateriales = async (
  connection,
  id_actividad,
  id_curso,
  materiales,
  id_usuario
) => {
  console.log("DEBUG guardarMateriales:", {
    id_actividad,
    id_curso,
    id_usuario,
    materialesCount: materiales?.length,
  });
  if (!materiales || !Array.isArray(materiales)) return;

  if (!id_curso) {
    console.error("Error: id_curso es null o undefined en guardarMateriales");
    throw new Error("id_curso es requerido para guardar materiales");
  }

  for (const material of materiales) {
    // Mapear 'referencias' a 'texto' para coincidir con el enum de la base de datos
    const tipoArchivo =
      material.tipo === "referencias"
        ? "texto"
        : material.tipo || (material.url ? "enlace" : "pdf");

    await connection.query(
      `INSERT INTO material_curso (
        id_curso, nombre_archivo, ruta_archivo, tipo_archivo, 
        categoria_material, es_enlace, url_enlace, 
        descripcion, subido_por, id_actividad
      ) VALUES (?, ?, ?, ?, 'actividad', ?, ?, ?, ?, ?)`,
      [
        id_curso,
        material.nombre || (material.url ? "Enlace" : "Archivo adjunto"),
        material.ruta || null,
        tipoArchivo,
        material.url ? 1 : 0,
        material.url || null,
        material.descripcion || "",
        id_usuario,
        id_actividad,
      ]
    );
  }
};

// @desc    Obtener la planeación de un curso
const obtenerPlaneacion = async (req, res) => {
  const id_curso = req.params.id || req.params.id_curso;
  if (!id_curso) {
    return res.status(400).json({ error: "Se requiere el ID del curso" });
  }
  console.log('DEBUG obtenerPlaneacion: id_curso =', id_curso);
  try {
    // 1. Obtener datos del curso (todo lo que necesitas)
    const [cursoData] = await pool.query(
      `SELECT 
        id_curso,
        clave_asignatura,
        id_carrera,
        caracterizacion,
        intencion_didactica,
        evaluacion_competencias,
        competencias_desarrollar,
        competencias_previas,
        proyecto_fundamentacion,
        proyecto_planeacion,
        proyecto_ejecucion,
        proyecto_evaluacion,
        id_convocatoria
       FROM curso 
       WHERE id_curso = ?`,
      [id_curso]
    );
    console.log('DEBUG: cursoData =', cursoData);
    console.log('DEBUG: cursoData[0] =', cursoData[0]);

    const curso = cursoData[0] || {};
    console.log('DEBUG: Valores recuperados del curso:', {
      caracterizacion: curso.caracterizacion,
      intencion_didactica: curso.intencion_didactica,
      competencias_desarrollar: curso.competencias_desarrollar,
      competencias_previas: curso.competencias_previas
    });

    // 2. Obtener configuración de calificaciones
    const [califCurso] = await pool.query(
      `SELECT * FROM calificaciones_curso WHERE id_curso = ?`,
      [id_curso]
    );

    // 3. Obtener convocatoria
    let convocatoriaData = null;
    let universidadesParticipantes = [];

    if (curso.id_convocatoria) {
      const [convocatoriaResult] = await pool.query(
        `SELECT id, nombre, descripcion FROM convocatorias WHERE id = ?`,
        [curso.id_convocatoria]
      );

      if (convocatoriaResult.length > 0) {
        convocatoriaData = convocatoriaResult[0];

        // Obtener universidades participantes
        const [universidadesResult] = await pool.query(
          `SELECT u.* 
           FROM universidad u
           JOIN convocatoria_universidades cu ON u.id_universidad = cu.universidad_id
           WHERE cu.convocatoria_id = ?`,
          [curso.id_convocatoria]
        );

        universidadesParticipantes = universidadesResult;
      }
    }

    // 4. Obtener actividades (prácticas y proyecto)
    const actividadesConMateriales = [];
    if (califCurso.length > 0) {
      const [actividades] = await pool.query(
        `SELECT * FROM calificaciones_actividades 
         WHERE id_calificaciones_curso = ? 
         ORDER BY tipo_actividad, id_actividad`,
        [califCurso[0].id_calificaciones]
      );

      // Obtener materiales de cada actividad
      for (const actividad of actividades) {
        const [materiales] = await pool.query(
          `SELECT 
            id_material,
            nombre_archivo as nombre,
            tipo_archivo as tipo,
            es_enlace,
            url_enlace as url,
            descripcion
           FROM material_curso 
           WHERE id_actividad = ?`,
          [actividad.id_actividad]
        );

        const materialesMapeados = materiales.map((m) => ({
          ...m,
          tipo: m.tipo === "texto" ? "referencias" : m.tipo,
        }));

        actividadesConMateriales.push({
          ...actividad,
          materiales: materialesMapeados,
        });
      }
    }

    // 5. Obtener temario CON COMPETENCIAS
    const [temas] = await pool.query(
      `
      SELECT 
        id_unidad as id,
        nombre_unidad as nombre,
        descripcion_unidad as descripcion,
        competenciasEspecificas,
        competenciasGenericas
      FROM unidades_curso 
      WHERE id_curso = ? 
      ORDER BY orden
    `,
      [id_curso]
    );

    // 6. Obtener subtemas de cada tema
    const temario = await Promise.all(
      temas.map(async (tema) => {
        const [subtemas] = await pool.query(
          `SELECT 
            id_subtema as id,
            nombre_subtema,
            descripcion_subtema as descripcion
           FROM subtemas_unidad 
           WHERE id_unidad = ? 
           ORDER BY orden`,
          [tema.id]
        );
        return {
          ...tema,
          subtemas,
          competencias_especificas: tema.competenciasEspecificas,
          competencias_genericas: tema.competenciasGenericas,
        };
      })
    );

    // 7. Separar prácticas y proyecto
    const practicas = actividadesConMateriales
      .filter((a) => a.tipo_actividad === "actividad")
      .map((p) => ({
        ...p,
        id_temporal: p.id_actividad,
        descripcion: p.instrucciones || "",
        materiales: p.materiales || [],
      }));

    const proyectoData = actividadesConMateriales.find(
      (a) => a.tipo_actividad === "proyecto"
    );

    const proyecto = proyectoData
      ? {
        ...proyectoData,
        id_temporal: proyectoData.id_actividad,
        instrucciones: proyectoData.instrucciones || "",
        fundamentacion: curso.proyecto_fundamentacion || "",
        planeacion: curso.proyecto_planeacion || "",
        ejecucion: curso.proyecto_ejecucion || "",
        evaluacion: curso.proyecto_evaluacion || "",
        materiales: (proyectoData.materiales || []).map((m) => ({
          ...m,
          id_temporal: m.id_material,
        })),
      }
      : null;

    // 8. Obtener fuentes de información (de la tabla material_curso con categoría específica)
    const [fuentesResult] = await pool.query(
      `SELECT 
        id_material,
        nombre_archivo as nombre,
        tipo_archivo as tipo,
        descripcion as referencia
       FROM material_curso 
       WHERE id_curso = ? 
         AND categoria_material = 'referencias'
         AND tipo_archivo = 'texto'
       ORDER BY fecha_subida`,
      [id_curso]
    );

    const fuentes = fuentesResult.map((f) => ({
      id_temporal: f.id_material,
      tipo: "referencias",
      referencia: f.referencia || f.nombre,
    }));

    res.status(200).json({
      temario,
      porcentaje_practicas: califCurso[0]?.porcentaje_actividades || 50,
      porcentaje_proyecto: califCurso[0]?.porcentaje_proyecto || 50,
      practicas,
      proyecto,
      // Datos del curso
      clave_asignatura: curso.clave_asignatura || "",
      id_carrera: curso.id_carrera || "",
      caracterizacion: curso.caracterizacion || "",
      intencion_didactica: curso.intencion_didactica || "",
      competencias_desarrollar: curso.competencias_desarrollar || "",
      competencias_previas: curso.competencias_previas || "",
      evaluacion_competencias: curso.evaluacion_competencias || "",
      // Datos de convocatoria
      convocatoria: convocatoriaData,
      universidades_participantes: universidadesParticipantes,
      // Fuentes
      fuentes: fuentes,
    });
  } catch (error) {
    console.error("Error en obtenerPlaneacion:", error);
    logger.error(`Error al obtener planeación: ${error.message}`);
    res.status(500).json({ error: "Error al obtener la planeación" });
  }
};

module.exports = {
  guardarPlaneacion,
  obtenerPlaneacion,
};
