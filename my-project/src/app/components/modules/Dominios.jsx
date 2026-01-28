import React, { useState, useEffect, useCallback } from "react";
import styles from "./Dominios.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "/api/dominios";
const UNIVERSITIES_API_URL = "/api/universidades";

// Simula la obtención del token. En una aplicación real, esto vendría de un AuthContext o localStorage.
const getAuthToken = () => {
  return localStorage.getItem("token");
};

const initialFormState = {
  dominio: "",
  id_universidad: "",
  estatus: "activo",
};

function Dominios({ dashboardType = "sedeq", userUniversityId = null }) {
  const [domains, setDomains] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [domainToModify, setDomainToModify] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const fetchUniversities = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación.");
      }

      let url;
      if (dashboardType === "university" && userUniversityId) {
        // Para admin_universidad, solo obtener su universidad
        url = `${UNIVERSITIES_API_URL}/${userUniversityId}`;
      } else {
        // Para SEDEQ, obtener todas las universidades
        url = `${UNIVERSITIES_API_URL}?limit=9999`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener las universidades.");
      }

      const data = await response.json();
      
      if (dashboardType === "university") {
        // Para admin_universidad, establecer directamente la universidad
        setUniversities([data]);
      } else {
        // Para SEDEQ, mantener la lógica actual
        setUniversities(data.universities || []);
      }
    } catch (err) {
      console.error("Failed to fetch universities:", err);
      setUniversities([]);
    }
  }, [dashboardType, userUniversityId]);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación.");
      }

      let url = API_URL;
      
      // Para admin_universidad, agregar filtro por universidad
      if (dashboardType === "university" && userUniversityId) {
        url += `?universidadId=${userUniversityId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener los dominios.");
      }
      const data = await response.json();
      setDomains(data);
    } catch (err) {
      setError(err.message);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [dashboardType, userUniversityId]);

  useEffect(() => {
    fetchDomains();
    fetchUniversities();
  }, [fetchDomains, fetchUniversities]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleOpenModal = (domain = null) => {
    if (domain) {
      setIsEditing(true);
      setDomainToModify(domain);
      setFormState(domain);
    } else {
      setIsEditing(false);
      // Para admin_universidad, preseleccionar su universidad
      const initialState = { ...initialFormState };
      if (dashboardType === "university" && userUniversityId) {
        initialState.id_universidad = userUniversityId;
      }
      setFormState(initialState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDomainToModify(null);
  };

  const handleOpenDeleteModal = (domain) => {
    setDomainToModify(domain);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDomainToModify(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    const url = isEditing
      ? `${API_URL}/${domainToModify.id_dominio}`
      : API_URL;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Ocurrió un error desconocido.");
      }

      showToast(
        isEditing
          ? "Dominio actualizado con éxito"
          : "Dominio creado con éxito",
        "success",
      );
      handleCloseModal();
      fetchDomains();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!domainToModify) return;
    const token = getAuthToken();
    try {
      const response = await fetch(
        `${API_URL}/${domainToModify.id_dominio}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "La eliminación falló.");
      }

      showToast("Dominio eliminado con éxito", "success");
      handleCloseDeleteModal();
      fetchDomains();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  // Crear un mapa para buscar nombres de universidades eficientemente
  const universityMap = new Map(
    universities.map((uni) => [uni.id_universidad, uni.nombre])
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando Dominios...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.emptyState}>
          <h3>Un error ha ocurrido</h3>
          <p>{error}</p>
          <button onClick={fetchDomains} className={styles.emptyStateButton}>
            Intentar de Nuevo
          </button>
        </div>
      );
    }
    if (domains.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faGlobe} size="2x" />
          <h3>No se encontraron dominios</h3>
          <p>
            Comienza agregando un nuevo dominio para validar registros universitarios.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className={styles.emptyStateButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Dominio
          </button>
        </div>
      );
    }
    return (
      <div className={styles.desktopView}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Dominio</th>
              <th>Universidad</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr key={domain.id_dominio}>
                <td>{domain.id_dominio}</td>
                <td>{domain.dominio}</td>
                <td>{universityMap.get(domain.id_universidad) || 'N/A'}</td>
                <td>
                  <span
                    className={
                      domain.estatus === "activo"
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {domain.estatus}
                  </span>
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      onClick={() => handleOpenModal(domain)}
                      className={styles.editButton}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(domain)}
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
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Dominios</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <button
            onClick={() => handleOpenModal()}
            className={styles.addButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Dominio
          </button>
        </div>
        {renderContent()}
      </main>

      {/* Modal para Agregar/Editar */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "500px" }}
          >
            <div className={styles.modalHeader}>
              <h3>
                {isEditing ? "Editar Dominio" : "Agregar Nuevo Dominio"}
              </h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label htmlFor="id_universidad">Universidad</label>
                <select
                  id="id_universidad"
                  name="id_universidad"
                  value={formState.id_universidad}
                  onChange={handleFormChange}
                  required
                  disabled={dashboardType === "university"}
                  className={dashboardType === "university" ? styles.disabledSelect : ""}
                >
                  <option value="">Seleccione una universidad</option>
                  {universities.map((university) => (
                    <option
                      key={university.id_universidad}
                      value={university.id_universidad}
                    >
                      {university.nombre}
                    </option>
                  ))}
                </select>
                {dashboardType === "university" && (
                  <small className={styles.helperText}>
                    Solo puedes gestionar dominios de tu universidad
                  </small>
                )}
              </div>
              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label htmlFor="dominio">Dominio</label>
                <input
                  type="text"
                  id="dominio"
                  name="dominio"
                  value={formState.dominio}
                  onChange={handleFormChange}
                  placeholder="ejemplo.edu.mx"
                  required
                />
              </div>
              {isEditing && (
                <div className={styles.formGroup}>
                  <label htmlFor="estatus">Estatus</label>
                  <select
                    id="estatus"
                    name="estatus"
                    value={formState.estatus}
                    onChange={handleFormChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div
                className={styles.formActions}
                style={{ gridColumn: "1 / -1" }}
              >
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

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIcon}>
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar el dominio{" "}
                <strong>{domainToModify?.dominio}</strong>? Esta
                acción es permanente y no se puede deshacer.
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
                Confirmar
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
  );
}

export default Dominios;