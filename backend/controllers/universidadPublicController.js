const Universidad = require("../models/universidadModel");

const handleError = async (res, error, message) => {
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

// @desc    Get all universities (public access - read only)
// @route   GET /api/public/universidades
// @access  Public
exports.getAllUniversidadesPublic = async (req, res) => {
  try {
    const { limit = 1000 } = req.query;
    
    const options = {
      searchTerm: "",
      page: 1,
      limit: parseInt(limit, 10),
      onlyWithAdmin: false,
    };

    const result = await Universidad.findAll(options);
    res.status(200).json(result);
  } catch (error) {
    await handleError(res, error, "Failed to retrieve universities");
  }
};

// @desc    Get a single university by ID (public access)
// @route   GET /api/public/universidades/:id
// @access  Public
exports.getUniversidadByIdPublic = async (req, res) => {
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
    await handleError(res, error, "Failed to retrieve university");
  }
};