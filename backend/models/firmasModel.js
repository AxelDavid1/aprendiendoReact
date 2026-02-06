const db = require("../config/db");

const Firmas = {
  create: async (tipo_firma, imagen_blob, id_universidad = null) => {
    const [result] = await db.execute(
      "INSERT INTO firmas (tipo_firma, imagen_blob, id_universidad) VALUES (?, ?, ?)",
      [tipo_firma, imagen_blob, id_universidad],
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT f.id_firma, f.tipo_firma, f.id_universidad, f.imagen_blob, f.fecha_subida,
             u.nombre as nombre_universidad, u.logo_url as logo_universidad
      FROM firmas f
      LEFT JOIN universidad u ON f.id_universidad = u.id_universidad
      ORDER BY f.fecha_subida DESC
    `);
    return rows;
  },

  // Encuentra todas las firmas de SEDEQ y las específicas de una universidad
  findForUniversity: async (id_universidad) => {
    const [rows] = await db.execute(
      `
      SELECT f.id_firma, f.tipo_firma, f.id_universidad, f.imagen_blob, f.fecha_subida,
             u.nombre as nombre_universidad, u.logo_url as logo_universidad
      FROM firmas f
      LEFT JOIN universidad u ON f.id_universidad = u.id_universidad
      WHERE f.tipo_firma = 'sedeq' OR f.id_universidad = ?
      ORDER BY f.fecha_subida DESC
    `,
      [id_universidad],
    );
    return rows;
  },

  // Encuentra solo las firmas de una universidad (para galería, sin SEDEQ)
  findForUniversityGallery: async (id_universidad) => {
    const [rows] = await db.execute(
      `
      SELECT f.id_firma, f.tipo_firma, f.id_universidad, f.imagen_blob, f.fecha_subida,
             u.nombre as nombre_universidad, u.logo_url as logo_universidad
      FROM firmas f
      LEFT JOIN universidad u ON f.id_universidad = u.id_universidad
      WHERE f.id_universidad = ?
      ORDER BY f.fecha_subida DESC
      `,
      [id_universidad],
    );
    return rows;
  },

  findById: async (id_firma) => {
    const [rows] = await db.execute("SELECT * FROM firmas WHERE id_firma = ?", [
      id_firma,
    ]);
    return rows[0];
  },

  // Devuelve la firma mas reciente de un tipo para una universidad especifica
  findLatestByTipo: async (tipo_firma, id_universidad) => {
    let query = "SELECT imagen_blob FROM firmas WHERE tipo_firma = ?";
    const params = [tipo_firma];

    if (id_universidad) {
      query += " AND id_universidad = ?";
      params.push(id_universidad);
    }

    query += " ORDER BY fecha_subida DESC LIMIT 1";

    const [rows] = await db.execute(query, params);
    return rows[0];
  },

  remove: async (id_firma) => {
    const [result] = await db.execute("DELETE FROM firmas WHERE id_firma = ?", [
      id_firma,
    ]);
    return result.affectedRows;
  },

  // Verificar si existe una firma del mismo tipo para una universidad
  findExisting: async (tipo_firma, id_universidad = null) => {
    let query =
      "SELECT id_firma, fecha_subida FROM firmas WHERE tipo_firma = ?";
    const params = [tipo_firma];

    if (id_universidad) {
      query += " AND id_universidad = ?";
      params.push(id_universidad);
    } else {
      query += " AND id_universidad IS NULL";
    }

    query += " LIMIT 1";

    const [rows] = await db.execute(query, params);
    return rows[0] || null;
  },

  // Eliminar firma existente del mismo tipo antes de crear una nueva
  removeExisting: async (tipo_firma, id_universidad = null) => {
    let query = "DELETE FROM firmas WHERE tipo_firma = ?";
    const params = [tipo_firma];

    if (id_universidad) {
      query += " AND id_universidad = ?";
      params.push(id_universidad);
    } else {
      query += " AND id_universidad IS NULL";
    }

    const [result] = await db.execute(query, params);
    return result.affectedRows;
  },
};

module.exports = Firmas;
