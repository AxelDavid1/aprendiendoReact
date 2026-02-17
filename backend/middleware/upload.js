const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que los directorios de uploads existan
const ensureUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/cursos',
    'uploads/credenciales',
    'uploads/temp'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs();
    
    // Determinar el directorio basado en el tipo
    const uploadType = req.body.uploadType || 'cursos'; // 'cursos' o 'credenciales'
    const uploadDir = path.join(__dirname, '..', 'uploads', uploadType);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, webp, gif)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Middleware para subida de imagen individual
const uploadImage = (req, res, next) => {
  const singleUpload = upload.single('image');
  
  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB.' });
        }
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = {
  uploadImage,
  ensureUploadDirs
};
