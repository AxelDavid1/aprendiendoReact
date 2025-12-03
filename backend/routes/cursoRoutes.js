const express = require("express");
const router = express.Router();
const {
  getAllCursos,
  getCursoById,
  createCurso,
  updateCurso,
  deleteCurso,
  getAlumnosPorCurso,
} = require("../controllers/cursoController");

// Importamos las funciones de planeacionController
const { guardarPlaneacion, obtenerPlaneacion } = require("../controllers/planeacionController");

const { protect } = require("../middleware/authMiddleware.js");

// Rutas para los cursos
router.get("/", getAllCursos);
router.get("/:id", getCursoById);
router.get("/:id/alumnos", protect, getAlumnosPorCurso);
router.post("/", createCurso);
router.put("/:id", updateCurso);
router.delete("/:id", deleteCurso);

router.post("/:id/planeacion", protect, guardarPlaneacion);
router.get("/:id/planeacion", protect, obtenerPlaneacion);

module.exports = router;