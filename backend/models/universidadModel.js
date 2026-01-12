const pool = require("../config/db");

class Universidad {
  /**
   * Creates a new university in the database. Designed to be used within a transaction.
   * @param {object} universityData - The data for the new university.
   * @param {object} connection - The database connection object from the transaction.
   * @returns {Promise<{id_universidad: number}>} An object containing the new university's ID.
   */
  static async create(
    {
      nombre,
      clave_universidad,
      direccion,
      telefono,
      email_contacto,
      ubicacion,
      logo_url,
    },
    connection,
  ) {
    const [result] = await connection.execute(
      "INSERT INTO universidad (nombre, clave_universidad, direccion, telefono, email_contacto, ubicacion, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nombre,
        clave_universidad,
        direccion,
        telefono,
        email_contacto,
        ubicacion,
        logo_url,
      ],
    );
    return { id_universidad: result.insertId };
  }

  /**
   * Finds all universities with pagination, search, and the admin's email.
   * ✅ CORREGIDO: Ahora soporta limit = null para obtener TODAS las universidades
   * @returns {Promise<object>} An object containing the list of universities and pagination info.
   */
  static async findAll({ searchTerm = "", page = 1, limit = 10 }) {
    const searchTermWildcard = `%${searchTerm}%`;
    
    // ✅ Si limit es null, no aplicar límite ni offset
    let query;
    let queryParams;
    
    if (limit === null) {
      // Sin límite - obtener TODAS las universidades
      query = `
        SELECT
          uni.*,
          usr.email AS email_admin
        FROM universidad uni
        LEFT JOIN usuario usr ON uni.id_universidad = usr.id_universidad AND usr.tipo_usuario = 'admin_universidad'
        WHERE uni.nombre LIKE ? OR uni.ubicacion LIKE ?
        ORDER BY uni.nombre ASC`;
      
      queryParams = [searchTermWildcard, searchTermWildcard];
    } else {
      // Con límite - paginación normal
      const offset = (page - 1) * limit;
      
      query = `
        SELECT
          uni.*,
          usr.email AS email_admin
        FROM universidad uni
        LEFT JOIN usuario usr ON uni.id_universidad = usr.id_universidad AND usr.tipo_usuario = 'admin_universidad'
        WHERE uni.nombre LIKE ? OR uni.ubicacion LIKE ?
        ORDER BY uni.nombre ASC
        LIMIT ? OFFSET ?`;
      
      queryParams = [searchTermWildcard, searchTermWildcard, limit, offset];
    }

    const [rows] = await pool.execute(query, queryParams);

    // Obtener el total de universidades
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM universidad uni WHERE uni.nombre LIKE ? OR uni.ubicacion LIKE ?`,
      [searchTermWildcard, searchTermWildcard],
    );

    return {
      universities: rows,
      total,
      page: Number(page),
      totalPages: limit === null ? 1 : Math.ceil(total / limit),
    };
  }

  /**
   * Finds a single university by its ID, including the admin's email.
   * @param {number} id - The ID of the university.
   * @returns {Promise<object|null>} The university object or null if not found.
   */
  static async findById(id) {
    const query = `
      SELECT
        uni.*,
        usr.email AS email_admin
      FROM universidad uni
      LEFT JOIN usuario usr ON uni.id_universidad = usr.id_universidad AND usr.tipo_usuario = 'admin_universidad'
      WHERE uni.id_universidad = ?`;

    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Updates a university's data. Designed to be used within a transaction.
   * @param {number} id - The ID of the university to update.
   * @param {object} universityData - The new data for the university.
   * @param {object} connection - The database connection object from the transaction.
   * @returns {Promise<object>} The result of the update operation.
   */
  static async update(id, universityData, connection) {
    const fields = Object.keys(universityData).filter(
      (key) => universityData[key] !== undefined,
    );
    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    const valuePlaceholders = fields
      .map((field) => `\`${field}\` = ?`)
      .join(", ");
    const values = [...fields.map((field) => universityData[field]), id];

    const sql = `UPDATE universidad SET ${valuePlaceholders} WHERE id_universidad = ?`;

    const [result] = await connection.execute(sql, values);
    return result;
  }

  /**
   * Deletes a university by its ID.
   * The related user is handled by ON DELETE SET NULL in the DB.
   * @param {number} id - The ID of the university to delete.
   * @returns {Promise<object>} The result of the delete operation.
   */
  static async remove(id) {
    const [result] = await pool.execute(
      "DELETE FROM universidad WHERE id_universidad = ?",
      [id],
    );
    return result;
  }
}

module.exports = Universidad;