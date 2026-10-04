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

export default function Panel() {
  const { actor, accesos } = useSesion()

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full pb-32 text-on-surface">
        <header className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg">
          <div className="flex items-center gap-space-md">
            <span className="h-14 w-14 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-headline-md text-headline-md">
              {iniciales(actor.persona)}
            </span>

            <div>
              <span className="block font-label-caps text-label-caps text-secondary mb-0.5">
                {actor.id} · {actor.nombre}
              </span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {actor.persona}
              </h1>
              {actor.organizacion && (
                <span className="block font-body-sm text-body-sm text-on-surface-variant">
                  {actor.organizacion}
                </span>
              )}
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mt-space-md pt-space-md border-t border-surface-container">
            {actor.definicion}
          </p>
        </header>

        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">
            Disponible para su rol
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {accesos.map((acceso) => (
              <Link
                className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-sm"
                key={acceso.id}
                to={acceso.ruta}
              >
                <span className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{acceso.icono}</span>
                </span>

                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  {acceso.titulo}
                </h3>

                <p className="font-body-sm text-body-sm text-on-surface-variant flex-1">
                  {acceso.descripcion}
                </p>

                <span className="font-label-caps text-label-caps text-outline">
                  {acceso.historia}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
