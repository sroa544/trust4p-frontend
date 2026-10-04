// Ayudas de validación para la interfaz.
//
// El backend es la fuente de verdad (RF-48 y demás reglas): estas funciones
// solo reflejan SU política para orientar a la persona mientras escribe. Si
// cambian allá, cambian aquí; el mensaje que manda es siempre el del servidor.

export const LONGITUD_MINIMA_CLAVE = 12
export const TIPOS_MINIMOS_CLAVE = 3

export function evaluarClave(clave) {
  const tipos = {
    mayuscula: /[A-Z]/.test(clave),
    minuscula: /[a-z]/.test(clave),
    numero: /[0-9]/.test(clave),
    especial: /[^A-Za-z0-9]/.test(clave),
  }
  const longitud = clave.length >= LONGITUD_MINIMA_CLAVE
  const cantidadTipos = Object.values(tipos).filter(Boolean).length
  return {
    longitud,
    ...tipos,
    cantidadTipos,
    cumple: longitud && cantidadTipos >= TIPOS_MINIMOS_CLAVE,
  }
}

export const REGLAS_CLAVE = [
  { clave: 'longitud', texto: `Mínimo ${LONGITUD_MINIMA_CLAVE} caracteres` },
  { clave: 'mayuscula', texto: 'Mayúsculas' },
  { clave: 'minuscula', texto: 'Minúsculas' },
  { clave: 'numero', texto: 'Números' },
  { clave: 'especial', texto: 'Símbolo especial (!@#$)' },
]

export const TEXTO_POLITICA_CLAVE = `Mínimo ${LONGITUD_MINIMA_CLAVE} caracteres y al menos ${TIPOS_MINIMOS_CLAVE} de estos tipos: mayúsculas, minúsculas, números y símbolos.`

export function dividirNombre(nombreCompleto) {
  const partes = (nombreCompleto ?? '').trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { nombres: partes[0] ?? '', apellidos: '' }
  const corte = partes.length >= 4 ? 2 : 1
  return { nombres: partes.slice(0, corte).join(' '), apellidos: partes.slice(corte).join(' ') }
}

export function formatearFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatearFechaHora(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function numero(valor, decimales = 1) {
  const n = Number(valor)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(decimales).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}
