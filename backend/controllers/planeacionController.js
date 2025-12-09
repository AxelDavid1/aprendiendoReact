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
    fuentes, // Añadido para fuentes
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

    // **1. ACTUALIZAR TABLA CURSO CON TODOS LOS CAMPOS (INCLUYENDO PROYECTO)**
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

    // 4. Eliminar temario existente para recrearlo
    await connection.query("DELETE FROM unidades_curso WHERE id_curso = ?", [
      id_curso,
    ]);

    // 5. Guardar temario CON COMPETENCIAS (PRIMERO para tener IDs reales)
    const unidadesMap = {}; // { índice_tema: id_unidad_real }
    
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
            tema.competenciasEspecificas || tema.competencias_especificas || null,
            tema.competenciasGenericas || tema.competencias_genericas || null,
            index,
          ]
        );

        const idUnidadReal = temaInsertado.insertId;
        unidadesMap[index] = { idUnidad: idUnidadReal, subtemasMap: {} };

        // Crear subtemas y guardar sus IDs reales
        if (tema.subtemas && tema.subtemas.length > 0) {
          for (const [subIndex, subtema] of tema.subtemas.entries()) {
            const [subtemaInsertado] = await connection.query(
              `INSERT INTO subtemas_unidad (
            id_unidad, nombre_subtema, descripcion_subtema, orden
          ) VALUES (?, ?, ?, ?)`,
              [
                idUnidadReal,
                subtema.nombre,
                subtema.descripcion || null,
                subIndex,
              ]
            );

            const idSubtemaReal = subtemaInsertado.insertId;
            unidadesMap[index].subtemasMap[subIndex] = idSubtemaReal;
          }
        }
      }
    }

    console.log('DEBUG: Mapa de unidades creadas:', JSON.stringify(unidadesMap, null, 2));

    // 6. Guardar prácticas usando IDs reales
    if (practicas && practicas.length > 0) {
      const porcentajePorActividad = porcentaje_actividades / practicas.length;

      for (const [index, practica] of practicas.entries()) {
        let idUnidadReal = null;
        let idSubtemaReal = null;

        // Usar IDs reales directamente del frontend
        // El frontend debe enviar id_unidad e id_subtema como números reales
        if (practica.id_unidad) {
          idUnidadReal = parseInt(practica.id_unidad);
          
          // Verificar que la unidad exista
          if (idUnidadReal) {
            const [unidadExists] = await connection.query(
              "SELECT id_unidad FROM unidades_curso WHERE id_unidad = ? AND id_curso = ?",
              [idUnidadReal, id_curso]
            );
            
            if (unidadExists.length === 0) {
              console.warn(`⚠️ Unidad ID ${idUnidadReal} no encontrada para la práctica ${index}`);
              idUnidadReal = null;
            }
          }
        }

        // Buscar ID real del subtema si existe
        if (practica.id_subtema && idUnidadReal) {
          idSubtemaReal = parseInt(practica.id_subtema);
          
          if (idSubtemaReal) {
            const [subtemaExists] = await connection.query(
              "SELECT id_subtema FROM subtemas_unidad WHERE id_subtema = ? AND id_unidad = ?",
              [idSubtemaReal, idUnidadReal]
            );
            
            if (subtemaExists.length === 0) {
              console.warn(`⚠️ Subtema ID ${idSubtemaReal} no encontrado para la práctica ${index}`);
              idSubtemaReal = null;
            }
          }
        }

        console.log('DEBUG: Práctica', index, {
          id_unidad: practica.id_unidad,
          id_unidad_real: idUnidadReal,
          id_subtema: practica.id_subtema,
          id_subtema_real: idSubtemaReal
        });

        const [actividad] = await connection.query(
          `INSERT INTO calificaciones_actividades (
        id_calificaciones_curso, nombre, tipo_actividad, 
        instrucciones, fecha_limite, max_archivos, max_tamano_mb, 
        tipos_archivo_permitidos, id_unidad, id_subtema
      ) VALUES (?, ?, 'actividad', ?, NULL, 5, 10, ?, ?, ?)`,
          [
            id_calificaciones_curso,
            `Actividad ${index + 1}`,
            practica.descripcion,
            JSON.stringify(['pdf', 'link']),
            idUnidadReal,
            idSubtemaReal
          ]
        );

        if (practica.materiales) {
          await guardarMateriales(
            connection,
            actividad.insertId,
            id_curso,
            practica.materiales,
            id_usuario,
            'actividad'
          );
        }
      }
    }

    // 7. Guardar proyecto
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
          id_usuario,
          'actividad'
        );
      }
    }

    // 8. Guardar fuentes de información
    if (fuentes && fuentes.length > 0) {
      // Eliminar fuentes existentes
      await connection.query(
        `DELETE FROM material_curso 
         WHERE id_curso = ? 
         AND categoria_material = 'referencias' 
         AND tipo_archivo = 'texto'`,
        [id_curso]
      );

      for (const fuente of fuentes) {
        await connection.query(
          `INSERT INTO material_curso (
            id_curso, nombre_archivo, tipo_archivo, 
            categoria_material, es_enlace, url_enlace, 
            descripcion, subido_por
          ) VALUES (?, ?, ?, 'referencias', 0, NULL, ?, ?)`,
          [
            id_curso,
            fuente.referencia?.substring(0, 100) || 'Referencia',
            'texto',
            fuente.referencia || '',
            id_usuario
          ]
        );
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
  id_usuario,
  categoria = 'actividad'
) => {
  console.log("DEBUG guardarMateriales:", {
    id_actividad,
    id_curso,
    id_usuario,
    materialesCount: materiales?.length,
    categoria
  });
  if (!materiales || !Array.isArray(materiales)) return;

  if (!id_curso) {
    console.error("Error: id_curso es null o undefined en guardarMateriales");
    throw new Error("id_curso es requerido para guardar materiales");
  }

  for (const material of materiales) {
    // Mapear 'referencias' a 'texto' para coincidir con el enum de la base de datos
    const tipoArchivo =
      material.tipo === "referencias" || material.tipo === "referencia"
        ? "texto"
        : material.tipo || (material.url ? "enlace" : "pdf");

    await connection.query(
      `INSERT INTO material_curso (
        id_curso, nombre_archivo, ruta_archivo, tipo_archivo, 
        categoria_material, es_enlace, url_enlace, 
        descripcion, subido_por, id_actividad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_curso,
        material.nombre || (material.url ? "Enlace" : "Archivo adjunto"),
        material.ruta || null,
        tipoArchivo,
        categoria,
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

    const curso = cursoData[0] || {};
    console.log('DEBUG: Valores recuperados del proyecto:', {
      fundamentacion: curso.proyecto_fundamentacion,
      planeacion: curso.proyecto_planeacion,
      ejecucion: curso.proyecto_ejecucion,
      evaluacion: curso.proyecto_evaluacion
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

    // 4. Obtener temario CON COMPETENCIAS
    const [temas] = await pool.query(
      `
      SELECT 
        id_unidad as id,
        nombre_unidad as nombre,
        descripcion_unidad as descripcion,
        competenciasEspecificas as competencias_especificas,
        competenciasGenericas as competencias_genericas
      FROM unidades_curso 
      WHERE id_curso = ? 
      ORDER BY orden
    `,
      [id_curso]
    );

    // 5. Obtener subtemas de cada tema
    const temario = await Promise.all(
      temas.map(async (tema) => {
        const [subtemas] = await pool.query(
          `SELECT 
            id_subtema as id,
            nombre_subtema as nombre,
            descripcion_subtema as descripcion
           FROM subtemas_unidad 
           WHERE id_unidad = ? 
           ORDER BY orden`,
          [tema.id]
        );
        return {
          ...tema,
          subtemas,
        };
      })
    );

    // 6. Obtener actividades (prácticas y proyecto) con sus materiales
    const actividadesConMateriales = [];
    if (califCurso.length > 0) {
      const [actividades] = await pool.query(
        `SELECT 
          ca.*,
          uc.id_unidad,
          uc.nombre_unidad,
          su.id_subtema,
          su.nombre_subtema
        FROM calificaciones_actividades ca
        LEFT JOIN unidades_curso uc ON ca.id_unidad = uc.id_unidad
        LEFT JOIN subtemas_unidad su ON ca.id_subtema = su.id_subtema
        WHERE ca.id_calificaciones_curso = ?
        ORDER BY ca.tipo_actividad DESC, ca.id_actividad`,
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
          id_material: m.id_material,
          nombre: m.nombre,
          tipo: m.tipo === "texto" ? "referencias" : m.tipo,
          es_enlace: m.es_enlace,
          url: m.url,
          descripcion: m.descripcion,
        }));

        actividadesConMateriales.push({
          ...actividad,
          materiales: materialesMapeados,
        });
      }
    }

    // 7. Separar prácticas y proyecto
    const practicas = actividadesConMateriales
      .filter((a) => a.tipo_actividad === 'actividad')
      .map((p) => ({
        id_actividad: p.id_actividad,
        descripcion: p.instrucciones || "",
        materiales: p.materiales || [],
        id_unidad: p.id_unidad ? String(p.id_unidad) : null,
        id_subtema: p.id_subtema ? String(p.id_subtema) : null,
        nombre_unidad: p.nombre_unidad || null,
        nombre_subtema: p.nombre_subtema || null,
      }));

    const proyectoData = actividadesConMateriales.find(
      (a) => a.tipo_actividad === 'proyecto'
    );

    const proyecto = proyectoData
      ? {
        id_actividad: proyectoData.id_actividad,
        instrucciones: proyectoData.instrucciones || "",
        fundamentacion: curso.proyecto_fundamentacion || "",
        planeacion: curso.proyecto_planeacion || "",
        ejecucion: curso.proyecto_ejecucion || "",
        evaluacion: curso.proyecto_evaluacion || "",
        materiales: (proyectoData.materiales || []).map((m) => ({
          ...m,
        })),
      }
      : null;

    // 8. Obtener fuentes de información
    const [fuentesResult] = await pool.query(
      `SELECT 
        id_material,
        nombre_archivo as referencia,
        tipo_archivo as tipo,
        descripcion
       FROM material_curso 
       WHERE id_curso = ? 
         AND categoria_material = 'referencias'
         AND tipo_archivo = 'texto'
       ORDER BY fecha_subida`,
      [id_curso]
    );

    const fuentes = fuentesResult.map((f) => ({
      id_material: f.id_material,
      tipo: f.tipo === "texto" ? "referencias" : f.tipo,
      referencia: f.descripcion || f.referencia,
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
      convocatoria_id: curso.id_convocatoria || null,
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