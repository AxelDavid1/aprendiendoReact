const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');

// Configurar multer para múltiples archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${timestamp}${ext}`);
  }
});

const uploadImagesMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).fields([
  { name: 'originalImage', maxCount: 1 },
  { name: 'croppedImage', maxCount: 1 }
]);

// Función auxiliar para procesar imágenes
const processImage = async (file, prefix, type = 'cursos') => {
  const timestamp = Date.now();
  const outputFilename = `${prefix}_${timestamp}.webp`;
  const folder = type === 'credenciales' ? 'credenciales' : 'cursos';
  const outputPath = path.join(__dirname, '..', 'uploads', folder, outputFilename);

  // Procesar imagen con Sharp
  const image = sharp(file.path);

  // Redimensionar a tamaño final (240x160)
  // NOTA: Para la original, no redimensionamos, solo convertimos a webp
  if (prefix === 'original') {
    await image
      .webp({ quality: 90 })
      .toFile(outputPath);
  } else {
    await image
      .resize(240, 160, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);
  }

  // Eliminar archivo temporal
  fs.unlinkSync(file.path);

  // Construir URL de la imagen
  return `/uploads/${folder}/${outputFilename}`;
};

// @desc    Procesar y optimizar imagen subida
// @route   POST /api/upload/course-image
const uploadCourseImage = async (req, res) => {
  try {
    const { originalImage, croppedImage } = req.files || {};
    const { adjustments, courseId, originalImageUrl: existingOriginalUrl } = req.body;

    if (!croppedImage) {
      return res.status(400).json({ error: 'Se requiere la imagen recortada (croppedImage).' });
    }

    console.log('📤 Procesando imágenes de curso:', {
      hasOriginal: !!originalImage,
      hasCropped: !!croppedImage,
      courseId
    });

    // Procesar imágenes
    let originalUrl = existingOriginalUrl || null;
    if (originalImage) {
      originalUrl = await processImage(originalImage[0], 'original', 'cursos');
    }
    
    const croppedUrl = await processImage(croppedImage[0], 'cropped', 'cursos');

    // Actualizar BD solo si hay courseId
    if (courseId && courseId !== 'undefined' && courseId !== '') {
      const pool = require('../config/db');
      
      const query = originalUrl 
        ? 'UPDATE curso SET imagen_url = ?, imagen_original_url = ?, imagen_ajustes = ? WHERE id_curso = ?'
        : 'UPDATE curso SET imagen_url = ?, imagen_ajustes = ? WHERE id_curso = ?';
      
      const params = originalUrl
        ? [croppedUrl, originalUrl, adjustments, courseId]
        : [croppedUrl, adjustments, courseId];

      await pool.query(query, params);
      console.log('✅ BD actualizada para curso:', courseId);
    }

    res.json({
      success: true,
      imageUrl: croppedUrl,
      originalImageUrl: originalUrl,
      adjustments: JSON.parse(adjustments || '{}')
    });

  } catch (error) {
    console.error('❌ Error al procesar imágenes de curso:', error);
    res.status(500).json({ error: 'Error al procesar las imágenes.' });
  }
};

// @desc    Procesar y optimizar imagen de credencial
// @route   POST /api/upload/credential-image
const uploadCredentialImage = async (req, res) => {
  try {
    const { originalImage, croppedImage } = req.files || {};
    const { adjustments, credentialId, originalImageUrl: existingOriginalUrl } = req.body;

    if (!croppedImage) {
      return res.status(400).json({ error: 'Se requiere la imagen recortada (croppedImage).' });
    }

    console.log('📤 Procesando imágenes de credencial:', {
      hasOriginal: !!originalImage,
      hasCropped: !!croppedImage,
      credentialId
    });

    // Procesar imágenes
    let originalUrl = existingOriginalUrl || null;
    if (originalImage) {
      originalUrl = await processImage(originalImage[0], 'original', 'credenciales');
    }

    const croppedUrl = await processImage(croppedImage[0], 'cropped', 'credenciales');

    // Actualizar BD solo si hay credentialId
    if (credentialId && credentialId !== 'undefined') {
      const pool = require('../config/db');
      try {
        const query = originalUrl
          ? 'UPDATE certificacion SET imagen_url = ?, imagen_original_url = ?, imagen_ajustes = ? WHERE id_certificacion = ?'
          : 'UPDATE certificacion SET imagen_url = ?, imagen_ajustes = ? WHERE id_certificacion = ?';
        
        const params = originalUrl
          ? [croppedUrl, originalUrl, adjustments, credentialId]
          : [croppedUrl, adjustments, credentialId];

        await pool.query(query, params);
        console.log('✅ BD actualizada para credencial:', credentialId);
      } catch (dbError) {
        console.warn('⚠️ No se pudo actualizar la BD (posible falta de columnas):', dbError.message);
      }
    }

    res.json({
      success: true,
      imageUrl: croppedUrl,
      originalImageUrl: originalUrl,
      adjustments: JSON.parse(adjustments || '{}')
    });

  } catch (error) {
    console.error('❌ Error al procesar imagen de credencial:', error);
    res.status(500).json({ error: 'Error al procesar las imágenes.' });
  }
};

// @desc    Procesar imagen desde URL externa
// @route   POST /api/upload/process-url
const processImageUrl = async (req, res) => {
  try {
    const { imageUrl, uploadType = 'cursos', cropData } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Se requiere una URL de imagen.' });
    }

    // Validar URL
    try {
      const url = new URL(imageUrl);

      const blockedDomains = ['google.com', 'facebook.com', 'instagram.com', 'twitter.com'];
      if (blockedDomains.some(domain => url.hostname.includes(domain))) {
        return res.status(400).json({
          error: 'No se permiten URLs de servicios externos. Por favor sube la imagen directamente.'
        });
      }

      if (!url.hostname ||
        !imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
        return res.status(400).json({
          error: 'La URL debe apuntar directamente a un archivo de imagen (jpg, png, webp, gif).'
        });
      }

    } catch (e) {
      return res.status(400).json({ error: 'URL inválida.' });
    }

    // Descargar imagen
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 10000
    });

    if (!response.headers['content-type']?.startsWith('image/')) {
      return res.status(400).json({ error: 'La URL no apunta a una imagen válida.' });
    }

    // Generar nombres de archivos
    const timestamp = Date.now();
    const tempFilename = `temp_${timestamp}.tmp`;
    const tempPath = path.join(__dirname, '..', 'uploads', 'temp', tempFilename);
    const outputFilename = `${uploadType === 'cursos' ? 'course' : 'credential'}_${timestamp}.webp`;
    const outputPath = path.join(__dirname, '..', 'uploads', uploadType, outputFilename);

    // Guardar archivo temporal
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Procesar imagen
    const image = sharp(tempPath);
    const metadata = await image.metadata();

    let processedImage = image;

    // Si hay cropData, aplicar el recorte
    if (cropData) {
      try {
        const crop = JSON.parse(cropData);

        const cropX = Math.round((crop.x / 100) * metadata.width);
        const cropY = Math.round((crop.y / 100) * metadata.height);
        const cropWidth = Math.round((crop.width / 100) * metadata.width);
        const cropHeight = Math.round((crop.height / 100) * metadata.height);

        if (cropX >= 0 && cropY >= 0 && cropWidth > 0 && cropHeight > 0 &&
          cropX + cropWidth <= metadata.width && cropY + cropHeight <= metadata.height) {

          processedImage = processedImage.extract({
            left: cropX,
            top: cropY,
            width: cropWidth,
            height: cropHeight
          });
        }
      } catch (e) {
        console.warn('⚠️ Error al parsear cropData:', e);
      }
    }

    await processedImage
      .resize(240, 160, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Eliminar archivo temporal
    fs.unlinkSync(tempPath);

    const finalImageUrl = `/uploads/${uploadType}/${outputFilename}`;

    res.json({
      success: true,
      imageUrl: finalImageUrl,
      filename: outputFilename
    });

  } catch (error) {
    console.error('❌ Error al procesar imagen desde URL:', error);
    res.status(500).json({ error: 'Error al procesar la imagen desde la URL.' });
  }
};

module.exports = {
  uploadCourseImage,
  uploadCredentialImage,
  processImageUrl,
  uploadImagesMiddleware
};