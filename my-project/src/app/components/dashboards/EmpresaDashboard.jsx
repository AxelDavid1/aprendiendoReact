"use client"
import { useState, useEffect } from "react"
import styles from "./EmpresaDashboard.module.css"
import TalentSearch from "../modules/TalentSearch"
import RecruitmentFunnel from "../modules/RecruitmentFunnel"
import CompanyProfile from "../modules/CompanyProfile"
import FeedbackSurvey from "../modules/FeedbackSurvey"
import { authenticatedFetch } from "@/utils/api"

function EmpresaDashboard({ userId, user }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState("welcome")
  const [empresaData, setEmpresaData] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({
    talent: true,
    recruitment: false,
    settings: false,
  })

  useEffect(() => {
    // Fetch company specific data if needed or use from user object
    if (user?.id_empresa) {
        // We could fetch company profile info here
    }
  }, [user]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const menuStructure = [
    {
      id: "talent",
      label: "Talento Humano",
      icon: "🔍",
      modules: [
        { id: "search", label: "Buscar Talento", icon: "👥" },
      ],
    },
    {
      id: "recruitment",
      label: "Seguimiento",
      icon: "📈",
      modules: [
        { id: "funnel", label: "Embudo de Reclutamiento", icon: "🌪️" },
        { id: "feedback", label: "Feedback y Evaluaciones", icon: "✍️" },
      ],
    },
    {
      id: "settings",
      label: "Configuración",
      icon: "⚙️",
      modules: [
        { id: "profile", label: "Perfil de Empresa", icon: "🏢" },
      ],
    },
  ]

  const renderModuleContent = () => {
    switch (activeModule) {
      case "search":
        return (
          <div className={styles.moduleContainer}>
            <TalentSearch empresaId={user?.id_empresa} />
          </div>
        )
      case "funnel":
        return (
          <div className={styles.moduleContainer}>
            <RecruitmentFunnel empresaId={user?.id_empresa} />
          </div>
        )
      case "feedback":
        return (
          <div className={styles.moduleContainer}>
            <FeedbackSurvey empresaId={user?.id_empresa} />
          </div>
        )
      case "profile":
        return (
          <div className={styles.moduleContainer}>
            <CompanyProfile empresaId={user?.id_empresa} />
          </div>
        )
      default:
        return (
          <div className={styles.welcomeContainer}>
            <h1>Bienvenido, {user?.username}</h1>
            <p>Explora el talento de las mejores universidades y gestiona tu proceso de reclutamiento.</p>
            <div className={styles.statsGrid}>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("search");
                  if (!expandedCategories.talent) toggleCategory("talent");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>👥</span>
                <h3>Buscar Talento</h3>
                <p>Encuentra estudiantes con habilidades específicas para tu empresa.</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("funnel");
                  if (!expandedCategories.recruitment) toggleCategory("recruitment");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>📈</span>
                <h3>Gestión de Reclutamiento</h3>
                <p>Sigue el progreso de tus candidatos y practicantes.</p>
              </div>
              <div 
                className={styles.statCard} 
                onClick={() => {
                  setActiveModule("feedback");
                  if (!expandedCategories.recruitment) toggleCategory("recruitment");
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.statIcon}>✍️</span>
                <h3>Feedback y Evaluaciones</h3>
                <p>Evalúa el desempeño y ayuda a mejorar la formación académica.</p>
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
        <div className={styles.sidebarHeader} style={{ backgroundColor: "#4F46E5" }}>
          <h2 className={styles.sidebarTitle}>{!sidebarCollapsed && "Empresa Admin"}</h2>
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
                      style={activeModule === module.id ? { backgroundColor: "#4F46E5" } : {}}
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

export default EmpresaDashboard
