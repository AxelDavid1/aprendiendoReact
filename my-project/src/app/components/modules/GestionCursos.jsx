"use client"

import { useState, useEffect, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBook,
  faEdit,
  faTrash,
  faPlus,
  faTimes,
  faListCheck,
  faDownload,
  faClock,
} from "@fortawesome/free-solid-svg-icons"
import styles from "./GestionCursos.module.css"
import GestionHorarios from "./GestionHorarios"
import PlaneacionCurso from "./PlaneacionCurso"
import MaterialADescargar from "./MaterialADescargar"
import { useAuth } from "@/hooks/useAuth"

const API_URL = "http://localhost:5000/api/cursos"
const API_URL_UNIVERSIDADES = "http://localhost:5000/api/universidades"
const API_URL_SUBGRUPOS = "http://localhost:5000/api/subgrupos-operadores"
const API_URL_FACULTADES = "http://localhost:5000/api/facultades"
const API_URL_CARRERAS = "http://localhost:5000/api/carreras"
const API_URL_MAESTROS = "http://localhost:5000/api/maestros"

// Estado inicial para el formulario del curso
const initialCourseState = {
  nombre_curso: "",
  descripcion: "",
  id_subgrupo: "",
  id_habilidades: [],
  id_maestro: "",
  id_universidad: "",
  id_facultad: "",
  id_carrera: "",
  objetivos: "",
  prerequisitos: "",
  duracion_horas: "",
  horas_teoria: "",
  horas_practica: "",
  cupo_maximo: "",
  fecha_inicio: "",
  fecha_fin: "",
  nivel: "basico",
  modalidad: "virtual",
  codigo_curso: "",
  tipo_costo: "gratuito",
  costo: null,
}

function CourseManagement({ userId }) {
  const [universidades, setUniversidades] = useState([])
  const [facultades, setFacultades] = useState([])
  const [carreras, setCarreras] = useState([])
  // Estados para los filtros de maestro
  const [selectedUniversidad, setSelectedUniversidad] = useState("")
  const [selectedFacultad, setSelectedFacultad] = useState("")
  const [selectedCarrera, setSelectedCarrera] = useState("")
  const [isFacultadesLoading, setIsFacultadesLoading] = useState(false)
  // Estados para Areas y Categorías
  const [subgrupos, setSubgrupos] = useState([])
  const [selectedSubgrupo, setSelectedSubgrupo] = useState("")
  const [habilidadesSubgrupo, setHabilidadesSubgrupo] = useState([])
  const [isHabilidadesLoading, setIsHabilidadesLoading] = useState(false)
  const [isCarrerasLoading, setIsCarrerasLoading] = useState(false)
  const [isTeachersLoading, setIsTeachersLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([]) // Estado para la lista de maestros
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [openPlaneacionCurso, setOpenPlaneacionCurso] = useState(false)
  const [cursoPlaneacion, setCursoPlaneacion] = useState(null)
  const [openMaterialModal, setOpenMaterialModal] = useState(false)
  const [cursoMaterial, setCursoMaterial] = useState(null)
  const [openHorariosModal, setOpenHorariosModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const { token } = useAuth()
  const [formState, setFormState] = useState(initialCourseState)
  const [isEditing, setIsEditing] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  })
  // Search and debounce state
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1) // Reset to first page on new search
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser))
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error("Error al leer usuario desde localStorage:", error)
      setCurrentUser(null)
    }
  }, [])

  const isMaestroUser = currentUser?.tipo_usuario === "maestro"
  const isAdminSedeq = currentUser?.tipo_usuario === "admin_sedeq"
  const canAssignTeacher = isEditing && !!selectedUniversidad && !!selectedFacultad

  // Función para obtener los cursos
  // Función para obtener los cursos
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      let url = API_URL
      const params = new URLSearchParams()
      params.append("exclude_assigned", "false")
      params.append("page", page)
      params.append("limit", "10")
      params.append("searchTerm", debouncedSearchTerm)

      // Solo filtrar por maestro si NO es admin_sedeq
      if (user.tipo_usuario !== "admin_sedeq" && userId) {
        params.append("id_maestro", userId)
      }

      url += `?${params.toString()}`

      console.log("Fetching courses from:", url) // DEBUG

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errData = await response.json()
        console.error("Error response:", errData) // DEBUG
        throw new Error(errData.error || "Error al obtener los cursos")
      }

      const data = await response.json()
      console.log("Courses loaded:", data) // DEBUG
      setCourses(data.cursos || [])
      setTotalPages(data.totalPages || 0)
      setTotalCourses(data.total || 0)
    } catch (err) {
      console.error("Fetch error:", err) // DEBUG
      setError(err.message)
      setCourses([])
      setTotalPages(0)
      setTotalCourses(0)
    } finally {
      setLoading(false)
    }
  }, [userId, page])

  // Obtener Subgrupos Operadores
  const fetchSubgrupos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(API_URL_SUBGRUPOS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("No se pudieron cargar los subgrupos")
      const data = await response.json()
      setSubgrupos(data || [])
    } catch (err) {
      console.error("Error al cargar subgrupos operadores:", err.message)
    }
  }, [])

  // Obtener Habilidades por Subgrupo
  const fetchHabilidadesBySubgrupo = useCallback(async (idSubgrupo) => {
    if (!idSubgrupo) {
      setHabilidadesSubgrupo([])
      return
    }
    setIsHabilidadesLoading(true)
    setHabilidadesSubgrupo([])
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL_SUBGRUPOS}/${idSubgrupo}/habilidades`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("No se pudieron cargar las habilidades para el subgrupo seleccionado")
      const data = await response.json()
      setHabilidadesSubgrupo(data || [])
    } catch (err) {
      console.error("Error al cargar habilidades por subgrupo:", err.message)
    } finally {
      setIsHabilidadesLoading(false)
    }
  }, [])

  const fetchUniversidades = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL_UNIVERSIDADES}?limit=9999`)
      if (!response.ok) throw new Error("No se pudieron cargar las universidades")
      const data = await response.json()
      setUniversidades(data.universities || [])
    } catch (err) {
      console.error("Error al cargar universidades:", err.message)
    }
  }, [])

  const fetchFacultades = useCallback(async (idUniversidad) => {
    if (!idUniversidad) {
      setFacultades([])
      setCarreras([])
      setTeachers([])
      return
    }
    setIsFacultadesLoading(true)
    setFacultades([])
    setCarreras([])
    setTeachers([])
    try {
      const response = await fetch(`${API_URL_FACULTADES}/universidad/${idUniversidad}`)
      const data = await response.json()
      setFacultades(data.data || [])
    } catch (err) {
      console.error("Error al cargar facultades:", err)
    } finally {
      setIsFacultadesLoading(false)
    }
  }, [])

  const fetchCarreras = useCallback(async (idFacultad) => {
    if (!idFacultad) {
      setCarreras([])
      setTeachers([])
      return
    }
    setIsCarrerasLoading(true)
    setCarreras([])
    setTeachers([])
    try {
      const response = await fetch(`${API_URL_CARRERAS}/facultad/${idFacultad}`)
      const data = await response.json()
      setCarreras(data.data || [])
    } catch (err) {
      console.error("Error al cargar carreras:", err)
    } finally {
      setIsCarrerasLoading(false)
    }
  }, [])

  const fetchTeachers = useCallback(async ({ universidadId, facultadId, carreraId = null }) => {
    if (!universidadId || !facultadId) {
      setTeachers([])
      return
    }

    setIsTeachersLoading(true)
    setTeachers([])

    try {
      const params = new URLSearchParams({
        id_universidad: universidadId,
        id_facultad: facultadId,
      })

      if (carreraId) {
        params.append("id_carrera", carreraId)
      }

      const response = await fetch(`${API_URL_MAESTROS}?${params.toString()}`)
      const data = await response.json()
      setTeachers(data.maestros || [])
    } catch (err) {
      console.error("Error al cargar maestros:", err)
    } finally {
      setIsTeachersLoading(false)
    }
  }, [])

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchCourses()
    fetchSubgrupos()
    fetchUniversidades()
  }, [fetchCourses, fetchSubgrupos, fetchUniversidades])

  // Función para mostrar notificaciones toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }

  const showConfirmModal = (title, message, onConfirm, type = "warning") => {
    setConfirmModal({ show: true, title, message, onConfirm, type })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, title: "", message: "", onConfirm: null, type: "warning" })
  }

  const openPlaneacion = (curso) => {
    // Enriquecer el objeto curso con información de la carrera seleccionada
    const carreraSeleccionada = carreras.find((c) => c.id_carrera === curso.id_carrera)

    const cursoEnriquecido = {
      ...curso,
      nombre_carrera: carreraSeleccionada?.nombre || curso.nombre_carrera || null,
      clave_carrera: carreraSeleccionada?.clave_carrera || curso.clave_carrera || null,
    }

    setCursoPlaneacion(cursoEnriquecido)
    setOpenPlaneacionCurso(true)
  }

  const closePlaneacion = () => {
    setOpenPlaneacionCurso(false)
    setCursoPlaneacion(null)
  }

  const openMaterial = (curso) => {
    setCursoMaterial(curso)
    setOpenMaterialModal(true)
  }

  const closeMaterial = (shouldReload = false) => {
    setOpenMaterialModal(false)
    setCursoMaterial(null)
    if (shouldReload) {
      fetchCourses()
    }
  }

  const openHorarios = () => {
    setOpenHorariosModal(true)
  }

  const closeHorarios = () => {
    setOpenHorariosModal(false)
  }

  // Abrir modal para agregar/editar
  const handleOpenModal = async (course = null) => {
    if (course) {
      setIsEditing(true)
      const formattedCourse = {
        ...course,
        fecha_inicio: course.fecha_inicio ? new Date(course.fecha_inicio).toISOString().split("T")[0] : "",
        fecha_fin: course.fecha_fin ? new Date(course.fecha_fin).toISOString().split("T")[0] : "",
      }
      // Aseguramos que los valores nulos se conviertan a strings vacíos para los selects
      const stateReadyCourse = {
        ...formattedCourse,
        id_universidad: formattedCourse.id_universidad || "",
        id_facultad: formattedCourse.id_facultad || "",
        id_carrera: formattedCourse.id_carrera || "",
        id_maestro: formattedCourse.id_maestro ? String(formattedCourse.id_maestro) : "",
      }
      setFormState(stateReadyCourse)

      if (course.id_subgrupo) {
        setSelectedSubgrupo(course.id_subgrupo)
        fetchHabilidadesBySubgrupo(course.id_subgrupo)
      }

      if (course.id_universidad) {
        setSelectedUniversidad(course.id_universidad)
        await fetchFacultades(course.id_universidad)
      }
      if (course.id_facultad) {
        setSelectedFacultad(course.id_facultad)
        await fetchCarreras(course.id_facultad)
      }
      if (course.id_carrera || course.id_facultad) {
        setSelectedCarrera(course.id_carrera || "")
        await fetchTeachers({
          universidadId: course.id_universidad,
          facultadId: course.id_facultad,
          carreraId: course.id_carrera || null,
        })
      }
    } else {
      setIsEditing(false)
      const presetMaestro = isMaestroUser && userId ? String(userId) : ""
      setFormState({ ...initialCourseState, id_maestro: presetMaestro })
      setSelectedUniversidad("")
      setSelectedFacultad("")
      setSelectedCarrera("")
      setFacultades([])
      setCarreras([])
      setTeachers([])
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
    setFormState(initialCourseState)
    setSelectedUniversidad("")
    setSelectedFacultad("")
    setSelectedCarrera("")
    setFacultades([])
    setCarreras([])
    setTeachers([])
    setSelectedSubgrupo("")
    setHabilidadesSubgrupo([])
  }

  const handleOpenDeleteModal = (course) => {
    setCourseToDelete(course)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false)

  const handleFormChange = (e) => {
    const { name, value } = e.target

    if (name === "horas_teoria" || name === "horas_practica") {
      const totalHoras = Number.parseInt(formState.duracion_horas, 10) || 0
      const valorActual = Number.parseInt(value, 10) || 0

      const otrasHoras =
        name === "horas_teoria"
          ? Number.parseInt(formState.horas_practica, 10) || 0
          : Number.parseInt(formState.horas_teoria, 10) || 0

      // Si el valor actual excede el total, no hacemos nada (o mostramos un toast)
      if (valorActual > totalHoras) {
        showToast("Las horas no pueden exceder la duración total.", "error")
        return
      }

      // Si la suma excede el total, no actualizamos el estado
      if (valorActual + otrasHoras > totalHoras) {
        showToast("La suma de horas de teoría y práctica no puede exceder la duración total.", "error")
        return
      }
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Si el tipo de costo cambia a gratuito, reseteamos el costo.
    if (name === "tipo_costo" && value === "gratuito") {
      setFormState((prev) => ({
        ...prev,
        costo: "",
      }))
    }
  }

  const handleSubgrupoChange = (e) => {
    const subgrupoId = e.target.value
    setSelectedSubgrupo(subgrupoId)
    setFormState((prev) => ({
      ...prev,
      id_subgrupo: subgrupoId,
      id_habilidades: [], // Reseteamos las habilidades al cambiar de subgrupo
    }))
    fetchHabilidadesBySubgrupo(subgrupoId)
  }

  const handleUniversidadChange = async (e) => {
    const uniId = e.target.value
    setSelectedUniversidad(uniId)
    setSelectedFacultad("")
    setSelectedCarrera("")
    setFormState((prev) => ({
      ...prev,
      id_universidad: uniId,
      id_facultad: "",
      id_carrera: "",
      id_maestro: "",
    }))
    setFacultades([])
    setCarreras([])
    setTeachers([])
    await fetchFacultades(uniId)
  }

  const handleFacultadChange = async (e) => {
    const facId = e.target.value
    setSelectedFacultad(facId)
    setSelectedCarrera("")
    setFormState((prev) => ({
      ...prev,
      id_facultad: facId,
      id_carrera: "",
      id_maestro: "",
    }))
    setCarreras([])
    setTeachers([])
    await fetchCarreras(facId)
  }

  const handleCarreraChange = async (e) => {
    const carId = e.target.value
    setSelectedCarrera(carId)
    setFormState((prev) => ({
      ...prev,
      id_carrera: carId,
      id_maestro: "",
    }))
    setTeachers([])
    if (isEditing) {
      await fetchTeachers({
        universidadId: selectedUniversidad,
        facultadId: selectedFacultad,
        carreraId: carId,
      })
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${formState.id_curso}` : API_URL
    const successMessage = isEditing ? "Curso actualizado con éxito." : "Curso creado con éxito."

    // --- VALIDACIÓN FINAL EN FRONTEND ---
    const totalHoras = Number.parseInt(formState.duracion_horas, 10) || 0
    const teoriaHoras = Number.parseInt(formState.horas_teoria, 10) || 0
    const practicaHoras = Number.parseInt(formState.horas_practica, 10) || 0

    if (totalHoras > 0 && (teoriaHoras === 0 || practicaHoras === 0)) {
      showToast("Un curso debe tener al menos 1 hora de teoría y 1 de práctica.", "error")
      return
    }
    if (totalHoras > 0 && teoriaHoras + practicaHoras !== totalHoras) {
      showToast("La suma de horas de teoría y práctica debe ser igual a la duración total.", "error")
      return
    }

    // Aseguramos que los IDs de la jerarquía de universidad se incluyan
    const bodyToSend = {
      ...formState,
      id_universidad: selectedUniversidad || formState.id_universidad || null,
      id_facultad: selectedFacultad || formState.id_facultad || null,
      id_carrera: selectedCarrera || formState.id_carrera || null,
      id_maestro: formState.id_maestro || null, // Asegurar null si no se selecciona
    }

    // Remueve codigo_curso si no está editando, para evitar errores en el backend
    if (!isEditing && bodyToSend.codigo_curso) {
      delete bodyToSend.codigo_curso
    }

    // Asegura que los valores vacíos sean null si no son requeridos
    if (bodyToSend.costo === "") {
      bodyToSend.costo = null
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyToSend),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Ocurrió un error desconocido.")
      }
      showToast(successMessage, "success")
      handleCloseModal()
      fetchCourses()
    } catch (err) {
      showToast(`Error: ${err.message}`, "error")
    }
  }

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return
    try {
      const response = await fetch(`${API_URL}/${courseToDelete.id_curso}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "La eliminación falló.")
      }
      showToast("Curso eliminado con éxito.", "success")
      handleCloseDeleteModal()
      fetchCourses()
    } catch (err) {
      showToast(`Error: ${err.message}`, "error")
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando cursos...</p>
        </div>
      )
    }
    if (error) {
      return (
        <div className={styles.emptyState}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Un error ha ocurrido</h3>
          <p>{error}</p>
          <button onClick={fetchCourses} className={styles.emptyStateButton}>
            Intentar de nuevo
          </button>
        </div>
      )
    }
    if (courses.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faBook} size="3x" />
          <h3>No se encontraron cursos</h3>
          <p>Comienza agregando un nuevo curso para empezar.</p>
          <button onClick={() => handleOpenModal()} className={styles.emptyStateButton}>
            <i className="fas fa-plus"></i> Agregar Curso
          </button>
        </div>
      )
    }

    return (
      <>
        {/* Vista móvil - Tarjetas */}
        <div className={styles.mobileView}>
          {courses.map((course) => (
            <div key={course.id_curso} className={styles.courseCard}>
              <div className={styles.cardContent}>
                <h3 className={styles.courseName}>{course.nombre_curso}</h3>
                <p className={styles.courseInfo}>
                  <strong>Código:</strong> {course.codigo_curso || "N/A"}
                </p>
                <p className={styles.courseInfo}>
                  <strong>Universidad:</strong> {course.nombre_universidad || "N/A"}
                </p>
                <p className={styles.courseInfo}>
                  <strong>Nivel:</strong> {course.nivel}
                </p>
                <p className={styles.courseInfo}>
                  <strong>Duración:</strong> {course.duracion_horas} horas
                </p>
                {course.nombre_credencial && (
                  <p className={styles.courseInfo}>
                    <strong>Credencial:</strong> {course.nombre_credencial}
                  </p>
                )}
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleOpenModal(course)}
                    className={styles.editButton}
                    title="Editar curso"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(course)}
                    className={styles.deleteButton}
                    title="Eliminar curso"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop - Tabla */}
        <div className={styles.desktopView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Universidad</th>
                <th>Nivel</th>
                <th>Duración (horas)</th>
                <th>Credencial</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id_curso}>
                  <td>{course.nombre_curso}</td>
                  <td>{course.codigo_curso}</td>
                  <td>{course.nombre_universidad || "N/A"}</td>
                  <td>{course.nivel}</td>
                  <td>{course.duracion_horas}</td>
                  <td>{course.nombre_credencial || ""}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button onClick={() => handleOpenModal(course)} className={styles.editButton}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleOpenDeleteModal(course)} className={styles.deleteButton}>
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
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Cursos</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} /> Agregar Curso
          </button>
          <div className={styles.searchContainer}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {renderContent()}
        {courses.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing{" "}
              <strong>
                {(page - 1) * 10 + 1}-{Math.min(page * 10, totalCourses)}
              </strong>{" "}
              of <strong>{totalCourses}</strong>
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className={styles.pageButton}
              >
                Antes
              </button>
              <span className={styles.pageButton} style={{ cursor: "default" }}>
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className={styles.pageButton}
              >
                Despues
              </button>
            </div>
          </div>
        )}
      </main>
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{isEditing ? "Editar Curso" : "Agregar Nuevo Curso"}</h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {" "}
                {/* Este div se mantiene para el layout */}
                {/* --- INICIO DE LA SECCIÓN DE FILTROS --- */}
                <>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="universidad">Universidad</label>
                    <select
                      id="universidad"
                      name="universidad"
                      value={selectedUniversidad}
                      onChange={handleUniversidadChange}
                      required
                    >
                      <option value="">Seleccione una universidad</option>
                      {universidades.map((uni) => (
                        <option key={uni.id_universidad} value={uni.id_universidad}>
                          {uni.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isFacultadesLoading ? (
                    <p>Cargando facultades...</p>
                  ) : (
                    selectedUniversidad && (
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="facultad">Facultad</label>
                        <select
                          id="facultad"
                          name="facultad"
                          value={selectedFacultad}
                          onChange={handleFacultadChange}
                          required
                        >
                          <option value="">Seleccione una facultad</option>
                          {facultades.map((fac) => (
                            <option key={fac.id_facultad} value={fac.id_facultad}>
                              {fac.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  )}

                  {isCarrerasLoading ? (
                    <p>Cargando carreras...</p>
                  ) : (
                    selectedFacultad && (
                      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="carrera">Carrera</label>
                        <select id="carrera" name="carrera" value={selectedCarrera} onChange={handleCarreraChange}>
                          <option value="">Seleccione una carrera</option>
                          {carreras.map((car) => (
                            <option key={car.id_carrera} value={car.id_carrera}>
                              {car.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  )}

                  {isEditing && (
                    <>
                      {isTeachersLoading ? (
                        <p>Cargando maestros...</p>
                      ) : (
                        selectedFacultad && (
                          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="id_maestro">Maestro (Opcional)</label>
                            <select
                              id="id_maestro"
                              name="id_maestro"
                              value={formState.id_maestro || ""}
                              onChange={handleFormChange}
                            >
                              <option value="">Seleccione un maestro (opcional)</option>
                              {teachers.map((teacher) => (
                                <option key={teacher.id_maestro} value={teacher.id_maestro}>
                                  {teacher.nombre_completo}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      )}
                    </>
                  )}
                </>
                {/* --- FIN DE LA SECCIÓN DE FILTROS --- */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="nombre_curso">Nombre del Curso</label>
                  <input
                    type="text"
                    id="nombre_curso"
                    name="nombre_curso"
                    value={formState.nombre_curso}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formState.descripcion}
                    onChange={handleFormChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="objetivos">Objetivos</label>
                  <textarea
                    id="objetivos"
                    name="objetivos"
                    value={formState.objetivos || ""}
                    onChange={handleFormChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="prerequisitos">Prerrequisitos</label>
                  <textarea
                    id="prerequisitos"
                    name="prerequisitos"
                    value={formState.prerequisitos || ""}
                    onChange={handleFormChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="duracion_horas">Duración (horas)</label>
                  <input
                    type="number"
                    id="duracion_horas"
                    name="duracion_horas"
                    value={formState.duracion_horas}
                    onChange={handleFormChange}
                    onWheel={(e) => e.target.blur()}
                    min="1"
                    required
                  />
                </div>
                {/* Horas de Teoría y Práctica (condicional) */}
                {formState.duracion_horas > 0 && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="horas_teoria">Horas de Teoría</label>
                      <input
                        type="number"
                        id="horas_teoria"
                        name="horas_teoria"
                        value={formState.horas_teoria || ""}
                        onChange={handleFormChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        placeholder="Ej. 20"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="horas_practica">Horas de Práctica</label>
                      <input
                        type="number"
                        id="horas_practica"
                        name="horas_practica"
                        value={formState.horas_practica || ""}
                        onChange={handleFormChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        placeholder="Ej. 10"
                      />
                      <small className={styles.formHint}>
                        Asignadas:{" "}
                        {(Number.parseInt(formState.horas_teoria, 10) || 0) +
                          (Number.parseInt(formState.horas_practica, 10) || 0)}{" "}
                        de {Number.parseInt(formState.duracion_horas, 10) || 0} horas.
                      </small>
                    </div>
                  </>
                )}
                {isEditing && (
                  <div className={styles.formGroup}>
                    <label htmlFor="estatus_curso">Estatus del Curso</label>
                    <select
                      id="estatus_curso"
                      name="estatus_curso"
                      value={formState.estatus_curso || "planificado"}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="planificado">Planificado</option>
                      <option value="abierto">Abierto</option>
                      <option value="en_curso">En Curso</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="cupo_maximo">Cupo Máximo</label>
                  <input
                    type="number"
                    id="cupo_maximo"
                    name="cupo_maximo"
                    value={formState.cupo_maximo}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="fecha_inicio">Fecha de Inicio</label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formState.fecha_inicio}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="fecha_fin">Fecha de Fin</label>
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formState.fecha_fin}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="id_subgrupo">Subgrupo Operador</label>
                  <select
                    id="id_subgrupo"
                    name="id_subgrupo"
                    value={selectedSubgrupo}
                    onChange={handleSubgrupoChange}
                    required
                  >
                    <option value="">Seleccione un subgrupo</option>
                    {subgrupos.map((subgrupo) => (
                      <option key={subgrupo.id_subgrupo} value={subgrupo.id_subgrupo}>
                        {subgrupo.nombre_subgrupo}
                      </option>
                    ))}
                  </select>
                </div>
                {isHabilidadesLoading ? (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Habilidades Clave</label>
                    <select disabled>
                      <option>Cargando habilidades...</option>
                    </select>
                  </div>
                ) : (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Habilidades Clave</label>
                    <div className={styles.habilidadesDisplay}>
                      {habilidadesSubgrupo.length === 0 ? (
                        <p className={styles.noHabilidades}>
                          {selectedSubgrupo
                            ? "No hay habilidades disponibles para este subgrupo"
                            : "Seleccione un subgrupo para ver sus habilidades"}
                        </p>
                      ) : (
                        <div className={styles.habilidadesList}>
                          {habilidadesSubgrupo.map((habilidad) => (
                            <span key={habilidad.id_habilidad} className={styles.habilidadTag}>
                              {habilidad.nombre_habilidad}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="nivel">Nivel</label>
                  <select id="nivel" name="nivel" value={formState.nivel} onChange={handleFormChange} required>
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo_costo">Tipo de Costo</label>
                  <select
                    id="tipo_costo"
                    name="tipo_costo"
                    value={formState.tipo_costo}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="gratuito">Gratuito</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
                {/* Este bloque aparecerá solo si se selecciona "De Pago" */}
                {formState.tipo_costo === "pago" && (
                  <div className={styles.formGroup}>
                    <label htmlFor="costo">Costo (MXN)</label>
                    <input
                      type="number"
                      id="costo"
                      name="costo"
                      value={formState.costo || ""}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label htmlFor="modalidad">Modalidad</label>
                  <select
                    id="modalidad"
                    name="modalidad"
                    value={formState.modalidad}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="presencial">Presencial</option>
                    <option value="mixto">Semipresencial/Mixto</option>
                    <option value="virtual">Virtual</option>
                    <option value="virtual_autogestiva">Virtual Autogestiva</option>
                    <option value="virtual_mixta">Virtual Mixta</option>
                    <option value="virtual-presencial">Virtual</option>
                  </select>
                </div>
              </div>{" "}
              {/* Cierre de formGrid */}
              {isEditing && (
                <div className={styles.managementGrid}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openPlaneacion(formState)
                    }}
                    className={styles.managementButton}
                  >
                    <FontAwesomeIcon icon={faListCheck} className={styles.managementButtonIcon} />
                    <span className={styles.managementButtonText}>Planear Curso</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openMaterial(formState)
                    }}
                    className={styles.managementButton}
                  >
                    <FontAwesomeIcon icon={faDownload} className={styles.managementButtonIcon} />
                    <span className={styles.managementButtonText}>Material a Descargar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openHorarios()
                    }}
                    className={styles.managementButton}
                  >
                    <FontAwesomeIcon icon={faClock} className={styles.managementButtonIcon} />
                    <span className={styles.managementButtonText}>Agregar Horario</span>
                  </button>
                </div>
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseModal()
                  }}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleFormSubmit(e)
                  }}
                  className={styles.saveButton}
                >
                  <i className="fas fa-save"></i> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {openPlaneacionCurso && cursoPlaneacion && (
        <PlaneacionCurso
          curso={cursoPlaneacion}
          token={token}
          onClose={() => closePlaneacion()}
          onSave={() => {
            showToast("Planeación guardada correctamente", "success")
            closePlaneacion()
          }}
        />
      )}
      {openMaterialModal && cursoMaterial && (
        <MaterialADescargar
          curso={cursoMaterial}
          onClose={() => closeMaterial(true)}
          showToast={showToast}
          showConfirmModal={showConfirmModal}
        />
      )}
      {openHorariosModal && isEditing && formState.id_curso && (
        <div className={styles.modalBackdrop} onClick={closeHorarios}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Gestión de Horarios</h3>
              <button onClick={closeHorarios} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <GestionHorarios key={`horarios-${formState.id_curso}`} cursoId={formState.id_curso} />
            </div>
          </div>
        </div>
      )}
      {confirmModal.show && (
        <div className={styles.modalBackdrop} onClick={closeConfirmModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={`${styles.deleteIcon} ${styles[confirmModal.type] || styles.warning}`}>
                {confirmModal.type === "success" ? "✅" : confirmModal.type === "error" ? "❌" : "⚠️"}
              </div>
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>
            </div>
            <div className={styles.deleteActions}>
              <button onClick={closeConfirmModal} className={styles.cancelButton}>
                {confirmModal.onConfirm ? "Cancelar" : "Cerrar"}
              </button>
              {confirmModal.onConfirm && (
                <button
                  onClick={() => {
                    confirmModal.onConfirm()
                    closeConfirmModal()
                  }}
                  className={styles.confirmDeleteButton}
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar el curso <strong>{courseToDelete?.nombre_curso}</strong>? Esta
                acción no se puede deshacer.
              </p>
            </div>
            <div className={styles.deleteActions}>
              <button onClick={handleCloseDeleteModal} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className={styles.confirmDeleteButton}>
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type] || styles.success}`}>
            <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
