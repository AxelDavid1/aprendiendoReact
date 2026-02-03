'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./Inscripciones.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAddressCard, 
  faBook, 
  faClipboardList, 
  faChartBar, 
  faSyncAlt, 
  faCheck, 
  faTimes, 
  faChevronRight, 
  faSpinner,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faGraduationCap,
  faChartLine,
  faUniversity,
  faArrowUp,
  faArrowDown,
  faMinus,
  faExclamationTriangle,
  faStar,
  faLayerGroup,
  faBuilding,
  faUserTie,
  faChalkboardTeacher,
  faInfoCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

function Inscripciones({ rol, userUniversityId, teacherId }) {
  // Determinar tipo de usuario para filtros
  const isTeacher = rol === "teacher";
  const isUniversityAdmin = rol === "admin_universidad";
  const isSedeqAdmin = rol === "admin_sedeq";

  // Inicializar la pestaña activa según el rol
  const [activeTab, setActiveTab] = useState(() => {
    return isTeacher ? 'inscripciones' : 'credenciales';
  });

  const [filtros, setFiltros] = useState({
    tipo_filtro: "todos", // 'todos', 'credencial', 'sin_credencial'
    id_valor: "", // ID de la credencial o curso según tipo_filtro
    estado: "todos",
  });
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Estados para las credenciales
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState(null);
  const [expandedCredentialId, setExpandedCredentialId] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Estados para los cursos sin credencial
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [unassignedCoursesLoading, setUnassignedCoursesLoading] = useState(false);
  const [unassignedCoursesError, setUnassignedCoursesError] = useState(null);

  // Estados para las solicitudes de inscripción
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState(null);

  // Estados para los cursos del maestro
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherCoursesLoading, setTeacherCoursesLoading] = useState(false);
  const [teacherCoursesError, setTeacherCoursesError] = useState(null);

  // Nuevo estado para cursos disponibles según rol
  const [availableCoursesForFilter, setAvailableCoursesForFilter] = useState([]);

  // Estados para analisis
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('6meses');
  const [analyticsGrouping, setAnalyticsGrouping] = useState('mes');

  // Determinar qué pestañas mostrar según el rol
  const availableTabs = useMemo(() => {
    const tabs = ['inscripciones', 'analisis'];
    
    if (!isTeacher) {
      tabs.unshift('credenciales');
      tabs.splice(1, 0, 'cursos'); // Insertar 'cursos' después de 'credenciales'
    }
    
    return tabs;
  }, [isTeacher]);

  // Funcion auxiliar para obtener el token del localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // --- FETCHING DATA ---

  const fetchCredentials = useCallback(async () => {
    setCredentialsLoading(true);
    setCredentialsError(null);
    try {
      const token = getToken();
      if (!token) {
        setCredentialsError("No autorizado, no se encontro token.");
        return;
      }

      let url = "/api/credenciales";
      
      if (isTeacher && teacherId) {
        url += `?id_maestro=${teacherId}`;
      } else if (isUniversityAdmin && userUniversityId) {
        url += `?id_universidad=${userUniversityId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener las credenciales");
      }
      const data = await response.json();
      setCredentials((data.credenciales || []).map(c => ({ ...c, cursos: [], cursos_loaded: false })));
    } catch (err) {
      setCredentialsError(err.message);
      setCredentials([]);
    } finally {
      setCredentialsLoading(false);
    }
  }, [isTeacher, isUniversityAdmin, teacherId, userUniversityId]);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    
    // DEBUG: Agregar logging para diagnóstico
    console.log("🔍 fetchApplications - Filtros:", filtros);
    
    const token = getToken();
    if (!token) {
      setApplicationsError("No autorizado.");
      setApplicationsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      
      if (filtros.tipo_filtro === 'credencial' && filtros.id_valor) {
        params.append('id_credencial', filtros.id_valor);
      } else if (filtros.tipo_filtro === 'sin_credencial') {
        if (filtros.id_valor) {
          params.append('id_curso', filtros.id_valor);
        }
        params.append('sin_credencial', 'true');
      } else if (filtros.tipo_filtro === 'mis_cursos' && filtros.id_valor) {
        // CORRECCIÓN: Asegurar que se envíe el id_curso correctamente
        params.append('id_curso', filtros.id_valor);
      }
      
      if (filtros.estado !== 'todos') {
        params.append('estado', filtros.estado);
      }

      // Para inscripciones: mostrar TODAS las solicitudes a los cursos del maestro/universidad
      // sin importar la universidad del alumno (importante para convocatorias)
      if (isTeacher && teacherId) {
        params.append('id_maestro', teacherId);
      } else if (isUniversityAdmin && userUniversityId) {
        params.append('id_universidad', userUniversityId);
      }
      // NOTA: No filtramos por universidad del alumno, solo por universidad del curso

      const url = `/api/inscripciones/all?${params.toString()}`;
      console.log("🔍 fetchApplications URL:", url); // Debug

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al cargar las inscripciones.");
      
      const data = await response.json();
      console.log("🔍 fetchApplications Data:", data); // Debug
      setApplications(data.inscripciones || []);
    } catch (error) {
      console.error("🔍 fetchApplications Error:", error); // Debug
      setApplicationsError(error.message);
    } finally {
      setApplicationsLoading(false);
    }
  }, [filtros, isTeacher, teacherId, isUniversityAdmin, userUniversityId]);

  const fetchUnassignedCourses = useCallback(async () => {
    setUnassignedCoursesLoading(true);
    setUnassignedCoursesError(null);
    
    // DEBUG: Agregar logging para diagnóstico
    console.log("🔍 fetchUnassignedCourses - Parámetros:", {
      isTeacher,
      teacherId,
      isUniversityAdmin,
      userUniversityId
    });
    
    try {
      const token = getToken();
      if (!token) {
        setUnassignedCoursesError("No autorizado, no se encontro token.");
        return;
      }

      // CORRECCIÓN: No usar only_active para ver todos los cursos sin credencial
      let url = "/api/cursos?exclude_assigned=true&limit=999";
      
      if (isTeacher && teacherId) {
        url += `&id_maestro=${teacherId}`;
      } else if (isUniversityAdmin && userUniversityId) {
        url += `&id_universidad=${userUniversityId}`;
      }

      console.log("🔍 fetchUnassignedCourses URL:", url); // Debug

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener los cursos sin credencial");
      }
      const data = await response.json();
      console.log("🔍 fetchUnassignedCourses Data:", data); // Debug
      setUnassignedCourses(data.cursos || []);
    } catch (err) {
      console.error("🔍 fetchUnassignedCourses Error:", err); // Debug
      setUnassignedCoursesError(err.message);
      setUnassignedCourses([]);
    } finally {
      setUnassignedCoursesLoading(false);
    }
  }, [isTeacher, isUniversityAdmin, teacherId, userUniversityId]);

  // Cargar cursos disponibles cuando cambia el tipo de filtro
  useEffect(() => {
    const fetchAvailableCoursesForFilter = async () => {
      console.log("🔍 fetchAvailableCoursesForFilter - Tipo filtro:", filtros.tipo_filtro); // Debug
      
      if (filtros.tipo_filtro === 'sin_credencial') {
        // Usar los cursos sin credencial ya cargados
        console.log("🔍 Disponibles para filtro sin_credencial:", unassignedCourses); // Debug
        setAvailableCoursesForFilter(unassignedCourses);
      } else if (filtros.tipo_filtro === 'mis_cursos' && isTeacher) {
        // Cargar cursos del maestro
        const token = getToken();
        if (!token) return;
        
        try {
          const response = await fetch('/api/cursos/maestro', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            console.log("🔍 Cursos del maestro:", data.cursos); // Debug
            setAvailableCoursesForFilter(data.cursos || []);
          }
        } catch (error) {
          console.error('Error cargando cursos del maestro:', error);
        }
      } else {
        setAvailableCoursesForFilter([]);
      }
    };

    fetchAvailableCoursesForFilter();
  }, [filtros.tipo_filtro, unassignedCourses, isTeacher]);

  const fetchAllCourses = useCallback(async () => {
    if (isTeacher) return; // Los maestros usan fetchTeacherCourses
    
    setAllCoursesLoading(true);
    setAllCoursesError(null);
    try {
      const token = getToken();
      if (!token) {
        setAllCoursesError("No autorizado, no se encontro token.");
        return;
      }

      let url = "/api/cursos?limit=999&only_active=true";
      
      if (isUniversityAdmin && userUniversityId) {
        url += `&id_universidad=${userUniversityId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener los cursos");
      }
      const data = await response.json();
      setAllAvailableCourses(data.cursos || []);
    } catch (err) {
      setAllCoursesError(err.message);
      setAllAvailableCourses([]);
    } finally {
      setAllCoursesLoading(false);
    }
  }, [isTeacher, isUniversityAdmin, userUniversityId]);

  // Estados para todos los cursos
  const [allAvailableCourses, setAllAvailableCourses] = useState([]);
  const [allCoursesLoading, setAllCoursesLoading] = useState(true);
  const [allCoursesError, setAllCoursesError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const token = getToken();
      if (!token) {
        setAnalyticsError("No autorizado, no se encontro token.");
        return;
      }

      let url = `/api/inscripciones/analytics?periodo=${analyticsPeriod}&agrupacion=${analyticsGrouping}`;
      
      if (isTeacher && teacherId) {
        url += `&id_maestro=${teacherId}`;
      } else if (isUniversityAdmin && userUniversityId) {
        url += `&id_universidad=${userUniversityId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener los datos de analisis");
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(err.message);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsPeriod, analyticsGrouping, isTeacher, isUniversityAdmin, teacherId, userUniversityId]);

  // Asegurar que la pestaña activa siempre sea válida
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    fetchCredentials();
    if (!isTeacher) {
      fetchAllCourses();
    }
  }, [fetchCredentials, fetchAllCourses, isTeacher]);

  useEffect(() => {
    if (activeTab === 'inscripciones') {
      fetchApplications();
    } else if (activeTab === 'cursos') {
      fetchUnassignedCourses();
    } else if (activeTab === 'analisis') {
      fetchAnalytics();
    }
  }, [activeTab, fetchApplications, fetchUnassignedCourses, fetchAnalytics, filtros]);

  // --- DERIVED DATA ---

  const allCourses = useMemo(() => {
    const coursesMap = new Map();
    
    allAvailableCourses.forEach(curso => {
      if (curso && !coursesMap.has(curso.id_curso)) {
        coursesMap.set(curso.id_curso, curso);
      }
    });

    return Array.from(coursesMap.values()).sort((a, b) => a.nombre_curso.localeCompare(b.nombre_curso));
  }, [allAvailableCourses]);

  // --- HANDLERS ---

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleTabChange = (tab) => {
    // Solo cambiar a pestañas disponibles
    if (availableTabs.includes(tab)) {
      setActiveTab(tab);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFiltros(prev => {
      if (filterType === 'tipo_filtro') {
        // Al cambiar el tipo de filtro, resetear el valor
        return { ...prev, tipo_filtro: value, id_valor: "" };
      } else if (filterType === 'id_valor') {
        return { ...prev, id_valor: value };
      } else if (filterType === 'estado') {
        return { ...prev, estado: value };
      }
      return prev;
    });
  };

  const handleCredentialClick = async (credentialId) => {
    if (expandedCredentialId === credentialId) {
      setExpandedCredentialId(null);
      return;
    }

    setExpandedCredentialId(credentialId);
    const targetCredential = credentials.find(c => c.id_credencial === credentialId);

    if (targetCredential && targetCredential.cursos_loaded) {
      return;
    }

    setIsDetailLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No autorizado, no se encontro token.");
      }

      const response = await fetch(`/api/credenciales/${credentialId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("No se pudieron cargar los detalles de la credencial.");
      }
      const detailedCred = await response.json();

      setCredentials(prevCreds =>
        prevCreds.map(cred =>
          cred.id_credencial === credentialId
            ? { ...cred, cursos: detailedCred.cursos || [], cursos_loaded: true }
            : cred
        )
      );
    } catch (error) {
      console.error("Error fetching credential details:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setFiltros({
      tipo_filtro: isTeacher ? 'mis_cursos' : 'sin_credencial',
      id_valor: course.id_curso.toString(),
      estado: 'todos'
    });
    handleTabChange('inscripciones');
  };

  // Agregar nueva función para clicks en credenciales
  const handleCredentialFilterClick = (credentialId) => {
    setFiltros({
      tipo_filtro: 'credencial',
      id_valor: credentialId.toString(),
      estado: 'todos'
    });
    handleTabChange('inscripciones');
  };

  const handleShowDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus, reason = null) => {
    if (!selectedApplication) return;
    
    // Validar si el curso ya terminó
    if (selectedApplication.fecha_fin) {
      const fechaFin = new Date(selectedApplication.fecha_fin);
      const hoy = new Date();
      
      if (fechaFin < hoy) {
        showToast('No se puede modificar el estado. El curso ya ha finalizado.', 'error');
        return;
      }
    }
    
    setIsUpdating(true);

    const body = { estado: newStatus };
    if (newStatus === 'rechazada' && reason) {
      body.motivo_rechazo = reason;
    }

    const token = getToken();
    if (!token) {
      showToast('Error: Sesión expirada. Por favor, inicie sesión de nuevo.', 'error');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch(`/api/inscripciones/${selectedApplication.id_inscripcion}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el estado.');
      }

      showToast('Estado de la solicitud actualizado con éxito.', 'success');

      setShowModal(false);
      if (showRejectModal) setShowRejectModal(false);

      fetchApplications();

    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsUpdating(false);
      setSelectedApplication(null);
      if (reason) setRejectReason('');
    }
  };

  const handleApprove = () => {
    handleUpdateStatus('aprobada');
  };

  const handleReject = () => {
    setShowModal(false);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      showToast('Por favor, ingrese un motivo de rechazo.', 'error');
      return;
    }
    handleUpdateStatus('rechazada', rejectReason);
  };

  // Helper para verificar si un curso está terminado
  const isCourseFinished = (application) => {
    if (!application.fecha_fin) return false;
    const fechaFin = new Date(application.fecha_fin);
    const hoy = new Date();
    return fechaFin < hoy;
  };
  const getAbandonoIndicator = (tasa) => {
    if (tasa > 40) return { level: 'critico', icon: faExclamationTriangle, label: 'Critico' };
    if (tasa > 30) return { level: 'alto', icon: faExclamationTriangle, label: 'Alto' };
    if (tasa > 20) return { level: 'moderado', icon: faExclamationTriangle, label: 'Moderado' };
    return { level: 'bajo', icon: faCheckCircle, label: 'Normal' };
  };

  // Helper para indicador de completacion de subgrupos
  const getCompletacionIndicator = (tasa) => {
    if (tasa >= 80) return { level: 'excelente', color: '#10b981' };
    if (tasa >= 60) return { level: 'bueno', color: '#f59e0b' };
    return { level: 'bajo', color: '#ef4444' };
  };

  // Helper para indicador de desempeno institucional
  const getDesempenoIndicator = (tasa) => {
    if (tasa >= 80) return { level: 'excelente', color: '#10b981' };
    if (tasa >= 60) return { level: 'bueno', color: '#f59e0b' };
    return { level: 'bajo', color: '#ef4444' };
  };

  // --- RENDER FUNCTIONS ---

  const renderAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className={styles.analyticsLoading}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Cargando datos de analisis...</p>
        </div>
      );
    }

    if (analyticsError && !analyticsData) {
      return (
        <div className={styles.emptyState}>
          <h4>Error al cargar</h4>
          <p>{analyticsError}</p>
          <button onClick={fetchAnalytics} className={styles.emptyStateButton}>
            Intentar de nuevo
          </button>
        </div>
      );
    }

    if (!analyticsData) return null;

    const { 
      kpis, 
      tendencia_temporal, 
      cursos_mas_solicitados, 
      cursos_mayor_abandono, 
      cursos_mayor_completacion,
      subgrupos_distribucion,
      subgrupos_desempeno,
      universidades_desempeno,
      carreras_participacion,
      facultades_desempeno,
      maestro_cursos,
      maestro_calificaciones
    } = analyticsData;

    // Calcular max para grafica de lineas
    const maxTendencia = Math.max(
      ...tendencia_temporal.map(t => Math.max(t.solicitadas, t.aprobadas, t.completadas))
    );

    // Calcular max para carreras
    const maxCarreras = carreras_participacion.length > 0 ? carreras_participacion[0].solicitudes : 1;

    return (
      <div className={styles.analyticsContainer}>
        {/* Filtros de periodo */}
        <div className={styles.analyticsFilters}>
          <div className={styles.filterSection}>
            <span className={styles.filterLabel}>Rango temporal:</span>
            <div className={styles.periodButtons}>
              <button 
                className={`${styles.periodButton} ${analyticsPeriod === '1mes' ? styles.active : ''}`}
                onClick={() => setAnalyticsPeriod('1mes')}
              >
                1 Mes
              </button>
              <button 
                className={`${styles.periodButton} ${analyticsPeriod === '3meses' ? styles.active : ''}`}
                onClick={() => setAnalyticsPeriod('3meses')}
              >
                3 Meses
              </button>
              <button 
                className={`${styles.periodButton} ${analyticsPeriod === '6meses' ? styles.active : ''}`}
                onClick={() => setAnalyticsPeriod('6meses')}
              >
                6 Meses
              </button>
              <button 
                className={`${styles.periodButton} ${analyticsPeriod === '1ano' ? styles.active : ''}`}
                onClick={() => setAnalyticsPeriod('1ano')}
              >
                1 Ano
              </button>
            </div>
          </div>
          <div className={styles.filterSection}>
            <span className={styles.filterLabel}>Agrupacion:</span>
            <div className={styles.periodButtons}>
              <button 
                className={`${styles.periodButton} ${analyticsGrouping === 'semana' ? styles.active : ''}`}
                onClick={() => setAnalyticsGrouping('semana')}
              >
                Semana
              </button>
              <button 
                className={`${styles.periodButton} ${analyticsGrouping === 'mes' ? styles.active : ''}`}
                onClick={() => setAnalyticsGrouping('mes')}
              >
                Mes
              </button>
            </div>
          </div>
        </div>

        {/* SECCION 1: KPIs Principales */}
        <section className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faChartBar} />
            Metricas Principales
          </h3>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ backgroundColor: '#4f46e5' }}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Total Inscripciones</span>
                <span className={styles.kpiValue}>{kpis.total_inscripciones.toLocaleString()}</span>
                <span className={styles.kpiChange} data-positive={kpis.cambio_total >= 0}>
                  <FontAwesomeIcon icon={kpis.cambio_total >= 0 ? faArrowUp : faArrowDown} />
                  {Math.abs(kpis.cambio_total)}% vs periodo anterior
                </span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ backgroundColor: '#10b981' }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Tasa de Aprobacion</span>
                <span className={styles.kpiValue}>{kpis.tasa_aprobacion}%</span>
                <span className={styles.kpiChange} data-positive={kpis.cambio_aprobacion >= 0}>
                  <FontAwesomeIcon icon={kpis.cambio_aprobacion >= 0 ? faArrowUp : faArrowDown} />
                  {Math.abs(kpis.cambio_aprobacion)}% vs periodo anterior
                </span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Tasa de Completacion</span>
                <span className={styles.kpiValue}>{kpis.tasa_completacion}%</span>
                <span className={styles.kpiChange} data-positive={kpis.cambio_completacion >= 0}>
                  <FontAwesomeIcon icon={kpis.cambio_completacion >= 0 ? faArrowUp : faArrowDown} />
                  {Math.abs(kpis.cambio_completacion)}% vs periodo anterior
                </span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ backgroundColor: '#ef4444' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
              <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>Tasa de Abandono</span>
                <span className={styles.kpiValue}>{kpis.tasa_abandono}%</span>
                <span className={styles.kpiChange} data-positive={kpis.cambio_abandono <= 0}>
                  <FontAwesomeIcon icon={kpis.cambio_abandono <= 0 ? faArrowDown : faArrowUp} />
                  {Math.abs(kpis.cambio_abandono)}% vs periodo anterior
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECCION 2: Tendencias Temporales - Grafica de Lineas */}
        <section className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faChartLine} />
            Evolucion de Inscripciones (Ultimos 6 meses)
          </h3>
          <div className={styles.lineChartCard}>
            <div className={styles.lineChartContainer}>
              <div className={styles.lineChartYAxis}>
                {[100, 75, 50, 25, 0].map((val) => (
                  <span key={val} className={styles.yAxisLabel}>
                    {Math.round((maxTendencia * val) / 100)}
                  </span>
                ))}
              </div>
              <div className={styles.lineChartArea}>
                <svg className={styles.lineChartSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((val) => (
                    <line 
                      key={val}
                      x1="0" 
                      y1={200 - (val * 2)} 
                      x2="600" 
                      y2={200 - (val * 2)} 
                      stroke="#e5e7eb" 
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Linea Solicitadas (azul) */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={tendencia_temporal.map((t, i) => {
                      const x = (i / (tendencia_temporal.length - 1)) * 580 + 10;
                      const y = 200 - ((t.solicitadas / maxTendencia) * 180);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Linea Aprobadas (verde) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={tendencia_temporal.map((t, i) => {
                      const x = (i / (tendencia_temporal.length - 1)) * 580 + 10;
                      const y = 200 - ((t.aprobadas / maxTendencia) * 180);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Linea Completadas (morado) */}
                  <polyline
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={tendencia_temporal.map((t, i) => {
                      const x = (i / (tendencia_temporal.length - 1)) * 580 + 10;
                      const y = 200 - ((t.completadas / maxTendencia) * 180);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Puntos interactivos */}
                  {tendencia_temporal.map((t, i) => {
                    const x = (i / (tendencia_temporal.length - 1)) * 580 + 10;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={200 - ((t.solicitadas / maxTendencia) * 180)} r="5" fill="#3b82f6" />
                        <circle cx={x} cy={200 - ((t.aprobadas / maxTendencia) * 180)} r="5" fill="#10b981" />
                        <circle cx={x} cy={200 - ((t.completadas / maxTendencia) * 180)} r="5" fill="#8b5cf6" />
                      </g>
                    );
                  })}
                </svg>
                <div className={styles.lineChartXAxis}>
                  {tendencia_temporal.map((t, i) => (
                    <span key={i} className={styles.xAxisLabel}>{t.periodo}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.lineChartLegend}>
              <span><span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }} /> Solicitadas</span>
              <span><span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} /> Aprobadas</span>
              <span><span className={styles.legendDot} style={{ backgroundColor: '#8b5cf6' }} /> Completadas</span>
            </div>
            <div className={styles.chartInsight}>
              <FontAwesomeIcon icon={faChartLine} />
              <span>
                {tendencia_temporal[tendencia_temporal.length - 1]?.solicitadas > tendencia_temporal[tendencia_temporal.length - 1]?.aprobadas * 1.3 
                  ? 'El proceso de aprobacion podria estar lento - muchas solicitudes pendientes'
                  : tendencia_temporal[tendencia_temporal.length - 1]?.aprobadas > tendencia_temporal[tendencia_temporal.length - 1]?.completadas * 1.5
                  ? 'Los cursos podrian tener problemas de retencion - revisar soporte'
                  : 'El flujo de inscripciones se mantiene saludable'}
              </span>
            </div>
          </div>
        </section>

        {/* SECCION 3: Analisis de Cursos */}
        <section className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBook} />
            Analisis de Cursos
          </h3>
          
          <div className={styles.coursesAnalyticsGrid}>
            {/* 3A: Top 10 Cursos Mas Solicitados */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>
                  <FontAwesomeIcon icon={faChartBar} />
                  Top 10 Cursos Mas Solicitados
                </h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tableResponsive}>
                  <table className={styles.analyticsTable}>
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Solicitudes</th>
                        <th>Completados</th>
                        <th>Tasa Comp.</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos_mas_solicitados.map((curso, index) => (
                        <tr key={index}>
                          <td className={styles.courseName}>{curso.nombre}</td>
                          <td className={styles.numberCell}>{curso.solicitudes}</td>
                          <td className={styles.numberCell}>{curso.completados}</td>
                          <td className={styles.numberCell}>{curso.tasa_completacion}%</td>
                          <td>
                            <div className={styles.progressBarContainer}>
                              <div 
                                className={styles.progressBar}
                                style={{ 
                                  width: `${curso.tasa_completacion}%`,
                                  backgroundColor: curso.tasa_completacion >= 75 ? '#10b981' : curso.tasa_completacion >= 60 ? '#f59e0b' : '#ef4444'
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3B: Top 10 Cursos con Mayor Abandono */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Top 10 Cursos con Mayor Abandono
                </h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tableResponsive}>
                  <table className={styles.analyticsTable}>
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Inscritos</th>
                        <th>Abandonos</th>
                        <th>Tasa</th>
                        <th>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos_mayor_abandono.map((curso, index) => {
                        const indicator = getAbandonoIndicator(curso.tasa_abandono);
                        return (
                          <tr key={index}>
                            <td className={styles.courseName}>{curso.nombre}</td>
                            <td className={styles.numberCell}>{curso.inscritos}</td>
                            <td className={styles.numberCell}>{curso.abandonos}</td>
                            <td className={styles.numberCell}>{curso.tasa_abandono}%</td>
                            <td>
                              <span className={`${styles.levelBadge} ${styles[indicator.level]}`}>
                                <FontAwesomeIcon icon={indicator.icon} />
                                {indicator.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3C: Top 10 Cursos con Mayor Completacion */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>
                  <FontAwesomeIcon icon={faStar} />
                  Top 10 Cursos con Mayor Completacion
                </h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tableResponsive}>
                  <table className={styles.analyticsTable}>
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Completados</th>
                        <th>Inscritos</th>
                        <th>Tasa</th>
                        <th>Badge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos_mayor_completacion.map((curso, index) => (
                        <tr key={index}>
                          <td className={styles.courseName}>{curso.nombre}</td>
                          <td className={styles.numberCell}>{curso.completados}</td>
                          <td className={styles.numberCell}>{curso.inscritos}</td>
                          <td className={styles.numberCell}>{curso.tasa_completacion}%</td>
                          <td>
                            {curso.tasa_completacion >= 85 && (
                              <span className={styles.excellenceBadge}>
                                <FontAwesomeIcon icon={faStar} />
                                Excelente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCION 4: Analisis por Subgrupos Operadores */}
        <section className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faLayerGroup} />
            Analisis por Subgrupos Operadores (Areas de Conocimiento)
          </h3>
          
          <div className={styles.subgruposGrid}>
            {/* 4A: Distribucion por Subgrupo */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>Distribucion de Solicitudes por Area</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.donutAndTable}>
                  <div className={styles.donutContainer}>
                    <div className={styles.donutChart}>
                      {(() => {
                        const total = subgrupos_distribucion.reduce((acc, item) => acc + item.solicitudes, 0);
                        let accumulatedPercentage = 0;
                        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        const gradientStops = subgrupos_distribucion.map((item, i) => {
                          const percentage = (item.solicitudes / total) * 100;
                          const start = accumulatedPercentage;
                          accumulatedPercentage += percentage;
                          return `${colors[i % colors.length]} ${start}% ${accumulatedPercentage}%`;
                        });
                        return (
                          <div 
                            className={styles.donut}
                            style={{ 
                              background: `conic-gradient(${gradientStops.join(', ')})`
                            }}
                          >
                            <div className={styles.donutHole}>
                              <span className={styles.donutTotal}>{total}</span>
                              <span className={styles.donutLabel}>Total</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className={styles.subgruposList}>
                    {subgrupos_distribucion.map((sg, index) => {
                      const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      return (
                        <div key={index} className={styles.subgrupoItem}>
                          <span className={styles.legendDot} style={{ backgroundColor: colors[index % colors.length] }} />
                          <div className={styles.subgrupoInfo}>
                            <span className={styles.subgrupoName}>{sg.nombre}</span>
                            <span className={styles.subgrupoStats}>
                              {sg.solicitudes} ({sg.porcentaje}%)
                              <span className={styles.subgrupoChange} data-positive={sg.cambio >= 0}>
                                <FontAwesomeIcon icon={sg.cambio >= 0 ? faArrowUp : faArrowDown} />
                                {Math.abs(sg.cambio)}%
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 4B: Subgrupos con Mejor Desempeno */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>Desempeno por Area (Tasa de Completacion)</h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tableResponsive}>
                  <table className={styles.analyticsTable}>
                    <thead>
                      <tr>
                        <th>Area</th>
                        <th>Inscritos</th>
                        <th>Completados</th>
                        <th>Tasa</th>
                        <th>Indicador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subgrupos_desempeno.map((sg, index) => {
                        const indicator = getCompletacionIndicator(sg.tasa_completacion);
                        return (
                          <tr key={index}>
                            <td className={styles.courseName}>{sg.nombre}</td>
                            <td className={styles.numberCell}>{sg.inscritos}</td>
                            <td className={styles.numberCell}>{sg.completados}</td>
                            <td className={styles.numberCell}>{sg.tasa_completacion}%</td>
                            <td>
                              <span 
                                className={styles.indicatorDot} 
                                style={{ backgroundColor: indicator.color }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCION 5: Analisis Institucional */}
        <section className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUniversity} />
            Analisis Institucional
          </h3>
          
          <div className={styles.institucionalGrid}>
            {/* 5A: Desempeno por Universidad (solo admin_sedeq) */}
            {isSedeqAdmin && (
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <FontAwesomeIcon icon={faUniversity} />
                    Desempeno por Universidad
                  </h4>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.tableResponsive}>
                    <table className={styles.analyticsTable}>
                      <thead>
                        <tr>
                          <th>Universidad</th>
                          <th>Inscripciones</th>
                          <th>Aprobacion</th>
                          <th>Completacion</th>
                          <th>Indicador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {universidades_desempeno.map((uni, index) => {
                          const indicator = getDesempenoIndicator(uni.tasa_completacion);
                          return (
                            <tr key={index}>
                              <td className={styles.courseName}>{uni.nombre}</td>
                              <td className={styles.numberCell}>{uni.inscripciones}</td>
                              <td className={styles.numberCell}>{uni.tasa_aprobacion}%</td>
                              <td className={styles.numberCell}>{uni.tasa_completacion}%</td>
                              <td>
                                <span 
                                  className={styles.indicatorDot} 
                                  style={{ backgroundColor: indicator.color }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5B: Carreras con Mayor Participacion */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h4>
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Carreras con Mayor Participacion
                </h4>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.carrerasList}>
                  {carreras_participacion.map((carrera) => (
                    <div key={carrera.posicion} className={styles.carreraItem}>
                      <span className={styles.carreraPosicion}>#{carrera.posicion}</span>
                      <div className={styles.carreraInfo}>
                        <span className={styles.carreraNombre}>{carrera.nombre}</span>
                        <div className={styles.carreraBarContainer}>
                          <div 
                            className={styles.carreraBar}
                            style={{ width: `${(carrera.solicitudes / maxCarreras) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={styles.carreraSolicitudes}>{carrera.solicitudes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5C: Desempeno por Facultad (solo admin_universidad) */}
            {isUniversityAdmin && (
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <FontAwesomeIcon icon={faBuilding} />
                    Desempeno por Facultad
                  </h4>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.tableResponsive}>
                    <table className={styles.analyticsTable}>
                      <thead>
                        <tr>
                          <th>Facultad</th>
                          <th>Inscripciones</th>
                          <th>Aprobacion</th>
                          <th>Completacion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultades_desempeno.map((fac, index) => (
                          <tr key={index}>
                            <td className={styles.courseName}>{fac.nombre}</td>
                            <td className={styles.numberCell}>{fac.inscripciones}</td>
                            <td className={styles.numberCell}>{fac.tasa_aprobacion}%</td>
                            <td className={styles.numberCell}>{fac.tasa_completacion}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECCION 6: Vista Especifica para Maestro */}
        {isTeacher && (
          <section className={styles.analyticsSection}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faChalkboardTeacher} />
              Mis Cursos
            </h3>
            
            <div className={styles.maestroGrid}>
              {/* 6A: Estadisticas de Mis Cursos */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <FontAwesomeIcon icon={faClipboardList} />
                    Estadisticas de Mis Cursos
                  </h4>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.tableResponsive}>
                    <table className={styles.analyticsTable}>
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Inscritos</th>
                          <th>Aprobados</th>
                          <th>Completados</th>
                          <th>Abandonados</th>
                          <th>Tasa Comp.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maestro_cursos.map((curso, index) => (
                          <tr key={index}>
                            <td className={styles.courseName}>{curso.nombre}</td>
                            <td className={styles.numberCell}>{curso.inscritos}</td>
                            <td className={styles.numberCell}>{curso.aprobados}</td>
                            <td className={styles.numberCell}>{curso.completados}</td>
                            <td className={styles.numberCell}>{curso.abandonados}</td>
                            <td className={styles.numberCell}>{curso.tasa_completacion}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 6B: Calificaciones Promedio de Mis Cursos */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader}>
                  <h4>
                    <FontAwesomeIcon icon={faStar} />
                    Calificaciones Promedio de Mis Cursos
                  </h4>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.calificacionesList}>
                    {maestro_calificaciones.map((curso, index) => (
                      <div key={index} className={styles.calificacionItem}>
                        <div className={styles.calificacionInfo}>
                          <span className={styles.calificacionCurso}>{curso.curso}</span>
                          <span className={styles.calificacionEvaluaciones}>
                            {curso.evaluaciones} evaluaciones
                          </span>
                        </div>
                        <div className={styles.calificacionBarContainer}>
                          <div 
                            className={styles.calificacionBar}
                            style={{ 
                              width: `${(curso.calificacion_promedio / 10) * 100}%`,
                              backgroundColor: curso.calificacion_promedio >= 8.5 ? '#10b981' : curso.calificacion_promedio >= 7 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className={styles.calificacionValor}>{curso.calificacion_promedio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'credenciales':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Credenciales</h2>
              <p>Haga clic en una credencial para ver sus cursos y gestionar inscripciones.</p>
            </div>
            <div className={styles.contentArea}>
              {credentialsLoading ? (
                <div className={styles.loading}>
                  <FontAwesomeIcon icon={faSpinner} spin /> Cargando credenciales...
                </div>
              ) : credentialsError ? (
                <div className={styles.emptyState}>
                  <h4>Error al cargar</h4>
                  <p>{credentialsError}</p>
                  <button onClick={fetchCredentials} className={styles.emptyStateButton}>
                    Intentar de nuevo
                  </button>
                </div>
              ) : credentials.length === 0 ? (
                <div className={styles.emptyState}>
                  <h4>No se encontraron credenciales</h4>
                  <p>Aun no se han creado credenciales en el sistema.</p>
                </div>
              ) : (
                <div className={styles.credentialsGrid}>
                  {credentials.map(cred => (
                    <div key={cred.id_credencial} className={styles.credentialCard}>
                      <div className={styles.credentialHeader} onClick={() => handleCredentialClick(cred.id_credencial)}>
                        <div className={styles.credentialHeaderContent}>
                          <h3>{cred.nombre_credencial}</h3>
                          <span>{cred.nombre_universidad}</span>
                        </div>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className={`${styles.chevronIcon} ${expandedCredentialId === cred.id_credencial ? styles.expanded : ''}`}
                        />
                      </div>
                      
                      <div className={styles.credentialActions}>
                        <button 
                          className={styles.filterButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCredentialFilterClick(cred.id_credencial);
                          }}
                          title="Filtrar inscripciones por esta credencial"
                        >
                          <FontAwesomeIcon icon={faFilter} /> Filtrar Inscripciones
                        </button>
                      </div>

                      {expandedCredentialId === cred.id_credencial && (
                        <div className={styles.courseListContainer}>
                          {isDetailLoading && !cred.cursos_loaded ? (
                            <div className={styles.detailLoading}>
                              <FontAwesomeIcon icon={faSpinner} spin /> Cargando cursos...
                            </div>
                          ) : (
                            <ul className={styles.courseList}>
                              {cred.cursos && cred.cursos.length > 0 ? (
                                cred.cursos
                                  .filter(curso => curso)
                                  .map(curso => (
                                    <li key={curso.id_curso} onClick={() => handleCourseClick(curso)} className={styles.courseItem}>
                                      <span>{curso.nombre_curso}</span>
                                      <FontAwesomeIcon icon={faChevronRight} />
                                    </li>
                                  ))
                              ) : (
                                <li className={`${styles.courseItem} ${styles.noCourses}`}>No hay cursos en esta credencial.</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'cursos':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Cursos sin Credencial</h2>
              <p>Lista de cursos que no estan asociados a ninguna credencial. Haga clic para ver sus inscripciones.</p>
            </div>
            <div className={styles.contentArea}>
              {unassignedCoursesLoading ? (
                <div className={styles.loading}>
                  <FontAwesomeIcon icon={faSpinner} spin /> Cargando cursos...
                </div>
              ) : unassignedCoursesError ? (
                <div className={styles.emptyState}>
                  <h4>Error al cargar</h4>
                  <p>{unassignedCoursesError}</p>
                  <button onClick={fetchUnassignedCourses} className={styles.emptyStateButton}>
                    Intentar de nuevo
                  </button>
                </div>
              ) : unassignedCourses.length === 0 ? (
                <div className={styles.emptyState}>
                  <h4>No hay cursos sin credencial</h4>
                  <p>Todos los cursos disponibles en el sistema estan asignados a una credencial.</p>
                </div>
              ) : (
                <ul className={styles.unassignedCourseList}>
                  {unassignedCourses.map(curso => (
                    <li key={curso.id_curso} onClick={() => handleCourseClick(curso)} className={styles.unassignedCourseItem}>
                      <div className={styles.unassignedCourseInfo}>
                        <span className={styles.unassignedCourseName}>{curso.nombre_curso}</span>
                        <span className={styles.unassignedCourseUniversity}>{curso.nombre_universidad}</span>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'inscripciones':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Panel de Inscripciones</h2>
              <p>Gestione las solicitudes de inscripcion de los alumnos</p>
            </div>

            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label>Tipo de Filtro</label>
                <select
                  value={filtros.tipo_filtro}
                  onChange={(e) => handleFilterChange('tipo_filtro', e.target.value)}
                >
                  <option value="todos">Todas las Inscripciones</option>
                  {isTeacher && <option value="mis_cursos">Mis Cursos</option>}
                  {!isTeacher && <option value="credencial">Por Credencial</option>}
                  {!isTeacher && <option value="sin_credencial">Cursos sin Credencial</option>}
                </select>
              </div>

              {filtros.tipo_filtro === 'credencial' && (
                <div className={styles.filterGroup}>
                  <label>Seleccionar Credencial</label>
                  <select
                    value={filtros.id_valor}
                    onChange={(e) => handleFilterChange('id_valor', e.target.value)}
                  >
                    <option value="">Todas las Credenciales</option>
                    {credentials.map(cred => (
                      <option key={cred.id_credencial} value={cred.id_credencial}>
                        {cred.nombre_credencial}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(filtros.tipo_filtro === 'sin_credencial' || filtros.tipo_filtro === 'mis_cursos') && (
                <div className={styles.filterGroup}>
                  <label>Seleccionar Curso</label>
                  <select
                    value={filtros.id_valor}
                    onChange={(e) => handleFilterChange('id_valor', e.target.value)}
                  >
                    <option value="">
                      {filtros.tipo_filtro === 'sin_credencial' 
                        ? 'Todos los Cursos sin Credencial' 
                        : 'Todos Mis Cursos'}
                    </option>
                    {availableCoursesForFilter.map(curso => (
                      <option key={curso.id_curso} value={curso.id_curso}>
                        {curso.nombre_curso}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.filterGroup}>
                <label>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="solicitada">Solicitada</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="completada">Completada</option>
                  <option value="abandonada">Abandonada</option>
                </select>
              </div>

              <button 
                className={styles.clearFiltersButton}
                onClick={() => setFiltros({ tipo_filtro: 'todos', id_valor: '', estado: 'todos' })}
              >
                Limpiar Filtros
              </button>

              {((!isTeacher && filtros.tipo_filtro !== 'todos') || filtros.id_valor !== '' || filtros.estado !== 'todos') && (
                <div className={styles.activeFiltersIndicator}>
                  <span>Filtros activos:</span>
                  {isTeacher && filtros.tipo_filtro === 'mis_cursos' && filtros.id_valor !== '' && <span>Curso específico</span>}
                  {!isTeacher && filtros.tipo_filtro === 'credencial' && <span>Credencial</span>}
                  {!isTeacher && filtros.tipo_filtro === 'sin_credencial' && <span>Sin Credencial</span>}
                  {filtros.estado !== 'todos' && <span>{filtros.estado}</span>}
                </div>
              )}
            </div>

            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h3>Solicitudes de Inscripcion</h3>
                <button className={styles.updateButton} onClick={fetchApplications} disabled={applicationsLoading}>
                  <FontAwesomeIcon icon={faSyncAlt} className={applicationsLoading ? styles.spinning : ''} /> Actualizar
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Curso</th>
                      <th>Fecha de Solicitud</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsLoading ? (
                      <tr>
                        <td colSpan="5" className={styles.loading}>
                          <FontAwesomeIcon icon={faSpinner} spin /> Cargando inscripciones...
                        </td>
                      </tr>
                    ) : applicationsError ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h4>Error al cargar</h4>
                            <p>{applicationsError}</p>
                          </div>
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h4>No hay solicitudes de inscripcion</h4>
                            <p>No se encontraron solicitudes con los filtros seleccionados.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id_inscripcion}>
                          <td>{app.nombre_alumno}</td>
                          <td>{app.nombre_curso}</td>
                          <td>{new Date(app.fecha_solicitud).toLocaleDateString()}</td>
                          <td><span className={`${styles.status} ${styles[app.estado]}`}>{app.estado}</span></td>
                          <td>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleShowDetails(app)}
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'analisis':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderTop}>
                <div>
                  <h2>Analisis de Inscripciones</h2>
                  <p>Dashboard con metricas y estadisticas para la toma de decisiones</p>
                </div>
                <button className={styles.updateButton} onClick={fetchAnalytics} disabled={analyticsLoading}>
                  <FontAwesomeIcon icon={faSyncAlt} className={analyticsLoading ? styles.spinning : ''} /> Actualizar
                </button>
              </div>
            </div>
            <div className={styles.contentArea}>
              {renderAnalytics()}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Inscripciones</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <nav className={styles.sidebar}>
            {availableTabs.includes('credenciales') && (
              <button
                className={`${styles.sidebarButton} ${activeTab === 'credenciales' ? styles.active : ''}`}
                onClick={() => handleTabChange('credenciales')}
                title="Credenciales"
              >
                <FontAwesomeIcon icon={faAddressCard} />
                <span className={styles.sidebarLabel}>Credenciales</span>
              </button>
            )}

            {availableTabs.includes('cursos') && (
              <button
                className={`${styles.sidebarButton} ${activeTab === 'cursos' ? styles.active : ''}`}
                onClick={() => handleTabChange('cursos')}
                title="Cursos sin Credencial"
              >
                <FontAwesomeIcon icon={faBook} />
                <span className={styles.sidebarLabel}>Cursos sin Credencial</span>
              </button>
            )}

            <button
              className={`${styles.sidebarButton} ${activeTab === 'inscripciones' ? styles.active : ''}`}
              onClick={() => handleTabChange('inscripciones')}
              title="Panel de Inscripciones"
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span className={styles.sidebarLabel}>Panel de Inscripciones</span>
            </button>

            <button
              className={`${styles.sidebarButton} ${activeTab === 'analisis' ? styles.active : ''}`}
              onClick={() => handleTabChange('analisis')}
              title="Análisis"
            >
              <FontAwesomeIcon icon={faChartBar} />
              <span className={styles.sidebarLabel}>Análisis</span>
            </button>
          </nav>

          <div className={styles.content}>
            {renderContent()}
          </div>
        </div>
      </main>

      {showModal && selectedApplication && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Detalles de la Solicitud</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailSection}>
                  <h4>Información del Alumno</h4>
                  <p><strong>Nombre:</strong> {selectedApplication.nombre_alumno}</p>
                  <p><strong>Email:</strong> {selectedApplication.email_alumno}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Información del Curso</h4>
                  <p><strong>Curso:</strong> {selectedApplication.nombre_curso}</p>
                  <p><strong>Credencial:</strong> {selectedApplication.nombre_credencial || 'N/A'}</p>
                  {selectedApplication.fecha_fin && (
                    <p>
                      <strong>Fecha Fin:</strong> {new Date(selectedApplication.fecha_fin).toLocaleDateString()}
                      {isCourseFinished(selectedApplication) && (
                        <span style={{ color: '#ef4444', marginLeft: '10px', fontWeight: 'bold' }}>
                          (Curso finalizado)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className={styles.detailSection}>
                  <h4>Estado de la Solicitud</h4>
                  <p><strong>Fecha:</strong> {new Date(selectedApplication.fecha_solicitud).toLocaleString()}</p>
                  <p><strong>Estado:</strong> <span className={`${styles.status} ${styles[selectedApplication.estado]}`}>{selectedApplication.estado}</span></p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <h4>Actualizar Estado</h4>
                {isCourseFinished(selectedApplication) ? (
                  <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px',
                    color: '#dc2626',
                    textAlign: 'center'
                  }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                    Este curso ya ha finalizado. No se puede modificar el estado de la inscripción.
                  </div>
                ) : (
                  <div className={`${styles.actionButtons} ${styles.centeredActions}`} >
                    <button
                      className={styles.approveButton}
                      onClick={handleApprove}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />} Aprobar
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={handleReject}
                      disabled={isUpdating}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Motivo del rechazo</h3>
            </div>

            <div className={styles.modalContent}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Por favor, proporcione un motivo para el rechazo."
                className={styles.textarea}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowModal(true);
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmButton}
                onClick={confirmReject}
                disabled={isUpdating}
              >
                {isUpdating ? 'Confirmando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type] || 'success'}`}>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inscripciones;
