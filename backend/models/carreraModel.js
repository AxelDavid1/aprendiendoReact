const db = require("../config/db");

const Carrera = {
  /**
   * Crea una nueva carrera en la base de datos.
   * @param {object} newCarrera - Objeto con los datos de la carrera.
   * @returns {Promise<object>} - El objeto de la carrera creada.
   */
  create: async (newCarrera) => {
    const query =
      "INSERT INTO carreras (id_facultad, nombre, clave_carrera, duracion_periodos) VALUES (?, ?, ?, ?)";
    try {
      const [result] = await db.query(query, [
        newCarrera.id_facultad,
        newCarrera.nombre,
        newCarrera.clave_carrera,
        newCarrera.duracion_periodos,
      ]);
      return { id_carrera: result.insertId, ...newCarrera };
    } catch (err) {
      console.error("Error al crear la carrera:", err);
      throw err;
    }
  },

  /**
   * Busca todas las carreras de una facultad específica.
   * @param {number} facultadId - ID de la facultad.
   * @returns {Promise<Array>} - Un array de carreras.
   */
  findByFacultadId: async (facultadId) => {
    const query =
      "SELECT * FROM carreras WHERE id_facultad = ? ORDER BY nombre ASC";
    try {
      const [results] = await db.query(query, [facultadId]);
      return results;
    } catch (err) {
      console.error("Error al buscar carreras por ID de facultad:", err);
      throw err;
    }
  },

  /**
   * Actualiza una carrera existente.
   * @param {number} id_carrera - ID de la carrera a actualizar.
   * @param {object} carreraData - Datos a actualizar.
   * @returns {Promise<object>} - El resultado de la actualización.
   */
  update: async (id_carrera, carreraData) => {
    const query =
      "UPDATE carreras SET nombre = ?, clave_carrera = ?, duracion_periodos = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_carrera = ?";
    try {
      const [result] = await db.query(query, [
        carreraData.nombre,
        carreraData.clave_carrera,
        carreraData.duracion_periodos,
        id_carrera,
      ]);
      return result;
    } catch (err) {
      console.error("Error al actualizar la carrera:", err);
      throw err;
    }
  },

  /**
   * Elimina una carrera de la base de datos.
   * @param {number} id_carrera - ID de la carrera a eliminar.
   * @returns {Promise<object>} - El resultado de la eliminación.
   */
  remove: async (id_carrera) => {
    const query = "DELETE FROM carreras WHERE id_carrera = ?";
    try {
      const [result] = await db.query(query, [id_carrera]);
      return result;
    } catch (err) {
      console.error("Error al eliminar la carrera:", err);
      throw err;
    }
  },
};

module.exports = Carrera;