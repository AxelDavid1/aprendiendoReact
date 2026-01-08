"use client"

import { useState, useEffect, useCallback } from "react"
import styles from "./SubgruposYHabilidades.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faList,
  faGraduationCap,
  faSearch,
  faChevronDown,
  faChevronUp,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"

const SUBGRUPOS_API_URL = "http://localhost:5000/api/subgrupos-operadores"
const HABILIDADES_API_URL = "http://localhost:5000/api/habilidades-clave"

// Obtener token de autenticación
const getAuthToken = () => {
  return localStorage.getItem("token")
}

const initialSubgrupoState = {
  id_subgrupo: null,
  nombre_subgrupo: "",
  descripcion: "",
}

const initialHabilidadState = {
  id_habilidad: null,
  nombre_habilidad: "",
  descripcion: "",
}

function SubgruposYHabilidades() {
  // State para las pestañas
  const [activeTab, setActiveTab] = useState("subgrupos") // "subgrupos" | "habilidades"

  // Data state
  const [subgrupos, setSubgrupos] = useState([])
  const [habilidades, setHabilidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null) // { type, id, name }

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  // Estados para manejar habilidades de subgrupos
  const [subgrupoHabilidades, setSubgrupoHabilidades] = useState({}) // { id_subgrupo: [habilidades] }
  const [availableHabilidades, setAvailableHabilidades] = useState([])
  const [isHabilidadesModalOpen, setIsHabilidadesModalOpen] = useState(false)
  const [selectedSubgrupo, setSelectedSubgrupo] = useState(null)
  const [selectedHabilidades, setSelectedHabilidades] = useState([]) // Para selección múltiple
  const [searchTerm, setSearchTerm] = useState("") // Para búsqueda en modal
  const [loadingHabilidades, setLoadingHabilidades] = useState({}) // { id_subgrupo: boolean }
  const [isRemoveHabilidadModalOpen, setIsRemoveHabilidadModalOpen] = useState(false)
  const [habilidadToRemove, setHabilidadToRemove] = useState(null) // { idSubgrupo, idHabilidad, nombreHabilidad }

  // Fetch Subgrupos Operadores
  const fetchSubgrupos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No se encontró el token de autenticación.")

      const response = await fetch(SUBGRUPOS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Error al cargar los subgrupos operadores.")
      }
      const data = await response.json()
      setSubgrupos(data)
    } catch (err) {
      console.error(err.message)
      setError(err.message)
      setSubgrupos([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch Habilidades Clave
  const fetchHabilidades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No se encontró el token de autenticación.")

      const response = await fetch(HABILIDADES_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Error al cargar las habilidades clave.")
      }
      const data = await response.json()
      setHabilidades(data)
    } catch (err) {
      console.error(err.message)
      setError(err.message)
      setHabilidades([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect para cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === "subgrupos") {
      fetchSubgrupos()
    } else {
      fetchHabilidades()
    }
  }, [activeTab, fetchSubgrupos, fetchHabilidades])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true)
      setFormState(item)
    } else {
      setIsEditing(false)
      setFormState(activeTab === "subgrupos" ? { ...initialSubgrupoState } : { ...initialHabilidadState })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormState({})
  }

  const handleOpenDeleteModal = (item) => {
    setItemToDelete({
      type: activeTab,
      id: activeTab === "subgrupos" ? item.id_subgrupo : item.id_habilidad,
      name: activeTab === "subgrupos" ? item.nombre_subgrupo : item.nombre_habilidad,
    })
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  // Fetch habilidades de un subgrupo específico
  const fetchSubgrupoHabilidades = useCallback(async (idSubgrupo) => {
    setLoadingHabilidades((prev) => ({ ...prev, [idSubgrupo]: true }))
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No se encontró el token de autenticación.")

      const response = await fetch(`${SUBGRUPOS_API_URL}/${idSubgrupo}/habilidades`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Error al cargar las habilidades del subgrupo.")
      }

      const data = await response.json()
      setSubgrupoHabilidades((prev) => ({
        ...prev,
        [idSubgrupo]: data,
      }))
    } catch (err) {
      console.error(err.message)
      showToast(`Error al cargar habilidades del subgrupo: ${err.message}`, "error")
    } finally {
      setLoadingHabilidades((prev) => ({ ...prev, [idSubgrupo]: false }))
    }
  }, [])

  // Fetch habilidades disponibles para un subgrupo
  const fetchAvailableHabilidadesForSubgrupo = useCallback(async (idSubgrupo) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No se encontró el token de autenticación.")

      const response = await fetch(`${SUBGRUPOS_API_URL}/${idSubgrupo}/habilidades-disponibles`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Error al cargar habilidades disponibles.")
      }

      const data = await response.json()
      setAvailableHabilidades(data)
    } catch (err) {
      console.error(err.message)
      showToast(`Error al cargar habilidades disponibles: ${err.message}`, "error")
    }
  }, [])

  // Abrir modal para agregar habilidades a subgrupo
  const handleOpenHabilidadesModal = async (subgrupo) => {
    setSelectedSubgrupo(subgrupo)
    setSelectedHabilidades([])
    setSearchTerm("")
    await fetchAvailableHabilidadesForSubgrupo(subgrupo.id_subgrupo)
    setIsHabilidadesModalOpen(true)
  }

  // Cerrar modal de habilidades
  const handleCloseHabilidadesModal = () => {
    setIsHabilidadesModalOpen(false)
    setSelectedSubgrupo(null)
    setSelectedHabilidades([])
    setAvailableHabilidades([])
    setSearchTerm("")
  }

  // Manejar selección de habilidades
  const handleHabilidadSelection = (idHabilidad) => {
    setSelectedHabilidades((prev) =>
      prev.includes(idHabilidad) ? prev.filter((id) => id !== idHabilidad) : [...prev, idHabilidad],
    )
  }

  // Agregar habilidades seleccionadas al subgrupo
  const handleAddHabilidadesToSubgrupo = async () => {
    if (selectedHabilidades.length === 0) {
      showToast("Debes seleccionar al menos una habilidad", "error")
      return
    }

    const token = getAuthToken()
    let successCount = 0
    let errorCount = 0

    for (const idHabilidad of selectedHabilidades) {
      try {
        const response = await fetch(`${SUBGRUPOS_API_URL}/${selectedSubgrupo.id_subgrupo}/habilidades`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id_habilidad: idHabilidad }),
        })

        if (response.ok) {
          successCount++
        } else {
          const errData = await response.json()
          if (errData.error && errData.error.includes("ya está asignada")) {
            // Ya existe, no es error grave
            successCount++
          } else {
            errorCount++
          }
        }
      } catch (err) {
        errorCount++
      }
    }

    if (successCount > 0) {
      showToast(`${successCount} habilidad(es) agregada(s) con éxito`, "success")
      await fetchSubgrupoHabilidades(selectedSubgrupo.id_subgrupo)
    }

    if (errorCount > 0) {
      showToast(`${errorCount} habilidad(es) no se pudieron agregar`, "error")
    }

    handleCloseHabilidadesModal()
  }

  // Abrir modal para eliminar habilidad del subgrupo
  const handleOpenRemoveHabilidadModal = (idSubgrupo, idHabilidad, nombreHabilidad) => {
    setHabilidadToRemove({
      idSubgrupo,
      idHabilidad,
      nombreHabilidad,
    })
    setIsRemoveHabilidadModalOpen(true)
  }

  // Cerrar modal de eliminación de habilidad
  const handleCloseRemoveHabilidadModal = () => {
    setIsRemoveHabilidadModalOpen(false)
    setHabilidadToRemove(null)
  }

  // Eliminar habilidad del subgrupo
  const handleRemoveHabilidadFromSubgrupo = async () => {
    if (!habilidadToRemove) return

    try {
      const token = getAuthToken()
      const response = await fetch(
        `${SUBGRUPOS_API_URL}/${habilidadToRemove.idSubgrupo}/habilidades/${habilidadToRemove.idHabilidad}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        showToast("Habilidad eliminada del subgrupo con éxito", "success")
        await fetchSubgrupoHabilidades(habilidadToRemove.idSubgrupo)
      } else {
        const errData = await response.json()
        throw new Error(errData.error || "Error al eliminar habilidad del subgrupo.")
      }
    } catch (err) {
      console.error(err.message)
      showToast(`Error al eliminar habilidad: ${err.message}`, "error")
    } finally {
      handleCloseRemoveHabilidadModal()
    }
  }

  // Toggle para mostrar/ocultar habilidades de un subgrupo
  const toggleSubgrupoHabilidades = async (idSubgrupo) => {
    if (subgrupoHabilidades[idSubgrupo]) {
      // Ocultar habilidades
      setSubgrupoHabilidades((prev) => {
        const newState = { ...prev }
        delete newState[idSubgrupo]
        return newState
      })
    } else {
      // Mostrar habilidades
      await fetchSubgrupoHabilidades(idSubgrupo)
    }
  }

  // Filtrar habilidades por término de búsqueda
  const filteredHabilidades = availableHabilidades.filter(
    (habilidad) =>
      habilidad.nombre_habilidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (habilidad.descripcion && habilidad.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const token = getAuthToken()
    let url, method, body, successMessage

    if (activeTab === "subgrupos") {
      if (!formState.nombre_subgrupo.trim()) {
        showToast("El nombre del subgrupo es requerido.", "error")
        return
      }
      url = isEditing ? `${SUBGRUPOS_API_URL}/${formState.id_subgrupo}` : SUBGRUPOS_API_URL
      method = isEditing ? "PUT" : "POST"
      body = {
        nombre_subgrupo: formState.nombre_subgrupo,
        descripcion: formState.descripcion,
      }
      successMessage = isEditing ? "Subgrupo operador actualizado con éxito" : "Subgrupo operador creado con éxito"
    } else {
      if (!formState.nombre_habilidad.trim()) {
        showToast("El nombre de la habilidad es requerido.", "error")
        return
      }
      url = isEditing ? `${HABILIDADES_API_URL}/${formState.id_habilidad}` : HABILIDADES_API_URL
      method = isEditing ? "PUT" : "POST"
      body = {
        nombre_habilidad: formState.nombre_habilidad,
        descripcion: formState.descripcion,
      }
      successMessage = isEditing ? "Habilidad clave actualizada con éxito" : "Habilidad clave creada con éxito"
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      if (!response.ok) {
        if (response.status === 409) {
          showToast(result.error || "El elemento ya existe.", "error")
        } else {
          showToast(`Error: ${result.error || "Ocurrió un error desconocido."}`, "error")
        }
        return
      }

      showToast(successMessage, "success")
      handleCloseModal()

      if (activeTab === "subgrupos") {
        fetchSubgrupos()
      } else {
        fetchHabilidades()
      }
    } catch (err) {
      showToast(`Error de red: ${err.message}`, "error")
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const token = getAuthToken()
    const { type, id } = itemToDelete
    const url = type === "subgrupos" ? `${SUBGRUPOS_API_URL}/${id}` : `${HABILIDADES_API_URL}/${id}`

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "La eliminación falló.")
      }

      showToast("Elemento eliminado con éxito", "success")
      handleCloseDeleteModal()

      if (type === "subgrupos") {
        fetchSubgrupos()
      } else {
        fetchHabilidades()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error")
    }
  }

  const renderContent = () => {
    // Pestaña de Subgrupos Operadores (modificada)
    if (activeTab === "subgrupos") {
      if (loading) {
        return (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Cargando subgrupos operadores...</p>
          </div>
        )
      }

      if (error) {
        return (
          <div className={styles.emptyState}>
            <h3>Un error ha ocurrido</h3>
            <p>{error || "No se pudieron cargar los datos."}</p>
            <button onClick={fetchSubgrupos} className={styles.emptyStateButton}>
              Intentar de Nuevo
            </button>
          </div>
        )
      }

      if (subgrupos.length === 0) {
        return (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faList} size="3x" color="#9ca3af" />
            <h3>No hay subgrupos operadores</h3>
            <p>Comienza agregando un nuevo subgrupo operador.</p>
            <button onClick={() => handleOpenModal()} className={styles.emptyStateButton}>
              <FontAwesomeIcon icon={faPlus} /> Agregar Subgrupo
            </button>
          </div>
        )
      }

      return (
        <div className={styles.subgruposContainer}>
          {subgrupos.map((subgrupo) => (
            <div key={subgrupo.id_subgrupo} className={styles.subgrupoCard}>
              <div className={styles.subgrupoHeader}>
                <div className={styles.subgrupoInfo}>
                  <h3>{subgrupo.nombre_subgrupo}</h3>
                  <p>{subgrupo.descripcion || "Sin descripción"}</p>
                </div>
                <div className={styles.subgrupoActions}>
                  <button
                    onClick={() => handleOpenModal(subgrupo)}
                    className={styles.editButton}
                    title="Editar subgrupo"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(subgrupo)}
                    className={styles.deleteButton}
                    title="Eliminar subgrupo"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => toggleSubgrupoHabilidades(subgrupo.id_subgrupo)}
                    className={styles.toggleButton}
                    title={subgrupoHabilidades[subgrupo.id_subgrupo] ? "Ocultar habilidades" : "Mostrar habilidades"}
                  >
                    {subgrupoHabilidades[subgrupo.id_subgrupo] ? (
                      <>
                        <FontAwesomeIcon icon={faChevronUp} /> Ocultar Habilidades
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faChevronDown} /> Mostrar Habilidades
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenHabilidadesModal(subgrupo)}
                    className={styles.addButton}
                    title="Agregar habilidades"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Agregar Habilidades
                  </button>
                </div>
              </div>

              {subgrupoHabilidades[subgrupo.id_subgrupo] !== undefined && (
                <div className={styles.habilidadesSection}>
                  <h4>Habilidades Asociadas ({subgrupoHabilidades[subgrupo.id_subgrupo]?.length || 0})</h4>

                  {loadingHabilidades[subgrupo.id_subgrupo] ? (
                    <div className={styles.habilidadesLoading}>
                      <FontAwesomeIcon icon={faSpinner} spin /> Cargando habilidades...
                    </div>
                  ) : subgrupoHabilidades[subgrupo.id_subgrupo]?.length === 0 ? (
                    <p className={styles.noHabilidades}>Este subgrupo no tiene habilidades asignadas</p>
                  ) : (
                    <div className={styles.habilidadesList}>
                      {subgrupoHabilidades[subgrupo.id_subgrupo].map((habilidad) => (
                        <div key={habilidad.id_habilidad} className={styles.habilidadItem}>
                          <div className={styles.habilidadInfo}>
                            <span className={styles.habilidadName}>{habilidad.nombre_habilidad}</span>
                            {habilidad.descripcion && (
                              <span className={styles.habilidadDesc}>{habilidad.descripcion}</span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleOpenRemoveHabilidadModal(
                                subgrupo.id_subgrupo,
                                habilidad.id_habilidad,
                                habilidad.nombre_habilidad,
                              )
                            }
                            className={styles.removeHabilidadButton}
                            title="Eliminar habilidad del subgrupo"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    // Pestaña de Habilidades Clave (sin cambios)
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando habilidades clave...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.emptyState}>
          <h3>Un error ha ocurrido</h3>
          <p>{error || "No se pudieron cargar los datos."}</p>
          <button onClick={fetchHabilidades} className={styles.emptyStateButton}>
            Intentar de Nuevo
          </button>
        </div>
      )
    }

    if (habilidades.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faGraduationCap} size="3x" color="#9ca3af" />
          <h3>No hay habilidades clave</h3>
          <p>Comienza agregando una nueva habilidad clave.</p>
          <button onClick={() => handleOpenModal()} className={styles.emptyStateButton}>
            <FontAwesomeIcon icon={faPlus} /> Agregar Habilidad
          </button>
        </div>
      )
    }

    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habilidades.map((item) => (
              <tr key={item.id_habilidad}>
                <td className={styles.nameCell}>{item.nombre_habilidad}</td>
                <td className={styles.descCell}>
                  {item.descripcion || <span className={styles.noDesc}>Sin descripción</span>}
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button onClick={() => handleOpenModal(item)} className={styles.editButton} title="Editar">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(item)}
                      className={styles.deleteButton}
                      title="Eliminar"
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
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Subgrupos Operadores y Habilidades Clave</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Pestañas */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "subgrupos" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("subgrupos")}
          >
            <FontAwesomeIcon icon={faList} />
            Subgrupos Operadores
          </button>
          <button
            className={`${styles.tab} ${activeTab === "habilidades" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("habilidades")}
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            Habilidades Clave
          </button>
        </div>

        {/* Barra de herramientas */}
        <div className={styles.toolbar}>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} />
            Agregar {activeTab === "subgrupos" ? "Subgrupo" : "Habilidad"}
          </button>
        </div>

        {/* Contenido */}
        {renderContent()}
      </main>

      {/* Modal para Agregar/Editar */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {isEditing ? "Editar" : "Agregar"} {activeTab === "subgrupos" ? "Subgrupo Operador" : "Habilidad Clave"}
              </h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name={activeTab === "subgrupos" ? "nombre_subgrupo" : "nombre_habilidad"}
                  value={activeTab === "subgrupos" ? formState.nombre_subgrupo || "" : formState.nombre_habilidad || ""}
                  onChange={handleFormChange}
                  required
                  placeholder={`Ej: ${activeTab === "subgrupos" ? "Ingeniero Eléctrico" : "Inglés C1"}`}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formState.descripcion || ""}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Descripción opcional..."
                ></textarea>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  {isEditing ? "Guardar Cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar <strong>{itemToDelete?.name}</strong>? Esta acción es permanente y
                no se puede deshacer.
              </p>
            </div>
            <div className={styles.deleteActions}>
              <button onClick={handleCloseDeleteModal} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className={styles.confirmDeleteButton}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Habilidades a Subgrupo */}
      {isHabilidadesModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseHabilidadesModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
          >
            <div className={styles.modalHeader}>
              <h3>Agregar Habilidades a "{selectedSubgrupo?.nombre_subgrupo}"</h3>
              <button onClick={handleCloseHabilidadesModal} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent} style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
              {availableHabilidades.length === 0 ? (
                <div className={styles.emptyModalState}>
                  <div className={styles.emptyModalIcon}>
                    <FontAwesomeIcon icon={faGraduationCap} size="3x" />
                  </div>
                  <h3>No hay habilidades disponibles</h3>
                  <p>
                    Todas las habilidades ya están asignadas a este subgrupo o no existen habilidades en el sistema.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.searchContainer}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Buscar habilidades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className={styles.clearSearchButton}
                        title="Limpiar búsqueda"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>

                  <div className={styles.selectionInfo}>
                    <span>
                      {filteredHabilidades.length} habilidad(es) disponible(s)
                      {searchTerm &&
                        selectedHabilidades.length > 0 &&
                        ` • ${selectedHabilidades.length} seleccionada(s)`}
                    </span>
                  </div>

                  {filteredHabilidades.length === 0 ? (
                    <p className={styles.noResults}>No se encontraron habilidades con "{searchTerm}"</p>
                  ) : (
                    <div className={styles.habilidadesSelection}>
                      {filteredHabilidades.map((habilidad) => (
                        <label key={habilidad.id_habilidad} className={styles.habilidadCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedHabilidades.includes(habilidad.id_habilidad)}
                            onChange={() => handleHabilidadSelection(habilidad.id_habilidad)}
                          />
                          <span className={styles.checkboxLabel}>
                            <strong>{habilidad.nombre_habilidad}</strong>
                            {habilidad.descripcion && (
                              <span className={styles.habilidadDesc}>{habilidad.descripcion}</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.modalActionsImproved}>
              <button type="button" onClick={handleCloseHabilidadesModal} className={styles.cancelButtonImproved}>
                Cancelar
              </button>
              {availableHabilidades.length > 0 && filteredHabilidades.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddHabilidadesToSubgrupo}
                  className={styles.saveButtonImproved}
                  disabled={selectedHabilidades.length === 0}
                >
                  Agregar {selectedHabilidades.length > 0 ? `${selectedHabilidades.length} ` : ""}habilidad
                  {selectedHabilidades.length !== 1 ? "es" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Habilidad del Subgrupo */}
      {isRemoveHabilidadModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseRemoveHabilidadModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h3>Eliminar Habilidad del Subgrupo</h3>
              <p>
                ¿Estás seguro de que quieres eliminar la habilidad <strong>{habilidadToRemove?.nombreHabilidad}</strong>{" "}
                de este subgrupo?
              </p>
              <p className={styles.warningText}>
                Esta acción solo elimina la relación entre el subgrupo y la habilidad, no elimina la habilidad del
                sistema.
              </p>
            </div>
            <div className={styles.deleteActions}>
              <button onClick={handleCloseRemoveHabilidadModal} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={handleRemoveHabilidadFromSubgrupo} className={styles.confirmDeleteButton}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type]}`}>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubgruposYHabilidades
