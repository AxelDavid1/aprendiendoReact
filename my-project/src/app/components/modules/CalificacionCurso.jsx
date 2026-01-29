"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./CalificacionCurso.module.css";
import VistaCalificacion from "./vistaCalificado";

const API_BASE_URL = "";

const CalificacionCurso = ({ rol, entidadId, userUniversityId, teacherId }) => {
  const { token } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [vistaCalificacionVisible, setVistaCalificacionVisible] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalCursos, setTotalCursos] = useState(0);
  const cursosPerPage = 15;

  // Estados para los filtros - para maestros solo necesita carreras
  const [universidades, setUniversidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [filtros, setFiltros] = useState({
    universidadId: "",
    facultadId: "",
    carreraId: "",
    searchTerm: "",
  });

  // Ref para el debounce
  const debounceTimeoutRef = useRef(null);

  // Determinar si es maestro para ocultar filtros
  const isTeacher = rol === "teacher";

  const fetchData = async (page = 1, filtrosActuales = filtros) => {
    setLoading(true);
    setError(null);
    try {
      // Construir la URL con los parámetros de paginación y filtros
      const params = new URLSearchParams({
        page: page,
        limit: cursosPerPage,
        groupByCourse: "true", // <-- Mantener este parámetro
        exclude_assigned: "false", // <-- Añadir este para ver TODOS los cursos
        ...filtrosActuales,
      });

      // Para maestros, agregar el filtro por teacherId
      if (isTeacher && teacherId) {
        params.append("id_maestro", teacherId);
      }

      // Filtrar parámetros vacíos para limpiar la URL
      for (const [key, value] of [...params.entries()]) {
        if (!value || value === "" || value === "undefined") {
          params.delete(key);
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cursos?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData.message || "Error al cargar los cursos");
      }

      const data = await response.json();
      setCursos(data.cursos || []);
      setTotalPaginas(data.totalPages || 0);
      setTotalCursos(data.total || 0); // <-- Usar 'total' en lugar de 'totalCursos'
      setPaginaActual(page);
    } catch (err) {
      setError("No se pudieron cargar los datos. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(1, filtros);

      // Cargar datos para los filtros
      const fetchFilterData = async () => {
        try {
          // Para maestros, cargar carreras de su facultad
          if (isTeacher) {
            // Obtener información completa del maestro desde el backend
            let maestroFacultadId = "";
            try {
              console.log("DEBUG: Obteniendo info del maestro ID:", teacherId);
              const maestroRes = await fetch(
                `${API_BASE_URL}/api/maestros/${teacherId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              
              if (maestroRes.ok) {
                const maestroData = await maestroRes.json();
                console.log("DEBUG: Info maestro desde backend:", maestroData.data);
                maestroFacultadId = maestroData.data.id_facultad?.toString() || "";
                
                // Actualizar localStorage con la información completa
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  user.id_facultad = maestroData.data.id_facultad;
                  localStorage.setItem("user", JSON.stringify(user));
                }
              } else {
                console.error("Error al obtener info del maestro:", maestroRes.status);
              }
            } catch (error) {
              console.error("Error al obtener información del maestro:", error);
            }
            
            console.log("DEBUG: maestroFacultadId:", maestroFacultadId);
            
            // Cargar carreras de la facultad del maestro
            if (maestroFacultadId) {
              console.log("DEBUG: Cargando carreras de facultad:", maestroFacultadId);
              const carRes = await fetch(
                `${API_BASE_URL}/api/carreras/facultad/${maestroFacultadId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const carData = await carRes.json();
              console.log("DEBUG: Carreras recibidas:", carData);
              setCarreras(carData.data || []);
            } else {
              console.log("DEBUG: No hay facultad, cargando todas las carreras");
              // Fallback: cargar todas las carreras si no tiene facultad
              const carRes = await fetch(
                `${API_BASE_URL}/api/carreras?limit=9999`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const carData = await carRes.json();
              console.log("DEBUG: Todas las carreras recibidas:", carData);
              setCarreras(carData.data || []);
            }
          } else {
            // Para otros roles, cargar universidades y facultades como antes
            // Cargar Universidades
            const uniRes = await fetch(
              `${API_BASE_URL}/api/universidades?limit=9999`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const uniData = await uniRes.json();
            setUniversidades(uniData.universities || []);

            // Cargar Facultades (si una universidad está seleccionada)
            if (filtros.universidadId) {
              const facRes = await fetch(
                `${API_BASE_URL}/api/facultades/universidad/${filtros.universidadId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const facData = await facRes.json();
              setFacultades(facData.data || []);
            } else {
              setFacultades([]); // Limpiar si no hay universidad
            }

            // Cargar Carreras (si una facultad está seleccionada)
            if (filtros.facultadId) {
              const carRes = await fetch(
                `${API_BASE_URL}/api/carreras/facultad/${filtros.facultadId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const carData = await carRes.json();
              setCarreras(carData.data || []);
            } else {
              setCarreras([]);
            }
          }
        } catch (error) {
          console.error("Error al cargar datos de filtros:", error);
        }
      };

      fetchFilterData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, rol, entidadId, filtros.universidadId, filtros.facultadId]); // Se vuelve a ejecutar si cambia el ID de la universidad o facultad

  const handlePageChange = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      fetchData(nuevaPagina, filtros);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    // Si se cambia la universidad, se resetea la facultad y carrera
    const nuevosFiltros = { ...filtros, [campo]: valor };
    if (campo === "universidadId") {
      nuevosFiltros.facultadId = "";
      nuevosFiltros.carreraId = "";
    }
    if (campo === "facultadId") {
      nuevosFiltros.carreraId = "";
    }
    
    // Actualizar el estado inmediatamente (sin llamar a la API aún)
    setFiltros(nuevosFiltros);
    
    // Para el campo de búsqueda, usar debounce
    if (campo === "searchTerm") {
      // Limpiar el timeout anterior
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Establecer nuevo timeout
      debounceTimeoutRef.current = setTimeout(() => {
        setPaginaActual(1);
        fetchData(1, nuevosFiltros);
      }, 500); // 500ms de debounce
    } else {
      // Para filtros de select, ejecutar inmediatamente
      setPaginaActual(1);
      fetchData(1, nuevosFiltros);
    }
  };


  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <p>Cargando gestión de calificaciones...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={styles.container}>
        <div className={styles.errorModal}>{error}</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Calificaciones</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Sección de Filtros */}
        <div className={styles.filterBar}>
          <div className={styles.filters}>
            {/* Mostrar filtros de universidad y facultad solo para roles que no sean maestros */}
            {!isTeacher && (
              <>
                <select
                  className={styles.input}
                  value={filtros.universidadId}
                  onChange={(e) =>
                    handleFiltroChange("universidadId", e.target.value)
                  }
                >
                  <option value="">Todas las Universidades</option>
                  {universidades.map((uni) => (
                    <option key={uni.id_universidad} value={uni.id_universidad}>
                      {uni.nombre}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.input}
                  value={filtros.facultadId}
                  onChange={(e) => handleFiltroChange("facultadId", e.target.value)}
                  disabled={!filtros.universidadId || facultades.length === 0}
                >
                  <option value="">Facultad</option>
                  {facultades.map((fac) => (
                    <option key={fac.id_facultad} value={fac.id_facultad}>
                      {fac.nombre}
                    </option>
                  ))}
                </select>
              </>
            )}
            
            {/* Filtro de carrera - visible para todos los roles */}
            <select
              className={styles.input}
              value={filtros.carreraId}
              onChange={(e) => handleFiltroChange("carreraId", e.target.value)}
              disabled={!isTeacher && (!filtros.facultadId || carreras.length === 0)}
            >
              <option value="">Carrera</option>
              {carreras.map((car) => (
                <option key={car.id_carrera} value={car.id_carrera}>
                  {car.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por nombre de curso..."
              className={styles.searchInput}
              value={filtros.searchTerm}
              onChange={(e) => handleFiltroChange("searchTerm", e.target.value)}
            />
          </div>
        </div>

        {/* Información de resultados */}
        {totalCursos > 0 && (
          <div className={styles.resultsInfo}>
            <p>
              Mostrando {(paginaActual - 1) * cursosPerPage + 1}-
              {Math.min(paginaActual * cursosPerPage, totalCursos)} de{" "}
              {totalCursos} cursos
            </p>
          </div>
        )}

        {/* Grid de Cursos */}
        {cursos.length > 0 ? (
          <div className={styles.coursesGrid}>
            {cursos.map((curso) => {
              const isCursoFinalizado =
                curso.fecha_fin && new Date(curso.fecha_fin) < new Date();
              return (
                <div key={curso.id_curso} className={styles.courseCard}>
                  <h3 className={styles.courseTitle}>{curso.nombre_curso}</h3>
                  <p className={styles.courseInfo}>
                    {curso.nombre_universidad || "N/A"} -{" "}
                    {curso.nombre_facultad || "N/A"}
                  </p>
                  <p className={styles.courseInfo}>
                    Carrera: {curso.nombre_carrera || "No especificada"}
                  </p>
                  <div className={styles.courseStats}>
                    <span>Umbral: {curso.umbral_aprobatorio ?? "N/A"}%</span>
                  </div>
                  <div className={styles.courseCardActions}>
                    <button
                      onClick={() => {
                        setCursoSeleccionado(curso);
                        setVistaCalificacionVisible(true);
                      }}
                      className={styles.buttonSecondary}
                      disabled={isCursoFinalizado}
                      title={
                        isCursoFinalizado
                          ? "Este curso ya ha finalizado."
                          : "Calificar alumnos del curso"
                      }
                    >
                      Calificar Alumnos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No se encontraron cursos</h3>
            <p>Intenta ajustar los filtros o agrega nuevos cursos.</p>
          </div>
        )}

        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={styles.pageButton}
            >
              Anterior
            </button>

            <span className={styles.pageInfo}>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => handlePageChange(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={styles.pageButton}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Modal de Calificación de Alumnos */}
        {vistaCalificacionVisible && cursoSeleccionado && (
          <VistaCalificacion
            curso={cursoSeleccionado}
            onClose={() => setVistaCalificacionVisible(false)}
          />
        )}

      </main>
    </div>
  );
};

export default CalificacionCurso;