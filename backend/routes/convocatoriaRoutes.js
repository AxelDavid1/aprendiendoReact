const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
    getAllConvocatorias,
    getConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    deleteConvocatoria,
    getEstadoGeneralAlumno,
    solicitarInscripcionConvocatoria,
    getAllSolicitudes,
    updateSolicitudStatus,
    getConvocatoriasByUniversidad, // Nueva función
    updateConvocatoriaUniversidad, // Nueva función
    getSolicitudesByUniversidad, // Nueva función
} = require("../controllers/convocatoriaController");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "0d86c1e9aaf0192c1234673d06d6ed452beb5ca2a12014cfa913818b114444bd7a6ee2c64fde53f98503a98a153754becdf0fe8ec53304adb233f0c4fec0bf31";

// Middleware para verificar que el usuario es un administrador de SEDEQ.
const verifySEDEQAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({
                error: "Acceso denegado. Formato de token inválido o no proporcionado.",
            });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (req.user.tipo_usuario !== "admin_sedeq") {
            return res
                .status(403)
                .json({
                    error:
                        "Acceso prohibido. No tienes los permisos necesarios para esta acción.",
                });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ error: "Token expirado. Por favor, inicia sesión de nuevo." });
        }
        res.status(401).json({ error: "Token no válido." });
    }
};

// Middleware para verificar que el usuario es un alumno.
const verifyAlumno = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({
                error: "Acceso denegado. Formato de token inválido o no proporcionado.",
            });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (req.user.tipo_usuario !== "alumno") {
            return res
                .status(403)
                .json({
                    error:
                        "Acceso prohibido. Solo los alumnos pueden realizar esta acción.",
                });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ error: "Token expirado. Por favor, inicia sesión de nuevo." });
        }
        res.status(401).json({ error: "Token no válido." });
    }
};

// Middleware para verificar que el usuario es un administrador de universidad.
const verifyUniversidadAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({
                error: "Acceso denegado. Formato de token inválido o no proporcionado.",
            });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (req.user.tipo_usuario !== "admin_universidad") {
            return res
                .status(403)
                .json({
                    error:
                        "Acceso prohibido. No tienes los permisos necesarios para esta acción.",
                });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ error: "Token expirado. Por favor, inicia sesión de nuevo." });
        }
        res.status(401).json({ error: "Token no válido." });
    }
};

// Middleware para verificar que el usuario puede gestionar solicitudes (SEDEQ o Universidad)
const verifySolicitudesAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({
                error: "Acceso denegado. Formato de token inválido o no proporcionado.",
            });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        if (req.user.tipo_usuario !== "admin_sedeq" && req.user.tipo_usuario !== "admin_universidad") {
            return res
                .status(403)
                .json({
                    error:
                        "Acceso prohibido. No tienes los permisos necesarios para esta acción.",
                });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(401)
                .json({ error: "Token expirado. Por favor, inicia sesión de nuevo." });
        }
        res.status(401).json({ error: "Token no válido." });
    }
};

// --- Definición de Rutas ---
// Rutas específicas PRIMERO (antes de /:id)
router.get("/solicitudes/all", verifySEDEQAdmin, getAllSolicitudes);
router.put("/solicitudes/:id", verifySolicitudesAdmin, updateSolicitudStatus);

// Rutas para alumnos (también específicas)
router.get("/alumno/estado-general", verifyAlumno, getEstadoGeneralAlumno);

// Rutas para admin_universidad
router.get("/universidad/mis-convocatorias", verifyUniversidadAdmin, getConvocatoriasByUniversidad);
router.get("/universidad/mis-solicitudes", verifyUniversidadAdmin, getSolicitudesByUniversidad);

// Rutas públicas generales
router.get("/", getAllConvocatorias);
router.get("/:id", getConvocatoriaById);

// Rutas protegidas (solo para admin_sedeq)
router.post("/", verifySEDEQAdmin, createConvocatoria);
router.delete("/:id", verifySEDEQAdmin, deleteConvocatoria);

// Ruta de actualización que soporta ambos tipos de admin
router.put("/:id", verifySolicitudesAdmin, updateConvocatoriaUniversidad);

// Rutas para solicitar (específicas)
router.post("/:id/solicitar", verifyAlumno, solicitarInscripcionConvocatoria);


module.exports = router;
