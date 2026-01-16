"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import styles from "./Login.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "768061039087-q59g2dbarenff9j3epsvc2gp208fiu2k.apps.googleusercontent.com";

interface User {
  id_usuario: number;
  username: string;
  tipo_usuario: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ErrorResponse {
  error?: string;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setError("");
    console.log(
      "Inicio de sesión con Google: Token recibido:",
      credentialResponse.credential,
    );
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/google`,
        {
          token: credentialResponse.credential,
        },
      );
      console.log("Inicio de sesión con Google: Respuesta:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id_usuario: response.data.user.id_usuario,  // Mantiene "id_usuario"
            username: response.data.user.username,
            tipo_usuario: response.data.user.tipo_usuario,  // Mantiene "tipo_usuario"
          }),
        );
        console.log(
          "Inicio de sesión con Google: Usuario autenticado:",
          response.data.user,
        );
        router.push("/screens/home");
      } else {
        console.error(
          "Inicio de sesión con Google: No se recibió token:",
          response.data,
        );
        setError("Error al iniciar sesión: No se recibió token");
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage =
        error.response?.data?.error ||
        "Error al iniciar sesión con Google: " +
          (error.message || "Desconocido");
      console.error("Inicio de sesión con Google: Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (errorMessage === "Usuario no registrado") {
        setError("Usuario no registrado. Redirigiendo al registro...");
        setTimeout(() => router.push("/screens/signup"), 2000);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleGoogleError = () => {
    setError("Error al autenticarse con Google");
    console.error(
      "Inicio de sesión con Google: Falló la autenticación con Google",
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.fondoLogin}>
        <div className={styles.loginContainer}>
          <p className={styles.loginText} id="heading">
            Iniciar Sesión
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.googleLoginButton}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              width="100%"
            />
          </div>
          <div className={styles.loginLink}>
            <p>
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/screens/signup")}
                className={styles.loginLinkButton}
              >
                Registrarse
              </button>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}