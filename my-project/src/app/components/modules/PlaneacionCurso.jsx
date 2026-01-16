"use client"

import { useState, useEffect, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import styles from "./PlaneacionCurso.module.css"
import React from "react" // Import React

const API_BASE_URL = ""

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
  const [umbralAprobatorio, setUmbralAprobatorio] = useState(70)
  const [proyecto, setProyecto] = useState({
    instrucciones: "",
    materiales: [],
    fundamentacion: "",
    planeacion: "",
    ejecucion: "",
    evaluacion: "",
    fecha_entrega: "",
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
      console.log("Cargando universidades para convocatoria:", convocatoriaId)
      const response = await fetch(`${API_BASE_URL}/api/cursos/${curso.id_curso}/planeacion`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.universidades_participantes) {
          setUniversidadesParticipantes(data.universidades_participantes)
        }
      }
    } catch (err) {
      console.error("Error al cargar universidades participantes:", err)
    }
  }

  const cargarPlaneacionExistente = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/cursos/${curso.id_curso}/planeacion`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Datos completos recibidos del backend:", JSON.stringify(data, null, 2))

        // 1. ACTUALIZAR DATOS DEL CURSO
        setPlaneacion((prev) => ({
          ...prev,
          caracterizacion: data.caracterizacion || "",
          intencion_didactica: data.intencion_didactica || "",
          competencias_desarrollar: data.competencias_desarrollar || "",
          competencias_previas: data.competencias_previas || "",
          evaluacion_competencias: data.evaluacion_competencias || "",
          convocatoria_id: data.convocatoria_id
            ? String(data.convocatoria_id)
            : data.convocatoria?.id
              ? String(data.convocatoria.id)
              : "",
          clave_asignatura: data.clave_asignatura || curso.codigo_curso || prev.clave_asignatura,
          id_carrera: data.id_carrera
            ? String(data.id_carrera)
            : curso.id_carrera
              ? String(curso.id_carrera)
              : prev.id_carrera,
        }))

        // 2. Cargar datos del proyecto (AHORA DESDE data.proyecto)
        if (data.proyecto) {
          setProyecto({
            instrucciones: data.proyecto.instrucciones || "",
            materiales: (data.proyecto.materiales || []).map((mat) => ({
              ...mat,
              nombre: mat.nombre || mat.nombre_archivo || mat.url || "",
              uploading: false,
            })),
            fundamentacion: data.proyecto.fundamentacion || "",
            planeacion: data.proyecto.planeacion || "",
            ejecucion: data.proyecto.ejecucion || "",
            evaluacion: data.proyecto.evaluacion || "",
            fecha_entrega: data.proyecto.fecha_entrega || "",
          })
        }

        // 3. Cargar temario (USAR IDs REALES) - CAMBIO 3 APLICADO
        if (data.temario) {
          setTemario(
            data.temario.map((tema, index) => ({
              id: tema.id, // ✅ ID REAL de la base de datos
              id_temporal: tema.id || `tema-temp-${Date.now()}-${index}`, // Añadir id_temporal para manejo en frontend
              numero_tema: index + 1,
              nombre_tema: tema.nombre,
              descripcion: tema.descripcion || "",
              competencias_especificas: tema.competencias_especificas || "",
              competencias_genericas: tema.competencias_genericas || "",
              subtemas: (tema.subtemas || []).map((subtema, subIndex) => ({
                id: subtema.id, // ✅ ID REAL de la base de datos
                id_temporal: subtema.id || `subtema-temp-${Date.now()}-${index}-${subIndex}`, // Añadir id_temporal
                numero_subtema: `${index + 1}.${subIndex + 1}`,
                nombre_subtema: subtema.nombre,
                descripcion: subtema.descripcion || "",
              })),
            })),
          )
        }

        // 4. Cargar porcentajes
        if (data.porcentaje_practicas || data.porcentaje_actividades) {
          setPorcentajePracticas(data.porcentaje_practicas || data.porcentaje_actividades)
        }
        if (data.porcentaje_proyecto) {
          setPorcentajeProyecto(data.porcentaje_proyecto)
        }
        if (data.umbral_aprobatorio) {
          setUmbralAprobatorio(data.umbral_aprobatorio)
        }

        // 5. Cargar prácticas
        if (data.practicas) {
          console.log("Prácticas recibidas del backend:", data.practicas)

          const practicasConNombres = data.practicas.map((p) => {
            // Inicializar con valores por defecto
            const practica = {
              id_actividad: p.id_actividad,
              descripcion_practica: p.descripcion || "",
              materiales: (p.materiales || []).map((mat) => ({
                ...mat,
                nombre: mat.nombre || mat.nombre_archivo || mat.url || "",
                uploading: false,
              })),
              id_unidad: p.id_unidad ? String(p.id_unidad) : "",
              id_subtema: p.id_subtema ? String(p.id_subtema) : "",
              nombre_unidad: null,
              nombre_subtema: null,
              fecha_entrega: p.fecha_entrega || "",
            }
            console.log("Práctica procesada:", {
              id_actividad: practica.id_actividad,
              id_unidad: practica.id_unidad,
              nombre_unidad: practica.nombre_unidad,
              id_subtema: practica.id_subtema,
              nombre_subtema: practica.nombre_subtema,
            })

            // Solo buscar nombres si hay un ID de unidad
            if (p.id_unidad && data.temario) {
              const unidad = data.temario.find((t) => t.id === Number.parseInt(p.id_unidad))
              if (unidad) {
                practica.nombre_unidad = unidad.nombre
                console.log(`✅ Unidad encontrada: ${unidad.nombre} para práctica ${p.id_actividad}`)
              } else {
                console.warn(`❌ No se encontró unidad con ID: ${p.id_unidad} para práctica ${p.id_actividad}`)
              }
            }

            // Solo buscar subtema si hay un ID de subtema
            if (p.id_subtema && data.temario) {
              for (const tema of data.temario) {
                if (tema.subtemas) {
                  const subtema = tema.subtemas.find((s) => s.id === Number.parseInt(p.id_subtema))
                  if (subtema) {
                    practica.nombre_subtema = subtema.nombre
                    console.log(`✅ Subtema encontrado: ${subtema.nombre} para práctica ${p.id_actividad}`)
                    break
                  }
                }
              }
              if (!practica.nombre_subtema) {
                console.warn(`❌ No se encontró subtema con ID: ${p.id_subtema} para práctica ${p.id_actividad}`)
              }
            }

            console.log("Práctica procesada:", {
              id_actividad: practica.id_actividad,
              id_unidad: practica.id_unidad,
              nombre_unidad: practica.nombre_unidad,
              id_subtema: practica.id_subtema,
              nombre_subtema: practica.nombre_subtema,
            })

            return practica
          })

          setPracticas(practicasConNombres)
        }

        // 6. Cargar fuentes
        if (data.fuentes) {
          setFuentes(
            data.fuentes.map((fuente) => ({
              id_material: fuente.id_material,
              tipo: fuente.tipo || "referencias",
              referencia: fuente.tipo === "texto"
                ? (fuente.descripcion || fuente.referencia || "")
                : (fuente.referencia || ""),
              url: fuente.url || "",
              nombre: fuente.nombre || fuente.nombre_archivo || fuente.url || "",
            }))
          );
        }

        // 7. Cargar universidades participantes
        if (data.universidades_participantes) {
          setUniversidadesParticipantes(data.universidades_participantes)
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
      id: null, // null porque es nuevo, el backend asignará ID
      id_temporal: Date.now() + Math.floor(Math.random() * 1000), // ID temporal único
      numero_tema: temario.length + 1,
      nombre_tema: "",
      subtemas: [],
      competencias_especificas: "",
      competencias_genericas: "",
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

  const toggleTemaExpansion = (tema) => {
    const temaId = tema.id || tema.id_temporal
    setTemasExpandidos({
      ...temasExpandidos,
      [temaId]: !temasExpandidos[temaId],
    })
  }

  // --- FUNCIONES PARA SUBTEMAS ---
  const handleAddSubtema = (temaIndex) => {
    const nuevosTemarios = [...temario]
    const subtemas = nuevosTemarios[temaIndex].subtemas || []
    const nuevoSubtema = {
      id_temporal: Date.now() + Math.floor(Math.random() * 1000),
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


  const handleAddPractica = () => {
    setPracticas([
      ...practicas,
      {
        id_actividad: null,
        descripcion_practica: "",
        materiales: [],
        id_unidad: "",
        id_subtema: "",
        nombre_unidad: null,
        nombre_subtema: null,
        fecha_entrega: "",
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

  const obtenerValorSelect = (practica) => {
    if (!practica.id_unidad && !practica.id_subtema) return ""

    if (practica.id_subtema) {
      return `${practica.id_unidad}_subtema_${practica.id_subtema}`
    }

    return practica.id_unidad
  }

  const obtenerNombreCompleto = (practica) => {
    if (!practica.id_unidad) return "Sin tema asignado"

    const tema = temario.find((t) => String(t.id) === String(practica.id_unidad))
    if (!tema) return "Tema no encontrado"

    const numeroTema = tema.numero_tema || temario.indexOf(tema) + 1

    // Si tiene subtema seleccionado
    if (practica.id_subtema && tema.subtemas) {
      const subtema = tema.subtemas.find((s) => String(s.id) === String(practica.id_subtema))
      if (subtema) {
        return `Tema ${numeroTema}: ${tema.nombre_tema} → ${subtema.numero_subtema} ${subtema.nombre_subtema}`
      }
    }

    return `Tema ${numeroTema}: ${tema.nombre_tema}`
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
      referencia: "",
      uploading: false,
      id_material: null,
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
      materiales: [
        ...proyecto.materiales,
        {
          id_temporal: Date.now(),
          tipo: "enlace",
          url: "",
          nombre: "",
          referencia: "",
          uploading: false,
          id_material: null,
        },
      ],
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
        tipo: "referencias",
        referencia: "",
        url: "",
        uploading: false,
        id_material: null,
        nombre: "", // Added for PDF title
      },
    ])
  }

  const handleRemoveFuente = (index) => {
    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const handleFuenteChange = (index, field, value) => {
    const nuevasFuentes = [...fuentes]
    nuevasFuentes[index][field] = value

    // Si cambia el tipo a enlace, limpiar la referencia
    if (field === "tipo" && value === "enlace") {
      nuevasFuentes[index].referencia = ""
    }
    // Si cambia el tipo a referencias/pdf, limpiar la URL
    if (field === "tipo" && (value === "referencias" || value === "pdf")) {
      nuevasFuentes[index].url = ""
    }

    setFuentes(nuevasFuentes)
  }

  const handlePDFUpload = async (event, practicaIndex, materialIndex, contexto) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF")
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no puede superar 10MB")
      return
    }

    try {
      // Marcar como subiendo
      if (contexto === "practica") {
        const nuevasPracticas = [...practicas]
        nuevasPracticas[practicaIndex].materiales[materialIndex].uploading = true
        nuevasPracticas[practicaIndex].materiales[materialIndex].nombre = file.name
        setPracticas(nuevasPracticas)
      } else if (contexto === "proyecto") {
        const nuevosMateriales = [...proyecto.materiales]
        nuevosMateriales[materialIndex].uploading = true
        nuevosMateriales[materialIndex].nombre = file.name
        setProyecto({ ...proyecto, materiales: nuevosMateriales })
      } else if (contexto === "fuente") {
        const nuevasFuentes = [...fuentes]
        nuevasFuentes[materialIndex].uploading = true
        nuevasFuentes[materialIndex].nombre = file.name
        setFuentes(nuevasFuentes)
      }

      // Crear FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("id_curso", curso.id_curso)

      // 👇 ENVIAR TIPO_MATERIAL Y CATEGORIA CORRECTA
      if (contexto === "practica" || contexto === "proyecto") {
        formData.append("tipo_material", contexto)
        formData.append("categoria_material", "actividad")
      } else if (contexto === "fuente") {
        formData.append("tipo_material", "fuente")
        formData.append("categoria_material", "planeacion")
      }

      formData.append("descripcion", file.name)

      // Subir archivo
      const response = await fetch(`${API_BASE_URL}/api/material/planeacion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir el archivo")
      }

      const data = await response.json()

      // Guardar ID del material subido
      if (contexto === "practica") {
        const nuevasPracticas = [...practicas]
        nuevasPracticas[practicaIndex].materiales[materialIndex] = {
          ...nuevasPracticas[practicaIndex].materiales[materialIndex],
          id_material: data.material.id_material,
          nombre: data.material.nombre_archivo || file.name,
          uploading: false,
        }
        setPracticas(nuevasPracticas)
      } else if (contexto === "proyecto") {
        const nuevosMateriales = [...proyecto.materiales]
        nuevosMateriales[materialIndex] = {
          ...nuevosMateriales[materialIndex],
          id_material: data.material.id_material,
          nombre: data.material.nombre_archivo || file.name,
          uploading: false,
        }
        setProyecto({ ...proyecto, materiales: nuevosMateriales })
      } else if (contexto === "fuente") {
        const nuevasFuentes = [...fuentes]
        nuevasFuentes[materialIndex] = {
          ...nuevasFuentes[materialIndex],
          id_material: data.material.id_material,
          nombre: data.material.nombre_archivo || file.name,
          uploading: false,
        }
        setFuentes(nuevasFuentes)
      }

      alert("PDF subido exitosamente")
    } catch (error) {
      console.error("Error al subir PDF:", error)
      alert("Error al subir el archivo")

      // Quitar estado de subiendo
      if (contexto === "practica") {
        const nuevasPracticas = [...practicas]
        nuevasPracticas[practicaIndex].materiales[materialIndex].uploading = false
        setPracticas(nuevasPracticas)
      } else if (contexto === "proyecto") {
        const nuevosMateriales = [...proyecto.materiales]
        nuevosMateriales[materialIndex].uploading = false
        setProyecto({ ...proyecto, materiales: nuevosMateriales })
      } else if (contexto === "fuente") {
        const nuevasFuentes = [...fuentes]
        nuevasFuentes[materialIndex].uploading = false
        setFuentes(nuevasFuentes)
      }
    }
  }

  // --- FUNCIÓN PARA GUARDAR ---
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (Number.parseInt(porcentajePracticas) + Number.parseInt(porcentajeProyecto) !== 100) {
        setError("La suma de los porcentajes de actividades y proyecto debe ser 100%");
        return;
      }

      const payload = {
        id_curso: curso.id_curso,
        temario: temario.map((tema) => ({
          id: tema.id,
          nombre: tema.nombre_tema,
          descripcion: tema.descripcion || "",
          competenciasEspecificas: tema.competencias_especificas || "",
          competenciasGenericas: tema.competencias_genericas || "",
          subtemas: (tema.subtemas || []).map((subtema) => ({
            id: subtema.id,
            nombre: subtema.nombre_subtema,
            descripcion: subtema.descripcion || "",
          })),
        })),
        porcentaje_actividades: Number.parseInt(porcentajePracticas),
        porcentaje_proyecto: Number.parseInt(porcentajeProyecto),
        umbral_aprobatorio: umbralAprobatorio,

        practicas: practicas.map((p) => ({
          descripcion: p.descripcion_practica,
          id_actividad: p.id_actividad || null,
          materiales: p.materiales.map((m) => ({
            id_material: m.id_material || null,
            tipo: m.tipo || 'referencias',
            nombre: m.nombre || null,
            referencia: m.referencia || m.descripcion || "",
            url: m.url || "",
          })),
          id_unidad: p.id_unidad ? Number.parseInt(p.id_unidad) : null,
          id_subtema: p.id_subtema ? Number.parseInt(p.id_subtema) : null,
          fecha_entrega: p.fecha_entrega 
            ? p.fecha_entrega.replace('T', ' ').slice(0, 19) 
            : null,
        })),

        proyecto: {
          instrucciones: proyecto.instrucciones,
          materiales: proyecto.materiales.map((m) => ({
            id_material: m.id_material || null,
            tipo: m.tipo,
            nombre: m.nombre || null,
            url: m.url || "",
            referencia: m.referencia || m.descripcion || "",
          })),
          fundamentacion: proyecto.fundamentacion,
          planeacion: proyecto.planeacion,
          ejecucion: proyecto.ejecucion,
          evaluacion: proyecto.evaluacion,
          fecha_entrega: proyecto.fecha_entrega 
            ? proyecto.fecha_entrega.replace('T', ' ').slice(0, 19) 
            : null,
        },

        caracterizacion: planeacion.caracterizacion,
        intencion_didactica: planeacion.intencion_didactica,
        competencias_desarrollar: planeacion.competencias_desarrollar,
        competencias_previas: planeacion.competencias_previas,
        evaluacion_competencias: planeacion.evaluacion_competencias,
        convocatoria_id: planeacion.convocatoria_id,
        fuentes: fuentes.map((f) => ({
          tipo: f.tipo,
          referencia: f.tipo === "referencias" ? f.referencia || "" : "",
          url: f.tipo === "enlace" ? f.url || "" : "",
          id_material: f.id_material || null,
          nombre: f.nombre || null,
        })),
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/cursos/${curso.id_curso}/planeacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text(); // 1. Leemos como texto crudo
        let errorData;

        try {
          errorData = JSON.parse(responseText); // 2. Intentamos convertir a JSON
        } catch (e) {
          // 3. Si falla, es que el servidor devolvió HTML o texto plano
          console.error("El servidor no devolvió JSON:", responseText);
          errorData = { message: responseText || `Error HTTP ${response.status}` };
        }

        console.warn("=== DETALLES DEL ERROR ===");
        console.warn("Status:", response.status);
        console.warn("Body:", responseText); // Verás exactamente qué dice el servidor
        console.warn("========================");

        const errorMessage = errorData.error ||
          errorData.message ||
          errorData.error_message ||
          `Error ${response.status}: ${response.statusText}`;

        throw new Error(errorMessage);
      }
      const result = await response.json();
      if (onSave) onSave(result);
      alert("Planeación guardada exitosamente");
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error al guardar:", err);
    } finally {
      setLoading(false);
    }
  };

  // useMemo para obtener la carrera seleccionada
  const carreraSeleccionada = useMemo(
    () => carreras.find((carrera) => String(carrera.id_carrera) === String(planeacion.id_carrera || curso.id_carrera)),
    [carreras, planeacion.id_carrera, curso.id_carrera],
  )

  // Generar el label de la carrera
  const carreraLabel = carreraSeleccionada
    ? `${carreraSeleccionada.nombre}${carreraSeleccionada.clave_carrera ? ` (${carreraSeleccionada.clave_carrera})` : ""
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
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    fecha_creacion: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    caracterizacion: e.target.value,
                  })
                }
                placeholder="Describe cómo esta asignatura aporta al perfil del egresado..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Intención Didáctica</label>
              <textarea
                className={styles.textarea}
                value={planeacion.intencion_didactica}
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    intencion_didactica: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    convocatoria_id: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    competencias_desarrollar: e.target.value,
                  })
                }
                placeholder="Describe las competencias específicas que se desarrollarán..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Competencias Previas</label>
              <textarea
                className={styles.textarea}
                value={planeacion.competencias_previas}
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    competencias_previas: e.target.value,
                  })
                }
                placeholder="Describe los conocimientos previos requeridos..."
              />
            </div>
          </div>

          {/* SECCIÓN 4: TEMARIO */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📚 Temario</h3>

            {temario.map((tema, temaIndex) => (
              <div key={tema.id_temporal || tema.id} className={styles.temaItem}>
                <div className={styles.temaHeader} onClick={() => toggleTemaExpansion(tema)}>
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
                      icon={temasExpandidos[tema.id_temporal || tema.id] ? faChevronUp : faChevronDown}
                      className={styles.chevronIcon}
                    />
                  </div>
                </div>

                {temasExpandidos[tema.id_temporal || tema.id] && (
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
                        <div key={subtema.id_temporal || subtema.id} className={styles.subtemaItem}>
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
                        value={tema.competencias_especificas || ""}
                        onChange={(e) => handleTemaChange(temaIndex, "competencias_especificas", e.target.value)}
                        placeholder="Competencias específicas que se desarrollan en este tema..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Competencias Genéricas del Tema</label>
                      <textarea
                        className={styles.textareaSmall}
                        value={tema.competencias_genericas || ""}
                        onChange={(e) => handleTemaChange(temaIndex, "competencias_genericas", e.target.value)}
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
            <div className={styles.formGroup}>
              <label className={styles.label}>Umbral Aprobatorio (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={styles.input}
                value={umbralAprobatorio}
                onChange={(e) => setUmbralAprobatorio(Number.parseInt(e.target.value) || 0)}
              />
              <small className={styles.hintText}>Calificación mínima para aprobar</small>
            </div>

            {practicas.map((practica, pIndex) => (
              <div key={practica.id_actividad || `practica-${pIndex}`} className={styles.practicaItem}>
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
                    value={obtenerValorSelect(practica)}
                    // CAMBIO 1: onChange corregido
                    onChange={(e) => {
                      const value = e.target.value
                      const nuevasPracticas = [...practicas]

                      let temaId = null
                      let subtemaId = null

                      if (value.includes("_subtema_")) {
                        ;[temaId, subtemaId] = value.split("_subtema_")
                        nuevasPracticas[pIndex].id_unidad = temaId
                        nuevasPracticas[pIndex].id_subtema = subtemaId
                      } else if (value) {
                        temaId = value
                        nuevasPracticas[pIndex].id_unidad = value
                        nuevasPracticas[pIndex].id_subtema = ""
                      } else {
                        nuevasPracticas[pIndex].id_unidad = ""
                        nuevasPracticas[pIndex].id_subtema = ""
                      }

                      // Actualizar nombres para mostrar
                      if (temaId) {
                        const tema = temario.find((t) => String(t.id) === String(temaId))
                        nuevasPracticas[pIndex].nombre_unidad = tema?.nombre_tema || null
                      }
                      if (subtemaId && temaId) {
                        const tema = temario.find((t) => String(t.id) === String(temaId))
                        const subtema = tema?.subtemas?.find((s) => String(s.id) === String(subtemaId))
                        nuevasPracticas[pIndex].nombre_subtema = subtema?.nombre_subtema || null
                      }

                      setPracticas(nuevasPracticas)
                    }}
                  >
                    {/* CAMBIO 2: Renderizado del select con keys apropiados */}
                    <option value="">Seleccionar tema...</option>
                    {temario.map((tema, temaIndex) => (
                      <React.Fragment key={`tema-fragment-${tema.id || tema.id_temporal}`}>
                        <option value={tema.id || ""}>
                          Tema {tema.numero_tema}: {tema.nombre_tema || "Sin nombre"}
                        </option>
                        {tema.subtemas?.map((subtema, subIndex) => (
                          <option
                            key={`subtema-${subtema.id || subtema.id_temporal}`}
                            value={`${tema.id}_subtema_${subtema.id}`}
                          >
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ {subtema.numero_subtema} {subtema.nombre_subtema}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                  {(practica.id_unidad || practica.id_subtema) && (
                    <div className={styles.temaAsignado}>📌 Asignado a: {obtenerNombreCompleto(practica)}</div>
                  )}
                </div>

                <textarea
                  className={styles.textarea}
                  value={practica.descripcion_practica}
                  onChange={(e) => handlePracticaChange(pIndex, "descripcion_practica", e.target.value)}
                  placeholder="Descripción de la práctica..."
                />
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha de Entrega</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={practica.fecha_entrega || ""}
                    onChange={(e) => handlePracticaChange(pIndex, "fecha_entrega", e.target.value)}
                  />
                </div>
                {/* Sección de materiales */}
                <div className={styles.materialesSection}>
                  <div className={styles.materialesHeader}>
                    <h5>Materiales de apoyo</h5>
                    <button onClick={() => handleAddMaterialPractica(pIndex)} className={styles.buttonSmall}>
                      <FontAwesomeIcon icon={faPlus} /> Agregar material
                    </button>
                  </div>

                  {practica.materiales?.map((material, mIndex) => (
                    <div key={material.id_temporal || `material-${mIndex}`} className={styles.materialItem}>
                      <select
                        className={styles.selectSmall}
                        value={material.tipo}
                        onChange={(e) => handleMaterialChange(pIndex, mIndex, "tipo", e.target.value)}
                      >
                        <option value="enlace">🔗 Enlace</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="referencias">📝 Referencias APA</option>
                      </select>

                      {material.tipo === "enlace" ? (
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="URL del material"
                          value={material.url || ""}
                          onChange={(e) => handleMaterialChange(pIndex, mIndex, "url", e.target.value)}
                        />
                      ) : material.tipo === "pdf" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <input
                            type="file"
                            accept=".pdf"
                            className={styles.inputFile}
                            onChange={(e) => handlePDFUpload(e, pIndex, mIndex, "practica")}
                            disabled={material.uploading}
                          />
                          {material.uploading && (
                            <span style={{ fontSize: "14px", color: "#666" }}>⏳ Subiendo...</span>
                          )}
                          {!material.uploading && material.nombre && (
                            <span className={styles.uploadedBadge}>✅ {material.nombre}</span>
                          )}
                          {!material.uploading && !material.nombre && (
                            <span style={{ fontSize: "14px", color: "#999" }}>Sin archivos seleccionados</span>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Referencia en formato APA"
                          value={material.referencia || ""}
                          onChange={(e) => handleMaterialChange(pIndex, mIndex, "referencia", e.target.value)}
                        />
                      )}

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

            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha de Entrega del Proyecto</label>
              <input
                type="date"
                className={styles.input}
                value={proyecto.fecha_entrega || ""}
                onChange={(e) => setProyecto({ ...proyecto, fecha_entrega: e.target.value })}
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
                      setProyecto({
                        ...proyecto,
                        materiales: nuevosMateriales,
                      })
                    }}
                  >
                    <option value="enlace">🔗 Enlace</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="referencias">📝 Referencias APA</option>
                  </select>

                  {material.tipo === "enlace" ? (
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="URL del material"
                      value={material.url || ""}
                      onChange={(e) => {
                        const nuevosMateriales = [...proyecto.materiales]
                        nuevosMateriales[index].url = e.target.value
                        setProyecto({ ...proyecto, materiales: nuevosMateriales })
                      }}
                    />
                  ) : material.tipo === "pdf" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        type="file"
                        accept=".pdf"
                        className={styles.inputFile}
                        onChange={(e) => handlePDFUpload(e, null, index, "proyecto")}
                        disabled={material.uploading}
                      />
                      {material.uploading && <span style={{ fontSize: "14px", color: "#666" }}>⏳ Subiendo...</span>}
                      {!material.uploading && material.nombre && (
                        <span className={styles.uploadedBadge}>✅ {material.nombre}</span>
                      )}
                      {!material.uploading && !material.nombre && (
                        <span style={{ fontSize: "14px", color: "#999" }}>Sin archivos seleccionados</span>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Referencia en formato APA"
                      value={material.referencia || ""}
                      onChange={(e) => {
                        const nuevosMateriales = [...proyecto.materiales]
                        nuevosMateriales[index].referencia = e.target.value
                        setProyecto({ ...proyecto, materiales: nuevosMateriales })
                      }}
                    />
                  )}

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
                onChange={(e) =>
                  setPlaneacion({
                    ...planeacion,
                    evaluacion_competencias: e.target.value,
                  })
                }
                placeholder="Describe los instrumentos y criterios de evaluación: mapas conceptuales, reportes, exposiciones, problemarios, rúbricas, listas de cotejo, etc..."
              />
            </div>
          </div>

          {/* SECCIÓN 8: FUENTES DE INFORMACIÓN */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📖 Fuentes de Información</h3>
            {fuentes.map((fuente, index) => (
              <div key={fuente.id_material || `fuente-${index}`} className={styles.practicaItem}>
                <span className={styles.practicaNumber}>{index + 1}</span>
                <div className={styles.fuenteContent}>
                  <select
                    className={styles.select}
                    value={fuente.tipo}
                    onChange={(e) => handleFuenteChange(index, "tipo", e.target.value)}
                  >
                    <option value="referencias">📚 Referencias APA</option>
                    <option value="enlace">🌐 Sitio Web</option>
                    <option value="pdf">📄 Pdf</option>
                  </select>
                  {fuente.tipo === "enlace" ? (
                    <textarea
                      className={styles.textareaSmall}
                      value={fuente.url || ""}
                      onChange={(e) => handleFuenteChange(index, "url", e.target.value)}
                      placeholder="URL del sitio web"
                      rows={2}
                    />
                  ) : fuente.tipo === "pdf" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        type="file"
                        accept=".pdf"
                        className={styles.inputFile}
                        onChange={(e) => handlePDFUpload(e, null, index, "fuente")}
                        disabled={fuente.uploading}
                      />
                      {fuente.uploading && <span style={{ fontSize: "14px", color: "#666" }}>⏳ Subiendo...</span>}
                      {!fuente.uploading && fuente.nombre && (
                        <span className={styles.uploadedBadge}>✅ {fuente.nombre}</span>
                      )}
                      {!fuente.uploading && !fuente.nombre && (
                        <span style={{ fontSize: "14px", color: "#999" }}>Sin archivos seleccionados</span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      className={styles.textareaSmall}
                      value={fuente.referencia || ""}
                      onChange={(e) => handleFuenteChange(index, "referencia", e.target.value)}
                      placeholder="Formato: Autor(es). (Año). Título. Editorial/Revista/URL."
                      rows={2}
                    />
                  )}
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
