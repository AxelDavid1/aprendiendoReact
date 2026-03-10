const express = require("express");
const router = express.Router();
const alumnoController = require("../controllers/alumnoController");
const { protect } = require("../middleware/authMiddleware");

router.post("/complete-profile", protect, alumnoController.completeStudentProfile);

module.exports = router;
