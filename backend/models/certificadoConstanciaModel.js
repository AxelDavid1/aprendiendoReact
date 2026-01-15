const pool = require("../config/db");

const getCursosParaConstancias = async (id_alumno) => {
  // Nota: Se han eliminado los comentarios internos para evitar errores de parseo SQL
  const query = `
    SELECT
      al.nombre_completo AS nombre_alumno,

      (SELECT COUNT(*)
       FROM calificaciones_actividades a
       WHERE a.id_calificaciones_curso = cal.id_calificaciones
       AND a.tipo_actividad = 'actividad'
      ) AS total_actividades,

      (SELECT COUNT(DISTINCT a.id_actividad)
       FROM entregas_estudiantes e
       INNER JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad
       WHERE e.id_inscripcion = i.id_inscripcion
       AND a.id_calificaciones_curso = cal.id_calificaciones
       AND e.estatus_entrega = 'calificada'
      ) AS actividades_calificadas,

      c.id_curso,
      c.nombre_curso,
      c.descripcion AS descripcion_curso,
      c.creditos_constancia AS creditos_otorgados,

      u.id_universidad,
      u.nombre AS nombre_universidad,
      u.logo_url AS logo_universidad,

      cal.umbral_aprobatorio,
      
      COALESCE(
        (
          COALESCE(
            (SELECT SUM(e.calificacion) 
             FROM entregas_estudiantes e
             JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad
             WHERE e.id_inscripcion = i.id_inscripcion 
             AND a.id_calificaciones_curso = cal.id_calificaciones
             AND a.tipo_actividad = 'actividad'
             AND e.estatus_entrega = 'calificada'), 0
          ) 
          / 
          NULLIF((SELECT COUNT(*) FROM calificaciones_actividades a 
                  WHERE a.id_calificaciones_curso = cal.id_calificaciones 
                  AND a.tipo_actividad = 'actividad'), 0)
        ) * (cal.porcentaje_actividades / 100), 
        0
      ) 
      +
      COALESCE(
        (
           COALESCE(
            (SELECT SUM(e.calificacion) 
             FROM entregas_estudiantes e
             JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad
             WHERE e.id_inscripcion = i.id_inscripcion 
             AND a.id_calificaciones_curso = cal.id_calificaciones
             AND a.tipo_actividad = 'proyecto'
             AND e.estatus_entrega = 'calificada'), 0
          )
        ) * (cal.porcentaje_proyecto / 100), 
        0
      ) AS calificacion_final,

      co.id_constancia,
      co.ruta_constancia,
      co.fecha_emitida,

      rc.id_certificacion AS id_credencial,
      (SELECT nombre FROM certificacion WHERE id_certificacion = rc.id_certificacion) AS nombre_credencial,
      (SELECT descripcion FROM certificacion WHERE id_certificacion = rc.id_certificacion) AS descripcion_credencial,
      (SELECT COUNT(*) FROM requisitos_certificado WHERE id_certificacion = rc.id_certificacion) AS total_cursos_credencial,
            
      CASE
        WHEN co.id_constancia IS NOT NULL THEN FALSE
        WHEN (
          (SELECT COUNT(*) FROM calificaciones_actividades
           WHERE id_calificaciones_curso = cal.id_calificaciones) =
          (SELECT COUNT(DISTINCT a.id_actividad)
           FROM entregas_estudiantes e
           INNER JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad
           WHERE e.id_inscripcion = i.id_inscripcion
           AND a.id_calificaciones_curso = cal.id_calificaciones
           AND e.estatus_entrega = 'calificada')
          AND
          (
            COALESCE(
              ((COALESCE((SELECT SUM(e.calificacion) FROM entregas_estudiantes e JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad WHERE e.id_inscripcion = i.id_inscripcion AND a.id_calificaciones_curso = cal.id_calificaciones AND a.tipo_actividad = 'actividad' AND e.estatus_entrega = 'calificada'), 0)) 
               / 
               NULLIF((SELECT COUNT(*) FROM calificaciones_actividades a WHERE a.id_calificaciones_curso = cal.id_calificaciones AND a.tipo_actividad = 'actividad'), 0)
              ) * (cal.porcentaje_actividades / 100), 
              0
            ) 
            +
            COALESCE(
              (COALESCE((SELECT SUM(e.calificacion) FROM entregas_estudiantes e JOIN calificaciones_actividades a ON e.id_actividad = a.id_actividad WHERE e.id_inscripcion = i.id_inscripcion AND a.id_calificaciones_curso = cal.id_calificaciones AND a.tipo_actividad = 'proyecto' AND e.estatus_entrega = 'calificada'), 0)) 
              * (cal.porcentaje_proyecto / 100), 
              0
            )
          ) >= cal.umbral_aprobatorio
        ) THEN TRUE
        ELSE FALSE
      END AS puede_generar

    FROM inscripcion i
    INNER JOIN alumno al ON i.id_alumno = al.id_alumno
    INNER JOIN curso c ON i.id_curso = c.id_curso
    INNER JOIN universidad u ON c.id_universidad = u.id_universidad
    INNER JOIN calificaciones_curso cal ON c.id_curso = cal.id_curso
    LEFT JOIN constancia_alumno co ON co.id_alumno = i.id_alumno AND co.id_curso = c.id_curso
    LEFT JOIN requisitos_certificado rc ON rc.id_curso = c.id_curso
    WHERE i.id_alumno = ?
    AND i.estatus_inscripcion = 'aprobada'
    ORDER BY c.nombre_curso ASC
  `;

  const [rows] = await pool.query(query, [id_alumno]);
  return rows;
};

const getCredencialesParaCertificados = async (id_alumno) => {
  const query = `
    SELECT
      cert.id_certificacion AS id_credencial,
      cert.nombre AS nombre_credencial,
      cert.descripcion AS descripcion_credencial,
      u.id_universidad,
      u.nombre AS nombre_universidad,
      u.logo_url AS logo_universidad,

      (SELECT COUNT(*)
       FROM requisitos_certificado rc
       WHERE rc.id_certificacion = cert.id_certificacion
      ) AS total_cursos,

      (SELECT COUNT(*)
       FROM requisitos_certificado rc
       INNER JOIN constancia_alumno co ON co.id_curso = rc.id_curso AND co.id_alumno = ?
       WHERE rc.id_certificacion = cert.id_certificacion
      ) AS cursos_completados,

      ca.id_cert_alumno AS id_certificacion_alumno,
      ca.ruta_certificado,
      ca.fecha_certificado,
      ca.completada,

      CASE
        WHEN ca.id_cert_alumno IS NOT NULL AND ca.completada = 1 THEN FALSE
        WHEN (
          (SELECT COUNT(*)
           FROM requisitos_certificado rc
           WHERE rc.id_certificacion = cert.id_certificacion
          ) =
          (SELECT COUNT(*)
           FROM requisitos_certificado rc
           INNER JOIN constancia_alumno co ON co.id_curso = rc.id_curso AND co.id_alumno = ?
           WHERE rc.id_certificacion = cert.id_certificacion
          )
          AND
          (SELECT COUNT(*)
           FROM requisitos_certificado rc
           WHERE rc.id_certificacion = cert.id_certificacion
          ) > 0
        ) THEN TRUE
        ELSE FALSE
      END AS puede_generar

    FROM certificacion cert
    INNER JOIN universidad u ON cert.id_universidad = u.id_universidad
    LEFT JOIN certificacion_alumno ca ON ca.id_certificacion = cert.id_certificacion AND ca.id_alumno = ?
    WHERE cert.estatus = 'activa'
    AND EXISTS (
      SELECT 1
      FROM requisitos_certificado rc
      INNER JOIN inscripcion i ON i.id_curso = rc.id_curso
      WHERE rc.id_certificacion = cert.id_certificacion
      AND i.id_alumno = ?
    )
    ORDER BY cert.nombre ASC
  `;

  const [rows] = await pool.query(query, [
    id_alumno,
    id_alumno,
    id_alumno,
    id_alumno,
  ]);
  return rows;
};

const getCursosDeCredencial = async (id_credencial, id_alumno) => {
  const query = `
    SELECT
      c.id_curso,
      c.nombre_curso,
      c.codigo_curso,
      rc.obligatorio,
      CASE
        WHEN co.id_constancia IS NOT NULL THEN TRUE
        ELSE FALSE
      END AS completado,
      co.creditos_otorgados,
      co.fecha_emitida
    FROM requisitos_certificado rc
    INNER JOIN curso c ON rc.id_curso = c.id_curso
    LEFT JOIN constancia_alumno co ON co.id_curso = c.id_curso AND co.id_alumno = ?
    WHERE rc.id_certificacion = ?
    ORDER BY rc.obligatorio DESC, c.nombre_curso ASC
  `;

  const [rows] = await pool.query(query, [id_alumno, id_credencial]);
  return rows;
};

const crearConstancia = async (data) => {
  const {
    id_alumno,
    id_curso,
    id_credencial,
    creditos_otorgados,
    ruta_constancia,
  } = data;

  const query = `
    INSERT INTO constancia_alumno
    (id_alumno, id_curso, id_credencial, progreso, creditos_otorgados, ruta_constancia)
    VALUES (?, ?, ?, 100.00, ?, ?)
  `;

  const [result] = await pool.query(query, [
    id_alumno,
    id_curso,
    id_credencial || null,
    creditos_otorgados,
    ruta_constancia,
  ]);

  return {
    id_constancia: result.insertId,
    ...data,
  };
};

const crearCertificado = async (data) => {
  const {
    id_alumno,
    id_certificacion,
    calificacion_promedio,
    ruta_certificado,
    descripcion,
  } = data;

  const query = `
    INSERT INTO certificacion_alumno
    (id_alumno, id_certificacion, progreso, completada, fecha_completada,
     certificado_emitido, fecha_certificado, ruta_certificado,
     calificacion_promedio, descripcion_certificado)
    VALUES (?, ?, 100.00, 1, NOW(), 1, NOW(), ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    id_alumno,
    id_certificacion,
    ruta_certificado,
    calificacion_promedio || null,
    descripcion || null,
  ]);

  return {
    id_cert_alumno: result.insertId,
    ...data,
  };
};

const getConstanciaPorId = async (id_constancia) => {
  const query = `
    SELECT
      co.*,
      c.nombre_curso,
      c.codigo_curso,
      u_user.username AS nombre_alumno,
      u.nombre AS nombre_universidad,
      u.logo_url AS logo_universidad
    FROM constancia_alumno co
    INNER JOIN curso c ON co.id_curso = c.id_curso
    INNER JOIN alumno al ON co.id_alumno = al.id_alumno
    INNER JOIN usuario u_user ON al.id_usuario = u_user.id_usuario
    INNER JOIN universidad u ON c.id_universidad = u.id_universidad
    WHERE co.id_constancia = ?
  `;

  const [rows] = await pool.query(query, [id_constancia]);
  return rows[0];
};

const getCertificadoPorId = async (id_cert_alumno) => {
  const query = `
    SELECT
      ca.*,
      cert.nombre AS nombre_credencial,
      cert.descripcion AS descripcion_credencial,
      u_user.username AS nombre_alumno,
      u.nombre AS nombre_universidad,
      u.logo_url AS logo_universidad
    FROM certificacion_alumno ca
    INNER JOIN certificacion cert ON ca.id_certificacion = cert.id_certificacion
    INNER JOIN alumno al ON ca.id_alumno = al.id_alumno
    INNER JOIN usuario u_user ON al.id_usuario = u_user.id_usuario
    INNER JOIN universidad u ON cert.id_universidad = u.id_universidad
    WHERE ca.id_cert_alumno = ?
  `;

  const [rows] = await pool.query(query, [id_cert_alumno]);
  return rows[0];
};

module.exports = {
  getCursosParaConstancias,
  getCredencialesParaCertificados,
  getCursosDeCredencial,
  crearConstancia,
  crearCertificado,
  getConstanciaPorId,
  getCertificadoPorId,
};