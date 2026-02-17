const express = require('express');
const router = express.Router();
const { uploadImage } = require('../middleware/upload');
const {
    uploadCourseImage,
    uploadCredentialImage,
    processImageUrl,
    uploadImagesMiddleware
} = require('../controllers/imageController');

// Rutas para subida de archivos
router.post('/course-image', uploadImagesMiddleware, uploadCourseImage);
router.post('/credential-image', uploadImagesMiddleware, uploadCredentialImage);

// Ruta para procesar imágenes desde URLs externas
router.post('/process-url', processImageUrl);

module.exports = router;
