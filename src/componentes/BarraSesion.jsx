import { Link, useNavigate } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

// Barra superior de toda pantalla autenticada: quién está en sesión, acceso al
// panel y a la cuenta, y cierre de sesión (RF-06).
export default function BarraSesion() {
  const { estado, actor, cerrarSesion } = useSesion()
  const navegar = useNavigate()

  if (estado !== 'autenticado') return null

  async function salir() {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <header className="w-full bg-surface-container-lowest shadow-sm px-margin-mobile lg:px-margin py-2.5 flex items-center justify-between gap-4">
      <Link aria-label="Ir al panel" className="flex items-center" to="/panel">
        <img alt="Trust 4P" className="h-8 w-auto object-contain" src="/logo-trust4p.png" />
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="font-label-lg text-label-lg text-on-surface font-semibold">
            {actor.persona}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {actor.nombre}
            {actor.organizacion ? ` · ${actor.organizacion}` : ''}
          </span>
        </div>

        <Link
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-primary hover:bg-surface-container transition-colors font-label-md text-label-md"
          to="/perfil"
        >
          <span className="material-symbols-outlined text-base">account_circle</span>
          <span className="hidden md:inline">Mi cuenta</span>
        </Link>

        <button
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md"
          onClick={salir}
          type="button"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Salir</span>
        </button>
      </div>
    </header>
  )
}
