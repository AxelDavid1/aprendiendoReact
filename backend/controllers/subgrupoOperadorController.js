const pool = require("../config/db");

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
};