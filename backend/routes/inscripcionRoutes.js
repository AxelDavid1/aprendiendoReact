const express = require("express");
const router = express.Router();
const {
    crearInscripcion,
    getInscripcionesAlumno,
    getAllInscripciones,
    actualizarEstadoInscripcion,
} = require("../controllers/inscripcionController");
const { protect, isAdmin } = require("../middleware/authMiddleware.js");

// Ruta para que un alumno cree una nueva inscripción
// @route   POST /api/inscripciones
router.post("/", protect, crearInscripcion);

// Ruta para que un administrador/maestro obtenga TODAS las inscripciones (con filtros)
// @route   GET /api/inscripciones/all
router.get("/all", protect, getAllInscripciones);

// Ruta para que un alumno obtenga sus propias inscripciones
// @route   GET /api/inscripciones/alumno
router.get("/alumno", protect, getInscripcionesAlumno);

// Ruta para que un administrador/maestro actualice el estado de una inscripción
// @route   PUT /api/inscripciones/:id/estado
router.put("/:id/estado", protect, actualizarEstadoInscripcion);

module.exports = router;
