import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faEdit,
  faTrash,
  faPlus,
  faMinus,
  faUniversity,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Convocatorias.module.css";
import { authenticatedFetch } from "@/utils/api";

const API_URL_CONVOCATORIAS = "/api/convocatorias";
const API_URL_UNIVERSIDADES = "/api/universidades";
const API_URL_SOLICITUDES = "/api/convocatorias/solicitudes/all";

// Estado inicial para el formulario de creación/edición de convocatorias
const initialFormState = {
  nombre: "",
  descripcion: "",
  fecha_aviso_inicio: "",
  fecha_aviso_fin: "",
  fecha_revision_inicio: "",
  fecha_revision_fin: "",
  fecha_ejecucion_inicio: "",
  fecha_ejecucion_fin: "",
  estado: "planeada",
  universidades: [],
};

// Helper para obtener el token (asumiendo que lo guardas en localStorage)
const getAuthToken = () => localStorage.getItem("token");

const formatDate = (dateString) => {
  if (!dateString) return "-";
  // La fecha viene como YYYY-MM-DDTHH:mm:ss.sssZ, la cortamos para evitar problemas de zona horaria
  const date = new Date(dateString.split("T")[0] + "T00:00:00");
  return date.toLocaleDateString("es-ES", { timeZone: "UTC" });
};

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
    rechazada: styles.estadoRechazada,
  };

  return (
    <span
      className={`${styles.estadoBadge} ${estadoClasses[estadoFinal] || ""}`}
    >
      {estadoText[estadoFinal] ||
        estadoFinal.charAt(0).toUpperCase() + estadoFinal.slice(1)}
    </span>
  );
};

function GestionConvocatorias() {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("convocatorias");

  // Estados para los datos
  const [convocatorias, setConvocatorias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [allUniversidades, setAllUniversidades] = useState([]);
  const [universidadesDisponibles, setUniversidadesDisponibles] = useState([]);
  const [universidadesEnConvocatoria, setUniversidadesEnConvocatoria] =
    useState([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [error, setError] = useState(null);

  // Estados para modales y UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Estado para los filtros
  const [filters, setFilters] = useState({
    convocatoria: "",
    universidad: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchConvocatorias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL_CONVOCATORIAS);
      if (!response.ok) throw new Error("Error al cargar las convocatorias.");
      const data = await response.json();
      setConvocatorias(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUniversidades = useCallback(async () => {
    try {
      const response = await authenticatedFetch(`${API_URL_UNIVERSIDADES}?limit=9999`);
      if (!response.ok) throw new Error("Error al cargar las universidades.");
      const data = await response.json();
      setAllUniversidades(data.universities || []);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, []);

  const fetchSolicitudes = useCallback(async () => {
    setLoadingSolicitudes(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No estás autenticado.");

      const response = await fetch(API_URL_SOLICITUDES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar las solicitudes.");
      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingSolicitudes(false);
    }
  }, []); // Dependencia vacía para que se ejecute una vez

  useEffect(() => {
    fetchConvocatorias();
    fetchUniversidades();
  }, [fetchConvocatorias, fetchUniversidades]);

  useEffect(() => {
    if (activeTab === "solicitudes") {
      fetchSolicitudes();
    }
  }, [activeTab, fetchSolicitudes]);

  const handleOpenModal = async (convocatoria = null) => {
    if (convocatoria) {
      setIsEditing(true);
      try {
        const response = await fetch(
          `${API_URL_CONVOCATORIAS}/${convocatoria.id}`,
        );
        if (!response.ok)
          throw new Error("No se pudo cargar la convocatoria para editar.");
        const data = await response.json();

        const formattedData = {
          ...data,
          fecha_aviso_inicio: data.fecha_aviso_inicio.split("T")[0],
          fecha_aviso_fin: data.fecha_aviso_fin.split("T")[0],
          fecha_revision_inicio: data.fecha_revision_inicio
            ? data.fecha_revision_inicio.split("T")[0]
            : "",
          fecha_revision_fin: data.fecha_revision_fin
            ? data.fecha_revision_fin.split("T")[0]
            : "",
          fecha_ejecucion_inicio: data.fecha_ejecucion_inicio.split("T")[0],
          fecha_ejecucion_fin: data.fecha_ejecucion_fin.split("T")[0],
        };
        setFormState(formattedData);

        const idsEnConvocatoria = new Set(
          data.universidades.map((u) => u.universidad_id),
        );
        const enConvocatoria = data.universidades.map((uniConv) => ({
          ...allUniversidades.find(
            (u) => u.id_universidad === uniConv.universidad_id,
          ),
          capacidad_maxima: uniConv.capacidad_maxima,
        }));
        const disponibles = allUniversidades.filter(
          (uni) => !idsEnConvocatoria.has(uni.id_universidad),
        );
        setUniversidadesEnConvocatoria(enConvocatoria);
        setUniversidadesDisponibles(disponibles);
      } catch (err) {
        showToast(err.message, "error");
        return;
      }
    } else {
      setIsEditing(false);
      setFormState(initialFormState);
      setUniversidadesEnConvocatoria([]);
      setUniversidadesDisponibles([...allUniversidades]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState(initialFormState);
    setUniversidadesEnConvocatoria([]);
    setUniversidadesDisponibles([]);
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCapacidadChange = (id_universidad, capacidad) => {
    const nuevaCapacidad = parseInt(capacidad, 10) || 0;
    setUniversidadesEnConvocatoria((prev) =>
      prev.map((uni) =>
        uni.id_universidad === id_universidad
          ? { ...uni, capacidad_maxima: nuevaCapacidad }
          : uni,
      ),
    );
  };

  const agregarUniversidad = (universidad) => {
    const universidadConCapacidad = { ...universidad, capacidad_maxima: 30 }; // Capacidad por defecto
    setUniversidadesEnConvocatoria((prev) => [
      ...prev,
      universidadConCapacidad,
    ]);
    setUniversidadesDisponibles((prev) =>
      prev.filter((u) => u.id_universidad !== universidad.id_universidad),
    );
  };

  const quitarUniversidad = (universidad) => {
    setUniversidadesDisponibles((prev) => [...prev, universidad]);
    setUniversidadesEnConvocatoria((prev) =>
      prev.filter((u) => u.id_universidad !== universidad.id_universidad),
    );
  };
  
  const handleStatusChange = async (solicitudId, nuevoEstado) => {
    const API_URL_UPDATE_SOLICITUD = `/api/convocatorias/solicitudes/${solicitudId}`;
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No estás autenticado.");

      const response = await fetch(API_URL_UPDATE_SOLICITUD, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al actualizar el estado.");

      showToast(`Solicitud ${nuevoEstado} con éxito.`, "success");
      fetchSolicitudes(); // Recargamos la lista para reflejar el cambio
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!convocatoriaToDelete) return;

    const token = getAuthToken();
    if (!token) {
      showToast("No estás autenticado.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL_CONVOCATORIAS}/${convocatoriaToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "No se pudo eliminar la convocatoria.");
      }

      showToast("Convocatoria eliminada con éxito.");
      handleCloseDeleteModal();
      fetchConvocatorias();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  // Manejador para los cambios en los filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      showToast("No estás autenticado.", "error");
      return;
    }

    // Validar que todas las universidades en convocatoria tengan una capacidad > 0
    const universidadesFinales = universidadesEnConvocatoria.map((uni) => ({
      id_universidad: uni.id_universidad,
      capacidad_maxima: uni.capacidad_maxima || 0,
    }));

    if (universidadesFinales.some((uni) => uni.capacidad_maxima <= 0)) {
      showToast(
        "Todas las universidades seleccionadas deben tener una capacidad mayor a 0.",
        "error",
      );
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_URL_CONVOCATORIAS}/${formState.id}`
      : API_URL_CONVOCATORIAS;
    const successMessage = isEditing
      ? "Convocatoria actualizada con éxito."
      : "Convocatoria creada con éxito.";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formState,
          universidades: universidadesFinales,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Ocurrió un error.");

      showToast(successMessage);
      handleCloseModal();
      fetchConvocatorias();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  // Lógica de filtrado
  const filteredConvocatorias = convocatorias.filter(conv => {
    const matchesNombre = filters.convocatoria
      ? conv.id.toString() === filters.convocatoria
      : true;
    const matchesUniversidad = filters.universidad
      ? conv.universidades?.some(
          (uni) => uni.universidad_id?.toString() === filters.universidad,
        ) || conv.universidades?.some(
          (uni) => uni.id_universidad?.toString() === filters.universidad)
      : true;
    return matchesNombre && matchesUniversidad;
  });

  // Renderizado de la tabla de convocatorias
  const renderConvocatoriasContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando convocatorias...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
          <h3>Ocurrió un error</h3>
          <p>{error}</p>
          <button
            onClick={fetchConvocatorias}
            className={styles.emptyStateButton}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    if (filteredConvocatorias.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon
            icon={faCalendarAlt}
            size="3x"
            className={styles.icon}
          />
          <h3>
            {convocatorias.length > 0
              ? "No hay convocatorias que coincidan con tu búsqueda"
              : "No hay convocatorias"}
          </h3>
          <p>Crea una nueva convocatoria para empezar a gestionarlas.</p>
          <button
            onClick={() => handleOpenModal()}
            className={styles.emptyStateButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Convocatoria
          </button>
        </div>
      );
    }
    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fechas Aviso</th>
              <th>Fechas Revisión</th>
              <th>Fechas Ejecución</th>
              <th>Universidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConvocatorias.map((conv) => (
              <tr key={conv.id}>
                <td className={styles.nombreCell}>{conv.nombre}</td>
                <td>{getEstadoBadge(conv.estado, conv.llena)}</td>
                <td className={styles.dateRangeCell}>
                  <div>{formatDate(conv.fecha_aviso_inicio)}</div>
                  <div>{formatDate(conv.fecha_aviso_fin)}</div>
                </td>
                <td className={styles.dateRangeCell}>
                  <div>{formatDate(conv.fecha_revision_inicio)}</div>
                  <div>{formatDate(conv.fecha_revision_fin)}</div>
                </td>
                <td className={styles.dateRangeCell}>
                  <div>{formatDate(conv.fecha_ejecucion_inicio)}</div>
                  <div>{formatDate(conv.fecha_ejecucion_fin)}</div>
                </td>
                <td className={styles.universidadesCell}>
                  {conv.universidades && conv.universidades.length > 0
                    ? conv.universidades.map((uni, index) => (
                        <span key={index} className={styles.universidadItem}>
                          {uni.nombre}
                          <span
                            className={styles.infoIcon}
                            title={`Capacidad máxima: ${uni.capacidad_maxima}\nCupo actual: ${uni.cupo_actual}`}
                          >
                            (i)
                            <div className={styles.tooltip}>
                              <div>
                                Capacidad máxima: {uni.capacidad_maxima}
                              </div>
                              <div>Cupo actual: {uni.cupo_actual}</div>
                            </div>
                          </span>
                          {index < conv.universidades.length - 1 && ", "}
                        </span>
                      ))
                    : "N/A"}
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      onClick={() => handleOpenModal(conv)}
                      className={styles.editButton}
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => {
                        setConvocatoriaToDelete(conv);
                        setIsDeleteModalOpen(true);
                      }}
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
    );
  };

  // Lógica de filtrado para solicitudes
  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesConvocatoria = filters.convocatoria
      ? solicitud.convocatoria_id?.toString() === filters.convocatoria
      : true;
    const matchesUniversidad = filters.universidad
      ? solicitud.id_universidad_alumno?.toString() === filters.universidad
      : true;
    return matchesConvocatoria && matchesUniversidad;
  });

  // Renderizado de la tabla de solicitudes
  const renderSolicitudesContent = () => {
    if (loadingSolicitudes) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando solicitudes...</p>
        </div>
      );
    }
    if (filteredSolicitudes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon
            icon={faCalendarAlt}
            size="3x"
            className={styles.icon}
          />
          <h3>No hay solicitudes</h3>
          <p>
            {solicitudes.length > 0
              ? "No se encontraron solicitudes que coincidan con los filtros."
              : "Aún no hay solicitudes de estudiantes."}
          </p>
        </div>
      );
    }
    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Email</th>
              <th>Convocatoria</th>
              <th>Universidad</th>
              <th>Fecha Solicitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSolicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td className={styles.nombreCell}>{solicitud.alumno_nombre}</td>
                <td>{solicitud.alumno_email}</td>
                <td>{solicitud.convocatoria_nombre}</td>
                <td>{solicitud.universidad_nombre}</td>
                <td>
                  {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                </td>
                <td>{getEstadoBadge(solicitud.estado)}</td>
                <td>
                  <div className={styles.tableActions}>
                    {solicitud.estado === "solicitada" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(solicitud.id, "aceptada")
                          }
                          className={styles.approveButton}
                          title="Aceptar"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(solicitud.id, "rechazada")
                          }
                          className={styles.rejectButton}
                          title="Rechazar"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizado de los filtros
  const renderFilters = () => (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.filterIcon} />
        <select
          value={filters.convocatoria}
          onChange={(e) => handleFilterChange("convocatoria", e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todas las convocatorias</option>
          {convocatorias.map((conv) => (
            <option key={conv.id} value={conv.id}>
              {conv.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <FontAwesomeIcon icon={faUniversity} className={styles.filterIcon} />
        <select
          value={filters.universidad}
          onChange={(e) => handleFilterChange("universidad", e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todas las universidades</option>
          {allUniversidades
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((uni) => (
              <option key={uni.id_universidad} value={uni.id_universidad}>
                {uni.nombre}
              </option>
            ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Convocatorias</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "convocatorias" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("convocatorias")}
          >
            Convocatorias
          </button>
          <button
            className={`${styles.tab} ${activeTab === "solicitudes" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("solicitudes")}
          >
            Aprobación de Estudiantes
          </button>
        </div>

        <div className={styles.toolbar}>
          {activeTab === "convocatorias" ? (
            <button
              onClick={() => handleOpenModal()}
              className={styles.addButton}
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar Convocatoria
            </button>
          ) : (
            <div /> // Placeholder para mantener el layout con space-between
          )}
          {renderFilters()}
        </div>

        {activeTab === "convocatorias"
          ? renderConvocatoriasContent()
          : renderSolicitudesContent()}
      </main>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {isEditing ? "Editar Convocatoria" : "Nueva Convocatoria"}
              </h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formState.nombre}
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
                    placeholder="Opcional"
                  ></textarea>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>Periodo de Aviso</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_aviso_inicio">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        id="fecha_aviso_inicio"
                        name="fecha_aviso_inicio"
                        value={formState.fecha_aviso_inicio}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_aviso_fin">Fecha de Fin</label>
                      <input
                        type="date"
                        id="fecha_aviso_fin"
                        name="fecha_aviso_fin"
                        value={formState.fecha_aviso_fin}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>
                    Periodo de Revisión
                  </h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_revision_inicio">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        id="fecha_revision_inicio"
                        name="fecha_revision_inicio"
                        value={formState.fecha_revision_inicio}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_revision_fin">Fecha de Fin</label>
                      <input
                        type="date"
                        id="fecha_revision_fin"
                        name="fecha_revision_fin"
                        value={formState.fecha_revision_fin}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>
                    Periodo de Ejecución
                  </h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_ejecucion_inicio">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        id="fecha_ejecucion_inicio"
                        name="fecha_ejecucion_inicio"
                        value={formState.fecha_ejecucion_inicio}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_ejecucion_fin">Fecha de Fin</label>
                      <input
                        type="date"
                        id="fecha_ejecucion_fin"
                        name="fecha_ejecucion_fin"
                        value={formState.fecha_ejecucion_fin}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Universidades Participantes</label>
                  <div className={styles.universityManagement}>
                    <div className={styles.universitySection}>
                      <div className={styles.universitySectionHeader}>
                        <h6>Disponibles</h6>
                        <span className={styles.universityCount}>
                          {universidadesDisponibles.length}
                        </span>
                      </div>
                      <div className={styles.universityList}>
                        {universidadesDisponibles.length === 0 ? (
                          <div className={styles.emptyList}>
                            <FontAwesomeIcon
                              icon={faUniversity}
                              className={styles.icon}
                            />
                            <p>No hay más universidades</p>
                          </div>
                        ) : (
                          universidadesDisponibles.map((uni) => (
                            <div
                              key={uni.id_universidad}
                              className={styles.universityItem}
                            >
                              <div className={styles.universityInfo}>
                                <span className={styles.universityName}>
                                  {uni.nombre}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => agregarUniversidad(uni)}
                                className={styles.addUniversityBtn}
                                title="Agregar"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className={styles.universitySection}>
                      <div className={styles.universitySectionHeader}>
                        <h6>En Convocatoria</h6>
                        <span className={styles.universityCount}>
                          {universidadesEnConvocatoria.length}
                        </span>
                      </div>
                      <div className={styles.universityList}>
                        {universidadesEnConvocatoria.length === 0 ? (
                          <div className={styles.emptyList}>
                            <FontAwesomeIcon
                              icon={faUniversity}
                              className={styles.icon}
                            />
                            <p>Agrega universidades</p>
                          </div>
                        ) : (
                          universidadesEnConvocatoria.map((uni) => (
                            <div
                              key={uni.id_universidad}
                              className={`${styles.universityItem} ${styles.selectedUniversityItem}`}
                            >
                              <div className={styles.universityInfo}>
                                <span className={styles.universityNameModal}>
                                  {uni.nombre}
                                </span>
                                <div className={styles.capacidadInputContainer}>
                                  <label
                                    htmlFor={`capacidad-${uni.id_universidad}`}
                                  >
                                    Capacidad:
                                  </label>
                                  <input
                                    type="number"
                                    id={`capacidad-${uni.id_universidad}`}
                                    value={uni.capacidad_maxima || ""}
                                    onChange={(e) =>
                                      handleCapacidadChange(
                                        uni.id_universidad,
                                        e.target.value,
                                      )
                                    }
                                    className={styles.capacidadInput}
                                    min="1"
                                    required
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => quitarUniversidad(uni)}
                                className={styles.removeUniversityBtn}
                                title="Quitar"
                              >
                                <FontAwesomeIcon icon={faMinus} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {isEditing && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="estado">Forzar Estado (ej. Cancelar)</label>
                    <select
                      id="estado"
                      name="estado"
                      value={formState.estado}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="planeada">Planeada</option>
                      <option value="aviso">Aviso</option>
                      <option value="revision">Revisión</option>
                      <option value="activa">Activa</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <small>
                      El estado se calcula automáticamente. Usa esta opción solo
                      para forzar un estado como "Cancelada".
                    </small>
                  </div>
                )}
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={styles.toast}>
          <div
            className={`${styles.toastContent} ${styles[toast.type] || styles.success}`}
          >
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar la convocatoria{" "}
                <strong>"{convocatoriaToDelete?.nombre}"</strong>? Esta acción no
                se puede deshacer.
              </p>
            </div>
            <div className={styles.deleteActions}>
              <button
                onClick={handleCloseDeleteModal}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={styles.confirmDeleteButton}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionConvocatorias;
