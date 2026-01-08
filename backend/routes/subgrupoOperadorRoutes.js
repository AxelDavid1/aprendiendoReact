const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllSubgrupos,
  getSubgrupoById,
  createSubgrupo,
  updateSubgrupo,
  deleteSubgrupo,
  getSubgrupoHabilidades,
  getAvailableHabilidadesForSubgrupo,
  addHabilidadToSubgrupo,
  removeHabilidadFromSubgrupo,
} = require("../controllers/subgrupoOperadorController");

// Todas las rutas requieren autenticación
router.use(protect);

// @route   GET /api/subgrupos-operadores/:id/habilidades
router.get("/:id/habilidades", getSubgrupoHabilidades);
// @route   GET /api/subgrupos-operadores/:id/habilidades-disponibles
router.get("/:id/habilidades-disponibles", getAvailableHabilidadesForSubgrupo);
// @route   POST /api/subgrupos-operadores/:id/habilidades
router.post("/:id/habilidades", addHabilidadToSubgrupo);
// @route   DELETE /api/subgrupos-operadores/:id/habilidades/:idHabilidad
router.delete("/:id/habilidades/:idHabilidad", removeHabilidadFromSubgrupo);

// @route   GET /api/subgrupos-operadores
router.get("/", getAllSubgrupos);

// @route   GET /api/subgrupos-operadores/:id
router.get("/:id", getSubgrupoById);

// @route   POST /api/subgrupos-operadores
router.post("/", createSubgrupo);

// @route   PUT /api/subgrupos-operadores/:id
router.put("/:id", updateSubgrupo);

// @route   DELETE /api/subgrupos-operadores/:id
router.delete("/:id", deleteSubgrupo);

module.exports = router;