import { solicitar } from './api'

export const iniciarDiagnostico = () => solicitar('/diagnosticos', { metodo: 'POST' })

// 404 = la empresa no tiene un diagnóstico sin cerrar.
export const diagnosticoEnCurso = () => solicitar('/diagnosticos/en-curso')

export const listarDiagnosticos = () => solicitar('/diagnosticos')

export const obtenerDiagnostico = (id) => solicitar(`/diagnosticos/${id}`)

export const obtenerCuestionario = (id) => solicitar(`/diagnosticos/${id}/cuestionario`)

export const guardarRespuesta = (id, respuesta) =>
  solicitar(`/diagnosticos/${id}/respuestas`, { metodo: 'POST', cuerpo: respuesta })

export const completarDiagnostico = (id) =>
  solicitar(`/diagnosticos/${id}/completar`, { metodo: 'POST' })

export const obtenerEvolucion = () => solicitar('/diagnosticos/evolucion')

export const descargarInforme = (id) =>
  solicitar(`/diagnosticos/${id}/informe`, { respuesta: 'blob' })

// Diagnóstico de demostración (RF-49): público, sin sesión y sin persistencia.
export const preguntasDemo = () => solicitar('/demo/preguntas', { anunciarExpiracion: false })

export const resultadoDemo = (respuestas) =>
  solicitar('/demo/resultado', {
    metodo: 'POST',
    cuerpo: { respuestas },
    anunciarExpiracion: false,
  })
