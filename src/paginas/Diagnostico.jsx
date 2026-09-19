import { useCuestionario } from '../hooks/useCuestionario'

const DIAGNOSTICO = {
  id: 'DIAG-2026-8842',
  empresaId: 'EMP-INNOVATECH-01',
  empresaNombre: 'InnovaTech Logistics Corp.',
  usuario: 'Alejandro Morales',
  iniciales: 'AM',
}

export default function Diagnostico() {
  const cuestionario = useCuestionario()
  const { actual, avance, progreso, respondidas, preguntas, respuestas, comentarios } = cuestionario

  if (!actual) {
    return (
      <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg max-w-lg text-center">
          <span className="material-symbols-outlined text-primary text-4xl">pending_actions</span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold mt-2">
            Banco de preguntas pendiente
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            El modelo de diagnóstico aún no tiene preguntas cargadas.
          </p>
        </div>
      </main>
    )
  }

  const seleccion = respuestas[actual.id]

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full">

        {cuestionario.modelo.borrador && (
          <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 mb-space-md flex items-center gap-2">
            <span className="material-symbols-outlined text-base">science</span>
            <span className="font-label-md text-label-md">
              Modelo en borrador. Los enunciados y la ponderación son provisionales y no corresponden al instrumento final.
            </span>
          </div>
        )}

        <header className="w-full bg-surface-container-lowest shadow-sm rounded-xl px-space-lg py-3 flex flex-wrap items-center justify-between gap-4 mb-space-md">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Diagnóstico de madurez de innovación
                </span>
                <span className="bg-primary/10 text-primary font-label-caps text-label-caps px-2 py-0.5 rounded-full">
                  v{cuestionario.modelo.version}
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {DIAGNOSTICO.empresaNombre}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-primary hover:bg-surface-container transition-colors font-label-lg text-label-lg"
              type="button"
            >
              <span className="material-symbols-outlined text-base">pause_circle</span>
              <span>Pausar y salir</span>
            </button>
            <div className="h-6 w-px bg-outline-variant/40 hidden md:block"></div>
            <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center font-bold">
                {DIAGNOSTICO.iniciales}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="font-label-lg text-label-lg text-on-surface leading-tight font-semibold">
                  {DIAGNOSTICO.usuario}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                  {DIAGNOSTICO.empresaNombre}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Diagnóstico
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                {DIAGNOSTICO.id}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Empresa
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-semibold tracking-tight">
                {DIAGNOSTICO.empresaId}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Progreso
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {progreso}% ({respondidas} / {preguntas.length})
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-fixed-dim via-tertiary-fixed-dim to-primary rounded-full transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

          <aside className="lg:col-span-4 flex flex-col gap-space-md w-full">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Dimensiones</h2>
                <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-md">
                  {avance.length}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {avance.map((dimension) => {
                  const completa = dimension.total > 0 && dimension.porcentaje === 100
                  return (
                    <div
                      key={dimension.id}
                      className={`relative flex items-center justify-between p-3 rounded-lg transition-all ${
                        dimension.activa
                          ? 'bg-primary/10 shadow-sm'
                          : dimension.hechas === 0
                            ? 'bg-surface-container-lowest opacity-60'
                            : 'bg-surface-container-low'
                      }`}
                    >
                      {dimension.activa && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-lg"></div>
                      )}

                      <div className="flex items-center gap-3 pl-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-label-md text-label-md ${
                            completa
                              ? 'bg-tertiary/15 text-tertiary'
                              : dimension.activa
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-outline'
                          }`}
                        >
                          {completa ? (
                            <span className="material-symbols-outlined text-base">check</span>
                          ) : (
                            dimension.numero
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`font-label-lg text-label-lg font-semibold ${
                              dimension.activa ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {dimension.numero}. {dimension.nombre}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">{dimension.subtitulo}</span>
                        </div>
                      </div>

                      <span
                        className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${
                          completa
                            ? 'text-tertiary bg-tertiary-fixed/30'
                            : dimension.activa
                              ? 'text-primary bg-surface-container-lowest'
                              : 'text-outline bg-surface-container-high'
                        }`}
                      >
                        {dimension.hechas}/{dimension.total}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider block mb-2">
                  Distribución de ponderación
                </span>
                <div className="flex items-center h-3 rounded-full overflow-hidden bg-surface-container">
                  {avance.map((dimension, i) => (
                    <div
                      key={dimension.id}
                      className={['bg-primary', 'bg-secondary', 'bg-outline-variant/60', 'bg-outline-variant/30'][i]}
                      style={{ width: `${dimension.peso * 100}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline mt-1.5 font-label-caps">
                  {avance.map((dimension) => (
                    <span key={dimension.id}>
                      {dimension.nombre} ({Math.round(dimension.peso * 100)}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 flex flex-col gap-space-md w-full">
            <article className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-secondary-fixed-dim via-tertiary-fixed-dim to-primary"></div>

              <div className="p-space-lg flex flex-col gap-space-md">

                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                  <nav
                    aria-label="Ubicación en el cuestionario"
                    className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant flex-wrap"
                  >
                    <span className="text-primary font-bold">
                      DIMENSIÓN {String(actual.dimension.numero).padStart(2, '0')}: {actual.dimension.nombre.toUpperCase()}
                    </span>
                    <span className="text-outline">/</span>
                    <span>{actual.dimension.subtitulo.toUpperCase()}</span>
                    <span className="text-outline">/</span>
                    <span className="bg-surface-container text-on-surface px-1.5 py-0.5 rounded font-bold">
                      PREGUNTA {cuestionario.indice + 1} DE {preguntas.length}
                    </span>
                  </nav>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low font-label-caps text-label-caps text-outline">
                    <span className="material-symbols-outlined text-xs text-primary">scale</span>
                    <span>Peso de la dimensión: {Math.round(actual.dimension.peso * 100)}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-snug">
                    {actual.enunciado}
                  </h2>

                  {actual.borrador && (
                    <span className="self-start font-label-caps text-label-caps text-on-error-container bg-error-container px-2 py-0.5 rounded">
                      Borrador
                    </span>
                  )}

                  <div className="flex items-start gap-2 bg-surface-container-low p-3 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">info</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">{actual.guia}</p>
                  </div>
                </div>

                <fieldset className="flex flex-col gap-3 my-2">
                  <legend className="sr-only">Escala de madurez</legend>
                  {actual.opciones.map((opcion) => {
                    const elegida = seleccion === opcion.nivel
                    return (
                      <label
                        key={opcion.nivel}
                        className={`relative flex items-start p-4 rounded-xl cursor-pointer transition-all ${
                          elegida
                            ? 'bg-primary/5 shadow-md'
                            : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
                        }`}
                      >
                        {elegida && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
                        )}
                        <input
                          checked={elegida}
                          className="mt-1 h-4 w-4 accent-primary"
                          name={`respuesta-${actual.id}`}
                          onChange={() => cuestionario.responder(actual.id, opcion.nivel)}
                          type="radio"
                          value={opcion.nivel}
                        />
                        <div className="ml-3.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`font-headline-sm text-headline-sm font-bold ${
                                elegida ? 'text-primary' : 'text-on-surface'
                              }`}
                            >
                              {opcion.nivel}: {opcion.titulo}
                            </span>
                            <span
                              className={`font-label-caps text-label-caps font-bold ${
                                elegida
                                  ? 'bg-primary text-on-primary px-2.5 py-0.5 rounded-full'
                                  : 'text-outline bg-surface-container px-2 py-0.5 rounded'
                              }`}
                            >
                              {opcion.puntaje} pts
                            </span>
                          </div>
                          <p
                            className={`font-body-md text-body-md mt-1 ${
                              elegida ? 'text-on-surface' : 'text-on-surface-variant'
                            }`}
                          >
                            {opcion.descripcion}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </fieldset>

                <div className="flex flex-col gap-1.5 pt-2">
                  <label
                    className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1.5"
                    htmlFor="comentarios"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">rate_review</span>
                    <span>Comentarios o contexto adicional</span>
                  </label>
                  <textarea
                    className="w-full rounded-lg bg-surface-container-low p-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y"
                    id="comentarios"
                    onChange={(e) => cuestionario.comentar(actual.id, e.target.value)}
                    placeholder="Indique particularidades del contexto de su organización."
                    rows="3"
                    value={comentarios[actual.id] || ''}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-surface-container">
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-label-lg text-label-lg"
                    disabled={cuestionario.esPrimera}
                    onClick={cuestionario.anterior}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Anterior</span>
                  </button>

                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all font-label-lg text-label-lg font-semibold"
                    disabled={!seleccion || cuestionario.esUltima}
                    onClick={cuestionario.siguiente}
                    type="button"
                  >
                    <span>Guardar y continuar</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  )
}