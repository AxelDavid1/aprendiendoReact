// /backend/controllers/planeacionController.js
const pool = require("../config/db");
const logger = require("../config/logger");

// @desc    Guardar o actualizar la planeación de un curso
// @route   POST /api/planeacion
// @access  Private
const guardarPlaneacion = async (req, res) => {
  const { id_curso } = req.params;
  const { temario, porcentaje_practicas, porcentaje_proyecto, practicas, proyecto } = req.body;
  const { id_usuario } = req.user;

  // Validar que la suma de porcentajes sea 100%
  if (porcentaje_practicas + porcentaje_proyecto !== 100) {
    return res.status(400).json({ 
      error: "La suma de los porcentajes de prácticas y proyecto debe ser 100%" 
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Guardar configuración de calificaciones
    const [califCurso] = await connection.query(
      `INSERT INTO calificaciones_curso (id_curso, umbral_aprobatorio)
       VALUES (?, 70)
       ON DUPLICATE KEY UPDATE fecha_actualizacion = NOW()`,
      [id_curso]
    );

    const id_calificaciones_curso = califCurso.insertId || 
      (await connection.query(
        "SELECT id_calificaciones FROM calificaciones_curso WHERE id_curso = ?", 
        [id_curso]
      ))[0][0].id_calificaciones;

    // 2. Eliminar actividades existentes (para actualización)
    await connection.query(
      `DELETE ca FROM calificaciones_actividades ca
       JOIN calificaciones_curso cc ON ca.id_calificaciones_curso = cc.id_calificaciones
       WHERE cc.id_curso = ?`,
      [id_curso]
    );

    // 3. Guardar prácticas
    for (const [index, practica] of practicas.entries()) {
      const [actividad] = await connection.query(
        `INSERT INTO calificaciones_actividades (
          id_calificaciones_curso, nombre, porcentaje, tipo_actividad, 
          instrucciones, fecha_limite, max_archivos, max_tamano_mb, 
          tipos_archivo_permitidos
        ) VALUES (?, ?, ?, 'actividad', ?, NULL, 5, 10, ?)`,
        [
          id_calificaciones_curso,
          `Práctica ${index + 1}`,
          (porcentaje_practicas / practicas.length).toFixed(2),
          practica.descripcion,
          JSON.stringify(['pdf', 'link'])
        ]
      );

      // Guardar archivos/links de la práctica
      await guardarMateriales(connection, actividad.insertId, id_curso, practica.materiales, id_usuario);
    }

    // 4. Guardar proyecto
    const [proyectoActividad] = await connection.query(
      `INSERT INTO calificaciones_actividades (
        id_calificaciones_curso, nombre, porcentaje, tipo_actividad, 
        instrucciones, fecha_limite, max_archivos, max_tamano_mb, 
        tipos_archivo_permitidos
      ) VALUES (?, 'Proyecto Final', ?, 'proyecto', ?, NULL, 10, 25, ?)`,
      [
        id_calificaciones_curso,
        porcentaje_proyecto,
        proyecto.instrucciones || 'Proyecto final del curso',
        JSON.stringify(['pdf', 'link', 'zip'])
      ]
    );

    // Guardar archivos/links del proyecto
    await guardarMateriales(connection, proyectoActividad.insertId, id_curso, proyecto.materiales, id_usuario);

    // 5. Guardar temario (usando los campos correctos de unidades_curso)
    await connection.query(
      "DELETE FROM unidades_curso WHERE id_curso = ?",
      [id_curso]
    );

    for (const [index, tema] of temario.entries()) {
      // Usar nombre_unidad y descripcion_unidad, y guardar competencias en descripcion
      const descripcionCompleta = [
        tema.competencias_especificas ? `Competencias específicas: ${tema.competencias_especificas}` : '',
        tema.competencias_genericas ? `Competencias genéricas: ${tema.competencias_genericas}` : ''
      ].filter(Boolean).join('\n\n');

      const [temaInsertado] = await connection.query(
        `INSERT INTO unidades_curso (
          id_curso, nombre_unidad, descripcion_unidad, orden
        ) VALUES (?, ?, ?, ?)`,
        [
          id_curso,
          tema.nombre,
          descripcionCompleta || null,
          index
        ]
      );

      // Guardar subtemas
      if (tema.subtemas && tema.subtemas.length > 0) {
        for (const [subIndex, subtema] of tema.subtemas.entries()) {
          await connection.query(
            `INSERT INTO subtemas_unidad (
              id_unidad, nombre_subtema, descripcion_subtema, orden
            ) VALUES (?, ?, ?, ?)`,
            [temaInsertado.insertId, subtema.nombre, null, subIndex]
          );
        }
      }
    }

    await connection.commit();
    res.status(200).json({ message: "Planeación guardada exitosamente" });

  } catch (error) {
    if (connection) await connection.rollback();
    logger.error(`Error al guardar planeación: ${error.message}`);
    res.status(500).json({ error: "Error al guardar la planeación" });
  } finally {
    if (connection) connection.release();
  }
};

// Función auxiliar para guardar materiales
const guardarMateriales = async (connection, id_actividad, id_curso, materiales, id_usuario) => {
  if (!materiales || !Array.isArray(materiales)) return;

  for (const material of materiales) {
    // Mapear 'referencias' a 'texto' para coincidir con el enum de la base de datos
    const tipoArchivo = material.tipo === 'referencias' ? 'texto' : 
                       (material.tipo || (material.url ? 'enlace' : 'pdf'));

    await connection.query(
      `INSERT INTO material_curso (
        id_curso, nombre_archivo, ruta_archivo, tipo_archivo, 
        categoria_material, es_enlace, url_enlace, 
        descripcion, subido_por, id_actividad
      ) VALUES (?, ?, ?, ?, 'actividad', ?, ?, ?, ?, ?)`,
      [
        id_curso,
        material.nombre || (material.url ? 'Enlace' : 'Archivo adjunto'),
        material.ruta || null,
        tipoArchivo,
        material.url ? 1 : 0,
        material.url || null,
        material.descripcion || '',
        id_usuario,
        id_actividad
      ]
    );
  }
};

// @desc    Obtener la planeación de un curso
// @route   GET /api/planeacion/:id_curso
// @access  Private
const obtenerPlaneacion = async (req, res) => {
  const { id_curso } = req.params;

  try {
    // 1. Obtener configuración de calificaciones
    const [califCurso] = await pool.query(
      `SELECT * FROM calificaciones_curso WHERE id_curso = ?`,
      [id_curso]
    );

    if (!califCurso.length) {
      return res.status(200).json({
        temario: [],
        porcentaje_practicas: 0,
        porcentaje_proyecto: 0,
        practicas: [],
        proyecto: null
      });
    }

    // 2. Obtener actividades (prácticas y proyecto)
    const [actividades] = await pool.query(
      `SELECT * FROM calificaciones_actividades 
       WHERE id_calificaciones_curso = ? 
       ORDER BY tipo_actividad, id_actividad`,
      [califCurso[0].id_calificaciones]
    );

    // 3. Obtener materiales de cada actividad
    const actividadesConMateriales = await Promise.all(
      actividades.map(async (actividad) => {
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
        
        // Mapear tipos de archivo para el frontend
        const materialesMapeados = materiales.map(m => ({
          ...m,
          tipo: m.tipo === 'texto' ? 'referencias' : m.tipo
        }));

        return { 
          ...actividad, 
          materiales: materialesMapeados 
        };
      })
    );

    // 4. Obtener temario
    const [temas] = await pool.query(
      `SELECT 
        id_tema as id,
        nombre as nombre_tema,
        competencias_especificas,
        competencias_genericas
       FROM unidades_curso 
       WHERE id_curso = ? 
       ORDER BY orden_unidad`,
      [id_curso]
    );

    // 5. Obtener subtemas de cada tema
    const temario = await Promise.all(
      temas.map(async (tema) => {
        const [subtemas] = await pool.query(
          `SELECT 
            id_subtema as id,
            nombre as nombre_subtema
           FROM subtemas_unidad 
           WHERE id_unidad = ? 
           ORDER BY orden_subtema`,
          [tema.id]
        );
        return { ...tema, subtemas };
      })
    );

    // Separar prácticas y proyecto
    const practicas = actividadesConMateriales
      .filter(a => a.tipo_actividad === 'actividad')
      .map(p => ({
        ...p,
        id_temporal: p.id_actividad, // Para compatibilidad con el frontend
        descripcion: p.instrucciones || '',
        materiales: p.materiales || []
      }));
    
    const proyectoData = actividadesConMateriales
      .find(a => a.tipo_actividad === 'proyecto');

    const proyecto = proyectoData ? {
      ...proyectoData,
      id_temporal: proyectoData.id_actividad,
      instrucciones: proyectoData.instrucciones || '',
      fundamentacion: proyectoData.fundamentacion || '',
      planeacion: proyectoData.planeacion || '',
      ejecucion: proyectoData.ejecucion || '',
      evaluacion: proyectoData.evaluacion || '',
      materiales: (proyectoData.materiales || []).map(m => ({
        ...m,
        id_temporal: m.id_material
      }))
    } : null;

    // Calcular porcentajes
    const porcentaje_practicas = practicas
      .reduce((sum, p) => sum + (parseFloat(p.porcentaje) || 0), 0);
    
    const porcentaje_proyecto = proyecto ? (parseFloat(proyecto.porcentaje) || 0) : 0;

    res.status(200).json({
      temario,
      porcentaje_practicas,
      porcentaje_proyecto,
      practicas,
      proyecto
    });

  } catch (error) {
    console.error('Error en obtenerPlaneacion:', error);
    logger.error(`Error al obtener planeación: ${error.message}`);
    res.status(500).json({ error: "Error al obtener la planeación" });
  }
};

module.exports = {
  guardarPlaneacion,
  obtenerPlaneacion
};