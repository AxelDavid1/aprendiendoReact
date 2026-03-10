// backend/routes/credencialRoutes.js
const express = require("express");
const router = express.Router();
const {
    getAllCredenciales,
    getCredencialById,
    createCredencial,
    updateCredencial,
    deleteCredencial,
} = require("../controllers/credencialController");
const { protect, admin } = require("../middleware/authMiddleware");

// Rutas para /api/credenciales
router.route("/")
    .get(protect, getAllCredenciales)
    .post(protect, admin, createCredencial);

// Rutas para /api/credenciales/:id
router.route("/:id")
    .get(protect, getCredencialById)
    .put(protect, admin, updateCredencial)
    .delete(protect, admin, deleteCredencial);

module.exports = router;
