import React, { useState, useEffect, useCallback } from "react";
import styles from "./GestionMaestros.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faChalkboardTeacher,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { authenticatedFetch } from "@/utils/api";


// Define the base URL of your backend API
const API_URL = "/api/maestros";
const API_URL_UNIVERSIDADES = "/api/universidades";
const API_URL_FACULTADES = "/api/facultades";
const API_URL_CARRERAS = "/api/carreras";
const SERVER_URL = "";

// Initial state for the form
const initialMaestroState = {
  id_maestro: null,
  id_usuario: null,
  id_universidad: "",
  id_facultad: "",
  id_carrera: "",
  nombre_completo: "",
  email_institucional: "",
  especialidad: "",
  grado_academico: "",
  fecha_ingreso: "",
  email_admin: "",
  password: "",
};

const gradosAcademicos = [
  { value: "licenciatura", label: "Licenciatura" },
  { value: "maestria", label: "Maestría" },
  { value: "doctorado", label: "Doctorado" },
  { value: "posdoctorado", label: "Posdoctorado" },
];

function GestionMaestros({
  userId,
  canEdit = true,
  dashboardType = "sedeq",
  userUniversityId,
}) {
  // Data and loading state
  const [maestros, setMaestros] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFacultadesLoading, setIsFacultadesLoading] = useState(false);
  const [isCarrerasLoading, setIsCarrerasLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMaestros, setTotalMaestros] = useState(0);

  // Search and debounce state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialMaestroState);
  const [isEditing, setIsEditing] = useState(false); // false for add, true for edit
  const [maestroToDelete, setMaestroToDelete] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const isUniversityDashboard =
    dashboardType === "university" && userUniversityId;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch maestros from the backend API
  const fetchMaestros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: "10",
        searchTerm: debouncedSearchTerm,
      });

      if (isUniversityDashboard) {
        params.append("id_universidad", userUniversityId);
      }

      const url = `${API_URL}?${params.toString()}`;
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error ||
            `Failed to fetch data: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      setMaestros(data.maestros);
      setTotalPages(data.totalPages);
      setTotalMaestros(data.total);
    } catch (err) {
      setError(err.message);
      setMaestros([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, isUniversityDashboard, userUniversityId]);

  // Fetch universidades for dropdown
  const fetchUniversidades = useCallback(async () => {
    try {
      const response = await authenticatedFetch("/api/universidades?limit=9999");
      if (!response.ok) throw new Error("Could not fetch universities");
      const data = await response.json();
      const universities = data.universities || [];
      if (isUniversityDashboard) {
        const filtered = universities.filter(
          (uni) => uni.id_universidad?.toString() === userUniversityId,
        );
        setUniversidades(filtered);
      } else {
        setUniversidades(universities);
      }
    } catch (err) {
      console.error("Failed to fetch universities:", err);
      setUniversidades([]);
    }
  }, [isUniversityDashboard, userUniversityId]);

  useEffect(() => {
    fetchMaestros();
    fetchUniversidades();
  }, [fetchMaestros, fetchUniversidades]);

  const fetchFacultades = useCallback(async (idUniversidad) => {
    if (!idUniversidad) {
      setFacultades([]);
      setCarreras([]);
      return;
    }
    setIsFacultadesLoading(true);
    try {
      const response = await authenticatedFetch(
        `${API_URL_FACULTADES}/universidad/${idUniversidad}`,
      );
      if (!response.ok) throw new Error("Could not fetch faculties");
      const data = await response.json();
      console.log("Respuesta de facultades:", data); // Log para depurar
      setFacultades(data.data || []);
    } catch (err) {
      console.error("Failed to fetch faculties:", err);
      setFacultades([]);
    } finally {
      setIsFacultadesLoading(false);
    }
  }, []);

  const fetchCarreras = useCallback(async (idFacultad) => {
    if (!idFacultad) {
      setCarreras([]);
      return;
    }
    setIsCarrerasLoading(true);
    try {
      const response = await authenticatedFetch(
        `${API_URL_CARRERAS}/facultad/${idFacultad}`,
      );
      if (!response.ok) throw new Error("Could not fetch careers");
      const data = await response.json();
      setCarreras(data.data || []);
    } catch (err) {
      console.error("Failed to fetch careers:", err);
      setCarreras([]);
    } finally {
      setIsCarrerasLoading(false);
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleOpenModal = (maestro = null) => {
    if (maestro) {
      // Edit operation
      setIsEditing(true);
      setFormState({
        ...initialMaestroState,
        ...maestro,
        id_facultad: maestro.id_facultad || "",
        id_carrera: maestro.id_carrera || "",
        password: "", // Clear password for security
      });

      // Cargar facultades y carreras al editar
      if (maestro.id_universidad) {
        fetchFacultades(maestro.id_universidad).then(() => {
          if (maestro.id_facultad) {
            fetchCarreras(maestro.id_facultad);
          }
        });
      }
    } else {
      // Add operation
      setIsEditing(false);
      setFormState({
        ...initialMaestroState,
        id_universidad: isUniversityDashboard ? userUniversityId : "",
      });
      setFacultades([]);
      setCarreras([]);
      if (isUniversityDashboard) {
        fetchFacultades(userUniversityId);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState(initialMaestroState);
  };

  const handleOpenDeleteModal = (maestro) => {
    setMaestroToDelete(maestro);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMaestroToDelete(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "id_universidad") {
      setCarreras([]);
      setFormState((prev) => ({ ...prev, id_facultad: "", id_carrera: "" }));
      fetchFacultades(value);
    }

    if (name === "id_facultad") {
      setFormState((prev) => ({ ...prev, id_carrera: "" }));
      fetchCarreras(value);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const body = {
      id_universidad: isUniversityDashboard
        ? userUniversityId
        : formState.id_universidad,
      id_facultad: formState.id_facultad, // <-- Añadido
      id_carrera: formState.id_carrera, // <-- Añadido
      nombre_completo: formState.nombre_completo,
      email_institucional: formState.email_institucional,
      especialidad: formState.especialidad,
      grado_academico: formState.grado_academico,
      fecha_ingreso: formState.fecha_ingreso,
      email_admin: formState.email_admin,
      ...(formState.password && { password: formState.password }),
      tipo_usuario: "maestro",
    };

    const url = isEditing ? `${API_URL}/${formState.id_maestro}` : API_URL;
    const method = isEditing ? "PUT" : "POST";
    const successMessage = isEditing
      ? "Maestro actualizado con éxito."
      : "Maestro creado con éxito.";

    try {
      const response = await authenticatedFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Ocurrió un error desconocido.");
      }

      showToast(successMessage, "success");
      handleCloseModal();
      fetchMaestros();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!maestroToDelete) return;

    const url = `${API_URL}/${maestroToDelete.id_maestro}`;
    const successMessage = "Maestro eliminado con éxito.";

    try {
      const response = await authenticatedFetch(url, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "La eliminación falló.");
      }

      showToast(successMessage, "success");
      handleCloseDeleteModal();
      fetchMaestros();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const getUniversidadNombre = (id_universidad) => {
    const universidad = universidades.find(
      (u) => u.id_universidad === id_universidad,
    );
    return universidad ? universidad.nombre : "N/A";
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando Maestros...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.emptyState}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Un error ha ocurrido</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchMaestros()}
            className={styles.emptyStateButton}
          >
            Intenta Otra Vez
          </button>
        </div>
      );
    }

    if (maestros.length === 0) {
      return (
        <div className={styles.emptyState}>
          <i className="fas fa-chalkboard-teacher"></i>
          <h3>No se encontraron maestros</h3>
          <p>Comienza agregando un nuevo maestro.</p>
          <button
            onClick={() => handleOpenModal()}
            className={styles.emptyStateButton}
          >
            <i className="fas fa-plus"></i> Agregar Maestro
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.mobileView}>
          {maestros.map((maestro) => (
            <div key={maestro.id_maestro} className={styles.universityCard}>
              <div className={styles.cardContent}>
                <h3 className={styles.universityName}>
                  {maestro.nombre_completo}
                </h3>
                <p className={styles.universityInfo}>
                  <i className="fas fa-envelope"></i>{" "}
                  {maestro.email_institucional}
                </p>
                <p className={styles.universityInfo}>
                  <i className="fas fa-graduation-cap"></i>{" "}
                  {maestro.grado_academico}
                </p>
                <p className={styles.universityInfo}>
                  <i className="fas fa-university"></i>{" "}
                  {getUniversidadNombre(maestro.id_universidad)}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleOpenModal(maestro)}
                  className={styles.editButton}
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(maestro)}
                  className={styles.deleteButton}
                >
                  <i className="fas fa-trash"></i> Borrar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.desktopView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Email Institucional</th>
                <th>Universidad</th>
                <th>Especialidad</th>
                <th>Grado Académico</th>
                <th>Email Admin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maestros.map((maestro) => (
                <tr key={maestro.id_maestro}>
                  <td>{maestro.nombre_completo}</td>
                  <td>{maestro.email_institucional}</td>
                  <td>{getUniversidadNombre(maestro.id_universidad)}</td>
                  <td>{maestro.especialidad}</td>
                  <td>{maestro.grado_academico}</td>
                  <td>{maestro.email_admin || "N/A"}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        onClick={() => handleOpenModal(maestro)}
                        className={styles.editButton}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(maestro)}
                        className={styles.deleteButton}
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
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Maestros</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>SEDEQ</span>
            <button className={styles.userButton}>
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tabContainer}>
          <button className={`${styles.tabButton} ${styles.activeTab}`}>
            <FontAwesomeIcon icon={faChalkboardTeacher} /> Maestros
          </button>
        </div>

        <div className={styles.toolbar}>
          <button
            onClick={() => handleOpenModal()}
            className={styles.addButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Maestro
          </button>
          <div className={styles.searchContainer}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {renderContent()}

        {maestros.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing{" "}
              <strong>
                {(page - 1) * 10 + 1}-{Math.min(page * 10, totalMaestros)}
              </strong>{" "}
              of <strong>{totalMaestros}</strong>
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
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className={styles.pageButton}
              >
                Después
              </button>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{isEditing ? "Editar Maestro" : "Agregar Nuevo Maestro"}</h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label htmlFor="nombre_completo">Nombre Completo</label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formState.nombre_completo}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="id_universidad">Universidad</label>
                  <select
                    id="id_universidad"
                    name="id_universidad"
                    value={formState.id_universidad}
                    onChange={handleFormChange}
                    required
                    disabled={isUniversityDashboard}
                  >
                    {!isUniversityDashboard && (
                      <option value="">Seleccione una</option>
                    )}
                    {universidades.map((uni) => (
                      <option
                        key={uni.id_universidad}
                        value={uni.id_universidad}
                      >
                        {uni.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {isFacultadesLoading ? (
                  <p>Cargando facultades...</p>
                ) : (
                  formState.id_universidad && (
                    <div className={styles.formGroup}>
                      <label htmlFor="id_facultad">Facultad</label>
                      <select
                        id="id_facultad"
                        name="id_facultad"
                        value={formState.id_facultad}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Seleccione una</option>
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
                  formState.id_facultad && (
                    <div className={styles.formGroup}>
                      <label htmlFor="id_carrera">Carrera</label>
                      <select
                        id="id_carrera"
                        name="id_carrera"
                        value={formState.id_carrera}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Seleccione una</option>
                        {carreras.map((car) => (
                          <option key={car.id_carrera} value={car.id_carrera}>
                            {car.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="grado_academico">Grado Académico</label>
                  <select
                    id="grado_academico"
                    name="grado_academico"
                    value={formState.grado_academico}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" disabled>
                      Seleccione una opción
                    </option>
                    {gradosAcademicos.map((grado) => (
                      <option key={grado.value} value={grado.value}>
                        {grado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label htmlFor="especialidad">Especialidad</label>
                  <input
                    type="text"
                    id="especialidad"
                    name="especialidad"
                    value={formState.especialidad}
                    onChange={handleFormChange}
                    placeholder="Ej: Programación, Matemáticas, Administración..."
                  />
                </div>

                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label htmlFor="email_institucional">Email</label>
                  <input
                    type="email"
                    id="email_institucional"
                    name="email_institucional"
                    value={formState.email_institucional}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formState.password || ""}
                    onChange={handleFormChange}
                    placeholder={
                      isEditing ? "Dejar en blanco para no cambiar" : ""
                    }
                    required={!isEditing}
                  />
                </div>
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
                  <i className="fas fa-save"></i> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar al maestro{" "}
                <strong>{maestroToDelete?.nombre_completo}</strong>? Esta acción
                no se puede deshacer.
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
                onClick={handleConfirmDelete}
                className={styles.confirmDeleteButton}
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={styles.toast}>
          <div
            className={`${styles.toastContent} ${styles[toast.type] || styles.success}`}
          >
            <i
              className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
            ></i>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionMaestros;
