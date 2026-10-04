import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorApi, mensajeDeError } from '../servicios/api'
import {
  completarDiagnostico,
  diagnosticoEnCurso,
  guardarRespuesta,
  iniciarDiagnostico,
  obtenerCuestionario,
  obtenerDiagnostico,
} from '../servicios/diagnosticos'
import {
  avancePorDimension,
  indiceDeRetoma,
  preguntasAplicables,
  respuestasPorPregunta,
} from '../servicios/cuestionario'

const INTERVALO_SONDEO_MS = 3000
const MAXIMO_SONDEOS = 60

// Fases: cargando · sinDiagnostico · respondiendo · evaluando · terminado · error
export function useCuestionario() {
  const [fase, setFase] = useState('cargando')
  const [diagnostico, setDiagnostico] = useState(null)
  const [cuestionario, setCuestionario] = useState(null)
  const [indice, setIndice] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [pendientes, setPendientes] = useState([])
  const [sondeoAgotado, setSondeoAgotado] = useState(false)
  const temporizador = useRef(null)

  const aplicables = useMemo(
    () => (cuestionario && diagnostico ? preguntasAplicables(cuestionario, diagnostico) : []),
    [cuestionario, diagnostico],
  )
  const respuestas = useMemo(
    () => (diagnostico ? respuestasPorPregunta(diagnostico) : {}),
    [diagnostico],
  )
  const avance = useMemo(
    () => (cuestionario && diagnostico ? avancePorDimension(cuestionario, diagnostico, aplicables) : []),
    [cuestionario, diagnostico, aplicables],
  )

  const cargarBorrador = useCallback(async (datos) => {
    const banco = await obtenerCuestionario(datos.id)
    setCuestionario(banco)
    setDiagnostico(datos)
    setIndice(indiceDeRetoma(preguntasAplicables(banco, datos), datos))
    setFase('respondiendo')
  }, [])

  const clasificar = useCallback(
    async (datos) => {
      setDiagnostico(datos)
      if (datos.estado === 'borrador') return cargarBorrador(datos)
      setFase(datos.estado === 'completado' ? 'evaluando' : 'terminado')
      return undefined
    },
    [cargarBorrador],
  )

  useEffect(() => {
    let activo = true
    diagnosticoEnCurso()
      .then((datos) => activo && clasificar(datos))
      .catch((falla) => {
        if (!activo) return
        if (falla instanceof ErrorApi && falla.estado === 404) {
          setFase('sinDiagnostico')
        } else {
          setError(mensajeDeError(falla))
          setFase('error')
        }
      })
    return () => {
      activo = false
    }
  }, [clasificar])

  // Mientras el agente evalúa, se consulta el diagnóstico hasta que termine.
  useEffect(() => {
    if (fase !== 'evaluando' || !diagnostico) return undefined
    let intentos = 0
    temporizador.current = setInterval(async () => {
      intentos += 1
      try {
        const datos = await obtenerDiagnostico(diagnostico.id)
        if (datos.estado !== 'completado') {
          setDiagnostico(datos)
          setFase('terminado')
        }
      } catch {
        // un fallo puntual de red no interrumpe la espera
      }
      if (intentos >= MAXIMO_SONDEOS) {
        clearInterval(temporizador.current)
        setSondeoAgotado(true)
      }
    }, INTERVALO_SONDEO_MS)
    return () => clearInterval(temporizador.current)
  }, [fase, diagnostico?.id])

  const iniciar = useCallback(async () => {
    setError('')
    try {
      await cargarBorrador(await iniciarDiagnostico())
    } catch (falla) {
      setError(mensajeDeError(falla))
    }
  }, [cargarBorrador])

  // Cada respuesta se guarda de inmediato (HU-010): no hay botón "guardar".
  const responder = useCallback(
    async (pregunta, contenido) => {
      setError('')
      setGuardando(true)
      try {
        const datos = await guardarRespuesta(diagnostico.id, {
          pregunta_codigo: pregunta.codigo,
          opciones_codigo: contenido.opciones_codigo ?? [],
          valor: contenido.valor ?? null,
          texto: contenido.texto ?? null,
        })
        setDiagnostico(datos)
        return true
      } catch (falla) {
        setError(mensajeDeError(falla))
        return false
      } finally {
        setGuardando(false)
      }
    },
    [diagnostico],
  )

  const enviar = useCallback(async () => {
    setError('')
    setPendientes([])
    setGuardando(true)
    try {
      const datos = await completarDiagnostico(diagnostico.id)
      setDiagnostico(datos)
      setSondeoAgotado(false)
      setFase('evaluando')
    } catch (falla) {
      setError(mensajeDeError(falla))
      if (falla instanceof ErrorApi && falla.detalle?.preguntas_pendientes) {
        setPendientes(falla.detalle.preguntas_pendientes)
      }
    } finally {
      setGuardando(false)
    }
  }, [diagnostico])

  const actual = aplicables[indice] ?? null

  return {
    fase,
    diagnostico,
    cuestionario,
    aplicables,
    respuestas,
    avance,
    actual,
    indice,
    guardando,
    error,
    pendientes,
    sondeoAgotado,
    respondidas: aplicables.filter((p) => {
      const r = respuestas[p.codigo]
      return Boolean(r) && (r.opciones_codigo?.length > 0 || r.valor !== null || Boolean(r.texto))
    }).length,
    esPrimera: indice === 0,
    esUltima: indice >= aplicables.length - 1,
    iniciar,
    responder,
    enviar,
    siguiente: () => setIndice((i) => Math.min(i + 1, aplicables.length - 1)),
    anterior: () => setIndice((i) => Math.max(i - 1, 0)),
    irA: setIndice,
  }
}
