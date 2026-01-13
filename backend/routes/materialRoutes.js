const express = require("express");
const router = express.Router();
const logger = require("../config/logger");
const {
  upload,
  subirMaterial,
  subirMaterialPlaneacion,
  getMaterialCurso,
  descargarMaterial,
  actualizarMaterial,
  eliminarMaterial,
  debugTableStructure,
  fixTableStructure,
} = require("../controllers/materialController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST /api/material
// @desc    Subir nuevo material del curso
// @access  Private (Maestro)
router.post("/", protect, upload.single("file"), subirMaterial);


router.post('/planeacion', 
  protect, 
  upload.single('file'),
  subirMaterialPlaneacion
);

// @route   GET /api/material/curso/:id_curso
// @desc    Obtener todo el material de un curso
// @access  Private (Alumno/Maestro)
router.get("/curso/:id_curso", protect, getMaterialCurso);

// @route   GET /api/material/download/:id_material
// @desc    Descargar archivo de material
// @access  Private (Alumno/Maestro inscrito en el curso)
router.get("/download/:id_material", protect, descargarMaterial);

// @route   GET /api/material/debug-table
// @desc    Debug table structure (temporal)
// @access  Private (Admin)
router.get("/debug-table", protect, debugTableStructure);

// @route   POST /api/material/fix-table
// @desc    Fix table structure to allow NULL in ruta_archivo
// @access  Private (Admin)
router.post("/fix-table", protect, fixTableStructure);

// @route   PUT /api/material/:id_material
// @desc    Actualizar material del curso
// @access  Private (Maestro propietario)
router.put("/:id_material", protect, actualizarMaterial);

// @route   DELETE /api/material/:id_material
// @desc    Eliminar material del curso (soft delete)
// @access  Private (Maestro propietario)
router.delete("/:id_material", protect, eliminarMaterial);

module.exports = router;