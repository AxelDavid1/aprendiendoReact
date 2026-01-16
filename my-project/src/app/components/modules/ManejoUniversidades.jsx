import React, { useState, useEffect, useCallback } from "react";
import styles from "./ManejoUniversidades.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSchool,
  faUserShield,
  faTrash,
  faEdit,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

// Define the base URL of your backend API
const API_URL = "/api/universidades";
const SERVER_URL = "";

// Initial state for the form, including all fields from the database
const initialUniversityState = {
  id_universidad: null,
  nombre: "",
  clave_universidad: "",
  direccion: "",
  telefono: "",
  email_contacto: "",
  ubicacion: "",
  logo_url: "",
  logo_file: null,
  email_admin: "",
  password: "",
};

function ManejoUniversidades() {
  const [activeView, setActiveView] = useState("universidades"); // "universidades" or "admins"
  // Data and loading state
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [allUniversities, setAllUniversities] = useState([]); // For admin assignment dropdown

  // Search and debounce state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialUniversityState);
  const [isEditing, setIsEditing] = useState(false); // false, 'university', 'admin', 'add_admin'
  const [universityToDelete, setUniversityToDelete] = useState(null);
  const [deleteAdminCheckbox, setDeleteAdminCheckbox] = useState(false);

  // Logo file state for form handling
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

  // Fetch universities from the backend API
  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}?page=${page}&limit=10&searchTerm=${debouncedSearchTerm}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error ||
            `Failed to fetch data: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      setUniversities(data.universities);
      setTotalPages(data.totalPages);
      setTotalUniversities(data.total);
    } catch (err) {
      setError(err.message);
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  // Fetch all universities for the dropdown menu
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch with a large limit to get all universities
        const response = await fetch(`${API_URL}?limit=9999`);
        if (!response.ok) throw new Error("Could not fetch university list");
        const data = await response.json();
        setAllUniversities(data.universities || []);
      } catch (err) {
        console.error("Failed to fetch all universities:", err);
        // Optionally, show a toast or error message
      }
    };
    fetchAll();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleOpenModal = (university = null) => {
    if (university) {
      // This is an EDIT operation
      const mode = activeView === "admins" ? "admin" : "university";
      setIsEditing(mode);
      setFormState({ ...initialUniversityState, ...university, password: "" });
      setLogoPreview(
        university.logo_url ? `${SERVER_URL}${university.logo_url}` : "",
      );
    } else {
      // This is an ADD operation
      const mode = activeView === "admins" ? "add_admin" : false;
      setIsEditing(mode);
      setFormState(initialUniversityState);
      setLogoPreview("");
    }
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenDeleteModal = (university) => {
    setUniversityToDelete(university);
    setDeleteAdminCheckbox(false);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (currentUniversity.id_universidad) {
      setCurrentUniversity((prev) => ({ ...prev, logo_url: "" }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    let url;
    let method;
    let successMessage;

    if (isEditing === "university" || isEditing === false) {
      // CREATE or UPDATE University
      formData.append("nombre", formState.nombre);
      formData.append("clave_universidad", formState.clave_universidad);
      formData.append("direccion", formState.direccion);
      formData.append("telefono", formState.telefono);
      formData.append("email_contacto", formState.email_contacto);
      formData.append("ubicacion", formState.ubicacion);
      if (logoFile) formData.append("logo", logoFile);

      if (isEditing) {
        url = `${API_URL}/${formState.id_universidad}`;
        method = "PUT";
        successMessage = "Universidad actualizada con éxito.";
      } else {
        url = API_URL;
        method = "POST";
        successMessage = "Universidad creada con éxito.";
      }
    } else {
      // ADD or UPDATE Admin
      formData.append("email_admin", formState.email_admin);
      if (formState.password) {
        formData.append("password", formState.password);
      }
      url = `${API_URL}/${formState.id_universidad}`;
      method = "PUT";
      successMessage = "Administrador actualizado con éxito.";
    }

    try {
      const response = await fetch(url, { method, body: formData });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Ocurrió un error desconocido.");
      }
      showToast(successMessage, "success");
      handleCloseModal();
      fetchUniversities();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!universityToDelete || !universityToDelete.id_universidad) return;

    const isDeletingAdmin = activeView === "admins";
    const url = isDeletingAdmin
      ? `${API_URL}/${universityToDelete.id_universidad}/admin`
      : `${API_URL}/${universityToDelete.id_universidad}`;

    const successMessage = isDeletingAdmin
      ? "Administrador eliminado con éxito."
      : "Universidad eliminada con éxito.";

    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "La eliminación falló.");
      }
      showToast(successMessage, "success");
      handleCloseDeleteModal();
      // Refrescar la lista para que refleje el cambio
      fetchUniversities();
      fetchAllUniversities(); // También refrescar la lista completa por si se liberó una universidad para un nuevo admin
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando Universidades...</p>
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
            onClick={() => fetchUniversities()}
            className={styles.emptyStateButton}
          >
            Intenta Otra Vez
          </button>
        </div>
      );
    }
    const universitiesToDisplay =
      activeView === "admins"
        ? universities.filter((u) => u.email_admin)
        : universities;

    if (universitiesToDisplay.length === 0) {
      const isAdminsView = activeView === "admins";
      const title = isAdminsView
        ? "No se encontraron administradores"
        : "No se encontraron universidades";
      const message = isAdminsView
        ? "Puedes asignar administradores a las universidades existentes."
        : "Comienza agregando una nueva universidad.";
      const buttonText = isAdminsView
        ? "Agregar Administrador"
        : "Agregar Universidad";
      const icon = isAdminsView ? "fa-user-shield" : "fa-university";

      return (
        <div className={styles.emptyState}>
          <i className={`fas ${icon}`}></i>
          <h3>{title}</h3>
          <p>{message}</p>
          <button
            onClick={() => handleOpenModal()}
            className={styles.emptyStateButton}
          >
            <i className="fas fa-plus"></i> {buttonText}
          </button>
        </div>
      );
    }
    return (
      <>
        <div className={styles.mobileView}>
          {universitiesToDisplay.map((uni) => (
            <div key={uni.id_universidad} className={styles.universityCard}>
              <div className={styles.cardContent}>
                <div className={styles.logoContainer}>
                  <img
                    src={
                      uni.logo_url
                        ? `${SERVER_URL}${uni.logo_url.startsWith('/') ? '' : '/'}${uni.logo_url}`
                        : "/placeholder-logo.png"
                    }
                    alt={`${uni.nombre} Logo`}
                    className={styles.logo}
                  />
                </div>
                <h3 className={styles.universityName}>{uni.nombre}</h3>
                <p className={styles.universityInfo}>
                  <i className="fas fa-id-card"></i> {uni.clave_universidad}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleOpenModal(uni)}
                  className={styles.editButton}
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(uni)}
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
                <th>Logo</th>
                <th>Nombre</th>
                <th>Clave de Universidad</th>
                <th>Email del Administrador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {universitiesToDisplay.map((uni) => (
                <tr key={uni.id_universidad}>
                  <td>
                    <img
                      src={
                        uni.logo_url
                          ? `${SERVER_URL}${uni.logo_url}`
                          : "/placeholder-logo.png"
                      }
                      alt={`${uni.nombre} Logo`}
                      className={styles.tableLogo}
                    />
                  </td>
                  <td>{uni.nombre}</td>
                  <td>{uni.clave_universidad}</td>
                  <td>{uni.email_admin || "N/A"}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button
                        onClick={() => handleOpenModal(uni)}
                        className={styles.editButton}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(uni)}
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
          <h1 className={styles.title}>Manejo de Universidades</h1>
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
          <button
            className={`${styles.tabButton} ${
              activeView === "universidades" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveView("universidades")}
          >
            <FontAwesomeIcon icon={faSchool} /> Universidades
          </button>
          <button
            className={`${styles.tabButton} ${
              activeView === "admins" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveView("admins")}
          >
            <FontAwesomeIcon icon={faUserShield} /> Administradores
          </button>
        </div>
        <div className={styles.toolbar}>
          <button
            onClick={() => handleOpenModal()}
            className={styles.addButton}
          >
            <FontAwesomeIcon icon={faPlus} />{" "}
            {activeView === "universidades"
              ? "Agregar Universidad"
              : "Agregar Administrador"}
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
        {universities.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing{" "}
              <strong>
                {(page - 1) * 10 + 1}-{Math.min(page * 10, totalUniversities)}
              </strong>{" "}
              of <strong>{totalUniversities}</strong>
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
              <h3>
                {isEditing === "university" && "Editar Universidad"}
                {isEditing === "admin" && "Editar Administrador"}
                {isEditing === "add_admin" && "Agregar Administrador"}
                {isEditing === false && "Agregar Nueva Universidad"}
              </h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                {isEditing === "admin" || isEditing === "add_admin" ? (
                  <>
                    {isEditing === "add_admin" ? (
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
                        >
                          <option value="">Seleccione una universidad</option>
                          {allUniversities
                            .filter((uni) => !uni.email_admin)
                            .map((uni) => (
                              <option
                                key={uni.id_universidad}
                                value={uni.id_universidad}
                              >
                                {uni.nombre}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : (
                      <div
                        className={styles.formGroup}
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>Universidad</label>
                        <input type="text" value={formState.nombre} disabled />
                      </div>
                    )}

                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="email_admin">
                        Email del Administrador
                      </label>
                      <input
                        type="email"
                        id="email_admin"
                        name="email_admin"
                        value={formState.email_admin}
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
                          isEditing === "admin"
                            ? "Dejar en blanco para no cambiar"
                            : ""
                        }
                        required={isEditing !== "admin"}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="nombre">Nombre de la Universidad</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formState.nombre}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="clave_universidad">Clave</label>
                      <input
                        type="text"
                        id="clave_universidad"
                        name="clave_universidad"
                        value={formState.clave_universidad}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formState.telefono}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="email_contacto">Email de Contacto</label>
                      <input
                        type="email"
                        id="email_contacto"
                        name="email_contacto"
                        value={formState.email_contacto}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="direccion">Dirección</label>
                      <textarea
                        id="direccion"
                        name="direccion"
                        rows="2"
                        value={formState.direccion}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>
                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="ubicacion">URL de Google Maps</label>
                      <input
                        type="url"
                        id="ubicacion"
                        name="ubicacion"
                        value={formState.ubicacion}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div
                      className={styles.formGroup}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label htmlFor="logo">Logo</label>
                      <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                      />
                      {logoPreview && (
                        <div className={styles.logoPreview}>
                          <img src={logoPreview} alt="Logo Preview" />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className={styles.removeImageButton}
                          >
                            <i className="fas fa-times"></i> Remover
                          </button>
                        </div>
                      )}
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
                  Cancel
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
              {activeView === "admins" ? (
                <p>
                  ¿Estás seguro de que quieres eliminar al administrador{" "}
                  <strong>({universityToDelete?.email_admin})</strong> de la
                  universidad <strong>{universityToDelete?.nombre}</strong>?
                  Esta acción solo eliminará al usuario administrador, no a la
                  universidad.
                </p>
              ) : (
                <p>
                  ¿Estás seguro de que quieres eliminar la universidad{" "}
                  <strong>{universityToDelete?.nombre}</strong>? Esta acción no
                  se puede deshacer. El administrador asociado (si existe) no
                  será eliminado.
                </p>
              )}
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

export default ManejoUniversidades;
