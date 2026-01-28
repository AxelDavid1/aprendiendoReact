const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const logger = require("../config/logger");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "0d86c1e9aaf0192c1234673d06d6ed452beb5ca2a12014cfa913818b114444bd7a6ee2c64fde53f98503a98a153754becdf0fe8ec53304adb233f0c4fec0bf31";

const protect = async (req, res, next) => {
  let token;

  console.log("=== DEBUG AUTH MIDDLEWARE ===");
  console.log("Authorization header:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(" ")[1];

      console.log("Token extraído:", token ? "Presente" : "Ausente");
      console.log("Token length:", token ? token.length : 0);
      console.log(
        "Token preview:",
        token ? token.substring(0, 50) + "..." : "No token",
      );

      // Verificar el token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decodificado exitosamente:", decoded);

      // Obtener datos del usuario desde la BD para asegurar que existe y tener datos frescos
      const [users] = await pool.query(
        "SELECT id_usuario, username, email, tipo_usuario, id_universidad FROM usuario WHERE id_usuario = ?",
        [decoded.id_usuario],
      );

      if (users.length === 0) {
        return res.status(401).json({ error: "Usuario no encontrado." });
      }

      req.user = users[0]; // Adjuntamos el usuario al request

      // Si el usuario es un alumno, también adjuntamos su id_alumno para que las rutas de alumno sigan funcionando
      if (req.user.tipo_usuario === "alumno") {
        const [alumnos] = await pool.query(
          "SELECT id_alumno FROM alumno WHERE id_usuario = ?",
          [req.user.id_usuario],
        );
        if (alumnos.length > 0) {
          req.user.id_alumno = alumnos[0].id_alumno;
        }
      }

      console.log("Usuario autenticado:", req.user);
      console.log("=== FIN DEBUG AUTH MIDDLEWARE ===");
      next();
    } catch (error) {
      console.error("=== ERROR EN AUTH MIDDLEWARE ===");
      console.error("Error completo:", error);
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Token que falló:", token);
      console.error("=== FIN ERROR AUTH MIDDLEWARE ===");

      logger.error(`Error de autenticación: ${error.message}`);
      return res.status(401).json({ error: "No autorizado, el token falló." });
    }
  } else {
    console.log("No se encontró header de autorización válido");
    console.log("Headers recibidos:", Object.keys(req.headers));
    return res
      .status(401)
      .json({ error: "No autorizado, no se encontró token." });
  }
};

const isAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.tipo_usuario === "admin" ||
      req.user.tipo_usuario === "admin_sedeq")
  ) {
    next();
  } else {
    logger.warn(
      `Acceso no autorizado a ruta de admin por usuario: ${req.user ? req.user.id_usuario : "desconocido"}`,
    );
    res
      .status(403)
      .json({ error: "Acceso denegado. Se requiere rol de administrador." });
  }
};

const isSedeqAdmin = (req, res, next) => {
  if (req.user && req.user.tipo_usuario === "admin_sedeq") {
    next();
  } else {
    logger.warn(
      `Acceso no autorizado a ruta de SEDEQ por usuario: ${req.user ? req.user.id_usuario : "desconocido"}`,
    );
    res.status(403).json({
      error: "Acceso denegado. Se requiere rol de administrador SEDEQ.",
    });
  }
};

const isUniversityAdmin = (req, res, next) => {
  if (req.user && req.user.tipo_usuario === "admin_universidad") {
    next();
  } else {
    logger.warn(
      `Acceso no autorizado a ruta de universidad por usuario: ${req.user ? req.user.id_usuario : "desconocido"}`,
    );
    res.status(403).json({
      error:
        "Acceso denegado. Se requiere rol de administrador de universidad.",
    });
  }
};

// Nuevo middleware combinado para ambos tipos de administradores
const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.tipo_usuario === "admin_sedeq" ||
      req.user.tipo_usuario === "admin_universidad")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Acceso denegado. Se requiere rol de administrador." });
  }
};

module.exports = { protect, isAdmin, isSedeqAdmin, isUniversityAdmin, admin };
