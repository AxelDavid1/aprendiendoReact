const pool = require("../config/db");

// @desc    Obtener subgrupos de una habilidad clave
// @route   GET /api/habilidades-clave/:id/subgrupos
const getHabilidadSubgrupos = async (req, res) => {
  const { id } = req.params;
  try {
    const [subgrupos] = await pool.query(
      `SELECT so.* FROM subgrupos_operadores so
       INNER JOIN subgrupo_habilidades sh ON so.id_subgrupo = sh.id_subgrupo
       WHERE sh.id_habilidad = ? ORDER BY so.nombre_subgrupo ASC`,
      [id]
    );
    res.json(subgrupos);
  } catch (error) {
    console.error(`Error al obtener subgrupos de la habilidad ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener subgrupos disponibles para una habilidad (los que no están asignados)
// @route   GET /api/habilidades-clave/:id/subgrupos-disponibles
const getAvailableSubgruposForHabilidad = async (req, res) => {
  const { id } = req.params;
  try {
    const [subgrupos] = await pool.query(
      `SELECT so.* FROM subgrupos_operadores so
       LEFT JOIN subgrupo_habilidades sh ON so.id_subgrupo = sh.id_subgrupo AND sh.id_habilidad = ?
       WHERE sh.id_subgrupo IS NULL ORDER BY so.nombre_subgrupo ASC`,
      [id]
    );
    res.json(subgrupos);
  } catch (error) {
    console.error(`Error al obtener subgrupos disponibles para habilidad ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Agregar subgrupo a una habilidad clave
// @route   POST /api/habilidades-clave/:id/subgrupos
const addSubgrupoToHabilidad = async (req, res) => {
  const { id } = req.params;
  const { id_subgrupo } = req.body;
  
  if (!id_subgrupo) {
    return res.status(400).json({ error: "El ID del subgrupo es requerido." });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO subgrupo_habilidades (id_subgrupo, id_habilidad) VALUES (?, ?)",
      [id_subgrupo, id]
    );
    res.status(201).json({ message: "Subgrupo agregado a la habilidad con éxito" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El subgrupo ya está asignado a esta habilidad." });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "El subgrupo o la habilidad no existen." });
    }
    console.error("Error al agregar subgrupo a la habilidad:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Eliminar subgrupo de una habilidad clave
// @route   DELETE /api/habilidades-clave/:id/subgrupos/:idSubgrupo
const removeSubgrupoFromHabilidad = async (req, res) => {
  const { id, idSubgrupo } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM subgrupo_habilidades WHERE id_habilidad = ? AND id_subgrupo = ?",
      [id, idSubgrupo]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "El subgrupo no está asignado a esta habilidad." });
    }
    res.json({ message: "Subgrupo eliminado de la habilidad con éxito" });
  } catch (error) {
    console.error("Error al eliminar subgrupo de la habilidad:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener todas las habilidades clave
// @route   GET /api/habilidades-clave
const getAllHabilidades = async (req, res) => {
  try {
    const [habilidades] = await pool.query("SELECT * FROM habilidades_clave ORDER BY nombre_habilidad ASC");
    res.json(habilidades);
  } catch (error) {
    console.error("Error al obtener habilidades clave:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener una habilidad clave por ID
// @route   GET /api/habilidades-clave/:id
const getHabilidadById = async (req, res) => {
  const { id } = req.params;
  try {
    const [habilidades] = await pool.query("SELECT * FROM habilidades_clave WHERE id_habilidad = ?", [id]);
    if (habilidades.length === 0) {
      return res.status(404).json({ error: "Habilidad clave no encontrada." });
    }
    res.json(habilidades[0]);
  } catch (error) {
    console.error(`Error al obtener habilidad ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Crear una nueva habilidad clave
// @route   POST /api/habilidades-clave
const createHabilidad = async (req, res) => {
  const { nombre_habilidad, descripcion } = req.body;
  if (!nombre_habilidad) {
    return res.status(400).json({ error: "El nombre de la habilidad es requerido." });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO habilidades_clave (nombre_habilidad, descripcion) VALUES (?, ?)",
      [nombre_habilidad, descripcion]
    );
    res.status(201).json({ message: "Habilidad clave creada con éxito", id_habilidad: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El nombre de la habilidad ya existe." });
    }
    console.error("Error al crear habilidad clave:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Actualizar una habilidad clave
// @route   PUT /api/habilidades-clave/:id
const updateHabilidad = async (req, res) => {
  const { id } = req.params;
  const { nombre_habilidad, descripcion } = req.body;
  if (!nombre_habilidad) {
    return res.status(400).json({ error: "El nombre de la habilidad es requerido." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE habilidades_clave SET nombre_habilidad = ?, descripcion = ? WHERE id_habilidad = ?",
      [nombre_habilidad, descripcion, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Habilidad clave no encontrada." });
    }
    res.json({ message: "Habilidad clave actualizada con éxito." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El nombre de la habilidad ya existe." });
    }
    console.error(`Error al actualizar habilidad ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Eliminar una habilidad clave
// @route   DELETE /api/habilidades-clave/:id
const deleteHabilidad = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM habilidades_clave WHERE id_habilidad = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Habilidad clave no encontrada." });
    }
    res.json({ message: "Habilidad clave eliminada con éxito." });
  } catch (error) {
    console.error(`Error al eliminar habilidad ${id}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({ error: "No se puede eliminar la habilidad porque tiene cursos asociados." });
    }
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = {
  getAllHabilidades,
  getHabilidadById,
  createHabilidad,
  updateHabilidad,
  deleteHabilidad,
  getHabilidadSubgrupos,
  getAvailableSubgruposForHabilidad,
  addSubgrupoToHabilidad,
  removeSubgrupoFromHabilidad,
};