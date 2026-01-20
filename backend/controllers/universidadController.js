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

// @desc    Get all universities with pagination and search
// @route   GET /api/universidades
// @access  Public
exports.getAllUniversidades = async (req, res) => {
  try {
    const { searchTerm = "", page = 1, limit = 10, onlyWithAdmin = false } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const finalLimit = parsedLimit > 999 ? null : parsedLimit;

    const options = {
      searchTerm,
      page: parseInt(page, 10),
      limit: finalLimit,
      onlyWithAdmin: onlyWithAdmin === 'true' || onlyWithAdmin === true, // ✅ Nuevo parámetro
    };

    const result = await Universidad.findAll(options);
    res.status(200).json(result);
  } catch (error) {
    await handleError(res, error, "Failed to retrieve universities", null);
  }
};

// @desc    Get a single university by ID
// @route   GET /api/universidades/:id
// @access  Public
exports.getUniversidadById = async (req, res) => {
  try {
    const { id } = req.params;
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
// @access  Private/Admin (should be protected)
exports.createUniversidad = async (req, res) => {
  let connection;
  try {
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
    await handleError(res, error, "Failed to create university", connection);
  }
};

// @desc    Update a university and its admin user
// @route   PUT /api/universidades/:id
// @access  Private/Admin (should be protected)
exports.updateUniversidad = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const existingUniversity = await Universidad.findById(id);
    if (!existingUniversity) {
      const err = new Error("University not found");
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const { email_admin, password, ...universityUpdateData } = req.body;

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

    await User.createOrUpdateAdmin(id, email_admin, password, connection);

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
// @access  Private/Admin
exports.deleteUniversidad = async (req, res) => {
  try {
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
// @access  Private/Admin
exports.deleteUniversidadAdmin = async (req, res) => {
  let connection;
  try {
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