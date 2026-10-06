import { Link } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

// Portada de la sesion. Repite a proposito los accesos que ya estan en el menu
// lateral: la barra sirve para saltar entre modulos, las tarjetas para saber
// que hace cada uno antes de entrar.
export default function Panel() {
  const { actor, accesos } = useSesion()

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-space-lg pb-32 text-on-surface">
        <header className="relative overflow-hidden w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          {/* Franja y halos decorativos: no transportan informacion, por eso
              quedan fuera del flujo y sin lectura para el lector de pantalla. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary-container via-tertiary-fixed to-primary-container"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute right-48 -bottom-24 h-60 w-60 rounded-full bg-tertiary-fixed/25 blur-2xl pointer-events-none"
          />

          <div className="relative flex items-start gap-space-md">
            <span className="h-16 w-16 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-headline-md text-headline-md shadow-md">
              {iniciales(actor.persona)}
            </span>

            <div className="flex flex-col gap-space-xs min-w-0">
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-fixed">
                  {actor.id} · {actor.nombre}
                </span>

                {actor.organizacion && (
                  <span className="inline-flex items-center gap-1.5 font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {actor.organizacion}
                  </span>
                )}
              </div>

              <h1 className="font-headline-xl text-headline-xl text-on-surface">
                {actor.persona}
              </h1>

              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                {actor.definicion}
              </p>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-secondary" />
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Módulos
                </span>
              </div>

              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Disponible para su rol
              </h2>
            </div>

            {/* El conteo sale de los accesos del rol, no de un valor fijo: cada
                rol ve el numero que le corresponde. */}
            <span className="self-start sm:self-auto font-label-caps text-label-caps px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant">
              {accesos.length === 1 ? '1 módulo habilitado' : `${accesos.length} módulos habilitados`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {accesos.map((acceso) => (
              <Link
                className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
                key={acceso.id}
                to={acceso.ruta}
              >
                <span className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-space-md transition-transform duration-200 group-hover:scale-105">
                  <span className="material-symbols-outlined text-2xl">{acceso.icono}</span>
                </span>

                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-space-sm">
                  {acceso.titulo}
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant flex-1">
                  {acceso.descripcion}
                </p>

                <span className="flex items-center justify-end gap-space-sm mt-space-md pt-space-md border-t border-surface-container">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-xl text-primary shrink-0 transition-transform group-hover:translate-x-1"
                  >
                    arrow_forward
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
