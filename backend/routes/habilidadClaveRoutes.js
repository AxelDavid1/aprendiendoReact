const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllHabilidades,
  getHabilidadById,
  createHabilidad,
  updateHabilidad,
  deleteHabilidad,
} = require("../controllers/habilidadClaveController");

// Todas las rutas requieren autenticación
router.use(protect);

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