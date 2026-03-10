const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const domainController = require("../controllers/domainController");
const { protect, admin, isSedeqAdmin } = require("../middleware/authMiddleware.js");
const { validateRequest } = require("../middleware/validationMiddleware");
const { loginSchema, signupSchema, createUserSchema } = require("../config/schemas");

router.get("/usuarios/:id", protect, isSedeqAdmin, userController.getUserById); // Ruta para obtener usuario por ID
router.get("/usuarios", protect, isSedeqAdmin, userController.getUsers); // Ruta para obtener usuarios (incluyendo administradores)
router.post("/usuarios", protect, isSedeqAdmin, validateRequest(createUserSchema), userController.createUser); // Ruta para crear nuevos usuarios (incluye admins)
router.put("/usuarios/:id", protect, isSedeqAdmin, userController.updateUser); // Ruta para actualizar usuarios
router.delete("/usuarios/:id", protect, isSedeqAdmin, userController.deleteUser); // Ruta para eliminar usuarios
router.post("/auth/google", userController.googleAuth);
router.post("/auth/google-signup", validateRequest(signupSchema), userController.googleSignUp);
router.post("/admin_login", validateRequest(loginSchema), userController.login);

// Nueva ruta para obtener información completa del usuario autenticado
router.get("/auth/me", protect, userController.getMe);

router.get(
  "/admin/domains",
  domainController.verifyAdmin,
  domainController.getDomains,
);
router.post(
  "/admin/domains",
  domainController.verifyAdmin,
  domainController.addDomain,
);
router.put(
  "/admin/domains/:id",
  domainController.verifyAdmin,
  domainController.updateDomain,
);
router.delete(
  "/admin/domains/:id",
  domainController.verifyAdmin,
  domainController.deleteDomain,
);

module.exports = router;
