const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Para cargar variables de entorno

// 0. VALIDACIÓN DE ENTORNO (Crítico para producción)
const requiredEnvVars = [
  "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", 
  "JWT_SECRET", "CORS_ORIGIN", "PORT"
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error(`❌ ERROR CRÍTICO: Faltan variables de entorno: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ Configuración de entorno validada correctamente");
};
validateEnv();
// Importar middleware de multer
const { uploadImage, ensureUploadDirs } = require('./middleware/upload');

// Asegurar directorios de carga al iniciar
ensureUploadDirs();

// Configuración de logs
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, "server.log");
const logStream = fs.createWriteStream(logFile, { flags: "a" });

// Función para logs
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  logStream.write(logMessage);
};

log("🚀 Iniciando servidor...");
log(`📂 Entorno: ${process.env.NODE_ENV || "development"}`);
log(`📝 Variables de entorno cargadas`);

// Configuración CORS eliminada - ahora está integrada en el middleware de seguridad

// ====================== SEGURIDAD BÁSICA (Helmet + Rate Limit + Slow Down) ======================
const app = express();

app.set('trust proxy', 1); // importante para que req.ip funcione bien detrás de Cloudflare/Apache

// 1. Helmet → 11 headers de seguridad automáticos (XSS, clickjacking, etc.)
// Configuración personalizada para tu aplicación
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Desactivado para compatibilidad
};
app.use(helmet(helmetConfig));

// 4. JSON parser (después de seguridad)
app.use(express.json({ limit: '10mb' })); // Límite para prevenir ataques de payload


// 2. MONITOREO DE PETICIONES (conservado para análisis futuro)
const requestCounts = new Map();
const usageTracker = (req, res, next) => {
  const ip = req.ip;
  const timestamp = new Date().toISOString();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 0, startTime: Date.now() });
  }
  
  const userStats = requestCounts.get(ip);
  userStats.count++;
  
  const elapsedMinutes = ((Date.now() - userStats.startTime) / 60000).toFixed(1);
  
  // Mostrar resumen cada 50 peticiones (reducido frecuencia de logs)
  if (userStats.count % 50 === 0) {
    log(`📈 RESUMEN PARCIAL - IP: ${ip} - Total: ${userStats.count} peticiones en ${elapsedMinutes}min`);
  }
  
  next();
};
// app.use(usageTracker); // Desactivado para producción, disponible para debugging

// 2. Rate Limit → 750 peticiones por IP cada 15 minutos (basado en tests reales)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutos
  max: 750,                   // límite por IP (ajustado según tests)
  message: { error: 'Demasiadas solicitudes desde tu IP. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log(`🚨 Rate limit excedido - IP: ${req.ip}, URL: ${req.originalUrl}`);
    res.status(429).json({ error: 'Demasiadas solicitudes desde tu IP. Intenta más tarde.' });
  }
});
app.use(limiter);

// Rate limit específico y más estricto solo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // solo 10 intentos de login por IP
  message: { error: 'Demasiados intentos de login. Intenta en 15 minutos.' },
  handler: (req, res) => {
    log(`🚨 LOGIN RATE LIMIT EXCEDIDO - IP: ${req.ip}`);
    res.status(429).json({ error: 'Demasiados intentos de login. Intenta más tarde.' });
  }
});
app.use('/login', loginLimiter);

// 3. Slow Down → después de 200 peticiones, cada una se retrasa 100ms (anti-brute-force suave)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 200,           // Aumentado de 50 a 200
  delayMs: () => 100,        // Reducido de 500ms a 100ms
  maxDelayMs: 5000,          // Reducido de 20000 a 5000ms
});
app.use(speedLimiter);


// 5. CORS mejorado y seguro
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://site36787-lxnz30.scloudsite101.com'
    ].filter(Boolean); // Eliminar valores undefined

    // Permitir solicitudes sin origin (móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      log(`🚨 CORS bloqueado - Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 6. Middleware de logging mejorado y seguro
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log de solicitud
  log(`📨 ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log seguro del body
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    const safeBody = { ...req.body };
    // Ocultar información sensible
    if (safeBody.password) safeBody.password = "********";
    if (safeBody.password_hash) safeBody.password_hash = "********";
    if (safeBody.token) safeBody.token = "********";
    if (safeBody.contraseña) safeBody.contraseña = "********";
    log(`📦 Body: ${JSON.stringify(safeBody)}`);
  }

  // Interceptador de respuesta para medir tiempo (logs más limpios)
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    // Solo log en desarrollo o errores
    if (process.env.NODE_ENV !== 'production' || res.statusCode >= 400) {
      log(`📤 Respuesta [${res.statusCode}] - ${duration}ms`);
    }
    return originalSend.call(this, body);
  };

  next();
});

// ====================== FIN SEGURIDAD ======================

// Servir archivos estáticos (para los logos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
log(`📁 Servicio de archivos estáticos configurado en /uploads`);

// Servir archivos de entregas de alumnos específicamente
app.use(
  "/uploads/material/entregas_Alumno",
  express.static(path.join(__dirname, "uploads/material/entregas_Alumno")),
);
log(
  `📁 Servicio de archivos de entregas configurado en /uploads/material/entregas_Alumno`,
);

// Servir archivos estáticos del frontend (para las plantillas PDF)
app.use(express.static(path.join(__dirname, "..", "my-project", "public")));
log(
  `📁 Servicio de archivos estáticos configurado para el frontend en /my-project/public`,
);

// Health check endpoint
app.get("/health", (req, res) => {
  log(`🏥 Health check solicitado`);
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

log(`🔄 Importando rutas...`);
// Rutas
const userRoutes = require("./routes/userRoutes");
const universidadRoutes = require("./routes/universidadRoutes");
const maestroRoutes = require("./routes/maestroRoutes");
const cursoRoutes = require("./routes/cursoRoutes");
const facultadRoutes = require("./routes/facultadRoutes");
const carreraRoutes = require("./routes/carreraRoutes");
const credencialRoutes = require("./routes/credencialRoutes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const inscripcionRoutes = require("./routes/inscripcionRoutes");
const domainRoutes = require("./routes/domainRoutes");
const convocatoriaRoutes = require("./routes/convocatoriaRoutes");
const areaConocimientoRoutes = require("./routes/areaConocimientoRoutes");
const horarioRoutes = require("./routes/horarioRoutes");
const unidadesRoutes = require("./routes/unidadesRoutes");
const calificacionesRoutes = require("./routes/calificacionesRoutes");
const entregasRoutes = require("./routes/entregasRoutes");
const materialRoutes = require("./routes/materialRoutes");
const firmasRoutes = require("./routes/firmasRoutes");
const certificadoConstanciaRoutes = require("./routes/certificadoConstanciaRoutes");
const verificacionHomeConstanciasYcertificadosRoutes = require("./routes/verificacionHomeConstanciasYcertificadosRoutes");
const publicFilesRoutes = require("./routes/publicFilesRoutes");
const subgrupoOperadorRoutes = require("./routes/subgrupoOperadorRoutes");
const habilidadClaveRoutes = require("./routes/habilidadClaveRoutes");
const universidadPublicRoutes = require("./routes/universidadPublicRoutes");
const carreraPublicRoutes = require("./routes/carreraPublicRoutes");
const imageRoutes = require("./routes/imageRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const { validateRequest } = require("./middleware/validationMiddleware");
const { loginSchema, signupSchema } = require("./config/schemas");

log(`✅ Rutas importadas correctamente`);

app.use("/api/public", verificacionHomeConstanciasYcertificadosRoutes);
app.use("/api/public-files", publicFilesRoutes);
app.use("/api", userRoutes);
app.use("/api/universidades", universidadRoutes);
app.use("/api/maestros", maestroRoutes);
app.use("/api/cursos", cursoRoutes);
app.use("/api/facultades", facultadRoutes);
app.use("/api/carreras", carreraRoutes);
app.use("/api/credenciales", credencialRoutes);
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.use("/api/dominios", domainRoutes);
app.use("/api/convocatorias", convocatoriaRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/unidades", unidadesRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/firmas", firmasRoutes);
app.use("/api/alumno", certificadoConstanciaRoutes);
app.use("/api/subgrupos-operadores", subgrupoOperadorRoutes);
app.use("/api/habilidades-clave", habilidadClaveRoutes);
app.use("/api/public", universidadPublicRoutes);
app.use("/api/public/carreras", carreraPublicRoutes);
app.use("/api/upload", imageRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/analytics", analyticsRoutes);
log(`🔌 Rutas configuradas en la aplicación`);

log(`💾 Conectando a la base de datos...`);
// El pool de conexiones ahora se importa desde su propio módulo en config/db.js
const pool = require("./config/db");
log(`✅ Conexión a la base de datos establecida`);

// Clave JWT desde variable de entorno
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  log("❌ ERROR CRÍTICO: JWT_SECRET no está definido en .env");
  process.exit(1); // detiene el servidor en producción
}
log(`🔑 Clave JWT configurada`);

// Validar tipo_usuario y estatus
const validTipoUsuario = [
  "alumno",
  "maestro",
  "admin_universidad",
  "admin_sedeq",
  "admin_empresa",
];
const validEstatus = ["activo", "inactivo", "pendiente", "suspendido"];

// Middleware para manejar errores
const handleError = (res, error, message = "Server error") => {
  log(`❌ ERROR: ${message} - ${error.message}`);
  console.error(error.stack);
  logStream.write(`ERROR STACK: ${error.stack}\n`);
  res.status(500).json({ error: message });
};

// Signup endpoint
app.post("/signup", validateRequest(signupSchema), async (req, res) => {
  log(`👤 Solicitud de registro recibida (validada)`);
  const { username, email, password, tipo_usuario, estatus } = req.body;

  // Validaciones
  if (!username || !email || !password) {
    log(`❌ Registro fallido: faltan campos obligatorios`);
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }
  if (!validTipoUsuario.includes(tipo_usuario)) {
    log(`❌ Registro fallido: tipo_usuario inválido`);
    return res.status(400).json({ error: "Invalid tipo_usuario" });
  }
  if (!validEstatus.includes(estatus)) {
    log(`❌ Registro fallido: estatus inválido`);
    return res.status(400).json({ error: "Invalid estatus" });
  }

  try {
    log(`🔄 Obteniendo conexión a la base de datos`);
    const db = await pool.getConnection();
    try {
      // Verificar si username o email ya existen
      log(
        `🔍 Verificando si el usuario o email ya existen: ${username}, ${email}`,
      );
      const [existingUser] = await db.execute(
        "SELECT * FROM usuario WHERE username = ? OR email = ?",
        [username, email],
      );
      if (existingUser.length > 0) {
        log(`❌ Registro fallido: usuario o email ya existen`);
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }

      log(`🔐 Generando hash de contraseña`);
      const password_hash = await bcrypt.hash(password, 10);
      log(`✅ Hash generado correctamente`);

      log(`💾 Insertando nuevo usuario en la base de datos`);
      const [result] = await db.execute(
        "INSERT INTO usuario (username, email, password_hash, tipo_usuario, estatus) VALUES (?, ?, ?, ?, ?)",
        [
          username,
          email,
          password_hash,
          tipo_usuario || "alumno",
          estatus || "pendiente",
        ],
      );

      log(`✅ Usuario registrado exitosamente con ID: ${result.insertId}`);
      res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId,
      });
    } finally {
      log(`🔄 Liberando conexión a la base de datos`);
      db.release(); // Liberar la conexión al pool
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      log(
        `❌ Registro fallido: usuario o email ya existen (error de duplicado)`,
      );
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    handleError(res, error, "Registration failed");
  }
});

// Login endpoint
app.post("/login", validateRequest(loginSchema), async (req, res) => {
  log(`🔐 Solicitud de login recibida (validada)`);
  const { username, password } = req.body;

  // Validaciones
  if (!username || !password) {
    log(`❌ Login fallido: faltan campos obligatorios`);
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    log(`🔄 Obteniendo conexión a la base de datos para login`);
    const db = await pool.getConnection();
    try {
      log(`🔍 Buscando usuario en la base de datos: ${username}`);
      const [rows] = await db.execute(
        "SELECT * FROM usuario WHERE username = ?",
        [username],
      );

      if (rows.length === 0) {
        log(`❌ Login fallido: usuario no encontrado`);
        return res.status(401).json({ error: "User not found" });
      }

      const user = rows[0];
      log(`🔐 Verificando contraseña para usuario: ${username}`);
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        log(`❌ Login fallido: contraseña incorrecta para: ${username}`);
        return res.status(401).json({ error: "Invalid password" });
      }

      log(`🔑 Generando token JWT para: ${username}`);
      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          username: user.username,
          tipo_usuario: user.tipo_usuario,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      log(`✅ Login exitoso para: ${username}, tipo: ${user.tipo_usuario}`);
      res.json({
        message: "Login successful",
        token,
        user: {
          id_usuario: user.id_usuario,
          username: user.username,
          tipo_usuario: user.tipo_usuario,
        },
      });
    } finally {
      log(`🔄 Liberando conexión a la base de datos`);
      db.release(); // Liberar la conexión al pool
    }
  } catch (error) {
    handleError(res, error, "Login failed");
  }
});

// Middleware para manejar errores seguro (nunca muestra detalles en producción)
app.use((err, req, res, next) => {
  // Logging detallado para depuración interna
  log(`❌ Error: ${err.message}`);
  log(`📍 Ruta: ${req.method} ${req.originalUrl}`);
  log(`🌐 IP: ${req.ip}`);
  log(`🔍 User-Agent: ${req.get('User-Agent')}`);
  
  // En desarrollo, mostrar más detalles
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    console.error(err.stack);
  }
  
  // Respuesta segura para el cliente
  const status = err.status || 500;
  let message = 'Error interno del servidor';
  
  // Mensajes específicos para errores comunes (sin revelar información sensible)
  if (err.message === 'No permitido por CORS') {
    message = 'Origen no permitido';
  } else if (err.status === 400) {
    message = 'Solicitud inválida';
  } else if (err.status === 401) {
    message = 'No autorizado';
  } else if (err.status === 403) {
    message = 'Acceso prohibido';
  } else if (err.status === 404) {
    message = 'Recurso no encontrado';
  } else if (isDevelopment) {
    message = err.message; // Solo en desarrollo
  }
  
  res.status(status).json({ 
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  log(`✅ Servidor iniciado en ${HOST}:${PORT}`);
  log(`🌐 Entorno: ${process.env.NODE_ENV || "development"}`);
  log(`📡 Servidor listo para recibir conexiones`);
});

// Manejar cierre ordenado
process.on("SIGTERM", () => {
  log(`⚠️ Señal SIGTERM recibida, cerrando servidor...`);
  server.close(() => {
    log(`✅ Servidor cerrado correctamente`);
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  log(`⚠️ Señal SIGINT recibida, cerrando servidor...`);
  server.close(() => {
    log(`✅ Servidor cerrado correctamente`);
    process.exit(0);
  });
});

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  log(`💥 Error no capturado: ${error.message}`);
  console.error(error.stack);
  logStream.write(`UNCAUGHT EXCEPTION: ${error.stack}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log(`💥 Promesa rechazada no manejada: ${reason}`);
  console.error("Promesa:", promise);
  logStream.write(
    `UNHANDLED REJECTION: ${reason}\nPromise: ${JSON.stringify(promise)}\n`,
  );
  process.exit(1);
});
