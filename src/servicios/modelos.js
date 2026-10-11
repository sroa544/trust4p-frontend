import { solicitar } from './api'

// HU-029 a HU-035: gestión del modelo de madurez. Una versión publicada es
// inmutable: para cambiarla se crea una nueva versión en borrador (RF-34).

export const listarModelos = () => solicitar('/modelos-madurez')

export const consultarModelo = (id) => solicitar(`/modelos-madurez/${id}`)

export const crearNuevaVersion = (id) => solicitar(`/modelos-madurez/${id}/nueva-version`, { metodo: 'POST' })

// Cada eje del perfil de cultura se determina con una dimensión (RF-14): se
// puede reasignar a cualquier dimensión de la versión en borrador.
export const agregarEje = (id, eje) =>
  solicitar(`/modelos-madurez/${id}/ejes-perfil-cultural`, { metodo: 'POST', cuerpo: eje })

export const editarEje = (id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/ejes-perfil-cultural/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

// Catálogo de perfiles de cultura (RF-14): nombre y descripción de cada
// combinación de polos, definidos por versión.
export const agregarPerfilCultura = (id, perfil) =>
  solicitar(`/modelos-madurez/${id}/perfiles-cultura`, { metodo: 'POST', cuerpo: perfil })

export const editarPerfilCultura = (id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/perfiles-cultura/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

export const quitarPerfilCultura = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/perfiles-cultura/${codigo}`, { metodo: 'DELETE' })

export const publicarModelo = (id) => solicitar(`/modelos-madurez/${id}/publicar`, { metodo: 'POST' })

export const agregarDimension = (id, datos) =>
  solicitar(`/modelos-madurez/${id}/dimensiones`, {
    metodo: 'POST',
    cuerpo: {
      codigo: datos.codigo.trim(),
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion?.trim() || null,
      peso: String(datos.peso),
      orden: Number(datos.orden),
    },
  })

export const quitarDimension = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/dimensiones/${codigo}`, { metodo: 'DELETE' })

export const editarDimension =(id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/dimensiones/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

export const agregarPregunta = (id, pregunta) =>
  solicitar(`/modelos-madurez/${id}/preguntas`, { metodo: 'POST', cuerpo: pregunta })

export const editarPregunta =(id, codigo, cambios) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}`, { metodo: 'PATCH', cuerpo: cambios })

export const desactivarPregunta = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}/desactivar`, { metodo: 'POST' })

export const reactivarPregunta = (id, codigo) =>
  solicitar(`/modelos-madurez/${id}/preguntas/${codigo}/reactivar`, { metodo: 'POST' })

export const simularPesos = (id, pesos) =>
  solicitar(`/modelos-madurez/${id}/simulacion`, { metodo: 'POST', cuerpo: { pesos } })
