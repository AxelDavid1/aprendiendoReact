"use client"
import { useState, useEffect } from "react"
import styles from "./TeacherDashboard.module.css"
import GestionCursos from "../modules/GestionCursos"
import Inscripciones from "../modules/Inscripciones"
import CalificacionCurso from "../modules/CalificacionCurso"

function TeacherDashboard({ userId }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState("welcome")
  const [userUniversityId, setUserUniversityId] = useState(null)
  const [teacherId, setTeacherId] = useState(null)
  const [teacherName, setTeacherName] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({
    educativo: true,
    academica: false,
  })

  // Obtener el id_universidad y id del maestro actual
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (userId) {
        try {
          const token = localStorage.getItem("token");
          
          if (!token) {
            console.error("No hay token en localStorage");
            setLoading(false);
            return;
          }

          // Obtener información completa del usuario desde el backend usando el token
          const response = await fetch("/api/auth/me", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (response.ok) {
            const userData = await response.json();
            
            // Guardar información completa en localStorage
            localStorage.setItem("user", JSON.stringify(userData));
            
            setUserUniversityId(userData.id_universidad?.toString() || null);
            setTeacherId(userData.id_maestro?.toString() || userId.toString());
            setTeacherName(userData.username || userData.nombre || "Maestro");
          } else {
            console.error("Error al obtener datos del usuario:", response.status);
            // Como fallback, usar lo que haya en localStorage
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const user = JSON.parse(userStr);
              setUserUniversityId(user.id_universidad?.toString() || null);
              setTeacherId(user.id_maestro?.toString() || userId.toString());
              setTeacherName(user.username || user.nombre || "Maestro");
            }
          }
        } catch (error) {
          console.error("Error al obtener información del maestro:", error);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchTeacherInfo();
  }, [userId]);

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

  // Estructura del menú - Solo los módulos a los que el maestro tiene acceso
  const menuStructure = [
    {
      id: "educativo",
      label: "Mis Cursos",
      icon: "📚",
      modules: [
        { id: "cursos", label: "Gestión de Cursos", icon: "📝" },
      ],
    },
    {
      id: "academica",
      label: "Gestión Académica",
      icon: "📊",
      modules: [
        { id: "calificaciones", label: "Calificaciones", icon: "✍️" },
        { id: "inscripciones", label: "Solicitudes de Inscripción", icon: "📋" },
      ],
    },
  ]

  const renderModuleContent = () => {
    // Si aún está cargando la información del usuario
    if (loading) {
      return (
        <div className={styles.welcomeContainer}>
          <p>Cargando información del maestro...</p>
        </div>
      )
    }

    // Si no se pudo obtener el id de universidad o maestro
    if ((!userUniversityId || !teacherId) && activeModule !== "welcome") {
      return (
        <div className={styles.welcomeContainer}>
          <h1>Error de Configuración</h1>
          <p>No se pudo determinar tu información. Contacta al administrador.</p>
        </div>
      )
    }

    switch (activeModule) {
      case "cursos":
        // Maestro: Solo cursos de su universidad que él imparte
        return (
          <div className={styles.moduleContainer}>
            <GestionCursos 
              userId={userId} 
              canEdit={true}
              dashboardType="teacher"
              userUniversityId={userUniversityId}
              teacherId={teacherId}
              // Restricción: Solo ver/editar cursos de su universidad que él imparte
              // No puede crear nuevos cursos
              // No puede ver cursos de otros maestros
            />
          </div>
        )
      case "calificaciones":
        // Maestro: Solo calificar cursos que él imparte
        return (
          <div className={styles.moduleContainer}>
            <CalificacionCurso 
              rol="teacher"
              userUniversityId={userUniversityId}
              teacherId={teacherId}
              // Restricción: Solo ver cursos vigentes de su universidad que él imparte
              // Solo puede calificar alumnos inscritos en sus cursos
            />
          </div>
        )
      case "inscripciones":
        // Maestro: Solo aprobar inscripciones de sus cursos
        return (
          <div className={styles.moduleContainer}>
            <Inscripciones 
              rol="teacher"
              userId={userId} 
              canEdit={true}
              userUniversityId={userUniversityId}
              teacherId={teacherId}
              // Restricción: Solo puede aprobar/rechazar solicitudes de inscripción
              // Solo de cursos de su universidad que él imparte
              // No puede ver inscripciones de otros cursos
            />
          </div>
        )
      default:
        return (
          <div className={styles.welcomeContainer}>
            <h1>Bienvenido, {teacherName}</h1>
            <p>Panel de Control del Maestro</p>
            <div className={styles.statsGrid}>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("cursos")
                  if (!expandedCategories.educativo) toggleCategory("educativo")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📚</span>
                <h3>Mis Cursos</h3>
                <p>Visualiza y gestiona los cursos que impartes</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("calificaciones")
                  if (!expandedCategories.academica) toggleCategory("academica")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>✍️</span>
                <h3>Calificaciones</h3>
                <p>Califica a los alumnos inscritos en tus cursos</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("inscripciones")
                  if (!expandedCategories.academica) toggleCategory("academica")
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📋</span>
                <h3>Solicitudes de Inscripción</h3>
                <p>Aprueba o rechaza las solicitudes a tus cursos</p>
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
        <h1 className={styles.mobileTitle}>Panel Maestro</h1>
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
          <h2 className={styles.sidebarTitle}>{!sidebarCollapsed && "Panel Maestro"}</h2>
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

export default TeacherDashboard
