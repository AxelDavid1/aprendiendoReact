const express = require("express");
const router = express.Router();
const {
    searchStudents,
    recruitStudent,
    getVinculaciones,
    updateVinculacionStatus,
    getFeedbackQuestions,
    submitFeedback,
    getCompanyProfile,
    updateCompanyProfile,
    getStudentDetails
} = require("../controllers/empresaController");
const { protect, isEmpresaAdmin } = require("../middleware/authMiddleware");

// Todas las rutas de empresa requieren autenticación y rol de empresa
router.use(protect);
router.use(isEmpresaAdmin);

// Búsqueda de alumnos
router.get("/search-students", searchStudents);
router.get("/student/:id_alumno/details", getStudentDetails);

// Gestión de vinculaciones (Embudo)
router.post("/recruit", recruitStudent);
router.get("/vinculaciones/:id_empresa", getVinculaciones);
router.patch("/vinculacion/:id_vinculo/status", updateVinculacionStatus);

// Feedback
router.get("/feedback-questions", getFeedbackQuestions);
router.post("/feedback", submitFeedback);

// Perfil
router.get("/profile/:id_empresa", getCompanyProfile);
router.put("/profile/:id_empresa", updateCompanyProfile);

module.exports = router;
