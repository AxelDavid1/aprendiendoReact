/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `actividad_materiales`
--

DROP TABLE IF EXISTS `actividad_materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_materiales`
--

LOCK TABLES `actividad_materiales` WRITE;
/*!40000 ALTER TABLE `actividad_materiales` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `actividad_materiales` VALUES
(58,409,244,0,'2026-01-21 17:26:56'),
(59,409,245,1,'2026-01-21 17:26:56'),
(60,409,248,2,'2026-01-21 17:26:56'),
(61,410,249,0,'2026-01-21 17:26:56'),
(69,412,256,0,'2026-01-23 18:44:58');
/*!40000 ALTER TABLE `actividad_materiales` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `alumno`
--

DROP TABLE IF EXISTS `alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumno`
--

LOCK TABLES `alumno` WRITE;
/*!40000 ALTER TABLE `alumno` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `alumno` VALUES
(2,73,15,'AXEL DAVID AREVALO GOMEZ','022000708','022000708@upsrj.edu.mx','axeldavidag101@gmail.com',NULL,9,'regular','2025-08-27 16:15:07','2025-11-11 15:25:35',6);
/*!40000 ALTER TABLE `alumno` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `archivos_entrega`
--

DROP TABLE IF EXISTS `archivos_entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_entrega`
--

LOCK TABLES `archivos_entrega` WRITE;
/*!40000 ALTER TABLE `archivos_entrega` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `archivos_entrega` VALUES
(1,1,'shadowing3.pdf','entrega-ea1739fe-1759248502260-262672033.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/entregas/entrega-ea1739fe-1759248502260-262672033.pdf','application/pdf',39664,'319b95c1ccac476d56f14edfb05ffdb696c812e7de3279da61085219009c270f','2025-09-30 16:08:22'),
(3,3,'shadowing3.pdf','entrega-8dc1a2b6-1759856067355-84529961.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/entregas_Alumno/entrega-8dc1a2b6-1759856067355-84529961.pdf','application/pdf',39664,'319b95c1ccac476d56f14edfb05ffdb696c812e7de3279da61085219009c270f','2025-10-07 16:54:27'),
(6,2,'Practica5.pdf','entrega-27bcc0c0-1759946383419-401714989.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/entregas_Alumno/entrega-27bcc0c0-1759946383419-401714989.pdf','application/pdf',388643,'c8caf2838bd201d9a07470c8d81d7101f4737b729bbb2734cc1568f5face7e25','2025-10-08 17:59:43'),
(7,2,'https://github.com/','enlace','https://github.com/','link',0,NULL,'2025-10-09 16:07:59'),
(8,4,'tarea1CienciaDatos.pdf','entrega-445bb5b1-1761709970156-692750841.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/entregas_Alumno/entrega-445bb5b1-1761709970156-692750841.pdf','application/pdf',11181,'ef9feecb4d85cb1724f760153a235de5a8e93722fdf7c3ebeb4c0ab86b293c6f','2025-10-29 03:52:50'),
(9,5,'machineLearningInvestigacion.pdf','entrega-a06ac862-1761709984112-378330191.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/entregas_Alumno/entrega-a06ac862-1761709984112-378330191.pdf','application/pdf',13366,'c246c4a9ad49d92b1d094be20ebc082ed40550fcdb79fbfc54475eac8aa1ebee','2025-10-29 03:53:04'),
(10,6,'https://github.com/','enlace','https://github.com/','link',0,NULL,'2026-01-14 18:16:59'),
(14,9,'https://duckduckgo.com/?q=Gartner+y+NIST&t=brave','enlace','https://duckduckgo.com/?q=Gartner+y+NIST&t=brave','link',0,NULL,'2026-01-21 17:29:10'),
(15,10,'https://link.springer.com/chapter/10.1007/1-4020-8058-1_14','enlace','https://link.springer.com/chapter/10.1007/1-4020-8058-1_14','link',0,NULL,'2026-01-21 18:13:01'),
(16,11,'https://dl.acm.org/doi/abs/10.1145/176979.176981','enlace','https://dl.acm.org/doi/abs/10.1145/176979.176981','link',0,NULL,'2026-01-21 18:13:59'),
(24,17,'https://es.wikipedia.org/wiki/Kubernetes','enlace','https://es.wikipedia.org/wiki/Kubernetes','link',0,NULL,'2026-01-23 18:06:23'),
(25,18,'https://repositorio.ufu.br/handle/123456789/43189','enlace','https://repositorio.ufu.br/handle/123456789/43189','link',0,NULL,'2026-01-23 18:46:00');
/*!40000 ALTER TABLE `archivos_entrega` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `areas_conocimiento`
--

DROP TABLE IF EXISTS `areas_conocimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas_conocimiento` (
  `id_area` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_area`),
  UNIQUE KEY `uk_nombre_area` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas_conocimiento`
--

LOCK TABLES `areas_conocimiento` WRITE;
/*!40000 ALTER TABLE `areas_conocimiento` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `areas_conocimiento` VALUES
(3,'Data Center Operations Manager','','2025-09-09 15:29:34'),
(9,'Ingeniero Eléctrico Senior','','2025-12-17 16:10:19');
/*!40000 ALTER TABLE `areas_conocimiento` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `asistencia`
--

DROP TABLE IF EXISTS `asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia` (
  `id_asistencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_inscripcion` int(10) unsigned NOT NULL,
  `fecha_clase` date NOT NULL,
  `asistio` tinyint(1) NOT NULL DEFAULT 0,
  `registrado_por` int(10) unsigned NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uk_inscripcion_fecha` (`id_inscripcion`,`fecha_clase`),
  KEY `idx_fecha_clase` (`fecha_clase`),
  KEY `idx_asistio` (`asistio`),
  KEY `idx_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_asistencia_inscripcion` FOREIGN KEY (`id_inscripcion`) REFERENCES `inscripcion` (`id_inscripcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asistencia_maestro` FOREIGN KEY (`registrado_por`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia`
--

LOCK TABLES `asistencia` WRITE;
/*!40000 ALTER TABLE `asistencia` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `asistencia` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(50) NOT NULL,
  `id_registro` int(10) unsigned NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `id_usuario` int(10) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_accion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_tabla_accion` (`tabla_afectada`,`accion`),
  KEY `idx_fecha_accion` (`fecha_accion`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_tabla_registro` (`tabla_afectada`,`id_registro`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `calificaciones_actividades`
--

DROP TABLE IF EXISTS `calificaciones_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=415 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones_actividades`
--

LOCK TABLES `calificaciones_actividades` WRITE;
/*!40000 ALTER TABLE `calificaciones_actividades` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `calificaciones_actividades` VALUES
(103,4,'Analisar Datos','Analiza datos act 1',NULL,5,10,'[\"pdf\",\"link\"]','2025-09-25 15:03:27','2025-10-07 17:21:05','actividad',NULL,NULL),
(104,4,'Actividad 2','Realizar una investigacion ',NULL,5,10,'[\"pdf\",\"link\"]','2025-09-25 18:01:30','2025-10-07 17:21:13','actividad',NULL,NULL),
(105,122,'Investigar que son los fundamentos de ciencia de datos','citar en apa',NULL,5,10,'[\"pdf\",\"link\"]','2025-10-29 03:46:13','2025-10-29 03:46:13','actividad',NULL,NULL),
(106,125,'Investigar que es Machine Learning',NULL,NULL,5,10,'[\"pdf\",\"link\"]','2025-10-29 03:50:38','2025-10-29 03:50:38','actividad',NULL,NULL),
(215,142,'Actividad 1','Comparar un programa simple en paradigma procedimental vs. orientado a objetos usando un IDE como Eclipse o PyCharm. Convertir un código procedimental (ej. calculadora básica) a uno con clases y objetos, y documentar las ventajas.',NULL,5,10,'[\"pdf\",\"link\"]','2025-12-17 16:57:05','2025-12-17 16:57:05','actividad',75,NULL),
(216,142,'Proyecto Final','Desarrollo de un Sistema de Gestión de Biblioteca (o Librería Digital) implementado completamente en Java (o Python, según prefieras) utilizando principios avanzados de Programación Orientada a Objetos. El sistema permitirá registrar usuarios, gestionar libros (físicos y digitales), realizar préstamos/devoluciones, aplicar multas por retraso, generar reportes y buscar libros por diferentes criterios. Se aplicarán obligatoriamente encapsulamiento, herencia, polimorfismo, interfaces, manejo de excepciones, colecciones, al menos un patrón de diseño (Singleton para la conexión a datos y Factory para crear tipos de usuarios/libros) y principios SOLID.',NULL,10,25,'[\"pdf\",\"link\",\"zip\"]','2025-12-17 16:57:05','2025-12-17 16:57:05','proyecto',NULL,NULL),
(375,198,'Proyecto Final','El proyecto parte del diagnóstico de que muchos data centers medianos enfrentan riesgos de pérdida de datos por backups ineficientes, según informes de Gartner y NIST. Se fundamenta en estándares como ISO 27001 para seguridad, conceptos de almacenamiento (EMC, NetApp) y contexto de crecimiento de data centers en México (TecNM). Los estudiantes investigarán casos reales (Google Cloud, AWS) para justificar la necesidad de sistemas resilientes.','2026-01-22',10,25,'[\"pdf\",\"link\",\"zip\"]','2026-01-13 16:29:56','2026-01-21 17:26:56','proyecto',NULL,NULL),
(409,198,'Actividad 1','Instalar y configurar una VM con Linux para data center usando VMware o Hyper-V','2026-01-24',5,10,'[\"pdf\",\"link\"]','2026-01-13 19:58:35','2026-01-21 17:26:56','actividad',76,118),
(410,198,'Actividad 2','Implementar Prometheus para monitorear métricas en un entorno simulado.','2026-01-25',5,10,'[\"pdf\",\"link\"]','2026-01-13 19:58:35','2026-01-21 17:26:56','actividad',76,119),
(411,198,'Actividad 3','Simular RAID levels en software como mdadm y probar redundancia.','2026-01-26',5,10,'[\"pdf\",\"link\"]','2026-01-13 19:58:35','2026-01-21 17:26:56','actividad',77,122),
(412,264,'Proyecto Final','Desarrollo de un Sistema Híbrido de Data Center con Alta Disponibilidad usando herramientas como Kubernetes, AWS y herramientas de seguridad. Incluirá migración, backup automatizado, analytics y medidas green, construyendo sobre conceptos previos de almacenamiento y operación.','2026-01-31',10,25,'[\"pdf\",\"link\",\"zip\"]','2026-01-15 20:00:32','2026-01-23 18:44:58','proyecto',NULL,NULL),
(414,264,'Actividad 1','Investigar que es Kurbenetes','2026-01-31',5,10,'[\"pdf\",\"link\"]','2026-01-23 16:01:22','2026-01-23 18:44:58','actividad',78,125);
/*!40000 ALTER TABLE `calificaciones_actividades` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `calificaciones_curso`
--

DROP TABLE IF EXISTS `calificaciones_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones_curso`
--

LOCK TABLES `calificaciones_curso` WRITE;
/*!40000 ALTER TABLE `calificaciones_curso` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `calificaciones_curso` VALUES
(4,8,65,100,'2025-09-23 15:17:57','2025-09-23 15:17:57',50,50),
(122,7,65,100,'2025-10-29 03:46:13','2025-10-29 03:46:13',50,50),
(125,6,80,100,'2025-10-29 03:50:38','2025-10-29 03:50:38',50,50),
(142,17,70,100,'2025-12-02 15:45:20','2025-12-17 16:57:05',70,30),
(198,18,75,100,'2026-01-12 16:27:51','2026-01-21 17:26:56',30,70),
(264,19,70,100,'2026-01-15 20:00:31','2026-01-23 18:44:58',70,30);
/*!40000 ALTER TABLE `calificaciones_curso` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `capacidad_universidad`
--

DROP TABLE IF EXISTS `capacidad_universidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capacidad_universidad`
--

LOCK TABLES `capacidad_universidad` WRITE;
/*!40000 ALTER TABLE `capacidad_universidad` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `capacidad_universidad` VALUES
(17,14,5,0),
(17,28,30,0),
(17,31,30,0),
(18,15,30,0),
(18,16,30,0),
(19,14,60,0),
(19,26,30,0),
(19,31,30,0),
(20,14,40,0),
(20,15,60,2),
(20,18,10,0),
(21,14,30,0),
(21,15,30,1),
(21,16,30,0),
(21,17,30,0),
(22,14,50,0),
(22,15,80,0),
(22,16,34,0),
(22,17,40,0),
(22,18,28,0),
(22,20,20,0);
/*!40000 ALTER TABLE `capacidad_universidad` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `carreras`
--

DROP TABLE IF EXISTS `carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carreras`
--

LOCK TABLES `carreras` WRITE;
/*!40000 ALTER TABLE `carreras` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `carreras` VALUES
(1,34,'Licenciatura en Informática','123',4,'2025-08-14 15:42:04','2025-08-14 15:42:04'),
(6,35,'Ingeniería en Software','222',3,'2025-08-15 14:54:46','2026-02-17 19:13:32'),
(7,34,'Ingeniería de Software','124',4,'2025-08-15 15:25:02','2025-08-15 15:25:02'),
(8,34,'Ingeniería en Ciencia y Analítica de Datos','125',4,'2025-08-15 15:25:28','2025-08-15 15:25:28'),
(9,36,'Ingeniería en Sistemas Computacionales','999',4,'2025-08-21 16:46:41','2025-08-21 16:46:41'),
(10,34,'Redes','65',4,'2025-08-29 17:50:16','2025-08-29 17:50:33'),
(11,37,'Ingeniería en Automatización','654',3,'2026-01-12 16:00:30','2026-01-12 16:00:30');
/*!40000 ALTER TABLE `carreras` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categoria_curso`
--

DROP TABLE IF EXISTS `categoria_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_curso`
--

LOCK TABLES `categoria_curso` WRITE;
/*!40000 ALTER TABLE `categoria_curso` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categoria_curso` VALUES
(25,3,'Conocimiento y experiencia trabajando con la normativa técnica local e internacional aplicable a instalaciones eléctricas',NULL,'activa',1,'2025-09-09 15:29:49',NULL),
(26,3,'Conocimiento medio / alto de Microsoft Office',NULL,'activa',2,'2025-09-09 15:29:58',NULL),
(39,3,'Comprensión de planificación de proyectos',NULL,'activa',3,'2025-12-17 16:03:48',NULL),
(40,3,'Habilidad para ejecutar tareas simultaneas',NULL,'activa',4,'2025-12-17 16:04:01',NULL),
(41,3,'Ingles B1/B2',NULL,'activa',5,'2025-12-17 16:04:13',NULL),
(42,3,'Manejo de AutoCAD',NULL,'activa',6,'2025-12-17 16:06:29',NULL),
(43,3,'Conocimiento de BIM Management / Revit y BIM360',NULL,'activa',7,'2025-12-17 16:06:41',NULL);
/*!40000 ALTER TABLE `categoria_curso` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `certificacion`
--

DROP TABLE IF EXISTS `certificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `imagen_url` varchar(500) DEFAULT NULL,
  `imagen_original_url` text DEFAULT NULL,
  `imagen_ajustes` text DEFAULT NULL,
  PRIMARY KEY (`id_certificacion`),
  UNIQUE KEY `uk_nombre` (`nombre`),
  KEY `idx_categoria` (`id_categoria`),
  KEY `fk_certificacion_universidad` (`id_universidad`),
  KEY `fk_certificacion_facultad` (`id_facultad`),
  CONSTRAINT `fk_certificacion_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_curso` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_certificacion_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_certificacion_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificacion`
--

LOCK TABLES `certificacion` WRITE;
/*!40000 ALTER TABLE `certificacion` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `certificacion` VALUES
(1,14,34,'IA','Credencial IA para principiantes',NULL,NULL,'activa','2025-08-19 16:10:15','2025-08-20 16:08:45',NULL,NULL,NULL),
(3,15,35,'Ciencia de Datos Aplicada','Credencial que abarca fundamentos, análisis avanzado y machine learning para dominar la ciencia de datos aplicada.',NULL,NULL,'activa','2025-09-17 15:02:01','2026-02-17 18:26:46','/uploads/credenciales/cropped_1771352804086.webp','/uploads/credenciales/original_1771352804079.webp','{\"x\":-12.7,\"y\":-6.4,\"scale\":1.08}'),
(6,15,35,'DATA_CENTERS','Saldras con conocimientos solidos en Data Centers',NULL,NULL,'activa','2026-01-21 17:05:04','2026-02-17 18:27:05','/uploads/credenciales/cropped_1771352822631.webp','/uploads/credenciales/original_1771352815780.webp','{\"x\":-40,\"y\":0,\"scale\":1}');
/*!40000 ALTER TABLE `certificacion` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `certificacion_alumno`
--

DROP TABLE IF EXISTS `certificacion_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_cert_alumno_certificacion` FOREIGN KEY (`id_certificacion`) REFERENCES `certificacion` (`id_certificacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_calificacion_promedio` CHECK (`calificacion_promedio` >= 0 and `calificacion_promedio` <= 10)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificacion_alumno`
--

LOCK TABLES `certificacion_alumno` WRITE;
/*!40000 ALTER TABLE `certificacion_alumno` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `certificacion_alumno` VALUES
(12,2,3,100.00,1,'2025-10-29 18:07:40',1,'2025-10-29 18:07:40','/uploads/certificados/certificado_2_3_1761761260343.pdf',8.50,'2025-10-29 18:07:40','Credencial que abarca fundamentos, análisis avanzado y machine learning para dominar la ciencia de datos aplicada.'),
(13,2,6,100.00,1,'2026-01-21 18:24:41',1,'2026-01-21 18:24:41','/uploads/certificados/certificado_2_6_1769019881740.pdf',8.50,'2026-01-21 18:24:41','Saldras con conocimientos solidos en Data Centers');
/*!40000 ALTER TABLE `certificacion_alumno` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `auditar_certificado` AFTER UPDATE ON `certificacion_alumno`
FOR EACH ROW
BEGIN
  IF NEW.certificado_emitido = TRUE AND OLD.certificado_emitido = FALSE THEN
    INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `datos_anteriores`, `datos_nuevos`, `id_usuario`, `descripcion`, `fecha_accion`)
    VALUES (
      'certificacion_alumno',
      NEW.id_cert_alumno,
      'UPDATE',
      JSON_OBJECT('certificado_emitido', OLD.certificado_emitido, 'fecha_certificado', OLD.fecha_certificado),
      JSON_OBJECT('certificado_emitido', NEW.certificado_emitido, 'fecha_certificado', NEW.fecha_certificado),
      NULL, -- Ajustar según quién emite
      'Emisión de certificado mayor',
      CURRENT_TIMESTAMP
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `constancia_alumno`
--

DROP TABLE IF EXISTS `constancia_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constancia_alumno`
--

LOCK TABLES `constancia_alumno` WRITE;
/*!40000 ALTER TABLE `constancia_alumno` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `constancia_alumno` VALUES
(38,2,8,3,100.00,33.33,'2025-10-29 17:56:37','/uploads/constancias/constancia_2_8_1761760597088.pdf'),
(39,2,7,3,100.00,33.33,'2025-10-29 18:06:52','/uploads/constancias/constancia_2_7_1761761212753.pdf'),
(40,2,6,3,100.00,33.33,'2025-10-29 18:07:30','/uploads/constancias/constancia_2_6_1761761250483.pdf'),
(41,2,19,6,100.00,50.00,'2026-01-21 17:11:18','/uploads/constancias/constancia_2_19_1769015478525.pdf'),
(42,2,18,NULL,100.00,100.00,'2026-01-21 18:24:33','/uploads/constancias/constancia_2_18_1769019873138.pdf');
/*!40000 ALTER TABLE `constancia_alumno` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `convocatoria_universidades`
--

DROP TABLE IF EXISTS `convocatoria_universidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convocatoria_universidades`
--

LOCK TABLES `convocatoria_universidades` WRITE;
/*!40000 ALTER TABLE `convocatoria_universidades` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `convocatoria_universidades` VALUES
(52,17,14),
(53,17,28),
(54,17,31),
(29,18,15),
(28,18,16),
(55,19,14),
(57,19,26),
(56,19,31),
(64,20,14),
(65,20,15),
(66,20,18),
(42,21,14),
(43,21,15),
(45,21,16),
(44,21,17),
(58,22,14),
(59,22,15),
(60,22,16),
(61,22,17),
(62,22,18),
(63,22,20);
/*!40000 ALTER TABLE `convocatoria_universidades` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `convocatorias`
--

DROP TABLE IF EXISTS `convocatorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convocatorias`
--

LOCK TABLES `convocatorias` WRITE;
/*!40000 ALTER TABLE `convocatorias` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `convocatorias` VALUES
(17,'Uni_UAQ','','finalizada','2025-09-12 16:59:11','2026-02-06 16:25:37','2025-09-10','2025-09-12','2025-09-11','2025-09-12','2025-09-12','2025-09-14'),
(18,'UPSRJ_ITM','','finalizada','2025-09-12 17:02:03','2025-09-17 14:48:09','2025-09-10','2025-09-12','2025-09-11','2025-09-12','2025-09-13','2025-09-14'),
(19,'Unis x UAQ Septiembre','Septiembre Convocatoria','finalizada','2025-09-17 15:28:22','2026-02-06 16:31:28','2025-09-16','2025-09-17','2025-09-16','2025-09-17','2025-09-17','2025-09-18'),
(20,'UPSRJ x UAQ x UPQ Febrero2026','Febrero 2026','planeada','2025-09-25 17:53:21','2026-02-10 15:24:36','2026-02-01','2026-02-06','2026-02-06','2026-02-07','2026-02-15','2026-02-28'),
(21,'Noviembre 2025','UPSRJ x UAQ','finalizada','2025-11-03 15:16:12','2025-12-01 14:51:32','2025-11-02','2025-11-03','2025-11-03','2025-11-03','2025-11-03','2025-11-30'),
(22,'Enero-Febrero Data Center','Se procura que los alumnos de las universidades participantes salgan con un perfil apto para \"Ingenieros en Data Center\". Enseñamos para que seas profesional.','activa','2026-01-12 16:25:22','2026-02-06 19:49:16','2026-01-10','2026-01-12','2026-01-11','2026-02-15','2026-01-12','2026-02-14');
/*!40000 ALTER TABLE `convocatorias` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `imagen_url` varchar(500) DEFAULT NULL,
  `imagen_original_url` text DEFAULT NULL,
  `imagen_ajustes` text DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso`
--

LOCK TABLES `curso` WRITE;
/*!40000 ALTER TABLE `curso` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `curso` VALUES
(1,5,NULL,1,14,34,1,'CURSO-00001','Dominando los Modelos LLM de IA','Curso especializado en el estudio y comprensión de los Modelos de Lenguaje de Gran Escala (LLM), abordando su arquitectura, funcionamiento, entrenamiento y aplicaciones prácticas en generación y análisis de texto.','Conocimientos básicos de Python y manejo de librerías para IA.\nFundamentos de redes neuronales y procesamiento de lenguaje natural (NLP).\nnociones de álgebra lineal y probabilidad.','Comprender la arquitectura y principios de funcionamiento de los LLM.\nAnalizar cómo se entrenan y optimizan estos modelos.\nImplementar ejemplos prácticos con APIs de LLM.\nEvaluar ventajas, limitaciones y consideraciones éticas en su uso.',30,0.00,20,10,'basico','virtual','gratuito',NULL,80,'2025-08-13','2025-08-31','','','planificado',0,0,NULL,NULL,NULL,'2025-08-12 14:35:13','2025-09-09 17:20:04',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,13,NULL,1,14,34,7,'CURSO-00002','Python Primeros pasos','Aprenderas la base de python para entender las redes neuronales.','Poder crear tu propia IA.','Saber  tipos de datos, arreglos y dominar un lenguaje de programacion, puede ser C++ o Java.',20,0.00,10,10,'basico','mixto','gratuito',NULL,60,'2025-08-18','2025-11-15','','','planificado',0,0,NULL,NULL,NULL,'2025-08-15 16:28:52','2025-11-03 15:14:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,17,26,3,15,35,6,'CURSO-00003','Bases de datos en mysql','Aprender mysql','Manejar bases de datos robustas para proyectos grandes.','Saber de entidad relacion y tipos de datos.',30,0.00,15,15,'basico','presencial','gratuito',NULL,150,'2025-08-25','2025-08-31','','','planificado',0,0,NULL,NULL,NULL,'2025-08-15 17:41:23','2026-01-28 21:00:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,14,NULL,4,14,34,1,'CURSO-00004','Edge Computing','Aprenderas edge computing','Aprender mejores bases para proyectos que necesitan enviar y recibir datos en distancias cortas.','Saber acerca de redes y conexiones.',60,0.00,40,20,'intermedio','mixto','gratuito',NULL,120,'2025-09-01','2025-11-15','','','planificado',0,0,NULL,NULL,NULL,'2025-08-20 15:19:55','2026-01-28 19:32:27',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,16,NULL,6,16,36,9,'CURSO-00005','Github desde 0','Con esto comprenderas como funciona un control de versiones para siempre respaldar tus proyectos.','Que puedas trabajar en un proyecto haciendo commits y push en equipo, dominaras los merge y podras estar preparado para proyectos mas robustos.','Dominar comandos basicos en terminal.\nTener cuenta en github.\nSaber que son conexiones por SSH.',45,0.00,42,3,'basico','virtual','gratuito',NULL,80,'2025-09-15','2025-09-29','','','planificado',0,0,NULL,NULL,NULL,'2025-08-21 16:51:58','2025-09-09 17:30:36',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(6,17,25,3,15,35,6,'CURSO-00006','Machine Learning Fundamentos','Este curso explora la aplicación de algoritmos de aprendizaje automático en la ciencia de datos, con énfasis en la creación de modelos predictivos.','Implementar y evaluar modelos de machine learning, optimizar pipelines de datos y aplicar técnicas de validación cruzada.','Experiencia en análisis de datos y conocimientos intermedios de programación en Python.',50,0.00,20,30,'intermedio','mixto','gratuito',NULL,80,'2025-09-16','2025-11-15',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-09-09 16:53:49','2026-01-28 21:00:42',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,17,25,3,15,35,6,'CURSO-00007','Fundamentos de Ciencia de Datos','Este curso introduce los conceptos fundamentales de la ciencia de datos, incluyendo recolección, limpieza y análisis inicial de datos.','Aprender a recolectar y limpiar datos, realizar análisis exploratorios y utilizar herramientas básicas de ciencia de datos como Python y Pandas.','Conocimientos básicos de programación (Python recomendado) y estadística.',50,0.00,30,20,'basico','mixto','gratuito',NULL,80,'2025-09-16','2025-11-15',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-09-17 14:57:39','2026-01-28 21:00:34',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(8,15,26,3,15,35,6,'CURSO-00008','Análisis de Datos Avanzado','Un curso práctico que profundiza en técnicas avanzadas de análisis de datos, como visualización, modelado estadístico y segmentación.','Dominar técnicas de visualización de datos, aplicar modelos estadísticos avanzados y realizar análisis predictivos.','Conocimientos de fundamentos de ciencia de datos y manejo de herramientas como Python o R.',60,0.00,40,20,'avanzado','mixto','gratuito',NULL,60,'2025-09-16','2025-12-01',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-09-17 14:59:11','2026-02-17 18:26:30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,20,'/uploads/cursos/cropped_1771352788034.webp','/uploads/cursos/original_1771352779837.webp','{\"x\":25.15,\"y\":-13.31,\"scale\":1.1664}'),
(9,15,NULL,3,15,35,6,'CURSO-00009','Curso IA y CD','curso de IA','Aprender tecnologias','saber fundamentos',4,0.00,2,2,'basico','virtual','gratuito',NULL,20,'2025-10-28','2025-10-30',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-10-29 18:00:44','2025-10-29 18:00:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(10,15,NULL,1,15,35,6,'CURSO-00010','Introducción a los Modelos de Lenguaje Grandes (LLM)','Los Modelos de Lenguaje Grandes (LLMs) son algoritmos de aprendizaje automático que pueden comprender y generar texto similar al humano. Este curso te proporcionará una comprensión fundamental de cómo funcionan estos modelos.','Aprenderás sobre diversos casos de uso de los LLMs, desde la generación de contenido hasta la automatización de tareas de atención al cliente.','Tener fundamentos basicos de que es la IA',30,0.00,15,15,'basico','virtual','gratuito',NULL,59,'2025-11-03','2025-11-09',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-11-03 15:04:55','2025-11-03 15:04:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(17,15,NULL,6,15,35,6,'CURSO-00017','Programacion Orientada a Objetos','Curso orientado a aprender POO.','Ser capaz de crear un programa que tenga buenas pracaticas con el paradigma de POO.','Saber conceptos basicos de Programacion como variables, constantes, objetos, clases, metodos.',60,0.00,20,40,'basico','mixto','gratuito',NULL,65,'2025-12-01','2025-12-16',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2025-12-02 15:39:52','2026-01-28 21:00:55','Esta asignatura aporta al perfil del egresado los conocimientos fundamentales de programación orientada a objetos para modelar y resolver problemas reales mediante el diseño de software modular y reutilizable. Es base para asignaturas avanzadas como Ingeniería de Software y Desarrollo de Aplicaciones, incluyéndose en semestres intermedios. Aporta conceptos clave como clases, herencia y polimorfismo para Estructuras de Datos y Sistemas Distribuidos.','La asignatura se organiza en cinco temas principales. Los primeros introducen conceptos básicos de objetos y clases, mientras que los siguientes profundizan en principios avanzados y aplicaciones.\nEl primer tema revisa paradigmas de programación, enfatizando la transición de procedimental a orientado a objetos, con ejemplos en lenguajes como Java o Python.\nEl tema dos analiza componentes como clases, objetos y encapsulamiento, con énfasis en modelado UML.\nEl tema tres aborda herencia, polimorfismo e interfaces, validando mediante diagramas y código.\nEl tema cuatro explora patrones de diseño y manejo de excepciones para software robusto.\nFinalmente, el tema cinco integra conceptos en proyectos reales, como aplicaciones con interfaces gráficas.\nLos contenidos se abordan secuencialmente, fomentando prácticas en equipo para un aprendizaje significativo. El docente guía con herramientas digitales para motivar el desarrollo de software.','Recomendaciones: Mapas conceptuales, códigos fuente, reportes, exposiciones, portafolios.\nInstrumentos: Rúbricas, listas de cotejo; auto, co y heteroevaluación.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Diseña y desarrolla programas orientados a objetos aplicando principios como encapsulamiento, herencia y polimorfismo para resolver problemas computacionales.','Programación básica (estructurada o procedimental).','El proyecto parte del diagnóstico de que muchas bibliotecas escolares o pequeñas comunitarias aún manejan sus procesos de forma manual o con hojas de Excel, lo que genera errores, pérdida de tiempo y dificultad para generar estadísticas. Se fundamenta en la necesidad real de digitalizar la gestión bibliotecaria aplicando POO para crear software modular, reutilizable y mantenible. Se revisan conceptos teóricos de POO (Gamma et al., Eckel, Schildt), principios SOLID y patrones de diseño, así como el contexto de transformación digital en instituciones educativas (TecNM). Los estudiantes investigarán casos reales de sistemas bibliotecarios (Kohla, Calibre, bibliotecas del Tec) para justificar la viabilidad y relevancia del proyecto.','Con base en el diagnóstico en esta fase se realiza el diseño del proyecto por parte de los estudiantes con asesoría del docente; implica planificar un proceso: de intervención empresarial, social o comunitaria, el diseño de un modelo, entre otros, según el tipo de proyecto, las actividades a realizar, los recursos requeridos y el cronograma de trabajo.\nLos estudiantes (en equipos de 3-4 personas) elaborarán:\n\nDiagramas UML completos (casos de uso, clases, secuencia) usando StarUML o Lucidchart.\nDefinición de clases principales: Usuario (con herencia: Estudiante, Profesor, Administrador), Libro (herencia: LibroFisico, Ebook), Prestamo, Multa, Biblioteca (Singleton).\nAplicación de patrones: Factory para crear usuarios/libros, Observer para notificar devoluciones vencidas.\nPersistencia en archivos (JSON o serialización) o base de datos SQLite/JDBC.\nInterfaz gráfica con JavaFX o Swing (o Tkinter en Python).\nCronograma de 6-8 semanas: Semana 1-2: UML y diseño, 3-5: implementación núcleo, 6: GUI y persistencia, 7: testing y patrones, 8: entrega final y presentación.','Consiste en el desarrollo de la planeación del proyecto realizada por parte de los estudiantes con asesoría del docente, es decir en la intervención (social, empresarial), o construcción del modelo propuesto según el tipo de proyecto, es la fase de mayor duración que implica el desempeño de las competencias genéricas y específicas a desarrollar.\nImplementación completa del sistema siguiendo el diseño:\n\nCódigo limpio, comentado y aplicando SOLID rigorosamente.\nManejo robusto de excepciones personalizadas (ej. LibroNoDisponibleException, MultaPendienteException).\nUso intensivo de colecciones (List, Map, Set) y generics.\nInterfaz gráfica funcional con ventanas para login, búsqueda, préstamo, reporte de morosos, etc.\nTesting unitario con JUnit/pytest (mínimo 80% cobertura en clases principales).\nLos equipos llevarán control de versiones con Git y GitHub, con commits semanales y ramas por funcionalidad.','Es la fase final que aplica un juicio de valor en el contexto laboral-profesión, social e investigativo, ésta se debe realizar a través del reconocimiento de logros y aspectos a mejorar se estará promoviendo el concepto de “evaluación para la mejora continua”, la metacognición, el desarrollo del pensamiento crítico y reflexivo en los estudiantes.\nEvaluación integral con rúbrica (máximo 100 puntos):\n\n30% Diseño UML y aplicación de SOLID/patrones\n40% Funcionalidad completa, calidad de código y testing\n15% Interfaz gráfica y experiencia de usuario\n15% Presentación oral, video demo (3-5 min), informe final y reflexión individual sobre qué principios POO fueron más útiles y cómo los aplicarían en un proyecto real laboral.\nSe promoverá autoevaluación, coevaluación de equipo y heteroevaluación. Se valorará especialmente la creatividad (ej. agregar notificaciones por email, código QR para libros, recomendador simple) y el cumplimiento estricto de principios POO.',21,NULL,NULL,NULL,NULL),
(18,17,NULL,NULL,15,35,6,'CURSO-00018','Operación de Sistemas para Entornos de Gestión de Datos y Almacenamiento','Aporta conceptos clave como configuración de almacenamiento, estrategias de backup y optimización de recursos para garantizar alta disponibilidad y resiliencia en infraestructuras críticas.','La asignatura tiene como objetivo proporcionar una comprensión integral de la operación y gestión de infraestructuras de TI, abordando desde el funcionamiento de sistemas operativos en entornos de datos hasta la aplicación práctica de soluciones empresariales, con énfasis en la virtualización, el monitoreo, las tecnologías de almacenamiento, los servicios de respaldo y recuperación, la administración eficiente de centros de datos y la integración de estos conocimientos en escenarios reales mediante automatización y cumplimiento de normativas.','Se recomienda que el estudiante cuente con conocimientos básicos de sistemas operativos (especialmente conceptos de procesos, memoria y manejo de archivos), redes de computadoras (modelo TCP/IP, direccionamiento, servicios y protocolos básicos), y arquitectura de computadoras.',45,0.00,15,30,'basico','presencial','gratuito',NULL,50,'2026-01-11','2026-01-31',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2026-01-12 16:21:18','2026-01-28 21:00:47','Esta asignatura aporta al perfil del egresado los conocimientos para operar y gestionar sistemas en entornos de data centers, enfocándose en servicios de backup, almacenamiento y recuperación de datos. Es base para asignaturas avanzadas como Seguridad en Data Centers y Cloud Computing, incluyéndose en semestres avanzados. Aporta conceptos clave como configuración de almacenamiento, estrategias de backup y optimización de recursos para garantizar alta disponibilidad y resiliencia en infraestructuras críticas.','La asignatura se organiza en cinco temas principales. Los primeros introducen conceptos de operación de sistemas y almacenamiento, mientras que los siguientes profundizan en backup, data centers y aplicaciones prácticas.\nEl primer tema revisa operación de sistemas operativos en entornos de datos, enfatizando virtualización y monitoreo.\nEl tema dos analiza tecnologías de almacenamiento, con énfasis en RAID, SAN y NAS.\nEl tema tres aborda servicios de backup y recuperación, validando mediante simulaciones.\nEl tema cuatro explora gestión de data centers, incluyendo eficiencia energética y escalabilidad.\nFinalmente, el tema cinco integra conceptos en aplicaciones reales, como automatización y compliance.\nLos contenidos se abordan secuencialmente, fomentando prácticas en equipo para un aprendizaje significativo. El docente guía con herramientas digitales para motivar la operación de infraestructuras de datos.','Recomendaciones: Mapas conceptuales, reportes, exposiciones, problemarios, portafolios, tablas comparativas, glosarios.\nInstrumentos: Listas de cotejo, matrices de valoración, rúbricas; hetero, co y autoevaluación.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Opera y gestiona sistemas para entornos de almacenamiento y data centers, aplicando servicios de backup y recuperación para asegurar la integridad, disponibilidad y eficiencia de los datos en escenarios reales.','Administra sistemas operativos y redes básicas.\nGestiona bases de datos relacionales y no relacionales.\nIdentifica principios de virtualización y cloud computing.','El proyecto parte del diagnóstico de que muchos data centers medianos enfrentan riesgos de pérdida de datos por backups ineficientes, según informes de Gartner y NIST. Se fundamenta en estándares como ISO 27001 para seguridad, conceptos de almacenamiento (EMC, NetApp) y contexto de crecimiento de data centers en México (TecNM). Los estudiantes investigarán casos reales (Google Cloud, AWS) para justificar la necesidad de sistemas resilientes.','Los estudiantes (en equipos de 3-4) elaborarán: Diagramas de arquitectura (UML para flujo de datos); clases principales para backup (con herencia para tipos de storage); integración con herramientas como Docker y Prometheus; persistencia en NAS simulada; cronograma de 6-8 semanas: Semana 1-2: Diseño y requisitos, 3-5: Implementación núcleo, 6: Testing y optimización, 7: Reportes, 8: Entrega.','Consiste en el desarrollo de la planeación del proyecto realizada por parte de los estudiantes con asesoría del docente, es decir en la intervención (social, empresarial), o construcción del modelo propuesto según el tipo de proyecto, es la fase de mayor duración que implica el desempeño de las competencias genéricas y específicas a desarrollar.\nImplementación del sistema: Código automatizado, configuración de backups; simulación de fallos y recuperación; monitoreo en tiempo real; control de versiones con Git; testing de alta disponibilidad.','Es la fase final que aplica un juicio de valor en el contexto laboral-profesión, social e investigativo, ésta se debe realizar a través del reconocimiento de logros y aspectos a mejorar se estará promoviendo el concepto de “evaluación para la mejora continua”, la metacognición, el desarrollo del pensamiento crítico y reflexivo en los estudiantes.\nEvaluación con rúbrica (100 puntos): 30% Diseño y arquitectura, 40% Funcionalidad y testing, 15% Optimización energética, 15% Presentación, informe y reflexión sobre aplicaciones en data centers reales.',22,NULL,NULL,NULL,NULL),
(19,15,NULL,NULL,15,35,6,'CURSO-00019','Administración Avanzada de Data Centers y Servicios en la Nube','Continuacion de curso','Aprender','Haber tomado el curso anterior',60,0.00,30,30,'intermedio','mixto','gratuito',NULL,31,'2026-01-10','2026-02-28',NULL,NULL,'planificado',0,0,NULL,NULL,NULL,'2026-01-15 18:38:02','2026-02-17 18:26:07','Esta asignatura aporta al perfil del egresado habilidades avanzadas para administrar data centers y servicios cloud, enfocándose en optimización, seguridad y escalabilidad. Es continuación de Operación de Sistemas para Entornos de Gestión de Datos y Almacenamiento, construyendo sobre conceptos de backup, almacenamiento y operación para gestionar infraestructuras híbridas y cloud-native. Se incluye en semestres avanzados y soporta asignaturas como Ciberseguridad en Datos y Big Data Analytics.','El primer tema revisa optimización de recursos en data centers, enfatizando automatización y orquestación.\nEl tema dos analiza seguridad avanzada y compliance en entornos de datos.\nEl tema tres aborda migración a la nube y servicios híbridos.\nEl tema cuatro explora big data y analytics en data centers.\nFinalmente, el tema cinco integra conceptos en proyectos de alta disponibilidad y sostenibilidad.','Recomendaciones: Mapas conceptuales, reportes, exposiciones, problemarios, portafolios, tablas comparativas, glosarios.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Administra data centers avanzados y servicios cloud, aplicando técnicas de optimización, seguridad y migración para garantizar escalabilidad, resiliencia y eficiencia en entornos híbridos.','Opera sistemas para entornos de almacenamiento y backup (Operación de Sistemas para Entornos de Gestión de Datos y Almacenamiento).\nGestiona virtualización y monitoreo básico.\nIdentifica estrategias de recuperación de desastres.','Marco referencial basado en diagnóstico de transiciones a cloud en empresas mexicanas (según IDC y NIST). Fundamentado en estándares como ISO 50001 para sostenibilidad y conceptos avanzados de cloud (AWS Well-Architected, Google Cloud).','Elaborar arquitecturas híbridas, definir componentes (Kubernetes para orquestación, SIEM para seguridad), cronograma de 8 semanas.','Implementar el sistema, integrar ML para predicciones, testing de failover, Git para versiones.','Rúbrica: 30% Diseño híbrido, 40% Funcionalidad y seguridad, 15% Analytics, 15% Sostenibilidad y reflexión.',22,1,'/uploads/cursos/cropped_1771352764250.webp','/uploads/cursos/original_1771352134948.webp','{\"x\":35.28,\"y\":-21.61,\"scale\":1.7138}');
/*!40000 ALTER TABLE `curso` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `curso_habilidades_clave`
--

DROP TABLE IF EXISTS `curso_habilidades_clave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso_habilidades_clave` (
  `id_curso` int(10) unsigned NOT NULL,
  `id_habilidad` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_curso`,`id_habilidad`),
  KEY `fk_curso_habilidades_curso` (`id_curso`),
  KEY `fk_curso_habilidades_habilidad` (`id_habilidad`),
  CONSTRAINT `fk_curso_habilidades_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_curso_habilidades_habilidad` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidades_clave` (`id_habilidad`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso_habilidades_clave`
--

LOCK TABLES `curso_habilidades_clave` WRITE;
/*!40000 ALTER TABLE `curso_habilidades_clave` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `curso_habilidades_clave` VALUES
(19,2),
(19,3),
(19,4),
(19,5);
/*!40000 ALTER TABLE `curso_habilidades_clave` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `dominiosUniversidades`
--

DROP TABLE IF EXISTS `dominiosUniversidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dominiosUniversidades` (
  `id_dominio` int(11) NOT NULL AUTO_INCREMENT,
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `dominio` varchar(255) NOT NULL,
  `estatus` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_dominio`),
  UNIQUE KEY `dominio` (`dominio`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dominiosUniversidades`
--

LOCK TABLES `dominiosUniversidades` WRITE;
/*!40000 ALTER TABLE `dominiosUniversidades` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `dominiosUniversidades` VALUES
(1,15,'upsrj.edu.mx','activo','2025-06-30 15:28:48','2025-08-26 15:04:35'),
(2,NULL,'upq.mx','activo','2025-06-30 15:28:48','2025-08-29 16:39:22'),
(3,NULL,'utcorregidora.edu.mx','activo','2025-06-30 15:28:48','2025-06-30 15:28:48'),
(4,NULL,'utsrj.edu.mx','activo','2025-06-30 15:28:48','2025-06-30 15:28:48'),
(5,17,'uteq.edu.mx','activo','2025-06-30 15:28:48','2025-12-18 16:34:42'),
(6,NULL,'soyunaq.mx','activo','2025-06-30 15:28:48','2025-08-29 16:39:38'),
(7,NULL,'unaq.mx','activo','2025-06-30 15:28:48','2025-08-29 16:39:44'),
(8,16,'queretaro.tecnm.mx','activo','2025-06-30 15:28:48','2025-08-26 15:04:35'),
(9,14,'uaq.mx','activo','2025-06-30 15:28:48','2025-08-26 15:04:35');
/*!40000 ALTER TABLE `dominiosUniversidades` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id_empresa` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `rfc` varchar(15) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `web_url` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `entregas_estudiantes`
--

DROP TABLE IF EXISTS `entregas_estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas_estudiantes`
--

LOCK TABLES `entregas_estudiantes` WRITE;
/*!40000 ALTER TABLE `entregas_estudiantes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `entregas_estudiantes` VALUES
(1,NULL,68,13,'2025-09-30 16:08:22','Entrega de actividad',35.00,NULL,'calificada','2025-10-02 16:06:43',4,0),
(2,103,NULL,13,'2025-10-15 15:10:12','Entrega de actividad',40.00,'Actividad Incompleta','calificada','2025-10-15 15:49:49',4,0),
(3,104,NULL,13,'2025-10-07 16:54:27','Entrega de actividad',45.00,'Faltaron fuentes','calificada','2025-10-08 15:12:25',4,0),
(4,105,NULL,12,'2025-10-29 03:52:53','Entrega de actividad',70.00,'Falta informacion','calificada','2025-10-29 03:53:54',4,0),
(5,106,NULL,11,'2025-10-29 03:53:06','Entrega de actividad',90.00,'El formato no es el especificado','calificada','2025-10-29 03:54:19',4,0),
(6,409,NULL,17,'2026-01-14 18:17:10','Entrega de actividad',100.00,'bien','calificada','2026-01-15 14:42:14',4,0),
(9,375,NULL,17,'2026-01-21 17:29:13','Entrega de actividad',100.00,'','calificada','2026-01-21 20:59:07',4,0),
(10,410,NULL,17,'2026-01-21 18:13:04','Entrega de actividad',0.00,'ese link no tiene que ver con la materia','calificada','2026-01-21 18:22:31',4,0),
(11,411,NULL,17,'2026-01-21 18:14:01','Entrega de actividad',50.00,'solo cumple con la mitad de lo que las instrucciones solicitaban','calificada','2026-01-21 18:22:53',4,0),
(17,414,NULL,18,'2026-01-23 18:29:22','Entrega de actividad',100.00,'','calificada','2026-01-23 18:40:04',4,0),
(18,412,NULL,18,'2026-01-23 18:46:02','Entrega de actividad',NULL,NULL,'entregada',NULL,NULL,0);
/*!40000 ALTER TABLE `entregas_estudiantes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `evaluacion`
--

DROP TABLE IF EXISTS `evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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

--
-- Dumping data for table `evaluacion`
--

LOCK TABLES `evaluacion` WRITE;
/*!40000 ALTER TABLE `evaluacion` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `evaluacion` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `facultades`
--

DROP TABLE IF EXISTS `facultades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultades`
--

LOCK TABLES `facultades` WRITE;
/*!40000 ALTER TABLE `facultades` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `facultades` VALUES
(34,14,'Informática','2025-08-14 15:39:39','2025-08-14 15:39:39'),
(35,15,'Software','2025-08-15 14:54:20','2025-08-15 14:54:20'),
(36,16,'Sistemas Computacionales','2025-08-21 16:46:30','2025-08-21 16:46:30'),
(37,14,'Ingeniería','2026-01-12 15:50:33','2026-01-12 15:50:33');
/*!40000 ALTER TABLE `facultades` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `feedback_pregunta`
--

DROP TABLE IF EXISTS `feedback_pregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_pregunta` (
  `id_pregunta` int(11) NOT NULL AUTO_INCREMENT,
  `pregunta` text NOT NULL,
  `tipo` enum('rango','texto') DEFAULT 'rango',
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_pregunta`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_pregunta`
--

LOCK TABLES `feedback_pregunta` WRITE;
/*!40000 ALTER TABLE `feedback_pregunta` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `feedback_pregunta` VALUES
(1,'¿Qué tan satisfecho está con el desempeño del practicante?','rango',1),
(2,'¿El practicante demostró conocimientos técnicos sólidos?','rango',1),
(3,'¿Consideraría contratar a este alumno permanentemente?','rango',1),
(4,'Comentarios adicionales sobre el desempeño o áreas de mejora:','texto',1);
/*!40000 ALTER TABLE `feedback_pregunta` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `feedback_respuesta`
--

DROP TABLE IF EXISTS `feedback_respuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_respuesta` (
  `id_respuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_submission` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `valor_rango` int(11) DEFAULT NULL,
  `valor_texto` text DEFAULT NULL,
  PRIMARY KEY (`id_respuesta`),
  KEY `fk_respuesta_submission` (`id_submission`),
  KEY `fk_respuesta_pregunta` (`id_pregunta`),
  CONSTRAINT `fk_respuesta_pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `feedback_pregunta` (`id_pregunta`),
  CONSTRAINT `fk_respuesta_submission` FOREIGN KEY (`id_submission`) REFERENCES `feedback_submission` (`id_submission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_respuesta`
--

LOCK TABLES `feedback_respuesta` WRITE;
/*!40000 ALTER TABLE `feedback_respuesta` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `feedback_respuesta` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `feedback_submission`
--

DROP TABLE IF EXISTS `feedback_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_submission` (
  `id_submission` int(11) NOT NULL AUTO_INCREMENT,
  `id_vinculo` int(11) NOT NULL,
  `fecha_completado` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_submission`),
  KEY `fk_submission_vinculo` (`id_vinculo`),
  CONSTRAINT `fk_submission_vinculo` FOREIGN KEY (`id_vinculo`) REFERENCES `vinculacion_empresa_alumno` (`id_vinculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_submission`
--

LOCK TABLES `feedback_submission` WRITE;
/*!40000 ALTER TABLE `feedback_submission` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `feedback_submission` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `firmas`
--

DROP TABLE IF EXISTS `firmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `firmas` (
  `id_firma` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_firma` enum('sedeq','universidad','coordinador') NOT NULL,
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `imagen_blob` longblob DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_firma`),
  KEY `idx_tipo_universidad` (`tipo_firma`,`id_universidad`),
  KEY `fk_firmas_universidad` (`id_universidad`),
  CONSTRAINT `fk_firmas_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmas`
--

LOCK TABLES `firmas` WRITE;
/*!40000 ALTER TABLE `firmas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `firmas` VALUES
(14,'universidad',15,'�PNG\r\n\Z\n\0\0\0\rIHDR\0\0�\0\0w\0\0\0>�>\0\0\0IDATx�	������c߳��!K��G*�\Z�f\'d��Ⱦd+�V�H��%$%\"Z��}7�����d�k�ޙ;����n����|�s����^6�g0��A� `p��t���A� `�9�M��A� �� `�G�.MI��A� `0x����Q�\Zf�D��=���C�i����0lch>^&�A� `��@��cT�DkEJ̞9w�(��-Sͱ��Pxd0��#[��`�@�#���Q����p`����JSW#`�C��!�\r��A ^7��xA�dj0<JD�K�#34��}�*?����b�br	F���!`���?���UtR�W��L�F��L�z�y8LJ�D��b�br	�a*#`<W�)�A � ���i0CwO����1w�\Z��kq�S\\ch�3��^\\����PH ���\'T3|���kq��{3�\rq�����(��� 	�Ќ��A� `0��G\"`M���T<\"`�6�F �/pcM�0$8�����0l�\\��4ϭ�Y�\"��q�ţ��)GBF��	���C�QZ���F��3��i`�z0\\$^���x�ޔ�F�-�x����ƾ\\A���\n\r\r�@�0�f̱3o\Zq�2k��8�R\Z)�����L�Uo\nnp�8r	�5mNևIf0��L@�eX5$*La\r��A �#`�_��\0��8��N�\0����=����1Aͼc��hN�#�j�0����14b��\r.@��C]\0b�$L��A� ��0�f�S���;�������z�Ml\ZD��!k0$8<��Lp\Z�\rq������̽������4�zz\r�<3,�p\'��t���A� !�S�Ͼgܙ�T�j���<�2�14��!\Z\'�%N`vm&�Sq-��5���U��4!`M���h��\r�f��M.��A �x_��3�A��Ќ\0s� `0-Li�K�x=���lh\Zsߵ�l�t-���A� ��0\Z41ն)�[x���fCӘ�����ӵ�j�Ą�C���K���h�x������C4&7��\n����A�yB;OԤ4<f��Pp��1@�93�f�5���A���|�c����K8�E.c������a�5Ly��A�?�m����t+lh:�u+:��A� `0.D��Jlx���K6.+̘�q���� ������������g+?64=��=���<��#�nl1�Ƽ�$��:	�Ic���1t�Ew\"������{C;�����`��W#`T��M��\"�یD\"���b���A� `x(�H$\"���*�A� �Z5��A� `H�C3QV�)�A� `0���*�14�\ni��A� `0�D��14Y���\Z1E��g0$<�:�]g�Ќ�\ZHd���>Kdn�k0��N��O�n54�o�A�>�O����0��#��14��5�3�!`.܈@�M�ܻ�Z\r�X\"`�Xh^7����I����Ͻ04��C�}�fl�ݓp6�������	��bȷ1c�y͍���4��j3��[`5D\r�&��~P�=���Y�2�{V}$dn�ghF���h\0���#�oDR6s� �0;\'�u-�׈+?��P0�ě�i����,\r�� `pf�W!i���x34��UF�-�/�M���A�IL2�@\"A���`Eo�#X��H��A� `H�C3VZ\"e�� `0���14X�v\r��A j���q�s:Cɤ�w�2���`�	��nb²y� `�#���m0�=�C!�+��#	���A ���ðz_Zsa0�Ą@�34�x�I�WY�l{f}�g֋�� psp3���4{�Y�y�p��ad�)��<���9�&C��A��Ht��a��Xq�a��\0p1�	��p1�\\��v96�A� �00�f¨�x��F�^��D��iw���M�\r1@��_1��\'׎�� `0�@F��	��<����Jb(�\'�R��`r3��@��q��#�Gb�\0%1��QS4�@F���M��gX���ӆ���`0�!`l�{�5�t�Ü&P���@+ΰm0��f�\0O�hl+O�ÃA�eC�eP\ZB�@BG��8	�\r����!��MOC��c0��F���������HW�)�A� `�lw��������b���b@\r9��A� `0b��ټ1+�y����\0$�~��g09�������\'���0��pi0$:�%i�{���^\"e�<0��id� �(0F��W��d<����@tC3:��sw `h�;ƈqu$D�=!���z3��\"`M��k����h�\'D��8�C1M�� ���iF��?���z�k�M~��A� `H�8eh�Q�!$�][���A� `0Q#���5	�� `0�@�#`\0���p���4�&�b�A� `0�G���Q���|�ʔ� S�{��A <�%�V�A��	�����\"�e���\'O&ݻwo�S�N�=ztV�|���X�X�X��2��>���81?񉀀�\\����v������Wڃ;v,�i0o��`�S<�%�%���<��P������\Z5<���;��_�>×_~�cݺuy9�޽�s>>>��U�V\'{��o�,Yr`�9&���oSWk����ด8�8�8�8�8�8���\\L\\��������U�F�Z�\'O�������O�\"]�V�ZUڸq��w���y�%1���ۓ/]����h�A�c��I�1%x��P����|\0Ns� `HX��[�ާN��v����׮]��s�=���\Z5j��Q��{���&M��<$$���(���ɛ7．;�o׮]Wb�6mڼնm���oݺ5�m����z�Ν:u�!ٓ�w:t��	>ǻ�3F�hNoo�r�f�j��/t�R���J�*M�^���P����ot�ڵk�>���ڵk�]���hp �ZP����c�̕Lx-chzN]N�xF\0�-I�޽�$I��i�n��v��y�5k�b�&��q����3e���	��3���ŋep��}���M:t��\\��������u3f�؈���fΜ���ot��/I�nʔ)J�rڴiK9��8��1Z޺u�ǢE�:c��\Z7nܘ�#G�J�*�F�!�����5<��N�<y*��\r\Z�*��2d����Y�����թ�JtY���Ü\Z��\n*��ϟ�ى\'N���\0#o�\Z�`����f���=��ț���ѥK��z��q�~����DM��~���kO�>}�p>y���x�~:��rb�nL�O�o~��믿�ލ���A�(�����j0�3U�V�P�H�����Ӿ���u?���x���x37c`�����tu���~jpp�<�����KW�Ķ�d�#�Q�F��֭{��O>ٱe˖������w�5�H��x_�>|���%K�+Vluٲe�<��3/�,Y2-iL0q��14�j��A� �`��1�\\!mڴ�7m�����Μ1c��iҤy}�������;/�x�~�ƍ\'K�(q4��v\\ŊC\n,xC�w���w�8k֬�ɓ\'�G�Z9r�;vT���>�l�&M��ԩS�B��QF��[H���ayXE�FVi��A���Lʔx�aÆ��r��\'.\\x��T�\"E�Ĩ�s�������iӦן|��[�n���H��h�;�8�E�A�Ν�J�^�zu^�҅�!�gPPP��/�>�|?�(\n6)9�`0܂�14#�56�>r�A Q\"�	��K��d*��z��=�������ҥK��T�R�~�a=���7t!��\0\0\0IDAT�={����0�_�/|R���6�i吏z�B�v�r�Eb�C|�H�z���\'&o��G\"`M��ÔA �#��ۤI�2bP��o`hh�;aaaO�ϟ��nݺun߾}k��?\\�j�?	e�K o�ڵkO3}>�G��S�1:S���OC>���1P�W��!C|8OPA�KP\'&f� 1��e5�����\r��A� �j�M���m�����v3���f��1�����a�^�~��G�y~	[N�>=m���}�z{{?(��,Y2C��f#x@0������C����ϼmp\Z3��4T1N�.]��~�ag�[͙2���.��U�V8D�k{�޽{_]�b��.]�t�����QOp|�oǎ�Wꏈ��b<chzJM>y0~\\k!<�9_�g�y&S�B�F�;wn-�˒�]�چ��W_}���gʗ^z�����3�N�:�BBB�߾}���u�n��3 q\"cJmx�ܹsH�6�H///�N���B??��%K�lo,d&�c�3_x��uH��f짍u������A ��\0�y���:th��\'O���nݺ�CKz��u\Z�>޾���)r��O?݁�ޱZ�jE�l.���y�}4Uy�ܹ��Lp�jv���￟�رc�ϟ?��!����5n��ׯ_������k\\?�={�7n�F��Bb�b��i�B�I��0$^�c\0U������� 4�z���1c�ȃkE��:�{�=|ݺu��/>��s<g~��6m�4��`�L������)�;�5kV��;v\r\rm���d�����ɴ�N����n�ZV�d�7����=��.z����ZCS?�h��b��i1A-�w2��\n~�͛7o����A��=��p�����W��v��ҢE��\n\Z�t���	�&��n�l\'�&���}�Q�֭[w�{���������V�CC�lܳ18Ei\'��+W�{��cV���ZC�5��T�A�u8�\\\\�a�L��\0��ݒ�֨Q�\'10c\\��gaY���;O�2峘Qt�[���ݝ�}�],�L��;v�C��;wn�=�ܯ_�q���{��]�\Z��}���E �Pz���eR��6z�22�!�.���۶m�+G� �ZC�Qs0x�P.S��]\Z7n�eѢE����_����U�VS�͛��=�n��~����\\bh�={��lٲ��b��W�ɓ\'W����;��2d�v�ڵ����I0(5Kqo�C��Y�x�yׯ_߬\rG0��	s4<\Z<�K�,����S��͛;av�̙3op4!�(S��́.J�:���ɔaW�֞�v�&9R�HQ��ٳ�Tf�\'S^L��4/�_����r�}szch����\0�-��ܓK��x��#Q��Q�jժ��g�&�1-Z��1c���I�6�>�$I��4i�H�,����17&;��{�[�.]��W�\\��\'�$��d^j��6����FPPЧ�ċi�}NM�chދ�97x((�D���ի�~���S�b��R��r��>;�U�(�������dɒ����ҥK�BBBzQ�@�	����ݺu{�ܹs��B\\����2��t�ɿ	���.�kt4��{�9�ٌ�i�� `�Xڴi�r����Q�/3e��iӦy,�	�1p�ǆ�\'N����ď04_���p�+�\\ǆ���9rd:��e~�����k�{��۷C�����W�9�k��X�\0Y0�fdȘ��@< ��Y�_�>�̙3ks�.�}_�:u3e+��-\\�\0�������x4���t�òf�Zg���]���ܹ�C$� 0dȐ|�������ל����-/���8��K\\o�Ȝ|��L��¸gBC3\np�#��A ��2eJހ���p�m�fͺ1}~�E�$Mp1�Ν{t``�����k����;}��G�\\��!gp+�pV��	��1$���T��l�nݒ�9#�^�U�\"&#S �\"\ZC3��W\r� p�����k��\n\n���l��ٳ�cd\Zo�{�v	�#G�e�|8�t�ȑ#����b.!l���ٳga\\VÐL�7�&�v侂����d\Z#0�\r��t)��~�ک��0W.E�V�ZO�������V�^��/	iեX$$b/^���</Y��-[��pn�A��@f�)R��}�������;8N���0�\'��i���Ɠ	\n���`��� `��{�0��D gΜ~���E(�?ڶm�bٲeZe3�\0u�o	+t��K�.���̙3*V�8bѢE�E���6�;�)�*ov��5��X�W/w���<O�O0+]d���a�g�ñIk0<��˗/��9/$$$(eʔ�������&��ɐ������}G缎��5k�n����97� �Q̝;7`ذaobDN+�����Q?kc\n��>��L�� ��)�ӣʐ�1�fB�%ãA � p�ȑ(��d�[o��-v�v8&bG%���r�3�Q�@�ML7nѲeKk��X�4�\Z\\����������>��ߺu��{�L��ฉ��12�97!$bC�tB1��A�mԫWOބ�(�C�R��{�.{�m��G^��=:�Q��:��;�Ss��᯿��M��a��p��#�����9�*����~:���_��p½�5k־B�\nMc��<�֌3|nq�Zҵk��\'NlF�J���alrj�q~o�g�����i�L��M�8CS�9���;!�s6)\r�H�4�Ӵ�g�\'O>�ҥK�L�qw����Κ5k\':�<�O�>S1(�bPvǸl��\n�81/��&���Al��w���;��tޟI�w�|�͚M�6M�q%�C%J��9s��04+��ٳhȘW.G 00�F�T��[�uO�00m��@�ś9��%��i�fM&@�&x��I�065j�5$@�����/�%K�,�ʕ+�{x�K�*U�齹s�.��1��RHH�����&t���^{���M���Z�jؖ-[F�X�b����G�^�z8��;v��9s��tl�����СC�̙�ނ�c�5\0�?�B9n��z�9B�=�M�6q��D�\"���q��x�lU��Դ?�Ǵ�vm��!��Qb0��#���q�fl���O��R���D]�V�Z���ￋ]�v�\'���F�\rHS۾L�U߽{�����𙝨��\\ƌ_?v����u�/��\\�r�*W�|�|��\'^~���eʔ��Z�j�0�~������}Æ\r(o�[�n�����0Ȋ�ٳgj�$I@�:�h���x5���Ͽ��͛%���[#\"&U��bDi�=�@L�-y}��G����}�6cB�Y����9����F�b\Z#0\\���\ncL�������o�47�F@k��ݸV���U��m��B�\n�dhFڀ�Ӿ��z�� z#pa�ܹ�O�6��xAަ�:��|>[�l7��I9[ŊC��H�\'���y������� �,xKW>|54k1՗�{.V\Z���\'���2ݷo߈_|�9G����o�t�{{{��b<M��Mb�ҥK�s�MLǄZϞ\\G�d�1�\r��������\rG�.r�	���!�!\"U<7�!0��C���F�]�����>}z.:֊�Δ,��/�T����\nqj@@�se˖���W^)��ۈ#G��={���D�&P��_���ѣG�a�V��z�>T�ڵk���&M�\'��kr�;*�V���I|��7��Q�FR����Z��q�o�4///m�=ý�@)���v��q8����$�ύ9�-͛7O5o޼���8�}��cX��;7h_s�ߝg{9���`�+0��+�4����ĝ�}�h����>�_�*Z��]��^�5�X�p��;v�,�).X[�nݭ�;w~��/���#d;���#G����:�:u��A&����\\�vm�M�6\rN�4�tʦ�cl^����R�J�����_��̡����T�<WC0�����?��쵁�mj�?���J�����0��pu0���5��Àg ���ҮW���G�?���\0\0\0IDAT����\Z��)S.y�@��%K�\r��U:�M{�*�U�~}�>�8W�\\�8|�_�oݺ��ֆF�g=nժ�\r:���9�u(���4�;��������5jԀ/��r+rp�m�G+�n���ch3v����Z�Ԁ����AM(2�}2�U�Zu/錑�ƺ1���5�.��\'ug_�lY2o������1��3�ʐ�^��*hҤI~��A�{\r\Z4��_lc��}��,�c\Z��w�M�9s�V�{��	/���Ӝ\'�0|������3`0?��O14;�X�b�СCg���CK\'���؄G�x)\n���}��X�rb\0�S��\Zj�G��ޒ\r6\\��qi�;�Bw]C3�\"o�k�,��zY��k��.<<��O���O�W�{�.�z��itB����7㫯���i�3p��O��i�.=z�[�k5�m��k�ر���C�Jnݺu:zy��È?���ߟ2u�,_}���ǃ�^LxDx�7R0��J{�D{N�$I�6�����1[k2op4��C��\0\':�ቮ��)�}T�x�Do���Ç�9&9y�d҃�={6yΜ9��M����3�d�ټ��\n\n��\r$R|mZ��e˖i.]��Z��ŋ�/\\������)D�����D�ĉI����XK�.�6D�x�`�<yrS�*��3��^�����\0?%��B�ֿ���׏k�w>ZJ���y<���.o������\'��s�F<,�[h����p��L�\'[�`�6�h/�>>>��7o�!{2,g\"{��<�	O��xB��tq�yLKsq�9�@T�ر#	F^fb����G�WA�7��h[�H���������>��ܬY�.�X\\����ISξ}�vY��C_�\Z��v���޾>k������:cƌ���gʔ�t��-���2dX�+W�����x≙y��_�`��%K�lݰa�Z��܄	\n�ٳ\'7��q��3\Z���/��Hh�#��1A���e8j@��rU³��������Oӱ�!n�c/����\r���Qj�\\�{]���pjBBF�6/ٌ�\"ԫW/�\rz�^FެA\'��0�#�ם�G� �C�B�0�f�p��-�hi�rg\\�\0��o���YK�.-c�V�2e:`�M��\\��nF�/A����#�2���+AAA\'˖-��)�x6��͠�~��?���N�t��2��m�j�W�׫S�V}�믿޸v�ڭ�o���k��^V�f��?�Q�ƞ\\�r��8#f���N>��1j6���c#<-,_�� �Ӻ+W�|~���9\"�\0j|�7��7P�4#���P1�N�Ω�S��޲eK\0�z�ꕃi��0�<�q\\�a\\��d�n24��&�l��L<2� s�L�7fp�\n�2�(a\0��q6�#>8��D���h��� ;��;w��T@@@�e˖��S�Ψ�;w����/���K��%?����͛��ٳg��}��9rd�>}�4���y��ѧN�Z���������/��Q�m��[�n=�?/^|�O>9�G�آE�~!�_�d�w���\Z�s�#��ւ���nһw�v�]�H�\'�q�v�ߜW=s���Z�jͬW�ޘf͚un׮]�4i�d#��E�+����S�x��)�ה�Y���)�v��5͔)S�S��0��!7��mQ[ȨϹ�@�����	��S\'���\Z5j$]�`�����e�Ƞ�e^Ds�1�hB#�F�Y�����7�X��;�jݺu�ǲf���3僙3������$)���#s9Fe/����ƍ{ofO���o�ܹs?=z���Ç���yqȐ!��œ�Q�V(^���M�N��������K6�5���r(��ޓ\'O���{�u�{��L?y��9s洿v���)R���o6�Z����ڱ�Q�(F�a<ߥ���9�0s���`�^M��Bf*M�8q,2ђ�^�����u�(�9�nb �M��㔛>D-��9\0��^����`����v�A��������9�D��R���� `�T*U�T�f�/�`��M�>m�9���?6��������&�����^�Z��ժ\r�S9���.,뭷~�(��img�ջ`px���k�Z��5Dc<�v���\"��.]�|I�3�8>00p��o\r����5x�m6m�4-<<|�p�mE�\\�Q��\"��0�-�0����i�;nذA�����ʕ+�͚5k,h��4�^��\"�pT�gE��<�g�����j Ã		�^�z=A����}{![�0{0�Y����d��	q���i\\�i�3<<{ir��]?0E��7o�<�f��<E�I�-����������_�^�O;0��\\���U��aj����X�\Z����SZ2t����VE�ݸq�{x޺f͚	ko��umk��W�Y�w�If�Hc��q��3��6�;�m��M�6�ǏoE\'_��eg�ۈ׈2,Q<s�v�4245}�&\Zb�@�ܹS<xp$�ZF&m׆l1n��<���m��qjB| `��@��i�g4մv�������mkt���ǎ�z���biҧ�2s��^�|%���#Q�?cL^�X����a�-,܎��^�ܠ�L2��ݼys�ѫٳg������NK_��cZ>m����#�=&�hi۶��t���yz�8����ݩS��L�ň���9s�B�%/�S+�\\Q��<\'9�&M�X���	�@ּ\n.����׏+�`�\\�F�\rA�l��>��vF��V<�8�p�\\�;�{�9��`(�S\Z̮5�-Z�r��jժ5\' i�O��}\Z��^�R�J��n�p�̹&����\n!C���S�a��޾I|�^�}9AC�ڑ#G>��JtbBBB&q,��9c�������׈i�|��4��-���n��H��s�������Wb���3|}}ۂ���%K�Ϧ��#���Yҳ��`2F���e��#P�Z�<������22or��6�.è�d�$��m|g�i\n3��0�\'@�2�<�\\��?Z\r�����ӧ��`Z�$I��x�gΘiL��m����޹r��\Z`:J%�;X�&�\r	\r���-p\\E�9�1�;дΝ;�A�ՏN��ոF�\ZMϜ9s��K��>�P��=�KnO2��N����_�a̘1oܸQl�W�Zu�����q\"#��+W����k�h:�I����\r6�������iC��\"�V�O�z��޳g���㐝	� gJ�fL\Z�@L�,����!︙oi�7D)OD)���(�\0���رc��M��)L.�<�ۃ�!�^�&l����P<t��\'N�xs׮]�G�1�H��g8}���ݻ7�Y�f�{aU�.]��x�\'�ɦ�����mwG�y��iCvmn��|��j�J_�;]��ʕ�(!\Z���k����z������۷�I{0C��sOۚ�[�lY\\���g0�f�(�����@Æ\rb\\N�2�l�p#<O�Q���J��a���8��`$t7�j��W�6m�x�67���?�7xz�t�ڂ��.]zqժU��~���7��qe����W�~�мy�^e�����?.�6����:s���C��׮]{(��>��_ޢ���e�@��z���,��\\�rZ�]kdg ���\']���p���Ɠ	����I�ax1�\0<oS�N���O?]�2�q�����q�ܵkסK14&���$��:��������>�)���y�jծ�9sF�{W�^/������O>�/_>k�h��K��\r��mgϞu���6m��׮]��뛞\\�bŏ1� ��ӼR>���LH��.]:����2+3y���������~�j9Gg�V#�	q��14�m��A ��X��}00_b:|�>x	���|iƌs����bb𮻂� //��1Z\nt��!��2r1�k�Ǿٳg	�����#r���P�XBÙ:�����h߸q��:z�����h�E ���0���iJ�������E\Z�\nY��XعsgdF����G�ɰ&�W�FN\0�ӂ14=�F\\Ǐ��!UG�a�|��Lg��w��Oj�9AAAM���i۶m�y<A�N�FX�q��\0\0\0IDATX�x4s2�^��ￏ���XW�Ѳe˫`<�G@��_���p��O�>��6�F��\"I ��y~�л��G����e��mS%I��)S�>��<�##��l`��ehj\n]�L4<�@�z���BV���kE�=�S���q\n\'3�A��4��C�#��0a�k֬�T�D��u�֝�tf�\'�|re֬Yk��{@љ/�I�A{��x����u��+71ȼK�.Kj׮�	#�����gr�����loH<��c\0�!��I�&u��ټy���A[���g0�&�8�!C��|���D/���`����{�.]�}���J��ttDG�O�� ��K�N��U�12�S�14=�f_�hhذa�Z�ju=��pF�7R�H12]�t���ƫ�B��2��1�����`��IPz	�CV�X��cǎ](��C�u�ܹs�;�n�7d˖-�͛7�b�}O�1�0F�e�V�2.X���������Ք%���M��\")�K�.�9f\\��<\r�ɓ\'?�o߾A���Ȋ�����-x�߇ߓDcd�\'����`B���R���\Z0\"Bř{&M��*U��ݻw���10\'���ʕ+�ۺu�:m	���v�,�����5k~�w�^��Ǐ�3o`l���cƌ�g�C�˛7o�}��٢�M��m۶=�b\Z{���N�M�6�s�έ�q����,i��K��*��;�\"\'1:5(�Թ��!�v.�I���޾}{u�|ȶ�&�\"7�qK<@��W�wM�#��E�����\0�8�`�ͣ�@�\n�+�F��\'N�(K��8v�؉Ç�F��Uh���ZQ�<5����o��{�����-Z����0�|�Nq��/dGPW�r�6=�;w���8S�g1��q�wNcfΜ�8Fl;:{m?�[�n[�\Z���ɓg��L��=����\\���ѹ\\c���J6bG�s�v;\'������B9�I}��bQ�L�tܦ\0#*xBT���3�K�.���o�<xp\0ӍۙNjƽ�m۶�\'�޶��X�>e�p����/�\\�]���bN�gϞZ��m��	�`�/I�����������kw��#Gr0���ƍ���	�x��P�tim�?ofF��At��\Z5�b�)�l�/_�ߏ!���Ӈ24]�\\�0}���ɓ\'��?���|4�Ȉ7�\"pO�;x4wr���\08���ܛ��np!(���\\P�y�&��7���C�~4q�D}��[�������H�r�H�3I��Kc�.lԨ����rI_�b������k�.\\8�K��=Ճ:��d�.Fg�\\�re��-pv�B2��\rd��]8�>/^<��~;y{:  �+��)Toc��>x�`홚���j�\'�G��������fvC���\r�N�k9b>�0ݠ��z2�b���nC��n��v\'��CP�l������(ٖ�2eZӰa��x1�l�W��<��I���X��S�S�͛7�3��ʹ�)�R�8��qΜ97ұ��}�g����u��y����.ů1�~�X�1c�.�T�h���q\0c�~�1*^�7o�j�޽���Hw2((H�2UEn�.���3)rzp9��Ohg7��s	˱+�y�)0*�ҥK�Owk�LodĆ.�lh\0:O�{��sI�B˄8B��Q�Qv�7\Z�:���)�C#0d���U�>�{��!���L�J�6mשS������J�Ja���xò-����m@n`�~��ohZ�ע�����ҹh+���ꫯ��/�D�V4��)���O�&��̜�&�������V�p�֭��N�o��kS���#G�/S���^��t�`�7.=<g����4c���u��SOG`�ҥ�9r�x���Q@ʈ_dD�?�c�bdꗸ���VV1���\Z;�����B\0��2E�*��F��}��\"_��0�,@���CL_�����g�_�)�1(��%1l|�6�͆W@Gy�T�XQFdb\Z������D�Γ9Y��V�Z%�\Z�	.X��M�6�:tțo�yЅ%����A����M�h�n�<@˫s�Υ���VȐ<�ˠ6�x�h���+B\Z�3\rF�.��#���:th����{$�+@�\r�m�5��\ZO�?vٲ�< Ϯl.�/�	�ÊoL����P�B�]�v��x|�G�55*��S���br��P�%1l6O=����7��s�����M���r(����~���)�1��f�+Q�D��-[�mܸq��M�m֬YA�ss�.9�y��9sf�����3],c�\"�$�#�	6��^���v�C�C�*U��ܹ�2S����IS�2�cN4�7SP���\Z=�� �s�p�9���s=y����\0�-�\\y������kߒ��#�B�Ԅ�H ���|�M���xꩧ2��w�q�FVF��˳tﴑ/�˒�T�~���5�j��К&���x�J{8i�cm�@#VAvժU�1�����jժ5)[�lOꑥJ��Y�|�%ӧO���f��r�2�\'�g���?m��3>���Q˗/������_�x���ͭ�ZY�\\�YН���7���=�\\�pr}*�y~�S�%������g��5b�t�,��_�����2��S�@ԥ��)R�,��_]�tq��V]�å�w=�	���?��ĉo�s��y���� �ׇ�i�L���Ԅ���14j�Ő�cǎ�O���\'�x�i�,Y�rl�c�ܹk@Ҍ�!>C��œ���o=P���V6E���ׯ���Q�(z�Q���<�l��NI\Z��Ҧ�rtu�.u#N�p3^<*^\n�C��\"o�3gμjӦMGN�>��ѣG�s>~ǎ����W�x��ۄ�1OW;����\r���AՑr��<?4�]�~�e���ͺ\\�I[;y��m8��?�����o��s۶m��\'��n��S�T��H�.]�2<1c�_h١�ЂxNFݎ��.)�~U)V�: ��?��ZՐ�$���W]��YȌ��\"�̟�&M�]�ƄĈ\0�6����{Ҷ���#�\Z$K���d{���QO�p��\'L�m���Њs�Lѱ\'���������������?���2eJM�ƪ��P([���>:`d6A�jD�:���d����cdZ�4�J��mn�BQoㆶ>��:ݲe�ϻﾛ�|�[Kʳ�W�\\�Y+�at*gΜ[��al��[�.]z�֭[���~H��׮];���\r�M<���^�a�z�y�\r��`l�K�S�cūW��»k._�<����os��7o�RŊk�/_��ɒ%��|���X��h۶�t�U]�~}6p�44d��������=�3�x��y��@�����.�An.Cw3�,1ִ�q77���+FE{��yO�K���Ȝx<�@ڭ�.��J���e�}k�|���@k�Ch�q���ӳCF\"jCӳa��{X����+Z�h�2eʴ�A�	\r\r����h�۸�O�o�3!�\0��իW���[�ԩ�������U�9P��blh\r&I���)�`F�8�h�\\��\"�n��#G�f:�q<�%�T�R�p<��2�C�\n�\Z8�)��UW}F�g�~�oٲeZ�sv�=_��лD���+sS{Sjɀt�p���ȟ���8x��0��_`ھ�/�0.G�;��ix����/������ի�|��珑֩�����O|=I���%�A� a��C;x��p��d�w�S��U�$�P�s�S�J�4!�!@���/R��ț?�ǩM����|;ڐ]��\r�N<��O<���YJI{6��;���E�,Y2-�h��F`��C0�K�r�⫯��j��հ�4!>hݺu�#G��D	�y�{��pT�:�ؒ�QE�����/��Uε��;��#b$ԓ���,U�T\n˪}�{�����A���S.�c�um߾}�N�:�����fӆ���2,:Tn�A�p���Ջ�^���!��-qiyG���aݺu�6lذ�rؔ)S\Z�jժe�.]z3M���3g�׬Qcb�Z���Hn0u�ԴR��;2��Q�!t��������.��,�Q\n�n\Z�8q�C(��M��a���:tx��j##?�ڵ�w�MH��ʕ�<�!=%���3B\0\0\0IDAT�A�̰���@�K�i�<V�-�q�q�}9C�>8��\n*�۽{w+\Zp[:�wJ�����s��S�	��?��SC�uZ�8n̘1��i2ET^��\rBI\"�$�Z_\'��`�z��m6�SnSj�8��UC���Ļ�/���-7n\\�O>�D���/��b����+�]l�%	�G܅��+iҤ�1��s>,��\\�s�Je��\\���#F�X�t��ˁ_�<x5���[=6l�bQ��y\\��y��zo��Ե��|��Wݺu{��M;�Cu��SH�3H���0y�d��E��D-���u\\Ȟ!uw}ƌK1�1�.�,�����|*�-oz�>l��	�@\"04=�8bI�̭[��Ɠ��M&\Z���U�`x~	20]ީ@�\'hӦ��1�!y:��TPd�Vu�Q��t�Iߘؖ(�i��X���MG��f��1C��c�)�`���fϞ݅)���w��c����M��Gi��q��x�O�����g*\\kC�m�$�:�~����]�t�ԦM�v�l(W�E�ͥ�h�b�����e�O������\\_��c�X�<d�<�U(���S�!��=Da���a����)O.�Y����5� ��ʿ�Y����;w�?���n����N�zr�d�<��s$1�QB ��t�NuB	��,�f߾}���A�Dgb�q3�jk�q&�B4!x�ǒ��k���	�g���P�H�\n�y�5������-�ǋi�FT���<Q\nx>u��#��ڄG�2��?:�ֽz�jt���OZ�l�+�1u��ý�NHe��� I�$ݐ���W�ڵk��|�ɆtZZ��6��u��~��o���`���л�@l\\���{����1�-$�TyQ�5�v��l<u���3��Ә�B�\n��5kVG趆~\n�6��:ޤEPU\n_N]\Z���w]������k\r�-�K�b��@�lYs���_����28�q.��Rt�$����ك�	�@�34Q���0ko��Ǐ��ԜS��l#���u��,�Ԅ�B���ɓ\'��9sf�WL1ظq�h��;�+��<��:w�L�`���K��cǖ_�x�X����B��Ż���gS�?c��8�Q�[*�U�5�6�%1̰u�Lǘ�\'���=	��s}����e�s�=�Z�T�ZC��ĉ�שS����_�G���2��rU̷�k	�o�4i^�y����pV�I��cǎ4D�?���ǋc8G��сm�2��_|���k�N��~��h$���G��ӧ�>���6�!� ���\nG-ߒ^���K�q0�QD ��	��f[�L��μ��Uo�Nm��L��O���8�U�%������/�1��k�ލ�C1ũ|2�����^~�C��+�,/R ��\"�q��m۶���a�P*>�;ΦM������\\����}�<y\Zpl{���{��	Ɛ�Q�,=W�S����˗/_�({�H�\"�p\\_�ք�9x��͝;��֐:xP]:����#g�֭[����� m4��ԩSG�}��r�<&Y�pa���<�S��r�s��Y-�P�6{�ǘ���W�2e*B�#�`}T&�o�	�u4����.ԫW/�ƍ����̗/��는8�ڥ���P��w��)?�A��={v�.]�4G�[R���/���!c�A2�v̩	�*�P��*V_�\n*dŭӘ�WӰS�!�C�2��D{㹥3�\r0ժU�]�T�7���}�Wڽ�ꫭkԨ�*s�e˖��ؐw�]}�ۮ]�Z/��R[xh�7o޶���Z��u��X��;�ȉ�Y�:����IN�ꮄ�\0�7.�����$���n���o���%�qW�1�{�0�Kws�޽�4hP����\Z���2�v���\'c`�˕+�,(ިQ��d$�S��#r뾠�!�XFۙG�0v���}���	zv_⇼���\"ë*X�j޼�(:�Z�^�a��CS?���{1��~^nI>�LUڐ=.ms��^P��#���78ժU��PŹ��_[2q�`�&�x�D�-�+֎vh�W�^��ox��CT��R�lٲ2���(-mIrv�����=]s0�QF���H�V�^=+mC����	�#�龍AAAo�������=j䈧(-�6�~�jx>��Ek\\�@���ʕ��>}�81l�d���曍/\\�0�����Ip�\r���(A�n��Lhw�>B>y\'�$�H�X<�o���c���wc����#���1݉a�w���3gN��n�С]S�L����>y�dϦM�Nd�\"�jm���\0���� ���i���0�z�A�	c���o��Έ��N�߰aÊ�nݺ���π�_�ݶ]�1���[�=uƌ�שS�-���.?AO�X��؅�ٳ���Ce�m��u��ik��P�|�$/hYA3_~���Lͷ�Ʒ-Z����Q>\\>��W1b�$<��x�=��H���&m֬�~x�K��\"sCi?��o�4��7����ʃқ�� `M�x}��̴nݺv4�׮]{�ʕ+Ei��)��+��Q#�x72��n�x�?~\r<8��k\n:}=��;w�w80o۶m�+V��iC�wk�ׯ_u<b=��1@m�v�o�թ˗/�O���Ǯ	x�j��Kt��}��\Z�1��\ZoS[x\ZF����j���$/T�������C�e{��*XJ]���o���.�k���̙3�Ǜ�V�&M*a���ҋ��<�+ʗ/��w_�2e��>G�^I��:�oש]Q�9/��Ю�����Æ�3��Yb��4��n�1pH�	�/q�ĉyK�,�:LM#�GJ<0�� �}x��̏rk+#��Q\0�@�3�_|Q�|Oɫ<gΜ�n�ţCǎ�w�\\��\0�g�^�qޛ�ϊΝ;k}*�MH(�M�6�֑��d�&�EϏ��r�a��X�jb)k��t�Z�8w��F	mh�1����dg�O��{(m}��z��Igl�3TO��x��\n��\r����۠븊9r�(��t�g{#K?�v��������Ҧ�.e�5�ҍ�/}5p)��Fn*Q-(�5��.VVa\\y��Ġ\\w_iժՅ�Ço�s=s�����ԣ�(���y�ю|��`��>`J{�ȑ#�`�΁@��9s���\Z1[��W�:Ѿ^�\\�rE�ݯ=���_��r���+|�v��ʗ[=w�U3?����y�~��}/^�T.44䢟�ߜ[�A�Zu��뵚5?|g�;{�ׯ�6��v�����D\r�i}����Y�1�ѯGi]��\"�uM@v��f�ǘ�\'k�W_}u\0�\"���?|�Ar�h�r0r�\Z����r�x\\��Rqyzfl��?�]璼q��y�7����5����14pe��K�믿�N�\"�c� ^�x�4��8���ҥSG��dF�����gϔ)S����O��~\n�#�x	����|<Jq6���O�����02˃�7�hڲ&�ѫV�Һ5n�.�i���z��6+����쁁�0�&cx���ja�-��G�#�������ڵk����O=z�u^#�\"8����ѽy�Z�16�:u���իb|��!t�{ɂ����ܹs��͛;�?x���_om�;K�[�&��#�O&���������\0��\Z�a��y�ϦSޛ2�b�2kʔ��D�^�c�K��A���9s�>u����E��p�w��\\�C:\'\r9R;��͛W�}1f�w����C�EZVd�<�	\r���k�Ţ^�z���3x[7���cT�s�>���o^����N�<9�v�}����F].a�Onp�{� �H�!`�Ȑ���xZ0�����q�)F�]�4��qh#��ϝ;w�\"��F��	�t��HF���/��|�=�_���I�Q[�<������u��k܋8����Ç�СV@	χ��x��T�R=��N�����W���2����`��O>y�\'�д�`����`�o߾���;شà|�֭[�iS50���φ}��N���/\\�r���A�o�t�歺�O�ny�����O��O���D�l�.�m���&���`�y�D;�y�I�z�ͩ�\"mn*����`a��%�|(g��Ǐ/�p?�%K��\'�Ć\0\0\0IDATN�`�������|	ǂ!�~��^{��1c���J����p#F�(���xE��(/0xC��Crx�IbBbB��	��˖-�e��/�N�)v����Xd�ٵ�?�32�ɗ��:�t0At&[8��%�a\\\Z]>x\\^@�uE	�[�i�!�_^�M�;@���O�ey�+Ќ34\r�#$�2���_������}zޅڒ�k��5��+W��`S�=\n3�5;��胷���lڴ�X�ʄ �x���*����5�X�bϜ8q�/��b�e����u��\'O�\\������\0�!}I8O���Ԅ����ѣ��C��S���-��4;�	��rC��4�s��Cӳ�\'\"�2�ٳ�!��X��~�s}��!\r�$\\�\Z�Gu��?�|z:��t*Z��Q�\'t�C�]�n#~9u������\nF� rKk�}8�It��G5j�HB\'��:�r?A��%hj�y۷o߁z(�\"s$m��Q���	�&�o�\r=��w���ݻ77��G�Pd�	��n���s�o���~�F�>��	<��V�2vAkA.�ԯ��ږ|v�o?��U���͙3��<K\Z\r2�s\\F4F& $�0|��,�{�n�o�9��6q2�x�g:��L�0<JIz6��Nr:��t&�P֟�+J���co�C���A����KJ(�7�|Ӛ�8:}�=e4��?R�r\Z7aРA�0�G2}��q\rx�}����ncb�ƍ��/7���]%�8��U�V�%�>>>��.W�>\n>#S�,�II�h}�¹pV�4V�.\r0\\��&�\n����B7�C#���M���ƠB�l-2(�ǻ��X�ۧO��+W�l���?O�q�F��\0�jL��lٲ%�4#�{;�U�OcdJB#G�L=`��1���x0s���6�ù>Ct��AǄ���sܲ.�@�����,eʔ\rP���D�c,էӨ@�>x�SH�4U�\n���V�^]%�\0œsq6��C�8U@*T8�|;��E���s���[;9�K>�+����˃��|��E���x>jP�ϸ��U5�ũg�����v��ϼ�����5kֱnݺ�8��N�:תUk	^�e��E�d!G�M��T�R�\Z4h����N�ڨQ�a��H�W�6mZ�c�;֒qji(G��ճ�`��T�}/0��@/��߿�����C?Te �v�%*W\\�_}�-o�jn�e�BO�\Z5�&��`��3C{Q�q�0��1B�w��/�:u\Z�+W.ɡ;�2!!!����|Yj��!2`������22�s��3ńT�����U�3n��i\"��#n�In�_Ÿ�D�v000�1ȋ����G%4�87`�!���_~y���I����sw�x)N%�������0�*��z�R�7�W�Ň\"��	[�n�A}�����2e����J� ?��~3�)>�Z�(؉L�29�/�\Z���;wn�k�i�ڵ��-[�����~��g]�,Y҂cCb=�U��B�W�_&�׾���:�/��bŊ7��Z�hQ��?�|��>���>���*�`k����/Q�Dל9sVH�:u\n��&\\�lˬ�{��΃,]��C��5��o��/__��	xȸ��frO���ɓ\'�^�a`�*=���ۻz��?�~MԠM�qz��(�iӦ��^����˝G���\0�g�\\�\n��+�df�\rr�E�ڐrw��(��o .Yp��A΄��@����T�*ѣ���|��߿n�T��҈�\\��<�|\Zu��45!���d=�4(�dɒijq*];�\r�c��(Z|*r���1���5k�;y�d/0��aˠ��wrv+ZJ>�v�Y�j��3g.r��<�7�0p�]�v�؞t��u᡼����/���ӧϔ&M��f��Y����t\\?�ڵ��}���;}�tv��ĕ�cj�L�zd̘�y�)^ʐ!�3�XA�ss�F;ɘ\"E���KϳLx���f��)� �y�@�\0Y�\r��������EzC������{�������Ƥ{����3C���𕁣��?A�E9�]�|y���oqxRP�o�\\ب�?(C۫W�^a�%�S�ô%��	�l0�/\0� T��y��K[��ީ���ld�-�j�#�������_`\0��~���d-9;L@���kK����MH�H$�r\'�2{Ӑˣ��k-].\\��8�JK��p�u���\nנ��I�S��ѽ��t��F�h\n/��7n\\:��a@4G����z���P|(ryP�ȟF��m۶���|��RH����M\0����d:�L���s�Ήy\Zↁ���4��/���ϫx-�^�x�:�e��Wx+_�X��y��i���Ok\rm)��ގ4��I����/x�k���W�^����y���Y���;ϳt�ҥK���� G��o�@W�\r坶!!!u9�X�l�gJ�(Q5���0TC�\Z��K\\�A���8��T!f�>��)�:�~��{������<���Uu�/t��d^�>�Q���ƛ�W�/���[��ެm`����d��tr�F#����%��At�b�5��0��������fѦ�S��ȗ��\\k7\r-��zw��x̺C:R\"~`͈q��(��tpc0VщT�P����ͭ0є�C��8~�pb.��O^����KƼ{��Q�ʀ�r�Ѻ!�\ruȽ�a��8�(r*�;����$�9�Y��cגr??��!b|)-��_�J�z7n�>��Kx��)�1͚5k���/W����ٳg��Y	~EXwkۺuk����߽{�g?��c�J�*�R�n�N�H\'�m�^��18瀫v{�#}�/�nȐ!�t��\0ц����is���&~�Y��Q�z�0�*T��jΜ9U�����蟋�}�����v���Zb��cvn�NfZ��;����KΟ?������d�N�5�!!!ڿ�cH�Д\'��H�A�LLd8:�DVl�/n JY����Է0ͧN�-:�34j5fm�-�����TG���q��:����Wǰ{�y3��G�֚@�#F]����M���;}�:�܊X(�)��D5mCee�({�nC]|�Qʨ�\"k+p��3&S����!񪾃ԙ��%~�:u꾽{�n߸q�Q����f�ʕqʟ�d�֮]{\Z�g\\�h�v���\\�Ë�;�����j��o4��O3����QP|�QL����7=�Քv�LS��\r�\"��z9x=I��I�k��d��,��=zt�7�|�*Fx�m۶\rB]��}��>�4�]E.��+��)0�oOC�}0;L\n�	=W�҄��\0�goӦMf��\rh�e�3G�w�2y��=�q�kd��Q�ML���\'Ң{n��&MZ�\\%���R�-��7�+��z8w�\ZՈ��9�:��wD]�Y�V�Z�3ft9{��xx�t�)ʬ�CM[�S���\':`�)Rt\0���\0:8���X����ŋxr?�-v\na���/�(?��Q����38M]��4q��N�Rdɒ����F�=�쮩Y����S�v�0aB��>a��8�>`�s�޽{�[�\'p��{��s����߿��.L͜9sc�@Rҹ-t��!p8�k���\'���Z�;���Û�e�zw�c�ر�ڵkWk���pjm9=�t��O<��������ޠ6�ކf�~2��;M��x�;�܃hݺu��3g�A�:`\\f�u����~U�е���u��ֵ�ML�$0C3Q�P�s\r�-׮]ێ�4��셲L�%�8�5.�k��jԨ��W^y��g�]E��ŋo%#�sw����7;w�\\g���(���^�Z~�����LM�~D��#F�~�z\'0��,Y�qD}��-iҤø7\n��W��XI��}r�A4}�3\'��Ʈ�9�z��v�1rS�����q\\�\rM����w���a����=���ؓC�X�b��Ν;�k	.�X:C��!㿀�Xdj8����O�:5l����kԨ�}6�R��VB4�xVbdA3	\Z\\�\"�:zEN��\r�G_z�<T�T�W�i�5I����]���iӦ��3ɒ����S|�S��C�=��9VV�s��ܹs�ϖ-[9��\"��I�+\0\0\0IDAT�\"��*U���^�z\n�����e�a$��Ӗ�(}��ϴ�9�O�r�ϓ�k[ʔ)S=��3Z��=�Y}(����;r��J�A��.{�Z���۫U�Vm��Y�j������zV�\\O�P�(_y���\r�\0�y��JZ{e�km	��Q�>C&�i�,4�a�_�q��6;v�}���_b���믿v�lz��	}5#ޢ{	%��4���Ix��y|?��<:M����:=�5�)s3:}���L���|̽�7n�x#�#ʱ|M��28����p���>}z;y�\"�ߠ�/r�RT�)r�=C����P�ݭy��#�\"`<����6�u��K�N���~�T�i�Q�K}t�|�ONbd~�ܷC��0��\'v�իW�Ȑ!C�;vH]VV0�Bv�A0�<9���F�\Z��㩼�l���{��7>���)3e�T�������ZC�\\ŠmC��2@�{ٲeZw߱N��N�k]t???�d���43�ݠՁ6��ȑ#������/����)��hx��\'��ȑC������Çشi��������;���\n.�u��Ҋ$��}%T5��\'��>��O���t��|9�PmD�����{�쑮͉,h�#���˗_~�z�ڵk�7zϚ5K���xW��*�(��vڞS��n�ʕ+�_~�e˖��}���3g��C�I��#�	1@@�\'�y�+���i��E��;�[��jΜ9�!s\Z}`��>y����Y����\\_]��^O�Q쁢}��X�k׮�GO��tPe����PηPKi���hj�|�yֿ��6f{�t�ȧ0�`���._��N�ԩ��ϟ����Ο?�6��~/��B?Ҽ�-[���si��ДxQ��L�ґ�F?P~}�`y0��[��-�N���~��7�W�50�O���R���_���17��G}�3���4�b�ԥΞ=���N�	(J^z�G�#+:��6m�*�|�˼жS&mǣ/��匶���W�{�=FٴG�t|��Z�E��Ǹ8P�~}��=��-U�(}����.2>���:�/���ٳgo�1c�?�x����^�<y򤣓~(}Kzo�x\Z9}���lu��)1t��%���m��l:*����Nq+Q�{�3ŷ�<T���G�\n*H�+�n5\0[������ӽӤI���ei7��I��:d�N.{�1-��Y`��\'�����[��\Z<=My��#񨷷w&�ȏ��	�V�-[�Y�<Fsb�I/�o�_h��7������\"E���Q�T�RN���^{M���H4�e�/��ȣg���E�+�7�</�bpHwj�>�M�\\���\"�~�:/?}�_d�	�ٟ4o�����?���.�5�r�;�7o.9��nFɩ+y2o�?W�CHy�e$�PV�w-H;}0����\0�ĠA��@g*�L����^���/�F�m�v�ԩS]�{��@ ?�����*�!$�F��}�С?ϝ;�_��ƽ��$��@�[�ޫ���8N�~IxU��ѿ�W�^�)����ݱC�C�;O����D�Ӕ>A}\0�gpI��$�\n{ŊK ��h|ӈc�gw��Y{:�ƭ������6q+�`g�(Ǻu��a�L���E��^�zuB6�:�|Ɛ�P���+W>:q�D}a�_���V#���Q��NzI��h�wPS�fT])���W?�l��|��o��1o���g�x�G��n/0�L&�xG����ިQ#pR�P$ڶD�N��e�\'\n��H~�PMA�\"���6y��-TJ�P_���b�Ng?���<��[^���%/�N:D;�v�)��k�6V��2�2��P�w��<�i�1(�1���X���?� �H�ƍ��U���,OW�!CS��e`ܓ�e��\'dV[M�l5�X�3������#f`\n3��\0�7\0����}����_7�����l\\�L��t>�I�<��=y�������{�f\"�\"���k����W�U�����8ش}������UG�˿�6�\ry�2r����x�ޠΦ�m�M���ݶG��Q�\\��ŋ/�����ѣ2�k��+#t��$Ll���!�d�<�H�\"is͠���[�WR���t��~ڃfh�s��&P\rv/�C\r�өS�XO���T~���3����1�8�ʕ+�\n,�Ӯ]��j����˴f͚��������n��0c��E~0���;=f�_����EOh���_���_�|�)�d�#�{��so��\\�&�y��gǓ&����~��i։ף&LH2o޼ZștzAh��ù�z2̴���B��פ�#�i%H;���524�?�1|�(=$\Z�nc��/x����&}��q�D����زe��(_�޽���W䵑�z0�>&2n�)�4=0��Ц[�f6q��<w��W`=��v�� �Ut�k���l�G�]�ti4Ǒn��q����\'��!�,� ��z��S���&(�\"��.oS��u��q�t� #v�ޭ�nt?�زe��(���~�FeM����\"P��\'���E�zÆ\rR�Q��C:u\Z^e�7��*t_��<%�g��D�$��t\\�\"��Ө_�k�Q�>}�bH���s�I\nxԠ��[9�-Zz折���*NB����������e��Z��QrN�������y�K�d���B�Hہ	�Vo�a(�K�_:X��O[�����h+;��]������6�w���m+Ȩŋ��b�������ЖAq\Z,T����bqv�bŊ=�Q5�|O�h����%�=�UɎ�M]�]:�b�m۶c�񵀺(��/�Li׮�B�m̛7��_|�=�J���t�Ћ�}��tGFb-��ڐ/چ����Y�^�ʳB�����mڴ����o��k��iN�n;�3�t��Y0�k�QO�ѣ�����������D-��t\'�v���޽{�n3����7e�?t{^x����y~��iժU�������HM�×���ΔW��ɹ�6���͇r�0oΌ�6�#��h��͝;7\0/�5k��~���y�oK􅞍(��\r���/���qj�w#�\r��������Yi�������%\\O0z�h���נ�*�S�Y4�\'y1�F3{y�-���P:@|pz7E9�y���4��o�u*P;��I�No�GN�~������Y��2Ҿ���?�aP���t�����AAw�Qrf���/_#UZhبN�\r�-YВ��mu��b�}�H�����J�#���i߾}�R�M�������R�:�[[Q�y&��g�:�Z�7;@�tRH���%Lm�:4���$�&�i��Z�j�G�wM�4ً��رc��͛\'����� p���Z�N�5y��S?���e\0B���$�TG�Mh��t4�LLc��e �hB��W\nȡ�ԘS���\ri�#�\n`�8��!�3�\\*P/�)���>��Z2��xӹh��<tn�\n����S�N{��W9*}���zU�V-7ގ6$~\nڈ���He\\rO�:�|r��a��<yr�ޔC{v�,�B�<�m���N+��0zܸq��ܖ����n�S��F;�L�<��{���!����_�3Mz����Zvi����ɓ���:K�J�mx��W�\"����9ʀ�������{��m߇�Й�L�uE��gP2l�̙8�ۋ������c\n��Ν;;C�x�N��qOmM��ڛ�����R�f���=٤��ob5�<y���u�߄rދ���� ���{\'G�h\r�!�x��{�x�Of\Z��7)㛷o����?uh%&�������Π˗/_�<�?h��.�B�-Zt��D9������(���3�w_�M�j7\r��ގ���x��ܾ}[e�ݸA�˺]lժU�%K�����zk+9����i\\ȃ\'Y�Fy_�vSd���˳�Ŀ�� ^���i��� �\\�����41:��xn�ʙ3�/^Ԗv�!�iq-g����~B�n�w���_�Y�Y3�gEɄ��o�Y�mI^ohh �&�<\r9,Y�����v�>i^ӦM���g�ֳ���14�梣���@�\'���i�V�\"R��i,�m.�)&�YT��T��Z���K��q�iDf�w�{��ٙ�ߝ\0\0\0IDAT�sx9��<�ȞX�jU�3g�d\r}��Ta\Zkw�<���J�.��Q��{��҈�x^�|� �P(/���%s�@��\n�x��(/�sE�N	�(w���3��&O���8���^e�[j�ŘFк���4��B�ۂ�-��MД�OIp��8��.OOnޱ\n�z�Qv�V���W�J���i���o@O�,�*?J�z�z��Nm0��+ ~�tY��bPq,��*.#~/��ŋg>|�pk�w�r�\\�l�t��Z�{��sK���J�OYd_�P��Wa۶m�1��>���_����LM��[Y���z���k{�r���Ň50��s��A�q\\F]@Ǎ��0���\r]�\Z}�Ȍ�;�����Hx����5�>�ׯ��}�vME^f��aڴi%s�J$�����L��Qy��r(;���J�뇊�&M�8lذ��_SךQp�b�C�l\n\r	�ʹ����e>5j�H�r�ʆ��\0o}|�-�B/����tz�t��e�EKW/�k׮]�:�����K�>�,	F~w��E\\�C�>�����ho�w���yl�3�ed)�{=��h�&<��͞={0yV��WXx��������>ui�(��ȡ����J�i��{��V����M^ʠ%7��Pʥ�\"L��M��]�l��7��w�}�ԩS�	�&tyf��L����ԣ���h+sx ��;.����l�_x�<tdp7�<4d([\Z�r�v�8�>iƮ�����c�J.!3z�������M�l�d&Z�$��R0\\� ԓ(���;�1�(!R�4��iӦ�XgRd������.���P��P�p����;v��UL�Tr\Z�>t�s��{!U�o���K�*�{o�#\r6ҤI��w���!e�M=M*;y��A�#�2�!\0%���Z��f�EF�})���,��\0�U\'�i�\Z��+bS��Q��jԑթd]���w}eH1�,�{��9�S�(�n9�)���(��e^�:Tys8�I�ZG����Z/�Bގ�������:�@���o��v(�����F��y-�*�|��륗^�:�_L�O���������O���1�2|��ߘ����%tPOmݺ�m�G:e�qS�z�\";Z�Ʃ�Z��ֹ�!�:h�]u�_q��绨-�ُ���{�w���m��[z<�� ۇ(׬#F��^mE�| �\rj�_Nt^a0��(�Y	i˷H�kd]?�?�$����v�ܹ7�\'��%���N�W���%�4��ɣ���v���`9�;2���8�Y�9\rM�C�Ȧ_I\ZiP̴ۭ�t�W0ꊐR3BvΥCCџ�(�/�iݵ��u�����~�D[GUF��\0�Ux��?�y�����/����W��Z?���#��|5���*I=��ۚ����m���2��?씳$�b9��6���=���\nx��ɫ����̙��]�yh���H�Jg������\r�Q�2�r��^}����r&��Շ�>U�_y�7Xk��4mAu�-��4\n�н��A��e	.Bl�	!S�_G�d`�䦄K!ӑ[5:\Z�<}�c\Z���-/��i�A�\r��p����\'�\\F|�$�~�V�:x�t��0z�QPo��<��J�*i�ԩ�z���D~o͙3���y�nC�Y~媯�����Kx�}W��7��>�i�������*��K�>��뚆ou�4Jm��g݌�?5���B�����	�{y��ݠ�����dO�D-#Y��H�DCi��I�\n|�>n/H�K����(�|4�y\0�\ZE��:8Ձ���u�I\Z�\Z��r~����\\v<s���>�?3E$#F�!�G:��&m���-#S��>�{�Ùu9�t�8�w�[�n��l_�t�$��^�J�*�$ml��#\r��px�Ay����ZAu\"}��xT��=��b�ώޕ�����zk��u�Rd�զ�-T����6���R�^���L=n]<�?x��իW9h��kɡ�|,}\rMn�q	N2�e�90!y�Am���ЛJ�ʄ.���u�:���iW�//�h�y�Q|gʔI_BOD�C���]y@[���/����C?	cG��A4�g�$K�,��#�,\"mڴ�e�؏�ߠ�IT7�E(���|���:G�u�,�Äڀ��<v*���sT�����(�ٺv��{��d˖��ѣGe<V��\0��Ѫa��?�7��`�ڈ��hCJxkEԀ�8�.�|�xXy�8O�U3�|�K�@�64g̘��q�ƯS��\\x�,OB%�A�{��۟Ƣ���GlR�*{��z����4���\n����%� �Н�\\{�i�B5`	�\"��)||��z�t��vV̬�!?��G`7�O��c�eZ����z���P����͙|TN��|\r:U(�:z� ������Ft�u�nvg���T�4�$�$�KƖՙ7\Z}����B,���<��-��ͫ�op.#�C�Ax��.ƽ�ŗh��I�=�F}k:Ti�<���(:p�֭�I���%	��K�Un�Wk�V����O�⡰R�ԥ�N��\rQ�Au��|P��v�~3dȰ�^m���@bZn���������p�ז��\'N�y�ҥ���0^Z}����W�R��ҥK��x=���������&Qၼ��\'bPhM���%ݧc���*?=˟?&�ntA3��ǏN�����iw�(s\'νh�+j��#\Z}��%er�om[���e���,��[^@�S��B��Oh\'�?���ȭȃ�����zN^Д�s��J��9�1�2ȸ��A9gt��/<�Y\Z4h���Y���b���k�U�G5�-��s�|t�\'�u����e=���ObЩ2�?+��u������Z[�x�1��>����O\'}�|�?���Ch�?�/$y X�q�:��2G�x\n��sݎ6R?I��j���\'N�XC���>ܳ������Vv*��_6��E���$H	ڪ�4t��Է�#תGɃ��}׮]���hHw�}s��@�54�M�ؾ}�7�����\r�*¡]��j5\n	�\r%��Y�c����n�:y{qC_JKaq�o@��!��GDM� V�jp\\F\Z��U�j6[X�̙3�\'O�=v{�6��\r��h�a`&�|�������rէL2���j8��s/2�� �:5}e�04�dD��V#�\n��hR�ė�騨s)�\0�IZk\reT��3u�zO��G1��ɟ����\Z�\'*zz&#SXLA��;4�z����Ohj���[�a��4i��СCZ?�zJ�$�V�o��5U��V=�N�rp2�\'�R�d�y�5�v�KF������u���B�z��<\\v���;��jXx�S��zS}�ǒ�p�MmA��U�n޼��E��ٽ{wa�S��\nЏ��ic��Mԋt���a:~�x���㏧������P,ٹs��cƌ�\'/*\"*��c�e���c�jd�\Z�Q�<M��w���s�0��:����N�B;�|�a|�!s����+i|~����%=��(-G��t��\ZD�\n}-U��a�gQFh{�G�\Z4h�\'�^�5d���&8i������3�!�W��Q����[��<�j\Z7�~�f�v[Ī�?Z��\"E\n�Ҏ\0��NRt�@t�6-��P��SkCU�H�od�0�O��f�5�x��BTGa����������	���������;�@grќ��8x�ҩ <�@�2u��n�v]چ����Cy�|�\Z��H��M�v�3vH�cG��Vc�رc\Zjw^֚;6��G��P�C��rs1�B�\n��B�D���l<�ɞ=��ഠ^�6h]�\ZdlR�2���Ե�Y^��p���%`�z���@�������$_)�T��а|��6�%\Z�2eJM�5AYBx/#�3��,�����*����*�Bv�]��Ɵޗ!�#���_1M7\Z�y\Z��~��\"�/����S/V:�&O�u������xi����������}e`/^���Sm)ӛ�<$�6o/o�^�!ի��chJ9�$� ��寠�zPO)Q�w��ޤ�a<Ӕ�:}��m�舺v.�\r�R*���4�rt~���(�����\n1\0\0\0IDAT�sE��3e�u�����|�^>��ZD]�k!>�f�ƃ1�e˖됕w�ͤ_|�E����}ige������۴��\'Ma�ӗ����9�s�N�2��\n�3j�(g����^��i6��5�=ʩs�/�5ֹ�E[�h�_�toVt������.�f�~�A_���-tE�2\'~�~����WOY�-)�YK_Py���\r�Y�Y�s+�0iҤ\"��<`��\\��րW���Z�\Z�����q�\"E��L��;�m�UQ�R�2�_觅����Q���c]�v}n۶m���E\n��+Wl��_D��-�q$4�/�VJ��KIf�:w:>��s���Nԏ���6Υ�$@KȢ�>�nݺ�={���#?�u�բ�����z�ed����@�ދ��F�i\np,����i��W��u�\'���%c\Z�+��?G�	��И��0��\\�{��\'5�.4�,�x*�4)1�$�F��8��0B�n�\Z��I*��6m�Te�ƍ�0�8\r�v�-�UCP)\'���q�F``g�L/�)?��������m�޽?v_�dI-�����s�v��-�k�c�o[J�k	0:��֤�Ծ�4�ȋK��^,��p6�{!�v��i����G5M��(�i푆³�z����j��yؐ�w_cdy���z5n�P���@:t�=k֬���-0֯����yy�})%)$m�|���<�xq\n��lK�d����rn����yyy-���9ނg��	����%��s��|���nch@ĥ˃@��\')�>�S�0�\'>5j�в�޷C��۵i�9,^#F*s<{�0s���v��-BF��x-:OM�&cG������{�K������������3�<S~*	���M�Z7N�\r�Y�G�o�V|�s6�3֋ȑΏq_m�\ZmĺݿV�Zi�P9\Z�@G�52�J�G�:m�N4è�h�������K/=�r��!��r����O1�A��Н�=M�K�\no�I���{��^`�j8�����%�e`��(:Ck��bQr���_m^Qm2�҈8�s���1\r�����7o޼J6lD�b�+O�֔�m��p}���L���o�v8}���\0=�E�V��l���o@�zʔ)�>\0�M����%K��F�\Z���G9�MGYm�mE�*����Jų�u��FS�x��Ҍ������⾼ڪ�ݴY���nb���%�(!MP�L�*��4��Tze	*\r��CB�5M�)\0y2�P0!4	��&�v�3�����)� ��.�MJK�I�P)��h:cdj��|������~���nܸ�͒������u��&`<���#��ߡ��Sr�HJ�,Y��;Ze��\\`�\n�eM�YN�K�n�5>ړLk��zU\nHQ�1�#��P�5�\Z�N��L���e�/�xC���\Z��Q������ӟ��$�P����V}��-��tR+P&R�2\\â�z�!�N��z%���-dlV��2R�����~�\\_�j�4���_��U$?ox�[\"���ԩi�o�\'bŬ��<d��ѣG[�f��cQ��\'L��s�j��{��l�B���Z �(��6Y^�[�� l\'Z���[;�0\0o\0�]�@S�߁�:W.#�\n���a袑�M�ff�qφU��y�)h˰r��`�<>k֬iȡvypx\Z-Z�?徾,הs(}�S�L���[oeټy���������@_�����҃2���[ƅ^�2b��>|�Г\'Oj�WU��8�>� r�$���}&��Ǩ��ܾ�a�>�N�m�{���lٲ-���:����жmۜ�ׯ@ݔ���%N�ҦM����@)�c�/]&Ϫ�[����9q�A��3mN~.^��(3�l�uM?�>�;S��-Z$�|%�/�8�Q�QW�p�Җ��+��\r�ZTty|h޼�~:U_�w��E[)8�A�?��W��5C(L���Jm�9p��ڣ�[�K�.i�R	��j��hT�e����������	��h����hh�g�| &����{2vro)7�%��J��H��)K	��k������ߧ�U���}�ć�exx�)�p����k\n�oIw�;�p?T�V#aJW� %�[��`5Fu\\ 2�\'R��y���x��W�G����� ��+���]�S��+\n@Z��3q���o��ׄ���#Ϭ��Ռ3�ӘE�5��쭎\\�������5v�Mu\Z��`D��ζ1���6���qi�:#��\n_��X�s-��7|���:Z���4�*�\Z�tY,�#�ٻPڗ:�X���ׇ�ܿ��ȃ��6��Vw��\\5�s����)\nɬ�D�$y���E�������8x5m����G����&L���:ۨ�S�N�����mJy��upw��\"1�Ͷ��*����,փ����2]�~]z^?ky~��N{����.��p��d�+�����\'}���\"k�ZG9~�O\r���qF?O�>=�ڵk�:u��|ȑ��Z���k�K/��u�Թ�,��q�3��?����7t�ڵk�y����7n���ǏG)��RV��,M�ji���ڇAjʜ��Fs/4����u��C�5�σ���{�2�?�̠f	4u.��G�p´gJx� &���Z�k�)�a���rB�C*�~J�TĘ�zU\r`�Q/�;w�P����U�^����p�+����$C�{���6��C%�I�r��]��-&6S��D	��(��12$;���~/h��}�Q_�`�pi����\'��h`tB����O�x7�Eh��������A7�$�_i����q�vY\Z��4ya�\'��%�*�����d?s���䥑�������.�n���,�aX���\'�Ө1�Kemj�F+~�x��x��\r�>�!F��;�S�04�{����yK�IY����\\;�#/ǵu�b*W�\\.F�ZL�4����$���-X\n�?�)J�s��x�ر����ׁV?Z�L9��BG2!|��F���*�xT�Q��n�7�n�\0��e#ub��/u�rI�$\"���j�#\'ui�sh�j����Oa����>���#�֑|�#m�:�\nJ� yԤ�$wZ\'����D�S����*ze1޲�ݺuӺ�(eOYRڟ<e*[��@;�q�in���l����JePy�q�ݻwJ�{����M?��p�	���l8���C�q�рᕒA����\rk���Y3B2�v����2����F�Z�EV�^�̪����>ԳހW��Wt43Љҳ�Ƶ0�`�<�=;ư��|М����x�+V�؁�)^���]��U�={���<��D[Tɩ����ƍm�[OBS�.ϵ������3K�.\r ]Mb�\0mKg���l7�e\\+E.UT��OpU�_���F�X}3����H1¯!G�8iµ����n8x�|��cޱd@����\'z@8�Y��tɘ�ɫ\"��⨞{�3.�����Q�UT�q �F�<GKi�\Z����.w��$�����v����W_���-/�+�y\r\'���G\"4	�QF`i���^���@��F5�/�ӛ��T��O�1�K4�W��Q��|�4:�:�/�CA��9�VC�\\R�j��J\\_�KaDG13��g0Sb�j�Dm��;�}^��\Z��4�xQx���5uN���F�f��:y��胦F`��4⃗-ɮ]�J�ڵK_�D^�0a)6a��e|CKF�\0�\r����5J����O� �{t@�(��,D�v�75:-��[6�VԵ;c(r&�\\����#�Q���c9w��4}i�%�p�?�J��!�.���9s���9N����8>�kj��`=�\'\r��r!���ȑ�Х�A�\n�y�r//Ѵ)S���+M�4^~����L�D.�Rڌ��t-�$�ae�\'H�Xz�L#-�\"�رc[�ӫ����(�Ut��4�v-\\i���	ɨC�j�2cx�ˬ�DRj�It9��xT����2.�����r�A$��\Z5j��Q����d�{�O�x��2�\'�6U�~T9�u,�m۶��G�J�tꩧ~)Z�h�W�� ��}W�D�c�:�<GS\'�K22���~�����x���҇�Q�h9sYHѸqcm�6�z�\n�>&�p�K�%���\'s\0\0\0IDATZ�,rw����KG|���~R�[rV��<��ކq�U&��N���pÙЦM��Ъ�}��O��%l�@_\"��\Z\0����=��}ؐ����<G���\rM�-���-,=*a�&ŗP����������Q,ƅ�w�}�_�荀Y	����8�8�W�/�Q���(����ڵ6����gh,����הA�<�鹧����E���K��� ��-[�����k��Ex�#?+�2�~�B���0�Q�\0�]�ڐ^��\0��\nj��ɴjt�w��C�X/Sv}�%���:��E�O��t �S���}x\"l�\\y��ߘ���?yݺu���E�������҉�W��\ry\'�A��yؖ-[�?���4zRA��з���x���8V��-�%�NB�,�H:w�P��h\\�2w��L�\'\'�A��Q\nZP����C���!/!{�GW��\\UXd?��h5ښ�P��`�\"��\rz-c���-B�7�\\�BF��\\�6)R$r>��ֆ��#�L�I�v���)���(1mW����o����]j�_:IeP��c�J��;�Ȼ�����>@m�:uD���~<�6i����V ���͛�Ў�3���\'�>��(�E�h6��H)�zI1}��Z��ٍA膜����:S٧���h�ט��sDa�v��Ƒw��nذ�����O����wc8:�Q�g�����������O,]��~��u}���K�-EՋ��(\"r��C�Aߢ�7�K��w�yV^z�rۨ�4Æ\r�H=O��%��2��k�q��й�l�O�ɳ�{����p&��}fΜYL�R�>[�\'ro�k��-�ho׎��c;X-�w|:�p��9�<��d���*�A��\rP)�0��KM�H�4]� {�!�g�ꠠ���\\F�^tH��X�A;#�V#a�U��\r��A�)\ZI5\'����m�r�Jo΃i 3�ւe�X�Rl-�(�ts��Ѵ�K`�V�\'�j(7(��O�H_������)���idR~\Z�)YT����Q<A�Y1�tn=��(废u�\"\rR*����h�.�Б8B^��0-�<Dij[\'/ʠ�[4���\Z\"R�20���Q��nQ*%�%���{M�Yt�%χde�i&N�z$���yŷ���#Z��<����O�2W�<�1�K�.1q�D�ĝ��z��)?���$��� 4x����N��L\":{�u��U�PD��r��D�>���\\i꠵1�>x�H���5��buOˉ���E����������N�9q�D��#+�x։�ȋڠ�˷�@[U��(\rC��+�N7��C������L�po\"yXSڤ��W�p+ꀎ�oذ�8�kZ;�p�z�\r��_ȵ�F��N�g�хصԠ>\'���A�D�2}��&a\"S��z!9�D{���xΛ%O��}�����O?M�;w��ەΩ(��,}�С���Ի�b(�{~R���p_�[5���%V�%�=u��^��k���Ւe����E����ҙ:W?�M=V��|�ҳ��ԕկ��E�$���tW�ԊWE..L�>�1��Zl�⏵+	X8�͐��oyk�Ty�lٺ�)Y��	w�s��#�*(cmg�����\0���\r����~�.w��lԨQ�5k�4ڷo��{>�r��;�`}٦g��R�\\�4D�ί���a���C4]r��Ƿ\r4��A�3���L�郟A��ё��2��7$Y�hQ]n����\nLT.m\Z�K�}�]�Qm�<Pc�p�1c������C��5�E�^\"���զ�i���ă��J�=��*�u/�>�����Z|�������<yR���ą�^�j�M��\Z҂��(��=<���6ϥ�ex���!�����z��)m�$�Q�nKف�_Ȧ<��0A^Z-a��u�����zN��s�(\r%�i������)����)���;F������ŋ+�#��=w,QfO=�H����wbPЍL7�]eKmS�j�po�EIǙ�?��c�\r\Z�A�h@����(_EnՎ���0׶5�I�Ԏ\\ʟ���� ���x�68�{��^�y��K��y��u?v�؛�$���,}M��t\0mE������\\{4Z3P���X�#���2\\Ð��j��e+��}���22e�:md��J�*��Ν;�CG�WY3Z�a����`��l��.w��W�L�2�ē�_|�H�(ß�%;rdH�d\0���� ���f��Q�t��#G��sb�#�����#���g�y���]��a!h{�P}�MίQ;�Cљ�5�L9\"�b��?�|�ׁ�XN��� �2nuz�|�%�zG���̾l�2mGׅrZ:L�]�F�r�T�kIß`�t߯�5k��H~���2��BW[�9��ׯ����M!?Ɂ�S�P��.����sH�K��TQ̓\'O:\Z��\\^)[\Z�^��ڈVk%~���]�4F�I.\\X�)�Q�-m�٬�<%��u	a�C>\Z������)ڻ�r�$>�����		� $$�&4.3���F�8���74���H`C�EG�<t(D#��[f�[\n�A!$$�<y/;���4�iy�Uo\Zٯı࠯��1�	O���E�����F���O�2��m��\\7S�~�\"c�=nh[\r���A���_|1��9���Z��X�n�9-��L�|�Ν[ƽ���/Q�dϞ={j�O�x�\nN�^;�8Ҟ���:~GG�O�z=\Z\Z���C���-��lڴ�5Z�ܕ�6�L�y���f�2�ӭ-�N�y5�ҥ���cH���Ͻ��?�K�\\Hx� A�h��Cõ5�R�E�<;*�˘@.��x�g�ꔑY����\r�c���<��[.�������&t7�=�?�=\n׿�F:y��>��<��?���7�#m�����6\'CY<k@6�C��`ލVo�͛W޷Q�٢t�M�cy���Z�IQzEՠ��������ʞ={&R\'�2MB���\n��\n�O06��Sn-�Q;������e�={v���g�>�~������R��@GN&ʣ�x}����/(�bde:�N����={��믿�]���@]�u�ܹ��{�� �H~�~BK��P��^r�)bR�1Y�f��{��gϞ�ό����,���8ʧ>P2�{�F���,0(��=�D�h\\��WΠ�Ȑ�(F�V�\\9�U�>D�:A?=:^�&d�u���5���K},����}�e��.V�\\���_�(&���=���9rd<Be��i\Za�a,�@($�rc˓��(V�|ꩧ2�@�D�� �>��!�~���y���N�bI�	��y3����W����	݂䑔���nu�Eh����(k5����\nd��������4`k�O9D_�3�y�<d�����[�ݸqc���T\'�`�h�H���s(�\'(�ue�!�89��߫,���$�$�͸��a0 �孎�g^���o�r���5�6y0-#���������z��a�Tm�\'���(�>�J���,E$����Fε�StU�:ލ�!���$�M�NՂ��͟?_�Ɜb8�IG���*�ɓy�<L�k\"O��3rA�i�lٞ�����/���N����)$8x��f��]�i�%���YO�\'��E�}�K� +ںE�����T\\�>,���s���\"�rd��+U��#�)r��<5��Z�\r�wޱ<?g�Iy��sS��2dȐ(1����1�Q�jGw�\'�E�5ZZ��Q@8�Hý�֭����=�Z4_KWP\'��A�l�*�\rN��8]�t%qdt��fW�h]=�5�Շ���wM���R>}�=3���h����%Jȫ%N��4`�?p�@_���Gk�:��Q�S�}�ٟ�w�\ZO��iFw�I�&q3���L��z��jX@~��ך�;oY���T\rܵk����}-��@E�7�ZJ�i7�+�O2$2�(�U�^������\0��k:�����f��\"� ���5؀�dV�Ө�6����+}����#$�Q��H�z��I��kժ��Q�;4���ck���[O�2d@�*T���Q�ŋ��pv�!��@�ѶMB�H>���O^o#t���L/\Zm���\0\0\0IDAT�����|��¦���N��=y9�hX��𭏖d\\HqHh,:}�7��e�����?���(��HD\0�t�\'8���inH�E�t�M�HC�>}R�J��5�A������{�)��w*|�I�2����;x�r�\'鿧Z�Y�|ym5\n��8��[�g.�8?K��Dy�/��0ΥLoQ���=i*_x��{\rP��O�q߆��]�ߩӕԱ�0EG�)���[��}����L_h{C#�,Y��c��<S:n�.@�:�!cZ�I��4��r�(�l*�\n�k\r�R�J�o��&y��V\"O�\'���ݛj	Y��U��:�k�CB[p�-V�QeSt�ǎx��ǟ!��iE�k�2�L��#��]�ZA^�ܸ�GhF������H�!���ui/w�y�`W�-�-�;�~^և?���9�qM�l^�ڵ�p���w�}��K[ԳP���y\\#��ڜ�\\F$����-|���2�W/ʀ��O[�ȉ�>�)#��)S�<v������y�YX���Ji�/�Q}�K��4�S�b��#�$���O\Z�Kq�\n*��u��?��3f̘�\Z�We�\Z�Y�3��]&ϭ����T��lG���1cF�.�D>1��e-C��\Z,�� #Q}��8ʥ�f���+�����[�>��s�v\Z������ R�^?x^�j�d�֭k�xj�i\n�G��J}gC�џۤ�$c�܊<@�Oy�;j��\\s����@A��K�����u��>���~�����65T��[�L�P ���\rݺuk����L�#�� ��!w�n�hP���|���un��u	�S\nAv�൹���q//��l��w�\Zra����2Ţ5�2��¬���I�S�N}6�>KT�\Z��Q(��i��CH�:�J�|��mq������\'��?���ߦu��.Ӵ�|����H��q�����_\n\'n�H���T3gά�m۶���1��\r�O#f��P\'��t��[m����l�2�eß<y���nL}�#-��O���F��6h��>���.u�B��vD)���h��r`1*g͚�|G��b��\n��d��\"��]T� (}�<�cDLΓ\'O��K�������|lIl2.k/QbD�޽>�������]��e���g:C���S�8�.hf&W�\\���w\r\ns�2m�j�:G>ux \"�e����C񗉣*�Q��e���w�,ƥ��~A%P�ٳ������Q�7]��5<�M]�:����h�c��m���x_��G��Q�)Ma�v\'<xu`\nӗ��G�ZwJ��c�Q9\Z�A��\n�22?����:u�.ux��}�~W\'s~�rh׏�iX�A�!\\��;�V�t�����K^�xq�q4����1���NdHI\'�ȌU�������۷��Z�o3�\'�Ì�p#�p/o���<n*O��QF�ۑ�*<�~I%G���&].o��w1�5�t�t�޷�8���&M�d߰aC+p��{���`����>0��t��;UG�Cy)�y���$��(O�|��`wȈ��! cIG��t��\"��!)�j�!���\Z�X\nF%�j��F�5kV짟~\Z�\nж\ZB!#A�̹�\09F�*я��ȑ#�$�PFpE�ۮ_�^�������Į���Хp���C��h,V;�,���U�ϒ�>d���+���ro�g7?J�	e��ӑ��p�k)7M�Z�X�s����N�~��\Z�s�8���4tC�������A1X��#T�`��/���t2�t6�����b�Ν�p�|�A^�_V}�۶�p_?m���ʠ�����u_�v���\"����+W^��/�;�箎v:|��)����R����.�P2���c�\r�LuNlԨQ�W^y�#z��}��N��/�Pb�֭mm�l#}��fz�x�����9�|C�+���-_���jzK����ߢ�&[�l�~�Fvh�d�)�ȋ���6q9r�m�����SQ��%R��xg\'���(O�5�C�-~�{\'�y(�z�|Z�B]D���~��x��^C$�\0�1��u\0�j����:�|�S��|���wh�d��G��h�K۴~��&j+7y�dx��w\nc����E��\\�_ˈ}��6|\Z�ʛ)��AWG�/���8�}^�yhڴi6��é�F�`����^����?���:�j��N\'�7�O�^��	nfCV9��;����\\HX��@[���O�>����+��5.��Lqj�p�w}��_��@@^aN���kٲe.dKmQ�\\��=§��@�d���t���B�\n迖Y�f\rb�1�_~�sGF�g���1�f�jմQ��4��D�qp��E�H���u�*_�먢���v�������e�<`4��(��tʎ�\".E+M4�R���@/�y�B�7���lx7����J�<B\'e�ȣ�,�7o�4�K�\'��a\'�sO�sԥܕ�ʢȭ����ਟ［����}��Q��������mx�l+4��q2d���ٳ��g7R<��H����	y&�G� ?y%\'�\'3\n#�z��?\rn:�c2�;eЀD�F�[ɞ��U��u�}�:�R	��1���xky�����?ɓ\'����\"Xܭ��v� ӆ�0<sهL�\0�A_|�Ť-Z���s�Odq�իW�Z�j�n۾���|�s����oo��������ú޼q��O�~ڴg��$�#&����xN�ř��\Z��m>wO���A]��}Q}<888$Y�d26ůbo��Q�Pi~\r�//����f\r�u����{�?r\Z(\r�,#�T�HI����&Mj\0��5\r(���������������V�ܩP�T��w�n���՞$ �2�2���nɮp��|$��2L\Zït��,�$ڊ�E_Xo�\\��[X������D�C��H��f���ۇ��l�#���4y�L�w�N��h:w�\\S򪂑f�g�N�c@nW8�����TYQ?�Y�^\0����\"�~�\Z��g22��QXI���CE�c�9s�4�����Z��LY\rx/�)�n��\nqՍ\"�ч�)SV���s��><��/��\'�t��2�zb�H9k�R�z���\0��Ŧed��%p��4J!2���r_�e�)�c�h��[t���t����p�;%��hXo]�rŋ<zp~��>����B��CW��_8�:�3�\"�n/W�\\Q�\Z�/3ݝrX\n����uL���\"Q#q�<��9�\Z#I�_ʑ7�U�֟��x���Zx��{�,��u�g���vE(E�\'Sl߾�t��wn�}K�B�s��4^�����JS`�1*�I��ņ������W&ʨ�ֿ(���k���(TԳ�b&z�v��-�;{1<\"[�\Z��{_����]�z��SrѢEZ��tb�~ϨQ�乕qu��[/��҄:u�t�[�ne�OV�^==���4�׼y�W_}5�������ʔ%S{_�	&MZ����	��+ݸ~�\'�=�ohpH�I��hKyE�E�]�J�*)1��Bh����sm��2G�����(P�^��kk y4uͣ��r��A�A{�G+ɐk�\'�w��3�CS�J%�oi��v�I%�4�mJ��F�<�^����C�?�6��g�a��R��~�g�����Q����fP��`�������5��:X����Z�cP�\"�\"���a�\Z��j���.&����݀o���NH�p>�k��:`�����i���^N�_�E�CY7B9��!܏�E�4i�t�v�Y��>�H�-�L�KB�B��$=S��:�F����2���E���7�O[�\rA�4�n}���6���k�V�\\Y-M�Uvop��_�Ȼ�)�)��%�o��8F+�����2������mR�N��֭[ݭ�m���nh�����;ak�և$4�`��qOk�$�N�4\0�C�U���G���]J\Z�eT@3�itm,	�FYR�N	ֻﾛ^GҀ�ё�c�Ѷ�h//�b�g�A��O�D^�E[�Ә�%J�`�|<#f���,�F~A�Ҕ�\Z�ۜ�Q�pv��ie�?�j��y�G2.2����R\ZQ8}8�G3���|�2t\"�b������(�͗/_!\Z�B0/�Pj�[������\0\0\0IDATy���v#撝�Ff`�Mr���]�jUCh}�L4�kd�	G��@1���U^�_�\"Q�)yQY�|0P>m_3��D�B�O��{0���h���C�\n$3ޮ����\"�O�>�;6oI.���<��~˗/o�������֬[��+�_��짞z�G�\"E\Z.\\�ǢL��+Z�h�sq���S�+ű&�N����y��}��xN}�b���.u\r	\r�\r�}{̭�A��m���d����̈́�ux�,��Ⓝ{|&۴i�f:�!S�S�3�3C��$EnF�|�2�O\"�\Z,�Z��qr�ȑ�z�Ȕ�9���6��i0�Mk��]�tI��Pګ�ƌ��O?���m�����`�!N�Z�.���j�l�ٳd�����m��ڵз��i�2���,D6���i#C$9��{���,��A�}��&��8��A��2���#�(��+�.p Z>^�&ZR�=�W�RMe�~��֋HD��J���>\0}�e!��G�X��Io.��C@k�%�қ�:Ẅ�r)��q�nT]lE��&S3a2-�)˽� u` �v���Kh��x�:�d�\r?���{gx6�{���܆P��[Q�q�ƥ[�vm�3gΔK�4��5k�h �K���C)Bw��Bz\Za�O�O��J�P�#Rm��/�$���\n\0\r =��5��FX�@/�\Z\0G���T�q�ž��m*)1nE�޲6l�ŋ���,:�p�(�_�~���/�$�\"���d��oя�pT�\\Sb�N������a8�M\n�z\r�nѨ�я\Z���,گ�����r���qt�P�R`a�_�uI��3)��1�?����i\'7yo�䗩�\'��ׅ䓗||��29W�mEY�L��x\\\"#a��Q�Ⅴ6����?M�Q�&{]�~]�,|���Rt2`���yI�U�:r�@��Y)�07���3�}��vU_���/�����	�/a�m�E�e�p���L18:�A�5�_����{�*��n�����k`��k�}���?Nٿ�\n���d�o��]<߆Gz��?�<�tC���6/Fj2��⨔�S��>m�g8؝2M)��1�ի��U�|	�/0ӑ9�G]w$�4ȧ�6����2�ϡ��\\8�,=vZ8�x�̓���u��� -/����%��S�j}d�u�Vg\r�C�AmAt@\Z0`���ԯ^���YQ���s���UL��]��}[�sP��苹�6�_N�a#�z/�8y���\'Nr��ɶ��\Zx.=o��F}˸R#o����(�d����-OZʃ��JS\'��Cz��w����Jڛ>U�8]Vލ(�ѕO\"o!��WSSv�Ϸt�^\0�[Ȱ�0�ϵ��$ˊwq&]��^��5}~��z��Q��@��\'����G�F023`.�~�t�ҽ�<hי\0��epQ{ȹ<Κq�|�GnE�.]�=p��J�}t�pd�{t�d6��SKi�c�e<5��x#\\j�jZ����\Z�K�T��(�ܲeK\0����Õ}�Q����$X44	�y\Z�&�|I]��<�`�V�K�.u�!kk��4�܉LQ�B��e/�b��1y�8X[#(�?TDq�U�\\9��T\Zm��6A�,6�sк{y.�Vƅ����ۃ�ĉ�(�S�KQ9r}���F�����\nU�4C�4w<��sKH6z/��ݻ�C3/��Z�\\kw$�)/��>�l6kР�U�Z4`J�hŨ��HF=�BF$��H�Hb���8����U2�#������W�dm���G{�ih���ÿ������+�)��Ry��t`\'o��]e����M�|���;w�5X0v(����>[�D���o,q.�K&�r����8�8+w��SH7�P�BoQ��K�,�Ş�6^z�.����_�4�W�t��s�E���L��ٰa�<ڣ�h}�}+?:3��?���LhkFB2�!Ȏ~���EC˥��_���_0��,[������M5�T,��������wt|��I�����мJ����D=�⾌L}�%Zjw�I�F�͜�1}_9��B�і9����x�rgm�.zw\r��\Zǌ3�u�֭5ް��3:\'��D.�\r�-O�0��-ߑ\'�n��r�􍖘�-TCߔUy�V��N�w��\08j�N:Qљ���A�6��\'�w}�U�D\ZH[˗�`������͕�)�����y�N�U\n��[���_�����O�֯_��dr�t��Y��c�ׯׯ�]���8�d�Z��D��iy�dW�%\\���E.\\��Q�F/ ��3p^���;Q��XƧ����\"©_���4T����y�8�$��G\Z{�ꕜ��ZG�m\r���9:��`M��a��`��Z?S(aM��w\n!H�i�i0H��[����p�y&�\'����۠�[����wѡtŻ�<TTC0`�sL9�@q��>����1j$�CۇD��N�B�\n*���u�L���7o^}\0�~���I@�*���4-�:�r*�Mh���Q_���9s�\Z7ɣ��U�ʂ����Q�~�D���X���2��������@�]�5:��XF��T,f��*���4(q�T}*���@\'����N�r�\\(�az�T��}�cV~9�ĸא�I(p��O��ի��q���<���\nߵk�?�~��&�����.��QKZ���[�֕��ȑ#�w��9	��\")�xh���;\"�w󎋓6mڤ�~�NM^o\r���\n�7�e��G��,mF�EM3jy�ʦ(��Q_�ӆ�UQs�36�ԡ_g+��j�.C��\"/�֡ K�ވO�?.�\r��	\n\n�E[̊���l��s�� ����SG��:v��e�k׮I\n.���ӧ[���b�m��m�l4�a�(�{g`c������g,�҆��TDI�?��d$��\ZE�1%�%[�T�$J�\n�R�PZ�HI!�6���������f�w�Ν���y����پ�9�{nWĵ4�+~<�h܃C���ybϞ={���	���O1�AP�=<�%x\\w���D4�w�~+q�PPG[.CӒ����6}�FҔaŭs�[�����V�|$�ݱ�ߢE��IK۾݋��$���+��/���p�_�5�p�:�/Q]����j+:�B;�W�P���_�t=㿟�߳g�2���.\\xzD�_t��?]�<�v�8d̒A���uK׍�D�����+�V����ˋsz����@Q��X���j �|��h6�%��s\\+�����D��?��\"�:���:�͢��su�۸�ً��:Eŗ�\n��C�\"mt	q>M��ѨIS$V�\Zٺ��=����f��_��ystJ�\'N���W_����\"�v�#�I�p�e����͌50	+�dҸr�Xx���Fv�/��2���\"c��\'��x��ۖ�T�e1�ћrU;�|h<�E��N4��\0�#yϵ\r.���&\r�g���W��DV���2�L�[�}[]�;�-�/�@d��\"�2��X���\\�=���!�<�K.ђ���k����1��&��o��#?JW_M\'��s}�ܛ��P\"��K<�1KgI�c(�\'o�����<���}���Ig�r�Y�i��uȀ��}��|��?�K��9��c�i	����\r��.��̝;w>�~\r�u[֫L�v�	�Y�e�)�,\'����	��k�͉L�O\'��$_�j?��)�U��s��Y�|���[��G�g!��A�J���.�M��MT_��T�҉�ء�݂r�ʃ����K����\\5��@�~r�?.�\r�aɌ�-7F�&�WE�F�Z�����Fゖ��a�P>��C�� �u}ɮ�����v�S�*�S��-GsC?z�O3k��7%B�zTT�)��Ly�\'����0NDR���4wN>��W�E/���ħw{��\"�4��\"��t����t��ȭ�:;�W��N;������^x�ZI<�v�?��W\n��/�ֆR�Ar�AP�X���+�*�_v�KJJ�V����?:-�j��(�C�p���������t-�8@]�A���U&��4��1P\\M��u��\r$����Hu��W���*�>	1bĕ�f�R���K�>�Y��4�,�����\'�V�N��\'}���m^�F��?�������ߺ�Ic���P�l����\'T��\0\0\0IDATC\'X:����Υl4xh�\n?F\n���\n�������tv+�<�,�D��Q]��N��E�u<5�@��/���p�$���?��k��e����k�O�D�5t&���/��!:�R����M���X�&]���kA�P��7�y�ՠ\"i_�\0�mi��vI��6Wjʔ)��K���c���� (��6�ý�k�g-ߩ-��T���?WܑLps��D�}H���O��Y�z���Z~��B��9��AzIW�g\'\"�@\0�ӏ�̄ԣ]�G�4�΢�U?��}��e�]v��ŋ�v��{���O)�\r��#��c�\n�Tڰa�`�����F����E���hH�����e,�M�25�E����\\E\ZW�ח��]�	e$c��WR�k\r�I+)2B�>q9(�Z�j����?�0\'����T�I_yV���O�Fnalw?���p���l����q_;��@{�X{ũ���2��S�V�fQQQsh��^k=:�b�ѯ�)�L��ǈVDf�K����\\�B�����W�R���QD^����s6`�֯_�Yr+*F*�����L!��U�$��|���+Ι3��~��ZfŚ�}[�\\�8*� B�u}4�Ɔ��Qc�KL��)I�W:���o�~�*⻍��1�[?6�q�P۳�ߎ��Ac�u��J�%�(H�t�z�|��vM������IS�,�H�!���\"�G��O�^��L��PG\Zqi@P�������G��8�r 7���U֯���eɽ}�nݺ���N:���ﾻΫ�@d�� ���QN��%:���\ZD�/`@M<��Xr�%sYE�\0WuB~���T� �+Q��X>��9O�Z��([��P�u���e��k�R8=�g��}���#ʋ,���q�ҕ�\"���:\\��j֬Y�<N���6�aÆu�w4��39�S�6B�sI\0�Y}����2a��M�l�՗t�P���D$LuFdT�]�ﾋ����u�s�G�YG����6�֫:�O���\Z�!�_ڰ�o_J]��re���75i�`)z<�镘M�����K8=���������G��_���n��A/�R$s�_+ez�$W���)�۟�vC����*�U���T�>�K߬oT�_���Q����TZ<�W�^�_|��O?��!�y�>�\\*Br{�w�Wt��V2�O�bx(�D0��V�^�F�^�z����{��khL�W�L-A+�~���B9g��A���M�oƲ9�8.v|B>�G�ꔬ��=O��\\�R�*�lʩ/���~\"��C��e�:�Q�n׾A��p�6��v��U�}���n޼�1��5k��\rDc���q�;�N4��av��gR1��^�ײ�\Z��S��+��um?��D��\'w����|@�d*­T�f�c��J�\ru�s��(.	��t��2~���,�k����%��2:������ɤ��zOr��������\\}���۹w\'�p��ӦMS\\��ԉ��e�ҕ��#SKt�5�%v�!Y4��}�[�tiT�޽��i7�*����s�p�H[�N�A|-�>�}Y1������]�v�_|Q�g��y&��~Rs�_KY<C[a���T��9�yql\0Wu��q<�M�e���R�\0u�*G�+-��%�Ou�C��bI��m۶s+W�|߲e�~:�Nz&��3��>����t��(��t��:ܞ�����i��峎;�z�լy�*��]w�U��ɋ-�Cݹ����r�8�����Km���C��ڇ=�ڳ�^���� \Z��Ah`W4�/V����	���vH���#�A-�keH��~夋��c��@�1��j�><0�x~�Mj㺜{��#Y9ք]y������?������y���_/��N��kѷ�{���F����e�e�l�dEs�1my~6z�ҷi/G�X)��C�Ica<�P�v���V��/˙�]�`M�E_�0��\\�C:u�\0��ZӶ��`���ǤsMc�V��a���ӧ�Y���X��J����^er	&Ǫê�]��n\"a���A�H&�9��2}Չ��ڒ��~+c���h�\"y���]N9\rE7M��~vS�L�2B��>.��Y�(\\rL�:Uw�ڿ �U�û �\Z�&m�aP�;�fa6:���dzg\"�\n ��Tt�/i��D���ߝu�Y�(�>ĳ�A~\n�L\r�����n$t,�j��i��#�Xx��ފW���#��k��V��y�Adq�Dc:}o�A�����*\Zu?tP���D>��n��DC<�a�\Z�u�^�N�}�s��wi��2���d�iS#�{�yIˍ�\0�ԩs#�0:�r`$u<�%�$��R0��Y�:��*G�9%���!��/ҒE���D�\'*�8�hJ��KNN~݆�a���zeC?�����F �d���W���D�$�S��C��v+���Q�ƍXy��$=�U��!�k��#�Q���t��]V�Z���;���9e�3ʩ���-F�}���>��c��g0��$_�?�G�{�?Yt�I=���\rX�d���ʊ��9�%O�)���ϡ���@OT�k�7�z�_�5sqjҨ\\�Y�#\'=�,�u�����i\'��gS�#.�����dڧ�+�s��&׫Y�zh�ԁ>3�:rƌ�N���Q}�> ,C�����D2�����\Z9�צM��׭[���d���sz@�J\\C\0�\"���7�/���C����,;��y�*1��ݺu�\\p�X0����߂1De���7���L���&��g�A���ή�٥��ފ+d$h@�0����>S�w�.�Q=�\0WYe�x	}�aP������8��Dgdf8ވ��yĭ��ӹ/��wL�ݺu;�:���.[���}}<�|�5��M��QF��j c�?�lӁPF��L��@��7��~\r�z>{���!(l���+EGGk�A�a�h�̢�\Z�_����g�ȑ	zA}�ʕ=���y�B��}-4�D�P\r]V�G���L��8�\\�s]S��D�$Q�\nu9�^@��f�ZV�LE>�t��k;*���6�ئp�Z�\\9\Zfe]�5n�¡�h����QHK�$:�Sh�zI�d��^d��4�{�H!�Hw��P+�����J�3�N�\"8(��%��5�<\\���#���ktu3\\�����k9�Q8�h^�<{Y�e����*\'=�0�%\n#����t�72��j$����>�:�|\\K>4�3\"���5�_��~m�k~���D�<g�qF|���Ϣ�iI=����λK�,̺8q��/��6R��S���p��^WV������K�J˒��K\n�>�~���b�(�>n�2��dRR�w�ĉըMG��_x��v����n�������ue#�~�s��|�q��꒟`�4*\n��~p�H�X\"z�\n�k��y�>NA�\Z��B��c�*_�\'�[�ii�D�>��w$S��}�L�2�sUH#�H����qx�~Z�]�O���+N�ꫯn��\\K��t�2��ߋ��D0S_�v�~گ�ڂD�(��{�h�I{#6�V��Ċ+�?�TX�x��{���#>��m�,���=��3��;��:t�9���ԙFM�6���C�ʧ�U:^�,�-�C�\"����ޡ]�����HΎLD���\'w$�����C��Kqk����G��m���q�Ł�li��c�b��8�N2�����l��N8=��p�\"�ߴi���=���b�ɋ�.�8�>��D{<����1�S\Z�6g[>�\'O�\0�l�8w�*U֗/_�U��%\ns�E@���g��*�1T��th�|�����*�|����W�^�r,�4]�x�UW^y�T }(\"���(|�**G9��R�Hf�x�V.=��w�K�v��\r�K����ꋴ�t$\'SA!�;�������O��C:���\r�jY�+^��9�0p׬�U�yd�ȸ����s6��j9�oŋ�����\Z�=�#�IE���L�(|����SO����֤�6<�#�!O���D�Yj�x#x�NF�AY�L��M �`t���p\Z�BZ��~�:}����uέ\\9aC\\54P�ď`�\n��j��$\\rV�_t�:t�u�Թ��їWd�?e���?�~	�EΤ�x�� ��Lu��Yi(_JX�\0\0\0IDAT+n�S��_V�|�ǆ���I��/��R�}�^v�8$?��r�i;d���{�{z��N��EY�N��.��>W����S5j���_�`�5�੅A���ܮgϞ���g��ה*U*���,���ʢI�hϣxV?�\'�]*V�=?���h�\rA������Q+����\r�\\�vmD�wh��a��:��(]�szH�v�	\\#�ǽL�:�y晟1��8e�R~F��U�~5ڡ�}W��dM�K�F�9s�4~�w�nҤ�_7�x��PV�z&{5�U�T�\0���{�W���ݸq�b Ww��5�|_�R�S���ׯW߫�z^��1��ڳ\'}����й?,�ysX+K��_ݸq�^�9$j1D��k�����T��Q7��K���)�.e��*]r�%-��瑄���z�:Ը����ډs4h ���㹔�+W�])��^�؞����̯9ֽ��{��N_~m��Ν;}�������8\\!�s��:��/���8֒��������c���z��#���>|�����V��[�\'*�� ?�����\\~�B�ޢj�����T�Ƨp~�~\'~��7}^y�������_ۺu��D��A��eI�t��ȴ)�*���ױ?�{L%ԯ���Z��֭�X\Z�f�����Fw�* �\"%�	�$��q��?���J�!�\'\n&}����\ZE�=��x<�23�D\ZAe��Q�=ĩ��y�����,�z\'K��������\'k��۷�ܽ{���z�\ZգG��o��6u���_���XY۱��,0z�:��(�g�C�Y���d��򒖼��f��%�<j\'�:����� �w��OX�<u޼y�-[v/岎g����;��\0�~�����}��-G?ɦI�d]��JO���K��\'����I<_�t7~ѢE�!��C����R:�Zl��y��ׇSJ������{�_�л�gQ�=��P\ZA����7����V�W�~խ��:��2�zؒ���s�N�2�f�ڱ�}��04i��9����xT_���,]�4���8U�H����a�\n�e�SE�U�:�mg>�\\k��o�C�C%�v\"�})��\0��V�:�:�%KD\"��D�z��K!��S�}��>ß���E�zn��&��[�o�뮻n�[o�5{ҤIY���\'l߾]��XtHe2�6�4��K<O>�d�?��S?���x��_]@?)\"�������z�\rɥ�C4�h\"��$�`����F��ncBѥV�Zj�/c`��ѯ����Y���iW���{S��o���AB^�W]u�Y��>���V�\"�^��sT���p�ރ�\Z�o��?�P��n�<��u?yO�_tT�\nf���:l|���5�^j����5k����FXK����}�Km�umo&uQ�����I�:�_��!�M��į���M�6�ڶm[��\\�g��Y��Eo^ l4�������ݎeo:�T�ӑT�Jmڴ�1s�̕{�)�º�t,�8p	DLd�\Z�*��H��:���$&�\ZV���\'�?��	&��>���k� ���6<��e>�v����\0�i���R4�ׯ�v}��Y�tл\Z�n/���222�gd�\\==���҇��f�[�p�%r�i��7BTɿcp��l]E��2z��_|��t����WIg2��^֗�r����O:�\0��EH>�����]˯�I�TG�\n�I��������z����Z�V��~N�T���{dǎ�h��_,����=տ�)��0�i)iM��BD/�;tN����D�����W�~��:��}�1\n,�bY��,�4����� ?R�7S��k���)�L	�|�<�N�Uv�����^�`�#XT�c���.aJ��J�ЧO�V�V�\ZLՖ:������Ł6����������U�D\n��g�}o\r�j�j�i.�-�T�ѻ���֭��tz�/��*M�o�Z�1��>Y��u�y,�].wS�^��\0���t��EF=�v%ѱگ�����9�=N�+ѱ�~�\Z��(Ɓ�[�h1�\\�rz�U���8u�����7��\'�t��A\"K&K�M����Δ�t���7�.�Aa��J�������B�/_.�������$o�6mj��F0��=����j2�o߾?rO��?:|�4����?�Y��ʁ���=,W\'�A\\���2y�c�p�7�j��n|�K��1�҉�J�G���y���ݓ�\'M�\0Y��_��N��s�֭گv�p�_|�ճ���/PW*�o,�>���-�d��x��5Ƭ��pӘ1c0`���&�����s.Pa\"�H����E&T�Ur	�u.U�9�[hD7����+�}E�Q����q$�����NM��j���V�J\'�Q����J��d^S�2w�ܗ;u�$�����L�=�S�S�ԠB��D�ơx4�|�٧�]���x���W\\q5�E�N;��;!wO���˳���͘kB���D�;==�z|-�?˱�SUg�������\"�����<_|qu�x��^��/�\ni?GZw��=\"Z&yB�&�}�<ho�\n<w=��>��%�\Z<�S��20h)JDX��K���?����F�EGEm�����]�9p�_ΓuN���ޓ��<,**��;�t{��ͧ=��#�.�a���Nw���ǣ�H�$����	5y�ǯ�:V��\"2\0L���}��.�$F�r%Y��AT�Й�B�]��s���C��)h �R�$���kb�\n�h	]Q��\Z�wb9�K��S�N-,*q���9��/�Q�ƨw�}���~�M��h+�����8��B@Y�����9�O�q}ݣ���n��5�!�5�kMx��c\Z�n�r�{g�^��{wA�h�;h�\"�z�Q��<\\똿M����|]+\r1ү��Ok^�L�g^z�q�^{�J��}7p�?��U-x�7~2��~�?\Z�^���^�x���>�)��a�����Kw�.����j�eL�F�/_E�����>�\\�\\Z�hGn|���|+�/u��8W�=��U��!�Io��F���}���~�1��ƣ����$q�?�j���u���~\"�F}���l�Y�k}א\0*�-��7����-��/稏L�\\�xLB՛�h\'��kd���*���9&eG/cܿ�r:\n~��W�X��q���C�uĨ>O�_\Z���Qk�ĉ=���;�g�رc�Ъ���8���&��t�k�4�t��*�|�Ie����\Z�G�(�ͥ!�E�ʢ�~�?�s-���\Z|d����EG����ᐭ�	���><l��L��lޥ�����rv@���(�{z�P��Q�$hWiJ2!h���E*��<s\r��5k�l���Oرc�16lȤ�h�t@����H\r�[S�� 4�s}��zR9�\0$90��ʟ�A�gI�%3�@Ɠ�T�~�[�ٯ���n����~����fl۶M?	���%�M�i��/E�����v	f����)�\'�<���Ԕ�Ԍ�~��A�Ν�,������\'��{���F4���~��9�A���s����ʙ��33}�8������V���6�/�L9�;=[�r� r�ၯ�|5��3�,�zy},i���Ǣ�w��i����z�/�{eff>�/����Q%�!�������>������g����+�.�+��=�w�����F��1��?��SO�k�X��H0���_U�̮US�i�^�/�k�Nˌiව8.�ח�/s[K���R�Li�KL\\̓�青�������TnxAu��_�����Twӓ/Q��T�\\9�zр��,�6����B؋��%H�ȗ��!�(�=�(r��G�Q�����`O��yX��9���G���,o���a��ܺ��.AVܮP��N:養����Q�oc|������m�i߾}�I<E�JVP����&��R戌����<��⋮^��ɌS\'�L_�%ڧ!�#諧���?���aΕ�n}�2V��ِ�\Z_�$�:*�Ȼﾻ4x֧�^��_f2��s�0ީ^��\'��F��\\��$c��Q��K2��\n�g/vڜ}:D��{�����D|�K��/_~�o�ԩS5i{��s�=��<����)��ȯ�\r��a�н�?���	�q#oTm6\0\0\0IDAT^Z�b��֭���@�ѳgϿ��_\'�$@���r�F\n#b�~vM֥�{�\0v��.\0�N�R��-7n��|{���l�S^��{<��Fġ���sV�l鲽�c^w22��о�}m��s�~�v��Ry|<Jk:�Rt>^\Z���F�>t���eS}i�ƗN�u��9�ޥ������~���\\�6o�<f�ڵ�y�}:Y�d)ت�� ţ�S�<p9p��C�A��W_�!:�V�*����5ɟ~v>y��M]��xw�nt�B���~~���1)~��bY��Ȉ��1Q1���w�T6:z����O�y�ĉ\Z�/r<�v�la��W�^��V�F�NH������E �C���4[?{=�e0:������)���wT�̦	��aM9��c�\"FG�_�*X�yZ�ou��ȣ�ܚ���L�_;u!��������X�_$\\��~�a�	@�S/�\'4�̘1�I� ݱ\\|�\03�z����:����9�3��>�I#b�Z��tp�@���3]�7��1j��?\\W��؊\'/r�QG����m)����Vj�O����ȳV\\N�X�3�#bp$u�$m\n�d2��٣G�~[�l��{��;�V�Ia\'J��2�%He�k�Y�fU�6��I\Z���z���kЗn�e�[�~$r3Ԯ4�(n�m�:u�t�b=��κ�����v���Ψ��S�z&��4q��gM����/G��M��2҄p���SԕU5kּ5�����͛�F?Mx�K(����ZDy�6[��\\���\0��\"�5��y̘1�R��[�������sƶ;���ӓ�V�P���U�p�IZϑn9�N=b��W�S9��F\"�0�<U�R��)��7�tSֱ�`�:q�G\ZJ��DϞ=����;j�F�ˣ��}ӦM��(��Q��?ц�z��\\�����/�/5��X^EE;���\"*Z{f0ݘq�d�<����t\ZsRG�M�������x/�9q։���_*��ͻw�<�a������μ���E($�_~uZ�y�b���t�>C_LJ�HB:�V\r0S���>^���+>��~(�ih)��T,�t���@��f�t;Nq���s�\"�-��<��s�������q*���YёQϦ�I;.�ٚ�^鸸��x\Ze��w�e������`wJ�:�o�_�IW�~]c 	-w��%B��y��8G���a�EaG)�ѥ`w���N;m��?��	i��& �@��e�i`]��K/��7�d2\0*�۩π��y��H�u�R�5�h0�����>�ްa�>`������98�W�;���_/\rժ��֑/��y��W�͙3眪U�^���:�F�����\r�)ϓh<�+��:�:s������vI&�u�=�n���~!�u��x$�IK�X���|���(0���X�����Z��F?�M�S��x~�KW�Z��)DV�.��������o��ݬY��=G���{�un�W�~���CZBw�\0�_�֭[���AyE����c�On��鴧g)�9���u�������&�q���[o`�#7�fF�)/�omh4ak -I��=�s�\\8lذfԿ����]|�V�z3�y�e��Z/��`G�S��c;�Ʃ�����~�\'�K0�n��ƽE覺4\n�V�kKb}фS�H�D��\n��m���\r>s��~w�yM0(��k���0�<��F��Z	گ���o6���/���JW��S�v ��\r\Z4x�9��[ĚK悍@��:�#�����ݏh\01Y/����<� �e���[�*���{Q��E207T���p|߬=w���;o���c�P�zN~]����4JYr4��1�\'�@ψh�sz�S<��n�ڵko�߿�|�{5S�N\'~\"��Qt:�X�>��k?4m:ޞ|BW\r�ʧ��.���_��Ǯ��{}��W�R��C��<^ou:joTL̴�ԛS��T^Z��+��$�y�Y��x�zO,�^��G���8�����r�tH�b���v�L���#>�n(��T�o߮N>���;/��\"Y\ZN�����&�=E_j��a��y�+.�}��-��q�$rm������KL�0�E�/�첻�W7<��C�}��S{�#H#��iD2����z�����>�6�e˖���;��W?Ax�z��<�_���	U����K$�g�G���t�b�ുg���Ǝ -Y����؈h�#\r����x�_��}�����Io�s�ҟ�/\"Z�=�r/Ò�V�����̙3�s����M5V�U�L�6���ɱw�y�2,�is�[�v�-VǑ�h�Ƀ}��vQ�Ui[Qw�u�\\Ƙ���ެ���de�4����]M�4�6#k֬�xU ?Ց�>��򺒴G���[���3Yy�`�zHR�ǧ*�Xv\"ݱ����p�\ro��x��]7n�~n��M����41���|��vP��P�話���(�����o�][Vu��O����G=�q�}��DN[�a�Vu���ɬz͠����;Ｌv�����!��@��%\"d��*��Yt.����U�Ty%�hD��{frZ����U#��\n��Z:���� ��i)G����o*��r���5N���#�d��c���zQ��y�\r6/��woc���<��iV��^KB�*�JWXK���ۖ�[���w�R=y\r��5�n͢���9.9*OI�ϛ�>=c�1���+{(�c��%���%�r��nL] �OM�8�!,c�ԠD��9����c�ז2j����?���~\Z�d��\re���z0��	��u`����>�AY�E:�w�����bŊG�p�a`ק�]�hǎ��Od��4�>}�(�����s��w4K�U˴-�N�������	$c�Fџ<��D�%R����yX�$R%^�timI�/�G�dr�6�?�&�t-5�{ 1c�V����ni\\O�D�}����Z�j1��QG5�AWM�7��>�v�:!��������w�}�}�w%��w^���I@��ѣ�Ҿ�3�{矎7��[�V��6��_��t��fӶ��~���<ƕ��J�7o޼��>����˗�K�z�G�F�\n+o��g��/}��7Wa���OuN�1NF�%�y�M�<Ye�1�e��>p��Y�\\��\\V�Uz����>8�䣏>���;v��k.P���H�=f̘Ϩ3�l��D�C��\n����j~! PD���/	U��⿡kj����\'��\0u��k�2-��DDDH~��ʲ�g�{a�G�&�:-I���	�3%�\"���A�wN�ՎϩፈL���g�h���	-��D�T���#�ט��d>K��9�)\rr�1i�I��8t��Z�K.ǘ3逥�D_?\0c �z�ء^8���}�ctw}����;vh��r��iK�;�N����)SF��d�9d6��n}��S	3���G�+�Q�g8~��4-�����/���/̜4i�d}1�hѢ�x�Nv���&��oR��EB8eH<A�\"+�N�\"�tt��F��$���=V>������n�R&�Ws�Q�v�40K%�K0	��ĭ�;����Oxj��}����� (/����΃��Q !7\n�,�/��9*�4ə����c<sB���CI�dA@�Y�Ӱ9TÓ���u49m\Z���\0��e��``��wsO��i\\��i�9?��/u��5��q�Q��2����������9�W_�?G\\� ;�}KW-�^#!Ugq<b2kKA,*���Łꦖ�6��o�m�t�R}�i�;�>b��A��!��h� 8!z�\n�\'���\'i�s�	�CW(;Y�<��)�>9�g���E_FD�Xۨ����ȭH���]�q�\Z��~��\n�7�|.�3��w~<���a��H�;X�B\\��\"Ϲ�б�˗���l��z�Wn -7>�=�Z\"���MY�l�aF����đw�Ν;�\"�O׭[���=ش�Ek��!`�}�tPS	��Ű�b�s���=�H\"�~��f���0T�T���CŅU�(J\'r����X.��J{�E@Jv&��^�;\0\0\0IDATҠ\r�7W�\\Yau][��T��b��%��������H�[��bQ��/l�Q�&\r餥5���?���~�����<�;�\n�\nˡ�Zu\0�w �EP��w�tɞ� �	qҗ̚�iw�X�ђ�D纮��G�ˍ ;E�t����!tM��A���Eפ����&�)���W�;�=xVd�*��Y}��]�`����|mUD9�{�Gف�s�i��6\r�D�s|���!��e���+\r◥�&����.O亦P˩9�� �o��u�\'dPYU�ed4���(���ǃYK�jԍɗ!��5#��?�t���t��Cq	�I���M�6}a����nE����)YT�B� D�*U��T�0i��Ⱥ�� _��/�{�� j�@�������.��|>�tB�ܥkº�N�Sy�(�{��-��K\"EjEf�>z���E&�u�B䒹��>��t__�ti}|3�Pz�O���+��2�)f�,�該r�	����Ĉ#F\\Q�L��g�ܹst\Z�!`E�@I#�\'DFD��dVNۓ�x=n��2�[Y3�̪A�(����III��5���n�p�X��q�,�)���H���陙={Fr���N�3t�̙�o�[N�H�\"�A|U�Ty�z�k��݃9�3k�,M�rx,��D6%:�|Q�B�&\"\"b�����w�@�~��o�(��t��&q�H\'�%�u�9a]Kc~}E�t(k��u�JG幇�m�ՄY�,&�[�S?@���}D��رC���V���\r\Z4�N�G�&���:��q��`����@b��\'��=l�{���\rC�(L�\Z߿�y�������H?喔��~垌t�U�<�N�UǑ������@ʡ��\0��3lذ� R�ӎK��p-h�m��G ���B(NMNM�9��u�ؓ����w#��WQgՇ����J���^v͚5CfϞ]��⤣�f:�^����#}`�rz��>��b?\"7\"7�����wH�&p��BXw�K�ki����{h���a�^���G|���M�G�I��0~a�.�C�;�^ԍ��/A��.�Ȩk�$o����p�BYi�g\r��رc,5FoM.T/\n~���!`\"�n/���^�N8�mc�������\Z�������_H��L2N�eƋ 6�Bj�Y��|Kyj��OX\"���;���՗�t����%ew�c�ٴ5�n��A\\��Ί�i�v>D�~t���g��y���c�V��R�A��N�V�\"d��\n\"�=J���d��H��@���l�y�6�?�n�f�sD?���ɂ�:�U����r���^�D~���IK?8pD�ۮ]�zS��Ã��(�������z��L�j�*f}��nM$�%�Q�Zx��{ ���b�E̿�X��3C��#�D��ILL�޲e��Ǯf��&\'\'���\r@�@�N��6��\\s����U .ɤ|e)���U��wB��r�V�Eϋ��\Z��dj�zmO#B!�)�B�ir�n��)y\Z�aÆ&]:wN����AL���?O����Ig:��$���S�j	�/�|6�m\"�H�V�-��8^�5�t_s�6���\r_��W�n�X�I���\ni��#�����ad\ni����@���2�B�d|�¹�-aE43����]|�ť��I�R\"�%B�^��� \"`Q�@��ȷ�z��wk�xD��@�\n��\0Nfq�Z�86WL�ܹsԛo��kU]T��4�\'�o��@�V������?B�759�\'��o��\n�Q�l�w�}Οk�lѢňc�9&?S��\0 ؎v�Z��>�)e&�&q\"�jg�RRRd���˘ �����������z��|��׶T��r���BD_���=�x�s��- �sM�\"���~�H&%%e�%��<Rt�q���.Y�dV���2�z�-��N!K�0�  �D3��-���v,�R�ǲv�a��q�7j��7WLHJJ�}��\'o��t�h�e�T_:�\\��*�ĵW�$���B4�p���Ȟ~9C�Ga9\rY�۶mۖڵk�<ꨣư����4w��\"�c3@H	{N@����s��Ȣ�v��X�D�^�γJq[n�^�h���t�	\'\\Ƴ�����C�hb��|\r!�z�\Z��].�Tj��udE��/�H��0ʙ;-#S��p�3�����w��S!���T��C�W�l�bY�T�qd]��f��e˖�7n�t��#��^мy�kB��Ch��B�iE���7f�{��~+V�Ї���if䄀�7�A �&$#2�_��y����;|x�_�̪�Dd9���ВbC�\n6��iӴ��]�aM����ץ�,[e���Z�lrO�b���U9�l;d[�n��M�6S�l>sG����\r6�ne�$ou��zn��&M��A2���G���z�Cs��!`���Q��o���܏ū>K�H	����[$�|����E>��ڶm[a�ԩ��\0]ƒ���q8v�Ǌ���-99�I.�C�ޟ�&�ŲF�ܹQ�F�\Z?~�d,`�w��}�����ѣ~P��\0������L�ne2�a�޽�M�>]�,٫B������@��	���3������lРA�3�Nf}:r/��ߓ5S_s�\Z|��?ʚɡ��\0j�/�ؐ%�iii����*�,��9����c}	��FB�E�Z�l��;�����S��?�|׉\'�X�:�\"-��&={��KYe��	�����0f̘չ����󪮅7B��m%8}_h�7��	\'��Y�pa_��;@0�THt���-��G8���nY�\r��y ��C��a�.%�)Swcv�X�o�pj�\\_�|�QHz�NI�w��Y�f}�5wy9v�ʕOT�\\���K��u�k�B���[}�3�[�nӇ��GCXcS�]­]��YX;}�V�t��{�z���c����r�6��R�,�\"\"�nR�ٳ�6,�ɜ���2���4����fL\"��~�Z��\"�a[�,�f@,y��ʗ/�����?V�n���s������	\n�X-��HHH�;�z;y�{��c�x��~))�X�����]7�B �f��Q��g�M�#/\r�p�_f<���`����ys������E��Y���P�������k�\Z_�*�{ku�:u�lذ�M�6�\\�T��������{�駟~�{�W�ss!�\0���-[�gB4!%%�T�\Z5��ܹs��?�)`�}mRQ(!��С�Pv�+e�����N4eũ	�-���+`�ѯ�$����)��/���š��@bbb����_\r�<\Zq�U�s�©=P����Sيd�vI�֭[?*S�L�N���ߦ4iҤ�6��\\�!���b�z�ڿ��kRSSwc�����_��JŞ\Z*s�Ü!��U+(V��L��d�%�}���|ݽt����ݼ���a\0۳�{c�_Y����L{ �UgϞ��l�y��d�\\�db�-�v$%%eND�8d-:�\Z5j�ν��{��e�9�O>�עE���n��#���3�9�����ϋ����N�\r���?�ES�6�\"�͆�\"ޒ5�1.9+n�C0��\'On�uk��t�1�<������s�	�� ���y�6mZ�8}�d���\ZQ(�X2�q}\n孁��yA�K����C��5mڴw�q�P��믿�4lذI�Z��p\\����+�_x�5cbb��/\ra5%�k�r���x1���p<sa�@�a�g��W��͐(O�fTrrr�I\r:�hȦ,^�-2��!F2�9Oݺu�Z�`����H%�t�tʂ�r�|����&�M \0��:t谩\\�r��v�mø6�o�W^yehBBK.��\"�pű�\n�b���K/di|4V�鋴�2�e��.\\�\'���3��~5\rk��=sŽzG�I�jɼ�A�%��S��{IC�{ِ��wb>e˖-�\0}ג%Kޢ/�$�P��F����n�\Z��dJ86w\0�eҤIkW�X����ߌ�K������/߉���8r�p-�m����k�X\Z\\[~�ᇏaI>����U�T��k�Bt��!`���:����\0ͮ��\n-��s�	��\0\0\0IDAT1�ٵk�Q��qqq��r����\\�\"�zW�e��!����`ٱ\r�1�9�s�Pe�e݌�|.�0�[�Dv��ON]�h�o���mN<��vX�?�[�*�?��M/^�_���\\^X�re����:���������=�ؗ�V��h֪U����%Jk�@X#��Xd��k�-����zٝ=���k����ې��Ɉ6A�9��wv�H�>��3�10��`N�@�\0���I��.�@8]��5�X��z����U�M�����ٳg�a�|��a;��2�L�W�ׯ�8$�\"�qGc崏�r�����.S�n݋�,)%%���9�w�CGqĕk׮�c�m[$�����ۆ�!P�(.D���oԃ`�cP���wK�c֚�����7����E��ҥK7�ԩ��Q�8�e�۶mkF�C�zRSS�	�H[�\rI�o���A�����g\r�?ܸq��eʔ�gb�{�aÆ]z��A���Ǚ���<��ɓ㯻�:͚5�t��i��k�d�ܵk�;�����ׯߵ�M��S��7�0E 䉦~�I�&�������;�K���\\����s]�e�%(o�~�N<��;aI\0�l�`��$�m�+�kP�Y��f�W[�D^���hrZ8�E�\n\'�঒���bU��ݻ�P�B?�կ*Ud��[n��AV\r����x�]w�ֹs��Ӗ,�{�瞊�{�>�f���ï��J?&B5���:�gܸq߃�9C� .]a	(��b��=�T�`7~������x,0W�ѻ�AL8�}��jo����?��i����iӦM��5k�;��~��I>����£��qX6�Y��f����˒�\r�a�ĵoY6������3l��%��y��^xp�̙})�� �߾�曵�\rvߘ1c�~��\'��t�I}Z�hq���\0���/����k������L��#�<O���ԩS���x�\r7L��͛7�~蕽��E�%I�0��ʜ!@¶+ FUv�h����?	�G@(k��a	s���I:�aY��]��j�\"Ms9 p�9�\\��K/����r����Ԣ��o�޽{9�&�ڵ�^,�m(�J��P�\\v�@x>�NK{����ʹ�I&i����ڵk���r��韽���S���իW�����d.��_}���_�Ʉot�\Z5\Z7h� �{a�Q�v��۷i�ܹ3�m�ޑ�N��y������_|��Z�j���_�e�usH]�\ZVT�2c�\Z.9L�0%�O��f�;�jժ�g�G5��b�x������Ӟ�\"!�Td��U��!�G��v����D�U��v����2d��ٳ���*��e����8u\'##Ӂpf��?��q�Q�/)))�:��Ъ(M\n�@Æ\rS�=�ܿV�Z�d��՝jau�[V�Xq�?�����~�׆�/_�n�R�*��Y�f�������k��)ϣ������b!�	�ʕ+[�B�c�<���+V��_���#6n�x	���={�4B���9��[u�g�+9�(���R�)����J6j�W�#���Z���.��X�^�������!��;�k�@^���b��U��C�0��!�����iL��!��(\'}1��Z�X::\"����<X:�T��q��mǷ��r��ṅH&b��E�T���e˖�X\"�e�2&}�G��D{ͤ�¦M���ܹs.ǳ;v��,e?�����=�Kѹ�СCO�\ZxV��K�.���|*n�A#?���2�U�z�M7�MJ�ѩE|||�N8a�&Q�f@*g���۷o�vZc����~v�f�T_��]\r6�s���T�t\r؆rɩV��R��P�H˖-�a���܃$��.�L���SRR�s������B`ܸq11�1��b��K���}Y�Fw��I��r��(B�����q11���Ș�s|�v���x�[N&��O	x��@4�K�|#�N%�}\"�L�~��O�d��8��3K�Xvou�W��*���D�)�0��L\r\Z4�U���׫W/�N�:=�֭ۆ%覯���e����Xk�,ת̘1�ǥ���Ud-%�s��)?}ΜJϽ��1\n�T���˧͜9��7��k���^xa?�zR<�{X\rY�N!�7Q�NB��U��nӦM�{ｷ)y�\r�~��c­���s���<�<?���-�CُD������:d�����0��=��DT�aEi� ���U��������Ǳ��C �{�i���g\\Jj�e1��3c��.X��GTQ�Ja��h�SRS��Dǔ��p2}*Fg-�=��]GtQ¡��#��V��<.\\���/�	a�����Ϳ}���کS���!L2�@8���������z�-���ܵ�^�L۶m\'vl�-m׾���7�|�u�&u��㠬Ҧm�A�%^�`��V�;&�z�C�ġ\n߶}ۑ��O|��ab�,���n�:!\"\"��]!����&Ǐt���~�i�t@n�駟�BBՇ	���9C�0�	�}]x�g����<d�Z��6m��m	Pq�B������ClI��A�ݻw?i]�r�a�k��ň��^)ii�����U�%RQ�6ou;�NMK�x����!��!::�9��h���XER9-6��(��<d^G��c����<���3�4a�8`ҤIwa�#>>�\'�;�;�GFFj�z.ᖳR��w\"	��99�\0��x<1}�FbGVF�N�����D���z�z<���{�\r�u������&L���O�M��\'N�8�GY�l��f:���x\n��`���a��+Dr���;/��/C(τl2~x��zsק$&&�\"E���T� �E.d �����nݺ-����������V�?��(:\"\"��H�w��=��T��DFD�N����i2ϩ\\E0�P��g�l��!���ҥ�n�Ν;/پ}�H�Kԝ\'i��+c��������Ozg�;̟7�����[0�~µ�o���ݯ�ym��?��j�*��:g��O�003.������c��	��So����X0���ݺu�\"]H�\\��\ZhD-��#��\rZ�����D�z��\'���jS�z\'S���O�ڳ�߳g�����ju����j��)S�A,�0x������0��b���w!~��C��U�\Zffd�x�g&��q<��9��{22�qM;��7K& �����_�g�L>w�6l�pS�F�64i���/�|M�ƍ�@�µ?�j�pm��������^�z�z���C&78;���#kh\nD3���_�^�cC�0�u&y��D�X�*T�p�4Ҭ�RZDTT��qbcc}��E\\�쀤���sV\'\0+�SK��O?��\Z,w����O�,��e�����;���.���wjTdT��t��Q�����=�W�MrG$U��dFQ�\"J[�U�5y�g\'���0�s�\rC�0B�\0�^��zj�-[������G?�Kw�<%%��\Z��r?�H$H��̱o��f�N�:\r^�b�؊+~t�y�NNN�ʽ���s���5I�����e�2+�d��8\'9%y����duG3��Lꊇ����!`���ѽȈf�j�b�����B�eX�T�R.Ʉ��q7׿F�dB!��`���x��������,Y�-`�Z1E0eŔOp����\neffNL��<��x�`:������z��d�%�޻u�����?�傻@�Wp�,C�0�͕󂖅\r}�E���0?�#��v_HIB||<����ܩW��5X5Ggddh�o�{%2CPsAF�}���HC��Z��6o�Y{?�C��[��.]�$!�2=����8,��fB�<��sa�2��М! ,\ZC ,�ڵ�E�,%���!�G�����K����ի������ZV\r��޽۵d��:��D����\'B¡�`\"���ɱ��!����ZJJʨ����_I����J�1qqqu�ЗIB-���/�d��oR��p\"�)�М!`5\"�&��!`����DStBw�$�Z�:������+�Β��Xд���(52�G&H~RR�N�Q\0\0\0IDAT̛n޼�i����H~O���k�.�B]�Z�U܋������˰���L�j�8N�\Z���S��G�� ��T¡9C��#���?6�0�pB�`��܉�T]�fMG�8���D�;����%��c��12At}�?jԨ�X1�����\'eI^M����>Y��s��SY����/���\\e��S!9���}�s}@$˨�+`�3���1C �Yz� 3����S����L��2m��.�����ąo������;wڽ{�M���SSS{�\\�{�֭EE,�BЃ�H�G��r���Ŋ��\Z��K����D\n�o�?�lC��Cs��!`��!PR(����4���b�1�L��Aq �_C6�׮]�#�<�L7\"��#�f͊�\\����+::Z��G�q��W�Z�\r׾BD.�u.�$DD�DuD�ʍK������鋐��8�SVQ	��C�0��!���q)pZLG�0�f4֭^H}K��k��1��/��Y�lY:�!;�$D��\\�nݺ����r�������?��cK�]��7A&�b	�ű�8��?�3�K����ܐ�H&@�3J�UC��0ސ�5r�\"X���h��e  �n۶����DEE9����*{!1�	Ap�K������Y\nx�?J:!y�<�g�G�C&��L###9u4y�\\���.��E���L�0g7�x\\*np���@h#�ב>��	\ZѼ��K����/�@<����yK�õ���X��=}�\\�0�EQ� �\r���Փ�qK�#!���}�������<ӆIBȥ6u�P����G��7\rk���I[�@�s�@qD ��Cq�c`t6J-�pF (D��+��\'�������t�9�)���]��\'�����/R�g.��|��g��gO�*U�!�~�q��<�Hc�\'w�I\'U��&��p��,�G=Z*�Q�?C`���0��k(o{���@�F w��O����y�8U�ьX�v����Dp��+q��9�q��m�e;�dUC\r��!Kq�ʕ+�di{#d��>ߵkWY�eeܿg� �s��2����,�d[פA�I�����������L�^���\\�0*�\\�؂�@�B x�_����5�\"P�Y�r�8,\\���6,_�!%\"#�\'Ӂ�dr���8���!���~��\n�f�$�l���-�dD�����~#�1�9��]Ls�M�L(K�ǭZ��7q�G�	�2M�����0���d�|>M\Zr?���1�<j���F��=g��!P\\(8��;z�4������D�Z�w�8�{|��{�� ����N.Ⱥ�g��\\t�E��6m�x����bcc�@,G^}��݈�#$ϮcǎG4lذ�_|1���z�D�C�/����>��@4a��r�����S��!`���!��@z�={��UwӦM�l{��Â�Z2!��+sג��Bbb��X�dH�\\Ef���珆�ߦM�����	o����Ŀ�t8ʥ�>}z�s�=���XE�A*�@\\�O��S��#s.w!\"�x�C�`����aWC�(�h�S�f�`�VK�.Ʉ�h�\\[�h�w\Z4h�1k֬�!����ǃy�2e����(R9f����q-_S^�ɓ\'�a���D�/ѹ.���=���f����Pu��!`�,e��.<;�Qta�I��/�MȆ�yj�`6Ï���D�{�:Ndd�R�!i.,�%�0������������۟����\r��q\n~�s{�UW}�y���::���NOOw\';��wj�(��9�;�X9�Ϛ3C X���JH��ͦ�Ă���o�O�r��C0����肔\'.˪�w2e�z�ҝ�#鈹�#�����C,�7C8#ʤ��da��lN��4ir��o������CX���(�W�m_�!K�D�����~V��@�3C�0���/�Ġ�9\ZKڍD�\'�5N]���K�m�8[��\"#\'%ؔ퉍����gy�\'(�9ލ�����%%%y�������H�:�\0a�Rv�f�2i��k����T����#q��!`��!*�h�g��Iff��Kw�\\�z��DD�c�I�\"111���)�WR뢧��ړ�|�_\'0��� g�<AB|�nݺ=x����͛7rو�� .�r%괕���yg�Di�s��!`�@(��]f��:���<�T��8N�R������4d.$s��ٳER85�_Pe�ȑ��4>�	��;��i$O��*#O�.]Nx��g��\"�$Ĳ9�c!�xN\ZV�O9��N���zꗄ�Ü!`��!`�\r�<ͪU��[�~�>�e�x�?�T�����4h��H&H�A֣ǎ�.>>��݌�X�#,#ZY���n���ZӧO+f����ʔ���H��3���k�\"me���yI���P��J5(BgI��!`�y\"�k׮m\n��\Z��>���m�� \"���\nu����)��v���E\\\\�,���?�$��-[�l���??955U?��E�}��^t���s���j��˝�4w��������_X�C�(rK\ni~^H����*���S.a���5kq��Gw���\\��M��=���#K�n.��䞤������7�t�ҝ��E,��bbb�bm��R��ds��SO=vܸq�m۶m$����FTf�)�L�r�,�Ʉhfr�8`�3C��?�7��!���y����flll��˗�_�n�$ϙ$�Mص�\r���fH�C���I��-��V�;4\"��G��G:�RRR�X { �Z����(m�^!!!���?��h���Z��$��=���&~cb��ks���M� X�FQ��?\'r�� aa�\Z��!P�ȉh����R�T���)vϞ=,lˬ�:.��`+DE��&&&�h\ZQ���Q�F�_tLL=��@<�xNn�l��3gV�ҥˠ]�v�`bp\"3�(\"���Xke��ֿ��\"+7�(j��.j==}��!�\rC��%��?���X0[��z�Ν;�p�}K�gb�%&#/5h�`[A?�!����ۣG���UJr���\0D����L2���Y�f��2��7�pC���T�o=�s!�m�އ��|]�RVL�Ĝ!`%[*(Y�]4�u	�I{ $�{��9��0mg���Ź�q������*Y��M��5.���.���v��U�0a�,��bcc����&\\s\"��k���V׶jӶmۑK����8��Dy�� ��.�`��ߣ����g�\0�%a�0��ih	��m�JИx(�y\Z��~���X3�df��E����s�R2o\"�q\0���~5Fd�Ss�E��+��a��ro��z��*p�OJ�����$\"���������?�\'{5V�ʐ�4���2�Oy޽{�n��\n\"SY�P��)��Ȧ9C�0C D(Ac�D�4�ĥD�a����=�r����/$h8��������\n�AF��s��7o޼�`~M�7�X�b���^��b楰4��\\&{�ގ,�ϱ�4���>w�� ���H�-��9C�0�	�O8���^���9�>}z˵� 9�@VZC8����T�� =c!,�s����=�~���>�ka�ԯ�l#V}���qb���<��k�|����X��5�������.�ܺ��Lz���N#�\0a�0J.�sB2<�{6-��}D�nڕ���y��̃�|��}7��B�Y/��2�i�;����7�|�˱��ሙ\'r|)�G����~��׮];Rڅ	��X4?br�ȱ�7��&��7��M�erN���!`��!P��#��HVE��/:?D�p�Tx�D�斚5k��H.av�\0�8�c����B��jYB��%��!�O^������\Z� b����ġ��*����0��v��p�\"���!`�(�#�%\n���l�֭3 �C$�C$\'3����`���,H�cX5BOm��\Z�ϗ_~)���c�JW �\"�\\2�P/���k�/&�j��3� `��@1E`���\0\0~IDAT��fܓO>���e͛7�DݱT�@=�s�������\'8��R6DItFDJb�[�\rC�(���r���GVz/V��dT���TJ�`H.�1C�0�\"F��f@�������*�mɻ8���h�C�b�-��~��ܖ��3\n��-y�\\=N�s�2l��b���ͼT8Y��h��-�! \n��Tr&yA ������\Z�����P/�`�gD3X�Z�ዀ���[��3C�0�G���#�y̂AG�,�y��\0�#`��!`m��ye�Mk`!Tߊ�*��O�YL�^�X�!��9��Fl,.�(��\0�\n\r,��c�\0�O��`��C�\0S�@4NK��\"`���[v��!`�@�\"`D3TK��*dl�]Ȁ��L]C�0�� `D3?��3��!`��!`9\"4��c�!��?����:��!`�#`/�쏇��A���^�샏�@�gኀ�+��5y̂�@���!@	�K�`�5�@8�(ˋ!`��!�{�hf�U�K�Y��H�0�^C�k��!`�#���͞2�@(L���2�!`/�h��2m\r��@�^��b0%C�y�h�|TA{�<�:D�1�\rC�G�h�c�Z�C�0B��(A�,A�mY5C�P�w+\nfK�(�i�Vq�LA�Ѣ6�℀�[Q�J�t-�Or���M�r*H��=��P���]C�0򆀅����LG�	���8��!�_l��\"Zϕ��:�J´1�� �;:���OX#�EPV�e]�������SpJrg]p�,C�0\n#����Z�5���\nX�@��H\0Ѣ(�����H��/B�h�pQ�lIa��M�®H-C��@h;\n)ӖL�!D3�Å�\"�]�p�!`92C�0�@�<h����&��R�2�%<@0g�@�GK\0��\"0�����-�ܲ���@�@�����d�@ͲB�B0�K�0C��(|�i+مU�٤c��\r8v�0C ��\" Y\'WD�p2�\"B�z�\"ޒ5��0�EN�}!`DS(Z�\Zђ���%��Ϲ�5C �.I1���b��1#��c7\rC�0�����|��g\n�KRJ�,����6C�(�ڮ%���,\Z�,�d*\Z��!�X��C�H�X�Qx!`D3���rc�@�(�����	��P�Ȣ-y����P���k%�h�Ou:����0��B�p��*�\\Y: P\"���e����%�h���D�a�0C �X\n��!�-%�hf���4C�0C 7�inP�/������մ�\"u�pv�0C�(��i��͈f�!��Wӌ��\\L�@Q�\0~(]�!`�\"��!<�h�B�9��o�f����z<��!`�@	A��f	)h�f`��C�?lE�?,��0�G����x�Yl�5vh�E�VT��(<,�E��f�L�j����\\�-�i��!`9 `D3�B�B�X��R��!`��!d�h࢈ޖ��uK�\ni1%���\Z�A /��R�%�0,T˒!�bJ��`3�h�3u\rC +vl��!����	�n��P8-2C�0C�8���\0�i��2�E�q����!`��!PX�\0�i��*��c�B�2C l(D3l��2f��!`�@H#P<�fHCj�a���q�X�YT5�-ۊ�,MC ���/r�\\�j��6�<썓�a[�1�e*[��F�eۡеk�B�p[I�r:�\Z���+M��ZkX��e&@i�p[f�2b�ቀ�������♇�J@Pk�%����\"eS�S*4�[��r0-C�P0�Y(0[\"�@IC��TI+�ȯe�(I�=��fI�T���D���!.�g�-W��!`�C���F4�W<�Կ��P@���!.���������*��0�#�aY��)C��c�9Bd�#��!Z���0m�\"@�L{E\0�%i�@�@��f�(f�dv�=3�Y0C�F4����j��!`�C��\n#�h�QaZVC�0J��K	*��U#�E\\v�Oq�K�C ���.(�co�V�4��,�y����<Cf�)FE\n^�����t/�Ў!t�^��f)����q����!P�)x���b�V��[Ix�dM�z���my,v��!`�@�$�6�\n�z|���l���%C����X��[��@�@<%�h\0���\"�F�M�g�\\;�)�\"˝��4^�.�*��na�T	\Z���:\\��2��@	\Z/JH�+�F4�����X��c���!`�EO4�F˄!`��!`����<� ��|>[�\r��!�U��xZ�C��0�YH�{<[�-$�-C \\�N#\\J��a�\\�h��-C�0C�0�0�y \"vn�@\"\n�衠C���\Z�@H `D�0��z��D��2�\n�PXFªP-3�@	@��farh�҅���e��!P�0kI�+�P؈f��P0��+~�t�#`�^�25��Zj%R�1�YJ�t�����\'�7����b<�v��\ZZ,�\\H)iu�h�Èf��o����m/(��|p(i5�HR��SI�3G,�1�,��!`��!0B�$���x\"`D�x��im��!`)�L��K|?�h���!�@�`�*S�0Ja��,Y��rk�	�X�	.l���vf8��I�¤�\0\0\0�����\0\0\0IDAT\0�6Y�u8��\0\0\0\0IEND�B`�','2026-02-06 15:53:52'),
(15,'coordinador',15,'�PNG\r\n\Z\n\0\0\0\rIHDR\0\0�\0\0w\0\0\0>�>\0\0\0IDATx����wqG#� ����b`�`���\n()�*!(��\r*�\"�b7`�m�n�΋_�?߅=���;�̻ٝ�y��;of���/��?C�0C�0C�0C�@5���!`l9��0�ʃ����.�$��!`��!`�+*��Y�5aC�0*�xܭt��U)�J��ЬRjf�5C �c>�ʤ�ߺ�/�RXE�-�?���a34+��X	C��r��|�r��ZJ���V㕥�fh���49C�0C��d��,�}�J����!`Y��B�8�@.��(\r��MU$C����K����!PR�FVI!i|C��:T5��H�fթ~+��!`�\rC�0C����24�����ٕ!P�^}�nY\Z�(c��Ьj˿e\\W�}UG��꫺X�\rC��pl��Y�Jk�n�0�,\rC�0�ʉ@^C���Y�eV*[�+3�-cC�0*V�� Pގ5�54�.(N}Z\\C�0�b\"`��̢�@��k�kh�0�0r#P>���Rٽ!P������KV���\n\\ɖθ��i:`�(}-Q0�33=�Pe;��K����\n\\ɖ.�[��0C��V��0J3=J����V��g��T�34����@�D�Jm�#lխU��R�0C��T�m����0AC�0J�J�m�pK24CsKP+�4��V*�\ZSC�0�r���r�\Z��fhns�-CC��:XI\rC�����Y���Jo��8�fP[F�@)#`/��rgh]t�i�@EB ��C�=+R���@�rX��0Cs�YC�0J�<ve>�g��T�\\��!`[���[�%4C�x�]Y<�,�!`T|��д3\n(���!`�@�A �nC�����U���Q(���%�ֺ�!�\r��C��4����8W*�nCy[�*C�2(�����L����1v�@�C�\Ztū3���#P�\"`Y�fhVu�,����0C�0*��]>34Ka�o��!`�������Y+�D6C�*!PV[~U	c+�!PZ��YZ�\Z���`�\0�����Y�2G�膦�|X�e��!`���!PtC�^>�j�a�-�y��mq懊���!Pu(��Yu1��� ��f^�d^n�l���V�	��tr@�$�@.�����\Z��!`B���B�(,���Y�,�!`��!`�@�0C��XY�*��m��xUCC�0�*���U��.���!ll�L(�����J^cnl�m���m�tɧ��a�[QE��#`��^�V>C�C�M�Su�ѭ��uI������knD��ȍ����{C�0C�H�ĵH0Y�*�@�\Z��Y��V޺��U;�]5��Jm�6fhn�6��\"�,�!`�5�_��gXt{`�������6C�0�m����o{���͂���ͯx�Ɇ�Wg&�!`%�@EY��\nÕ�%��bU�F�,�d\'�u��p���\"`�\r�ʂ@U���,am�\nJS;C�0C����CӖK@���!`�@i `CTi�j<�\n��8�Z�\rM[\",+}�|\rC�06��Q��k�\r��@�4ζ�C�,��<\rC�0C�0�\Z34�\ZBc���lC�0����[��+7E5C��T�	b��!`T$JW����-]��{~���*f��!`��!������\ZC��XLC�0C�*!`�fE�m��FE�5��0C��!`�2fh�2���޾�Q*�\ZSC�0C�(Y��,Y<�[@��d��J�䆀!`�@0C��@Y�ʃ���Xy��Jb��!�8�34�s�l��!`Tr�9�~]ɋm�3�fhV����\Z���UyA ������E>��0�34�?Km��!�����m���gl1E64�8Kh��!`�$��Y�h\Z/C�T0C�T�5憀!`�\Z��0�r���徊L@C�0C�0*&U�Ь�udR��!`��!P!0C�BV�	m�@�@�Ja�34+w�Z�C�(g�+��Bʭ8�+n�j�%��ł�<D6C����+����\"{I��+nEA���1C��ud���\"V��BJ`co�C`3ϫZ/e�f��=�hhV�V�5�l��A��Z���������D�z�m���U��hhV�V`gyӟ-���m*J��XX��!`e��FC�L�ނLm���,IUA���EU�����!��6J��eh�Ƶ�#PIV��\\TUWd+�!`�34�_��D�\Z�-\\)��bZ~��!`�@EC�͊Vc&�!`�@%Y�.����0\nD��C��,��b\"���b���t����0�2fhV�ڷ�EF��\"Ce\rC�0�0C3\n�0C�0C�l�l���Y�j��c��!`�@9A��rR&�!`l)���#PQ���o$\r��]?&]����?.j��!Pb�ߒ��P�2��,���J�-�����KC�0C��\\؏Y�m}��Y��[��/��Ƴt0!`TJ�Ь��Z�e�KU\\����ض�Xؕ!PT\\C�,в<\rC�0*�mZ����\n[���*��Y�+���T+�!`lۮ?�\"�,�!P����l��ЬڕZ�۬�0������\0ˢ\Z�@	#PI\r�F���cC�0�ʈ��\r���je�����,�!`�@�D��JegCKHcS�0C��W��0C�0����^*�T�d�6a�!P*��7~�mL\rC��#`�f�W���^8()$��!��maō�_��!�j���5ge�,���E5ik[�%2C`[!�������\n�*��&}��(�[|34�es��V�9�*�s��0*�MW�\n-��1}+����,\Z{`��!`e��e[I0C��T��0C�0���[]#v0c�!4%��q1C�0�fhnu���������!`����*|���i�=7C�0C��\n_E0C��X\Z���\"`�;ȳ5�YZC�(\r��,\rT��!`e���)�-KC��#���3Cs+�䆀!`���Yv�[Ά�!P��,\nJ^��=�!`l�Ry�dk���15�C�J�%�V�u�%�u��0����@ņ��@9@�|��\0�0C�0C�d��f�> �M���J�f�@�!`�C����B�04�@Urei�^�\0)��J�BK	)ck��!��(��T	�34KLόQ�#P	[hكjU�\"[U&+}�T�����uÞ\Z��!`TTJB�l!�~ƣ�#`�f�W�0C�0��A������r5�\rC�0C�(��&1C�@(�!`��!P�X��@�B���I��,_�g���!`��!Pi0C��T��G�|C�0C�(��Y>���0C�0*+V�*���U��襍@q�L��<�Ͽꕸ�1�C�����Y�k�d/���t����[o��\\�F�:���usS�&M�}�ٵ���j�x�D���/q	glJ�>� \\���п?��c���￩�b��37��@	#`��Z\"�Kѳ����!��hٲe݃:��5k�|����������m�ڵ�edd���o���裏>��>���;w���J.˧�!��?&q�}֭[��5k~�D\"�.���KE7z��W��}��Gx����=�Ʀ2U3��?{�M���Q��5��񱧛�ng�c@�\0q{�BT�uݔh4������u|�v��/t��u\0+���u��;q�����\'�ؑ	�̝ѿ�\r6$s�Ą\'��b��g��׿n�ȑW���_bh��\Z�\\v�fFU\r��6�4Cs��\rs)�^�����)�6��2ʪY�f����\0\0\0IDAT{�����Bt\'!!���A�a�_P�z���<��^`��1����?��ҥK{�wa��	�,����+�.���?g0 ����ʪs�Z([i�34���ɺr�Z��4�S�ٹ����v�u��12�g���Mő�����QV9G���rm�(б�n����ꫯ�fժU��I�Uu��L.�s=��\"tr$ao{���0J�2�^I\rͬ�� �,\r��A`Μ9	}��=����Qy4�z\"[����$��~ à� ���\\�#���6m���%K�LŠ��Vy-\'ۿP(�����?��ܦG����0��LTRC���ʤ�V��!����짟~:cr�������$e@w���+Gws��+�	��<chР�v����T��UǠtY]w��U�O�\0�����4�:m@0gTF�`hn\\\n����2�\r�?�x�nݺ�\0ޑ�\"w���^�ؚ�r����1@��:R�9C�TH^�lY��������;�	vXa�s��_�fCk!�\".��@eD��f1��ʈ��i�����cX\0V2�<��\'0�_Ǌ����cF0B_bu�?�B� 32�(�Lk�T�8o��Fm&:}�jĪ%��&�S�����~��f��Ks��!PYTւY��6_)�\n����R49--�b2He���@�����1=׮];\rd�: ձ\Z\\i���eޚx�=�\\b�.]���>�l~;���o���\r�\r�.��4g��@e.��������?���^N��cp_ɀ+��B1�O��\\�!Я_��V�\\��̐t��2Ïbdޏ>�O�Vԥ�\"n��@eG��|k�\r���̙3�v�i�N?��S�$�IZ\r�@ �����<e��ax��`�+y�/�E�{�����wu�aj)��!!!a\n:y?���`32Ü!P4*�	34�V��(7,\\�0i�С����S�\r���lV63b�أժU��V�<[E��s� P2X�&M:���o��A\'t1�	zOKK{#11�_FF��k��s}�`ˍLT\ZW2�W\Z8� �!��Za���Mzn���3�Mn!Kfls��	�|��\'�����wa3���ꍾaE��u��}\rk�vn�:@�+�LA�6�>0%%��ҥK�ƨ<��6�e�#���9+==}��C22Υ9�� a���r�l�s34E���`��`�K��0%�b�xh`?��sw]�j�Y$l��O�h����1:�:���e`�,A�*7e�g͚U����bL��xP��}��Q�_��|\Z�#�tQ:ɥ�ʄ�&;�2��R�������\"���\"ض&�^lC^Π~��p�7�ed>��ُ���\r�-��Υ�ʏ@�4�{�y��3w����Lt�#�r$aWA:�!]4#06:�kT5�fhV�*��VL\Z5j�#��c��A=�^F����Ǭ$]γP:�����-�ܒx�e��E���̬�q����9,��G��L�d��%�\0�C�| `+��L��`Ǚ<yr5�!��B�cT�<��\0/#s�����?�t\r�\\�3J�ѣGƏ�ڵkbh&3�q0.��8�r��AQH:�g��(�#%_���U�fh�a1�\r�!��/_�ߍ$&&j�R�+��s4�>����Ҝ!PzL�6�ӟ�9�+��E\'99�o��i�:Z�Ȕ�ɥ��A�Lm��)�q͆@�_34�U�]\Z�	����L��sŊC��+�Nzz:�e|}O��	�j���qi�(=jԨq���;������蠾����\rt�Zr�i:3�L��r-	�)���!�u���u�YjC`�lA�9s�$t����իWc�|G��@$Ѷ������a�2#̕��k�h�A9�=��A��&:����f��C��	��er-	�9�&�!�����Ԗ�0J�g�u�qIIIW`T�Ƞ������W�_$S�YI@0W���A�=���p&<G����u�\Z�����k�\\T.�L�1gl���w���-��R\Z%�\0��ۭ[��1&�`�hK��r�/	C�WCK�����\0D��v��#EYs���/�{z��Tl�\0��p��I�]�v\r���q\0����	 ����@q34��VX+���; �0��f`���5�/c5�z��t&3�A�tM#r�\nW�e˿X��J��R�Cƌs1�w��U�IO\Z�wA:��)�Z�4�\0!`�@C��\r��B\r�������\0�7ɻ���n\Z��)�(���eE����<���Y6�5��������Iz�*���.�w2��8�wң�F��!P�T�9M*H�����뮻���ŋ�`H��JfX�_��������\n(ʽ5S�0Wz�=�zjj��#зzLz�������.�_32!`�@C����0��\0#r�6�v�\Z�0aB����wepO&�+�«/�bH��T8��K��7��o<s͚5}C�PcMm�˨|ݼ���A 32��!`l347���0��\0�s�\r����\'>��g�]��,�$k�=�-�̔��\'�o$c����E�I\Zs�@�`%3���Ŋ�$n���.]�A���#ӊf\Z��𪖓^`��5�,��=0*%�����V(C�| ��^k�̙�0�b�o��_Z� ����9�5H�{����A\0]L�����$o�A�8z���Y���_�L+�UV����^�O�͜!P�0C�j׿���`PO\Z3f��d�G�����\\/�Zo�/�Z��\ra\0a�?J�j���!�0�Na��V��֤�7�\'W�^�1�ed�.�9C�(fh/�m��َ��˦0�>�Π���D��g��%e7�\r@�3��>�����՟��$��U�CMz�����t��n�\Z%�@04K&�a�]�vՊ�5���3��+��r=�\\��V��t`GsUm����#��.F\"�t�~3���gBe����J-�3@��\n7�2C��3g�@)4�s�=w��{�>�u� ���M�{�~�0��S�;r�����ի�7�L�\\VWq���=����0��a.K�;C��\";*ܼ��-�jKT%(�朐����\'���nݺn�J�ԕ�\n:���9�\'���ɥ9C���袋��w�}w��#YYo�����L&;z	mLZZ����IO�	a�\rC�J `�fŨ�IY\n+pE��bm}�(##���܃��ş�V��Z=�� ��1�\n�ȝ1c�1l��E�����̤�b��>��=a���`�0����fU�f����A�c�S�*+��;dȐz��z��lG���Y���	���Ov�,���i5e�X]��u0gΜ��ݻ����n6f�#�#��E����2]��;�Q10����)��Y��ٲ����o���8hР�S�L�3ò-�t�p8��7�E�;���Y�s��@�>}��s�9gΚ5k*��q(b��.����8r^��	�*ֵ�um�54�Z\"˿�\"������t$�իWx�ԩ���RV�vf5S������s$៍=ZF��[s�@� �����{o��G0�9]L$L�2��6����lF& ��Ļ�PYĪ���U�������]wݕ���p�F���\"���\n�0�}�k׮�M�&����C�[�na��ȡƦ�np�DYռ	���.���I�\nC�\n#ia�ڳ*����\'��YE�̊]������bX�`pߏ$}�H���a��E(:w�\\� qi�(=0\"k>��C1(�@�tS��<\n\r\'�fr^]u��m9�sɺ\n-|�Baܶ\0�m9O2Cs*ȒTa6St�@�N��NOO���B!� 1��	��M�a� ��\0Q�uY���Ν;���SO͉D\"�12�������	����h\\V-�j�kK�\n-|��a�3fh���1�*��v��?����0*=C�~\r�\0��|\n��B�v2|�~���{N��)v�\n��C�|HJV���sΩ��Ű�\0�A�ϑ��.�CK�-�Eҙ3�\r&H�E�>(���[?&YCଳΪ7�|��O+DWے����;	��L\r�\n�h��;�l\\�~}�%|�I\'�tQ�f\0\0\0IDAT����I�\Z-u�Ţ��7��Lٕ����vy��ٳ;1�9*)))E�&$$h��\n����w�����1W�(~���X�������^}���mg̘�|���4��E7��`\0����k%�V�\Z`d)Jfbb��322�!�X{�>}��瞧]z��.]z+�m�>禥����B�m��������t�޽ړO>�cCy�]�s���+������F�� �˅�iE.@��mŷ��_���zj۾}���ݻ��^�zݾbŊ�fhn+�|*-GuT�^x��ե�p��-����ζ�4.���vy���v��m�=���/&�����`H����o08�ڜ!����f͚uF�(V0ۄ�x�|&���stQ��E�EҘ3��F���MR�^�N��?���U�jժ�Fk��^D�9C��B^y����ih51}.��g�~�/�g�v�y皟|�IO��A�b6�Pq�}��sy}�� ��6g���W\\�<Nf%�:���t��(H$�	��;��V!bd%�@ǎk�����3�=���֭ӏA8�C�644+��0��3����i�f��}5������gں|�A]�]���4n���w��F�X��ja�z��B�^I�y䧗�𪴳��B�U�V�?��ӛXEؙɈ:�8����6\ZirR$]$�9G\Z��!P^xajrr����B�����zv%�pNfff�ا^@aLJ�Y�^.9�Se@\0�/غu��/~#pw�i���� ��4��ilK��,����.��dɒ��7�:yx���Q������Z�3�8���|��W3Y=8�޳�X���W@w@+�\"�\"q�U���X�3g�L�\\;A�&O����w�m��G��P5��mcߪ�{ｓ�f2f��8N����233Ӄ��,�u܆��6F��3J	@��#�l��>�rwo����ܿH����5�*��޾}�:?���u4�]�>���G����k��@�+�Ҝ!�8�;wǹ{\r[�G\'%%��K}|�����*{�u����r������=z�8���{6l�:t�޶m��?��F�N�* �|p\0cV��d�\Z�qJ�\"*�ƨ�	�B�2CS��@��k�hѢ�1(�B���ih�0{�ͽ�A�8jp/2׷�~�p\Z���	*[�j���~�J���1f�\n��\\e@`k�p�)�l��3�\\�ӡV�ٯGr?����iz�*,��}���yźu�HOO׷a�/~:t��G>����*l�*��5�{��6�V�LƮo�t�KG�~�Y�MP0g�N�:5y�����Ѥ�>�Ng�/��Q4��}��,��N��qP��7���G��)�!���w.�S���n�U5���l��ҥK�O<q\nzӃ��\r�����^D{e����錐1���r�-��o�}�ĉ�S�xBB�V�t�x̤I���8��mC\\V/����^�3�i��`��!��	ק�^@�\rP����l�(#��g�Z�?����vg[��v��)))�al>�X�u��5�_#�����Hu���Gi�Wrs��5kV����f0\0BUuٕJ�1b5��D��mJ�:_�����������\0����\0��0a?���J��}�T���;#(��&�x�1q���ř�f0��C�3��g4r��i�R�3C4��C`�=�H��㏻bX���C��q���42��fn�s��������odVx(�����2�j�Ս\\Wq6Wf�^R,3A�gϞ�x\'������%[�3�/hۭ~��9C�4������?���\r����?e�3\rQ�K��2B�#*�l�-�w������g��qP�땿-?oD���\n�\0\r)��/��d��v:��tt*E:���\\���.�r�QHH��?��I�@Z�� �L\Z,|��Pse�@9��w������%&$�C�cL�~D75\0?H��E\\�3*ӧOׇ�OY�v�X��������_Jiރ2 se�@:����W�B2���l\Z���lEs�г�*{n�f��_�n�(�\n�22103؟�0�EQހd���q��N<0*��(y(l�Z�ʇ����o��6~Æ\r�0,](}� |)��V�5\0K�*_�DU���Ժ쓒���	�D��b�}oW\0�N��7@���Iu�t��U�Y+��e3C37\"v_dfΜٴE�]x��.ӦM��,���W�3���\"3*�)���^{����df�u}110�ٽ��:�@\r���v%�g�1��8��w�}wybb➒����o���.&A��u�v�1cF*�G��?��}{ʷ\r�eQ�x�H�r��G%%%u��Lf�_��WI����	=,��M�0�&c�q�:u����vf|�\\�F�N�\Z5J�r��O9gΜ`�&M�]�v�;Ｓ�%�\\ҙT��7e,*K;N�Ulӑ1]#V^W���B*��~{��.������/��N��>����?��E��ޭ��Ӱ;찎_|��Xf��a\\X�TC�������#�gd�=����\\9G@I���[���z!�V3��j�\\�N>�J�+A�V��8���Q�}D�^�j^t�E��ߢ�dȐ!����g0~�O���r�� P4�L�h;��Ա���V�j�����Bڞ�~sY6n�ĉ�W]u�`v�x�����ѣǔ~����իwg�TWF�\Z��_�5	L�8p�mL�.�v,��C�9�R٠Sx�fh��=��A�%��@���qc�j�:_Y�|�m�/�ر��~��6��K��M�<y��_}8�F�i�z��J4\n����_�T������r�!M�~���0*/Fk��������	�$��!��m8\'rY;ʑ%+m(p�=�\\�Qqezzz�Z*+YO���-]�������/}��c����U���{�+V슎�/--Mo�L�Mǔ�J<f̘S�c :����s�ׯ_�V�{�������muX�f�\Z����M��k��p���k��+pR���|J���EA��͘�dZ>�hP�7o�y����H�O��D�����׋,۸Cp\ZZ֠�[�v�y皋/�ք>\n� ��q=4��G!�YgF&@�+]XYbd����2�UL�3���>�6��m��h(�R�䎑�\'��%�Mh����t�����2]�3vi߹��Ai򯨼��\ra5s?\n�=��]t\\F���l@/�T�1����h�5�8�|���+W�\\����X�L���{��ڙ16�1Hyiz����T��34��ͺ|T��vG�iӦ��/����5D�נ���`�7�R���+�,�ԩS�퐳(�\0:�$\Z�� ��b̅6t��}+���\"��\\F��>_r�%0�\r��(衾]�\r�C �驁�d����\0�r�ʋ1.���^dz��@��^n�mg�Vm\n�\"xp͚5w�V��ck֬H�/A�\0�\'P�O�:u�����INNއ�����u����p�(��������;�q���\Z�����M��ů4�\n����ª*��BY�Q2������E���~���$oO����`.��իW�OG�����©����\r��������M��5g�M�6M�w�}._��1��5m�MJJ�g��M�Ax99Wh#�	[�O>��r����F_S���#�|͗�ʦ�qi��\"�Z�^�6l�p<�n�?��3�U��L��S^��kw��t\0]t{���o�q�\rgEs\r�	C?��I�R1���o���0�ob��7D�#�Ñ�%��Wq�����RR���vv����]�@�!���J(��m�ܴ���tr��0���l`5�i.zs�cC��:>�0WE@ߎfP�\0m�N��q��W46�}�&ZQ��m�{���͟?eN�VQ��?���/��� Tf�j]Jbbbw���at[���/��2�z��K��T\\9/c\"ԋ��0�:���iȶ��|\"nK���ѣY���#�T��WG��&��S�m�qfhV��*KI�Q��Yq8�A�C�5�i���)>��v�D\"����=��Y#�5\"�e��10m%0̕>-[�����bE=@��\'���\\��B�N+\Z���r�-��g�>��ucMJHH�����b��L��9�g\0\0\0IDAT5W��l�6�����/]�4]XN�{����<�������[[1�u���\0=����a���\"fɻ&M�$�.HOKo�j�^����99y�-~�sfhV�*۶_~����c��e��^�1��\Z�\Zݶ��sÀ�ٰ(�����=��V����wr�%q��ҁ�2)*z���6�~�����������2�c�:\'���\n��hK��_~�\r�Y�P>��0c�ʤ�[ĥ�J��t�}���_a{o8TS(�~�B���T�ׂ��vZ;d���.F�Ә�O,-E�R�����W�]=,���=�~�6�|�_�����M4�\\��v�mgc`���}E�DLm�yFfi��ȧ�����!�)��	� �u~��H_�c�v.�c��#���^{��G}��7EO&85��Va��g%�����+�.jD��B��.X�`�g�y�zP�1�YS����*W�H%3��+\\Ƒ3��n;}������<�s�qM����e�Cֹs�C�͛wm�\0��@6����⥣�[�Q��_�O�c��U���	�F�3���Ϊ*_�ә�Y1�m�H���Z��7�_�!�����3�g2�3�<�ŗ_~y��:���#ʻ��$�O����B7p�`� ��;n���_w\rX��*���Noa?�`7�\",E��eWެ�֭[�����H;�Ἀ�P�mc}2\r��Ź�ޠ�r����֬Y�}�N[��Tz �l�QGU��_���7̗���1O�RoN�~��ѱh�c0Z���1~����ˊ��Ь�uWj��=:t�Yg5��	�2)==]�1�J�Ee� �V9:9-����ￏ��;�u\\wCuvc)���뻙�\Z�Icn�ȕʯ�\\���V+����_\'���T��޳\\f��G��Aϵk�.Cz\n�v�/S��(�_�\'�\\%D@���u~2}�-�~J�LJJ����̵��HDܖ�K|���.@��ȨNH��Rn{asvu��S��D#�� ��J���Q��U9CS5���Uja̓�ޚA)��\0�k�ˇN��_���ի��72��e�(����Zo�k�Dg�2	3#�̪V*Vf�oӌ�5�w��G뛭71�i�`̴��D�i���aZ��_;H��/R���1q���ثNeS�*�� \n�r2ƛ>�S�������g2��ְ^l�a)3]`a���G���X��@2��\\��\\Ճ		\'Gb�;�I	�2��mh��mV��R�͹�{��\n����\\�`��;;���\Z�@:�y�p?G]�b���\n�7lذ>ޭ��|f�)t.�=��>�����0����r���<��s�jCл�Lxv��16�Q��l-�g�dt���.����([��^���(�v�u��G��8��W�Jf;&C�s���.��(���W�X�� z�Z0HD��¶u�ڵ��?ܛ���5k��Y]HmQ���n��L�琤Ą��.�+�nb�B���\'��m���m^��*!y�վ�)�>=���׹�\Z@��#wxE�w�-[v\n�ڏ��l��H^��@�VaE_=������y��G{�{^?��~�J�ʔ.����\r��)W�0��AC10������o�T��_8��U`\Z�r9��W&�@����}���ՔIg��_����~`�С��&Mj��ae�*��ħ�~Z_遬�Z�JG��4>�]�tJ�_�j��NOKK�8#���v�w��#<|l�y\\1�d�J*���{�?��=/���#.���\\p�e�^z�,�_U�Z�A5j����u+��^��/qGc0��ٳg�]��zl�7�N��m��(�$f��Y��\'n))a��ɪ[[\n{���{a�6m�!�\Z��7ԪUk,��<��>� �x[�RIx1��#��]���;�od ������?y��v��!(a�����S��y7���w���Ν;>��S�P�u<u39G\"���I�.z&l:��]B\\\r�\Z��S�\'�7�p���f��f��J>�C��իW׳�>��޽{�ѩS�3(g����w�3gN2�o���>�y�QGu)��K=��s�5k�IFܶ�yq�H����3�8�9}�����P�1�DM���CW�w�yKy�!�ͻ���\'�a�/�h��v��R���B��?x򢗣��.<�S��<ˡ��ƍ�~�z��d*mJ�X،�͠|-7/Ai�R��7��s�95У]�#}��\\Ff���L���C��]�t9�ۚ�6����飮�ס�]Ku������EyS�3 �\'6��U�ѯ��\n���/S�G�8�9�>��z}�Cc��/m�x;Ѧ��/���7��q�]wu9r�����N�I��Kr~�����^�锖����@���K�m}OY�_*�!��.��u�m�UK��FJ�)ɩ��\'&%�\Zg�T�6�	8���b\nzT���\rM\'تU�v7�x㌇z������{�g�}��7�e�#g͚f�:�R$}3�Ԧcֹ��9�j%�x��v���x����w�}�4d���y��ې�bd��BΣ�Ӡ[_y�u�%,��<����>��1&�C�_���?��?���O>�R��\Z�4�7 v��/��`?�cK�_���@��ܗשS�#x�_�n�#<|�0g=�G�v\'q�v�a-J���0�3hB�SO�{�sБ{�����}���O>���<�Y��\'(?��9�����9�ˌ3� �>ӊ���JYn$��d��[9\\���(��;O]u�C��:At�Gtb��C��>]�pa��G|�������#�p7P��i#���=��z&C����#1�\\�t�I���ۉ��՛�����;V�������&�����s�+^^�J%��w�e����ϟ�}��w�y�x�z��/��y>���R��h=��cSG�qYni��:�裏��@u�}±����Qg!?�e�����`)t���v�����9��?��s*�5�>�+�4��/�b>��5��AO=��u0��s)�q�d޼z�꣈�|������%��d���52?���m۶��#��4}����gϾ�61��1�A������ȿ�m�1�����[��3v��\n��V��;��@o���0ʁ(z�:�:�8��[�YLt��W�t�G�^�x:�]�Y9�gGhU�(�0`&�ǒ��%_��իwB���;ӟ߯_?-�8�\"�]�E]Ne�J�?~�1�Z�nct�n|}xܟ�k�.N�i�>�B�)��v}������������˯���3.���Mɂ�-V��?��<W��2��W��a�i#��Ȫ�	-�Tr��ֈvp}��@0��z����3��:�ؼ����I���ׯ_�0�K/�l�\r��/^\\kk�P�;t谫�H��P\'�0�]ǫ�U��w�����,nh�ߚ�r��\\/P�x���mԨQ\nJu\Z���G�1�9�k��ؒ�N�`�u�]�zC���k�~	蟠��������]JBD\Z�[�Px=�׿���Kip���<Op݉0~���{`ӹ�q�`�ʁ!Ϸ�	�\r\ZT�}�����޻���=���\0�hI���9\Zew�A��V�i/�n��~��W_�iݺ�\ZGqdp��#�l�d��Z�t�VU�a�w��\'�@� ߺ4���\nj7◖bh�@�{�����H�Vb͑�\'��\nfg��u;B�}H���^��4H�����K�����C�Ӝ�26��O��K\Z����Ȕ1?u��ޯ���l�����zk����?�\ZC�Ah֢E����7/A��F%�مX�l���o����߾7n�5�x	ٿ�c�	�,>�w>�쳣�W�(�љ�y晱���k�Q/����Wtds��|OE�#��s+���6�������y�}��ȶ��)v;�����j�b�٤����S����n����fA20=��^^y�Y��,�g,mumU+�$u�\rrN���T���0��~w�{\' c�bW�(�����&׮]��5���`�\Z�\'^g�*�>�r���>�t�j�tT�<�\Z��2ai��S>��u�7Ըq������3P\r�����`�#���\0ۅ�?������D�s�\0\0\0IDATaff�G��\0��V�����ڎX=��K��W�Zu<�%���J�t�7RFM�Rb�X0���լf�L\Zs� 0|���y7-X��af�b���y��W_�Ţ�,����\r�צ�����qȐ!��tހ�<����%�j?��,��GG}�ᇿ�I\\\n ��K��o�C[}�:���ݑ�!���c���$Ƴ�������_��w��eA�;���1�~����2|�Td9#��n-1nlG��%3v΃d{Ԡ\r�@�i1M���U҆��}\\�ڵ\0�;V�X�����u��G�K���O;qgT ԗO\ZOg[ϣ�\rx��n�̙��F���N�fkS������7Q5�dd��-��O��H�@�鐟��>�I\nJ������㏩(��(aG�g;�\\G���#����3l�/�0�@F�G1��J�~I�%�>���i]�r�UWmO�=��~~�x�\0eW^��7��b�����+��5Hq����<�I����|�`DToڴiC�>��UVG^��ɷn0��`�����6=��+V��_@\'�?\"�\Zm*��)���4���Jz���$�w�|���[1c�c�+���\r�:0�-t�!��;=��h�j\r����Q=(cpH�Z���lm��E��Ч�\Zj5Rr�\"�K�O�&��d =��!]¥S��S+����I��3���u�v0XH��\'�I�m\r�O������ڵkw&�e�Q��6��ЃIl5N�h�z������~��Ge�G\0�i@�d�(<?r���zt0-��B��o��N^�|�pp�e�}��q-~.�r��\0���?�|l~̶&��_M��+\Z���Yz-�/$����F�#��R�����O�}�q9�N�;�S�������HmNmXFvW�v�є���� _��;��3��q�E�N�ٳg�_s\"��L��wr��}\r�\\G��h7���t�a��/tßX�8e�Je��;���^@���M�6��gO�์�(2KG�-������O��=r�9z���\'O�G=��n�����~D�n�����e�-�%3ќ���\'�MtST�\\.X7��E23��F=�\'3����Un�?�7x{\Ze\"Kv+N\'�\\��n��n��`V�h�iG������T�V�e��c��y耇/��8ƞ�dN�2E��;=�CH�kû�L��fgb�\r�0�1���@���l���{�N��C\'��5�����������Ib�\'�􍴣[����G��E�Ǒ����-�>k�M�-%1�Ky����5�!=t)���\'r�v頻24k辄(,���R(k\'p\Z\r�_�7|[Gm#H��L�g��/�爻#��s�j;^XQ��.�����O�Δ�6��u\\޵�1��.@�����\"�ֻb]�,1�خi��������Q��Ȟt��(�Z��=@C�8��᭗1$��dmt�Z6n@�T�^�������\0������<y�Ȳ���@u:�xJR��X$�5�\')�t4l���xYNr�n �K8!�g����tdE*ʅ�J!��Z������5��@�\r�ɳ��N�~x�G΋�s��\'rRS�Z�@�>�z|e��p�ҸV>�`��J�lJ��~\"\rt��\\��iA=9�Ƅ+�D�\r�<�:�B:��ls��$C����\'7P�] ��Z�YD�O?tb�k�fג+{�w3��ꇂ!m����+�V���4(�\Z@9��\ZS�vt(�=��_���E�`�8������#]x6\ZM?��̵t��@�g�����&��8C:u:!�V�E���V�L�E�u(��\n��F\"�)[��\r��۶i3x�5ל�O�V?2K���-����\\�Ց����$&&����\'�[�?�i���;��2e�=�n2r4(J�V#�v��S�P}^J�)��=���=i�2\\��i�����8\\s�4&Poq5~G1|��\";VN�*wmi������7Dj��?ɿ3zp!ᚌf�տ��H]ʷ�e����L_x/��D�k�P��x��(E�)`�f�vj޼y�K.��>��x��J*��z�{e��:Vr3��!g_f����e��\'(�P�g�}v�珿F��2`v9��F�<G݆�E���!��}�$�����-0��^\n���\0��]�;)�����D�{N=	�4t�c�x$FT�G����<�?�=�\\\"��1��~�}ԃt2	�^Tt2F~?�o&�s1�ʵ<И���j�W��n��=�?)%�KR���0V�F#�P%���m����R�~�oZ�ly��ׯ�����B��9e��b�O^������G�0�~�S�u���G劣{͑%1))ɡ�;�������R�`B�I1\'v@ )p=�j<��ʪv/ҵ�XX���%u�@�RW�n�kǸ:	���ڒ�CWT9���_�{�����O�p-9�-9�5�-c����ڵk�#�<���>�\n�����O�\"5[�ۇw��=`r+\rC����8��H�gm��\n��?�,�Evt\\��i��b�W)T�Ga��C��X�����i�pu�Ǔ�\r��[�:�|�/��Ts�[�v/z�9�G��{���G��b��;ĝ`22��\0�/v(��̳���8�e���r��\'ݣ,I�ewn��r��t:2�J��\0yI�c�_\\�vM\r�~G�����Z%����A.⸮􇋍A[�=�>a�X񺁲j�<���>�x|	�����oً�L��s�ܹx�����W��\r�Z�/�0^:FQC�τ�\ZԫD�>q[���Ccǎ�Bz���Y���(\Z���j�l\Z�h�wz��*9�ǋS��k�M��u�ҥ�)�<�����Җ��P���Y�ym�k���Y?|��s�� ۟�M�&Qࣘ�\rIHL���	\'�z���e�H߅�l�=� ���4Ӄ`0X�*����|��Ԇ\r��x:�I�����]�\r����{\'�Z�~fQ��pՍ��^T�Տ#��Ud�#�\"�HC�B���3���\'�֭��@��/䗻�<����c�w�ҥ���� ���;3����\n�1�2�\'���pQ����I2��dFν(�۔W���«&����<���Q�(�_v���n��z{�m{ʟ?�8<n\"/�\Z��r#�O�<�����΃���ǥ׿I^����f�@7E���>���p(�8��&�ϐ���z؈?A�c>�tD�}����w=��\n��\n�2�|���֛8q��ԣ&�i;�ĜWP�|-F��������J����^ؑ4�����������ݿ^Cy�4����Q~blM�\r��z�ꎴ�w�ql �v��us׬\\��:�\nf�Uk֜��TmZ88��)����?O}��w���ɲ��\'���e�C������O�;��b���:�ک����o��,�(����;ʋvSR+�\Z�O\r���h���u��YI�M�ˏq!��\\01�xd4QV��P\'\"�S��^���iݺ�vԣV�{�kr��lt�xRR�W��k᯳�Z���l��!���l\\s_\n��a�O:�&�(�h\nО�$L!7>t�ߨP��[}��P��	vT���Q���l�P������H;0���E�N����@\'/�gy%��g�U��a��8������%6��HŠ��ۖ���C� �-���t>K+���;��������B�nؐ�������8$/؍3�>\nvex�n��e�L�-����<4��D�TH��Z����~���I��I}��8\Z���hT��`�F%^������q��KeCov�]�$Y����7��ى�N�YG񂇌��σ�>�������޼7n�n�	/m���z�Î�:�ا�b���7�I�|]�	�Ç_}ͳ�>��E��պ���d���\"?�����~		��33c�v��1�z&r��.+b�]�r�ʗV�X�(�\n_���a������}�E���`����o�;�c��߿����W/�t�͇i�/���wh�WeddL\"�/H2e\'��V����CtE;#��WovN����,�p�UF�A<7[ϔݥ�耱y��}�_O�C��W��\"�����������[�k�s8�����+[Z�������\"��E�{:��b�!����a��~���7a2v%q���ĢQ�ZrJ�Zr��(�d�@��8aB4��Y�\\���|�\0\0\0IDAT�\"�\"/�f���O=!N��6}�7ܔD��h��Q�Vj ���#lڥ�G����G�������I���{�f����We�&^F��V�c$�\".�u����H��/�!ϧ>6p�4�??\rR}�<�������H���#�\"�������P��x��\Z5\n�OO?\"�:�7�[�)��+g�{�V}}?7s���3:Q�ޱ\'ړ����6{_�N�\Z����B�X�|�ʩt*�H�H\n����I�c:�@q����u0!tzF$c.�v\Z\"���W$���h�X,��u\\������_\0���-�8��/���XeK?���pn�n�l\0��m]1b{K�n6\Zg�C=�<V2�PA�R8�!��q�N!��f���ٍ:�,�q����c\0������C�a���ޙ����\\�8�5p\Zi\'�\\�����@F��x9 � ӫh$�uI��\'At��G$��E�I�ƢGE#QʫPb��F����<����i<����}��S3�k��)�fy�2|8)��E~� Jt���k����j�>ѣ���\'�\\C�3e���SO}�G�������Χv ���lO��n	�b���S75<��n�zM����\"�ŭ#ݘ��:C���H6����2*�/��PB�` x +ԇ��뒇V���z�Go-j]�hQ$>╇t�������xF\r:L�㤧g�����F��\n]���������wCB�\'cc����w`s�h�ѦT6t���.?-��t���L��(N�q�ƻ>��S�«)F��<���|��I������V\\\\�Dtvқ킙�z���T���k\'���/���6��)�3&��5���4�B:��ns˧p��=	~��ת��G�{�$LFʽ����ɄI�_�ȗ�7���!��?�x|\0��\"Kn�\r�鐾&���?�,�\"�A���Nuvz}�ZGt��́w:2.�����6�p��\"߀��Ԏ:蠓�x��q�h�/z�#m)\0i�t�Wnذ��u�]C\r�jC�K��ģ,�g.:V��o�aÆY<�N�¹�߱U��v�=�\r�O�ߎ���C���W�z���ު�9\"��oh1	�+�9p�x��W��Oe�r��`�!l�뺏�i,��~aw\\/J�?�w�n�݅KH���^&h:��5����7��^��R;,�5h��$��Ȳ��B�?JLH�2mժ�j֬�����\\p�\'�$ߗ��9\"�a�ړ$���/_�8��#���%����j���F���f�{���k���[GO��e��x�&�ɨO�_��o�z�kT�͈��D��al���L�dH	��M�&E��qb�]PfŊ���V:�J��4i��T&�Pސ\"��+��)������kb�%�%��J���g��3�o���>U�թ��Le�[K���Mn�@�Yつ�:Y��D�\\�\0�AH[�MP��Y�׹Ea���9%	��2����/n��LCԬD�������T��=� �(��\r��R�f��n@�!�bN�t��׫W�0VJ_�v�h\"��k)]��[�_#�6�V���8)���q��,\"�HN�ţ,`{\r����:u�Ȗ���z�	\'<J}�L��+{>~��K�To�z�ov΄keYqE�xݮ]��y��w���ɃVu����ĩ/���Q��`-�N��|��O\n���b���Xt{�M\\�2n�бޏ�&�xKwď�ͻ�w�}��o��^d9E\rU)|c�G:����\0�����S��ԬY�n��;�8�g���r�_c��i��lJ�b<^�����I�fddދi0P[	V�V�#��>��߆r�dO�{e�x��Pږ~��ʑ�LL�=h���Q�\"��lٲ���o���n��IBmE������z��|2���\'(_\'9\\�w6�N�yF�t>�<¼�o��^�eϥ�j��+ʗ�@��Ro&���~}T[�%fddxm��]CY����H<%���I^�~�p�c2��o\n����d�ou�[��z�ӳ�>��[o�u�3鏼s�ȩ��xJR�����|���O���9�-�nr�	�Cg#_}�H;*j+�uZ�hQcɒ%g��W�É����ZQ6b�t>��\"��!��\Z#Z(z�6��(xi���n�A ���vF�^\nX�~�g�s�:��W7���B^!٨aÆM_{��i��\Z�&���_�6{r=��8H�E�u�>;כ1��k�O�E���더\Z)��^��A��ݰ;uŲ��h2�������v�|�bC]d����c����RSS[��vE����Z�P�S�D��cFۯ��Z���?y�(G\Z��r���֮^��4�iR������?jN�������3#���/\"�d���25�P��\n$�Æ\r����߄�{�� ��)��?G��Z;*�E�p=/R��*�T��\0�=��Cu:������\Z��v�X\n��UJ&cH���������Q���ΐ�ͯ�(�B[U����u�E�ț��9��Fq������KÌ��/�!��|�D\Z8|>�<H�:�;Rg�r��`w�-�$��e˖�X��u����ĄkP�*�p9	.��Nv������4�Ȉ�h�ʕ�b�^yu��_��;�`�=�ر�>�����O���f1����F�A�E\n��% �ۡC��~��Αi�!8����:�m����u$x�:R���k��2_���`\"�Gl F��\0�\"�oЅ��hr����Gԍ�W�^Ϳ��)t�z�(��^\'O����_�����K�Vǥ���9����\r^�t�8�k_}����N��t9\"g�Q:\r8G��UP50��6q���O�{iw_\"�����/gn�ҹ	tjKZQl	�2�ԑ�(RT���(o��%��~��w�#C\'�i��,�%�]acz���q�9������*�:u���[�N����G]xk�V|=yI�u<_u��\n�!�m��ˉ�O�T��wv�>B��z��O�T���:�̅�%���L�j?a\0��:�+eW�ACm_�$+Ɋ�3�`����)\Z�Gxx}\n�N8�4��v:�>C��\\z}���_�z;^ү|��Z�-�����{}��ΕW^y�}G�*��r��}���]q\'�+�ꭲ���(�^�T��ǽ���\rK�N�1ԅ����*6u��^�/:��ɦ�U�,_Q��_��^mi�ɤϊ�t�p�A�M}Ɋ��B��=Q��1��o���3LV~�Y����u�ժ����1p��\r��8~_W���F�S�����Dܠt\\c�ʫ8E�=�1�������e@4y��Lf��\Z��2H;��\Z?3	�_�_#ƺ;�Tǡ�N��U���)q\"]�4��:nXc��>�5�r����9s�i��1f��vM�E�P�(}�������յ�� ���D(��\\\0BF�뮻�pV�fR\0}���<6�Բ�>a����%_�������E �E}+K�{o4L�����n���Fi���P�i4&}��4��h0\"��\n^��QG��9�\"��g��=���)��i6t��ϡҴ����}�nt���n�;hР�ɿ��M \r��,(r��e(�\ZjoR�%�#�\"�$�\"�xN�EI�{ �^��d訃W�W��D��Aw$y��:ꨞ�?����ţ�NEit�t:4�u��	�\n�3��^+�\Z���}VsS0n۲�9���~�C�\r�J�\n̾�n\0m���h��H�%:�F���S2cѝ(�f)Q��3~2�?��xy�����jp�]w\r����v����tZ�ᩭ����Y{��s�/��̊f�/��RߘS</B�N�v\"�ۨ�0ҹ\Zu�q����s��=�uԔ)S�y(]A�U�ƁgxzFZ�مԑ)�4�,�B�C�E��/^\\���=1����0���K y���#�I�/\'a$�P��4a�������৲9�\'�U�+Mv.%����z (���/N=�ԝ1į@6��xx9h��4���O��24ŋ�q�-T�M�UGg���3~@a$� �/ۅ��OQ���p?���������w��ǀ���:3�����N`�T������u��t�so�G;/c�k�ɈS\0\0\0IDAT^�|a��*�Q�s���_�ȞP:��~�6:��y����	�eF�M���j��N��e����m�s]e}_���=^�ꌢ�*:蔎��E{�}�����ė��l�	k�.v���w��h#�R��ґ���1��� ~�A�f5j�ƂN&�\'�5kܟ��V�\r��2�.�.�\'�		�ūW�|��hQ#��\\�)�ާ8?	]�?�D�-4m��v��i�ڵk�G�� �ڞ҉���E�S����t���fA�?��~�����U�g�|�\0�dr\nM�k4�JP�rd�mǩ���z�q��x�;�u���,Ɲ\nf\r)���C�k��)�����!���X$bo��:�-I����3f����:S���::��GF�dt�QR�T@]��2pN�ÿ	e}�������4�{x.%�ˑNi���P�)�G�x�����Z�Tx�%�_����2%ˉ�΀5c$>)1)IgLe�r�,Y�uA����p�e���*��PV��-]s��3m���Zga����O;��D�,M�6M�����3&##�Yʤ�{�)�<�^�:�.��\n��fd��\n�>i��|�r:Ԇ�`�o|�^�(U�ն�CC�2w��p�����K3��Α�Lo�ytvR�����?��j1x\n�\nwիW��\0~	uOCu�0��X��^��>���Ѯ]���\\8C�2�޸q�z!W�(�F���\'L4�Й���2���	0QV2��o<���(G��o��9��4��6����`�����˄��S�A;嗻N�T�\'��;%\Z�e��e�s��?C��p��pw��G7jӦ��ht��b�ud�:6�)̾��C�	�0*r=�����@Ǐq����+��~��qՉx��ߋ����ѣCP�\'�x�.x\\Mݦ���3���	|��\"�U�<FQ��4+x������ �^P�g�t^R���I��Q\n�/���[�n���7ޘC}���{#�w�M��u,�=):]$]z)~�77)<?�:� �]/oi�G�^~v\n��>cӋ>�����^}��<O|0	r��m�mɤ�̌���k��O�ʈx�2\r��&I\ZX���Y�p�g�I۞�f�\ZƵV�]|a�M��k�dj�7�� ]ҋ:Mп��}�U���>�������D�4�O��h;��&$���N_�f���P8�����R���4�����uk�]\r��\"�SS��p7z��\01�����n��Gԧd`g�^��j[���}��7�>�#��IWI�[azU��i�-D>^�@\Z�x���<�/W?��$LG��O����y�^���1cG��M�Q+�jB��z��.�)L�5	�ː��ÿI�&5��Px$mT�gwP� �{Ե�t�O��O�-	��S�;�Ad�1]��n`^���,`:3\"#J��y�LS����GC�D9�u��4�%�FC�gJ�\r�m#�i.�2zfdd4\"o�a��\'�������[پ�E�l��,(Ċ_��O>�+C��W������>�r�Bg��:w%y<�ׯ�m3���~Z��\\yKi$�0Яc� l:�����!��xq���+kN�peM�\Z�����όD2�ef�t6�bҘ��9�軏\'t�i���\Z�&#�[����ާj�}�O�T��\0_\\U�\r�`XF��Wj#wz���z��U��{�=^z�F/����݈��u�r�\\\ZŭԹtF�����J3g�L�N\"��ˈ�:�[B�e�7�`�;wn�x��ӧ��7߬-^:ˀ޶W��h�tD�N۟��\r�+�2����wu���N8A�������W���\"�5I8���+�T�/P�)�og�w-���I\'5�R|�e�]��g�r�J���ਖ਼�H���s�V��Bn��\ri���]�.]R^~��h���O/x�N���!�O�x\"��ҋ�}�$R�BI�0a�h��8zJ#��eR�o�_�>��\'\\�:��mN�	_�u��*�N����EB)�Ȩtop=��F�Yԩ3fƋdd��;vl\'��ȼ��3⿜g:r/+&��E�_�g�%M��ﾮ���f���B	�I�P�f��!���ʑ���`\0Ӛ��D�?~|md����V�$����5�K�\'t$>�I��<�.�xx����Ϯ�Ν%�\"��dd��B_	�yqMZ�JHt`���ѣ���ӯ�.΀����W��:0X�ƍ(�f:�%�t�M��ۃ�i}��񶔰;ѩ�W���/�S�9�>d)��ˤ��!-��P8��HF���p�M,\Zm���~ӆu4F�NŷHmH9R&�K}�p�7y�/e׮�/��?�S6��D�M�^:�\"9�߅��)��[/��mE�m׋��{V��w����9��J<�t����&3�]�E���hBA2ǯ\'�<�U�N���z��~ĕ;�л����.\'�(�q\n�����i®����C}%���+���\"h���@ 0��\n�IJAT(�r�����{u�nY�O@��s��L�q�d`J���?��E22��<n�K��KGiu����@Z��Uz�/r6����-x���O�j��A���^�r���v{zz�!��\r��ylJ���D��} �UGJC�F\r[�|O�V5���+�H��Eq���}�ĉw�{�t�鯼��������u�Ҟ�FjV\\Q���i@����;�y*�S���Ƨ���>� ��b���2�~�Yp�Y�JO�#�y��a�Y��qnm)��|�S��ʠ�Z��:�::�MA�{�%0|�����2kK٫s��(����8����9s$c�������w�}��V���g=E�~�>G���O���(��!���`�U������\r����q�#$\'�O�BۅB�o��P�{����c �����~F�!�>;ҋ�;���P�V�)����#ښ*�����9�jO?�����^�����q=��խ�\\����:\\��U;��;N@6�ΫQ�^݊7�#�)�:`�R��A��u��ď����#��g з`�sK���aX���C�M����p�+��R��T�n��c�ڵku.���5X���,\"n�����;ȝ��\Z���w�q-���x뼸p���(�?�t/\"j�e���UÆMw���1��]u�U�G�9���?���O���wa&�G3���۷���(���ć��ꫯ�˖�(�S�oW|�T����vt^�=ztܻ���9�Z��w�0ڨ�=�Z�x<���v�����&X���hy�Œ���<H��1HoWg��K�v�x�x퓋�������t��O��y�T�V��P 0��sʺ�k�!I��ϩ/?����#��3�����>�>8��d)LGꤤ��DG�1�!�SX|ǁ#}��\\C8q�Q��I�����8�g̘q:��!�p������҆&�~a�Q=_���!�ꗵ��`�aA��q�S��|��8�I�/�d�ń-O�R~1�F����6q�24���ɓ\'��v�0�)��)�*�\n�*��\\������\n��Y�l�B��&XB�Y(YO�Cg=�J�O5i6����pQ^K�W���D�s�9o[�+-��-:-_+�4��}���Q���`�J�?#�ĺ��JR��SQ�oI\'ǣ<���[r7���?g� ��ȧ�=�(���0��L�O�Hӵ*^��8�d)��rK�իWk�쬴�tms�8���)�����xH���MLt��B��8�{12_l֬Y��({\\��x52B����V����������-��tJV�d�)�\"�)�>��T�A��F\r��(���k�F+�ZA���L��6��������x�3B\'�Z���eN��F]��Y02c|�A��x�N�F�\Z���٠F����TV�dU�}_a��E���Һm۶c{���N�:�\Z�G��V\"���SF���/�� �>o��I�G\'�\n^s�������ѿ֪��mq+�ԉ�\'/�\Z���l��A�~x��^K�u��.��OdQ����[�ҧ�dju��x��͗�s8Va��͛7�F�\Z㑭)�y�G���x����u�*��Jn]���߼���(�m`�?z�Q;\0\0\0IDATe�=��pXq^�j�e�tJ����|���|�Y�|�^�j%ފ�)#S�e�Q�-Z���<��}ꩧ&#�Ht� ���&�E8��G�����\'([a!��������������A�Z1Ӥ�	̴���w����tŊ+�B�k��S�\nKE���ե��|��7��������\Z���Wn�	��G�	�G2�qU$�	������\0�q0�>Og�*{�����	/E+�Z�N&���\"0~y���_iiic�{�Q���m�O���ߟ\'���7�8��K\r���PBR¨j����G�O�!�T]�HV4G��-ߩ����^\"���v����-7�\\��a=�v��Nk�V}[���(��N���r���zc��3ڲ~�k���N��X�>�qr�h����MԦM�F������L�l�H��:���R��p�]dP�XJ�� ,E��t|pڥ�G茩��u]��i��m੝e��/vJ�_���[o�u K�=��ק\0YIQ:\r2��H*Y�T\ZU����ۂ]���u>D�t^%�x,�_�@��\ZDU\"��ݩXU�¸��>��\0�t��^B��Mɒ�|�b;��v�h�ʱ?D�IIN���h<~^��sOQ�A�?�J�n�z��	�𤎢��<t�(��Q�s�ey�,���O��E<rV:��~��-8ǍF�(�������(\"i���%��l������Gq�;��,hԨ��lQr\\����)�h�5�k�܋��q�~6�I<=�D�x�\r���G2�׽O���`�I��_6��CЍ�43��X�䐾i��+�����~(2_�;c5(?N���Z\'�яhU*�\nu���s�=w�e˖M��o�|~gGޏ!�:�B�B��י������_@�\'���_��nݺ)��� �+����0��9�όɘ�?�?a:�;�<~�����&,�}�������O����7QQ�	���8���+���N�z��W��3�2�hI��7�����~��RV��r���ᩭP�G���T��G�<�Up�p7�I��1vxzq�Q�%�.ב�>Ʈ� ��Ķs�λ �m��%Xz��oХ1���Ԡ�U�[�����g���\r�u:���J)����,�ъ�&f��-e�����p�oLy�	��:�%y���Ӌ[*����u-l<b\0���K/ϊD2�q	d�~ǩ���9���܊�N/\n�~:?-����_���ߡ?m����m!oxx����X<~]̉�Q�;_^���U�?.FJ�ѢI5�]E������Ǭc�;R��\n��c�}��=	?}t����{�^��N��H��%3�+^�:v1(�\"�^��u��^�����eᄄ���3�ܰn���|8h�J��.�-�C�}�[�MOO?���KH���=��F_�9�v�m�\0��%�|���PQdPw$߽�WǓ���V\"�=�)��ܤ/��\r�G��8j�T��$�� �)�K��d��ŷS���������S����|����^�P����e�]V���a�	�����W�ȞƵ��q�?q��|y�ǭ�����d��t�gRza����N�_*W+�$��(��� �|<�\'��{��ш4#����\"����\\�~��1��Չj5H@K6��S�/?���уn ��|.�Ec1��Ѷ�҈w�?\"<\\\\u�6e6�=��r�	�Vx������::��@�/9D�+�+�&�\'���1�00��X�ѡf�]�=����9II�N5jT{~<蠃�f���=��Oa�a���(�wΎ|�9�B3��N��)���O�\"/���&�Z}��]��H\0y+���]��k�՚֢E�Ϥ��B��r�_�r���?�z��p\\w}��t,36�Y�h��1;N�>��S��={�4x{���C3Ӿԫ:5Vɩ:o=�}�<0ԃ�D�ΐV�������q�<\n��#���kZжҠ[��G�=����F�N\"��\n�����7���B]�t�\"�O+N XK�_�Itz�\'>*�ʥk�����_�.�:�/�t��q9�T�q��������tY}�٦K�?�l,e���)?M1�%+)2v�\n#�$��D�\'G�?��v��i�g�y�a��v��X^4xfR��(��yj�C|�z��l�[���|��c��d�S)l�ܿ��[��p�;�y�^���vus.|��7/\\mI��:�t,��k����盏����h�DV!b]���pb��ԙ!}�B�]x�v\n�A\Z��M�wA��y���,w�v��ǟ~���~����\r�p���q\\G���`�(y˸ծ��!�S������ۣ��;���3���	�\Z;�ҜF�\"=ab���Nx�$}8{��=ٙz!S�=����.�!��x��+i���3\Z�t1lnCG�D#��6����0�pF{�^�%���.���(�v��E��^ݔ��H$�{���(����m(of��\n+WVB.d���\\{��7�!�׷��M���W�	�W�u��l0�.����\\�x�Y��:��A7�������!�_G��jҫ>^x\nG�W��4t����n��\Z��0�M���K�i1H�}�á�<����K�:�9�W�\r�􂈗�� S�|K�:U}nA�A��7�F��$~\n���C�N�܁xJ��WQ��AG��� �����{(�:`�S��$�	A\'�-���F�J\n��Q��߃W��t<e �⋸����TOI9=%ߘ>��AN��[�@@/�Hi�H�D6�J%[v~XWCq��~~rX����h4>_��x��8u�([�z�w�\\r�H�)�<���Zm<�NN�e͹we���g��|[������i@Sy�Oe�L���F��A��?~X����e��܍GF�0�[oڦ�ҳ�������9?���Xܗ��*�L>x�Bb���:�\"����0�p���/ЁCࢋ.���\'��������E��q~G^z�Ko4+P���U@>�?a�p8x�����x�{~�|��b�?ܲe˽��&d9ZN�2,����E�4SW�ʩk�ٙi�������E<�x����Z�h/:.CC�E�%��f���Z�n}+ww#W\"���>�!\r�⿬l�j%�ȫ�o��V2����GG{iC=xm[u�M����:�c�U���е��A�Ck��\'��^B�t���v��Oqs)�>L|�3��\'�����i	��DFo@G�[��F4A_������ͥ�^Z����@�ێ|��ѧ���p�����_�-ʊ��\"�駟>�u\'�gf$RW:E������7T%��K�-�wY���#~����~�\'�&�����>����}�`6IHLt�@�cg��`��Y/%L����)z.^\"�E�Y�p��z���SwYa��B�����;��)W#�\\��&g?�?��1���(m0>���ܳ�:�:��My\0��ћ�2���?�G�&UE�E��233�R�9}���1���>uX�	8��^�N��d�X��=C�l��.���j3f�8���;8��^Bd���{���O��T�n]��<���x���W4׿�<���ɨ&���G�bԇ��Y\\�Q��mB�Р\rii�a�iQB�O�k�XX\n�?~����������y�6��Qg�)�|�zo����xX�<9�M��>��\r�&]fݨ����d�\rȮz����Q��x)Z/&㵟}�ٝ����K�fcOP\0C�;aܸqGR�	\0�ǋɵV�2��G���~]DV�:<��ۊ?�(�|6u��0�C\r n�\\\Z��$a�����/��R�Q�J�Y�C��\n&��9�p0t2��C�d:*3�G��R��lF�d���MC��U�֯\n��T�W�4L#Xf���	࣭3��L�G�Y|�u:�}��(;����X�\n��t��$��<\Z�ԋQ�\Ztр[o�U����!4}@C�������:.��FH��/�ې�Ҍh�Hf�������=��~*L��Rvo���3���F��u>�Vh�K���Ÿ��z�!������Ņ�7���C����򷂲�V��ٳg#\Z���{:�\n��Ic�	NH,^���#����4�!��ұ�̘��\\x*�o���D\0\0\0IDAT����}�����I��a�$�d(�\n��Ń�04dq�%���,�p��;21�p77�{=eВ��2V�5#����t�����{�¯��z&������M��]?�ø�,<�]�vQ�\"��M\"+��>��÷���\n���A��j�0=@��$�g�q���2eJK:NM��O�&���6�;xh�?�Կ@*��I|�ݼ���5v��+��~����\Z�>c�l2��\rx����pU�B���q�w29����3��=H#�W�;�\'��I���	���Jڞ��I��Qm1J���1;:V�2o���H����;�UQM��I��ʊ�¤�n���ot\\W_�p2���ڪ\'Lr>�ĝ�`&쵢&>�]�k�\\�<�����ر�&����*�1bo�Tg��m�R��o�PWC)���j��fW2��޽{K&j:֢w$����:�ɄV��S�pޛ�H�ݑ1�|~b�|5��cd6$mf���%����� V%�O�;գ�(Es}����ޜG��G��k��1l�7}ё���Qr+�<�Y,����7O�6M�]y��8ـ>B/�9�雺�\"�\"n$G�|�L(�������v��È\'W<�Y�eai陼�\\=���%6�l\r?B:��{��(�8�\'�(T�<�\Z4��-Sn���W�/;�/;ԕ���(��i2��mJ/\"���aÆ�p�g����+;}��7)9���]a��;z��:TB7����\0�v(�$���x��8�qA%�\0�\'o�pu��	a�� 4�a�\n���wSBW�S��T��Ec��:�Q�Ѩ�!�	����k���q�\Z�iic���eL������A�q�8�1�\"L�h&�˳)��L=M�e�i�U�S�0���l��,\'y���ﾻYff���_�W�K��2e�\Z��,�?�4��]�����Շ�(������`��%���� _q���#��O=��Σ雡�G6��:K�C�W����GQf�D����Z\\�E-� �������x0:<����#�1�JNnwȜ0s�L�\r��oV!���O�;��z{R:����0��z���8�aժ%o�������+ܔ�(������:����SK��V�b�,Mz4��õ�ED��&-��{EF$㔀������b�2���q�@2~2V�*�HQs�+��r0�����Kxd�$�7d���D�_�\"���c�5����t�	�ŭ��D5ľ�M�@�&Y~ȗy�r�9�jc�v���Ȫ�]�y���N��@�VU���?W�鵚p6x�ܮ���E��tVr7�;�K�Ν[d���=��[���ڿ������%¥�[����C\'��؜��6�m�_6�[?��22���e]r	��`�?b�ȑ<���n�W~i5zԨQ\'���;Z�8%3_w�G�8�Hy㏇Cam�j�,�U�]�k����Ξo���5L��<��ƃ�q��Sg�����7�5����e^��G+Vї���駟v�={�5�`�/cHc�KgDk�������g�/�6_�bD�D_r,���\"&Og�]���bcİ���9�}�A;�z)J�ø\Zc��sɽ�)\0ꃥ�iL�^���Q�%-�I�&��N���xI�\"�)��ͷ�=�/��#츏r/�)�\\KG���nI{<���q�^�t�?N��W��	�`X/Ş�n�����\nw��Ԙ\"�p��`�N�J�:Ƣ2���ȋ��A\'�M�m��i�.fq��;�����������ګdQz�ҵ�\"���O��&�&u�w��yE�����Tˆ\0��8+��֊ŧT�)B[e*����\0г\0tG�O�xyp/���yE՛̺�\Z<�� R�\'�A��+���W�r���U6��]v�;�z�y$�-��O$���Ĺ�,����v�m;�^o�y����y�P���id�*;;�������KY��+�d�\r�����!Ne����KM:?��\\�8\"խ� \"����_߁s$�>\n��{/5�5t~z�H��(>�V�oste�ĉ#��l:\"oֹ���k�8�p�1�G�1��!o��%�t�\nH����(*��7#������<ڭ[7����������8��Df��թSwzB(ԂƩ-MZt�ǎ�B��׽�?���9��q�=@7�8�\\W�\r�[���[���ֵ��MA�y�46ǐ8l�/�	<�\"����:CFfN����Jy���sݞ��C�Y�k����>M�]�xE��-Twď�ӑ�:]�]��&���}�u]��\"#����\"�\"q]�����0d�1渮Wk�\'�\\��8[e���ѱ��=�fo��e9��n��[��>��d���p���h���z�EI���WI���^!���G��Ԍ2�f�_����<�X�a���\"p/�M�&�QJm�7MG��P�\ZD�D$�}ҽ��ˀۃ�\r�^{�M����OP�q���N��9q\'��,���k���`]�B¨�Bk\'�6t\"��+tI�u�4�X|˽&��a,?w�+nvJ!���`p��@0�\'��\r���\'&\'�Z��]T*.~��3{��5k��{�_\Z�7����䔮�\'-ed����%��5��j���e\0f�(���/)\\�l�N<��tѡws$��In��\"�`�~�w$9A5��S���T�e��\"i��H$�H�x���>���]�nt�4�Ģ���M[�U�b�c��I<	��ؕ9�����{_�ʮ��F*��@!|긮��k��iV4ӵ��Gq�Yq,���,�@��R�	�*�-T���=^�&��*s=3_��j�T\'�I��W�����eWb� V��3H�A]�� ��eR|Q��`���_����C�Y�9J��m��!��X::��M!$ޚ�&*J�e��>�;��$[\rf2=ٲ����<�M�����?ǖfM*{�Ǎ��MOhԞ��\'��\Z��tӹ=\\�]yg\'������ s?\Z~|ST\'�+�<�٘���\0����(l�O�6KW\\q�.ӧO�\n?}/3�[M�$�V���[qv�l�qt�K/�t�i[x�Aɲ�km\'�|�dTY�t�8y�Q�F)��2�|�ᵬ,h�\"O����e�]p\\��`0�]���,�.f�z�a����:5e��p��}v�v��o����>��g���<4�(�O\\뼩o�����ׇ��сgh��w�q+��E�݁��q�?�w*��F�49������󂜻뮻����/ߍ~蛥����<��dl�Ӕ���l���x�/�jM�ȼƠ{���Q��X���,�+ �ɩ�����l\n�&o�t�F/_�|\"|� ���N^�U�i�ϐ8�bl�����1��ۮ��3|<G\Z�\'2�֚@g��f�k}cV[���c�`�]6��Ԗ]�Xm��v:��<�t7����=#���յʭ�\0��裏�������(�&�#x��T���ܤ�~���]ЅS�L�$�;�U*�~h������\n���ᄤt�\Z�t~R�.�\n-;�@�N���Y�\"S��\"�?\n��%<k�X�By2�ءv����8���ktbR�~�M�2��y��\r��f֪I�Ǔ6 _y�ت݁�ci�M�=ǵ�c��q1R�^$��E����^�RVoGKL(���أ	�_6�ƉV��7ѿ|6S֭[\'CT��xb���^�?�������VR?�v��� �yM����\"��M\"�{��G�+�g��=D�C�__�P_�ǫ�M���]8-���C��98�XsԪU���~��������S�7�;�,���k����>5� �����&��g�u��������(�#T�Q(C�\n�J�%�}׷���\'���$��q[�o��T�w\0��H<�Aٝ��Ԍ��q\'0�u�]H��w��A����P��Q>��\"b0�\Z�fd��#��!&%OGid���T�/��^�_e���ct(א�G��1���<Z�xq�`8�7�W�HI�7��cI�3k�e8(\\򋤬\"��ؑ�����A��P>�\r�\Z�\"�M�2��૏1�n4C��1���l��K�V��P���8\r�W�+a �Z9,���\\�o��~㐹%�X~q��ٯ��Bx�IF�O��-�༎A�ފ+���t�I\'��l&\0\0\0IDAT���O�\n_��9W�n�~�����^ԗ��k�ʕ=�e�>��Y�ɓR�\'A^��^�zpѽ������X�S�2zu��!(�xɽ�u��r�r�$��,Z��o��v.m�h�VW mM|a���R�u�G�i\"U�vGԍ�#�8���\rf�1��P��COq��d�3i�gɨ~F���GAf���N�RC�ً/����ୗ��:\'Sey�6��Mb{���=u]�|$�(��N�\\g��6v�\"���?o۶m���{o&mE��e�]�6���黂¼�F&�]V�[:�Ӗk�M}�\Z��T�>y:D���N�:�z��\0��N.s�W�(���;v�ꫯG��ѳ��&\\}��\'P���:�*^>���(Yn;�<~Ǎ7k����S�\"T���P�ymkG�֍dd.�fFf���O����H��īζ�l1�`ّ���a��/<\r�^ǰ���s�CQ�̍��fӟ&<���6uw#ԙ��7�ߐ���Ɍd\\�Ɔ8��&j�q�-V� s��Cy䑗�� ����㐗.u>^z!��O�+VbRjѢ�u��\'Aj��Ԧ�����A.=Wyٵ\n^E=�6��Ox��E���pW����ͅ���\\�~���Q��0\Z�O_3Q{Q�Tv���O?���0���.Dzm��A]�X�]C���#n�)�t\\	�q��]����V���+�@~Y�[��ѱ�h���ht�S@\r0z��xԨQ��%�G<�g��J��\"� �=aj4��u�0{E)]V�B.(��4&}�T���l�%?��x�\rVN�P �׍;��NL[zY���J�_K|m�kp�sU��&�5�\nt�K�P�rI!e�k��r陟^�b�3i�r�&�͚5��O�+�G�|J��0�si��9�+�(����� EU��TJ/��a�9�#x܂;A� C����4�Vg�cQd#�� ,vA��I��4�5j��\\�\'��>�AP+}~���<ެ�/[����t�<�������>�\\�V�dث�Tn�0͗�f�	�����L�E�QY}|�M�-�>�\Z�\"��Az7����\Z�GG�Z�O��qĸ�.���}��zs�>u$���������A��kɧ4*�H<	��R��?:�|BȘ�:V\ZM�t�Q��Oq&��瞻��|6������?�!_+�z[Roz*/��7�����E����|G���xCk��NV��F�O�ĳ\0v9�Ǐ_��o��wG�����w���p\n)|yś��i��?��g�}����DNO$��\0��kUG�F6��<�_��7>\r �v���O�Oza�_W�?\"��_~5����o����nW���=ˑ�d\'�~���C\\�|�\';װt��7qq�UL�\\z:,l|�y���\Z}���֬�Lg�����(}e� :�o\'S�2HҨ���#2�T��T]o���������Z]��\0�qt��_��O��L\0�^`��ڵk���.蟾�b���\"��ut�*{*����ѡA�����ߍ���{=��tRg幇8��b1�+�+*-[�l7A���s��ys���g��=\'����k��&��Oe�D����_�]���ڤ��)��;L�4���A���ŏ��9�g����߅���טz��Qϊ��א�T���\'=�N*O��E��K˖-G�]�cO��ڵ���u _煪�|(YL�T�P��4����I$.� C�ͻ#�<�.FQ{*u��`��qVB\Z�*��el�b�ՠ0�����գ��G����8��t=ˑ��㤦�íc��q<��\"^#��⮣�A�h3��A�>Qh��G�&�@��$jG��Q&�Ʀ���e��C�iu�\r�ۏ�+XE�d�_�C�(>^��	?uc����Z�\Z�z���|�-�J+U��&f���u�	�}���E���ݧ4~�\\1���a̙3\'���\Z^��#�ƺ�a��	r�)�܌Xa�M��g���$P^����b:����0����:����^O o�3u�O���I�)�d��/a�&�i�F�p���� ��\"\nÿ(�>��3��z,T\"�^���@�C�eff�����[ǫ_.���6�錯���#�\n*�ޛ�펮$ax�������8u��_�$���������~��{衇z��g��>�,��\r��g\\�Af���Wy$���V.����)�5���&����J��%�U�S�%�^��� �;eʔ�#G��֡�ttR�t���eT�X�0�;V�SO<�D}�z\0�\\&��sf��V��ŕd����p��/�7����/��:�����X4与�v�φ��mc�MS=��=j֬ym�e�]~�3y*��,:蠃v����o����j;?R���o�+�ȗ]�\"/\r$�H+�:zӨK�.��M���TW.7s�̤=��S�-;\n��>�6�xi��8Kv�r��^z饵��ch����3�����4tVG�4I���\n��&(!�xG��d�؁v���ù��5��LV[��dDԆT�1�g�,�.J����9���ת���K�g���2�z���Ϸ	�������?�Z����{%e�&���(O�i���	����Ȧ�����#鬞��)��_��(�٤���gq���)��ԏ�[�<j�R�Rm\\��)~v���Ot����@ڛ7�_0S}�e�	$��J��|��D�r ط8��\'���g;��7O���b*���t�����RbY�`V��2����k:�u*�W�/C3��*K��x�{U�^(�K �~׷#Oev��SƐ:a��^�x���<-��LOr�X$���b����{q�)�\n_H�ku����*Z��\'�r�:�\'�`P�	�ZQZ-ҵH|�$0(BGw�q�.�={���G�x�E.B�h�Q���;��\n\Z�|�Rz�ޔV$�E$��1�Y�~��ʬF�D�������R7��4��cK3N⭨�3�)ߩ��W#��^�[�D1\Z�Bd�Q��{�\"aܷo�t��SSS���!���J�3�:�	���d.LV���nAc�o�.��@}Ź\\p���/��NC�㚤h�u�0���jeY��ڡd�(�)<޽kצ	����Ĥk������O�O�f�2ڈ�cEI�Y7]��#����k���L(�6��W��k�E��׹�#(�ӷ��:묓�׮�}	����;���\0�7�s��΂׿�E�[ ���;�Ѽy�΢c�y���HAv}���R����xH�MjO�Wd]DW\Z�1��L�\'�=���:8��#}��L�O�)�<*�ah��~�駰:q.����^��ޛ������@0x%y�@�}�x�����\Zժ�����2k5S�e�%�Gr�8��J���+�Q�(�����D�r��{�\r�~��A��V��#:���;�iӛ�:���S\\������+�����ɿ�u�]��駟^��9��߱*���;��S��`���Ƞ�}F	�O��#e�@�޽[L�>�7m�-F�~�D�~���w��6��!�Q�\\!�\0���r$��a�R9]ԧө��C�ԩ#Y�+ʸ\"YIZ4��~2�h�1��\n���gd��ǀ<�B:?�v*���Q�S^�-�CyO&�I`��o�2�K�z/B�R}k�m�d0��c�E\Z�%��A]�ڵk0&��>��^����ql�D��D���ɽx��tW^yeM��|�D��7|�[_ڛ�~�lz�Wg���&�y�Qgz���8�ߺu� əi)ީ����B��I��B��\"����_P�P�J\\�ͦ<����S����\Zt�\"g�����AO�u�A�U��Q��(�C\0~�)J�5�?QrR(t��]�9qz��Ңѹ�h|��?���-J�T�=��oZ����b |�G����_���7߼�������w&�F�h3L/))��$ҩ�Ãxa:���r�<2l\'?ry^���Cg���઺\\Jch@�P�w�_��gWR�}v�/����%�� ��_~��qKјTo�\rl�y*���mҤ���WQ����y�By/ ���l[����z#IڍW��&�s�=4h���2@6�q&A�}z��\\unyu���B7�2��j\0\0\0IDAT��`ߜ-�Ѭ�4%�<\Z�꽠4S����[o��OP�G9���)�V�VSއ��Uqe4{]�(�K�5w�q�V]������=�^d��O�$%��р�z�����+��>�F�^GOnA�}�xIgx�|G��N�ȍ��� ��nֹ��v�V����QoB��7uM��� �Ga����`��up�keB�8�Z/�}-��(u4��V!�x�ě������݅Q۪���߆գ��WG	�AOF_5����(���{�^`�?u�\r��n���Ù�O��F��j�t��]�����O��x<u��u��Zܐ����� Z�/�[�H4�D$P㪫�zj��������.�8��\'��^^� ��Z=_C��E�kI1Ҥ]X���k�)���+@�r0�Ջ�;�r��e�]��������w�XZ�~<\0̾F����*��\'����u��F��� �������:ަ��Q��\'�T��#�4wQ�,��\0^�.���m��~�|���8��>���/X�|�?�:�W��{��<x�����C�&�ک�F�������!- hg@2��m��|b�[��_=����M����+�Z��2\r%Nk�\'���>a$<E����Bz��RN}=����#%ڽR߮�$�O�c�//�u�\'N<��8=���R��X��W���67�6����L���/8y���x���{���w�u��gg[�d���Z�U�D:@�P4�U*�*APD/1W�^�A�#u>��V\n����?��Ȣ��o 	T��?/��È0��Y�}����I��!�*�\'~��P�\'��\r8�#��m� YX	�5��cY�I:5h�\'ћ��,�G�dU���t\Z)k��L�O��;�31<������\"�%��o��;���o~�n\"����\'Wա�\r�֡ԝ��2h�\r}��\0W\rD�2B|�����LG�_ �Vu[�+H�x��0�����x�$���`\',v�i���-[�������0p\0�k���5p�7��<\'�\"�����Ngς�gw�=�����2�φ�b�\r�VǢ�M)����Xf���u_|���m�U�V�����g٢�T��ϟߞ�����=�鬨	��I<Eحd7x�[A|뇃a�P���E\r�$w6�O�I��/���OD��y�}��wO�������;x�7�/�e��ڝ�܆�xJ��`~|^���x2amI����ܿE^2�$[v\"J�.�^t��t���N�Ou�x���/!O�OU%\Zf�㑮%&����`�Bćɫ\r��r/M�ij�o��&�ֽ���;x�CN9y�6/�\Z#oc����u��@������+�9O6n�qCz����?N����4m����Z8�N��z&$&��\n�$�Bw���:�|����3gN\0ُF?z�OX�\'J�6�mU\r�J,,��rS�ꫯn�N]�@�#s,�+���WY�C�-:�z�P��GQ8�3�焛wQ�MpN���=7��~�r{ڔ�a=�#��)<G���|��N�:%���$L�j��#z���A���R�0�8��N��UX�<p0�e\0�E~.r:�#������<פX}��Q\"��꼮�H���W^y�b�kKު�+�V���\"d�4BF�:[�N\'��� ,E��#t޿;�;ac��}�#L���*cvR����u�	�����@���uziҋ��r�u�B�E>O/N�?�ѽQ�FS�Qy$K�(�끝=@V\'��<(�}��H��9H���K�Z�hq �t*�6�>��N2ƌJo{g!]yi��u.4�J)�|Mp>N*�8Zm���*H����\\*��`B�A*n\re��uw&$%L����V4\\f{uC�Ю7��=b9s���p�$������x����[3V6F}������xꬕN+;W1@�&$$�ܚ���(쨅�Ζ�����v,۪�F#�TZ��Ɲ��|,eU���TI��򕟝rȏ�#����G��$�y�ӑ]��.τ�\n�E�x��(/��p�}\"��3�-�?�q?:�o�����\ZRvm�k����:?��Y�f;a��K�H�]PC\Z��\Z��?�z#Sۊ�#~\"�Z>I����&�����&�p	O��3?\r��;�͜9���?�\\3Z��@�bR&y��y�0�j���q��pC�=���Qј���� �W�L:E������S�0�E��՛7o>��?����`\"��@}���:�P\Z4�J��D�C�D�Qէ\r_�\\}���/!�>�~u��T�<�DN��O���U0��}�L��3��ş�@����o��Iz�\n�ڢ�����(��7���{�;�y�}d�\'�+�]}\n6M�פ@�jr�k�\'R��,��.��|G��Hd{�����(���!sc�@3�k�^g�}ޒY|���+�?�Z��]�N��W�XqA8!x�uT�J#z)�u�ӂ��e�ph�\nM�?�6�=���)�Sȿ ��G\"��ʱ3غ\\K&s}1����UcC�r��&5m1@����^{핬d~̵����q�����R�����h^c��,셛H�z��Nѓ�����T6���y�`ԅ� �ҋ����=�s:�⾯�������пSS��I�S2\"�]�` �tH/=FJ%�z�hnРA�-[��g�n��軓�G�S�_��.#@F�����<$;��q�3����5�X�\0f��r�]���l.`G�����/�}K<�TX&�(�G����ʩ~�M�C/�^�0����W�^=W���/��y�:Nf\"����^7��_緇�L�i�����Y��d�øuq�\Z5.E����۟xg��V�\rM]�(@-K\0�Ut���d�0>��֐�dɒ�p@��~��j\0֒�V�t.I�[��~�H2� �911�A2T��9��V�\"@�E^T�tWԭ[�;:�ބ���*^�D�~�0m]�l����yi���<U)����j�bފ���5(<υ�Łm�<�K��RÆ\r���O�z���nI~:��+��.C��CA��L[ROp�F�W�s�cr���n�Au���N��Ӗjvy���B��tϭ�����ݻ�GI\'S�s��$��`��e�v�U��bo���_EB5X՝���ǳ�.p�w���?L��?��T\Z�:_};��jp0��gZ�R�G���|�!?!w��Nk�믿NE�@��S��DFO�贌�%��Ov��xX�/��#��\0/��;<�\'�dLW�#(�Ny2yv��_�-܂r�L��JH�:���TF��/Qa��l�l��Š�Q�d\rߏ(���ͭ&�xN�%_�W&=��Q�I��������U)M���.@� q��B\r8Z�Vz�O=Η�,p��oW�V-}r�G��b�{9��}pl������2������[��������_�����\\�\\}X}��3�c�\'�DsԶ������T>O=Ϗ\\V�j��x�7�|sɚ5k����u$	��}R[�dʟ�IF�-��y�ڳgϞ��\'��i�1����C-��j�jC3�M���c���t̽�{�|��WVK��^=%�_Ɔ\r����Uҏ3��Nc;}��\r���[�\n����Gr�e�Nu^Y{�u�\'\0��kǓjaz�V�0���7���1cƌ��ï��r��k��F�S�<�+I@�~�r\0��	���f��,?��{���3xK�?�\r��^g�e�����Hh0�=c\r_X�/��u��tn!c�~�*!c��{�32.�O*��v/f��5�P�?Q����8�a�O�>�L�6홯���q�lw����0�y-�u\\�q�HW=#�~C��qKԧ\r��𺂱f��r(���ӗ6�������;�wY$#2����*�� y\\�}Ac2�S?��~ҷ���zV����<����6��Ǣ���Azq|TGz{G2�����T�e�;ʒ����m��CM�<�\Z4h0�~��nݺI���i`ɝw�A��t&Z�WAD�{�B��Z�뮓?��\\�fJ�������O`�hu��T��T�VUTi\"�)~�ڵ�*g�|p`k��E��J�WiU�\n�/ҵ����;����\n>�E+R�\'yD�cb�u�\"�ȵ�3�+��q����GiDJ/ʞP��g�_�(�e/�\n\0\0\0IDATt$գ�h<�}p�c#NDJ/~�I��^iU�[�A\Z���?���t�������z��#:Q����@/QOڮ�y�%_\'c�%���;4�y��n��!��D�o�lL�9�NF�VO$��3��c�$���g�y�f���*�~�s�V_K��q�� �F���$��I��V[��ӂF��yV��$�祕_�{���{����J�\\0��r�P��,����0�L>/n�?qtyW�=<9%�e¡�Y	_�3�Q�l�\'D�d��`�L\\�`�3\\�L���.��1w����I���b�;M\Z��&��M�|_�J��ڵk�ދI�8��%��\\�wCO\'�VĴ���QgIP���+R|�����������c`�%�S�v�x6c�+��\Zծ�ߩ�X(��h;:�!�P7��5�I��)�^����Qm�k�A��W�<u��hC��]����O�K`��J�镉�vD7�1���t�6�&}�^��y�>��u��w�ݔ���]7���\'��<��ډ\"K&�������t�寀\"��jR�0Dt-ܵ\n�O��F|��|��G����oG���?���\"<�[�ª��{���hW�P�z�D��*�0�_�I�;��<=T?(#o�\"M�59�?{�_E����@�)�4˳ ������E����\"*M\"�\n(ذP�`A}�X<}O��Ql(RR��k$�ror��gNvwv��ߔ�͙ݽ\Z�&�����_��D�;�=c�C��	�J�i�睎���@\\\\��9�rd����G���N�\nv>&�����ۊs�	���Q%�~���w�g�U��i��9�C;��\Z�J���k����3��	�H����ݙ�I�n�s9c0͑n�4`]۶mkS�\0os�c�g�X�H��tyBҿ�̙3��/_~\ZdX�k���b�H�K�R�_����:�Tx����IdYU𼅲�:���=��3ޣ}:_a\"�^\\\rC7d�\0P70M�h��~i$�L��B+:\\*7��-�z�N\0IH�8x�Qi9���!O@:\'u}�!�>Q�Br���O��:BP��HMEt��~�Q^����S����H�����5\"yS�|�.���*\\$�ުu�֝(�\\�/�<���@��w�-�� ���f�d\'�M�&&$��������V���d�b�Tj�&M�S7�P7y͛7���U-�A�אwP��\Z��/��tKv�dG�$N�Z�RG�}\"u��������#/6�y�k��7�������-;�������#%2���;�Y�l޼Y�f}��X�� ~>:e�K�\'ҫ}�F���6mZ��SO=#!!ᴳ�:kj�ΝG1��(�Ғl�@���ִTv�%�rVV���8דI�>�#;�ƿڽN��jK��(�j�����F�mG����dЍ���ɔ}ҥ-�t�q���%������m����/�χ�J���ћ��@�_C=hIN�o�g���~�[�n��.����C�蟀�\"Ҿ�5k�Q�!/���]W�<[��Ν��ҰaC-�wƫ�I�<���M���\0yb���%�\n��>��x)~衇�t��A�`<<i�\"�ܶ�M��ќs\"�Ԑ�^�WPv�۸q�T&�gS�]�\nv���Cc�k7��O���X|C:Qyw�WvKv��������[o��*��չk��8��^���P��#���D�=u{�J�<6z��!u����VaT��J�tk[P�������=�t2��租~���wO[0_���c\n��~.`�ԋV�zi<��c�r\n�8�O��o����k��<7+kjVn�&d�#2s�E�}��9��a�wv��%ҧU���q�Xy++��ȧ\"�vҹ��m��F��/��lu4n�����w��W�SO=u���7N�9�E�q�k@^ו�u=�2}��gE�U�*��8�}N?�,�����jK���>��*9��\0����g\\��\r��8W�R47�=K܃=��eq�{�w�4��Q/���p�����%��;0�Ը���Ç_�=���3����4�}���%֘�����O�E\'��ڔO��5<�#��k��6m�oOO�m5�yW�dEدAQ��A\"U�6�v)����[-M������są^��?�����=l��\Z��T\\<7F}��1n^�s�$R��	���{ｷƺu뺲����c�����NÓ�]J/�5��G:\'�;�=a�ã)�4Ca��D3z�RP��Q��At�\r7�pՒ%K��ٳ��>�����H�Ǯ��d��{��w�f;�w�;�����q��\"\n�Q٤S����-;:�|�����7ì:�|�ɟ��߿��ٳ5CS#\'���Kz�QmE3mMD�C�%ڗ(����CBN��0`@�u3�մ+a�tJ	�>�D�$B�D�\n��~���~��W�3q�ĆtV}�wg�̣&,�����_}vB䮠��>Y܁Z�ɫV����É\\p��,1�ȍ\\��(;�v��4���ioC)߭:��:eu<�g��#��t��\Zp�%�Ƞk�ƥo�:�X��K/O�yA�IO��H�Hy��4]�9�ҏN���k����z���Է���T� �5��Eb��]�$np�k��0&P�6�dl����\\}[�}ԩ~�MߊU}�A\Zխ�n�Wi����ѫ�$�:ng�m��#Ƌ�ѫ~��n:n\"��f�h.���m�y�+�u�{���_���\0cП�=��Tn2��\r�ΤE7pBz=�~�� qh�\r֬YsǤI��:�S>f��ݚH)��K�ƪ�dʇ)n$�\"�4��餼�4j�h�N�:uf5�C9d��;���Ǣ�<�p_��s��1=ң��d���Vm���np�`�\0D��uS�*Uju����\'�xBX��L)[R�G��(�>�G���D.f��cV-_~ǔ�/��#s~fn�>%�6��Q��n�|��aaK�\\�H6��F;\n�7c�ƍϰ<����v0^���w��v~�X�RS��S��=��G��w�w>2v��q�70�U�6��_��6�^l�IF}JN��<�|��!��Й��\"�x(�S�t�F�}��]L�7�?�>�8����B�\\C�@��?�B�-K���=����]�:�w�	�[Kڻ���.y9�c�x� ��K?��8�����6y�{�ԑM�P�\Z���fʛ|,e�\r��$�x�嗿��JG��n�jj�2�|�Иe`.[<yre��h���լA�������z�yK�.ՍFה�2$��qSTg���4^ݔ�j��[�%��!I�4�	�k�~c��hyM��4��UF����\n٧�R�K����ym��n�iq̤�pù���F��1c>�֭�n�d	zе��&�3&��q���<�����w1�V�X[ٮ��/���f�5k��ѣG�v��|pl�u�@\Z�׮�3HFyv�K��]7��{\0Qh��]�ׯ��~��0�ena!o��t$����;:�>m%���z�鿃<Rx���T�^���ɓ��W7]�+��1�腥�(���{�PJ\n�TZ�9�R4������,�/9餓4(��h��(\n�K�֌b�\'vTG\\r������lfP�F�<\"Ԟ�O7���q����,��J�%M\n�u�B����\\�_�8b�\Zm���`��+�����n�s�i�	A��#տʪ<���oC;�G�0f�/����ó�M���w(����j���\'n:�I����-�G^~�喧�~���ӧ��r�J�f�<$u|�\rڗh��o�W8(N��Sb��g���)S�b�9����d-/�{�tn��Z�ß�ǩ�./��y���q]t�#F�����3�8��>��__|��/�,h���}�w,E2T;�tkKԮ��{����3!�p3&�&�Q\nu���>�G(��I.���^�8t����@߾��q���7�x=������O�cA���3!�i\" �)���	���8��Ԥ��΍�4Y��O�A=�^����K���>6 \Zwuo�ti�4�8���6�v�U����Dj3�Nx�2NC�s���Ox6/��,���L�N�T��t����ab_�kt���\\�.�F<۟��<��$�!DTM�sڷo/N�˽Em�UV�LXq�̄��7����̈́\0\0\0IDATy���T&�S�@Nf�l���ß�\Z�mۦ_EkȘ�+��Q���U/?�D��<�~��\'{���}���GU�����C��䧼��VRP��e˖)\r6����j�\\�G�q�}½j+��M�C�t�s�����[�t��I�D�U7�cǎ}(%%�h�>�䓹�_i]��O 9�2Z�}\r�\"~����N�U w����@ۑo2z\"�������С����]�{}\"�Ս*�e�n��p�\r�E��\07�������������~��Rw��t+;ۄ<�!7�\\�&�l����&Zʽ���c�h�� ��@���|(ŗ�ϩR)%%!9%9;ǟ#��w=����N��%�<���������Λ7�ȕλ�t��K�^��H��a�t)��k+,��G/[�L/o,|�ǆ1P�f��xy�����΅��=��j��A�ڏ?��A��}	��K5:����N���A��˾d��>rp��\'f͚5)NR~p\nG1��=����D(�┣��P��d\"��5�\r�Ϡ�&a|V=G�>�L~�I7h_q�������d�;��3���f�������$��E���M粎������_����3g�]��y�_}��pV��R���&����bxy�e�D)�^\"��?����E|-Z�r�M7�s�t�(��a`� Rx*�����m�u��\0ħ&6��믿���9s�kL�����J�V�׌�k7JX��Di$n8����hg��ׯ����7]�1�|��,��r�;���H�um�֕�;���=֮]�u	C�Y�s��S����u�Ӫ�n�j��Q�]Z8H�[���<�B^t��g?��/ξ���UO^�}o�mߩ�=������\r�>���a�����A���w�΄P�_��)�`� j[ziL�[�%:��1�]�y����H�S�O�{������u�g\\Jx9!.�E\'=}����t�W�65I����J�\n&�z=s�������/��X�:��X�!D�6�;�=K����t	����5�H\'�%q�|��_}�I�^a���W_=eƌ��ˑO��ܪ>d~�}H^�jԨ�ǘ��X�ΕeS���It\\��w2eO��;�L�{��H��K�!gD{�,W��$Vk�ʦ�Vi@߹��#��4ay�5��8��2�ѱ��0�W����q_�/�e�҄��r�Up!�E�-M���@�ű|�ʠ؜��m4p���`������!���/\0m>}�D7T=����f�@�D�>�Z�j�p\r�56���íZ�Q�-y���v��A#XˍR����T�HR(w�z��\r��矏����M���B�u�i-{ǎlff����T�*�_��/�J�l[c�j���;7�g�=��]o���_�w���CZVҨ�tk�kJ�I�NZr��oL�dЛ�~���o��s*�j��Ǡ�N[0��-�k1�\\ɀ��wo\n���N8�H�vg^�����\"��:\'�y����V���9xÆ\r�����ի�Eڬ�{f���h�z^�\\K���	�N��@�4��B�\r\Z�_;���?��O؊+��\\*�D��G95����G胗�oēܟ	�*\r�^�ݶҡ���l-}O�Nv*�;���\0�v5k�S�z����?��Qx6嵐J��(N�az||�n�^�Q\Z����^\Z�n��?��W#���g�^ƘQN�হ�k�=���UPt�x�Lf�\"�c)���dG����z�tK�ʫ��ȣ��n\nګ��)�B�9�V�Z��#X�_�x�+V�q钞����p#^��?�&��ڂ�霶ҭm\"��)��L����Gyd�7޸����W�`�y�$_����W.;%:���dƻF�}�}�oo]x�7Ϙ1c�z+}���^���J�04��9_�L�٩�I�ǿë$W�u@�:p���>z�ID�����Q&bC׏S�߽��zI��#����4�^П�~;mG㏏��.r/uӈA�G�� ͤ�̇�G�;�/�x_�F_\\��ʩ��Ҿ�r�!-:��K��~6������6�Ԅ�j�O0f�A�c&Ws��8���IT9��rs���O�>�P����ܣ��w㺗��z�ĝ����P&�O���K����n,!��K8�}}\"�t<�z�Zc�ȥ�]��	�\n@�WHr����ҩxOT^Ջ&l\r�֭�{\'0N��w0{��K/U�R;���$���)j��ki��7�x�A�G镈�EO&o-tw������|;���&���14>/#���_b|�z^C��:N[W�M�����V[�lY�F�\Z]�nݺ�a�z��wf��VK�֦M�T$�7oa����K���j��(��<If6SpEd�|��kp��4��K.Q�(}�D��0���\Z\Z����g�s�y祰4�\n{�Щ�?��gѰG���5	�={-W\\B²��kRr�~$��cם��AU�Ӟ��Yo�]��C�eߕz�٠A�3��E�W�福٤Q��mx�~���d�{\Z��{�I����\n.o2�jvK�=��+2�|��8�3wDx���5�>E�kI�н|7��H�\'���_��Kj���$��_�G�k��#d�5�\\}�7�ՙ9��P	,��}�q���:Jn�\'¹�������#\Z��e�d�ix6���!�T)�ʦ���K}��^����ӗ%�Er�j��%���mK=��v.;��׸&DP��{=�nZ�=�R��xmGi1�\r޾<����P8o�1�;���s��6�*����i�Af�y�������/�r�9�6�ɉڼ�$�����X�>\Z�����!��;���G�S����q��ӱD?c9����\Z#ݸ�4�Ln����`����S�N��?iҤI!6���k#ۤ�g&����覧B)N)؝a�����=N`�^�z��w�΍�K��!&Rҽ��\0~�A�����$�Ty2}�I�2��O��S��#oq���m\"��q��E/ձ��+���!��N�֧N���~�헴-q�;�D����FD�t�ڋ�%q���p0u0�{��i��٬�ɓ���Q�O��W�0�\'�\"&<���7.��ҳ33_����Z�J�ƍ\Z��2�?��b�?��w�~�|���@��;�f,�O+N�����^4�Id�,u���鴩`9\"<�����/��͔/�>}N�g(�B���C��KNzQG�@m�*{��Qݽ����nVV�����юC?N8�cj3>���� &b�P߾}N�R�#��zD�B�\rM(���|աڏ��S�etG�K��<���׎��SQK�Y����ª�Ie�FA71���Q�z�ҭ�\r�@<��6�n����;��)��2���,�����{/f�x\Z^��Sl�\nؠg\0��^��ωxh\Z �i��������\\�t����U&���^�8�Ӓ�G��{����[�~��ۛ5k��{������4d�bظ������:��UD�V���g��<�� ���#F��d�-}���A��O�~��?��eGr�ܜD}\\2z��!�v����\'_|�ŷ��~$+2�+���c��[ġ�g���\Z\0��=nܸ�x��VdKQJ]}�\\� �	P#�k\"�Y�������z��=��X����pj�{�AoC{���۴���_�Sf�-K��3&ZzP�J�s�s�DAy�V�7�|�݂�\r(�0:����6n=��}�����H���S�\n�F\0��c��Rw;r�B��bG�؃�q�O�L_�hѢ���*�t:�!4�m+h7�C���\Z6ק/���ǣ�Y�1r�ȡ_~��x�҅W�wB�j����@�2^�D}�>|��,Si��+��������k/݂:��7����D�� {�\0�h��Ю]���P�_~���\"�J�߮L%?�g�p�����*[���v�i���)d�Ʒ��9��������S�����Ų�\Z����I�\\�m���t�9����;��I����U�}A�f�j���� �ԟ������>Aǜ?�{Љ�>����D����D���n+\'��%N�eW�㜨k�	����kBVhA����!m�&Y��\r�ڎ\'B\0\0\0IDAT$n��~���oN���\\9�E�Cc�r�\\��dcR���	�\\�\'m���m����^���� Ơތ����|�ѳ��I�8z䱗~�c���vr7nܸz����Ǳ�޼y�2��j�*=S�qOi51\nPVm�^�Ʒ���c�=�s��&���!������F9ڂc\Zmq\n���!�o2ީ��S6����]�S�]�We�dq�W���9�ǡX�^=�����\rŦ����82�[O\ZM��8�O<1���\\F[a�8�����:���s��	Q�V�=>�����v�p\"��My�S�k�$�������jH�>�Z��m��\"�t����뮻�<f��S���l��������޿ɿ�ͭ�V�������t%w��4����˨�Ft�����ǵ4��7=dٿ;��f��{����%بT�j�XR��oh��!3�0�4N]S��s�8us,x�c議�5������w�q�A��a��0]���5����C����K�E�&��V��j�u+��̰���\"-�ӵ�Ctz�d�|�A��o����]�>�R�7���\"�l��ߙA>� �OJJ:<���3kժu�-��2�I�N-E���������� ���߆��%��\\���A�72o\'�N�Z�l�v-!�TA����=����g3��;��P���X�Ôk����w�}�O�K\Z����P��]��s幔z>����Nc�M�+�\"�l�����ʍ�@ p��#���9�q6��V)�Q�%�G�es}q,�f2z�����S � ��N�0a_7s���)������-ѯ�x��H�[��a����!��d�Gl��M�\r}V��E��˨��\\p���;w�gҤIj;;\r+��K~�x�,uV�pK��Y��v��Y�zn���w��B��}�W�B�1�ӿ�y�*.��t׎;jۅ��\\sMW�H��m�v�͸r������+]��y]*\'�v�ON쒺�~]Y��\Z��R9�0閒Z�/��ҍ4���<������֨Y����v]�pA����v����F�������P�_s�н�,��L&V\'2i{�sƌ�¡�2��V������Y�5g��5�N\'n6��x��UTze׶\n�C��H�i������<�ڢ��\'�1��\\�@Y��أk+cq��zʶ��{�9�q�<Ɗ��2�#\'J;�d\"�a,��6�����}%Ñ=�]ŹV	Ө�����`xғ�r�NK���L��#�d�����ԍ�8�7/��3Am��r�p�`:���4�K/{�>$�#O��p-�sG��Y���[�f�����aw��V\rQ\r/���Q�gv���G����_[����Td�\'�|2�����47����y4��|�1��)\r�Q�� �`Ö�29޵����y��Ch<����C��٧O�QM�6��Ȧ�H�|�����u�� $�!��4���?��87�cǎ��Y[u\r?�}��>��Yf�ς�P�;/�\\.�W�@�ԙt���4����.�F�D��̏<4SW��tJ���$��\Z�X�r�����]p(U�s�޷x���<nz�i>��)�8y��Y�Ι3\'����Em�@���s��:X��f��֮]�.�a�{\rH��[?�5��/|�E��<�|��b�������y�=��.�u����>�؈��_�*a�^��;�v�[�2^=���i)��[o�5mÆ\rz�i�Jv;��-���3�6����͛7O`<�K��ztd���:�nI��<d�q���\'z>��������^{�q�{��XJC�H6\n_�\'}-a$�~����>���3p��[�j���B�G{�G��B{��}e2��)��L���&k��ON~��&���ܬ��Y9Y��|q��}�)>_`J^n�d֭��M�����|��OΕ��wn��S��\n�ȓ�*\'Nntd��C���4l���4>fr���������W^Y�#�I�����޽{�v,����#\\���a+�z���̤C-�ׯ�����x��@��\\��p���ށt]�_�O�������_�ָ$��׫��Ǔݏ�xo���8$[0Z?jԨ��}K9dLZ���+�˄�������k\"�>�B�L�ېؕ��+�R��P��ش/�Z��,��~�\Z�ؤ.e��k�����!�r�x$��WGo��^/\'s�\Z��v.cŻ�S��裏Ju��1{Jhc����u��D�Xr��ɓ�ċ�E׮]�]�gl�]w���k�������c�b��uM�/��<���-���xp�f0\\��BI�P�)L�8��$ZfYBg\\0u��e,���u�Mك��1�x�����.�f�,ٌ�����{}����3DD�(��!��ఘz[8f̘勉b�%��\n��-�Z���j?��$W3�=��*Fe���d�t}	�2��os�FvX�[��3�͝;Wc���w�b�T�h�����\"ǫ�Ӫk�#I��0��m��մ���\"�&�s��*�>�ێ��`�L�uÐ^��K�o���-�b��{�C�A:�Q����힧\"�i��DA�Z���Ƿ2���{��iiiA���og�2;��n���sV\\a�u��n|ޫW����s����2�}ƣ���%����m&���͕�2�m+B2�/ ��s�m�6�e�ݻv�۳gO���φ�\r�W;)�^T��}��o,�/�\r}A]/��X�	Jvff�ti,[��W3��P[�]΂�Ć�2l���� l�9V}��8.�24�v��ʕ+u/���̇w,~�V��Ƨ��-7\rU��Y\r�%�jU���r�i�Y�hѢ���v۪y��y��SF/��ʙ�0~����y�z�?gR��۫��i�顐잴�-�d=�jժ7\'M��Y�\"E\n%��0>@\ZO�\rY�5<��W�I�����O���Ž��s;���%�$H�$XʥK�ٮ��,��ow)�>i*���\\1�\"�;%�\\��A�����D��Ey�Og�m��Ro<{�����\nd�tI�D�N�xW:$��m�/qJ���ҷ������_�\'$�/O+t�p���_e)m~�U(�7�U�Dq������\\���!`�����b��;$��WFLP�d�����@~;����a)[\n^[�<)�{��;����7��q��x�wP�����Fu����fL�G1������M�6-#Mą���,�\0W%j[����Tq��k�C ���Պ�+��6$�\n,�n�MvO��k׮�n/BZ��P\0r����7���m�I�n*���>$���Uױc��Ǿ,��#��ӳ�z��?�L}��[�9��Ad�����fO���>�E^(\'�Y��P�EV|�ZfW7��D���ج���Z3�z3f���2kc����|�,1����ڃ���#�\0QQ�W�^5�|��NM ��/\r�`σL�-������~d�S7�~���mٲ�[*T�IyA��<��bC�0��!`��d��鎧윬�,��K}�����t=�ǡ��-�,T\0�ǌs9K��j��d�\r�x,��\'So��D*�Urr����ѐ�Q�Y���`���fDW�o�@\" M��&��w��2�+))�HKuH���܌W�U���M�����[��B	�ӧ�~��\n��o#[���s��D}�L\\r �vq�8�\r���ӣl�\\�6bňf��R\Z��!`��������}��U���[���AO�&���0����b5��F�=��#���`���џK}�m���ќ;�:����2�}���u�$���F4#���zC�0b��.�������\n��`�q�؎a�D�������ӦMK��|� ��59�������,� ͹���\n���G�|��L���F4#��~C�0��B\0r�kҤIM<aO�ر�\0�c^�\0�/��<�\"��Z(o��\\�z��\\�bH�C����!�� ��i⣈�C��O=����#�bF]�Ѥ�c)XY\rC�0\"L^�+V�X�Ivv��			><a��}\r�AɾADX�dDE��.����!CnaB����t}nj!��F}\r���|��q/��Z�\"����dR&7�ta��N��\0\0\0IDAT��!�[(�Q��C5��oѢE\'�~$�	�R$S��k��\0��8�_�3�	4x���;C2��e�I=9ԋ$���F=��h~͹+��#��+�Kգ�avH�iD3��rC�(_�r��7�Q��b�&�Z�^xa�w�y�⸸�C�T�	��y��ǐ�d��П��/��R�\"����+V�\\9n;�ˑ��ǉׄ��#���N�6y#�Ԯ�C��5�]��[ԮŌ�#H��}��\r?���[!)����Vpd����\r��h��(ޤ`\"Pk����/y���2����Y&�\Z��\"u�\0u5��B��t��d���f�֭���\n��+Kި\0�\n�nݺ�����GX��������K�e��_��6}��\n%�Qt\nq�g�����	bYB)my999�s�_g�\'�f���dR�11E4�I�Ge�;lTVk,�,#qY��\"�V��C\0Oe���~ziff�X�_\0��Ŕ�l��ĭOKK��o�hѢE�y��]���ە��O2��9x1�db�7���)y2����[1S_F4iQb�	Gj�݆@��b�ǒA��O>�d��m�*UJR����Ahְ+�̵��<DD�����8���S��4���/����cǎg9^��X^L�\nP�/�S�]��]���X��^�l��\0C7�X)n̗�S�N)����7m��&ĲM��x��k@_$;\"�wU�Rȡ�zTzz�#dU}�q���,��@��3\'V��MZBX���A�G�U=�1��!`���i��׭[���T|||�`=�	���|�l-�V�\';b2,X� �x�֯_�\04�D���:[RSSGQw�q�=�s^Lʾ3��	E����03���%1� 0q��C�̙�rypVV��%X=���K�W�a���\\`�B9#\0�U�t���ŋ�P��D�	�|��s.۬��ۋ`�ABc���h�\Z,��!`�����Z��?�rr��8�z�o�̩999��q5��1o&@�c�կ_��9�s�Q��[�t�P��2Y&��R왌|��M�>]D����w-#��W\'f�!���ё؅�J9�hѢ�g�}�g����r�L^RR�ې̇8�\n�)��2p(�@\\�2�+K�,�9//�8��|�ވ����AOӯ3ep^�ġ#��C |���g��,�e�=��*s����������2y3s233��� ����r������.�Z��k\\�=<�M�~�/1!�����g�`\"p/��!�c\r��h\nF4���!`ш��o�ƲEQ� �q�}�]k�4�R)!!A�.�ߌ��)��A2��\rs��@]�~���J#G��C!o�V��{~\'pcN ��Ip�ټm�<�A	I�>�J�ej�\\$Su��@$v�RM����ʯ���%\rC��\\̧�u�7��ի������{23������HH��-�@ݺu+�VO=����>8-mP�\ZՎ���������@Rnvދ����I���蓘�f<���@?J���E4C��l$v�8���`n舨&3��`\"q��LED\" �<p�o���8d�(y2�����h2�\'rBJ^�F�����~ٸ����ss��qU~���-öo��K�����l�Ȩ鋋s$\0�����W�n�7\"Tg��	 vq�Gر!`��@$��#�=-�O�Qs��\'��|��A,�7�h>Ȧ�-�/ ������Sf\r �A�E���Ɖ�{�z��W\'&ď�Y�z<�oq����NBܽ��\\�Q���9\'>!��K���D�Hf��\n\r�J4�\"\rC�0ʂ@Pn�e1 b�p�	�/\\��\'$�4XJ\"�1ٞÒ�����糳���s�D\Z���p��W�8�U�6��T�o��U�\'%&n�����=k�M�6p=�$�Ԭ���2�_�qr|BG^�y��>����dDQ��fQ�X�!`�@9\"P��*GglӦMk,^��H�qqq�Tr��������6�)Rî� \"��������?�3�W�/�K�~XrR҈-[���\\\0�%&&���nܗWp�����rs�x3&$�܇�y�㸤3H&Q��#��E����!`D��P�T�ꫯ���|��b*DS�0r�����	_#�96�	A�;����U��$��r�J������u�ֵ۶m��ky�W�������%;��@�?����ܬ��H��hr a7�\0��x��-kE\"`�6C��f͚U夓Nj_�Z��x-�����u��bRNN�JJêl�x^2�-��w�MMM=3>>�	��/�lv�{y�����9��R�J��Q\'��n�&��0 ��#�;;�yI��\0ɤ�eF4��e7C�0�����k��\0�ɩ��~��@�\n�y�}}/3bS<�)es4ICԊ�\Z�6x����4v�^��7x/��`~P���Irr�!�������[Gl&\0?�����9[ZZ�H��}�@��f1@�$��!`�@Y8������}��-gw��)�	���2C�I&�-�@����רq�>\0ɼ提�>�/�\r�D�E0%�10~���8�v���O&)~�\'I������ȃ�oer��\nF4��:#�0f�!`Q���G}�u���<\\E��h����G���(î�2\"��>}��x&G@4OG�S����يȻĒ}mE6%�L&6��\r�I�sI&^Py2�	�ȓ���$�Z(.F4����3C�0J�\0^1_�\rNZ�b�pH�ex��Ƴ�̈́l~�yukH��Xv�#D��|u쾸J�*c*U��	R��v��O$^�g��\\�9��|ث��:����:ԓ�%t��<��7ٌ���dDI�͒\"f�\rC�0�b P�N�C7m�ԋ��*�G$�3$�9<������!��R\"p�ҥK����|��������d~����d+殺���L�R����D�N��P��CR�;vla�]^�	ĉ��`*/�J��͒\"f�\r�=�C �����U��-��ٳ ��gdd�iq�^� 1� �Oc�HL��طP\n\Z7n�D�F`�$�Ĥ��;�l�2��eHA�)b	Q��eϜ93�[�n���+SIH�f�ORGÉۊ�dJ��W�[��R����\'�V���\\���@�;\\�T8�`���%)���h���[��{���Q��?�Ł�[��H�\"2�w!?�Y(\"��w^��˗wLII�1�\n��!��(q����)K�q�|���mڴ阕�5��թ\'75��wvG׃lETK�\\�K���.D<�Y��ȹKC�C�E����\n\\3�_x!`��w}L�6��UW]Ջ��GY�=��q}��a)W�^�V��`vD8��G��@�Ν<���/�������Y|����q%j��W�����7o~��_�`||��L\Z���N���CBy2w�U^	�J��ωx���o�����^C l0CC t�����۷��v��Ʉ�h9V�WU�R�	�v�A>���HZZZܕW^y�s�=w~D1���~*&Cױ�����x��׭[wW2HUݠK�����S��8��h�\\®��!0�Y6\0-�!`��!�,�Vٸq㭕+WNd�Ս�p:�� Fgdd�&��q�D�s�@`ԨQ5^{��{9�\Z\"�\n�p$��,���(L��i�f�\0�L�0aB�[����q��g���7�r\\RR��W�].�)=DWt���G3:��Ja�0�}&�!��W(x(}��z��K�,����\n\"����2\n������α=�	%	=z��۪U���m�63۷o��ꫯ�2�w�!���D�\Z�M��i��4q�ı?��S?��a��4~`\" ��<u��3�L�t��Ďʄ��2�g�\rC���}�/+�!P�@~|5kּx�ܹ�~���ksrr���\\�=S���d�\rf#1%��޽{7g���ٳg�_�z���@�=}��O_z�-�j��%��{nRRR\Z͟?$K��p�@��qԑ���SџD�&D/Y�\0D���`#j�C�0b�KC�\\��p�rndȇ�L��l�A4���<�Z�\r;\\���m��l����/�q��m7oެ��%*�DB��IZd8�cǎw��/\0\0\0IDATC,[�\"	]>$���������o\'N��}�\"��R `�h�4�c��!`�;�d�\rD�,�a�F/���\n�C�\"~Adb�q�,��m���}||���k֬Y�e˖-f_A�J�_�,X��r�ڵ[�`K�׳u�?���������#R���da�:Ik���G���Y6C�Gt�\nG�J`�%-gJ�fX�=�W�^�!,� *ud4F�����I��{8��aca_���G������6m�����~�]wݵ\n|�.^�9sf��^�aӦM�CV/�rQ\'[���Շ��<�V7\0�`D3��~C�(G�1Q�`GɥJ�fZ�l��Rn\Z�[!�\r�T��b����l��A��% [�u���?��S�V�322ěY��#�|`ѢEO�1^ݡC��bU$�j�~��Y�re?�Qԏ�)���ԉ�,���dJ/�B�@4�Pcd�\rC�0vC\0RU:W�nz\"�p����aw;He^2\'==]d����Ѭ��EP�@2��\\޴q����C����B2W�k��%X����߯ٻw�[�/_.���x0�����i$\Z�|K���~\0�<CLM\Z\\u��lv-C�0��\07����Գ���z�ꝃ7�JJJ����8xζ��$D�\"r��Ҵ4�n�@\\��dy�$�6��U�w�hv@�dߡ�ݻq��uz��1dŊ���l���G=����!}��x���3J�yL@(��D3��n`v=C�0��ѣGW���{nذa*��YVVV���p/�\rb�eف�U\0�eY�(*��W�T��������w��1p����i�e�v��ʤ��\'@��ǋ��5k�%\'\'� N4��>���!��u��c\0R!��fE\0^�5-�0C <?~|b߾}/����T�˲�}/sD�U�<��y%6�@�סC���<N�C�6>���\'�t�p�>:�\"���z���F�\Z]��W�*UN�L������y��bf�dRG��KAF��f�5u��!`Q��[yߺu��R�~�Ǜ�H GdFK�K!L�\"�>\"�%-���^��²;K�k�<��x$_&]6\"\"(a��\0i�{饗�����v��Qx1�2P�l��߲3O�p���3�	�hV �viC�0��F�ꫯn	QI���+K����^��3�K!L?7--MK�~�-�@�~�j}��������yɟ�>�y�1�L\'No�+�H��Eʒ%K�\\~��m��a�������}-�o\'�����{�ގ�yU��S/i-�#�!7�T[�\rC��\"�V�z2�ˇY޽OZ���\0���x6���w ���LT�4n�8���r��A��9�v���Ӆ����������vƌ\"�7R\'�:�	��j~��P�-d=\"�)�2����x}�4\Z�,^��0C 8���ںu�p���C���t�^�Mf�^��!x7?n߾}ža.k�\"�pj��姤��\\9�\0�MZ�fS��1��C��������2NuB|fRr������\n�/r)�\'q%��R!Prh�h�\n���D�*��|M����!5�u�]\r>���a���_�g8����w����ɜ{�e˖�x���j��������d����z��_!\\X*�>�1�^�zgW�\\y�ҥK_�PA�\0[���.��� [��!�<�Z\'�h�Sma3�}v�\"�Zt����!�@T�(�ycƌys���72�� NN����8�<i�B8G�n�9s��d7�!J��s�9�wBB�t��677���������[x����~����rߖ-[^�.:�=>��Y���Z&�@\Z}sS�z	K�Pb��!Z�D .��Mw� `]5F*ڊiD/z��قAND�\0qX��~.�i>;\"�ߓ6�LtGM����]\0I|����(��?�2���q�%�����r9N:�^@W\'�k߾��@�UBT�����Rr���0�h�J��Uᳮ\Z�-��6��H���ϛ�{\'K���a���GNK�Y��^D��c�eHQ�����f�Z�u��q��ѝ�HR���W=zt�;��������]�� k��!�qx6��Ϗ���H}��lJ�1�h�\"*R��qE^߮.�a�@)G氱?&�D)o{ꩧ�㹼��q���R�+x�F���� 7Y�\0)*8�����~��M�yw�9sf�G٦o߾�z��{CR��7��S!���������zⅽ�C�@���w+�h�����{��񱳆@�#Pʑ9�q+7\0��u��l�;v�\'m*W��R�J7Bln�x����ǿ�$�3f&b$0�|[�l���<�>d���v����w�=zܼnݺ�H�9��l�Y_�P��q\Z�^�,��}y����C�\" Į�F4�R���˂��5C�B8�쳫C\\�Òl[��x��aг��l�A>�L�����ho5D1�op#���Mϱ�N)ٙ�Y�f��8�>o�����kצ��1x.�#�ew�/�U:Q5r �\Z�hFj͙݆@�#`�3B����SVV��\\G/��f�\"R)�$��}mw!J��P4��o@��#܍d�m���zK�Z��שS�寿�z^L}�蠔��9�x��iF�i��N����HF4#��~C�0�����a;�@<o������t�S\"��w�<�����vʑ��n�6m:	�jҤ��O��QYYYW�M~�+|������oI�o��,�ʜr%��@ �G�R�h��k��\\�V��!`<!t؆�fȢ���i�]vY�v��]ܶm�6�^z��\r:�y��ŋ\'Qy-�H|�H��ck$ �)�+�d�FM�YYb\0k�1Pɡ*��5b�3fl�>}�wo���:��ˇÛ�kx�+^��6Q�@��(�Ίc `+�`�0J����$y,m�\"nD3Ba4�\r�hA�s4�<�RQ|�,�!`����X�q+�!�W�ɰWx��d�i(4���!`�#����r\Z��!R���^S���:�UqF4CP_��0C�0B��=�\Z\\C�Ոf��5���!`ႀ�fD�c!�m}y7#��x^ϺF�o�6C�؉@d?��ﬄ���0�h��VV���E1�C�0C l(�a��J2CC�\\(z^�f����\"u�F]�V #���bq��!�=���[	\r�p@��`8�B�m0�r����]�0C��v��5lD3�۟��0C�̎ ޮa#�!�rSi�@�!�>�HC��5#��5���(��\'R.�EC ����0C�0�+WI0�Y�,�!`��!`�@�0�Yl�,�!`��g��!�DѴ��c��Z�\rC�0C �����\"���z�5��!`��!`������Ƣ${�E4KR2Kk��@���Pֹ�6bV�j7_��DɶF4K���6���g�`�֎fD*6��k�E��9�$�����!`��!`����#�ŬzKVlI��YVC ��2C�0��h�/�a~����mI7̫��3C�0B���}\0[���g[�WA�5�uo�-�n��e�\'�q���a���fV��dD汎�ڊ\n[�Rk�A�1ʕ��,���kF4=$lk��!`�\Z����R_4,3FF���⢧A�(�6Ų�6Ua��@�0R�jHxHT�6�q� *�!Ď��b�����@8�Fʧ��v���cuZ46v����]ז�KZk��0��A n#aF��uj/QEI3+�b�,G��ReA��\Z��!`T4��y|+�\r���F4K�XD���U���=$lk�@��5���H���F4ü��f�uH����{���0C���h�N][I+��0C��)�h�Tu[a\rC�0C�ol/��5¦�0C�0�E��f�V�;��K`ь���0C ��.����%�0�3�(_l~Y�x�����\Z#�a]=f�!`��!Pl~Y�,IE `D�\"P�̟\0\0�IDAT�k\Z�@�\"`W7C�(�h���{[��޺����!`eE��D��ױ�Q����Di�Z�C �0�A�Ux�׈f�Am2C ��.C ��� �h���0��7�g�@�\'�AVW��v�0C��@b�h�Ĺ��| ($vgۉu�<���X�+�!`�@�\"�D������+$6Lk��*16�(1d��(�\Z��!��&ь�J��퉀M$���bC��Vl�2\\j���t�寘�\"\\�5;C��Ql�$�+ޖ(å�F4å*ǺEyՅ�$��ȸ���Ȩ�p�r��p��l1�\r�h�[��=!G�n!�8�.`�!��ˌ5�C��f�UXt�k�0C�0�X@��f,Բ��0C��v�F4C��5C z����n�d�@p0�\\<M[��6BXRSm�;��b�א�g�F4å&̎}\"`/m�\"K`�@#`E:AX�0��Z1���!`��!`DAX�0����`��g��!`�#��D�u���ok��\"�6�R��!`Q�@�ˈf�Ti���F�\\.�o3,�!`��!`DF4#���JC�(\n�7C ���]�D�M@�`��!`����;�P6)�ۈfA4l�|��b��lW1C�0*#�\\1yy�.�d�[�����+6{-~��F4C��i6C�(l�Z.0�E�R �D�e�,��!`��!`刀�r�.e�@#`E3C`�h��E��!`��!`#��@��:,�!`��!`Q���(�\\+�!`�@��Ԇ�!\\�hO���WR\"��~C�0�0B��fUFd�eV�WR��B�8��!`D\'��1����Je��!�X���@���\n)~#�Eՠ��@�\"�w��EϮn�@ �Z���F4���td!P�~Y��k��.+a�4�\nA J�@#��z좡B J�e��1���!`Dff� `D3Zj��a�	FSb��!�\"`DӅ����@pJ`>���hZC�0��M�`b��!`�@p(T[ ���##��6�4C���FS����i9\r�hB�����ґ�hj�VC ��D�!�ž����&+�l6��\"`D��Z~C��m*�,�sc�>��!Tʪ̈fY����!`T �s+��viC���\0\0��K���\0\0\0IDAT\0aT��U�}�\0\0\0\0IEND�B`�','2026-02-06 15:54:07'),
(17,'sedeq',NULL,'�PNG\r\n\Z\n\0\0\0\rIHDR\0\0�\0\0w\0\0\0>�>\0\0\0IDATx��U����.����ݝJw( !R�t�ݵtww\n\"����EH�(J*R�H����~���]d�n�ݝ���9g��3�y�g��3��f���A� `0��Q4#\0T��A� `=Λ��yI3�N��Q4��aY��A���s6�=���##M�G�		4�	\'lC�A� `0bF�����:�o4�3���dg0D��@�A Z����Q4ùm\\\\\\���Rt�3���dg0��!-F��U)2cE32��,�� `0�@C�(�1�AMu��A |0�aG�(�a���`x���eLL�A� `0�:���<\"+l�~�@X��%�9��� `0�7F�t��3\n�3�N��%5�29�C�A �0�f7@���#Hx�K��A� `0��h:w�O��z�Q�bĸ؆Eb\\��\nG�\0Ǳ\nA��rfv�aQ��a�FR���I@;1��\'�E�����C F�C\'������(��ce1��)ʠ�V��$Z5�!� `0�\n��\r��̜�A#9����A� `08F�t�V04��C�Eġ�&�A �����\n�Q4å�M&��A� �-\"���)�Y��+�F�tVn2tb;����A� �0�f�oBS��A� `0�@hJ0�fhP3i��A� `0�E�(��Bd\"��\"`��؍�Q4cw�����A� `�0�Nь����\r��A� `0�\ns�V�`#�Q4�8��A� `�� `����B�F�-r&�A� `0b;���9 ��E3X�B�$1�@(�V��1􅲕cO2�hƞ�655D�jP�L����D�s�n��G\'�qFZ��錭bh����\\�b�`SK�@�!`zx�a3K2�f�l�p���\"�0�;�!6�@�\"`ͨ�ߔn0�0���hF�F3$b,1d;A�mS1��A� B��B�LtGp\Zm�bMgB�l\'p��0��x����M�4��4B�#�h1�MM����@T�ꘇ��Q�E3h|�[��A� `0N����_�3CE�)X�a�� `0B���%ڙ�����3� `0�X�@���\n��V�(�aEФ7��A �!���d6�& gG �m��n�Ύ��� `0b%Fь��X���֏�*b�\r��A� `��ze��Bڔc0��A �!`�P5�Ybl&�A Z#`�7��\"`͐\"f�7K��A� `0� �PE3�r�+��A� `0���Q4cx���[��A� �8��i�CF*C���@d\"`͎L�MY��G��ͨ��mbJ4D)f��R�c]����X��±�W4cY���\Z�\Z3�Gu��C��7�Fь>me(5�8�Θפ�B��A����1���� ����1��.�*��A� ^E3��4���A�QL<�@,A�(����#���#��@ٔa0�胀Q4�O[9=������h0���E�E<̓A� `0!`\"�G�(��cdb��A� `0��h�4�� ZL:��A �0gd�PX3�È�Q4��In0Q��9#+����X�xt�q��#X�T\"�\"`�ѷ����A�9p�q���<b���DC�B�m+Sq��A� `)F�)b&�A� ;0�g��ݙ�����d������fF�Y�ر3p��F����*/�9��KĚ\0�@�D r�����Unce��JG_��}�.p����A 4�^u!��<4|�?����Un��o�\r��A� `�&�^u!��<���?EӁ\\L��A� `0�@H0�fH�2q\r��� `(1N��Q4C�Df�F�`3���A� `�b\"W��]�f�5�٫nP����A� `�D\"W�1�f$6�)� `�ȝcN�y�������Q4cv����\r�;ǎ6�B\r�pC�Lg�\r�dd���Q\r��A� `0�����F\r9���0���X����A� `x�L���r��$\raȈ���p�l=�lѲ���@�B�(�ѫ�b\n�1�f6-�4[�l6C�A� �0�f�j/C�A� I����g$am�q\r��A�(����� `������g4oCC�A���sY�h:7\Z�C�A ,�iX�3i\r1��1�u\nE�ܘ�aL�� `,�!A��58��c�b�!�1,\"!�S(�+p\rGE�\"��A� =��D�i�P4#\r�QၯQ��E\'�Ðd0�D (��^,�ڨ뱨�MU\r��A ��iE3�����A� `0�x̷\r���fI/L`E3L��Ꮐ����r�q��~�� ��ob�!��Y�	Z/�5��K���0!f%���0��Hb�#(�8��A� Z��3��?0�m8 `��p\0�da0����Q4cF;�Z��E���̙3q�%�*T�H��-Z�yɒ%�fʔi�7n�	���S�3����\\��\'��gT	�.]�S�\"E��*U�*���ʕ�S�X�$�c�A� ��E��Ȑg0���8�[�vG!L�\"E������&M���ٳ�>|��O?���~��رc�=:�ʕ+èO_��^��������=��v����������?~|ɡC�>&���}��!�Αωx��}@y=S�JU8I�$�.]��Mfl�΀@��΀�����vQ���!� u�ȹ<x0��ѣ󹹹5\\�b�L������Ϧ�}�v�K�O������O��2�R��Ǐ����������qo����䩸�>>>���O@��#1ʥ��)ȿГ\'O�޽{w���}�Ν;\'�gϾ��ޮU�V��\'O�޾}��3��hF�؈G�l�x�M	�///ץK�z�)S&\'5~E�>����\r�%��>�H�+J�5�㞨6J��0J�\r+�u}����4V����ĉcS\\��ʐ�i�?�\'�6��Ļ&����nݺ�e��(��xY\r_rÆ\r9׬Y#�ע�0��F�5��7��@4E\0�,N����h�o׮ݰL�*�����IW)�<[��]��h��;�g\n��$*��M�ۯ���Ƿ_�Fq䕿�RDuEɴ�d�ֆ�SV�WyhI��\\W��7i�dj��͇C�{o��V�iӦ%�Q:�8�@D!`͈B֡|M$��A� �����7a#��,Y2\r\n\'��b)|�kv57)v\\-�#ʦ��m^�lR\n��8K�S\\)����lWu%o%�,��/o��^.ʥS�OѠ�A�d7�E	��y7�/��ѻw�qM�6�޹s�D�E������zE)�D���\Z̐k0�#���U�^��ԩSWQ�x�j(oɸwy�葍{�r)�\r�`��ʲ�R�|I\\�R@Aq�ӊG�/J��˛���0a»\\}������)����)��*W1�SK�UzʱʣY8�{+�����斔tE����u�fΛ7��dɒu�V�Zj�-j��%F������\Z.���\ZE3z���: p�ȑn� �1�N�J��\'1�O�~\n�St���9s��o��F\Z3��@x�(f.y��I�-[��\rZ�s�ι�Y�����ĳ9)�\"BK�(tO��[<�@��𣡫�[q_ke%Җ��Q�t_������K)��\n�W�K�,�7���������k�{I�3׫��&OKQ#K�lK�Y�ĳ_�\n�hr���ܿ����ٵk��</���H�>}�bŊ��q�@0�f�3I-̿P p�ԩ�ŋov��ݏ 0��!�3@ji�^/�.]g��ݻ�Ǹ��󬒞>}�rMh\0\0\0IDATE�믿���+WV޼y�!��z��夬Y7/��C����1��iҤɗ4i�LY�f-�;w�F�j7ލ�:���rn�Z��G�\'���JA��2~���τ��������\\��oǯ�/�k��M)����&饰梏d����9���P��@�mhx��S�[J(eX�\'�D��C9֍+�n2����?�]�z���G��%�e�2e2��*���@�0�f��2�\r�@�ҒQ3xYL�)]]���2(�]W,@.�7�V�ȑc���eF�3���(��>�ə3g��y�v�G�kIPܤpIv�-�Pڴ��o^Cy��l�c]��_{���x����}��ŋ�?���c=�?��}���z�x�J�<|H���uo��g��? ���\\�C�p��:�WAi�M��s��~v%�6��P>m�[�w�R]�o��Zu��\Z㒮i�<x�s�l˶m�f��%�F��u&��Pa�0h��N�:Um��W���Z���g���#�Å\n\ZӲe��X�.f�A �X�|y�1c��;{��l2�O�Re-�K�������%tY�ҥ�5hРuٲe���\0���I#������{)�����z��+�W���r7��)��:��Ǡ]��B���W6��k�����xW�^�O������.Uf̘�y֬Y���Jk�b�n�ce���`���/�E9ˋ������ן�/�,+�<ڬA��\'h{\n,�wȐ!�d���?�@x p�ȑx�+W.٦M�a,τת��x�jiy���K)d^�h?,�]�w�����Kׯ_q߾}�6�9��J��<�K����������t�7}m\0��R���;�o�\\[:��r�<��P.�O���eN�޽\'���<y�Iy	��A & ��[8��(����� X\'3����=��C��џ\rf~vgΜy�ɓ\'�mԨ����17�� аaC��={���W_M\'�6(Z�Q��U�G�,돸9L��A�\rFy�����Ν;;}��(��<�PZ�9�.���G��R��OP$����{rߝ�����x)��ɟuՊ�ʦ�.y�߈�~�ϟ�V݋+��\\3.|0����C\Z�T��ؽ{w��>���ƀgYJX��Q~������d@����H�fl����׏?��ҷ�~;	E�4�x����c�s��ܷ�/;v��(O��G\"Rr�;)��O)J�n�<��G�?B߈�ك��tJ�-+����u%��ߩ�!��x(��w�ĉs��9�T�R�t\01� `G�(�v$�50��0�l�������ʕ+}��r�|�\"��C�E܏�kߘBnC�B=���\"F&�V�ZB�ޥrsQ�2� I���d��#��d&=��x�ÙSĻ��>.��F@}NݫT�\0�T��>�T�3�-`���㽹J�}��j\0���%�ԅ;vlo�d�ƧO���2d�GW�i�A �\" �k+���t�jIn;N@���˓֩S������W5(qoW45����:�^V.�\0�8��5k�޵k�Z���(BY�?��WȽS�<y�=y�D���q���UC��2�䔛���6��w!�i_giϚ</����\'^�x�u��Z^wA�`����x�ڵ-�/_��Q�F\'L���̙3��!��m���f3���q�D���d�	�d�iӦb�	�c��`��a��Տ���T��4p��k�d\n����-[���/��U������}��)`j�7����U#u\0$\'l4!T߼���R然�~����I����to?[|�uI�u�甁.ϕ+W�>� K �`�@�p	S��&v�T�h��ؒ�1>�-h���m۶�K��<H��dC��,�(���F�\\�@������Klw���\0���W�^��zE�-^��Z��esm��v��m�\'4�	��bKR:�P���(�:�hңG��H�?zt�����Z��������{�2~f�-ƧI��	�����Ϡ�(�ƅ�g:{��s��1�;��1�D�s�T�hFr�U�S�t��QPՊ��<==�޿_�Ubp�0����C�W���Y���	Q�h��z�ţV�Z6o���	�\n�M&:#2f�8�~��3@kr�WƇIEy���~��L${���~�K?�m0ٞ�R\Z���ׯ_�>x���:u��`���}��IiE4�B���~��G��\'N���!J�#��@#`F�#��\\�+<�3yE\r\r\Z4(x�޽�(05���,BP,u���9���<�g���	Q��cL׫V�Z­[�v�����D	�C�.}-Z��������ex.|N�P�U��l7��D{�D�0�?�x���m��!}8��8�h��{��3u��e+Vlߺukw�� >���ݹsG�:�*vD�s�j\ZE��\ZĐ��>}z�]�v�a�y����[���M��y���1W\rNf��袬J{���Q;�Pb�<#�4�N�/��r}�6m�sς���l��p�B}���;w���Q2����5��e[��>ZZ�|��}ͯ��zªU�f,X0����~����o��l\"D)FьR�M�1	�	&$0`@\'��5�i��r��D_��>z��*���?��:>F����bŊ%A��@nI|���dɒ��aÆ�*Ur%�l�foM��h�u��E�����eʔ�@�)J1������*���r��47�O�>�3�{���Ǐ������Ό�\0ew����x���5��f�I����N\n�!� �(���K6p���?��K�@�e2%���+��\0����%�?�d~�ĉ�,\'����~;�={�Q=z��ߨQ#}1~���B����ד?������簷��X����fȐamu�p��̈��H�sE�XU�֢$I����o�����Vp�t=v�Xa�7�_�����7@8�3��3���-Z ��K���b;3@$Ūdc@ѹz2�\\bѯ�l⽬J�\\�3���͛7k`)k�LQ2K�.��-[�7}\Zo�D���{��8eʔ�L:�V3(i2�O��!}��}&��޹s��\n*(T�PɅڷD�$69�R�ê�&M�L�#k����ýqN��Q4���y΍�y���BiZ��Y2��3P�B�\\Ļ��3J& ����/^�ȑ#:�19V���ӧ��hѢm�Q2��p�\r%��~xp���^��w\"�Q>>>k�ŋ�%��:4^քX�z�:ujv׮]GV�R���Q�J�;6�ڟt��\r0 	u�O���Uo���.v��XQ��\\I�h�[�Ŵ�ДbZ�«>���>*��\n�f~~Vf�x���B1�ɓ\'K)�!���`\\�\"0nܸ�( �������Q�@��5k���)d��#���t̘1��^�x�w�}�\'�~��e�!Vj7dII�Ϯ�w�0z��YC�Y�dvl����8{�JߠA�RL�6M���@�6oެk�&}$ `�H\09z񿥊�I{S��jժe��)�|X ���vl�[�?E�J�6�% �<<<r�\\�u4Ι4i�lܱc�Q2�PG�+��v��]Y�f�I�������ضm[�̙3�����Z}X��R�EVK��[�n9�>����X��6F�<�͘1c><�\0�Sg�]C�|&�cTucde��#��T*��߿�={�H�|\r���AK\\*��ѣG��Y��a�F�qA!��DT�����\\��e\'83/-!z]�~ݜ) 1��/_�.��3������{�6F��O����u�\0AO=�W�v�b�9���2eʔ�X�b��)��c.\n�J�.Ͼ./��o�-@ɬ��=D��#���$ϔB��B�bxtS=�ӧO�ɓ\'/ª�6��ǍWgd�1��\'��&K���4J&`D�����s`B�&��o޼��{���-cƌ���X�!&9�ٷR�J�h��,�7͝;�+�r�z��Pd�z��ޛx�oݺ��ڵk?=z�$ֿ5�ub���2�<y2�8�:�}�6m���4n�x6uXL؅�Y��-Z�h������0F�j��&�:uj+aE\"���+Q?�^ȳ�������<�\Z]�T���<s�7au\0\0\0IDAT�M��Q2+3�Y��g������x�6X�n�w�\'�|6�_�~U,�}�dɲ����(�?Y��rmLʹ���_O�8q;<��(�y�欟}�Y�9�C�tݶm[ڔ)SVjР�|�U(կg˖탊+�>{��N�g�!�\"��\"�L�،���W�I�&5����\\m�Z2�`����K���b�U)�it4�3�.]��C�x�=�\'�9r��44E8~���]�v�\\�l���Z�j�$I�I���q��G��C-��\Z5+�y�)�k��U�d��LX2-\\�0��u�`�@C�\"E�4x���G���?Z\rz��(�]�/_�p߾}Z)�t�+Fь�-g���xѳgϤ^^^��|}{�f,�6f�6����G(��	��7� ��zq^����?���X���wNj��r�9�\0��OP\ZO���k<��ݺu�\\\ZB����k��T�/V���er2�	˴�}�NlԨ�\0�F���ӧ�k]�v�;x��tZ��СC�Qd�+�\'&�,�:u*H�o���X�\r���Gњ\r�ފ����Çb��[�lYc�����=����ѝW���+V���~�q���*�:/��KT��s-�T�8�@ U�TX|��Dh)�{�:����\Z��M��C\0�η_�~͜9��{��e�|�u�nڴ�[����\"���?��?�Rj��w��gJ�Λ7o��ٳ�L�6mKǍ��u��ŋ7����kذ�p���a�_�N��(�U�իW����,w�\'�뼯AX=|��u�h֬����ׯ&��S�N]A~�&L�0\rzz0Q\Z����c�|�c�ƍ#��~���u�p�b�G�4r4��l�W�`���oݺՙ�S!��)B�G�w,M\r��,�(��`\\�#p���0@���,E�Aė\ZJ�zv̪���(���4ir	������Es\n�X4v�ܹ.5����ٶ�w�2&B���I�	{W��tۏ>��ώ;�q��駟.ܰaò͛7�f�~#J�܇(�+y���9�q[�n����ŋ������_���x�ӧO�ܿ�b�۽M�6=��d\ZY\nH1��E3&���K� �����K�0\\��͎�=S0�[� �/Xgޅ�`$s�� ��p��5��i4�����%K�$A�ER�L���5�\'O^�犉=�B!K\\>1���ŋ���(:�eq-�`?0���X����S�.�!C���50q��$M��\0�����q�ƍ�A<O||2�~Ӄ����Ea�!Q�D�ӦM;�����\\�p��Yz�С���{�,��XwFь�\rl�:�U�G��Ɍ�#�kML�s��~�~r�0�:ώKx�h^	o�bi~�Zn�����\\�X��*U*?������u(U�oܸ���x��q��Y��˟?���\"��\ny����e�������_�/_���L�v`%�d1@�N�i�-����W_�²|����>+�2r�\n�z\\�vm*y|J~���v�L�R��(Q��3Ԇ�h�7�*�#�RO�eof�e��[��y��^���*T�0D��4F*�5.\0=���@��8��׆Q\0!0G�u3fL��G�.G�E�\Z�c)U(0��w�m9dȐ�,#�;x��/X�\"�OSz�w�7��W��~���ٳg=���>���� \\�\"E�Xk¥�L&�@߾}�[��\r��*�%%]$</?|�pF���\"\\}h|P�w���Ç�SÛ�dʋ/#����i�<*W�\\i߾}C���/ǡV�P4W���+�V�X������/���@)�F6FP{�lÈ��dN�2��G��#+�;��.wss;\'N/���i��;�Q�\0Jf�9r��ڶA��؁�K�z�^�ݻ��C�Ma��\Z��:b}��͟?̏?�x�x��f���ِJ� Y)�QPSS�A Z�h�P_S�ܸq�qe�Ҳ���x�M�.�:�;�g�*\\\\]]�����A����]͚53l޼y.�n<(��X1;/[����-[�v��Q_�l�A� E32P6eDXb��[�x�����ղfr]�8q�-����hђ/�={�$��9s�,�-[�\n�r�ŵ�9a��v�}O���f������˞={�̙3\'#G-�r�r������J�S�T�V-�W_}�!�x9,�RʗM�4i���Ϟ�m�^2VL\'l4CR�G�(�ѱ�-#[H	U��-�9r$^�\"E�_�t�7Je\\r�Ï��.ֺ�)S�s��M\Zu�$�z���k׮%<w�\\�S�����J�*���˂�,V�&\\�������_B9s���/~G�].\\������	��`����������������:�wWW�#仓e�e��_\r_��,�}�Y���_R�>}ڳ[�nn6l��41tHn~|�kݺ�;�^��/�܁�8��.]�ޥ��gX�p��|�$�u��UH`�o�Mn�@��B�(���%L�8ѳlٲo�8qbJJa���?(�Q:�^�rE������W<��KÆ\r�l۶-��^2_�|oa��6m�AX\'(P`�9Ǐ�[�|��X�u��[������?�h�����ѣJ�*����+W�ܼR�J��V�ڀ��<��s-��\"�6�\nkȵ1a-��=�b��K�n$y�������;aZ����t�7h�`q��ٗb1���+���;wn�F�\Z5��J/\\�0����><\\Jx҅����YL�c��IV�X�|!m��:}��믷|���*//��<;�3�ة��	E3@6E8\'�d~��7�QJ&2@��beS?/��������(fl\0��r�V�J8a����M�֪Uk�;ＳK�jhh�媘,�(�Gڴi��iӦC�{�F��O6�wF��9ec���]�v}��k۞={vq���_|�{���Ä#�8q��o��%l\'�O�o߾��ի��߿?�2�<z�h ����׵k���۷�زe��	$���k��*�we��~Zױc�q(�Q@�͟??5����P�l�S�~�Lbj܁&c��\ZL��7�C���G�?\n��~S��+x��tn����Ĉ��1\"ֲ�R�Y4��V\Z�Ρ �)V����Ÿ�F`РA)�e��6ˠc�\r6�6��B����{�v�N^cǎ�I�u2dHw,�S,X�k֏�-��3�j3�����={��GK�,����%[�s��=�k�z�z�p���aQ-�Q��t��il�\nZ<��m�m����.J�ߝ;w�O\Z�۶m�9eʔ��{_&�\\�E�\\�q�F�l�A # )�$�7�f�\rac:,��A�l��\Z�J����Pl�Q�!��~��Q jԨ��q��eYn�\n��Ə���ի�h��(�?����BرY�f�֮];t����Q0��������XF�!����ټy�V蟳z���I�&�@�ڣx������Mƍ7�:��R��L�&MR�n���4Uȩ:��ؠc8�[0�Ot�W:B�YV�v��y�Q2A�8���!`M\'k�&\':�DA\0Y�d�,��a��J��nnn���(�?���tʟ?��,���q�@�\\��%L�pKֻP��<y�]��+X��8����z�l=��O����������F�\Z=�\0r\",K-ݶh���k���d�ٹs�^�z��}�vxo8_�裏�}��ǫ׭[�1C����,��}��Q`��/\'���9��k�!��Y�:�ˑLB:�/��v�����9z�F�bp&���L���D��(Y��Ei&Q�T&G�qa����+�\"n�����f�\r ��͚5�-Y�d===\'�?�����7@�wO�*�Jڠ9��ɴ�,S�j׮}���+U��-e-<鈪���o����O�4I����G���9r�����Kw����Ν۞$I��N��pJ�������/���<�{�U�V����߾2e�Lòy�lٲ��X�	���	�hF��\n�&���?Poc]���q���e��Cѹ�`�K�G$�@�Ÿ� ��r�̙�X�2`�+ڻw�Q���[�޽ۈ�E�i�r����=��߱F=B�S�Q���P,�޻woh޼y��I�f9����1�@����|�b��%5��l���?�X����x*F�={_�\"�\0\0\0IDAT�L�z��a`���?E��t���`��67U�E3f���E0�<���[�O���_���Rl�3hMcɲ+��/���#�Y�NP�V��y���Ur>J�x�g�4i�X�l�Ų����?ݷo��	�g�bE�c�����z�Z5j��8q������nݺ�&J+|F��+��/���ec�������rƌ����Xsw֬Y��c�~�9�9C�A �!`���汮�.\\p�ܹs��ǏO���]����os�\n?��ѣ�,œG�B����W|�l�4h�m۶m��\\ꗖ~�ѣ���u��ŕ,s~�q�F��\"bt\Z��\'�v��O>ل��e�?vgR��j`	Ż�P0Or����`�2��%�\ZG�̹s�v����w(��o�~(��3�\ZዀS���-&!ֺ0\0�6jԨKl��u��Kܸq����൓� ���=zt]�șX�ď�:���q��\r�:u�Z\Zc��69<b%�{Æ\r+�t���s-��~������<{�{�3gΔ�y���I��s5Iâ�%�=������.5\\���\nט�B�51Sð!\ZY����(�������)R$Ǒ#G�`*D-~g������o��揄K& ��U�^=˘\r��MG��t�ko���c��RB�u�IZ%�	�S,y�u��iy��([��o���q>.�駟�D!�������w˖-k\n}5@2A\\\rǨ���[K�������!��΁TT�k�\r$� �ȑ#��G1H���f�1�ĉc�y?�i���S��mN�R�JU~߾}�YƜ���\\����[�;t��V��ŋ�q�JD��ݹs�!U_ZwG٬������r��/V�~�zf��8�0a�7�܎a�����m�.�?��ѡ�9s�t+P�@�\r��I��!\Z��\"�	|�F�(�N�����G\0A��ܹs��aesg&�=�R2��OJ<���/V)(�8�I���aQk����F�ϒ,Y���S�~�:���On-Z��(���e����?@A����\no��z�-!�����+.m�G�M��|*\n�*�ʩ��^�t��7�Ȏb<��ٳ�O�:uu�ƍO�>=k�hS�@�0�f�p]*簞���h��L�2�ϟ?�C��0P��lJ���Š���h��9� B����<�ܺukJ�h��+���jӛ7o.f`�\"��Lܐ# ����s����:�3ٔ�0aB��ޡd�S���=\ZGe��}�u\n�S�A���Ь�\neʔ���ݻ��_t�\Z���O�������d8J�.��Q\"�<^�)��1hi\rD3QB��޽{��޽ۆA�\n�s����.��Pvo�ƅ\0�իW��z�j۸q��b�,K�,�Z�h�����GQ>\rg�\0�0F��A���ӎ�؎��݁�?q�DO¢�cq�x�b	oo���Ta*r������,�D	����2f̘,(��\"~�{���gG\\�h{̄������\0���=�\n��pS4Mc��yI�d�e��O?��>���*XT�u��i<H�4� uŋ/ҢE������$�ɏ>������|Ŋ����9���~H�:Ȅj�}��πjH�	�\"\"7�֭[g[�jUg�R�z�dr8�e˖#�\n�KK�*U�Q�F�\'��d���������A���HƜ+Z��ћ�	�Q���\0#�@�@@ �����B4F\0��ڿ��Q2�yxxde��EJ&����;�WR���\Z\0�g!�0���ɓ}�d6EX�9s�YA\r�V��_d  >���ޏO@\r�رc��(<�˨]�vʕ+W��Z�[M^V�9rӢEι�w����>|8���Ǎ�\"1J��{nm6�B�߼y�N�:u�WV` ����\ry[��B���3�$0�f4i(Cf��:u*~�\\�j>|xք�\0������&N2\0/B9�LF��.DΜ9���%H�`0֚�O�<yo���#�=���^��<Dj�{�j�Z�$`m�i���ØpE�%�\r������Ou�Q<���ѣG�4hP���(C��˔)�a֬Y��߿_��8�K�Di��$K�\\L�6��~���J�*i�K4�G@l�[�&�#`��߆��*T�y��\0Q�����g,��^\'	�H�MYIx4.8�gϞ��t�nB�|���>bÆ\r��ԩs=��N�>&���駟�Ê�s6[��M�̙��C�:n��ME�K�M�6��a�*!�J�*��(n�ür׳g�|������*Kր9�6t�A�~��\'��ͅ\n�o�0���h�r��O�e�=|I����dcK�y�[�u �9n t./^l{���۰܌�������Lo�E>�w����%�.K�k�/)���\\�ΡX��ر�,�5ǚE�1��===���:��p�ر������;��ȚI= �����Ȟ9s��|߾}Oh|\"��y������p-�df?�.�3g֙u]�^v%g伋6�kK��}	��t49��2���@6d�_���N�:]tJb\rQ!�W�b�9�8�:;�!�*��P��Ӹ-[�xV�V�¡C�&����*����3f\\��MY��V��8�o5��[�\Z�I��aڠُ�r\"�9�]Q27����X$xM�\"�SD��u��K�1398�������d�\Z�Џ�r�s2E�>����n|0g��8����:x��@˙�\'^1~���,��R��|�a�Dz�ݻwa֪t���P��p�!��J�*���n�	�ׯ_�w4��(W���e��5mڴo��N�B`!N�RYE3%�j2��h��Ք�<@����?�*ˣq���X�h:�����:�\0���ȑ#\r���&��Çmnn:�v��2A�k	��7��,����o;2�6I�(��#G�\\ٱc�$\rY�(�|(�Xg�u��5o�=��D��۷ow���7��܏�:��Ν;O�ի��~��\r�޽{�޽{w��A�j��>+y����������<Jܲ*U�����-a\r�+oG|鎕�駟f��j?�+L�����V�Z}��[4\\�T�\Z\nc�����Ȣ>\\5��~0�\'�a�A��E�U��%�(&F\"��Z��ׯ�����ic@}�@�d�Gq�%.\n�\Z��Fn׮]�<KC��	&�C�����Ӱa�D5k�|��;��D���K�,�P�̟?��ŋ�O�2e�!�&M\Z�%m\0����U�y����1cF�ɓ\'�;w�Pޏ����\'N��|�V)O0[Q�X�A�7�X�z��<;��=�ʔ)�#4�����-�G9m+Vt�����k�P~�U�\'!�k�tfEM�*�:ۡ\\jOiG���O��_�����>�V5�f\0\Z�\0(N��&Q�ԩ[\\�|y\n�CAHr}�葾��������e�������\'��#a�r����ĺfɒ%���������q��ϟ��W_���+�x�˗o>˰�7nܸm���3�m�ւ���/�e�PG��m~��������@�i��㪏;� Ny*^�_�)E��λ7Q����[7�ǒ~���s�=<<�����>���	,[�!�K�U�D�N���7o��%�6�;w�<�������>����c߾}i��...I�(��\'`��)k\\���Ў\'�9��I�h?\0���G���\\�\"��l�h�C�C$ �����o���1�FA��\0��}y>���������\r~\"&�x�x�\nj����8q�KS�N]޾}{�<��?��.(O	�\'O^���c2Ƴ�O��eo�������_��H�bA�4i\Z�O��v�T�\Zg͚�#�a��˗/�J~+�Qvr����|||s=A����ݷ����M����h�~���0�;\r0�%����7��\r�\r><�ĉ�={������9s�v�ZB�O^��ʖ-��@�Q�wKf�LF9�D_����L\n�\Z�@���@�o���}��h�蕇t��x/:��i5�f M�aÆ8:\\\n����Ff/R%��I��\'�A3a�l������\0@_��B��ї�Q�dRv�s���z^�����wM�6�߹sg}9������2Q�DU���7o����Ç�A�,��P��3�������]�r�����Ph�3>�\'��g�\0\0\0IDAT��\0JQ�HQ�\'� ���+�S)\Z�����ʠ��w�����?A^�=U3e�4=]]Q8�gɒer�Z��R�K�����d)n���[�Q�����\\�~��av�S4�h�\'<���a����7Î�5`�=���!Ѱa�ja�Ƞ�>�c�ڵ�ʕ��֭[���X�M$����Z�X�\"b�z)SKnGx/%S��,%�h��@�R�߿�-֤�X�&/X�@6�,��ӶqW�\\�᭷�*K�u�V���G�����K�̻�$kٻ��Ç�$�)��^�s�ҥK�Z�n�\n��a_��ݽ{��J�*5�իW�U�V���1~�H;����|<�k�8��+nnn�t�6�T�A��nٲe�P�hѢ\ZS:֩S��\n4�W�0q��lb<#����J����fG�%���륾$�/^�ȁ\ZܪW��({��Nxo�Q�s箂�h��:3�My�#X��|��N�&P�N��\0uvwwϗ A��X��:!���cǦiժU�6mڌ�B�v�F{_Â8h�СP�zb�t�ڵ��:���bŊ��o��mYr@N O\ZN�>}J�v�����tF�Ë��%Kf;}�t/򫃏���djO��M����C���?=+]/\\�0������C�i�jԨ�_��nsZ&V�oF����8��﯎\0��,�=�5�9;w�<�,4J�:�#��m�Q�v������6�aY�Բh�AX�&Y2ͯ�\0����.K�ݘ8m�u��Ix۩��6��0a¦C�Y�f͚�����w�]�es�s>\n۾1c�\\@Q{Ȼh��/,W_-^�x\Z�d(2�sdK-�2���Ƌ6�q�����\';v�X��{x�(������2�{��/|�vZ\Z߱cG=Vcާ�i�w��^�~<��ɼ��>h)��g��E�_��=���Ǐ����` pA(H�S�X�i�/���h����&�pa�!�e{q�Vk�>ê��>�ᡸ�\\Kp@`�̙��͛7�Ə�!J�6℻�FD㠌u`y|4�]��խ[w�u�`ݼܨQ�h? c���B{�/���/_��(�!s&\Z4�ǬY���`�w�wL\n�,Y�DV��XϓRO�N�[�Ç/��\Z����T�IR���*�I*�캓>}�^�~��x��¢؛�\r��Q4�A�*U��X�t6Z,h�D	�z(��>���4��F`Æ\r��j�D)�����,��e6\rJ��#i�1X�.3x),�1yJ���(ށ�yX�Ҝ={�#8&��(�D\r!��]�{9i��$ݑ8q�:(�c2e�T�e����y���]�rX�n�p.L�$I-77�c�z��Çw����ń��m�6��K��R��X�\\hgrՏ�����B���͘����5k֤�Ν{����o.�+Ȯ�ɓ\'�\\�|��\n0� 0���Zكe���<� ~@ ��~�ѣG�h5#� 8P� �d1��E\n,W:dz1\nF�+���{��hOs��*j��pVV�Ɱ]��P�\\����Q6���D��V�ݸ�\\�Ν;h�v3f�� �k��������\'B�^T�c�lټ�;��/_�<M�4�ݻ׫Y�f����ڌktuihC�U�}]����Y��M�p,�[�Q������?O~���(ף)ǝz���ܯaL1�}\0¸؃�Q4m6�AU�������A�|��+�9����ps...^F��i�Z����1(u�(�b�-��&�~!l�i(hsJ7a�(�%�Cs���Y���3<`{��(�z��u�nM��?X�o޾}�9η�qb˕����ӧ茶���YvN�5�9�I�h�ߖɃN��=y�Ć|������&�So�����P;///�z��$���[ۯ�!��|o\\ YҦ�)��\n�Vf�V4Y�rK�6�(6�	A��0�5�ڷo�Qh\0$��:mǎ_Eұ;�T.m��C���#b.�q�,b�cЋ?t�з�q��o޼��C��x�sѢE�թS�;Dƺ�[�|�&��Zc���iӦ7J�.��>��=z�xGXqm܆\r<�V��}XJU|�>L�Մ�\Z�u\na���`%�qN�d��Ç����+����D9Fכ:�*���t��c��ٽ{��o߾=�J���0��7F��Hv)S�����>���u�C��D�~�n���[���Ԗht:7f̘��}�^{�w������\"e��c�F%J�(+TL?~����9J��p�|���3����s��]��h�z��]�Ν;���և/R0E<���\'X6Or��Y�ۘ�2d�P��͛^���,�ϣ�#��Nǈ�u�~��D �*�={�Lz�����<���`� 4��D�K�\"E���g$֭j��������	��%�\'�7f@���� �$+^�����G��	ZR7n\\u���4Ž{�f1��hРAio3�H�����wn�p����9�W�^<;��СC��W�6C�̬_�&Mj�aݣpj¨St��mݩS��`0�!˴3����zs1� 1�U�T4+V��v��v,�I����~\\O�c��u�קO����ߗŲ$��ʠd��b��a����<��v��:�c����aI��k�8,\\��\Z5z�ĉ��޽��6]�u�W�8�*a\0Z��ݻ�Ip��K�6C^����uٺukc���>ĥ�nݺe��l�\'|��S<ԏcd��ϩ֭[ד��Z\0~^?�#�K݌38�@lT4�8p`�_�5�������3�<\ZYxyy%�:ujʫ������)�o,=�e�ZL��qra-�\0J�q�˱���������7D�����9|޼y�M��k�ĉK���#h�c�S���}���(��H\",E�Դ�\'J�h-��,��4i�����:��v����K��c�S;,%�%S�E񚈥VgF����P2Ӷj�j��;w�`���	BOjx�����8�@�E V)�˗/O�,�Kv��9�KIm�6˲��ƍ�jԨQ����Pr�S�d��>���t�md�Y�`p\nl,yQ�D�,\"�_W�L����n�)�aE<��;���&M�Ҕ�e�d�֭�2�;P�fM���(-7�=�leڴiSk&e	�I鯙0�Ѧ�Q.��3C�����s��)(^:� \Z�c�\r�cLqg��6u�I�	��xYo��cd���q�@886)�.mڴɏ\"S��e��bp��Q2��8q�\'g[�����6�=������ങ��nذ���FsA����D��j_|���_FA�V�\n(y���y��,Y��[�h�9?�BƱo���VZ��G�1!��X�ȋu��!���}�L��-/����>�S[5ZF֌���;�&ټysV��_�\n_�jU���X���B��2�T���y��Ȯ����u�\"�381J�L��ݒ$IR�Y��}��UYТ�Q���b��p+E��c��3x��z�=�Kr\rP��\r�,+��:��w�ƍ�\\Ɍth�X�p�L��pzƌ��u,%���_�?y��/U�Ts�֭+�V��Ҥ@L�6��{��S�f�>\'�\0�E�L�R����\'O.�}�I�&U ����Ź/��Չ\'�?~|ֱcǦ!�ĒA��K=4(�n�zk�Z���<x�5���������&L�\'N�r(Z�rI�,eS�<}��:��s��/���+�]c��y�[�pa��M�v}�w&5k�lR�&M�{������Ó�9ҡ��.-doeͥ��S�Aȯ��):��D:-��.�� |�0��u�0g�,���W^�!����۷\'!ӣ��s�N�gB1�u������/�����iٲey�!�t��5@q}\0�s���6)�Ѡ6P�����o0\0����#G\rց��nnnCY^\\@?t�=��x2E�.]��*U�1�8f�������;�	�<�9�����u���g\Z4h�3u�u��g�<�����3��٤��\"4oԨQ�w�>�kf�<y�w�ԩF�v�^iѢ���\r����O��=J湽{�f\n4b^0�K� A����������ӽ�g2�\n�xww+<Y�d�Uq�==��<��q�㖟6cڀ��O�ї���D��X�s�f�A���g◓GY.�/��W(Y�d�nݺU�ܹsy�*ߡC��]�vܵp\0\0\0IDAT-\'Ve�7o^�?�^�Ր|�QTC0l@Y�y>4��(�g�-��#��3աa���QX6OR���OP4t�A4$ې�D3E3�@bQ(���%�Bq����c�d,�����k�j�����X�b�K���ի\'�U�Vɷ��Y�fӚ5kց�L�50�R�N]�\'�|��a�A��\\|�s3�0}�%K梻J�*IX��-Q�\\*V��L�����6\0�w*W�\\�F�\Z��\"�z$�ϫ\0j\n��<+z��8JCe��5��<z�h����*��]�vJ�M^e6���y��-;r��Dh�\r~Rl�xxx�$�,r�E�}��_I��\\\'�\0�@��^?38��\\�\n�?��ǟ&����+([u�9�~����(H��.]�j͚5ʗ/?�.T�vNC��:��?��wߥ��0M��]��+k[�e乐�����y/���X�Y�\Z7�v����>���?|���\'�<~���ϓ��O�f��Y�\0�և@�%q~6a��ݻ7��=��|oo��������¹s�.\\�l�B�`ќ9s�����ʕ+=�09yX�R�{�PV/�]����W��P�P ��H~�֭���6xd�_��𫯾����9e{�-Q�D}���e��.�����������t�JJr�1�(8W������/��	oG��x�:\0����\'pE�����KV�#���)3Bв��\r�Q&(?@�+W��)S��� 6ڷ�3�Į]�~رc���ǏȖ-����Ӈ��#@^tI�*U\"�\Z�y}z����ɧ�~���/��b�={v�z��&q^pI�$Ɇ@�.���1X����p���u�,a8�$8�ꫯ&K�&M�L�2\r�^�,���/_~���-[����O\'Nܒ0҄DΜ9���cq�%i˾}������}�ݺO>�d�Ν;���ן��6�Ծ�\0�	�9�|�?��:7S��?�3f̘�v���6���q�^��.&T��ϟ?Q�|�j��:���m۶�ٽ{wk���z%f�风ɓ\'��2��~���o�\re�:���\'N��]�\"K>�o��ߊ���\r�Zu�ܹy������vʝ;wM�(N{���Q���#�r�~��\0�v5t���зk���+R:������5ҥ@�\nr�A� VĬ�U���hၟ��\0:$L�� n�x�>x�����6���O���{�����ޗ����Hb/���WVLK�$̏z^��+x�C���?���L{\0����ͽ7a����0�<����\Zr��������O�#�Y�9��	>��/dYxyy%�����9�/�~�ʕ�L F޽{�ᝑ����\'�ɝ�����<!+%l��f͚^��ZG��ɐO������?eS�a�\nA�{҇�\"�q���\\��%�\0�p�������=r�\'�~o�̙�SN���\0�z!9�A���8�ŋ�����3�����|!c�\'�6m:�#G�Jĉ��5&���Ǽ����~~~-��!<��K����5B܍�Hw��%�����\n�N��;��gΜ9����T�>-?}� 4�{#�f^�~=��a����[H+� ��@��*��4m�������(���4aPH�y7���6�mҌ��lݽiӦU��i�(|�����S����,4P�@^��RH�l�J.��`)I]�}�v�����/]��-	(�+h���7��Gp�5u��5iܬY���#hrKO�;e�����gϞ��@��vؿ��[����r%��P�oJ�7��%~\'���ѣGu�[K���ey�s��́�Q��wh-_�\'}�wI�\"E��*.Q�9�γ�p�d�r�~]�,4,C�dh8d�,(ۅeY)ey��6~\Z9|���^L,���M˛7o+�:)M9Qjg$���z/1!�^�@���P0|���J�*=��}񖚢+��/�C�ޅ\n�O�w��AQ��u�|%�tP�>�+G�r%�+M�g�>�6�]�x���ӧ���>��Ӆ����My���d\\C�P��bP����%ɳ$|T���߿{�ԓ�>�l~��קO���Y�����|5WW��6�]�h���\'eSx?��Z�vx\r>,O9e���ܗ��/J�K��\\��\\�<J�c���!���Ԗ�C��N�Vx)��8�,_v�%�\\��C۫��^�+�\n��y\'K�,�x�A����L�W�?���2�I��8q�6C�!�b��к��Ç::/+�����]�;xÆ\rϷ/�4�N�6M啃�Q����*��V�*��M#��7A�����#G�\r�Ɓ�s�gzP繌=�h���o<:���v���5T�߳>�m�\\���5��A�7�əƽO1��R[��4��\0��Wr~�R�s�?V�$�=�T����� ���{�z0m[,.�K\n,8���&�U��V�]E���\\��wM�Z���Q�����7��^��HSg����(q�֩�8-q�!�p��sҀ�do ���/x���睝��t�\\#�qm6���[�6m^�\"8��:�q_�\Zf�:@W�\r�ݻ7����8 �:P���iȀQ��0;�r]�dI//�z��!4��gQ^C��Ľ6�_D�����`[�w�k+����y^�}\'�k׮�^����{�Qu�C9����?Bx?����C|�)���$I�(�uڶm���w ��m+�(@ٿc�Z�k�u�__�5Ed#�����X�Юڽ{�J��@b�]2ʯ�.]�1�w����ck&��&��K��&m<ږr��6�\0�e�bŖru����/_������&��?�g	bY�eEK~W>%����oǎ_�0:\\�*n�޽q)�uh\0�+H*����m�9��>}����\0M�e���`WJ���}��-@����O?�-��%���勜z������{���e^]i���\"�R������G��K�^�zUcy9ϩS��SDP��R��J�_(j��ԯ���/!\n�M޴[2կ��}I,L��ڽ���C�^���_�jT�<_��`%W}d�4	��U\n�������O�C^N#���)����p������L��y��\"�\'rX����BF���tQ6dqkM��/\\�0�h�(g/r�4����K@�����x�Q�Kf�b���WuTx�x��r��NG�.f�|��^�\roO�\Z�=���,����C�����`ޔ�)��M�s�U)W�ܦ�={vDNN��0a��)�I�����7U��^r�w�ޙ�L�����(Z���{��x�����L��\r��M�H��A�:J�KĺȢ^�U����Ʒ�3h-\n��]���LH�GN��Ѭ��D�Y���K�Y��/��ԳS�⚊�>��e�k�(�M�y\nme����\"��������N�@����_�b�ې!C�Ӏyx�AV?/)A��s:�\'\rϭ��0J>\Z4�	+���I(��j֬�:gPn�Qz�q�K_G@}��c5�~T�6�{��O��/��	^�P�\Z�o�~\ZC\\y�+�2o�v@���ൔ���M�{�UA�&%n[0nH��GVK�Jw��Ա��өm�\Zv\'��7�ݻ7�:�#�w(��T����܇��1)uR�����׽\r��H� }�\"E��z����Y�f�ծ]�\0��f�+����48��?����c��)Wm%��&Z�`�V������a),K�7nLB�J���;V����U}/3�^мy�1�\r:�L\"�#H=h���^���E��\'e�b����{\"����ԫWo���gK��5�+*/�u��]�v���o�Ӈ�S���ɏ�gYx�ѹs�%J�h�x�b-��\'��y�!�ײ�,�\Z�fyp��!����dI6��~�;�ky�+���W�Һ�?rᵷ1�@��3}d/��r��=����_�R�2ҧ%;�.�Պ�g�R�z���c%덥� 4�.��fE��BV��U��<Ŋ�>\"����d�����g�L��qL�8Q�@�\r�������I��oժ�B���2�����&<��Kq�F����o�ʵY�f��z�?t��מnѢE+��///�gq]��k2���J���0�X��3f��\nH�2e�����kw��a�ϭ��^���Q\0\0\0IDAT[\'|�[?�mY�nr��`\"�\0��ٳgQڪ\'Q�Sn;�,�.S$S��S��Q�k{��q��֤��ݺq�[��V>�@,�	�\0���>���W<�Om#�W��k<����!��s����@>� .�R5f�\"�G�r^�2.�Ӳm\"�Y\Z�a�W�5�	����]�XY�?��;\r�\0�U���%�(S�鳜9siРA���K��\"��s�g�����%ο�;��h\Z:th��C�0����V�R�3@�=\0�=(1Û4i��$����?�����On�q\'??:g������j���ߎ��d�ƍ\Z�x�C0��ׯ_.���X(�1�H��A]����q�R��б�R��6:�:3���_���z���5���zP��XE����)�7	����U�����e��1)��=�N^�ڽ�m,��%���իS��%�l(R6	A;o��/��y0��5k�D��I�lcǎM����dɒK������ϔ���h;p޲��R����{o޼y9��\"���.�ӝm۶킏7��&�\\�o5�2=.O�<=�^��k�p.[�f�\Z#�:�p^��C߰��_�\"?�l��y��VWd�xמ�^r�w��E�B�Ԗ�?�)Y3����R?�֦�t}ɗ.]:�ѣG���\Z�����Ǟ���\0��Հ����s�ٳgU�A;�\'X7!}\rx[���_t���O�i�I�0\"�5��~�ǌ�Z����d�-���,Jf_��7��ߎ�hy��~���w2���W�\n��z$lܸq�M�6���\\��\n��QK�.�\\�竤�WWIJ��N����%..Иy�\Z*��c5����_�+{�J�{yJob��\n�ϒS���_|��p�䙈���(�#���������v6��#0����\"��L�UF���i��6x�5!�.k��7�Z�_b��>�Sb�n�҇��`2y:��^S�h�m�`9�ɪ�g�̙���`�u4��B�Ng��>����3kЌ����0�33��;w��F��m`��dX\r\Z����0�>\'����KPL�_O4�ht!}C:v� ��[����t�����Ν����>tJ�2!)�Q�J���k�ڏ���O�J�o�p�b�\Z8wGxd\"���1LJ�M�*���P{���U�V��6�����@F}��U��G����f���v��P�>(P��׿�����F�����i�vN x���9������%K4�!�h�䗄{{&��i�K�T�%����M\\u:1AO���͉i-�����f�w)g	�}����.��m��o޼�	��Đ���O^�}4x/��T=U�TK� h_ڨ�e��d2!�\"����]�=�|��9��Ҷù��V�i<��$��_S_ <<��MJ�T}G\n�V)���eK���l�q����!�x)��S�c�ZN�R��ȉw	���>���d����ؤ<x�`{0j�����\0Nz)���hehR6�0�2.A;Y�F�=��w#ㄖ�E���7�%��5�q6�@Z]l�qQ�8V@(��Z��,�>�%ڴ�m<x��\'N�y�y���/�!oҁ����q�[�n�̙3�q�}�\'��,��g̘qR�Wa��_�����Z���Ν��NG��l��;��Ŭ��طo�O�.z)!<���v�~�����T�lO����ܝ;w&d��6rd��3��mW�6LH�,��>E���A[YF0�le�\\� ��g*��WĪ��Tߵ�Wx� ����\0]5\"�XVe#m�n���\0K劃t�&�e����a���shޅ�E�����ć���Q���c\0k�&M�:f�������6A-=Y�B�U�\'��T��j�lv��W^�D�fU����)2e�4���)��S0{�Uo ��N���ōA̅+A6��7rߍ�xͪ$�\rֽJ�@G=C�Z�J\n�V\'����k��r��Iu�_?�C�ygBY��R�T����O�%���-�(�e�\"יC�	������V\ZyW�E��%ϯ���+}�A2�˶��J�H�e�|��.V��#���zYl$���X��@[*�K�ׄ�]�оO��W���8Sy?��Tg՗ۈs(թ��	��Xd(��	����֭�q���<��q�/_�ִi�-Zt�ACm̫h��?��{��75�U�:}� ����ӧ���?B���.�\n5��Y{)�\Zf\'��/��En��������Cd��&���\\��\Zm����O�\"M��Op�y�@�cO�O��I�:��0�|u�J��C�VB1,�<y��Ӟ+W�h\"�D` ��Nc���UJ��,��v����Xϡ����ҥK���Q_�vm/��z�W`�����d!	�~{�ƍ��%J�]�r�\nh�)-�6k�l��իAy�\nT`��2d�P������3g^R^yg��&�΁�Ё��죏>��2� ����e�޽9��.�Xc\'���\0cI�8�1$�|��k׮�3gf��)<�1,�ȣM�v]�C�ĩ�S{��/�\\�D�={�|��`8���o�%d�M���}M?�La��j�%�8�3D���P2߅9�c��N}4��b-9�jy�č��\"�Y�5#������N ư�����x	f�M�K��@~*Þ�:���/cI���^}��b9�Q�]Q`*Ðڧ���?��:��(~�t������A7��\\��Ϯ�to����x�:�K	��m��\r�C�|�CipHM^���c=�Y{��?�\"|U�`s�O�q���H��$3]տ%Q�-������+�i�B����ڋ�>J���f\'�h0��~�ALy�C �e@J<t��vX�:Q���d�	�����C�g�Bt	nri�Kp�RU]��y�VmU�%ieHhj�h���H$��Xm�\0˸xّda�#�ZʳgϪ�k�6��F�\0�װ��i�beIJ���)o�Y�@�ǽz�:��PD�����6�v�\ZY�v���Ë��������I�/�s\rȉ��S���A\"H1���a�7#��BZO�љ��*o�\ry^�찊�č���a�a�W����6-?�,C�w.%Hyɿ���0u�СC�}���M����&,�t�#��@H��{+G���r����r\nEC��z�:Y��ӳc���ǿ�C�C�#%��Rn��ZI���*~9q��@�,oҤI�5h�`�|�L�!Rm�=�WPR���}��AWY�1��gi=\'���ԩS�Xq���<^\07�3.\nq\rx\"2O�2Z<�M�\Z1b��#�d�AW�ĉ\'��Ҕ	D_���?�F��������%L�-�����W_MB�L9��V#r�\Zc��A �O��Vn��N{��Pd�rV���J_G�:v!�pKxI�\"E�1c�/��Q��硥K폳�H��fY`~�\nT��|���!�_�x��50�+�����rR��ۿZ��L�I��F	2���ܩ��ϱ9���y��V�P	-����p�;��\03��W�^�M��`�}6��G��J�����	�1(�����W:�W�Z���(ē�y)oѨ/�gv%�)�X������rZz��𨀀{��-�������R��\n�u܈�Ķ�����꙳��h�U��O�7.�k�\"k������^�R�д�e�	�M�⪿�may~ӇTo���đ�M��dɒ�6\ZGZ)��Z�иj{�d�9h�����4d2�5Xډ&G[蘦���K�R6B���64=�x�ֵ�*��k,�����W�R�\rv�&��/ě����>��g��+�?@AX�bT��W^��`�c������a�:u��n���CHЎ�_X����D�����CgFJ���#I�u���XP{�U�V��LS=U��<��\\^v�J�S��5��&��c\"��ِl�ɋ��H�iR���<���%H)�7V�Xa�׉���%|��값��D\ZYg������}hY�A�.��E{��/^�}��=���/[�lX�-���X 7t��3/}grb�Dsr�l����I�j��u�֧�g�&��߼ysƔ���Xq$��<|�o	���>�,�B�g2��&I�#p���%��\no鸹ތy��T1�h������(,�>G��G߽{��Ֆ\r�0Y\n+����J�&�՗��\0\0\0IDAT:X�ʚ,�X���/7:�BƓ����gv��\nV�[�|{��)L T�O܋G��1�\Z�I�4���W���F�,�,	o��$f�_e\"�0q���K|=kvd	� 	\n��[��W�Z�L?��sG:�:�+�P~bX	>Ͱ��d�c��~�� %Um��Ԟ��t�y�=���*=ip<��\r\Z4(���g�}��zГ,�yظ�f�\\���-ЭY��MB�[��IJp}�k)>V���A���%Kg�=W2y\"��gϞM2�Y3ЌtL�ߞ�h�^��h/�,���^=w\n��׆��N��?���c��W��	�I�2e:h�A�ch��!e\rx&��\0|�w��]��^�w�`-�s���}�ڈ�[���\0�U��x�>�{\Z>��8�x�Drx�i)_Km��t}\0��`�u.�&\0�j���r��]Q4�&�̢��hڵ0|d�x#@�-Z�����z����\Ze�)JƤnݺ����טv�\rώ#�����o�ZJ�\r�S�_���.@W�P��X%O�U�Zg���H��&�\r4��6����:m/E�\r:Ij��u����,�Sy��K�Ay��Cy�ӿ�בg��kGʕ+�.S�L�)]j#M��A���dGX�L%i�A8�U���Uз(e�Q�Z�H��ٻ^�t�C,�V\',HG��v��Qg�zq_\0���w�d���$n� A�Y��|��C<(�Ip���:u���O�>=�:�D���_O*a!����Ҹq��ȣ��%K����?��#�,�bm9�g�-eaT:M��F\Z.!s`�B=�_�vmy�9?�ӕ:X�m�u��7(Ě�&�>X�!�sW�n]M���K%0�$C�5W+u�j���LE�U{��@y�x�څH\09QM�|����`yR�z�8��7/��*�ހ	a.��``5�uO�PD~.5k�|�%�at�a�������s��1�\'�iuF�E���hS����B��E�-]�wq]FD\r:���<��?^{9�BWa:�u�%�I�Թ��A�Y�4Ӧ:~!�T���.V?�O��0)���4eH�k߉��^��C�K�޽_Wu�t<k6�?�++�unj@��r�M|/�\0��Y����~8}����\"�_e�|(��;p��l��Eu]�R|77l��>��+���z�\"^:��\Z�ȗ�A�H�����D��ٚl	#G�C���]M��6����N�9s�d(�mX���A�t��V{Ŋ��a��+��nUx۶m��o�~\\ժU�.����J�)*%ʊ�?x4|�&�K�Q�WK!Z��R��K:_d��ṟ��6ݲm�.�6(�䆮f�:y��:}l2�rb�3�d.��>���xoѥ+>X�gϞ���(_���k���;G��	#��lM	�Pa���t{�|�#���/X�`�_~��+}�}ڴi�={6��l�w��=��M��H�� �e����U<x��՘��]���w�΃L�G���Qm��D+WVb���P��$��L��c���2d����o֬Y�f֘:��X����L�t}��x6P�P����6�\'����oGk�\"N<d���S<��QΏ<�,XMD���/������>>O�1�d�d��X��%���t2��ų!.�Ar�\"�}�u\nbB@�3��4��ҥK��ae�69T{���ǥʲ�o߾�a��xyy�}���J�D SKI�F�9:�5 J9ȃ6�1Wg�{^YN̨��I.^��\Z�m\0B�0yMD�i��ft~�c���΅4��OXv�3���ZV0¬Y�� �O��0�{�Yn�J��䫟^K��:bGW�?E9�����ՙ��(;pty���_�>�E$問6�\"�8��t�|��R�7 ���Me��\n��.��6��f�u��{K�\"4�W{Z���de`��9�\'SO�2����)&�]���/�WV�o*V�h�Ϩ�-X��)�o����Z��O�M__z���]\\\\&�~��0�&��C4Y���_\Z�!=8HQ8�l�N�C�oܸ�\\��c���Zt���V<��ÆT�0F� �d�5C���2�ɛo��_�J<cƌQ�[�~�ĉ�bXƉΟ?_^k�Z�,���K�\\]OQd�k�悬ex��Y����|��ZA@��^˝Z9����,�`���,�ҥK���y���ݻwke\'�$z���˝��@vXc�eM��`��Ul��\'9d�@�t��Y�\0�!��($c���cz娏3{��אO��EJ���ۑu�CF�v෇��y_|���	+yJ��[�Dʢ���#�S[�įZe,�u��ڔ�%S�h�ӧOJ�cYA�#ϸ�yf�E�iL�H}�AW�x��M2lذ���ddU}���=� S�n2Nl����D8��x�+x�nN�9�<�Q�X.�%�5F\\\'�xfe�MB\\�E;g���f�q���Nc�Ө㘡�3�����2�k�aU�����I����!_�F\r7�n¬w>Y_&��jO3i�\"!,k�H�u������ =�l����5;4�[�b�L:\\�lٲ��,�c?�Cq��ޅtu�F��y�9hV��t/�o�!}��3����!�t[�lѯ��S�Sp�0Э��:��ڕw`4+~��M�6�lR��0�����\"�V��~^{��sU=�����z϶������\r:g�=z W}�e�O��fn_p�Ó���O?�4��Ux�F���,Ab��l�Q�W_���}�����Y��/,��<ؑԹ����5�2@��E��\Z�×vό�!��h���[a��,3�Z��?���h�Xuڀ�,;�P�\"�<аPO�&a��ZM�t�J�m(Y!��/^�g̘1_�V�ͭ�z\'�u���2�ߟ<y2!�|3��\'�SE�8����s��N������Z��r�,˵��x��l)5vy���o𿖁�uF�������#ͪU�$�1�\\K_�F��9�Z�2,�7������\'��Xz�h���/���(O�<�1:Q�Ƅ	Ʈ\\��c��<\n�F��~X�ؓ�I�-xs2�+d�X�b��R�JKY��X���A�˗//�<ґj:�k�����SK�P��-�Ǎ7oϞ=22��\"��t���>}�>l	��$�%rΚ\\��m꤭\Z��Q��H\'D�}=a�������|�~���5���d�f�w���ҥK����i(��<}���UR�%��Z��h�1A^��hox�E%Y����{�nC��(yW`HG�΅��R\0��Wp������/��%k*���_���I>0�f_��JȈqE�����,�/�{����ٹ㖣�!�,�G�h����D{�^� xh/�k�IM�T�U_� �]�cI��G�\r���踣-�l܉2Ґ��Z�+���Ii{����b�ۦM��E�8T�N�5�{K��6x�F��v�!�5%�ӿg^����N���\'��,��\r\Z���,�v�xϲxᢴmJ:H:u�����>����Ɋ�#Z�/UV�X�J��_�n]����3u~��I���_d)��H:�{\n��m	y�d*���;$�XG;�kh�[Y�C�C�P7r��\"�]���3���4j�(B�q�����F!j�`�K�rؘ~{�o��,4����jϯ.\\X�4iR/��6���Y/\r��ԭ[�\n��x�o�Uh��\"�������x9 y��&ۗ��p�_�U�\ZT>��Lxi�Z��^�l�$�����6h׺uk�e˖M$m�,Y�L<t�����-�k�(���v\"�&���呋GXY�8Kӑ#GR�����ݻ�I��_�~B��eʔ)���g��h5����,&�r�Z��je�c,|�qϢ=�9�ܟ�|TGM���>��_Sd�����������̊�sօ�䡼-,�њ\\kn���T%�3���H��_j�e&�+�-j��J��5���\r�qr��8�v\"���A\n&i㠽*tJ.���\"�xa>eK����*�;)9ѥ�n;w�����X�s�΅Ĳ!A�\0�ˁ��e�Һ�3���*(XOg���MS?s��<������kab���{���=�l��K�*��f�D\'NC�6(?��GL)��^i�{�%�G_�uE���]�C(��7\0\0\0IDAT3}��B�c:�������CG����/�{��ڴi�d�|��$0(A�V|:��O9�U�2h��k�q��wq8����{��i�(��:Hy�Z��]z�B���&���39���<��2gά�lo�`��SШ�v�뗜�KA��J9�r��¬��YWYudMԦ�/xT�X1�#���	r��	��G�m�W�[*��:V 4�c�����|�����\nW���Ж\Zo���\ZDyϡ\n�����^�r���Z����}d�eM�e-�\n���jd�eH�����;mڴ:M��ct�$I:��[\r�8q��(�-�-\r򚐿�?{�_Ф�Z�����4qC��k�Q�MWdu[�O�5y&C_h��i��˳�L\r��w<��^��r&q���[3�Vɔ|�^�z����$���k<�B�{��W!�Oc�&�K��|���l,C�*[�l��Tʔ)��H��C�/��͛�;p��L?�_N^��������t6�&�x\'��兀�L�ϟF2b<�����i�W�I3���o��`3&}\\⦜2eJ;�x���=���w��䙎�j� 1�������$������6�5��^��ݤ��࣏`r���98�H���~{�r�ktV��&� ^�i\\XG�&r\Z�4���:v8\r�N_SF\\�Ν;�\n*���dCB��UMZ\\)KH���	��٩,O��׬Y���u����0����&�fH䩯;����������\"���0uk׮�}�óf��V�x��q�z���[u�K�Z��yt�b³�Z�/�\0�>��:j���.����8;v,�v�Z���{��~B)e�u�D^���!�$�YΩČo5yu���!yZ�\\�q/k��LmMz-��^�[��R?�U����/W�\\�P��������-�>@�7o^)�áG�bM\n�r��%L�E��+��巖���X��Sf�R��3���۷�1���>\r��E�_��ޱ��:��.���5�H��VyR\0�����pxMnΰ�(ڂ�6Hx�Hgӯ� �&5���B8�(Q\"\run��lӦ��(��~�����ʕ�l�}�v�g��I�5%�VWx�	����7\r�����Ahk���pm!��o���8�B�%ox���ٍ�AK/�#L����0@G�եޥ0@��,!����d�`ݝ;wJ�6&�e�%Y�,�0�vZ�<-��:�$�ׁ��L(:ayv-Y�d�7n�#b�:N�ƍ�#�@���i)������EN}��%�pr8�\"E�da�\"��y�����(�Զ�ALV>�\n�d?��vk֬��>b�]�ݛv�R�%OiOk\\%o��h{����奲�Θ��j���駟j�q��y�0vh��/��!���${�;?�!r�r¸]��QW���^e���2>j���BFa�~ⲔY���+-:(��Ǐ�:��\Z�e\r����&5�,R�,&/��1��Z-?>��E�>�/�Z�c?\\a���Xxu}\r�%)RH��םz��7�9��{B�\'��P�LF>|��k׮�!E�=M@W�+e�M^���q�1\\��A�]�][輚J	��+�ʱS�N�-Zԗ�T�N%��mH)8�)c-�*H �3��C@�����d-��O\r��y����	��r���[�I���:������)��^���?���b�0��(�ԧO��A��g��r,�R�v\Z`�N��hr�eސ��o߾ןvqmРAxc:ʶ>��ko�\n��J�G���*����G��������N�#һӇ�Z�jU��\'�Dh0JC{�:,K@(��>ɺu떘	JW�3	K���oj�p���\Z��(�5`*�\"�N�0�P�+!<n\r�Yr��l}0?Z|�GrM��4�G�w��:�y�޸�[r[���T)rRDD�x�!z:w�h��ɍ��=���Qµ��,w6l�;w����D��q�`gC!�0��փ&���ܫ����+M�4	����R���_��H�d���6uJ���ۊ�u��Cd�Z�e�h�Z��R\'k�h���O2�����s%Ņw������C��p�޼ysz��K�Z��}���5�K���W\ZM��uR�e�e�)����C����_�r�|\"\\�XZy�����G��ղ6�w�D�ȣ�$du����>�Ӄ��ɓ��}p?<�Og_��EqY�����M-	GQ���j�\Z5$�B��-hO�в�FJa�_�t��m����+�&ͤ��H�����1�[_=Kɴ3���Ρ��ea��0���[GY!�;k֬��ׯw��?\n��Z���r:�rw�M�$^J�J��q����\"�ef��Q9�ʧI8�%�^J���$�/d�����έ��,ʔ�Ey��ڽ���կ-	+ak��E�U�M��~4}��Ȑ!�*��\'NޱcGH\"YDۃa��T�e�P!=K��a�\"E�)8=�\n%�z��c5D;e�OkP%\\8H0�cѯ:_	,a�g?���ˀ��4\n�1�7z\0͢\'\"\n�[���|��#��p�3�9r$�`mdLs�/N�:�u���o�-_��,Dg�����NX�$g5i�<}ǒ����J�no��CxS���c�?�\"�I��<)w�p�M����i�xO^}A�����8(泌��}ܵkׯ�W�@�џ\\��ٓ�>.Y�EҊK�֕�֞?��`������Ǐ�+�:wV�����I�8�Pv�Q\'�\'eUg8�m4��Veॹ��a�<�H6`\\)ԥΚ��Lȓ��8��C�C�lF����p�X?s2�/O�\Z�i���=aI���o�ꐎ3&��m�q��hۓ<$;�|���id���,�UVL?�v��ô�K\']\\Vj�={V|��>.�l�M�Q�M`��R2E��%�eY�F�N�h���(K�Ѻu����Rȥ�ɚ�}uVZ�5�È�a@�R���zп�c��B�踠<b(�3�Q�J�%:���i�-k��Zՙ���-y7��5T�y}�o�9�J�*�����޽����4ltTS?hx=�Hw)s=�Jɔ��3�Be�lݺuR��m�8=P�d-��}.��pj��H�2D�i����fΜُ<�@�e��,K@P?a��OS��j�K\nHzڢao��u�=��=�-����O�0a��3g��<s�B�Z�l�����)�6ʳ�\nK���^н��R2�ҕ�/8�2�����s���^\nϣ�/%�\Za�U��0��#L����ߥp������=0��2�5OicY�\"�BQU|�֮]�Zǎ��?���a�w���,�\nO���\n!����੟YeѦ�bGBN�)�����tY�B��he��?///��iӾ	OO��L�w�+%��\n�i��E|!�S���9�yU�<>B	���RM-q���l��ׯ�YJtYV�gt=�F�<�I�V�d�MA��̤LJ۰bR�v��R�mM���d�;���h�.Т	�]�s!�����ٙ��(���#�0&$�\nx����o�mbm\"�B%0|7>\\d*_���z֢E����@�	mZ�Bf��L�\r����A;k�[c�&[jc��c�J��ْtR���}��\ZCt%�7y�X���w�,�P���|\\���S�������+x�[����rӏ�Q�%V|y�z�t�H��f�x�P����~�ᇹ�|�fM�\'�O��ɓ{��\r	���\\-f@0��a����K�P�T�4�t���XC�qa0�G��#�\rc\'\"N��䭙���e�����X�?dȐ����>L���V>��,_����Юe%-��KnESF��jƗe�G��СC�+V̇~/�X�:��`����h?�ӑ_���\nH ��!�u�I�^�oߖҜ\n��.ڃ��JG�O��<B��n����Gĝ=���W���&�x?�8���R*,�|�������7�T&/-a�\'���ʲe*��»�گz��(�AE��ɒ%+x���A�]��Y}�z�W��K�I\'�h���Y�7n�`f�\rFj�˓$R����i;�!�Gd�\'B�`ejq�u�ڵk��¡}�?0` �t��H%���Zde�xM�bI�,�\Z>\0\0\0IDATY�)��lֽ����|C|��`���Ί�����.]��ڵkSP>*Sv��Նq��6�g)s��!�%cƌ9᧱E�=Ȳ�Z����VA��	�؏>�H彍��V��:�>��4���4$I�$:iB�Z�#�#���%�<y�t��۷o_ү˕1��*u\Z-�~����*/����]ɽ~\ZR49ԗ����w�m?N%�2��X�UG*��:gDQ�F�\"V��T�/�Ez؍7&Юա��/dc��!��Q^�12hrݵk���דt����e���zD9���C��F�pj%�H�\"�YmK%)+yC��*�f�I��h��|1��Vch� �@:�O�(ѐJ�*\r�sH�:vH�DV|��*(4� �C�<X�`Au��da�y��N���\n[yHX�����C��	��:������q�С�0j:������gL�����&MC��e���4:���C~A�����|���7a(-��$�N̚Z&��o��5P�����>ZR�I�\n��Ih�im,��U�ˤ�NT��F��eiҒ��$������Z�����5��j�����P`��|��RfEʯ�I �<�������E�߫��)xFKز|�Ԟ�38O=\\g͚U��i�����YB�YZ?ʷ�ƃ���B�dR/���n�\ZF��x�Oy��@�>D����:M���N��0}}�l�Ǒ٧U>�*����u�W���ڛg����=�sR��&M\Z��Y��F�=<E[��I�`��%U�T�h0}|Q�\\��x����O�LnM$�ݪ/�B�\\�AJg��E��ݴi�r0�K@^0����RDt��<�CPMХ��*1��\r\Z�e,XC��t��P�B��b�|��O?U���ufd6�m|䮥`*&�H��=��/�&G�p�h1�GѦ��������E���p�f͚!]�҄�\"�&�� DX��,����.���MY�E�\r�ay̆LnH3���T:�i��\'\Z#��*Gr)��g�3fTC!k@}��|���JO=x��=�Y����Kw޼y_��9�d�#:���y��\Zv�r�p�&����J�$����<\'N��Bx�g�Q��M`����J�(0�w�/O�R<y�M�<������Rj�,��_�`��7�o#sP\nq�2ϭ7!N����:�\')QʑJ�Rձ� ��6�W|�Ov��-ݴ\"N|:K�Y���R�D��R�缔�_f���s\\�KP��sk�U��>�ޥs���E��$,I���N��B��k���$��a	rܡh����k�X:� ���J̠��t,���%��	�ţc�a��}�f����RY��VB���p�����kגt�<���6��~�߸j���}���	��9�R�IK�)�:wM9Ѯ�舒��#��oRXH���{�qE8�{��H��>��0��L4A�>:	x��|`���6�����Ԭ0�#ҩ��.&ቬ�#�sQ�hk�a���-������oX��3���_�o�6l��i?�ȊE�/}�}:�6�0��%a���|d�(<�E�O�_�h�u�%�s�NE�Z)hp�L���t����!���N��\'�]�Ȗ-[&ѯnU�V��Dɋ@��߿ߣ^�z�ip�F8�?���} sQ��˘ �\Z���p�&�]�Mr��d	�6��6mڴYh|����c�Dۋކ��*5�y�V\'P��%O�\\�[y7�d���E/�A;�rݾ}{����!�V�~J\'���V�?$l��+Gz\'h���r���ƍkt�޽��o}K\0�\Z��	K��O�s�=�:�R㉼h\'8`\',Q2_���_��/��h]�ɀ�Z}��[GΉf_h\n5�K�.:�\n���\Z���jM�tel�G|J���]uhl�� �3ٖ%�Z�,Y&0��!#�4���S+�a��Y�ܧcX�[����_����.t4p\n]��їΪA�f{����A$Pd���Km��0��U��s�^q�uO�P9����gX�hQg�ZrЗ��Nju,�|�d�Ƚf�\\l*W�{�}�֭��˗���_�!��8eZ�F2x��P3Y	I���_+X�@��ܹs(P���)S�1�cB�Ϋ���>(v<��������HKeR�U\'���U����J�5jԨJ��Q�kfL���\n�Ш_�Яa�P��l��̍?>\'�p$�ށ��w��Ԧ:7U�յ\'N�1�pu�e���@U>�\0�EΟ�N�(\"�@?&V���^�ر��BEN�BP��E�?��aÆ8M�6��\0���ϝ:u걯�������y!�I�,�Vt$�~h²������|�A��[����{M��F���u+�`��\\n��Q��S�U�K�c�\\+4����D�A�k�V�r���>}��+�ܵk��&d)8]ٲe���\'�HS��q���[�iK�&�czr/zDW�U�\\�:��L�r���ӧԩSG��s�z��`ɿxL�|�����K��oy�\'`(�$�,^��uЎ��v���[o�A�I�k�79�X��k�>�F��֩߫�A�\r��ڶm;97,��s\"hS�+�䝌:T��o�c\n���o߾��Z\n���$�Y<���R2p�6�E��P+������ˀT���&C+�����3;/��?!L2 �j<\n~�����7a�c�q\Z�bNm^��Ko�a�r0�gK�^3Y���<��c���\r�Az)=zo��	�~��\'�C3Y��{1��:��M�Vڰ�4hPJ���Oԯ\'�@�X�>�\Z,T���Д#�=�h�׽���j�*m��Ϲ�l�r��P:�F���1R�Un��~.]�ty\r����\r�u�q�A�D��d�,T�%0&o�̌^e��le�ϒ%K6,�C��њq��B�*�E�?\0�s#w$L���ǐ9���%U=�pU��)m��C{{���5��:�]`^�}���M^R2��T`q�;�!�$���\"B�����>d+���޽{�ۏ\'J��)\'N�d������oLp:b����ѣ-E����˗���Z�e+xX�����������s���%��<�~����Ln��	jua���Ts����ҡC��k֬J�����}��i�#�\n`�L �<=�v)\n^�Hk�B֫��1m��2,�H�%]�4d[ڹc�L��s]���:\Z��/�d2I�M�.�����RMj��/�-��~@A8�?���Z�j9�ڋ�mbZm���pP�Ÿ����\\��z���S������\\m*�\nj%���O�%�jL��,�(g�U�V-t���C�G����N\Z��])C�hV��!�U�\"E���_�Q����Y�.���G�����\Z��3�e��&��E��}i�ߪW���t���ǻ��G�w�(ZQ��:�&Q���s�٘�|u|��!������v�0TB��x� Jm��	�b*�\'0��.i/�;�N(�da�����D�ѲBb!��:u���n����3��BP���y~lM�C�+���Y�Zv8�B#ܞ<S�T��9�]�Li��}𳖤��Nj)�n>`��V���QH_	Z?S�N�pqٮ]�6�r���Ug�*�t������*�K�?ݷo_h�eΜ9;݋K[ ��Ae�����\\�L�����uT��7.��j7�pGY��cg�iD�\'+�qp��7_�x�NZ��r\"-Ox\'�#���79��`$˕���A�Y�1cƴ�}��&�:%�\Z�էQX^*�>�AZ_��1m-J���^�Ț4�0�2���Uu\n���T��š\"Y�J�bŊ~��ds�R���p�ԩ��ӌ4��r�>o).(H������J���D�b�����K�a���K��Ǒlwݺus��P\rz��/��ų�w��Y��k��6-�\n\'y�\n`�rE�jF��^|A=uN��KҲ��;�\\=�%E�Ց��ϝRoC� ̆R�<�3���L�}��Pci�tC���ݻ_���t�KY���ZLnm�P�/�� ��F������J�?��?������\"���2A�����G���zp_��v�=w�\Z5J��W�}C9+v���������P�����g��\Zt����!�N�AK	sK���і����tz\'}�ĤN\r�)�f�;`�\0\0\0IDATHZ.�a�x*���j�%E@)��\nO�qXR��8q�FdhYs$\0Eei��=�G�~_G�O˭RTxt�)��Ի�v#��,�Y�Y�҇&��}j�i�?~#W�-���YJk�So��!t��sF�q[x�>>�w����ʕ�\n��ޅ�V�E��M�0��Y�-+n���lٲ���?ǁs!�8�_��A���ьV|��������xوR��K���BAȈ��*�߇ǳ08P���@ij�Z�kxd�y�n�ڽB�\no�߿��\r�}A���Z.�����\Z��ܹs��S�Ď6{^4h�|���f7���j��\Z�A�t�8,p�i�<(�v�����A�,�Z�Qp�a�v��v��u���p�¯�A�D�ڵkW��㏵4Z�����s�*^�xz��C�Kƅ`�b)7~�ܹk�7��H��������I}�y��i,G�b���2A��L\"�D븧_�G8�s��U�V��y��U2�1�\0��\\ss���\Z��m$����K�&M\Z���~(#r�\"����ˀ��b�Zi���\'�̛�0.}��C�\r�g�Z_��\'��(|�/X� /�q�U�-O��<]��WO�8�����.`�B8�6�p�se��-O�=\Z$?@�����ׯ�����M���۷OmHV1ӹ��j�k��U�Bg;ڗ��ԬL_���F�W�L�jV\"�M���0�����J�NM\'��R��<)�!f`+3�!��a��($��ܹ���R�Q�d��2���S{f�dZ�y��*�e%7��SV�Y���۪?�����cvT��L!�7uq�9sf0\\���z��o2��IK@�o�� ���EOW�\"%3���2s�B�0˗5�}_��`�O$�Ug����i����_�DBQ�B�3d�P��ŋ�ɫ.�� _��KF߁�~Q�R�y_rq��B�9�Νv�O��\'Og���C���Çe�?\"d�p��h����אe���\Z)������*\\�p��+Wn��o��,x��L�2�{MzCԗ%%3N�Ν�9w�\\/x\"���%�x����4���2��L�g����pAV�>��o� ����o�K	�\n�,���{���\\ޏ:fd)r�G}�;}��Z�4i����oݺu��V���o:JɒM��-�F]�\"�W�0�X�{�w˗//~����/��K�4��/��?�|��5�kSQL������^[|��%�4&	\'y�\nփK�m۶�����V��\n�J�K]�_�#m��\0}�:���ɓnٲ�ǿ���\"�\nm`��<��\Z����ȯ	^�j���|�X\"{�1Q��7��n������d�g]��3��^��|�uܑ�K�<yt��0\"q�޽��<3@�x�}����Σ*\'�:��ĉ=K|���k�3��s���W1�G���`�y�?^�t���Hx~N���N�.+�:G%x���ޅ�d9a6��:4��2ˈ��:���	\n_׿O//�10��0�EGMSZJ��UL��3���H�J)�l����jE�������t6ʱ+�g(P��b%���\'N,Mg}�����l_%�:����XB�1K� �H��/��`��0\'M��0��c\0h��>��M���V�s�����?���R�2�J���^>eT�q��l�@t�[\\���` K��gR;)�)؏���@q��p�U ��삲|�6}\'n�r\n���a�2��w�fl��LPfpجY3��^�	��a@;��~g���?�����{���f��޽{߄B���V��x�&M�4`�׾���ek���Yi�s�\nMք\n:4x�|ѣ=����u=�[����%{){��	��=$�~���V��d�����L����&o޼Y��J��#��\r\Z4(p������fq�Ŋ���zv�q/e�R��I�A�I��dIV0��_c5\\۴i���#���k��X-����#-W�K����m)K��5�+��������R^�v�-���:ZΕzj��c��p}d#���A������y!\Z�*�%GW�Q+>4jk�0�����C��L�pw�\"�O?����̹�����#k�����v�����:�ND}ё��/��o�-���n��/�EVǃh>����XJ�d��Xl��Y���uW�g�ޗ1E��_�ث:CL��˕+W�3\0�w|�wJ1�f8:�_� �N��0��4��.����4�X��U��J�M�O=u:1��D\r?���� K9iҤ:0�;��:�t��t,\r�´�T�O��ub%S\n�Q��7�W���ޣc�\'���Z-��K��jiɇ[�N;\r�^������Z`�������3*1�I�Y�w�:�H3�;����~���s���ɓ	�RTf8W,���u�K�:�R4I���ݷ���v=�+��cn�޽q[�l�\Zei�+H9�5!	EYL|�_k\n�jU<*�r,�c�1�H>�y��R��P�ӦZ�z��7���\"u���5�I�R��I?3��ݼy��w�}7���e���k8�,����P�}��6˷i����S����%]�oR��TNP��%i͚51�N���d����wVR豮�u埔�k���>�\\#�u��!��4�N����Ф��o�q��6mڤ���c�\n���K>�<�M�to&䒅�<A.��?}c�����d������+�~|ҤI]����ر��r̡�$C~v!�dhI�|��xiL򆶃`�49}�KW�혈�b�#��\Z%땧���@��dє<�W8A;�p�1cFj&����U���WJ{\\��Zc�Vm�_����7���ڵk\'�/KaX�Օ�=��6W�n�J�G�\"Ou��=�V��*�G�ܑ#G�i�	�6���0��\Z���s<�>2>�ĽV�����W9����[V�nٲE?�z*w��=Ξ=��.�D1�:x��M�IKT�����kus k��xI�l��K1�ξ�O6jN!%��^�*%UJ�}�/�R�����5k���	�0H���� ���:R�Cѡ5`<A(na���Ѿ_�_���;t�AV��?@m@G������Ս*��u(�t���[I���u^�lY*f䝡u(���Ω��7eY|�=�۴�s#��,�ʊ%�F�\Z�*��$��Q�i�+%�(ekʲ�B�?����m6K�1=XS\"����䥁Ǉ���P���P�oB��^���IB��C��Y3ϡ8\']!K��Gt��I�v�YV!k�YN��>p���-Z4�\\��p�G\\�Eǖ.]�?x6�={�$�3ǘ(�i�e�V�W^�ЩS\'}�%��u�R�J��;~��d�x;K~1+\r�(�]	�>����T���yg)\0�6ӣ�&ҳx���D��*^�ziÄ�W�n	�4��%�,}и�����W�,�̡�\0ͮȳ+W��܌�r��(�ʃlwX��/]雚\0$F>)�X���xѷ�@{�tTƪ���?~�ĉ�a5���2HV�;������g��t�Po�~h�qվ@��\0��Nc�&���J�`Ș1cI��Q��N\r�ZiO���B{\'5�Aơ|gΜ�	�H,���|w�d)u�_�].-gk�_t>a�S�V�6��-�?/�P��a���}�l��Yi�|���$�ߦ�Ŕ�q^Jl�W��x�e˖}����\ZW���@{^�-��*9�#xI���W���G����o�.Z�h<��	�̟~�I+����\Z�cBEQ\"R����=�0�:&�g�/��QGY#�d�bه�WN�Ho�B		�L�ɪGt����b���f��u�4b.u����Q_\'����\0f�������.a���\r�h�l6���\\lO�)XfWD���3�Q��Ws�Z]�B�����(����򏖌���ܥK�6��Z�S��%\')eV��ZB�rT\'}���k)\\�I�0�☣��%���`�kw\'�/��/;lC�l974�n��I�/���+���Nu���1Ǥ!��N�1���R��2R���q����0�΄�����Q�]�;�0L>r��`�x)��PE_�[��S�\n*h�|�rr0\n�_{���A�#iw-���ݺu�5�#Fd��C$�B�$���/��1����?����	cE�-��0��/��5ȳMYbb\0\0\0IDAT�#��W�jժ5�t����\0�_���g�	vz�ICj��M��:}�ڣmE\n�.�7o�L��B9)U>�_�*ٽ��G���[���u�En��0����n1���K��*`��xŊM����[Y�T�u�S���t�Sh���h�Lb�ٚ�o�D�M�q�ƌ���+�sX>3-X�@��S��	iG�(��b�l�z�+����de)yv f*��b�������[˹�>��zW��8���ȭ͒�����C)��0�\'���e�Q2�|����V��e��qx�ȼޒ��/��(���XeY3_Tb��c��СC���\'�6���5+2�5e$&o���kL<Ȼ��\'|�y܁���������W~��w���(�	�@v���\\�ԩSm`�F/9	OY��(:�AʦƓbԡ���\r�O��,�t���y	�:���/o)B�+V��Q|�}8��\0�-���a�RG��R˸�xNČ�*\nFm�Q��{rB\"�<�&hy%K����rs�I)h��З��(s	��\\l�&Duƒ�M�o���	\r��O��\'�^�g��I��5ZF�=z���o�q��h4V�(C�t��\ZP%���>)��~�Bu�^��+EBK	�Yu�5����\"i��ݻ�G�K�Q�3xY�R��A��.�)\\T�g�[�C�oŊ�)�\Z�&ɔ)��,�*G=�\\tC��M|��9�Ct4��ƻ��1�\\�r]��|�y����ӦO�>K�p�H�Zi���}�e�AF�%��k�.]��T�R�c����?�����	��M�~�r[Oݾ(ܫƍ�\r��dM�9,zI(��͛7���Rvl�aY�����`��Eܻx)�~�I9����.X�2��?P���G�C���Z�Q��1hרQ�L��h�/g�\rV���O�r��(�e޼y���O��|k{�����n2P��?=<;�R���q���O���9EG�=�#�L}do�0a���#��{����d�n��&��V�#.+����r������J����8j�Y����[�bEf�NGZ_d���{`�|�U�俌5�O���i�*U��,�%/M�2V�G5ֹ��sRkO��\'#)~�Dx�`�\'�s�<���~�\n�ԯQ-�k,��ԡ^�yV\\Y�7s��b\n}��6mZm�{��euc��ݻϓO�s�ѽ�t 큩���5�0)����)��g��<o��AC����(i��aW��:�Θ��Icu^����ܲf>ݻw�C�E�`��D��ɓ�a�;�2?B���%�K������&�K p��>a	Aʙ:�:���^�zy0sk�Eh�����.%_\r��(�-�h)��\\ǻ�)Z~6��=(t�bɒ%��L��g�I���W\r0��jR����`��0\Z �*K�v�?��E��p��YY~Cx��.ͬU�0M�0I���\n[Y0�\'�(���ѣ�,R�H��<�F[N��9�߿_ޓR�2��K�Xeh�2<�I�-�|̘1��A�E�F�i�����~[���HqX�nb�{�����R�j	΋��O��\na��ʧ�M��Lx�kB?�\r;תU�%�Y#|}�k����[\r+W���j�:�U�v�jo�9�L�2�m��E����O�����V/Z�d������<�~\ZD�M�(������?�,�r)�ɓ\'ے%KF^�xA���g�5Hvդ1(\Z4�K�%�4Ֆ�\n!� k����*\\]r�sM�\\d����YI	�wXɤ=30�����D���2eʞ�ŋ���������\n���>B������dj�~)/� -H��\"�\0���h����Cr�t��B�\nK�\ZCK��\Z��Ig�D?ءծ[*ynw��H^�3��HGh�_���#<���/)kZ�Ѳ�իW�#ϒ#�,\"h[�}���A��S�G�U���OK����@��D���Wʥ�Y���}q��F���B(,���_�.,������#?�֡��w�~Q���R#u���M�m4	s�h?�?J�[�������(Y��/��Rt�#!��J�D��Ҙ��Zgϝ�䦃�KX��� p���w:��/��~)\n�\"�4͎t��zK8ks�f�(�N��<e�|LY!��3�e�r�v�\Zs���{�M>r��6�iV&Z��e��<0�5��~)�:�c/O��[���ӧ��(7˜9�����OͬT�u|�N��M�BA��\nT��A\nE���S��\'ӱ��ܹ��f�v\Z����~š^�E�2}�*KuSY���2L�T�R�Ϝ9��رc���&��oM$����$�Tx=���O�ً�ס}��]�lٲ�}����5%<��2[��S�\\%$�h�B ���_���<Ņ�s��s�:�Ĳ��E��F�[��ŋZNVX��ҥK߹~��~�{�ʕ+2q���5}��/�}oc�)����7۱cǐ�[�Ng�}޾}�~���e�%���>��}_����}�m�:j���;ў��{��z��3�-n���曻�����\Z�ӓ�O4���o~ս{w�L`�H�{ҤI��8i��=W���\'KV���ς�h��5	�DT�*��@_�K�̧0��������\Ze����4q��B_�kr��DGp�I��E���N�͛׋�<H���\\Z\nj2ۆ������z�~��Z��$_4<%#��%p_�R��Ę-7����Z �u���J�VƁ��A�XY�Y��jB,eM�s���c�L\0t��?�Όa�Z�H�6�~��*Q�,�K?-��=;ً![\nY+\"�R���H���VQ(�1�����̘y�}g��᜹��{��|��|�s�=�H�[�t� mqu7d�Hf{�9�A�;],�2��#@�pm��&��	�Ɣ��J`�ꕮg��/�\Zו���0%(M���ܚ5k����{�i߮]�7���<���\n�����d��\Zsd���(�s��O������Z������j�$�Pi����B|,�h2���e�ڨhi�aÆ\Z9r�phFkI�ҥ_�<�p�eh��%���~�_#,��Y�-K��PdR����	F�hO\Z�b\Z���H�,V����4�4PZ��O^�䣧)-�$P�9�������]X�f����o�)z��q�!�\\�\"w42�*�Is5�\Z5�*�9��߿x�Ν�lwL��+V��]�vmj֬��Ȕ�&#mX^������#\"���8����\rn72�u��~�^zysٲe��һ}K��\Z�|�@���8�gfʸ��%_�F��Y�_�R�E�`5�O%���_�Эڎ&>\r&\Z�2Z�0Hm�;v�L��>ޫ�۞|o���C�\Z�5H�%L�k�J\\�ڳ_��iyt���$�(�\n���\"(�P�+_��N�_�����$�A�>̄-��n&��ȴ<�2a݇�ȵ~��d�xݜ�`��y��ޕ;W�-	��bbK���2�\\s<���\';�n4�A�k�It7�ƒTPc�ڮ�\n���hW\"�7!�,�^K|^��,]����#�s�����-����E��dO�������4˗��#�|����V4Z=P��Pc�SuaZ��ou@���s���燐WiSM��@���m��R���w��ѹpQ>�����}��A�w�B����2��yz��w�T�[�jɘ�3��*�cm͉˘��Q��V�J5v���$�IP�\\J�߿�+ǫ�QF��$�a,�?��a�Վ3Rw�:NyiK��ܲR�~��]���k%��ԑ�T���9�}�&��<�o�ر�Ii��J��8[u��qd��q��u[�pzN�\"�$p��ùH��P���z�|e\n{Y2�>��k�.�@T�~�&�R��	�kӦM��+���I4Y�f�K?�4��r�:�I\Z�~\Z��P*C`���lZjp[0�H� ݍJ�W�\Z��IE��eMV�3S_�)���d���[o�E�f��@��x�7V4i�D���)�Πg�\r\'��e��`Sʟ2m�y�R�d��0nܸ�Q�\\�W�t�ι�ꫣ:x-N����~��-�#��s��J�?��-Z���u��L���\0qO�K�w�J��#�2]�α�Fa���努X�Z��r&�&ӧO��DyI����E�� w.�� �K�u_񄃎�{��>yb-q���H�kă�IY�َ\0\0\0IDAT\r��x�QG���t\Z�d=CY�\"�Zy�W=�� �R�JL�Ž�yڙ	/��������ۙ|�u�С�(<��G�\n��)z\'��|�Сo ��8��qiiK�4�).�������Z��Ӟj�B\\�\"%.ڲl��Ғ�s<�G�Q�X͵ȅ>�n���8ڂ+�8��]Ip���q��Z�{�*W�bSu={��pԨQ�зj�t�M�x�l�	r�d�1��}U�c�\"�޻Ӹ﮿7�?\ZWK�GcⴠͿV�J}�����s;���{��qw�#��!�9��S95@��	�.�)㹗V.=d*T�z0�v��Ԓ��C\"c���i�o�WW�(*㎺פ��}FY]E�ն�Τ䔌:ʧ����Y�Q�F�vE�z�ڻw�K塴:[RQ�#��1���^��d�M��&yy�+���W����D�ڦH㱻���������5eh~Rx���y�^xᚁ6%�˔)��={�P�9es�?~E4�9v�؋�N�Z~ʔ)7�h�y?:��g�5�G8o\n9�K�\"E��7���8�In0�eZ�:��\Z4�����\Z���&ٹ�e&�$㾡�\\\r@Ih7�R��`%dnCC��.8Ѳe�ΐ��������.�#���BV�-k��MrȻe>#����_�h�Ν-\r\ZԔ��u��m^z饥4z�_���ː�*�xmʮe\n��縒�����K�Z2z��X�K.�����ݻw�����).�1�&���4@__��AE��O=�ݻw?���~���?���Z�\Z5zK�3f��VF���x�;��kE�8GO����fRM�D�|�A�ہ\Z����$f�^o�*ёz]I�4Q$��M�w\'#Y����_y\'r�m�aR��J����ӧ�ڞ�I#?av�r�2Y�����ѣ�x���S�Hc��@�1-�R�J�� ��СC�^A��U�Ʌ�M��9��9�sr�ڝ��.�ȋ����(�k����s�S���W��k��k�>\"K�2�w���ƌ#b׀��� w���.��Qk׮Ms�<3���2��:}5�v����C�Y*_^��l�a�ߗѷ�[G��/cL��_�����٩�����/�CJ�#/m�v=c�Qz#�9�_���pj;������J��x��62�����\n�x��<&�̿��RH�����UC�Q�#<5G�#O͹�Q����3�СCϧ}6c��͸u����>�u�E���!��+@Y,.$�v9�u�r�L��P����:!��D�^}$�.CGG�>� S��[Ƴ���:s�.�v¸q����Ѕ4��q�G��)zU�g\'��\'�(1W׮]��իWS�y{w��a��O?�<�;��\Z�c(�9��\\�Dy����J� �|5��GO���A@�UJv{5D���b54��=���!��\\{�|������o�\"�X����\'O�z�m���7X�$҈���,mzr�������������w�?x�5�,Z�~���\'nK�<ꪁ�8lk#���dS����u}�o׮���iɒ�(����}��y<��I��u:��%��џH�~���]����̟g�}��Z��7ԪUk\ru�W�\"��J-+w9���c����̵��4nyRK�S�N��֣=��ۘ����\\���y\r��K�h����I-%e0J�{��u��۪�,qi3�M]4�k�\\uR�Zf�����ͩkyd��1�_8��7�|y�\r7��J=������	7�5�տԯ�q��:��r�Ô{�\\:Ӹ�v��Dq����:z�+�p�ĝȭsY��Z�s���?�$�������ܝ���p:�_�~���<;���+��1���ջ�nkUY�=�g;H慳f�jK�Ǒ�w�W�O������i��\'J��9�:���Go�;Vh��>c\\�GRz�י�/�8���7�6� �Yg�X�{F{`��{�sOD���ի=���|\n�z=ȹ�E65�IN�I1g9G�=z�x�4���8c��+W~��{��D\n\0�c`����8��\"�u�۩z�O4F\Z@�ו.]Z��}��Hi�Fr��\\�_I9��������pM�=a<jĸ�⪫�z��/P�O!��@;y��+<�@���=�����d7�?��pϚ5k����4��2��\Z�\0����c�2��K [i�b��r-q5ѩAȫ�˫1�+�(�:5�]�<E<Ο��#�َF}���_|qw>�y�x4�qynG]������^l�n���#��c@�N��C��ŋ���S7���<t�D��`X�$�\'������	/�R|�m۶u\"����������{��hg:dR~�B|����\0�N�{�g&L�\nҖ��/|\ny^a�*�D<n���+�Xe��2��ꏮ�O�����d�W$���u-_죏Vw���� ))\\�h����ЏzU��&O\ZL�Z��a�f�kErʻ��U��i��@|�;��좐��Y����8�F6�>���Wp-9���6m�T���ϻӞ�0.�U<����ik:�\\�� �ܓ^�V��!-��ب���E��n䥧��0�#�ל~]E{��\\�D�>�)f!a.w�-��VE�3o޼����v�;3M� ΃�c��C��r��r���{�Ϟ=[�_٬Y��,5~�xY�J�Z���b��Y����ĉ\'�Q/������y\"��9��Ya:[26kO���<�/�%;�����(}D#�ʫ�������#����v����,����Z��w�����SmIW�������%K6\"�ڜ��ǯp�v�e���O5\rF�����7�x�[%K���y�f�R�O������(8�8�{Յ[g;���1r��믿�����֭[��z��	B8$ۉ&\r�P�\n�+V��ܹso�������h�i�3���ï l\r2?JoH}�cq\Z�ئ>�iIZmܬΨ�3�|�#�j|j �\\��)�^}���Z�(G�j�q�J��93���Z���4����jO��<Q�@矅�v7\rX���s�(P`2���q��������73��3�^���λv�Z��3e�਎�q/��t�6T��Z�jE˖-�Dot���ڽ��+ϳt���Vur<z|��D�\"�W4�u�i��F�\Z��_}%�ۚ��V�h&����O>�!���ɢ�a�\'&�ڐ,�:��I�J�*X���OFEE���a��Q/\'$ľOdM�ں�+��O-g&�n�b�~BN��L�Lr�̩^��/GN}Q[ųl<J%=ƀûo���z߾|�����kN?��=�8T�+W�k���y�f\'�A\r�c)��p�r%��9J�`�WR�{�3#l�{�O�b���5�i�T[Qy���#?m?���x��\r��$KbD�0�m\"S��)�e��{�W�q���\0Ah���(��s����H��0^�N�;�i�\"s�F廽���5�\\s��[�l�(d9ޠA��m۶]ҰaÃɑ2vR�򚢇��o�%6��X���ѓNE(?�\\_���8ȋ����<�ir��x?u˖-ϓ)�NYN[�\\�.�������^��S�>+ό��\nd=J�uQ�O��}�l����/1���Se�-���7�|������J)�yN��H������S}T�Y�+V�X�|��-_{�5�F���~�l	��\\V�$�#˻;z(K���8=�ٱc�����~������Y�X���� @N*����\"��Z�J{9���������U�0&&f^Oiqtz��Y���\'񵭁\Z�\Z�|���!]jN\rD^�J���\"::�GY���8��p��#Gb�����eӦMkY�W�P�o����{}�ȑ1�K�3�s��}��u�	tfYZS.g�ᇽ���z�Z/�Oܳg�P�s�M�6�y�|��N�N	�,�����O&�$J��I�A�����D����;�H��굲u����v�*~��q+���x���e�U�J���X�χU�\"r���_zc������{o<�]���2)�ʓ������˕$��&�󈨨�^xQ�������?�,_���\'Nz��Q\r�\"��Aw�Ӓ�ܱP�eBLL��ܹsk_>�QMꪻ��ײe�7��[fm��m}�2��A&�i`qW;v���N�k����o�\0\0\0IDAT���-�OTZ���O����Q��\\k�jN]Z�s��y;����up�n���4&@�i��(��bɐ�3�tW�<K�3Y}4f)�HY�8N��X8��߸�R_s1�D��v�g�>|�u&{:th�\"F����#�V\"i���#e����ׯߥ��]��\r���V�Ò�>���C�-Ec)o\"$�n��+=Ah8u9���8�`�\r���H?Wz�sϔ2:����m��Mƛz�!�p�_�+���}�1SK�øa�|)ϥ�N��K�����k~~gȊ|���P�CX���.,X�F�n����g����m����U��JWE���J�D�Y�\n��\"�K���g�:u�<�(�;t�����H�bN�a>�Cw�J�������S��@{^�����TD�{�g��8�F���<]9�iR��B:�U������F��j����Ӊ�z?�UV��	S���΢�e٩��kY_�C��8��u$�M�+H�Ӧ������sOhn��^W_}u7ǿ���^,>��1!K�mA||�Z2mˢ��˙\\n{����^�����Q�J�F̳}�Q}խt�5=��%�gt���\\����i�ײ�\reʔ���t���^�z�D��a=��k�X��Q��\\G���Q{I�A����!�y,��y�e��ժU�L{�>�T������2��gYV[�(O\'m&����k||����{�)�袄�մ��\'O�M;p`�}�]V�K.)���/�<�sO�Q.W�����h�L���.��%\\��.+�t�.����&M�t���[�\\e�Ʀ��}*��v����%�ۑ��0�U�4�������qǧ�R�۶m˃��+z�7F2�G����чkN)��?�\\ho.\"8V���8�8��ϙp�ԫ�ʎa��XG�����a�Vh�P�ߌ+�!d}N\'�;�Ù̫��󌧑]t�����h�^�ꫯ�n��kU{\"�W����@_צ�\"t�%�0r�y�9�|����1&�O�������� ,,,=���,w^�=�9��+����\'����U����9B����>��v=���tߝ�\r��.]��}���J^乏�^�{!~N�����iKs�5kjL���s�|��$s�,�hM��w��r���b9���B��4#�wB֏s/�X&1�FwH{7�jÆ\r��	jQ�wS0�D��W\\q�`��d����#y�K���|s�o���~Z�rJ�ڂ�\"E�,�ݻw����oe>��\'-��j�3���\r#�D���c�O�^�cǎ��(Ui07�ϟ�.�\r�\'$���^~��hMxC�;��:\'�\Z�5�*�^Pyob�C\'���ۜƧ��*t�J4�j�ɻi\\m���:]~��%���а[~��g˱jzk��\'��r�d�z���rڎ��亼Q�F�!�����W���v\Z��i�0H\"���*7kPχ(�\r��-�ܢM��1H(>�=wXS����et �5L��z�n�W��*�RbY�����>��t_�~��+��Gx�xK�&L�f�I��wdd�\\�ۯII�\']��v��m��+�9..���+?�H���c1�^zU	+\\�p>�+�>t���j�W~{�QKS���w{\"j�:,��N\\�Ց/,K�\\�p��W�����>�\'Of�F�\Zu^6���E-^�8o����b\\i��l\Zz�;�X����������\r��jo����G�0ɮ 0bwzL�^J�i��⤿��௿�:�f��ߐlJ������`&k{e��\Z{���_�*3��2z�螏>��^R|�{��g�%��� ܀���C�}��W��L���⿘q������C�±;�1�ĸ���`Й���<ew�P��\0�\\��?�xK��C{�ոq���zkG���L^����/�w�^�\Z�r�� n����ٿ��[��Bʿ�7r�\\z��2�H��G1���S��íZ�z�{��\"�D��%��<P�#�P��[�n}��:�!\ZR�8Ã�m6z��]I����|��i��;����:Yg�ƍ���\"����j�ȩ;7����Eh�䩉3{J:]\n�̛�W��3�2�AK�`��@W߾}7�8�Ј�+�� �Y��d\Z�����3�2D�2(��Ӭe@�ES_�]�������{�z�	XgZq��3<�2��HM�@ƺ �<�+xʟձcǶt��o���p�u7�lҽ�� ��[�n���b�ŕX?��ܹ�\')���t3��M�)�抧��!�]�c˔)���˱�\\٥K����82�aYh 2��;w�4���e&�:gTɂ���7.Wb��訾�WpItt���{���?U�tɩ��IE��i�����r%��]\\A{��V�`�37��#�+Y��V�߭[�nw�\"E���Ke�j����C����|\' �y�ҧ��I�\n�;q�Đ�iڴiQ�+f�q��ɂ9�	��Nnړ��%ع�	�S�6wꄿ�\n���0�.W��iw��6�k)q$j�c*�G^����l����Q�a��ã��h�Q�h��[�9O3�-mѢEz[�eU���+WbL����pB�b���	�7�{:n߾}\n�\'��!��{�̙�de�;�r�9���G��!���m<�V������R华S�yBYwػ��s���≫>�e��i���n׮]�p���rt\\Kߦ:tcEl�%K6���f�`�ξ��=�*�\0t���EX��5o����;wN�,����#�oӦ�c�KS�O4��B��C�L����gA�\n鲝hB2�]�V�iy\\������,Y�l�\Z@�	�w�4Qs�X0u�.�ƦN�N��N�	/��5+�<L��N��	��^x�Cj�>Lr�a���ה��ze\"Ѐ1h� }58�An֏wY�X��՟��ց7���F�o�q��[�lYDs�f�:t�#G~8p���n��߿�/d��d\'}DǛ��Ǵ�/!���9��Jbr,����W���\Z��0a�!kpӶڎD2Kg�W�r�˪�kWEt�?p�����,�f�W�\"Ma�)0��,��%�z����~�9�S���Vd�\nw���i,Y#���I?@Q�}r�1��Nښc�d�ss��Fm�\rK�ѻ���#�{�I��?E��:yl�ʨw:��E���ԃ�w<p�EYoa��`Ĉ\"\"������掳$�����<�\\���/����ֿ�#z�D��u���ű`2�:D(N�K&���u�|Of\nK9��5�4v����/��;�7\"������-�t:�$槿������|ɜ�u	�6�#�N�|?~�^�����]���lGW��F��	���|	65ZuN�Iv�d�t��0�$�a��S�X�����	�ȀZ┋�H�d�K�U�*�]��/u�ɰ�8�N��~O�2��{�D��B�&!�>�eE8K�ٳ�ə3g������\\�l?���/\'��_z�-&O�<e���ݑ��0�HҮ��-�*� ��9q�	�ڜ�+ҩ���9��G.Z�������Z��9Y1��_Ebo���|A��\'���	ɱ����!Uo�g�p>b�uV2Wz�O��²�ofҪ,�̤�������fh�h���<g(��*T�\\�y��y56���.Wb^<qE�u�P.�0���D��.�!H�~���E��3fLN9�MY��bri�`�u\Zgw��0�� /ָ;!>���՗\\r���\\sMm�gм�Y�t��J����e��]�v��{��>L����H�r	jSz�����$�����=���C�� �z�p\0Z�#��f��^I��H	�-�?�����\'9����!��hf<K\Z�\rE����ߠ�\'O�ˤ�t�����s&��@�ƍ�eu�*.��!�B��@�h�w��I/��p�E�k߽� 3���W�L�B }!�~��׶?����;v�]��Ľ!�\'?��~�Bư��=/2_D�n͗/��[�nݼ}�������n�U��p����8uړs�t�һ�\"��玣������\0�9m����ڇP3�;\\�(����/Y�����O����G鋃9C�0�����Y���`d	}�{���g�͊\0\0\0IDAT�뱬�US�%A~���B)%Ο?_ēK�s1�]w���8Y^+̛7O_�愐I*�C�~��sK�w��0���\"8����]������_R�B�BX�w�}�ԪU�Σ�C�4�Ҹ��`�`2����/�Vgi�2���ǎ�X\"�X��+��,a.]Ӗ���IWLLL�5��F\"}Y�ȶr�w1)G]e���q�ڣ�8r�&?��uQ�9C�0������Z�8ЧV��,��D �aÆT�R�.d@�Բ&VMD@ֶ�!��&yyN��U�ZuGT���ԣ�{�w#�H�	��n�&�1><��X��|ۉ\'�D�s�ϟ� ��|��\r+C�:8�A��o���^M�4iY��\'O�}�ԩ5&M�T��K^{��\"3g�,8��1y���ğ8qb���X�2JPf�)S��r���EƇ��S���G �p�I.G}r�]��m��+��KڑC2!��D^����޳�O5~JӨ7���E��(�ݴi��[y\'�sG;��q7�tӇ��b)\rC�H�MM)��i��@  Pp���֯_�����Ĺ�n|��~�T��5�DN$L�xk���Y�f�+�*���}uce+K����y���z���q�ѣG��GDNU�!j��\\�F�spܢE�^mݺ��\'�|r,�Q��O<�İ-Z�С�`�\r���\"ڦ�^{m��={�0`���z���c\r��9VW�G�5X:��w��5;w�\\�e捻��ۦM���;���1?�U�V�@����6���|�2KR�>tr%ur�¤��r��9!�ǹ�娞IX0w(P`i�h���m�zZ|͚5�.f��,��\\s�e�ѽx��k�|�MY�)*��h������k���Rm��8\'e!6M!Wa]�`җ�I��=&橤�\"�\"M\\����Y��WN�6�WӦM}�e�Y��?~|1����c1���\'��%�M�c�Dv�x���f9�z�6S����C���O�;�{���� ��6n�8|Ĉ������СC����o�a��q=nРA����c�c8���^\ZŲ�0�\r���w�?�W�M(�&���F�KR�U�pډ�A�$�����YG^�HZ�Js:�%n��h�j�Ç�3m�mx�&���W����>*\'-��o�=	�/�esd	���Vu,�O��gh\0�qM#p�h���c�s>{� S���_KR9&}�0p�T~A.���gPׁ�s� ��R�%��}�]�,U��04�(,���������7�M�.�C0�ݱ\0�Y�\\�9r���Q���I=w	�J��P�<e���u%t\\�kaQ�8� �(�:��R�޹,@�·;�*�����S�(���T.��#�xR�#��\nw��:�<��.�Y��L�9�^�qXZc��u�I���u�V��6��?�R��(ؼ!�e�+��Y��2�\ZVC�;*T�$C�Ң���bv�\r�6��R�_]�p�ԩS�����e�{+b�Z�j��g��.	R%�.��($�=<���x3�G�E<$ޕ�X8��l�C@�G�9��S�J*��r�zu���R���r��^޺\'R���蔯��V�*L��b�Ky����_��{�M\"�!||�\'x�X�9_��U:ny���ٳ�~���+V�͗_~iyތ�d���@��fH��*�.��\"G�ѯ������O\Z������.&~Y߼>�SV�������i	��裏f�$�mx���s�\"���\rY�v!�b�Ӥ�X��h���k8\"c� K������ԉȟ��\"��SW��\'��\0w��S��uZir��8��\"�H��-���Sȱ�#��̈́�\'�6��~�F\'I�L�:u#��eh�z`Q�D�mv�ڥ�(��c\Z��! �h\n󁁀��<p��#���T?�ka��y�h�6�O�!N�%��?�����z�����nm�O�J�ޤx{Y��OoH\\#�Q��n6P�&�q,�9��q߱z7m�RҾ��;*9����r��L��O�,�ˉ��-�q}?��C2-��V�T)�U�V��G?�.���%�����b3f̸�͛7�S���e���!`��hZ#y �y˔)s������ 	k��F\'�d�>�ō��w͚5�V6�ؤ�e�Z�9�?�V+��	��%\"����8߈�\0Ijϱ-$i�\Z����2��Z��Ж�sqd����ӳiduLӟ�3�˥���o��eO����%��E��Җ��e+�ǒ�W��X-�5���nݺ8��]��]�b3gΔL7h���ʕ+k�$�2ox��%2΅��s!d��\Z�K�<�u�֑T�,$�m	��0	�9:����{AC2��kԨQ=���q�d���޶m[���9�pB\"e���x�}�ӶH�q���2��6�B��DEEu�2�g?��������B�R���	�3�W�/�\"�\n[A}������,��rH�1)�n��n��n,�w����t��E��\\�$���\'�J�U�V��s�[[�lYdʔ)�i�S��\\��|�C �П�&��I���p��݈�9\0����\0�~�ٳg׃t����0�Rm!+����V;���dQ�-/x��bԨQ��k��5�Қ�k׶y��k2`:���gJ���4�x��ȿ��ԗ�Z�ބUz)>��-��������x=Hhˠ��koM��Μw�?�o��׹,���V�>��_Ƌt�����������~ãx�C*�b٤I�����v�<�ӦM�ͱ��G�s�ׯ�ss��!�EԷ��E�g�sk��5��)�,r0!ТE�˶l�R�:]�@��ԥ��ws\"��&f� p�n�ر����?aÆ\r#˔)s} V���\"wZ��{�n��n����S�ꤍ��Χ,z?�F_�ǽu�o�������o�oǋ@j�\\�P(?����G��Ltˢ#����[�n$�<���y�!cƌ~!�	a�8&�O0��Sx-sD��6�e��v��-�U�ܹs�c�������p��b�N29���\"�f�-Z��.��9���֭[g_}���s��|�-�t)��\\\nO��qR������Sz���G��իW�f�ʕӰ\\�������7�\\��j��*.����^��a������ѵ��4��e,���R��f��X�����<����X&�\'���%+����ͦ�\n��y��+V�x���ۣt?oAل@V�i#j׮}×_~9qo/Y���_}GN��*���3�D��f��h���*U�{��A}�Q�er�ӓ�t�<*�)�e�8}]�N���oׯ_?�y�捧M�v^� �5=�.=�Q�FWb����B,��~�a�����D�@  �2\Z��_�x(Y���?ټy�\"���߀�>�2���\"�r� W�8��ג�<��紝P�v�c\r��o�iݲe�֍7.�WHԳT�\n����[dÆ\r�-X���|��ŝ<yr�SO=5R�k�ң	c!��͐P�UR$�C�Mv���4�����|���3�Owµ�bP~aN�2�F���+�bbb&@�+����C\Z4hP	�ㅗ��2H�\"f���۷�ݫW��!��ؗ��9�������R5,��!��0�T>���G;<�6q0	Y<����j��:u�s�޽���\Z��N��D�B0��Ǝ����Z��;_w4�k��������.�r뭷���Șt\'N��lٲ! qidd��u����t��\n��}����*�	�,�p&܌��~,&\'k��Cdws\0��W���_�A���\\F@.]�r��^��埥��/Kf@����۱c�%,��N���O>�p����Rz�}����I\'W\\q�e<4\r�`�J���&M�$��4�\rC `�4���ퟵ����?kmR����*��K�[!�MN]����0!�\\�P��h����o8nԨQ\'�;6�t��7�߸;v���;��w�~�0�<G��x��]�v�5�[�ϟ?iϞ=�Ҧ�6j��&��<(�%3GZ�j)�4�d���	�b٬�R�!q>cƌ\"��\'��,�;?-	��ҥ\r�{���M޷o�1��x��.i˖-�6l��-��2\0�����H�\0\0\0IDAT�\r�sȐ!�4����#GF�;�^��Ҿk���Lb����ٳ��S\'6�\"�`�A �D�;��@.�f�(؊�	ƌ��E�OB��|�%�S��<�8Y�7K& d�a5K�0a��k�n�%sֳ�X����F]2\n��{�N�:=��\n�G�I��;��U�����d�C ����:V�C� �r�y=z��f�!� D.��.&�D�?�R\r헩l��̸�e��.[�l�#�<�L\'�iŁɟ?7�N�\'Ff&?��9 �y���S綾^�﮷LHH�ܴi��\rZH���cf.C��mB�@0#`D3��룺���j�С;v�3�����Ĥ��	���O��I�f��9}��Ieʔ�ٜ	�5�\"O1b�K�7�1o޼ܞ�miRG`���y���� ���1�e��7�tS��y���?�\\����e�0�B��fJ}�;�:-kN����Ν[���rY����\\L�_q�%��d��\\VhѢűM�6}?s�̹\nx��6o۶�	�ا�����\n*د\nJV]�J���m�v����\'`�or�����s觟~��A��o��6k�\0b�H���B&{h��ٟTJ9��,������ ����Nۆl&b�ۄ��E�şě�\"M�4I8r�Ȗ�+Wv,X��s��[�n��aÆW\n*T�T()))����V���p�׭[7j�Ν�˗/�oy��mJ������ď��=g��L�9+��nd\r��D�d����z���l� �\Z_vb\Z���@��`֠N75����[�F�+V��bt�СC�7n��6�胯Ӿ}��֯_�/݌B���q�f͊Q��`��ĉ�8p`j�%b����%K�������1g�@@ `D3 ��Bz�J,����B.�E��缗	�Ԅ�6�sɏ?�h�Rv��k����o?�t�jܸq=�zSr�;iҤ7˗/�zԨQ׬Z�*��@@{�V�\\���ٳGp��f��������c�}���\r6h+.ng͙Y9k�YjC��a5���c��\Z,��\\��6�v%$$�X�U���\\G?/y���\n7�M�����EG�իׁb\'��Ĉ,u�ڵ�{ｷ�/�x+��s/$]�^�.��!8�\\��+[�n��X�h�7��H�לu�AtY��\0� �F4��]yM� |J��C���$�4���qqq�Al�Ӓ�f�Ě9#11q0�]��]�Z�CG����k@�ڵ;� 0 >>�w��ݺu�4`��aժU���O4z��\'+�j�*o�T-Sb�&�:w�\\�y��՞y�&���/�$��p�f6iҤ]�r��۷�]p�*�̔��0/!`D�K@�E6!D���o���ڪ�S�L�����J��N~¢��0�����X莭X���9s�L[�re�3f��9��m�֭�3eʔ�\'O~�����;�1w�q��jպ 3e�cܦM��뮻�����3f>��2nܸ����I�ISyH�Q�z��ڵ1s���7n�m��5i2��\'��5K����ׯ�����B�\"L�ڌ�aq��~��l·�d��9�v���?8n���v��ݓ�b>��͓\'χ�[����OBF\'~��ˋ-:�T�R�J�.]�{�*U�Y�D�reʔ8w��/>�������X./��FGG��Lv���_��ן|�ɶ�c��<���9C��X~~��M�S�	��V��))�lq!q�XvL���t���Cx# ���9	Bvb���{���\'O��T�f͋J�,y���g@�r�������q[�n���o� ч�5ȝ;��,/_�iӦb{��)�aÆ���B?��c�ݻwGo۶-�7�|	���g	�G�o��۷G�y�.�s���l�R�nݺEEE�@�B�{���?\Z��dZ���x\0��\\Yn��OT$N�\'N|~����>K,�( �3F�{=܈�?��d;HET�ڵk���_G��$�Lqd��Q������	���2U�,����W�>\na\\�믿vB�7�r�-���·X~���ď���ill�˴�),IO)V��Ċ+����k��{A^����+WnYmH[��c-���,[��ښ5k*qL��^�hQʮQ�l����������y��mH��W\\q�3U�T�����w�e�]�r����/]��Ud�@c���ʘ�n�}�����r�E�� �O@N�{�jI��w�����!�[��Íh�VS�����>hР�Yj�E�,Hќ�����C�������Bf�r�[$�0��?A\nW���}R�\"�S���{�`�֭[?���O/R��7X�O`�\0�W�8�!��@H�>�6�.���y�%��w�[7�|������|��w�=G�͚5��5u��͛*Th	y|@[I�EX �s�L���w3�Ÿ���Ou�ԙռy�g���W����������Kǲ��r����n�0�\"\\ьh�>��6�L�\r���W��L�M�o\"�s;˨z�-�\0#���n���	S�L�c�ĉ�O�6m.�n��6C��o;lذg������!��I��K\Z�_��*H�j��*��������>\"�ڑ#G^!|�7a=8v{��\';���l7x��\'L���� ��N��3�[�s��!`�D��fJ4��/hժU$��\r��;v,b��©/̓\"\"\"�@�\\z�[޶��Pt���^Ϟ=�v����>}�|�w�޷ �� �#�?R:`ƌ}�̙�k޼y�^{��^o��Vo�{c��CxΟ�8pժU�hgCI;��_�ԾO�k���x��#ܜ!`�@:�L���M�>�+$s���$�X:[q��S[������!���;\'�Ė-[�4m���&M�������������G�\'n���x-ߟ3c�`��!�o���h&Ca\'��\0�@��ˎ�L�̤�^###e�܉����~K2����4g��!`��`2�l�4�e^^�,ÿ��� �]H}Mg�LY����p=�����s�}/�o8s~���c�@\"�D�&� l�)�Ɍ`��e˖����.ɭ0,��br+io�\\��p�Z�ƍC|#�1g�fk1�[u��$��!�C\"�I����MHH�w�ĉhU3o޼.���QQQ����\'�}y�ќ!`�Z���\Zw>�Z���t#aG�@���+���ow�L���xn��.&��������0\rA����`.=l�N�ܳ\\=C���<��RF4AK!\"c�:u�Z��\rV͆�̼�6�S��;!��r�/��0Nͅ&!��DB�mX�\rC��0���ڰ��d>v�رg ��Y&�R�r�w3ql����~�����Df�ZcHF�D�v&�!X�,}���7��`\\\\܋T�@�<y8�r��Ü���q����S~~�0l&C3�?D ,,,+���D2#�������駟�?����T�a�\'O��3\"\"�o��A2�Z2��?��d����0C�0�鿺	�<���̽{��z$���]�	�Ýfy\"!!A{e���Q#��d��4���i�,�!`ds�=u����G�Z�*W۶mo^�xq{2�s�����ܹs������{��W�L�1gx��-�z�%�\0��L�XrR\0+;s�h&��N����{��Y�ٛ2�ǒNg��劏�O�ȕkCll�(��7�7g�@ \Z�^+\n����*�L��Ҫ���!�a�˗���_�������\"e�$�SWa_C6�s��MΊ1C���5��!`D3-��xp2A�PoHf�~�a�\n			��BX*��ar�m��s4-\0�9C��^�2S������_�7��\ZC1	�0K�OD�ꫯ.��O?�����S�\\X08Y*��b.���+@Y*�<��@H\"`CGH��*}\Z�k�F4O���C`���ѵjժ�y��qqqqUr�ʥw1��`�x\0��\'���+�>���I����XBC��#ll�#e�(F4s�P)�eD���o]�f�h�\\�+>^����\0\0IDAT�K�~�ǅa� �5��>��}#���������+�0|���-�@5��4�X�\n(iE2���jk׮�%�\"��3s9[q�����/�ө�n���%95g��!`����`Т��^�z�*˗/ɼ���\\�9K�h�%��\"##�d���ȧ=���.�[$+/u�/�߰PC�0�#�~��@�L�2�ׯ_?�:܌��iI��.�����\"#����%��I�M��j.���� R�U�,�$�DӦ�,ai�A�U�Vڲ��֭[_���)C��NfB©Uq,�IϟY.�9���}�^��M�ֻг9C�0�C���oSs��\"�۠A��&M��Htt�޹,\0�t��J��C8X:��~��c��$����Y��;��R ��0��\"�̔�x�� ��\'�I�@�z衋�{ｧ�gȉ\'.ʟ?��K�C2]�#^,�o�sk֬ϵ�����C�0�\0� �C������*�,�z��+͟?�Ĳcxx��B��ѣ���:g�\\_����|���oZ�z�I&%�|�s�Is�ȼ!`3��6h���nF4s@Q��@9P\rW�ƍ#x���o����,�?��T��9ɓ�me�|%���]��<����H3\0a@�ۜ!��*�`��A+Е��%�T,XP�w����Ġ������A�� O������ͫ�7ہ���2�m�8�d��\0ѕ�i�@ !`DӋ�\n���ԩsaTTTa��= �����U����|\Z^�/��}̟�?�����<��9�;�D�c�zJth��ԡ	�P�*��?���h�s�\n˗/���ѣs�^΋���6���9����8���Gf��i�.��%�^�t��m7��d��U�u���g��ƈf��,�k:���R^��R���G�+�{%�>��a}�a���30�yv�2��@�,.�&�02�@��jF43�,�!`�fq�]�$�F��\r�uT3�\Z��ji��!`�@�#`D3�!�}���`��!`���MЂ�`��!`3V��E��fȪ�*n��!`��o0��[|-wC�S,�!`�\0���o@iE\ZF4�!`��!�r뗿�[o `yx��MOP�4��!`�f��;��@��!�2�i��0|��e���-.;Ѷ�C c��N�0C�0�@G ��7���[���@RR��U�2���!�� ��j3���:2	����0[��S�xU,��0���V5ɂ���@2vr.���!��X3�%���!`�F �O���C�!`�%�T\Z��f\Z�Z�:�@�\"`K���93����&���kPZF^C�22C g0��3��Y��`��#��L�W�}P�q��!�=D��LC ��9�ԁ)55ڤ�\Z*fx��}P�9v9���ru+�l|N4�i`�I1��Io��	o�\rfxʸ*|N43.��4C�0� L��Aě���)�h\Z��8V��$6C�Q�i=1DU$�6�$��j��!`�?&�\"`K�ӋM�ak9>F���|�eo!��-��N�F4}����,��������;��!`���MЂ�`��!`\n&�!�	�hf,�j��!`��!�q�h��iײ��i�|C�0C $\\�i���d��J��!`YG�r�.�hfBV�!`��� `�Y~�\n��F43�E2C��l1��`2G��fƱ����!`��!`�!�̀P�	i��!`�@�!`D3�tf���X:C�0�lE��f���Ya����f�C�0r�j+����b�E4�O�P��tG\r���CI�VWC�0��]�^�߈�נ�AF�Q}\0�ei:&�!`x��i����-���\04Kb��!`����o�_g!A4��,�x���YY�ܒ\Z�����Pռ��0r#�9��٥���uV��i,�0΁���s\0�ݷ�<C��h�������!`��!`d7F4�qO˳t��!`�!`oNx���2���M/�hY��!�9�ћ��s����hf�V�!`~��11?V��f4F4Z}�&���m���m�,?C��46�d\Z2�%L]��Y���\r�#`v(�cl%A��9+g��9!ʶ��#���@� C�0C�0B#���o�m��C�0C ��� P�-0�\0	�X=\rC�0�F�B�#��v�^90�\'0�\0Aps��!`��!�w�tTb�ʁ�?IIIͺZx��.g���!`ف���@9��h���P;1Q\rC�0��@�ffD3hUk3C�Xly&`Ug�����3�+C�LNC ���`�nH�͈fH��*k��!`��oH-W#���ba��!`��!`YF��f�!�C��Kg�@p#`D3��k�3C�0C �8��cHY���!`��!`�B��f��Ȇ�!`�B�.\rC�H#�iBc7�A�6t�;3C�0��\"`D3�|N�R)ӿ�lC7�֏Ig��!`�\'F4SыѪT@�� @���@�V!`�\Z��o*�iӨo\Z��\Z,�#T�h��a�@� TDӦ��lvV�!`�@� p+JRR�9bdEJf��,m� TD3`P7A\rC�0��\"p+JXXة�/S�|�u��ȁ���@՜�m��!`���#`D��d����0C�0|���Mk^��!`��!�\'�9��ߐ0��#\Z�B\rC�l|h\0	l`LzC�8#�g�a�@�!`g#I����)|h\0�wQvm���\0V��n�!`$�3�,�!`d��#�)�����C2���4C�0�PE���G�7{�G�Y\"C -,�0C (0��j�J��!`��!�9�JiD�[HZ>�������:2	\rC�0�\n��!�F2���zT{��#�,QF�x��!`�F t�����ޮ\rC�!��Bʶ��9J4���\06Qe\0$�b�)fm�SŘXA>�Ѵ&nd��2�E0�g�\0���5�\0� �Z�hA�*�/6}��nL���L���vnي�ͬ�m�}�@��4���h���4*f���!`)0��\r;�3����B�\'���{X�XNyF	1H����_#�Ѵ���Z3�C�Q�%Do�X� �֕V�	n�C�0�\0E�lc~��4��_�l���!`����.��m,�X�@L#�9\0�i�f�7��<�����ՍI���G��L� `i����\0�%\r1����­�YD��f�䆀!`��ot�oP�\\#�������Ƽ���J7�C���>W��k>�؈��!�l��2�\0C ;HJJ�i6\07��dO��y�S�2���\0\0��\Zj�<\0\0\0IDAT\0FH䬄b�\0\0\0\0IEND�B`�','2026-02-06 15:55:40'),
(18,'coordinador',14,'�PNG\r\n\Z\n\0\0\0\rIHDR\0\0�\0\0w\0\0\0>�>\0\0\0IDATx�]�5����s��;�RE�I��R�^E�\" G�(* ��\" Ei*���W���<xx�\\�;.���f���I2������p8�\0G�#�H���\n�r��􆀐�~����p8/��|qd�[�H2Z�K��\0G�#����Ќ�y�G�#��p8���B���y^/G�#�xq�-�p8���!���4�?�����[��p8�g�\074�)�O�����cy��|����8�\0G�#�A�І&w�����F����#��X$g4LNٴ�2�#�H>��|��K>��G�#�H�$g4LN�tg�#�H��LB<S\"�Y9�\0G �p_pB����3��L���s�\07�����TD����S�N�#����\0%��|\0?����q_h���q8�4�\074���,\0��\0G�#��pRnh���G�#��p8��\0�����fz��#��p8�@\ZF��iX8�5�@R��8�\0G�#���fZ��#��/̥!q9���@���V�����!�_�K^<7G�#��0�\rM��@�D�s��p8�nh�{�P����p8�\0G�#�B\"��FqC3)���e���(U�&�����\'�o�_K�\"|!\Z�\r�B������i��m���e*�\'����Ib��X�`�Rnh�0�/���^�x#R\Zn��4���sA ����ϥ)�R�@J ��͔h��L��L\0yq�\0G�#��pnh\n<rR	��T*��>Kx]�\0G �pC3�����#���z:F<G�#���P�����\r�Ԑ���p8�F�?�h�^�|��b���/�y+8�@�G 5O���p�)i���K�t�B�m�\0G�#��p8q#�vM���[B�-�W��p8�\0G y�C3y�H`i�6M P<G e�].ep�T8�\0��t�@34��4���r��x�{A��7�#��$\r�fh&\r$^*�\"��O/W5�Ӑ�pV8�A�����˦��L\rT9M�@�E ���`�8G UH�=����aB!�DnhfI�v�*|�LUx9q�\0G��B }��/�ϱ1��|���_Rs�L-���n���n��K��c�sr�\'��L�r�\\s��\0�ՍdC�	$���DKv�9��\0oA\"��f\"��Y9�\0G�#��p�\074����$^�#��p2$��̐b��p8�\0G ##���\r�g�4��#��p8�@C��iT��]�4*�VF �M�o�\'+��#�x���f\Z�/3�\n���H\0����ĳp8�T543�����@*��S�t�o<G�#�x�pC��ͫ��x���=I�xrHp�xF�\0G�#�L���3��W��\0pOd2o\"G�#�H��|\ZN�>G�#�8�\'2qx���\0G�F��/�py�8����\0oG�#�~��f���#��dxb?��?#��Ձ���f:R�Y�8��@l�� ���3R/�Py3^h���B��7�#���Ķ�24i��%�@A��Dм��\0G�#��p�5��|ֈ����\0/��p8�@:C���L`�]�\0G�#���\r8��#�\rͧc�sp8�\0G�#��_x ?�*������elx�9�\0G ~����&����c�{��XyG�#��p8�1B*#�\r��\0��y���p8�@��+�\r�ī\r/�����?���S!�8��f��t�J�\0G�Y\"��3{�h�8���\0�h�e�p�8�\0G�#���/0i*��iJ��\0G�� �k�p�?|_:=�0U͌�|_G���<r8�\0G�#�<H���&3��I|���y9�\0G�#�Ȉ������m�p8�^G�#�\\�{������A���p8�\0G �#��4�\0��L2</G�#��p8/6�9����f�C�+�p8������/��oi\Z�˝��.nh�:ļ�\0G�#��<�����w_T����$��p��\0�-K.��<G�#�H��LN<G�#�!�w�^ a���p8�x��f�����rz����9�\0G �Ƞ�\Z74SX�8�!��L���t�x�\0G�#�H?d�y���GE9��\0G�#�H%8Y�@� �\r����S�p8/t�#oG�Y\"�\r�g�6��B�7�#��Ƞ;M̼��E��)\n\'\'��p8��sB�W���f\Z\ng�#�H���� %�#G�#�|����ş��x��ړ�\0�HNx�(G�#�A��f4o&G�#��p8i��Cnh�h���p8�\0G�#�F��f\Zg�#�H*�G�#���U���V%���p8/���A��\r�����b�NʹV,�R�455�@�9�4�\0g����Y�)ϲ��j:�=mt�tbh�\r���f���1�h���D���#�:<�9�Y֕:hq���@:14S��d�#�ǘ���p8�\Z�H��K�ӯ��\"��D8�\0G�#�H-�\"��M?t���~d�9�p8i\Z�G�#��/���/\"��#��p8���@�|ր��C���O8�\0G�#��<@�|ր�d��\0G�#�`�\0G E��f��ɉq8�\0G�#��x���	~L*�G�#�^�g��������sp2\0���\0B�M�p�/�3XOG7C6�鰤ZN�#�v��fڑ�#��p8��������мI�G���p8�@j!��}���L-��t9�\0G�#�H*���\074_A�fp8�\0G�#�HkpC3�I���H*�G�#��p���Lc��p8�\0G�#�b �[�X:14.+�\0G�#�H�h���t,?���@*��tbhf���^p����<�@F�H�>p�6� ��<��Y9��T����|�p���R{*x��϶�G��W���@*���\01mp��yV�\0G�� ��Z���L\0�m�g;<�ڞ-��6�\0G�#�`�;���pC3���9��\0o0G � �\n�FT��ah��ӭ~r�S\0�H9	�\0G�#�Hi��L�	/�BO8V<狇\0�X�x2�-J��%]Z�\n���#�!��3�#���/8��E�/��ϟ1��fƐ�3o%_�?s�T!�$A0�L�\0G�#�BpC3��d���\0_��F#���HҎ,8\'�G�/���!��Hm����s��\0G�#�*<u�*�r��@���OP2�� �7��	̼�\0G�#|����и������k)N��p8�\"��9J P<[zB�o��\'iq^9�\0G �!���H�pC3}ˏs�x��ݾ�.�\0G�A��&/� i74��_��6<[�n߳ś��xq�ɋ([nh��R�m�p8�K���,e`R����3��Zě��p��+�fD��\0�34��̀&��B���p8�$#��_I�.������q��\0G�#��p��@j8���/��	x�p8�\0G�#�Hy����r��������9�\0G �#�\r͌���|{%�+\0o>G�F�O�>Ʈ]�f�ԩS���;W�֭ۛ���{i=�}�o�+��\Z�8�h6N��Z�[}�3�V�L�Q?���w���w��`g�����;�D�R}P��{7�߿�|�RϞ=������b5�9����t^%G�#�x^���</�M��k���^�VM�����n\\�x���K�Z�b��_-]2i}�,]�d�g\n�>}�h�ۣ�z�EU��]�#�$2�eE>�4��j�[��lf��r��Ղ_~���W�����/�͟5�/}�~���:q\0\0\0IDAT[�*��^�z�ԫW�P�\Z5t����nhz`�8)�\0ߎO9,�\0�������/�E���˗-8K�{��ݻ��]�%�n�▫��j�������T�fn���$���cH�5��p̎��\\�q�v�\\�#������`������\\�jŪ%�9�����h�����+�N�nws�����pm4���K�ݳ{ϴ�;~������+�1�ׁx��@�44�E�M4��\0G�|;�����@F�)��.��므����b�4�X���	����;�ɲ@��ȄA�d.��jy�����1��D��f�΢X(��\"q�hGt\"�ݱ��aÆ�9r��x�(s�9��p\\rD;v#�8��P�����{�P�#\rz��W�^����\n�𽏟_/__ߢ�5��ݻ��_�n�<.�l�h��v�N�>m �y#]=zT��/4)߸g�6)�i�˼\n�\0G�#��$ڒnҤI�R�Ju*Z���گ��֥�;]����l�X�2U+����n��Sf���\n5�g�?����bl]J�,]�n�:oիSo~�|��v���&C\Z6n80W�\\�*W���חa�����K[$P��r���2L��h5�3Z,��l�f���+��ꫯ�)[�l�\n�*��R�J�:u�\r#���j�5}�����}vЕ_����oG�#�Hi�Ka��_|�E.�\"�_�xqU\\�@|}�ҥ�?���W\'N�X\Ze� � <����u����w��5��r��!YP�];e&����^N�s�#&fx��� >+U=�ÇGn�v��0�6�>qz��v����Xv��t�!�Çz׮]{rݺu�޹s�ւ���NV�X�w�ǃ�I��N�F�>���я�z����uu9�6G�-�v���%�>cjN�â���Ng��1b��o�=\"O�<�0��/ ����\'�����[�or8��9s�\Z>|x���뿋	qh׮]\'���}L߾}���ӫw�~}��ׯWG�=zt�Կ��&N��W�J�!!#:ſ�-[�P��/�aҤI�z��SE��dN_��p�fN�h��6,��S�v�֭��}��!CBƍ7\0���h�#�O�=&w�^�G�Ğsrn��3�8�{�^cf͞ۑ�\Z.Y6�p<��w��d̘�>�3䓐nv���\"��B�BCǄ�������gڴi�FO=�@�ˣlQ��޻W��/>R�n�.���E[ӵ1�\rMH���My�B/��$ڷo���7��l6��b+���,X�/�\Z2$�Ie���@�v�J4lذ���O_l�#��ϟ�w�-���ߟ.%���w��)��o�Yv�{�(�4\Z�=nܸ�K�~��\nҡ0X����ö�咿r��t:i�^����ڧ��~m[n0v=z�Ƅ	}�\\�\\WUݽ۷o��w�.#!]O��!��bb<+�����n�OB?�\nY,����;k�,z�R�y�h�kذa�֯_���q*T����ѻw�/��ˎ�?B����2�\n2����L;w���ZW������/-����bV?wTL��<y��X�bUȧ�|3Nv���?g�C�\r��E���A�\"��A��E�k`��<y�;խζ)�c4A����_�N�:�u��\'O�t;�qC��!�!��4�ڵk�oڴi���������,_��L���޽����ת���[o�U	r[�m�Q$����O�9�	�������at�K	��k��������_�}��W���0N��q������^�z-Ǥ�ծDܠ(l�,���v�pd��hD��W6G �H�	/�:�ӽqc��o�����U_Ǭ]�ix֬Y�\0�g2P-��i�W��^����c��uŋ�ұc�I�a\'\"�ăC�m۶���{��ӧb<�TQ��7o��aݺul�ʕ#oܸ��bŊ�ʕ+��-U�T��jV�~��M6l�������f��ݺ�ۿ��%��]���Ϝ��ڕnM��=�dՐ�q�����ZtD�&h_H���ȑ�>7nߜ_�i����)��~�)L49�#�U\Z>Mm �p�9kq СC��͛?s:�ձ\r���L�`�u:�MxpfaK������ۓ�Ҹ�Uȃ���ӦM��[�l�]\ZO&3� C?��w�i޽{��iժm>f�>X́-�.�����gx��#�x�g���+�K�������+U�toΜ9Q��7�i���/�<�H�����ze��7t�,;f���6Ȕ)S�5k���C\n  \r6䍫W��\'0!�,����|y���K��y运}�dɒ�����C��B{O`GjuPP� ,���={vډ\'~Μ9sC��^���B���iΠ��\\8����c-�ǘ�Y�����u~ҤIWʖ-{���W�7�+�<)�[V@a5***s�eI���L�9���5���yp/E���%\Z���<M��6i��Ic�-�U�i���-a���FJ�������ܦ��;8p/V�������\n݇��mڴ��7�|�.����E�#��Z��;&��H� �x~0��~>���|M�ݸ$  �����͸wF� aI����x����\Z$=��EQq��I$�,�`a�[��%�$��@����ʲb�������1Ij���1�]����i\r��}���aaaC�)R�X�b�0��={��)S�ԙ<yr�_�5�_�w�RaÆ\rF�_�3��1h�MI���]�����Ϝ9c#�P�R<�EW�{�n������N:\\.�jgN�S�`�14SN:!�m���k׶t���ahf2\Z�4!ޱX,�1@����0(�<�Q�2��;w�/t&�!�\0\Z�q����H�!@�OJ�1C��f��4\\�0aB�jժ�z��w;��*w���`�hѢ�[�_�z�\Z^��7��O���\r���\'\r}�s�D�M�3��׷j�N���\06 ��x���x�����Oe�8N��c����m�C	�`�8͘�رc�hΫU��[U�Tـq���ѣ�Ԭ^�s��\r�*T��СC��q��ݻg)[�b���������^�,&�Wa\"��n�N�>y�c�-$�h�M��\"E���V��BÆ�\\�m���@��)Z{*#�S�<\'�H96m��r�ʷm6�hP-��F�\n׆-��H[иqc�֣Ή�<�%:t�e���������p���9��	�1C��;���O\r������ȑ#?�vu����͛7�v���E_��Y,�hk�K\'1��e����������ܾ}�Ҙ���s�޶~&�i �?�¡*,N�& O��s��7o���\0?&Ѡ�P��::A\\���$���H}�d�ӌ0�k�8�޷o�����8#�}\\҉�]����3b����Ӄ�T׮]�:�����G\\���@�#λw����D͸s��~v��\r��N�o���5�%;x嬛1F��g�iӾ���^�c0�,��Ld��J�]�&EKm���B}��I���i1\"\0��N� �����4�J/PZi���`��s���$�V�s�ݲe�{�li��-i��1T��N�	����\nce<cldG�9M��L~�~�h����={>ܿsu�Ǝ;�ڵk�SA�i��}`8ր19���7�G��;w��<�a\0��;	�`h���B��>�`B߾}\'���Ko�< �MkR^�L>�\ZzIW��rO����-E���<ā@�n��1c�~���)�^�~�<�3�|�ͦ	0�t7oެ(�n�������%cgh�K���G\\y�`3AI��ח�0��h2�1x���#?yg���*���6\Z����L��®��\Z�k珣Μ�c֧����ʣo�){s5��i|�b��Q������aJ���iA�j�Z�j�m۶}\0#�(B�*&�� :�F*L� �|Ëb0��ݻ����4�b.`���A~KadF���bp�3����_�#�C4��tz���c^~��φ~i): =�5��E����@�\\�r\r����!�]A�kǼ!C�L]�z�8Lxc�V�??�I��&���	N���F#x^\n��:u�(��Cj֬9�Q�F���D�Rz2��>>o��).�{V`����C�P�e�i��?�+��\0\0\0IDAT��>nܸ�J�6z9!&&fώ;J,^�x��o��I�f�ZU�P!7��y�і��������{��։�z��cb\"vߺuˁ|{!s��f�5s怀�\\Y�f͇���9r�ʗ/��(I�cA�j�j�)K�A�d�Q�\Zb���t���U���K���lɲq\r�7%H�|,�ɲ�:��	c�<�1��h������V}�\"$d��|\n�oРYA����i��N|$K��#�>��3<xp1&�Z���F�Pf��J�2�HB+��јDp��=�K�J�*%w�޽^���t��}��	06��:ōL�|QB�ÇOv�\\�a�֣G��\'M�t�رc��Mi�0)R�:��˗/ۻwo�իWW��-=w�ܲ3gά@�ۄ��O>9ٰaë𺅆��E޻w�>!�m�{04w���߅���~��Ac�k�ΝC\'O�<�M�6�/��R�k֬����z�!�i�OM�lɗ\".yH Z4��=܇1f�|��҂�[����;������B�MXX�T_�fNžBSܟ�l�~@9�Yʑ#w-?���f����Q�:\\��q��+,<b���7ݹz8w�<3r��Wu%ʎ�b-�|�\n3nݺ�����C##���L�?>|��۶-ݽs�jg���������߫V�����#<}-\"\"����E��Y/2MR��=f6�K�]�|9�w�mY�;_��a��KRhb�B�\0J^Uϡ�g���zS�D���kԨ��?.U�*z� �l�2��0����L0��+��R����~xD����p�FJ�m�� ���Y��\ZO����-��[�U�9c�z�sKʴ4$$D�W�^<5��E�x��������	c�̀���!��H/\\��3�E�B�dH}�Ν�{#�����px;��|7d?h�u���jݺuUxP����qCppp�ۡw��,���.� )┇D\"@�5�42B�0̮À<�8�\'}���ĩ�s�n������,���KwPP�} ��P�,Y��t���E��������>Vs%�-���*e��3�����t�_�{��/����zgTo��=zT?~�x8H3�6��W���~Ξ=k��\r\Z�g�ߡ��װcq�|��6�\0��#��c�5�&�?���å���M�v���g�}�ƭ��/_���&vO\'^���\rM2yM�� �oҤI�����c0�T,�0\0���g�����p�!�!@?��믿Έ��)��\n��y���\Z�D.;�+�\0��CDQ|5w��C�_�\Z���H�Na�?���o�޽�O�6�����Gb�\0[�1Yv���?��FhbeC�$��0��I>7�@�@��f�پ3�L�b��	���nݺ�?:ʐ#�.t�ԩ��(A���.<��.�e��駟a\0�۷/��8t��!?�3Q�g�O\n�AzF�HEX�����*���S7�`�|�vȲ{nؽ��U�m�Ϝ�2���]V�_:���s�l+���o^�60:<|�{7�X���	:���[��w���j�MM쨉S�=$\'n?\Z�o?n]�fS���oҤi�m6�{���r����W�\\���@��G=����P��.�����YQ�����g��EC�.\"��ܮ�����s\r/���\\��\'l�oٲ�+:̛��0��H�̙���ͨ�ᔇ��@�\rra�r�*Cn4�����X���\0!V�	���w0�׆x��N�>}yh��!E���Z%�w=�-[����ԩ��p3P�r��%ڲ%^p��@�R�Y3��\r@��q��aЎ�X,!X,�/_�|��0t�˯����\Z`�͙3�5_�}�ɽ̐Cc�3$�X0w��9�\njC�K�*��7��ر~�F�[��v���Z�oڼ黍�6�ܰq�n>�>�:v�X�r��9�E��>geY�X��d�Z[���������8����L�K�4/Sp�5:��2��L�(�81���9��ё��V�@���Koҿg��kc�-���<���n<nܸv;�o�����Lv_�,?�w������T�E�j��vh�8O��9�7s�K/��w�����+g*��_��^E��)��H;v����4�L�0��µێ;���s4	<��y����7̺m۶7q�}� L�2:�2+a�҄H2n=����l�L��$���͛g�����lO�:��Y�7�=h�Le�:�tȔ)Sy��(���?,������ڵk�=I1�gϞm��\0u�\\�%J���X�b�c�����&-��H�I�\n�̣�w�H�^�Nx6�`{~��֬Y3�/�(�h]LX�pa)?�N�����ؒ�gڄ�>�O���ˑ�Ν�\0c�,���X�N��.��\"sIQ�ͨ��gV�	�.]��˯��:\n�Ukp�5dp�����1G����Wk�ύx��CF�2:�;,,�.�t�т6v���p~6�m�k5������E��~��nw~���X/I�˪��j�݆a����n�h1�?\r�w�cWi���_�zof?���v��7������iũ��}��G���O�!�O��U}��q�73��b@�̵V�Z�ʽ��n��9X8�޽;������<u�Є�xH;``4�ڵ�6��*\"�Cm����p/\"�[\r ���%�h�*I���iӦ���C#���T��\"=cHFN�s��%)�\0~EBCCG� �]�l�P�?S�p,\"ժU+>cƌ10b����l�D4������9sƍl�Ɛ�SDR���Ftt�ELā�\n�\Z\'�N��Ǡ��� ����/X��&F+��(20��y����WS�ݠ+�k��q��s����]���^�z�^�j�Ȩ�����<]+�£6�ݽ�-�6�\n炕�WNZ0��1͚��@Uԟmv[]��8�Z8�yMz���j����.�Rm���w\'��v�7��83\"\"�:�b�z��|tdt�����Y�@�%��~��~}���X�l��Og�|т����l�����N+-���Ǒ��p��q`�9((���?v9�����d�����ϟ?��L��(�+��\0�d�Q��5�$c��a_�=�[�nuE?�����Q%VM�\\�K~�T�\0�ex�!P�\\9���~���$��Q(J�	(��������Bl�\Z�n�J���v�=;�v�084G��4������k<yl�W���g0��0��aRH>���ʕ+�H�\"�����W�^���ۈ�7on��C^e�EuQ��D�*��x�\"=F�^���}��E�q�^�oÆ\r^�7_�?b��L/2֯_?_͚5K֩S�|�Fu_�W�^U,����\\�q^������$���+	uUϑ#��o���t�D��u��e\Z0_3q��c06�=MϐG�СÍ����R��r[�m�������F���m�?W���v����e�6�d2��t�OX�����J��[�o�����Et���mt���m��}h�������F\r}DE�a��uj��B�歎�m�v��۷w���0Nw�H?���T�aˠ�_P�p���ow8��:j�����֭-��-u¢E���H�;+x _���GB�?|�t����ƍ��0cj�����d����s�����cg�e�EFf�d��B��������p�B�N�:%���@F�V�9�� �}���=<wV�Xؽ{�ᑑ�!`f����7�H����mq�:���Fz������|���8��9щ/�1���$O�{iN��f6�oa�$2������6>Bi9�K0�9s�̔\'�:y�������Π?|���3�~���{��r��Tď���ۑcG���מ�#���o� I�UA��0m��)�D��\\@��=y����@�\"0���6R]O����w���c5<��/^��_~91g����ӊ�yϞ=4w��2��&	�e,��N��Y&5i���kÇ���\"�#F;l��c>SD�*��/�1�섞m��`�\rF�	\\F��9�a�\r<R_����Hz�����ؑ\n�o!���U���o4׳K��Ç�^E/]��t�DF���z��	�K��L�9T�0a«��|	�3��W�x*���~\0\0\0IDAT����<Ba��h\0�QUU�i(L�8�(Y�d�{������ap���şP��(�t\Z�qx����0J|��<!�a���<P)����[br�˧��@K�z4����HN�@u`n�����]ǮL���6QԅɊ̐�� ��b�0���Ǐ[�|���f?�+V_ߡ�����n���ϵ���ap$�8Y�X�˔.S�ZժEvG�����aa��n����/�����:�r8�FED�q/�^LdT�bE���_��u�����*�KC��f�q����\r�U^�\\ׯ_��԰a�h�v����^��g�+w��*��4\'/��|�����}q��-[,�w�6�2������$�1LHХv��~8�/��n+��\n\"m�҆�H�eb� =�2�����5P���/ˮU��Ί��رp��0�^O)��-C�R%D�#M�R���S �Mv`Q��3�kO64�\'pRR����E��ar�ƪt��d���~G���:NyHK�w�W^)��΅����0l���0�e˖�Z�C��J�?&�j�&�0����	��Z˖-[}�\Z��J�U�`��\ZEi£I�X�q+�xP�F���.�Z����1�(�9��,�#���%	�2èɹu�ּ�ې��������R�f획w����as\r�Y}||6׫W�ݪ�U�����3Μ8��ĉ�x���m�FsI�(�u�\\�SC:�1|�c��������Ч�5nܸmݺu��lV�u�ƍ��Ν��i�^���o��s��z\r�5E����^o�I=-\r��-�u��n����C݆�Lh�m۶��ɓ��[o��ej����i\\S���|�x^�\Z\Zz�%�\r�^C����2z�@p��@E���%�����^�JG9��� H��p���gah��8k�ob>uH�Ġ�&��������8�V\")dj��t9OE`��E�?>�W�\nV�[00�\0�=\'�u\"���y\"��G�=|��T��ux9\\ܗ!���y�F4y>O��L�ٲe�#�C���*��WcK��J�^�nX���3��i��_��>S*����IԤ��&���Y>���\ns��}^��8�F��>\Zz	�A��F���\0�]���F_�QTEƑ����\r�\0/ϱ�?�sN� h٤I��ٔMZN0p@/����ɷp�R%�����ڢ�\nw�¸�͛7oذ�8�Jﳯ��Km�H/H�D�\rd|��{\Zh�޼y��O>�d@ǎ��޽��=zؗ,YR��ԨQ�6�۷oZA��:�F$�i�����B�˟\Zyi��aÆ=n߾��v�f͚�A�_�~\"�/�0��Cw\Z�Ȥ�8\n�!Gs�Dw��18�D�\r2�n��4�}�:�.��X{ԫWk3({�yp�!aP_���~�i,hL	+�h.���m~4��U�ڵ����Dy�$�_V���^۽{w\\�@dI�@�Jʜ*G�)ԨQôw���l�`�2!ނ�2�.�l�R��G�}\\���@wƀ��M�۝���΍���#G<,��Ux	��kǿ�&���[��T�m۶ߕ+Wn(�V9�\n��\0�:ވ����ɓI0b>�ׯ_�A�U�۷o5,&:���k@�ҥ����j�	>v�c�*��:�}��##�������G0Vt_~�eU�A���w`����t9\"�#v1E�:���?��i����?w��=�!|qHP 9Pd��\r&��~Ռ�D��3g�Óy��vxLW͚5k��h�\0��:0A�N���ipҖ�0Zn�R�3��������wi�Ӷ���)[N=��tŀv�½7��zY�O#�=駱�!0�ϧ>����Bt:�p���\\Q�G�n�������A&�������O����w(�����8��ӧ�$�&�/z�$~q����#�1�BF�\'���hfF+��]�<�R�	+婦)�����\0<�:�b@���Ǎ@o��@�PI�|s�+S���IK���S��n`�<�\\�g�u�i���9��8ӷn�z:��ܰ���O�\n���\ZluL���s[�^�i£�,�L�,�c�kEL�?��g|���U�VM^�b�d���0(�K�.\r-T�P����{�%*b�qMFT��%�&@\r�����0�}2�K�ٟլY3۞={:����3��\\���m!l)�v��7�j2ݪL�лP���y��gϞa0���4i�\\�xFVw������T��^�Q��=��)]�zY�?��H�`8��ېNu{m:/�q�5��9b6�_S=!�����\'#�<���($#,X0���d�^�t�q�~�w�}G��x)��i�G��\n.^g��y�g̘�w�ү2��h�rĵ�����СC�a�7��S!�x=��x�B=���K�o��`��xF�B{F��j8�-Z�w��a�t�8��p5M�|,>]��V��-m�>��\"/���_~9�F����.���[}������i�L��B/`ĉY�d�~��X��I��l�r�0yL�$����0Oba���{|R]y��ie��!�(o޼#��U(�&�s͚5��M�6�!�C�~̅w��իW�~��7	1,�Ћ ��&z�|,hLS��-!2�Y�}��e},g*\'@N�W^y�6�fS�=�-���R�X��#<�q-� \'\\�=.8p@�D�.f��?�\0�2x��?�y���wz�(����mz$�N���ndu���1_�|����gj�\0#r:dB_L Ùd�9���Z}����E�3������XL2d�,�����P��s~��e�G_\'�5G�l֩S�lw�62�H�B�\nʔyi���C���������.عsǸÇ/������_}>�Kߏ���-�ڵ�S���n��$�;��	�S=�&Ƥ�;v� �=�X��{\"�)Z\'�����҅K�^�����^Hu���G�D��mۃ]�9i�����\0D�YM&�aL��1P��I.7Ȍ�\Z3fL���ȱ�$\0V\'���\0:BժU����Q0���؟�I�8�V&aO�q�M�6�Z������ݻw�x�l�f��9����?���-1\Z0)�+�\'Oތ�;t��%<)b����zO>AQ�UQ�!�� ��~\\�J�	\Z[��g̘1��������s`L?20���;qtcL�22q������\n�A��[��ə\'�,���=�E|}��իφZ�:uj#���XB�$4��稨���P:���B�\\�\n]�z���!Op��C�2��2R�\"��rtt���} z��u�w1���.�k-���\ZI�H�KW������6\r�r\r�=�.(?8�0^ZL&k��~�}�?�\\=�tڇΙ3s:�lc��*U\n-_����	[�l��=�|}}C��V�ѧ~�����Ї��q2������=2����9Mnh�t^-̒YcJw�D�mE&�o�֧-*�(�ڵk��´�Ej�f`�m�a����6c@�1\r�\\n\0���xT¤�q5&����\r�J�[����s�w�EU�V?M����{ĭ��h��o�÷s����,Z�h�_�u��K��l�s\"D��͛7#1��`�\r�q��	J@���⍌*OtbG���FQ��3���}?Uϳf�j�2eJm`0,�ܚc�y�	��^�l6 #��ڍ1)%�L��\rzqgA0��Fք�R���z�\Z5����G���Vz$<\'�%ٺM�A����};t��5.W�)��8<|�X����(�CNg�nq�_���`����SDV�G����W�)2n�Ν_�v|z��7`<��ׯ_�̙3!��L�T�∰��[aںu�憌b�	:�F\"\"ܽ{ׁ������/1@�y1�����m7��x�������Ɇ���^�í�i��$a�|�9��\0>֒z_�CEU�;]�0�ΰŨ׃Z�Rg�A��H�!� �`�K���_���C�&��A�+�r�J�d�o�7om���셷b-��49!�����VleWڳgϻ:��d�F������B�{��^�\n���o5�\0\0\0IDAT8(((OӦM{���?����zA������\'y���v�7�0��y2����w�q��~bxB��ly���8�\rc��ޠ��a��7��6&�ې�$<<�Q�D	�+2t��x*JR���8��g�Ԛ�`D8�7�.�j��;�A]�#I\\�]HYǫ{qy<:�S�b���ܹ�S��c���JoF��[�Y�7�E�f2��,;ơ��n�QFψ��y�z�\'�8{�l?Ȧ�I��CO���dɒO�*װ׏����J��}gA�\Z7~�������>���(\n{��簟X���.����i|���1۳ЀQ��>�8N46l�\rMB��O�<�S��$\r�{�-:��Io�L5�)�>���hə:\nE\\�VhР��_�~�0��!b����(Dl]�.����8���\\��A��ݻw3�[1`�sxi�Ӥ;l�W��w��͛o��8e���Q(R�yp���^�z�aPv�\'�	&.С�vi����OI���hɏI�~��%���+aE]���^d��?��쫪j�\0\"�0�d���\Z�:��r�Ơ�E��5j�@lћP�4{�vgGMUm�s\"faz��h��ӧ���I�L2s؆�\'��˥ʯ6l��c$��\n�ؤ_�Z�p8˗/�c�[8��\'�J�-x�ø\"�u��\'\'����;b{�XŎ�]-ˮQ��D�@�?�!ȫ��*��dM�||Lݡk[`~�̞�qLV�2e�u��C��n}9���o�\"�t�t���|/�n��#����w[���`���i~{b��7A��+����͇�\n^y�}��(���#��ZXy��8NG�;nh<�t�С�g�vS5�.:��(�.���h�_�Աh@�NE�H�!� �Uu)lkv��T9�	��&L�+�v�M\\��p���իW5x��+��a��\n��%;���l���\0<�?�h��(M8<1X�o����\n�̆�K�.$�\'��&�勉���0��+wL��/��>�3@w|u:C��Q��`tj���L���8�$\'��̑#Gv�{��x�����Z��N{��0F&�G����Ohoj�E�0t���v�\rFiצ]y�6��T�e`�Fڥe˖ռr�?�)Qh�����{�TO�Ik�2�	J-APwa��t�kdM�^�������6�-&&�OL�M�(��4�:o%3fiٗ˗/߲��zk3�_��ޓ�00K-Y�d��j#��w��I���5���o߾]\0�OlWLLL^�qA`p�Ż����G>ϯpa��i����w�:b���&�%?O\n�LZIa���%A�n�Ŕ7H:	��[U��QQQ����I1����?<gL0�J�TZ�ӑ�Ga�fѭ[���C���a���FfΜy���uظq#y5�\0�0��\"�aN�I�}`���U�k&O�|�I���:y��~�Lj�%��ph���+,�i||£)g\"\n4b��S�,��t�)���;ˠA�^\r\rm��{.M�ц`L��a$U$i��i��.�5�\'���PʤR5�!��C��N�ѯ�PZ�P��JT͚5Wks�-�юع�rN`뱘�\r��9�4�5֭_������<��?`���隢�i䧋�;#��0�j��.��Gʏ��,�r޻�Ѩx���_��K	!*�]������92R���G	-����\0:�AW�m���\\�_���X��81�1/#�<#+�<�	O4=�\"߻�D;֓?��pC3��S�)@7����`���pF[�1��/4���LϬl4�S��SJ�2e*�?������*�<�����~�\0����ah�0!��\0,#�%�g�a\Z�\r[��`�O;�0Y-H�Q�CŊ��p�\0q6���H%O&��>1�@?�yѳ[�,X�8&�$�\n[����(�	kj��_�O\Z5�D��p�� @��*���l2{�,�WŤ�=r&�ϸ�t�w�6�͛����h<����!O�<ԞX@��d��esL˚5��M�P�^!�Ot@��	ͱ}��P�B��M��̙ˈFc���c��y�70��o&�bE�	&��P�DWm�֭a����v����M<ş��wĀ���h�c�O��Xq����Q�\'��s:�Kq���#:C��e$Ɲ�.�:\0��D�ƪ*�s�[pN[Ə�AZ���ŋM���*�\r�Xv\n}�4!\'����Ӻ�j��˘:�1������,��!̙�?�\0�xs�b�֬YU �3��O��A�1x���;����|5��d�7��I��%�\"�1�!��\'�n�\\t�(nWs�櫀\r��ވ����k6W6\Z�k�z���֜>q꣇w��I�?(((���:ƀK��Y��5�1�0���2\0	k\"<3��s[�ܹ�9s&��e(�H�d��ԩS=s�������g>��E0����K0�|�<��u�F}\r�I%K�����IX�\n�w�m�fUa�ޅ�p9��9�b�6�a�U���v��aRu���De(�v�M�͛7�E�x�ۘ��mddd3�vkx|�����˗/��I�IG�����_ٲe�g0�����6g��e�^�띰{�/�y���g��嘪��Ȩ��*����.�N�h�t���C���줩SvZ}���hi�~Ws6��t��ܶm�a�;ѧ��x�k���&0�y��W���&x��Y���0��c�G�bQ���?�@ue3\Z\r�U�(�B�L��d�Ҷ�ce�PB#��:�����-[ΩN���y*>\'N��:u��/��͛ZTT��I����������LG���r�>G?�P��:u�T�s\r��.����EEQ�DQ�E@V�t:�G#��O$kl�K�1��x6�@�0H��v���(���鸩���\\�y�!�y`s��vh��`h`w8��\\�7\rz�	j����NT�<sr���[b\0��	�����h4�@�M}[��&]�@L���<r��E��eIn@ӦMs���O#As��$�}�� &�i���0���1����_1��^L~�@M���؅��HP���+ؙ[�B}��)<����\n		��dGxp��]�քg�6&Չ�o��Dx._C��Md�-[�$^�ed¨���A���*Wj_�D�ኪ|�v9��C��j�nܠa�:\r\Z֨[���>�ݧBú��FED4�EF5�R_����������.w��1}���x��v���7\'�����w��Q|ӦM���܂�����v\\$F��`�Ƙ��~���\"����A*m����7�`2���t�C�n݂�����!I�X�6�M�*0�S��G��J�\\�r����Tm0�-[��;�=�����i�p-l\n��,W�J��`ᡳ�� ��7��8�<��F�钡m�+Xl�qJs�\'=��pC3��`�1pKX���b_h��jj�Ao�hW\\�\nRl�4��@������UWV����FY�V�{�NZ�r�h��aF~�:��f��U^���00�����p�rK���\'Uz4�-���%�\'��z���:���Z�n� �n�C��dV�z�W09��������������:ar�m܀�q��$�`ԛ�Gލ�-pd}����]��XeZI��\0K�>)EQ~C��8In�����)�VQִ�02w��4�w���,�e�E��\'y���_d\rĖ��j�۪}�_,X��h2U�Qո����n3[tt�+���޼y�m���\r�\\�io��^���9_S4zS�LLL�)ũl\r\r���vЫ^�a��3g*�j��M�E�w�y�沅��7.�X%��^�3��x�r�P�v����Ȃ��#��?�{�I��T��S�󇑌)쬔�#��\n�a�3��8��@s�ceN�	���2z��������; ���Xz�С�Ϟ=�h��e!���������M�O?��m2Y�:�a��f#o&��X;a<�1&�e�\0��\"͓G�4�\nĎaaaE�.\nL�$c� c���Wķ\'=��pC3�Na�P��\Z��tS�:��iӦ��֘�X�$��:�Nz��\Z�P�Pp$��A�̄?�1�LR4��<&��-�iSqϻ��S�����l�b�x�bGT�C�\0\0\0IDAT��a���2&���ݻG�_\Z���z�@KiР�Mn�\"&���}����w�ؑ\rI}L�o����U�Vѳ^�����+Ob=�;һwnݢ���\\(wg̘��4��t������ޗu��{Ab��\"T3ߏ�*Xz.OmJ�DdT��C�\'-��+��_�~����{�{����k���ƘtT��cr>�t���ӄ\Z{?���ܥJ�z�O�>}a,��4��B�\nacG������A�c����	�q�tz��QD�Rh;}���lܚ��f�q�=�2]5w��!#G�\\7a�׮]���烷���=�VF�T���h4�4\ZuM�yۇq\"��fb�?�}8�5�U�}�0���~��|4`�PTU՞�ӈ��v�Q9B�\'�4�I��\'A��ϯ(ƶ�G#�b;���e�C0���n-�K{���ڵki>�i�CHH��y�\Zn���^�[/��b1�6~�嗙����7J8z*��H~��իWi>�tz�v9y3i���k�zʦ�1�+��S��*S�RO�o���u\"���N�K��q.��$�ƵC�	$��fsC�^��WI��5gb ��\\�-[yH%h@\Z<dH��!��E4�$�ɴ��UT���q�3lصkWxv�c�:�������:��@���n7k׮�ڥK�^�G&�xh�Ä��OCng͚E�x�&<�)S�t\r\rm���\r��2~p�h�1��`�7�����#�/=x�X>L����!ڕ�y��\Z�=y4������^�~}�N����Hbٲe�ۜ-\\N��N7�m��w\r�KT}.\\0V�\\��g�}6������/�/Z�h����t�С]�\r������v�KXQD5q�@�)R~���0vh���j���g:�AI��l��?�������÷:l�mv�������ɓ��y}�=u�\'On��l��师\Z�P!��\\>1B��a<�i�N��s��:JPY�8}4ԨQ���Ƙt���(,cs\Z�+2�,�(��� G3�q�킧tr&hq�>�\ne�W�Zu�8��]�7�\'/`�cZ7��d�4����j����Iq�����A�ʇ��\0м�I��|\n�E�x�z2��R�$�IeT��͛�ܹs�_6bًA�w3��N�Uq���ƥ�\"�V��`��}(+�|t��A:?�X�<{�LKJya܋��L�\"\"\"l0BiR�Kn��M�\'K�z���8mmժ�+9\\�ϟ?+������x��H+&���eA�ۏ24��бc��	�L�����T�~-L�6�x�`�XO\\�~=N,��Q�����p��\'}������|?�ꉻp��B��\r���ߑ9sf���3M}IU�厈���2��ᣫ_�~�Çw&ۧM�6������G�Չ��2q\r��On�s��a��m��O@y��CQ<v��f�ߏ�<>�d2�F[��܈�*bWv(d����\r*!]{j�����L�]�� �f\'F�.�������~��݂�g-0�b7�r�+A��=1a���C��������+W�����Q����Ӥ��E�������\\.g=E�FF����x�C�(�^C�$��@y��騅�)�Ɣ*0�Q�T�O�\'9$��8+�#��q��\0�`v�bm�\"m��m2��\n�2�����+�\r��Z��ct�7Eي!�&\\������\'IG@����c�y�	�c���d4�LF(Mt�Ls�1�%Kz��\0��H[�8$-`2�w�ƍ�0�\"`p���TBTr��E��1Y<Į�ަ]�~}/x<򁧏s��F/m��n<21�^��S��غ�펵�M��(�#�Z�h)�<y�<+f�A�0���S~b�-�V,Mz8Mz��[ʁ�\"�$}p�Ν�9���rNB�+��0T��:�F����CӦM}s�����_]�U����a1�%��/������N�O\'��D���G�`2���-���,C�e��#�����X$<\'x��w��n��\Z��n�5k֐�+V�$��~Vk�ܹ�gϞ�����mt:�]Eq���G�?&^)�K�r��f�	c`d��Ca���9�4C�Hq��h��j���9�\Z��0���0\"C5����8cƺ �:x����H�x��c�x���2�������%%��z�¥�:�4L��q����I팓\'?�hz�\0e�q�8�/��^��p�	�3�wN��A�����n\'?�6���t������:��F0��0\"�0 ��H�E\\��CQ�wPy A\r�7b�:a\"�Z����ZYdI��F�M�Ɓ���s1 ����q]�\n�%dA�_���PqL�Y��g���x{�{b(W�������a����h6&5���\'��M=&��ȿ	�-ۨc�K2��0���ѣGB�`�ن����y(��\rp��M]nW� i_İZX>6�ܹ{�2����d�Ez<f�@Ln?��E}9�[Yw�֭#Y�f5�����v7�Tm2�3yiGuO�ڵ�۹s�����z0����|�����饓�2Pcbbn�\r���s���*��c_d1�>�[�nl�����Ř�\nv~��Ɓ�W;t��~͚5�g��(Q��᫯V���s��u���[w�XИ@r\"��o�����o�!�O��#����^�h��h�4���k��a\\�������zס�Y�~j����\0�+?tz�Q�O�[F�����4~�����^Ё�+w��O��ժU+���7�fs���^@������Iӄy��*��_�@	,�/Z��=���18pp�T�?��E|u�V����G�e������f9å\nŋϾz��R+W�,�q�F�\\��Px�b��	�<`ݡ�8՝� �	=��uħ� 5EC��Z�l��(�z�F��Ɩ@I�O���`����Q0����\0|��D�m�$iزeK1x�J�[����R�C�F���D\\b\"}��I�r#_�xW���b}�	�qI�a���\r����2 ��`E�k�ޅ�C�I�kTѤ�ߺ����I�6�D����B��{�����<\Z��(Ä�`�ۍLG�6E�&-����ALp�[�d�C��0&,�����j�#|�\'�kӦMֵk�v�����\'N��)��@:Q��]�s���M�p�\\9�?8���>�?g��U�T�b�����_*T��~��;�dýDl���_��k7�����!\n�˔)���/��bR���(�K�A�?\n:\0?;�g�\0N��#;\'���*8~o0�;�.�K��t����IG��=?zp�`�\'�q���� �ҿ��Ɨ=Q�;��ã>\n�V�gQQQ^o/�3.��շ��a��e�~�t:�:�;V��\n�|�?�7Z�.B�	=s�@A��g����l���k� \Z|���a<�v�ܹW�-J`��\n��m��U\'�.�0,�\n�`r���L��\"�̄3�I��(A\'���pb<�����a�A[F��<��qM�\r`��H�8jԨ��z�)m۶�Ҿ}��6l���R��:IW�L�2Uf�\n*D�z�?lڴ��Ɋ����y�ȟF$\0\Zc�h�2)md�!��X)�C_&�/����V�	).��З�F�)\\����u*G�(�U�Z�n�cUw�\\�@����pG��M�=Y����O��i\n��l�o`k�l�=f���?0��caadX<�=��\n	FfI�\\`\\��Q�g�vn�i�7m�gD߾7h��+2�o���~9�����ņ0�\Z��������� ����p-6cƌs���;m޼�3g��3c��S�N-6��2�f�~��X,4���o��4\"�^c�[)e���	�t��Q�7\Z	����˲�[���i\r�׊��M�&C?!呕Y �>06����|	Z�-T7�OR�����˫���\n���W��/\\>\Z w�#E��M}�̝ݒ���\Z�vi��s\'�|��ݚ��H��9Z��8�\n��b��N������(�������u���Y:�y�z��;��/��rHKՀ����9��!`�r����%��Z���7Λ7�X�V���#����!g��>��n�uӝ\0\0\0IDAT�(�։�B(7��j�2���+s�[��@2�:q�� \'�K�3���s!-Yr �*�����!&Oz�v&���$�fJ�͙3g&xB0�/�읬]�G����r�J$&�sO#P�re�\n}�j���>|8ydp�2��0`>��!���D����(��\"�l�i̘�[�wD:#�q��y2�W�^�\ni]@;3�g�Ñ��wL�dh*�1\"�҃^5��YFv�;�$�t�]����Qey\n�.��?�	�<1���Y�M�-Lȓ�����O,��7���3#�^���A5u���~:��ܙ3á����u���ݛx0/=�M��e̘1=BF��9t�1��}8.$�הi�ڍ;���ѣKm޼�Y��N�$����b1�w��bx��Hj��?q�;`��)�1p��}T~7x����	��i �h\Zo��+h�\'8ҘD�\\TY���t���_z������:�|r�����X�l�O~�g�����>Ƽ�q��3T	#\r1��ǂ I���z�_����]�\r��۷ogE?����s9У*���R�6���)5b:34S�4KS�j�y��|��w������\'�4�T�O�&D��Jo4.Sw���	 �h��^��FV偘��ǻ�f�3�1::����g>�\n�a|�?�a�\rv8�Y�cs�̡A��\';\nɤp�����ϊIp3�<�I᩵� x�\r����ھ��A�����Eݴ���z�!���d�#a�a`���A�#��\r0L��ݮ1���S7m�S��z#�;9���f���cdb�`h/y3W�.��>�OH���_�K�f���%0�����%�x��	Ј�.�5j�������D�]���O��V�\0F�^�ҥ˭w;w����]����������{�.mOoC�Y|��u?�^�<��\\�j(�*�ӹr��A+W�[���˾��	�@�~\r\r���-ܟ\r\Ztt�Q�F�#.��M-ܦ�0|91���n��7�<�D�\"n���lB�.��,�}gxx8�n�7A<�O�	?��C0x�~F�5z=�����뱸�	z@�u�)HǶo��T���n��������`dV�1q�\r-�p�ӡC����2�3A<[�X8���G��5���(�3���|fP\'�\"x��BM7\"�(Mo�\n8����dJ#~��aYd`Dت��`����\01R�B7��` ʋjܘ�跊WA��|h�O�\0$�X2�x錁�mL2p$����)PI�\Z����-[J��ML�k���(o�$�\0���d����YA���\"�@˃�/��sJm��[�@�7���xފ��6�D�D�<��h\r~rbX��\r�}���ѣ�_��d�U@�P�y�*n��dl�)�!���!���,�{a?���[�����}^�����E���ȑ#%`����N�����^\Z9��x{��H��9E7��#`(�E���vG߸q�w��L���Ё�լR�T�Z\r/}Х˝˗/�<�6\0яA��@��?���\n����	���0� Bi�1��Oq�A�����خ&^�ȑ#=�\'�~�̀�\0ܮ]�_���/M�\n��?�A��1�pL� ����F/\\zO\rgdY�F#y�Fc|<	.�򶟟�oTT8ɖ�g^�)9~�x!�� 1<=M�dt��b�~���\\L�vb�W�[��O=0�k�|�X)V��wD\n*�8��n�r0����c\n\"����k��]ad��U�L� ���䓀����5l�#\"\"Jb0�1́�@��!#�<I�]r�@�g�֘�h�s�ɻJ��<%�Ln�`]�~ZI�&�6m�4�s�N�L�2-|��7�߀\\���fg��ׇ��dě97D�]	����k0�WbR�-9����-h��F��ly��ݚ&�ᓈ�0zk�+#O~l�f��Z��*�>5�\r� �	nq���(��[�I�|��wzĢ\n��������EZ8=�00���C�3`����i�S�P`Ar(P$��/e/?�=R>J���SF_��Ei~�F�K�̛��P�kJOpϺjժ�V��С��t(|\Zɗ}�$Ȑ>�6t���9��F0m������z�g_X9ᱥG5���޸��s����x�cSd���)?E\\&\'��Z,>s\"##������=s{�ˣBB��)k֬V�������7�yW��:��<��5k���1?|ZQ�{1�_���{�0�$R�$䅒���\n����ƭ�����#3��p�\Z�<�Hް��]0�����a@8�8��5x|��x�ҩb��C�*Av�M�c0���2���BK0|+�`x|��$E�{z���<A��&a�ڵ%����FI�3�bŊm�v�S��D_{Ƕ0J��7�>6��zc��`���sb�/\r�d����c,Nri\Z��q&��@�;�Q9���n��s�N������a��6?ʢ�&�LT\n���c¸4F�M��:���y�u�ĉ���O���\'�z�VS6l۶͈m�˗//�ɯ��ǧ��j�k�6t��Q\'4���bl��3�*��/�ݻ�����eYB��z���2�M׀���&d�4���\"�#9y����������[��\Z����η#z,8&$�>փ�JA�7CǦ��OM������U!�fpΌM2|����Ч���飿������Dxyu�m����Y��$�;�<�D�#:����\Z��!����G�&��Ae˞%K��X�O����%���&�4��9(D�x���T��LEpI�:kN`��C9��<=WB�A�EI�%�a@��:����yOb��I��_!���%K��0�+��90��ʾ)�G��ڃ�Q(A^C�^=7� X��}�\'=�O:D�x�#�L�v\rdĐq�$�l6����/�L^���Ȋ�����\Zyw4�V�i�%x�J����\n2\n��8�Ď#�)��#�m۶�� u���o��)6$+��3����Ą͌#�������!�1�����(kR�\0��k׮�����6?al\"��\'~D[��[�].�6�rq�2a�����~�lp���mڷ�Ӧm��!\n��-V�`Q`��v�;V?��zI�Z\'I��P4�� ��AC>�xh�F���i�ư�&�UǕ+W�Y�xq>�����7=v����9+K�O׬Yc�={v]П�q���d����7�g[i�B2���\ni�,3ƦW�/��V�|Dg�%�-��7��|-��x�)���ヾ�<�4hЀ�9&�)Ɨ?��z��&��-M&�!MQ�DĄ�Gajѧ����쾚&�t:6�Q����>�Ie)\"B���z��Q;�nO��#��\"[��{��\'c*��f*�������b`�c\"X�t:c+)�D�K���(�����T��0�q>�A�@�\r)/yŞ�!�L���N�9a��uO\\;�.>�Cv�0 �C���C����Jʖ-[M�PW����|��=�\'�.���F�\Z��{�%yj��|B�u��U�h2~��9&�5E��\0٥D��L\\�	��������a��63�B�_��7m�4�u�8��0\n���$�!�h�S��r�2�\"�V5�WD��f���U�B=�������ms�>%aЖ�F�9�Wq���Ǐ/���Mz�ڃ���g\Z4�N`pp������C��]�c�E��_p�Ҏ�;LD�@߀�=sd��C��\r?���鳺�3���S�����Q#晌�u���O�����:w�Zi�С\rj׫�rĈ�\'N�ؤy��e��o3}��}��VP{���0hL���/�\r�AX}�4Q��Ou:���>�	�*��E���k���gpԲd�B��$3�{10��t�U B�4\\�����;����al,���ye˖��&��o���\'�l�JeL&������h����qF���gt���^��ʀ��p%�(>Vf���$��t�=�;芆����1���a���	�=��\r�gy�\nAAA�\0��L�a�3r��I�y�\0\0\0IDAT�������T�:w�~�A�����݉s��:�G�i8�}S<	�����w@T\'j�8qzH�W\\��s�:��+*A�Z���a�̂��Oh LsR�駟*@�-���L|&:��C�k����呧:�������={�����\\�x*������Z�ao��Gbݺu���m����N\'�4�K\"##ɠ#9i�T%����vd\nf�:(lP5���2�@�RLp#q��[*�Ӥ�%7�ɉ��C6A.�x�϶(HK(}����>�.d\\��x������a����t^.M�����?�W���\Z�O.�\'��;�o~z�Թm�Co��#���ׯ_��\"Xd�޽��H��Q��.4���~�744t�=:z��;Ʈ^�z��%KN�8qߚu��ʗ/��Q�F���8��aFB�^={�$.�;t�`=zt�-[�L2�0GA�C>���G/�МE:�T,���/h�	9�����,��AߞZ�iR:s�LО�:���<���֭+\0�^��L�N����$�n�Z�ߎ��4u��l���},��dR�(���K2-�כ>����NZ�畨�cm\0��+W�G;�Aȃwe�\0�0�\"�۰��\\�\n��D�������Q��O�*U��[)�S˖-\r+V,R�Z�W+W�\\=88�>�b-&��ԩ��V�Zkb%U*��}M�U4U\rĀy�l6�±9S�ڢgrH�(&���ëd\0��^�jElT�6����g���R:\nL���(��@od�o���xR���	p�r�3�W_}�BժU��̉�,T�T�e�8��d��!�S�A�ڵ��	���,��T�S�p�Z�+�^��j��>���`5�Z�cloL��D�ƴ�0�hVF�{�����L�k�.��믿\n�Ty����e�G�<��Ew���Z��$S�j𼾁ɋ^^0�,�i&�1h�7�yd`�4�a�ƍ�@�*&�?�T�M�6��I��\'� |��&���OsL�s�ufL����2DH��R����˾}�.���I�;*��<����ͯ�\\���s�N��~�T�b�0���\\�Ső��8���4�\'[��r�\n�=M��-���!�OcQ��U���%S�$�m�z��`���[�n^td���W}�1<<��[�n�/�]6�]�x��1�����@|{\r4�9R�ÿ��r�V���z��ĝ~�i�C0lƢ�{��sQ��Pˊ%�٬�#�p�e�ߺ�ʞ�s��z��10�?B,Nx�h��+1�A�U\n*D���룔8b�-r��6TӴܘ�B�a���JG��Sy�q�LP�p�Ν\0�F;7�O|�D�[�)R��ndJ�E�9�ٳ�J����(�0�E�c�oH�PU�s^��\\��QHU�\r�E�Ie)���0k֬W�Vzy��N����\0\\�%�Ew\n=�⡝�?)j�=�RX2 ��Fży�D�؆�ҟ�����رc����\n�[k�6.@��QL����v�s�^�kϏ�~9�ˮ}?����o\'������c�Kt�a�I�O�6�)S��c2�(T�����۹s��ݻwo8x���P�\r脓�V2���Ϊ���	�\\�-Ww����~P�a��l����L���q<�R<75M�+�6)�o�<yj�̙s�{���Ϟ������|�a7�Q9r� /�XZ����S	6Q6�d�,�󮮨�P�y��.��,�����G�Z��6��S�F	8c�zĈ�Ξ=[[[;v���r�ʥQw��[H��s�hj5���8��R�^�����~ː�I��[!�B���\Z���f8~���{�����}?�8x���];��\0��x�bz���P�cG���N�����(���,Y9(O��-�?}��>\0����:p��C��Io�w\0�3��:�1�Ԭ� ��L���_��޳e��OT7��Խ{w�L�诟���/\'�+;p��ĉK�;�+k��M��x}\"�>}��͛�&�wnݞesF��C�F3�>L�?Bk��㉴u�=�ZV`�9h�8�&�h����g@?�m޼�&\'S�̙�;��?μ	L4���OǸ��9\r*��A� �PF�8.r������b�q,&1�R9�T6�_��\Z��c��0n��ȣBM���H��� �C�\'��ӧ��޽���z�Ƴ���!#Sv���Ǿi�Z��ng)�N�t\Z�b�N���mی����Nhh��5c՞U�7nL���Q$޼���Fo\Z�I1Q�\"3�q�GEE]D܉����w�� xM�`����Y�v��ߴiS+���Ea�#\rz$C�Ob��I�h�\\�9���A�a��!���̙Q��\Zhj0��tp�i� x,O\0�B*�����h��/�X�溪 �!Hc�S�~�ĿW�u�o1�A��p8[C�p=m��y�.�Br������4a���S)��%����}$7:�0v�؜�bH� `�3�CE߻�1�^أ���G�?�$)_��A�W�o��s��K�T\'nܸ�����U���\\5\0Ji��Q�P�E1�l�1�c����;��Uu0�}�7�S��n޼��c_e�X�0��EǔQde���j�z��h�C�r�>��J�W>���+�e�m�����XMG�{�KP�\"Xa�<�B[�C�x&\\���d`�� ��V�fQ1��0	��E>���F˚�%^B���``Ν;��(U�w/�ΰ�b�~�ꍵ�w�U�KƯ��i���?Y���-U��\0�i:�--M�jMc5dE�6Mݪ����HJKF�9u;z���]�v5~ܱ��HK�ɳ�Ϝ�X����;w��=f:����72�J,XȨ�5oݲusX\'#\"\"��M���\\�+[�/�\"c�3�+�tp��`-���#mǅ�~+**2<���m�;�+V������M�2ϟr~uȒ\r���^}m��`<������s;��@��i~~-Ψ�1���|��M�W��g@ƌ�ʖ-?=,,�lhh�9��9�<�5m�t�(�8�o���3fdG>�TŁݻ��r�ʙ�׮_�U@�O�Fc#�F	�t)M��4H�w!����z�D�3�{	��|G��N.U��:�$��n��l��!ty������}v����9ׯ^+�00C]�+�b�{�a�a���W�\Z�~��^�AA��-8��vUt�\\Um6[m�CP�����\"«nS*<	�\'�A|c�*�,�i��L���ߢd�\Z0׍3�R)O�\\�aܓ���D�P3�\'л0���1��2�C�w	:R_��1k��C�.�����(WT�g����`҅A���8\'��t:Ѿ�:aL��R{]�)�S�$E8(�F��c�;�h�h�K�v���ז8냮�5[�zEq�gf�l��C���o�]��R21U��ۿiR���A�D�h?�L�ѧH���x��ח\'����e�?r�0�А�p@yqx4@v��,��]�t)�/����cǎ�-Z4s�UU}A�{�>�>�̔)� ��Ĝ�T�x�`�A�-��?������{#�e[�fM�\n�Q�/x���w0�1�\rue9w�\\v�Ti ��(��������\r�#Ѧ1��	�:��t��H�ۉ:?~�ڰa�ު�܅�e����8�n�G��?�����o�\\�|��Ii�/C�o�!\'���4x�Ǐ/	ݛ�<�[A�Ns:�*��\0y\rA�vD�}$:8}~�F�V.`B\"o@/(ծ����P���1�v�r��B,��A+e���+����T\0Tqp��{�P�r˗.\r1�\r��F�(Ъu��POsП��$2Ӏ���\r���#����B��ÇwD^!΍��z�0��������B�aD����.�q��D����o/à����(��0�=��4��#�(I���ϗ�8����h߾}G��6`1�4�q��^g��p�o�E�N��K	�ܙŎF��!�������,�1M0���mN�2��vZR���V�|�_�Z��Kv�c�.\0�q^FVUU�(�2�O�cPY���b�t��~�?�^Ș�޺{k����ɛC����	(T��ٳ�K�?[�lY���6o���}4�a[M�F4r�V�uM@�C\0\0\0IDAT�]��6;������~��������t9�:\\΢��>���G����a�a\"#��݂�F��.�`�J�����;b����9ѭ������qĒ ����q�U��M@����LS?B[�tڣ�C�H�=�п�|*�`e#\"#���X  (3�v�\"@�H߽G$=01��+]�V����-��H�S�d4��z?�b�Q���������L�a�H�-���?N�~\n��},&S�����U�W��_����>O��	�T�a�G%P�>����\rs��1@��uQn���$1DmY���cA�\'\r��U�ė�-��S�N��{$�8�>)�c�Y�f-A�L���5��m���(u`D���Hz<`�@Tt�|�NWQ�8��	ԛ�����ޝ���+�j���$Ib��$�{��`��Ԑ�i\\�2�W������G������9!���\n���nsb�\"C\\ejA��Ac��FYy,�:��et�����B�ᜬv�F=�:��c�w�&��׻�8���|�}��]�%=R�Y,��/_~x�*U&�*Ujr���g�Z��k��H�L�_2b�f�%�pȘ�����x�a\"�\'��㏣�U�ּN�:9atңd����׮]{:�M�gtZϞ=�a�\\��^���hz��>�>r��8�~��s@c&\"�m���8y~��$�#�G�f2�⒁\0�������NB1�/�ʇ[O�</�/o�\Z,���܍1��5}i�O�k�C���1xn#q���H���E\\����7r�ȶ�I3�U,�A�S���*�Ou��7�~\\>ߐj�&�P���\r1ȍA�9�N��ѳ	����y&h�:&Edc�\r�b«\r�o@p���n�7b�Ɇ�00戢���v��6BQn��t�N�H�[L�d9���p�zF��A�����m���&`,\n�0��j\Z��pL�k�K\Z����I���P��A��qx4��ȹj���N�.y	)EOF(LQ���&2\rI���xn>�ϔ)S��OY��[u�Kߘh3�t�%l��]10`b�W��E�N�[eMӲ����\Z�?���+q.�y�٨x.b��w3wc���2�����M�ksا���]�97o]��������b۷��R\\�L\nu��y1��v����^y��s�ι�\r���t�f�kA��E�	o9�3\r<�S�`���L�XB����#Ф׷щ�)�oFEFZ$&D��,�������0hMo�mV�`����x��WqC�TU�I�k\"��7��E�����	>K�V�:��L���[��^�ݚ�Ȼ�[�A�>B:MuQDF�.\"�bn��*�[X%U�t?��@%�a��r��A�עE�Θ�檪\n�]fzI��bc��*��d�FQo����ZC�C�<��5���U !c�?��OY䤣	�*��*z�$ưm���<�?X�Y�[N`Ka�wR9�Ŷ��5�b�Z�<`h\n�ad��>r3��t�n4��:��l11�`�,Aq2�p��D[���\"=ސ/_��.��GU52��ʧA�Y�����r{�WLUUtI7�H���D�ԨQ��\r�/�ĝi���c�\0�̆1\n�-���\r\\S��mNG\\&,�_�ނ>�EQ4�8�3p	+G.���u��<p���m�%Ym~@\'��C%1N���� ��,�1o����0�>f9{���&-F�7�Gx!�{��dY�\0}�AW_�Y8Ih�\'�`����F���7�`���<}����0j�A��}��gϞ=e��t���s��a^�g&�T���~�\r���E}ga�FE���)�?}�jժ�0.���[O\r��?�eE��|sl.Y�d pz��Qd�?����QQo��7�(�.!:��\'::rx�7�I\'IH�I�DVo�Y�GFF|$I�?���,T�����oݺ5cZm�E}�����Ȉlj�>���o�I#E9hٲ�T�^��;v����G��A�,� |�\r�gH�\0��_��SJ�\r���s6��ɫr��f�W�7o���q�v1�S�:��PZvl���	�	�S�C�ն\'1�F�N��S����9mh\r�������dEj��~���U�GAu����{Djcl��SSԙ���@v;n#\rNT�\")E�Y\nG?H��i쩝�V酊z�XT:U�׿:����}��E&~��pϋ�II�<zc�(�H�\n�Tخ	�H��_!����e�ł0�?�IG���a`2US��Ȝ���dH�|���Q�퓆u�6��\r�ן-\\H��{t���y&��8@���3\'O�G�Ҭf�����KkDD���v٦c���I��y�:&&���]�Q�!�}b2dX1uZ�p�T�[��r1��{M</��4~L��~D��a� �\r���Xu���f�I:�b��e��j��`�k(����dg*]�t�˗/O@�DЩ)��S�_�<�\rZ�aȟ�=oه�������A��Cg�\"O�ޠ�ZU�h�j��\Z�u��0�C��������z�����9{�����h�,\n��л�&�y�!#��B�2eʔMд��,�EՁÿ���������ͭ���<��w�фA<P�`�A1�^i\"��b���\\�ȳ���J�s���x�:|�M�6q��F��&�\\~�7`���z0f��_��yrvp�b>q:�Lf�UQg��Ļ�s�����\0�˔)���ŋ����_c�������Y��cbzh�Jz&A�t��0a�H���N��Sx��ʕ���Tߣ%�J�4��Їn0l0�2��b>9<I��7�./�	�\ZV?�\0?�^�7�8OIP��f�l#\"�3a~�gx�v�x�Ɉ��Wက����A��E0���A��t$~�cǎ�D?^>�t�ҥ���	_oݧN��e?����$��c�}��,��aN�:���8N�q=���н	�=�~�>~�(_�p�w�%o߾=��ݻcaЍ�!��i�,��N������E�8������z�j�GGDD���o��i��Ex�����4�S�=���s�ƍZ/��FN�~��\'�o�ޟ�uƱ����*k���#Q��!��	�yb�$���:z)*\ZtC�H���c�gݻw�7g�������E_��?���y9hǑ�S���d\0���k��ܾ}�bY�{c�)���-��~���Q���@PybV�<1��\Zt�\nV�y@[a�=̏��c�*}���9�׭�o���*����9]�6��g��i��dP��F�3K�<D)��O\r�)塣\'��̴~������]��ghی��?%&}�L��2���w�-OG-00�j��~9*&�~�IF~\n���w�����٫����mXy\nމ�Sy2�L���]Pi D�q˲B�3��<E��v���ų�a �A9<�N�N�E\'�D�D�.ddҠJ����������N\"̈VI���qC��.d ��2Hg0��c�Y�������1��}p�>���5����c0�{�f�?�p���\'��1��^�|��dm��� ��â�v�my:S?I/�2�H����kMR9�\Z��	����t�\0�0��Jd{�S���A�|?����N�c���A��[̖MUf3M�a�Z?C!�g�����Ϡӷ�w7�%���c�0x\"o��98��� Ne�*R�C�f�\nv��q�ɓ\'ga�ko�2I���W�%c�l���4p�>�(�KCa�].W���HUV\\�`��`�Df����ܿe@�B�*U�N�:}��?�͘�B�7	�$h���h6��Uyt�>�D�BE��7����e4U�9�E�P:��F����=�ك�}���=Z�x�y�9��&��J�E&�2m��/s�L�y��Q@Ł:��^J|ě����<8}��k0�Ɨ������FccI��q���_1O:�\\�ի;��t���o��4u��j��a4�EZ ��(�� )� `�Q���?������ �`��Y��+������AGz(��/\n\"��i���о-0\0IWoe͚U>z����?Qm���\n�s�~���y~ТE�5Գ�5��S�w*�u��|Τ	��	,:v�I8�}_�I�ψ�I ��\"�ㆅ�;�����C?�\Z$g��n�!�\n��\0\0\0IDAT~��b˿/��K?�D����4�;F^[��{�\'��_E���C�!=n%C.n��(��U�\'�v]�)�����\ř��V�0͂���H\Z�y��$��#�����\Z���K@�����Ǣ�{��A{�\Z5ꔟ����~:p0�i�]4�W@�?l7��T��\0��/E|}�GȪ���������/��6ɏh=B�k׮ٿ�r�g��vEfFd������v0\"�.��\Z��D HF0�����%*�~��FUU�]��+�5<\0����7�]Q�(���1�����q�V$^��c�ߎq�֍���$�$Q������0!�M.��|�^dc��!}��c����J�DF����>{w�}����#eE�ope��w�ll�#fc.���Z��ҧ#EAP�M#MJ��t/�=[;_�BK�Mv^_�T�s��g�0�Ű�Rr\"�:7}I���9s����wc.\\�s�N\'��p8L�[C��.Y�����h $���bP���;b��\'����[q�C:y�H�)���H�7��ag{�!%�A�A�����k��!��!�(H�TU^;�F�1L���� �@G���wc�Ýn\'yzM�\ZI���ӯ�7Ç:��17e��^�����hK�K�x��	�!aJ�	C�s��� 0!d���H��6�	�A��j�Jx����P^Q�nQ�Q����\"t[7B_|��ew�OoY:\"�Pr��Ms���:�d�_��N*�:��a1�K���N*��Ѷ�6h�UD��a���J��=`f�D�Ou>��*T�}���U�X�CǊ�~dI���y��3�*델����[�`4fWzv�#tC�?�g^���p����G��-o�bq3�-��Bo,4��2\\�9F��Û�9�-��_��CI�o?8\r\rQ\0R�=� ӣ�\r��]\Z#����3qӷ�6�v��G�|��X|f��]�XXX���	�\'2\nǀ���:;��r:�n�h��AAD��XHv��3&��ewf蚠b\'0��?��{q��>B����%d��:�?�\0��<y��w�#�\0���\n�#-VNAgE�\'CB���g��Ò�r��3a�*�4EQ��~���$JLA��gذa�%����f�їh�|\Z�m���n�������U�j{�Em�鹿bH3S_đ!�a<���w��=�O�2xj}(��\'A��\0��@/�<�r@�#,�)E\Z�舢��ǀz4�跏����(��14�7�.ڒະ�_q������� \n�ݒ2��>��h�.%��%J�Qm�-:�N\'���	��p���h�俁�U��M�e��@_�\\�e� �Q���\0��~��t+mD�6�c\r裾k׮�\n�{���g\n\"po.\ZOV6=pM\r�H\n@G�X���6����Qџ��7�\"z�\'�LS7����F\r6�$Ja��,�<x\'�Nt���2�2���L����g���ϖHg$y�4�S��3Z�%c5�#QБ�T���K�s� 4C{��r]eW��\'fΜ٘�eEd�� 8���w%A0����}�<��o��5���+���`��������3HRƄƘg%ɘ�hL�*�0�1�3�,�?`K��e�u�Fx�:���Cq�ȄhMU���=�.80\r�tNQ@�����_��j�������v\0��)a�-�����ӧ\r�˕+v���>c���(,��(\n=*A����QY�A�@�Y��z��%�_�v�Ά�	�| ������̾f�5&����h��c��ک��n��&L�#��t\nt$\Z�&��#sk�&��^�G�3���E�(��H^LZ�^�vm���Т1Mu��(��[�8-x�У���<�\Z�M���\r��Ko�Jh�l���Q��Ia�ܧ6RYo$Z�������	�hU\r\r#�:�wnEn�r�1C��H4P�IVƲ��L� {eUV�*0q���OH�C�)�9�����^+]:���\'�����\'�!��\"��o,<�j�\0��(\n(ox���gsL��ɋB�q�$���X\nf\nځ�m�!�a���~V뗊�4D�^Qy���i\\�DY��H{ց���R`q��6�&9��D�҄\r���M���t��o���Fl;z\r�3�qv��3���i�N��΋���Ueub,��\0�xq��%�@x�����`0N�u��D�(�yón��(\n��&���sƈ��i��G�w�s3�fϞm|:�������68@�W����H6�>JGr�B��,���B��+�xn�?B�t���oNS�@��˗�_²�?��٬�o��#E�\raA�i�b�bN�x@����M�q�\Z��/����q�o`�Q�t���P�1�s?<<�Fq�̏�G򶓮A��hP@����I�mG�$�4^=B��P_������>�K�8��͛7����ʑ��~���&�An�ԇ9����	�����W���뛀w�Ȥ����^:�a\0ݒ�#l���@�k�!7N�Y��D܀j��\r�{���.��������\0�����7�9�G\"�7�\ZN��H�Jpp������X�I�N�ms:\\��� \"@Ɉ��:IZ�(�.��b4��h�!I�\'@t��9HQqꙐ�(�㔋�E}`\r�-:S�\0��/�-��^t�7 Ly����2�˼#s�KqӛZ�0a#���\rk�nG#t@2ֈg*��%8:��3��?���EUX�X	Uo5Oò�VD�SN�vѹ�Δ/X�0Տ�G��$Io�\Z���I��pHc���� \"Z�۽{��`���1V8jo�^�TXT�`Wu:i��bi�fn��M�p�H4(J��,zӔh�}0��d4���Di���#1ː���Q�6{�?mڴ	.Y�d�c�Ol�����f�&N`��B�2�>*KQ�����Xڼ����,�}6�\Z�y���Y}fE�c�n1rPPp��PڭZ�<x���y�`f,�^�Ʃ�:��\rA`�-&S->�\\S���@Z�n��cҚ��\Z��ť\rX-�A*SIi !����#񉎮	�*W.i��N��\0�a��d�ޟ��.�$P�T�����s�s���jkL��:Z��(�J+�?D&}��]�=�[(��{�E�ά�U�$�����1��\r��\'�ͽ�nQ�TE�Em�\Zu�f�O�Z-�喨8y����TU̂�n���R���h|ݤ��1��-Ç��v��G1Q�)�gX��\'�]ʢ7�˓+��m?�x�~���d`X|Fapm$a����f8��7���wD���\ZD�K+�~O��ȍ�rd�q,��H�������η�܈�^��\\�r�\Z����f��EVC��f��}G���kwHHa����Kc�)44��]�S��X��;���* ���k��ˠ������ѯD�	�\ZQ�(���(\'t:�D��A�&T�wE&M��;z����#~!(��S��o�V#�*�2��k���x������Ý�����\'�MHT�G3kh�\rI\'��:�2������_a��@V��Mkֹs�^pj�,T��%`�?,,� j\"k!��q�ƅb�S��j�Iۭ��=X`d�+�9盐o,�����\"9�2���n���@w���q̊���MƝS@[��_7�%+�`x����)��K9�{��ի�W�y���JC�)��Ke{���%n�5��e���������ƿ�b⃺�r8ܳ�v�����!��n\0ɄhQ|�l�[�Q�o��v��d�B7��E���?ɲ<z\'Sȇ�Q�dƔ+�� C\n(Ο?�K�.�\n��(Q���=\0���3Zi�\'�`!aP�)z�����7�|��d�P��7tʮ��\0�w�h��(��`���S��\\]Vd�$J��%��1��v�O+Q^��0�2_+s��U#����z�Z�\Z���G�?x��П7}z��gO�w)��8�0�oa0z׸��\\7�@��=QS��P�1n�<�1m ��V�F��ׯ_����6�1t��@�.��VŊ�~��ny\":vV�\'S�/4Mȡa ��$&]��ch\r�xI������.]Z�v��>٭0�NOq+s]��[��j\0\0\0IDAT)d�j(�\"�qz?�0d�Xz8ݎ�H	��8��r�w��eQp�\"�[����~�ر�iݺumq5��Ba��|�^���\nS��tj���{ȉP�p�<:��J������O�֮]�?��	:t0c��J������������Q��Q���m�]\"�0K6���	]d��hLcb$&Nv���������<����?��N�@oˢ�3I��x<%+J�h�m)�a��a��7vyV�V���<8:��^��N�\Zt��}6f/���C�(\r�f�\ZC�.M[�s��W��\ZJ� CT����٧*�M�\n�.*G4<e��\rYM��T\\u�\r�����é8w ���\"�@�����+W�l\rctt�.�M�I�Io��v;�\r��^{��\"�3}Q�R��de�Kv�?��d���]�L�O���p��ł!��6{������ԩX��}Ͻ�-[JX�W$eL�-�=A�|`�҄�@�͐��8��H�zi����3����ʏ`��\"06n�A�e��cD��!22���m_t��AҐ��\0^tM�jRr���=9�ҭ����d�R��jo9m�Om6��P|��-3�A��:th��i�EƆ��v2���Ԍ�Q��,�Q�+J���$��A���t�Tʻc2���=\\&>��9y�䎘W�GDD�E�� @�y�u��#�	�2e�<\Z���0��(�\ZI���*�8]v�Y&���*����������t�bŊ��jԨ�J�*=�5j0��߿|�֭7���w�3g�#\Z�D�����\n��<***\0xZ1g3�4�6c�w:���%����=��#�VEY�߀l�!��0���\\�s?ܻ���wq��@4n��Q�G�ЙA�ӧ ݒ%K�\\A;=��H����hξiӷoΙ3w��j-&�T��ݻ��cMs<�?\Zci��#.��s��h��Ø��`�g���A�ɩZ\"z�G�@��.l���M�C�2��vdށ~1G�o���hS��A�g\Z0�$�>L\Z��-��zk�L&R\ZϤ���E0�W�&K�>��C;&�0iaPv2hR����PLF��h&\n`U��b���mi��H��\\sI.t �:�a��T�޼5�53)�/�E�t\'2�mƴ☰t6J�g�1��)��-A�IѫP\Zښ[��7UUի��DI<���9s��D�\"�3&�r~��~�y�{����oS_{L̻\Zc�� 2���0Q��10���ndAS<������3�DQ,�Ȩ��uWU��0\"�P��5*�t퍢��J��l\r� \nd�;]�;��c���F\\��W_}Umj\"B,.�(��a��@�ޗA���1\r�!_�\\E�ի}xݖu��=���L~����zQ��UX�YDEY�!,4P�\"���)�?�\'�7�3h�I\0�� ���>˂\"Hd�ȼ�|L>UTM�����.����\n��ⴸ�r޶xe�-�\ZTm�y�ޝ��ݫ&�Ih.K�0\r��[�/p�(Oَ;�<y�x_$dE~��+T�_&�Ɵ�=2��)n?Z��`�����k����G�\nc�y�<D��ӑ�FȮ��h|[Q��tW�1M��p����o�DCD���jZ1�QNk\\�E�xH\'��h��˖,Y�`��@G(\r�<:+`uQx��U#TUy�VEU )A�>�\r�h�B;T�������%aRO(����\\�a�b�h��!��S@:E�\r!!!��gN�ڳk�$�N�Eu����{���W7���4�x�C�I��-����OM������1N\'-\Z���^���⤥$J8��ṏv�7,��Z��o� QVr�gm�͘1�h�	���VsB��̉1�A\'s����L(��N{���5M����ó���hБ�����4!��)�F�o߾�����ȉ���!�C�`H��7�;u��}�ѣ���D�٠�}7��������J��㭫\\�r:I���ñJ-C�4W�)�=�{�}o0 �v%)���YՁ��ĳ�@��[ْgI)�h�����S����q�\0��3g�>M���<��/t�9N�7��0�-j:��A>@���� _��OfQ���$�#I�]�q9\n�vC��;^P��q�Vz���S�wR<�F=e��y���44��4�舤�Ĥ���ŀW�me�C4���8i�C��\ZN�i �$4�]�8Z�WA�0��5u�/c�%����T�\"�3��T]S��Ga�]Z#e�µQ�������C/\Z��u��z�އV�\"�#�Wv�Ɔ����\ZD�\"H1Eͯ�5�lS)l5)L��e���3����{ߨ1V��r��mڜV��;��P>�pZA��L���9%&�;(�Tm���h�\n<F�/�xv__�.N��,:��vb������q�*�s/^�,y�Qy������h5$!/��U����/1�ۑ��?6i �P�v�<�\\���tp� wl��Ȍ�$I�bG�W�VR��}�d׮]FGx�%2��<\Z�k����ǿռys\'�����o��i�L��*�^��\0DY��-/�D�dUU�?FJ1J����~��Y	s�Oe)R�`��#��Ȅ��P��q9��h��^b��@����a�����r+JmEU��K3���&���r�\\1�������8R���zSD� 3Y�$�N?��c�\r����Hvt$�VJ[(z��}M>�l \n#`�A���$;������b�>�Q�Fŷo���lYQ�� ��M�S\"c�}����؋B�C4t:����v�(�h���q���Pd��a��7HR��/X�pw�V��n1O���$�#YU�P5Ղ>ǌc�ƴ\r�(�v:��\"iF�(R��6m�/X� ;zֱD�Ļ�r��4v$�z��g�F�i�ɵ\n����Z��5Z�P��w��>}�d�ѣG�L�3\r�1k֘o�lklw����Ώ�np�\0�KMO�Ҁ������?�>��.�C�I��T�ʓ|D&vИJ#�CSe�����zIp4�B�؄�e˖I�ty�A����i���)vY�o*�E=�2�|QQ�e�,c���#��`�c;$#�JtPTY�b0\Z��݌<_,����M�����X�hߪ��sܸq�-��>���,��.0�o�v�w����^��ߵ����^P�N�;�3��EK�@߰�p��w;}V�p�����<�t$Yl���{Eϟ??D�A��«G��]�D`��?#~�Ƀ��F�q�@W�<Q�[B�\"0�텭pT�8G��w��4��\\��\"�h]���,��;����Y�Ga�ɊJ��|���AM�Y`�^���+W��_@Ш9�>�.��M&��-zDtt}���]�TРs�>=�!W��G7XVu��_��@rfPa\Z�&�?[�hQp͚0N�����s:ݔ�����(�oH$�P$Z�|<��жmۼX\0���ϑ�)�k_�����@!��`��r���b�hα�����W���}�^\rW �a��n0�aR2\"�a	��������6��Q^�\"��|�b���AF�4��L����\"I���]�dQd#���ad��\0N��_���,�+���� �����.�.����4\r\n˖i��y�8q�H�q`�#Xwx+��|��ޯ���:+�{cf�>Td�(Ƅ��y��L�cdƯ��Ie�mT7��F�&��H�]p�Ɉw9U��@|��>����H\'���qDt����벢�Hz�3�A?��dz�[��R���bŊ�~��gzf�#�Bֽ�n�Z�S����_���9��ȝZ��i����-�7Ћd�w�%�ܓA(g�X��茎�mq�+{���!r�܈�c=�W���8�*�JD&� H��z6� =xӛ��r���Bf�yt��$J��t(�6(���c�$�:��b�,^z)@d��$��a�梌� 9EQ�Ha\n��̫\n\0OyA<�˖�TF\'���5������f�ѳy�O�q�o\0=Ӫ�+g�n�HY�_։�?���R���.y�Ll�����֭[�\"�5��E[�^��P��Q`{��m�\"�Xc�����A���Z9��=MS?���\0\Z$���9m�4)o���\0\0\0IDAT�<wV�^��|��4(#�s_���<���Ō	���31�SU����썉~0���{y�v �\'۰aCwL�^z��g���\0ޤ�Y�z=ɩ��B����w��aMӚA�dY�t9���goV�T������?|;gΜ��Z���p�r���o5o>���ޚ3|+c������#+�|zh֬Y\0��,  �6��*22r��f���hy\"�?�t�� P�,@��3	}�\r�r�%I��atԨQ�E)�%8̞=��Xxw\n�i�O�X���0J^��c�o�!�\Z�H������P�Ll$��G2��8C�&�Β�O���!�dH��w���Yeқ��_��1��t:8���~֣۷m��y��a|�\r��zI�If��&��gAU�gʼgۖmF���z޼y��8q\"نؚ5k�\n�^�h�l��z�߅y�h4ңhxӘ����f��h p��=�wýD��U�ҳ�!�Wn�&㈼�DSE� +��͝�����*�ut�{T���F=��<([:K�,�Я���͗�oY���nW��c7t�~j2&;1��}��h�wQ<a}Ԕ9s�^�V}�Ӏh�	�]G��,�\nѣ��GC�v�Jlܸq)dP|{����:��0bO�؅Ht��q�|��|\Z\Z\Z\r<�ŝ1�T!���$y\Z���PX(�8��\Z�h\r֯\0��*i���h�!KyZy��N:IW�^u�\rE�fB���7\r�$�H���dUl	�JkLs�L�Ne*y^n�0����k0����[�93nH�d� �[��s��j�K��#�~pꜴ�ZW��?���0梭`�8^���^����:��-X�~�U���)�լ7G}}��SVd�	7�oz��u1��HI�@,R}������Nǻ��8�IP�[a�lqo��r8�7L�8�Ul����z�N�l��-�Dg\"C��@�(\"˿�\\�r�ߎ���j�nt�h��H���\'c��k\r#w]?�?��{��yK������/��gB�\\kEGE6v�9}}}�B�]��Ya1a��Y8ɛ�QD�L0�̯�L��0��Qo4�%1\\���̪�+�+�ox3i��/9�u��骪$Q��-X��v�ޞ�yl����H�\n*d����;��Ù(�WT���5e@��gm�u*d��~��9�:��ѡ�uCȋ>�/�:��O� B�\r;���h8,�^#UӚ2AȊv�ѰhQG�S9���G�Bv��=��	�[_\Z\Z\"�l�SQh��-K���6�������r�Z�����\'��\r�K��c6���?o���CŊ�En�F���F9�Εv���[��o����>��;�NZ���1��b{7�S�N�s��2�\Z���G�{��\\�<ٱ[�n0l��h�����-��R�^x��k׮w\n�N|�����?|�9r���۱�+W^\\�b��/V�B���\\������T��d(�^�M�[�u�4[�Z6�P����\Z�/=K7�{�q\'q�E�П2�?~\\xx���aEXX�uW�1��@��_hRU-��������*��k�)\n�==c��D\r��[�7^(��+�`�,�4�*��1:::�u>44�(�QQ��?u�ƍ#���=:4�ܝ;w.F\"z������W�V-t����GI6D�b\\u%(m۶m~�z��y��������\n���;FC�ǆtCEq\n����M�E��^T�3�H.���@�T�eȋtΓ\r��N	�-�u\n�!�(�߾}�d1\Z��x)���+�u���G-V��ڷ��Q������8��q��с��w$�G�{�>����w��%q�����go޼I�Q,��S�СC)����\"02S�3�åI���,�]��Q��|E�˸���ɓ\'Cʖ-���Wܹ�O%\0⿛�;��)Q���à0� 4R7\Z}��(���c�4 \\%\"�)��Ƣ(���{P�c�����0�v9	�u4E���B�L�婣��\r~:���N\'uF�A�4��8�Ī�V�u��E�c�V�(bˏ��y(b�`���	���4��^[�l���{l1��dj�p;�c�fUS���[� .BE�Ѹ�ȌSτK<�9��UϜ-$AU#�͘\Z!I�w��<q4(���-Ge�^��&��9s�jO>\'��q2�)\\e��ω�Nt��k�\n�X��U� ɫ�^^��1>�(��j��\Z��W{y6��/}���$QW���oc�\rAU�߳۽|y38M:SU�잩�j�L���N,�����#�ؗQ,�~��R�����Řhb�����1�&7E[nM�$Q\n�]���?j�E2��cƿ���� �L���iw:�C7	G*G8P:Ef,s��>7�]z[�ӿ��zD���\ny��#���x�#�~����,3��b���}l11��o<����\rr����^\\�Tަ��Ǐ�f�ZR�������;��F�#^)����7��-FKC`�P�#1�$����16���`�\r������J�,I�Sd������˜NG躈��^��t�?�������>�	�d�������P��L�4>�� �&� �鱘C��v+.����z-,,�΍��`b����q��P��&�Z:�H�O�]�v����/+��v�Ν��\0���ia�CG�]20������0]ޗ��:]�k(?\r��D��ny����#̜93+&�>0,�a��삯��?�x׵1.�BZ���\"�yȂ�$��Hʸ��dn�HB�6+:Q<h�9�P>��f����O���t�G��t��(�}o��$�C��A��M�6�t�Z@E�����tiT�4�U��\"���ȑڲeK�;��S�W�qNcßнG�u�P��������7�a���G�Ű[��?T�g�=�n|Ľ{;��5��W_}E:M� ^j?�:!QZ�dI&�q��>�]\r����XzMy/\r��1��IjҤI�e˖-�\\J+i�2��9��(��X��4nR���Oݺu������a�/��rxS����z\Z)A�+��	�-�(����y�\0�n!e����LX\0���\"�3��\\���������OqAtq����:�̘G�܁LdnM�@cN��(A�/�Z��>V�{�jή�D̔0�n�&�C�D�K��}��q)�.�e�rc*��@���!��b�ԕm�f�jT�t��-2�P�0O��KR+۽0pڌI^��D������/y��}D�x�s\r|g��-�f}W��P/���(Z7�ؠ��r~�N��!6�\r��G@�Z���w������(?�G���Q��V�j�vEa$�: V��\\�b�N�^*KG*�Y��c07k_�N���C�8<\Z����D�V��Ԩ�7U�r8d��)*�ޞ&��H44�\\qYQFb��t;�*�.�N�Ϥ3~��u=Й�(aT�ڢ�F:g�&S�,~��͐`@d�$�-��D��E>\ZX��(!!v��àjb5Y�\Z-&3��_��4\0���$P}����3�DE�2���Hn+\Z�	�E&��Q��Tbq�0f�9��Im�g�~�)��D=�؏8ϴ�U��Ktpz?@�to6iR淣G[�LxWSU2g�%��{�`EЋt��޺������jv�=��ܯ�L�!k����M�^$ʫ�3��0�/^��5�P�����L�_�	�,&�\'��<�$�	�K�E���3D�a�0�#��n��8Ɣ�����=��\\�(��攞�&a\"@�#@���4	�#����QFe���[dҤ3��X���_,aԛK��?rxF,ɑh��.�Y}U�#�������(I����qN�J/�D���\'i;V�xäW~��ax��O�=)\n��6���G���9I�F�YZ���R+L�������p?�^����9�.{#x}��M&��c���	����c��@�)S�T�;�t���t\0��h`���\'_�k���N��αX-�a���b\'$���yh��=���������S�5}Aŉ<�F����F�z(��K��u�uz�����c�5�������`n����ဏ�\n�n�[V�|}}ޱ٢G����N�E�i����C�\r�<jcaMl��\0\0\0IDAT����pIE<]��hܠ����Ht0l0��˸C�ƍ�6�{�Gh��;�3J%�Z�\0���̾PHR�m=����u�GQ|���w��E��\n�RA�I�����&@� �)����{@P�#H\r!�rm������\0!\\�]rwy��dwgg޼��}�fwo+�%**�\0�i�\\��E�c{�m�|y�[��\\6�&�U��T�f��,��TA�qz�QmhU:�KJ��\0�C�!E�P\Z�*|V�P�úf�����N�K�x��J�7�Y� ��l���XT����:�C�Rn�]�~R\ZZm^�`~K�\"�xw����#�O�t�c�o�p�G^x4<�g���u\"�$��@y�w�BF�*���)$<�Y�CCD(�$��c�DȢ����48�v��Q=,<�|��H��J��t��Q�|)�����͚�ݴaS7X{�|v���^�������H9No�HH:���FV�V��|�r�Jz1	��u���ݻӷ\"?�ڬ�XlQ)��d��=����A�M�I&y.Kr`ϝ �𻨐{\ZmƥЉ�\"����3�.�	Amh���0��!� �,˟�>�<E�N���\\�Z�J(E�}d��(T�\"2Rc�����~�c�.)�;�	��N�<����%6\r���.�#��\n4yR|JG���.B�\r7�Ԓl�v���19)D�=��	6#��{Ң\\����WX�Z�TF\n�,-\nm���0�3�$�t��S8l�zv�.jT�sj��������Z�|����/�h�?��C�9q�ѱ���������C�l�N3����h!2��lC8h\"|	$�=���\rR<\n�V���¯���#y\ZC�њ��O�����e۶�1|Ȱ����*?e��F&&\'.���NBH�]�/_����6\\��P_�Z�!�G�H?,�T�`\\�\0S���%L^�np�1��)v���-���������I�5����� ��&�a�x�h�u �=��G�7�y�s����l���		�y�X��i}2p\"k��ز��)�k�\"̹{�ZaQtB��OثT)�NLHL8\Z\Z�A<,k�7q�i\'�����ߟS*��֭���OW��6&A73�y�sytB�c��a�]Öb~�Gm&uJ�O�u�M}/����������^��w�h�c��A�\"2W������B�\n$�d�l�k\ns��M�<�=�5S`M��@�a�@���\Z������=�x��q��kҤI�͛7����#ćҍ��φf�h\n胫����pη��#**�Di4�⮼��ib�o�\"y%�dbB=�2r��A�����@�ji\r�|6��\Z5u�0����`\\��R(*IVy��n�h�X뉂H���~@UM�$�\Zݻ�C~1�Z[W�Ӝ0���eI�m�)�3�BݰI�F燍�d��Ů�rg&�@$��C?F��7)q\Z�U�>	Dy:��e��c�ɭ���4JeR­�5谰�\nn��h�D4�Y\\b����q�o�� ]Drr�u���h���n��X1�.G2Ȼ��g��\r���\'0P�6����\'�����aE��Sܻ�P��lP��ޡ͇��G�E���o޼��hG]P7ju���p�u��-���Szp<Ug�6-�R�O�V��If�	�R�\'�O��E�E��g�d�������A����]i\\G$��aRͽe���*�&Nv����ŭ$�B��~�wm�R��������gϾ�vc�v�q�B�!�UJ\r-,�O�(�;��Tr���CvЀ#\'&%�ר� ��шq�Ғ��tD�mW�^��111/��$SrK�-T�P��O�h���h���(�}O���hѢo����vi�`�^8�Q\Z�R��>_�x������t���B�S���8�fV+�gac��h4�b\0�������+@�*5�6��O>�d��e~�f�G�a���{���,;��4�/k�E�cg8�3�Z�l�D������\r2�O��L��.2�$��py�G�Z���]�ּ��&��ɣIN@���W��Fԓ-�$y�\nz��Ol��\rz.�\Zn����<����3�?D�=��;�E�% 0��x��a(M��9�%[�R�u3�n�Z�\n\Z�9\n�GOV�ʕ+7ܳg��^_\r��0�	�]eMU.jdQ�jI��r���H�Y������~��>�v��mk�v{lXX�vHH=w�I$�Zm��=o:j�d�N�v�\rx��;wn=2�2��i������u����{t��b2u�Z-s���������SY��ʛ|��-=�2~����i ��2��xt��ݴ0�a���x� ��Ʒ�z+F����V�6m��\ZwIf�yEr֣�?�έF�����Q�Se�8u�����;��Y�`A+�h�-�t�j�5W�\n�M���1�D?eH��l:\"���ȚC��N�*�P�R�\ZxM�\Z6���N���ey��j<�-�.H\Z��h��2�!8���2I����_�R%j��5J��&���d�&\n�0,Y���:dUժ�y��V��g�����׏�#|�+-\n���DR,\n���VpL�R�����lt�����[�/�x�o�d�q�)�{�F�\Z��\r�,��X,��� �E��&�������-4\ZM9��qC��*���d����μ��Һ�ir�wT\"_�<oKv{��fɟlLs8�eJ�r!⧶�Q:�r.A����갖5&%l��`f��Q��7n\\�}������#��ȗ%�>G�[i�Bu@2S�P�u��;�J�x�B�D!����؝����4�^֫C_�4u̦���twa:+�P(j�ܿ����G�m���Ujٿo_u`�!8N_����l7	�]z>�.�s��Lܸq��O\rz��#b��~Q��m%��@�>�60�j�nGD+<�����?עE���!!��k^�JmJJNl�R��%�},��ӥ3����Z���R`�yaǎ�V�Q��xU�_^z��,\"�aچ��/yJ���\\��-�-\\�����|F�y�^��R�P,�`WR%�^G�{U��J�#V�y�ϣ�\r���Ǚ\Z��.$]�^h1��R�\Z�Y���r�ә70v鮄%�~���J��\'N�Huq��V��h`�e��v�=���v?�P�mGu�E����R/4<�еk���J���cZHHИ�7on�0\"s����=�IyS�ѭ�i����?�΂R��	h�H\"?i\\��&\" ��c|����*]��[��Ʀj�vZph𜤤$��AFk�X�),%������h����P�m0���%i娨(�f������J�w��l�n�kԨ�ބ	f�۷�s�BQ�l2逛�2���<�5��و�}������u\"*l�O\r�m#�D��W�x�\'�\Z\"�<�/�q2nȸ&��eܷ �X�B�,�������7�̋�K�Dcb]d��\'G���H��Vc|k��3g�|����v��w��5�QN\Z�HɤvK��Ka��^�z�A�}�+Q�Q�f�	7i�c�G�a�E呂(^s~��Hi;���j }rǎ�A>5Ҏ�š\nw�C���,h4\ZiХ��?p>i	X\ZX\\>ځd�ӧO���ׇ�9sf�TN%4�rj�*��Y.z+�HU����dc;E���[ԪSkG߾}W�%\'��ܟ��<�@�����;bb~�Ե�.4�� PyD��>V4�v���C��)�?�ώ=�2�z))%i5dSG����\r��E�.X������v��۶m�-�۶����\r���;��8����$�Y4��<P�i����>���O?7Z���>�/\\�a��p�SR��9Y�R-�S��ë́:΁\ZA�]�Ν������X��%�Wc���bUL$�w:�n�C�3_:��{��Q��#�6�)��KLL�`�)�Ȃ*μ(MjjVk&G�F��통��wƺ-���Y�f���m<�Y�a�{�A�\r*���j��9���CrS�I�\n��M� 8��\'�4÷j�r�]��U�t\"�(\ry:W�A�uZ�K	q	[,�e�R���%G)�)��v�o5#aǑ<����b���7��`�#�ǒ�:�(�b2�٦煝��)?�8�R�J�۲y���\'�h�v�f��|:1)�Y-+\0\0\0IDAT�,n^S�����$�q*�ǭ�\\۶m_�^]?4\"bל9s�^�q�9�N��Cv|gP�)_\'i@\nJK�N\'~>��>�7o}��d��7�BU�nw��]��b�}�Єk*o��/ƍ{v�ڟ+\\�t���ٳiAr�h�����~5v��oڴ�ĉ;/\\�@�;ӥ��3To0Ђ���&�����v]� �^�8�G_��W��\n6��تf͚kAH~�={6-�R�Ͷ�v��ы\n�{����;�$I��n���ȇ��)�uʗ_~���>�l\r�֝8v��C���,3f~�����_@\Z����k�}�����\nW�]jk�KΉ�3\nH����RLV�L&-\Zm�2da��3T�P��O�q����(��O���q�ձ+�X��UǙ?��s��UZTQ{�g�(��uT&��c6��;��޻�]!�6�NJI1~��:*�fT���3E^���3��\Z�y�ٺu�6b���w��sd������5.6`�x�a,܆k��v���c��&��9Lׯ_o�y��>4%�Hr�����A�0�J1��������^q��\r:m6�M����\n�1�K3S�[�U���ѩ_�\"Eփ���s�Χ��v��N�x;A��΋���u��5vTF�iʤ�_|�\ZH�ϐ3\Z��� �,�)���� �\"��$`j}T�U�V$���zkժ�Faz�\nb|ù�A�HE^��\nD��7=�O�\\�$�P��\'���+�d�i׋��?�J���\\�(nת��cBUYl֓z����iR��\"O��\r�+0A�x��ت���Y=K�s⦸	�Ν���s�ݪX�b��ɓ��/k�O�%{%�d	#ݝ�(�S<n�0��������֝[���* b�x�	\r�F����^x��������u�M�u���d�!� �l�}9F�ԺR:�$W��z�7�;�NPx��$s��k�5�n9�� �F{���\"uX�ۙ&U~T�\\?.^�mz��[��\'pώF��A�?�J&�Beq���N�z���r�ӧ�n.�MS���f��$ʕ`6YF���!��tyJ��?k��D�\"h����<�li������:�֯O���*{��P��U�;�l3�<�E��G�.��h���e�#�\0a�8�T+f�3u W9H\'J#�y�}��/�$)\Z�VGY!��Ú�x�\"�O�)�����J��+W�������_�FS�V�J�n��h����\\�R�!��2�ׯ�����dS�\Z�Ap+�\Z�¶�qȢgbQ���|�h�����[�z��V��3����:(�*��I�I[�cv��B�KgJ7-�wJ1<8<tozX܊��R�%B�T���{�P:������\"�?��Š�����m���������\r��B�\Z�����N|���bƔ��Q��v�>[q�8C�q�-�K��ʍ\Z5\n߿������GQ6l��|)���f��d̒&�ZP���+.�|%��|�נ������{ѢEk�͛�<�_�$�6��ʕ�\'\\?r��g��=<<��G~��g�׫G}����),Λ;��k��h�h��;;To� ���a���U� ��8q�d7�f���édQ$�\n��v:��Ȇpgn�D��S9���/I�ʟ<y��H��3�Aqh��9�]��Z/6��\\A�z3::Z�~򬿋�I�zaƌ+���o�-���|h;�Ө�!�h�D��q\\��=\Z��Jj\'T�����ã�F��ݗ_~�S�{(�֌#}�B���˶aN�z΅EjD�R�.�3y�`N��G��԰J�=�F��`��\n*T?_�|\r����zV>���݇Zu�ԩw�~ M�����!���y��e�#� ����|��0U��?�HLL����u�BF�7�h�D�iǓ��#+ґ��`��3���@^<o�<2¸n���9ȸ�	M:����HC��O��TX��h4Ϸo߾*R�:u�f��J/	���h�a�F�h~�$�d�I^p��r�k׮R1;cz=_���M�6��:u*ҁd��4t�JFGp\r97��B�8� г?��G��V�JPhԨQ��˓\'_��+D��Ҋ�1	�\'O�(,=�T\n�s!��/+��9�NV4�0�Ә���~��W�\n.\\ʔb�й[珱�?�T���A�[��Z�r\'��\'/�a�������2Az��I��0���MF�\r���&��(M[$$��3-�\\4�w���v�:e:T-�l�v��pD����j��+X�V$w��L˛��w�)X�w�\Z7oŚn%&����l\"\"��밨�Gʏ\Z1jHRrrO�F��Y-J�r9���ۀ;�%�8.�u�s!�Ri��j���y$�)\ry�X�b���?�4(+�\n)\"o�H�9��I\n���T*n���h�Զ(�]O�dj������\Z�)��1�_Fz�V�}��\"�|�ʣt�|q_@��,\\H���bŊS1I�G�	/Xy1�J�!.4JG�d�Tw�|�M.�(�8q��q�)�����j���\0���JG^@��ujө�A��x�ϣŊ�(1�&d%hAh��jz&�+ʗ�r��H�DC�[��:vl�S�R�����vݧ#��#E��b��Ao��D�A�ɠ#yX�nҤ�-ۚ�Ey[��*ݾ}�Ko$�-�T*M��\0�°���s�_���+W�$$$�0�|\r��Ѩ�o0�M���,&���<�LO�jgΜ�\0�џ��F��4��\"�N�ح[�\\�B���f\rwEP)U,N������hz�W�����KC�ZHp���m?�$M���\"Om��X�k��5@3 >�������������W0��[�jU�������с�ź%����NK6�K�]��a�֮][tϞ=4�Q�4=��4ox ��Z�paQ�^�\nHGW�\0c�[��h�Q�5���yD�\0K<��\r��1�=0�u�\r���>aL^0��,��9�X�X1�������x���}R>�������hs�+OH�UG�|e���6���A��r}...�]̛�B�A��-��s�mp��\Z��ĥ9�p#9�P2L�\\���V	0^��M�Vpܸ��͞=�S�>��C\0�R8��-��A��>�%�7��0�Q_ /�:M����~���я��8{�s.N3~v��neO$�\Z�e\0OA�`�iq��E�ҥK��ٳ�[�k׮�J�߰a�/`��������X���0�Y��u�]$�I�˫4����k���R�5}o��ݻ�\Z���9�p(�����\Zm6j,�7y�C�>}z���Gk���\n�>��_�U`��{�d:Hr8^N1��W)������K�(_{� D\Z��\Z}>�U��+�+v��q*��NI�o��2YmV�V�!b�%�$C�2eJ�W*�R{يO�ӨѪ�+<OD�����S�T��\"HϢR�����V���r����4�\"�\r\n���ɒ%`�\nG��f���p�.�$ہz�\\�bE�Mk�W�Z��آMZ}ݦͤ��zW�kݺ�A��.�d�����Ä�a9E���d��������	�� ]�F���Q�{[$KL1���<a!C֓�.^k4j��M�69T�t�ɧO�&�m�s�!n��q#�y����~�¢r�\Z���\n\r}�Q�F����$�v�=�b��7/)��&��\0����>~�z�����q�֭ ��a0�h�b��_(����G1m�䗰��U�t�<�Z���mEbA)+#��_F��!q�����h�:u�/���گ�Z�p�&�����?�H�r�� 9)Vs\n-���K��WQ�X�2-�m�:�i�w�7��ҕK?=�EQ�Qk\Z�Ԫ_1y�\"���v#crTD\r�*��;�l�P�R�J�1���}�v�ͥ��h�7�nsA����r�y;��0>~�v�����y5��U1��@nK�8l����G�	�8�%�x�?�=圙3�$��+�2��� b�T�\rB���6s�_�m��s�U�[�Z�f���,+t�(��uG\0�;�#]ʝ\Ztҋ���V\Z\"��I���#@�>��t]<&�@\0\nL�4�\r*ۃ�I���P[���6�>u��|�xL�_֨Q���O?]���?��\Z�����իW�[�d���Y/���L&�Z�6e~\Z�D��4���\0\0\0IDAT��R��������u	�#Q�]�iI�M�oD^��9a,��ue�l�.5㎶�Ax^G�Лt;�sr�랮]��\'�<e\\^>�������]���߆��2h�κX�}�65��8\'�z�v����w�v6�6�o߹�?�+�֭�f�=\'��)�}=ԣ�C��	H��viǒ~�՚��(˲ػw�\'j׮�$�m��G0��7�!�7�f�P�c��KJCa���?f̘<~�a���{��ѣG����E���,YB��{�����R���gs\\G��A&\Z+���+U�jFG������E#�{H��C�8#��D�,(D6��Qz��\nGFF�2`��v\n(�Р݇�W�^=�3a&�ae�@~J�F}CP*��R~T.\Z�҇�j����k�f���Kc@�F&���82,�\'pm�[��pt�ѱcǎ�Fk�+Y��ߧO�Z�x�	l�Q�E�����p�O��o�J��jի�ݼmۏЗ~v��Z�;�v����HguXp��o�\\��n����֮_�a����9�c��ݳw+��6�b�Ѓ��M�za�uA�7��sطm�F�:�t���Q��j�j�¢��)��;1DD٠V?�TMu��\\����<��}��O���xv� ޴ۥ�8�7�)�d�Rȃ����e˞|��ۿ�۴��ūSJK/D�dQ֢�!2\r688��\0l鹚j-[�4u��uՄ/\'���<�!��vJe>�@\nsz�]ў=z|лo�\ZE8�m��֤�-:d[�\ZY��R:�G����L�ł�V��qۮmˑ��Y8ű\n��Ag8���er�G��|��+\r��s�~箝��ޣ�//@OJ����R!�x\n$��L�(O�2ֲc?���K/�d�޽�����Ǭ[���e6��H\'w��)�	�=	�U��#/}���f�Oԧ��Q�@m����d�Hv��\nQ�Q�:|�,�i�I����.�~���C.^��}��^�ju,LII��ɚ}��˻�����P��j  ��\r��w��N�g���Gx�r<��TqiQ�CjGY��N�ܕ�I��Wc��P(~�K��!t\Zw�ĉYmڴ�m�*?�q��zH3�41v*ǎ[�q��ua����o�MC�� c�0ﾉ�H�!鿬�Y��d����)�~��-�4��$�!�i��sW�e����Rt:�5$ɜ���͋ ��� ��E@����hנ��bT�{nz�� O�	D�O�\Z�@���}�p#O��P�2�N�����;!-�\0�?�X�]��s ��h�Es���%-{�3�Cs}��\rQ_��ׯ�y˖-�0Sz��MG@>R34\Z���b��A��)��R����z�*ԢE����\0��lٲ�*l���!M�w��9��Tav�����h�T��p�E������&X����ah���	Iy2�ӄ�J�\0�Q�B�@#�����#G.E\'\'k�+��ir�݊���,\'����ֳN	I	��ڵ�eޒyi�oĥ4g�xLԴ��k�\Z��X�\r\r݊�lZ}#�]G�E�*���͚5�k;���*͘1�?\Zhx�*U�lڴ���}��|��F��l���;�h`��<X���?��r��`9؅ΐ����?�PxЀ�co�����l��AF�ZD���ؖs<�d\"�l2�N���9���$3B�0(e]�JW�5fEϟfw��%5�BRgY�\\�(�IAt�?�A��1��B{�b�^�bEj��L�v���&���F\Z<��:��u� w���a�NM�\\q�P�;a0�G\Z��\n����s�{#N5g��g/]r}sQ���ٕ��R����y�;J�R� \"$�G����f�X���U&ܾ�(G�!���J�*�۲EG��ࡃ�?���?��uw>Ɖ3Ol7n�iEtJ\"���j����I�\Z���K�cbb~?~��r������J����R��R�ȔT�;S	)ƎH���C�f!tT�ԗ4�n3�;�\r��p��tE��^			�DQ;�ju>#NI��Z�|A��dͤx�N�@��o����t�����x6��혣�����ق���<\Z�8��*�/o͒$) ��A,��@��0�}����ùBx��f͚ih�V~�A���5�~�g �L��ߙ������7;��g�;x�u�v\r�L�o�8Je�2���\r:u�%\'+S�7a��1�u/�ǐ��0�J����%�\r�t��ԟ�|��zxϻ�`�	j��]�F�S\n�t��S\\�x��=p�ݪr}�;��آ-	�g�����a 滑�d��Ж��9��v�wB�ϟ�s���k����_�+n锶Ĭ	u����SA�#L�����DެU�V�ժV�Z�w�y��r�~���K\0 \ZDb5&�xz���Rg8�JX�FZǆ����dɒ�A��A�al_P\'Ap�呂2EG,��J�.�[����ӧ����v�ڥ�~�p&�%��A����\\����i���W�P��Ɔ���+��ʊ_V�^;m�|Z�ߗ��So�J5LP�a�i�Ļ8�6�`����ݏ�I�r7N(�<q�D���g:�V�|�jar��r��`�j͚5+�n�J+]D��(�c����j�MW��s��v�Zc�ҥVN�2e3�hu7E��z�ڵ�V�6U��\0�h�E��:�Xt,��J���J����c��\rX-��P�[g��:�QG2X��T�uTԧ���l�S#�����w�3�V���z�6E�ܨ,��J�Z���X���Lo�ɰf�j��\'���\"�ꐾy��If=:�	���.n���Z��,B�Ն�|B�H�Z�a�s`+���\'!.�i\'~9�lRJ�\r����D-�JU�!:R�:͏?��y�G}��Dr\'�vTx���A��VF_|�ʾo߾�22lȏ�G?��IFf��3&+��+D�N�\rÛ��^C����e�v��k򼿭��W�ƍ#��D���Ǯ�7���{�N�>����N���s�wF��H�9o޼m���Kz�t={���xw�>��W_;=����c��j�X\nb�ܙ��,3f��S{vۚ�:\n	\r�h%���hcIC�,�9�՟Z�W^y%Ĝ�TV���@F;?���f\\��д�����@j.¸A/�,���s��Om��i��>\Z����~���,q�F�� ��ƍ�ms��D��C`a���7����\r\Z4h�9�%�׭[�=|\'����QAAAS���Y�p�B��@��Y�z`>e\'��p�!�ȸ�>�@��� |>��|��sq~ބłc��mnG:�	��s�\'�ع��V�����:�����9��2:E�m�:�����y�&a,�]&,|�m�u�r.W���RO��n�;�]�O�)�u�~ٲe�^�\0W�\n�\"��H�u��n�OQ�v�\"��u޷�}}��?����ĬV�~�x8Y�T�JJ�`����%̝�\0�]���Fa�k�z�\0rnT�Zu9=��4�dW�[D3�r�JZ���\r0���|��f/\Z�^X�\\�x1`��s��# �ɩҥw�$�-�����\Z��7ݸqc��ӧ���z��@�Ġ�g��o�v�=zlB�c�?�V\'LOa7�c�W@`TiU+�K�f�w���Θ�1;@pa�I�*�J65p�L�v�ȑW�^���_mƛm6۾?�0�V{�d�O���sq�aų���ÿ��1�N�����ծ]���[4�K����e����@F=p��{����G˗/�P2�t�%K�������?���f�����q.��z�E[dT�ۊ���*���O/ªbŊ����_w�:{v��o�d���+V�hK\'��,qhG��zlm�v��lE�$��cθ�����P�G������� ɿ~��w��L/o*�����G�:�\Z�f��ܹs��H8��EM׮]�����x~ץ�\\�ti�w\\�q���O?��~�}��x�y��3g�V�o��������z��B{���N��ń��}��1�ϟ߅�nǶ���y}%�/!Y2r��%Xx.A�\'��<��~D�rz�����G��}�����2�Gi0�	�Vt��0c��S��܈W���=ۨ}�\0\0\0IDAT��\nu��XH�@�F[�V\'�C��h�4}�]����T�d�������G���j�p���h�%DAT��(\0[��g�蛝Q�M��`��w�2VrZ�PX�˽ ��5����3�_����cS,�bH7�:烸� �������\rĢ|$��7n�\"�Վ;f�8m���S�\'DGGG�ޘ�h��2j�-��~�B�BNB�p��a\r�S\"�2�!ݮ\"`RJJJ=�@��~�8���>	�ۂ�V�o8O�?y��Ֆ�ksJB�Q�8��(7nܸ\\�#�����͇�E�:�r_ǼA��zŃ�>}����7=r�4恽�Ѩ�]/�_�r�(�\'}�ysDD����P���=��L��(��L�rӷ�ڹ����c�KP�G�ܒ${����`Ѝ�!�$A(L���jk����u#��=z�`����h�Z�vD��-{�#\rm�4��\r�軑4�� ba��O<aBc��&]��D\Zل�xXԒH~�<y��aY��0\'������$�D|��¡;�Ɍɗe2V�N��!G�3��:���\Zi�h�#��U[\nʘ쪟\'�|���@:tt��:%�k����yN���˗/S]�0��(Q\"�z��)H@yS�©��}J<����o�/gYP&��\r�	3�=��v�nz�G�(o�2��=t�тbժU�6Mؐ>�J�8����� �T�ˣҥ�Oy��Tf�$r=ٟRgG��&�bcc�f̘�L�^�ɓ�P_�������-��iQ�:\"3���и��&�!�ʰ��/���p{}�Vh�{N\n�X�VK<v�R<�[�&�\'\Z����^��Е*U҃5����*�ZQ�X���8�!���W�2p�C=F8d9�J� �I�X��G���)�}��ā��i�>^���i^R}�O��|.�ʓH����V F��j�\ZG,���E�*���n靂�7B�$��5}j,Gz�:�Ҁ<u :j�K_� \")@��tNL�J%��p���_�_�\0��F����Ep�Y\Zo�d!r��G:��`�f�Z��pP�!�ND��&����� ��|����d�I �dyդ�3�\Z���J������Șd������)�U�Aڣ�����#Q�@8�P�sq�����\\)uaP���΅c������>q��\n=��I1\ZO��z��9A��4����H&��\\�y�ҝ���!�{ɞ7o�H��x*6;Pg�/]��q�p�7Av\\���ӳ\'�����6:c��B�rHVh��hT�v\"Z�1��c�ݡ�ִ���bq��ݻw�+�9��|��뜡~��h�Ɓܐ�KE�Q̞d!\'�D�����q�R%,(yڶm[����0y��pHc^|ᅏϞ=K�4�= �N�J%�i��<6��UI/�����&χm�\nn����AZ�����^J�!m����i4��#F�(�v���T6G�f�H�U����q�;��u ������1w��{7N��@�L��c�^�ֲLGē����	�D$oʲL/Ɯ�����!w/�O����Ν�,�ۈX���[6�\"*f��i�E����]�<(�J�훬�I�V&4���M�8�fQ�\\��h��+�$-x�IVit�-k4{��uy�V��� uױ�����7X�;EFF6�y�u�����/��={ʴiӦ^����;m�T�O���w���\Z���9%y��q�c`p�R+��bC>�G8��8Ե��|�By��m@zs׬Y�v�Vg��qG��h�����f�H� ���!#�3ZA��_{����<$L��K\"�X��:�1Z��j�R����#�^�I1�;M�4�p�o֩SGV胺XM�%w��&x��(IB$��z&��\0�}D�t��D��RҎA�e6�\Z}��-�X�����d�����Q�G��V䣬i�eˈ49 o��лI��#|o��Oq7:L�m���$b.H=C9�g��@�i8���5�F@�\0ĥo^~���p���i�?��ua{���� <�cǎQ�,V\Z�Y��\'\'$P[Ȭ�}׉(��U�,��-av7B\Z\'�\0��7���T\Zq;�#&�1�!(�Z��Yk�S{\\�6��r^����\n��(ԕ;B�a�1�u��}�K�1���˗���T�d6��X�rG��U���AX������X!�����F}�Hm��sS�N\r��Y�F�6�Z����E�N�:��N��k��R��	�쌘�����2�\0#�u`r9�I���7�9ɺ�=�MV̮�}��d}D��ݻ�#��\\��>�S۳�L�4��5+��h�q����7�Ot\n�P�l�QTL�tp�(&r:O:�0ɯ��`��ay�p|����_};�M>l��>��d���8yHA�� ����z�/B;���\'�8׃!����\' a��Oo�!�7$�s��������]��p�\r..]�4�o�g�AP$�H\n�fȅFD�D�V`�18R7�>��F#��Z\r,��J�S<ZWY���p�@[x�J�XZ��8N���\r����B�\r����\\*7�xף^��ň��\n�<��]�\Z�x�D�uC�x[�?�ϗ��N��ᐤ/bcc�$%%�G8�-&_��H�m�tNr�Ѱo߾y��oРAQ;v�h\0�>��5��h�̙���I��(?��S��f�p�T�@����J�K\Zy��~&���Q�Z5	V-���>Pl��h�3&%��`5br�����\nDO	kJ�2e�4�$���ɓ�Jg/_������Žz����$�q��T����\'��9�n3�|����X3䮷�e\r��.���%���^ڣ�aÜ���r�M/�P>�D�7���>� � \Z�_9�{䉔����چmT�k��w<��8p���8�����R̍H-Z�-k��Bٵ���SHBe���,��_XF����&��t�T�f�h�r�Jo�}n3&&�h��o���a�G���m���-�k�^\rX�_l׮�-[�|�}���s���[�VN���SR�:y��P4�;�[�	u��J���!\nE�v�s�\n�E�6���$�>M�IuM}℻�ky\Z��n���������&Xl\\�ٳ��Ʉ	h{�nܬ=y�D�>��0��,r�.\0����Dy|O#��%ە8q�ĩ���w�z�)z�,��y�����;����rx��Uڢ�~��gΜɫ��~�%g0HϤ}����I�&���֙T	�DM�l��?zF�,��-O5���ӏ���1�\Z*T*M�����4����dX�͛7��P!��8�\'Q�\n\\N&���V�����F��.O�3�E�)(Ra��u=aD�eII����\'��]�%g���8�3��#DP��6N%\'\'	S>\"MFo�|�9�cNI����&�yl��5�ה]�fM�5�k^_��Һ�\r%M&��;O�SF�i��TU��F�R�P��v����c�d�~C�\0�y��\Z�/88�cX���\n�V�jժ�kժըΛo~�Tٲ�\r��Q!a!�7l��c�ƍ��&b;�ܯ&O�|\0��H!}ItZ��a��Z�e�Y|�  H9��@fhڴ�~��T��ɓm2�����7��B���\"�<<<�X8\'ê�%��<lgF�x�^�GO9�,P(&׻��)�\r����yl�#+4��!I�NE�-QTy.�L\\C�g/������xNI3�P������Iz���|��x�hLnk���Y�F����؂S�����$�*�JW�pa�8u���S�\'`[�+x�ԩS/>,�c�S�o\"��AhW<���v`���g���̣	Gg�����f\\�|y��l^\0B����������黕�wd��|��nܘ�R�&HAA�s�\'O�3AA�y쒵�>(�����o��p���\'�,&��	�=��ߧ�<Y�七��߿��u�֝�1cFF,��C�$e��=��]��C�NiV��ӦM����߀�t�o�yHlv��.M���ڵk����$򰬥�Y�鞧�a=Ճh:��D�2�!dB�����G��d����lV�Z�!+^E����&T�c�N�ʕ3�}~��ϟ��e����WF\'&&���r����s�ߡ�J�ҪR�f�D\0\0\0IDAT�\0�,����ΝGfEuO��֟t�ܹڏL���(%�%;v�F�\n�O�9�X�L�͛7�\"f	�U��LG��N\0��}׹)...��ٳ	��^��o�|��Wׯ^����g�>����c/\\������7i3��F��P^�o���#��tL4�^�T�\0#�a�^���f���vk�={��=,>\'���&DSC�!q����9}�&�zܑ��^7�f���͛�� ��a+�>�����p�A���g��ǌ�٭[�7m6{�୕*����<�\'���|)�Oz#_@�E_Q ?��œaEߒ�����%�.QET�i��?,!�q,[�����\"�t/��-v�!pCH/.�cF �\"\0+�-22r���4|�p�9��E&N��p��������������?�9e���q_��\'J��%�z���\Z���~���­7a�0*cI�NKL���믿�Q�JA�o�\\���I�F}�ƍ.��#�C���\Z\Zz\0	�j4�r8�\0�h@%rF k�~��5�B��ɓ\'+c�+��Ϭ)��s)X� �˕�X�\r��\"�[��.��[ƶ?dپ�h4^k��5o޼A���{e����E���ܹK_��хʘ������+Bd5�f	�y�8�Û�	�8���2RW�l���;�k�E�t�����Y@;?F�:��Ϫ3�\0#��L�2�*���ܹs�dm���H��U\nX�nb뚶r]An���[qӈ$#ϫ���w�f�hl�\0!k\nRS@��F��#D����o\Z0`Pϸ�[��f�ٳgҷ9����˭��� ���fs,,���*��83x^����}��~�]�zu�-�ȏ�\"@���z<�85#�923Nz.w�t/�P]�t!+��k׮u(T�P��K���%�^��s�@o��@J\"#��rG��ѳo���A��^&��k�[���A�����9-CBB���惢�?�X�b��e�6ֆMܸes�[�n�?�����X�(l�(y��_�B�/d�z��y�g�Q���,�A�/Ϝ9����yM\\��W�h�kͱ�Y�\0�{Y�g�H|�60��a��B���͛}�7o^:���מ\0bN��Z����)�MX��t���G͈ȭ�_�Es�|)�JkRR}�s7t�1<<��޽{�sL�wV��^^b۶m��_���С�qq�^�~�\\H��#�&�����a����R��x�@����w���\r,z����LfT7V���}k ,��������k�uf�lE���O?���H�\"�`\r{q�̙~c�.���q>ngIr�@/�H���x�Hy�wf\0Rs*111��`i}/,,�\"��ԩ3V�� �On۶M猜�@��!h����cK*��5�z\nJ�� ȅ�?���	7o�����$�E�@��鹻�N/Rf�Qޗa��	�\0��B��_��If\\JJ�6�Mz}|�\\���̈�4ٌ\0�l���f�7�����/BQ�F\riҤIˋ/~�gϞէL�������0@ȃ\0��\0+�������HQ\0�<\r&�����\0\"�dI	ڱz��m�ׯ�&Y9���c�V�3gN�y���Y�z���d̚5�@/�,X��XժU+�t��*�굺u���l�g�B�B�&$$�|�z��C�v۽{�.�C�Q�1[���Y�1ˁ)���T|F�V*W\"��(X�c-K��{\n��ُ\0��րH��>y��X��0�y�,\Z4h�2z�������ӧϐ�E�z�WM[O_��sd3uKj@���lm�˖-��e��t��.����8�g���=F�\Z��~�J�*��������?��E��}z�i�n��D�rH�&\r;:�%�C�q�ƕ5~�S�Ǎ+�>�O�Ţƌ)=r�� �v�ȑ͟|��ΐ1�s�.��t���w��<^.,((�¡��D�\'��DWz�ҧ�C�aÆ?!�>\ZNz!#O���Q�N�	@�����>8~]�~m\0��:g�@���\Z����\'N���W����/݇\"06,]�438�\'��L4=�)Kd<�\0\r��B��@������k	�t�^�|�˖-y�/m�h�7���[�ZDS�g�#2C�\Z\Zj�N����A4o����ϟ~�i�ڵkW:t�/��bmHH�֔��D��O�i�g\'M����I;��0~�ؑ#��9rΘqc�~6�y��3���M�0k���S&��0|̸q���?�.=k0褠`�!���ݰA�m_|�Et�=VY��_N�8�qذaG6n�x��/��8�����\"+1Ȼp\r$�K,�%`��%K��9?ԟA�e��ҥ8�2/<xp�!Ȧ��軥e\'N�8e���\r}&��X+��op�t��\0Y���#Gn��̄�e�Ν;[b½ͦ�V\r_��a��c���f��~�Q�J�����EK�8��&:�齮C�7`��k���,�~�+�o�bc��1;�n�+rD|Rr�J�\Z.�֑V�>ArS%��K�,G�$���1�.�#�:j��Mc6��crrB�I�n�1;о}�8�#ҁ2��?�e˖١�C��?P߽`ݼ~�ܹփ\r�g6q��Y�f��U������#G.���٧k׮����̐W!������H�l��R�`�8��c��sU�\n1>���Ok�Ǆ�ԩ�\0+��7n�N�>}<�������G�}�B}B\"Mq��<}�~�~\"��jO�ݡ�j�s@Jd���-���NŊ	 H�_z饳��>��`��O�K�+��݂$�m�-��\\2�~��L�l))X�������l��^�Z�L,��7�KG�t�Y�5҈l���Zx�N�����	\nh\r_�dɒyq��hѢ�.\\�t���n�:T�V_D�4]߾}cG�\Z5=88�Ǚ3g��Y�N���Ȳ*T�B�i-Vb��Ȉ���P��F�����޽{ ƛ��X^&��X+�#�<ߜ�kԨo���d�D����k}�����[㚝 �+��#�\n�Q��\'�xxx�`sHD�DoTH�wd{%�;���F����6�y�	���m��L&S�+W&���[p�v���y\n��|PP�����aX�N��{�6%$$�odR||�/;|��x,�\n��.�mڴ)L��&�Ĥ�� �������-_��	eL�\Z�͎�f6W\0g������w���Ǐ���ZB�z�:�jSv)؝ZR�SO�$\Z�&��f3P`v���xA�5Ƞ�A��k���xz�R(\n&K6y�4���z\Z��8p`��Ç�ONN�	k�xl�_\0���r0\n��hڴi[��\0	�פI�W�^�mʭ�iÆ\rA%J���N�F�r�M�m\r	�h6�wC�EaGA��h�V}�6� @}�\0�`<�����A�݂�\r�fȅ\Z2�.�ԟƤp/1̟?_7u��r��B]�!�D`\'K�t\nMg8�����YE��L��$=�;/!@����ȃ�q20�St���/_~�Q�F�t:],�f�\r\Z4����W��0��%�!�GO���e˖�h\r���4k���s��zA!O��,�oݺE�NE���\'.q�[�/+�� dm�������%=z��<t�Б�G�^s��Y�O�>uǍ�m�z}����a�������T�V�\r&�����ov��u-����Dڊ�� ���f��S���Ag�X��*3�$&Tb�\rP��T�˖-�:iҤ/G���F�\Z�s��-֫W�!_��h�͚؎�eJp\'��z���>�טO�\\�fUE�B6Hv�ƐAC����)�)롖��\"�S�v��}[Ch��e���M�o֋��b�ه��l�5���͛׷m�6\Z�|Ww���q�ĉ�V�^�_QH��j��j4����-@\Z��;v5��V�i���CЦ�Sz�<d�B�����hf�V�F��H63�&��<o{bZ�֭[r�޽��Tn���ƍ�y���}���G6k֬��O�ڵk��,Y��S��?u��qJ���쐷�}��ʶ�]e1\Z7��y\Zu��`�Ʉ�B� �~ST#����f��@���\"}��7�w��5�\0�Ng۷o������*T(�f\"1�}�������k׮=�6m:��CT�G�,cۜ^��.��\0\0\0IDAT�*˲`4\Z��3�B�\'�I*E킽�J���)h\"Ou�O�OOKo������gStt�Xأ�^�j�����۷�}���+V,�	g�\n�%J�����w߾gΞ�j�\Z����~;<%%e݊+.Ϟ=[ʊ:�f9�hz@���(<<��(���bŊ)���Ƅ7*O�<�CBBN�<y�yDD�8�����(T���eʔ��Vt0Y�}�y�0)���n�\"##k|�`װ��	y\"�)T��6�rE��~�t�r5,X0gܸq�`OA��b�C�΁��_�8ˮ]�R�w+�:c-���D!*j�=�)���uо�u���~�X,���^/P�����ͥK��O\r\n�+�P��^>(OP~��\r+h8���/�ϝ;�C�Pë�x%���Oaj���e���O���ܐ�_V��j��y�͗/߇X�\r��<\'=v��뗯��������X�����̙s�֭��4i|�-��pk��,vL4�pΎ�k�s��k�T���6X]�b�[���4�D�C˗/�;w� {.\\�0�dɒ#@�ڪ��WF�\Z�$����>�3��$El1�`]�X�ti!Mp�3����#�V%�|2�̹sKn��Xd��:��޺.8���n��8)!a��h^h��?�{�nc��ͩE��	��B����>���$I��kiG˲P�J��n2�6 G*��X�+W����A�드��q�W*�|���ɗ��d��LIJ�ʚd[c�Y��l���%��z���{�� ݇\Z���V�m��j��4��^{���J���\'�<٭X��}��g~�5��,��R�q��l��l��˔{����^|qE�2�>����k1YB����v`}>�N�E�\'���D���K�0�\0Ol��v�ڗ-[�|�~��s`���-��A�=z�[o�5�aÆ�����o��o�Y�|�������~(�dɒ���}�ŋCX1XK-Z���=K�z��]��*�����y��~>�p�Z!U���B���/&5j�d|�<y$\'&���L��1M�882�4����?�j���ķ�|/��Z6.�̉�F(e1[B��� r�.=�5;/!�V�t�mܸѸk۶�Ϟ�b4vh��{o�mߦc�V�}Ѭy�uO>U�(�!V�Z\\��J6��\r�$�m����C~3�l~]�E����ΝKj�^�K-�7���{mƷnպ�A�+%)�����?ۺiӲ��[O�\n��\n\'������5�\'�t��%�D�8�\0#�0Y���p��ğ~�i\r�����ׯˠA��?��3?K����lց(�HVNX8+7m����;V�ԩS\r�Z�ڵ���Z]�t�աC���۷�ѵk��͚5{m���U\rë �/�L�ܰ*\Z��wh`�_w�٫�kU�uܵc���s�l�6���J�+�&C:��/ʣ/Ib]����RRR�ʛ7�3�\'��75���7;��<���$O���8oּ�X�m�~���80�d4��[l�,)��͖,i5lX�ݺ�_�xI;��hkNIy�n�}|��娹s�N\\��o���V�:NVT��O��J��Mt/�G��sL4�N�D�\0#�d\\����l��%d%,�3 !\nǡ+V�0y��a�\\���߮����7`rہI2f�̙{�����8���͸���_/�ٳ�[�nM�	�9�j6��v��ܡC��?b�EXT�e̉b����9n�9Tȼ# �v�Ѹ�f�͂�UR;�H�\"���������M&s�j�\n�l��οp��ej�˚7�oڦM�fm��U`%9L��љh�}rF �!`GySbbb�a��ުU���b��֭��m��������Ν;��e��֭[����@8�\"-� ��#��A��:\'�=.��~�i�+9̇���F�����.N��`!~J�ם�����y�g�9�+�>R{-G����D3K���F��\\�]f�u�u3#���J�\"�q�B�k8�^����EKp��*���ٺ��y�eY��ȪBq>i\"��&7�4�2�\0#�.��GU��;���P*��.\\8�o߾y=�Azr��	\nEnKJ�qē��x��.+`��e��#�Mnܾ��XF��q��*w�F3,�����v������\'O~\rO��M��C����n����\rx�\Z\0;F�x�3{Ca���J3�\0#�od��tn�K�D�\Z#���P(\Z^�z����L�6��Z�~�f��#���,(-rb��@rєe����ؐ�Ȍ\0#�d�ɴ�N��h�F��f{n޼yC۴iS\rDԣsT�N��ئ��<k�����Й�.�F�x�{CAO�Ċ�W����1�\0#�IhL�#�o�X��8�j�V^�d���S��Τ�4�͞=�0�{�aÆ�^}�՟��|ǁ#�x�G4�d���2�\0#�@��5e\"�7a����W*�ꔔ�Q-[�|מp��z��=���?�پ};}��rY#���\0�t��[�\0#�0Y���I��ƥK�F(P�H��*88�)����F5�n?�����m���͈���\n��\\�ܹ��D�~�<��۰z4W�0��:�2�\0#�ل���͛���\\�r����7��G�=�`0t�U�Ɗ+�<x0�T��w����~�7�|ST�RUAܖ�W��k��+����h4��t��n>I�\0?U�\n�u��%�՜r|a\0F��#~�����N��V�|��K�.=�b��iզM�)�+W�\Z��]��(VX>[W�V�{�Ν��d�E����zj�}~�ر��-�\0�#�\Zo/1�h�F��F�/ K�_*�J�����ۥ�����޽{��ׯ_�O>�d��f��fs5��F�444�1,�5p�g���ۺu��q�2e��۷o��ٳmg��R��\0M_�aoۭ}���#�E�l�z1�L�8�8f̘?�|��Cg͚��������aS�L<}���t6l��ƍ;}��&��Pq�C�F���/T���־PF��c��\"���ѣ��$l��~��G��t�r�C��w�~aL.��\nY��\0�R�\\LF �\"��[�\\pF ��l�A��f:��-F�`F�`��#�#�&�(���)� �B=�\0?�! Y#�x	�A4�E/��0ٌ\0?����3���\n�#������l��bEw�i]:0��^�xGΝ�q|&��\\;�ҍ��B�� ��ȳ��֥��w䲯�qΞA���gpd)�\0#��D�_��B��e<�@�MϪ��F�`r\Z�0�i5���w�h�{\r���\0#�dN�0��W`��UxY8#�0�\0#�09�ԯ�1��h�s|F�`����v�g�2�\0#�!R���D3C�q�lG���l�V ;H=lgG���\'k�0��\0M߭�,-x�McF�`|&�ި���y��,�`F���	Y�� �D�5�V7o��2F�\\R����T`��#�D���\n���,��`u���������BN.{�t�Ա<0M�#�e��;������?X�EU���<9�/��gO��Ϋ�2��*�,�������0����l�p_*.���x�R�D��[��0�\0#�0��������*�E0�E��1�\0#�����E~\rg *�D3k���D��?\'��`�!x�jd+�p�͇B�7����YF�`��pZQ�F4����CK�7F�{�d� ����R�L ��$���$ۈ�78u���`�C�-\"�W\'�����ȴ�90�p�E�U�)9��⺛mDӥ\0F�������9���\0F���V\r�T���j����L4�Éc1�@�d���\n��ɾ�I��[��_��i��J�O\0�1َ\0�l�V�`�L �I��[���# �d��.��\"�i��$�y�H��eaF�`&�~\\������c��#������,2�ť���b���j3�\0#�}x9�}�9��p�K�F`��l�uȥ`�~�$�!�F��KI��\0\0JIDAT�h�e��Ҍ@�\"�/�d/���;��`&��U�\\\ZF�`F�`|&�>S�U��1�\0#�3�G|�޹�|���B?&�Y���y�son��F�\0>��tcGp\r\n9�3����Ͻ�Pe�*�\0#�0�\0#�y���hfBN�9X#�0�\0#�w�L4�R�,�\0#�0��G`!��g`��Y\n#�w�܋̱F�`�F����_��3�I��������d$n�Y�\\(�F���ן�k�D��+(3��exp����p�u>V.����2���Ct�n�C*з��Dӷ�ǻ����]|Y:#����t��[�\0#00����0@�E0�\0#�$ٵ��D3 ��`F�`O�!�61�hz�Y#�0�\0#�0��=0Ѽ�`�G 0K�/f�r��@G��f��0��`�}y(��Z�B0����h�1��\0#�0>�@v=�`�R�@�C��fΫs.1#��>�!#�0�\0̀�F.#�0�\0#�0��@�M�Ö5bF�`F ���C�L4���(�\0#�2>F>B �N��0��@���qD�?h����d\0�����Q��z\rg]��-e�ٟS�#������o٪�=�\n?g���\0������#�m�}��?f@M�V�y����+��x,MU�|�0��@@M�V>V[�Č\0#�8��	�c PD�x���G�%0�\0#�0�B SOPe*Q���D�@ ۈ&��L�V�%�6`��aE����T�J�?�����F4�]�{�y|��\r<>�,�`���\0,|����h�>4j��?�I��p���e���XMF�;���;�zR*����g\0,��d<�d��σ����s��)L4���XmF�`^0LUrA��`�y?\"|�\n\\F�`F �`������F�3;g��r[#��0�\0#�x��(��fN�u,�gv�<#��a�F�`�D���_V+�9��K�d�0�\0#�0��ךc��-��F�`��f�D3��qtF�`F�`�`��N�`��\"��F�ȱ0�̱U�gF�`_D ����M�鋵�:1�\0#�0�\0#���L4���p�\0#��\"������#��ݓ}�hʲ���Q��gF�O$���V��#�6�����DSE�F/��7F�`F��.*�m��^��4�t��`F�p���(����2�{��+F��B��,��bF `���alNC����\"���x^�0�@�#�D3�*�\rcs\Z�q#���l��\n�uYEF��`��_�����f��͙$�l\r�j�B1���0�t*_���I�lk�rͱn�\0#�0�@ #�D3 j��&Q�\\�A�;k;�)?k�<�:!�D3U6�`<�\0��<$�a�@G��f��0�/0�R0�\0#�0~�\0M?�4V�`F�`���=�h���bF�`F�� L43G��}\r_�+և`F �!�D3��x*/����*���0�\0#�q� �,\0��`F�`F \'\"�Dӏk������XuE��f�L\"��6�I��<M?�@�\Z���c�F��a���\n�S\\��;�`F�`F g!�D3g�7��`�_y�%!������H�~#4ۈ&W�c�\Z\'e�D�w��j�b�s���# \n����mDӿ��㸳��B �NU�\\F�W���Wj���nM�D=5K	\\xbܺ�en�;٣��0D�\r�ɓh1��\0#�0��\0�;�\'f|7��i˪<��`F�`�,E��f��͙1��\0o`�W}����\0��d#Y4�3���:~x�YT�W��0Nx�	�cF �Ȣ���O6�,�}�,{�J�]F�`F���h�O]���\0#�0���!��0�\"�;D�w�ӭ(��0�\0#�0���!�;D�w�������E��t��r&��Y��yO��0��M�F�H�\0��R���Y�\07��B���1<��,˼\\�L&��ⳗ�t}�jX1F�`F�E��kD*�D3�S�\\�p�uU}V�`F�x4L4���W$i��A�\0#�0�\0#���fL4}�bX-F�`F�`|���c��5Ț1��^?�/Sp\"F�`�L# �5E1��4�����,ȃ�`�;���|`�B��)*cDӭl9#�0�\0#���3m�c�XgF �`��}�sΌ\0#�<6,�`_F���/���0�\0#�0��#������0�\0#�0Y�\0?���P�����?>�,�`F�8#��S��_1>A4��_�,�`F���x���;:���8�FV�`F��If<b���u��hzb΀`����z �_J�zf=��x}T:���0����c�F��<�<�̌E1�\0#�`��*�W��z1�\0#�0�@`#�D3��K�xg�\0�mF��IpY�#�D�㐲@B�wF���XWF�p!��d|�u�h�z\r�~��\0k� <>�I\Z!S\Z�p���\"�m�8b6#�D3�+��g�ݪR��-�8#�a8�o!�Dӷꃵa�\0[�	��EH�Nӽ�wEe���@N��(���\0C��0C ��}X�:9��n\\\"F G �Ӿ\'�\0\0\0���N�#\0\0\0IDAT\0��fGϣ\0\0\0\0IEND�B`�','2026-02-06 15:56:04');
/*!40000 ALTER TABLE `firmas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `habilidades_clave`
--

DROP TABLE IF EXISTS `habilidades_clave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `habilidades_clave` (
  `id_habilidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_habilidad` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_habilidad`),
  UNIQUE KEY `uk_nombre_habilidad` (`nombre_habilidad`(255))
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habilidades_clave`
--

LOCK TABLES `habilidades_clave` WRITE;
/*!40000 ALTER TABLE `habilidades_clave` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `habilidades_clave` VALUES
(2,'Conocimiento y experiencia trabajando con la normativa técnica local e internacional aplicable a instalaciones eléctricas','','2026-01-08 19:14:49','2026-01-08 19:14:49'),
(3,'Conocimiento medio / alto de Microsoft Office','','2026-01-08 19:14:58','2026-01-08 19:14:58'),
(4,'Comprensión de planificación de proyectos','','2026-01-08 19:15:06','2026-01-08 19:15:06'),
(5,'Habilidad para ejecutar tareas simultaneas','','2026-01-08 19:15:14','2026-01-08 19:15:14'),
(7,'Manejo de AutoCAD','','2026-01-08 19:15:34','2026-01-08 19:15:34'),
(8,'Conocimiento de BIM Management / Revit y BIM360','','2026-01-08 19:15:45','2026-01-08 19:15:45'),
(10,'Conocimiento de estándares internacionales y topologías','','2026-01-08 19:23:20','2026-01-08 19:23:20'),
(17,'Conocimiento avanzado en normas internacionales (Uptime Institute Tier Standars, ANSI/TIA-942, NFPA 75 y 76)','','2026-01-08 19:24:23','2026-01-08 19:24:23'),
(18,'Gestión de proyectos bajo metodologías EPC, incluyendo cronogramas, presupuestos y control de calidad','','2026-01-08 19:24:35','2026-01-08 19:24:35'),
(19,'Software: AutoCAD, Revit, BIM, Navisworks, MS Project','','2026-01-08 19:24:51','2026-01-08 19:24:51'),
(20,'Interacción con proveedores de infraestructura crítica y coordinación multidiscipliniaria','','2026-01-08 19:25:06','2026-01-08 19:25:06'),
(21,'Evaluación de riesgos técnicos y validación de pruebas de commissioning (IST - Integrated Systems Testing)','','2026-01-08 19:25:21','2026-01-08 19:25:21'),
(23,'Diagnóstico y operación de sistema eléctricos de media y baja tensión, UPS, generadores y tableros críticos','','2026-01-08 19:26:08','2026-01-08 19:26:08'),
(24,'Supervisión de sistemas de climatización HVAC, CRAC, CRAH y manejo de fluidos de precisión','','2026-01-08 19:26:18','2026-01-08 19:26:18'),
(25,'Monitoreo BMS (Building Management System) y SCADA','','2026-01-08 19:26:34','2026-01-08 19:26:34'),
(26,'Implementación de rutinas de mantenimiento preventivo y predictivo basadas en normas ASHRAE','','2026-01-08 19:26:45','2026-01-08 19:26:45'),
(27,'Capacidad de respuesta rápida ante eventos de contingencia sin comprometer la disponibilidad','','2026-01-08 19:26:55','2026-01-08 19:26:55'),
(28,'Tendido y certificación de enlaces de cobre (Cat6, Cat6A) y fibra óptica (monomodo) y (multimodo)','','2026-01-08 19:27:19','2026-01-08 19:27:19'),
(29,'Manejo de herramientas de medición como OTDR, certificadoras Fluke y empalmadoras','','2026-01-08 19:27:29','2026-01-08 19:27:29'),
(30,'Aplicación de normas ANSI/TIA-568, ISO/IEC 11801 y BICSI 002 para infraestructura crítica','','2026-01-08 19:27:40','2026-01-08 19:27:40'),
(31,'Planeación de rutas, canalizaciones y organización en racks y patch panels','','2026-01-08 19:27:49','2026-01-08 19:27:49'),
(32,'Capacidad para operar en salas blancas y seguir protocolos ESD (Descarga electroestática)','','2026-01-08 19:28:00','2026-01-08 19:28:00'),
(33,'Diseño y operación de sistemas CCTV con videoanalítica, sensores de movimiento y grabación redundante','','2026-01-08 19:28:14','2026-01-08 19:28:14'),
(34,'Gestión de controles de acceso por biometría, tarjetas RFID y sistemas duales','','2026-01-08 19:28:22','2026-01-08 19:28:22'),
(35,'Implementación de sistemas contra incendio VESDA, NOVEC 1230, FM-200 y detección temprana','','2026-01-08 19:28:33','2026-01-08 19:28:33'),
(36,'Integración de plataformas con BMS, DCIM y protocolos de seguridad física (zonas restringidas, SAS, zonas mantrap)','','2026-01-08 19:28:44','2026-01-08 19:28:44'),
(37,'Gestion de incidencias, simulacros y prottocolos de respuesta a emergencias (ISO 27001, ISO 22301)','','2026-01-08 19:28:52','2026-01-08 19:28:52'),
(38,'Diseño e implementación de implementación de planes de continuidad (BCP) y recuperación ante desastres (DRP)','','2026-01-08 19:29:07','2026-01-08 19:29:07'),
(39,'Monitoreo de indicadores de confiabilidad (MTTR,MTBF), y mejora continua de SLA críticos','','2026-01-08 19:29:15','2026-01-08 19:29:15'),
(40,'Gestión proactiva de alertas mediante plataformas DCIM y analítica predictiva','','2026-01-08 19:29:28','2026-01-08 19:29:28'),
(41,'Análisis de impacto al negocio, definición de RTO y RPO por servicio crítico','','2026-01-08 19:29:37','2026-01-08 19:29:37'),
(42,'Coordinación interdepartamental entre facilities, TI y seguridad','','2026-01-08 19:29:46','2026-01-08 19:29:46'),
(43,'Preparación de estimaciones de costos completas y precisas para proyectos de construcción eléctrica','','2026-01-08 19:30:08','2026-01-08 19:30:08'),
(44,'Revisión e interpretación de planos, especificaciones, técnicas, alcances de trabajo y otros documentos','','2026-01-08 19:30:22','2026-01-08 19:30:22'),
(46,'Cuantificación de materiales y componentes eléctricos necesarios para cada proyecto','','2026-01-08 19:30:34','2026-01-08 19:30:34'),
(47,'Identificación de riesgos y oportunidades que puedan afectar el costo del proyecto y proponer soluciones','','2026-01-08 19:30:43','2026-01-08 19:30:43'),
(48,'Uso de software especializado en estimación de costos para optimizar el proceso','','2026-01-08 19:30:53','2026-01-08 19:30:53'),
(49,'Gestión de proveedores para asegurar la competitividad de las estimaciones','','2026-01-08 19:31:02','2026-01-08 19:31:02'),
(50,'Coordinación con otros equipos para identificar problemas e implementar soluciones','','2026-01-08 19:31:24','2026-01-08 19:31:24'),
(51,'Colaboración con proveedores para realizar tareas relacionadas con sistemas de control','','2026-01-08 19:31:35','2026-01-08 19:31:35'),
(52,'Programación básica de PLC, ejecutar tareas y programación gráfica HMI intermedia','','2026-01-08 19:31:44','2026-01-08 19:31:44'),
(53,'Cumplir con las métricas de desempeño establecidas','','2026-01-08 19:31:51','2026-01-08 19:31:51'),
(54,'Realizar actualizaciones de red (direccionamiento IP, configuración de VLAN, etc)','','2026-01-08 19:32:02','2026-01-08 19:32:02'),
(55,'Integrar protocolos de comunicación como Modbus, BACnet, SNMP, entre otros','','2026-01-08 19:32:10','2026-01-08 19:32:10'),
(56,'Leer esquemas de cableado de controles y realizar actualizaciones de linea roja','','2026-01-08 19:32:20','2026-01-08 19:32:20'),
(57,'Programación PLC a nivel intermedio, preferentemente en plataformas Rockwell, Siemens y/o Schneider','','2026-01-08 19:32:35','2026-01-08 19:32:35'),
(58,'Desarrollo y actualización de interfaces gráficas HMI','','2026-01-08 19:32:42','2026-01-08 19:32:42'),
(59,'Actualización y configuración de red','','2026-01-08 19:32:54','2026-01-08 19:32:54'),
(60,'Integración de sistemas mediante protocolos de comunicación industrial como Modbus, BACnet y SNMP','','2026-01-08 19:33:03','2026-01-08 19:33:03'),
(61,'Lectura e interpretación de esquemas de cableado de controles y realizar actualizaciones de línea roja','','2026-01-08 19:33:13','2026-01-08 19:33:13'),
(62,'Supervisión de la producción y calidad de los elementos de ingeniería de controles en las cuentas asignadas','','2026-01-08 19:33:22','2026-01-08 19:33:22'),
(63,'Investigación y análisis de posibles mejoras en sistemas y procesos para cumplir con estándares','','2026-01-08 19:33:30','2026-01-08 19:33:30'),
(64,'Conocimiento de protocolos de enrutamiento: OSPF, EIGRP, ruteo estático: Redundancia L2/L3: STP/RSTP/MSTP, HSRP/VRRP/GLBP. Protocolos L2: Vlans, SVIs, Port-channels. Data center: Cisco Nexus (9k, 7k, 5k, etc), vPC, fabric-path (deseable). SDN: CIsco SD-WAN, ACI, DNA-Center','','2026-01-08 19:46:51','2026-01-08 19:46:51'),
(65,'Conocimientos en otras marcas: Huawei, Aruba, H3C','','2026-01-08 19:47:01','2026-01-08 19:47:01'),
(66,'Experiencia en soluciones de Wireless','','2026-01-08 19:47:08','2026-01-08 19:47:08'),
(67,'Experiencia en preventa: conocimiento en CCW (cisco commerce workspace)','','2026-01-08 19:47:22','2026-01-08 19:47:22'),
(68,'Elaboración de BOMs','','2026-01-08 19:47:30','2026-01-08 19:47:30'),
(70,'Conocimiento avanzado de BIM Management / Revit y BIM360','','2026-01-08 19:47:53','2026-01-08 19:47:53'),
(71,'Conocimiento y experiencia trabajando con la normativa técnica aplicable a construcción','','2026-01-08 19:48:05','2026-01-08 19:48:05'),
(73,'Comprensión de planificación de proyectos y habilidad para comunicarse y trabajar mano a mano con otros equipos','','2026-01-08 19:48:23','2026-01-08 19:48:23'),
(74,'Habilidad para ejecutar tareas simultáneas y priorizar','','2026-01-08 19:48:31','2026-01-08 19:48:31'),
(75,'Inglés B1 / B2','','2026-01-08 19:48:40','2026-01-08 19:48:40'),
(76,'Manejo experto de AutoCAD','','2026-01-08 19:50:00','2026-01-08 19:50:00'),
(77,'Manejo experto de metodología BIM','','2026-01-08 19:50:08','2026-01-08 19:50:08'),
(78,'Creación y desarrollo de modelos BIM detallados en 3D para proyectos de construcción eléctrica','','2026-01-08 19:50:22','2026-01-08 19:50:22'),
(79,'Colaboración para integrar datos en el modelo BIM','','2026-01-08 19:50:31','2026-01-08 19:50:31'),
(80,'Generación de planos, cortes, elevaciones, detalles y otra documentación técnica a partir del modelo BIM','','2026-01-08 19:50:40','2026-01-08 19:50:40'),
(81,'Extracción de cantidades de obra y métricos precisos desde el modelo BIM','','2026-01-08 19:50:49','2026-01-08 19:50:49'),
(82,'Identificación y resolución de interferencias y conflictos entre las diferentes disciplinas en el modelo BIM','','2026-01-08 19:50:58','2026-01-08 19:50:58'),
(83,'Mantenimiento y actualización de los modelos BIM a lo largo del ciclo de vida del proyecto','','2026-01-08 19:51:06','2026-01-08 19:51:06'),
(84,'Conocimiento avanzado de BIM / Revit y BIM360','','2026-01-08 19:51:19','2026-01-08 19:51:19'),
(86,'Comprensión, análisis y planificación de proyectos, y trabajo en equipo','','2026-01-08 19:52:18','2026-01-08 19:52:18'),
(87,'Conocimiento de procesos constructivos','','2026-01-08 19:52:26','2026-01-08 19:52:26'),
(88,'Habilidad para la ejecución de tareas simultaneas y priorización de las mismas','','2026-01-08 19:52:35','2026-01-08 19:52:35'),
(90,'Formación en otros programas o software (Navisworks, Dynamo, etc.)','','2026-01-08 19:52:54','2026-01-08 19:52:54'),
(91,'Formación en calidad','','2026-01-08 19:53:01','2026-01-08 19:53:01'),
(92,'Conocimiento de normatividad para instalaciones eléctricas, hidrosanitarias, especiales, aire acondicionado y contra incendios','','2026-01-08 19:53:18','2026-01-08 19:53:18'),
(93,'Revisión de generadores y estimaciones de obra','','2026-01-08 19:53:25','2026-01-08 19:53:25'),
(94,'Disponibilidad para rolar turnos','','2026-01-08 19:53:35','2026-01-08 19:53:35'),
(95,'Experiencia en AutoCAD','','2026-01-08 19:53:58','2026-01-08 19:53:58'),
(96,'Trabaja tanto con diseños propios como ajenos, recopila datos y realiza cálculos de diseño','','2026-01-08 19:54:10','2026-01-08 19:54:10'),
(97,'Resuelve problemas de diseño','','2026-01-08 19:54:21','2026-01-08 19:54:21'),
(98,'Puede requerir el uso de inteligencia artificial o tecnología digital similar para su desempeño','','2026-01-08 19:54:31','2026-01-08 19:54:31'),
(99,'Conocimiento práctico de los códigos de la disciplina y estudia cuestiones normativas no rutinarias','','2026-01-08 19:54:46','2026-01-08 19:54:46'),
(100,'Inglés avanzado','','2026-01-08 19:54:54','2026-01-08 19:54:54'),
(101,'Contribuye al diseño de conjuntos TCS/SFN','','2026-01-08 19:55:25','2026-01-08 19:55:25'),
(102,'Desarrolla y mantiene modelos 3D','','2026-01-08 19:55:33','2026-01-08 19:55:33'),
(103,'Preparar y mantener listas de materiales (BOM), diagramas de flujo de proceso (PFD), diagramas de tuberías e instrumentación (P&ID) y documentación','','2026-01-08 19:55:44','2026-01-08 19:55:44'),
(104,'Realizar dimensionamiento y cálculos de sistemas','','2026-01-08 19:55:55','2026-01-08 19:55:55'),
(105,'Construcción de prototipos y pruebas de validación','','2026-01-08 19:56:05','2026-01-08 19:56:05'),
(106,'Aporta información de pedidos personalizados y proyectos ETO a los módulos NPDI para mejora continua','','2026-01-08 19:56:13','2026-01-08 19:56:13'),
(107,'Usa herramientas de diseño/configuración y proporciona comentarios para mejorar los flujos de automatización','','2026-01-08 19:56:23','2026-01-08 19:56:23'),
(108,'Asegurar que los diseños cumplan con las directrices de refrigeración líquida de ASME y ASHRAE','','2026-01-08 19:56:32','2026-01-08 19:56:32'),
(109,'Planificar, coordina y ejecuta proyectos de ingeniería eléctrica para instalaciones y sistemas','','2026-01-08 19:57:47','2026-01-08 19:57:47'),
(110,'Gestiona alcance, cronograma y presupuesto del proyecto','','2026-01-08 19:58:35','2026-01-08 19:58:35'),
(111,'Dominio de AutoCAD y sólidos conocimientos de códigos, normas y buenas prácticas eléctricas','','2026-01-08 19:58:43','2026-01-08 19:58:43'),
(112,'Excelente capacidad de análisis, comunicación y resolución de problemas, con enfoque en la colaboración y los resultados','','2026-01-08 19:58:51','2026-01-08 19:58:51'),
(113,'Interpretación de secuencias de operación, esquemas de planta y arquitectura de sistemas','','2026-01-08 19:59:25','2026-01-08 19:59:25'),
(114,'Experiencia en sistemas y aplicaciones del sector HVAC, y capacidad para diseñar una solución integral','','2026-01-08 19:59:35','2026-01-08 19:59:35'),
(115,'Conocimientos básicos de software para integrar gráficos con aplicaciones','','2026-01-08 19:59:43','2026-01-08 19:59:43'),
(116,'Nivel conversacional de inglés','','2026-01-08 19:59:52','2026-01-08 19:59:52'),
(117,'Capacidad para la resolución de problemas','','2026-01-08 20:00:00','2026-01-08 20:00:00'),
(118,'Trabaja en un equipo de ingeniería multidisciplinario en productos globales, enfocándose en un diseño de alto rendimiento y rentable, y en innovación','','2026-01-08 20:00:24','2026-01-08 20:00:24'),
(119,'Diseña las características eléctricas del producto y es responsable del dimensionamiento de las piezas principales de los ensamblajes','','2026-01-08 20:00:34','2026-01-08 20:00:34'),
(120,'Crea y revisa la documentación del producto (planos, especificaciones, listas de materiales)','','2026-01-08 20:00:46','2026-01-08 20:00:46'),
(121,'Desarrolla soluciones para productos especiales','','2026-01-08 20:00:56','2026-01-08 20:00:56'),
(122,'Colabora en crear guías de conexión de controles','','2026-01-08 20:01:04','2026-01-08 20:01:04'),
(123,'Analiza y resuelve problemas en los productos CWS','','2026-01-08 20:01:15','2026-01-08 20:01:15'),
(125,'Cumple con los objetivos de costo, calidad, medio ambiente y tiempo de ejecución','','2026-01-08 20:01:29','2026-01-08 20:01:29'),
(126,'Conocimiento de normativa técnica aplicable a construcción','','2026-01-08 20:02:59','2026-01-08 20:02:59'),
(127,'Conocimiento general de las diferentes especialidades en las edificaciones','','2026-01-08 20:03:10','2026-01-08 20:03:10'),
(128,'Dominio para la planificación de los recursos en obra, así como el conocimiento de los procesos constructivos para hacer eficientes los recursos materiales, humanos y de tiempo','','2026-01-08 20:03:21','2026-01-08 20:03:21'),
(129,'Conocimiento en administraciones y control de obra','','2026-01-08 20:03:29','2026-01-08 20:03:29'),
(131,'Experiencia en manejo de AutoCAD','','2026-01-08 20:03:45','2026-01-08 20:03:45'),
(132,'Dominio de programa de costos Opus/Neodata','','2026-01-08 20:04:16','2026-01-08 20:04:16'),
(133,'Conocimiento del uso de AutoCAD','','2026-01-08 20:04:24','2026-01-08 20:04:24'),
(134,'Conocimiento y actualización en sistemas constructivos, materiales y herramientas','','2026-01-08 20:04:33','2026-01-08 20:04:33'),
(135,'Claridad en los tiempos de ejecución de actividades y procesos','','2026-01-08 20:04:42','2026-01-08 20:04:42'),
(136,'Manejo de project para coordinación de programas y erogaciones','','2026-01-08 20:05:50','2026-01-08 20:05:50'),
(137,'Experiencia en planeación del desarrollo de Obras','','2026-01-08 20:05:57','2026-01-08 20:05:57'),
(138,'Capacidad de análisis de información, secuencias y procesos constructivos','','2026-01-08 20:06:05','2026-01-08 20:06:05'),
(139,'Gran conocimiento en el sector de construcción en materiales, herramientas y recursos humanos','','2026-01-08 20:06:15','2026-01-08 20:06:15'),
(140,'Dominio de las normas expedidas por la Secretaría del Trabajo y Previsión Social en Mexico aplicables a la obras de construcción','','2026-01-08 20:06:31','2026-01-08 20:06:31'),
(141,'Elaboración de manuales y reglamentos que faciliten el entendimiento de las normas dentro de los procesos constructivos','','2026-01-08 20:06:40','2026-01-08 20:06:40'),
(142,'Instauración de pláticas para fomentar la conciencia en los colaboradores y supervisar que los trabajos se realicen con las indicaciones descritas en las normas','','2026-01-08 20:06:48','2026-01-08 20:06:48'),
(143,'Estudio de riesgos y realización de simulacros','','2026-01-08 20:06:56','2026-01-08 20:06:56'),
(144,'Registrar y apoyar en el caso de desvíos, cambios y redirecciones de los acuerdos','','2026-01-08 20:07:32','2026-01-08 20:07:32'),
(145,'Supervisar los procesos, los tiempos y el desarrollo de cada trabajo','','2026-01-08 20:07:41','2026-01-08 20:07:41'),
(147,'Conocimientos de procesos constructivos, materiales y herramientas','','2026-01-08 20:07:56','2026-01-08 20:07:56'),
(148,'Conocimiento de project','','2026-01-08 20:08:07','2026-01-08 20:08:07'),
(149,'Uso de herramientas para cuantificación de materiales','','2026-01-08 20:08:15','2026-01-08 20:08:15'),
(151,'Experiencia con la normativa técnica aplicable a construcción','','2026-01-08 20:08:42','2026-01-08 20:08:42'),
(152,'Formación técnica en construcción y sus procesos','','2026-01-08 20:08:49','2026-01-08 20:08:49'),
(156,'Formación en sostenibilidad','','2026-01-08 20:09:14','2026-01-08 20:09:14'),
(157,'Formación en soluciones constructivas específicas','','2026-01-08 20:09:23','2026-01-08 20:09:23'),
(160,'Planificación de ventas y operaciones, incluyendo la previsión','','2026-01-08 20:10:03','2026-01-08 20:10:03'),
(161,'Alinear las actividades de la cadena de suministro, incluyendo la planificación, el abastecimiento, la producción y la entrega, con la demanda','','2026-01-08 20:10:13','2026-01-08 20:10:13'),
(162,'Gestionar los problemas de suministro y disponibilidad de materiales','','2026-01-08 20:10:20','2026-01-08 20:10:20'),
(163,'Medir el desempeño operativo y financiero','','2026-01-08 20:10:31','2026-01-08 20:10:31'),
(164,'Identificar y mitigar los riesgos','','2026-01-08 20:10:39','2026-01-08 20:10:39'),
(165,'Uso de sistemas empresariales como ERP y MRP','','2026-01-08 20:10:47','2026-01-08 20:10:47'),
(166,'Operación de sistemas para entornos de gestión de datos y almacenamiento con enfoque en servicios y aplicaciones de Backup & Data Center','','2026-01-08 20:11:42','2026-01-08 20:11:42'),
(167,'Conocimientos básicos en AVAMAR--VEEAM-VERITAS NETBACKUP para entregables y requerimientos','','2026-01-08 20:11:52','2026-01-08 20:11:52'),
(168,'Monitorear el rendimiento de la infraestructura y responder ante incidentes','','2026-01-08 20:12:00','2026-01-08 20:12:00'),
(169,'Análisis y monitoreo realizando la revisión y captura de los comportamientos anormales en la operación, para garantizar el perfecto funcionamiento del DC','','2026-01-08 20:12:10','2026-01-08 20:12:10');
/*!40000 ALTER TABLE `habilidades_clave` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `horarios_clase`
--

DROP TABLE IF EXISTS `horarios_clase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_clase` (
  `id_horario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_curso` int(10) unsigned NOT NULL,
  `tipo_sesion` enum('clase','tutoria') NOT NULL DEFAULT 'clase',
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `modalidad_dia` enum('presencial','virtual') NOT NULL,
  `link_clase` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_horario_curso_idx` (`id_curso`),
  CONSTRAINT `fk_horario_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_clase`
--

LOCK TABLES `horarios_clase` WRITE;
/*!40000 ALTER TABLE `horarios_clase` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `horarios_clase` VALUES
(1,3,'clase','miercoles','13:00:00','14:00:00','presencial',NULL),
(13,6,'clase','lunes','09:00:00','10:00:00','presencial',NULL),
(18,18,'clase','lunes','09:45:00','10:45:00','presencial',NULL),
(19,18,'tutoria','jueves','11:50:00','00:50:00','virtual',NULL);
/*!40000 ALTER TABLE `horarios_clase` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `inscripcion`
--

DROP TABLE IF EXISTS `inscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_inscripcion_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_calificacion_final` CHECK (`calificacion_final` >= 0 and `calificacion_final` <= 10),
  CONSTRAINT `chk_porcentaje_asistencia` CHECK (`porcentaje_asistencia` >= 0 and `porcentaje_asistencia` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripcion`
--

LOCK TABLES `inscripcion` WRITE;
/*!40000 ALTER TABLE `inscripcion` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `inscripcion` VALUES
(8,2,1,NULL,'2025-08-27 17:27:20',NULL,NULL,'solicitada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-08-27 17:27:20'),
(9,2,2,NULL,'2025-08-29 17:48:39',NULL,NULL,'solicitada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-08-29 17:48:39'),
(10,2,4,NULL,'2025-09-01 15:14:03',NULL,NULL,'solicitada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-09-01 15:14:03'),
(11,2,6,NULL,'2025-09-17 15:03:58',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-09-17 16:18:30'),
(12,2,7,NULL,'2025-09-17 15:04:01',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-09-17 16:18:27'),
(13,2,8,NULL,'2025-09-17 15:04:02',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-09-17 16:18:16'),
(14,2,3,NULL,'2025-09-17 16:19:57',NULL,NULL,'rechazada','cupo limitado',NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2026-01-30 15:36:29'),
(15,2,9,NULL,'2025-10-29 18:03:02',NULL,NULL,'rechazada','cupo',NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-10-29 18:05:09'),
(16,2,10,NULL,'2025-11-03 15:06:24',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2025-11-04 17:33:21'),
(17,2,18,NULL,'2026-01-14 16:55:35',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2026-01-14 16:57:55'),
(18,2,19,NULL,'2026-01-21 16:59:18',NULL,NULL,'aprobada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2026-01-21 17:01:58'),
(19,2,17,NULL,'2026-01-30 16:06:27',NULL,NULL,'solicitada',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,'2026-01-30 16:06:27');
/*!40000 ALTER TABLE `inscripcion` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `actualizar_progreso_certificacion` 
AFTER UPDATE ON `inscripcion`
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE id_cert INT UNSIGNED;
    DECLARE cur CURSOR FOR 
        SELECT id_certificacion 
        FROM `requisitos_certificado` 
        WHERE id_curso = NEW.id_curso;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    IF NEW.aprobado_curso = TRUE AND NEW.constancia_emitida = TRUE THEN
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO id_cert;
            IF done THEN 
                LEAVE read_loop; 
            END IF;

            INSERT INTO `certificacion_alumno` (`id_alumno`, `id_certificacion`, `progreso`)
            VALUES (NEW.id_alumno, id_cert, 0.00)
            ON DUPLICATE KEY UPDATE 
                progreso = (
                    SELECT (COUNT(*) / (SELECT COUNT(*) 
                                        FROM `requisitos_certificado` 
                                        WHERE id_certificacion = id_cert)) * 100
                    FROM `inscripcion` i
                    JOIN `requisitos_certificado` cr 
                        ON i.id_curso = cr.id_curso
                    WHERE i.id_alumno = NEW.id_alumno 
                      AND cr.id_certificacion = id_cert 
                      AND i.aprobado_curso = TRUE 
                      AND i.constancia_emitida = TRUE
                ),
                completada = (progreso = 100),
                fecha_completada = IF(progreso = 100, CURRENT_TIMESTAMP, NULL),
                calificacion_promedio = (
                    SELECT AVG(i.calificacion_final)
                    FROM `inscripcion` i
                    JOIN `requisitos_certificado` cr 
                        ON i.id_curso = cr.id_curso
                    WHERE i.id_alumno = NEW.id_alumno 
                      AND cr.id_certificacion = id_cert 
                      AND i.aprobado_curso = TRUE
                );
        END LOOP;
        CLOSE cur;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `auditar_constancia` AFTER UPDATE ON `inscripcion`
FOR EACH ROW
BEGIN
  IF NEW.constancia_emitida = TRUE AND OLD.constancia_emitida = FALSE THEN
    INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `datos_anteriores`, `datos_nuevos`, `id_usuario`, `descripcion`, `fecha_accion`)
    VALUES (
      'inscripcion',
      NEW.id_inscripcion,
      'UPDATE',
      JSON_OBJECT('constancia_emitida', OLD.constancia_emitida, 'fecha_constancia', OLD.fecha_constancia),
      JSON_OBJECT('constancia_emitida', NEW.constancia_emitida, 'fecha_constancia', NEW.fecha_constancia),
      NEW.aprobado_por,
      'Emisión de constancia para curso',
      CURRENT_TIMESTAMP
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `maestro`
--

DROP TABLE IF EXISTS `maestro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maestro`
--

LOCK TABLES `maestro` WRITE;
/*!40000 ALTER TABLE `maestro` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `maestro` VALUES
(5,51,14,34,1,'Juan Manuel Hernandez','maestro_1752676672170@temp.com','Software','licenciatura','2025-07-16','2025-07-16 17:23:52','2025-08-14 17:24:33'),
(13,59,14,34,7,'prueba maestro','pruebaMaestro@gmail.com','Inteligencia artificial','maestria','2025-07-16','2025-07-16 17:54:27','2025-08-15 16:26:25'),
(14,61,14,34,8,'Prueba 2','prueba2@uaq.edu.mx','Inteligencia artificial','maestria','2025-08-14','2025-08-14 17:15:47','2025-08-15 16:26:38'),
(15,62,15,35,6,'Axel David Arevalo','axel@upsrj.edu.mx','Bases de Datos','licenciatura','2025-08-15','2025-08-15 17:39:54','2025-08-15 17:39:54'),
(16,63,16,36,9,'Oscar Alexandro Morales Galvan','OscarMaestro@itq.edu.mx','Data Center','licenciatura','2025-08-21','2025-08-21 16:48:12','2026-01-16 20:13:29'),
(17,77,15,35,6,'Miguel Angell Paz','miguel@upsrj.com','Inteligencia artificial','doctorado','2026-01-28','2026-01-28 19:27:03','2026-01-28 19:27:03');
/*!40000 ALTER TABLE `maestro` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `material_curso`
--

DROP TABLE IF EXISTS `material_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=258 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_curso`
--

LOCK TABLES `material_curso` WRITE;
/*!40000 ALTER TABLE `material_curso` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `material_curso` VALUES
(64,8,'Actividad3.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/planeacion/cursounknown_1758817330053_271402977_Actividad3.pdf','pdf','planeacion',0,NULL,321320,'prueba',NULL,NULL,1,'2025-09-25 16:22:10',4),
(65,8,'Actividad6.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/material_descarga/curso8_1758817346506_998517466_Actividad6.pdf','pdf','material_descarga',0,NULL,183599,NULL,NULL,NULL,1,'2025-09-25 16:22:26',4),
(66,8,'Google',NULL,'enlace','material_descarga',1,'https://www.google.com/',NULL,NULL,NULL,NULL,1,'2025-09-25 16:22:48',4),
(67,8,'Analisar Datos - Enlace de apoyo',NULL,'enlace','actividad',1,'https://scholar.google.com/',NULL,'Enlace de apoyo para la actividad: Analisar Datos',NULL,NULL,1,'2025-09-25 16:23:08',4),
(68,8,'Act_POO_003.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/actividad/cursounknown_1758817388636_516860872_Act_POO_003.pdf','pdf','actividad',0,NULL,483389,'Archivo de apoyo para la actividad: Analisar Datos',NULL,NULL,1,'2025-09-25 16:23:08',4),
(69,7,'PLANEACION CURSO GestiÃ³n del Curso.pdf','/home/axel/Documentos/aprendiendoReact/backend/uploads/material/planeacion/cursounknown_1761709768537_968466916_PLANEACION_CURSO_Gesti__n_del_Curso.pdf','pdf','planeacion',0,NULL,83609,NULL,NULL,NULL,1,'2025-10-29 03:49:28',4),
(177,17,'Aho, Alfred; Ullman, Jeffrey. (1998) Foundations of Computer Science. W. H. Freeman.',NULL,'texto','planeacion',0,NULL,NULL,'Aho, Alfred; Ullman, Jeffrey. (1998) Foundations of Computer Science. W. H. Freeman.',NULL,NULL,1,'2025-12-17 16:57:05',4),
(242,18,'Referencia Bibliográfica',NULL,'texto','planeacion',0,NULL,NULL,'EMC Education Services. (2016). Information Storage and Management (2da. Ed.). Wiley.',NULL,NULL,1,'2026-01-21 17:26:56',4),
(243,18,'Referencia Bibliográfica',NULL,'texto','planeacion',0,NULL,NULL,'Preston, W. Curtis. (2019). Backup & Recovery. O\'Reilly.',NULL,NULL,1,'2026-01-21 17:26:56',4),
(244,18,'Enlace Web',NULL,'enlace','actividad',1,'https://www.vmware.com/',NULL,'',NULL,NULL,1,'2026-01-13 19:28:41',4),
(245,18,'AE041 Matematicas Discretas.pdf','uploads/material/planeacion/1768332616632-AE041_Matematicas_Discretas.pdf','pdf','actividad',0,NULL,186821,'AE041 Matematicas Discretas.pdf',NULL,NULL,1,'2026-01-13 19:30:16',4),
(246,18,'Material',NULL,'pdf','actividad',0,NULL,NULL,'Vacca, John R. (2020). Cloud Computing Security. CRC Press.',NULL,NULL,1,'2026-01-13 20:20:21',4),
(247,18,'Material',NULL,'pdf','actividad',0,NULL,NULL,'Schulz, Greg. (2018). Software-Defined Data Infrastructure Essentials. CRC Press.',NULL,NULL,1,'2026-01-13 20:20:21',4),
(248,18,'Referencia Bibliográfica',NULL,'texto','actividad',0,NULL,NULL,'Vacca, John R. (2020). Cloud Computing Security. CRC Press.',NULL,NULL,1,'2026-01-13 20:46:48',4),
(249,18,'Referencia Bibliográfica',NULL,'texto','actividad',0,NULL,NULL,'Schulz, Greg. (2018). Software-Defined Data Infrastructure Essentials. CRC Press.',NULL,NULL,1,'2026-01-13 20:46:48',4),
(251,18,'WebMultipagos.pdf','uploads/material/planeacion/1768338973356-WebMultipagos.pdf','pdf','planeacion',0,NULL,249600,'WebMultipagos.pdf',NULL,NULL,1,'2026-01-21 17:26:56',4),
(252,18,'Enlace Web',NULL,'enlace','planeacion',1,'https://scholar.google.com/',NULL,'Enlace Web',NULL,NULL,1,'2026-01-21 17:26:56',4),
(253,18,'Pruebas Extra','uploads/material/material_descarga/curso18_1768401615612_361541740_PROCESO_PARA_LA_NUBE_(1).pdf','pdf','material_descarga',0,NULL,970029,'El alumno puede poner en practica sus conocimientos acerca del curso',NULL,NULL,1,'2026-01-14 14:40:15',4),
(254,18,'Herramienta 1',NULL,'enlace','material_descarga',1,'https://www.deepl.com/en/translator',0,'Posible herramienta util para el alumno',NULL,NULL,1,'2026-01-14 14:40:15',4),
(255,19,'Enlace Web',NULL,'enlace','actividad',1,'https://kubernetes.io/es/',NULL,'',NULL,NULL,1,'2026-01-21 16:58:55',4),
(256,19,'Enlace Web',NULL,'enlace','actividad',1,'https://kubernetes.io/es/docs/home/',NULL,'',NULL,NULL,1,'2026-01-21 16:58:55',4),
(257,19,'Referencia Bibliográfica',NULL,'texto','planeacion',0,NULL,NULL,'Tanenbaum, Andrew S. (2017). Distributed Systems (3ra. Ed.). Pearson.',NULL,NULL,1,'2026-01-23 18:44:58',4);
/*!40000 ALTER TABLE `material_curso` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `requisitos_certificado`
--

DROP TABLE IF EXISTS `requisitos_certificado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requisitos_certificado`
--

LOCK TABLES `requisitos_certificado` WRITE;
/*!40000 ALTER TABLE `requisitos_certificado` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `requisitos_certificado` VALUES
(13,1,2,1),
(14,1,4,1),
(24,3,6,1),
(25,3,7,1),
(26,3,8,1),
(29,6,18,1),
(30,6,19,1);
/*!40000 ALTER TABLE `requisitos_certificado` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `sesiones_usuario`
--

DROP TABLE IF EXISTS `sesiones_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=909 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_usuario`
--

LOCK TABLES `sesiones_usuario` WRITE;
/*!40000 ALTER TABLE `sesiones_usuario` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `sesiones_usuario` VALUES
(1,1,'2025-06-25 15:32:12',NULL,NULL,'activa'),
(2,1,'2025-06-25 15:37:11',NULL,NULL,'activa'),
(3,2,'2025-06-25 15:38:02',NULL,NULL,'activa'),
(4,3,'2025-06-25 15:38:19',NULL,NULL,'activa'),
(5,4,'2025-06-25 15:38:38',NULL,NULL,'activa'),
(6,1,'2025-06-25 15:47:43',NULL,NULL,'activa'),
(7,1,'2025-06-25 15:53:14',NULL,NULL,'activa'),
(8,2,'2025-06-25 15:53:32',NULL,NULL,'activa'),
(9,3,'2025-06-25 15:53:55',NULL,NULL,'activa'),
(10,4,'2025-06-25 15:54:22',NULL,NULL,'activa'),
(11,4,'2025-06-25 15:54:48',NULL,NULL,'activa'),
(12,4,'2025-06-25 16:31:14',NULL,NULL,'activa'),
(13,3,'2025-06-25 16:48:15',NULL,NULL,'activa'),
(14,1,'2025-06-26 14:48:21',NULL,NULL,'activa'),
(32,4,'2025-07-03 15:47:05',NULL,NULL,'activa'),
(33,3,'2025-07-03 15:47:38',NULL,NULL,'activa'),
(34,2,'2025-07-03 15:47:54',NULL,NULL,'activa'),
(38,2,'2025-07-04 15:41:49',NULL,NULL,'activa'),
(39,3,'2025-07-04 15:42:16',NULL,NULL,'activa'),
(40,3,'2025-07-04 15:42:33',NULL,NULL,'activa'),
(41,3,'2025-07-04 15:42:44',NULL,NULL,'activa'),
(45,2,'2025-07-04 17:46:53',NULL,NULL,'activa'),
(46,2,'2025-07-04 17:47:31',NULL,NULL,'activa'),
(48,4,'2025-07-07 16:06:28',NULL,NULL,'activa'),
(49,4,'2025-07-07 16:12:27',NULL,NULL,'activa'),
(51,2,'2025-07-09 16:22:27',NULL,NULL,'activa'),
(52,4,'2025-07-09 16:23:06',NULL,NULL,'activa'),
(53,4,'2025-07-10 16:05:30',NULL,NULL,'activa'),
(55,4,'2025-07-10 16:19:27',NULL,NULL,'activa'),
(56,4,'2025-07-10 16:56:28',NULL,NULL,'activa'),
(58,4,'2025-07-11 15:55:28',NULL,NULL,'activa'),
(60,4,'2025-07-11 16:15:22',NULL,NULL,'activa'),
(61,4,'2025-07-11 16:16:07',NULL,NULL,'activa'),
(62,4,'2025-07-14 16:38:45',NULL,NULL,'activa'),
(63,4,'2025-07-14 17:24:40',NULL,NULL,'activa'),
(64,4,'2025-07-14 17:26:02',NULL,NULL,'activa'),
(65,4,'2025-07-15 14:48:13',NULL,NULL,'activa'),
(66,2,'2025-08-04 15:14:57',NULL,NULL,'activa'),
(67,4,'2025-08-05 00:51:52',NULL,NULL,'activa'),
(69,4,'2025-08-07 14:19:06',NULL,NULL,'activa'),
(70,4,'2025-08-07 15:42:05',NULL,NULL,'activa'),
(71,4,'2025-08-08 14:09:12',NULL,NULL,'activa'),
(72,4,'2025-08-08 14:37:15',NULL,NULL,'activa'),
(73,4,'2025-08-08 14:44:01',NULL,NULL,'activa'),
(74,4,'2025-08-08 15:04:46',NULL,NULL,'activa'),
(75,4,'2025-08-08 16:54:19',NULL,NULL,'activa'),
(76,4,'2025-08-08 17:13:04',NULL,NULL,'activa'),
(77,4,'2025-08-11 14:47:58',NULL,NULL,'activa'),
(78,4,'2025-08-11 16:26:31',NULL,NULL,'activa'),
(79,4,'2025-08-11 16:57:18',NULL,NULL,'activa'),
(80,4,'2025-08-11 17:08:40',NULL,NULL,'activa'),
(81,4,'2025-08-12 14:08:22',NULL,NULL,'activa'),
(82,4,'2025-08-12 15:23:31',NULL,NULL,'activa'),
(83,4,'2025-08-12 16:42:26',NULL,NULL,'activa'),
(84,4,'2025-08-12 17:47:47',NULL,NULL,'activa'),
(85,4,'2025-08-12 21:10:06',NULL,NULL,'activa'),
(86,4,'2025-08-13 14:39:09',NULL,NULL,'activa'),
(87,4,'2025-08-13 16:16:29',NULL,NULL,'activa'),
(88,4,'2025-08-13 16:43:33',NULL,NULL,'activa'),
(89,4,'2025-08-13 17:02:04',NULL,NULL,'activa'),
(90,4,'2025-08-13 17:06:48',NULL,NULL,'activa'),
(91,4,'2025-08-13 17:21:37',NULL,NULL,'activa'),
(92,4,'2025-08-13 17:32:32',NULL,NULL,'activa'),
(93,4,'2025-08-13 17:32:35',NULL,NULL,'activa'),
(94,4,'2025-08-14 14:39:27',NULL,NULL,'activa'),
(95,4,'2025-08-14 14:41:32',NULL,NULL,'activa'),
(96,4,'2025-08-14 14:47:35',NULL,NULL,'activa'),
(97,4,'2025-08-14 15:01:36',NULL,NULL,'activa'),
(98,4,'2025-08-14 15:45:53',NULL,NULL,'activa'),
(99,4,'2025-08-14 16:30:40',NULL,NULL,'activa'),
(100,4,'2025-08-14 17:24:24',NULL,NULL,'activa'),
(101,4,'2025-08-15 14:31:12',NULL,NULL,'activa'),
(102,4,'2025-08-15 15:39:00',NULL,NULL,'activa'),
(103,4,'2025-08-15 16:10:52',NULL,NULL,'activa'),
(104,4,'2025-08-15 16:42:32',NULL,NULL,'activa'),
(105,4,'2025-08-18 14:49:04',NULL,NULL,'activa'),
(106,4,'2025-08-18 15:09:16',NULL,NULL,'activa'),
(107,4,'2025-08-18 15:18:54',NULL,NULL,'activa'),
(108,4,'2025-08-18 16:06:32',NULL,NULL,'activa'),
(109,4,'2025-08-18 16:16:09',NULL,NULL,'activa'),
(110,3,'2025-08-18 16:17:11',NULL,NULL,'activa'),
(111,4,'2025-08-18 16:22:41',NULL,NULL,'activa'),
(112,4,'2025-08-18 16:36:09',NULL,NULL,'activa'),
(113,4,'2025-08-18 16:40:02',NULL,NULL,'activa'),
(114,3,'2025-08-18 16:40:17',NULL,NULL,'activa'),
(115,4,'2025-08-18 16:40:50',NULL,NULL,'activa'),
(116,4,'2025-08-18 17:07:41',NULL,NULL,'activa'),
(117,4,'2025-08-18 17:36:01',NULL,NULL,'activa'),
(118,4,'2025-08-19 15:01:33',NULL,NULL,'activa'),
(119,4,'2025-08-19 15:36:10',NULL,NULL,'activa'),
(120,4,'2025-08-19 15:57:12',NULL,NULL,'activa'),
(121,4,'2025-08-20 03:56:04',NULL,NULL,'activa'),
(122,4,'2025-08-20 15:01:48',NULL,NULL,'activa'),
(123,4,'2025-08-20 15:23:28',NULL,NULL,'activa'),
(125,4,'2025-08-20 16:04:22',NULL,NULL,'activa'),
(127,4,'2025-08-20 16:44:42',NULL,NULL,'activa'),
(130,4,'2025-08-20 17:18:19',NULL,NULL,'activa'),
(132,4,'2025-08-21 15:07:20',NULL,NULL,'activa'),
(134,4,'2025-08-21 15:26:51',NULL,NULL,'activa'),
(136,4,'2025-08-21 16:35:24',NULL,NULL,'activa'),
(137,4,'2025-08-21 16:41:21',NULL,NULL,'activa'),
(140,4,'2025-08-21 17:34:43',NULL,NULL,'activa'),
(150,4,'2025-08-26 17:10:03',NULL,NULL,'activa'),
(151,4,'2025-08-26 17:11:31',NULL,NULL,'activa'),
(153,4,'2025-08-26 17:24:26',NULL,NULL,'activa'),
(156,73,'2025-08-27 16:15:15',NULL,NULL,'activa'),
(157,73,'2025-08-27 16:15:28',NULL,NULL,'activa'),
(158,73,'2025-08-27 16:23:56',NULL,NULL,'activa'),
(159,73,'2025-08-27 16:29:02',NULL,NULL,'activa'),
(160,73,'2025-08-27 16:29:27',NULL,NULL,'activa'),
(161,73,'2025-08-27 16:35:43',NULL,NULL,'activa'),
(162,4,'2025-08-27 17:34:47',NULL,NULL,'activa'),
(163,73,'2025-08-27 17:36:21',NULL,NULL,'activa'),
(164,73,'2025-08-28 14:26:06',NULL,NULL,'activa'),
(165,4,'2025-08-28 14:26:55',NULL,NULL,'activa'),
(166,4,'2025-08-28 15:13:27',NULL,NULL,'activa'),
(167,4,'2025-08-28 15:45:47',NULL,NULL,'activa'),
(168,4,'2025-08-28 16:01:04',NULL,NULL,'activa'),
(169,4,'2025-08-28 16:36:17',NULL,NULL,'activa'),
(170,4,'2025-08-29 15:31:45',NULL,NULL,'activa'),
(171,4,'2025-08-29 16:37:28',NULL,NULL,'activa'),
(172,4,'2025-08-29 17:32:34',NULL,NULL,'activa'),
(173,73,'2025-08-29 17:46:52',NULL,NULL,'activa'),
(174,4,'2025-08-29 17:49:01',NULL,NULL,'activa'),
(175,73,'2025-08-29 18:13:54',NULL,NULL,'activa'),
(176,4,'2025-09-01 14:37:21',NULL,NULL,'activa'),
(177,73,'2025-09-01 14:44:09',NULL,NULL,'activa'),
(178,4,'2025-09-01 15:59:03',NULL,NULL,'activa'),
(179,73,'2025-09-01 16:17:15',NULL,NULL,'activa'),
(180,4,'2025-09-01 16:28:57',NULL,NULL,'activa'),
(181,73,'2025-09-01 16:38:33',NULL,NULL,'activa'),
(182,4,'2025-09-02 14:48:17',NULL,NULL,'activa'),
(183,4,'2025-09-02 16:14:41',NULL,NULL,'activa'),
(184,4,'2025-09-02 17:15:13',NULL,NULL,'activa'),
(185,73,'2025-09-02 17:15:56',NULL,NULL,'activa'),
(186,73,'2025-09-02 17:18:42',NULL,NULL,'activa'),
(187,73,'2025-09-02 17:23:08',NULL,NULL,'activa'),
(188,73,'2025-09-02 17:27:01',NULL,NULL,'activa'),
(189,73,'2025-09-02 17:34:40',NULL,NULL,'activa'),
(190,73,'2025-09-02 17:56:25',NULL,NULL,'activa'),
(191,4,'2025-09-03 14:53:02',NULL,NULL,'activa'),
(192,4,'2025-09-03 15:08:48',NULL,NULL,'activa'),
(193,73,'2025-09-03 15:11:49',NULL,NULL,'activa'),
(194,4,'2025-09-03 15:40:19',NULL,NULL,'activa'),
(195,4,'2025-09-03 16:05:08',NULL,NULL,'activa'),
(196,4,'2025-09-03 17:56:01',NULL,NULL,'activa'),
(197,4,'2025-09-04 14:43:31',NULL,NULL,'activa'),
(198,4,'2025-09-04 15:44:56',NULL,NULL,'activa'),
(199,4,'2025-09-04 15:44:59',NULL,NULL,'activa'),
(200,4,'2025-09-04 15:48:52',NULL,NULL,'activa'),
(201,4,'2025-09-04 16:57:24',NULL,NULL,'activa'),
(202,4,'2025-09-04 17:15:32',NULL,NULL,'activa'),
(203,4,'2025-09-04 17:25:50',NULL,NULL,'activa'),
(204,4,'2025-09-04 17:27:03',NULL,NULL,'activa'),
(205,4,'2025-09-04 17:29:00',NULL,NULL,'activa'),
(206,4,'2025-09-04 17:31:23',NULL,NULL,'activa'),
(207,4,'2025-09-04 17:50:41',NULL,NULL,'activa'),
(208,4,'2025-09-05 02:52:35',NULL,NULL,'activa'),
(209,4,'2025-09-05 03:15:02',NULL,NULL,'activa'),
(210,4,'2025-09-05 03:44:06',NULL,NULL,'activa'),
(211,4,'2025-09-05 04:15:31',NULL,NULL,'activa'),
(212,4,'2025-09-05 04:15:33',NULL,NULL,'activa'),
(213,4,'2025-09-05 14:00:31',NULL,NULL,'activa'),
(214,4,'2025-09-05 14:17:14',NULL,NULL,'activa'),
(215,4,'2025-09-05 16:34:37',NULL,NULL,'activa'),
(216,4,'2025-09-08 14:56:20',NULL,NULL,'activa'),
(217,4,'2025-09-08 17:05:59',NULL,NULL,'activa'),
(218,4,'2025-09-08 18:03:22',NULL,NULL,'activa'),
(219,4,'2025-09-09 14:30:25',NULL,NULL,'activa'),
(220,4,'2025-09-09 14:43:42',NULL,NULL,'activa'),
(221,4,'2025-09-09 15:45:34',NULL,NULL,'activa'),
(222,4,'2025-09-09 15:47:34',NULL,NULL,'activa'),
(223,4,'2025-09-09 16:04:20',NULL,NULL,'activa'),
(224,4,'2025-09-09 17:15:57',NULL,NULL,'activa'),
(225,4,'2025-09-09 17:39:40',NULL,NULL,'activa'),
(226,4,'2025-09-10 16:03:58',NULL,NULL,'activa'),
(227,4,'2025-09-10 16:18:49',NULL,NULL,'activa'),
(228,4,'2025-09-10 16:52:39',NULL,NULL,'activa'),
(229,4,'2025-09-10 16:52:42',NULL,NULL,'activa'),
(230,4,'2025-09-10 23:19:11',NULL,NULL,'activa'),
(231,4,'2025-09-10 23:38:33',NULL,NULL,'activa'),
(232,4,'2025-09-11 15:23:38',NULL,NULL,'activa'),
(233,73,'2025-09-11 15:31:44',NULL,NULL,'activa'),
(234,73,'2025-09-11 16:38:59',NULL,NULL,'activa'),
(235,73,'2025-09-11 16:50:01',NULL,NULL,'activa'),
(236,73,'2025-09-11 16:59:10',NULL,NULL,'activa'),
(237,4,'2025-09-11 17:08:40',NULL,NULL,'activa'),
(238,73,'2025-09-11 17:12:13',NULL,NULL,'activa'),
(239,4,'2025-09-11 17:15:47',NULL,NULL,'activa'),
(240,4,'2025-09-12 15:15:23',NULL,NULL,'activa'),
(241,73,'2025-09-12 15:36:53',NULL,NULL,'activa'),
(242,73,'2025-09-12 15:48:09',NULL,NULL,'activa'),
(243,4,'2025-09-12 15:49:05',NULL,NULL,'activa'),
(244,73,'2025-09-12 15:57:46',NULL,NULL,'activa'),
(245,73,'2025-09-12 16:03:22',NULL,NULL,'activa'),
(246,73,'2025-09-12 16:05:39',NULL,NULL,'activa'),
(247,4,'2025-09-12 16:11:35',NULL,NULL,'activa'),
(248,73,'2025-09-12 16:13:43',NULL,NULL,'activa'),
(249,4,'2025-09-12 16:14:02',NULL,NULL,'activa'),
(250,4,'2025-09-12 16:16:58',NULL,NULL,'activa'),
(251,4,'2025-09-12 16:30:07',NULL,NULL,'activa'),
(252,73,'2025-09-12 16:34:02',NULL,NULL,'activa'),
(253,4,'2025-09-12 16:34:26',NULL,NULL,'activa'),
(254,73,'2025-09-12 16:47:03',NULL,NULL,'activa'),
(255,4,'2025-09-12 16:48:06',NULL,NULL,'activa'),
(256,73,'2025-09-12 17:02:21',NULL,NULL,'activa'),
(257,4,'2025-09-12 17:03:31',NULL,NULL,'activa'),
(258,73,'2025-09-12 17:37:48',NULL,NULL,'activa'),
(259,4,'2025-09-12 17:39:58',NULL,NULL,'activa'),
(260,73,'2025-09-12 17:40:28',NULL,NULL,'activa'),
(261,73,'2025-09-17 14:32:43',NULL,NULL,'activa'),
(262,4,'2025-09-17 14:48:09',NULL,NULL,'activa'),
(263,73,'2025-09-17 15:03:49',NULL,NULL,'activa'),
(264,4,'2025-09-17 15:09:17',NULL,NULL,'activa'),
(265,73,'2025-09-17 15:17:08',NULL,NULL,'activa'),
(266,4,'2025-09-17 15:26:35',NULL,NULL,'activa'),
(267,73,'2025-09-17 15:28:36',NULL,NULL,'activa'),
(268,4,'2025-09-17 15:36:41',NULL,NULL,'activa'),
(269,73,'2025-09-17 15:38:03',NULL,NULL,'activa'),
(270,4,'2025-09-17 15:41:59',NULL,NULL,'activa'),
(271,73,'2025-09-17 16:19:52',NULL,NULL,'activa'),
(272,4,'2025-09-17 16:20:31',NULL,NULL,'activa'),
(273,73,'2025-09-17 16:21:10',NULL,NULL,'activa'),
(274,73,'2025-09-17 17:30:18',NULL,NULL,'activa'),
(275,4,'2025-09-18 14:38:25',NULL,NULL,'activa'),
(276,73,'2025-09-18 15:04:34',NULL,NULL,'activa'),
(277,4,'2025-09-18 15:49:12',NULL,NULL,'activa'),
(278,4,'2025-09-18 17:17:05',NULL,NULL,'activa'),
(279,4,'2025-09-18 17:40:34',NULL,NULL,'activa'),
(280,4,'2025-09-19 15:08:09',NULL,NULL,'activa'),
(281,73,'2025-09-19 16:02:58',NULL,NULL,'activa'),
(282,73,'2025-09-19 16:29:21',NULL,NULL,'activa'),
(283,73,'2025-09-22 15:37:58',NULL,NULL,'activa'),
(284,4,'2025-09-22 15:42:57',NULL,NULL,'activa'),
(285,73,'2025-09-22 15:47:04',NULL,NULL,'activa'),
(286,4,'2025-09-22 15:53:07',NULL,NULL,'activa'),
(287,73,'2025-09-22 16:30:47',NULL,NULL,'activa'),
(288,4,'2025-09-22 17:08:28',NULL,NULL,'activa'),
(289,4,'2025-09-23 15:17:48',NULL,NULL,'activa'),
(290,73,'2025-09-23 16:03:26',NULL,NULL,'activa'),
(291,4,'2025-09-23 16:04:07',NULL,NULL,'activa'),
(292,4,'2025-09-23 17:16:25',NULL,NULL,'activa'),
(293,73,'2025-09-23 17:38:12',NULL,NULL,'activa'),
(294,4,'2025-09-23 17:39:22',NULL,NULL,'activa'),
(295,4,'2025-09-23 23:04:04',NULL,NULL,'activa'),
(296,4,'2025-09-23 23:09:27',NULL,NULL,'activa'),
(297,4,'2025-09-24 14:24:09',NULL,NULL,'activa'),
(298,4,'2025-09-24 15:26:17',NULL,NULL,'activa'),
(299,4,'2025-09-24 15:42:02',NULL,NULL,'activa'),
(300,73,'2025-09-24 15:44:50',NULL,NULL,'activa'),
(301,4,'2025-09-24 15:46:05',NULL,NULL,'activa'),
(302,4,'2025-09-24 16:58:39',NULL,NULL,'activa'),
(303,73,'2025-09-24 17:02:46',NULL,NULL,'activa'),
(304,4,'2025-09-24 17:03:15',NULL,NULL,'activa'),
(305,4,'2025-09-25 14:36:18',NULL,NULL,'activa'),
(306,4,'2025-09-25 14:50:13',NULL,NULL,'activa'),
(307,73,'2025-09-25 15:50:53',NULL,NULL,'activa'),
(308,4,'2025-09-25 15:51:59',NULL,NULL,'activa'),
(309,73,'2025-09-25 16:25:40',NULL,NULL,'activa'),
(310,4,'2025-09-25 17:07:40',NULL,NULL,'activa'),
(311,73,'2025-09-25 17:22:46',NULL,NULL,'activa'),
(312,4,'2025-09-25 17:52:16',NULL,NULL,'activa'),
(313,73,'2025-09-25 17:53:42',NULL,NULL,'activa'),
(314,4,'2025-09-25 17:59:11',NULL,NULL,'activa'),
(315,73,'2025-09-25 18:07:31',NULL,NULL,'activa'),
(316,73,'2025-09-26 15:04:36',NULL,NULL,'activa'),
(317,4,'2025-09-29 15:12:28',NULL,NULL,'activa'),
(318,4,'2025-09-29 16:30:08',NULL,NULL,'activa'),
(319,4,'2025-09-29 17:37:39',NULL,NULL,'activa'),
(320,4,'2025-09-29 17:41:40',NULL,NULL,'activa'),
(321,4,'2025-09-30 15:09:32',NULL,NULL,'activa'),
(322,4,'2025-09-30 15:23:40',NULL,NULL,'activa'),
(323,73,'2025-09-30 15:32:22',NULL,NULL,'activa'),
(324,4,'2025-09-30 15:34:31',NULL,NULL,'activa'),
(325,73,'2025-09-30 15:45:26',NULL,NULL,'activa'),
(326,73,'2025-09-30 16:05:14',NULL,NULL,'activa'),
(327,73,'2025-09-30 16:20:40',NULL,NULL,'activa'),
(328,4,'2025-09-30 16:32:01',NULL,NULL,'activa'),
(329,73,'2025-09-30 16:52:14',NULL,NULL,'activa'),
(330,4,'2025-09-30 16:52:57',NULL,NULL,'activa'),
(331,4,'2025-10-01 16:50:58',NULL,NULL,'activa'),
(332,4,'2025-10-01 17:53:55',NULL,NULL,'activa'),
(333,4,'2025-10-02 14:41:29',NULL,NULL,'activa'),
(334,4,'2025-10-02 14:57:25',NULL,NULL,'activa'),
(335,4,'2025-10-02 15:58:38',NULL,NULL,'activa'),
(336,73,'2025-10-02 16:07:55',NULL,NULL,'activa'),
(337,4,'2025-10-02 16:09:53',NULL,NULL,'activa'),
(338,73,'2025-10-02 16:14:12',NULL,NULL,'activa'),
(339,4,'2025-10-02 16:25:18',NULL,NULL,'activa'),
(340,73,'2025-10-03 14:36:51',NULL,NULL,'activa'),
(341,73,'2025-10-03 14:37:06',NULL,NULL,'activa'),
(342,73,'2025-10-03 14:37:58',NULL,NULL,'activa'),
(343,73,'2025-10-03 14:44:01',NULL,NULL,'activa'),
(344,73,'2025-10-06 14:44:14',NULL,NULL,'activa'),
(345,4,'2025-10-06 14:49:37',NULL,NULL,'activa'),
(346,4,'2025-10-06 16:59:02',NULL,NULL,'activa'),
(347,4,'2025-10-06 16:59:15',NULL,NULL,'activa'),
(348,4,'2025-10-06 17:11:51',NULL,NULL,'activa'),
(349,73,'2025-10-06 17:12:00',NULL,NULL,'activa'),
(350,73,'2025-10-06 17:15:38',NULL,NULL,'activa'),
(351,73,'2025-10-06 17:17:52',NULL,NULL,'activa'),
(352,4,'2025-10-07 14:43:25',NULL,NULL,'activa'),
(353,73,'2025-10-07 14:45:07',NULL,NULL,'activa'),
(354,4,'2025-10-07 14:55:43',NULL,NULL,'activa'),
(355,4,'2025-10-07 14:56:44',NULL,NULL,'activa'),
(356,73,'2025-10-07 14:56:59',NULL,NULL,'activa'),
(357,4,'2025-10-07 15:09:01',NULL,NULL,'activa'),
(358,73,'2025-10-07 15:14:34',NULL,NULL,'activa'),
(359,4,'2025-10-07 15:25:33',NULL,NULL,'activa'),
(360,73,'2025-10-07 15:28:00',NULL,NULL,'activa'),
(361,73,'2025-10-07 16:45:00',NULL,NULL,'activa'),
(362,73,'2025-10-07 16:54:01',NULL,NULL,'activa'),
(363,4,'2025-10-07 16:55:55',NULL,NULL,'activa'),
(364,73,'2025-10-07 17:05:22',NULL,NULL,'activa'),
(365,4,'2025-10-07 17:15:36',NULL,NULL,'activa'),
(366,73,'2025-10-07 17:16:25',NULL,NULL,'activa'),
(367,4,'2025-10-07 17:20:40',NULL,NULL,'activa'),
(368,73,'2025-10-07 17:23:21',NULL,NULL,'activa'),
(369,73,'2025-10-07 17:47:07',NULL,NULL,'activa'),
(370,4,'2025-10-07 17:54:48',NULL,NULL,'activa'),
(371,73,'2025-10-07 17:56:19',NULL,NULL,'activa'),
(372,73,'2025-10-08 04:30:18',NULL,NULL,'activa'),
(373,4,'2025-10-08 04:30:53',NULL,NULL,'activa'),
(374,4,'2025-10-08 14:39:09',NULL,NULL,'activa'),
(375,4,'2025-10-08 14:43:46',NULL,NULL,'activa'),
(376,4,'2025-10-08 14:43:50',NULL,NULL,'activa'),
(377,73,'2025-10-08 15:12:53',NULL,NULL,'activa'),
(378,73,'2025-10-08 16:32:04',NULL,NULL,'activa'),
(379,73,'2025-10-08 17:06:59',NULL,NULL,'activa'),
(380,73,'2025-10-08 17:56:40',NULL,NULL,'activa'),
(381,73,'2025-10-09 14:46:49',NULL,NULL,'activa'),
(382,4,'2025-10-09 15:03:02',NULL,NULL,'activa'),
(383,73,'2025-10-09 15:04:08',NULL,NULL,'activa'),
(384,4,'2025-10-09 15:33:14',NULL,NULL,'activa'),
(385,4,'2025-10-09 15:33:19',NULL,NULL,'activa'),
(386,73,'2025-10-09 15:56:49',NULL,NULL,'activa'),
(387,73,'2025-10-09 16:42:06',NULL,NULL,'activa'),
(388,73,'2025-10-09 17:26:33',NULL,NULL,'activa'),
(389,73,'2025-10-09 17:43:03',NULL,NULL,'activa'),
(390,73,'2025-10-09 23:02:14',NULL,NULL,'activa'),
(391,73,'2025-10-13 16:40:41',NULL,NULL,'activa'),
(392,4,'2025-10-13 16:44:48',NULL,NULL,'activa'),
(393,73,'2025-10-13 16:46:34',NULL,NULL,'activa'),
(394,4,'2025-10-13 17:15:04',NULL,NULL,'activa'),
(395,4,'2025-10-15 14:43:54',NULL,NULL,'activa'),
(396,73,'2025-10-15 14:44:10',NULL,NULL,'activa'),
(397,4,'2025-10-15 15:14:14',NULL,NULL,'activa'),
(398,73,'2025-10-15 15:50:08',NULL,NULL,'activa'),
(399,4,'2025-10-21 14:46:15',NULL,NULL,'activa'),
(400,4,'2025-10-22 14:28:40',NULL,NULL,'activa'),
(401,4,'2025-10-22 17:03:04',NULL,NULL,'activa'),
(402,4,'2025-10-22 17:50:34',NULL,NULL,'activa'),
(403,4,'2025-10-22 17:50:35',NULL,NULL,'activa'),
(404,4,'2025-10-22 17:50:36',NULL,NULL,'activa'),
(405,4,'2025-10-22 17:50:36',NULL,NULL,'activa'),
(406,4,'2025-10-23 15:47:32',NULL,NULL,'activa'),
(407,4,'2025-10-23 16:08:50',NULL,NULL,'activa'),
(408,4,'2025-10-23 16:43:28',NULL,NULL,'activa'),
(409,4,'2025-10-27 15:19:14',NULL,NULL,'activa'),
(410,4,'2025-10-27 16:33:11',NULL,NULL,'activa'),
(411,73,'2025-10-27 16:46:39',NULL,NULL,'activa'),
(412,4,'2025-10-27 23:22:10',NULL,NULL,'activa'),
(413,73,'2025-10-27 23:22:39',NULL,NULL,'activa'),
(414,73,'2025-10-28 03:01:35',NULL,NULL,'activa'),
(415,73,'2025-10-28 04:03:52',NULL,NULL,'activa'),
(416,4,'2025-10-28 04:11:23',NULL,NULL,'activa'),
(417,73,'2025-10-28 04:12:27',NULL,NULL,'activa'),
(418,4,'2025-10-28 04:15:08',NULL,NULL,'activa'),
(419,73,'2025-10-28 04:16:39',NULL,NULL,'activa'),
(420,73,'2025-10-28 14:32:46',NULL,NULL,'activa'),
(421,73,'2025-10-28 15:22:39',NULL,NULL,'activa'),
(422,73,'2025-10-28 16:27:08',NULL,NULL,'activa'),
(423,73,'2025-10-28 17:29:04',NULL,NULL,'activa'),
(424,73,'2025-10-29 03:06:21',NULL,NULL,'activa'),
(425,4,'2025-10-29 03:43:47',NULL,NULL,'activa'),
(426,4,'2025-10-29 03:43:48',NULL,NULL,'activa'),
(427,4,'2025-10-29 03:43:49',NULL,NULL,'activa'),
(428,73,'2025-10-29 03:50:55',NULL,NULL,'activa'),
(429,4,'2025-10-29 03:53:28',NULL,NULL,'activa'),
(430,73,'2025-10-29 03:54:49',NULL,NULL,'activa'),
(431,73,'2025-10-29 14:42:40',NULL,NULL,'activa'),
(432,73,'2025-10-29 14:55:08',NULL,NULL,'activa'),
(433,73,'2025-10-29 14:57:25',NULL,NULL,'activa'),
(434,73,'2025-10-29 15:09:50',NULL,NULL,'activa'),
(435,73,'2025-10-29 15:32:08',NULL,NULL,'activa'),
(436,73,'2025-10-29 16:36:37',NULL,NULL,'activa'),
(437,73,'2025-10-29 16:58:47',NULL,NULL,'activa'),
(438,73,'2025-10-29 17:49:52',NULL,NULL,'activa'),
(439,4,'2025-10-29 17:57:30',NULL,NULL,'activa'),
(440,73,'2025-10-29 18:02:53',NULL,NULL,'activa'),
(441,4,'2025-10-29 18:03:23',NULL,NULL,'activa'),
(442,73,'2025-10-29 18:06:42',NULL,NULL,'activa'),
(443,4,'2025-11-03 14:28:21',NULL,NULL,'activa'),
(444,73,'2025-11-03 15:06:14',NULL,NULL,'activa'),
(445,4,'2025-11-03 15:06:41',NULL,NULL,'activa'),
(446,73,'2025-11-03 15:17:25',NULL,NULL,'activa'),
(447,73,'2025-11-04 15:15:58',NULL,NULL,'activa'),
(448,73,'2025-11-04 15:16:13',NULL,NULL,'activa'),
(449,73,'2025-11-04 15:21:00',NULL,NULL,'activa'),
(450,73,'2025-11-04 15:26:40',NULL,NULL,'activa'),
(451,73,'2025-11-04 15:27:44',NULL,NULL,'activa'),
(452,73,'2025-11-04 15:32:26',NULL,NULL,'activa'),
(453,73,'2025-11-04 16:02:13',NULL,NULL,'activa'),
(454,73,'2025-11-04 16:23:52',NULL,NULL,'activa'),
(455,73,'2025-11-04 16:28:35',NULL,NULL,'activa'),
(456,73,'2025-11-04 16:29:31',NULL,NULL,'activa'),
(457,73,'2025-11-04 16:32:26',NULL,NULL,'activa'),
(458,73,'2025-11-04 16:35:33',NULL,NULL,'activa'),
(459,73,'2025-11-04 16:44:07',NULL,NULL,'activa'),
(460,4,'2025-11-04 16:44:51',NULL,NULL,'activa'),
(461,4,'2025-11-04 16:45:19',NULL,NULL,'activa'),
(462,4,'2025-11-04 16:46:32',NULL,NULL,'activa'),
(463,4,'2025-11-04 16:48:46',NULL,NULL,'activa'),
(464,4,'2025-11-04 17:19:33',NULL,NULL,'activa'),
(465,4,'2025-11-04 17:32:08',NULL,NULL,'activa'),
(466,73,'2025-11-04 17:42:58',NULL,NULL,'activa'),
(467,4,'2025-11-04 17:48:36',NULL,NULL,'activa'),
(468,4,'2025-11-05 14:51:55',NULL,NULL,'activa'),
(469,4,'2025-11-05 15:55:47',NULL,NULL,'activa'),
(470,73,'2025-11-05 16:24:23',NULL,NULL,'activa'),
(471,4,'2025-11-05 16:24:46',NULL,NULL,'activa'),
(472,4,'2025-11-06 14:44:48',NULL,NULL,'activa'),
(473,4,'2025-11-06 15:03:02',NULL,NULL,'activa'),
(474,73,'2025-11-06 16:20:02',NULL,NULL,'activa'),
(475,4,'2025-11-06 17:04:33',NULL,NULL,'activa'),
(478,4,'2025-11-11 16:55:16',NULL,NULL,'activa'),
(479,4,'2025-11-12 17:54:07',NULL,NULL,'activa'),
(480,4,'2025-11-13 14:33:51',NULL,NULL,'activa'),
(481,4,'2025-11-19 15:01:48',NULL,NULL,'activa'),
(482,4,'2025-11-19 16:09:33',NULL,NULL,'activa'),
(483,4,'2025-11-19 16:31:36',NULL,NULL,'activa'),
(484,4,'2025-11-19 16:31:38',NULL,NULL,'activa'),
(485,4,'2025-11-19 17:47:57',NULL,NULL,'activa'),
(486,4,'2025-11-20 14:33:34',NULL,NULL,'activa'),
(487,4,'2025-11-20 15:06:11',NULL,NULL,'activa'),
(488,4,'2025-11-20 15:44:58',NULL,NULL,'activa'),
(489,4,'2025-11-20 16:39:08',NULL,NULL,'activa'),
(490,4,'2025-11-25 14:24:05',NULL,NULL,'activa'),
(491,4,'2025-11-25 15:30:39',NULL,NULL,'activa'),
(492,4,'2025-11-25 15:30:41',NULL,NULL,'activa'),
(493,4,'2025-11-25 15:53:28',NULL,NULL,'activa'),
(494,4,'2025-11-25 17:34:48',NULL,NULL,'activa'),
(495,4,'2025-11-26 15:23:45',NULL,NULL,'activa'),
(496,4,'2025-11-26 16:31:07',NULL,NULL,'activa'),
(497,4,'2025-11-26 17:33:38',NULL,NULL,'activa'),
(498,4,'2025-12-01 14:51:23',NULL,NULL,'activa'),
(499,4,'2025-12-01 17:05:42',NULL,NULL,'activa'),
(500,4,'2025-12-01 17:36:35',NULL,NULL,'activa'),
(501,4,'2025-12-01 17:40:37',NULL,NULL,'activa'),
(502,4,'2025-12-02 14:47:33',NULL,NULL,'activa'),
(503,4,'2025-12-02 15:21:27',NULL,NULL,'activa'),
(504,4,'2025-12-02 17:28:29',NULL,NULL,'activa'),
(505,4,'2025-12-03 14:40:42',NULL,NULL,'activa'),
(506,4,'2025-12-03 15:46:25',NULL,NULL,'activa'),
(507,4,'2025-12-03 16:52:04',NULL,NULL,'activa'),
(508,4,'2025-12-03 17:02:48',NULL,NULL,'activa'),
(509,4,'2025-12-03 17:48:46',NULL,NULL,'activa'),
(510,4,'2025-12-03 17:50:10',NULL,NULL,'activa'),
(511,4,'2025-12-08 14:55:06',NULL,NULL,'activa'),
(512,4,'2025-12-08 15:32:48',NULL,NULL,'activa'),
(513,4,'2025-12-08 16:09:21',NULL,NULL,'activa'),
(514,4,'2025-12-08 17:34:44',NULL,NULL,'activa'),
(515,4,'2025-12-08 17:34:47',NULL,NULL,'activa'),
(516,4,'2025-12-09 14:23:17',NULL,NULL,'activa'),
(517,4,'2025-12-09 16:13:48',NULL,NULL,'activa'),
(518,4,'2025-12-09 16:23:02',NULL,NULL,'activa'),
(519,4,'2025-12-09 16:56:23',NULL,NULL,'activa'),
(520,4,'2025-12-10 14:21:03',NULL,NULL,'activa'),
(521,4,'2025-12-10 14:40:00',NULL,NULL,'activa'),
(522,4,'2025-12-10 15:01:07',NULL,NULL,'activa'),
(523,4,'2025-12-10 15:33:14',NULL,NULL,'activa'),
(524,4,'2025-12-10 16:24:28',NULL,NULL,'activa'),
(525,4,'2025-12-10 16:58:23',NULL,NULL,'activa'),
(526,4,'2025-12-10 17:42:45',NULL,NULL,'activa'),
(527,4,'2025-12-11 14:12:20',NULL,NULL,'activa'),
(528,4,'2025-12-11 15:13:31',NULL,NULL,'activa'),
(529,4,'2025-12-11 15:13:33',NULL,NULL,'activa'),
(530,4,'2025-12-11 15:53:46',NULL,NULL,'activa'),
(531,4,'2025-12-11 15:56:09',NULL,NULL,'activa'),
(532,4,'2025-12-11 16:04:54',NULL,NULL,'activa'),
(533,4,'2025-12-11 17:33:11',NULL,NULL,'activa'),
(534,4,'2025-12-17 14:29:07',NULL,NULL,'activa'),
(535,4,'2025-12-17 15:55:23',NULL,NULL,'activa'),
(536,4,'2025-12-17 16:51:52',NULL,NULL,'activa'),
(537,4,'2025-12-18 15:21:22',NULL,NULL,'activa'),
(538,4,'2025-12-18 16:34:20',NULL,NULL,'activa'),
(539,4,'2026-01-07 16:37:17',NULL,NULL,'activa'),
(540,4,'2026-01-08 14:21:48',NULL,NULL,'activa'),
(541,4,'2026-01-08 16:47:09',NULL,NULL,'activa'),
(542,4,'2026-01-08 16:56:54',NULL,NULL,'activa'),
(543,4,'2026-01-08 18:20:22',NULL,NULL,'activa'),
(544,4,'2026-01-08 18:51:27',NULL,NULL,'activa'),
(545,4,'2026-01-08 19:51:49',NULL,NULL,'activa'),
(546,4,'2026-01-08 21:01:32',NULL,NULL,'activa'),
(547,4,'2026-01-09 14:30:57',NULL,NULL,'activa'),
(548,4,'2026-01-09 16:09:09',NULL,NULL,'activa'),
(549,4,'2026-01-09 17:11:26',NULL,NULL,'activa'),
(550,4,'2026-01-09 17:36:05',NULL,NULL,'activa'),
(551,4,'2026-01-09 18:06:12',NULL,NULL,'activa'),
(552,4,'2026-01-09 18:38:41',NULL,NULL,'activa'),
(553,4,'2026-01-09 19:34:28',NULL,NULL,'activa'),
(554,4,'2026-01-09 20:40:42',NULL,NULL,'activa'),
(555,4,'2026-01-09 21:21:17',NULL,NULL,'activa'),
(556,4,'2026-01-09 21:43:38',NULL,NULL,'activa'),
(557,4,'2026-01-12 14:41:54',NULL,NULL,'activa'),
(558,4,'2026-01-12 16:06:43',NULL,NULL,'activa'),
(559,4,'2026-01-12 17:02:53',NULL,NULL,'activa'),
(560,4,'2026-01-12 17:45:25',NULL,NULL,'activa'),
(561,4,'2026-01-12 19:16:07',NULL,NULL,'activa'),
(562,4,'2026-01-12 20:26:31',NULL,NULL,'activa'),
(563,4,'2026-01-12 21:19:26',NULL,NULL,'activa'),
(564,4,'2026-01-12 21:38:09',NULL,NULL,'activa'),
(565,4,'2026-01-12 21:45:31',NULL,NULL,'activa'),
(566,4,'2026-01-13 14:22:27',NULL,NULL,'activa'),
(567,4,'2026-01-13 14:59:03',NULL,NULL,'activa'),
(568,4,'2026-01-13 16:06:10',NULL,NULL,'activa'),
(569,4,'2026-01-13 16:29:30',NULL,NULL,'activa'),
(570,4,'2026-01-13 18:34:04',NULL,NULL,'activa'),
(571,4,'2026-01-13 18:49:26',NULL,NULL,'activa'),
(572,4,'2026-01-13 19:26:27',NULL,NULL,'activa'),
(573,4,'2026-01-13 20:46:00',NULL,NULL,'activa'),
(574,4,'2026-01-13 21:03:38',NULL,NULL,'activa'),
(575,4,'2026-01-14 14:18:36',NULL,NULL,'activa'),
(576,4,'2026-01-14 14:32:23',NULL,NULL,'activa'),
(577,73,'2026-01-14 14:51:16',NULL,NULL,'activa'),
(578,4,'2026-01-14 16:21:46',NULL,NULL,'activa'),
(579,73,'2026-01-14 16:21:58',NULL,NULL,'activa'),
(580,73,'2026-01-14 16:43:11',NULL,NULL,'activa'),
(581,73,'2026-01-14 16:47:15',NULL,NULL,'activa'),
(582,73,'2026-01-14 16:52:28',NULL,NULL,'activa'),
(583,4,'2026-01-14 16:57:40',NULL,NULL,'activa'),
(584,73,'2026-01-14 16:58:17',NULL,NULL,'activa'),
(585,4,'2026-01-14 17:08:43',NULL,NULL,'activa'),
(586,73,'2026-01-14 17:09:48',NULL,NULL,'activa'),
(587,73,'2026-01-14 18:11:31',NULL,NULL,'activa'),
(588,4,'2026-01-14 18:17:47',NULL,NULL,'activa'),
(589,4,'2026-01-14 19:49:38',NULL,NULL,'activa'),
(590,73,'2026-01-14 19:50:20',NULL,NULL,'activa'),
(591,4,'2026-01-14 20:08:47',NULL,NULL,'activa'),
(592,4,'2026-01-14 21:17:52',NULL,NULL,'activa'),
(593,73,'2026-01-14 21:18:33',NULL,NULL,'activa'),
(594,73,'2026-01-15 00:27:47',NULL,NULL,'activa'),
(595,4,'2026-01-15 00:28:24',NULL,NULL,'activa'),
(596,4,'2026-01-15 14:21:44',NULL,NULL,'activa'),
(597,73,'2026-01-15 14:42:39',NULL,NULL,'activa'),
(598,73,'2026-01-15 15:20:22',NULL,NULL,'activa'),
(599,73,'2026-01-15 16:21:13',NULL,NULL,'activa'),
(600,73,'2026-01-15 16:51:05',NULL,NULL,'activa'),
(601,73,'2026-01-15 17:52:39',NULL,NULL,'activa'),
(602,73,'2026-01-15 18:24:36',NULL,NULL,'activa'),
(603,4,'2026-01-15 18:33:53',NULL,NULL,'activa'),
(604,4,'2026-01-15 19:12:12',NULL,NULL,'activa'),
(605,4,'2026-01-15 19:23:11',NULL,NULL,'activa'),
(606,4,'2026-01-15 19:29:45',NULL,NULL,'activa'),
(607,4,'2026-01-15 19:34:44',NULL,NULL,'activa'),
(608,4,'2026-01-15 19:46:19',NULL,NULL,'activa'),
(609,4,'2026-01-15 19:55:52',NULL,NULL,'activa'),
(610,4,'2026-01-15 20:33:31',NULL,NULL,'activa'),
(611,4,'2026-01-16 18:16:55',NULL,NULL,'activa'),
(612,4,'2026-01-16 18:19:33',NULL,NULL,'activa'),
(613,73,'2026-01-16 18:41:12',NULL,NULL,'activa'),
(614,4,'2026-01-16 20:03:30',NULL,NULL,'activa'),
(615,4,'2026-01-16 21:10:08',NULL,NULL,'activa'),
(616,4,'2026-01-16 21:35:00',NULL,NULL,'activa'),
(617,4,'2026-01-20 15:11:02',NULL,NULL,'activa'),
(618,4,'2026-01-20 16:18:18',NULL,NULL,'activa'),
(619,4,'2026-01-20 16:35:05',NULL,NULL,'activa'),
(620,4,'2026-01-20 16:42:08',NULL,NULL,'activa'),
(621,4,'2026-01-21 16:10:25',NULL,NULL,'activa'),
(622,4,'2026-01-21 16:10:27',NULL,NULL,'activa'),
(623,73,'2026-01-21 16:11:46',NULL,NULL,'activa'),
(624,4,'2026-01-21 16:21:18',NULL,NULL,'activa'),
(625,73,'2026-01-21 16:35:06',NULL,NULL,'activa'),
(626,4,'2026-01-21 16:50:43',NULL,NULL,'activa'),
(627,73,'2026-01-21 16:59:13',NULL,NULL,'activa'),
(628,4,'2026-01-21 16:59:50',NULL,NULL,'activa'),
(629,73,'2026-01-21 17:02:58',NULL,NULL,'activa'),
(630,4,'2026-01-21 17:04:31',NULL,NULL,'activa'),
(631,73,'2026-01-21 17:06:11',NULL,NULL,'activa'),
(632,4,'2026-01-21 17:08:15',NULL,NULL,'activa'),
(633,73,'2026-01-21 17:10:07',NULL,NULL,'activa'),
(634,4,'2026-01-21 17:26:24',NULL,NULL,'activa'),
(635,73,'2026-01-21 17:27:22',NULL,NULL,'activa'),
(636,4,'2026-01-21 17:29:39',NULL,NULL,'activa'),
(637,73,'2026-01-21 17:31:21',NULL,NULL,'activa'),
(638,4,'2026-01-21 18:21:48',NULL,NULL,'activa'),
(639,73,'2026-01-21 18:23:12',NULL,NULL,'activa'),
(640,73,'2026-01-21 18:36:00',NULL,NULL,'activa'),
(641,4,'2026-01-21 18:36:51',NULL,NULL,'activa'),
(642,73,'2026-01-21 18:40:31',NULL,NULL,'activa'),
(643,73,'2026-01-21 19:33:41',NULL,NULL,'activa'),
(644,73,'2026-01-21 20:48:47',NULL,NULL,'activa'),
(645,4,'2026-01-21 20:57:08',NULL,NULL,'activa'),
(646,73,'2026-01-21 20:57:53',NULL,NULL,'activa'),
(647,4,'2026-01-21 20:58:26',NULL,NULL,'activa'),
(648,73,'2026-01-21 20:59:37',NULL,NULL,'activa'),
(649,4,'2026-01-21 21:05:04',NULL,NULL,'activa'),
(650,73,'2026-01-21 21:06:18',NULL,NULL,'activa'),
(651,4,'2026-01-23 15:30:14',NULL,NULL,'activa'),
(652,73,'2026-01-23 15:31:01',NULL,NULL,'activa'),
(653,4,'2026-01-23 15:40:46',NULL,NULL,'activa'),
(654,73,'2026-01-23 15:42:06',NULL,NULL,'activa'),
(655,4,'2026-01-23 15:49:05',NULL,NULL,'activa'),
(656,73,'2026-01-23 15:51:20',NULL,NULL,'activa'),
(657,4,'2026-01-23 15:52:21',NULL,NULL,'activa'),
(658,73,'2026-01-23 15:53:22',NULL,NULL,'activa'),
(659,4,'2026-01-23 15:54:00',NULL,NULL,'activa'),
(660,73,'2026-01-23 15:54:36',NULL,NULL,'activa'),
(661,4,'2026-01-23 15:55:21',NULL,NULL,'activa'),
(662,73,'2026-01-23 15:57:09',NULL,NULL,'activa'),
(663,4,'2026-01-23 16:00:41',NULL,NULL,'activa'),
(664,73,'2026-01-23 16:02:15',NULL,NULL,'activa'),
(665,4,'2026-01-23 16:03:56',NULL,NULL,'activa'),
(666,73,'2026-01-23 16:04:44',NULL,NULL,'activa'),
(667,4,'2026-01-23 16:10:53',NULL,NULL,'activa'),
(668,73,'2026-01-23 16:11:37',NULL,NULL,'activa'),
(669,73,'2026-01-23 16:21:08',NULL,NULL,'activa'),
(670,73,'2026-01-23 16:45:35',NULL,NULL,'activa'),
(671,4,'2026-01-23 16:45:48',NULL,NULL,'activa'),
(672,73,'2026-01-23 16:46:44',NULL,NULL,'activa'),
(673,4,'2026-01-23 16:52:08',NULL,NULL,'activa'),
(674,73,'2026-01-23 16:52:58',NULL,NULL,'activa'),
(675,4,'2026-01-23 16:54:17',NULL,NULL,'activa'),
(676,73,'2026-01-23 16:55:29',NULL,NULL,'activa'),
(677,73,'2026-01-23 17:16:35',NULL,NULL,'activa'),
(678,4,'2026-01-23 17:17:30',NULL,NULL,'activa'),
(679,73,'2026-01-23 17:18:08',NULL,NULL,'activa'),
(680,4,'2026-01-23 17:18:37',NULL,NULL,'activa'),
(681,73,'2026-01-23 17:18:59',NULL,NULL,'activa'),
(682,4,'2026-01-23 17:30:24',NULL,NULL,'activa'),
(683,73,'2026-01-23 17:31:33',NULL,NULL,'activa'),
(684,4,'2026-01-23 18:06:49',NULL,NULL,'activa'),
(685,73,'2026-01-23 18:08:00',NULL,NULL,'activa'),
(686,73,'2026-01-23 18:08:50',NULL,NULL,'activa'),
(687,4,'2026-01-23 18:09:12',NULL,NULL,'activa'),
(688,73,'2026-01-23 18:09:36',NULL,NULL,'activa'),
(689,73,'2026-01-23 18:15:22',NULL,NULL,'activa'),
(690,73,'2026-01-23 18:15:39',NULL,NULL,'activa'),
(691,73,'2026-01-23 18:24:05',NULL,NULL,'activa'),
(692,4,'2026-01-23 18:25:25',NULL,NULL,'activa'),
(693,73,'2026-01-23 18:25:49',NULL,NULL,'activa'),
(694,73,'2026-01-23 18:28:18',NULL,NULL,'activa'),
(695,4,'2026-01-23 18:29:44',NULL,NULL,'activa'),
(696,73,'2026-01-23 18:30:58',NULL,NULL,'activa'),
(697,4,'2026-01-23 18:31:50',NULL,NULL,'activa'),
(698,73,'2026-01-23 18:32:44',NULL,NULL,'activa'),
(699,4,'2026-01-23 18:34:19',NULL,NULL,'activa'),
(700,73,'2026-01-23 18:36:38',NULL,NULL,'activa'),
(701,4,'2026-01-23 18:39:16',NULL,NULL,'activa'),
(702,73,'2026-01-23 18:40:18',NULL,NULL,'activa'),
(703,4,'2026-01-23 18:43:39',NULL,NULL,'activa'),
(704,73,'2026-01-23 18:44:08',NULL,NULL,'activa'),
(705,4,'2026-01-23 18:44:36',NULL,NULL,'activa'),
(706,73,'2026-01-23 18:45:27',NULL,NULL,'activa'),
(707,4,'2026-01-26 18:51:21',NULL,NULL,'activa'),
(708,4,'2026-01-26 20:43:03',NULL,NULL,'activa'),
(709,4,'2026-01-27 15:21:06',NULL,NULL,'activa'),
(710,4,'2026-01-27 15:40:17',NULL,NULL,'activa'),
(711,4,'2026-01-27 16:32:34',NULL,NULL,'activa'),
(712,76,'2026-01-27 16:48:25',NULL,NULL,'activa'),
(713,76,'2026-01-27 16:58:37',NULL,NULL,'activa'),
(714,76,'2026-01-27 17:04:11',NULL,NULL,'activa'),
(715,4,'2026-01-27 17:33:22',NULL,NULL,'activa'),
(716,76,'2026-01-27 17:58:54',NULL,NULL,'activa'),
(717,4,'2026-01-27 20:04:01',NULL,NULL,'activa'),
(718,76,'2026-01-27 20:05:57',NULL,NULL,'activa'),
(719,4,'2026-01-27 20:15:58',NULL,NULL,'activa'),
(720,76,'2026-01-27 20:24:29',NULL,NULL,'activa'),
(721,4,'2026-01-27 20:37:25',NULL,NULL,'activa'),
(722,76,'2026-01-27 20:47:09',NULL,NULL,'activa'),
(723,4,'2026-01-27 21:20:01',NULL,NULL,'activa'),
(724,76,'2026-01-27 21:20:20',NULL,NULL,'activa'),
(725,76,'2026-01-27 21:24:21',NULL,NULL,'activa'),
(726,76,'2026-01-28 15:40:18',NULL,NULL,'activa'),
(727,4,'2026-01-28 15:44:08',NULL,NULL,'activa'),
(728,76,'2026-01-28 15:44:26',NULL,NULL,'activa'),
(729,4,'2026-01-28 16:07:58',NULL,NULL,'activa'),
(730,4,'2026-01-28 16:22:51',NULL,NULL,'activa'),
(731,76,'2026-01-28 17:20:58',NULL,NULL,'activa'),
(732,4,'2026-01-28 17:58:52',NULL,NULL,'activa'),
(733,76,'2026-01-28 17:59:12',NULL,NULL,'activa'),
(734,4,'2026-01-28 18:01:48',NULL,NULL,'activa'),
(735,76,'2026-01-28 18:12:46',NULL,NULL,'activa'),
(736,4,'2026-01-28 18:17:33',NULL,NULL,'activa'),
(737,4,'2026-01-28 18:19:49',NULL,NULL,'activa'),
(738,76,'2026-01-28 18:20:16',NULL,NULL,'activa'),
(739,4,'2026-01-28 18:27:43',NULL,NULL,'activa'),
(740,76,'2026-01-28 18:28:12',NULL,NULL,'activa'),
(741,4,'2026-01-28 18:50:49',NULL,NULL,'activa'),
(742,76,'2026-01-28 18:53:28',NULL,NULL,'activa'),
(743,4,'2026-01-28 19:03:17',NULL,NULL,'activa'),
(744,4,'2026-01-28 19:16:03',NULL,NULL,'activa'),
(745,4,'2026-01-28 19:16:07',NULL,NULL,'activa'),
(746,4,'2026-01-28 19:19:27',NULL,NULL,'activa'),
(747,4,'2026-01-28 19:20:52',NULL,NULL,'activa'),
(748,4,'2026-01-28 19:28:27',NULL,NULL,'activa'),
(749,4,'2026-01-28 19:33:26',NULL,NULL,'activa'),
(750,76,'2026-01-28 19:33:51',NULL,NULL,'activa'),
(751,4,'2026-01-28 20:08:33',NULL,NULL,'activa'),
(752,77,'2026-01-28 20:13:39',NULL,NULL,'activa'),
(753,4,'2026-01-28 20:59:45',NULL,NULL,'activa'),
(754,76,'2026-01-28 21:00:08',NULL,NULL,'activa'),
(755,77,'2026-01-28 21:01:15',NULL,NULL,'activa'),
(756,77,'2026-01-28 21:05:43',NULL,NULL,'activa'),
(757,77,'2026-01-28 21:10:29',NULL,NULL,'activa'),
(758,76,'2026-01-28 21:11:34',NULL,NULL,'activa'),
(759,77,'2026-01-28 21:12:39',NULL,NULL,'activa'),
(760,77,'2026-01-28 21:15:36',NULL,NULL,'activa'),
(761,77,'2026-01-28 21:16:13',NULL,NULL,'activa'),
(762,77,'2026-01-28 21:16:16',NULL,NULL,'activa'),
(763,77,'2026-01-28 21:19:23',NULL,NULL,'activa'),
(764,76,'2026-01-28 21:19:48',NULL,NULL,'activa'),
(765,4,'2026-01-28 21:20:26',NULL,NULL,'activa'),
(766,76,'2026-01-29 14:20:14',NULL,NULL,'activa'),
(767,4,'2026-01-29 14:31:20',NULL,NULL,'activa'),
(768,76,'2026-01-29 14:32:40',NULL,NULL,'activa'),
(769,4,'2026-01-29 15:13:06',NULL,NULL,'activa'),
(770,4,'2026-01-29 15:39:16',NULL,NULL,'activa'),
(771,76,'2026-01-29 15:50:39',NULL,NULL,'activa'),
(772,76,'2026-01-29 15:50:41',NULL,NULL,'activa'),
(773,77,'2026-01-29 15:51:52',NULL,NULL,'activa'),
(774,76,'2026-01-29 15:55:36',NULL,NULL,'activa'),
(775,4,'2026-01-29 15:56:27',NULL,NULL,'activa'),
(776,76,'2026-01-29 15:57:14',NULL,NULL,'activa'),
(777,77,'2026-01-29 15:57:37',NULL,NULL,'activa'),
(778,77,'2026-01-29 16:03:48',NULL,NULL,'activa'),
(779,76,'2026-01-29 16:08:52',NULL,NULL,'activa'),
(780,4,'2026-01-29 16:09:21',NULL,NULL,'activa'),
(781,4,'2026-01-29 16:27:25',NULL,NULL,'activa'),
(782,4,'2026-01-29 16:45:30',NULL,NULL,'activa'),
(783,4,'2026-01-29 18:30:00',NULL,NULL,'activa'),
(784,4,'2026-01-29 21:14:03',NULL,NULL,'activa'),
(785,4,'2026-01-29 21:34:57',NULL,NULL,'activa'),
(786,4,'2026-01-30 15:01:45',NULL,NULL,'activa'),
(787,76,'2026-01-30 15:03:08',NULL,NULL,'activa'),
(788,77,'2026-01-30 15:03:56',NULL,NULL,'activa'),
(789,76,'2026-01-30 15:37:35',NULL,NULL,'activa'),
(790,73,'2026-01-30 15:59:19',NULL,NULL,'activa'),
(791,76,'2026-01-30 16:07:15',NULL,NULL,'activa'),
(792,4,'2026-01-30 16:13:56',NULL,NULL,'activa'),
(793,77,'2026-01-30 16:22:55',NULL,NULL,'activa'),
(794,76,'2026-01-30 16:45:20',NULL,NULL,'activa'),
(795,77,'2026-01-30 16:54:11',NULL,NULL,'activa'),
(796,4,'2026-01-30 17:00:59',NULL,NULL,'activa'),
(797,76,'2026-01-30 17:01:35',NULL,NULL,'activa'),
(798,77,'2026-01-30 17:02:02',NULL,NULL,'activa'),
(799,76,'2026-01-30 17:21:27',NULL,NULL,'activa'),
(800,4,'2026-01-30 17:24:05',NULL,NULL,'activa'),
(801,76,'2026-01-30 17:25:34',NULL,NULL,'activa'),
(802,77,'2026-01-30 17:31:08',NULL,NULL,'activa'),
(803,76,'2026-01-30 17:37:30',NULL,NULL,'activa'),
(804,77,'2026-01-30 17:38:46',NULL,NULL,'activa'),
(805,77,'2026-01-30 17:44:17',NULL,NULL,'activa'),
(806,76,'2026-01-30 17:45:00',NULL,NULL,'activa'),
(807,4,'2026-02-03 15:47:36',NULL,NULL,'activa'),
(808,76,'2026-02-03 16:09:55',NULL,NULL,'activa'),
(809,77,'2026-02-03 16:12:56',NULL,NULL,'activa'),
(810,76,'2026-02-03 16:27:18',NULL,NULL,'activa'),
(811,4,'2026-02-03 16:31:01',NULL,NULL,'activa'),
(812,76,'2026-02-03 16:44:47',NULL,NULL,'activa'),
(813,77,'2026-02-03 16:45:29',NULL,NULL,'activa'),
(814,4,'2026-02-03 16:52:35',NULL,NULL,'activa'),
(815,77,'2026-02-03 17:39:17',NULL,NULL,'activa'),
(816,76,'2026-02-03 17:39:48',NULL,NULL,'activa'),
(817,77,'2026-02-03 17:41:24',NULL,NULL,'activa'),
(818,76,'2026-02-03 17:42:08',NULL,NULL,'activa'),
(819,4,'2026-02-03 17:43:10',NULL,NULL,'activa'),
(820,73,'2026-02-03 17:51:38',NULL,NULL,'activa'),
(821,4,'2026-02-03 18:06:32',NULL,NULL,'activa'),
(822,4,'2026-02-04 15:39:48',NULL,NULL,'activa'),
(823,76,'2026-02-04 16:32:15',NULL,NULL,'activa'),
(824,77,'2026-02-04 16:34:36',NULL,NULL,'activa'),
(825,4,'2026-02-04 16:35:10',NULL,NULL,'activa'),
(826,4,'2026-02-04 18:06:50',NULL,NULL,'activa'),
(827,4,'2026-02-04 19:28:17',NULL,NULL,'activa'),
(828,76,'2026-02-04 19:29:44',NULL,NULL,'activa'),
(829,77,'2026-02-04 19:37:03',NULL,NULL,'activa'),
(830,4,'2026-02-04 19:50:40',NULL,NULL,'activa'),
(831,76,'2026-02-04 20:08:06',NULL,NULL,'activa'),
(832,4,'2026-02-04 20:32:51',NULL,NULL,'activa'),
(833,76,'2026-02-04 20:40:08',NULL,NULL,'activa'),
(834,73,'2026-02-04 20:54:06',NULL,NULL,'activa'),
(835,4,'2026-02-04 20:54:58',NULL,NULL,'activa'),
(836,76,'2026-02-04 20:59:16',NULL,NULL,'activa'),
(837,4,'2026-02-04 21:10:25',NULL,NULL,'activa'),
(838,4,'2026-02-04 21:25:34',NULL,NULL,'activa'),
(839,76,'2026-02-04 21:25:56',NULL,NULL,'activa'),
(840,4,'2026-02-04 21:35:50',NULL,NULL,'activa'),
(841,4,'2026-02-06 14:19:48',NULL,NULL,'activa'),
(842,76,'2026-02-06 14:25:14',NULL,NULL,'activa'),
(843,76,'2026-02-06 14:54:14',NULL,NULL,'activa'),
(844,4,'2026-02-06 15:00:49',NULL,NULL,'activa'),
(845,76,'2026-02-06 15:06:36',NULL,NULL,'activa'),
(846,4,'2026-02-06 15:17:03',NULL,NULL,'activa'),
(847,4,'2026-02-06 15:18:19',NULL,NULL,'activa'),
(848,76,'2026-02-06 15:19:13',NULL,NULL,'activa'),
(849,76,'2026-02-06 15:23:18',NULL,NULL,'activa'),
(850,4,'2026-02-06 15:24:36',NULL,NULL,'activa'),
(851,76,'2026-02-06 15:29:35',NULL,NULL,'activa'),
(852,4,'2026-02-06 15:30:40',NULL,NULL,'activa'),
(853,76,'2026-02-06 15:34:27',NULL,NULL,'activa'),
(854,4,'2026-02-06 15:38:29',NULL,NULL,'activa'),
(855,76,'2026-02-06 15:47:58',NULL,NULL,'activa'),
(856,4,'2026-02-06 15:54:45',NULL,NULL,'activa'),
(857,76,'2026-02-06 16:31:43',NULL,NULL,'activa'),
(858,76,'2026-02-06 17:24:44',NULL,NULL,'activa'),
(859,76,'2026-02-06 17:31:06',NULL,NULL,'activa'),
(860,76,'2026-02-06 17:36:39',NULL,NULL,'activa'),
(861,4,'2026-02-06 17:41:11',NULL,NULL,'activa'),
(862,76,'2026-02-06 17:42:04',NULL,NULL,'activa'),
(863,76,'2026-02-06 17:46:28',NULL,NULL,'activa'),
(864,76,'2026-02-06 18:07:36',NULL,NULL,'activa'),
(865,4,'2026-02-06 18:10:09',NULL,NULL,'activa'),
(866,76,'2026-02-06 19:19:51',NULL,NULL,'activa'),
(867,76,'2026-02-06 19:29:56',NULL,NULL,'activa'),
(868,4,'2026-02-06 19:33:08',NULL,NULL,'activa'),
(869,76,'2026-02-06 19:34:48',NULL,NULL,'activa'),
(870,76,'2026-02-06 19:46:49',NULL,NULL,'activa'),
(871,4,'2026-02-06 19:52:49',NULL,NULL,'activa'),
(872,76,'2026-02-06 19:55:14',NULL,NULL,'activa'),
(873,4,'2026-02-06 20:11:01',NULL,NULL,'activa'),
(874,76,'2026-02-06 20:11:45',NULL,NULL,'activa'),
(875,4,'2026-02-06 20:27:53',NULL,NULL,'activa'),
(876,76,'2026-02-06 20:35:14',NULL,NULL,'activa'),
(877,4,'2026-02-06 20:36:08',NULL,NULL,'activa'),
(878,76,'2026-02-06 20:43:39',NULL,NULL,'activa'),
(879,4,'2026-02-06 20:54:19',NULL,NULL,'activa'),
(880,73,'2026-02-06 21:01:54',NULL,NULL,'activa'),
(881,4,'2026-02-06 21:02:09',NULL,NULL,'activa'),
(882,73,'2026-02-06 21:03:19',NULL,NULL,'activa'),
(883,4,'2026-02-06 21:03:31',NULL,NULL,'activa'),
(884,73,'2026-02-06 21:05:05',NULL,NULL,'activa'),
(885,4,'2026-02-06 21:05:18',NULL,NULL,'activa'),
(886,76,'2026-02-06 21:09:02',NULL,NULL,'activa'),
(887,76,'2026-02-10 15:23:40',NULL,NULL,'activa'),
(888,4,'2026-02-10 15:59:39',NULL,NULL,'activa'),
(889,4,'2026-02-10 16:04:01',NULL,NULL,'activa'),
(890,73,'2026-02-10 16:52:31',NULL,NULL,'activa'),
(891,4,'2026-02-10 17:07:30',NULL,NULL,'activa'),
(892,73,'2026-02-10 17:11:26',NULL,NULL,'activa'),
(893,4,'2026-02-11 17:54:27',NULL,NULL,'activa'),
(894,76,'2026-02-11 17:55:48',NULL,NULL,'activa'),
(895,4,'2026-02-11 17:56:23',NULL,NULL,'activa'),
(896,73,'2026-02-11 18:03:10',NULL,NULL,'activa'),
(897,4,'2026-02-11 18:16:30',NULL,NULL,'activa'),
(898,4,'2026-02-12 15:24:45',NULL,NULL,'activa'),
(899,4,'2026-02-12 16:43:44',NULL,NULL,'activa'),
(900,4,'2026-02-17 17:42:51',NULL,NULL,'activa'),
(901,4,'2026-02-17 17:47:37',NULL,NULL,'activa'),
(902,4,'2026-02-17 18:11:57',NULL,NULL,'activa'),
(903,73,'2026-02-17 18:27:15',NULL,NULL,'activa'),
(904,4,'2026-02-17 19:09:07',NULL,NULL,'activa'),
(905,4,'2026-02-17 19:09:10',NULL,NULL,'activa'),
(906,4,'2026-02-18 16:15:02',NULL,NULL,'activa'),
(907,4,'2026-02-18 16:15:59',NULL,NULL,'activa'),
(908,78,'2026-02-18 17:50:14',NULL,NULL,'activa');
/*!40000 ALTER TABLE `sesiones_usuario` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `solicitudes_convocatorias`
--

DROP TABLE IF EXISTS `solicitudes_convocatorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_convocatorias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `convocatoria_id` int(10) unsigned NOT NULL,
  `alumno_id` int(10) unsigned NOT NULL,
  `estado` enum('solicitada','aceptada','rechazada') NOT NULL DEFAULT 'solicitada',
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_alumno_convocatoria` (`convocatoria_id`,`alumno_id`),
  KEY `fk_solicitud_alumno` (`alumno_id`),
  CONSTRAINT `fk_solicitud_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumno` (`id_alumno`) ON DELETE CASCADE,
  CONSTRAINT `fk_solicitud_convocatoria` FOREIGN KEY (`convocatoria_id`) REFERENCES `convocatorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_convocatorias`
--

LOCK TABLES `solicitudes_convocatorias` WRITE;
/*!40000 ALTER TABLE `solicitudes_convocatorias` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `solicitudes_convocatorias` VALUES
(7,17,2,'aceptada','2025-09-12 17:02:27'),
(8,18,2,'rechazada','2025-09-12 17:02:28'),
(9,19,2,'aceptada','2025-09-17 15:28:38'),
(13,20,2,'aceptada','2026-02-06 21:05:07');
/*!40000 ALTER TABLE `solicitudes_convocatorias` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_solicitud_insert`
BEFORE INSERT ON `solicitudes_convocatorias`
FOR EACH ROW
BEGIN
  DECLARE univ_count INT;
  SELECT COUNT(*) INTO univ_count
  FROM `convocatoria_universidades` cu
  JOIN `alumno` a ON a.id_universidad = cu.universidad_id
  WHERE cu.convocatoria_id = NEW.convocatoria_id AND a.id_alumno = NEW.alumno_id;
  IF univ_count = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Alumno no pertenece a una universidad de la convocatoria';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `subgrupo_habilidades`
--

DROP TABLE IF EXISTS `subgrupo_habilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subgrupo_habilidades` (
  `id_subgrupo` int(10) unsigned NOT NULL,
  `id_habilidad` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_subgrupo`,`id_habilidad`),
  KEY `fk_subgrupo_habilidades_subgrupo` (`id_subgrupo`),
  KEY `fk_subgrupo_habilidades_habilidad` (`id_habilidad`),
  CONSTRAINT `fk_subgrupo_habilidades_habilidad` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidades_clave` (`id_habilidad`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subgrupo_habilidades_subgrupo` FOREIGN KEY (`id_subgrupo`) REFERENCES `subgrupos_operadores` (`id_subgrupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subgrupo_habilidades`
--

LOCK TABLES `subgrupo_habilidades` WRITE;
/*!40000 ALTER TABLE `subgrupo_habilidades` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `subgrupo_habilidades` VALUES
(1,2),
(1,3),
(1,4),
(1,5),
(1,7),
(1,8),
(2,2),
(2,3),
(2,4),
(2,5),
(2,7),
(2,8),
(2,10),
(2,75),
(3,17),
(3,18),
(3,19),
(3,20),
(3,21),
(4,23),
(4,24),
(4,25),
(4,26),
(4,27),
(5,28),
(5,29),
(5,30),
(5,31),
(5,32),
(7,33),
(7,34),
(7,35),
(7,36),
(7,37),
(8,38),
(8,39),
(8,40),
(8,41),
(8,42),
(9,43),
(9,44),
(9,46),
(9,47),
(9,48),
(9,49),
(10,50),
(10,51),
(10,52),
(10,53),
(10,54),
(10,55),
(10,56),
(11,57),
(11,58),
(11,59),
(11,60),
(11,61),
(11,62),
(11,63),
(12,64),
(12,65),
(12,66),
(12,67),
(12,68),
(13,3),
(13,70),
(13,71),
(13,73),
(13,74),
(13,75),
(13,76),
(13,77),
(14,78),
(14,79),
(14,80),
(14,81),
(14,82),
(14,83),
(15,71),
(15,76),
(15,84),
(15,86),
(15,87),
(15,88),
(15,90),
(15,91),
(16,92),
(16,93),
(16,94),
(17,95),
(17,96),
(17,97),
(17,98),
(17,99),
(17,100),
(18,101),
(18,102),
(18,103),
(18,104),
(18,105),
(18,106),
(18,107),
(18,108),
(19,109),
(19,110),
(19,111),
(19,112),
(20,113),
(20,114),
(20,115),
(20,116),
(20,117),
(21,118),
(21,119),
(21,120),
(21,121),
(21,122),
(21,123),
(21,125),
(22,74),
(22,126),
(22,127),
(22,128),
(22,129),
(22,131),
(23,132),
(23,133),
(23,134),
(23,135),
(23,136),
(23,137),
(23,138),
(23,139),
(25,140),
(25,141),
(25,142),
(25,143),
(26,133),
(26,144),
(26,145),
(26,147),
(26,148),
(26,149),
(28,160),
(28,161),
(28,162),
(28,163),
(28,164),
(28,165),
(29,166),
(29,167),
(29,168),
(29,169);
/*!40000 ALTER TABLE `subgrupo_habilidades` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `subgrupos_operadores`
--

DROP TABLE IF EXISTS `subgrupos_operadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subgrupos_operadores` (
  `id_subgrupo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre_subgrupo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_subgrupo`),
  UNIQUE KEY `uk_nombre_subgrupo` (`nombre_subgrupo`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subgrupos_operadores`
--

LOCK TABLES `subgrupos_operadores` WRITE;
/*!40000 ALTER TABLE `subgrupos_operadores` DISABLE KEYS */;
set autocommit=0;
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
/*!40000 ALTER TABLE `subgrupos_operadores` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `subtemas_unidad`
--

DROP TABLE IF EXISTS `subtemas_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subtemas_unidad` (
  `id_subtema` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_unidad` int(10) unsigned NOT NULL,
  `nombre_subtema` varchar(255) NOT NULL,
  `descripcion_subtema` text DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_subtema`),
  KEY `idx_unidad_orden` (`id_unidad`,`orden`),
  CONSTRAINT `subtemas_unidad_ibfk_1` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_curso` (`id_unidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subtemas_unidad`
--

LOCK TABLES `subtemas_unidad` WRITE;
/*!40000 ALTER TABLE `subtemas_unidad` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `subtemas_unidad` VALUES
(113,75,'Paradigmas de programación (procedimental vs. orientado a objetos)',NULL,0),
(114,75,'Conceptos básicos: objetos, clases, atributos y métodos',NULL,1),
(115,75,'Ventajas de la POO en el desarrollo de software',NULL,2),
(116,75,'Lenguajes orientados a objetos (ej. Java, Python, C++)',NULL,3),
(117,76,'Sistemas operativos para data centers (Linux, Windows Server)','',0),
(118,76,'Virtualización y contenedores (VMware, Docker)','',1),
(119,76,'Monitoreo y logging (Prometheus, ELK Stack)','',2),
(120,76,'Automatización con scripts (Bash, PowerShell)','',3),
(121,77,'Tipos de almacenamiento (DAS, NAS, SAN)','',0),
(122,77,'Configuración de RAID y redundancia','',1),
(123,77,'Almacenamiento en nube (S3, Azure Blob)','',2),
(124,77,'Gestión de volúmenes y snapshots','',3),
(125,78,'Orquestación con Kubernetes y OpenShift','',0),
(126,78,'Automatización avanzada (Chef, Puppet)','',1),
(127,78,'Optimización de costos y PUE','',2),
(128,78,'Monitoreo predictivo con AI','',3),
(129,79,'Cifrado de datos y zero-trust models','',0),
(130,79,'Cumplimiento con GDPR, HIPAA y locales','',1),
(131,79,'Detección de amenazas con SIEM','',2),
(132,79,'Auditorías y penetration testing','',3);
/*!40000 ALTER TABLE `subtemas_unidad` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `unidades_curso`
--

DROP TABLE IF EXISTS `unidades_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades_curso`
--

LOCK TABLES `unidades_curso` WRITE;
/*!40000 ALTER TABLE `unidades_curso` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `unidades_curso` VALUES
(1,6,'Introducción a Machine Learning',NULL,NULL,NULL,0),
(3,6,'Preprocesamiento de Datos para ML',NULL,NULL,NULL,0),
(7,6,'Modelos de Machine Learning Supervisado',NULL,NULL,NULL,1),
(9,6,'Modelos de Machine Learning No Supervisado',NULL,NULL,NULL,2),
(11,6,'Proyecto Final',NULL,NULL,NULL,3),
(30,3,'Unidad Primera',NULL,NULL,NULL,0),
(39,3,'Unidad segunda',NULL,NULL,NULL,1),
(40,3,'Unidad Tercera',NULL,NULL,NULL,2),
(75,17,'Introducción a la POO',NULL,'Comprende los paradigmas de programación y los conceptos básicos de POO para identificar su aplicación en problemas computacionales reales.','Capacidad de abstracción, análisis y síntesis\nCapacidad de aplicar los conocimientos en la práctica\nConocimientos sobre el área de estudio y la profesión\nHabilidades para buscar, procesar y analizar información procedente de fuentes diversas\nCapacidad de trabajo en equipo',0),
(76,18,'Operación de sistemas en entornos de datos','','Configura y opera sistemas operativos en entornos de datos para optimizar rendimiento y disponibilidad.','Capacidad de abstracción, análisis y síntesis\nCapacidad de aplicar los conocimientos en la práctica\nConocimientos sobre el área de estudio y la profesión\nHabilidades para buscar, procesar y analizar información procedente de fuentes diversas\nCapacidad de trabajo en equipo',0),
(77,18,'Tecnologías de almacenamiento','','Implementa tecnologías de almacenamiento para garantizar integridad y escalabilidad de datos.','Capacidad de abstracción, análisis y síntesis\nCapacidad de aplicar los conocimientos en la práctica\nCapacidad de comunicación oral y escrita\nCapacidad de investigación\nHabilidades para buscar, procesar y analizar información procedente de fuentes diversas\nCapacidad de trabajo en equipo',1),
(78,19,'Optimización de recursos en data centers','','Optimiza recursos en data centers para maximizar eficiencia y reducir costos operativos.','Capacidad de abstracción, análisis y síntesis\nCapacidad de aplicar los conocimientos en la práctica\nConocimientos sobre el área de estudio y la profesión\nHabilidades para buscar, procesar y analizar información procedente de fuentes diversas\nCapacidad de trabajo en equipo',0),
(79,19,'Seguridad avanzada y compliance','','Implementa medidas de seguridad avanzadas para proteger datos en data centers.','Capacidad de abstracción, análisis y síntesis\nCapacidad de aplicar los conocimientos en la práctica\nCapacidad de comunicación oral y escrita\nCapacidad de investigación\nHabilidades para buscar, procesar y analizar información procedente de fuentes diversas\nCapacidad de trabajo en equipo',1);
/*!40000 ALTER TABLE `unidades_curso` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `universidad`
--

DROP TABLE IF EXISTS `universidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `universidad`
--

LOCK TABLES `universidad` WRITE;
/*!40000 ALTER TABLE `universidad` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `universidad` VALUES
(14,'Universidad Autonoma de Queretaro','UAQ123','uaq esquina uaq calle uaq','4444444444','UAQ1@gmail.com','https://maps.app.goo.gl/Cho4a1RcFjvY6dRWA','/uploads/logos/logo-1755009502925-66301552.svg','2025-07-11 16:13:25','2025-08-21 16:35:38'),
(15,'Universidad Politecnica de Santa Rosa Jauregui','UPSRJ1','carretera san luis potosi','2222222222','upsrj@gmail.com','https://maps.app.goo.gl/E9jmxADCrYgJujT86','/uploads/logos/logo-1755185898508-292691154.png','2025-07-16 17:53:32','2026-01-08 14:30:44'),
(16,'Instituto Tecnologico de Mexico (Campus Queretaro)','itq','conocido','4421234567','itq@qro.edu.mx','https://maps.app.goo.gl/Cho4a1RcFjvY6dRWA','/uploads/logos/logo-1755009594765-67685697.png','2025-08-08 15:57:09','2025-08-12 14:39:54'),
(17,'UTEQ','UTEQ1','qro','','Uteeq@gmail.com','https://maps.app.goo.gl/ZyJVpKWXmaoD83kY9','/uploads/logos/logo-1767987832715-281812144.png','2025-12-11 16:43:31','2026-01-09 19:43:52'),
(18,'UPQ','upq1','','','upq@gmail.com','','/uploads/logos/logo-1767990326409-765254268.svg','2026-01-09 20:25:26','2026-01-09 20:25:26'),
(19,'UTC','utc1','','','utc@gmail.com','','/uploads/logos/logo-1767990655295-757673018.png','2026-01-09 20:29:52','2026-01-09 20:30:55'),
(20,'UTSJR','utsjr1','','','utsjr@gmail.com','','/uploads/logos/logo-1767990925578-868131509.png','2026-01-09 20:35:25','2026-01-09 20:35:25'),
(21,'TECNM Campus Queretaro','tecnm1','','','tecnmqro1@gmail.com','','/uploads/logos/logo-1767991197689-484140443.png','2026-01-09 20:39:57','2026-01-09 20:39:57'),
(22,'TECNM San Juan del Rio','tecnmSJR1','','','tecnmSjr1@gmail.com','','/uploads/logos/logo-1767991472260-236972642.png','2026-01-09 20:44:32','2026-01-09 20:44:32'),
(23,'Universidad Cuauhtemoc','cuauhtemoc1','','','cuauhtemoc1@gmail.com','','/uploads/logos/logo-1767991970411-63814335.png','2026-01-09 20:48:48','2026-01-09 20:52:50'),
(24,'UNIQ','uniq1','','','uniq1@gmail.com','','/uploads/logos/logo-1767992618948-40661802.png','2026-01-09 20:59:47','2026-01-09 21:03:38'),
(25,'UVM','uvm1','','','uvm1@gmail.com','','/uploads/logos/logo-1767992838424-154796346.png','2026-01-09 21:07:18','2026-01-09 21:07:18'),
(26,'UNAQ','UNAQ1','','','UNAQ@gmail.com','','/uploads/logos/logo-1768230127633-71015569.png','2026-01-12 15:01:59','2026-01-12 15:02:07'),
(27,'UNICEQ','Uniceq1','','','Uniceq1@gmail.com','','/uploads/logos/logo-1768231235994-227334738.png','2026-01-12 15:20:35','2026-01-12 15:20:35'),
(28,'CESBA','Cesba1','','4421212121','Cesba1@gmail.com','','/uploads/logos/logo-1768593834017-550406721.png','2026-01-12 15:21:12','2026-01-16 20:12:09'),
(29,'Universidad de Londres','londresQro1','','','londres1Qro@gmail.com','','/uploads/logos/logo-1768231319339-225282275.png','2026-01-12 15:21:59','2026-01-12 15:21:59'),
(30,'UNIPLEA','Uniplea1','','','Uniplea@gmail.com','','/uploads/logos/logo-1768231362375-435538280.png','2026-01-12 15:22:42','2026-01-12 15:22:42'),
(31,'DICORMO','Dicormo1','','','Dicormo1@gmail.com','','/uploads/logos/logo-1768231407105-290301575.png','2026-01-12 15:23:27','2026-01-12 15:23:27'),
(32,'CNCI','CNCI1','','','CNCI@gmail.com','','/uploads/logos/logo-1768231486768-679624383.png','2026-01-12 15:24:46','2026-01-12 15:24:46'),
(33,'Universidad de Atenas Queretaro','Atenas1','','','AtenasQro@gmail.com','','/uploads/logos/logo-1768231524811-309485037.png','2026-01-12 15:25:24','2026-01-12 15:25:24'),
(34,'Universidad Real de Querétaro','RealQro1','','','RealQro1@gmail.com','','/uploads/logos/logo-1768231733645-409063523.svg','2026-01-12 15:28:53','2026-01-12 15:28:53'),
(35,'New Element','NewElementQro1','','','NewElementQro1@gmail.com','','/uploads/logos/logo-1768231868735-842997067.png','2026-01-12 15:31:08','2026-01-12 15:31:08');
/*!40000 ALTER TABLE `universidad` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `tipo_usuario` enum('alumno','maestro','admin_universidad','admin_sedeq','admin_empresa') NOT NULL,
  `estatus` enum('activo','inactivo','pendiente','suspendido') NOT NULL DEFAULT 'pendiente',
  `id_universidad` int(10) unsigned DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `google_id` varchar(255) DEFAULT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_tipo_estatus` (`tipo_usuario`,`estatus`),
  KEY `fk_usuario_universidad` (`id_universidad`),
  KEY `fk_usuario_empresa` (`id_empresa`),
  CONSTRAINT `fk_usuario_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_usuario_universidad` FOREIGN KEY (`id_universidad`) REFERENCES `universidad` (`id_universidad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuario` VALUES
(1,'alumno1','alumno1@example.com','$2b$10$kxgP2sRaphnODaTOXZ55w.FhuiVI0Bul8.WsVdZXAF9.4yLs7S1YO','alumno','activo',NULL,NULL,'2025-06-25 14:53:53','2025-06-25 14:53:53',NULL,NULL),
(2,'maestro1','maestro1@example.com','$2b$10$ranuTl2bjZK3OmUFUXmkROGZy6sHe.veUwypQVhgNmV1ljybIVX8u','maestro','activo',NULL,NULL,'2025-06-25 14:53:53','2025-06-25 14:53:53',NULL,NULL),
(3,'adminuni1','adminuni1@example.com','$2b$10$VZ3hUHdfK7qtqhfuEMGjIuSEtx2cD6VnVhG.q1zrp.ecFHX.VknK6','admin_universidad','activo',NULL,NULL,'2025-06-25 14:53:53','2025-06-25 14:53:53',NULL,NULL),
(4,'sedeq1','sedeq1@example.com','$2b$10$jrD9xFptn9/a0SwgeooKN.VWmmQDO0BznzTDVhaPLqd6STPrXcU0W','admin_sedeq','activo',NULL,NULL,'2025-06-25 14:53:53','2025-06-25 14:53:53',NULL,NULL),
(47,'UaqAdmin@gmail.com','UaqAdmin@gmail.com','$2b$10$WnnlHqj/m8rhkSwvx/336uKAbVWrE59jnuPB28MR0rh0ZwU2dg7xW','admin_universidad','activo',14,NULL,'2025-07-16 14:44:59','2025-07-16 14:44:59',NULL,NULL),
(51,'maestro_1752676672170@temp.com','maestro_1752676672170@temp.com','$2b$10$vRScSGfQKZ7mOx75A.dc8e/EG.yc9BcH3Fs9eBEnL.7uhNaZmQ36K','maestro','activo',14,NULL,'2025-07-16 17:23:52','2025-07-16 17:23:52',NULL,NULL),
(59,'pruebaMaestro@gmail.com','pruebaMaestro@gmail.com','$2b$10$MwUgQu7SB2wsTSz1dUyIt.W2sa3OtbumkfTQWMkqiOW.ueNzE6CsO','maestro','activo',14,NULL,'2025-07-16 17:54:27','2025-08-15 16:26:25',NULL,NULL),
(60,'ItqAdmin@qro.edu.mx','ItqAdmin@qro.edu.mx','$2b$10$Vf1XZU9g5g93AdpCpmuz2eRQ7XZZUr25ABRPCkaNZAAh0f43uzkja','admin_universidad','activo',16,NULL,'2025-08-08 15:57:53','2025-11-04 17:48:55',NULL,NULL),
(61,'prueba2@uaq.edu.mx','prueba2@uaq.edu.mx','$2b$10$s/QX282yfZCnRev1.6LMYONgWBic4TsWlOgBo.rEwFaft3qgqvxWO','maestro','activo',14,NULL,'2025-08-14 17:15:47','2025-08-14 17:15:47',NULL,NULL),
(62,'axel@upsrj.edu.mx','axel@upsrj.edu.mx','$2b$10$QR6IngBSerO4UiKjseElIeeDfLLZY0c6uyTTqhJiFfHQqxmORr4sG','maestro','activo',15,NULL,'2025-08-15 17:39:54','2025-08-15 17:39:54',NULL,NULL),
(63,'OscarMaestro@itq.edu.mx','OscarMaestro@itq.edu.mx','$2b$10$J2tH7q8L7wgEqbgEx3Kep.Picql4GkTha0ckc4qC1jW30AcorALiW','maestro','activo',16,NULL,'2025-08-21 16:48:12','2025-08-21 16:48:12',NULL,NULL),
(73,'AXEL DAVID AREVALO GOMEZ','022000708@upsrj.edu.mx',NULL,'alumno','activo',NULL,NULL,'2025-08-27 16:14:26','2025-08-27 16:15:07','111960635237928893373',NULL),
(76,'upsrj@gmail.com','upsrj@gmail.com','$2b$10$EjNXMlyW27jKZISZXqMrz.asOkS58ZbPIbIkh5p2/JGmnmPTzHkoi','admin_universidad','activo',15,NULL,'2026-01-27 16:48:09','2026-01-27 16:48:09',NULL,NULL),
(77,'miguel@upsrj.com','miguel@upsrj.com','$2b$10$GKoDPNGFvDe6aoGsU5J4hOgcwN0jpPyJeJLGwLsBFd3qc/bklrJKO','maestro','activo',15,NULL,'2026-01-28 19:27:03','2026-01-28 19:27:03',NULL,NULL),
(78,'empresa1','empresa@gmail.com','$2b$10$Qzz3IhmmYqujE7NUCfaMVOT4c94mKRDRzeT3.UZHDzHi75UvLUvje','admin_empresa','activo',NULL,NULL,'2026-02-18 17:49:52','2026-02-18 17:49:52',NULL,NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `vinculacion_empresa_alumno`
--

DROP TABLE IF EXISTS `vinculacion_empresa_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vinculacion_empresa_alumno` (
  `id_vinculo` int(11) NOT NULL AUTO_INCREMENT,
  `id_empresa` int(11) NOT NULL,
  `id_alumno` int(10) unsigned NOT NULL,
  `cat_estatus` enum('Contactado','Entrevista','Practicante','Contratado','Finalizado') DEFAULT 'Contactado',
  `es_exito_plataforma` tinyint(1) DEFAULT 0,
  `fecha_inicio` timestamp NULL DEFAULT current_timestamp(),
  `fecha_fin` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_vinculo`),
  KEY `fk_vinculo_empresa` (`id_empresa`),
  KEY `fk_vinculo_alumno` (`id_alumno`),
  CONSTRAINT `fk_vinculo_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_vinculo_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vinculacion_empresa_alumno`
--

LOCK TABLES `vinculacion_empresa_alumno` WRITE;
/*!40000 ALTER TABLE `vinculacion_empresa_alumno` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `vinculacion_empresa_alumno` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-18 11:52:24
