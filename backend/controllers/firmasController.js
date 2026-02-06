const Firmas = require("../models/firmasModel");
const multer = require("multer");

// Configurar multer para almacenar archivos en memoria como buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen."), false);
    }
  },
}).single("firma"); // 'firma' es el nombre del campo en el formulario

exports.subirFirma = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { tipo_firma, id_universidad } = req.body;
      const user = req.user; // Asumimos que el middleware de auth ya pobló req.user

      if (!tipo_firma || !req.file) {
        return res
          .status(400)
          .json({ message: "El tipo de firma y el archivo son obligatorios." });
      }

      // Validaciones de permisos
      if (user.tipo_usuario === "admin_universidad") {
        if (tipo_firma === "sedeq") {
          return res.status(403).json({
            message: "No tiene permisos para subir firmas de tipo SEDEQ.",
          });
        }
        // Un admin de universidad solo puede subir firmas para su propia universidad
        if (String(id_universidad) !== String(user.id_universidad)) {
          return res
            .status(403)
            .json({ message: "No puede subir firmas para otra universidad." });
        }
      } else if (user.tipo_usuario === "admin_sedeq") {
        if (tipo_firma !== "sedeq" && !id_universidad) {
          return res.status(400).json({
            message:
              "Debe especificar una universidad para este tipo de firma.",
          });
        }
      }

      const imagen_blob = req.file.buffer;
      const id_univ = tipo_firma === "sedeq" ? null : id_universidad;

      const firmaId = await Firmas.create(tipo_firma, imagen_blob, id_univ);

      res.status(201).json({ message: "Firma subida exitosamente.", firmaId });
    } catch (error) {
      console.error("Error al subir la firma:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  });
};

exports.verificarFirmaExistente = async (req, res) => {
  try {
    const { tipo_firma, id_universidad } = req.query;
    const user = req.user;

    if (!tipo_firma) {
      return res
        .status(400)
        .json({ message: "El tipo de firma es obligatorio." });
    }

    // Validar permisos
    if (user.tipo_usuario === "admin_universidad") {
      if (tipo_firma === "sedeq") {
        return res.status(403).json({
          message: "No tiene permisos para verificar firmas de tipo SEDEQ.",
        });
      }
      if (String(id_universidad) !== String(user.id_universidad)) {
        return res
          .status(403)
          .json({ message: "No puede verificar firmas de otra universidad." });
      }
    }

    const id_univ = tipo_firma === "sedeq" ? null : id_universidad;
    const firmaExistente = await Firmas.findExisting(tipo_firma, id_univ);

    if (firmaExistente) {
      return res.status(200).json({
        exists: true,
        firma: {
          id_firma: firmaExistente.id_firma,
          fecha_subida: firmaExistente.fecha_subida,
        },
      });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Error al verificar firma existente:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.reemplazarFirma = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { tipo_firma, id_universidad } = req.body;
      const user = req.user;

      if (!tipo_firma || !req.file) {
        return res
          .status(400)
          .json({ message: "El tipo de firma y el archivo son obligatorios." });
      }

      // Validaciones de permisos (igual que en subirFirma)
      if (user.tipo_usuario === "admin_universidad") {
        if (tipo_firma === "sedeq") {
          return res.status(403).json({
            message: "No tiene permisos para subir firmas de tipo SEDEQ.",
          });
        }
        if (String(id_universidad) !== String(user.id_universidad)) {
          return res
            .status(403)
            .json({ message: "No puede subir firmas para otra universidad." });
        }
      } else if (user.tipo_usuario === "admin_sedeq") {
        if (tipo_firma !== "sedeq" && !id_universidad) {
          return res.status(400).json({
            message:
              "Debe especificar una universidad para este tipo de firma.",
          });
        }
      }

      const imagen_blob = req.file.buffer;
      const id_univ = tipo_firma === "sedeq" ? null : id_universidad;

      // Eliminar firma anterior si existe
      await Firmas.removeExisting(tipo_firma, id_univ);

      // Crear la nueva firma
      const firmaId = await Firmas.create(tipo_firma, imagen_blob, id_univ);

      res
        .status(201)
        .json({ message: "Firma reemplazada exitosamente.", firmaId });
    } catch (error) {
      console.error("Error al reemplazar la firma:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  });
};

exports.obtenerFirmas = async (req, res) => {
  try {
    const user = req.user;
    console.log("🔍 obtenerFirmas - Usuario:", user.tipo_usuario, user.id_usuario, "id_universidad:", user.id_universidad);
    
    let firmas;
    if (user.tipo_usuario === "admin_sedeq") {
      console.log("📋 Ejecutando findAll() para admin_sedeq");
      firmas = await Firmas.findAll();
      console.log("📊 Resultado findAll:", firmas.length, "firmas");
      firmas.forEach(f => console.log("  -", f.tipo_firma, f.id_universidad, f.nombre_universidad || "SEDEQ"));
    } else if (user.tipo_usuario === "admin_universidad") {
      console.log("📋 Ejecutando findForUniversity para admin_universidad:", user.id_universidad);
      firmas = await Firmas.findForUniversity(user.id_universidad);
      console.log("📊 Resultado universidad:", firmas.length, "firmas");
      firmas.forEach(f => console.log("  -", f.tipo_firma, f.id_universidad, f.nombre_universidad));
    } else {
      return res.status(403).json({ message: "Acceso no autorizado." });
    }

    console.log("📦 Total firmas a enviar:", firmas.length);
    firmas.forEach(f => console.log("  FINAL -", f.tipo_firma, f.id_universidad, f.nombre_universidad || "SEDEQ"));

    // Convertir BLOB a base64 para enviar al frontend
    const firmasConImagen = firmas.map((firma) => {
      const firmaData = {
        id_firma: firma.id_firma,
        tipo_firma: firma.tipo_firma,
        id_universidad: firma.id_universidad,
        nombre_universidad: firma.nombre_universidad,
        logo_universidad: firma.logo_universidad,
        fecha_subida: firma.fecha_subida,
        imagen_url: null,
      };

      if (firma.imagen_blob) {
        firmaData.imagen_url = `data:image/png;base64,${firma.imagen_blob.toString("base64")}`;
      }

      return firmaData;
    });

    console.log("📤 Enviando", firmasConImagen.length, "firmas al frontend");
    res.status(200).json(firmasConImagen);
  } catch (error) {
    console.error("❌ Error en obtenerFirmas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.eliminarFirma = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const firma = await Firmas.findById(id);
    if (!firma) {
      return res.status(404).json({ message: "Firma no encontrada." });
    }

    // Validar permisos
    if (user.tipo_usuario === "admin_universidad") {
      if (String(firma.id_universidad) !== String(user.id_universidad)) {
        return res
          .status(403)
          .json({ message: "No tiene permisos para eliminar esta firma." });
      }
    }
    // admin_sedeq puede eliminar cualquier firma

    await Firmas.remove(id);
    res.status(200).json({ message: "Firma eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar la firma:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
