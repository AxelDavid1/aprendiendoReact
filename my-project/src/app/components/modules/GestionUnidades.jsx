import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./GestionUnidades.module.css";

const API_URL = "/api/unidades";

const initialUnidadState = {
  id_unidad: null,
  nombre_unidad: "",
  descripcion_unidad: "",
};

function GestionUnidades({ cursoId }) {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState(initialUnidadState);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para el modal de confirmación personalizado
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [unidadToDelete, setUnidadToDelete] = useState(null);

  const fetchUnidades = useCallback(async () => {
    if (!cursoId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/curso/${cursoId}`);
      if (!response.ok) throw new Error("Error al cargar las unidades.");
      const data = await response.json();
      setUnidades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  // Estabilizamos showToast con useCallback para que no se recree en cada render
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  }, []); // Dependencia vacía porque solo usa un setter de estado

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenForm = (unidad = null) => {
    if (unidad) {
      setIsEditing(true);
      // Asegurarse de que todos los datos, incluido el id y orden, se cargan para la edición
      setFormState({
        id_unidad: unidad.id_unidad,
        nombre_unidad: unidad.nombre_unidad,
        descripcion_unidad: unidad.descripcion_unidad || "",
        orden: unidad.orden,
      });
    } else {
      setIsEditing(false);
      setFormState(initialUnidadState);
    }
    setIsFormVisible(true);
  };

  // Se envuelve en useCallback para estabilizar la función y seguir buenas prácticas.
  const handleCloseForm = useCallback(() => {
    setIsFormVisible(false);
    setIsEditing(false);
    setFormState(initialUnidadState);
  }, []); // No tiene dependencias, solo usa setters y estado inicial.

  const handleSubmit = useCallback(
    async (e) => {
      e.stopPropagation(); // ¡Importante! Evita que el formulario padre se envíe.
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/${formState.id_unidad}` : API_URL;

      // El backend ahora se encarga de calcular el orden en la creación.
      // Solo enviamos el orden cuando estamos actualizando.
      const body = {
        id_curso: cursoId,
        nombre_unidad: formState.nombre_unidad,
        descripcion_unidad: formState.descripcion_unidad,
        ...(isEditing && { orden: formState.orden }),
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Ocurrió un error.");
        }
        showToast(
          `Unidad ${isEditing ? "actualizada" : "creada"} con éxito.`,
          "success",
        );
        fetchUnidades();
        handleCloseForm();
      } catch (err) {
        console.error("Error al guardar la unidad:", err);
        showToast(`Error: ${err.message}`, "error");
      }
    },
    [cursoId, formState, isEditing, fetchUnidades, handleCloseForm, showToast],
  );

  // Función para abrir el modal de confirmación personalizado
  const handleDeleteClick = useCallback(
    (e, unidad) => {
      e.stopPropagation();
      e.preventDefault();

      // Prevenir eliminaciones simultáneas para evitar el bug de renderizado
      if (isDeleting) {
        showToast(
          "Por favor espera a que termine la operación anterior.",
          "warning",
        );
        return;
      }

      setUnidadToDelete(unidad);
      setShowConfirmModal(true);
    },
    [isDeleting, showToast],
  );

  // Función para confirmar la eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!unidadToDelete) return;

    setIsDeleting(true);
    setShowConfirmModal(false);

    try {
      const response = await fetch(`${API_URL}/${unidadToDelete.id_unidad}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error al eliminar la unidad.");
      }

      showToast("Unidad eliminada con éxito.", "success");

      setUnidades((prevUnidades) =>
        prevUnidades.filter((u) => u.id_unidad !== unidadToDelete.id_unidad),
      );

      // Forzar repintado para Brave en Linux
      if (
        navigator.userAgent.includes("Chrome") &&
        navigator.platform.includes("Linux")
      ) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const forceRepaint = document.createElement("div");
            forceRepaint.style.cssText =
              "position:absolute;left:-1px;top:-1px;width:1px;height:1px;";
            document.body.appendChild(forceRepaint);
            document.body.removeChild(forceRepaint);
          });
        });
      }
    } catch (err) {
      console.error("Error al eliminar la unidad:", err);
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setTimeout(() => {
        setIsDeleting(false);
        setUnidadToDelete(null);
      }, 300);
    }
  }, [unidadToDelete, showToast]);

  // Función para cancelar la eliminación
  const handleCancelDelete = useCallback(() => {
    setShowConfirmModal(false);
    setUnidadToDelete(null);
  }, []);

  return (
    <div className={styles.gestionContainer}>
      <h4>Gestión de Unidades del Curso</h4>
      {loading && <p>Cargando unidades...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && unidades.length === 0 && !isFormVisible && (
        <div className={styles.emptyState}>
          <p>Este curso aún no tiene unidades temáticas definidas.</p>
        </div>
      )}

      <ul className={styles.unidadesList}>
        {unidades.map((u) => (
          <li key={u.id_unidad} className={styles.unidadItem}>
            <div className={styles.unidadInfo}>
              <span className={styles.unidadOrden}>{u.orden + 1}.</span>
              <span className={styles.unidadNombre}>{u.nombre_unidad}</span>
            </div>
            <div className={styles.unidadActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenForm(u);
                }}
                className={styles.actionButton}
                title="Editar"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                onClick={(e) => handleDeleteClick(e, u)}
                className={styles.actionButton}
                title="Eliminar"
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!isFormVisible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenForm();
          }}
          className={styles.addButton}
        >
          <FontAwesomeIcon icon={faPlus} /> Agregar Unidad
        </button>
      )}

      {isFormVisible && (
        <div className={styles.unidadForm}>
          <h5>{isEditing ? "Editar Unidad" : "Nueva Unidad"}</h5>
          <div className={styles.formGroup}>
            <label>Nombre de la Unidad</label>
            <input
              type="text"
              name="nombre_unidad"
              value={formState.nombre_unidad}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Descripción (Opcional)</label>
            <textarea
              name="descripcion_unidad"
              value={formState.descripcion_unidad || ""}
              onChange={handleFormChange}
              rows="3"
            ></textarea>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleCloseForm}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              className={styles.saveButton}
            >
              Guardar Unidad
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación personalizado */}
      {showConfirmModal && (
        <div
          className={styles.confirmModalBackdrop}
          onClick={handleCancelDelete}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmModalContent}>
              <div className={styles.confirmIcon}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de que quieres eliminar la unidad{" "}
                <strong>"{unidadToDelete?.nombre_unidad}"</strong>?
              </p>
              <p className={styles.warningText}>Esta acción no se puede deshacer.</p>
            </div>
            <div className={styles.confirmActions}>
              <button
                onClick={handleCancelDelete}
                className={styles.cancelButton}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className={styles.deleteConfirmButton}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type]}`}>
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
            />
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUnidades;
