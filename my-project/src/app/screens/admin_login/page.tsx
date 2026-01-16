// Frontend - AdminLogin.jsx (versión con debugging)
"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios"; // Import AxiosError
import styles from "./AdminLogin.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiErrorResponse {
  error?: string; // Assuming the error message is a string and might be optional
}

interface UserDataForLocalStorage {
  id_usuario: number;
  tipo_usuario: "alumno" | "maestro" | "admin_universidad" | "admin_sedeq" | string;
  username: string;
  // Add any other properties that HomeLayout might need from the user object
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("=== DEBUG LOGIN ===");
    console.log("API_URL:", API_URL);
    console.log("URL completa:", `${API_URL}/admin_login`);
    console.log("Datos enviados:", { loginId: username, password: "***" });

    try {
      const response = await axios.post(`${API_URL}/admin_login`, {
        loginId: username,
        password: password,
      });

      console.log("Respuesta del servidor:", response.data);

      const user = response.data.user;

      // Guardar token en localStorage si es necesario (solo una vez)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Prepare user data for localStorage, using original backend keys
      if (user) {
        const userData: UserDataForLocalStorage = {
          id_usuario: user.id_usuario, // Usa "id_usuario" directamente
          tipo_usuario: user.tipo_usuario, // Usa "tipo_usuario" directamente
          username: user.username,
        };

        localStorage.setItem("user", JSON.stringify(userData));

        // Redirect to the home page
        router.push("/screens/home");
      } else {
        // Handle cases where user data might be missing in the response
        setError("Información de usuario no recibida del servidor.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        console.error("Error completo:", axiosError);
        console.error("Error response:", axiosError.response?.data);
        console.error("Error status:", axiosError.response?.status);

        if (
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ERR_NETWORK"
        ) {
          setError(
            "No se puede conectar al servidor. Verifica que el backend esté ejecutándose.",
          );
        } else {
          const errorMessage =
            axiosError.response?.data?.error ||
            "Error de conexión o credenciales incorrectas";
          setError(errorMessage);
        }
      } else {
        console.error("An unexpected error occurred:", err);
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.fondoLogin}>
      <div className={styles.loginContainer}>
        <p className={styles.loginText} id="heading">
          Iniciar Sesión Administrador
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Correo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.inputField}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
            disabled={loading}
          />
          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}