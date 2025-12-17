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
    fuentes,
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

    // 4. NUEVA LÓGICA: ACTUALIZAR O CREAR TEMARIO (NO ELIMINAR)
    // Obtener unidades existentes
    const [unidadesExistentes] = await connection.query(
      "SELECT id_unidad, nombre_unidad, orden FROM unidades_curso WHERE id_curso = ?",
      [id_curso]
    );

    const unidadesExistentesMap = new Map(
      unidadesExistentes.map(u => [u.id_unidad, u])
    );

    // IDs de unidades que vienen del frontend
    const unidadesRecibidas = new Set();
    const unidadesMap = {}; // { índice_tema: id_unidad_real }

    if (temario && temario.length > 0) {
      for (const [index, tema] of temario.entries()) {
        let idUnidadReal = null;

        // **CAMBIOS AQUÍ: Verificar si el tema tiene ID**
        if (tema.id && unidadesExistentesMap.has(parseInt(tema.id))) {
          // Si tiene ID y existe en BD, ACTUALIZAR
          idUnidadReal = parseInt(tema.id);
          await connection.query(
            `UPDATE unidades_curso SET
          nombre_unidad = ?,
          descripcion_unidad = ?,
          competenciasEspecificas = ?,
          competenciasGenericas = ?,
          orden = ?
        WHERE id_unidad = ? AND id_curso = ?`,
            [
              tema.nombre,
              tema.descripcion || null,
              tema.competenciasEspecificas || tema.competencias_especificas || null,
              tema.competenciasGenericas || tema.competencias_genericas || null,
              index,
              idUnidadReal,
              id_curso,
            ]
          );
          console.log(`✅ Unidad ID ${idUnidadReal} actualizada`);
        } else {
          // Si NO tiene ID o no existe, CREAR
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
          idUnidadReal = temaInsertado.insertId;
          console.log(`✅ Unidad ID ${idUnidadReal} creada`);
        }

        unidadesRecibidas.add(idUnidadReal);
        unidadesMap[index] = { idUnidad: idUnidadReal, subtemasMap: {} };

        // SUBTEMAS: Obtener existentes
        const [subtemasExistentes] = await connection.query(
          "SELECT id_subtema, nombre_subtema, orden FROM subtemas_unidad WHERE id_unidad = ?",
          [idUnidadReal]
        );

        const subtemasExistentesMap = new Map(
          subtemasExistentes.map(s => [s.id_subtema, s])
        );

        const subtemasRecibidos = new Set();

        // Crear o actualizar subtemas
        if (tema.subtemas && tema.subtemas.length > 0) {
          for (const [subIndex, subtema] of tema.subtemas.entries()) {
            let idSubtemaReal = null;

            // **CAMBIOS AQUÍ: Verificar si el subtema tiene ID**
            if (subtema.id && subtemasExistentesMap.has(parseInt(subtema.id))) {
              // Si el subtema tiene ID y existe en BD, ACTUALIZAR
              idSubtemaReal = parseInt(subtema.id);
              await connection.query(
                `UPDATE subtemas_unidad SET
              nombre_subtema = ?,
              descripcion_subtema = ?,
              orden = ?
            WHERE id_subtema = ? AND id_unidad = ?`,
                [
                  subtema.nombre,
                  subtema.descripcion || null,
                  subIndex,
                  idSubtemaReal,
                  idUnidadReal,
                ]
              );
              console.log(`✅ Subtema ID ${idSubtemaReal} actualizado`);
            } else {
              // Si NO tiene ID o no existe, CREAR
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
              idSubtemaReal = subtemaInsertado.insertId;
              console.log(`✅ Subtema ID ${idSubtemaReal} creado`);
            }

            subtemasRecibidos.add(idSubtemaReal);
            unidadesMap[index].subtemasMap[subIndex] = idSubtemaReal;
          }
        }

        // Eliminar subtemas que ya no están en el frontend
        for (const [idSubtemaExistente] of subtemasExistentesMap) {
          if (!subtemasRecibidos.has(idSubtemaExistente)) {
            await connection.query(
              "DELETE FROM subtemas_unidad WHERE id_subtema = ?",
              [idSubtemaExistente]
            );
            console.log(`🗑️ Subtema ID ${idSubtemaExistente} eliminado`);
          }
        }
      }
    }

    // Eliminar unidades que ya no están en el frontend
    for (const [idUnidadExistente] of unidadesExistentesMap) {
      if (!unidadesRecibidas.has(idUnidadExistente)) {
        await connection.query(
          "DELETE FROM unidades_curso WHERE id_unidad = ?",
          [idUnidadExistente]
        );
        console.log(`🗑️ Unidad ID ${idUnidadExistente} eliminada`);
      }
    }

    console.log('DEBUG: Mapa de unidades procesadas:', JSON.stringify(unidadesMap, null, 2));

    // 6. Guardar prácticas usando IDs reales
    if (practicas && practicas.length > 0) {
      const porcentajePorActividad = porcentaje_actividades / practicas.length;

      for (const [index, practica] of practicas.entries()) {
        console.log(`Guardando práctica ${index}:`, {
          id_unidad: practica.id_unidad,
          id_subtema: practica.id_subtema
        });
        let idUnidadReal = null;
        let idSubtemaReal = null;

        // Usar IDs reales directamente del frontend
        if (practica.id_unidad) {
          idUnidadReal = parseInt(practica.id_unidad);

          // Verificar que la unidad exista
          const [unidadExists] = await connection.query(
            "SELECT id_unidad FROM unidades_curso WHERE id_unidad = ? AND id_curso = ?",
            [idUnidadReal, id_curso]
          );

          if (unidadExists.length === 0) {
            console.warn(`⚠️ Unidad ID ${idUnidadReal} no encontrada para la práctica ${index}`);
            idUnidadReal = null;
          } else {
            console.log(`✅ Unidad ID ${idUnidadReal} encontrada para la práctica ${index}`);
          }
        }

        // Buscar ID real del subtema si existe
        if (practica.id_subtema && idUnidadReal) {
          idSubtemaReal = parseInt(practica.id_subtema);

          const [subtemaExists] = await connection.query(
            "SELECT id_subtema FROM subtemas_unidad WHERE id_subtema = ? AND id_unidad = ?",
            [idSubtemaReal, idUnidadReal]
          );

          if (subtemaExists.length === 0) {
            console.warn(`⚠️ Subtema ID ${idSubtemaReal} no encontrado para la práctica ${index}`);
            idSubtemaReal = null;
          } else {
            console.log(`✅ Subtema ID ${idSubtemaReal} encontrado para la práctica ${index}`);
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
            practica.descripcion || '',
            JSON.stringify(['pdf', 'link']),
            idUnidadReal || null,
            idSubtemaReal || null
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

    // 7. Guardar proyecto (sin cambios)
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

    // 8. Guardar fuentes de información (CAMBIOS IMPORTANTES)
    if (fuentes && fuentes.length > 0) {
      // Primero eliminar las fuentes existentes de este curso
      await connection.query(
        `DELETE FROM material_curso 
        WHERE id_curso = ? 
        AND categoria_material = 'planeacion'`,
        [id_curso]
      );

      for (const fuente of fuentes) {
        // Mapear tipo del frontend a tipo_archivo de la BD
        let tipoArchivoBD;
        let esEnlace = 0;
        let urlEnlace = null;
        let nombreArchivo = fuente.referencia?.substring(0, 100) || 'Referencia';

        switch (fuente.tipo) {
          case 'referencias':
            tipoArchivoBD = 'texto';
            esEnlace = 0;
            break;
          case 'enlace':
            tipoArchivoBD = 'enlace';
            esEnlace = 1;
            // Si es un enlace, la referencia podría ser la URL
            if (fuente.referencia?.startsWith('http')) {
              urlEnlace = fuente.referencia;
            }
            break;
          case 'pdf':
            tipoArchivoBD = 'pdf';
            esEnlace = 0;
            break;
          default:
            tipoArchivoBD = 'texto';
            esEnlace = 0;
        }

        await connection.query(
          `INSERT INTO material_curso (
            id_curso, nombre_archivo, tipo_archivo, 
            categoria_material, es_enlace, url_enlace, 
            descripcion, subido_por
          ) VALUES (?, ?, ?, 'planeacion', ?, ?, ?, ?)`,
          [
            id_curso,
            nombreArchivo,
            tipoArchivoBD,
            esEnlace,
            urlEnlace,
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
    // Si tiene id_material, significa que ya fue subido
    if (material.id_material) {
      // Solo actualizar la relación con la actividad
      await connection.query(
        `UPDATE material_curso SET id_actividad = ? WHERE id_material = ?`,
        [id_actividad, material.id_material]
      );
      console.log(`✅ Material ID ${material.id_material} vinculado a actividad ${id_actividad}`);
    } else {
      // Crear nuevo material (para enlaces y referencias)
      const tipoArchivo =
        material.tipo === "referencias" ? "texto" : 
        material.tipo === "enlace" ? "enlace" : "pdf";

      await connection.query(
        `INSERT INTO material_curso (
          id_curso, nombre_archivo, tipo_archivo, 
          categoria_material, es_enlace, url_enlace, 
          descripcion, subido_por, id_actividad
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_curso,
          material.nombre || material.referencia || "Material",
          tipoArchivo,
          categoria,
          material.url ? 1 : 0,
          material.url || null,
          material.referencia || material.descripcion || "",
          id_usuario,
          id_actividad,
        ]
      );
      console.log(`✅ Material nuevo creado: ${material.nombre || material.referencia}`);
    }
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
      console.log('Resultado de la consulta de actividades:', actividadesConMateriales);

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
        descripcion,
        es_enlace,
        url_enlace
      FROM material_curso 
      WHERE id_curso = ? 
        AND categoria_material = 'planeacion'
      ORDER BY fecha_subida`,
      [id_curso]
    );

    const fuentes = fuentesResult.map((f) => {
      // Mapear tipo_archivo de BD a tipo del frontend
      let tipoFrontend;
      switch (f.tipo) {
        case 'texto':
          tipoFrontend = 'referencias';
          break;
        case 'enlace':
          tipoFrontend = 'enlace';
          break;
        case 'pdf':
          tipoFrontend = 'pdf';
          break;
        default:
          tipoFrontend = 'referencias';
      }

      return {
        id_material: f.id_material,
        tipo: tipoFrontend,
        referencia: f.descripcion || f.referencia,
        // Si es un enlace, usar la URL
        url: f.es_enlace ? f.url_enlace : null,
      };
    });

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