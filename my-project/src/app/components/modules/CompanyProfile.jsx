"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faBuilding, faGlobe, faIdCard, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import styles from "./CompanyProfile.module.css"
import { authenticatedFetch } from "@/utils/api"

const CompanyProfile = ({ empresaId }) => {
    const [profile, setProfile] = useState({
        nombre: "",
        descripcion: "",
        sitio_web: "",
        sector: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
        if (empresaId) fetchProfile();
    }, [empresaId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await authenticatedFetch(`/api/empresa/profile/${empresaId}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                console.error("Failed to fetch profile:", res.status);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authenticatedFetch(`/api/empresa/profile/${empresaId}`, {
                method: "PUT",
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                showToast("¡Perfil actualizado con éxito!", "success");
            } else {
                showToast("Error al guardar cambios.", "error");
            }
        } catch (error) {
            showToast("Error de conexión.", "error");
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.loader}>Cargando perfil...</div>
        </div>
    );

    if (!profile.nombre && !loading) return (
        <div className={styles.errorContainer}>
            <p>No se pudo cargar la información de la empresa.</p>
            <button onClick={fetchProfile} className={styles.retryButton}>Reintentar</button>
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>Perfil de Empresa</h2>
                <p>Gestiona la información pública de tu organización para atraer mejor talento.</p>
            </header>

            <form className={styles.form} onSubmit={handleSave}>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>
                            <FontAwesomeIcon icon={faBuilding} className={styles.labelIcon} />
                            Nombre de la Empresa
                        </label>
                        <input 
                            type="text" 
                            value={profile.nombre} 
                            onChange={(e) => setProfile({...profile, nombre: e.target.value})}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            <FontAwesomeIcon icon={faIdCard} className={styles.labelIcon} />
                            Sector Industrial
                        </label>
                        <input 
                            type="text" 
                            value={profile.sector || ""} 
                            placeholder="Ej: Tecnología, Manufactura, Fintech"
                            onChange={(e) => setProfile({...profile, sector: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGroupFull}>
                        <label>
                            <FontAwesomeIcon icon={faGlobe} className={styles.labelIcon} />
                            Sitio Web
                        </label>
                        <input 
                            type="url" 
                            value={profile.sitio_web || ""} 
                            placeholder="https://su-empresa.com"
                            onChange={(e) => setProfile({...profile, sitio_web: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGroupFull}>
                        <label>
                            <FontAwesomeIcon icon={faInfoCircle} className={styles.labelIcon} />
                            Descripción
                        </label>
                        <textarea 
                            rows="5"
                            value={profile.descripcion || ""} 
                            placeholder="Describe la misión, visión y qué tipo de talentos buscas..."
                            onChange={(e) => setProfile({...profile, descripcion: e.target.value})}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.saveButton} disabled={saving}>
                        <FontAwesomeIcon icon={faSave} /> {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </form>

            {toast.show && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default CompanyProfile;
