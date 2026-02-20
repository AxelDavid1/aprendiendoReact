const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const cache = require("../config/cache");
require("dotenv").config();

const handleError = (res, error, message = "Error en el servidor") => {
  console.error(error);
  res.status(500).json({ error: message });
};

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "0d86c1e9aaf0192c1234673d06d6ed452beb5ca2a12014cfa913818b114444bd7a6ee2c64fde53f98503a98a153754becdf0fe8ec53304adb233f0c4fec0bf31";

const validTipoUsuario = [
  "alumno",
  "maestro",
  "admin_universidad",
  "admin_sedeq",
  "admin_empresa",
];

const validEstatus = ["activo", "inactivo", "pendiente", "suspendido"];

const esCorreoInstitucional = async (email) => {
  const dominio = email.split("@")[1]?.toLowerCase();
  if (!dominio) {
    console.log("esCorreoInstitucional: Invalid email format:", email);
    return false;
  }

  try {
    const { universityDomainsCache, lastCacheUpdate } = cache.getDomainsCache();
    const now = Date.now();

    if (
      universityDomainsCache &&
      lastCacheUpdate &&
      now - lastCacheUpdate < cache.CACHE_DURATION
    ) {
      console.log("esCorreoInstitucional: Using cached domains");
      return universityDomainsCache.includes(dominio);
    }

    console.log("esCorreoInstitucional: Fetching domains from database");
    const db = await pool.getConnection();
    try {
      const [rows] = await db.execute(
        "SELECT dominio FROM dominiosUniversidades WHERE estatus = 'activo'",
      );
      const domains = rows.map((row) => row.dominio.toLowerCase());
      cache.setDomainsCache(domains);
      return domains.includes(dominio);
    } finally {
      db.release();
    }
  } catch (error) {
    console.error(
      "esCorreoInstitucional: Error fetching domains:",
      error.message,
    );
    return false;
  }
};

exports.googleAuth = async (req, res) => {
  const { token } = req.body;

  console.log("Google Auth: Received token:", token);

  if (!token) {
    console.log("Google Auth: No token provided");
    return res.status(400).json({ error: "Google token is required" });
  }

  try {
    console.log(
      "Google Auth: Initializing OAuth2Client with client ID:",
      process.env.GOOGLE_CLIENT_ID,
    );
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log("Google Auth: Verifying token...");
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Google Auth: Token payload:", payload);

    const { email, name, sub: googleId } = payload;

    console.log("Google Auth: Validating email:", email);
    if (!(await esCorreoInstitucional(email))) {
      console.log("Google Auth: Non-institutional email detected:", email);
      return res.status(403).json({
        error:
          "Correo no institucional. Usa un correo de una universidad de Querétaro.",
      });
    }

    console.log("Google Auth: Connecting to database...");
    const db = await pool.getConnection();
    try {
      console.log(
        "Google Auth: Executing query for email:",
        email,
        "and google_id:",
        googleId,
      );
      const [existingUser] = await db.execute(
        "SELECT id_usuario, username, email, google_id, tipo_usuario, estatus FROM usuario WHERE email = ? OR google_id = ?",
        [email, googleId],
      );
      console.log("Google Auth: Query result:", existingUser);

      if (existingUser.length === 0) {
        console.log("Google Auth: User not found:", email);
        return res.status(404).json({ error: "Usuario no registrado" });
      }

      const user = existingUser[0];
      console.log("Google Auth: Existing user found:", user);

      if (user.estatus === "inactivo" || user.estatus === "suspendido") {
        console.log(
          "Google Auth: User account is inactive or suspended:",
          email,
        );
        return res.status(403).json({ error: "Cuenta inactiva o suspendida" });
      }

      if (user.estatus === "pendiente") {
        console.log(
          "Google Auth: User has a pending profile. Denying login and signaling to complete profile.",
        );
        return res.status(403).json({
          error: "PROFILE_INCOMPLETE",
          message: "El perfil del alumno debe ser completado antes de iniciar sesión.",
          user: { 
            id_usuario: user.id_usuario,
            username: user.username,
            email: user.email,
          },
        });
      }

      const userId = user.id_usuario;
      const username = user.username;
      const tipo_usuario = user.tipo_usuario;

      console.log("Google Auth: Generating JWT for user ID:", userId);
      const jwtToken = jwt.sign(
        {
          id_usuario: userId,
          username,
          tipo_usuario,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      console.log("Google Auth: Logging session for user ID:", userId);
      await db.execute(
        "INSERT INTO sesiones_usuario (id_usuario, fecha_login, estatus_sesion) VALUES (?, NOW(), 'activa')",
        [userId],
      );

      console.log("Google Auth: Success for user:", email);
      res.status(200).json({
        message: "Google Login successful",
        token: jwtToken,
        user: {
          id_usuario: userId,
          username,
          tipo_usuario,
        },
      });
    } finally {
      console.log("Google Auth: Releasing database connection");
      db.release();
    }
  } catch (error) {
    console.error("Google Auth: Error:", error.message, error.stack);
    if (
      error.name === "TokenError" ||
      error.message.includes("Invalid token")
    ) {
      console.log("Google Auth: Invalid Google token");
      return res.status(401).json({ error: "Token de Google inválido" });
    }
    res.status(500).json({ error: "Error en el servidor: " + error.message });
  }
};

exports.googleSignUp = async (req, res) => {
  const { token } = req.body;

  console.log("Google Sign-Up: Received token:", token);

  if (!token) {
    console.log("Google Sign-Up: No token provided");
    return res.status(400).json({ error: "Google token is required" });
  }

  try {
    console.log(
      "Google Sign-Up: Initializing OAuth2Client with client ID:",
      process.env.GOOGLE_CLIENT_ID,
    );
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log("Google Sign-Up: Verifying token...");
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Google Sign-Up: Token payload:", payload);

    const { email, name, sub: googleId } = payload;

    console.log("Google Sign-Up: Validating email:", email);
    if (!(await esCorreoInstitucional(email))) {
      console.log("Google Sign-Up: Non-institutional email detected:", email);
      return res.status(403).json({
        error:
          "Correo no institucional. Usa un correo de una universidad de Querétaro.",
      });
    }

    console.log("Google Sign-Up: Connecting to database...");
    const db = await pool.getConnection();
    try {
      console.log(
        "Google Sign-Up: Checking for existing user with email:",
        email,
        "or google_id:",
        googleId,
      );
      const [existingUser] = await db.execute(
        "SELECT * FROM usuario WHERE email = ? OR google_id = ?",
        [email, googleId],
      );

      if (existingUser.length > 0) {
        const user = existingUser[0];
        // Si el usuario existe pero su perfil está pendiente, permítele continuar.
        if (user.estatus === "pendiente") {
          console.log(
            "Google Sign-Up: User exists with pending status. Allowing profile completion.",
          );
          return res.status(200).json({ // Se envía 200 en lugar de 201
            message: "Google Sign-Up successful",
            user: {
              id_usuario: user.id_usuario,
              username: user.username,
              email: user.email,
              tipo_usuario: user.tipo_usuario,
            },
          });
        }
        console.log("Google Sign-Up: User already exists and is active:", email);
        // 409 Conflict es más semántico para un recurso que ya existe.
        return res.status(409).json({ error: "Usuario ya registrado" });
      }

      const username = name || email.split("@")[0];
      console.log(
        "Google Sign-Up: Inserting new user with username:",
        username,
      );
      const [result] = await db.execute(
        "INSERT INTO usuario (username, email, google_id, tipo_usuario, estatus) VALUES (?, ?, ?, ?, ?)",
        [username, email, googleId, "alumno", "pendiente"],
      );

      console.log("Google Sign-Up: Success for user:", email);
      res.status(201).json({
        message: "Google Sign-Up successful",
        user: {
          id_usuario: result.insertId,
          username,
          email,
          tipo_usuario: "alumno",
        },
      });
    } finally {
      console.log("Google Sign-Up: Releasing database connection");
      db.release();
    }
  } catch (error) {
    console.error("Google Sign-Up: Error:", error.message, error.stack);
    if (
      error.name === "TokenError" ||
      error.message.includes("Invalid token")
    ) {
      console.log("Google Sign-Up: Invalid Google token");
      return res.status(401).json({ error: "Token de Google inválido" });
    }
    if (error.code === "ER_DUP_ENTRY") {
      console.log("Google Sign-Up: Duplicate entry detected");
      return res.status(409).json({ error: "Usuario ya registrado" });
    }
    res.status(500).json({ error: "Error en el servidor: " + error.message });
  }
};

exports.getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    searchTerm = "",
    tipo_usuario = "",
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const db = await pool.getConnection();
    try {
      let countSql = "SELECT COUNT(*) AS total FROM usuario WHERE 1=1";
      let dataSql =
        "SELECT u.id_usuario, u.username, u.email, u.tipo_usuario, u.estatus, u.fecha_creacion, u.fecha_actualizacion, u.google_id, u.id_universidad, uni.nombre AS nombre_universidad FROM usuario u LEFT JOIN universidad uni ON u.id_universidad = uni.id_universidad WHERE 1=1";
      let params = [];

      if (searchTerm) {
        dataSql += " AND (u.username LIKE ? OR u.email LIKE ?)";
        countSql += " AND (username LIKE ? OR email LIKE ?)";
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      if (tipo_usuario && validTipoUsuario.includes(tipo_usuario)) {
        dataSql += " AND u.tipo_usuario = ?";
        countSql += " AND tipo_usuario = ?";
        params.push(tipo_usuario);
      }

      const [totalResult] = await db.execute(countSql, params);
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);

      dataSql += ` ORDER BY u.fecha_creacion DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));

      const [users] = await db.execute(dataSql, params);

      res.json({
        users,
        total,
        page: parseInt(page),
        totalPages,
      });
    } finally {
      db.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(
      `SELECT u.id_usuario, u.username, u.email, u.tipo_usuario, 
              u.id_universidad, uni.nombre as nombre_universidad
       FROM usuario u 
       LEFT JOIN universidad uni ON u.id_universidad = uni.id_universidad 
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};
// @desc    Crear un nuevo usuario (para gestión administrativa)
// @route   POST /api/usuarios
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  const { email, password, tipo_usuario, estatus, id_universidad } = req.body;

  if (!email || !password || !tipo_usuario) {
    return res
      .status(400)
      .json({ error: "Email, contraseña y tipo de usuario son requeridos." });
  }
  if (!validTipoUsuario.includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuario no válido." });
  }
  if (estatus && !validEstatus.includes(estatus)) {
    return res.status(400).json({ error: "Estado no válido." });
  }
  // For admin_universidad, id_universidad is required
  if (tipo_usuario === "admin_universidad" && !id_universidad) {
    return res.status(400).json({
      error: "Para 'admin_universidad', el ID de universidad es requerido.",
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const username = email; // Use email as username for consistency or specify in frontend
    const [existingUser] = await connection.execute(
      "SELECT id_usuario FROM usuario WHERE email = ? OR username = ?",
      [email, username],
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con este email o username." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      "INSERT INTO usuario (username, email, password_hash, tipo_usuario, estatus, id_universidad) VALUES (?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        password_hash,
        tipo_usuario,
        estatus || "activo",
        id_universidad || null,
      ],
    );

    await connection.commit();
    res.status(201).json({
      message: "Usuario creado con éxito.",
      id_usuario: result.insertId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con este email o username." });
    }
    handleError(res, error, "Error al crear el usuario.");
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Actualizar un usuario (para gestión administrativa)
// @route   PUT /api/usuarios/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, tipo_usuario, estatus, id_universidad } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ error: "ID de usuario requerido para la actualización." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.execute(
      "SELECT * FROM usuario WHERE id_usuario = ?",
      [id],
    );
    if (existingUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const updates = [];
    const params = [];

    if (email) {
      // Check for duplicate email/username if it's being changed
      const [duplicateUser] = await connection.execute(
        "SELECT id_usuario FROM usuario WHERE (email = ? OR username = ?) AND id_usuario != ?",
        [email, email, id],
      );
      if (duplicateUser.length > 0) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "El nuevo email o username ya está en uso." });
      }
      updates.push("email = ?", "username = ?");
      params.push(email, email);
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      params.push(password_hash);
    }
    if (tipo_usuario && validTipoUsuario.includes(tipo_usuario)) {
      updates.push("tipo_usuario = ?");
      params.push(tipo_usuario);
    }
    if (estatus && validEstatus.includes(estatus)) {
      updates.push("estatus = ?");
      params.push(estatus);
    }
    // Handle id_universidad. Can be set to NULL for admin_sedeq, or linked for admin_universidad
    // If id_universidad is explicitly null (e.g. from frontend form), set it to null in DB.
    // If it's undefined, it means it wasn't passed, so don't update.
    if (req.body.hasOwnProperty("id_universidad")) {
      // Check if the key exists in the body
      updates.push("id_universidad = ?");
      params.push(id_universidad); // Will be null if sent as null
    }

    if (updates.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "No hay datos para actualizar." });
    }

    params.push(id);
    await connection.execute(
      `UPDATE usuario SET ${updates.join(", ")} WHERE id_usuario = ?`,
      params,
    );

    await connection.commit();
    res.status(200).json({ message: "Usuario actualizado con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El email o username ya existe." });
    }
    handleError(res, error, "Error al actualizar el usuario.");
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Eliminar un usuario (para gestión administrativa)
// @route   DELETE /api/usuarios/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.execute(
      "SELECT id_usuario, tipo_usuario FROM usuario WHERE id_usuario = ?",
      [id],
    );
    if (existingUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Check if the user is an admin_sedeq. Prevent accidental deletion of primary admin.
    // This is a safety measure. You might want to adjust it based on your exact requirements.
    if (existingUser[0].tipo_usuario === "admin_sedeq") {
      // You might want to check if it's the *last* admin_sedeq before allowing deletion
      const [sedeqAdmins] = await connection.execute(
        "SELECT COUNT(*) as count FROM usuario WHERE tipo_usuario = 'admin_sedeq'",
      );
      if (sedeqAdmins[0].count <= 1) {
        await connection.rollback();
        return res.status(403).json({
          error: "No se puede eliminar el único administrador SEDEQ.",
        });
      }
    }

    await connection.execute("DELETE FROM usuario WHERE id_usuario = ?", [id]);

    await connection.commit();
    res.status(200).json({ message: "Usuario eliminado con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    handleError(res, error, "Error al eliminar el usuario.");
  } finally {
    if (connection) connection.release();
  }
};

// Keep signup and login for now, but can be removed later
exports.signup = async (req, res) => {
  const { username, email, password, tipo_usuario, estatus } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Nombre de usuario, correo, y contraseña son requeridos",
    });
  }
  if (!validTipoUsuario.includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuario no válido" });
  }
  if (estatus && !validEstatus.includes(estatus)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.execute(
      "SELECT * FROM usuario WHERE username = ? OR email = ?",
      [username, email],
    );
    if (existingUser.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      "INSERT INTO usuario (username, email, password_hash, tipo_usuario, estatus) VALUES (?, ?, ?, ?, ?)",
      [
        username,
        email,
        password_hash,
        tipo_usuario || "alumno",
        estatus || "pendiente",
      ],
    );

    await connection.commit();
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Usuario o correo electrónico ya existen" });
    }
    handleError(res, error, "Registro fallido");
  } finally {
    if (connection) connection.release();
  }
};

exports.login = async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res
      .status(400)
      .json({ error: "ID de usuario y contraseña son requeridos" });
  }

  try {
    const db = await pool.getConnection();
    try {
      const [rows] = await db.execute(
        "SELECT * FROM usuario WHERE username = ? OR email = ?",
        [loginId, loginId],
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      const user = rows[0];

      if (!user.password_hash) {
        return res.status(401).json({
          error: "Esta es una cuenta de Google. Inicia sesión con Google.",
        });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      if (
        !["maestro", "admin_universidad", "admin_sedeq", "admin_empresa"].includes(
          user.tipo_usuario,
        )
      ) {
        return res.status(403).json({
          error:
            "No tienes los permisos necesarios, unicamente puedes entrar si eres Maestro, Universidad, SEDEQ o Empresa",
        });
      }

      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          username: user.username,
          tipo_usuario: user.tipo_usuario,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      await db.execute(
        "INSERT INTO sesiones_usuario (id_usuario, fecha_login, estatus_sesion) VALUES (?, NOW(), 'activa')",
        [user.id_usuario],
      );

      res.json({
        message: "Login exitoso",
        token,
        user: {
          id_usuario: user.id_usuario,
          username: user.username,
          tipo_usuario: user.tipo_usuario,
          id_empresa: user.id_empresa,
        },
      });
    } finally {
      db.release();
    }
  } catch (error) {
    handleError(res, error, "Fallo el Login");
  }
};

// Obtener información completa del usuario autenticado
exports.getMe = async (req, res) => {
  try {
    // El middleware protect ya incluye toda la información del usuario en req.user
    // incluyendo id_maestro, id_alumno, id_universidad, etc.
    
    const user = req.user;
    
    // Construir respuesta con toda la información relevante
    const response = {
      id_usuario: user.id_usuario,
      username: user.username,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      id_universidad: user.id_universidad,
      id_maestro: user.id_maestro || null,
      id_alumno: user.id_alumno || null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error en getMe:", error);
    res.status(500).json({ error: "Error al obtener información del usuario" });
  }
};
