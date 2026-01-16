import React, { useEffect, useState, useCallback } from "react";
import styles from "./Dashboard.module.css";
import CursoYCredencialesAlumno from "../modules/CursoYCredencialesAlumno";
import CardConvocatoriaBienvenido from "../controls/CardConvocatoriaBienvenido";
import AlumnoTareaYCalificaciones from "../modules/AlumnoTareaYCalificaciones";
import AlumnoDescargaCertificadosConstancias from "../modules/AlumnoDescargaCertificadosConstancias";

function StudentDashboard({ userId }) {
  const [estadoGeneral, setEstadoGeneral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [activeMainTab, setActiveMainTab] = useState("cursos"); // "cursos", "tareas" o "documentos"

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchEstadoGeneral = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/convocatorias/alumno/estado-general",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || "Error al cargar el estado de las convocatorias.",
        );
      }

      const data = await response.json();
      setEstadoGeneral(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstadoGeneral();
  }, [fetchEstadoGeneral]);

  const handleSolicitar = async (convocatoriaId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast(
        "Debes iniciar sesión para solicitar una convocatoria.",
        "error",
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/convocatorias/${convocatoriaId}/solicitar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "No se pudo procesar la solicitud.");
      }

      showToast("¡Solicitud enviada con éxito!", "success");
      // Refrescamos el estado para que la tarjeta de la convocatoria desaparezca
      fetchEstadoGeneral();
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const renderConvocatoriaBanner = () => {
    // Usaremos una lista combinada o la que tenga datos.
    // Priorizamos 'convocatoriasAceptadas' si existe, si no, 'convocatoriasEnEjecucion'.
    const convocatoriasActivas =
      estadoGeneral?.convocatoriasAceptadas ||
      estadoGeneral?.convocatoriasEnEjecucion ||
      [];

    if (convocatoriasActivas.length === 0) {
      return null;
    }

    const nombres = convocatoriasActivas
      .map((c) => `'${c.nombre}'`)
      .join(" y ");
    const texto =
      convocatoriasActivas.length > 1
        ? `Estás viendo los cursos de las convocatorias: ${nombres}`
        : `Estás viendo los cursos de la convocatoria: ${nombres}`;

    return (
      <div className={styles.convocatoriaBanner}>
        <p>{texto}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.centeredMessage}>Cargando tu dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className={styles.centeredMessage} style={{ color: "red" }}>
        Error: {error}
      </div>
    );
  }

  const enConvocatoria =
    estadoGeneral?.convocatoriasAceptadas?.length > 0 ||
    estadoGeneral?.convocatoriasEnEjecucion?.length > 0;

  return (
    <div className={styles.todo}>
      <div className={styles.modulos}>
        {/* Renderizar tarjetas de convocatorias disponibles */}
        {estadoGeneral?.convocatoriasDisponibles?.map((conv) => (
          <CardConvocatoriaBienvenido
            key={conv.id}
            convocatoria={conv}
            onSolicitar={handleSolicitar}
          />
        ))}

        {/* Renderizar banner si está en modo convocatoria */}
        {renderConvocatoriaBanner()}

        {/* Pestañas principales */}
        <div className={styles.mainTabs}>
          <button
            className={`${styles.mainTab} ${activeMainTab === "cursos" ? styles.activeMainTab : ""}`}
            onClick={() => setActiveMainTab("cursos")}
          >
            📚 {enConvocatoria ? "Catálogo de Cursos" : "Cursos y Credenciales"}
          </button>
          <button
            className={`${styles.mainTab} ${activeMainTab === "tareas" ? styles.activeMainTab : ""}`}
            onClick={() => setActiveMainTab("tareas")}
          >
            📝 Tareas y Calificaciones
          </button>
          <button
            className={`${styles.mainTab} ${activeMainTab === "documentos" ? styles.activeMainTab : ""}`}
            onClick={() => setActiveMainTab("documentos")}
          >
            🎓 Certificados y Constancias
          </button>
        </div>

        {/* Contenido según la pestaña activa */}
        <section>
          {activeMainTab === "cursos" && (
            <CursoYCredencialesAlumno
              enConvocatoria={enConvocatoria}
              universidadesConvocatoria={
                estadoGeneral?.universidadesParticipantes || []
              }
              universidadAlumno={estadoGeneral?.universidadDelAlumno}
              solicitudesDelAlumno={estadoGeneral?.solicitudesDelAlumno || []} // <-- ¡NUEVA PROP!
            />
          )}

          {activeMainTab === "tareas" && (
            <AlumnoTareaYCalificaciones userId={userId} />
          )}

          {activeMainTab === "documentos" && (
            <AlumnoDescargaCertificadosConstancias userId={userId} />
          )}
        </section>

        {toast.show && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
