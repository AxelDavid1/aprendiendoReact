import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./Inscripciones.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faBook, faClipboardList, faChartBar, faSyncAlt, faDownload, faCheck, faTimes, faPlus, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

function Inscripciones() {
  const [activeTab, setActiveTab] = useState('credenciales');
  const [selectedFilter, setSelectedFilter] = useState({
    credencial: 'todas',
    curso: 'todos',
    estado: 'todos'
  });
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Estados para la pestaña de credenciales
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState(null);
  const [expandedCredentialId, setExpandedCredentialId] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Estados para la pestaña de inscripciones
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState(null);

  // Estados para la pestaña de cursos sin credencial
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [unassignedCoursesLoading, setUnassignedCoursesLoading] = useState(true);
  const [unassignedCoursesError, setUnassignedCoursesError] = useState(null);

  // Función auxiliar para obtener el token del localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };


  // --- FETCHING DATA ---

  const fetchCredentials = useCallback(async () => {
    setCredentialsLoading(true);
    setCredentialsError(null);
    try {
      const response = await fetch("/api/credenciales");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener las credenciales");
      }
      const data = await response.json();
      setCredentials((data.credenciales || []).map(c => ({ ...c, cursos: [], cursos_loaded: false })));
    } catch (err) {
      setCredentialsError(err.message);
      setCredentials([]);
    } finally {
      setCredentialsLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      const params = new URLSearchParams();
      if (selectedFilter.credencial !== 'todas') {
        params.append('id_credencial', selectedFilter.credencial);
      }
      if (selectedFilter.curso !== 'todos') {
        params.append('id_curso', selectedFilter.curso);
      }
      if (selectedFilter.estado !== 'todos') {
        params.append('estado', selectedFilter.estado);
      }

      let url = '/api/inscripciones/all'; // <-- Probamos con esta nueva ruta
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const token = getToken();
      if (!token) {
        setApplicationsError("No autorizado, no se encontró token.");
        setApplicationsLoading(false);
        return;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener las inscripciones");
      }
      const data = await response.json();
      setApplications(data.inscripciones || []);
    } catch (err) {
      setApplicationsError(err.message);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, [selectedFilter]);

  const fetchUnassignedCourses = useCallback(async () => {
    setUnassignedCoursesLoading(true);
    setUnassignedCoursesError(null);
    try {
      const response = await fetch("/api/cursos?exclude_assigned=true");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al obtener los cursos sin credencial");
      }
      const data = await response.json();
      setUnassignedCourses(data.cursos || []);
    } catch (err) {
      setUnassignedCoursesError(err.message);
      setUnassignedCourses([]);
    } finally {
      setUnassignedCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  useEffect(() => {
    if (activeTab === 'inscripciones') {
      fetchApplications();
    } else if (activeTab === 'cursos') {
      fetchUnassignedCourses();
    }
  }, [activeTab, fetchApplications, fetchUnassignedCourses]);

  // --- DERIVED DATA ---

  const allCourses = useMemo(() => {
    const coursesMap = new Map();
    const allAvailableCourses = [...unassignedCourses];

    credentials.forEach(cred => {
      (cred.cursos || []).filter(c => c).forEach(curso => {
        allAvailableCourses.push(curso);
      });
    });

    allAvailableCourses.forEach(curso => {
      if (!coursesMap.has(curso.id_curso)) {
        coursesMap.set(curso.id_curso, curso);
      }
    });

    return Array.from(coursesMap.values()).sort((a, b) => a.nombre_curso.localeCompare(b.nombre_curso));
  }, [credentials, unassignedCourses]);


  // --- HANDLERS ---

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilter(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCredentialClick = async (credentialId) => {
    if (expandedCredentialId === credentialId) {
      setExpandedCredentialId(null);
      return;
    }

    setExpandedCredentialId(credentialId);
    const targetCredential = credentials.find(c => c.id_credencial === credentialId);

    if (targetCredential && targetCredential.cursos_loaded) {
      return;
    }

    setIsDetailLoading(true);
    try {
      const response = await fetch(`/api/credenciales/${credentialId}`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los detalles de la credencial.");
      }
      const detailedCred = await response.json();

      setCredentials(prevCreds =>
        prevCreds.map(cred =>
          cred.id_credencial === credentialId
            ? { ...cred, cursos: detailedCred.cursos || [], cursos_loaded: true }
            : cred
        )
      );
    } catch (error) {
      console.error("Error fetching credential details:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    handleFilterChange('curso', course.id_curso);
    handleTabChange('inscripciones');
  }

  const handleShowDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus, reason = null) => {
    if (!selectedApplication) return;
    setIsUpdating(true);

    const body = { estado: newStatus };
    if (newStatus === 'rechazada' && reason) {
      body.motivo_rechazo = reason;
    }

    const token = getToken();
    if (!token) {
      showToast('Error: Sesión expirada. Por favor, inicie sesión de nuevo.', 'error');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch(`/api/inscripciones/${selectedApplication.id_inscripcion}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el estado.');
      }

      showToast('Estado de la solicitud actualizado con éxito.', 'success');

      setShowModal(false);
      if (showRejectModal) setShowRejectModal(false);

      fetchApplications();

    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsUpdating(false);
      setSelectedApplication(null);
      if (reason) setRejectReason('');
    }
  };

  const handleApprove = () => {
    handleUpdateStatus('aprobada');
  };

  const handleReject = () => {
    setShowModal(false);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      showToast('Por favor, ingrese un motivo de rechazo.', 'error');
      return;
    }
    handleUpdateStatus('rechazada', rejectReason);
  };

  // --- RENDER FUNCTIONS ---

  const renderContent = () => {
    switch (activeTab) {
      case 'credenciales':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Credenciales</h2>
              <p>Haga clic en una credencial para ver sus cursos y gestionar inscripciones.</p>
            </div>
            <div className={styles.contentArea}>
              {credentialsLoading ? (
                <div className={styles.loading}>Cargando credenciales...</div>
              ) : credentialsError ? (
                <div className={styles.emptyState}>
                  <h4>Error al cargar</h4>
                  <p>{credentialsError}</p>
                  <button onClick={fetchCredentials} className={styles.emptyStateButton}>
                    Intentar de nuevo
                  </button>
                </div>
              ) : credentials.length === 0 ? (
                <div className={styles.emptyState}>
                  <h4>No se encontraron credenciales</h4>
                  <p>Aún no se han creado credenciales en el sistema.</p>
                </div>
              ) : (
                <div className={styles.credentialsGrid}>
                  {credentials.map(cred => (
                    <div key={cred.id_credencial} className={styles.credentialCard}>
                      <div className={styles.credentialHeader} onClick={() => handleCredentialClick(cred.id_credencial)}>
                        <div className={styles.credentialHeaderContent}>
                          <h3>{cred.nombre_credencial}</h3>
                          <span>{cred.nombre_universidad}</span>
                        </div>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className={`${styles.chevronIcon} ${expandedCredentialId === cred.id_credencial ? styles.expanded : ''}`}
                        />
                      </div>

                      {expandedCredentialId === cred.id_credencial && (
                        <div className={styles.courseListContainer}>
                          {isDetailLoading && !cred.cursos_loaded ? (
                            <div className={styles.detailLoading}>
                              <FontAwesomeIcon icon={faSpinner} spin /> Cargando cursos...
                            </div>
                          ) : (
                            <ul className={styles.courseList}>
                              {cred.cursos && cred.cursos.length > 0 ? (
                                cred.cursos
                                  .filter(curso => curso)
                                  .map(curso => (
                                    <li key={curso.id_curso} onClick={() => handleCourseClick(curso)} className={styles.courseItem}>
                                      <span>{curso.nombre_curso}</span>
                                      <FontAwesomeIcon icon={faChevronRight} />
                                    </li>
                                  ))
                              ) : (
                                <li className={`${styles.courseItem} ${styles.noCourses}`}>No hay cursos en esta credencial.</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'cursos':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Cursos sin Credencial</h2>
              <p>Lista de cursos que no están asociados a ninguna credencial. Haga clic para ver sus inscripciones.</p>
            </div>
            <div className={styles.contentArea}>
              {unassignedCoursesLoading ? (
                <div className={styles.loading}>Cargando cursos...</div>
              ) : unassignedCoursesError ? (
                <div className={styles.emptyState}>
                  <h4>Error al cargar</h4>
                  <p>{unassignedCoursesError}</p>
                  <button onClick={fetchUnassignedCourses} className={styles.emptyStateButton}>
                    Intentar de nuevo
                  </button>
                </div>
              ) : unassignedCourses.length === 0 ? (
                <div className={styles.emptyState}>
                  <h4>No hay cursos sin credencial</h4>
                  <p>Todos los cursos disponibles en el sistema están asignados a una credencial.</p>
                </div>
              ) : (
                <ul className={styles.unassignedCourseList}>
                  {unassignedCourses.map(curso => (
                    <li key={curso.id_curso} onClick={() => handleCourseClick(curso)} className={styles.unassignedCourseItem}>
                      <div className={styles.unassignedCourseInfo}>
                        <span className={styles.unassignedCourseName}>{curso.nombre_curso}</span>
                        <span className={styles.unassignedCourseUniversity}>{curso.nombre_universidad}</span>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'inscripciones':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Panel de Inscripciones</h2>
              <p>Gestione las solicitudes de inscripción de los alumnos</p>
            </div>

            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label>Filtrar por Credencial</label>
                <select
                  value={selectedFilter.credencial}
                  onChange={(e) => handleFilterChange('credencial', e.target.value)}
                >
                  <option value="todas">Todas las Credenciales</option>
                  {credentials.map(cred => (
                    <option key={cred.id_credencial} value={cred.id_credencial}>{cred.nombre_credencial}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Filtrar por Curso</label>
                <select
                  value={selectedFilter.curso}
                  onChange={(e) => handleFilterChange('curso', e.target.value)}
                >
                  <option value="todos">Todos los Cursos</option>
                  {allCourses.map(curso => (
                    <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre_curso}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Filtrar por Estado</label>
                <select
                  value={selectedFilter.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="solicitada">Solicitada</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="completada">Completada</option>
                  <option value="abandonada">Abandonada</option>
                </select>
              </div>
            </div>

            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h3>Solicitudes de Inscripción</h3>
                <button className={styles.updateButton} onClick={fetchApplications} disabled={applicationsLoading}>
                  <FontAwesomeIcon icon={faSyncAlt} className={applicationsLoading ? styles.spinning : ''} /> Actualizar
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Curso</th>
                      <th>Fecha de Solicitud</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsLoading ? (
                      <tr>
                        <td colSpan="5" className={styles.loading}>Cargando inscripciones...</td>
                      </tr>
                    ) : applicationsError ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h4>Error al cargar</h4>
                            <p>{applicationsError}</p>
                          </div>
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h4>No hay solicitudes de inscripción</h4>
                            <p>No se encontraron solicitudes con los filtros seleccionados.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id_inscripcion}>
                          <td>{app.nombre_alumno}</td>
                          <td>{app.nombre_curso}</td>
                          <td>{new Date(app.fecha_solicitud).toLocaleDateString()}</td>
                          <td><span className={`${styles.status} ${styles[app.estado]}`}>{app.estado}</span></td>
                          <td>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleShowDetails(app)}
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'analisis':
        return (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Análisis de Inscripciones</h2>
              <p>Visualice métricas y estadísticas sobre las inscripciones</p>
            </div>
            <div className={styles.contentArea}>
              <div className={styles.emptyState}>Funcionalidad en desarrollo.</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Inscripciones</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <nav className={styles.sidebar}>
            <button
              className={`${styles.sidebarButton} ${activeTab === 'credenciales' ? styles.active : ''}`}
              onClick={() => handleTabChange('credenciales')}
              title="Credenciales"
            >
              <FontAwesomeIcon icon={faAddressCard} />
              <span className={styles.sidebarLabel}>Credenciales</span>
            </button>

            <button
              className={`${styles.sidebarButton} ${activeTab === 'cursos' ? styles.active : ''}`}
              onClick={() => handleTabChange('cursos')}
              title="Cursos sin Credencial"
            >
              <FontAwesomeIcon icon={faBook} />
              <span className={styles.sidebarLabel}>Cursos sin Credencial</span>
            </button>

            <button
              className={`${styles.sidebarButton} ${activeTab === 'inscripciones' ? styles.active : ''}`}
              onClick={() => handleTabChange('inscripciones')}
              title="Panel de Inscripciones"
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span className={styles.sidebarLabel}>Panel de Inscripciones</span>
            </button>

            <button
              className={`${styles.sidebarButton} ${activeTab === 'analisis' ? styles.active : ''}`}
              onClick={() => handleTabChange('analisis')}
              title="Análisis"
            >
              <FontAwesomeIcon icon={faChartBar} />
              <span className={styles.sidebarLabel}>Análisis</span>
            </button>
          </nav>

          <div className={styles.content}>
            {renderContent()}
          </div>
        </div>
      </main>

      {showModal && selectedApplication && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Detalles de la Solicitud</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailSection}>
                  <h4>Información del Alumno</h4>
                  <p><strong>Nombre:</strong> {selectedApplication.nombre_alumno}</p>
                  <p><strong>Email:</strong> {selectedApplication.email_alumno}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Información del Curso</h4>
                  <p><strong>Curso:</strong> {selectedApplication.nombre_curso}</p>
                  <p><strong>Credencial:</strong> {selectedApplication.nombre_credencial || 'N/A'}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Estado de la Solicitud</h4>
                  <p><strong>Fecha:</strong> {new Date(selectedApplication.fecha_solicitud).toLocaleString()}</p>
                  <p><strong>Estado:</strong> <span className={`${styles.status} ${styles[selectedApplication.estado]}`}>{selectedApplication.estado}</span></p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <h4>Actualizar Estado</h4>
                <div className={`${styles.actionButtons} ${styles.centeredActions}`} >
                  <button
                    className={styles.approveButton}
                    onClick={handleApprove}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />} Aprobar
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={handleReject}
                    disabled={isUpdating}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Motivo del rechazo</h3>
            </div>

            <div className={styles.modalContent}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Por favor, proporcione un motivo para el rechazo."
                className={styles.textarea}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowModal(true);
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmButton}
                onClick={confirmReject}
                disabled={isUpdating}
              >
                {isUpdating ? 'Confirmando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <div className={styles.toast}><div className={`${styles.toastContent} ${styles[toast.type] || 'success'}`}><p>{toast.message}</p></div></div>
      )}
    </div>
  );
}

export default Inscripciones;
