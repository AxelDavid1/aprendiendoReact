"use client"
import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBuilding, 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash, 
  faGlobe, 
  faInfoCircle,
  faEnvelope,
  faLock,
  faTimes,
  faIndustry,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faExclamationTriangle,
  faSave,
  faUserShield
} from "@fortawesome/free-solid-svg-icons"
import styles from "./ManejoEmpresas.module.css"
import { authenticatedFetch } from "@/utils/api"

const ManejoEmpresas = () => {
    const [empresas, setEmpresas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState("add")
    const [toast, setToast] = useState({ show: false, message: "", type: "" })
    const [submitting, setSubmitting] = useState(false)

    const initialFormState = {
        id_empresa: null,
        nombre: "",
        sector: "",
        sitio_web: "",
        descripcion: "",
        email_admin: "",
        password: "",
    }
    const [formData, setFormData] = useState(initialFormState)

    const fetchEmpresas = useCallback(async () => {
        setLoading(true)
        try {
            const res = await authenticatedFetch(`/api/empresa/sedeq-manage?page=${page}&searchTerm=${searchTerm}`)
            if (res.ok) {
                const data = await res.json()
                setEmpresas(data.empresas)
                setTotalPages(data.totalPages)
            } else {
                showToast("Error al cargar empresas", "error")
            }
        } catch (error) {
            console.error("Error fetching empresas:", error)
            showToast("Error de conexión", "error")
        } finally {
            setLoading(false)
        }
    }, [page, searchTerm])

    useEffect(() => {
        fetchEmpresas()
    }, [fetchEmpresas])

    const showToast = (message, type) => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setPage(1)
    }

    const openModal = (mode, company = null) => {
        setModalMode(mode)
        if (mode === "edit" && company) {
            setFormData({
                id_empresa: company.id_empresa,
                nombre: company.nombre || "",
                sector: company.sector || "",
                sitio_web: company.web_url || "",
                descripcion: company.descripcion || "",
                email_admin: company.email_admin || "",
                password: "",
            })
        } else {
            setFormData(initialFormState)
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setFormData(initialFormState)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const form = new FormData()
            form.append("nombre", formData.nombre)
            form.append("sector", formData.sector)
            form.append("sitio_web", formData.sitio_web)
            form.append("descripcion", formData.descripcion)
            form.append("email_admin", formData.email_admin)
            if (formData.password) {
                form.append("password", formData.password)
            }

            const url = modalMode === "add" 
                ? "/api/empresa/sedeq-manage" 
                : `/api/empresa/sedeq-manage/${formData.id_empresa}`
            const method = modalMode === "add" ? "POST" : "PUT"

            const res = await authenticatedFetch(url, { method, body: form })

            if (res.ok) {
                showToast(
                    modalMode === "add" ? "Empresa creada con éxito" : "Empresa actualizada con éxito", 
                    "success"
                )
                closeModal()
                fetchEmpresas()
            } else {
                const data = await res.json()
                showToast(data.error || "Error al procesar la solicitud", "error")
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            showToast("Error de servidor", "error")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta empresa? Se borrará también el acceso de su administrador.")) return

        try {
            const res = await authenticatedFetch(`/api/empresa/sedeq-manage/${id}`, { method: "DELETE" })
            if (res.ok) {
                showToast("Empresa eliminada con éxito", "success")
                fetchEmpresas()
            } else {
                showToast("Error al eliminar empresa", "error")
            }
        } catch (error) {
            console.error("Error deleting empresa:", error)
            showToast("Error de conexión", "error")
        }
    }

    return (
        <div className={styles.container}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div className={styles.titleWrapper}>
                    <div className={styles.headerIcon}>
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Gestión de Empresas</h1>
                        <p className={styles.subtitle}>Administra los perfiles de empresas y sus cuentas de acceso.</p>
                    </div>
                </div>
                <button className={styles.addButton} onClick={() => openModal("add")}>
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Empresa
                </button>
            </header>

            {/* ── MAIN CARD ── */}
            <main className={styles.mainContent}>

                {/* Search */}
                <div className={styles.searchBar}>
                    <div className={styles.searchContainer}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input 
                            type="text" 
                            className={styles.searchInput} 
                            placeholder="Buscar por nombre o sector..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* ── MOBILE CARD VIEW ── */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Cargando empresas...</p>
                    </div>
                ) : empresas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faBuilding} className={styles.emptyIcon} />
                        <h3>Sin resultados</h3>
                        <p>No se encontraron empresas. Intenta otra búsqueda o agrega una nueva.</p>
                    </div>
                ) : (
                    <>
                        {/* Cards (mobile / tablet) */}
                        <div className={styles.mobileView}>
                            {empresas.map(empresa => (
                                <div key={empresa.id_empresa} className={styles.companyCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardLogoWrapper}>
                                            {empresa.logo_url
                                                ? <img src={empresa.logo_url} alt={empresa.nombre} className={styles.cardLogo} />
                                                : <FontAwesomeIcon icon={faBuilding} className={styles.cardLogoIcon} />
                                            }
                                        </div>
                                        <div className={styles.cardCompanyInfo}>
                                            <p className={styles.cardCompanyName}>{empresa.nombre}</p>
                                            <p className={styles.cardCompanyId}>ID: #{empresa.id_empresa}</p>
                                        </div>
                                        <span className={styles.badge}>{empresa.sector || "N/A"}</span>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.cardRow}>
                                            <FontAwesomeIcon icon={faGlobe} className={styles.cardRowIcon} />
                                            <span className={styles.cardRowLabel}>Web:</span>
                                            {empresa.web_url
                                                ? <a href={empresa.web_url} target="_blank" rel="noopener noreferrer" className={styles.cardRowLink}>Ver sitio</a>
                                                : <span className={styles.naText}>N/A</span>
                                            }
                                        </div>
                                        <div className={styles.cardRow}>
                                            <FontAwesomeIcon icon={faEnvelope} className={styles.cardRowIcon} />
                                            <span className={styles.cardRowLabel}>Admin:</span>
                                            <span className={styles.cardRowValue}>{empresa.email_admin || "Sin asignar"}</span>
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button className={styles.editButton} onClick={() => openModal("edit", empresa)}>
                                            <FontAwesomeIcon icon={faEdit} /> Editar
                                        </button>
                                        <button className={styles.deleteButton} onClick={() => handleDelete(empresa.id_empresa)}>
                                            <FontAwesomeIcon icon={faTrash} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table (desktop) */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Empresa</th>
                                        <th>Sector</th>
                                        <th>Sitio Web</th>
                                        <th>Administrador</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empresas.map(empresa => (
                                        <tr key={empresa.id_empresa}>
                                            <td>
                                                <div className={styles.nameCell}>
                                                    <div className={styles.logoWrapper}>
                                                        {empresa.logo_url
                                                            ? <img src={empresa.logo_url} alt={empresa.nombre} className={styles.logo} />
                                                            : <FontAwesomeIcon icon={faBuilding} style={{ color: '#94a3b8' }} />
                                                        }
                                                    </div>
                                                    <div className={styles.companyInfo}>
                                                        <span className={styles.companyName}>{empresa.nombre}</span>
                                                        <span className={styles.companySector}>ID: #{empresa.id_empresa}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.badge}>{empresa.sector || "N/A"}</span>
                                            </td>
                                            <td>
                                                {empresa.web_url
                                                    ? <a href={empresa.web_url} target="_blank" rel="noopener noreferrer" className={styles.siteLink}>
                                                        <FontAwesomeIcon icon={faGlobe} /> Ver sitio
                                                      </a>
                                                    : <span className={styles.naText}>N/A</span>
                                                }
                                            </td>
                                            <td>
                                                <div className={styles.adminCell}>
                                                    <span className={styles.adminEmail}>{empresa.email_admin || "Sin asignar"}</span>
                                                    {empresa.email_admin && <span className={styles.adminStatus}>Acceso habilitado</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.tableActions}>
                                                    <button 
                                                        className={`${styles.actionButton} ${styles.tableEditButton}`}
                                                        onClick={() => openModal("edit", empresa)}
                                                        title="Editar empresa"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button 
                                                        className={`${styles.actionButton} ${styles.tableDeleteButton}`}
                                                        onClick={() => handleDelete(empresa.id_empresa)}
                                                        title="Eliminar empresa"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Página {page} de {totalPages}
                        </div>
                        <div className={styles.pageControls}>
                            <button 
                                className={styles.pageButton} 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <div className={styles.pageNumbers}>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i + 1}
                                        className={`${styles.pageNumber} ${page === i + 1 ? styles.active : ""}`}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                className={styles.pageButton} 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* ── MODAL ── */}
            {isModalOpen && createPortal(
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        
                        <form onSubmit={handleSubmit}>
                        
                        <header className={styles.modalHeader}>
                            <div className={styles.modalTitleWrapper}>
                                <div className={styles.modalHeaderIcon}>
                                    <FontAwesomeIcon icon={faBuilding} />
                                </div>
                                <div>
                                    <h2 className={styles.modalTitle}>
                                        {modalMode === "add" ? "Registrar Nueva Empresa" : "Editar Empresa"}
                                    </h2>
                                    <p className={styles.modalSubtitle}>
                                        {modalMode === "add" 
                                            ? "Completa la información para dar de alta una empresa." 
                                            : "Modifica los datos de la empresa y su administrador."}
                                    </p>
                                </div>
                            </div>
                            <button type="button" className={styles.closeButton} onClick={closeModal} aria-label="Cerrar">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </header>

                        <div className={styles.modalBody}>

                            {/* ── Sección: Información general ── */}
                            <div className={styles.formSection}>
                                <div className={styles.formSectionHeader}>
                                    <FontAwesomeIcon icon={faBuilding} />
                                    <span>Información de la Empresa</span>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                        <label htmlFor="nombre">
                                            Nombre de la Empresa <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.inputWrapper}>
                                            <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
                                            <input 
                                                id="nombre"
                                                type="text" 
                                                name="nombre" 
                                                value={formData.nombre} 
                                                onChange={handleInputChange} 
                                                placeholder="Ej: Tech Solutions S.A."
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="sector">
                                            Sector Industrial <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.inputWrapper}>
                                            <FontAwesomeIcon icon={faIndustry} className={styles.inputIcon} />
                                            <input 
                                                id="sector"
                                                type="text" 
                                                name="sector" 
                                                value={formData.sector} 
                                                onChange={handleInputChange} 
                                                placeholder="Ej: Tecnología"
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="sitio_web">
                                            Sitio Web <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.inputWrapper}>
                                            <FontAwesomeIcon icon={faGlobe} className={styles.inputIcon} />
                                            <input 
                                                id="sitio_web"
                                                type="url" 
                                                name="sitio_web" 
                                                value={formData.sitio_web} 
                                                onChange={handleInputChange} 
                                                placeholder="https://ejemplo.com"
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                        <label htmlFor="descripcion">
                                            Descripción <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.textareaWrapper}>
                                            <FontAwesomeIcon icon={faInfoCircle} className={styles.textareaIcon} />
                                            <textarea 
                                                id="descripcion"
                                                name="descripcion" 
                                                value={formData.descripcion} 
                                                onChange={handleInputChange} 
                                                placeholder="Breve reseña de la empresa: giro, misión, productos o servicios que ofrece..."
                                                rows="4"
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Sección: Cuenta Administrador ── */}
                            <div className={styles.formSection}>
                                <div className={styles.formSectionHeader}>
                                    <FontAwesomeIcon icon={faUserShield} />
                                    <span>Cuenta Administrador</span>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email_admin">
                                            Correo Electrónico <span className={styles.required}>*</span>
                                        </label>
                                        <div className={styles.inputWrapper}>
                                            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                                            <input 
                                                id="email_admin"
                                                type="email" 
                                                name="email_admin" 
                                                value={formData.email_admin} 
                                                onChange={handleInputChange} 
                                                placeholder="admin@empresa.com"
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="password">
                                            Contraseña {modalMode === "add" && <span className={styles.required}>*</span>}
                                        </label>
                                        <div className={styles.inputWrapper}>
                                            <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                            <input 
                                                id="password"
                                                type="password" 
                                                name="password" 
                                                value={formData.password} 
                                                onChange={handleInputChange} 
                                                placeholder={modalMode === "add" ? "Mín. 8 caracteres" : "Dejar en blanco para no cambiar"}
                                                required={modalMode === "add"}
                                            />
                                        </div>
                                        {modalMode === "edit" && (
                                            <p className={styles.passwordHelp}>
                                                Solo llena este campo si deseas cambiar la contraseña actual.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <footer className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={closeModal} disabled={submitting}>
                                Cancelar
                            </button>
                            <button type="submit" className={styles.submitButton} disabled={submitting}>
                                {submitting 
                                    ? <><span className={styles.btnSpinner}></span> Procesando...</>
                                    : <><FontAwesomeIcon icon={modalMode === "add" ? faPlus : faSave} /> {modalMode === "add" ? "Registrar Empresa" : "Guardar Cambios"}</>
                                }
                            </button>
                        </footer>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ── TOAST ── */}
            {toast.show && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    <FontAwesomeIcon icon={toast.type === "success" ? faCheckCircle : faExclamationTriangle} />
                    {toast.message}
                </div>
            )}
        </div>
    )
}

export default ManejoEmpresas