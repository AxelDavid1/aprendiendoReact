"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Convocatorias.module.css";

// ===== SVG Icon Components (replace FontAwesome) =====
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

const IconMinus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
);

const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);

const IconXCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
);

const IconRotate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const IconBuilding = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const IconFileX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="m14.5 12.5-5 5"/>
    <path d="m9.5 12.5 5 5"/>
  </svg>
);

const IconGraduation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 10 3 12 0v-5"/>
  </svg>
);

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// ===== Constants =====
const API_URL_CONVOCATORIAS = "/api/convocatorias";
const API_URL_UNIVERSIDADES = "/api/universidades";
const API_URL_SOLICITUDES = "/api/convocatorias/solicitudes/all";

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

const getAuthToken = () => localStorage.getItem("token");

const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString.split("T")[0] + "T00:00:00");
  return date.toLocaleDateString("es-ES", { timeZone: "UTC" });
};

const getEstadoBadge = (estado, llena) => {
  const estadoFinal = llena ? "llena" : estado;
  const estadoText = {
    planeada: "Planeada",
    aviso: "Aviso",
    revision: "Revision",
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
    <span className={`${styles.estadoBadge} ${estadoClasses[estadoFinal] || ""}`}>
      {estadoText[estadoFinal] || estadoFinal.charAt(0).toUpperCase() + estadoFinal.slice(1)}
    </span>
  );
};

// ===== Main Component =====
function GestionConvocatorias() {
  const [activeTab, setActiveTab] = useState("convocatorias");
  const [currentUser, setCurrentUser] = useState(getUserFromToken());
  const [idUniversidadAdmin, setIdUniversidadAdmin] = useState(null);

  const [convocatorias, setConvocatorias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [allUniversidades, setAllUniversidades] = useState([]);
  const [universidadesDisponibles, setUniversidadesDisponibles] = useState([]);
  const [universidadesEnConvocatoria, setUniversidadesEnConvocatoria] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [filters, setFilters] = useState({ convocatoria: "", universidad: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const initializeUser = useCallback(() => {
    const user = getUserFromToken();
    if (user && JSON.stringify(user) !== JSON.stringify(currentUser)) {
      setCurrentUser(user);
    }
    return user;
  }, [currentUser]);

  const fetchConvocatorias = useCallback(async () => {
    setLoading(true);
    try {
      const user = currentUser || initializeUser();
      let response;
      if (user?.tipo_usuario === "admin_universidad") {
        const token = getAuthToken();
        response = await fetch(`${API_URL_CONVOCATORIAS}/universidad/mis-convocatorias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setConvocatorias(data.convocatorias || []);
        setIdUniversidadAdmin(data.id_universidad);
      } else {
        response = await fetch(API_URL_CONVOCATORIAS);
        const data = await response.json();
        setConvocatorias(data);
      }
      if (!response.ok) throw new Error("Error al cargar las convocatorias.");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, initializeUser]);

  const fetchUniversidades = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await fetch(`${API_URL_UNIVERSIDADES}?limit=9999`, headers ? { headers } : undefined);
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
      if (!token) throw new Error("No estas autenticado.");
      let response;
      if (currentUser?.tipo_usuario === "admin_universidad") {
        response = await fetch(`${API_URL_CONVOCATORIAS}/universidad/mis-solicitudes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await fetch(API_URL_SOLICITUDES, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (!response.ok) throw new Error("Error al cargar las solicitudes.");
      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingSolicitudes(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const user = initializeUser();
    if (user) {
      fetchConvocatorias();
      fetchUniversidades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      activeTab === "solicitudes" &&
      (currentUser?.tipo_usuario === "admin_sedeq" || currentUser?.tipo_usuario === "admin_universidad")
    ) {
      fetchSolicitudes();
    }
  }, [activeTab, currentUser, fetchSolicitudes]);

  // Permissions
  const isFieldDisabled = (fieldName) => {
    if (!currentUser || currentUser.tipo_usuario !== "admin_universidad") return false;
    return ["fecha_aviso_inicio", "fecha_aviso_fin", "fecha_ejecucion_inicio", "fecha_ejecucion_fin", "estado"].includes(fieldName);
  };

  const canCreateConvocatorias = () => currentUser?.tipo_usuario === "admin_sedeq";
  const canDeleteConvocatorias = () => currentUser?.tipo_usuario === "admin_sedeq";
  const esSuUniversidad = (id_universidad) =>
    currentUser?.tipo_usuario === "admin_universidad" && id_universidad === idUniversidadAdmin;

  // Modal handlers
  const handleOpenModal = async (convocatoria = null) => {
    if (convocatoria) {
      setIsEditing(true);
      try {
        const response = await fetch(`${API_URL_CONVOCATORIAS}/${convocatoria.id}`);
        if (!response.ok) throw new Error("No se pudo cargar la convocatoria para editar.");
        const data = await response.json();
        const formattedData = {
          ...data,
          fecha_aviso_inicio: data.fecha_aviso_inicio.split("T")[0],
          fecha_aviso_fin: data.fecha_aviso_fin.split("T")[0],
          fecha_revision_inicio: data.fecha_revision_inicio ? data.fecha_revision_inicio.split("T")[0] : "",
          fecha_revision_fin: data.fecha_revision_fin ? data.fecha_revision_fin.split("T")[0] : "",
          fecha_ejecucion_inicio: data.fecha_ejecucion_inicio.split("T")[0],
          fecha_ejecucion_fin: data.fecha_ejecucion_fin.split("T")[0],
        };
        setFormState(formattedData);
        const idsEnConvocatoria = new Set(data.universidades.map((u) => u.universidad_id));
        const enConvocatoria = data.universidades.map((uniConv) => ({
          ...allUniversidades.find((u) => u.id_universidad === uniConv.universidad_id),
          capacidad_maxima: uniConv.capacidad_maxima,
        }));
        const disponibles = allUniversidades.filter((uni) => !idsEnConvocatoria.has(uni.id_universidad));
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
        uni.id_universidad === id_universidad ? { ...uni, capacidad_maxima: nuevaCapacidad } : uni
      )
    );
  };

  const agregarUniversidad = (universidad) => {
    setUniversidadesEnConvocatoria((prev) => [...prev, { ...universidad, capacidad_maxima: 30 }]);
    setUniversidadesDisponibles((prev) => prev.filter((u) => u.id_universidad !== universidad.id_universidad));
  };

  const quitarUniversidad = (universidad) => {
    setUniversidadesDisponibles((prev) => [...prev, universidad]);
    setUniversidadesEnConvocatoria((prev) => prev.filter((u) => u.id_universidad !== universidad.id_universidad));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) { showToast("No estas autenticado.", "error"); return; }

    const universidadesFinales = universidadesEnConvocatoria.map((uni) => ({
      id_universidad: uni.id_universidad,
      capacidad_maxima: uni.capacidad_maxima || 0,
    }));

    if (universidadesFinales.some((uni) => uni.capacidad_maxima <= 0)) {
      showToast("Todas las universidades seleccionadas deben tener una capacidad mayor a 0.", "error");
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL_CONVOCATORIAS}/${formState.id}` : API_URL_CONVOCATORIAS;
    const successMessage = isEditing ? "Convocatoria actualizada con exito." : "Convocatoria creada con exito.";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formState, universidades: universidadesFinales }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Ocurrio un error.");
      showToast(successMessage);
      handleCloseModal();
      fetchConvocatorias();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleStatusChange = async (solicitudId, nuevoEstado, estado, skipConfirm = false) => {
    if (!skipConfirm) {
      const accion = nuevoEstado === "aceptada" ? (estado === "rechazada" ? "re-aprobar" : "aprobar") : "cancelar";
      const confirmado = window.confirm(
        `Estas seguro de que quieres ${accion} esta solicitud? Esta accion no se puede deshacer facilmente.`
      );
      if (!confirmado) return;
    }

    const API_URL_UPDATE_SOLICITUD = `/api/convocatorias/solicitudes/${solicitudId}`;
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No estas autenticado.");
      const response = await fetch(API_URL_UPDATE_SOLICITUD, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al actualizar el estado.");
      if (!skipConfirm) showToast(`Solicitud ${nuevoEstado} con exito.`);
      if (!skipConfirm) fetchSolicitudes();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleBulkApprove = async () => {
    const pendientes = filteredSolicitudes.filter((s) => s.estado === "solicitada");
    if (pendientes.length === 0) { showToast("No hay solicitudes pendientes visibles.", "info"); return; }

    const confirmado = window.confirm(
      `Aprobar todas las ${pendientes.length} solicitudes pendientes visibles? Nota: Se aprobaran solo hasta el limite de capacidad de cada universidad.`
    );
    if (!confirmado) return;

    const grouped = pendientes.reduce((acc, s) => {
      if (!acc[s.id_universidad]) acc[s.id_universidad] = [];
      acc[s.id_universidad].push(s);
      return acc;
    }, {});

    let successCount = 0;
    let errorCount = 0;

    for (const uniId in grouped) {
      const uniPendientes = grouped[uniId];
      for (const s of uniPendientes) {
        try {
          await handleStatusChange(s.id, "aceptada", s.estado, true);
          successCount++;
        } catch (err) {
          if (err.message.includes("Cupo lleno")) break;
          else errorCount++;
        }
      }
    }

    showToast(`Aprobadas: ${successCount}, Errores: ${errorCount}`, errorCount > 0 ? "warning" : "success");
    fetchSolicitudes();
  };

  const handleDeleteConfirm = async () => {
    if (!convocatoriaToDelete) return;
    const token = getAuthToken();
    if (!token) { showToast("No estas autenticado.", "error"); return; }

    try {
      const response = await fetch(`${API_URL_CONVOCATORIAS}/${convocatoriaToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "No se pudo eliminar la convocatoria.");
      }
      showToast("Convocatoria eliminada con exito.");
      handleCloseDeleteModal();
      fetchConvocatorias();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  // Filtering
  const filteredConvocatorias = convocatorias.filter((conv) => {
    const matchesNombre = filters.convocatoria ? conv.id.toString() === filters.convocatoria : true;
    const matchesUniversidad = filters.universidad
      ? conv.universidades?.some(
          (uni) =>
            uni.universidad_id?.toString() === filters.universidad ||
            uni.id_universidad?.toString() === filters.universidad
        )
      : true;
    return matchesNombre && matchesUniversidad;
  });

  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesConvocatoria = filters.convocatoria
      ? solicitud.convocatoria_id?.toString() === filters.convocatoria
      : true;
    const matchesUniversidad = filters.universidad
      ? solicitud.id_universidad_alumno?.toString() === filters.universidad
      : true;
    return matchesConvocatoria && matchesUniversidad;
  });

  const pendingCount = filteredSolicitudes.filter((s) => s.estado === "solicitada").length;
  const totalPendingCount = solicitudes.filter((s) => s.estado === "solicitada").length;

  // ===== Render: Convocatorias Table (Desktop) =====
  const renderConvocatoriasTable = () => (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Aviso</th>
            <th>Revision</th>
            <th>Ejecucion</th>
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
                      <span key={index} className={styles.uniChip}>
                        {uni.nombre}
                        <span className={styles.infoIcon}>
                          <IconInfo />
                          <span className={styles.tooltipBox}>
                            <div>Capacidad: {uni.capacidad_maxima}</div>
                            <div>Cupo actual: {uni.cupo_actual}</div>
                          </span>
                        </span>
                      </span>
                    ))
                  : <span style={{ color: "#9ca3af", fontSize: "0.8125rem" }}>N/A</span>}
              </td>
              <td>
                <div className={styles.tableActions}>
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                    onClick={() => handleOpenModal(conv)}
                    aria-label="Editar"
                  >
                    <IconPencil />
                    <span className={styles.iconBtnTooltip}>Editar</span>
                  </button>
                  {canDeleteConvocatorias() && (
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                      onClick={() => { setConvocatoriaToDelete(conv); setIsDeleteModalOpen(true); }}
                      aria-label="Eliminar"
                    >
                      <IconTrash />
                      <span className={styles.iconBtnTooltip}>Eliminar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ===== Render: Convocatorias Cards (Mobile) =====
  const renderConvocatoriasCards = () => (
    <div className={styles.mobileCards}>
      {filteredConvocatorias.map((conv) => (
        <div key={conv.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{conv.nombre}</h3>
            {getEstadoBadge(conv.estado, conv.llena)}
          </div>

          <div className={styles.cardDates}>
            <DateBlock label="Aviso" start={conv.fecha_aviso_inicio} end={conv.fecha_aviso_fin} />
            <DateBlock label="Revision" start={conv.fecha_revision_inicio} end={conv.fecha_revision_fin} />
            <DateBlock label="Ejecucion" start={conv.fecha_ejecucion_inicio} end={conv.fecha_ejecucion_fin} />
          </div>

          {conv.universidades && conv.universidades.length > 0 && (
            <div className={styles.cardUnis}>
              <div className={styles.cardUnisLabel}>Universidades</div>
              <div className={styles.cardUniChips}>
                {conv.universidades.map((uni, idx) => (
                  <span key={idx} className={styles.uniChip}>
                    {uni.nombre}
                    <span className={styles.infoIcon}>
                      <IconInfo />
                      <span className={styles.tooltipBox}>
                        <div>Capacidad: {uni.capacidad_maxima}</div>
                        <div>Cupo actual: {uni.cupo_actual}</div>
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.cardActions}>
            <button
              className={`${styles.cardActionBtn} ${styles.cardActionBtnEdit}`}
              onClick={() => handleOpenModal(conv)}
            >
              <IconPencil /> Editar
            </button>
            {canDeleteConvocatorias() && (
              <button
                className={`${styles.cardActionBtn} ${styles.cardActionBtnDelete}`}
                onClick={() => { setConvocatoriaToDelete(conv); setIsDeleteModalOpen(true); }}
              >
                <IconTrash /> Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ===== Render: Solicitudes Table (Desktop) =====
  const renderSolicitudesTable = () => (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Email</th>
            <th>Convocatoria</th>
            <th>Universidad</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredSolicitudes.map((solicitud) => (
            <tr key={solicitud.id}>
              <td className={styles.nombreCell}>{solicitud.alumno_nombre}</td>
              <td style={{ color: "#6b7280", fontSize: "0.8125rem" }}>{solicitud.alumno_email}</td>
              <td style={{ fontSize: "0.8125rem" }}>{solicitud.convocatoria_nombre}</td>
              <td style={{ fontSize: "0.8125rem" }}>{solicitud.universidad_nombre}</td>
              <td style={{ textAlign: "center", fontSize: "0.8125rem" }}>
                {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
              </td>
              <td style={{ textAlign: "center" }}>{getEstadoBadge(solicitud.estado)}</td>
              <td>
                <div className={styles.tableActions}>
                  <SolicitudActionsDesktop solicitud={solicitud} onStatusChange={handleStatusChange} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ===== Render: Solicitudes Cards (Mobile) =====
  const renderSolicitudesCards = () => (
    <div className={styles.mobileCards}>
      {filteredSolicitudes.map((solicitud) => (
        <div key={solicitud.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className={styles.cardTitle}>{solicitud.alumno_nombre}</h3>
              <p className={styles.cardSubtitle}>{solicitud.alumno_email}</p>
            </div>
            {getEstadoBadge(solicitud.estado)}
          </div>

          <div className={styles.cardInfoBlock}>
            <div className={styles.cardInfoRow}>
              <IconGraduation />
              <span>Conv.:</span>
              <span className={styles.cardInfoValue}>{solicitud.convocatoria_nombre}</span>
            </div>
            <div className={styles.cardInfoRow}>
              <IconBuilding />
              <span>Univ.:</span>
              <span className={styles.cardInfoValue}>{solicitud.universidad_nombre}</span>
            </div>
            <div className={styles.cardInfoRow}>
              <IconCalendar />
              <span>Fecha:</span>
              <span className={styles.cardInfoValue}>
                {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>

          <div className={styles.cardActions}>
            <SolicitudActionsMobile solicitud={solicitud} onStatusChange={handleStatusChange} />
          </div>
        </div>
      ))}
    </div>
  );

  // ===== Render: Content =====
  const renderConvocatoriasContent = () => {
    if (loading) return <LoadingState message="Cargando convocatorias..." />;
    if (error) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconFileX /></div>
          <h3>Ocurrio un error</h3>
          <p>{error}</p>
          <button onClick={fetchConvocatorias} className={styles.emptyStateButton}>Intentar de nuevo</button>
        </div>
      );
    }
    if (filteredConvocatorias.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconFileX /></div>
          <h3>{convocatorias.length > 0 ? "No hay convocatorias que coincidan con tu busqueda" : "No hay convocatorias"}</h3>
          <p>Crea una nueva convocatoria para empezar a gestionarlas.</p>
          {canCreateConvocatorias() && (
            <button onClick={() => handleOpenModal()} className={styles.emptyStateButton}>
              <IconPlus /> Agregar Convocatoria
            </button>
          )}
        </div>
      );
    }
    return (
      <>
        {renderConvocatoriasTable()}
        {renderConvocatoriasCards()}
      </>
    );
  };

  const renderSolicitudesContent = () => {
    if (loadingSolicitudes) return <LoadingState message="Cargando solicitudes..." />;
    if (filteredSolicitudes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconFileX /></div>
          <h3>No hay solicitudes</h3>
          <p>
            {solicitudes.length > 0
              ? "No se encontraron solicitudes que coincidan con los filtros."
              : "Aun no hay solicitudes de estudiantes."}
          </p>
        </div>
      );
    }
    return (
      <>
        {renderSolicitudesTable()}
        {renderSolicitudesCards()}
      </>
    );
  };

  // ===== Main Render =====
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><IconCalendar /></span>
            <div>
              <h1 className={styles.title}>Gestion de Convocatorias</h1>
              {currentUser?.tipo_usuario === "admin_universidad" && (
                <span className={styles.limitedAccess}>Vista limitada (Admin Universidad)</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "convocatorias" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("convocatorias")}
          >
            <IconCalendar />
            <span className={styles.tabTextFull}>Convocatorias</span>
            <span className={styles.tabTextShort}>Conv.</span>
          </button>
          {(currentUser?.tipo_usuario === "admin_sedeq" || currentUser?.tipo_usuario === "admin_universidad") && (
            <button
              className={`${styles.tab} ${activeTab === "solicitudes" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("solicitudes")}
            >
              <IconCheckCircle />
              <span className={styles.tabTextFull}>Aprobacion de Estudiantes</span>
              <span className={styles.tabTextShort}>Aprobaciones</span>
              {totalPendingCount > 0 && (
                <span className={styles.tabBadge}>{totalPendingCount}</span>
              )}
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div>
            {activeTab === "solicitudes" ? (
              <button
                className={styles.approveAllButton}
                onClick={handleBulkApprove}
                disabled={pendingCount === 0}
              >
                <IconCheckCircle />
                <span className={styles.buttonTextFull}>Aprobar pendientes</span>
                <span className={styles.buttonTextShort}>Aprobar</span>
                {pendingCount > 0 && <span className={styles.pendingBadge}>{pendingCount}</span>}
              </button>
            ) : canCreateConvocatorias() ? (
              <button className={styles.addButton} onClick={() => handleOpenModal()}>
                <IconPlus />
                <span className={styles.buttonTextFull}>Agregar Convocatoria</span>
                <span className={styles.buttonTextShort}>Agregar</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <span className={styles.filterIcon}><IconCalendar /></span>
              <select
                value={filters.convocatoria}
                onChange={(e) => handleFilterChange("convocatoria", e.target.value)}
                className={styles.filterSelect}
                aria-label="Filtrar por convocatoria"
              >
                <option value="">Todas las convocatorias</option>
                {convocatorias.map((conv) => (
                  <option key={conv.id} value={conv.id}>{conv.nombre}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterIcon}><IconBuilding /></span>
              <select
                value={filters.universidad}
                onChange={(e) => handleFilterChange("universidad", e.target.value)}
                className={styles.filterSelect}
                aria-label="Filtrar por universidad"
              >
                <option value="">Todas las universidades</option>
                {allUniversidades
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map((uni) => (
                    <option key={uni.id_universidad} value={uni.id_universidad}>{uni.nombre}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === "convocatorias" ? renderConvocatoriasContent() : renderSolicitudesContent()}
      </main>

      {/* Form Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>{isEditing ? "Editar Convocatoria" : "Nueva Convocatoria"}</h3>
                <p className={styles.modalDescription}>
                  {isEditing ? "Modifica los datos de la convocatoria." : "Completa los datos para crear una nueva convocatoria."}
                </p>
              </div>
              <button onClick={handleCloseModal} className={styles.closeButton} aria-label="Cerrar">
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="nombre">Nombre</label>
                  <input type="text" id="nombre" name="nombre" value={formState.nombre} onChange={handleFormChange} required />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="descripcion">Descripcion</label>
                  <textarea id="descripcion" name="descripcion" value={formState.descripcion} onChange={handleFormChange} rows="3" placeholder="Opcional" />
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>Periodo de Aviso</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_aviso_inicio">Fecha de Inicio</label>
                      <input type="date" id="fecha_aviso_inicio" name="fecha_aviso_inicio" value={formState.fecha_aviso_inicio} onChange={handleFormChange} disabled={isFieldDisabled("fecha_aviso_inicio")} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_aviso_fin">Fecha de Fin</label>
                      <input type="date" id="fecha_aviso_fin" name="fecha_aviso_fin" value={formState.fecha_aviso_fin} onChange={handleFormChange} disabled={isFieldDisabled("fecha_aviso_fin")} required />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>Periodo de Revision</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_revision_inicio">Fecha de Inicio</label>
                      <input type="date" id="fecha_revision_inicio" name="fecha_revision_inicio" value={formState.fecha_revision_inicio} onChange={handleFormChange} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_revision_fin">Fecha de Fin</label>
                      <input type="date" id="fecha_revision_fin" name="fecha_revision_fin" value={formState.fecha_revision_fin} onChange={handleFormChange} required />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>Periodo de Ejecucion</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_ejecucion_inicio">Fecha de Inicio</label>
                      <input type="date" id="fecha_ejecucion_inicio" name="fecha_ejecucion_inicio" value={formState.fecha_ejecucion_inicio} onChange={handleFormChange} disabled={isFieldDisabled("fecha_ejecucion_inicio")} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fecha_ejecucion_fin">Fecha de Fin</label>
                      <input type="date" id="fecha_ejecucion_fin" name="fecha_ejecucion_fin" value={formState.fecha_ejecucion_fin} onChange={handleFormChange} disabled={isFieldDisabled("fecha_ejecucion_fin")} required />
                    </div>
                  </div>
                </div>

                {/* University Management */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Universidades Participantes</label>
                  <div className={styles.universityManagement}>
                    {currentUser?.tipo_usuario !== "admin_universidad" && (
                      <div className={styles.universitySection}>
                        <div className={styles.universitySectionHeader}>
                          <h6>Disponibles</h6>
                          <span className={styles.universityCount}>{universidadesDisponibles.length}</span>
                        </div>
                        <div className={styles.universityList}>
                          {universidadesDisponibles.length === 0 ? (
                            <div className={styles.emptyList}>
                              <span className={styles.icon}><IconBuilding /></span>
                              <p>No hay mas universidades</p>
                            </div>
                          ) : (
                            universidadesDisponibles.map((uni) => (
                              <div key={uni.id_universidad} className={styles.universityItem}>
                                <div className={styles.universityInfo}>
                                  <span className={styles.universityName}>{uni.nombre}</span>
                                </div>
                                <button type="button" onClick={() => agregarUniversidad(uni)} className={styles.addUniversityBtn} aria-label="Agregar universidad">
                                  <IconPlus />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className={styles.universitySection}>
                      <div className={styles.universitySectionHeader}>
                        <h6>En Convocatoria</h6>
                        <span className={styles.universityCount}>{universidadesEnConvocatoria.length}</span>
                      </div>
                      <div className={styles.universityList}>
                        {universidadesEnConvocatoria.length === 0 ? (
                          <div className={styles.emptyList}>
                            <span className={styles.icon}><IconBuilding /></span>
                            <p>Agrega universidades</p>
                          </div>
                        ) : (
                          universidadesEnConvocatoria.map((uni, index) => (
                            <div key={uni.id_universidad || `uni-${index}`} className={`${styles.universityItem} ${styles.selectedUniversityItem}`}>
                              <div className={styles.universityInfo}>
                                <span className={styles.universityNameModal}>
                                  {uni.nombre}
                                  {esSuUniversidad(uni.id_universidad) && (
                                    <span className={styles.tuUniversidad}> (Tu Universidad)</span>
                                  )}
                                </span>
                                <div className={styles.capacidadInputContainer}>
                                  <label htmlFor={`capacidad-${uni.id_universidad}`}>Cap:</label>
                                  <input
                                    type="number"
                                    id={`capacidad-${uni.id_universidad}`}
                                    value={uni.capacidad_maxima || ""}
                                    onChange={(e) => handleCapacidadChange(uni.id_universidad, e.target.value)}
                                    className={styles.capacidadInput}
                                    min="1"
                                    disabled={!esSuUniversidad(uni.id_universidad) && currentUser?.tipo_usuario === "admin_universidad"}
                                    required
                                  />
                                </div>
                              </div>
                              {currentUser?.tipo_usuario !== "admin_universidad" && (
                                <button type="button" onClick={() => quitarUniversidad(uni)} className={styles.removeUniversityBtn} aria-label="Quitar universidad">
                                  <IconMinus />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Force Estado */}
                {isEditing && currentUser?.tipo_usuario !== "admin_universidad" && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="estado">Forzar Estado (ej. Cancelar)</label>
                    <select id="estado" name="estado" value={formState.estado} onChange={handleFormChange} required>
                      <option value="planeada">Planeada</option>
                      <option value="aviso">Aviso</option>
                      <option value="revision">Revision</option>
                      <option value="activa">Activa</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <small>El estado se calcula automaticamente. Usa esta opcion solo para forzar un estado como "Cancelada".</small>
                  </div>
                )}
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelButton}>Cancelar</button>
                <button type="submit" className={styles.saveButton}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalContent}>
              <div className={styles.deleteIconWrapper}><IconTrash /></div>
              <h3>Confirmar Eliminacion</h3>
              <p>
                {"Estas seguro de que quieres eliminar la convocatoria "}
                <strong>"{convocatoriaToDelete?.nombre}"</strong>
                {"? Esta accion no se puede deshacer."}
              </p>
            </div>
            <div className={styles.deleteActions}>
              <button onClick={handleCloseDeleteModal} className={styles.cancelButton}>Cancelar</button>
              <button onClick={handleDeleteConfirm} className={styles.confirmDeleteButton}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={styles.toast}>
          <div className={`${styles.toastContent} ${styles[toast.type] || styles.success}`}>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Sub-components =====

function LoadingState({ message }) {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
}

function DateBlock({ label, start, end }) {
  return (
    <div className={styles.cardDateBlock}>
      <span className={styles.cdIcon}><IconCalendar /></span>
      <div>
        <div className={styles.cardDateLabel}>{label}</div>
        <div className={styles.cardDateValue}>{formatDate(start)}</div>
        <div className={styles.cardDateEnd}>{formatDate(end)}</div>
      </div>
    </div>
  );
}

function SolicitudActionsDesktop({ solicitud, onStatusChange }) {
  if (solicitud.estado === "solicitada") {
    return (
      <>
        <button
          className={`${styles.iconBtn} ${styles.iconBtnApprove}`}
          onClick={() => onStatusChange(solicitud.id, "aceptada", solicitud.estado)}
          aria-label="Aprobar solicitud"
        >
          <IconCheckCircle />
          <span className={styles.iconBtnTooltip}>Aprobar</span>
        </button>
        <button
          className={`${styles.iconBtn} ${styles.iconBtnReject}`}
          onClick={() => onStatusChange(solicitud.id, "rechazada", solicitud.estado)}
          aria-label="Rechazar solicitud"
        >
          <IconXCircle />
          <span className={styles.iconBtnTooltip}>Rechazar</span>
        </button>
      </>
    );
  }
  if (solicitud.estado === "rechazada") {
    return (
      <button
        className={`${styles.iconBtn} ${styles.iconBtnReapprove}`}
        onClick={() => onStatusChange(solicitud.id, "aceptada", solicitud.estado)}
        aria-label="Re-aprobar solicitud"
      >
        <IconRotate />
        <span className={styles.iconBtnTooltip}>Re-aprobar</span>
      </button>
    );
  }
  if (solicitud.estado === "aceptada") {
    return (
      <button
        className={`${styles.iconBtn} ${styles.iconBtnReject}`}
        onClick={() => onStatusChange(solicitud.id, "rechazada", solicitud.estado)}
        aria-label="Cancelar aprobacion"
      >
        <IconXCircle />
        <span className={styles.iconBtnTooltip}>Cancelar aprobacion</span>
      </button>
    );
  }
  return <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>-</span>;
}

function SolicitudActionsMobile({ solicitud, onStatusChange }) {
  if (solicitud.estado === "solicitada") {
    return (
      <>
        <button
          className={`${styles.cardActionBtn} ${styles.cardActionBtnApprove}`}
          onClick={() => onStatusChange(solicitud.id, "aceptada", solicitud.estado)}
        >
          <IconCheckCircle /> Aprobar
        </button>
        <button
          className={`${styles.cardActionBtn} ${styles.cardActionBtnReject}`}
          onClick={() => onStatusChange(solicitud.id, "rechazada", solicitud.estado)}
        >
          <IconXCircle /> Rechazar
        </button>
      </>
    );
  }
  if (solicitud.estado === "rechazada") {
    return (
      <button
        className={`${styles.cardActionBtn} ${styles.cardActionBtnReapprove}`}
        onClick={() => onStatusChange(solicitud.id, "aceptada", solicitud.estado)}
      >
        <IconRotate /> Re-aprobar
      </button>
    );
  }
  if (solicitud.estado === "aceptada") {
    return (
      <button
        className={`${styles.cardActionBtn} ${styles.cardActionBtnReject}`}
        onClick={() => onStatusChange(solicitud.id, "rechazada", solicitud.estado)}
      >
        <IconXCircle /> Cancelar
      </button>
    );
  }
  return null;
}

export default GestionConvocatorias;
