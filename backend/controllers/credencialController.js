// backend/controllers/credencialController.js
const pool = require("../config/db");

// Función auxiliar para manejar la relación muchos-a-muchos con cursos
const manageCursosInCredencial = async (
  connection,
  id_certificacion,
  cursos,
) => {
  // Eliminar las asociaciones de cursos anteriores para esta certificación
  await connection.query(
    "DELETE FROM requisitos_certificado WHERE id_certificacion = ?",
    [id_certificacion],
  );

  // Si se proporcionó una lista de cursos, inserta las nuevas asociaciones
  if (cursos && cursos.length > 0) {
    // Validar que ningún curso esté ya asignado a otra credencial
    const cursosIds = cursos.join(",");
    const [existingAssignments] = await connection.query(
        `SELECT rc.id_curso, c.nombre_curso
        FROM requisitos_certificado rc
        JOIN curso c ON rc.id_curso = c.id_curso
        WHERE rc.id_curso IN (${cursosIds}) AND rc.id_certificacion != ?`,
      [id_certificacion],
    );

    if (existingAssignments.length > 0) {
      const cursosEnUso = existingAssignments
        .map((curso) => curso.nombre_curso)
        .join(", ");
      throw new Error(
        `Error: Los siguientes cursos ya están en uso: ${cursosEnUso}`,
      );
    }

    const cursosValues = cursos.map((id_curso) => [
      id_certificacion,
      id_curso,
      true,
    ]);

    try {
      await connection.query(
        "INSERT INTO requisitos_certificado (id_certificacion, id_curso, obligatorio) VALUES ?",
        [cursosValues],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(
          "Error: Uno o más cursos ya están asignados a otra credencial",
        );
      }
      throw error;
    }
  }
};

// @desc    Obtener todas las credenciales con paginación y filtros
// @route   GET /api/credenciales
const getAllCredenciales = async (req, res) => {
  // Soportar ambos parámetros: id_universidad (singular) y universidades (plural)
  const {
    page = 1, limit = 10, searchTerm = "",
    universidades,
    id_universidad
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let queryParams = [];

    let joinClauses = `
            LEFT JOIN universidad u ON cr.id_universidad = u.id_universidad
            LEFT JOIN facultades f ON cr.id_facultad = f.id_facultad
            `;

    if (searchTerm) {
      whereClauses.push("cr.nombre LIKE ?");
      queryParams.push(`%${searchTerm}%`);
    }

    // **CAMBIO CLAVE: Soportar ambos parámetros**
    const universidadFilter = id_universidad || universidades;
    if (universidadFilter) {
      const uniIds = universidadFilter.split(',').map(id => parseInt(id.trim(), 10));
      if (uniIds.length > 0) {
        // Usamos el alias 'cr' para la tabla certificacion
        whereClauses.push(`cr.id_universidad IN (?)`);
        queryParams.push(uniIds);
      }
    }

    const whereString =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(DISTINCT cr.id_certificacion) as total FROM certificacion cr ${whereString}`;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalCredenciales = countResult[0].total;
    const totalPages = Math.ceil(totalCredenciales / limit);

    const dataQuery = `
      SELECT
        cr.id_certificacion as id_credencial,
        cr.nombre as nombre_credencial,
        cr.estatus,
        cr.descripcion,
        cr.imagen_url,
        cr.fecha_creacion,
        cr.id_universidad,
        u.nombre as nombre_universidad,
        f.nombre as nombre_facultad,
        COUNT(DISTINCT rc.id_curso) as num_cursos,
        GROUP_CONCAT(DISTINCT cat.nombre_categoria SEPARATOR ', ') as categorias
      FROM certificacion cr
      ${joinClauses}
      LEFT JOIN requisitos_certificado rc ON cr.id_certificacion = rc.id_certificacion
      LEFT JOIN curso c ON rc.id_curso = c.id_curso
      LEFT JOIN categoria_curso cat ON c.id_categoria = cat.id_categoria
      ${whereString}
      GROUP BY cr.id_certificacion
      ORDER BY cr.nombre ASC
      LIMIT ? OFFSET ?
    `;

    const [credenciales] = await pool.query(dataQuery, [
      ...queryParams,
      parseInt(limit),
      parseInt(offset),
    ]);

    // Procesar la cadena de categorías en un array y mantener la compatibilidad
    const credencialesProcesadas = credenciales.map((cred) => ({
      ...cred,
      // La consulta devuelve una cadena "Cat1, Cat2", la convertimos en array
      // y filtramos valores nulos o vacíos que puedan colarse.
      categorias: cred.categorias ? cred.categorias.split(', ').filter(c => c && c !== 'null') : [],
      cursos: Array(parseInt(cred.num_cursos)).fill(null),
    }));

    res.json({
      credenciales: credencialesProcesadas,
      totalPages,
      currentPage: parseInt(page),
      total: totalCredenciales,
    });
  } catch (error) {
    console.error("Error al obtener las credenciales:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener credenciales." });
  }
};

// @desc    Obtener una credencial por su ID
// @route   GET /api/credenciales/:id
const getCredencialById = async (req, res) => {
  const { id } = req.params;
  try {
    const [credenciales] = await pool.query(
      `
      SELECT
        cr.*,
        u.nombre as nombre_universidad,
        f.nombre as nombre_facultad
      FROM certificacion cr
      LEFT JOIN universidad u ON cr.id_universidad = u.id_universidad
      LEFT JOIN facultades f ON cr.id_facultad = f.id_facultad
      WHERE cr.id_certificacion = ?
      `,
      [id],
    );
    if (credenciales.length === 0) {
      return res.status(404).json({ error: "Credencial no encontrada." });
    }
    const credencial = credenciales[0];

    // Parsear ajustes si existen
    if (credencial.imagen_ajustes) {
      try {
        credencial.imagen_ajustes = typeof credencial.imagen_ajustes === 'string' 
          ? JSON.parse(credencial.imagen_ajustes) 
          : credencial.imagen_ajustes;
      } catch (e) {
        console.warn('⚠️ Error al parsear imagen_ajustes de credencial:', e);
        credencial.imagen_ajustes = {};
      }
    } else {
      credencial.imagen_ajustes = {};
    }

    // Obtener los cursos asociados
    const [cursos] = await pool.query(
      `
            SELECT
                c.id_curso,
                c.nombre_curso,
                c.duracion_horas,
                cat.nombre_categoria
            FROM requisitos_certificado rc
            JOIN curso c ON rc.id_curso = c.id_curso
            LEFT JOIN categoria_curso cat ON c.id_categoria = cat.id_categoria
            WHERE rc.id_certificacion = ?
        `,
      [id],
    );

    // Mapear los campos para compatibilidad con el frontend
    const credentialResponse = {
      ...credencial,
      id_credencial: credencial.id_certificacion, // Aseguramos compatibilidad
      nombre_credencial: credencial.nombre, // Aseguramos compatibilidad
      cursos: cursos,
    };

    res.json(credentialResponse);
  } catch (error) {
    console.error(`Error al obtener la credencial ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Crear una nueva credencial
// @route   POST /api/credenciales
const createCredencial = async (req, res) => {
  const {
    nombre_credencial,
    descripcion,
    id_universidad,
    id_facultad,
    cursos,
    imagen_url, imagen_original_url, imagen_ajustes
  } = req.body;

  if (!nombre_credencial) {
    return res
      .status(400)
      .json({ error: "El nombre de la credencial es obligatorio." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      "INSERT INTO certificacion (nombre, descripcion, id_universidad, id_facultad, imagen_url, imagen_original_url, imagen_ajustes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nombre_credencial,
        descripcion,
        id_universidad || null,
        id_facultad || null,
        imagen_url || null,
        imagen_original_url || null,
        imagen_ajustes ? (typeof imagen_ajustes === 'string' ? imagen_ajustes : JSON.stringify(imagen_ajustes)) : null,
      ],
    );
    const newCredencialId = result.insertId;

    await manageCursosInCredencial(connection, newCredencialId, cursos);

    await connection.commit();
    res.status(201).json({
      message: "Credencial creada con éxito",
      id_credencial: newCredencialId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al crear la credencial:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al crear la credencial." });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Actualizar una credencial
// @route   PUT /api/credenciales/:id
const updateCredencial = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_credencial,
    descripcion,
    id_universidad,
    id_facultad,
    cursos,
    imagen_url, imagen_original_url, imagen_ajustes
  } = req.body;

  if (!nombre_credencial) {
    return res
      .status(400)
      .json({ error: "El nombre de la credencial es obligatorio." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      "UPDATE certificacion SET nombre = ?, descripcion = ?, id_universidad = ?, id_facultad = ?, imagen_url = ?, imagen_original_url = ?, imagen_ajustes = ? WHERE id_certificacion = ?",
      [
        nombre_credencial,
        descripcion,
        id_universidad || null,
        id_facultad || null,
        imagen_url || null,
        imagen_original_url || null,
        imagen_ajustes ? (typeof imagen_ajustes === 'string' ? imagen_ajustes : JSON.stringify(imagen_ajustes)) : null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Credencial no encontrada." });
    }

    await manageCursosInCredencial(connection, id, cursos);

    await connection.commit();
    res.json({ message: "Credencial actualizada con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`Error al actualizar la credencial ${id}:`, error);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la credencial.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Eliminar una credencial
// @route   DELETE /api/credenciales/:id
const deleteCredencial = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Eliminar primero las referencias en la tabla pivote
    await connection.query(
      "DELETE FROM requisitos_certificado WHERE id_certificacion = ?",
      [id],
    );

    // Luego eliminar la certificación
    const [result] = await connection.query(
      "DELETE FROM certificacion WHERE id_certificacion = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Credencial no encontrada." });
    }

    await connection.commit();
    res.json({ message: "Credencial eliminada con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`Error al eliminar la credencial ${id}:`, error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al eliminar la credencial." });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getAllCredenciales,
  getCredencialById,
  createCredencial,
  updateCredencial,
  deleteCredencial,
};
