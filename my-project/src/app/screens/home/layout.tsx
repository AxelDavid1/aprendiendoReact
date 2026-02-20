// app/screens/home/layout.tsx
"use client";
import { useState, useEffect } from "react";
import styles from "./Home.module.css";
import SplitText from "../../components/controls/SplitText";
import UserMenu from "../../components/controls/UserMenu";
import MainMenu from "../../components/controls/MainMenu";
import BlurText from "../../components/controls/BlurText";
import DecryptedText from "../../components/controls/DecryptedText";
import Card from "../../components/controls/Card";
import LogoSEDEQ from "../../../../public/assets/Secretaria-de-educacion-Queretaro.png";
import StudentDashboard from "../../components/dashboards/StudentDashboard";
import TeacherDashboard from "../../components/dashboards/TeacherDashboard";
import UniversityDashboard from "../../components/dashboards/UniversityDashboard";
import SEDEQDashboard from "../../components/dashboards/SEDEQDashboard";
import EmpresaDashboard from "../../components/dashboards/EmpresaDashboard";
import Image from "next/image";
import ValidacionCertificadosYConstanciasPublica from "../../components/modules/ValidacionCertificadosYConstanciasPublica";

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

// Define the possible keys for our roleMap
type RoleMapKeys = "alumno" | "maestro" | "admin_universidad" | "admin_sedeq" | "admin_empresa";

// Define a type for the raw data from localStorage.
interface RawStoredUserData {
  id_usuario?: number;
  tipo_usuario?: RoleMapKeys | string;
  username?: string;
  [key: string]: unknown; // Allow other properties
}

export default function HomeLayout() {
  const [user, setUser] = useState<RawStoredUserData | null>(null);

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    if (storedUserString) {
      try {
        const rawStoredUser: RawStoredUserData = JSON.parse(storedUserString);

        // Validación básica (permisiva)
        if (rawStoredUser.id_usuario && rawStoredUser.tipo_usuario) {
          setUser(rawStoredUser);
        } else {
          console.error("Malformed user data in localStorage. Clearing...");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const renderContent = () => {
    if (!user) {
      return (
        <>
          <main className={styles.contenidoIntro}>
            <Card
              title="Bienvenido"
              description="Ingresa a tu cuenta para desbloquear todas las oportunidades que tenemos para ti."
              bottomText="Explora nuestros cursos"
              logoConfig={{
                type: "none",
                customSvg: null,
                width: 0,
                height: 0,
              }}
            />
          </main>
          <ValidacionCertificadosYConstanciasPublica />
        </>
      );
    }

    // Map the role from backend format to uppercase (fallback if undefined)
    const roleMap: Record<RoleMapKeys, string> = {
      alumno: "ALUMNO",
      maestro: "MAESTRO",
      admin_universidad: "UNIVERSIDAD",
      admin_sedeq: "SEDEQ",
      admin_empresa: "EMPRESA",
    };
    const mappedRole = user.tipo_usuario ? roleMap[user.tipo_usuario as RoleMapKeys] || user.tipo_usuario : "UNKNOWN";

    switch (mappedRole) {
      case "ALUMNO":
        return <StudentDashboard userId={user.id_usuario} />;
      case "MAESTRO":
        return <TeacherDashboard userId={user.id_usuario} />;
      case "UNIVERSIDAD":
        return <UniversityDashboard userId={user.id_usuario} />;
      case "SEDEQ":
        return <SEDEQDashboard userId={user.id_usuario} />;
      case "EMPRESA":
        return <EmpresaDashboard userId={user.id_usuario} user={user} />;
      default:
        return (
          <p className="text-center text-red-600">Rol de usuario no válido.</p>
        );
    }
  };

  return (
    <div className={styles.fondoHome}>
      {/*HEADER*/}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoContainer}>
            <Image
              src={LogoSEDEQ}
              alt="Logo SEDEQ"
              fill
              className={styles.logo}
              style={{
                objectFit: "cover",
                zIndex: 10,
                height: "100%",
              }}
            />
          </div>
        </div>
        <div className={styles.headerCenter}>
          <SplitText
            text="Aprendizaje y Desarrollo Profesional"
            className="text-2xl text-black"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </div>
        <div className={styles.headerRight}>
          <MainMenu isAuthenticated={!!user} />
          <UserMenu
            user={user}
            onLogout={() => {
              localStorage.removeItem("user");
              setUser(null);
            }}
          />
        </div>
      </header>
      {renderContent()}
      
      {/* CONTENIDO: Solo mostrar si NO hay user (vista pública) */}
      {!user && (
        <div className={styles.contenidoHomeAprendizaje}>
          <BlurText
            text="Programas de aprendizaje"
            delay={320}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-6xl mb-12"
            animationFrom={{ filter: "blur(10px)", opacity: 0, y: -50 }}
            animationTo={[
              { filter: "blur(5px)", opacity: 0.5, y: 5 },
              { filter: "blur(0px)", opacity: 1, y: 0 },
            ]}
          />
          <div className={styles.contenidoText}>
            <DecryptedText
              text="Un programa de aprendizaje es un sitio al que un grupo de estudiantes
              invitados tiene acceso a un catálogo de cursos que los ayuda a
              desarrollar las habilidades pertinentes para desempeñarse en sus
              trabajos actuales y alcanzar futuras metas en sus carreras
              profesionales. Debe invitarse a los estudiantes a unirse a un Programa
              de aprendizaje y un estudiante puede unirse a múltiples Programas de
              aprendizaje. Cada programa de aprendizaje cuenta con un catálogo
              específico de cursos a los que solo pueden acceder los estudiantes
              invitados a unirse a dicho programa. Los administradores de programas
              pueden editar el catálogo de recomendaciones de cursos y agregar
              colecciones específicas de cursos. Asimismo, pueden invitar, eliminar
              y ver informes de los estudiantes de dicho programa de aprendizaje."
              animateOn="view"
              revealDirection="center"
            />
          </div>
        </div>
      )}

      {/*FOOTER: Siempre visible para consistencia, pero si causa issues, hazlo {!user && <footer...>} */}
      <footer className={styles.contenidoFooter}>
        <div className={styles.contenidoFooter1}>
          <div>
            <h1>
              SEDEQ | Secretaría de Educación del Estado de Querétaro. /*
              Redirigir a https://portal.queretaro.gob.mx/educacion/*/
            </h1>
            <h2>
              CEATyCC | Comisión de Educación en Alta Tecnología y Cloud
              Computing /*Redirigir a https://ceatycc.fif-uaq.mx/index.html */
            </h2>
          </div>
        </div>
        <div className={styles.contenidoFooter2}>
          <div>
            <h4>
              Todos los logos y marcas registradas en este sitio son propiedad
              de sus respectivos propietarios. La información aquí dispuesta
              puede ser modificada con previo aviso a los participantes del
              evento. Este programa es público, ajeno a cualquier partido
              político. Queda prohibido el uso para fines distintos a los
              establecidos en el programa.
            </h4>
            <p>© Copyright TheEvent. All Rights Reserved</p>
            <p>Comisión de Educación en Alta Tecnología y Cloud Computing </p>
          </div>
        </div>
      </footer>
    </div>
  );
}