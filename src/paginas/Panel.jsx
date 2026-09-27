import { Link } from 'react-router-dom'
import { ACTORES } from '../datos/sesion'
import { cambiarRol, useSesion } from '../hooks/useSesion'

export default function Panel() {
  const { rol, actor, accesos } = useSesion()

  const disponibles = accesos.filter((acceso) => acceso.estado === 'disponible')
  const pendientes = accesos.filter((acceso) => acceso.estado === 'pendiente')

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full pb-32 text-on-surface">

        <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 mb-space-md flex items-center gap-2">
          <span className="material-symbols-outlined text-base">science</span>
          <span className="font-label-md text-label-md">
            Sesión de demostración. El rol se elige manualmente hasta que exista
            la autenticación en la API de negocio.
          </span>
        </div>

        <div className="w-full flex items-center justify-between gap-space-md mb-space-md">
          <img
            alt="Trust 4P — De la visión a la solución"
            className="h-9 w-auto object-contain"
            src="/logo-trust4p.png"
          />

          <span className="font-label-caps text-label-caps text-on-surface-variant">
            Índice de madurez de innovación
          </span>
        </div>

        <header className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-md">
              <span className="h-14 w-14 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-headline-md text-headline-md">
                {actor.persona
                  .split(' ')
                  .slice(0, 2)
                  .map((parte) => parte[0])
                  .join('')}
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

            <div className="flex flex-col gap-space-xs">
              <label
                className="font-label-md text-label-md text-on-surface-variant"
                htmlFor="selector-rol"
              >
                Ver la plataforma como
              </label>

              <select
                className="h-11 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                id="selector-rol"
                onChange={(evento) => cambiarRol(evento.target.value)}
                value={rol}
              >
                {ACTORES.map((opcion) => (
                  <option key={opcion.id} value={opcion.id}>
                    {opcion.id} · {opcion.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mt-space-md pt-space-md border-t border-surface-container">
            {actor.definicion}
          </p>
        </header>

        <section className="mb-space-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">
            {disponibles.length > 0 ? 'Disponible para este rol' : 'Sin pantallas disponibles'}
          </h2>

          {disponibles.length === 0 && (
            <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              Este rol todavía no tiene pantallas construidas. Sus historias están
              registradas en el backlog y se encuentran pendientes de desarrollo.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {disponibles.map((acceso) => (
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

        {pendientes.length > 0 && (
          <section>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
              Pendiente de desarrollo
            </h2>

            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Historias registradas en el backlog cuya interfaz aún no se ha construido.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {pendientes.map((acceso) => (
                <article
                  className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-sm opacity-70"
                  key={acceso.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="h-11 w-11 rounded-lg bg-surface-container text-outline flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{acceso.icono}</span>
                    </span>

                    <span className="material-symbols-outlined text-outline text-lg">
                      schedule
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-headline-sm text-on-surface-variant">
                    {acceso.titulo}
                  </h3>

                  <p className="font-body-sm text-body-sm text-on-surface-variant flex-1">
                    {acceso.descripcion}
                  </p>

                  <span className="font-label-caps text-label-caps text-outline">
                    {acceso.historia}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
