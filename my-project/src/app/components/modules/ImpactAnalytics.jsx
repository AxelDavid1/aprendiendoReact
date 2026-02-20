"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartLine, faGraduationCap, faExclamationTriangle, faCommentDots, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import styles from "./ImpactAnalytics.module.css"
import { authenticatedFetch } from "@/utils/api"

const ImpactAnalytics = ({ userUniversityId, dashboardType }) => {
    const [hiringData, setHiringData] = useState(null);
    const [gapData, setGapData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [userUniversityId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const query = userUniversityId ? `?id_universidad=${userUniversityId}` : "";
            const [resHiring, resGaps] = await Promise.all([
                authenticatedFetch(`/api/analytics/hiring${query}`),
                authenticatedFetch(`/api/analytics/skill-gaps${query}`)
            ]);
            
            const [hiring, gaps] = await Promise.all([resHiring.json(), resGaps.json()]);
            setHiringData(hiring);
            setGapData(gaps);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loader}>Calculando métricas de impacto...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>📊 Impacto en la Empleabilidad</h2>
                <p>Analizando cómo las micro-credenciales están impulsando el éxito laboral.</p>
            </header>

            {/* Summary Cards */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className={styles.statInfo}>
                        <span>Alumnos en Prácticas</span>
                        <h3>{hiringData?.summary?.activeInternships}</h3>
                        <p>Actualmente cursando prácticas</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className={styles.statInfo}>
                        <span>Prácticas Finalizadas</span>
                        <h3>{hiringData?.summary?.completedInternships}</h3>
                        <p>Alumnos que concluyeron exitosamente</p>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Hiring by Subgroup */}
                <div className={styles.section}>
                    <h3>Áreas con Mayor Demanda</h3>
                    <div className={styles.chartPlaceholder}>
                        {hiringData?.subgroupDist?.length > 0 ? hiringData.subgroupDist.map(s => (
                            <div key={s.nombre_subgrupo} className={styles.demandGroup}>
                                <div className={styles.barRow} style={{ marginBottom: (s.habilidades && s.habilidades.length > 0) ? '0.75rem' : '1.5rem' }}>
                                    <div className={styles.barLabel}>{s.nombre_subgrupo}</div>
                                    <div className={styles.barContainer}>
                                        <div 
                                            className={styles.barFill} 
                                            style={{ width: `${(s.contrataciones / hiringData.summary.completedInternships * 100) || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.barValue}>{s.contrataciones}</div>
                                </div>
                                {s.habilidades && s.habilidades.length > 0 && (
                                    <div className={styles.skillTags}>
                                        {s.habilidades.map(h => (
                                            <span key={h.nombre_habilidad} className={styles.skillTag}>
                                                {h.nombre_habilidad} <span className={styles.skillCount}>{h.count}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : <p className={styles.empty}>Sin datos de contratación aún.</p>}
                    </div>
                </div>

                {/* Skill Gaps (Ratings) */}
                <div className={styles.section}>
                    <h3>Evaluación de Habilidades (Feedback Empresa)</h3>
                    <div className={styles.gapList}>
                        {gapData?.avgRatings?.length > 0 ? gapData.avgRatings.map(rating => (
                            <div key={rating.pregunta} className={styles.gapItem}>
                                <div className={styles.gapHeader}>
                                    <span>{rating.pregunta}</span>
                                    <span className={styles.ratingValue}>
                                        {Number(rating.promedio).toFixed(1)} / 5
                                    </span>
                                </div>
                                <div className={styles.ratingStars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div 
                                            key={star} 
                                            className={star <= Math.round(rating.promedio) ? styles.starActive : styles.starInactive}
                                        ></div>
                                    ))}
                                </div>
                                {rating.promedio < 3.5 && (
                                    <div className={styles.alertGap}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} /> Posible brecha de formación
                                    </div>
                                )}
                            </div>
                        )) : <p className={styles.empty}>No hay evaluaciones de empresas disponibles.</p>}
                    </div>
                </div>

                {/* Qualitative Feedback */}
                <div className={styles.sectionFull}>
                    <h3>Voz de la Industria (Feedback Cualitativo)</h3>
                    <div className={styles.feedbackFeed}>
                        {gapData?.qualitativeFeedback?.length > 0 ? gapData.qualitativeFeedback.map((f, i) => (
                            <div key={i} className={styles.feedbackCard}>
                                <FontAwesomeIcon icon={faCommentDots} className={styles.quoteIcon} />
                                <div className={styles.feedbackContent}>
                                    <p className={styles.feedbackText}>"{f.valor_texto}"</p>
                                    <div className={styles.feedbackMeta}>
                                        <span>Sobre: {f.pregunta}</span>
                                        <span>{new Date(f.fecha_creacion).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className={styles.empty}>Sin comentarios cualitativos aún.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactAnalytics;
