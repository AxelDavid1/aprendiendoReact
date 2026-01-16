import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faExclamationTriangle,
    faCheckCircle,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from './GestionHorarios.module.css';

const API_URL = '/api/horarios';

const initialHorarioState = {
    id_horario: null,
    tipo_sesion: 'clase',
    dia_semana: 'lunes',
    hora_inicio: '',
    hora_fin: '',
    modalidad_dia: 'presencial',
    link_clase: '',
};

function GestionHorarios({ cursoId }) {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState(initialHorarioState);
    const [isDeleting, setIsDeleting] = useState(false);

    // Estados para el modal de confirmación personalizado
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [horarioToDelete, setHorarioToDelete] = useState(null);

    const fetchHorarios = useCallback(async () => {
        if (!cursoId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/curso/${cursoId}`);
            if (!response.ok) {
                throw new Error('Error al cargar los horarios.');
            }
            const data = await response.json();
            setHorarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [cursoId]);

    useEffect(() => {
        fetchHorarios();
    }, [fetchHorarios]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenForm = (horario = null) => {
        if (horario) {
            setIsEditing(true);
            setFormState({ ...horario, hora_inicio: horario.hora_inicio.substring(0, 5), hora_fin: horario.hora_fin.substring(0, 5) });
        } else {
            setIsEditing(false);
            setFormState(initialHorarioState);
        }
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setIsEditing(false);
        setFormState(initialHorarioState);
    };

    const handleSubmit = useCallback(async (e) => {
        e.stopPropagation(); // ¡Importante! Evita que el clic se propague.
        e.preventDefault(); // Buena práctica, aunque el botón es type="button".
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${formState.id_horario}` : API_URL;

        const body = { ...formState, id_curso: cursoId };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Ocurrió un error.');
            }
            fetchHorarios();
            handleCloseForm();
        } catch (err) {
            console.error("Error al guardar el horario:", err);
            setError(err.message);
        }
    }, [cursoId, formState, isEditing, fetchHorarios]);

    // Función para abrir el modal de confirmación
    const handleDeleteClick = useCallback((e, horario) => {
        e.stopPropagation();
        e.preventDefault();

        if (isDeleting) {
            console.warn("Operación de borrado ya en progreso.");
            return;
        }

        setHorarioToDelete(horario);
        setShowConfirmModal(true);
    }, [isDeleting]);

    // Función para confirmar la eliminación
    const handleConfirmDelete = useCallback(async () => {
        if (!horarioToDelete) return;

        setIsDeleting(true);
        setShowConfirmModal(false);

        try {
            const response = await fetch(`${API_URL}/${horarioToDelete.id_horario}`, { method: 'DELETE' });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Ocurrió un error.');
            }

            setHorarios((prevHorarios) =>
                prevHorarios.filter((h) => h.id_horario !== horarioToDelete.id_horario),
            );

            // Forzar repintado específicamente para navegadores problemáticos
            if (navigator.userAgent.includes('Chrome') && navigator.platform.includes('Linux')) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const forceRepaint = document.createElement('div');
                        forceRepaint.style.cssText = 'position:absolute;left:-1px;top:-1px;width:1px;height:1px;';
                        document.body.appendChild(forceRepaint);
                        document.body.removeChild(forceRepaint);
                    });
                });
            }

        } catch (err) {
            console.error("Error al eliminar el horario:", err);
            setError(err.message);
        } finally {
            setTimeout(() => {
                setIsDeleting(false);
                setHorarioToDelete(null);
            }, 300);
        }
    }, [horarioToDelete]);

    // Función para cancelar la eliminación
    const handleCancelDelete = useCallback(() => {
        setShowConfirmModal(false);
        setHorarioToDelete(null);
    }, []);

    const formatDay = (day) => day.charAt(0).toUpperCase() + day.slice(1);
    const formatTime = (time) => time ? time.substring(0, 5) : '';

    return (
        <div className={styles.gestionContainer}>
            <h4>Gestión de Horarios</h4>
            {loading && <p>Cargando horarios...</p>}
            {error && <p className={styles.errorText}>{error}</p>}

            {!loading && horarios.length === 0 && !isFormVisible && (
                <div className={styles.emptyState}><p>Este curso aún no tiene horarios definidos.</p></div>
            )}

            <ul className={styles.horariosList}>
                {horarios.map(h => (
                    <li key={h.id_horario} className={styles.horarioItem}>
                        <div className={styles.horarioInfo}>
                            <strong>{h.tipo_sesion === 'clase' ? 'Clase' : 'Tutoría'}:</strong> {formatDay(h.dia_semana)} de {formatTime(h.hora_inicio)} a {formatTime(h.hora_fin)} ({h.modalidad_dia})
                        </div>
                        <div className={styles.horarioActions}>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenForm(h); }} className={styles.actionButton} title="Editar"><FontAwesomeIcon icon={faEdit} /></button>
                            <button onClick={(e) => handleDeleteClick(e, h)} className={styles.actionButton} title="Eliminar" disabled={isDeleting}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                    </li>
                ))}
            </ul>

            {!isFormVisible && (
                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(); }} className={styles.addButton}><FontAwesomeIcon icon={faPlus} /> Agregar Horario</button>
            )}

            {isFormVisible && (
                <div className={styles.horarioForm}>
                    <h5>{isEditing ? 'Editar Horario' : 'Nuevo Horario'}</h5>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Tipo</label>
                            <select name="tipo_sesion" value={formState.tipo_sesion} onChange={handleFormChange}><option value="clase">Clase</option><option value="tutoria">Tutoría</option></select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Día</label>
                            <select name="dia_semana" value={formState.dia_semana} onChange={handleFormChange}><option value="lunes">Lunes</option><option value="martes">Martes</option><option value="miercoles">Miércoles</option><option value="jueves">Jueves</option><option value="viernes">Viernes</option><option value="sabado">Sábado</option><option value="domingo">Domingo</option></select>
                        </div>
                        <div className={styles.formGroup}><label>Hora Inicio</label><input type="time" name="hora_inicio" value={formState.hora_inicio} onChange={handleFormChange} required /></div>
                        <div className={styles.formGroup}><label>Hora Fin</label><input type="time" name="hora_fin" value={formState.hora_fin} onChange={handleFormChange} required /></div>
                        <div className={styles.formGroup}>
                            <label>Modalidad del Día</label>
                            <select name="modalidad_dia" value={formState.modalidad_dia} onChange={handleFormChange}><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select>
                        </div>
                        {formState.modalidad_dia === 'virtual' && (
                            <div className={styles.formGroup}><label>Link de la Clase</label><input type="url" name="link_clase" value={formState.link_clase || ''} onChange={handleFormChange} placeholder="https://meet.google.com/..." /></div>
                        )}
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCloseForm} className={styles.cancelButton}>Cancelar</button>
                        <button type="button" onClick={(e) => handleSubmit(e)} className={styles.saveButton}>Guardar Horario</button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación personalizado */}
            {showConfirmModal && (
                <div
                    className={styles.confirmModalBackdrop}
                    onClick={handleCancelDelete}
                >
                    <div
                        className={styles.confirmModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.confirmModalContent}>
                            <div className={styles.confirmIcon}>
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                            </div>
                            <h3>Confirmar Eliminación</h3>
                            <p>
                                ¿Estás seguro de que quieres eliminar el horario de{" "}
                                <strong>{horarioToDelete?.dia_semana} de {formatTime(horarioToDelete?.hora_inicio)} a {formatTime(horarioToDelete?.hora_fin)}</strong>?
                            </p>
                            <p className={styles.warningText}>Esta acción no se puede deshacer.</p>
                        </div>
                        <div className={styles.confirmActions}>
                            <button
                                onClick={handleCancelDelete}
                                className={styles.cancelButton}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className={styles.deleteConfirmButton}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default GestionHorarios;