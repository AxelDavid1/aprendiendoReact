import React, { useState, useEffect, useCallback } from "react";
import styles from "./SubgruposYHabilidades.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faList,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const SUBGRUPOS_API_URL = "http://localhost:5000/api/subgrupos-operadores";
const HABILIDADES_API_URL = "http://localhost:5000/api/habilidades-clave";

// Obtener token de autenticación
const getAuthToken = () => {
  return localStorage.getItem("token");
};

const initialSubgrupoState = {
  id_subgrupo: null,
  nombre_subgrupo: "",
  descripcion: "",
};

const initialHabilidadState = {
  id_habilidad: null,
  nombre_habilidad: "",
  descripcion: "",
};

function SubgruposYHabilidades() {
  // State para las pestañas
  const [activeTab, setActiveTab] = useState("subgrupos"); // "subgrupos" | "habilidades"

  // Data state
  const [subgrupos, setSubgrupos] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id, name }

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch Subgrupos Operadores
  const fetchSubgrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No se encontró el token de autenticación.");

      const response = await fetch(SUBGRUPOS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al cargar los subgrupos operadores.");
      }
      const data = await response.json();
      setSubgrupos(data);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setSubgrupos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Habilidades Clave
  const fetchHabilidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No se encontró el token de autenticación.");

      const response = await fetch(HABILIDADES_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al cargar las habilidades clave.");
      }
      const data = await response.json();
      setHabilidades(data);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setHabilidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect para cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === "subgrupos") {
      fetchSubgrupos();
    } else {
      fetchHabilidades();
    }
  }, [activeTab, fetchSubgrupos, fetchHabilidades]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormState(item);
    } else {
      setIsEditing(false);
      setFormState(
        activeTab === "subgrupos" ? { ...initialSubgrupoState } : { ...initialHabilidadState }
      );
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({});
  };

  const handleOpenDeleteModal = (item) => {
    setItemToDelete({
      type: activeTab,
      id: activeTab === "subgrupos" ? item.id_subgrupo : item.id_habilidad,
      name: activeTab === "subgrupos" ? item.nombre_subgrupo : item.nombre_habilidad,
    });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    let url, method, body, successMessage;

    if (activeTab === "subgrupos") {
      if (!formState.nombre_subgrupo.trim()) {
        showToast("El nombre del subgrupo es requerido.", "error");
        return;
      }
      url = isEditing
        ? `${SUBGRUPOS_API_URL}/${formState.id_subgrupo}`
        : SUBGRUPOS_API_URL;
      method = isEditing ? "PUT" : "POST";
      body = {
        nombre_subgrupo: formState.nombre_subgrupo,
        descripcion: formState.descripcion,
      };
      successMessage = isEditing
        ? "Subgrupo operador actualizado con éxito"
        : "Subgrupo operador creado con éxito";
    } else {
      if (!formState.nombre_habilidad.trim()) {
        showToast("El nombre de la habilidad es requerido.", "error");
        return;
      }
      url = isEditing
        ? `${HABILIDADES_API_URL}/${formState.id_habilidad}`
        : HABILIDADES_API_URL;
      method = isEditing ? "PUT" : "POST";
      body = {
        nombre_habilidad: formState.nombre_habilidad,
        descripcion: formState.descripcion,
      };
      successMessage = isEditing
        ? "Habilidad clave actualizada con éxito"
        : "Habilidad clave creada con éxito";
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          showToast(result.error || "El elemento ya existe.", "error");
        } else {
          showToast(`Error: ${result.error || "Ocurrió un error desconocido."}`, "error");
        }
        return;
      }

      showToast(successMessage, "success");
      handleCloseModal();

      if (activeTab === "subgrupos") {
        fetchSubgrupos();
      } else {
        fetchHabilidades();
      }
    } catch (err) {
      showToast(`Error de red: ${err.message}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const token = getAuthToken();
    const { type, id } = itemToDelete;
    const url = type === "subgrupos" 
      ? `${SUBGRUPOS_API_URL}/${id}` 
      : `${HABILIDADES_API_URL}/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "La eliminación falló.");
      }

      showToast("Elemento eliminado con éxito", "success");
      handleCloseDeleteModal();

      if (type === "subgrupos") {
        fetchSubgrupos();
      } else {
        fetchHabilidades();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const renderContent = () => {
    const currentData = activeTab === "subgrupos" ? subgrupos : habilidades;
    const entityName = activeTab === "subgrupos" ? "subgrupos operadores" : "habilidades clave";

    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando {entityName}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.emptyState}>
          <h3>Un error ha ocurrido</h3>
          <p>{error || "No se pudieron cargar los datos."}</p>
          <button
            onClick={activeTab === "subgrupos" ? fetchSubgrupos : fetchHabilidades}
            className={styles.emptyStateButton}
          >
            Intentar de Nuevo
          </button>
        </div>
      );
    }

    if (currentData.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon 
            icon={activeTab === "subgrupos" ? faList : faGraduationCap} 
            size="3x" 
            color="#9ca3af"
          />
          <h3>No hay {entityName}</h3>
          <p>Comienza agregando {activeTab === "subgrupos" ? "un nuevo subgrupo operador" : "una nueva habilidad clave"}.</p>
          <button onClick={() => handleOpenModal()} className={styles.emptyStateButton}>
            <FontAwesomeIcon icon={faPlus} /> Agregar {activeTab === "subgrupos" ? "Subgrupo" : "Habilidad"}
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
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={activeTab === "subgrupos" ? item.id_subgrupo : item.id_habilidad}>
                <td className={styles.nameCell}>
                  {activeTab === "subgrupos" ? item.nombre_subgrupo : item.nombre_habilidad}
                </td>
                <td className={styles.descCell}>
                  {item.descripcion || <span className={styles.noDesc}>Sin descripción</span>}
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      onClick={() => handleOpenModal(item)}
                      className={styles.editButton}
                      title="Editar"
                    >
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
    );
  };

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
                {isEditing ? "Editar" : "Agregar"}{" "}
                {activeTab === "subgrupos" ? "Subgrupo Operador" : "Habilidad Clave"}
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
                  value={
                    activeTab === "subgrupos"
                      ? formState.nombre_subgrupo || ""
                      : formState.nombre_habilidad || ""
                  }
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
                ¿Estás seguro de que quieres eliminar{" "}
                <strong>{itemToDelete?.name}</strong>? Esta acción es permanente y no se puede
                deshacer.
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

export default SubgruposYHabilidades;