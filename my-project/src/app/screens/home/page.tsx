"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Importar TUS dashboards existentes
import StudentDashboard from "../../components/dashboards/StudentDashboard";
import TeacherDashboard from "../../components/dashboards/TeacherDashboard";
import UniversityDashboard from "../../components/dashboards/UniversityDashboard";
import SEDEQDashboard from "../../components/dashboards/SEDEQDashboard";
import EmpresaDashboard from "../../components/dashboards/EmpresaDashboard";

interface User {
  id_usuario: number;
  username: string;
  tipo_usuario: "alumno" | "maestro" | "admin_universidad" | "admin_sedeq" | "admin_empresa";
  id_empresa?: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Este código se ejecuta solo en el navegador del cliente
    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      try {
        const userData: User = JSON.parse(userDataString);
        if (userData?.id_usuario && userData?.tipo_usuario) {
          setUser(userData);
        } else {
          // Datos corruptos, redirigir a login
          router.push("/screens/login");
        }
      } catch (error) {
        console.error("Fallo al parsear datos de usuario.", error);
        router.push("/screens/login");
      }
    } else {
      // Si no hay datos de usuario, no está logueado.
      router.push("/screens/login");
    }

    setLoading(false);
  }, [router]);

  const renderDashboard = () => {
    if (!user) {
      return null; // No mostrar nada mientras se redirige
    }

    switch (user.tipo_usuario) {
      case "alumno":
        return <StudentDashboard userId={user.id_usuario} />;
      case "maestro":
        return <TeacherDashboard userId={user.id_usuario} />;
      case "admin_universidad":
        return <UniversityDashboard userId={user.id_usuario} />;
      case "admin_sedeq":
        return <SEDEQDashboard userId={user.id_usuario} />;
      case "admin_empresa":
        return <EmpresaDashboard userId={user.id_usuario} user={user} />;
      default:
        console.error(`Tipo de usuario no reconocido: ${user.tipo_usuario}`);
        router.push("/screens/login");
        return <p>Tipo de usuario no válido. Redirigiendo...</p>;
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Cargando...</h2></div>;
  }

  return <>{renderDashboard()}</>;
}
