const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Función auxiliar para manejar errores de forma consistente
const handleError = (res, error, message = "Error en el servidor") => {
  console.error(error);
  res.status(500).json({ error: message });
};

// Obtener todos los maestros con paginación y búsqueda
exports.getMaestros = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    searchTerm = "",
    id_carrera,
    id_universidad,
    id_facultad,
  } = req.query;
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;
  const isUniversityAdmin = req.user?.tipo_usuario === "admin_universidad";

  try {
    const db = await pool.getConnection();
    try {
      let countSql =
        "SELECT COUNT(*) AS total FROM maestro m JOIN usuario u ON m.id_usuario = u.id_usuario";
      let dataSql =
        `SELECT 
          m.*, 
          u.email, 
          u.username, 
          u.tipo_usuario, 
          uni.nombre AS nombre_universidad,
          fac.nombre AS nombre_facultad,
          car.nombre AS nombre_carrera
         FROM maestro m 
         JOIN usuario u ON m.id_usuario = u.id_usuario 
         JOIN universidad uni ON m.id_universidad = uni.id_universidad
         LEFT JOIN facultades fac ON m.id_facultad = fac.id_facultad
         LEFT JOIN carreras car ON m.id_carrera = car.id_carrera`;

      const whereClauses = [];
      const params = [];

      if (searchTerm) {
        whereClauses.push(
          "(m.nombre_completo LIKE ? OR m.especialidad LIKE ? OR u.email LIKE ?)",
        );
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }

      if (isUniversityAdmin) {
        if (!req.user.id_universidad) {
          return res.status(403).json({
            error: "No tienes una universidad asignada.",
          });
        }
        whereClauses.push("m.id_universidad = ?");
        params.push(parseInt(req.user.id_universidad, 10));
      } else if (id_universidad) {
        whereClauses.push("m.id_universidad = ?");
        params.push(parseInt(id_universidad, 10));
      }

      if (id_facultad) {
        whereClauses.push("m.id_facultad = ?");
        params.push(parseInt(id_facultad, 10));
      }

      if (id_carrera) {
        whereClauses.push("m.id_carrera = ?");
        params.push(parseInt(id_carrera, 10));
      }

      if (whereClauses.length > 0) {
        const whereSql = " WHERE " + whereClauses.join(" AND ");
        countSql += whereSql;
        dataSql += whereSql;
      }

      dataSql += ` LIMIT ? OFFSET ?`;
      params.push(parsedLimit, offset);

      const [totalResult] = await db.execute(countSql, params.slice(0, -2));
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / parsedLimit);

      const [maestros] = await db.execute(dataSql, params);

      res.json({
        maestros,
        total,
        page: parsedPage,
        totalPages,
      });
    } finally {
      db.release();
    }
  } catch (error) {
    handleError(res, error, "Error al obtener maestros");
  }
};

// Obtener una lista simple de todos los maestros (para dropdowns)
exports.getMaestrosList = async (req, res) => {
  try {
    const db = await pool.getConnection();
    try {
      const [maestros] = await db.execute(
        "SELECT id_maestro, nombre_completo FROM maestro ORDER BY nombre_completo ASC",
      );
      res.json(maestros);
    } finally {
      db.release();
    }
  } catch (error) {
    handleError(res, error, "Error al obtener la lista de maestros");
  }
};

// Crear un nuevo maestro
exports.createMaestro = async (req, res) => {
  const {
    nombre_completo,
    email_institucional,
    especialidad,
    grado_academico,
    id_universidad,
    id_facultad,
    id_carrera,
    fecha_ingreso,
    password,
  } = req.body;
  const isUniversityAdmin = req.user?.tipo_usuario === "admin_universidad";
  const resolvedUniversityId = isUniversityAdmin
    ? req.user.id_universidad
    : id_universidad;

  if (
    !nombre_completo ||
    !email_institucional ||
    !resolvedUniversityId ||
    !grado_academico
  ) {
    return res.status(400).json({
      error:
        "Nombre completo, email institucional, universidad y grado académico son requeridos.",
    });
  }

  if (isUniversityAdmin && !req.user.id_universidad) {
    return res
      .status(403)
      .json({ error: "No tienes una universidad asignada." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.execute(
      "SELECT id_usuario FROM usuario WHERE email = ? OR username = ?",
      [email_institucional, email_institucional],
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con este email o username." });
    }

    const userPassword = password || Math.random().toString(36).slice(-10);
    const password_hash = await bcrypt.hash(userPassword, 10);

    const [userResult] = await connection.execute(
      "INSERT INTO usuario (username, email, password_hash, tipo_usuario, estatus, id_universidad) VALUES (?, ?, ?, ?, ?, ?)",
      [
        email_institucional,
        email_institucional,
        password_hash,
        "maestro",
        "activo",
        resolvedUniversityId,
      ],
    );
    const id_usuario = userResult.insertId;

    const [maestroResult] = await connection.execute(
      "INSERT INTO maestro (id_usuario, id_universidad, id_facultad, id_carrera, nombre_completo, email_institucional, especialidad, grado_academico, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id_usuario,
        resolvedUniversityId,
        id_facultad || null,
        id_carrera || null,
        nombre_completo,
        email_institucional,
        especialidad || null,
        grado_academico,
        fecha_ingreso || new Date().toISOString().slice(0, 10),
      ],
    );

    await connection.commit();
    res.status(201).json({
      message: "Maestro creado con éxito.",
      id_maestro: maestroResult.insertId,
      id_usuario: id_usuario,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Ya existe un maestro o usuario con este email institucional.",
      });
    }
    handleError(res, error, "Error al crear el maestro.");
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar un maestro
exports.updateMaestro = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_completo,
    email_institucional,
    especialidad,
    grado_academico,
    id_universidad,
    id_facultad,
    id_carrera,
    password,
  } = req.body;
  const isUniversityAdmin = req.user?.tipo_usuario === "admin_universidad";

  // --- LOG PARA DEPURACIÓN ---
  console.log(`[Debug] Actualizando maestro ID: ${id}`);
  console.log("[Debug] Body recibido:", req.body);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingMaestro] = await connection.execute(
      "SELECT id_usuario, id_universidad FROM maestro WHERE id_maestro = ?",
      [id],
    );

    if (existingMaestro.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Maestro no encontrado." });
    }
    const id_usuario = existingMaestro[0].id_usuario;
    const maestroUniversityId = existingMaestro[0].id_universidad;

    if (
      isUniversityAdmin &&
      (!req.user.id_universidad ||
        parseInt(req.user.id_universidad, 10) !==
          parseInt(maestroUniversityId, 10))
    ) {
      await connection.rollback();
      return res.status(403).json({
        error: "No puedes editar maestros de otra universidad.",
      });
    }

    const userUpdates = [];
    const userParams = [];

    if (email_institucional) {
      const [duplicateUser] = await connection.execute(
        "SELECT id_usuario FROM usuario WHERE (email = ? OR username = ?) AND id_usuario != ?",
        [email_institucional, email_institucional, id_usuario],
      );
      if (duplicateUser.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          error: "El nuevo email o username ya está en uso por otro usuario.",
        });
      }
      userUpdates.push("email = ?", "username = ?");
      userParams.push(email_institucional, email_institucional);
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      userUpdates.push("password_hash = ?");
      userParams.push(password_hash);
    }
    if (id_universidad && !isUniversityAdmin) {
      userUpdates.push("id_universidad = ?");
      userParams.push(id_universidad);
    }

    if (userUpdates.length > 0) {
      userParams.push(id_usuario);
      await connection.execute(
        `UPDATE usuario SET ${userUpdates.join(", ")} WHERE id_usuario = ?`,
        userParams,
      );
    }

    const maestroUpdates = [];
    const maestroParams = [];

    // Lógica mejorada para permitir actualizar a null
    if (req.body.hasOwnProperty('nombre_completo')) { maestroUpdates.push("nombre_completo = ?"); maestroParams.push(nombre_completo); }
    if (req.body.hasOwnProperty('email_institucional')) { maestroUpdates.push("email_institucional = ?"); maestroParams.push(email_institucional); }
    if (req.body.hasOwnProperty('especialidad')) { maestroUpdates.push("especialidad = ?"); maestroParams.push(especialidad); }
    if (req.body.hasOwnProperty('grado_academico')) { maestroUpdates.push("grado_academico = ?"); maestroParams.push(grado_academico); }
    if (req.body.hasOwnProperty('id_universidad') && !isUniversityAdmin) { maestroUpdates.push("id_universidad = ?"); maestroParams.push(id_universidad); }
    if (req.body.hasOwnProperty('id_facultad')) { maestroUpdates.push("id_facultad = ?"); maestroParams.push(id_facultad || null); }
    if (req.body.hasOwnProperty('id_carrera')) { maestroUpdates.push("id_carrera = ?"); maestroParams.push(id_carrera || null); }


    if (maestroUpdates.length === 0 && userUpdates.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "No hay datos para actualizar." });
    }

    if (maestroUpdates.length > 0) {
        maestroParams.push(id);
        await connection.execute(
          `UPDATE maestro SET ${maestroUpdates.join(", ")} WHERE id_maestro = ?`,
          maestroParams,
        );
    }

    await connection.commit();
    res.status(200).json({ message: "Maestro actualizado con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    handleError(res, error, "Error al actualizar el maestro.");
  } finally {
    if (connection) connection.release();
  }
};

// Eliminar un maestro (y su usuario asociado)
exports.deleteMaestro = async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [maestroRows] = await connection.execute(
      "SELECT id_usuario, id_universidad FROM maestro WHERE id_maestro = ?",
      [id],
    );

    if (maestroRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Maestro no encontrado." });
    }
    const id_usuario_asociado = maestroRows[0].id_usuario;
    const maestroUniversityId = maestroRows[0].id_universidad;

    if (
      req.user?.tipo_usuario === "admin_universidad" &&
      (!req.user.id_universidad ||
        parseInt(req.user.id_universidad, 10) !==
          parseInt(maestroUniversityId, 10))
    ) {
      await connection.rollback();
      return res.status(403).json({
        error: "No puedes eliminar maestros de otra universidad.",
      });
    }

    await connection.execute("DELETE FROM maestro WHERE id_maestro = ?", [id]);
    await connection.execute("DELETE FROM usuario WHERE id_usuario = ?", [
      id_usuario_asociado,
    ]);

    await connection.commit();
    res
      .status(200)
      .json({ message: "Maestro y usuario asociado eliminados con éxito." });
  } catch (error) {
    if (connection) await connection.rollback();
    handleError(res, error, "Error al eliminar el maestro.");
  } finally {
    if (connection) connection.release();
  }
};