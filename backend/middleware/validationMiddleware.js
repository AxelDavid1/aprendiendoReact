const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        error: "Error de validación",
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    // Fallback para otros errores inesperados
    console.error("Error inesperado en validación:", error);
    return res.status(500).json({ error: "Error interno durante la validación" });
  }
};

module.exports = { validateRequest };
