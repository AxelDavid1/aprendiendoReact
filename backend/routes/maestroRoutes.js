const express = require("express");
const router = express.Router();
const maestroController = require("../controllers/maestroController");
const { protect, admin } = require("../middleware/authMiddleware");

// Rutas para la gestión de maestros
// Aplica middleware de autenticación/autorización si es necesario
router.get("/", protect, admin, maestroController.getMaestros);
router.get("/:id", protect, maestroController.getMaestroById);
router.post("/", protect, admin, maestroController.createMaestro);
router.put("/:id", protect, admin, maestroController.updateMaestro);
router.delete("/:id", protect, admin, maestroController.deleteMaestro);

module.exports = router;
