-- 1. Desactivar verificaciones temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Crear tablas en orden correcto
-- Primero las tablas básicas sin dependencias
CREATE TABLE `universidad` (
  `id_universidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `clave_universidad` varchar(20) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email_contacto` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_universidad`),
  UNIQUE KEY `uk_clave_universidad` (`clave_universidad`),
  UNIQUE KEY `uk_email_contacto` (`email_contacto`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuario` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `tipo_usuario` enum('alumno','maestro','admin_universidad','admin_sedeq') NOT NULL,
  `estatus` enum('activo','inactivo','pendiente','suspendido') NOT NULL DEFAULT 'pendiente',
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `google_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_tipo_estatus` (`tipo_usuario`,`estatus`),
  KEY `fk_usuario_universidad` (`id_universidad`),
  CONSTRAINT `fk_usuario_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tablas básicas adicionales
CREATE TABLE `areas_conocimiento` (
  `id_area` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_area`),
  UNIQUE KEY `uk_nombre_area` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `categoria_curso` (
  `id_categoria` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_area` int(10) unsigned NOT NULL,
  `nombre_categoria` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estatus` enum('activa','inactiva') DEFAULT 'activa',
  `orden_prioridad` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `color_hex` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uk_nombre` (`nombre_categoria`),
  UNIQUE KEY `uk_area_orden` (`id_area`,`orden_prioridad`),
  KEY `idx_estatus` (`estatus`),
  CONSTRAINT `fk_categoria_area` FOREIGN KEY (`id_area`) REFERENCES `areas_conocimiento` (`id_area`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `facultades` (
  `id_facultad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_universidad` int(10) unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_facultad`),
  KEY `id_universidad` (`id_universidad`),
  KEY `idx_nombre_facultad` (`nombre`),
  CONSTRAINT `facultades_ibfk_1` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `carreras` (
  `id_carrera` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_facultad` int(10) unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `clave_carrera` varchar(20) NOT NULL,
  `duracion_anos` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_carrera`),
  UNIQUE KEY `uk_clave_carrera` (`clave_carrera`),
  KEY `id_facultad` (`id_facultad`),
  KEY `idx_nombre_carrera` (`nombre`),
  CONSTRAINT `carreras_ibfk_1` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tablas de usuarios específicos
CREATE TABLE `alumno` (
  `id_alumno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_universidad` int(10) unsigned NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `correo_institucional` varchar(100) DEFAULT NULL,
  `correo_personal` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `semestre_actual` tinyint(3) unsigned DEFAULT NULL,
  `estatus_academico` enum('regular','irregular','egresado','baja_temporal','baja_definitiva') DEFAULT 'regular',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_carrera` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `uk_id_usuario` (`id_usuario`),
  UNIQUE KEY `uk_matricula_universidad` (`matricula`,`id_universidad`),
  UNIQUE KEY `uk_correo_personal` (`correo_personal`),
  UNIQUE KEY `uk_correo_institucional` (`correo_institucional`),
  KEY `idx_universidad` (`id_universidad`),
  KEY `idx_estatus_academico` (`estatus_academico`),
  KEY `idx_nombre_completo` (`nombre_completo`),
  KEY `idx_alumno_busqueda` (`nombre_completo`,`matricula`),
  KEY `fk_alumno_carrera_idx` (`id_carrera`),
  CONSTRAINT `fk_alumno_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alumno_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON UPDATE CASCADE,
  CONSTRAINT `fk_alumno_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_correo_personal_formato` CHECK (`correo_personal` regexp '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `maestro` (
  `id_maestro` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `id_universidad` int(10) unsigned NOT NULL,
  `id_facultad` int(11) DEFAULT NULL,
  `id_carrera` int(11) DEFAULT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `email_institucional` varchar(100) NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `grado_academico` enum('licenciatura','maestria','doctorado','posdoctorado') DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_maestro`),
  UNIQUE KEY `uk_id_usuario` (`id_usuario`),
  UNIQUE KEY `uk_email_institucional` (`email_institucional`),
  KEY `idx_universidad` (`id_universidad`),
  KEY `idx_especialidad` (`especialidad`),
  KEY `idx_nombre_completo` (`nombre_completo`),
  CONSTRAINT `fk_maestro_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON UPDATE CASCADE,
  CONSTRAINT `fk_maestro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tablas de convocatorias
CREATE TABLE `convocatorias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('planeada','aviso','revision','activa','finalizada','rechazada','cancelada') NOT NULL DEFAULT 'planeada',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_aviso_inicio` date NOT NULL,
  `fecha_aviso_fin` date NOT NULL,
  `fecha_revision_inicio` date DEFAULT NULL,
  `fecha_revision_fin` date DEFAULT NULL,
  `fecha_ejecucion_inicio` date NOT NULL,
  `fecha_ejecucion_fin` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `convocatoria_universidades` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `convocatoria_id` int(10) unsigned NOT NULL,
  `universidad_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_convocatoria_universidad_unique` (`convocatoria_id`,`universidad_id`),
  KEY `fk_conv_univ_convocatoria_idx` (`convocatoria_id`),
  KEY `fk_conv_univ_universidad_idx` (`universidad_id`),
  CONSTRAINT `fk_conv_univ_convocatoria` FOREIGN KEY (`convocatoria_id`) REFERENCES `convocatorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conv_univ_universidad` FOREIGN KEY (`universidad_id`) REFERENCES `universidad` (`id_universidad`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `capacidad_universidad` (
  `convocatoria_id` int(10) unsigned NOT NULL,
  `universidad_id` int(10) unsigned NOT NULL,
  `capacidad_maxima` int(10) unsigned NOT NULL,
  `cupo_actual` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`convocatoria_id`,`universidad_id`),
  KEY `universidad_id` (`universidad_id`),
  CONSTRAINT `capacidad_universidad_ibfk_1` FOREIGN KEY (`convocatoria_id`) REFERENCES `convocatorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `capacidad_universidad_ibfk_2` FOREIGN KEY (`universidad_id`) REFERENCES `universidad` (`id_universidad`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tablas de habilidades y subgrupos
CREATE TABLE `habilidades_clave` (
  `id_habilidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_habilidad` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_habilidad`),
  UNIQUE KEY `uk_nombre_habilidad` (`nombre_habilidad`(255))
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subgrupos_operadores` (
  `id_subgrupo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_subgrupo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_subgrupo`),
  UNIQUE KEY `uk_nombre_subgrupo` (`nombre_subgrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subgrupo_habilidades` (
  `id_subgrupo` int(10) unsigned NOT NULL,
  `id_habilidad` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_subgrupo`,`id_habilidad`),
  KEY `fk_subgrupo_habilidades_subgrupo` (`id_subgrupo`),
  KEY `fk_subgrupo_habilidades_habilidad` (`id_habilidad`),
  CONSTRAINT `fk_subgrupo_habilidades_habilidad` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidades_clave` (`id_habilidad`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subgrupo_habilidades_subgrupo` FOREIGN KEY (`id_subgrupo`) REFERENCES `subgrupos_operadores` (`id_subgrupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tablas de curso (CORREGIDO)
CREATE TABLE `curso` (
  `id_curso` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_maestro` int(10) unsigned DEFAULT NULL,
  `id_categoria` int(10) unsigned DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `id_facultad` int(10) unsigned DEFAULT NULL,
  `id_carrera` int(10) unsigned DEFAULT NULL,
  `codigo_curso` varchar(20) DEFAULT NULL,
  `nombre_curso` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `objetivos` text DEFAULT NULL,
  `prerequisitos` text DEFAULT NULL,
  `duracion_horas` smallint(5) unsigned NOT NULL,
  `creditos_constancia` decimal(5,2) DEFAULT 0.00,
  `horas_teoria` smallint(5) unsigned DEFAULT NULL,
  `horas_practica` smallint(5) unsigned DEFAULT NULL,
  `nivel` enum('basico','intermedio','avanzado') NOT NULL,
  `modalidad` enum('presencial','mixto','virtual','virtual_autogestiva','virtual_mixta','virtual-presencial') NOT NULL DEFAULT 'virtual',
  `tipo_costo` enum('gratuito','pago') NOT NULL DEFAULT 'gratuito',
  `costo` decimal(10,2) DEFAULT NULL,
  `cupo_maximo` smallint(5) unsigned DEFAULT 30,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `horario` varchar(100) DEFAULT NULL,
  `link_clase` varchar(500) DEFAULT NULL,
  `estatus_curso` enum('planificado','abierto','en_curso','finalizado','cancelado') DEFAULT 'planificado',
  `aprobado_universidad` tinyint(1) DEFAULT 0,
  `aprobado_sedeq` tinyint(1) DEFAULT 0,
  `fecha_aprobacion_universidad` timestamp NULL DEFAULT NULL,
  `fecha_aprobacion_sedeq` timestamp NULL DEFAULT NULL,
  `observaciones_aprobacion` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `caracterizacion` text DEFAULT NULL,
  `intencion_didactica` text DEFAULT NULL,
  `evaluacion_competencias` text DEFAULT NULL,
  `propositos` text DEFAULT NULL,
  `perfil_egreso` text DEFAULT NULL,
  `competencias_genericas` text DEFAULT NULL,
  `competencias_especificas` text DEFAULT NULL,
  `evaluacion` text DEFAULT NULL,
  `metodologia` text DEFAULT NULL,
  `notas_adicionales` text DEFAULT NULL,
  `clave_asignatura` varchar(50) DEFAULT NULL,
  `competencias_desarrollar` text DEFAULT NULL,
  `competencias_previas` text DEFAULT NULL,
  `proyecto_fundamentacion` text DEFAULT NULL,
  `proyecto_planeacion` text DEFAULT NULL,
  `proyecto_ejecucion` text DEFAULT NULL,  -- CORREGIDO: Eliminada la duplicada
  `id_convocatoria` int(10) unsigned DEFAULT NULL,
  `id_subgrupo` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_curso`),
  UNIQUE KEY `uk_codigo_curso` (`codigo_curso`),
  KEY `idx_maestro` (`id_maestro`),
  KEY `idx_categoria` (`id_categoria`),
  KEY `idx_estatus` (`estatus_curso`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_nivel` (`nivel`),
  KEY `idx_aprobaciones` (`aprobado_universidad`,`aprobado_sedeq`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  KEY `idx_curso_universidad` (`id_maestro`,`estatus_curso`),
  KEY `idx_curso_filtros` (`id_categoria`,`nivel`,`fecha_inicio`),
  KEY `fk_curso_universidad` (`id_universidad`),
  KEY `fk_curso_facultad` (`id_facultad`),
  KEY `fk_curso_carrera` (`id_carrera`),
  KEY `fk_curso_convocatoria` (`id_convocatoria`),
  KEY `fk_curso_subgrupo` (`id_subgrupo`),
  CONSTRAINT `fk_curso_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_curso` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_convocatoria` FOREIGN KEY (`id_convocatoria`) REFERENCES `convocatorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_maestro` FOREIGN KEY (`id_maestro`) REFERENCES `maestro` (`id_maestro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_subgrupo` FOREIGN KEY (`id_subgrupo`) REFERENCES `subgrupos_operadores` (`id_subgrupo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE
  -- ELIMINADOS los CHECK constraints - usar triggers si es necesario
  -- CONSTRAINT `chk_fechas_curso` CHECK (`fecha_fin` >= `fecha_inicio`),
  -- CONSTRAINT `chk_duracion_horas` CHECK (`duracion_horas` > 0 and `duracion_horas` <= 1000),
  -- CONSTRAINT `chk_cupo_maximo` CHECK (`cupo_maximo` > 0 and `cupo_maximo` <= 1000)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `curso_habilidades_clave` (
  `id_curso` int(10) unsigned NOT NULL,
  `id_habilidad` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_curso`,`id_habilidad`),
  KEY `fk_curso_habilidades_curso` (`id_curso`),
  KEY `fk_curso_habilidades_habilidad` (`id_habilidad`),
  CONSTRAINT `fk_curso_habilidades_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_habilidades_habilidad` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidades_clave` (`id_habilidad`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tablas de estructura del curso
CREATE TABLE `unidades_curso` (
  `id_unidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `nombre_unidad` varchar(255) NOT NULL,
  `descripcion_unidad` text DEFAULT NULL,
  `competenciasEspecificas` text DEFAULT NULL,
  `competenciasGenericas` text DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_unidad`),
  KEY `fk_unidad_curso_idx` (`id_curso`),
  CONSTRAINT `fk_unidad_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subtemas_unidad` (
  `id_subtema` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_unidad` int(10) unsigned NOT NULL,
  `nombre_subtema` varchar(255) NOT NULL,
  `descripcion_subtema` text DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_subtema`),
  KEY `idx_unidad_orden` (`id_unidad`,`orden`),
  CONSTRAINT `subtemas_unidad_ibfk_1` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_curso` (`id_unidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tablas de calificaciones (IMPORTANTE: antes de actividad_materiales)
CREATE TABLE `calificaciones_curso` (
  `id_calificaciones` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `umbral_aprobatorio` int(11) NOT NULL DEFAULT 60,
  `puntos_totales` int(11) NOT NULL DEFAULT 100,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `porcentaje_actividades` int(10) unsigned NOT NULL DEFAULT 50,
  `porcentaje_proyecto` int(10) unsigned NOT NULL DEFAULT 50,
  PRIMARY KEY (`id_calificaciones`),
  UNIQUE KEY `uk_curso` (`id_curso`),
  CONSTRAINT `fk_calificaciones_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
  -- ELIMINADO: CHECK (`umbral_aprobatorio` >= 50 and `umbral_aprobatorio` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `calificaciones_actividades` (
  `id_actividad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_calificaciones_curso` int(10) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `instrucciones` text DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `max_archivos` int(10) unsigned NOT NULL DEFAULT 5,
  `max_tamano_mb` int(10) unsigned NOT NULL DEFAULT 10,
  `tipos_archivo_permitidos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo_actividad` enum('actividad','proyecto') NOT NULL DEFAULT 'actividad',
  `id_unidad` int(10) unsigned DEFAULT NULL,
  `id_subtema` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_actividad`),
  KEY `fk_actividad_calificaciones` (`id_calificaciones_curso`),
  KEY `idx_tipo_actividad` (`tipo_actividad`),
  KEY `fk_actividad_unidad` (`id_unidad`),
  KEY `fk_actividad_subtema` (`id_subtema`),
  CONSTRAINT `fk_actividad_calificaciones` FOREIGN KEY (`id_calificaciones_curso`) REFERENCES `calificaciones_curso` (`id_calificaciones`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_actividad_subtema` FOREIGN KEY (`id_subtema`) REFERENCES `subtemas_unidad` (`id_subtema`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_actividad_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_curso` (`id_unidad`) ON DELETE SET NULL ON UPDATE CASCADE
  -- ELIMINADO: CHECK (json_valid(`tipos_archivo_permitidos`))
) ENGINE=InnoDB AUTO_INCREMENT=413 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- **IMPORTANTE: Primero crear material_curso antes que actividad_materiales**
CREATE TABLE `material_curso` (
  `id_material` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(500) DEFAULT NULL,
  `tipo_archivo` enum('pdf','enlace','texto') DEFAULT NULL,
  `categoria_material` enum('planeacion','material_descarga','actividad') DEFAULT NULL,
  `es_enlace` tinyint(1) NOT NULL DEFAULT 0,
  `url_enlace` varchar(500) DEFAULT NULL,
  `tamaño_archivo` int(10) unsigned DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `instrucciones_texto` text DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_subida` timestamp NULL DEFAULT current_timestamp(),
  `subido_por` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_material`),
  KEY `idx_curso` (`id_curso`),
  KEY `idx_tipo_archivo` (`tipo_archivo`),
  KEY `idx_fecha_subida` (`fecha_subida`),
  KEY `idx_subido_por` (`subido_por`),
  KEY `idx_categoria_material` (`categoria_material`),
  KEY `idx_curso_categoria` (`id_curso`,`categoria_material`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `fk_material_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_material_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ¡AHORA SÍ! actividad_materiales (puede referenciar calificaciones_actividades y material_curso)
CREATE TABLE `actividad_materiales` (
  `id_actividad_material` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_actividad` int(10) unsigned NOT NULL,
  `id_material` int(10) unsigned NOT NULL,
  `orden` int(10) unsigned DEFAULT 0,
  `fecha_asignacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_actividad_material`),
  UNIQUE KEY `uk_actividad_material` (`id_actividad`,`id_material`),
  KEY `fk_actividad_material_material` (`id_material`),
  CONSTRAINT `fk_actividad_material_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `calificaciones_actividades` (`id_actividad`) ON DELETE CASCADE,
  CONSTRAINT `fk_actividad_material_material` FOREIGN KEY (`id_material`) REFERENCES `material_curso` (`id_material`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Resto de tablas...
CREATE TABLE `inscripcion` (
  `id_inscripcion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_alumno` int(10) unsigned NOT NULL,
  `id_curso` int(10) unsigned NOT NULL,
  `convocatoria_id` int(10) unsigned DEFAULT NULL,
  `fecha_solicitud` timestamp NULL DEFAULT current_timestamp(),
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `aprobado_por` int(10) unsigned DEFAULT NULL,
  `estatus_inscripcion` enum('solicitada','aprobada','rechazada','completada','abandonada','lista de espera','baja por el sistema') DEFAULT 'solicitada',
  `motivo_rechazo` text DEFAULT NULL,
  `calificacion_final` decimal(5,2) DEFAULT NULL,
  `porcentaje_asistencia` decimal(5,2) DEFAULT NULL,
  `fecha_finalizacion` timestamp NULL DEFAULT NULL,
  `aprobado_curso` tinyint(1) DEFAULT 0,
  `constancia_emitida` tinyint(1) DEFAULT 0,
  `fecha_constancia` timestamp NULL DEFAULT NULL,
  `ruta_constancia` varchar(500) DEFAULT NULL,
  `comentarios_profesor` text DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `uk_alumno_curso` (`id_alumno`,`id_curso`),
  KEY `idx_curso` (`id_curso`),
  KEY `idx_estatus` (`estatus_inscripcion`),
  KEY `idx_fecha_solicitud` (`fecha_solicitud`),
  KEY `idx_aprobado_por` (`aprobado_por`),
  KEY `idx_inscripcion_control` (`estatus_inscripcion`,`fecha_solicitud`),
  KEY `idx_constancia` (`constancia_emitida`),
  KEY `fk_inscripcion_convocatoria_idx` (`convocatoria_id`),
  CONSTRAINT `fk_inscripcion_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripcion_aprobador` FOREIGN KEY (`aprobado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripcion_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
  -- ELIMINADOS: CHECK constraints
  -- CONSTRAINT `chk_calificacion_final` CHECK (`calificacion_final` >= 0 and `calificacion_final` <= 10),
  -- CONSTRAINT `chk_porcentaje_asistencia` CHECK (`porcentaje_asistencia` >= 0 and `porcentaje_asistencia` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sesiones_usuario` (
  `id_sesion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `fecha_login` timestamp NULL DEFAULT current_timestamp(),
  `fecha_logout` timestamp NULL DEFAULT NULL,
  `duracion_sesion` int(10) unsigned DEFAULT NULL,
  `estatus_sesion` enum('activa','cerrada','expirada','forzada') DEFAULT 'activa',
  PRIMARY KEY (`id_sesion`),
  KEY `idx_usuario_fecha` (`id_usuario`,`fecha_login`),
  KEY `idx_estatus` (`estatus_sesion`),
  KEY `idx_sesiones_reporte` (`id_usuario`,`fecha_login`,`estatus_sesion`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=611 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- TABLAS FALTANTEEEES
--
--
CREATE TABLE `certificacion` (
  `id_certificacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `id_facultad` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_categoria` int(10) unsigned DEFAULT NULL,
  `requisitos_adicionales` text DEFAULT NULL,
  `estatus` enum('activa','inactiva') DEFAULT 'activa',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_certificacion`),
  UNIQUE KEY `uk_nombre` (`nombre`),
  KEY `idx_categoria` (`id_categoria`),
  KEY `fk_certificacion_universidad` (`id_universidad`),
  KEY `fk_certificacion_facultad` (`id_facultad`),
  CONSTRAINT `fk_certificacion_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_curso` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_certificacion_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_certificacion_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `requisitos_certificado` (
  `id_requisito` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_certificacion` int(10) unsigned NOT NULL,
  `id_curso` int(10) unsigned NOT NULL,
  `obligatorio` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_requisito`),
  UNIQUE KEY `uk_certificacion_curso` (`id_certificacion`,`id_curso`),
  UNIQUE KEY `uk_curso_unico` (`id_curso`),
  KEY `idx_certificacion` (`id_certificacion`),
  KEY `idx_curso` (`id_curso`),
  CONSTRAINT `fk_requisito_certificacion` FOREIGN KEY (`id_certificacion`) REFERENCES `certificacion` (`id_certificacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_requisito_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `constancia_alumno` (
  `id_constancia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_alumno` int(10) unsigned NOT NULL,
  `id_curso` int(10) unsigned NOT NULL,
  `id_credencial` int(10) unsigned DEFAULT NULL,
  `progreso` decimal(5,2) DEFAULT 100.00,
  `creditos_otorgados` decimal(5,2) DEFAULT 0.00,
  `fecha_emitida` timestamp NULL DEFAULT current_timestamp(),
  `ruta_constancia` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_constancia`),
  UNIQUE KEY `uk_alumno_curso` (`id_alumno`,`id_curso`),
  KEY `fk_constancia_alumno` (`id_alumno`),
  KEY `fk_constancia_curso` (`id_curso`),
  KEY `fk_constancia_credencial` (`id_credencial`),
  CONSTRAINT `fk_constancia_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_constancia_credencial` FOREIGN KEY (`id_credencial`) REFERENCES `certificacion` (`id_certificacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_constancia_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `certificacion_alumno` (
  `id_cert_alumno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_alumno` int(10) unsigned NOT NULL,
  `id_certificacion` int(10) unsigned NOT NULL,
  `progreso` decimal(5,2) DEFAULT 0.00,
  `completada` tinyint(1) DEFAULT 0,
  `fecha_completada` timestamp NULL DEFAULT NULL,
  `certificado_emitido` tinyint(1) DEFAULT 0,
  `fecha_certificado` timestamp NULL DEFAULT NULL,
  `ruta_certificado` varchar(500) DEFAULT NULL,
  `calificacion_promedio` decimal(5,2) DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `descripcion_certificado` text DEFAULT NULL,
  PRIMARY KEY (`id_cert_alumno`),
  UNIQUE KEY `uk_alumno_certificacion` (`id_alumno`,`id_certificacion`),
  KEY `idx_alumno` (`id_alumno`),
  KEY `idx_certificacion` (`id_certificacion`),
  KEY `idx_completada` (`completada`),
  CONSTRAINT `fk_cert_alumno_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cert_alumno_certificacion` FOREIGN KEY (`id_certificacion`) REFERENCES `certificacion` (`id_certificacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `entregas_estudiantes` (
  `id_entrega` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_actividad` int(10) unsigned DEFAULT NULL,
  `id_material` int(10) unsigned DEFAULT NULL,
  `id_inscripcion` int(10) unsigned NOT NULL,
  `fecha_entrega` timestamp NULL DEFAULT current_timestamp(),
  `comentario_estudiante` text DEFAULT NULL,
  `calificacion` decimal(5,2) DEFAULT NULL,
  `comentario_profesor` text DEFAULT NULL,
  `estatus_entrega` enum('no_entregada','entregada','calificada','revision') DEFAULT 'no_entregada',
  `fecha_calificacion` timestamp NULL DEFAULT NULL,
  `calificado_por` int(10) unsigned DEFAULT NULL,
  `es_extemporanea` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_entrega`),
  UNIQUE KEY `uk_actividad_inscripcion` (`id_actividad`,`id_inscripcion`),
  KEY `idx_material` (`id_material`),
  KEY `idx_inscripcion` (`id_inscripcion`),
  KEY `idx_estatus` (`estatus_entrega`),
  KEY `idx_calificado_por` (`calificado_por`),
  CONSTRAINT `fk_entrega_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `calificaciones_actividades` (`id_actividad`) ON DELETE CASCADE,
  CONSTRAINT `fk_entrega_calificador` FOREIGN KEY (`calificado_por`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_entrega_inscripcion` FOREIGN KEY (`id_inscripcion`) REFERENCES `inscripcion` (`id_inscripcion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `archivos_entrega` (
  `id_archivo_entrega` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_entrega` int(10) unsigned NOT NULL,
  `nombre_archivo_original` varchar(255) NOT NULL,
  `nombre_archivo_sistema` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo_archivo` varchar(20) NOT NULL,
  `tamano_archivo` int(10) unsigned NOT NULL,
  `hash_archivo` varchar(64) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_archivo_entrega`),
  KEY `idx_entrega` (`id_entrega`),
  KEY `idx_tipo_archivo` (`tipo_archivo`),
  CONSTRAINT `fk_archivo_entrega` FOREIGN KEY (`id_entrega`) REFERENCES `entregas_estudiantes` (`id_entrega`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `certificacion_alumno`
ADD CONSTRAINT `chk_calificacion_promedio` CHECK (`calificacion_promedio` >= 0 AND `calificacion_promedio` <= 10);

-- 3. Reactivar verificaciones
SET FOREIGN_KEY_CHECKS = 1;

---
-- 1. Primero insertar en universidad (referenciada por muchas tablas)
INSERT INTO `universidad` VALUES
(1,'Universidad Autonoma de Queretaro','UAQ123','uaq esquina uaq calle uaq','4444444444','UAQ1@gmail.com','https://maps.app.goo.gl/Cho4a1RcFjvY6dRWA','/uploads/logos/logo-1755009502925-66301552.svg','2025-07-11 16:13:25','2025-08-21 16:35:38'),
(2,'Universidad Politecnica de Santa Rosa Jauregui','UPSRJ1','carretera san luis potosi','2222222222','upsrj@gmail.com','https://maps.app.goo.gl/E9jmxADCrYgJujT86','/uploads/logos/logo-1755185898508-292691154.png','2025-07-16 17:53:32','2026-01-08 14:30:44'),
(3,'Instituto Tecnologico de Mexico (Campus Queretaro)','itq','conocido','4421234567','itq@qro.edu.mx','https://maps.app.goo.gl/Cho4a1RcFjvY6dRWA','/uploads/logos/logo-1755009594765-67685697.png','2025-08-08 15:57:09','2025-08-12 14:39:54'),
(4,'UTEQ','UTEQ1','qro','','Uteeq@gmail.com','https://maps.app.goo.gl/ZyJVpKWXmaoD83kY9','/uploads/logos/logo-1767987832715-281812144.png','2025-12-11 16:43:31','2026-01-09 19:43:52'),
(5,'UPQ','upq1','','','upq@gmail.com','','/uploads/logos/logo-1767990326409-765254268.svg','2026-01-09 20:25:26','2026-01-09 20:25:26'),
(6,'UTC','utc1','','','utc@gmail.com','','/uploads/logos/logo-1767990655295-757673018.png','2026-01-09 20:29:52','2026-01-09 20:30:55'),
(7,'UTSJR','utsjr1','','','utsjr@gmail.com','','/uploads/logos/logo-1767990925578-868131509.png','2026-01-09 20:35:25','2026-01-09 20:35:25'),
(8,'TECNM Campus Queretaro','tecnm1','','','tecnmqro1@gmail.com','','/uploads/logos/logo-1767991197689-484140443.png','2026-01-09 20:39:57','2026-01-09 20:39:57'),
(9,'TECNM San Juan del Rio','tecnmSJR1','','','tecnmSjr1@gmail.com','','/uploads/logos/logo-1767991472260-236972642.png','2026-01-09 20:44:32','2026-01-09 20:44:32'),
(10,'Universidad Cuauhtemoc','cuauhtemoc1','','','cuauhtemoc1@gmail.com','','/uploads/logos/logo-1767991970411-63814335.png','2026-01-09 20:48:48','2026-01-09 20:52:50'),
(11,'UNIQ','uniq1','','','uniq1@gmail.com','','/uploads/logos/logo-1767992618948-40661802.png','2026-01-09 20:59:47','2026-01-09 21:03:38'),
(12,'UVM','uvm1','','','uvm1@gmail.com','','/uploads/logos/logo-1767992838424-154796346.png','2026-01-09 21:07:18','2026-01-09 21:07:18'),
(13,'UNAQ','UNAQ1','','','UNAQ@gmail.com','','/uploads/logos/logo-1768230127633-71015569.png','2026-01-12 15:01:59','2026-01-12 15:02:07'),
(14,'UNICEQ','Uniceq1','','','Uniceq1@gmail.com','','/uploads/logos/logo-1768231235994-227334738.png','2026-01-12 15:20:35','2026-01-12 15:20:35'),
(15,'CESBA','Cesba1','','','Cesba1@gmail.com','','/uploads/logos/logo-1768231272907-694873166.png','2026-01-12 15:21:12','2026-01-12 15:21:12'),
(16,'Universidad de Londres','londresQro1','','','londres1Qro@gmail.com','','/uploads/logos/logo-1768231319339-225282275.png','2026-01-12 15:21:59','2026-01-12 15:21:59'),
(17,'UNIPLEA','Uniplea1','','','Uniplea@gmail.com','','/uploads/logos/logo-1768231362375-435538280.png','2026-01-12 15:22:42','2026-01-12 15:22:42'),
(18,'DICORMO','Dicormo1','','','Dicormo1@gmail.com','','/uploads/logos/logo-1768231407105-290301575.png','2026-01-12 15:23:27','2026-01-12 15:23:27'),
(19,'CNCI','CNCI1','','','CNCI@gmail.com','','/uploads/logos/logo-1768231486768-679624383.png','2026-01-12 15:24:46','2026-01-12 15:24:46'),
(20,'Universidad de Atenas Queretaro','Atenas1','','','AtenasQro@gmail.com','','/uploads/logos/logo-1768231524811-309485037.png','2026-01-12 15:25:24','2026-01-12 15:25:24'),
(21,'Universidad Real de Querétaro','RealQro1','','','RealQro1@gmail.com','','/uploads/logos/logo-1768231733645-409063523.svg','2026-01-12 15:28:53','2026-01-12 15:28:53'),
(22,'New Element','NewElementQro1','','','NewElementQro1@gmail.com','','/uploads/logos/logo-1768231868735-842997067.png','2026-01-12 15:31:08','2026-01-12 15:31:08');


-- 9. Insertar habilidades clave
INSERT INTO `habilidades_clave` VALUES
(1,'Conocimiento y experiencia trabajando con la normativa técnica local e internacional aplicable a instalaciones eléctricas','','2026-01-08 19:14:49','2026-01-08 19:14:49'),
(2,'Conocimiento medio / alto de Microsoft Office','','2026-01-08 19:14:58','2026-01-08 19:14:58'),
(3,'Comprensión de planificación de proyectos','','2026-01-08 19:15:06','2026-01-08 19:15:06'),
(4,'Habilidad para ejecutar tareas simultaneas','','2026-01-08 19:15:14','2026-01-08 19:15:14'),
(5,'Manejo de AutoCAD','','2026-01-08 19:15:34','2026-01-08 19:15:34'),
(6,'Conocimiento de BIM Management / Revit y BIM360','','2026-01-08 19:15:45','2026-01-08 19:15:45'),
(7,'Conocimiento de estándares internacionales y topologías','','2026-01-08 19:23:20','2026-01-08 19:23:20'),
(8,'Conocimiento avanzado en normas internacionales (Uptime Institute Tier Standars, ANSI/TIA-942, NFPA 75 y 76)','','2026-01-08 19:24:23','2026-01-08 19:24:23'),
(9,'Gestión de proyectos bajo metodologías EPC, incluyendo cronogramas, presupuestos y control de calidad','','2026-01-08 19:24:35','2026-01-08 19:24:35'),
(10,'Software: AutoCAD, Revit, BIM, Navisworks, MS Project','','2026-01-08 19:24:51','2026-01-08 19:24:51'),
(11,'Interacción con proveedores de infraestructura crítica y coordinación multidiscipliniaria','','2026-01-08 19:25:06','2026-01-08 19:25:06'),
(12,'Evaluación de riesgos técnicos y validación de pruebas de commissioning (IST - Integrated Systems Testing)','','2026-01-08 19:25:21','2026-01-08 19:25:21'),
(13,'Diagnóstico y operación de sistema eléctricos de media y baja tensión, UPS, generadores y tableros críticos','','2026-01-08 19:26:08','2026-01-08 19:26:08'),
(14,'Supervisión de sistemas de climatización HVAC, CRAC, CRAH y manejo de fluidos de precisión','','2026-01-08 19:26:18','2026-01-08 19:26:18'),
(15,'Monitoreo BMS (Building Management System) y SCADA','','2026-01-08 19:26:34','2026-01-08 19:26:34'),
(16,'Implementación de rutinas de mantenimiento preventivo y predictivo basadas en normas ASHRAE','','2026-01-08 19:26:45','2026-01-08 19:26:45'),
(17,'Capacidad de respuesta rápida ante eventos de contingencia sin comprometer la disponibilidad','','2026-01-08 19:26:55','2026-01-08 19:26:55'),
(18,'Tendido y certificación de enlaces de cobre (Cat6, Cat6A) y fibra óptica (monomodo) y (multimodo)','','2026-01-08 19:27:19','2026-01-08 19:27:19'),
(19,'Manejo de herramientas de medición como OTDR, certificadoras Fluke y empalmadoras','','2026-01-08 19:27:29','2026-01-08 19:27:29'),
(20,'Aplicación de normas ANSI/TIA-568, ISO/IEC 11801 y BICSI 002 para infraestructura crítica','','2026-01-08 19:27:40','2026-01-08 19:27:40'),
(21,'Planeación de rutas, canalizaciones y organización en racks y patch panels','','2026-01-08 19:27:49','2026-01-08 19:27:49'),
(22,'Capacidad para operar en salas blancas y seguir protocolos ESD (Descarga electroestática)','','2026-01-08 19:28:00','2026-01-08 19:28:00'),
(23,'Diseño y operación de sistemas CCTV con videoanalítica, sensores de movimiento y grabación redundante','','2026-01-08 19:28:14','2026-01-08 19:28:14'),
(24,'Gestión de controles de acceso por biometría, tarjetas RFID y sistemas duales','','2026-01-08 19:28:22','2026-01-08 19:28:22'),
(25,'Implementación de sistemas contra incendio VESDA, NOVEC 1230, FM-200 y detección temprana','','2026-01-08 19:28:33','2026-01-08 19:28:33'),
(26,'Integración de plataformas con BMS, DCIM y protocolos de seguridad física (zonas restringidas, SAS, zonas mantrap)','','2026-01-08 19:28:44','2026-01-08 19:28:44'),
(27,'Gestion de incidencias, simulacros y prottocolos de respuesta a emergencias (ISO 27001, ISO 22301)','','2026-01-08 19:28:52','2026-01-08 19:28:52'),
(28,'Diseño e implementación de implementación de planes de continuidad (BCP) y recuperación ante desastres (DRP)','','2026-01-08 19:29:07','2026-01-08 19:29:07'),
(29,'Monitoreo de indicadores de confiabilidad (MTTR,MTBF), y mejora continua de SLA críticos','','2026-01-08 19:29:15','2026-01-08 19:29:15'),
(30,'Gestión proactiva de alertas mediante plataformas DCIM y analítica predictiva','','2026-01-08 19:29:28','2026-01-08 19:29:28'),
(31,'Análisis de impacto al negocio, definición de RTO y RPO por servicio crítico','','2026-01-08 19:29:37','2026-01-08 19:29:37'),
(32,'Coordination interdepartamental entre facilities, TI y seguridad','','2026-01-08 19:29:46','2026-01-08 19:29:46'),
(33,'Preparación de estimaciones de costos completas y precisas para proyectos de construcción eléctrica','','2026-01-08 19:30:08','2026-01-08 19:30:08'),
(34,'Revisión e interpretación de planos, especificaciones, técnicas, alcances de trabajo y otros documentos','','2026-01-08 19:30:22','2026-01-08 19:30:22'),
(35,'Cuantificación de materiales y componentes eléctricos necesarios para cada proyecto','','2026-01-08 19:30:34','2026-01-08 19:30:34'),
(36,'Identificación de riesgos y oportunidades que puedan afectar el costo del proyecto y proponer soluciones','','2026-01-08 19:30:43','2026-01-08 19:30:43'),
(37,'Uso de software especializado en estimación de costos para optimizar el proceso','','2026-01-08 19:30:53','2026-01-08 19:30:53'),
(38,'Gestión de proveedores para asegurar la competitividad de las estimaciones','','2026-01-08 19:31:02','2026-01-08 19:31:02'),
(39,'Coordinación con otros equipos para identificar problemas e implementar soluciones','','2026-01-08 19:31:24','2026-01-08 19:31:24'),
(40,'Colaboración con proveedores para realizar tareas relacionadas con sistemas de control','','2026-01-08 19:31:35','2026-01-08 19:31:35'),
(41,'Programación básica de PLC, ejecutar tareas y programación gráfica HMI intermedia','','2026-01-08 19:31:44','2026-01-08 19:31:44'),
(42,'Cumplir con las métricas de desempeño establecidas','','2026-01-08 19:31:51','2026-01-08 19:31:51'),
(43,'Realizar actualizaciones de red (direccionamiento IP, configuración de VLAN, etc)','','2026-01-08 19:32:02','2026-01-08 19:32:02'),
(44,'Integrar protocolos de comunicación como Modbus, BACnet, SNMP, entre otros','','2026-01-08 19:32:10','2026-01-08 19:32:10'),
(45,'Leer esquemas de cableado de controles y realizar actualizaciones de linea roja','','2026-01-08 19:32:20','2026-01-08 19:32:20'),
(46,'Programación PLC a nivel intermedio, preferentemente en plataformas Rockwell, Siemens y/o Schneider','','2026-01-08 19:32:35','2026-01-08 19:32:35'),
(47,'Desarrollo y actualización de interfaces gráficas HMI','','2026-01-08 19:32:42','2026-01-08 19:32:42'),
(48,'Actualización y configuración de red','','2026-01-08 19:32:54','2026-01-08 19:32:54'),
(49,'Integración de sistemas mediante protocolos de comunicación industrial como Modbus, BACnet y SNMP','','2026-01-08 19:33:03','2026-01-08 19:33:03'),
(50,'Lectura e interpretación de esquemas de cableado de controles y realizar actualizaciones de línea roja','','2026-01-08 19:33:13','2026-01-08 19:33:13'),
(51,'Supervisión de la producción y calidad de los elementos de ingeniería de controles en las cuentas asignadas','','2026-01-08 19:33:22','2026-01-08 19:33:22'),
(52,'Investigación y análisis de posibles mejoras en sistemas y procesos para cumplir con estándares','','2026-01-08 19:33:30','2026-01-08 19:33:30'),
(53,'Conocimiento de protocolos de enrutamiento: OSPF, EIGRP, ruteo estático: Redundancia L2/L3: STP/RSTP/MSTP, HSRP/VRRP/GLBP. Protocolos L2: Vlans, SVIs, Port-channels. Data center: Cisco Nexus (9k, 7k, 5k, etc), vPC, fabric-path (deseable). SDN: CIsco SD-WAN, ACI, DNA-Center','','2026-01-08 19:46:51','2026-01-08 19:46:51'),
(54,'Conocimientos en otras marcas: Huawei, Aruba, H3C','','2026-01-08 19:47:01','2026-01-08 19:47:01'),
(55,'Experiencia en soluciones de Wireless','','2026-01-08 19:47:08','2026-01-08 19:47:08'),
(56,'Experiencia en preventa: conocimiento en CCW (cisco commerce workspace)','','2026-01-08 19:47:22','2026-01-08 19:47:22'),
(57,'Elaboración de BOMs','','2026-01-08 19:47:30','2026-01-08 19:47:30'),
(58,'Conocimiento avanzado de BIM Management / Revit y BIM360','','2026-01-08 19:47:53','2026-01-08 19:47:53'),
(59,'Conocimiento y experiencia trabajando con la normativa técnica aplicable a construcción','','2026-01-08 19:48:05','2026-01-08 19:48:05'),
(60,'Comprensión de planificación de proyectos y habilidad para comunicarse y trabajar mano a mano con otros equipos','','2026-01-08 19:48:23','2026-01-08 19:48:23'),
(61,'Habilidad para ejecutar tareas simultáneas y priorizar','','2026-01-08 19:48:31','2026-01-08 19:48:31'),
(62,'Inglés B1 / B2','','2026-01-08 19:48:40','2026-01-08 19:48:40'),
(63,'Manejo experto de AutoCAD','','2026-01-08 19:50:00','2026-01-08 19:50:00'),
(64,'Manejo experto de metodología BIM','','2026-01-08 19:50:08','2026-01-08 19:50:08'),
(65,'Creación y desarrollo de modelos BIM detallados en 3D para proyectos de construcción eléctrica','','2026-01-08 19:50:22','2026-01-08 19:50:22'),
(66,'Colaboración para integrar datos en el modelo BIM','','2026-01-08 19:50:31','2026-01-08 19:50:31'),
(67,'Generación de planos, cortes, elevaciones, detalles y otra documentación técnica a partir del modelo BIM','','2026-01-08 19:50:40','2026-01-08 19:50:40'),
(68,'Extracción de cantidades de obra y métricos precisos desde el modelo BIM','','2026-01-08 19:50:49','2026-01-08 19:50:49'),
(69,'Identificación y resolución de interferencias y conflictos entre las diferentes disciplinas en el modelo BIM','','2026-01-08 19:50:58','2026-01-08 19:50:58'),
(70,'Mantenimiento y actualización de los modelos BIM a lo largo del ciclo de vida del proyecto','','2026-01-08 19:51:06','2026-01-08 19:51:06'),
(71,'Conocimiento avanzado de BIM / Revit y BIM360','','2026-01-08 19:51:19','2026-01-08 19:51:19'),
(72,'Comprensión, análisis y planificación de proyectos, y trabajo en equipo','','2026-01-08 19:52:18','2026-01-08 19:52:18'),
(73,'Conocimiento de procesos constructivos','','2026-01-08 19:52:26','2026-01-08 19:52:26'),
(74,'Habilidad para la ejecución de tareas simultaneas y priorización de las mismas','','2026-01-08 19:52:35','2026-01-08 19:52:35'),
(75,'Formación en otros programas o software (Navisworks, Dynamo, etc.)','','2026-01-08 19:52:54','2026-01-08 19:52:54'),
(76,'Formación en calidad','','2026-01-08 19:53:01','2026-01-08 19:53:01'),
(77,'Conocimiento de normatividad para instalaciones eléctricas, hidrosanitarias, especiales, aire acondicionado y contra incendios','','2026-01-08 19:53:18','2026-01-08 19:53:18'),
(78,'Revisión de generadores y estimaciones de obra','','2026-01-08 19:53:25','2026-01-08 19:53:25'),
(79,'Disponibilidad para rolar turnos','','2026-01-08 19:53:35','2026-01-08 19:53:35'),
(80,'Experiencia en AutoCAD','','2026-01-08 19:53:58','2026-01-08 19:53:58'),
(81,'Trabaja tanto con diseños propios como ajenos, recopila datos y realiza cálculos de diseño','','2026-01-08 19:54:10','2026-01-08 19:54:10'),
(82,'Resuelve problemas de diseño','','2026-01-08 19:54:21','2026-01-08 19:54:21'),
(83,'Puede requerir el uso de inteligencia artificial o tecnología digital similar para su desempeño','','2026-01-08 19:54:31','2026-01-08 19:54:31'),
(84,'Conocimiento práctico de los códigos de la disciplina y estudia cuestiones normativas no rutinarias','','2026-01-08 19:54:46','2026-01-08 19:54:46'),
(85,'Inglés avanzado','','2026-01-08 19:54:54','2026-01-08 19:54:54'),
(86,'Contribuye al diseño de conjuntos TCS/SFN','','2026-01-08 19:55:25','2026-01-08 19:55:25'),
(87,'Desarrolla y mantiene modelos 3D','','2026-01-08 19:55:33','2026-01-08 19:55:33'),
(88,'Preparar y mantener listas de materiales (BOM), diagramas de flujo de proceso (PFD), diagramas de tuberías e instrumentación (P&ID) y documentación','','2026-01-08 19:55:44','2026-01-08 19:55:44'),
(89,'Realizar dimensionamiento y cálculos de sistemas','','2026-01-08 19:55:55','2026-01-08 19:55:55'),
(90,'Construcción de prototipos y pruebas de validación','','2026-01-08 19:56:05','2026-01-08 19:56:05'),
(91,'Aporta información de pedidos personalizados y proyectos ETO a los módulos NPDI para mejora continua','','2026-01-08 19:56:13','2026-01-08 19:56:13'),
(92,'Usa herramientas de diseño/configuración y proporciona comentarios para mejorar los flujos de automatización','','2026-01-08 19:56:23','2026-01-08 19:56:23'),
(93,'Asegurar que los diseños cumplan con las directrices de refrigeración líquida de ASME y ASHRAE','','2026-01-08 19:56:32','2026-01-08 19:56:32'),
(94,'Planificar, coordina y ejecuta proyectos de ingeniería eléctrica para instalaciones y sistemas','','2026-01-08 19:57:47','2026-01-08 19:57:47'),
(95,'Gestiona alcance, cronograma y presupuesto del proyecto','','2026-01-08 19:58:35','2026-01-08 19:58:35'),
(96,'Dominio de AutoCAD y sólidos conocimientos de códigos, normas y buenas prácticas eléctricas','','2026-01-08 19:58:43','2026-01-08 19:58:43'),
(97,'Excelente capacidad de análisis, comunicación y resolución de problemas, con enfoque en la colaboración y los resultados','','2026-01-08 19:58:51','2026-01-08 19:58:51'),
(98,'Interpretación de secuencias de operación, esquemas de planta y arquitectura de sistemas','','2026-01-08 19:59:25','2026-01-08 19:59:25'),
(99,'Experiencia en sistemas y aplicaciones del sector HVAC, y capacidad para diseñar una solución integral','','2026-01-08 19:59:35','2026-01-08 19:59:35'),
(100,'Conocimientos básicos de software para integrar gráficos con aplicaciones','','2026-01-08 19:59:43','2026-01-08 19:59:43'),
(101,'Nivel conversacional de inglés','','2026-01-08 19:59:52','2026-01-08 19:59:52'),
(102,'Capacidad para la resolución de problemas','','2026-01-08 20:00:00','2026-01-08 20:00:00'),
(103,'Trabaja en un equipo de ingeniería multidisciplinario en productos globales, enfocándose en un diseño de alto rendimiento y rentable, y en innovación','','2026-01-08 20:00:24','2026-01-08 20:00:24'),
(104,'Diseña las características eléctricas del producto y es responsable del dimensionamiento de las piezas principales de los ensamblajes','','2026-01-08 20:00:34','2026-01-08 20:00:34'),
(105,'Crea y revisa la documentación del producto (planos, especificaciones, listas de materiales)','','2026-01-08 20:00:46','2026-01-08 20:00:46'),
(106,'Desarrolla soluciones para productos especiales','','2026-01-08 20:00:56','2026-01-08 20:00:56'),
(107,'Colabora en crear guías de conexión de controles','','2026-01-08 20:01:04','2026-01-08 20:01:04'),
(108,'Analiza y resuelve problemas en los productos CWS','','2026-01-08 20:01:15','2026-01-08 20:01:15'),
(109,'Cumple con los objetivos de costo, calidad, medio ambiente y tiempo de ejecución','','2026-01-08 20:01:29','2026-01-08 20:01:29'),
(110,'Conocimiento de normativa técnica aplicable a construcción','','2026-01-08 20:02:59','2026-01-08 20:02:59'),
(111,'Conocimiento general de las diferentes especialidades en las edificaciones','','2026-01-08 20:03:10','2026-01-08 20:03:10'),
(112,'Dominio para la planificación de los recursos en obra, así como el conocimiento de los procesos constructivos para hacer eficientes los recursos materiales, humanos y de tiempo','','2026-01-08 20:03:21','2026-01-08 20:03:21'),
(113,'Conocimiento en administraciones y control de obra','','2026-01-08 20:03:29','2026-01-08 20:03:29'),
(114,'Experiencia en manejo de AutoCAD','','2026-01-08 20:03:45','2026-01-08 20:03:45'),
(115,'Dominio de programa de costos Opus/Neodata','','2026-01-08 20:04:16','2026-01-08 20:04:16'),
(116,'Conocimiento del uso de AutoCAD','','2026-01-08 20:04:24','2026-01-08 20:04:24'),
(117,'Conocimiento y actualización en sistemas constructivos, materiales y herramientas','','2026-01-08 20:04:33','2026-01-08 20:04:33'),
(118,'Claridad en los tiempos de ejecución de actividades y procesos','','2026-01-08 20:04:42','2026-01-08 20:04:42'),
(119,'Manejo de project para coordinación de programas y erogaciones','','2026-01-08 20:05:50','2026-01-08 20:05:50'),
(120,'Experiencia en planeación del desarrollo de Obras','','2026-01-08 20:05:57','2026-01-08 20:05:57'),
(121,'Capacidad de análisis de información, secuencias y procesos constructivos','','2026-01-08 20:06:05','2026-01-08 20:06:05'),
(122,'Gran conocimiento en el sector de construcción en materiales, herramientas y recursos humanos','','2026-01-08 20:06:15','2026-01-08 20:06:15'),
(123,'Dominio de las normas expedidas por la Secretaría del Trabajo y Previsión Social en Mexico aplicables a la obras de construcción','','2026-01-08 20:06:31','2026-01-08 20:06:31'),
(124,'Elaboración de manuales y reglamentos que faciliten el entendimiento de las normas dentro de los procesos constructivos','','2026-01-08 20:06:40','2026-01-08 20:06:40'),
(125,'Instauración de pláticas para fomentar la conciencia en los colaboradores y supervisar que los trabajos se realicen con las indicaciones descritas en las normas','','2026-01-08 20:06:48','2026-01-08 20:06:48'),
(126,'Estudio de riesgos y realización de simulacros','','2026-01-08 20:06:56','2026-01-08 20:06:56'),
(127,'Registrar y apoyar en el caso de desvíos, cambios y redirecciones de los acuerdos','','2026-01-08 20:07:32','2026-01-08 20:07:32'),
(128,'Supervisar los procesos, los tiempos y el desarrollo de cada trabajo','','2026-01-08 20:07:41','2026-01-08 20:07:41'),
(129,'Conocimientos de procesos constructivos, materiales y herramientas','','2026-01-08 20:07:56','2026-01-08 20:07:56'),
(130,'Conocimiento de project','','2026-01-08 20:08:07','2026-01-08 20:08:07'),
(131,'Uso de herramientas para cuantificación de materiales','','2026-01-08 20:08:15','2026-01-08 20:08:15'),
(132,'Experiencia con la normativa técnica aplicable a construcción','','2026-01-08 20:08:42','2026-01-08 20:08:42'),
(133,'Formación técnica en construcción y sus procesos','','2026-01-08 20:08:49','2026-01-08 20:08:49'),
(134,'Formación en sostenibilidad','','2026-01-08 20:09:14','2026-01-08 20:09:14'),
(135,'Formación en soluciones constructivas específicas','','2026-01-08 20:09:23','2026-01-08 20:09:23'),
(136,'Planificación de ventas y operaciones, incluyendo la previsión','','2026-01-08 20:10:03','2026-01-08 20:10:03'),
(137,'Alinear las actividades de la cadena de suministro, incluyendo la planificación, el abastecimiento, la producción y la entrega, con la demanda','','2026-01-08 20:10:13','2026-01-08 20:10:13'),
(138,'Gestionar los problemas de suministro y disponibilidad de materiales','','2026-01-08 20:10:20','2026-01-08 20:10:20'),
(139,'Medir el desempeño operativo y financiero','','2026-01-08 20:10:31','2026-01-08 20:10:31'),
(140,'Identificar y mitigar los riesgos','','2026-01-08 20:10:39','2026-01-08 20:10:39'),
(141,'Uso de sistemas empresariales como ERP y MRP','','2026-01-08 20:10:47','2026-01-08 20:10:47'),
(142,'Operación de sistemas para entornos de gestión de datos y almacenamiento con enfoque en servicios y aplicaciones de Backup & Data Center','','2026-01-08 20:11:42','2026-01-08 20:11:42'),
(143,'Conocimientos básicos en AVAMAR--VEEAM-VERITAS NETBACKUP para entregables y requerimientos','','2026-01-08 20:11:52','2026-01-08 20:11:52'),
(144,'Monitorear el rendimiento de la infraestructura y responder ante incidentes','','2026-01-08 20:12:00','2026-01-08 20:12:00'),
(145,'Análisis y monitoreo realizando la revisión y captura de los comportamientos anormales en la operación, para garantizar el perfecto funcionamiento del DC','','2026-01-08 20:12:10','2026-01-08 20:12:10');


-- 10. Insertar subgrupos operadores
INSERT INTO `subgrupos_operadores` VALUES
(1,'Data Center Operations Manager','','2026-01-08 17:39:18','2026-01-08 17:39:18'),
(2,'Ingeniero Eléctrico Senior','','2026-01-08 17:41:19','2026-01-08 17:41:19'),
(3,'Especialista en Diseño y Construcción','','2026-01-08 17:41:28','2026-01-08 17:41:28'),
(4,'Ingeniero de Infraestructura Crítica','','2026-01-08 17:41:40','2026-01-08 17:41:40'),
(5,'Especialista en Cableado Estructurado y Redes','','2026-01-08 17:41:50','2026-01-08 17:41:50'),
(7,'Especialista en Seguridad Física y Electrónica','','2026-01-08 17:42:08','2026-01-08 17:42:08'),
(8,'Especialista en Continuidad y Confiabilidad Operativa','','2026-01-08 17:42:17','2026-01-08 17:42:17'),
(9,'Estimador','','2026-01-08 17:42:28','2026-01-08 17:42:28'),
(10,'Controls Engineer 1','','2026-01-08 17:42:41','2026-01-08 17:42:41'),
(11,'Controls Engineer 2','','2026-01-08 17:42:59','2026-01-08 17:42:59'),
(12,'Ingeniero Enterprise','','2026-01-08 19:06:28','2026-01-08 19:06:28'),
(13,'Data Center Senior Architect','','2026-01-08 19:06:51','2026-01-08 19:06:51'),
(14,'Modelador BIM-MEP Jr','','2026-01-08 19:07:01','2026-01-08 19:07:01'),
(15,'Ingeniero Modelador','','2026-01-08 19:07:09','2026-01-08 19:07:09'),
(16,'Residente de Instalaciones','','2026-01-08 19:07:23','2026-01-08 19:07:23'),
(17,'Electrical Designer','','2026-01-08 19:07:36','2026-01-08 19:07:36'),
(18,'Mechanical Engineer','','2026-01-08 19:07:43','2026-01-08 19:07:43'),
(19,'Electrical Engineer','','2026-01-08 19:07:52','2026-01-08 19:07:52'),
(20,'BMS Software Engineer','','2026-01-08 19:08:01','2026-01-08 19:08:01'),
(21,'Sr. Electrical Engineer','','2026-01-08 19:08:11','2026-01-08 19:08:11'),
(22,'Ingeniero Constructor','','2026-01-08 19:08:20','2026-01-08 19:08:20'),
(23,'Gerente de Costos','','2026-01-08 19:08:28','2026-01-08 19:08:28'),
(25,'Gerente de Seguridad','','2026-01-08 19:12:00','2026-01-08 19:12:00'),
(26,'Residente Constructor','','2026-01-08 19:12:10','2026-01-08 19:12:10'),
(28,'Gerente de Cadena de Suministros','','2026-01-08 19:12:26','2026-01-08 19:12:26'),
(29,'Ingeniero de Data Center','','2026-01-08 19:12:34','2026-01-08 19:12:34');
