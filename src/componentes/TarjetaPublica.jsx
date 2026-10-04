import { Link } from 'react-router-dom'

// Contenedor de las pantallas públicas de un solo formulario (solicitud de
// acceso, recuperación y restablecimiento de contraseña).
export default function TarjetaPublica({ titulo, subtitulo, ancho = 'max-w-lg', children }) {
  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className={`w-full ${ancho} bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary"></div>
        <div className="flex flex-col gap-4 mb-6">
          <img alt="Trust 4P" className="h-8 object-contain self-start" src="/logo-trust4p.png" />
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{titulo}</h1>
            {subtitulo && <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subtitulo}</p>}
          </div>
        </div>
        {children}
        <div className="mt-6 pt-4 border-t border-surface-variant text-center">
          <Link className="font-label-md text-label-md text-primary font-semibold" to="/login">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  )
}

export function Campo({ id, etiqueta, requerido = true, ayuda, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-lg text-label-lg text-on-surface" htmlFor={id}>
        {etiqueta} {requerido && <span className="text-error">*</span>}
      </label>
      {children}
      {ayuda && <span className="font-body-sm text-body-sm text-outline">{ayuda}</span>}
    </div>
  )
}

export const CLASE_ENTRADA =
  'w-full h-11 px-4 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 transition-all'

export const CLASE_BOTON =
  'w-full h-12 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60'
