import { Link, Navigate } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import EntradaPregunta from '../componentes/EntradaPregunta.jsx'
import { useCuestionario } from '../hooks/useCuestionario'
import { estaRespondida } from '../servicios/cuestionario'

function Pantalla({ icono, titulo, children }) {
  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg max-w-lg text-center flex flex-col items-center gap-space-sm">
        <span className="material-symbols-outlined text-primary text-4xl">{icono}</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{titulo}</h1>
        {children}
      </div>
    </main>
  )
}

const BOTON_PRIMARIO =
  'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all font-label-lg text-label-lg font-semibold'

export default function Diagnostico() {
  const c = useCuestionario()

  if (c.fase === 'cargando') {
    return (
      <Pantalla icono="hourglass_top" titulo="Cargando su diagnóstico…">
        <span role="status" className="sr-only">Cargando</span>
      </Pantalla>
    )
  }

  if (c.fase === 'error') {
    return (
      <Pantalla icono="error" titulo="No se pudo cargar el diagnóstico">
        <Aviso tipo="error">{c.error}</Aviso>
        <Link className="font-label-md text-label-md text-primary" to="/panel">Volver al panel</Link>
      </Pantalla>
    )
  }

  if (c.fase === 'sinDiagnostico') {
    return (
      <Pantalla icono="assignment_add" titulo="Iniciar un diagnóstico">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Su empresa no tiene un diagnóstico en curso. Al iniciarlo se aplica la versión vigente
          del modelo; sus respuestas se guardan automáticamente y puede retomarlo cuando quiera.
        </p>
        <Aviso tipo="error">{c.error}</Aviso>
        <button className={BOTON_PRIMARIO} onClick={c.iniciar} type="button">
          Iniciar diagnóstico
        </button>
        <Link className="font-label-md text-label-md text-primary" to="/panel">Volver al panel</Link>
      </Pantalla>
    )
  }

  if (c.fase === 'evaluando') {
    return (
      <Pantalla icono="neurology" titulo="Evaluando su diagnóstico">
        <p className="font-body-md text-body-md text-on-surface-variant" role="status">
          Ya recibimos todas sus respuestas. El índice se calcula de inmediato y el agente está
          redactando la interpretación. Esto puede tardar unos segundos.
        </p>
        {c.sondeoAgotado && (
          <Aviso tipo="info">
            La evaluación tarda más de lo esperado. Puede esperar o consultar el resultado
            parcial desde el panel.
          </Aviso>
        )}
        <Link className="font-label-md text-label-md text-primary" to={`/resultados/${c.diagnostico.id}`}>
          Ver el resultado
        </Link>
      </Pantalla>
    )
  }

  if (c.fase === 'terminado') {
    const cerrado = c.diagnostico.estado === 'cerrado'
    return <Navigate replace to={cerrado ? '/historial' : `/resultados/${c.diagnostico.id}`} />
  }

  const { actual, cuestionario, diagnostico, avance } = c
  if (!actual) {
    return (
      <Pantalla icono="pending_actions" titulo="Banco de preguntas pendiente">
        <p className="font-body-md text-body-md text-on-surface-variant">
          La versión vigente del modelo todavía no tiene preguntas aplicables.
        </p>
      </Pantalla>
    )
  }

  const respuesta = c.respuestas[actual.codigo]
  const dimension = cuestionario.dimensiones.find((d) => d.codigo === actual.dimension_codigo)
  const respondida = estaRespondida(actual, respuesta)
  const completo = diagnostico.porcentaje_avance >= 100
  const progreso = diagnostico.porcentaje_avance

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full">
        <header className="w-full bg-surface-container-lowest shadow-sm rounded-xl px-space-lg py-3 flex flex-wrap items-center justify-between gap-4 mb-space-md">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                Diagnóstico de madurez de innovación
              </span>
              <span className="bg-primary/10 text-primary font-label-caps text-label-caps px-2 py-0.5 rounded-full">
                v{cuestionario.modelo_version}
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {diagnostico.empresa_nombre}
            </span>
          </div>

          <Link
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-primary hover:bg-surface-container transition-colors font-label-lg text-label-lg"
            to="/panel"
          >
            <span className="material-symbols-outlined text-base">pause_circle</span>
            <span>Pausar y salir</span>
          </Link>
        </header>

        <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Diagnóstico</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                N.° {diagnostico.consecutivo}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Empresa</span>
              <span className="font-headline-sm text-headline-sm text-primary font-semibold tracking-tight">
                {diagnostico.empresa_nombre}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Progreso</span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {progreso}% ({c.respondidas} / {c.aplicables.length})
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
                {avance.map((d, i) => {
                  const completa = d.total > 0 && d.porcentaje === 100
                  const activa = d.codigo === actual.dimension_codigo
                  return (
                    <div
                      className={`relative flex items-center justify-between p-3 rounded-lg transition-all ${
                        activa
                          ? 'bg-primary/10 shadow-sm'
                          : d.hechas === 0
                            ? 'bg-surface-container-lowest opacity-60'
                            : 'bg-surface-container-low'
                      }`}
                      key={d.codigo}
                    >
                      {activa && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-lg"></div>}
                      <div className="flex items-center gap-3 pl-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-label-md text-label-md ${
                            completa
                              ? 'bg-tertiary/15 text-tertiary'
                              : activa
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-outline'
                          }`}
                        >
                          {completa ? <span className="material-symbols-outlined text-base">check</span> : i + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-label-lg text-label-lg font-semibold ${activa ? 'text-primary' : 'text-on-surface'}`}>
                            {i + 1}. {d.nombre}
                          </span>
                          {d.descripcion && <span className="font-body-sm text-body-sm text-outline">{d.descripcion}</span>}
                        </div>
                      </div>
                      <span
                        className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${
                          completa
                            ? 'text-tertiary bg-tertiary-fixed/30'
                            : activa
                              ? 'text-primary bg-surface-container-lowest'
                              : 'text-outline bg-surface-container-high'
                        }`}
                      >
                        {d.hechas}/{d.total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 flex flex-col gap-space-md w-full">
            <article className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-secondary-fixed-dim via-tertiary-fixed-dim to-primary"></div>

              <div className="p-space-lg flex flex-col gap-space-md">
                <nav
                  aria-label="Ubicación en el cuestionario"
                  className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant flex-wrap pb-2"
                >
                  <span className="text-primary font-bold">DIMENSIÓN: {dimension?.nombre.toUpperCase()}</span>
                  <span className="text-outline">/</span>
                  <span className="bg-surface-container text-on-surface px-1.5 py-0.5 rounded font-bold">
                    PREGUNTA {c.indice + 1} DE {c.aplicables.length}
                  </span>
                  {actual.obligatoria && (
                    <span className="text-error font-bold">· OBLIGATORIA</span>
                  )}
                </nav>

                <div className="flex flex-col gap-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-snug">
                    {actual.enunciado}
                  </h2>

                  {actual.ayuda && (
                    <div className="flex items-start gap-2 bg-surface-container-low p-3 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">info</span>
                      <p className="font-body-md text-body-md text-on-surface-variant">{actual.ayuda}</p>
                    </div>
                  )}
                </div>

                <EntradaPregunta
                  deshabilitado={c.guardando}
                  escala={{ min: cuestionario.escala_min, max: cuestionario.escala_max }}
                  onCambiar={(contenido) => c.responder(actual, contenido)}
                  pregunta={actual}
                  respuesta={respuesta}
                />

                <Aviso tipo="error">{c.error}</Aviso>
                {c.pendientes.length > 0 && (
                  <Aviso tipo="info">Preguntas obligatorias pendientes: {c.pendientes.join(', ')}</Aviso>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-surface-container">
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-label-lg text-label-lg"
                    disabled={c.esPrimera}
                    onClick={c.anterior}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Anterior</span>
                  </button>

                  {c.esUltima ? (
                    <button
                      className={`w-full sm:w-auto ${BOTON_PRIMARIO}`}
                      disabled={!completo || c.guardando}
                      onClick={c.enviar}
                      type="button"
                    >
                      <span>Enviar diagnóstico</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  ) : (
                    <button
                      className={`w-full sm:w-auto ${BOTON_PRIMARIO}`}
                      disabled={(actual.obligatoria && !respondida) || c.guardando}
                      onClick={c.siguiente}
                      type="button"
                    >
                      <span>Guardar y continuar</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  )
}
