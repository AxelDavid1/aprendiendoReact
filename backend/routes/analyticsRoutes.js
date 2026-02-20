const express = require("express");
const router = express.Router();
const { getHiringMetrics, getSkillGaps } = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Estas rutas requieren que el usuario esté autenticado y sea un administrador (SEDEQ, Universidad o Empresa)
// (Aunque por ahora Empresa no las consume, el middleware combined 'admin' lo permite)
router.use(protect);
router.use(admin);

router.get("/hiring", getHiringMetrics);
router.get("/skill-gaps", getSkillGaps);

module.exports = router;
