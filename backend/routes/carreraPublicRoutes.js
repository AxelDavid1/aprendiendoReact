const express = require("express");
const router = express.Router();
const carreraController = require("../controllers/carreraController");

/**
 * @route   GET /api/public/carreras/by-universidad/:id_universidad
 * @desc    Obtener carreras por ID de universidad (público para el registro)
 * @access  Public
 */
router.get("/by-universidad/:id_universidad", carreraController.getCarrerasByUniversidad);

module.exports = router;
