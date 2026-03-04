"use client"
import { useState, useEffect } from "react"
import styles from "./UniversityDashboard.module.css"
import ManejoUniversidades from "../modules/ManejoUniversidades"
import CarrerasUniversidades from "../modules/CarrerasUniversidades"
import GestionMaestros from "../modules/GestionMaestros"
import GestionCursos from "../modules/GestionCursos"
import SubgruposYHabilidades from "../modules/SubgruposYHabilidades"
import CredencialesCursos from "../modules/CredencialesCursos"
import Inscripciones from "../modules/Inscripciones"
import Dominios from "../modules/Dominios"
import Convocatorias from "../modules/Convocatorias"
import CalificacionCurso from "../modules/CalificacionCurso"
import CertificadosYConstancia from "../modules/CertificadosYConstancias"


const API_URL_USERS = "/api/users"

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Función para hacer llamadas autenticadas
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};
function UniversityDashboard({ userId }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState("welcome")
  const [userUniversityId, setUserUniversityId] = useState(null)
  const [universityName, setUniversityName] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({
    institucional: true,
    educativo: false,
    academica: false,
    certificacion: false,
    eventos: false,
  })

  // Obtener el id_universidad del usuario actual
  useEffect(() => {
    const fetchUserUniversity = async () => {
      if (userId) {
        try {
          const response = await authenticatedFetch(`/api/usuarios/${userId}`)
          if (response.ok) {
            const userData = await response.json()
            if (userData && userData.id_universidad) {
              setUserUniversityId(userData.id_universidad.toString())
              setUniversityName(userData.nombre_universidad || "Mi Universidad")
            }
          }
        } catch (error) {
          console.error("Error fetching user university ID:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchUserUniversity()
  }, [userId])

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId)
    setIsMobileMenuOpen(false) // Close menu on mobile after selection
  }

  // Estructura del menú - mismos módulos que SEDEQ pero con restricciones internas
  const menuStructure = [
    {
      id: "institucional",
      label: "Configuración Institucional",
      icon: "🏫",
      modules: [
        { id: "universidades", label: "Mi Universidad", icon: "🎓" }, // Solo puede editar su universidad
        { id: "carreras", label: "Carreras", icon: "📖" }, // Solo facultades/carreras de su universidad
        { id: "maestros", label: "Maestros", icon: "👨‍🏫" }, // Solo maestros de su universidad
        { id: "dominios", label: "Dominios", icon: "🌐" }, // Solo dominios de su universidad
      ],
    },
    {
      id: "educativo",
      label: "Contenido Educativo",
      icon: "📚",
      modules: [
        { id: "areas", label: "Subgrupo y Habilidades Clave", icon: "🗂️" }, // Mismo acceso (clasificación general)
        { id: "cursos", label: "Gestión de Cursos", icon: "📝" }, // Solo cursos de su universidad
        { id: "credenciales", label: "Credenciales de Cursos", icon: "🎖️" }, // Solo credenciales de su universidad
      ],
    },
    {
      id: "academica",
      label: "Gestión Académica",
      icon: "📊",
      modules: [
        { id: "calificaciones", label: "Calificaciones", icon: "✍️" }, // Solo cursos vigentes de su universidad
        { id: "inscripciones", label: "Inscripciones", icon: "📋" }, // Solo inscripciones de alumnos de su universidad

      ],
    },
    {
      id: "certificacion",
      label: "Certificación",
      icon: "🏅",
      modules: [
        { id: "certificados", label: "Certificados y Constancias", icon: "📜" }, // Solo firmas de coordinador/universidad de su universidad
      ],
    },
    {
      id: "eventos",
      label: "Eventos y Colaboraciones",
      icon: "📅",
      modules: [
        { id: "convocatorias", label: "Convocatorias", icon: "📢" }, // Solo editar convocatorias donde participa (limitado)
      ],
    },
  ]

  const renderModuleContent = () => {
    // Si aún está cargando la información del usuario
    if (loading) {
      return (
        <div className={styles.welcomeContainer}>
          <p>Cargando información de la universidad...</p>
        </div>
      )
    }

    // Si no se pudo obtener el id de universidad
    if (!userUniversityId && activeModule !== "welcome") {
      return (
        <div className={styles.welcomeContainer}>
          <h1>Error de Configuración</h1>
          <p>No se pudo determinar tu universidad. Contacta al administrador.</p>
        </div>
      )
    }

    switch (activeModule) {
      case "universidades":
        // admin_universidad: Solo puede editar su propia universidad
        return (
          <div className={styles.moduleContainer}>
            <ManejoUniversidades 
              userId={userId} 
              canEdit={true}
              dashboardType="university"
              userUniversityId={userUniversityId}
            />
          </div>
        )
      case "carreras":
        // admin_universidad: Solo facultades y carreras de su universidad
        return (
          <div className={styles.moduleContainer}>
            <CarrerasUniversidades 
              userId={userId} 
              canEdit={true}
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Filtrar por universidad del usuario
            />
          </div>
        )
      case "maestros":
        // admin_universidad: Solo maestros de su universidad
        return (
          <div className={styles.moduleContainer}>
            <GestionMaestros 
              userId={userId} 
              canEdit={true}
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo dar de alta/editar maestros de su universidad
            />
          </div>
        )
      case "dominios":
        // admin_universidad: Solo dominios de su universidad
        return (
          <div className={styles.moduleContainer}>
            <Dominios 
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo ver/editar dominios de su universidad
            />
          </div>
        )
      case "areas":
        // admin_universidad: Acceso general (clasificación para todos)
        return (
          <div className={styles.moduleContainer}>
            <SubgruposYHabilidades 
              dashboardType="university"
              // Sin restricción: Subgrupos y habilidades son generales
            />
          </div>
        )
      case "cursos":
        // admin_universidad: Solo cursos de su universidad
        return (
          <div className={styles.moduleContainer}>
            <GestionCursos 
              userId={userId} 
              canEdit={true}
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo crear/editar cursos de su universidad
            />
          </div>
        )
      case "credenciales":
        // admin_universidad: Solo credenciales de su universidad
        return (
          <div className={styles.moduleContainer}>
            <CredencialesCursos 
              userId={userId} 
              canEdit={true}
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo crear credenciales con cursos de su universidad
            />
          </div>
        )
      case "calificaciones":
        // admin_universidad: Solo calificar cursos vigentes de su universidad
        return (
          <div className={styles.moduleContainer}>
            <CalificacionCurso 
              rol="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo ver cursos vigentes de su universidad
            />
          </div>
        )
      case "inscripciones":
        // admin_universidad: Solo inscripciones de alumnos de su universidad
        return (
          <div className={styles.moduleContainer}>
            <Inscripciones 
              rol="admin_universidad"
              userId={userId} 
              canEdit={true}
              userUniversityId={userUniversityId}
              // Restricción: Solo aceptar/rechazar inscripciones de su universidad
            />
          </div>
        )
      case "certificados":
        // admin_universidad: Solo firmas de coordinador/universidad de su universidad (no SEDEQ)
        return (
          <div className={styles.moduleContainer}>
            <CertificadosYConstancia 
              rol="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo subir firma coordinador/universidad de su universidad
              // No puede subir firma SEDEQ
            />
          </div>
        )
      case "convocatorias":
        // admin_universidad: Solo editar convocatorias donde participa (limitado)
        return (
          <div className={styles.moduleContainer}>
            <Convocatorias 
              dashboardType="university"
              userUniversityId={userUniversityId}
              // Restricción: Solo editar convocatorias donde participa
              // Solo puede editar: capacidad, periodo de aviso, periodo de revisión
              // NO puede editar: periodo de ejecución
            />
          </div>
        )
      default:
        return (
          <div className={styles.welcomeContainer}>
            <h1>Bienvenido al Dashboard Universitario</h1>
            <p>{universityName ? `Universidad: ${universityName}` : "Selecciona un módulo del menú lateral para comenzar."}</p>
            <div className={styles.statsGrid}>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("universidades")
                  if (!expandedCategories.institucional) toggleCategory("institucional")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>🏫</span>
                <h3>Configuración Institucional</h3>
                <p>Gestiona tu universidad, carreras, maestros y dominios</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("areas")
                  if (!expandedCategories.educativo) toggleCategory("educativo")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📚</span>
                <h3>Contenido Educativo</h3>
                <p>Administra cursos y credenciales de tu universidad</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("calificaciones")
                  if (!expandedCategories.academica) toggleCategory("academica")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📊</span>
                <h3>Gestión Académica</h3>
                <p>Califica cursos y gestiona inscripciones</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("certificados")
                  if (!expandedCategories.certificacion) toggleCategory("certificacion")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>🏅</span>
                <h3>Certificación</h3>
                <p>Gestiona firmas y certificados de tu universidad</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("convocatorias")
                  if (!expandedCategories.eventos) toggleCategory("eventos")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📅</span>
                <h3>Eventos y Colaboraciones</h3>
                <p>Participa en convocatorias entre universidades</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Header Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isMobileMenuOpen ? styles.visible : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <h1 className={styles.mobileTitle}>Universidad Admin</h1>
        <button 
          className={styles.hamburgerBtn}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${isMobileMenuOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>{!sidebarCollapsed && "Universidad Admin"}</h2>
          <button
            className={styles.toggleButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {menuStructure.map((category) => (
            <div key={category.id} className={styles.categoryGroup}>
              <button
                className={styles.categoryButton}
                onClick={() => toggleCategory(category.id)}
                aria-expanded={expandedCategories[category.id]}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryLabel}>{category.label}</span>
                <span className={styles.expandIcon}>{expandedCategories[category.id] ? "▼" : "▶"}</span>
              </button>
              {expandedCategories[category.id] && (
                <div className={styles.moduleList}>
                  {category.modules.map((module) => (
                    <button
                      key={module.id}
                      className={`${styles.moduleButton} ${activeModule === module.id ? styles.active : ""}`}
                      onClick={() => handleModuleClick(module.id)}
                    >
                      <span className={styles.moduleIcon}>{module.icon}</span>
                      <span className={styles.moduleLabel}>{module.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>{renderModuleContent()}</main>
    </div>
  )
}

export default UniversityDashboard
