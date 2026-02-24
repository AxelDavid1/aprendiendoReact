const pool = require("../config/db");

class Empresa {
  static async create({ nombre, sector, web_url, descripcion, logo_url }, connection) {
    const query = "INSERT INTO empresa (nombre, sector, web_url, descripcion, logo_url) VALUES (?, ?, ?, ?, ?)";
    const values = [nombre, sector, web_url, descripcion, logo_url];

    const [result] = await (connection || pool).execute(query, values);
    return { id_empresa: result.insertId };
  }

  static async findAll({ searchTerm = "", page = 1, limit = 10 }) {
    const searchTermWildcard = `%${searchTerm}%`;

    let query;
    let queryParams;

    if (limit === null) {
      query = `
        SELECT e.*, usr.email AS email_admin
        FROM empresa e
        LEFT JOIN usuario usr ON e.id_empresa = usr.id_empresa AND usr.tipo_usuario = 'admin_empresa'
        WHERE e.nombre LIKE ? OR e.sector LIKE ?
        ORDER BY e.nombre ASC
      `;
      queryParams = [searchTermWildcard, searchTermWildcard];
    } else {
      const offset = (page - 1) * limit;
      query = `
        SELECT e.*, usr.email AS email_admin
        FROM empresa e
        LEFT JOIN usuario usr ON e.id_empresa = usr.id_empresa AND usr.tipo_usuario = 'admin_empresa'
        WHERE e.nombre LIKE ? OR e.sector LIKE ?
        ORDER BY e.nombre ASC
        LIMIT ? OFFSET ?
      `;
      queryParams = [searchTermWildcard, searchTermWildcard, parseInt(limit), offset];
    }

    const [rows] = await pool.execute(query, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM empresa e
      LEFT JOIN usuario usr ON e.id_empresa = usr.id_empresa AND usr.tipo_usuario = 'admin_empresa'
      WHERE e.nombre LIKE ? OR e.sector LIKE ?
    `;

    const [[{ total }]] = await pool.execute(countQuery, [searchTermWildcard, searchTermWildcard]);

    return {
      empresas: rows,
      total,
      page: Number(page),
      totalPages: limit === null ? 1 : Math.ceil(total / limit),
    };
  }

  static async findById(id) {
    const query = `
      SELECT e.*, usr.email AS email_admin
      FROM empresa e
      LEFT JOIN usuario usr ON e.id_empresa = usr.id_empresa AND usr.tipo_usuario = 'admin_empresa'
      WHERE e.id_empresa = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async update(id, updateData, connection) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return { affectedRows: 0 };

    values.push(id);
    const query = `UPDATE empresa SET ${fields.join(", ")} WHERE id_empresa = ?`;
    
    const [result] = await (connection || pool).execute(query, values);
    return { affectedRows: result.affectedRows };
  }

  static async delete(id, connection) {
    // Delete the admin user first due to foreign key constraints if they exist
    const deleteUserQuery = "DELETE FROM usuario WHERE id_empresa = ? AND tipo_usuario = 'admin_empresa'";
    await (connection || pool).execute(deleteUserQuery, [id]);

    const deleteEmpresaQuery = "DELETE FROM empresa WHERE id_empresa = ?";
    await (connection || pool).execute(deleteEmpresaQuery, [id]);
  }
}

module.exports = Empresa;
