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
  `proyecto_ejecucion` text DEFAULT NULL,
  `proyecto_evaluacion` text DEFAULT NULL,
  `id_convocatoria` int(10) unsigned DEFAULT NULL,
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
  CONSTRAINT `fk_curso_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_curso` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_convocatoria` FOREIGN KEY (`id_convocatoria`) REFERENCES `convocatorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_maestro` FOREIGN KEY (`id_maestro`) REFERENCES `maestro` (`id_maestro`) ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_fechas_curso` CHECK (`fecha_fin` >= `fecha_inicio`),
  CONSTRAINT `chk_duracion_horas` CHECK (`duracion_horas` > 0 and `duracion_horas` <= 1000),
  CONSTRAINT `chk_cupo_maximo` CHECK (`cupo_maximo` > 0 and `cupo_maximo` <= 1000)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



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
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


CREATE TABLE `subtemas_unidad` (
  `id_subtema` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_unidad` int(10) unsigned NOT NULL,
  `nombre_subtema` varchar(255) NOT NULL,
  `descripcion_subtema` text DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_subtema`),
  KEY `idx_unidad_orden` (`id_unidad`,`orden`),
  CONSTRAINT `subtemas_unidad_ibfk_1` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_curso` (`id_unidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


CREATE TABLE `material_curso` (
  `id_material` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
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
  `id_actividad` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_material`),
  KEY `idx_curso` (`id_curso`),
  KEY `idx_tipo_archivo` (`tipo_archivo`),
  KEY `idx_fecha_subida` (`fecha_subida`),
  KEY `idx_subido_por` (`subido_por`),
  KEY `idx_categoria_material` (`categoria_material`),
  KEY `idx_curso_categoria` (`id_curso`,`categoria_material`),
  KEY `idx_activo` (`activo`),
  KEY `idx_actividad` (`id_actividad`),
  CONSTRAINT `fk_material_actividad` FOREIGN KEY (`id_actividad`) REFERENCES `calificaciones_actividades` (`id_actividad`) ON DELETE CASCADE,
  CONSTRAINT `fk_material_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_material_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE TABLE `calificaciones_actividades` (
  `id_actividad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_calificaciones_curso` int(10) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `instrucciones` text DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `max_archivos` int(10) unsigned NOT NULL DEFAULT 5,
  `max_tamano_mb` int(10) unsigned NOT NULL DEFAULT 10,
  `tipos_archivo_permitidos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tipos_archivo_permitidos`)),
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo_actividad` enum('actividad','proyecto') NOT NULL DEFAULT 'actividad',
  PRIMARY KEY (`id_actividad`),
  KEY `fk_actividad_calificaciones` (`id_calificaciones_curso`),
  KEY `idx_tipo_actividad` (`tipo_actividad`),
  CONSTRAINT `fk_actividad_calificaciones` FOREIGN KEY (`id_calificaciones_curso`) REFERENCES `calificaciones_curso` (`id_calificaciones`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
