const Universidad = require("../models/universidadModel");
const User = require("../models/userModel");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const handleError = async (res, error, message, connection) => {
  if (connection) {
    await connection.rollback();
    connection.release();
  }
  console.error(message, error);
  const errorMessage =
    process.env.NODE_ENV === "production" && !(error && error.isOperational)
      ? "An unexpected error occurred."
      : error
        ? error.message
        : message;
  const statusCode = error && error.statusCode ? error.statusCode : 500;
  res.status(statusCode).json({ error: errorMessage });
};

// Helper function to get user's university ID
const getUserUniversityId = async (userId) => {
  const [users] = await pool.execute(
    "SELECT id_universidad FROM usuario WHERE id_usuario = ? AND tipo_usuario = 'admin_universidad'",
    [userId]
  );
  return users.length > 0 ? users[0].id_universidad : null;
};

// @desc    Get all universities with pagination and search
// @route   GET /api/universidades
// @access  Private (Admin)
exports.getAllUniversidades = async (req, res) => {
  try {
    const { searchTerm = "", page = 1, limit = 10, onlyWithAdmin = false } = req.query;

    // Si es admin_universidad, solo puede ver su universidad
    if (req.user.tipo_usuario === 'admin_universidad') {
      const userUniversityId = await getUserUniversityId(req.user.id_usuario);
      if (!userUniversityId) {
        return res.status(403).json({ error: "No tienes una universidad asignada." });
      }
      
      const university = await Universidad.findById(userUniversityId);
      if (!university) {
        return res.status(404).json({ error: "Universidad no encontrada." });
      }
      
      return res.status(200).json({
        universities: [university],
        total: 1,
        page: 1,
        totalPages: 1
      });
    }

    // Para admin_sedeq, mantener la lógica actual
    const parsedLimit = parseInt(limit, 10);
    const finalLimit = parsedLimit > 999 ? null : parsedLimit;

    const options = {
      searchTerm,
      page: parseInt(page, 10),
      limit: finalLimit,
      onlyWithAdmin: onlyWithAdmin === 'true' || onlyWithAdmin === true,
    };

    const result = await Universidad.findAll(options);
    res.status(200).json(result);
  } catch (error) {
    await handleError(res, error, "Failed to retrieve universities", null);
  }
};

// @desc    Get a single university by ID
// @route   GET /api/universidades/:id
// @access  Private (Admin)
exports.getUniversidadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Si es admin_universidad, verificar que solo pueda ver su universidad
    if (req.user.tipo_usuario === 'admin_universidad') {
      const userUniversityId = await getUserUniversityId(req.user.id_usuario);
      if (!userUniversityId || parseInt(id) !== userUniversityId) {
        return res.status(403).json({ error: "No puedes ver esta universidad." });
      }
    }

    const universidad = await Universidad.findById(id);
    if (!universidad) {
      const err = new Error("University not found");
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    res.status(200).json(universidad);
  } catch (error) {
    await handleError(res, error, "Failed to retrieve university", null);
  }
};

// @desc    Create a new university and its admin user
// @route   POST /api/universidades
// @access  Private (SEDEQ Admin only)
exports.createUniversidad = async (req, res) => {
  try {
    // Solo admin_sedeq puede crear universidades
    if (req.user.tipo_usuario !== 'admin_sedeq') {
      return res.status(403).json({ error: "Solo el administrador de SEDEQ puede crear universidades." });
    }

    let connection;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const {
      nombre,
      clave_universidad,
      direccion,
      telefono,
      email_contacto,
      ubicacion,
      email_admin,
      password,
    } = req.body;

    if (!nombre || !clave_universidad) {
      const err = new Error(
        "Missing required fields: nombre and clave_universidad are required.",
      );
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const universityData = {
      nombre,
      clave_universidad,
      direccion,
      telefono,
      email_contacto,
      ubicacion,
      logo_url: req.file ? `/uploads/logos/${req.file.filename}` : null,
    };
    const { id_universidad } = await Universidad.create(
      universityData,
      connection,
    );

    if (email_admin && password) {
      await User.createOrUpdateAdmin(
        id_universidad,
        email_admin,
        password,
        connection,
      );
    }

    await connection.commit();
    connection.release();

    const newUniversity = await Universidad.findById(id_universidad);
    res.status(201).json(newUniversity);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Failed to delete orphaned file after transaction rollback:",
            req.file.path,
          );
      });
    }
    if (error.code === "ER_DUP_ENTRY") {
      error.message =
        "A university or user with that key/email already exists.";
      error.statusCode = 409;
      error.isOperational = true;
    }
    await handleError(res, error, "Failed to create university", null);
  }
};

// @desc    Update a university and its admin user
// @route   PUT /api/universidades/:id
// @access  Private (Admin)
exports.updateUniversidad = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    // Si es admin_universidad, verificar que solo pueda editar su universidad
    if (req.user.tipo_usuario === 'admin_universidad') {
      const userUniversityId = await getUserUniversityId(req.user.id_usuario);
      if (!userUniversityId || parseInt(id) !== userUniversityId) {
        return res.status(403).json({ error: "No puedes editar esta universidad." });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const existingUniversity = await Universidad.findById(id);
    if (!existingUniversity) {
      const err = new Error("University not found");
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const { email_admin, password, clave_universidad, ...universityUpdateData } = req.body;

    // Restricciones para admin_universidad
    if (req.user.tipo_usuario === 'admin_universidad') {
      // No puede cambiar clave_universidad
      if (clave_universidad && clave_universidad !== existingUniversity.clave_universidad) {
        return res.status(403).json({ error: "No puedes modificar la clave de la universidad." });
      }
      
      // No puede cambiar email_admin (solo SEDEQ puede asignar administradores)
      if (email_admin && email_admin !== existingUniversity.email_admin) {
        return res.status(403).json({ error: "No puedes modificar el email del administrador." });
      }
    } else {
      // Para admin_sedeq, permitir cambiar clave_universidad si se proporciona
      if (clave_universidad) {
        universityUpdateData.clave_universidad = clave_universidad;
      }
    }

    if (req.file) {
      universityUpdateData.logo_url = `/uploads/logos/${req.file.filename}`;
      if (existingUniversity.logo_url) {
        const oldLogoPath = path.join(
          __dirname,
          "..",
          existingUniversity.logo_url,
        );
        fs.unlink(oldLogoPath, (err) => {
          if (err) console.error("Failed to delete old logo:", oldLogoPath);
        });
      }
    }

    await Universidad.update(id, universityUpdateData, connection);

    // Solo admin_sedex puede modificar administradores
    if (req.user.tipo_usuario === 'admin_sedeq') {
      await User.createOrUpdateAdmin(id, email_admin, password, connection);
    } else if (password) {
      // admin_universidad puede cambiar su propia contraseña
      await User.createOrUpdateAdmin(id, existingUniversity.email_admin, password, connection);
    }

    await connection.commit();
    connection.release();

    const updatedUniversidad = await Universidad.findById(id);
    res.status(200).json(updatedUniversidad);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      error.message =
        "Update failed. A university or user with that key/email already exists.";
      error.statusCode = 409;
      error.isOperational = true;
    }
    await handleError(res, error, "Failed to update university", connection);
  }
};

// @desc    Delete a university
// @route   DELETE /api/universidades/:id
// @access  Private (SEDEQ Admin only)
exports.deleteUniversidad = async (req, res) => {
  try {
    // Solo admin_sedeq puede eliminar universidades
    if (req.user.tipo_usuario !== 'admin_sedeq') {
      return res.status(403).json({ error: "Solo el administrador de SEDEQ puede eliminar universidades." });
    }

    const { id } = req.params;
    const university = await Universidad.findById(id);
    if (!university) {
      const err = new Error("University not found");
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const result = await Universidad.remove(id);

    if (result.affectedRows === 0) {
      const err = new Error("Deletion failed, university not found.");
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (university.logo_url) {
      const logoPath = path.join(__dirname, "..", university.logo_url);
      fs.unlink(logoPath, (err) => {
        if (err) console.error("Failed to delete logo file:", logoPath, err);
      });
    }

    res.status(200).json({ message: "University deleted successfully" });
  } catch (error) {
    await handleError(res, error, "Failed to delete university", null);
  }
};

// @desc    Delete an admin user for a specific university
// @route   DELETE /api/universidades/:id/admin
// @access  Private (SEDEQ Admin only)
exports.deleteUniversidadAdmin = async (req, res) => {
  let connection;
  try {
    // Solo admin_sedeq puede eliminar administradores
    if (req.user.tipo_usuario !== 'admin_sedeq') {
      return res.status(403).json({ error: "Solo el administrador de SEDEQ puede eliminar administradores." });
    }

    const { id } = req.params;

    const university = await Universidad.findById(id);
    if (!university) {
      const err = new Error("University not found");
      err.statusCode = 404;
      throw err;
    }
    if (!university.email_admin) {
      const err = new Error("No admin is assigned to this university.");
      err.statusCode = 400;
      throw err;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const result = await User.deleteAdminByUniversityId(id, connection);

    if (result.affectedRows === 0) {
      const err = new Error("Deletion failed, administrator not found.");
      err.statusCode = 404;
      throw err;
    }

    await connection.commit();
    res.status(200).json({ message: "Administrator deleted successfully" });
  } catch (error) {
    await handleError(res, error, "Failed to delete administrator", connection);
  } finally {
    if (connection) connection.release();
  }
};