"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faCalendarAlt, faUniversity, faCheckCircle, faTimesCircle, faClock, faGraduationCap } from "@fortawesome/free-solid-svg-icons"
import CursoCard from "../controls/CursoCard"
import CredencialCard from "../controls/CredencialCard"
import CursoModal from "../modals/CursoModal"
import CredencialModal from "../modals/CredencialModal"
import styles from "./CursoYCredencialesAlumno.module.css"
const CursoYCredencialesAlumno = ({
    enConvocatoria = false,
    universidadesConvocatoria = [],
    universidadAlumno = null,
    solicitudesDelAlumno = [] // <-- RECIBIMOS LA NUEVA PROP
}) => {
    // Estados para pestañas - agregamos "seguimiento"
    const [activeTab, setActiveTab] = useState("cursos")

    // Estados para filtros
    const [filters, setFilters] = useState({
        universidades: [],
        subgrupos: [],
        habilidades: [],
        estatus: [],
        estatusInscripcion: [],
        modalidad: [],
        searchTerm: "",
    })

    // Estados para controlar qué secciones están expandidas
    const [expandedSections, setExpandedSections] = useState({
        universidades: false,
        subgrupos: false,
        habilidades: false,
        estatus: false,
        estatusInscripcion: false,
        modalidad: false,
    })

    // --- ESTADOS PARA DATOS DE LA API ---
    const [cursos, setCursos] = useState([])
    const [credenciales, setCredenciales] = useState([])
    const [universidades, setUniversidades] = useState([])
    const [subgrupos, setSubgrupos] = useState([]);
    const [habilidades, setHabilidades] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);

    // --- ESTADOS DE UI (CARGA Y ERRORES) ---
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [loadingSeguimiento, setLoadingSeguimiento] = useState(false)

    // --- ESTADO PARA EL MODAL ---
    const [selectedCurso, setSelectedCurso] = useState(null)
    const [selectedCredencial, setSelectedCredencial] = useState(null)
    const [selectedSubgrupos, setSelectedSubgrupos] = useState([]);
    const [selectedHabilidades, setSelectedHabilidades] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

    // Arrays de opciones de estatus dinámicos según la pestaña
    // Usamos los valores reales del backend para el filtrado
    const cursoStatusOptions = ["planificado", "abierto", "en_curso", "finalizado", "cancelado"];
    const credencialStatusOptions = ["activa", "inactiva"];
    const inscripcionStatusOptions = ["solicitada", "aprobada", "rechazada", "completada", "abandonada", "lista de espera", "baja por el sistema"];
    const modalidadOptions = ["presencial", "mixto", "virtual"];

    const formatModalidadLabel = (modalidad) => {
        if (!modalidad) return '';
        switch (modalidad) {
            case 'presencial':
                return 'Presencial';
            case 'mixto':
                return 'SemiPresencial/Mixto';
            case 'virtual':
                return 'Virtual';
            default: return modalidad.charAt(0).toUpperCase() + modalidad.slice(1);
        }
    };

    // Función para formatear los estatus para mostrarlos en la UI
    const formatStatusLabel = (status) => {
        if (!status) return '';
        // Reemplaza guiones bajos y capitaliza la primera letra de cada palabra
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Función para obtener badge de estado
    const getEstadoBadge = (estado, llena) => {
        const estadoFinal = llena ? "llena" : estado;
        const estadoText = {
            planeada: "Planeada",
            aviso: "Aviso",
            revision: "Revisión",
            activa: "Activa",
            finalizada: "Finalizada",
            cancelada: "Cancelada",
            llena: "Llena",
            solicitada: "Solicitada",
            aceptada: "Aceptada",
            rechazada: "Rechazada",
            aprobada: "Aprobada",
            completada: "Completada",
            abandonada: "Abandonada",
            "lista de espera": "Lista de Espera"
        };

        const estadoClasses = {
            planeada: styles.estadoPlaneada,
            aviso: styles.estadoAviso,
            revision: styles.estadoRevision,
            activa: styles.estadoActiva,
            finalizada: styles.estadoFinalizada,
            cancelada: styles.estadoCancelada,
            llena: styles.estadoLlena,
            solicitada: styles.estadoSolicitada,
            aceptada: styles.estadoAceptada,
            aprobada: styles.estadoAceptada,
            rechazada: styles.estadoRechazada,
            completada: styles.estadoCompletada,
            abandonada: styles.estadoAbandonada,
            "lista de espera": styles.estadoListaEspera
        };

        return (
            <span className={`${styles.estadoBadge} ${estadoClasses[estadoFinal] || ""}`}>
                {estadoText[estadoFinal] || estadoFinal.charAt(0).toUpperCase() + estadoFinal.slice(1)}
            </span>
        );
    };

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return "No especificada"
        const date = new Date(dateString.split("T")[0] + "T00:00:00");
        return date.toLocaleDateString("es-ES", { timeZone: "UTC" });
    };

    // Función para verificar si una fecha está próxima (dentro de 7 días)
    const isDateUpcoming = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    const activeCredentialIdsByInscription = useMemo(() => {
        if (filters.estatusInscripcion.length === 0) {
            return null; // No hay filtro aplicado, no filtrar por esto.
        }

        // 1. Obtener los IDs de los cursos que coinciden con el filtro de inscripción
        const filteredCourseIds = new Set(
            inscripciones
                .filter(insc => filters.estatusInscripcion.includes(insc.estatus_inscripcion))
                .map(insc => insc.id_curso)
        );

        // 2. Encontrar a qué credenciales pertenecen esos cursos
        const credentialIds = new Set();
        cursos.forEach(curso => {
            if (filteredCourseIds.has(curso.id_curso) && curso.id_credencial) {
                credentialIds.add(curso.id_credencial);
            }
        });

        return credentialIds;
    }, [filters.estatusInscripcion, inscripciones, cursos]);

    const activeCredentialIdsByModalidad = useMemo(() => {
        // Si no hay filtro de modalidad, no hacemos nada y no se filtra por esto.
        if (filters.modalidad.length === 0) {
            return null;
        }

        // 1. Obtener los IDs de las credenciales a partir de los cursos que coinciden con el filtro.
        const credentialIds = new Set();
        cursos
            .filter(curso => curso && filters.modalidad.includes(curso.modalidad))
            .forEach(curso => {
                if (curso.id_credencial) {
                    credentialIds.add(curso.id_credencial);
                }
            });

        return credentialIds;
    }, [filters.modalidad, cursos]);

    // --- VINCULACIÓN CON API ---
    // Usamos useEffect para cargar todos los datos iniciales cuando el componente se monta.
    useEffect(() => {
        // Asumimos que el token se guarda en localStorage después del login
        const token = localStorage.getItem('token');

        const fetchAllData = async () => {
            // Envolvemos todo en un try/finally para asegurar que el loading se desactive
            try {
                setLoading(true); // Iniciar carga
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                let cursosUrl = "http://localhost:5000/api/cursos?exclude_assigned=false";
                let credencialesUrl = "http://localhost:5000/api/credenciales";
                let fetchUniversidadesPromise;

                if (enConvocatoria && universidadesConvocatoria.length > 0) {
                    const uniIds = universidadesConvocatoria.map(u => u.id_universidad).join(',');
                    cursosUrl += `&universidades=${uniIds}`;
                    credencialesUrl += `?universidades=${uniIds}`;
                    // Si estamos en convocatoria, usamos las universidades de la prop y no las fetcheamos
                    setUniversidades(universidadesConvocatoria); // Seteamos directamente las universidades
                    fetchUniversidadesPromise = Promise.resolve({ ok: true, json: () => Promise.resolve({ universities: [] }) }); // Evitamos el fetch
                } else if (universidadAlumno) {
                    // Si NO estamos en convocatoria, filtramos por la universidad del alumno.
                    cursosUrl += `&universidades=${universidadAlumno.id_universidad}`;
                    credencialesUrl += `?universidades=${universidadAlumno.id_universidad}`;
                    fetchUniversidadesPromise = fetch("http://localhost:5000/api/universidades");
                } else {
                    // En modo normal, fetcheamos todas las universidades (el backend debería filtrar por la del alumno si es necesario)
                    fetchUniversidadesPromise = fetch("http://localhost:5000/api/universidades");
                }

                // 1. Peticiones de datos críticos (cursos, credenciales, etc.)
                const [cursosRes, credencialesRes, universidadesRes, subgruposRes, habilidadesRes] = await Promise.all([
                    fetch(cursosUrl),
                    fetch(credencialesUrl),
                    fetchUniversidadesPromise,
                    fetch("http://localhost:5000/api/subgrupos-operadores", { headers }),
                    fetch("http://localhost:5000/api/habilidades-clave", { headers }),
                ]);

                // Verificamos que todas las respuestas sean exitosas
                if (!cursosRes.ok) throw new Error("Error al cargar cursos")
                if (!universidadesRes.ok) throw new Error("Error al cargar universidades")
                if (!subgruposRes.ok) throw new Error("Error al cargar subgrupos")
                if (!habilidadesRes.ok) throw new Error("Error al cargar habilidades")

                const cursosData = await cursosRes.json()
                const universidadesData = await universidadesRes.json()
                const subgruposData = await subgruposRes.json()
                const habilidadesData = await habilidadesRes.json()

                // Actualizamos los estados críticos
                setCursos(cursosData.cursos || [])
                if (credencialesRes.ok) {
                    // Leemos el JSON de credenciales UNA SOLA VEZ aquí
                    const credencialesData = await credencialesRes.json();
                    setCredenciales(credencialesData.credenciales || credencialesData || []);
                } else {
                    setCredenciales([]); // Si falla, inicializamos como vacío
                }
                // Solo seteamos universidades si no estamos en modo convocatoria (ya se setearon antes)
                if (!enConvocatoria) {
                    setUniversidades(universidadesData.universities || []);
                }
                setSubgrupos(subgruposData || []);
                setHabilidades(habilidadesData || []);

                // 2. Petición de datos no críticos (inscripciones)
                // Si esta petición falla, la página principal seguirá funcionando.
                if (token) {
                    try {
                        const inscripcionesRes = await fetch("http://localhost:5000/api/inscripciones/alumno", { headers });
                        if (inscripcionesRes.ok) {
                            const inscripcionesData = await inscripcionesRes.json();
                            setInscripciones(inscripcionesData.inscripciones || []);
                        } else {
                            // No lanzamos un error que bloquee, solo lo mostramos en consola.
                            console.error("Advertencia: No se pudieron cargar las inscripciones del alumno. Estado:", inscripcionesRes.status);
                        }
                    } catch (inscError) {
                        console.error("Error al solicitar inscripciones:", inscError);
                    }
                }

            } catch (err) {
                setError(err.message) // Capturamos cualquier error
            } finally {
                setLoading(false) // Dejamos de cargar, ya sea con éxito o con error
            }
        }

        fetchAllData()
        // El array vacío [] significa que este efecto se ejecuta solo una vez
    }, [enConvocatoria, universidadesConvocatoria, universidadAlumno]); // Se ejecuta cuando cambia el modo convocatoria o el alumno
    // Limpiar filtros de estatus cuando cambia la pestaña activa
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            estatus: []
        }))
    }, [activeTab])

    // --- FUNCIONES DE MANEJO DE ACCIONES ---

    // Placeholder para la lógica de solicitud de curso
    const handleSolicitarCurso = (idCurso) => {
        // Esta función ahora puede ser más robusta
        handleSolicitarInscripcion(idCurso);
    };

    // Nueva función unificada para manejar solicitudes de inscripción
    const handleSolicitarInscripcion = async (idCurso) => {
        console.log(`Solicitando inscripción al curso con ID: ${idCurso}`);
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Debes iniciar sesión para solicitar un curso.");
            throw new Error("Usuario no autenticado");
        }

        try {
            const response = await fetch('http://localhost:5000/api/inscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_curso: idCurso })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "No se pudo procesar la solicitud.");
            }

            setInscripciones(prev => [...prev, result.inscripcion]);
            alert("¡Solicitud enviada con éxito!");
        } catch (error) {
            alert(`Error: ${error.message}`);
            throw error; // Re-lanzamos el error para que el componente hijo sepa que falló
        }
    };

    // Funciones para manejar la visibilidad del modal
    const handleVerMas = (curso) => {
        setSelectedCurso(curso)
    }

    const handleCloseModal = () => {
        setSelectedCurso(null)
    }

    // Funciones para manejar la visibilidad del modal de credenciales
    const handleVerMasCredencial = async (item) => {
        setIsModalLoading(true);
        // El 'item' puede ser un objeto 'credencial' (desde CredencialCard)
        // o un objeto 'curso' (desde CursoModal)
        const credencialId = item.id_credencial || item.id_certificacion;
        const credencialName = item.nombre_credencial || item.nombre_certificacion || item.nombre;

        if (!credencialId) {
            console.error("No se encontró ID de credencial en el item:", item);
            setIsModalLoading(false);
            return;
        }

        // Cerramos el modal del curso si estuviera abierto para una mejor UX
        setSelectedCurso(null);
        // Abrimos el modal de la credencial con la información básica que ya tenemos para que se vea algo mientras carga
        setSelectedCredencial({ id_credencial: credencialId, nombre_certificacion: credencialName });

        try {
            const res = await fetch(`http://localhost:5000/api/credenciales/${credencialId}`);
            if (!res.ok) {
                throw new Error('Error al cargar los detalles de la credencial');
            }
            const fullCredencialData = await res.json();
            setSelectedCredencial(fullCredencialData); // Reemplazamos con los datos completos.
        } catch (error) {
            console.error(error);
            handleCloseCredencialModal(); // Cerramos el modal si hay un error.
        } finally {
            setIsModalLoading(false);
        }
    }

    const handleCloseCredencialModal = () => {
        setSelectedCredencial(null)
    }

    // Función para manejar el cambio en la barra de búsqueda
    const handleSearchChange = (e) => {
        setFilters(prev => ({
            ...prev,
            searchTerm: e.target.value,
        }));
    };

    // Función para alternar secciones expandidas
    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    // Función para manejar cambios en filtros
    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter((item) => item !== value)
                : [...prev[filterType], value],
        }))
    }

    // Función para limpiar filtros
    const clearFilters = () => {
        setFilters({
            universidades: [],
            categorias: [],
            estatus: [],
            estatusInscripcion: [],
            modalidad: [],
            searchTerm: ""
        });
    };

    // Función para obtener el estatus de inscripción de un item
    const getInscripcionStatus = useCallback((itemId) => {
        if (!inscripciones || inscripciones.length === 0) return null;

        // Para cursos, buscamos directamente en las inscripciones
        const inscripcion = inscripciones.find(insc => insc.id_curso === itemId);
        return inscripcion ? inscripcion.estatus_inscripcion : null;
    }, [inscripciones]);

    // Función para filtrar datos
    const filterData = useCallback((data) => {
        // Añadimos una guarda para asegurar que 'data' siempre sea un array.
        if (!Array.isArray(data) || data === null) {
            return []
        }
        return data.filter((item) => {
            // Filtro por término de búsqueda
            const searchTermMatch =
                filters.searchTerm.trim() === '' ||
                (item.nombre_curso || item.nombre_credencial || '')
                    .toLowerCase()
                    .includes(filters.searchTerm.toLowerCase());

            const universidadNombre = item.nombre_universidad || item.universidad;
            const universidadMatch =
                filters.universidades.length === 0 || filters.universidades.includes(universidadNombre)

            // Lógica de filtrado de estatus simplificada
            const itemStatus = item.nombre_curso ? item.estatus_curso : item.estatus;
            const estatusMatch = filters.estatus.length === 0 || filters.estatus.includes(itemStatus);

            // Nuevo filtro de estatus de inscripción
            let estatusInscripcionMatch = true;
            // Solo aplicamos el filtro de inscripción si hay alguno seleccionado
            if (activeCredentialIdsByInscription) {
                const isCredencial = !item.nombre_curso; // Si no tiene nombre_curso, es una credencial
                if (isCredencial) {
                    // Para una credencial, vemos si su ID está en el conjunto pre-calculado
                    estatusInscripcionMatch = activeCredentialIdsByInscription.has(item.id_credencial || item.id_certificacion);
                } else {
                    // Para un curso, revisamos su estatus de inscripción individual
                    const inscripcionStatus = getInscripcionStatus(item.id_curso);
                    if (inscripcionStatus) {
                        estatusInscripcionMatch = filters.estatusInscripcion.includes(inscripcionStatus);
                    } else {
                        // Si un curso no tiene inscripción, no debe coincidir con ningún filtro de estatus
                        estatusInscripcionMatch = false;
                    }
                }
            }

            // Lógica de filtrado de modalidad (corregida)
            const modalidadMatch =
                filters.modalidad.length === 0 || // Si no hay filtro, todo coincide
                (item.nombre_curso && filters.modalidad.includes(item.modalidad)) || // Si es un curso, se filtra por su modalidad
                (!!item.nombre_credencial && activeCredentialIdsByModalidad?.has(item.id_credencial || item.id_certificacion)); // Si es una credencial, se usa la lista pre-calculada

            // Filtro por Subgrupo
            let subgrupoMatch = true;
            if (filters.subgrupos.length > 0) {
                if (item.nombre_curso) {
                    subgrupoMatch = filters.subgrupos.includes(item.nombre_subgrupo);
                }
            }

            // Filtro por Habilidades
            let habilidadMatch = true;
            if (filters.habilidades.length > 0) {
                if (item.nombre_curso) {
                    const cursoHabilidades = item.habilidades_nombres ?
                        item.habilidades_nombres.split(',').map(h => h.trim()) : [];
                    habilidadMatch = filters.habilidades.some(habilidad =>
                        cursoHabilidades.includes(habilidad)
                    );
                }
            }
            return searchTermMatch && universidadMatch && estatusMatch &&
                estatusInscripcionMatch && modalidadMatch &&
                subgrupoMatch && habilidadMatch;
        })
    }, [filters, getInscripcionStatus, activeCredentialIdsByInscription, activeCredentialIdsByModalidad])

    const filteredCursos = filterData(cursos)
    const filteredCredenciales = filterData(credenciales)

    // Componente para renderizar filtros
    const FilterSection = ({ title, items, filterType, isExpanded, onToggle, formatLabel = formatStatusLabel }) => {
        const getUniqueKey = (item) => {
            return `${filterType}-${item.id_universidad || item.id_categoria || item.id_subgrupo || item.id_habilidad || JSON.stringify(item)}`;
        };

        const getValue = (item) => {
            // El valor que se guarda en el estado de filtros
            return item.nombre || item.nombre_categoria || item.nombre_subgrupo || item.nombre_habilidad || item;
        };

        const getLabel = (item) => {
            // El texto que se muestra al usuario
            return item.nombre || item.nombre_categoria || item.nombre_subgrupo || item.nombre_habilidad || formatLabel(item);
        };

        return (
            <div className={styles.filterSection}>
                <button className={styles.filterHeader} onClick={() => onToggle(filterType)}>
                    <span>{title}</span>
                    <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}>▼</span>
                </button>
                {isExpanded && (
                    <div className={styles.filterOptions}>
                        {items.map((item) => {
                            const value = getValue(item);
                            return (
                                <label key={getUniqueKey(item)} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={filters[filterType].includes(value)}
                                        onChange={() => handleFilterChange(filterType, value)}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.checkboxText}>{getLabel(item)}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Componente para renderizar contenido de seguimiento
    const renderSeguimientoContent = () => {
        if (loadingSeguimiento) {
            return (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Cargando información de seguimiento...</p>
                </div>
            );
        }

        // Obtener cursos inscritos con información detallada
        const cursosInscritos = inscripciones.map(inscripcion => {
            const curso = cursos.find(c => c.id_curso === inscripcion.id_curso);
            return {
                ...inscripcion,
                ...curso
            };
        }).filter(item => item.nombre_curso); // Solo los que tienen información de curso

        // Obtener credenciales relacionadas a los cursos inscritos
        const credencialesRelacionadas = [...new Set(
            cursosInscritos
                .filter(curso => curso.id_credencial)
                .map(curso => curso.id_credencial)
        )].map(idCredencial => {
            const credencial = credenciales.find(c => c.id_credencial === idCredencial || c.id_certificacion === idCredencial);
            if (!credencial) return null;

            // Calcular progreso de la credencial
            const cursosCredencial = cursosInscritos.filter(c => c.id_credencial === idCredencial);
            const cursosCompletados = cursosCredencial.filter(c => c.estatus_inscripcion === 'completada').length;
            const totalCursos = credencial.cursos ? credencial.cursos.length : cursosCredencial.length;
            const progreso = totalCursos > 0 ? Math.round((cursosCompletados / totalCursos) * 100) : 0;

            return {
                ...credencial,
                progreso,
                cursosCompletados,
                totalCursos
            };
        }).filter(Boolean);

        return (
            <div className={styles.seguimientoContainer}>
                {/* Resumen rápido */}
                <div className={styles.resumenCards}>
                    <div className={styles.resumenCard}>
                        <FontAwesomeIcon icon={faGraduationCap} className={styles.resumenIcon} />
                        <div>
                            <h3>{cursosInscritos.length}</h3>
                            <p>Cursos Inscritos</p>
                        </div>
                    </div>
                    <div className={styles.resumenCard}>
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.resumenIcon} />
                        <div>
                            <h3>{cursosInscritos.filter(c => c.estatus_inscripcion === 'completada').length}</h3>
                            <p>Cursos Completados</p>
                        </div>
                    </div>
                    <div className={styles.resumenCard}>
                        <FontAwesomeIcon icon={faClock} className={styles.resumenIcon} />
                        <div>
                            <h3>{cursosInscritos.filter(c => c.estatus_inscripcion === 'aprobada' || c.estatus_inscripcion === 'en_curso').length}</h3>
                            <p>En Progreso</p>
                        </div>
                    </div>
                    <div className={styles.resumenCard}>
                        <FontAwesomeIcon icon={faCalendarAlt} className={styles.resumenIcon} />
                        <div>
                            <h3>{solicitudesDelAlumno.length}</h3>
                            <p>Convocatorias</p>
                        </div>
                    </div>
                </div>

                {/* Secciones de seguimiento */}
                <div className={styles.seguimientoSections}>
                    {/* Próximos Vencimientos */}
                    <section className={styles.seguimientoSection}>
                        <h3>
                            <FontAwesomeIcon icon={faClock} className={styles.sectionIcon} />
                            Próximos Vencimientos
                        </h3>
                        {(() => {
                            const proximosVencimientos = [];

                            // Cursos próximos a vencer
                            cursosInscritos.forEach(curso => {
                                const estadosExcluidos = ['rechazada', 'abandonada', 'completada'];
                                if (isDateUpcoming(curso.fecha_fin) &&
                                    curso.estatus_inscripcion && // Asegurarse de que hay un estado
                                    !estadosExcluidos.includes(curso.estatus_inscripcion)
                                ) {
                                    proximosVencimientos.push({
                                        tipo: 'curso',
                                        nombre: curso.nombre_curso,
                                        fecha: curso.fecha_fin,
                                        universidad: curso.nombre_universidad
                                    });
                                }
                            });

                            // Convocatorias próximas a vencer
                            solicitudesDelAlumno.forEach(solicitud => {
                                const estadosExcluidos = ['rechazada', 'cancelada', 'finalizada'];
                                if (isDateUpcoming(solicitud.fecha_ejecucion_fin) &&
                                    solicitud.estado &&
                                    !estadosExcluidos.includes(solicitud.estado)) {
                                    proximosVencimientos.push({
                                        tipo: 'convocatoria',
                                        nombre: solicitud.convocatoria_nombre, // <-- Usamos el nombre correcto
                                        fecha: solicitud.fecha_ejecucion_fin,
                                        universidad: solicitud.universidad_nombre,
                                    });
                                }
                            });

                            // Ordenar por fecha
                            proximosVencimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                            return proximosVencimientos.length > 0 ? (
                                <div className={styles.vencimientosList}>
                                    {proximosVencimientos.map((item, index) => (
                                        <div key={index} className={styles.vencimientoItem}>
                                            <FontAwesomeIcon
                                                icon={item.tipo === 'curso' ? faGraduationCap : faCalendarAlt}
                                                className={styles.vencimientoIcon}
                                            />
                                            <div className={styles.vencimientoInfo}>
                                                <span className={styles.vencimientoNombre}>{item.nombre}</span>
                                                <span className={styles.vencimientoUniversidad}>{item.universidad}</span>
                                                <span className={styles.vencimientoTipo}>
                                                    {item.tipo === 'curso' ? 'Curso' : 'Convocatoria'}
                                                </span>
                                            </div>
                                            <div className={styles.vencimientoFecha}>
                                                <FontAwesomeIcon icon={faClock} />
                                                <span>{formatDate(item.fecha)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                                    <p>No tienes vencimientos próximos. ¡Todo al día!</p>
                                </div>
                            );
                        })()}
                    </section>

                    {/* Cursos Inscritos */}
                    <section className={styles.seguimientoSection}>
                        <h3>Mis Cursos</h3>
                        {cursosInscritos.length > 0 ? (
                            <div className={styles.cursosTable}>
                                <div className={styles.tableHeader}>
                                    <span>Curso</span>
                                    <span>Universidades</span>
                                    <span>Estado Inscripción</span>
                                    <span>Estado Curso</span>
                                    <span>Fecha Fin</span>
                                    <span>Acciones</span>
                                </div>
                                {cursosInscritos.map(curso => (
                                    <div key={`${curso.id_curso}-${curso.id_inscripcion}`} className={styles.tableRow}>
                                        <div className={styles.cursoInfo}>
                                            <span className={styles.cursoNombre}>{curso.nombre_curso}</span>
                                            <span className={styles.cursoModalidad}>{formatModalidadLabel(curso.modalidad)}</span>
                                        </div>
                                        <span>{curso.nombre_universidad}</span>
                                        <div>{getEstadoBadge(curso.estatus_inscripcion)}</div>
                                        <div>{getEstadoBadge(curso.estatus_curso)}</div>
                                        <div className={isDateUpcoming(curso.fecha_fin) ? styles.fechaProxima : ""}>
                                            {formatDate(curso.fecha_fin)}
                                            {isDateUpcoming(curso.fecha_fin) && (
                                                <FontAwesomeIcon icon={faClock} className={styles.warningIcon} />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleVerMas(curso)}
                                            className={styles.verMasBtn}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No tienes cursos inscritos aún.</p>
                            </div>
                        )}
                    </section>

                    {/* Credenciales en Progreso */}
                    <section className={styles.seguimientoSection}>
                        <h3>Progreso de Credenciales</h3>
                        {credencialesRelacionadas.length > 0 ? (
                            <div className={styles.credencialesProgreso}>
                                {credencialesRelacionadas.map(credencial => (
                                    <div key={credencial.id_credencial || credencial.id_certificacion} className={styles.credencialProgresoCard}>
                                        <div className={styles.credencialHeader}>
                                            <h4>{credencial.nombre_certificacion || credencial.nombre_credencial}</h4>
                                            <span className={styles.progresoPorcentaje}>{credencial.progreso}%</span>
                                        </div>
                                        <div className={styles.progresoBar}>
                                            <div
                                                className={styles.progresoFill}
                                                style={{ width: `${credencial.progreso}%` }}
                                            ></div>
                                        </div>
                                        <div className={styles.progresoInfo}>
                                            <span>{credencial.cursosCompletados} de {credencial.totalCursos} cursos completados</span>
                                            <button
                                                onClick={() => handleVerMasCredencial(credencial)}
                                                className={styles.verCredencialBtn}
                                            >
                                                Ver credencial
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No tienes credenciales en progreso.</p>
                            </div>
                        )}
                    </section>

                    {/* Convocatorias */}
                    <section className={styles.seguimientoSection}>
                        <h3>Mis Convocatorias</h3>
                        {solicitudesDelAlumno.length > 0 ? (
                            <div className={styles.convocatoriasTable}>
                                <div className={styles.tableHeader}>
                                    <span>Convocatoria</span>
                                    <span>Universidades</span>
                                    <span>Estado</span>
                                    <span>Fecha Solicitud</span>
                                </div>
                                {solicitudesDelAlumno.map(solicitud => (
                                    <div key={solicitud.id} className={`${styles.tableRow} ${styles.convocatoriaRow}`}>
                                        <span className={styles.convocatoriaNombre}>{solicitud.convocatoria_nombre}</span>
                                        <span>
                                            {(solicitud.universidades_participantes || []).join(', ')}
                                        </span>
                                        <div>{getEstadoBadge(solicitud.estado)}</div>
                                        <span>{formatDate(solicitud.fecha_solicitud)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No has solicitado ninguna convocatoria aún.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Panel de filtros lateral - solo para cursos y credenciales */}
            {activeTab !== "seguimiento" && (
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2>Filtros</h2>
                        <button onClick={clearFilters} className={styles.clearButton}>
                            Limpiar filtros
                        </button>
                    </div>

                    <div className={styles.filtersContainer}>
                        {/* El filtro de universidades solo aparece si estamos en convocatoria y hay más de una */}
                        {enConvocatoria && universidades.length > 1 && (
                            <FilterSection
                                title="Universidades"
                                items={universidades} // Ya poblado con las de la convocatoria
                                filterType="universidades"
                                isExpanded={expandedSections.universidades}
                                onToggle={toggleSection}
                            />
                        )}

                        <FilterSection
                            title="Subgrupos"
                            items={subgrupos}
                            filterType="subgrupos"
                            isExpanded={expandedSections.subgrupos}
                            onToggle={toggleSection}
                        />

                        <FilterSection
                            title="Habilidades Clave"
                            items={habilidades}
                            filterType="habilidades"
                            isExpanded={expandedSections.habilidades}
                            onToggle={toggleSection}
                        />

                        <FilterSection
                            title="Estado"
                            items={activeTab === "cursos" ? cursoStatusOptions : credencialStatusOptions}
                            filterType="estatus"
                            isExpanded={expandedSections.estatus}
                            onToggle={toggleSection}
                        />

                        <FilterSection
                            title="Estatus Inscripción"
                            items={inscripcionStatusOptions}
                            filterType="estatusInscripcion"
                            isExpanded={expandedSections.estatusInscripcion}
                            onToggle={toggleSection}
                        />
                        <FilterSection
                            title="Modalidad"
                            items={modalidadOptions}
                            filterType="modalidad"
                            isExpanded={expandedSections.modalidad}
                            onToggle={toggleSection}
                            formatLabel={formatModalidadLabel}
                        />
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div className={`${styles.mainContent} ${activeTab === "seguimiento" ? styles.mainContentFull : ""}`}>
                {/* Pestañas */}
                <div className={styles.tabsContainer}>
                    <div className={styles.tabButtons}>
                        <button
                            className={`${styles.tab} ${activeTab === "cursos" ? styles.activeTab : ""}`}
                            onClick={() => setActiveTab("cursos")}
                        >
                            Cursos ({filteredCursos.length})
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "credenciales" ? styles.activeTab : ""}`}
                            onClick={() => setActiveTab("credenciales")}
                        >
                            Credenciales ({filteredCredenciales.length})
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "seguimiento" ? styles.activeTab : ""}`}
                            onClick={() => setActiveTab("seguimiento")}
                        >
                            <FontAwesomeIcon icon={faClock} className={styles.tabIcon} />
                            Mi Seguimiento
                        </button>
                    </div>
                    {activeTab !== "seguimiento" && (
                        <div className={styles.searchBarContainer}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                className={styles.searchInput}
                                value={filters.searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    )}
                </div>

                {/* Contenido de las pestañas */}
                <div className={styles.tabContent}>
                    {/* --- PASO 0: MANEJO DE ESTADOS DE CARGA Y ERROR --- */}
                    {loading && activeTab !== "seguimiento" && <div className={styles.loadingState}>Cargando...</div>}
                    {error && activeTab !== "seguimiento" && <div className={styles.errorState}>Error: {error}</div>}

                    {activeTab === "cursos" && (
                        <div className={styles.cardsGrid}>
                            {!loading && !error && (
                                <>
                                    {filteredCursos.length > 0 ? (
                                        filteredCursos.map((curso) => (
                                            <CursoCard
                                                key={curso.id_curso}
                                                curso={curso}
                                                onVerMas={handleVerMas}
                                            />
                                        ))
                                    ) : (
                                        <div className={styles.noResults}>No se encontraron cursos con los filtros seleccionados.</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "credenciales" && (
                        <div className={styles.cardsGrid}>
                            {!loading && !error && filteredCredenciales.length > 0 ? (
                                filteredCredenciales.map((credencial, index) => (
                                    <CredencialCard
                                        key={`${credencial.id_certificacion}-${index}`}
                                        credencial={credencial}
                                        onVerMas={handleVerMasCredencial}
                                    />
                                ))
                            ) : !loading && !error ? (
                                <div className={styles.noResults}>No tienes credenciales para mostrar.</div>
                            ) : null}
                        </div>
                    )}

                    {activeTab === "seguimiento" && renderSeguimientoContent()}
                </div>

                {/* Renderizamos el modal si hay un curso seleccionado */}
                {selectedCurso && (
                    <CursoModal
                        curso={selectedCurso}
                        onClose={handleCloseModal}
                        onSolicitar={handleSolicitarCurso}
                        onVerCredencial={handleVerMasCredencial}
                        inscripciones={inscripciones}
                    />
                )}

                {/* Renderizar el modal de credencial */}
                {selectedCredencial && (
                    <CredencialModal
                        credencial={selectedCredencial}
                        onClose={handleCloseCredencialModal}
                        isLoading={isModalLoading}
                        onSolicitarCurso={handleSolicitarInscripcion}
                        inscripciones={inscripciones}
                    />
                )}
            </div>
        </div>
    )
}

export default CursoYCredencialesAlumno