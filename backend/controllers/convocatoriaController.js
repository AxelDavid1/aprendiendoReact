// backend/controllers/convocatoriaController.js
const pool = require("../config/db");

// Función auxiliar para manejar la relación con las universidades y sus capacidades
const manageConvocatoriaUniversidades = async (
  connection,
  convocatoriaId,
  universidades,
) => {
  // Primero, eliminamos las asociaciones existentes para esta convocatoria
  await connection.query(
    "DELETE FROM convocatoria_universidades WHERE convocatoria_id = ?",
    [convocatoriaId],
  );

  await connection.query(
    "DELETE FROM capacidad_universidad WHERE convocatoria_id = ?",
    [convocatoriaId],
  );

  // Si se proporcionó una lista de universidades con capacidades, insertamos las nuevas
  if (universidades && universidades.length > 0) {
    // Insertar en convocatoria_universidades (tabla de relación)
    const relationValues = universidades.map((uni) => [
      convocatoriaId,
      uni.id_universidad,
    ]);
    await connection.query(
      "INSERT INTO convocatoria_universidades (convocatoria_id, universidad_id) VALUES ?",
      [relationValues],
    );

    // Insertar en capacidad_universidad (tabla de capacidades)
    const capacityValues = universidades.map((uni) => [
      convocatoriaId,
      uni.id_universidad,
      uni.capacidad_maxima,
      0, // cupo_actual inicial en 0
    ]);
    await connection.query(
      "INSERT INTO capacidad_universidad (convocatoria_id, universidad_id, capacidad_maxima, cupo_actual) VALUES ?",
      [capacityValues],
    );
  }
};

// @desc    Obtener todas las convocatorias
// @route   GET /api/convocatorias
// @access  Public
const getAllConvocatorias = async (req, res) => {
  try {
    // Primero, actualizamos los estados basados en las fechas actuales
    const updateStatusesQuery = `
        UPDATE convocatorias
        SET estado = CASE
            WHEN estado IN ('cancelada', 'rechazada', 'llena') THEN estado
            WHEN CURDATE() > fecha_ejecucion_fin THEN 'finalizada'
            WHEN CURDATE() >= fecha_ejecucion_inicio THEN 'activa'
            WHEN fecha_revision_inicio IS NOT NULL AND fecha_revision_fin IS NOT NULL AND CURDATE() BETWEEN fecha_revision_inicio AND fecha_revision_fin THEN 'revision'
            WHEN CURDATE() BETWEEN fecha_aviso_inicio AND fecha_aviso_fin THEN 'aviso'
            ELSE 'planeada'
        END;
    `;
    await pool.query(updateStatusesQuery);

    // Luego, obtenemos todas las convocatorias con los estados ya actualizados
    const getQuery = `
      SELECT
          c.*,
          COALESCE((SELECT SUM(cu.capacidad_maxima) FROM capacidad_universidad cu WHERE cu.convocatoria_id = c.id), 0) as capacidad_maxima,
          COALESCE((SELECT SUM(cu.cupo_actual) FROM capacidad_universidad cu WHERE cu.convocatoria_id = c.id), 0) as cupo_actual,
          CASE
              WHEN COALESCE((SELECT SUM(cu2.cupo_actual) FROM capacidad_universidad cu2 WHERE cu2.convocatoria_id = c.id), 0) >= COALESCE((SELECT SUM(cu3.capacidad_maxima) FROM capacidad_universidad cu3 WHERE cu3.convocatoria_id = c.id), 1) THEN 1
              ELSE 0
          END as llena
      FROM convocatorias c
      ORDER BY c.fecha_ejecucion_inicio DESC;

    `;
    const [convocatorias] = await pool.query(getQuery);

    // Para cada convocatoria, obtener los detalles de sus universidades
    for (let convocatoria of convocatorias) {
      const [universidades] = await pool.query(
        `SELECT
          u.nombre,
          cu.capacidad_maxima,
          cu.cupo_actual
         FROM capacidad_universidad cu
         JOIN universidad u ON cu.universidad_id = u.id_universidad
         WHERE cu.convocatoria_id = ?`,
        [convocatoria.id],
      );
      convocatoria.universidades = universidades;
    }

    res.json(convocatorias);
  } catch (error) {
    console.error("Error al obtener las convocatorias:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener una convocatoria por ID
// @route   GET /api/convocatorias/:id
// @access  Public
const getConvocatoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [convocatorias] = await pool.query(
      "SELECT * FROM convocatorias WHERE id = ?",
      [id],
    );

    if (convocatorias.length === 0) {
      return res.status(404).json({ error: "Convocatoria no encontrada." });
    }

    const convocatoria = convocatorias[0];

    // Obtener las universidades asociadas con sus capacidades
    const [universidades] = await pool.query(
      `SELECT
                cu.universidad_id,
                cu.capacidad_maxima,
                cu.cupo_actual,
                u.nombre as nombre_universidad
             FROM capacidad_universidad cu
             JOIN universidad u ON cu.universidad_id = u.id_universidad
             WHERE cu.convocatoria_id = ?`,
      [id],
    );

    convocatoria.universidades = universidades;

    res.json(convocatoria);
  } catch (error) {
    console.error(`Error al obtener la convocatoria ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Crear una nueva convocatoria
// @route   POST /api/convocatorias
// @access  Private (SEDEQ)
const createConvocatoria = async (req, res) => {
  const {
    nombre,
    descripcion,
    fecha_aviso_inicio,
    fecha_aviso_fin,
    fecha_revision_inicio,
    fecha_revision_fin,
    fecha_ejecucion_inicio,
    fecha_ejecucion_fin,
    universidades,
  } = req.body;

  if (
    !nombre ||
    !fecha_aviso_inicio ||
    !fecha_aviso_fin ||
    !fecha_revision_inicio ||
    !fecha_revision_fin ||
    !fecha_ejecucion_inicio ||
    !fecha_ejecucion_fin ||
    !universidades ||
    !Array.isArray(universidades) ||
    universidades.length === 0
  ) {
    return res.status(400).json({
      error:
        "Todos los campos son obligatorios, y se debe seleccionar y asignar capacidad al menos a una universidad.",
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // El estado inicial siempre es 'planeada'
    const [result] = await connection.query(
      `INSERT INTO convocatorias (
                nombre, descripcion, estado,
                fecha_aviso_inicio, fecha_aviso_fin,
                fecha_revision_inicio, fecha_revision_fin,
                fecha_ejecucion_inicio, fecha_ejecucion_fin
            ) VALUES (?, ?, 'planeada', ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion,
        fecha_aviso_inicio,
        fecha_aviso_fin,
        fecha_revision_inicio || null,
        fecha_revision_fin || null,
        fecha_ejecucion_inicio,
        fecha_ejecucion_fin,
      ],
    );
    const newConvocatoriaId = result.insertId;

    await manageConvocatoriaUniversidades(
      connection,
      newConvocatoriaId,
      universidades,
    );

    await connection.commit();
    res.status(201).json({
      message: "Convocatoria creada con éxito",
      id: newConvocatoriaId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al crear la convocatoria:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Actualizar una convocatoria
// @route   PUT /api/convocatorias/:id
// @access  Private (SEDEQ)
const updateConvocatoria = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    estado, // Mantenemos estado para cambios manuales como 'cancelada'
    fecha_aviso_inicio,
    fecha_aviso_fin,
    fecha_revision_inicio,
    fecha_revision_fin,
    fecha_ejecucion_inicio,
    fecha_ejecucion_fin,
    universidades,
  } = req.body;

  if (
    !nombre ||
    !fecha_aviso_inicio ||
    !fecha_aviso_fin ||
    !fecha_revision_inicio ||
    !fecha_revision_fin ||
    !fecha_ejecucion_inicio ||
    !fecha_ejecucion_fin ||
    !estado ||
    !universidades ||
    !Array.isArray(universidades) ||
    universidades.length === 0
  ) {
    return res.status(400).json({
      error:
        "Todos los campos son obligatorios, y se debe seleccionar y asignar capacidad al menos a una universidad.",
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // No actualizamos el estado directamente a menos que sea un estado manual. La lógica de GET se encarga del resto.
    const [result] = await connection.query(
      `UPDATE convocatorias SET
                nombre = ?, descripcion = ?, estado = ?,
                fecha_aviso_inicio = ?, fecha_aviso_fin = ?,
                fecha_revision_inicio = ?, fecha_revision_fin = ?,
                fecha_ejecucion_inicio = ?, fecha_ejecucion_fin = ?
             WHERE id = ?`,
      [
        nombre,
        descripcion,
        estado,
        fecha_aviso_inicio,
        fecha_aviso_fin,
        fecha_revision_inicio || null,
        fecha_revision_fin || null,
        fecha_ejecucion_inicio,
        fecha_ejecucion_fin,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Convocatoria no encontrada." });
    }

    await manageConvocatoriaUniversidades(connection, id, universidades);

    await connection.commit();
    res.json({ message: "Convocatoria actualizada con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`Error al actualizar la convocatoria ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Eliminar una convocatoria
// @route   DELETE /api/convocatorias/:id
// @access  Private (SEDEQ)
const deleteConvocatoria = async (req, res) => {
  const { id } = req.params;
  try {
    // La FK con ON DELETE CASCADE se encargará de las tablas relacionadas
    const [result] = await pool.query(
      "DELETE FROM convocatorias WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Convocatoria no encontrada." });
    }

    res.json({ message: "Convocatoria eliminada con éxito." });
  } catch (error) {
    console.error(`Error al eliminar la convocatoria ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener el estado general de las convocatorias para el alumno logueado
// @route   GET /api/convocatorias/alumno/estado-general
// @access  Private (Alumno)
const getEstadoGeneralAlumno = async (req, res) => {
  const id_usuario = req.user.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ error: "No autorizado, ID de alumno no encontrado." });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Obtener los datos del alumno (id_alumno y id_universidad) usando el id_usuario del token
    const [alumnoData] = await connection.query(
      `SELECT
         a.id_alumno,
         a.id_universidad,
         u.nombre as nombre_universidad
       FROM alumno a
       JOIN universidad u ON a.id_universidad = u.id_universidad
       WHERE a.id_usuario = ?`,
      [id_usuario]
    );
    if (alumnoData.length === 0) {
      return res.status(404).json({ error: "Datos del alumno no encontrados." });
    }
    const { id_alumno, id_universidad, nombre_universidad } = alumnoData[0];
    const universidadDelAlumno = { id_universidad, nombre: nombre_universidad };

    // 2. Buscar convocatorias en las que el alumno fue aceptado y están en ejecución
    // Usamos el id_alumno correcto
    // NOTA: He añadido la comprobación de estado 'aceptada' que faltaba en la consulta anterior.
    const [convocatoriasEnEjecucion] = await connection.query(`
      SELECT c.*
      FROM convocatorias c
      JOIN solicitudes_convocatorias sc ON c.id = sc.convocatoria_id
      WHERE sc.alumno_id = ?
        AND sc.estado = 'aceptada'
        AND CURDATE() BETWEEN c.fecha_ejecucion_inicio AND c.fecha_ejecucion_fin
    `, [id_alumno]);

    let universidadesParticipantes = [];
    if (convocatoriasEnEjecucion.length > 0) {
      const idsConvocatoriasEnEjecucion = convocatoriasEnEjecucion.map(c => c.id);
      // Obtener una lista única de universidades de todas las convocatorias en ejecución
      const [universidades] = await connection.query(`
        SELECT DISTINCT u.id_universidad, u.nombre
        FROM universidad u
        JOIN convocatoria_universidades cu ON u.id_universidad = cu.universidad_id
        WHERE cu.convocatoria_id IN (?)
        ORDER BY u.nombre;
      `, [idsConvocatoriasEnEjecucion]);
      universidadesParticipantes = universidades;
    }

    // 3. Buscar convocatorias disponibles para aplicar
    // (En periodo de aviso, su universidad participa, y no ha aplicado aún)
    // Usamos el id_alumno correcto
    const [convocatoriasDisponibles] = await connection.query(`
      SELECT c.*
      FROM convocatorias c
      JOIN convocatoria_universidades cu ON c.id = cu.convocatoria_id
      WHERE cu.universidad_id = ?
        AND CURDATE() BETWEEN c.fecha_aviso_inicio AND c.fecha_aviso_fin
        AND c.id NOT IN (SELECT convocatoria_id FROM solicitudes_convocatorias WHERE alumno_id = ?)
      ORDER BY c.fecha_aviso_fin ASC;
    `, [id_universidad, id_alumno]);

    // 4. Buscar solicitudes pendientes o rechazadas
    // Usamos el id_alumno correcto
    const [solicitudesPasadas] = await connection.query(`
      SELECT c.id as convocatoria_id, c.nombre, sc.estado
      FROM solicitudes_convocatorias sc
      JOIN convocatorias c ON sc.convocatoria_id = c.id
      WHERE sc.alumno_id = ? AND sc.estado IN ('solicitada', 'rechazada')
    `, [id_alumno]);

    // 5. Obtener TODAS las solicitudes del alumno para la tabla "Mis Convocatorias"
    const [solicitudesDelAlumno] = await connection.query(`
      SELECT
        sc.id, c.id as convocatoria_id,
        c.nombre AS convocatoria_nombre,
        sc.estado,
        sc.fecha_solicitud,
        c.fecha_ejecucion_fin
      FROM solicitudes_convocatorias sc
      JOIN convocatorias c ON sc.convocatoria_id = c.id
      WHERE sc.alumno_id = ?
      ORDER BY sc.fecha_solicitud DESC
    `, [id_alumno]);

    // 6. Para cada solicitud, obtener las universidades participantes
    for (let solicitud of solicitudesDelAlumno) {
        const [universidadesParticipantes] = await connection.query(`
            SELECT u.nombre
            FROM convocatoria_universidades cu
            JOIN universidad u ON cu.universidad_id = u.id_universidad
            WHERE cu.convocatoria_id = ?
        `, [solicitud.convocatoria_id]);
        
        // Asignamos la lista de nombres de universidades a la solicitud
        solicitud.universidades_participantes = universidadesParticipantes.map(u => u.nombre);
    }

    res.json({
      universidadDelAlumno, // <-- AÑADIDO: Devolvemos la universidad del alumno
      convocatoriasEnEjecucion,
      universidadesParticipantes,
      convocatoriasDisponibles,
      solicitudesDelAlumno // Devolvemos la lista completa y unificada
    });

  } catch (error) {
    console.error("Error en getEstadoGeneralAlumno:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Alumno solicita inscripción a una convocatoria
// @route   POST /api/convocatorias/:id/solicitar
// @access  Private (Alumno)
const solicitarInscripcionConvocatoria = async (req, res) => {
    const { id: convocatoria_id } = req.params;
    const id_usuario = req.user.id_usuario;

    if (!id_usuario) {
        return res.status(401).json({ error: "No autorizado, ID de alumno no encontrado." });
    }

    // Primero, necesitamos obtener el id_alumno a partir del id_usuario
    const [alumnoData] = await pool.query(
      "SELECT id_alumno FROM alumno WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumnoData.length === 0) {
        return res.status(404).json({ error: "Perfil de alumno no encontrado." });
    }
    const id_alumno = alumnoData[0].id_alumno;

    try {
        // Verificar que la convocatoria existe y está en periodo de aviso
        const [convocatorias] = await pool.query(
            "SELECT * FROM convocatorias WHERE id = ? AND CURDATE() BETWEEN fecha_aviso_inicio AND fecha_aviso_fin",
            [convocatoria_id]
        );

        if (convocatorias.length === 0) {
            return res.status(404).json({ error: "Convocatoria no encontrada o fuera del periodo de solicitud." });
        }

        // Insertar la solicitud
        const [result] = await pool.query(
            "INSERT INTO solicitudes_convocatorias (convocatoria_id, alumno_id, estado) VALUES (?, ?, 'solicitada')",
            [convocatoria_id, id_alumno]
        );

        res.status(201).json({ message: "Solicitud de inscripción a la convocatoria enviada con éxito.", solicitudId: result.insertId });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Ya has solicitado la inscripción a esta convocatoria." });
        }
        console.error("Error al solicitar inscripción a convocatoria:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// @desc    Obtener todas las solicitudes de todas las convocatorias
// @route   GET /api/convocatorias/solicitudes/all
// @access  Private (SEDEQ)
const getAllSolicitudes = async (req, res) => {
  try {
    const query = `
      SELECT
        sc.id,
        sc.convocatoria_id,
        sc.alumno_id,
        sc.estado,
        sc.fecha_solicitud,
        c.nombre AS convocatoria_nombre,
        u_alumno.id_universidad AS id_universidad_alumno,
        u_alumno.nombre AS universidad_nombre,
        a.nombre_completo AS alumno_nombre,
        usr.email AS alumno_email
      FROM solicitudes_convocatorias sc
      JOIN convocatorias c ON sc.convocatoria_id = c.id
      JOIN alumno a ON sc.alumno_id = a.id_alumno
      JOIN usuario usr ON a.id_usuario = usr.id_usuario
      JOIN universidad u_alumno ON a.id_universidad = u_alumno.id_universidad
      ORDER BY sc.fecha_solicitud DESC;
    `;

    const [solicitudes] = await pool.query(query);

    if (solicitudes.length === 0) {
      return res.json({ solicitudes: [] });
    }

    res.json({ solicitudes });

  } catch (error) {
    console.error("Error al obtener todas las solicitudes:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Actualizar el estado de una solicitud de convocatoria
// @route   PUT /api/convocatorias/solicitudes/:id
// @access  Private (SEDEQ)
const updateSolicitudStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  console.log('=== INICIO updateSolicitudStatus ===');
  console.log('ID:', id);
  console.log('Estado:', estado);
  console.log('=================================');

  if (!estado || !['aceptada', 'rechazada'].includes(estado)) {
    console.log('ERROR: Estado inválido');
    return res.status(400).json({ error: "El estado proporcionado no es válido. Debe ser 'aceptada' o 'rechazada'." });
  }

  let connection;
  try {
    console.log('1. Obteniendo conexión...');
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log('2. Conexión obtenida y transacción iniciada');

    // 1. Obtener la solicitud y el cupo actual de la universidad
    console.log('3. Ejecutando primera query...');
    const query1 = `SELECT sc.convocatoria_id, a.id_universidad
       FROM solicitudes_convocatorias sc
       JOIN alumno a ON sc.alumno_id = a.id_alumno
       WHERE sc.id = ? AND sc.estado = 'solicitada'`;
    console.log('Query 1:', query1);
    console.log('Params 1:', [id]);
    
    const [solicitudes] = await connection.query(query1, [id]);
    console.log('4. Resultado primera query:', solicitudes);

    if (solicitudes.length === 0) {
      console.log('ERROR: Solicitud no encontrada');
      await connection.rollback();
      return res.status(404).json({ error: "Solicitud no encontrada o ya ha sido procesada." });
    }

    const { convocatoria_id, id_universidad } = solicitudes[0];
    console.log('5. Datos extraídos:', { convocatoria_id, id_universidad });

    // 2. Si se acepta, verificar y actualizar el cupo
    if (estado === 'aceptada') {
      console.log('6. Estado es aceptada, verificando capacidad...');
      
      const query2 = `SELECT cupo_actual, capacidad_maxima FROM capacidad_universidad WHERE convocatoria_id = ? AND universidad_id = ? FOR UPDATE`;
      console.log('Query 2:', query2);
      console.log('Params 2:', [convocatoria_id, id_universidad]);
      
      const [capacidadData] = await connection.query(query2, [convocatoria_id, id_universidad]);
      console.log('7. Resultado segunda query:', capacidadData);

      if (capacidadData.length === 0 || capacidadData[0].cupo_actual >= capacidadData[0].capacidad_maxima) {
        console.log('ERROR: No hay cupo disponible');
        await connection.rollback();
        return res.status(409).json({ error: "No hay cupo disponible en la universidad para esta convocatoria." });
      }

      // Incrementar el cupo
      console.log('8. Incrementando cupo...');
      const query3 = `UPDATE capacidad_universidad SET cupo_actual = cupo_actual + 1 WHERE convocatoria_id = ? AND universidad_id = ?`;
      console.log('Query 3:', query3);
      console.log('Params 3:', [convocatoria_id, id_universidad]);
      
      await connection.query(query3, [convocatoria_id, id_universidad]);
      console.log('9. Cupo incrementado exitosamente');
    }

    // 3. Actualizar el estado de la solicitud
    console.log('10. Actualizando estado de solicitud...');
    const query4 = "UPDATE solicitudes_convocatorias SET estado = ? WHERE id = ?";
    console.log('Query 4:', query4);
    console.log('Params 4:', [estado, id]);
    
    await connection.query(query4, [estado, id]);
    console.log('11. Estado actualizado exitosamente');

    await connection.commit();
    console.log('12. Transacción confirmada');
    
    res.json({ message: `Solicitud ${estado} con éxito.` });
    console.log('=== FIN updateSolicitudStatus EXITOSO ===');

  } catch (error) {
    console.log('=== ERROR EN updateSolicitudStatus ===');
    console.log('Error completo:', error);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Error sql:', error.sql);
    console.log('====================================');
    
    if (connection) await connection.rollback();
    console.error(`Error al actualizar estado de la solicitud ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (connection) connection.release();
    console.log('Conexión liberada');
  }
};

module.exports = {
  getAllConvocatorias,
  getConvocatoriaById,
  createConvocatoria,
  updateConvocatoria,
  deleteConvocatoria,
  getEstadoGeneralAlumno,
  solicitarInscripcionConvocatoria,
  getAllSolicitudes,
  updateSolicitudStatus,
};
