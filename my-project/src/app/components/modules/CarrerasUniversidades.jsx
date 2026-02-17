import React, { useState, useEffect, useCallback } from "react";
import styles from "./CarrerasUniversidades.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faBuilding,
  faGraduationCap,
  faTrash,
  faEdit,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { authenticatedFetch } from "@/utils/api";


// Define the base URL of your backend API
const API_URL_UNIVERSIDADES = "/api/universidades";
const API_URL_FACULTADES = "/api/facultades";
const API_URL_CARRERAS = "/api/carreras";

// Initial states for forms
const initialFacultadState = {
  id_facultad: null,
  nombre: "",
};

const initialCarreraState = {
  id_carrera: null,
  nombre: "",
  clave_carrera: "",
  duracion_anos: "",
};

function CarrerasUniversidades() {
  // Data and loading state
  const [universidades, setUniversidades] = useState([]);
  const [selectedUniversidad, setSelectedUniversidad] = useState(null);
  const [facultades, setFacultades] = useState([]);
  const [carrerasByFacultad, setCarrerasByFacultad] = useState({}); // { id_facultad: [carreras] }
  const [loading, setLoading] = useState(true);
  const [isFacultadesLoading, setIsFacultadesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'facultad' or 'carrera'
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [currentFacultadId, setCurrentFacultadId] = useState(null); // For adding/editing carreras
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'facultad' or 'carrera', id }

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch universidades
  const fetchUniversidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${API_URL_UNIVERSIDADES}?limit=9999`);
      if (!response.ok) throw new Error("Error al obtener universidades");
      const data = await response.json();
      setUniversidades(data.universities || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversidades();
  }, [fetchUniversidades]);

  // Fetch facultades for selected universidad
  const fetchFacultades = useCallback(async (idUniversidad) => {
    if (!idUniversidad) return;
    setIsFacultadesLoading(true);
    setLoading(true);
    try {
      const response = await authenticatedFetch(
        `${API_URL_FACULTADES}/universidad/${idUniversidad}`,
      );
      if (!response.ok) throw new Error("Error al obtener facultades");
      const data = await response.json();
      setFacultades(data.data || []);
      // Reset carreras
      setCarrerasByFacultad({});
    } catch (err) {
      setError(err.message);
      setFacultades([]);
    } finally {
      setIsFacultadesLoading(false);
      setLoading(false);
    }
  }, []);

  // Fetch carreras for a facultad
  const fetchCarreras = useCallback(async (idFacultad) => {
    if (!idFacultad) return;
    try {
      const response = await authenticatedFetch(
        `${API_URL_CARRERAS}/facultad/${idFacultad}`,
      );
      if (!response.ok) throw new Error("Error al obtener carreras");
      const data = await response.json();
      setCarrerasByFacultad((prev) => ({
        ...prev,
        [idFacultad]: data.data || [],
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSelectUniversidad = (e) => {
    const id = e.target.value;
    setSelectedUniversidad(id);
    fetchFacultades(id);
  };

  const handleOpenModal = (type, item = null, facultadId = null) => {
    setModalType(type);
    if (item) {
      setIsEditing(true);
      setFormState(item);
    } else {
      setIsEditing(false);
      setFormState(
        type === "facultad" ? initialFacultadState : initialCarreraState,
      );
    }
    setCurrentFacultadId(facultadId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let url, method, body, successMessage;

    if (modalType === "facultad") {
      body = { id_universidad: selectedUniversidad, nombre: formState.nombre };
      if (isEditing) {
        url = `${API_URL_FACULTADES}/${formState.id_facultad}`;
        method = "PUT";
        successMessage = "Facultad actualizada con éxito.";
      } else {
        url = API_URL_FACULTADES;
        method = "POST";
        successMessage = "Facultad creada con éxito.";
      }
    } else if (modalType === "carrera") {
      body = {
        id_facultad: currentFacultadId,
        nombre: formState.nombre,
        clave_carrera: formState.clave_carrera,
        duracion_anos: formState.duracion_anos || null,
      };
      if (isEditing) {
        url = `${API_URL_CARRERAS}/${formState.id_carrera}`;
        method = "PUT";
        successMessage = "Carrera actualizada con éxito.";
      } else {
        url = API_URL_CARRERAS;
        method = "POST";
        successMessage = "Carrera creada con éxito.";
      }
    }

    try {
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error desconocido");
      showToast(successMessage, "success");
      handleCloseModal();
      if (modalType === "facultad") fetchFacultades(selectedUniversidad);
      else fetchCarreras(currentFacultadId);
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleOpenDeleteModal = (type, id) => {
    setItemToDelete({ type, id });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = async () => {
    const { type, id } = itemToDelete;
    let url =
      type === "facultad"
        ? `${API_URL_FACULTADES}/${id}`
        : `${API_URL_CARRERAS}/${id}`;
    try {
      const response = await authenticatedFetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      showToast("Eliminado con éxito", "success");
      handleCloseDeleteModal();
      if (type === "facultad") fetchFacultades(selectedUniversidad);
      else fetchCarreras(currentFacultadId); // Actualizar carreras de la facultad afectada
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const toggleCarreras = (idFacultad) => {
    if (carrerasByFacultad[idFacultad]) {
      // Si ya se muestran las carreras, las ocultamos.
      setCarrerasByFacultad((prev) => {
        const newState = { ...prev };
        delete newState[idFacultad];
        return newState;
      });
    } else {
      // Si no se muestran, las buscamos.
      fetchCarreras(idFacultad);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.emptyState}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedUniversidad) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faUniversity} />
          <h3>Selecciona una universidad</h3>
        </div>
      );
    }

    // Aquí verificamos si las facultades están cargando
    if (isFacultadesLoading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando facultades...</p>
        </div>
      );
    }

    // Si no hay facultades, mostramos un mensaje
    if (facultades.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faBuilding} />
          <h3>No hay facultades</h3>
          <p>Esta universidad aún no tiene facultades registradas.</p>
          <button
            onClick={() => handleOpenModal("facultad")}
            className={styles.emptyStateButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Facultad
          </button>
        </div>
      );
    }

    // Si hay facultades, mostramos la lista
    return (
      <div className={styles.desktopView}>
        {facultades.map((fac) => (
          <div key={fac.id_facultad} className={styles.facultadSection}>
            <div className={styles.facultadHeader}>
              <h3>{fac.nombre}</h3>
              <div className={styles.actions}>
                <button
                  onClick={() => handleOpenModal("facultad", fac)}
                  className={styles.editButton}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() =>
                    handleOpenDeleteModal("facultad", fac.id_facultad)
                  }
                  className={styles.deleteButton}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={() => toggleCarreras(fac.id_facultad)}
                  className={styles.toggleButton}
                >
                  {carrerasByFacultad[fac.id_facultad]
                    ? "Ocultar Carreras"
                    : "Mostrar Carreras"}
                </button>
                <button
                  onClick={() =>
                    handleOpenModal("carrera", null, fac.id_facultad)
                  }
                  className={styles.addButton}
                >
                  <FontAwesomeIcon icon={faPlus} /> Agregar Carrera
                </button>
              </div>
            </div>
            {carrerasByFacultad[fac.id_facultad] && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Clave</th>
                    <th>Duración (años)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrerasByFacultad[fac.id_facultad].map((car) => (
                    <tr key={car.id_carrera}>
                      <td>{car.nombre}</td>
                      <td>{car.clave_carrera}</td>
                      <td>{car.duracion_anos || "N/A"}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleOpenModal("carrera", car, fac.id_facultad)
                          }
                          className={styles.editButton}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() =>
                            handleOpenDeleteModal("carrera", car.id_carrera)
                          }
                          className={styles.deleteButton}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Facultades y Carreras</h1>
          <div className={styles.userInfo}>
            <span className={styles.userName}>SEDEQ</span>
            <button className={styles.userButton}>
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <select
            onChange={handleSelectUniversidad}
            value={selectedUniversidad || ""}
            className={styles.selectUniversidad}
          >
            <option value="">Selecciona una Universidad</option>
            {universidades.map((uni) => (
              <option key={uni.id_universidad} value={uni.id_universidad}>
                {uni.nombre}
              </option>
            ))}
          </select>
          {selectedUniversidad && (
            <button
              onClick={() => handleOpenModal("facultad")}
              className={styles.addButton}
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar Facultad
            </button>
          )}
        </div>
        {renderContent()}
      </main>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {isEditing ? "Editar" : "Agregar"}{" "}
                {modalType === "facultad" ? "Facultad" : "Carrera"}
              </h3>
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
                {modalType === "carrera" && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="clave_carrera">Clave de Carrera</label>
                      <input
                        type="text"
                        id="clave_carrera"
                        name="clave_carrera"
                        value={formState.clave_carrera}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="duracion_anos">Duración (años)</label>
                      <input
                        type="number"
                        id="duracion_anos"
                        name="duracion_anos"
                        value={formState.duracion_anos}
                        onChange={handleFormChange}
                      />
                    </div>
                  </>
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
                  <i className="fas fa-save"></i> Guardar
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
              <p>¿Estás seguro de que quieres eliminar este elemento?</p>
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
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type]}`}>
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

export default CarrerasUniversidades;
