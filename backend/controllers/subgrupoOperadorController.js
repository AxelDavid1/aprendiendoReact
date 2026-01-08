const pool = require("../config/db");

// @desc    Obtener habilidades de un subgrupo operador
// @route   GET /api/subgrupos-operadores/:id/habilidades
const getSubgrupoHabilidades = async (req, res) => {
  const { id } = req.params;
  try {
    const [habilidades] = await pool.query(
      `SELECT hc.* FROM habilidades_clave hc
       INNER JOIN subgrupo_habilidades sh ON hc.id_habilidad = sh.id_habilidad
       WHERE sh.id_subgrupo = ? ORDER BY hc.nombre_habilidad ASC`,
      [id]
    );
    res.json(habilidades);
  } catch (error) {
    console.error(`Error al obtener habilidades del subgrupo ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener habilidades disponibles para un subgrupo (las que no están asignadas)
// @route   GET /api/subgrupos-operadores/:id/habilidades-disponibles
const getAvailableHabilidadesForSubgrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const [habilidades] = await pool.query(
      `SELECT hc.* FROM habilidades_clave hc
       LEFT JOIN subgrupo_habilidades sh ON hc.id_habilidad = sh.id_habilidad AND sh.id_subgrupo = ?
       WHERE sh.id_habilidad IS NULL ORDER BY hc.nombre_habilidad ASC`,
      [id]
    );
    res.json(habilidades);
  } catch (error) {
    console.error(`Error al obtener habilidades disponibles para subgrupo ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Agregar habilidad a un subgrupo operador
// @route   POST /api/subgrupos-operadores/:id/habilidades
const addHabilidadToSubgrupo = async (req, res) => {
  const { id } = req.params;
  const { id_habilidad } = req.body;
  
  if (!id_habilidad) {
    return res.status(400).json({ error: "El ID de la habilidad es requerido." });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO subgrupo_habilidades (id_subgrupo, id_habilidad) VALUES (?, ?)",
      [id, id_habilidad]
    );
    res.status(201).json({ message: "Habilidad agregada al subgrupo con éxito" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "La habilidad ya está asignada a este subgrupo." });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "El subgrupo o la habilidad no existen." });
    }
    console.error("Error al agregar habilidad al subgrupo:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Eliminar habilidad de un subgrupo operador
// @route   DELETE /api/subgrupos-operadores/:id/habilidades/:idHabilidad
const removeHabilidadFromSubgrupo = async (req, res) => {
  const { id, idHabilidad } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM subgrupo_habilidades WHERE id_subgrupo = ? AND id_habilidad = ?",
      [id, idHabilidad]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "La habilidad no está asignada a este subgrupo." });
    }
    res.json({ message: "Habilidad eliminada del subgrupo con éxito" });
  } catch (error) {
    console.error("Error al eliminar habilidad del subgrupo:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


// @desc    Obtener todos los subgrupos operadores
// @route   GET /api/subgrupos-operadores
const getAllSubgrupos = async (req, res) => {
  try {
    const [subgrupos] = await pool.query("SELECT * FROM subgrupos_operadores ORDER BY nombre_subgrupo ASC");
    res.json(subgrupos);
  } catch (error) {
    console.error("Error al obtener subgrupos operadores:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Obtener un subgrupo operador por ID
// @route   GET /api/subgrupos-operadores/:id
const getSubgrupoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [subgrupos] = await pool.query("SELECT * FROM subgrupos_operadores WHERE id_subgrupo = ?", [id]);
    if (subgrupos.length === 0) {
      return res.status(404).json({ error: "Subgrupo operador no encontrado." });
    }
    res.json(subgrupos[0]);
  } catch (error) {
    console.error(`Error al obtener subgrupo ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Crear un nuevo subgrupo operador
// @route   POST /api/subgrupos-operadores
const createSubgrupo = async (req, res) => {
  const { nombre_subgrupo, descripcion } = req.body;
  if (!nombre_subgrupo) {
    return res.status(400).json({ error: "El nombre del subgrupo es requerido." });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO subgrupos_operadores (nombre_subgrupo, descripcion) VALUES (?, ?)",
      [nombre_subgrupo, descripcion]
    );
    res.status(201).json({ message: "Subgrupo operador creado con éxito", id_subgrupo: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El nombre del subgrupo ya existe." });
    }
    console.error("Error al crear subgrupo operador:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Actualizar un subgrupo operador
// @route   PUT /api/subgrupos-operadores/:id
const updateSubgrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre_subgrupo, descripcion } = req.body;
  if (!nombre_subgrupo) {
    return res.status(400).json({ error: "El nombre del subgrupo es requerido." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE subgrupos_operadores SET nombre_subgrupo = ?, descripcion = ? WHERE id_subgrupo = ?",
      [nombre_subgrupo, descripcion, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subgrupo operador no encontrado." });
    }
    res.json({ message: "Subgrupo operador actualizado con éxito." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El nombre del subgrupo ya existe." });
    }
    console.error(`Error al actualizar subgrupo ${id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// @desc    Eliminar un subgrupo operador
// @route   DELETE /api/subgrupos-operadores/:id
const deleteSubgrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM subgrupos_operadores WHERE id_subgrupo = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subgrupo operador no encontrado." });
    }
    res.json({ message: "Subgrupo operador eliminado con éxito." });
  } catch (error) {
    console.error(`Error al eliminar subgrupo ${id}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({ error: "No se puede eliminar el subgrupo porque tiene cursos asociados." });
    }
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

module.exports = {
  getAllSubgrupos,
  getSubgrupoById,
  createSubgrupo,
  updateSubgrupo,
  deleteSubgrupo,
  getSubgrupoHabilidades,
  getAvailableHabilidadesForSubgrupo,
  addHabilidadToSubgrupo,
  removeHabilidadFromSubgrupo,
};