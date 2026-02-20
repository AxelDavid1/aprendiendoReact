const pool = require("../config/db");

// @desc    Obtener métricas generales de contratación para SEDEQ o Universidad
// @route   GET /api/analytics/hiring
exports.getHiringMetrics = async (req, res) => {
    const { id_universidad } = req.query; // Si viene, filtramos por esa universidad

    try {
        let whereClause = "";
        let params = [];

        if (id_universidad) {
            whereClause = "JOIN alumno a ON v.id_alumno = a.id_alumno WHERE a.id_universidad = ?";
            params = [id_universidad];
        }

        // 1. Alumnos activamente en prácticas (Status 'Practicante')
        const [activeInternships] = await pool.query(
            `SELECT COUNT(*) as total FROM vinculacion_empresa_alumno v 
             ${id_universidad ? 'JOIN alumno a ON v.id_alumno = a.id_alumno' : ''}
             WHERE ${id_universidad ? 'a.id_universidad = ? AND ' : ''} v.cat_estatus = 'Practicante'`,
            params
        );

        // 2. Prácticas Finalizadas (Status 'Finalizado')
        const [completedInternships] = await pool.query(
            `SELECT COUNT(*) as total FROM vinculacion_empresa_alumno v 
             ${id_universidad ? 'JOIN alumno a ON v.id_alumno = a.id_alumno' : ''}
             WHERE ${id_universidad ? 'a.id_universidad = ? AND ' : ''} v.cat_estatus = 'Finalizado'`,
            params
        );

        // 3. Distribución por universidad (solo si no se filtró por una) - Basado en Finalizado
        let universityDist = [];
        if (!id_universidad) {
            [universityDist] = await pool.query(`
                SELECT uni.nombre, COUNT(*) as contrataciones
                FROM vinculacion_empresa_alumno v
                JOIN alumno a ON v.id_alumno = a.id_alumno
                JOIN universidad uni ON a.id_universidad = uni.id_universidad
                WHERE v.cat_estatus = 'Finalizado'
                GROUP BY uni.id_universidad
                ORDER BY contrataciones DESC
            `);
        }

        // 4. Distribución por áreas (Subgrupos y habilidades demandadas)
        const [demandRaw] = await pool.query(`
            SELECT 
                s.id_subgrupo, s.nombre_subgrupo, 
                h.id_habilidad, h.nombre_habilidad,
                fc.id_vinculo
            FROM feedback_contratacion fc
            JOIN vinculacion_empresa_alumno v ON fc.id_vinculo = v.id_vinculo
            JOIN subgrupos_operadores s ON fc.id_subgrupo = s.id_subgrupo
            LEFT JOIN habilidades_clave h ON fc.id_habilidad = h.id_habilidad
            ${id_universidad ? 'JOIN alumno a ON v.id_alumno = a.id_alumno WHERE a.id_universidad = ?' : ''}
        `, params);

        const subgroupMap = {};

        demandRaw.forEach(row => {
            if (!subgroupMap[row.id_subgrupo]) {
                subgroupMap[row.id_subgrupo] = {
                    nombre_subgrupo: row.nombre_subgrupo,
                    vinculos: new Set(),
                    skills: {}
                };
            }
            subgroupMap[row.id_subgrupo].vinculos.add(row.id_vinculo);

            if (row.id_habilidad) {
                if (!subgroupMap[row.id_subgrupo].skills[row.id_habilidad]) {
                    subgroupMap[row.id_subgrupo].skills[row.id_habilidad] = {
                        nombre_habilidad: row.nombre_habilidad,
                        count: 0
                    };
                }
                subgroupMap[row.id_subgrupo].skills[row.id_habilidad].count++;
            }
        });

        const subgroupDist = Object.values(subgroupMap)
            .map(sub => ({
                nombre_subgrupo: sub.nombre_subgrupo,
                contrataciones: sub.vinculos.size,
                habilidades: Object.values(sub.skills).sort((a,b) => b.count - a.count)
            }))
            .sort((a, b) => b.contrataciones - a.contrataciones);

        res.json({
            summary: {
                activeInternships: activeInternships[0].total,
                completedInternships: completedInternships[0].total
            },
            universityDist,
            subgroupDist
        });
    } catch (error) {
        console.error("Error fetching hiring metrics:", error);
        res.status(500).json({ error: "Error al obtener métricas de contratación." });
    }
};

// @desc    Obtener brechas de habilidades (Gaps) basadas en feedback empresarial
// @route   GET /api/analytics/skill-gaps
exports.getSkillGaps = async (req, res) => {
    const { id_universidad } = req.query;

    try {
        let params = [];
        let uniFilter = "";
        if (id_universidad) {
            uniFilter = "JOIN vinculacion_empresa_alumno v ON s.id_vinculo = v.id_vinculo JOIN alumno a ON v.id_alumno = a.id_alumno WHERE a.id_universidad = ?";
            params = [id_universidad];
        }

        // 1. Promedio de calificaciones por pregunta (tipo rango)
        const [avgRatings] = await pool.query(`
            SELECT p.pregunta, AVG(r.valor_rango) as promedio, COUNT(*) as total_respuestas
            FROM feedback_respuesta r
            JOIN feedback_pregunta p ON r.id_pregunta = p.id_pregunta
            JOIN feedback_submission s ON r.id_submission = s.id_submission
            ${id_universidad ? 'JOIN vinculacion_empresa_alumno v ON s.id_vinculo = v.id_vinculo JOIN alumno a ON v.id_alumno = a.id_alumno' : ''}
            WHERE p.tipo = 'rango' ${id_universidad ? 'AND a.id_universidad = ?' : ''}
            GROUP BY p.id_pregunta
            ORDER BY promedio ASC
        `, params);

        // 2. Comentarios cualitativos recientes (áreas de mejora)
        const [qualitativeFeedback] = await pool.query(`
            SELECT r.valor_texto, p.pregunta, s.fecha_completado
            FROM feedback_respuesta r
            JOIN feedback_pregunta p ON r.id_pregunta = p.id_pregunta
            JOIN feedback_submission s ON r.id_submission = s.id_submission
            ${id_universidad ? 'JOIN vinculacion_empresa_alumno v ON s.id_vinculo = v.id_vinculo JOIN alumno a ON v.id_alumno = a.id_alumno' : ''}
            WHERE p.tipo = 'texto' AND r.valor_texto IS NOT NULL AND r.valor_texto != ''
            ${id_universidad ? 'AND a.id_universidad = ?' : ''}
            ORDER BY s.fecha_completado DESC
            LIMIT 20
        `, params);

        res.json({
            avgRatings,
            qualitativeFeedback
        });
    } catch (error) {
        console.error("Error fetching skill gaps:", error);
        res.status(500).json({ error: "Error al obtener brechas de habilidades." });
    }
};
