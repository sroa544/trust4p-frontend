import { NavLink } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

// Navegacion lateral de toda pantalla autenticada. Los modulos salen de los
// mismos accesos del rol que usa el panel (src/datos/sesion.js), de modo que
// la barra nunca ofrece una ruta que el rol no pueda abrir.
//
// El panel no esta en esa lista porque no es un modulo sino la portada, asi
// que se antepone aqui y no en los datos: agregarlo alla lo metria tambien en
// la rejilla de tarjetas y en el conteo de modulos habilitados.
const PORTADA = { id: 'panel', ruta: '/panel', titulo: 'Panel', icono: 'dashboard', exacta: true }

const BASE =
  'flex items-center gap-space-sm px-space-md py-3 rounded-lg whitespace-nowrap transition-colors font-label-lg text-label-lg'
const ACTIVO = 'bg-primary-container text-on-primary shadow-sm'
const INACTIVO = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'

export default function MenuLateral() {
  const { estado, accesos } = useSesion()

  if (estado !== 'autenticado') return null

  const entradas = [PORTADA, ...accesos]

  return (
    <aside className="shrink-0 lg:w-72 bg-surface-container-low border-b lg:border-b-0 lg:border-r border-surface-container">
      {/* En pantalla ancha es una columna; en angosta, una fila que se
          desplaza. Es la misma lista, solo cambia la direccion. */}
      <nav
        aria-label="Módulos"
        className="flex flex-row lg:flex-col gap-1 p-space-sm lg:p-space-md overflow-x-auto lg:overflow-x-visible lg:sticky lg:top-space-md"
      >
        {entradas.map((entrada) => (
          <NavLink
            className={({ isActive }) => `${BASE} ${isActive ? ACTIVO : INACTIVO}`}
            end={entrada.exacta ?? false}
            key={entrada.id}
            to={entrada.ruta}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl shrink-0">
              {entrada.icono}
            </span>
            <span className="truncate">{entrada.titulo}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
