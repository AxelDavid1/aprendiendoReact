import React from 'react';
import Image from 'next/image'
import styles from './CredencialCard.module.css';

const getStatusChipClass = (estatus) => {
    const statusLower = estatus?.toLowerCase();
    switch (statusLower) {
        case 'obtenida':
        case 'activa':
            return styles.chipActivo;
        case 'vencida':
        case 'revocada':
            return styles.chipFinalizado;
        case 'en progreso':
            return styles.chipProximamente;
        default:
            return styles.chipFinalizado;
    }
};

const CredencialCard = ({ credencial, onVerMas }) => {
    return (
        <div className={styles.credencialCard}>
            <Image
                src={credencial.imagen_url || "/assets/homeWallpaper.jpg"}
                alt={credencial.nombre_credencial || 'Imagen de la credencial'}
                className={styles.credencialImage}
            />
            <div className={styles.credencialContent}>
                <h3 className={`${styles.credencialTitle} ${styles.truncateTwoLines}`}>
                    {credencial.nombre_credencial || 'Credencial sin nombre'}
                </h3>

                <div className={styles.credencialInfoItem}>
                    <span className={styles.credencialInfoLabel}>Universidad</span>
                    <span className={styles.credencialInfoValue}>{credencial.nombre_universidad || 'No asignada'}</span>
                </div>

                <div className={styles.statusWrapper}>
                    <span className={`${styles.credencialChip} ${getStatusChipClass(credencial.estatus)}`}>
                        {credencial.estatus || 'No definido'}
                    </span>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.verMasBtn} onClick={() => onVerMas(credencial)}>
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CredencialCard;