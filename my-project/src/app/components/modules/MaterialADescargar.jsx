"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faLink, faPlus, faDownload, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./MaterialADescargar.module.css";

const API_BASE_URL = "";

const getSiteName = (url) => {
  try {
    if (!url) return "Enlace";
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "Sitio Web";
  }
};

const MaterialADescargar = ({ curso, onClose, showToast, showConfirmModal }) => {
  const [materiales, setMateriales] = useState([]);
  const [materialExistente, setMaterialExistente] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper para notificaciones (compatible con tu sistema actual)
  const notify = (message, type = "info") => {
    if (showToast) {
      showToast(message, type);
    } else {
      console[type === "error" ? "error" : "log"](message);
      if (type !== "info") alert(message);
    }
  };

  // Helper para confirmaciones
  const confirmAction = async (title, message, onConfirm, type = "warning") => {
    if (showConfirmModal) {
      showConfirmModal(title, message, onConfirm, type);
    } else if (window.confirm(message)) {
      await onConfirm();
    }
  };

  // Cargar material existente (Filtrado por material_descarga)
  const loadMaterialExistente = async () => {
    if (!curso?.id_curso) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/material/curso/${curso.id_curso}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo cargar el material existente");
      }

      const data = await response.json();
      
      // Filtramos explícitamente por 'material_descarga' si el backend devuelve todo mezclado,
      // o usamos la propiedad si ya viene agrupado. Adaptamos a ambas posibilidades.
      let descargaItems = [];
      if (data.material && Array.isArray(data.material)) {
         // Si es un array plano
         descargaItems = data.material.filter(m => m.categoria_material === 'material_descarga');
      } else if (data.material?.material_descarga) {
         // Si viene agrupado
         descargaItems = data.material.material_descarga;
      }

      setMaterialExistente(descargaItems || []);
    } catch (error) {
      console.error("Error al cargar material existente:", error);
      notify("No se pudo cargar el material existente", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterialExistente();
    setMateriales([]);
  }, [curso?.id_curso]);

  const handleAddMaterial = () => {
    setMateriales((prev) => [
      ...prev,
      {
        nombre: "",
        tipo: "pdf", // Valor por defecto
        descripcion: "",
        archivo: null,
        link: "",
      },
    ]);
  };

  const handleMaterialChange = (index, field, value) => {
    setMateriales((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveMaterial = (index) => {
    setMateriales((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleMaterialChange(index, "archivo", file);
    // Auto-rellenar nombre si está vacío
    setMateriales((prev) => {
       if (!prev[index].nombre) {
          const updated = [...prev];
          updated[index] = { ...updated[index], nombre: file.name };
          return updated;
       }
       return prev;
    });
  };

  const eliminarMaterialExistente = (idMaterial) => {
    confirmAction(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.",
      async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/api/material/${idMaterial}`,
            {
              method: "DELETE",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            },
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al eliminar el material");
          }

          notify("Material eliminado exitosamente", "success");
          loadMaterialExistente();
        } catch (error) {
          notify(error.message || "Error al eliminar el material", "error");
        }
      },
      "warning",
    );
  };

  const materialesNuevosValidos = useMemo(
    () =>
      materiales.filter((material) => {
        if (!material.nombre.trim()) return false;
        if (material.tipo === "pdf") {
          return Boolean(material.archivo);
        }
        if (material.tipo === "link") {
          return Boolean(material.link && material.link.trim());
        }
        return false;
      }),
    [materiales],
  );

  const handleSave = async () => {
    if (!curso?.id_curso) {
      notify("No se encontró el curso seleccionado", "error");
      return;
    }

    if (materiales.length === 0) {
      notify("No hay nuevos materiales para guardar", "warning");
      return;
    }

    if (materialesNuevosValidos.length === 0) {
      notify("Verifica que cada material tenga nombre y archivo/enlace válido", "warning");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      for (const material of materialesNuevosValidos) {
        const formDataMaterial = new FormData();
        
        // Campos obligatorios para tu tabla material_curso
        formDataMaterial.append("id_curso", curso.id_curso);
        formDataMaterial.append("categoria_material", "material_descarga");
        formDataMaterial.append("nombre_archivo", material.nombre.trim());
        formDataMaterial.append("descripcion", material.descripcion || "");
        
        if (material.tipo === "pdf") {
          // IMPORTANTE: Tu backend espera 'file' en upload.single('file')
          formDataMaterial.append("file", material.archivo); 
          formDataMaterial.append("tipo_archivo", "pdf");
          formDataMaterial.append("es_enlace", "0"); // Enviar como string "0"
          formDataMaterial.append("url_enlace", ""); // Enviar vacío para limpiar
        } else {
          // Enlace
          formDataMaterial.append("tipo_archivo", "enlace");
          formDataMaterial.append("es_enlace", "1"); // Enviar como string "1"
          formDataMaterial.append("url_enlace", material.link.trim());
        }

        const responseMaterial = await fetch(`${API_BASE_URL}/api/material`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formDataMaterial,
        });

        if (!responseMaterial.ok) {
          const errorData = await responseMaterial.json().catch(() => ({}));
          throw new Error(errorData.error || `Error al subir "${material.nombre}"`);
        }
      }

      notify("Material guardado correctamente", "success");
      setMateriales([]);
      loadMaterialExistente();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error al guardar materiales:", error);
      notify(error.message || "Error al guardar materiales", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            📚 Material de Apoyo - {curso?.nombre_curso || "Curso"}
          </h2>
          <button onClick={onClose} className={styles.closeButton} type="button" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.tabDescription}>
            Gestiona recursos adicionales (PDFs o Enlaces) para estudio independiente.
          </p>

          {loading ? (
            <div className={styles.loadingState}>
              <p>Cargando material...</p>
            </div>
          ) : (
            materialExistente.length > 0 && (
              <div className={styles.existingMaterial}>
                <h3>Material Disponible</h3>
                {materialExistente.map((item) => (
                  <div key={item.id_material} className={styles.materialCard}>
                    <div className={styles.materialInfo}>
                      <span className={styles.materialName}>
                        <FontAwesomeIcon
                          icon={item.es_enlace || item.tipo_archivo === 'enlace' ? faLink : faFilePdf}
                          className={item.es_enlace || item.tipo_archivo === 'enlace' ? styles.linkIcon : styles.pdfIcon}
                        />
                        {item.nombre_archivo}
                      </span>
                      
                      {item.descripcion && (
                        <p className={styles.materialDesc}>{item.descripcion}</p>
                      )}

                      {/* Visualización de Enlace */}
                      {(item.es_enlace || item.tipo_archivo === 'enlace') && item.url_enlace && (
                        <p className={styles.materialLink}>
                          <a href={item.url_enlace} target="_blank" rel="noopener noreferrer" className={styles.linkPreview}>
                            {getSiteName(item.url_enlace)} <FontAwesomeIcon icon={faExternalLinkAlt} size="xs"/>
                          </a>
                        </p>
                      )}

                      <small className={styles.materialDate}>
                        Subido: {item.fecha_subida ? new Date(item.fecha_subida).toLocaleDateString() : 'Fecha desc.'}
                      </small>
                    </div>

                    <div className={styles.materialActions}>
                      {/* Botón Ver/Descargar */}
                      {(item.es_enlace || item.tipo_archivo === 'enlace') ? (
                         <a
                           href={item.url_enlace}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={styles.viewButton}
                           title="Abrir enlace"
                         >
                           👁️
                         </a>
                      ) : (
                         <a
                           // Usamos la ruta de descarga directa del backend
                           href={`${API_BASE_URL}/api/material/download/${item.id_material}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={styles.viewButton}
                           title="Descargar PDF"
                         >
                           <FontAwesomeIcon icon={faDownload} />
                         </a>
                      )}

                      <button
                        type="button"
                        onClick={() => eliminarMaterialExistente(item.id_material)}
                        className={styles.deleteButton}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Formulario para agregar nuevo */}
          {materiales.map((material, index) => (
            <div key={index} className={styles.materialItem}>
              <div className={styles.materialHeader}>
                <input
                  type="text"
                  placeholder="Título del recurso"
                  value={material.nombre}
                  onChange={(e) => handleMaterialChange(index, "nombre", e.target.value)}
                  className={styles.input}
                />
                <select
                  value={material.tipo}
                  onChange={(e) => handleMaterialChange(index, "tipo", e.target.value)}
                  className={styles.select}
                >
                  <option value="pdf">📄 PDF</option>
                  <option value="link">🔗 Enlace</option>
                </select>
                <button
                  onClick={() => handleRemoveMaterial(index)}
                  className={styles.deleteButton}
                  title="Quitar"
                  type="button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className={styles.materialContent}>
                <div className={styles.formGroup}>
                  <label>Descripción (Opcional):</label>
                  <textarea
                    value={material.descripcion}
                    onChange={(e) => handleMaterialChange(index, "descripcion", e.target.value)}
                    className={styles.textarea}
                    rows={2}
                    placeholder="¿Para qué sirve este material?"
                  />
                </div>

                {material.tipo === "pdf" ? (
                  <div className={styles.formGroup}>
                    <label>Archivo PDF:</label>
                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, index)}
                        className={styles.fileInput}
                        id={`material-${index}`}
                      />
                      <label htmlFor={`material-${index}`} className={styles.fileLabel}>
                        {material.archivo ? (
                           <><span style={{color: '#2ecc71'}}>✔</span> {material.archivo.name}</>
                        ) : (
                           "📎 Seleccionar PDF"
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label>URL del sitio:</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={material.link}
                      onChange={(e) => handleMaterialChange(index, "link", e.target.value)}
                      className={styles.input}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button onClick={handleAddMaterial} className={styles.addButton} type="button">
            <FontAwesomeIcon icon={faPlus} /> Agregar otro recurso
          </button>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.buttonSecondary} type="button" disabled={saving}>
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className={styles.buttonPrimary}
            type="button"
            disabled={saving || materialesNuevosValidos.length === 0}
          >
            {saving ? "Subiendo..." : "Guardar Todo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialADescargar;