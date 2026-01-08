const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllSubgrupos,
  getSubgrupoById,
  createSubgrupo,
  updateSubgrupo,
  deleteSubgrupo,
} = require("../controllers/subgrupoOperadorController");

// Todas las rutas requieren autenticación
router.use(protect);

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