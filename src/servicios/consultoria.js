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
    },
  })

export const cerrarDiagnostico = (id) => solicitar(`/diagnosticos/${id}/cerrar`, { metodo: 'POST' })
