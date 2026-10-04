import { URL_AGENTE, solicitar } from './api'

// HU-030: bitácora de acciones (API de negocio).
export const consultarBitacora = (filtros = {}) => solicitar('/auditoria', { consulta: filtros })

// HU-037 / RF-42: ejecuciones del agente de evaluación (servicio del agente).
export const ejecucionesDelAgente = (diagnosticoId) =>
  solicitar(`/ejecuciones/${diagnosticoId}`, { base: URL_AGENTE })
