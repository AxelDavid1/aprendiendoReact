const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllHabilidades,
  getHabilidadById,
  createHabilidad,
  updateHabilidad,
  deleteHabilidad,
  getHabilidadSubgrupos,
  getAvailableSubgruposForHabilidad,
  addSubgrupoToHabilidad,
  removeSubgrupoFromHabilidad,
} = require("../controllers/habilidadClaveController");

// Todas las rutas requieren autenticación
router.use(protect);

// @route   GET /api/habilidades-clave/:id/subgrupos
router.get("/:id/subgrupos", getHabilidadSubgrupos);
// @route   GET /api/habilidades-clave/:id/subgrupos-disponibles
router.get("/:id/subgrupos-disponibles", getAvailableSubgruposForHabilidad);
// @route   POST /api/habilidades-clave/:id/subgrupos
router.post("/:id/subgrupos", addSubgrupoToHabilidad);
// @route   DELETE /api/habilidades-clave/:id/subgrupos/:idSubgrupo
router.delete("/:id/subgrupos/:idSubgrupo", removeSubgrupoFromHabilidad);

// @route   GET /api/habilidades-clave
router.get("/", getAllHabilidades);

// @route   GET /api/habilidades-clave/:id
router.get("/:id", getHabilidadById);

// @route   POST /api/habilidades-clave
router.post("/", createHabilidad);

// @route   PUT /api/habilidades-clave/:id
router.put("/:id", updateHabilidad);

// @route   DELETE /api/habilidades-clave/:id
router.delete("/:id", deleteHabilidad);

module.exports = router;