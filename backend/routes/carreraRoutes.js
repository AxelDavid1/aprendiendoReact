const express = require("express");
const router = express.Router();
const carreraController = require("../controllers/carreraController");

// Middleware de autenticación
const { protect } = require("../middleware/authMiddleware.js");

/**
 * @route   POST /api/carreras
 * @desc    Crear una nueva carrera
 * @access  Private
 */
router.post("/", protect, carreraController.createCarrera);

router.get("/", protect, carreraController.getCarreras);
/**
 * @route   GET /api/carreras/facultad/:idFacultad
 * @desc    Obtener todas las carreras de una facultad
 * @access  Private
 */
router.get("/facultad/:idFacultad", protect, carreraController.getCarrerasByFacultad);

/**
 * @route   PUT /api/carreras/:id
 * @desc    Actualizar una carrera por su ID
 * @access  Private
 */
router.put("/:id", protect, carreraController.updateCarrera);

/**
 * @route   DELETE /api/carreras/:id
 * @desc    Eliminar una carrera por su ID
 * @access  Private
 */
router.delete("/:id", protect, carreraController.deleteCarrera);

/**
 * @route   GET /api/carreras/by-universidad/:id_universidad
 * @desc    Obtener carreras por ID de universidad
 * @access  Private
 */
router.get("/by-universidad/:id_universidad", protect, carreraController.getCarrerasByUniversidad);

module.exports = router;
