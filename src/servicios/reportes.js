import { solicitar } from './api'

// Informes por empresa: el administrador alcanza a todas y el consultor a las
// que tiene asignadas (lo decide el servidor).

export const listarEmpresasParaReporte = (filtros = {}) => solicitar('/reportes/empresas', { consulta: filtros })

export const descargarInformeDeEmpresa = (diagnosticoId) =>
  solicitar(`/reportes/diagnosticos/${diagnosticoId}/informe`, { respuesta: 'blob' })
