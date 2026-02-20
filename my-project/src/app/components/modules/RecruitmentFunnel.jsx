"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisV, faCalendarAlt, faCheckCircle, faComments, faUserClock, faBriefcase, faFlagCheckered } from "@fortawesome/free-solid-svg-icons"
import styles from "./RecruitmentFunnel.module.css"
import { authenticatedFetch } from "@/utils/api"

const RecruitmentFunnel = ({ empresaId }) => {
    const [vinculaciones, setVinculaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const statusMap = {
        'Contactado': { icon: faComments, color: '#6366f1' },
        'Entrevista': { icon: faUserClock, color: '#f59e0b' },
        'Practicante': { icon: faBriefcase, color: '#10b981' },
        'Finalizado': { icon: faFlagCheckered, color: '#64748b' }
    };

    useEffect(() => {
        if (empresaId) fetchVinculaciones();
    }, [empresaId]);

    const fetchVinculaciones = async () => {
        setLoading(true);
        try {
            const res = await authenticatedFetch(`/api/empresa/vinculaciones/${empresaId}`);
            const data = await res.json();
            setVinculaciones(data);
        } catch (error) {
            console.error("Error fetching vinculaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (idVinculo, newStatus) => {
        try {
            const res = await authenticatedFetch(`/api/empresa/vinculacion/${idVinculo}/status`, {
                method: "PATCH",
                body: JSON.stringify({ 
                    status: newStatus,
                    es_exito_plataforma: newStatus === 'Practicante' || newStatus === 'Finalizado'
                })
            });
            if (res.ok) {
                setToast({ show: true, message: `Estatus actualizado a ${newStatus}`, type: "success" });
                fetchVinculaciones();
            } else {
                setToast({ show: true, message: "Error al actualizar estatus", type: "error" });
            }
        } catch (error) {
            setToast({ show: true, message: "Error de conexión", type: "error" });
        }
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const renderColumn = (status) => {
        const filtered = vinculaciones.filter(v => v.cat_estatus === status);
        const config = statusMap[status];

        return (
            <div className={styles.column} key={status}>
                <div className={styles.columnHeader} style={{ borderTop: `4px solid ${config.color}` }}>
                    <FontAwesomeIcon icon={config.icon} style={{ color: config.color }} />
                    <h3>{status}</h3>
                    <span className={styles.count}>{filtered.length}</span>
                </div>
                <div className={styles.cardList}>
                    {filtered.map(v => (
                        <div key={v.id_vinculo} className={styles.candidateCard}>
                            <div className={styles.candidateHeader}>
                                <h4 className={styles.candidateName}>{v.nombre_alumno}</h4>
                                <span className={styles.uniBadge}>{v.nombre_universidad}</span>
                            </div>
                            <div className={styles.candidateInfo}>
                                <p><strong>Carrera:</strong> {v.nombre_carrera || "N/A"}</p>
                                <p><strong>Email:</strong> <span className={styles.emailText}>{v.email}</span></p>
                            </div>
                            <div className={styles.cardActions}>
                                <select
                                    value={v.cat_estatus}
                                    onChange={(e) => handleStatusChange(v.id_vinculo, e.target.value)}
                                    className={styles.statusSelect}
                                    disabled={v.encuesta_completada === 1}
                                >
                                    {Object.keys(statusMap).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {v.encuesta_completada === 1 && (
                                    <div className={styles.lockedHint} title="Estatus bloqueado por evaluación finalizada">
                                        <FontAwesomeIcon icon={faCheckCircle} /> Evaluado
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className={styles.empty}>Sin candidatos</div>}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Embudo de Reclutamiento</h2>
                <p>Gestiona el ciclo de vida de tus candidatos desde el primer contacto hasta su contratación.</p>
            </header>

            {loading ? (
                <div className={styles.loader}>Cargando embudo...</div>
            ) : (
                <div className={styles.board}>
                    {Object.keys(statusMap).map(status => renderColumn(status))}
                </div>
            )}

            {toast.show && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default RecruitmentFunnel;
