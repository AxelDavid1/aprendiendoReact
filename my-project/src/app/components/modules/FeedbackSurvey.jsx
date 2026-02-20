"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar, faPenSquare, faFileAlt, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import styles from "./FeedbackSurvey.module.css"
import { authenticatedFetch } from "@/utils/api"

const FeedbackSurvey = ({ empresaId }) => {
    const [pendingVincules, setPendingVincules] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedVinculo, setSelectedVinculo] = useState(null);
    const [answers, setAnswers] = useState({});
    const [subgrupos, setSubgrupos] = useState([]);
    const [selectedSubgrupo, setSelectedSubgrupo] = useState("");
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [empresaId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [resVincules, resQuestions, resSubs] = await Promise.all([
                authenticatedFetch(`/api/empresa/vinculaciones/${empresaId}`),
                authenticatedFetch("/api/empresa/feedback-questions"),
                authenticatedFetch("/api/subgrupos-operadores")
            ]);
            const [vincules, qs, subs] = await Promise.all([resVincules.json(), resQuestions.json(), resSubs.json()]);
            
            // Survey only triggered when internship is "Finalizado" AND survey not yet completed
            setPendingVincules(vincules.filter(v => v.cat_estatus === 'Finalizado' && !v.encuesta_completada));
            setQuestions(qs);
            setSubgrupos(Array.isArray(subs) ? subs : []);
        } catch (error) {
            console.error("Error fetching feedback data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], id_pregunta: qId, valor_rango: value } }));
    };

    const handleTextChange = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], id_pregunta: qId, valor_texto: value } }));
    };

    const handleSubgrupoChange = async (subId) => {
        setSelectedSubgrupo(subId);
        setSelectedSkills([]);
        if (!subId) {
            setAvailableSkills([]);
            return;
        }
        try {
            const res = await authenticatedFetch(`/api/subgrupos-operadores/${subId}/habilidades`);
            const skills = await res.json();
            setAvailableSkills(skills);
        } catch (error) {
            console.error("Error fetching skills:", error);
        }
    };

    const toggleSkill = (skillId) => {
        setSelectedSkills(prev => 
            prev.includes(skillId) 
                ? prev.filter(id => id !== skillId) 
                : [...prev, skillId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const demandData = selectedSkills.map(skillId => ({
                id_subgrupo: selectedSubgrupo,
                id_habilidad: skillId
            }));
            
            // Si seleccionó subgrupo pero no habilidades específicas
            if (selectedSubgrupo && demandData.length === 0) {
                demandData.push({ id_subgrupo: selectedSubgrupo, id_habilidad: null });
            }

            const res = await authenticatedFetch("/api/empresa/feedback", {
                method: "POST",
                body: JSON.stringify({
                    id_vinculo: selectedVinculo.id_vinculo,
                    respuestas: Object.values(answers),
                    demandData
                })
            });
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setSelectedVinculo(null);
                    setAnswers({});
                    setSelectedSubgrupo("");
                    setSelectedSkills([]);
                    setAvailableSkills([]);
                    fetchInitialData();
                }, 3000);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.successState}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
                <h3>¡Gracias por tu retroalimentación!</h3>
                <p>Tu evaluación ayuda a las universidades a mejorar sus programas académicos.</p>
            </div>
        );
    }

    if (selectedVinculo) {
        return (
            <div className={styles.surveyForm}>
                <button onClick={() => setSelectedVinculo(null)} className={styles.backButton}>← Volver</button>
                <header className={styles.formHeader}>
                    <h2>Evaluación de Desempeño</h2>
                    <p>Evaluando a: <strong>{selectedVinculo.nombre_alumno}</strong></p>
                </header>

                <form onSubmit={handleSubmit}>
                    
                    <div className={styles.questionCard}>
                        <label>¿Qué área de especialidad o habilidades motivaron principalmente esta contratación? *</label>
                        <select 
                            className={styles.dropdown}
                            value={selectedSubgrupo} 
                            onChange={(e) => handleSubgrupoChange(e.target.value)}
                            required
                        >
                            <option value="">Selecciona un subgrupo operador...</option>
                            {subgrupos.map(s => <option key={s.id_subgrupo} value={s.id_subgrupo}>{s.nombre_subgrupo}</option>)}
                        </select>

                        {availableSkills.length > 0 && (
                            <div className={styles.skillsContainer}>
                                <p className={styles.skillsLabel}>Selecciona las habilidades específicas demostradas (opcional):</p>
                                <div className={styles.skillsGrid}>
                                    {availableSkills.map(skill => (
                                        <label key={skill.id_habilidad} className={styles.skillCheckbox}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSkills.includes(skill.id_habilidad)}
                                                onChange={() => toggleSkill(skill.id_habilidad)}
                                            />
                                            {skill.nombre_habilidad}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {questions.map(q => (
                        <div key={q.id_pregunta} className={styles.questionCard}>
                            <label>{q.pregunta}</label>
                            {q.tipo === 'rango' ? (
                                <div className={styles.ratingGroup}>
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button 
                                            key={v}
                                            type="button"
                                            className={answers[q.id_pregunta]?.valor_rango === v ? styles.activeRating : ""}
                                            onClick={() => handleRatingChange(q.id_pregunta, v)}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                    <span className={styles.ratingInfo}>
                                        {answers[q.id_pregunta]?.valor_rango ? 
                                            (answers[q.id_pregunta].valor_rango <= 2 ? "Mejorable" : 
                                             answers[q.id_pregunta].valor_rango === 3 ? "Bien" : "Excelente") 
                                            : "Selecciona una opción"}
                                    </span>
                                </div>
                            ) : (
                                <textarea 
                                    placeholder="Escribe tus comentarios aquí..."
                                    value={answers[q.id_pregunta]?.valor_texto || ""}
                                    onChange={(e) => handleTextChange(q.id_pregunta, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Evaluación"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Feedback y Evaluaciones</h2>
                <p>Tu opinión es vital para cerrar la brecha entre la academia y la industria.</p>
            </header>

            <div className={styles.list}>
                <h3>Evaluaciones Pendientes</h3>
                {pendingVincules.length > 0 ? pendingVincules.map(v => (
                    <div key={v.id_vinculo} className={styles.pendingCard} onClick={() => setSelectedVinculo(v)}>
                        <div className={styles.pendingInfo}>
                            <FontAwesomeIcon icon={faPenSquare} className={styles.pendingIcon} />
                            <div>
                                <h4>{v.nombre_alumno}</h4>
                                <p>{v.nombre_universidad} • {v.cat_estatus}</p>
                            </div>
                        </div>
                        <button className={styles.evalButton}>Evaluar</button>
                    </div>
                )) : (
                    <div className={styles.empty}>No tienes evaluaciones pendientes por realizar.</div>
                )}
            </div>
        </div>
    );
};

export default FeedbackSurvey;
