import { solicitar } from './api'

// Estructura pública del modelo de madurez vigente (dimensiones y niveles). No
// requiere sesión: la página de inicio la usa para reflejar siempre lo publicado.
export const obtenerModeloVigente = () => solicitar('/modelo-vigente', { anunciarExpiracion: false })
