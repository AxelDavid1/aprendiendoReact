const pool = require("../config/db");
const logger = require("../config/logger");

// @desc    Guardar o actualizar la planeación de un curso
const guardarPlaneacion = async (req, res) => {
  let connection;
  try {
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
      convocatoria_id,
      fuentes,
    } = req.body;
    const { id_usuario } = req.user;

    if (!id_curso) {
      return res.status(400).json({ error: "Se requiere el ID del curso" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ---------------------------------------------------------
    // 1. ACTUALIZAR DATOS DEL CURSO
    // ---------------------------------------------------------
    await connection.query(
      `UPDATE curso SET 
        caracterizacion = ?, intencion_didactica = ?, competencias_desarrollar = ?,
        competencias_previas = ?, evaluacion_competencias = ?,
        proyecto_fundamentacion = ?, proyecto_planeacion = ?, 
        proyecto_ejecucion = ?, proyecto_evaluacion = ?,
        id_convocatoria = ?
       WHERE id_curso = ?`,
      [
        caracterizacion || null, intencion_didactica || null, competencias_desarrollar || null,
        competencias_previas || null, evaluacion_competencias || null,
        (proyecto && proyecto.fundamentacion) || proyecto_fundamentacion || null,
        (proyecto && proyecto.planeacion) || proyecto_planeacion || null,
        (proyecto && proyecto.ejecucion) || proyecto_ejecucion || null,
        (proyecto && proyecto.evaluacion) || proyecto_evaluacion || null,
        convocatoria_id || null,
        id_curso,
      ]
    );

    // ---------------------------------------------------------
    // 2. CONFIGURACIÓN DE CALIFICACIONES
    // ---------------------------------------------------------
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

    const id_calificaciones_curso = califCurso.insertId ||
      (await connection.query("SELECT id_calificaciones FROM calificaciones_curso WHERE id_curso = ?", [id_curso]))[0][0].id_calificaciones;

    // ---------------------------------------------------------
    // 3. PROCESAR TEMARIO (UNIDADES Y SUBTEMAS)
    // ---------------------------------------------------------
    const [unidadesExistentes] = await connection.query("SELECT id_unidad FROM unidades_curso WHERE id_curso = ?", [id_curso]);
    const unidadesExistentesMap = new Map(unidadesExistentes.map(u => [u.id_unidad, u]));
    const unidadesRecibidas = new Set();

    if (temario && temario.length > 0) {
      for (const [index, tema] of temario.entries()) {
        let idUnidadReal = null;

        if (tema.id && unidadesExistentesMap.has(parseInt(tema.id))) {
          idUnidadReal = parseInt(tema.id);
          await connection.query(
            `UPDATE unidades_curso SET nombre_unidad=?, descripcion_unidad=?, competenciasEspecificas=?, competenciasGenericas=?, orden=? WHERE id_unidad=?`,
            [tema.nombre, tema.descripcion, tema.competenciasEspecificas, tema.competenciasGenericas, index, idUnidadReal]
          );
        } else {
          const [ins] = await connection.query(
            `INSERT INTO unidades_curso (id_curso, nombre_unidad, descripcion_unidad, competenciasEspecificas, competenciasGenericas, orden) VALUES (?, ?, ?, ?, ?, ?)`,
            [id_curso, tema.nombre, tema.descripcion, tema.competenciasEspecificas, tema.competenciasGenericas, index]
          );
          idUnidadReal = ins.insertId;
        }
        unidadesRecibidas.add(idUnidadReal);

        // Procesar Subtemas
        const [subtemasExistentes] = await connection.query("SELECT id_subtema FROM subtemas_unidad WHERE id_unidad = ?", [idUnidadReal]);
        const subtemasExistentesMap = new Map(subtemasExistentes.map(s => [s.id_subtema, s]));
        const subtemasRecibidos = new Set();

        if (tema.subtemas) {
          for (const [subIndex, subtema] of tema.subtemas.entries()) {
            let idSubtemaReal = null;
            if (subtema.id && subtemasExistentesMap.has(parseInt(subtema.id))) {
              idSubtemaReal = parseInt(subtema.id);
              await connection.query(
                `UPDATE subtemas_unidad SET nombre_subtema=?, descripcion_subtema=?, orden=? WHERE id_subtema=?`,
                [subtema.nombre, subtema.descripcion, subIndex, idSubtemaReal]
              );
            } else {
              const [subIns] = await connection.query(
                `INSERT INTO subtemas_unidad (id_unidad, nombre_subtema, descripcion_subtema, orden) VALUES (?, ?, ?, ?)`,
                [idUnidadReal, subtema.nombre, subtema.descripcion, subIndex]
              );
              idSubtemaReal = subIns.insertId;
            }
            subtemasRecibidos.add(idSubtemaReal);
          }
        }
        // Borrar subtemas huerfanos
        for (const [idSub] of subtemasExistentesMap) {
          if (!subtemasRecibidos.has(idSub)) await connection.query("DELETE FROM subtemas_unidad WHERE id_subtema = ?", [idSub]);
        }
      }
    }
    // Borrar unidades huerfanas
    for (const [idUni] of unidadesExistentesMap) {
      if (!unidadesRecibidas.has(idUni)) await connection.query("DELETE FROM unidades_curso WHERE id_unidad = ?", [idUni]);
    }

    // ---------------------------------------------------------
    // 4. PROCESAMIENTO DE PRÁCTICAS (Arquitectura Many-to-Many + Upsert)
    // ---------------------------------------------------------
    let idsActividadesProcesadas = [];

    if (practicas && practicas.length > 0) {
      for (const [index, practica] of practicas.entries()) {
        let idActividad = null;
        let idUnidadReal = practica.id_unidad ? parseInt(practica.id_unidad) : null;
        let idSubtemaReal = practica.id_subtema ? parseInt(practica.id_subtema) : null;

        // A) UPSERT ACTIVIDAD
        if (practica.id_actividad) {
          const [existe] = await connection.query("SELECT id_actividad FROM calificaciones_actividades WHERE id_actividad = ?", [practica.id_actividad]);
          if (existe.length > 0) {
            idActividad = practica.id_actividad;
            await connection.query(
              `UPDATE calificaciones_actividades SET nombre=?, instrucciones=?, id_unidad=?, id_subtema=?, fecha_actualizacion=NOW() WHERE id_actividad=?`,
              [`Actividad ${index + 1}`, practica.descripcion || '', idUnidadReal, idSubtemaReal, idActividad]
            );
          }
        }

        if (!idActividad) {
          const [nueva] = await connection.query(
            `INSERT INTO calificaciones_actividades (id_calificaciones_curso, nombre, tipo_actividad, instrucciones, max_archivos, max_tamano_mb, tipos_archivo_permitidos, id_unidad, id_subtema) VALUES (?, ?, 'actividad', ?, 5, 10, ?, ?, ?)`,
            [id_calificaciones_curso, `Actividad ${index + 1}`, practica.descripcion || '', JSON.stringify(['pdf', 'link']), idUnidadReal, idSubtemaReal]
          );
          idActividad = nueva.insertId;
        }
        idsActividadesProcesadas.push(idActividad);

        // B) VINCULAR MATERIALES
        await connection.query("DELETE FROM actividad_materiales WHERE id_actividad = ?", [idActividad]);
        const todosMateriales = practica.materiales || [];
        if (todosMateriales.length > 0) {
          await procesarYVincularMateriales(connection, idActividad, id_curso, todosMateriales, id_usuario, 'actividad');
        }
      }
    }

    // C) LIMPIEZA DE PRÁCTICAS HUÉRFANAS
    if (idsActividadesProcesadas.length > 0) {
      const placeholders = idsActividadesProcesadas.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM calificaciones_actividades WHERE id_calificaciones_curso = ? AND tipo_actividad = 'actividad' AND id_actividad NOT IN (${placeholders})`,
        [id_calificaciones_curso, ...idsActividadesProcesadas]
      );
    } else if (!practicas || practicas.length === 0) {
      await connection.query("DELETE FROM calificaciones_actividades WHERE id_calificaciones_curso = ? AND tipo_actividad = 'actividad'", [id_calificaciones_curso]);
    }

    // ---------------------------------------------------------
    // 5. PROCESAMIENTO DEL PROYECTO FINAL
    // ---------------------------------------------------------
    if (proyecto) {
      let idProyecto = null;
      const [proyExistente] = await connection.query(
        "SELECT id_actividad FROM calificaciones_actividades WHERE id_calificaciones_curso = ? AND tipo_actividad = 'proyecto' LIMIT 1",
        [id_calificaciones_curso]
      );

      if (proyExistente.length > 0) {
        idProyecto = proyExistente[0].id_actividad;
        await connection.query(
          "UPDATE calificaciones_actividades SET instrucciones = ?, fecha_actualizacion = NOW() WHERE id_actividad = ?",
          [proyecto.instrucciones || "Proyecto Final", idProyecto]
        );
      } else {
        const [nuevoProy] = await connection.query(
          `INSERT INTO calificaciones_actividades (id_calificaciones_curso, nombre, tipo_actividad, instrucciones, max_archivos, max_tamano_mb, tipos_archivo_permitidos) VALUES (?, 'Proyecto Final', 'proyecto', ?, 10, 25, ?)`,
          [id_calificaciones_curso, proyecto.instrucciones || "Proyecto Final", JSON.stringify(["pdf", "link", "zip"])]
        );
        idProyecto = nuevoProy.insertId;
      }

      await connection.query("DELETE FROM actividad_materiales WHERE id_actividad = ?", [idProyecto]);
      const materialesProyecto = [...(proyecto.materiales || []), ...(proyecto.materiales_nuevos || [])];
      if (materialesProyecto.length > 0) {
        await procesarYVincularMateriales(connection, idProyecto, id_curso, materialesProyecto, id_usuario, 'actividad');
      }
    }

    // ---------------------------------------------------------
    // 6. FUENTES DE INFORMACIÓN (Con LOGS de depuración)
    // ---------------------------------------------------------
    if (fuentes && Array.isArray(fuentes)) {
      console.log(`[DEBUG] Procesando ${fuentes.length} fuentes...`);

      const [fuentesExistentes] = await connection.query(
        "SELECT id_material FROM material_curso WHERE id_curso = ? AND categoria_material = 'planeacion'",
        [id_curso]
      );
      const fuentesExistentesMap = new Map(fuentesExistentes.map(f => [f.id_material, f]));
      console.log(`[DEBUG] Fuentes existentes en BD: ${JSON.stringify([...fuentesExistentesMap.keys()])}`);

      const fuentesRecibidas = new Set();

      // ---------------------------------------------------------
      // DENTRO DE LA SECCIÓN 6: FUENTES DE INFORMACIÓN
      // ---------------------------------------------------------

      for (const fuente of fuentes) {
        // CORRECCIÓN 1: Considerar la URL como contenido válido para que no salte los enlaces sin descripción
        const contenido = fuente.referencia || fuente.descripcion || fuente.nombre || fuente.url;

        if (contenido && contenido.trim() !== "") {
          let idFuente = null;

          // VARIABLES PARA LA BD (Lógica de 3 casos: PDF vs Enlace vs Texto)
          let tipoBD = 'texto';
          let nombreBD = 'Referencia Bibliográfica';
          let esEnlaceBD = 0;
          let urlBD = null;

          if (fuente.tipo === 'pdf') {
            // CASO A: Es un PDF (ya subido o existente)
            tipoBD = 'pdf';
            // IMPORTANTE: Respetar el nombre del archivo original si existe
            nombreBD = fuente.nombre || 'Archivo PDF';
            esEnlaceBD = 0;
            urlBD = null;
          }
          else if (fuente.tipo === 'enlace') {
            // CASO B: Es un Enlace
            tipoBD = 'enlace';
            nombreBD = 'Enlace Web';
            esEnlaceBD = 1;
            urlBD = fuente.url || contenido; // Si no hay URL separada, usar el contenido
          }
          else {
            // CASO C: Es Referencia Bibliográfica (Texto)
            tipoBD = 'texto';
            nombreBD = 'Referencia Bibliográfica';
            esEnlaceBD = 0;
            urlBD = null;
          }

          // Intento de MATCH por ID
          if (fuente.id_material && fuentesExistentesMap.has(parseInt(fuente.id_material))) {
            console.log(`[DEBUG] ACTUALIZANDO fuente ID: ${fuente.id_material} como tipo: ${tipoBD}`);
            idFuente = parseInt(fuente.id_material);

            // IMPORTANTE: Si es PDF, NO actualizamos 'nombre_archivo' ni 'tipo_archivo' ciegamente,
            // porque podríamos borrar el nombre real del archivo subido. 
            // Solo actualizamos descripción y metadatos.
            if (tipoBD === 'pdf') {
              await connection.query(
                `UPDATE material_curso SET 
                    descripcion = ?, fecha_subida = NOW()
                   WHERE id_material = ?`,
                [contenido, idFuente]
              );
            } else {
              // Para Enlaces y Referencias sí actualizamos todo
              await connection.query(
                `UPDATE material_curso SET 
                    nombre_archivo = ?, tipo_archivo = ?, es_enlace = ?, url_enlace = ?, descripcion = ?, fecha_subida = NOW()
                   WHERE id_material = ?`,
                [nombreBD, tipoBD, esEnlaceBD, urlBD, contenido, idFuente]
              );
            }
          }
          else {
            console.log(`[DEBUG] INSERTANDO NUEVA fuente tipo ${tipoBD}`);
            const [nueva] = await connection.query(
              `INSERT INTO material_curso (
                id_curso, nombre_archivo, tipo_archivo, categoria_material, 
                es_enlace, url_enlace, descripcion, subido_por, fecha_subida, activo
              ) VALUES (?, ?, ?, 'planeacion', ?, ?, ?, ?, NOW(), 1)`,
              [
                id_curso, nombreBD, tipoBD, esEnlaceBD,
                urlBD, contenido, id_usuario
              ]
            );
            idFuente = nueva.insertId;
          }

          if (idFuente) fuentesRecibidas.add(idFuente);
        }
      }

      // Borrar
      for (const [idFuenteExistente] of fuentesExistentesMap) {
        if (!fuentesRecibidas.has(idFuenteExistente)) {
          console.log(`[DEBUG] BORRANDO fuente huérfana ID: ${idFuenteExistente}`);
          await connection.query("DELETE FROM material_curso WHERE id_material = ?", [idFuenteExistente]);
        }
      }
    }

    await connection.commit();
    res.status(200).json({ success: true, message: "Planeación guardada exitosamente" });

  } catch (error) {
    if (connection) await connection.rollback();
    logger.error(`Error al guardar planeación: ${error.message}`, { error });
    res.status(500).json({ success: false, error: "Error al guardar la planeación", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const procesarYVincularMateriales = async (connection, id_actividad, id_curso, materiales, id_usuario, categoria = 'actividad') => {
  if (!materiales || !Array.isArray(materiales)) return;

  for (const [index, material] of materiales.entries()) {
    let idMaterial = material.id_material;

    // ---------------------------------------------------------
    // PASO 1: CREACIÓN (Solo si NO tiene ID)
    // ---------------------------------------------------------
    // Los PDFs subidos por el botón de "Subir Archivo" YA tienen ID,
    // así que este bloque es principalmente para Enlaces y Referencias APA nuevas.
    if (!idMaterial) {
      // Determinar el tipo exacto para la BD
      let tipoBD = 'pdf'; // Valor por defecto
      let nombreArchivo = material.nombre || "Material";

      const esEnlace = material.tipo === 'enlace';
      const esTexto = material.tipo === 'referencias' || material.tipo === 'texto';

      if (esEnlace) {
        tipoBD = 'enlace';
        nombreArchivo = "Enlace Web";
      } else if (esTexto) {
        tipoBD = 'texto';
        nombreArchivo = "Referencia Bibliográfica"; // Evitar NULL en nombre_archivo
      } else {
        // Caso PDF o Archivo que llegó sin ID (Raro, pero posible si falló la subida previa)
        tipoBD = 'pdf';
        // nombreArchivo se mantiene con material.nombre
      }

      const [resMaterial] = await connection.query(
        `INSERT INTO material_curso (
                id_curso, nombre_archivo, tipo_archivo, categoria_material, 
                es_enlace, url_enlace, descripcion, subido_por, fecha_subida, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
        [
          id_curso,
          nombreArchivo,
          tipoBD, // 👈 AQUÍ USAMOS LA VARIABLE CORREGIDA
          categoria,
          esEnlace ? 1 : 0,
          material.url || null,
          material.referencia || material.descripcion || "",
          id_usuario
        ]
      );
      idMaterial = resMaterial.insertId;
      console.log(`✅ Nuevo material (${tipoBD}) creado con ID ${idMaterial}`);
    } else {
      console.log(`ℹ️ Material existente detectado (ID: ${idMaterial}), saltando creación.`);
    }

    // ---------------------------------------------------------
    // PASO 2: VINCULACIÓN (Tabla Intermedia)
    // ---------------------------------------------------------
    if (idMaterial) {
      // Usamos INSERT IGNORE para evitar errores si el vínculo ya existe 
      // (aunque los borramos antes en el controlador principal, es doble seguridad)
      await connection.query(
        `INSERT IGNORE INTO actividad_materiales (id_actividad, id_material, orden)
             VALUES (?, ?, ?)`,
        [id_actividad, idMaterial, index]
      );
      // Opcional: Asegurar que el material apunte a la categoría correcta si se reutiliza
      // await connection.query("UPDATE material_curso SET categoria_material = ? WHERE id_material = ?", [categoria, idMaterial]);

      console.log(`🔗 Material ${idMaterial} vinculado a Actividad ${id_actividad}`);
    }
  }
};

// @desc    Obtener la planeación de un curso
const obtenerPlaneacion = async (req, res) => {
  const id_curso = req.params.id || req.params.id_curso;
  if (!id_curso) return res.status(400).json({ error: "Se requiere el ID del curso" });

  try {
    // 1. Datos del curso
    const [cursoData] = await pool.query(`SELECT * FROM curso WHERE id_curso = ?`, [id_curso]);
    const curso = cursoData[0] || {};

    // 2. Configuración calificaciones
    const [califCurso] = await pool.query(`SELECT * FROM calificaciones_curso WHERE id_curso = ?`, [id_curso]);

    // 3. Convocatoria
    let convocatoriaData = null, universidadesParticipantes = [];
    if (curso.id_convocatoria) {
      const [conv] = await pool.query(`SELECT id, nombre, descripcion FROM convocatorias WHERE id = ?`, [curso.id_convocatoria]);
      convocatoriaData = conv[0];
    }

    // 4. Temario
    const [temas] = await pool.query(`SELECT id_unidad as id, nombre_unidad as nombre, descripcion_unidad as descripcion, competenciasEspecificas as competencias_especificas, competenciasGenericas as competencias_genericas FROM unidades_curso WHERE id_curso = ? ORDER BY orden`, [id_curso]);

    const temario = await Promise.all(temas.map(async (tema) => {
      const [subtemas] = await pool.query(`SELECT id_subtema as id, nombre_subtema as nombre, descripcion_subtema as descripcion FROM subtemas_unidad WHERE id_unidad = ? ORDER BY orden`, [tema.id]);
      return { ...tema, subtemas };
    }));

    // 5. Actividades (Prácticas y Proyecto) con Materiales Vinculados (Many-to-Many)
    const actividadesConMateriales = [];
    if (califCurso.length > 0) {
      const [actividades] = await pool.query(
        `SELECT ca.*, uc.id_unidad, uc.nombre_unidad, su.id_subtema, su.nombre_subtema
         FROM calificaciones_actividades ca
         LEFT JOIN unidades_curso uc ON ca.id_unidad = uc.id_unidad
         LEFT JOIN subtemas_unidad su ON ca.id_subtema = su.id_subtema
         WHERE ca.id_calificaciones_curso = ?
         ORDER BY ca.tipo_actividad DESC, ca.id_actividad`,
        [califCurso[0].id_calificaciones]
      );

      for (const actividad of actividades) {
        // AQUÍ ESTÁ EL CAMBIO IMPORTANTE EN LECTURA: JOIN con actividad_materiales
        const [materiales] = await pool.query(
          `SELECT m.id_material, m.nombre_archivo as nombre, m.tipo_archivo as tipo, m.es_enlace, m.url_enlace as url, m.descripcion
           FROM material_curso m
           JOIN actividad_materiales am ON m.id_material = am.id_material
           WHERE am.id_actividad = ?
           ORDER BY am.orden ASC`,
          [actividad.id_actividad]
        );

        const materialesMapeados = materiales.map((m) => ({
          id_material: m.id_material,
          nombre: m.nombre,
          tipo: m.tipo === "texto" ? "referencias" : m.tipo,
          es_enlace: m.es_enlace,
          url: m.url,
          referencia: m.descripcion, // El texto APA viene en descripción
          descripcion: m.descripcion,
        }));

        actividadesConMateriales.push({ ...actividad, materiales: materialesMapeados });
      }
    }

    const practicas = actividadesConMateriales.filter(a => a.tipo_actividad === 'actividad').map(p => ({
      id_actividad: p.id_actividad,
      descripcion: p.instrucciones || "",
      materiales: p.materiales || [],
      id_unidad: p.id_unidad ? String(p.id_unidad) : null,
      id_subtema: p.id_subtema ? String(p.id_subtema) : null,
      nombre_unidad: p.nombre_unidad,
      nombre_subtema: p.nombre_subtema
    }));

    const proyData = actividadesConMateriales.find(a => a.tipo_actividad === 'proyecto');
    const proyecto = proyData ? {
      instrucciones: proyData.instrucciones,
      fundamentacion: curso.proyecto_fundamentacion,
      planeacion: curso.proyecto_planeacion,
      ejecucion: curso.proyecto_ejecucion,
      evaluacion: curso.proyecto_evaluacion,
      materiales: proyData.materiales || []
    } : null;

    // 6. Fuentes de Información (Planeación General - Sin cambios mayores)
    const [fuentesResult] = await pool.query(
      `SELECT id_material, nombre_archivo, tipo_archivo as tipo, descripcion, es_enlace, url_enlace
         FROM material_curso WHERE id_curso = ? AND categoria_material = 'planeacion' ORDER BY fecha_subida`,
      [id_curso]
    );
    const fuentes = fuentesResult.map(f => ({
      id_material: f.id_material,
      tipo: f.tipo === 'texto' ? 'referencias' : (f.tipo === 'enlace' ? 'enlace' : 'pdf'),
      referencia: f.descripcion,
      url: f.es_enlace ? f.url_enlace : null,
      nombre: f.nombre_archivo // Puede ser null
    }));

    res.status(200).json({
      temario,
      porcentaje_practicas: califCurso[0]?.porcentaje_actividades || 50,
      porcentaje_proyecto: califCurso[0]?.porcentaje_proyecto || 50,
      practicas,
      proyecto,
      clave_asignatura: curso.clave_asignatura || "",
      caracterizacion: curso.caracterizacion || "",
      // ... resto de campos del curso
      intencion_didactica: curso.intencion_didactica,
      competencias_desarrollar: curso.competencias_desarrollar,
      competencias_previas: curso.competencias_previas,
      evaluacion_competencias: curso.evaluacion_competencias,
      convocatoria: convocatoriaData,
      convocatoria_id: curso.id_convocatoria,
      fuentes
    });

  } catch (error) {
    console.error("Error en obtenerPlaneacion:", error);
    res.status(500).json({ error: "Error al obtener la planeación" });
  }
};

module.exports = { guardarPlaneacion, obtenerPlaneacion };