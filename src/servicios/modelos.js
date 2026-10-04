import { solicitar } from './api'

// HU-029 a HU-035: gestión del modelo de madurez. Una versión publicada es
// inmutable: para cambiarla se crea una nueva versión en borrador (RF-34).

export const listarModelos = () => solicitar('/modelos-madurez')

export const consultarModelo = (id) => solicitar(`/modelos-madurez/${id}`)

export const crearNuevaVersion = (id) => solicitar(`/modelos-madurez/${id}/nueva-version`, { metodo: 'POST' })

export const publicarModelo = (id) => solicitar(`/modelos-madurez/${id}/publicar`, { metodo: 'POST' })

export const editarDimension = (id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/dimensiones/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

export const editarPregunta = (id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

export const desactivarPregunta = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}/desactivar`, { metodo: 'POST' })

export const reactivarPregunta = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}/reactivar`, { metodo: 'POST' })

export const simularPesos = (id, pesos) =>
  solicitar(`/modelos-madurez/${id}/simulacion`, { metodo: 'POST', cuerpo: { pesos } })
