const pool = require("../config/db");
const Empresa = require("../models/empresaModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

// @desc    Buscar alumnos potenciales con filtros avanzados
// @route   GET /api/empresa/search-students
exports.searchStudents = async (req, res) => {
    const {
        searchTerm = "",
        id_subgrupo,
        habilidades, // Array of IDs
        id_universidad,
        min_progress = 0, // % of a credential? Or just "has finished at least 1 course"
        page = 1,
        limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    try {
        let whereClauses = ["u.tipo_usuario = 'alumno'", "u.estatus = 'activo'"];
        let queryParams = [];

        if (searchTerm) {
            whereClauses.push("(a.nombre_completo LIKE ? OR u.email LIKE ?)");
            queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        if (id_universidad) {
            whereClauses.push("a.id_universidad = ?");
            queryParams.push(id_universidad);
        }

        // Filter by subgroup involvement (student has finished at least one course in this subgroup)
        if (id_subgrupo) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM constancia_alumno ca
                JOIN curso c ON ca.id_curso = c.id_curso
                WHERE ca.id_alumno = a.id_alumno AND c.id_subgrupo = ?
            )`);
            queryParams.push(id_subgrupo);
        }

        // Filter by skills (student has finished courses that grant these skills)
        if (habilidades) {
            const habIds = Array.isArray(habilidades) ? habilidades : habilidades.split(',');
            if (habIds.length > 0) {
                const placeholders = habIds.map(() => "?").join(",");
                whereClauses.push(`EXISTS (
                    SELECT 1 FROM constancia_alumno ca
                    JOIN curso_habilidades_clave chc ON ca.id_curso = chc.id_curso
                    WHERE ca.id_alumno = a.id_alumno AND chc.id_habilidad IN (${placeholders})
                )`);
                queryParams.push(...habIds);
            }
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // Main Query
        const sql = `
            SELECT 
                a.id_alumno, a.nombre_completo, a.matricula, a.correo_institucional,
                u.email as correo_usuario, uni.nombre as nombre_universidad,
                uni.tipo_periodo, car.nombre as nombre_carrera, car.duracion_periodos,
                a.semestre_actual,
                (SELECT COUNT(*) FROM constancia_alumno WHERE id_alumno = a.id_alumno) as cursos_terminados,
                (SELECT COUNT(*) FROM certificacion_alumno WHERE id_alumno = a.id_alumno AND estatus = 'completada') as credenciales_obtenidas
            FROM alumno a
            JOIN usuario u ON a.id_usuario = u.id_usuario
            JOIN universidad uni ON a.id_universidad = uni.id_universidad
            LEFT JOIN carreras car ON a.id_carrera = car.id_carrera
            ${whereString}
            ORDER BY a.nombre_completo ASC
            LIMIT ? OFFSET ?
        `;

        const [students] = await pool.query(sql, [...queryParams, parseInt(limit), parseInt(offset)]);

        // Count for pagination
        const countSql = `
            SELECT COUNT(*) as total
            FROM alumno a
            JOIN usuario u ON a.id_usuario = u.id_usuario
            ${whereString}
        `;
        const [countResult] = await pool.query(countSql, queryParams);
        const total = countResult[0].total;

        res.json({
            students,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error searching students:", error);
        res.status(500).json({ error: "Error interno del servidor al buscar alumnos." });
    }
};

// @desc    Iniciar proceso de vinculación (Reclutar)
// @route   POST /api/empresa/recruit
exports.recruitStudent = async (req, res) => {
    const { id_alumno, id_empresa } = req.body;

    if (!id_alumno || !id_empresa) {
        return res.status(400).json({ error: "id_alumno e id_empresa son requeridos." });
    }

    try {
        // Verificar si ya existe una vinculación activa
        const [existing] = await pool.query(
            "SELECT id_vinculo FROM vinculacion_empresa_alumno WHERE id_alumno = (SELECT id_usuario FROM alumno WHERE id_alumno = ?) AND id_empresa = ? AND cat_estatus != 'Finalizado'",
            [id_alumno, id_empresa]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Ya existe un proceso de vinculación activo con este alumno." });
        }

        await pool.query(
            "INSERT INTO vinculacion_empresa_alumno (id_empresa, id_alumno, cat_estatus) VALUES (?, (SELECT id_usuario FROM alumno WHERE id_alumno = ?), 'Contactado')",
            [id_empresa, id_alumno]
        );

        res.status(201).json({ message: "Alumno reclutado exitosamente. Se ha iniciado el seguimiento." });
    } catch (error) {
        console.error("Error recruiting student:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar el reclutamiento." });
    }
};

// @desc    Obtener vinculaciones de una empresa
// @route   GET /api/empresa/vinculaciones/:id_empresa
exports.getVinculaciones = async (req, res) => {
    const { id_empresa } = req.params;

    try {
        const sql = `
            SELECT 
                v.*, 
                a.nombre_completo as nombre_alumno,
                a.correo_personal as email,
                uni.nombre as nombre_universidad,
                car.nombre as nombre_carrera,
                EXISTS(SELECT 1 FROM feedback_submission fs WHERE fs.id_vinculo = v.id_vinculo) as encuesta_completada
            FROM vinculacion_empresa_alumno v
            JOIN alumno a ON v.id_alumno = a.id_usuario
            JOIN universidad uni ON a.id_universidad = uni.id_universidad
            LEFT JOIN carreras car ON a.id_carrera = car.id_carrera
            WHERE v.id_empresa = ?
            ORDER BY v.fecha_inicio DESC
        `;
        const [rows] = await pool.query(sql, [id_empresa]);
        res.json(rows);
    } catch (error) {
        console.error("Error getting vinculaciones:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener vinculaciones." });
    }
};

// @desc    Actualizar estatus de vinculación
// @route   PATCH /api/empresa/vinculacion/:id_vinculo/status
exports.updateVinculacionStatus = async (req, res) => {
    const { id_vinculo } = req.params;
    const { status, es_exito_plataforma } = req.body;

    const validStatuses = ['Contactado', 'Entrevista', 'Practicante', 'Finalizado'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Estatus de vinculación no válido." });
    }

    try {
        // Bloquear cambio si ya hay encuesta resuelta
        const [existingSurvey] = await pool.query(
            "SELECT 1 FROM feedback_submission WHERE id_vinculo = ?",
            [id_vinculo]
        );
        if (existingSurvey.length > 0) {
            return res.status(403).json({ error: "No se puede cambiar el estatus después de haber enviado la evaluación de desempeño." });
        }

        let updateSql = "UPDATE vinculacion_empresa_alumno SET cat_estatus = ?";
        let params = [status];

        if (es_exito_plataforma !== undefined) {
            updateSql += ", es_exito_plataforma = ?";
            params.push(es_exito_plataforma ? 1 : 0);
        }

        if (status === 'Finalizado' || status === 'Contratado') {
            updateSql += ", fecha_fin = NOW()";
        }

        updateSql += " WHERE id_vinculo = ?";
        params.push(id_vinculo);

        const [result] = await pool.query(updateSql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vinculación no encontrada." });
        }

        res.json({ message: "Estatus actualizado correctamente." });
    } catch (error) {
        console.error("Error updating vinculacion status:", error);
        res.status(500).json({ error: "Error interno del servidor al actualizar estatus." });
    }
};

// @desc    Obtener preguntas de feedback
// @route   GET /api/empresa/feedback-questions
exports.getFeedbackQuestions = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM feedback_pregunta WHERE activo = 1");
        res.json(rows);
    } catch (error) {
        console.error("Error getting feedback questions:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener preguntas." });
    }
};

// @desc    Enviar respuestas de feedback
// @route   POST /api/empresa/feedback
exports.submitFeedback = async (req, res) => {
    const { id_vinculo, respuestas, demandData } = req.body; // demandData: [{id_subgrupo, id_habilidad}, ...]

    if (!id_vinculo || !respuestas || !Array.isArray(respuestas)) {
        return res.status(400).json({ error: "id_vinculo y respuestas son requeridos." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Crear el submission
        const [subResult] = await connection.query(
            "INSERT INTO feedback_submission (id_vinculo) VALUES (?)",
            [id_vinculo]
        );
        const id_submission = subResult.insertId;

        // 2. Insertar respuestas
        const respValues = respuestas.map(r => [
            id_submission, 
            r.id_pregunta, 
            r.valor_rango || null, 
            r.valor_texto || null
        ]);

        await connection.query(
            "INSERT INTO feedback_respuesta (id_submission, id_pregunta, valor_rango, valor_texto) VALUES ?",
            [respValues]
        );

        // 3. Insertar datos de demanda (si existen)
        if (demandData && Array.isArray(demandData) && demandData.length > 0) {
            const demandValues = demandData.map(d => [
                id_vinculo,
                d.id_subgrupo,
                d.id_habilidad || null
            ]);
            await connection.query(
                "INSERT INTO feedback_contratacion (id_vinculo, id_subgrupo, id_habilidad) VALUES ?",
                [demandValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Feedback enviado correctamente. ¡Gracias!" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error submitting feedback:", error);
        res.status(500).json({ error: "Error interno del servidor al enviar feedback." });
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Obtener perfil de la empresa
// @route   GET /api/empresa/profile/:id_empresa
exports.getCompanyProfile = async (req, res) => {
    const { id_empresa } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM empresa WHERE id_empresa = ?", [id_empresa]);
        if (rows.length === 0) return res.status(404).json({ error: "Empresa no encontrada." });
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching company profile:", error);
        res.status(500).json({ error: "Error al obtener perfil de empresa." });
    }
};

// @desc    Actualizar perfil de la empresa
// @route   PUT /api/empresa/profile/:id_empresa
exports.updateCompanyProfile = async (req, res) => {
    const { id_empresa } = req.params;
    const { nombre, descripcion, sitio_web, sector } = req.body;
    try {
        await pool.query(
            "UPDATE empresa SET nombre = ?, descripcion = ?, sitio_web = ?, sector = ? WHERE id_empresa = ?",
            [nombre, descripcion, sitio_web, sector, id_empresa]
        );
        res.json({ message: "Perfil actualizado correctamente." });
    } catch (error) {
        console.error("Error updating company profile:", error);
        res.status(500).json({ error: "Error al actualizar perfil de empresa." });
    }
};
// @desc    Obtener detalles de un estudiante (perfil completo para empresa)
// @route   GET /api/empresa/student/:id_alumno/details
exports.getStudentDetails = async (req, res) => {
    const { id_alumno } = req.params;
    try {
        const sql = `
            SELECT 
                a.id_alumno, a.nombre_completo, a.matricula, a.correo_institucional, a.correo_personal,
                uni.nombre as nombre_universidad, uni.tipo_periodo,
                car.nombre as nombre_carrera, car.duracion_periodos, a.semestre_actual
            FROM alumno a
            JOIN universidad uni ON a.id_universidad = uni.id_universidad
            LEFT JOIN carreras car ON a.id_carrera = car.id_carrera
            WHERE a.id_alumno = ?
        `;
        const [studentRows] = await pool.query(sql, [id_alumno]);
        if (studentRows.length === 0) return res.status(404).json({ error: "Estudiante no encontrado." });

        const student = studentRows[0];

        // Obtener cursos completados
        const coursesSql = `
            SELECT c.nombre_curso, ca.fecha_emitida
            FROM constancia_alumno ca
            JOIN curso c ON ca.id_curso = c.id_curso
            WHERE ca.id_alumno = ?
            ORDER BY ca.fecha_emitida DESC
        `;
        const [courses] = await pool.query(coursesSql, [id_alumno]);

        res.json({
            ...student,
            completedCourses: courses
        });
    } catch (error) {
        console.error("Error fetching student details:", error);
        res.status(500).json({ error: "Error al obtener detalles del estudiante." });
    }
};

// ==========================================================
// MÓDULO SEDEQ: Gestión de Empresas (CRUD)
// ==========================================================

// @desc    Obtener todas las empresas (paginado con búsqueda)
// @route   GET /api/empresa/sedeq-manage
exports.getAllEmpresas = async (req, res) => {
    try {
        const { page = 1, limit = 10, searchTerm = "" } = req.query;
        // if limit === '9999', we can pass null to get all
        const parsedLimit = parseInt(limit) > 1000 ? null : parseInt(limit);
        
        const result = await Empresa.findAll({
            searchTerm,
            page: parseInt(page),
            limit: parsedLimit
        });
        res.json(result);
    } catch (error) {
        console.error("Error fetching companies for SEDEQ:", error);
        res.status(500).json({ error: "Error al obtener empresas." });
    }
};

// @desc    Crear una nueva empresa y su admin opcionalmente
// @route   POST /api/empresa/sedeq-manage
exports.createEmpresa = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { nombre, sector, descripcion, sitio_web, email_admin, password } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio." });
        }

        const empresaData = {
            nombre,
            sector: sector || null,
            descripcion: descripcion || null,
            web_url: sitio_web || null,
            logo_url: req.file ? `/uploads/logos/${req.file.filename}` : null
        };

        const { id_empresa } = await Empresa.create(empresaData, connection);

        if (email_admin && password) {
            await User.createOrUpdateAdmin(id_empresa, email_admin, password, connection, 'admin_empresa');
        }

        await connection.commit();
        res.status(201).json({ id_empresa, message: "Empresa creada exitosamente." });
    } catch (error) {
        if (connection) await connection.rollback();
        
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error eliminando archivo tras rollback:", err);
            });
        }
        console.error("Error creating company:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Ya existe una empresa o usuario con ese nombre/email." });
        }
        res.status(500).json({ error: "Error interno al crear empresa." });
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Actualizar empresa (y su admin)
// @route   PUT /api/empresa/sedeq-manage/:id
exports.updateEmpresa = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { nombre, sector, descripcion, sitio_web, email_admin, password } = req.body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const existingCompany = await Empresa.findById(id);
        if (!existingCompany) {
            return res.status(404).json({ error: "Empresa no encontrada." });
        }

        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (sector !== undefined) updateData.sector = sector;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (sitio_web !== undefined) updateData.web_url = sitio_web;

        if (req.file) {
            updateData.logo_url = `/uploads/logos/${req.file.filename}`;
            if (existingCompany.logo_url) {
                const oldPath = path.join(__dirname, "..", existingCompany.logo_url);
                fs.unlink(oldPath, err => {
                    if (err) console.error("Error deleting old logo:", err);
                });
            }
        }

        await Empresa.update(id, updateData, connection);

        if (email_admin || password) {
            await User.createOrUpdateAdmin(id, email_admin || existingCompany.email_admin, password, connection, 'admin_empresa');
        }

        await connection.commit();
        res.json({ message: "Empresa actualizada exitosamente." });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error updating company:", error);
        
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error eliminando archivo tras rollback:", err);
            });
        }
        res.status(500).json({ error: "Error interno al actualizar empresa." });
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Eliminar una empresa
// @route   DELETE /api/empresa/sedeq-manage/:id
exports.deleteEmpresa = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const existingCompany = await Empresa.findById(id);
        if (!existingCompany) {
            return res.status(404).json({ error: "Empresa no encontrada." });
        }

        await Empresa.delete(id, connection);
        
        if (existingCompany.logo_url) {
            const oldPath = path.join(__dirname, "..", existingCompany.logo_url);
            fs.unlink(oldPath, err => {
                 if (err) console.error("Error deleting old logo:", err);
            });
        }

        await connection.commit();
        res.json({ message: "Empresa eliminada exitosamente." });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error deleting company:", error);
        res.status(500).json({ error: "Error interno al eliminar empresa." });
    } finally {
        if (connection) connection.release();
    }
};
