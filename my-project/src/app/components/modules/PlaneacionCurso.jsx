"use client"

import { useState, useEffect, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import styles from "./PlaneacionCurso.module.css"

const API_BASE_URL = "http://localhost:5000"

const PlaneacionCurso = ({ curso, onClose, onSave, token }) => {
  // Estados principales
  const [planeacion, setPlaneacion] = useState({
    clave_asignatura: "",
    id_carrera: "",
    caracterizacion: "",
    intencion_didactica: "",
    competencias_desarrollar: "",
    competencias_previas: "",
    evaluacion_competencias: "",
    fecha_creacion: new Date().toISOString().split("T")[0],
    convocatoria_id: "",
  })
  const [porcentajePracticas, setPorcentajePracticas] = useState(50)
  const [porcentajeProyecto, setPorcentajeProyecto] = useState(50)
  const [proyecto, setProyecto] = useState({
    instrucciones: "",
    materiales: [],
    fundamentacion: "",
    planeacion: "",
    ejecucion: "",
    evaluacion: "",
  })
  const [temario, setTemario] = useState([])
  const [temasExpandidos, setTemasExpandidos] = useState({})
  const [practicas, setPracticas] = useState([])
  const [fuentes, setFuentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [carreras, setCarreras] = useState([])
  const [convocatorias, setConvocatorias] = useState([])
  const [universidadesParticipantes, setUniversidadesParticipantes] = useState([])

  useEffect(() => {
    cargarCarreras()
    cargarConvocatorias()
  }, [])

  useEffect(() => {
    if (planeacion.convocatoria_id) {
      cargarUniversidadesParticipantes(planeacion.convocatoria_id)
    }
  }, [planeacion.convocatoria_id])

  // Inicializar id_carrera y clave_asignatura automáticamente
  useEffect(() => {
    if (!planeacion.id_carrera && curso.id_carrera) {
      setPlaneacion((prev) => ({
        ...prev,
        id_carrera: String(curso.id_carrera),
        clave_asignatura: curso.codigo_curso || prev.clave_asignatura,
      }))
    }
  }, [curso.id_carrera, curso.codigo_curso])

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (curso.id_curso) {
      cargarPlaneacionExistente()
    }
  }, [curso.id_curso])

  // --- FUNCIONES PARA CARGAR DATOS ---
  const cargarCarreras = async () => {
    try {
      const params = new URLSearchParams()
      if (curso.id_facultad) {
        params.append("id_facultad", curso.id_facultad)
      } else if (curso.id_universidad) {
        params.append("id_universidad", curso.id_universidad)
      }

      const url = `${API_BASE_URL}/api/carreras${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) return

      const data = await response.json()
      const carrerasResponse = Array.isArray(data) ? data : data.carreras || data.data || []
      setCarreras(carrerasResponse)
    } catch (err) {
      console.error("Error al cargar carreras:", err)
    }
  }

  const cargarConvocatorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/convocatorias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setConvocatorias(data)
      }
    } catch (err) {
      console.error("Error al cargar convocatorias:", err)
    }
  }

  const cargarUniversidadesParticipantes = async (convocatoriaId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/convocatorias/${convocatoriaId}/universidades`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUniversidadesParticipantes(data)
      }
    } catch (err) {
      console.error("Error al cargar universidades participantes:", err)
    }
  }

  const cargarPlaneacionExistente = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/planeacion/${curso.id_curso}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()

        // Actualizar estados con los datos recibidos
        if (data.temario) {
          setTemario(
            data.temario.map((tema) => ({
              id_temporal: Date.now() + Math.random(),
              nombre_tema: tema.nombre,
              competencias_especificas: tema.competencias_especificas || "",
              competencias_genericas: tema.competencias_genericas || "",
              subtemas: (tema.subtemas || []).map((subtema) => ({
                id_temporal: Date.now() + Math.random(),
                nombre_subtema: subtema.nombre,
              })),
            })),
          )
        }

        if (data.porcentaje_practicas) {
          setPorcentajePracticas(data.porcentaje_practicas)
        }

        if (data.porcentaje_proyecto) {
          setPorcentajeProyecto(data.porcentaje_proyecto)
        }

        if (data.practicas) {
          setPracticas(
            data.practicas.map((p, i) => ({
              id_temporal: Date.now() + i,
              descripcion_practica: p.descripcion || p.instrucciones || "",
              materiales: p.materiales || [],
              id_tema: p.id_tema || "",
              id_subtema: p.id_subtema || "",
            })),
          )
        }

        if (data.proyecto) {
          setProyecto({
            instrucciones: data.proyecto.instrucciones || "",
            materiales: data.proyecto.materiales || [],
            fundamentacion: data.proyecto.fundamentacion || "",
            planeacion: data.proyecto.planeacion || "",
            ejecucion: data.proyecto.ejecucion || "",
            evaluacion: data.proyecto.evaluacion || "",
          })
        }
      }
    } catch (err) {
      console.error("Error al cargar planeación:", err)
      setError("Error al cargar la planeación del curso")
    } finally {
      setLoading(false)
    }
  }

  // --- FUNCIONES PARA TEMARIO ---
  const handleAddTema = () => {
    const nuevoTema = {
      id_temporal: Date.now(),
      numero_tema: temario.length + 1,
      nombre_tema: "",
      subtemas: [],
    }
    setTemario([...temario, nuevoTema])
    setTemasExpandidos({ ...temasExpandidos, [nuevoTema.id_temporal]: true })
  }

  const handleRemoveTema = (index) => {
    const nuevosTemarios = temario.filter((_, i) => i !== index)
    // Renumerar temas
    const renumerados = nuevosTemarios.map((tema, i) => ({
      ...tema,
      numero_tema: i + 1,
    }))
    setTemario(renumerados)
  }

  const handleTemaChange = (index, field, value) => {
    const nuevosTemarios = [...temario]
    nuevosTemarios[index][field] = value
    setTemario(nuevosTemarios)
  }

  const toggleTemaExpansion = (idTemporal) => {
    setTemasExpandidos({
      ...temasExpandidos,
      [idTemporal]: !temasExpandidos[idTemporal],
    })
  }

  // --- FUNCIONES PARA SUBTEMAS ---
  const handleAddSubtema = (temaIndex) => {
    const nuevosTemarios = [...temario]
    const subtemas = nuevosTemarios[temaIndex].subtemas || []
    const nuevoSubtema = {
      id_temporal: Date.now(),
      numero_subtema: `${nuevosTemarios[temaIndex].numero_tema}.${subtemas.length + 1}`,
      nombre_subtema: "",
    }
    nuevosTemarios[temaIndex].subtemas = [...subtemas, nuevoSubtema]
    setTemario(nuevosTemarios)
  }

  const handleRemoveSubtema = (temaIndex, subtemaIndex) => {
    const nuevosTemarios = [...temario]
    const subtemasFiltrados = nuevosTemarios[temaIndex].subtemas.filter((_, i) => i !== subtemaIndex)
    // Renumerar subtemas
    const renumerados = subtemasFiltrados.map((subtema, i) => ({
      ...subtema,
      numero_subtema: `${nuevosTemarios[temaIndex].numero_tema}.${i + 1}`,
    }))
    nuevosTemarios[temaIndex].subtemas = renumerados
    setTemario(nuevosTemarios)
  }

  const handleSubtemaChange = (temaIndex, subtemaIndex, value) => {
    const nuevosTemarios = [...temario]
    nuevosTemarios[temaIndex].subtemas[subtemaIndex].nombre_subtema = value
    setTemario(nuevosTemarios)
  }

  // --- FUNCIONES PARA ACTIVIDADES DE APRENDIZAJE ---
  const handleActividadesAprendizajeChange = (temaIndex, field, value) => {
    const nuevosTemarios = [...temario]
    if (!nuevosTemarios[temaIndex].actividades_aprendizaje) {
      nuevosTemarios[temaIndex].actividades_aprendizaje = {
        competencias_especificas: "",
        competencias_genericas: "",
        actividades: "",
      }
    }
    nuevosTemarios[temaIndex].actividades_aprendizaje[field] = value
    setTemario(nuevosTemarios)
  }

  // --- FUNCIONES PARA PRÁCTICAS ---
  const handleAddPractica = () => {
    setPracticas([
      ...practicas,
      {
        id_temporal: Date.now(),
        descripcion_practica: "",
        materiales: [],
        id_tema: "",
        id_subtema: "",
      },
    ])
  }

  const handleRemovePractica = (index) => {
    const nuevasPracticas = [...practicas]
    nuevasPracticas.splice(index, 1)
    setPracticas(nuevasPracticas)
  }

  const handlePracticaChange = (index, field, value) => {
    const nuevasPracticas = [...practicas]
    nuevasPracticas[index][field] = value
    setPracticas(nuevasPracticas)
  }

  const obtenerNombreTema = (idTema) => {
    const tema = temario.find(
      (t) => t.id_temporal?.toString() === idTema?.toString() || t.id_tema?.toString() === idTema?.toString(),
    )
    return tema ? `${tema.numero_tema}. ${tema.nombre_tema}` : "Sin tema asignado"
  }

  const practicasAgrupadasPorTema = () => {
    const grupos = {}

    practicas.forEach((practica, index) => {
      const idTema = practica.id_tema || "sin_tema"
      if (!grupos[idTema]) {
        grupos[idTema] = []
      }
      grupos[idTema].push({ ...practica, index })
    })

    return grupos
  }

  const obtenerNombreCompleto = (practica) => {
    if (!practica.id_tema) return "Sin tema asignado"

    const tema = temario.find(
      (t) =>
        t.id_temporal?.toString() === practica.id_tema?.toString() ||
        t.id_tema?.toString() === practica.id_tema?.toString(),
    )

    if (!tema) return "Sin tema asignado"

    // Si tiene subtema seleccionado
    if (practica.id_subtema && tema.subtemas) {
      const subtema = tema.subtemas.find(
        (s) =>
          s.id_temporal?.toString() === practica.id_subtema?.toString() ||
          s.id_subtema?.toString() === practica.id_subtema?.toString(),
      )
      if (subtema) {
        return `${tema.numero_tema}. ${tema.nombre_tema} → ${subtema.numero_subtema} ${subtema.nombre_subtema}`
      }
    }

    return `${tema.numero_tema}. ${tema.nombre_tema}`
  }

  // --- FUNCIONES PARA MANEJAR MATERIALES ---
  const handleAddMaterialPractica = (practicaIndex) => {
    const nuevasPracticas = [...practicas]
    if (!nuevasPracticas[practicaIndex].materiales) {
      nuevasPracticas[practicaIndex].materiales = []
    }
    nuevasPracticas[practicaIndex].materiales.push({
      id_temporal: Date.now(),
      tipo: "enlace",
      url: "",
      nombre: "",
    })
    setPracticas(nuevasPracticas)
  }

  const handleMaterialChange = (practicaIndex, materialIndex, field, value) => {
    const nuevasPracticas = [...practicas]
    nuevasPracticas[practicaIndex].materiales[materialIndex][field] = value
    setPracticas(nuevasPracticas)
  }

  const handleRemoveMaterial = (practicaIndex, materialIndex) => {
    const nuevasPracticas = [...practicas]
    nuevasPracticas[practicaIndex].materiales.splice(materialIndex, 1)
    setPracticas(nuevasPracticas)
  }

  // Funciones similares para el proyecto
  const handleProyectoMaterialChange = (materialIndex, field, value) => {
    const nuevosMateriales = [...proyecto.materiales]
    nuevosMateriales[materialIndex][field] = value
    setProyecto({ ...proyecto, materiales: nuevosMateriales })
  }

  const handleAddProyectoMaterial = () => {
    setProyecto({
      ...proyecto,
      materiales: [...proyecto.materiales, { id_temporal: Date.now(), tipo: "enlace", url: "", nombre: "" }],
    })
  }

  const handleRemoveProyectoMaterial = (materialIndex) => {
    const nuevosMateriales = proyecto.materiales.filter((_, i) => i !== materialIndex)
    setProyecto({ ...proyecto, materiales: nuevosMateriales })
  }

  // --- FUNCIONES PARA FUENTES ---
  const handleAddFuente = () => {
    setFuentes([
      ...fuentes,
      {
        id_temporal: Date.now(),
        tipo: "libro",
        referencia: "",
      },
    ])
  }

  const handleRemoveFuente = (index) => {
    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const handleFuenteChange = (index, field, value) => {
    const nuevasFuentes = [...fuentes]
    nuevasFuentes[index][field] = value
    setFuentes(nuevasFuentes)
  }

  // --- FUNCIÓN PARA GUARDAR ---
  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validaciones
      if (porcentajePracticas + porcentajeProyecto !== 100) {
        setError("La suma de los porcentajes de prácticas y proyecto debe ser 100%")
        return
      }

      const payload = {
        id_curso: curso.id_curso,
        temario: temario.map((tema) => ({
          nombre: tema.nombre_tema,
          competencias_especificas: tema.competencias_especificas || "",
          competencias_genericas: tema.competencias_genericas || "",
          subtemas: (tema.subtemas || []).map((subtema) => ({
            nombre: subtema.nombre_subtema,
          })),
        })),
        porcentaje_practicas: porcentajePracticas,
        porcentaje_proyecto: porcentajeProyecto,
        practicas: practicas.map((p) => ({
          descripcion: p.descripcion_practica,
          materiales: p.materiales || [],
          id_tema: p.id_tema,
          id_subtema: p.id_subtema,
        })),
        proyecto: {
          instrucciones: proyecto.instrucciones,
          materiales: proyecto.materiales || [],
          fundamentacion: proyecto.fundamentacion,
          planeacion: proyecto.planeacion,
          ejecucion: proyecto.ejecucion,
          evaluacion: proyecto.evaluacion,
        },
      }

      const response = await fetch(`${API_BASE_URL}/api/planeacion/${curso.id_curso}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la planeación")
      }

      const result = await response.json()
      if (onSave) onSave(result)
      alert("Planeación guardada exitosamente")
      onClose()
    } catch (err) {
      setError(err.message)
      console.error("Error al guardar:", err)
    } finally {
      setLoading(false)
    }
  }

  // useMemo para obtener la carrera seleccionada
  const carreraSeleccionada = useMemo(
    () => carreras.find((carrera) => String(carrera.id_carrera) === String(planeacion.id_carrera || curso.id_carrera)),
    [carreras, planeacion.id_carrera, curso.id_carrera],
  )

  // Generar el label de la carrera
  const carreraLabel = carreraSeleccionada
    ? `${carreraSeleccionada.nombre}${
        carreraSeleccionada.clave_carrera ? ` (${carreraSeleccionada.clave_carrera})` : ""
      }`
    : curso.nombre_carrera || "No asignada"

  if (loading && !planeacion.clave_asignatura) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.loadingContainer}>
          <p>Cargando planeación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>📋 Planeación del Curso: {curso.nombre_curso || curso.nombre}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📝 Datos Generales</h3>

            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Clave de la Asignatura *</label>
                <input
                  type="text"
                  className={styles.inputReadonly}
                  value={curso.codigo_curso || planeacion.clave_asignatura || "Se asignará automáticamente"}
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Carrera *</label>
                <input type="text" className={styles.inputReadonly} value={carreraLabel} readOnly />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha de Creación</label>
              <input
                type="date"
                className={styles.input}
                value={planeacion.fecha_creacion}
                onChange={(e) => setPlaneacion({ ...planeacion, fecha_creacion: e.target.value })}
              />
            </div>
          </div>

          {/* SECCIÓN 2: PRESENTACIÓN */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📖 Presentación</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Caracterización de la Asignatura</label>
              <textarea
                className={styles.textarea}
                value={planeacion.caracterizacion}
                onChange={(e) => setPlaneacion({ ...planeacion, caracterizacion: e.target.value })}
                placeholder="Describe cómo esta asignatura aporta al perfil del egresado..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Intención Didáctica</label>
              <textarea
                className={styles.textarea}
                value={planeacion.intencion_didactica}
                onChange={(e) => setPlaneacion({ ...planeacion, intencion_didactica: e.target.value })}
                placeholder="Describe la organización de los temas y la estrategia de enseñanza..."
              />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🤝 Participantes</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Convocatoria</label>
              <select
                className={styles.select}
                value={planeacion.convocatoria_id}
                onChange={(e) => setPlaneacion({ ...planeacion, convocatoria_id: e.target.value })}
              >
                <option value="">Seleccionar convocatoria...</option>
                {convocatorias.map((conv) => (
                  <option key={conv.id} value={conv.id}>
                    {conv.nombre}
                  </option>
                ))}
              </select>
            </div>

            {planeacion.convocatoria_id && universidadesParticipantes.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Universidades Participantes</label>
                <div className={styles.universidadesList}>
                  {universidadesParticipantes.map((universidad) => (
                    <div key={universidad.id_universidad} className={styles.universidadItem}>
                      🎓 {universidad.nombre}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 3: COMPETENCIAS */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Competencias</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Competencias a Desarrollar</label>
              <textarea
                className={styles.textarea}
                value={planeacion.competencias_desarrollar}
                onChange={(e) => setPlaneacion({ ...planeacion, competencias_desarrollar: e.target.value })}
                placeholder="Describe las competencias específicas que se desarrollarán..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Competencias Previas</label>
              <textarea
                className={styles.textarea}
                value={planeacion.competencias_previas}
                onChange={(e) => setPlaneacion({ ...planeacion, competencias_previas: e.target.value })}
                placeholder="Describe los conocimientos previos requeridos..."
              />
            </div>
          </div>

          {/* SECCIÓN 4: TEMARIO */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📚 Temario</h3>

            {temario.map((tema, temaIndex) => (
              <div key={tema.id_temporal || tema.id_tema} className={styles.temaItem}>
                <div
                  className={styles.temaHeader}
                  onClick={() => toggleTemaExpansion(tema.id_temporal || tema.id_tema)}
                >
                  <div className={styles.temaHeaderContent}>
                    <span className={styles.temaNumero}>Tema {tema.numero_tema}</span>
                    <span className={styles.temaNombre}>{tema.nombre_tema || "Sin nombre"}</span>
                  </div>
                  <div className={styles.temaActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveTema(temaIndex)
                      }}
                      className={styles.buttonDanger}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <FontAwesomeIcon
                      icon={temasExpandidos[tema.id_temporal || tema.id_tema] ? faChevronUp : faChevronDown}
                      className={styles.chevronIcon}
                    />
                  </div>
                </div>

                {temasExpandidos[tema.id_temporal || tema.id_tema] && (
                  <div className={styles.temaContent}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nombre del Tema *</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={tema.nombre_tema}
                        onChange={(e) => handleTemaChange(temaIndex, "nombre_tema", e.target.value)}
                        placeholder="Ej: Sistemas numéricos"
                      />
                    </div>

                    {/* Subtemas */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Subtemas</label>
                      {(tema.subtemas || []).map((subtema, subtemaIndex) => (
                        <div key={subtema.id_temporal || subtema.id_subtema} className={styles.subtemaItem}>
                          <span className={styles.subtemaNumero}>{subtema.numero_subtema}</span>
                          <input
                            type="text"
                            className={styles.inputFlex}
                            value={subtema.nombre_subtema}
                            onChange={(e) => handleSubtemaChange(temaIndex, subtemaIndex, e.target.value)}
                            placeholder="Nombre del subtema"
                          />
                          <button
                            onClick={() => handleRemoveSubtema(temaIndex, subtemaIndex)}
                            className={styles.buttonDanger}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => handleAddSubtema(temaIndex)} className={styles.buttonAdd}>
                        <FontAwesomeIcon icon={faPlus} /> Añadir Subtema
                      </button>
                    </div>

                    {/* Actividades de Aprendizaje */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Competencias Específicas del Tema</label>
                      <textarea
                        className={styles.textareaSmall}
                        value={tema.actividades_aprendizaje?.competencias_especificas || ""}
                        onChange={(e) =>
                          handleActividadesAprendizajeChange(temaIndex, "competencias_especificas", e.target.value)
                        }
                        placeholder="Competencias específicas que se desarrollan en este tema..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Competencias Genéricas del Tema</label>
                      <textarea
                        className={styles.textareaSmall}
                        value={tema.actividades_aprendizaje?.competencias_genericas || ""}
                        onChange={(e) =>
                          handleActividadesAprendizajeChange(temaIndex, "competencias_genericas", e.target.value)
                        }
                        placeholder="Competencias genéricas que se desarrollan en este tema..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={handleAddTema} className={styles.buttonAdd}>
              <FontAwesomeIcon icon={faPlus} /> Añadir Tema
            </button>
          </div>

          {/* SECCIÓN 5: PRÁCTICAS */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🔬 Prácticas</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Distribución de Porcentajes</label>
              <div className={styles.porcentajeVisual}>
                <div className={styles.porcentajeBarContainer}>
                  <div className={styles.porcentajeBarPracticas} style={{ width: `${porcentajePracticas}%` }}>
                    <span className={styles.porcentajeLabel}>Prácticas: {porcentajePracticas}%</span>
                  </div>
                  <div className={styles.porcentajeBarProyecto} style={{ width: `${porcentajeProyecto}%` }}>
                    <span className={styles.porcentajeLabel}>Proyecto: {porcentajeProyecto}%</span>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={porcentajePracticas}
                onChange={(e) => {
                  const nuevoValor = Number.parseInt(e.target.value)
                  setPorcentajePracticas(nuevoValor)
                  setPorcentajeProyecto(100 - nuevoValor)
                }}
                className={styles.rangeInput}
              />
            </div>

            {practicas.map((practica, pIndex) => (
              <div key={practica.id_temporal || pIndex} className={styles.practicaItem}>
                <div className={styles.practicaHeader}>
                  <h4>Práctica {pIndex + 1}</h4>
                  <button onClick={() => handleRemovePractica(pIndex)} className={styles.buttonDanger}>
                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Asignar a tema o subtema</label>
                  <select
                    className={styles.select}
                    value={practica.id_subtema || practica.id_tema || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      const nuevasPracticas = [...practicas]

                      // Verificar si es un subtema (formato: "tema_X_subtema_Y")
                      if (value.includes("_subtema_")) {
                        const [temaId, subtemaId] = value.split("_subtema_")
                        nuevasPracticas[pIndex].id_tema = temaId
                        nuevasPracticas[pIndex].id_subtema = subtemaId
                      } else {
                        // Es un tema
                        nuevasPracticas[pIndex].id_tema = value
                        nuevasPracticas[pIndex].id_subtema = ""
                      }

                      setPracticas(nuevasPracticas)
                    }}
                  >
                    <option value="">Seleccionar tema...</option>
                    {temario.map((tema) => (
                      <optgroup
                        key={tema.id_temporal || tema.id_tema}
                        label={`${tema.numero_tema}. ${tema.nombre_tema}`}
                      >
                        <option value={tema.id_temporal || tema.id_tema}>
                          {tema.numero_tema}. {tema.nombre_tema}
                        </option>
                        {tema.subtemas?.map((subtema) => (
                          <option
                            key={subtema.id_temporal || subtema.id_subtema}
                            value={`${tema.id_temporal || tema.id_tema}_subtema_${subtema.id_temporal || subtema.id_subtema}`}
                          >
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ {subtema.numero_subtema} {subtema.nombre_subtema}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {(practica.id_tema || practica.id_subtema) && (
                    <div className={styles.temaAsignado}>📌 Asignado a: {obtenerNombreCompleto(practica)}</div>
                  )}
                </div>

                <textarea
                  className={styles.textarea}
                  value={practica.descripcion_practica}
                  onChange={(e) => handlePracticaChange(pIndex, "descripcion_practica", e.target.value)}
                  placeholder="Descripción de la práctica..."
                />

                {/* Sección de materiales */}
                <div className={styles.materialesSection}>
                  <div className={styles.materialesHeader}>
                    <h5>Materiales de apoyo</h5>
                    <button onClick={() => handleAddMaterialPractica(pIndex)} className={styles.buttonSmall}>
                      <FontAwesomeIcon icon={faPlus} /> Agregar material
                    </button>
                  </div>

                  {practica.materiales?.map((material, mIndex) => (
                    <div key={material.id_temporal || mIndex} className={styles.materialItem}>
                      <select
                        className={styles.selectSmall}
                        value={material.tipo}
                        onChange={(e) => handleMaterialChange(pIndex, mIndex, "tipo", e.target.value)}
                      >
                        <option value="enlace">🔗 Enlace</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="referencia">📝 Referencias APA</option>
                      </select>

                      <input
                        type="text"
                        className={styles.input}
                        placeholder={material.tipo === "enlace" ? "URL del material" : "Nombre del archivo"}
                        value={material.tipo === "enlace" ? material.url : material.nombre}
                        onChange={(e) =>
                          handleMaterialChange(
                            pIndex,
                            mIndex,
                            material.tipo === "enlace" ? "url" : "nombre",
                            e.target.value,
                          )
                        }
                      />

                      <button onClick={() => handleRemoveMaterial(pIndex, mIndex)} className={styles.buttonDanger}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={handleAddPractica} className={styles.button}>
              <FontAwesomeIcon icon={faPlus} /> Agregar Práctica
            </button>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎓 Proyecto de Asignatura</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Porcentaje del Proyecto</label>
              <div className={styles.porcentajeReadOnly}>
                <div className={styles.porcentajeValue}>{porcentajeProyecto}%</div>
                <p className={styles.porcentajeHint}>
                  Ajusta el porcentaje desde la sección de Prácticas. La suma debe ser 100%.
                </p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Instrucciones del Proyecto</label>
              <textarea
                className={styles.textarea}
                value={proyecto.instrucciones}
                onChange={(e) => setProyecto({ ...proyecto, instrucciones: e.target.value })}
                placeholder="Describe las instrucciones y requisitos del proyecto..."
              />
            </div>

            <div className={styles.fasesProyecto}>
              <h4 className={styles.fasesTitle}>Fases del Proyecto</h4>
              <p className={styles.fasesDescription}>
                El proyecto demuestra competencias mediante las siguientes fases:
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>📚 Fundamentación</label>
                <textarea
                  className={styles.textarea}
                  value={proyecto.fundamentacion}
                  onChange={(e) => setProyecto({ ...proyecto, fundamentacion: e.target.value })}
                  placeholder="Marco teórico basado en diagnóstico para diseño de software..."
                  rows={4}
                />
                <p className={styles.faseHint}>Marco teórico basado en diagnóstico para diseño de software.</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>📋 Planeación</label>
                <textarea
                  className={styles.textarea}
                  value={proyecto.planeacion}
                  onChange={(e) => setProyecto({ ...proyecto, planeacion: e.target.value })}
                  placeholder="Diseño con UML, recursos y cronograma..."
                  rows={4}
                />
                <p className={styles.faseHint}>Diseño con UML, recursos y cronograma.</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>⚙️ Ejecución</label>
                <textarea
                  className={styles.textarea}
                  value={proyecto.ejecucion}
                  onChange={(e) => setProyecto({ ...proyecto, ejecucion: e.target.value })}
                  placeholder="Implementación del sistema, fase clave para competencias..."
                  rows={4}
                />
                <p className={styles.faseHint}>Implementación del sistema, fase clave para competencias.</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>📊 Evaluación</label>
                <textarea
                  className={styles.textarea}
                  value={proyecto.evaluacion}
                  onChange={(e) => setProyecto({ ...proyecto, evaluacion: e.target.value })}
                  placeholder="Análisis de resultados para mejora, fomentando reflexión crítica..."
                  rows={4}
                />
                <p className={styles.faseHint}>Análisis de resultados para mejora, fomentando reflexión crítica.</p>
              </div>
            </div>

            {/* Sección de materiales del proyecto */}
            <div className={styles.materialesSection}>
              <div className={styles.materialesHeader}>
                <h4>Materiales de apoyo para el proyecto</h4>
                <button onClick={handleAddProyectoMaterial} className={styles.buttonSmall}>
                  <FontAwesomeIcon icon={faPlus} /> Agregar material
                </button>
              </div>

              {proyecto.materiales?.map((material, index) => (
                <div key={material.id_temporal || index} className={styles.materialItem}>
                  <select
                    className={styles.selectSmall}
                    value={material.tipo}
                    onChange={(e) => {
                      const nuevosMateriales = [...proyecto.materiales]
                      nuevosMateriales[index].tipo = e.target.value
                      setProyecto({ ...proyecto, materiales: nuevosMateriales })
                    }}
                  >
                    <option value="enlace">🔗 Enlace</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="referencias">📝 Referencias APA</option>
                  </select>

                  <input
                    type="text"
                    className={styles.input}
                    placeholder={material.tipo === "enlace" ? "URL del material" : "Nombre del archivo"}
                    value={material.tipo === "enlace" ? material.url : material.nombre}
                    onChange={(e) => {
                      const nuevosMateriales = [...proyecto.materiales]
                      if (material.tipo === "enlace") {
                        nuevosMateriales[index].url = e.target.value
                      } else {
                        nuevosMateriales[index].nombre = e.target.value
                      }
                      setProyecto({ ...proyecto, materiales: nuevosMateriales })
                    }}
                  />

                  <button onClick={() => handleRemoveProyectoMaterial(index)} className={styles.buttonDanger}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 7: EVALUACIÓN POR COMPETENCIAS */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>✅ Evaluación por Competencias</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Criterios de Evaluación</label>
              <textarea
                className={styles.textarea}
                value={planeacion.evaluacion_competencias}
                onChange={(e) => setPlaneacion({ ...planeacion, evaluacion_competencias: e.target.value })}
                placeholder="Describe los instrumentos y criterios de evaluación: mapas conceptuales, reportes, exposiciones, problemarios, rúbricas, listas de cotejo, etc..."
              />
            </div>
          </div>

          {/* SECCIÓN 8: FUENTES DE INFORMACIÓN */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📖 Fuentes de Información</h3>
            {fuentes.map((fuente, index) => (
              <div key={fuente.id_temporal || fuente.id_fuente} className={styles.practicaItem}>
                <span className={styles.practicaNumber}>{index + 1}</span>
                <div className={styles.fuenteContent}>
                  <select
                    className={styles.select}
                    value={fuente.tipo}
                    onChange={(e) => handleFuenteChange(index, "tipo", e.target.value)}
                  >
                    <option value="referencias">📚 Referencias APA</option>
                    <option value="enlace">🌐 Sitio Web</option>
                    <option value="pdf">📄 Otro</option>
                  </select>
                  <textarea
                    className={styles.textareaSmall}
                    value={fuente.referencia}
                    onChange={(e) => handleFuenteChange(index, "referencia", e.target.value)}
                    placeholder="Formato: Autor(es). (Año). Título. Editorial/Revista/URL."
                    rows={2}
                  />
                </div>
                <button onClick={() => handleRemoveFuente(index)} className={styles.buttonDanger}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}

            <button onClick={handleAddFuente} className={styles.buttonAdd}>
              <FontAwesomeIcon icon={faPlus} /> Añadir Fuente
            </button>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.buttonSecondary} disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ""}`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Planeación"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaneacionCurso
