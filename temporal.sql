/* Esto es para guardar las tareas que el alumno suba en su dashboard*/
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


/*Aqui el profesor crea un apartado para las practicas que deben subir los estudiantes, dandoles 
epecificaciones como fecha limite, si es actividad o proyecto e indicaciones del mismo*/
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
) ENGINE=InnoDB AUTO_INCREMENT=376 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*Es para promediar las calificaciones de las actividades y del proyecto y dar una calificacion final al curso*/
CREATE TABLE `calificaciones_curso` (
  `id_calificaciones` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `umbral_aprobatorio` int(11) NOT NULL DEFAULT 60 CHECK (`umbral_aprobatorio` >= 50 and `umbral_aprobatorio` <= 100),
  `puntos_totales` int(11) NOT NULL DEFAULT 100,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `porcentaje_actividades` int(10) unsigned NOT NULL DEFAULT 50,
  `porcentaje_proyecto` int(10) unsigned NOT NULL DEFAULT 50,
  PRIMARY KEY (`id_calificaciones`),
  UNIQUE KEY `uk_curso` (`id_curso`),
  CONSTRAINT `fk_calificaciones_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*Tabla con todo lo referente al curso*/
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
  CONSTRAINT `fk_curso_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_fechas_curso` CHECK (`fecha_fin` >= `fecha_inicio`),
  CONSTRAINT `chk_duracion_horas` CHECK (`duracion_horas` > 0 and `duracion_horas` <= 1000),
  CONSTRAINT `chk_cupo_maximo` CHECK (`cupo_maximo` > 0 and `cupo_maximo` <= 1000)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


/*Esta tabla es para darle seguimiento a las entregas de los estudiantes y ver si la entrego o no, poner
algun comentario de su entrega de actividad y tenga un feedback del profesor*/
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*Esta le da calificacion y nos ayuda a promediar las calificaciones de las tareas, proyectos del estudiante*/
CREATE TABLE `evaluacion` (
  `id_evaluacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_inscripcion` int(10) unsigned NOT NULL,
  `tipo_evaluacion` enum('examen','tarea','proyecto','participacion','ensayo','practica','final') NOT NULL,
  `nombre_evaluacion` varchar(100) NOT NULL,
  `calificacion` decimal(5,2) NOT NULL,
  `calificacion_maxima` decimal(5,2) DEFAULT 10.00,
  `peso_porcentual` decimal(5,2) DEFAULT 100.00,
  `fecha_evaluacion` date NOT NULL,
  `comentarios` text DEFAULT NULL,
  `evaluado_por` int(10) unsigned NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_evaluacion`),
  KEY `idx_inscripcion` (`id_inscripcion`),
  KEY `idx_tipo_evaluacion` (`tipo_evaluacion`),
  KEY `idx_fecha_evaluacion` (`fecha_evaluacion`),
  KEY `idx_evaluado_por` (`evaluado_por`),
  CONSTRAINT `fk_evaluacion_inscripcion` FOREIGN KEY (`id_inscripcion`) REFERENCES `inscripcion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluacion_maestro` FOREIGN KEY (`evaluado_por`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `chk_calificacion_evaluacion` CHECK (`calificacion` >= 0 and `calificacion` <= `calificacion_maxima`),
  CONSTRAINT `chk_peso_porcentual` CHECK (`peso_porcentual` > 0 and `peso_porcentual` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*Esto es para que el maestro pueda subirle material didactico al alumno, en la planeacion del curso
en las actividades le puede adjuntar enlaces, pdf o referencias en apa, tambien en la misma planeacion del curso
se le pude adjuntar en fuentes de informacion mas pdf, enlaces o referencias en apa que sera contenido en el que
se base el curso. Luego tengo otro modulo llamado MaterialADescargar.jsx que es para que el alumno pueda
 descargar material adicional.*/
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
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
