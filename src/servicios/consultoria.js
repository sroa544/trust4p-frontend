import { solicitar } from './api'

// Flujos del consultor (HU-020 a HU-024). El backend solo entrega empresas con
// asignación vigente; cualquier otra devuelve 403.

export const listarEmpresasAsignadas = (filtros = {}) =>
  solicitar('/consultoria/empresas', { consulta: filtros })

export const listarDiagnosticosDeEmpresa = (empresaId) =>
  solicitar(`/consultoria/empresas/${empresaId}/diagnosticos`)

export const obtenerDiagnosticoAsignado = (id) => solicitar(`/consultoria/diagnosticos/${id}`)

export const obtenerCuestionarioAsignado = (id) => solicitar(`/consultoria/diagnosticos/${id}/cuestionario`)

export const registrarRecomendacion = (id, datos) =>
  solicitar(`/consultoria/diagnosticos/${id}/recomendaciones`, {
    metodo: 'POST',
    cuerpo: {
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      dimension_codigo: datos.dimension || null,
      visible: datos.visible,
      fecha_limite: datos.fecha_limite || null,
      nivel_objetivo: datos.nivel_objetivo ?? null,
    },
  })

// Plan de mejora: las recomendaciones son tareas que el consultor gestiona.
// `cambios` lleva solo lo que cambia; fecha_limite en null la quita.
export const editarTarea = (diagnosticoId, tareaId, cambios) =>
  solicitar(`/consultoria/diagnosticos/${diagnosticoId}/recomendaciones/${tareaId}`, {
    metodo: 'PATCH',
    cuerpo: cambios,
  })

// Confirma que la empresa alcanzó el siguiente nivel (todas sus tareas completadas).
export const avanzarNivel = (diagnosticoId) =>
  solicitar(`/consultoria/diagnosticos/${diagnosticoId}/avanzar-nivel`, { metodo: 'POST' })

export const cerrarDiagnostico = (id) => solicitar(`/diagnosticos/${id}/cerrar`, { metodo: 'POST' })
