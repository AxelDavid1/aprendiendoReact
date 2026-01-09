const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Para cargar variables de entorno

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

// Configuración CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

log(`🔄 CORS configurado: ${JSON.stringify(corsOptions.origin)}`);

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  log(`📨 ${req.method} ${req.originalUrl}`);

  // Registrar el cuerpo de la solicitud solo para POST, PUT, PATCH
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    // No mostrar contraseñas en logs
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "********";
    if (safeBody.password_hash) safeBody.password_hash = "********";
    log(`📦 Body: ${JSON.stringify(safeBody)}`);
  }

  // Registrar la respuesta
  const originalSend = res.send;
  res.send = function (body) {
    let safeResponse = body;
    try {
      if (typeof body === "string") {
        const parsed = JSON.parse(body);
        if (parsed.token) parsed.token = "********";
        safeResponse = JSON.stringify(parsed);
      }
    } catch (e) {
      // No es JSON, enviar como está
    }
    log(
      `📤 Respuesta [${res.statusCode}]: ${typeof safeResponse === "string" ? safeResponse.substring(0, 200) : "[No string]"}${typeof safeResponse === "string" && safeResponse.length > 200 ? "..." : ""}`,
    );
    return originalSend.call(this, body);
  };

  next();
});

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
log(`🔌 Rutas configuradas en la aplicación`);

log(`💾 Conectando a la base de datos...`);
// El pool de conexiones ahora se importa desde su propio módulo en config/db.js
const pool = require("./config/db");
log(`✅ Conexión a la base de datos establecida`);

// Clave JWT desde variable de entorno
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "0d86c1e9aaf0192c1234673d06d6ed452beb5ca2a12014cfa913818b114444bd7a6ee2c64fde53f98503a98a153754becdf0fe8ec53304adb233f0c4fec0bf31";

log(`🔑 Clave JWT configurada`);

// Validar tipo_usuario y estatus
const validTipoUsuario = [
  "alumno",
  "maestro",
  "admin_universidad",
  "admin_sedeq",
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
app.post("/signup", async (req, res) => {
  log(`👤 Solicitud de registro recibida`);
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
app.post("/login", async (req, res) => {
  log(`🔐 Solicitud de login recibida`);
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

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  handleError(res, err, "Internal Server Error");
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
