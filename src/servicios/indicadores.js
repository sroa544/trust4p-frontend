import { solicitar } from './api'

// HU-023: indicadores agregados (consultor) y exportación anonimizada (admin).
export const consultarIndicadores = (filtros = {}) => solicitar('/indicadores/agregados', { consulta: filtros })

export const exportarIndicadores = (filtros = {}) =>
  solicitar('/indicadores/exportacion', { consulta: filtros, respuesta: 'blob' })
