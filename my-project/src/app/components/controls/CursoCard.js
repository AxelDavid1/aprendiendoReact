import React from 'react'
import Image from 'next/image'
import styles from './CursoCard.module.css'

const getStatusChipClass = (estatus) => {
    const statusLower = estatus?.toLowerCase();
    switch (statusLower) {
        case 'abierto':
        case 'en_curso':
            return styles.chipActivo;
        case 'finalizado':
        case 'cancelado':
            return styles.chipFinalizado;
        case 'planificado':
            return styles.chipProximamente;
        default:
            return styles.chipFinalizado; // Color neutral por defecto
    }
};

const formatStatusText = (estatus) => {
    if (!estatus) return 'No disponible';
    // Reemplaza guiones bajos y capitaliza la primera letra
    const formatted = estatus.replace('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};


const CursoCard = ({ curso, onVerMas }) => {
    return (
        <div className={styles.cursoCard}>
            <Image 
                src={curso.imagen_url || "/assets/homeWallpaper.jpg"} 
                alt={curso.nombre_curso} 
                className={styles.cursoImage}
                width={240}
                height={160}
            />
            <div className={styles.cursoContent}>
                <h3 className={`${styles.cursoTitle} ${styles.truncateTwoLines}`}>{curso.nombre_curso}</h3>
                
                <div className={styles.cursoInfoItem}>
                    <span className={styles.cursoInfoLabel}>Universidad</span>
                    <span className={styles.cursoInfoValue}>{curso.nombre_universidad || "No disponible"}</span>
                </div>

                <div className={styles.statusWrapper}>
                    <span className={`${styles.cursoChip} ${getStatusChipClass(curso.estatus_curso)}`}>
                        {formatStatusText(curso.estatus_curso)}
                    </span>
                </div>
                
                <button className={styles.solicitarBtn} onClick={() => onVerMas(curso)}>
                    Ver más detalles
                </button>
            </div>
        </div>
    )
}

export default CursoCard