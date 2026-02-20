"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faFilter, faUserGraduate, faPlus, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import styles from "./TalentSearch.module.css"
import { authenticatedFetch } from "@/utils/api"

const TalentSearch = ({ empresaId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [subgrupos, setSubgrupos] = useState([]);
    const [selectedSubgrupo, setSelectedSubgrupo] = useState("");
    const [universidades, setUniversidades] = useState([]);
    const [selectedUni, setSelectedUni] = useState("");
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
        fetchInitialData();
        searchTalent();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [resSubs, resUnis] = await Promise.all([
                authenticatedFetch("/api/subgrupos-operadores"),
                authenticatedFetch("/api/universidades?limit=1000") // Get all unis
            ]);
            const [subs, unis] = await Promise.all([resSubs.json(), resUnis.json()]);
            setSubgrupos(Array.isArray(subs) ? subs : []);
            setUniversidades(unis.universities || []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
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

    const searchTalent = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                searchTerm,
                id_subgrupo: selectedSubgrupo,
                habilidades: selectedSkills.join(','),
                id_universidad: selectedUni,
                limit: 20
            });
            const res = await authenticatedFetch(`/api/empresa/search-students?${query}`);
            const data = await res.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error("Error searching talent:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecruit = async (studentId) => {
        if (!empresaId) {
            setToast({ show: true, message: "Error: No se encontró ID de empresa.", type: "error" });
            return;
        }
        try {
            const res = await authenticatedFetch("/api/empresa/recruit", {
                method: "POST",
                body: JSON.stringify({ id_alumno: studentId, id_empresa: empresaId })
            });
            const data = await res.json();
            if (res.ok) {
                setToast({ show: true, message: "¡Estudiante añadido a tu embudo!", type: "success" });
            } else {
                setToast({ show: true, message: data.error || "Error al reclutar", type: "error" });
            }
        } catch (error) {
            setToast({ show: true, message: "Error de conexión", type: "error" });
        }
        
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const viewDetails = async (studentId) => {
        setLoadingDetails(true);
        try {
            const res = await authenticatedFetch(`/api/empresa/student/${studentId}/details`);
            const data = await res.json();
            setSelectedStudent(data);
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const calculateSeniority = (current, duration, periodType) => {
        if (!current || !duration) return null;
        
        let labelType = periodType === 'Cuatrimestre' ? 'Cuatrimestre' : 'Semestre';
        
        // duration is now in periods (semesters or quarters)
        if (current > duration) return "Egresado";
        if (current === duration) return `Último ${labelType}`;
        return `${current}° ${labelType}`;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Descubrimiento de Talento</h2>
                <p>Encuentra a los mejores candidatos según su formación y habilidades.</p>
            </header>

            <div className={styles.searchBar}>
                <div className={styles.inputGroup}>
                    <FontAwesomeIcon icon={faSearch} className={styles.icon} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o correo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchTalent()}
                    />
                </div>
                <div className={styles.filters}>
                    <select value={selectedSubgrupo} onChange={(e) => handleSubgrupoChange(e.target.value)}>
                        <option value="">Todos los Subgrupos</option>
                        {subgrupos.map(s => <option key={s.id_subgrupo} value={s.id_subgrupo}>{s.nombre_subgrupo}</option>)}
                    </select>
                    <select value={selectedUni} onChange={(e) => setSelectedUni(e.target.value)}>
                        <option value="">Todas las Universidades</option>
                        {universidades.map(u => <option key={u.id_universidad} value={u.id_universidad}>{u.nombre}</option>)}
                    </select>
                    <button onClick={searchTalent} className={styles.searchButton}>
                        <FontAwesomeIcon icon={faFilter} /> Filtrar
                    </button>
                </div>
            </div>

            {availableSkills.length > 0 && (
                <div className={styles.skillsContainer}>
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
            )}

            {loading ? (
                <div className={styles.loader}>Buscando talentos...</div>
            ) : (
                <div className={styles.grid}>
                    {students.length > 0 ? students.map(student => (
                        <div key={student.id_alumno} className={styles.talentCard}>
                            <div className={styles.imagePlaceholder}>
                                <FontAwesomeIcon icon={faUserGraduate} size="3x" />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={`${styles.cardTitle} ${styles.truncateTwoLines}`}>
                                    {student.nombre_completo}
                                </h3>
                                
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Universidad</span>
                                        <span className={styles.infoValue}>{student.nombre_universidad}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Carrera</span>
                                        <span className={styles.infoValue}>{student.nombre_carrera || "N/A"}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{student.tipo_periodo || "Semestre"}</span>
                                        <span className={styles.infoValue}>{student.semestre_actual}°</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Email</span>
                                        <span className={styles.infoValue}>{student.correo_institucional || student.correo_usuario}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Progreso</span>
                                        <span className={styles.infoValue}>{calculateSeniority(student.semestre_actual, student.duracion_periodos, student.tipo_periodo)}</span>
                                    </div>
                                </div>

                                <div className={styles.statusWrapper}>
                                    <span className={`${styles.statusChip} ${styles.chipActivo}`}>
                                        {student.cursos_terminados} Cursos Listos
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        className={styles.recruitButton}
                                        style={{ backgroundColor: '#64748b' }}
                                        onClick={() => viewDetails(student.id_alumno)}
                                    >
                                        Ver Info
                                    </button>
                                    <button 
                                        className={styles.recruitButton}
                                        onClick={() => handleRecruit(student.id_alumno)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} /> Reclutar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className={styles.noResults}>No se encontraron estudiantes con esos criterios.</div>
                    )}
                </div>
            )}

            {toast.show && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className={styles.modalBackdrop} onClick={() => setSelectedStudent(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{selectedStudent.nombre_completo}</h2>
                            <button className={styles.closeButton} onClick={() => setSelectedStudent(null)}>×</button>
                        </header>
                        <div className={styles.modalBody}>
                            <div className={styles.studentMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Universidad</span>
                                    <span className={styles.metaValue}>{selectedStudent.nombre_universidad}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Carrera</span>
                                    <span className={styles.metaValue}>{selectedStudent.nombre_carrera}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Matrícula</span>
                                    <span className={styles.metaValue}>{selectedStudent.matricula}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Correo</span>
                                    <span className={styles.metaValue}>{selectedStudent.correo_institucional}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>{selectedStudent.tipo_periodo || "Semestre"}</span>
                                    <span className={styles.metaValue}>
                                        {selectedStudent.semestre_actual}°
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Estatus Actual</span>
                                    <span className={styles.metaValue}>
                                        {calculateSeniority(selectedStudent.semestre_actual, selectedStudent.duracion_periodos, selectedStudent.tipo_periodo)}
                                    </span>
                                </div>
                            </div>

                            <h3 className={styles.sectionHeading}>Cursos Completados</h3>
                            <ul className={styles.courseList}>
                                {selectedStudent.completedCourses?.map((course, idx) => (
                                    <li key={idx} className={styles.courseItem}>
                                        <span className={styles.courseName}>{course.nombre_curso}</span>
                                        <span className={styles.courseDate}>
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                            {formatDate(course.fecha_emitida)}
                                        </span>
                                    </li>
                                ))}
                                {selectedStudent.completedCourses?.length === 0 && (
                                    <p className={styles.noResults}>No hay cursos completados registrados.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentSearch;
