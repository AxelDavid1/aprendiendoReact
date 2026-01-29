const Carrera = require("../models/carreraModel");
const pool = require("../config/db"); // Importar el pool de conexiones

/**
 * Crea una nueva carrera.
 * POST /api/carreras
 * Body: { "id_facultad": 1, "nombre": "Ingeniería de Software", "clave_carrera": "IS-2024", "duracion_anos": 5 }
 */
exports.createCarrera = async (req, res) => {
  const { id_facultad, nombre, clave_carrera, duracion_anos } = req.body;

  if (!id_facultad || !nombre || !clave_carrera) {
    return res.status(400).json({
      success: false,
      message: "id_facultad, nombre y clave_carrera son campos obligatorios.",
    });
  }

  const newCarrera = {
    id_facultad,
    nombre,
    clave_carrera,
    duracion_anos: duracion_anos || null,
  };

  try {
    const data = await Carrera.create(newCarrera);
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: `La clave de carrera '${clave_carrera}' ya existe.`,
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Ocurrió un error al crear la carrera.",
    });
  }
};

/**
 * @desc    Obtener carreras por ID de universidad
 * @route   GET /api/carreras/by-universidad/:id_universidad
 * @access  Public
 */
exports.getCarrerasByUniversidad = async (req, res) => {
  const { id_universidad } = req.params;

  if (!id_universidad) {
    return res
      .status(400)
      .json({ error: "El ID de la universidad es requerido." });
  }

  try {
    const db = await pool.getConnection();
    const [carreras] = await db.execute(
      `SELECT c.id_carrera, c.nombre 
       FROM carreras c
       JOIN facultades f ON c.id_facultad = f.id_facultad
       WHERE f.id_universidad = ?
       ORDER BY c.nombre ASC`,
      [id_universidad],
    );
    db.release();
    res.json({ carreras });
  } catch (error) {
    console.error("Error al obtener carreras por universidad:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

/**
 * Obtiene todas las carreras (para filtros de maestros).
 * GET /api/carreras
 */
exports.getAllCarreras = async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [carreras] = await db.execute(
      `SELECT c.id_carrera, c.nombre, c.clave_carrera
       FROM carreras c
       ORDER BY c.nombre ASC`,
    );
    db.release();
    res.json({ success: true, data: carreras });
  } catch (error) {
    console.error("Error al obtener todas las carreras:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};

/**
 * Obtiene todas las carreras de una facultad específica.
 * GET /api/carreras/facultad/:idFacultad
 */
exports.getCarrerasByFacultad = async (req, res) => {
  const { idFacultad } = req.params;

  if (!idFacultad) {
    return res.status(400).json({
      success: false,
      message: "El ID de la facultad es obligatorio.",
    });
  }

  try {
    const data = await Carrera.findByFacultadId(idFacultad);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Ocurrió un error al obtener las carreras.",
    });
  }
};

exports.getCarreras = async (req, res) => {
  const { id_universidad, id_facultad } = req.query;

  try {
    if (id_universidad) {
      const [carreras] = await pool.query(
        `SELECT c.id_carrera, c.nombre, c.clave_carrera, c.id_facultad
           FROM carreras c
           JOIN facultades f ON c.id_facultad = f.id_facultad
          WHERE f.id_universidad = ?
          ORDER BY c.nombre ASC`,
        [id_universidad],
      );
      return res.json(carreras);
    }

    if (id_facultad) {
      const carreras = await Carrera.findByFacultadId(id_facultad);
      // findByFacultadId ya trae nombre y clave; devuelve el arreglo tal cual
      return res.json(carreras);
    }

    const [carreras] = await pool.query(
      `SELECT id_carrera, nombre, clave_carrera, id_facultad
         FROM carreras
        ORDER BY nombre ASC`,
    );
    res.json(carreras);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    res.status(500).json({ error: "Error en el servidor al obtener las carreras." });
  }
};

exports.updateCarrera = async (req, res) => {
  const { id } = req.params;
  const { nombre, clave_carrera, duracion_anos } = req.body;

  if (!nombre || !clave_carrera) {
    return res.status(400).json({
      success: false,
      message: "Los campos nombre y clave_carrera no pueden estar vacíos.",
    });
  }

  const carreraData = {
    nombre,
    clave_carrera,
    duracion_anos: duracion_anos || null,
  };

  try {
    const result = await Carrera.update(id, carreraData);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la carrera con ID ${id}.`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Carrera actualizada correctamente.",
      data: { id: id, ...carreraData },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: `La clave de carrera '${clave_carrera}' ya pertenece a otra carrera.`,
      });
    }
    res.status(500).json({
      success: false,
      message: `Error al actualizar la carrera con ID ${id}.`,
    });
  }
};

/**
 * Elimina una carrera.
 * DELETE /api/carreras/:id
 */
exports.deleteCarrera = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Carrera.remove(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la carrera con ID ${id}.`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Carrera eliminada correctamente.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error al eliminar la carrera con ID ${id}.`,
    });
  }
};