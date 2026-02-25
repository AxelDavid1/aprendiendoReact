"use client";

// 1. Agregamos Suspense a los imports
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import styles from "./SignUp.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "768061039087-q59g2dbarenff9j3epsvc2gp208fiu2k.apps.googleusercontent.com";

interface SignUpResponse {
  message: string;
  user: {
    id_usuario: number;
    username: string;
    email: string;
    tipo_usuario: string;
  };
}

interface ErrorResponse {
  error?: string;
}

interface University {
  id_universidad: number;
  nombre: string;
  tipo_periodo: string;
}

interface Carrera {
  id_carrera: number;
  nombre: string;
}

// 2. Renombramos tu componente principal a "SignUpContent" y quitamos el "export default"
function SignUpContent() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for multi-step form
  const [step, setStep] = useState<"signup" | "completeProfile">("signup");
  const [newUser, setNewUser] = useState<SignUpResponse["user"] | null>(null);
  const [profileData, setProfileData] = useState({
    nombre_completo: "",
    matricula: "",
    id_universidad: "",
    id_carrera: "",
    semestre_actual: "",
    correo_personal: "",
  });
  const [universidades, setUniversidades] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const action = searchParams.get("action");

    if (action === "completeProfile") {
      const pendingUserData = localStorage.getItem("pendingUser");
      if (pendingUserData) {
        try {
          const user = JSON.parse(pendingUserData);
          setNewUser(user);
          setProfileData((prev) => ({
            ...prev,
            nombre_completo: user.username,
          }));
          setStep("completeProfile");

          // Cargar universidades
          axios
            .get(`${API_URL}/public/universidades?limit=999`)
            .then((res) => setUniversidades(res.data.universities || res.data || []))
            .catch(() => setError("No se pudieron cargar las universidades."));

          localStorage.removeItem("pendingUser");
        } catch (error) {
          console.error("Error recuperando datos:", error);
          setError("Hubo un error al recuperar los datos del usuario.");
        }
      }
    }
  }, [searchParams]);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setError("");
    setSuccess("");
    console.log(
      "Registro con Google: Token recibido:",
      credentialResponse.credential,
    );
    try {
      const response = await axios.post<SignUpResponse>(
        `${API_URL}/auth/google-signup`,
        {
          token: credentialResponse.credential,
        },
      );
      console.log("Registro con Google: Respuesta:", response.data);

      if (response.data.message === "Google Sign-Up successful") {
        setNewUser(response.data.user);
        setProfileData((prev) => ({
          ...prev,
          nombre_completo: response.data.user.username,
        }));
        setStep("completeProfile");
        try {
          const uniResponse = await axios.get(
            `${API_URL}/public/universidades?limit=999`,
          );
          setUniversidades(uniResponse.data.universities || uniResponse.data || []);
        } catch (error) {
          console.error("Error cargando universidades:", error);
          setError(
            "No se pudieron cargar las universidades. Por favor, recargue la página.",
          );
        }
      } else {
        console.error(
          "Registro con Google: Respuesta inesperada:",
          response.data,
        );
        setError("Error en el registro: Respuesta inesperada");
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.error ||
        "Error en el registro con Google: " + (error.message || "Desconocido");
      console.error("Registro con Google: Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setError("Error al autenticarse con Google");
    console.error("Registro con Google: Falló la autenticación con Google");
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "id_universidad" && { id_carrera: "" }),
    }));
  };

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);

  React.useEffect(() => {
    if (profileData.id_universidad) {
      setLoadingCarreras(true);
      axios
        .get(`${API_URL}/public/carreras/by-universidad/${profileData.id_universidad}`)
        .then((res) => setCarreras(res.data.carreras || []))
        .catch(() => setError("No se pudieron cargar las carreras."))
        .finally(() => setLoadingCarreras(false));
    }
  }, [profileData.id_universidad]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!newUser) {
      setError("No se encontró información del usuario. Intente de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...profileData,
        id_usuario: newUser.id_usuario,
      };
      const response = await axios.post(
        `${API_URL}/alumnos/complete-profile`,
        payload,
      );
      setSuccess(
        response.data.message + " Redirigiendo al inicio de sesión...",
      );
      setTimeout(() => router.push("/screens/login"), 3000);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.error || "Error al completar el perfil.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.fondoSignUp}>
        <div className={styles.signUpContainer}>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          {step === "signup" && (
            <>
              <p className={styles.signUpText} id="heading">
                Registro
              </p>
              <p className={styles.infoText}>
                Usa tu cuenta de Google institucional para registrarte.
              </p>
              <div className={styles.googleSignInButton}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signup_with"
                />
              </div>
              <div className={styles.loginLink}>
                <p>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/screens/login")}
                    className={styles.loginLinkButton}
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </>
          )}

          {step === "completeProfile" && (
            <>
              <p className={styles.signUpText} id="heading">
                Completa tu Perfil
              </p>
              <form
                onSubmit={handleProfileSubmit}
                className={styles.profileForm}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="nombre_completo">Nombre Completo</label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={profileData.nombre_completo}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="matricula">Matrícula</label>
                  <input
                    type="text"
                    id="matricula"
                    name="matricula"
                    value={profileData.matricula}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="id_universidad">Universidad</label>
                  <select
                    id="id_universidad"
                    name="id_universidad"
                    value={profileData.id_universidad}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Selecciona tu universidad</option>
                    {universidades.map((uni) => (
                      <option
                        key={uni.id_universidad}
                        value={uni.id_universidad}
                      >
                        {uni.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="id_carrera">Carrera</label>
                  <select
                    id="id_carrera"
                    name="id_carrera"
                    value={profileData.id_carrera}
                    onChange={handleProfileChange}
                    required
                    disabled={!profileData.id_universidad || loadingCarreras}
                  >
                    <option value="">
                      {loadingCarreras
                        ? "Cargando..."
                        : "Selecciona tu carrera"}
                    </option>
                    {carreras.map((carrera) => (
                      <option key={carrera.id_carrera} value={carrera.id_carrera}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="semestre_actual">
                    {universidades.find((u) => u.id_universidad.toString() === profileData.id_universidad)?.tipo_periodo === "Cuatrimestre"
                      ? "Cuatrimestre Actual"
                      : "Semestre Actual"
                    }
                  </label>
                  <input
                    type="number"
                    id="semestre_actual"
                    name="semestre_actual"
                    value={profileData.semestre_actual}
                    onChange={handleProfileChange}
                    min="1"
                    max="15"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="correo_personal">Correo Personal</label>
                  <input
                    type="email"
                    id="correo_personal"
                    name="correo_personal"
                    value={profileData.correo_personal || ''}
                    onChange={handleProfileChange}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Por favor ingresa un correo electrónico válido"
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Finalizar Registro"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

// 3. Creamos el nuevo componente por defecto que envuelve al contenido
export default function SignUpPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Cargando...</div>}>
      <SignUpContent />
    </Suspense>
  );
}