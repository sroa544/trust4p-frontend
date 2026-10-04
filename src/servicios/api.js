// Cliente HTTP de las APIs de Trust 4P.
//
// La sesión viaja en una cookie HttpOnly que emite la API de negocio; por eso
// todas las peticiones usan credentials: 'include' y el navegador nunca ve el
// token. El backend es la fuente de verdad de las validaciones: aquí solo se
// traduce su respuesta a un mensaje legible para la persona.

export const URL_NEGOCIO = (
  import.meta.env.VITE_API_NEGOCIO_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

export const URL_AGENTE = (
  import.meta.env.VITE_API_AGENTE_URL ?? 'http://localhost:8001'
).replace(/\/$/, '')

export const EVENTO_SESION_EXPIRADA = 'trust4p:sesion-expirada'

const MENSAJES_ESTANDAR = {
  'Field required': 'es obligatorio',
  'Input should be a valid string': 'debe ser un texto',
  'Input should be a valid integer': 'debe ser un número entero',
  'Input should be a valid number': 'debe ser un número',
  'Input should be a valid boolean': 'debe ser verdadero o falso',
  'JSON decode error': 'tiene un formato inválido',
}

const NOMBRES_DE_CAMPO = {
  correo: 'Correo',
  correo_solicitante: 'Correo',
  clave: 'Contraseña',
  clave_nueva: 'Contraseña nueva',
  clave_actual: 'Contraseña actual',
  confirmar_clave: 'Confirmación',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  nombre_empresa: 'Empresa',
  nombre_solicitante: 'Nombre del solicitante',
  nit: 'NIT',
  telefono: 'Teléfono',
  cargo: 'Cargo',
  numero_empleados: 'Número de empleados',
  sector_codigo: 'Sector',
  motivo: 'Motivo',
  titulo: 'Título',
  contenido: 'Contenido',
}

export class ErrorApi extends Error {
  constructor(estado, mensaje, detalle) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.detalle = detalle
  }
}

function limpiarMensaje(texto) {
  return String(texto)
    .replace(/^Value error, /, '')
    .replace(/^Assertion failed, /, '')
}

function mensajeDeValidacion(item) {
  const campo = item.loc?.[item.loc.length - 1]
  const mensaje = limpiarMensaje(MENSAJES_ESTANDAR[item.msg] ?? item.msg)
  const nombre = NOMBRES_DE_CAMPO[campo]
  if (nombre && !mensaje.toLowerCase().startsWith(nombre.toLowerCase())) {
    return `${nombre}: ${mensaje}`
  }
  return mensaje
}

export function textoDeDetalle(detalle, estado) {
  if (typeof detalle === 'string') return detalle
  if (Array.isArray(detalle)) return detalle.map(mensajeDeValidacion).join('. ')
  if (detalle && typeof detalle === 'object' && detalle.mensaje) return detalle.mensaje
  if (estado === 429) return 'Demasiadas solicitudes. Intente de nuevo en unos minutos.'
  if (estado >= 500) return 'El servicio no pudo procesar la solicitud. Intente de nuevo.'
  return 'No fue posible completar la solicitud.'
}

function construirUrl(base, ruta, consulta) {
  const url = new URL(`${base}/v1${ruta}`)
  Object.entries(consulta ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(clave, String(valor))
    }
  })
  return url.toString()
}

export async function solicitar(
  ruta,
  { metodo = 'GET', cuerpo, consulta, base = URL_NEGOCIO, datosFormulario, respuesta = 'json', anunciarExpiracion = true } = {},
) {
  const opciones = { method: metodo, credentials: 'include', headers: {} }
  if (datosFormulario) {
    opciones.body = datosFormulario
  } else if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(cuerpo)
  }

  let res
  try {
    res = await fetch(construirUrl(base, ruta, consulta), opciones)
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Verifique su conexión.')
  }

  if (!res.ok) {
    let detalle
    try {
      detalle = (await res.json()).detail
    } catch {
      detalle = undefined
    }
    if (res.status === 401 && anunciarExpiracion) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
    throw new ErrorApi(res.status, textoDeDetalle(detalle, res.status), detalle)
  }

  if (res.status === 204) return null
  if (respuesta === 'blob') return res.blob()
  if (respuesta === 'texto') return res.text()
  return res.json()
}

export function mensajeDeError(error) {
  return error instanceof ErrorApi ? error.message : 'Ocurrió un error inesperado.'
}
