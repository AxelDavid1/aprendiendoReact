"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
// ASEGÚRATE QUE EL ARCHIVO SE LLAME EXACTAMENTE ASÍ (minúsculas/mayúsculas importan)
import styles from "./verificar.module.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faFilePdf,
  faUser,
  faBuilding,
  faGraduationCap,
  faCalendarAlt,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

// 1. Definimos la estructura de los datos para evitar errores de TypeScript
interface Metadata {
  nombre_alumno: string;
  tipo_documento: string;
  nombre_item: string;
  nombre_universidad: string;
  fecha_emitida: string;
  // Agrega otros campos si tu API devuelve más cosas
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const VerificationContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  // 2. Manejo seguro de params (puede venir como string o array)
  const filename = Array.isArray(params?.filename) ? params.filename[0] : params?.filename;
  const tipo = searchParams.get("tipo");

  // 3. Tipamos el estado
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename || !tipo) {
      setError("Información insuficiente para la verificación.");
      setIsLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/public-files/metadatos/${tipo}/${filename}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudo verificar el documento.");
        }

        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [filename, tipo]);

  // 4. Tipamos el argumento de la función
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className={styles.loadingIcon}
          />
          <h2 className={styles.loadingTitle}>Verificando documento</h2>
          <p className={styles.loadingText}>
            Por favor espera mientras validamos la información...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.errorIcon}
          />
          <h2 className={styles.errorTitle}>Verificación Fallida</h2>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (metadata) {
    const pdfUrl = `${API_BASE_URL}/public-files/documentos/${tipo}/${filename}`;
    return (
      <div className={styles.container}>
        <div className={styles.mainHeader}>
          <div className={styles.headerContent}>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className={styles.headerIcon}
            />
            <div>
              <h1 className={styles.mainTitle}>Documento Verificado</h1>
              <p className={styles.mainSubtitle}>
                Este documento ha sido validado contra los registros oficiales
              </p>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Sección de detalles */}
          <div className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Información del Documento</h2>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Alumno</span>
                  <p className={styles.detailValue}>{metadata.nombre_alumno}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>
                    {metadata.tipo_documento === "constancia"
                      ? "Curso"
                      : "Credencial"}
                  </span>
                  <p className={styles.detailValue}>{metadata.nombre_item}</p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <FontAwesomeIcon icon={faBuilding} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Universidad</span>
                  <p className={styles.detailValue}>
                    {metadata.nombre_universidad}
                  </p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.iconWrapper}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Fecha de Emisión</span>
                  <p className={styles.detailValue}>
                    {formatDate(metadata.fecha_emitida)}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.verificationBadge}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Verificado Oficialmente</span>
            </div>
          </div>

          {/* Sección del visor PDF */}
          <div className={styles.viewerSection}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerTitleGroup}>
                <FontAwesomeIcon icon={faFilePdf} className={styles.pdfIcon} />
                <h2 className={styles.viewerTitle}>Documento Original</h2>
              </div>
              <a href={pdfUrl} download className={styles.downloadButton}>
                <FontAwesomeIcon icon={faDownload} />
                <span>Descargar</span>
              </a>
            </div>
            <div className={styles.pdfContainer}>
              <iframe
                src={pdfUrl}
                className={styles.pdfEmbed}
                title={`Visor de ${metadata.tipo_documento}`}
                aria-label="Visor de documento PDF"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const VerificationPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className={styles.loadingIcon}
              />
              <h2 className={styles.loadingTitle}>Cargando...</h2>
            </div>
          </div>
        }
      >
        <VerificationContent />
      </Suspense>
    </div>
  );
};

export default VerificationPage;