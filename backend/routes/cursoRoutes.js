const express = require("express");
const router = express.Router();
const {
  getAllCursos,
  getCursoById,
  createCurso,
  updateCurso,
  deleteCurso,
  getAlumnosPorCurso,
  getCursosMaestro,
} = require("../controllers/cursoController");

// Importamos las funciones de planeacionController
const { guardarPlaneacion, obtenerPlaneacion } = require("../controllers/planeacionController");

const { protect } = require("../middleware/authMiddleware.js");

// Rutas para los cursos
router.get("/", protect, getAllCursos);
router.get("/maestro", protect, getCursosMaestro);
router.get("/:id", protect, getCursoById);
router.get("/:id/alumnos", protect, getAlumnosPorCurso);
router.post("/", protect, createCurso);
router.put("/:id", protect, updateCurso);
router.delete("/:id", protect, deleteCurso);

router.post("/:id/planeacion", protect, guardarPlaneacion);
router.get("/:id/planeacion", protect, obtenerPlaneacion);

module.exports = router;