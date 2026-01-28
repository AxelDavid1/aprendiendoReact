const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const cache = require("../config/cache");
require("dotenv").config();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "0d86c1e9aaf0192c1234673d06d6ed452beb5ca2a12014cfa913818b114444bd7a6ee2c64fde53f98503a98a153754becdf0fe8ec53304adb233f0c4fec0bf31";

exports.verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token de autorización requerido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!["admin_universidad", "admin_sedeq"].includes(decoded.tipo_usuario)) {
      return res
        .status(403)
        .json({ error: "Acceso denegado: Solo administradores" });
    }

    // Obtener datos completos del usuario desde la BD
    const [users] = await pool.execute(
      "SELECT id_usuario, username, email, tipo_usuario, id_universidad FROM usuario WHERE id_usuario = ?",
      [decoded.id_usuario],
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error("verifyAdmin: Error:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};

exports.getDomains = async (req, res) => {
  try {
    const { universidadId } = req.query;
    const db = await pool.getConnection();
    try {
      let query = `
        SELECT d.id_dominio, d.dominio, d.estatus, d.id_universidad, u.nombre AS nombre_universidad 
        FROM dominiosUniversidades d
        LEFT JOIN universidad u ON d.id_universidad = u.id_universidad
      `;
      
      const params = [];
      
      // Si se proporciona universidadId, filtrar por esa universidad
      if (universidadId) {
        query += ` WHERE d.id_universidad = ?`;
        params.push(universidadId);
      }
      
      query += ` ORDER BY d.dominio ASC`;
      
      const [rows] = await db.execute(query, params);
      res.json(rows);
    } finally {
      db.release();
    }
  } catch (error) {
    console.error("getDomains: Error:", error.message);
    res.status(500).json({ error: "Error al obtener dominios" });
  }
};

exports.addDomain = async (req, res) => {
  const { dominio, estatus, id_universidad } = req.body;

  if (!dominio) {
    return res.status(400).json({ error: "El dominio es requerido" });
  }
  if (estatus && !["activo", "inactivo"].includes(estatus)) {
    return res.status(400).json({ error: "Estado no válido" });
  }
  if (!id_universidad) {
    return res.status(400).json({ error: "La universidad es requerida" });
  }

  // Validación para admin_universidad: solo puede crear dominios de su universidad
  if (req.user.tipo_usuario === 'admin_universidad' && req.user.id_universidad) {
    if (parseInt(id_universidad) !== parseInt(req.user.id_universidad)) {
      return res.status(403).json({ error: "Solo puede crear dominios de tu universidad" });
    }
  }

  try {
    const db = await pool.getConnection();
    try {
      const [existing] = await db.execute(
        "SELECT * FROM dominiosUniversidades WHERE dominio = ?",
        [dominio],
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: "El dominio ya existe" });
      }

      const [result] = await db.execute(
        "INSERT INTO dominiosUniversidades (dominio, estatus, id_universidad) VALUES (?, ?, ?)",
        [dominio.toLowerCase(), estatus || "activo", id_universidad],
      );

      cache.clearDomainCache();

      res.status(201).json({
        message: "Dominio agregado exitosamente",
        id_dominio: result.insertId,
      });
    } finally {
      db.release();
    }
  } catch (error) {
    console.error("addDomain: Error:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El dominio ya existe" });
    }
    res.status(500).json({ error: "Error al agregar dominio" });
  }
};

exports.updateDomain = async (req, res) => {
  const { id } = req.params;
  const { dominio, estatus, id_universidad } = req.body;

  if (!dominio && !estatus && !id_universidad) {
    return res
      .status(400)
      .json({ error: "Se requiere al menos un campo para actualizar" });
  }
  if (estatus && !["activo", "inactivo"].includes(estatus)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const db = await pool.getConnection();
    try {
      const [existing] = await db.execute(
        "SELECT * FROM dominiosUniversidades WHERE id_dominio = ?",
        [id],
      );
      if (existing.length === 0) {
        return res.status(404).json({ error: "Dominio no encontrado" });
      }

      const domain = existing[0];

      // Validación para admin_universidad: solo puede actualizar dominios de su universidad
      if (req.user.tipo_usuario === 'admin_universidad' && req.user.id_universidad) {
        if (parseInt(domain.id_universidad) !== parseInt(req.user.id_universidad)) {
          return res.status(403).json({ error: "Solo puede actualizar dominios de tu universidad" });
        }
        
        // Si intenta cambiar la universidad, validar que sea a su universidad
        if (id_universidad && parseInt(id_universidad) !== parseInt(req.user.id_universidad)) {
          return res.status(403).json({ error: "Solo puede asignar dominios a tu universidad" });
        }
      }

      const updates = [];
      const params = [];
      if (dominio) {
        updates.push("dominio = ?");
        params.push(dominio.toLowerCase());
      }
      if (estatus) {
        updates.push("estatus = ?");
        params.push(estatus);
      }
      if (id_universidad) {
        updates.push("id_universidad = ?");
        params.push(id_universidad);
      }
      params.push(id);

      await db.execute(
        `UPDATE dominiosUniversidades SET ${updates.join(", ")} WHERE id_dominio = ?`,
        params,
      );

      cache.clearDomainCache();

      res.json({ message: "Dominio actualizado exitosamente" });
    } finally {
      db.release();
    }
  } catch (error) {
    console.error("updateDomain: Error:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El dominio ya existe" });
    }
    res.status(500).json({ error: "Error al actualizar dominio" });
  }
};

exports.deleteDomain = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await pool.getConnection();
    try {
      const [existing] = await db.execute(
        "SELECT * FROM dominiosUniversidades WHERE id_dominio = ?",
        [id],
      );
      if (existing.length === 0) {
        return res.status(404).json({ error: "Dominio no encontrado" });
      }

      const domain = existing[0];

      // Validación para admin_universidad: solo puede eliminar dominios de su universidad
      if (req.user.tipo_usuario === 'admin_universidad' && req.user.id_universidad) {
        if (parseInt(domain.id_universidad) !== parseInt(req.user.id_universidad)) {
          return res.status(403).json({ error: "Solo puede eliminar dominios de tu universidad" });
        }
      }

      await db.execute(
        "DELETE FROM dominiosUniversidades WHERE id_dominio = ?",
        [id],
      );

      cache.clearDomainCache();

      res.json({ message: "Dominio eliminado exitosamente" });
    } finally {
      db.release();
    }
  } catch (error) {
    console.error("deleteDomain: Error:", error.message);
    res.status(500).json({ error: "Error al eliminar dominio" });
  }
};

exports.clearDomainCache = cache.clearDomainCache;
