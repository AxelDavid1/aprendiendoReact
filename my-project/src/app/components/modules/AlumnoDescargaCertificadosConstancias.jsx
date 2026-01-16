import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AlumnoDescargaCertificadosConstancias.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const AlumnoDescargaCertificadosConstancias = () => {
  // Estados
  const [activeTab, setActiveTab] = useState("constancias");
  const [isLoading, setIsLoading] = useState(true);
  const [documentos, setDocumentos] = useState({
    constancias_disponibles: [],
    certificados_disponibles: [],
  });
  const [isGenerating, setIsGenerating] = useState({
    id: null,
    estado: false,
    tipo: null,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Efecto para cargar documentos disponibles
  useEffect(() => {
    fetchDocumentosDisponibles();
  }, []);

  // Función para mostrar toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Función para obtener documentos disponibles
  const fetchDocumentosDisponibles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("No estás autenticado. Inicia sesión nuevamente.", "error");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/alumno/documentos-disponibles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Documentos recibidos del backend:", response.data);
      setDocumentos(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      showToast(
        error.response?.data?.error ||
          "Error al cargar documentos. Intente nuevamente.",
        "error",
      );
      setIsLoading(false);
    }
  };

  // Función para generar constancia
  const generarConstancia = async (idCurso) => {
    setIsGenerating({ id: idCurso, estado: true, tipo: "constancia" });
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/alumno/generar-constancia/${idCurso}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Constancia generada:", response.data);

      showToast(
        response.data.mensaje || "✅ Constancia generada correctamente",
      );

      // Recargar documentos para actualizar el estado
      await fetchDocumentosDisponibles();
    } catch (error) {
      console.error("Error al generar constancia:", error);
      showToast(
        error.response?.data?.error ||
          "Error al generar constancia. Intente nuevamente.",
        "error",
      );
    } finally {
      setIsGenerating({ id: null, estado: false, tipo: null });
    }
  };

  // Función para generar certificado
  const generarCertificado = async (idCredencial) => {
    setIsGenerating({ id: idCredencial, estado: true, tipo: "certificado" });
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/alumno/generar-certificado/${idCredencial}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Certificado generado:", response.data);

      showToast(
        response.data.mensaje || "✅ Certificado generado correctamente",
      );

      // Recargar documentos para actualizar el estado
      await fetchDocumentosDisponibles();
    } catch (error) {
      console.error("Error al generar certificado:", error);
      showToast(
        error.response?.data?.error ||
          "Error al generar certificado. Intente nuevamente.",
        "error",
      );
    } finally {
      setIsGenerating({ id: null, estado: false, tipo: null });
    }
  };

  // Función para descargar documento
  const descargarDocumento = async (tipo, id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No estás autenticado. Inicia sesión nuevamente.", "error");
        return;
      }

      showToast(`Preparando descarga de ${tipo}...`, "success");

      const response = await axios.get(
        `${API_URL}/alumno/descargar/${tipo}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Importante para manejar archivos
        },
      );

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extraer el nombre del archivo de las cabeceras
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${tipo}_${id}.pdf`; // Nombre por defecto
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(
        `✅ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} descargado correctamente`,
        "success",
      );
    } catch (error) {
      console.error("Error al descargar el documento:", error);
      const errorMessage =
        error.response?.data?.error ||
        "No se pudo descargar el archivo. Inténtalo de nuevo.";
      showToast(errorMessage, "error");
    }
  };

  // Renderizado de tarjeta de constancia
  const renderConstanciaCard = (constancia) => {
    let badgeText = "En proceso";
    let badgeClass = `${styles.badge} ${styles.badgePending}`;

    if (constancia.ya_generada) {
      badgeText = "Generada";
      badgeClass = `${styles.badge} ${styles.badgeGenerated}`;
    } else if (constancia.puede_generar) {
      badgeText = "Disponible";
      badgeClass = `${styles.badge} ${styles.badgeAvailable}`;
    }

    let buttonText = "Completar actividades";
    let buttonClass = `${styles.btn} ${styles.btnDisabled} ${styles.btnFull}`;
    let onClick = null;
    let tooltipText = "Completa todas las tareas calificadas para aprobar";
    let isDisabled = true;

    if (constancia.ya_generada) {
      buttonText = "Descargar Constancia";
      buttonClass = `${styles.btn} ${styles.btnIndigo} ${styles.btnFull}`;
      onClick = () =>
        descargarDocumento("constancia", constancia.id_constancia);
      isDisabled = false;
      tooltipText = "";
    } else if (constancia.puede_generar) {
      buttonText = "Generar Constancia";
      buttonClass = `${styles.btn} ${styles.btnGreen} ${styles.btnFull}`;
      onClick = () => generarConstancia(constancia.id_curso);
      isDisabled = false;
      tooltipText = "";
    }

    const isGeneratingThis =
      isGenerating.estado &&
      isGenerating.id === constancia.id_curso &&
      isGenerating.tipo === "constancia";

    // Construir la URL completa del logo si es relativa
    const logoUrl = constancia.universidad?.logo_url?.startsWith("http")
      ? constancia.universidad.logo_url
      : `${API_URL}${constancia.universidad?.logo_url || ""}`;

    return (
      <div key={constancia.id_curso} className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.universityInfo}>
              {constancia.universidad?.logo_url && (
                <img
                  src={logoUrl}
                  alt={constancia.universidad?.nombre || "Universidad"}
                  className={styles.universityLogo}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span className={styles.universityName}>
                {constancia.universidad?.nombre || "Universidad"}
              </span>
            </div>
            <span className={badgeClass}>{badgeText}</span>
          </div>
          <h3 className={styles.courseTitle}>
            {constancia.nombre_curso || "Curso sin nombre"}
          </h3>
          {constancia.descripcion_curso && (
            <p className={styles.description}>{constancia.descripcion_curso}</p>
          )}
          <div className={styles.courseStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Calificación:</span>
              <span className={styles.statValue}>
                {constancia.calificacion_final || 0}
                {constancia.aprobado ? " ✓" : ""}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Créditos:</span>
              <span className={styles.statValue}>
                {constancia.creditos}/100
              </span>
            </div>
          </div>
          <div className={styles.progress}>
            <span className={styles.progressLabel}>Actividades:</span>
            <span className={styles.progressValue}>
              {constancia.actividades_calificadas || 0}/
              {constancia.total_actividades || 0} calificadas
            </span>
          </div>
          <div className={styles.actionContainer}>
            {isGeneratingThis ? (
              <button
                className={`${styles.btn} ${styles.btnDisabled} ${styles.btnFull} ${styles.btnLoading}`}
                disabled
              >
                <svg
                  className={styles.spinner}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className={styles.spinnerPath}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generando...
              </button>
            ) : (
              <div className={isDisabled ? styles.tooltip : ""}>
                <button
                  className={buttonClass}
                  onClick={onClick}
                  disabled={isDisabled}
                >
                  {buttonText}
                </button>
                {isDisabled && (
                  <span className={styles.tooltipText}>{tooltipText}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado de tarjeta de certificado
  const renderCertificadoCard = (certificado) => {
    let badgeText = "En proceso";
    let badgeClass = `${styles.badge} ${styles.badgePending}`;

    if (certificado.ya_generado) {
      badgeText = "Generado";
      badgeClass = `${styles.badge} ${styles.badgeGenerated}`;
    } else if (certificado.puede_generar) {
      badgeText = "Disponible";
      badgeClass = `${styles.badge} ${styles.badgeAvailable}`;
    }

    let buttonText = "Completar cursos";
    let buttonClass = `${styles.btn} ${styles.btnDisabled} ${styles.btnFull}`;
    let onClick = null;
    let tooltipText = "Completa todos los cursos requeridos";
    let isDisabled = true;

    if (certificado.ya_generado) {
      buttonText = "Descargar Certificado";
      buttonClass = `${styles.btn} ${styles.btnIndigo} ${styles.btnFull}`;
      onClick = () =>
        descargarDocumento("certificado", certificado.id_certificacion);
      isDisabled = false;
      tooltipText = "";
    } else if (certificado.puede_generar) {
      buttonText = "Generar Certificado";
      buttonClass = `${styles.btn} ${styles.btnGreen} ${styles.btnFull}`;
      onClick = () => generarCertificado(certificado.id_credencial);
      isDisabled = false;
      tooltipText = "";
    }

    const isGeneratingThis =
      isGenerating.estado &&
      isGenerating.id === certificado.id_credencial &&
      isGenerating.tipo === "certificado";

    // Construir la URL completa del logo si es relativa
    const logoUrl = certificado.universidad?.logo_url?.startsWith("http")
      ? certificado.universidad.logo_url
      : `${API_URL}${certificado.universidad?.logo_url || ""}`;

    return (
      <div key={certificado.id_credencial} className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.universityInfo}>
              {certificado.universidad?.logo_url && (
                <img
                  src={logoUrl}
                  alt={certificado.universidad?.nombre || "Universidad"}
                  className={styles.universityLogo}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span className={styles.universityName}>
                {certificado.universidad?.nombre || "Universidad"}
              </span>
            </div>
            <span className={badgeClass}>{badgeText}</span>
          </div>
          <h3 className={styles.courseTitle}>
            {certificado.nombre_credencial || "Credencial sin nombre"}
          </h3>
          {certificado.descripcion_credencial && (
            <p className={styles.description}>
              {certificado.descripcion_credencial}
            </p>
          )}

          <div className={styles.cursosSection}>
            <p className={styles.cursosTitle}>Cursos requeridos:</p>
            <ul className={styles.cursosList}>
              {certificado.cursos_requeridos?.map((curso) => (
                <li key={curso.id_curso} className={styles.cursoItem}>
                  {curso.completado ? (
                    <svg
                      className={styles.iconCheck}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={styles.iconCross}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span>{curso.nombre_curso}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.progress}>
            <span className={styles.progressLabel}>Progreso:</span>
            <span className={styles.progressValue}>
              {certificado.cursos_completados || 0}/
              {certificado.total_cursos || 0} cursos (
              {certificado.progreso_porcentaje || 0}%)
            </span>
          </div>

          <div className={styles.actionContainer}>
            {isGeneratingThis ? (
              <button
                className={`${styles.btn} ${styles.btnDisabled} ${styles.btnFull} ${styles.btnLoading}`}
                disabled
              >
                <svg
                  className={styles.spinner}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className={styles.spinnerCircle}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className={styles.spinnerPath}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generando...
              </button>
            ) : (
              <div className={isDisabled ? styles.tooltip : ""}>
                <button
                  className={buttonClass}
                  onClick={onClick}
                  disabled={isDisabled}
                >
                  {buttonText}
                </button>
                {isDisabled && (
                  <span className={styles.tooltipText}>{tooltipText}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado principal
  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Certificados y Constancias</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "constancias" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("constancias")}
        >
          📄 Constancias
        </button>
        <button
          className={`${styles.tab} ${activeTab === "certificados" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("certificados")}
        >
          🎓 Certificados
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinnerContainer}>
            <svg
              className={styles.loadingSpinner}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className={styles.spinnerPath}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {/* Contenido de las tabs */}
      {!isLoading && (
        <>
          {activeTab === "constancias" && (
            <div className={styles.grid}>
              {documentos.constancias_disponibles.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    className={styles.emptyIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className={styles.emptyTitle}>
                    No hay constancias disponibles
                  </h3>
                  <p className={styles.emptyText}>
                    Las constancias aparecerán aquí cuando completes tus cursos
                  </p>
                </div>
              ) : (
                documentos.constancias_disponibles.map(renderConstanciaCard)
              )}
            </div>
          )}

          {activeTab === "certificados" && (
            <div className={styles.grid}>
              {documentos.certificados_disponibles.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    className={styles.emptyIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <h3 className={styles.emptyTitle}>
                    No hay certificados disponibles
                  </h3>
                  <p className={styles.emptyText}>
                    Los certificados aparecerán aquí cuando completes todas las
                    microcredenciales de una credencial
                  </p>
                </div>
              ) : (
                documentos.certificados_disponibles.map(renderCertificadoCard)
              )}
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AlumnoDescargaCertificadosConstancias;
