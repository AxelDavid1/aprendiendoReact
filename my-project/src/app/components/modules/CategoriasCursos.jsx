import React, { useState, useEffect, useCallback } from "react";
import styles from "./CategoriasCursos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faPlus,
  faEdit,
  faTrash,
  faFolderOpen,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:5000/api/categorias";
const AREAS_API_URL = "http://localhost:5000/api/areas-conocimiento";

// Simula la obtención del token. En una aplicación real, esto vendría de un AuthContext o localStorage.
const getAuthToken = () => {
  // Intenta obtener el token del localStorage.
  // Reemplaza 'authToken' por la clave real que usas para guardar el token.
  return localStorage.getItem("token");
};

const initialAreaState = {
  id_area: null,
  nombre_area: "",
  descripcion: "",
};

const initialCategoryState = {
  id_categoria: null,
  nombre_categoria: "",
  descripcion: "",
  estatus: "activa",
  orden_prioridad: "",
};

function CategoriasCursos() {
  // Data and loading state
  const [areas, setAreas] = useState([]);
  const [categoriesByArea, setCategoriesByArea] = useState({}); // { id_area: [categories] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'area' or 'category'
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [currentAreaId, setCurrentAreaId] = useState(null); // For adding/editing categories
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id, name }

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No se encontró el token de autenticación.");

      const response = await fetch(AREAS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al cargar las áreas.");
      }
      const data = await response.json();
      setAreas(data);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriesForArea = useCallback(async (idArea) => {
    if (!idArea) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/area/${idArea}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener las habilidades.");
      const data = await response.json();
      setCategoriesByArea((prev) => ({
        ...prev,
        [idArea]: data || [],
      }));
    } catch (err) {
      console.error(err);
      showToast(`Error al cargar habilidades: ${err.message}`, "error");
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleOpenModal = (category = null) => {
    // This function is now more generic
    const { type, item, areaId } = category || {};
    setModalType(type);

    if (item) {
      setIsEditing(true);
      setFormState(item);
    } else {
      setIsEditing(false);
      setFormState(
        type === "area" ? initialAreaState : { ...initialCategoryState },
      );
    }
    setCurrentAreaId(areaId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormState({});
    setCurrentAreaId(null);
  };

  const handleOpenDeleteModal = (type, item) => {
    setItemToDelete({
      type,
      id: type === "area" ? item.id_area : item.id_categoria,
      name: type === "area" ? item.nombre_area : item.nombre_categoria,
      areaId: type === "category" ? item.id_area : null, // Guardar id_area para categoría
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

  // Combined form submit for both Areas and Categories
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    let url, method, body, successMessage;

    if (modalType === "area") {
      // Validación básica en frontend
      if (!formState.nombre_area.trim()) {
        showToast("El nombre del área es requerido.", "error");
        return;
      }
      url = isEditing
        ? `${AREAS_API_URL}/${formState.id_area}`
        : AREAS_API_URL;
      method = isEditing ? "PUT" : "POST";
      body = {
        nombre_area: formState.nombre_area,
        descripcion: formState.descripcion,
      };
      successMessage = isEditing
        ? "Área actualizada con éxito"
        : "Área creada con éxito";
    } else if (modalType === "category") {
      // Validación básica en frontend
      if (!formState.nombre_categoria.trim()) {
        showToast("El nombre de la habilidad es requerido.", "error");
        return;
      }
      url = isEditing
        ? `${API_URL}/${formState.id_categoria}`
        : API_URL;
      method = isEditing ? "PUT" : "POST";
      body = { ...formState, id_area: currentAreaId };
      successMessage = isEditing
        ? "Habilidad actualizada con éxito"
        : "Habilidad creada con éxito";
    } else {
      return;
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
        // Mapear errores específicos
        if (response.status === 400) {
          if (result.error.includes("El orden debe estar entre")) {
            showToast(result.error, "error");
          } else {
            showToast("Datos inválidos. Verifica los campos e intenta de nuevo.", "error");
          }
        } else if (response.status === 409) {
          if (result.error.includes("ya existe")) {
            showToast(result.error, "error");
          } else {
            showToast("Conflicto: El orden ya está en uso. Intenta de nuevo.", "error");
          }
        } else {
          showToast(`Error: ${result.error || "Ocurrió un error desconocido."}`, "error");
        }
        return;
      }

      showToast(successMessage, "success");
      handleCloseModal();

      if (modalType === "area") {
        fetchAreas();
      } else {
        fetchCategoriesForArea(currentAreaId);
      }
    } catch (err) {
      showToast(`Error de red: ${err.message}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const token = getAuthToken();
    const { type, id, areaId } = itemToDelete;
    const url = type === "area" ? `${AREAS_API_URL}/${id}` : `${API_URL}/${id}`;

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

      if (type === "area") {
        fetchAreas();
      } else {
        // Refrescar solo el área afectada
        fetchCategoriesForArea(areaId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const toggleCategories = (idArea) => {
    if (categoriesByArea[idArea]) {
      setCategoriesByArea((prev) => {
        const newState = { ...prev };
        delete newState[idArea];
        return newState;
      });
    } else {
      fetchCategoriesForArea(idArea);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando Habilidades...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.emptyState}>
          <h3>Un error ha ocurrido</h3>
          <p>{error || "No se pudieron cargar los datos."}</p>
          <button onClick={fetchAreas} className={styles.emptyStateButton}>
            Intentar de Nuevo
          </button>
        </div>
      );
    }
    if (areas.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faFolderOpen} size="2x" />
          <h3>No hay áreas de conocimiento</h3>
          <p>
            Comienza agregando una nueva habilidad para organizar los cursos.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className={styles.emptyStateButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Área de Conocimiento
          </button>
        </div>
      );
    }

    return (
      <div className={styles.desktopView}>
        {areas.map((area) => (
          <div key={area.id_area} className={styles.areaSection}>
            <div className={styles.areaHeader}>
              <h3>{area.nombre_area}</h3>
              <div className={styles.actions}>
                <button
                  onClick={() => handleOpenModal({ type: "area", item: area })}
                  className={styles.editButton}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleOpenDeleteModal("area", area)}
                  className={styles.deleteButton}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={() => toggleCategories(area.id_area)}
                  className={styles.toggleButton}
                >
                  {categoriesByArea[area.id_area]
                    ? "Ocultar Habilidades"
                    : "Mostrar Habilidades"}
                </button>
                <button
                  onClick={() =>
                    handleOpenModal({ type: "category", areaId: area.id_area })
                  }
                  className={styles.addButton}
                >
                  <FontAwesomeIcon icon={faPlus} /> Agregar Habilidad
                </button>
              </div>
            </div>
            {categoriesByArea[area.id_area] && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Nombre</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesByArea[area.id_area].map((cat) => (
                    <tr key={cat.id_categoria}>
                      <td>{cat.orden_prioridad}</td>
                      <td>{cat.nombre_categoria}</td>
                      <td>
                        <span
                          className={
                            cat.estatus === "activa"
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {cat.estatus}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            onClick={() =>
                              handleOpenModal({
                                type: "category",
                                item: cat,
                                areaId: area.id_area,
                              })
                            }
                            className={styles.editButton}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal("category", cat)}
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
          <h1 className={styles.title}>SubGrupo Operador y Habilidades Clave</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <button
            onClick={() => handleOpenModal({ type: "area" })}
            className={styles.addButton}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Área
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
                {isEditing ? "Editar" : "Agregar"}{" "}
                {modalType === "area" ? "Área de Conocimiento" : "Categoría"}
              </h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.formGrid}>
              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name={
                    modalType === "area" ? "nombre_area" : "nombre_categoria"
                  }
                  value={ (
                    modalType === "area"
                      ? formState.nombre_area
                      : formState.nombre_categoria
                  ) || "" }
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formState.descripcion || ""}
                  onChange={handleFormChange}
                  rows="3"
                ></textarea>
              </div>

              {/* Fields only for CATEGORY modal */}
              {modalType === "category" && (
                <>
                  <div className={styles.formGroup} style={{ gridColumn: "1 / 2" }}>
                    <label htmlFor="orden_prioridad">Orden</label>
                    {isEditing ? (
                      <select
                        id="orden_prioridad"
                        name="orden_prioridad"
                        value={formState.orden_prioridad || ""}
                        onChange={handleFormChange}
                        required
                      >
                        {categoriesByArea[currentAreaId] &&
                          Array.from(
                            { length: categoriesByArea[currentAreaId].length },
                            (_, i) => i + 1
                          ).map((orderNum) => (
                            <option key={orderNum} value={orderNum}>
                              {orderNum}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <>
                        <input type="text" value="Automático" disabled />
                        <small>El orden se asigna automáticamente.</small>
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <div className={styles.formGroup} style={{ gridColumn: "2 / 3" }}>
                      <label htmlFor="estatus">Estatus</label>
                      <select
                        id="estatus"
                        name="estatus"
                        value={formState.estatus}
                        onChange={handleFormChange}
                      >
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                      </select>
                    </div>
                  )}
                </>
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
                ¿Estás seguro de que quieres eliminar el elemento{" "}
                <strong>{itemToDelete?.name}</strong>? Esta
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

export default CategoriasCursos;
