"use client"
import { useState } from "react"
import styles from "./SEDEQDashboard.module.css"
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
import ImpactAnalytics from "../modules/ImpactAnalytics"
function SEDEQDashboard({ userId }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState("welcome")
  const [expandedCategories, setExpandedCategories] = useState({
    institucional: true,
    educativo: false,
    academica: false,
    certificacion: false,
    eventos: false,
  })
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }
  const menuStructure = [
    {
      id: "institucional",
      label: "Configuración Institucional",
      icon: "🏫",
      modules: [
        { id: "universidades", label: "Universidades", icon: "🎓" },
        { id: "carreras", label: "Carreras", icon: "📖" },
        { id: "maestros", label: "Maestros", icon: "👨‍🏫" },
        { id: "dominios", label: "Dominios", icon: "🌐" },
      ],
    },
    {
      id: "educativo",
      label: "Contenido Educativo",
      icon: "📚",
      modules: [
        { id: "areas", label: "Subgrupo y Habilidades Clave", icon: "🗂️" },
        { id: "cursos", label: "Gestión de Cursos", icon: "📝" },
        { id: "credenciales", label: "Credenciales de Cursos", icon: "🎖️" },
      ],
    },
    {
      id: "academica",
      label: "Gestión Académica",
      icon: "📊",
      modules: [
        { id: "calificaciones", label: "Calificaciones", icon: "✍️" },
        { id: "inscripciones", label: "Inscripciones", icon: "📋" },
        { id: "impacto", label: "Impacto en Empleabilidad", icon: "📊" },
      ],
    },
    {
      id: "certificacion",
      label: "Certificación",
      icon: "🏅",
      modules: [{ id: "certificados", label: "Certificados y Constancias", icon: "📜" }],
    },
    {
      id: "eventos",
      label: "Eventos y Colaboraciones",
      icon: "📅",
      modules: [{ id: "convocatorias", label: "Convocatorias", icon: "📢" }],
    },
  ]
  const renderModuleContent = () => {
    switch (activeModule) {
      case "universidades":
        return (
          <div className={styles.moduleContainer}>
            <ManejoUniversidades dashboardType="sedeq" canEdit={true} />
          </div>
        )
      case "carreras":
        return (
          <div className={styles.moduleContainer}>
            <CarrerasUniversidades userId={userId} canEdit={true} />
          </div>
        )
      case "maestros":
        return (
          <div className={styles.moduleContainer}>
            <GestionMaestros userId={userId} canEdit={true} />
          </div>
        )
      case "dominios":
        return (
          <div className={styles.moduleContainer}>
            <Dominios />
          </div>
        )
      case "areas":
        return (
          <div className={styles.moduleContainer}>
            <SubgruposYHabilidades />
          </div>
        )
      case "cursos":
        return (
          <div className={styles.moduleContainer}>
            <GestionCursos userId={userId} canEdit={true} />
          </div>
        )
      case "credenciales":
        return (
          <div className={styles.moduleContainer}>
            <CredencialesCursos userId={userId} canEdit={true} dashboardType="sedeq" />
          </div>
        )
      case "calificaciones":
        return (
          <div className={styles.moduleContainer}>
            <CalificacionCurso rol="sedeq" />
          </div>
        )
      case "inscripciones":
        return (
          <div className={styles.moduleContainer}>
            <Inscripciones 
              rol="admin_sedeq"
              userId={userId} 
              canEdit={true} 
            />
          </div>
        )
      case "impacto":
        return (
          <div className={styles.moduleContainer}>
            <ImpactAnalytics dashboardType="sedeq" />
          </div>
        )
      case "certificados":
        return (
          <div className={styles.moduleContainer}>
            <CertificadosYConstancia rol="sedeq" />
          </div>
        )
      case "convocatorias":
        return (
          <div className={styles.moduleContainer}>
            <Convocatorias />
          </div>
        )
      default:
        return (
          <div className={styles.welcomeContainer}>
            <h1>Bienvenido al Dashboard SEDEQ</h1>
            <p>Selecciona un módulo del menú lateral para comenzar.</p>
            <div className={styles.statsGrid}>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("universidades");
                  if (!expandedCategories.institucional) toggleCategory("institucional");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>🏫</span>
                <h3>Configuración Institucional</h3>
                <p>Gestiona universidades, carreras, maestros y dominios</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("areas");
                  if (!expandedCategories.educativo) toggleCategory("educativo");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📚</span>
                <h3>Contenido Educativo</h3>
                <p>Administra áreas, cursos y credenciales</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("calificaciones");
                  if (!expandedCategories.academica) toggleCategory("academica");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📊</span>
                <h3>Gestión Académica</h3>
                <p>Supervisa calificaciones e inscripciones</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("certificados");
                  if (!expandedCategories.certificacion) toggleCategory("certificacion");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>🏅</span>
                <h3>Certificación</h3>
                <p>Emite certificados y constancias</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("convocatorias");
                  if (!expandedCategories.eventos) toggleCategory("eventos");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📅</span>
                <h3>Eventos y Colaboraciones</h3>
                <p>Gestiona convocatorias entre universidades</p>
              </div>
            </div>
          </div>
        )
    }
  }
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>{!sidebarCollapsed && "SEDEQ Admin"}</h2>
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
                {!sidebarCollapsed && (
                  <>
                    <span className={styles.categoryLabel}>{category.label}</span>
                    <span className={styles.expandIcon}>{expandedCategories[category.id] ? "▼" : "▶"}</span>
                  </>
                )}
              </button>
              {expandedCategories[category.id] && (
                <div className={styles.moduleList}>
                  {category.modules.map((module) => (
                    <button
                      key={module.id}
                      className={`${styles.moduleButton} ${activeModule === module.id ? styles.active : ""}`}
                      onClick={() => setActiveModule(module.id)}
                    >
                      <span className={styles.moduleIcon}>{module.icon}</span>
                      {!sidebarCollapsed && <span className={styles.moduleLabel}>{module.label}</span>}
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
export default SEDEQDashboard