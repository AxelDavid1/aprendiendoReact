const express = require("express");
const router = express.Router();
const {
  getAllUniversidadesPublic,
  getUniversidadByIdPublic,
} = require("../controllers/universidadPublicController");

// Public routes for universities (read-only access)
router
  .route("/universidades")
  .get(getAllUniversidadesPublic);

router
  .route("/universidades/:id")
  .get(getUniversidadByIdPublic);

module.exports = router;