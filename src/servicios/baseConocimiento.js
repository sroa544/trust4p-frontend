import { URL_AGENTE, solicitar } from './api'

// Base de conocimiento del agente (RF-41): PDF que se fragmentan, se vectorizan
// y alimentan la redacción de cada diagnóstico. Solo el administrador.
// El servicio del agente vive aparte (URL_AGENTE) y comparte la sesión.

export const CATEGORIAS = [
  { valor: 'rubrica', texto: 'Rúbrica de valoración', uso: 'Criterios para valorar las dimensiones con menor puntaje.' },
  { valor: 'dimensiones', texto: 'Descripción de las dimensiones', uso: 'Qué significa cada dimensión del modelo.' },
  { valor: 'perfiles_cultura', texto: 'Perfiles de cultura', uso: 'Descripción de cada perfil de cultura de innovación.' },
  { valor: 'ejemplos', texto: 'Ejemplos de diagnósticos', uso: 'Casos calificados con un nivel y perfil similares.' },
  { valor: 'marco_teorico', texto: 'Marco teórico', uso: 'Contexto conceptual general de la madurez de innovación.' },
]

export const listarDocumentos = () => solicitar('/documentos', { base: URL_AGENTE })

function formulario(campos, archivo) {
  const datos = new FormData()
  Object.entries(campos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') datos.append(clave, String(valor).trim())
  })
  datos.append('archivo', archivo)
  return datos
}

export const cargarDocumento = ({ titulo, categoria, version, fuente, archivo }) =>
  solicitar('/documentos', {
    base: URL_AGENTE,
    metodo: 'POST',
    datosFormulario: formulario({ titulo, categoria, version, fuente }, archivo),
  })

// Una actualización crea una versión nueva y desactiva la anterior.
export const actualizarDocumento = (id, { version, titulo, categoria, fuente, archivo }) =>
  solicitar(`/documentos/${id}`, {
    base: URL_AGENTE,
    metodo: 'PATCH',
    datosFormulario: formulario({ version, titulo, categoria, fuente }, archivo),
  })

export const desactivarDocumento = (id) => solicitar(`/documentos/${id}/desactivar`, { base: URL_AGENTE, metodo: 'POST' })

export const reactivarDocumento = (id) => solicitar(`/documentos/${id}/reactivar`, { base: URL_AGENTE, metodo: 'POST' })
