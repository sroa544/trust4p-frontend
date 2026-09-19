import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PLAN_ESTRATEGICO } from '../datos/planEstrategico'

const SEVERIDAD = {
  bien: { punto: 'bg-tertiary', chip: 'bg-tertiary/10 text-tertiary', fondo: 'bg-surface-container-low/60', paso: 'text-primary', icono: 'arrow_outward' },
  medio: { punto: 'bg-secondary', chip: 'bg-secondary/10 text-secondary', fondo: 'bg-surface-container-low/60', paso: 'text-primary', icono: 'alt_route' },
  critico: { punto: 'bg-error', chip: 'bg-error/15 text-error', fondo: 'bg-error-container/20', paso: 'text-on-surface', icono: 'report' },
}

const ORDENES = [
  { id: 'impacto', etiqueta: 'Mayor impacto' },
  { id: 'plazo', etiqueta: 'Menor plazo' },
]

export default function PlanEstrategico() {
  const plan = PLAN_ESTRATEGICO
  const [seleccion, setSeleccion] = useState(
    plan.iniciativas.filter((i) => !i.opcional).map((i) => i.id),
  )
  const [orden, setOrden] = useState('impacto')

  const elegidas = plan.iniciativas.filter((i) => seleccion.includes(i.id))
  const impactoGlobal = elegidas.reduce((t, i) => t + i.impactoGlobal, 0)
  const plazoTotal = elegidas.reduce((t, i) => Math.max(t, i.semanas), 0)
  const proyectado = plan.indiceActual + impactoGlobal

  const ordenadas = [...plan.iniciativas].sort((a, b) =>
    orden === 'impacto' ? b.impactoGlobal - a.impactoGlobal : a.semanas - b.semanas,
  )

  function alternar(id) {
    setSeleccion((previa) =>
      previa.includes(id) ? previa.filter((x) => x !== id) : [...previa, id],
    )
  }

  function dimensionDe(id) {
    return plan.dimensiones.find((d) => d.id === id)
  }

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full pb-32 text-on-surface">

        {plan.borrador && (
          <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 mb-space-md flex items-center gap-2">
            <span className="material-symbols-outlined text-base">science</span>
            <span className="font-label-md text-label-md">
              Plan en borrador. Las iniciativas y los impactos proyectados son provisionales.
            </span>
          </div>
        )}

        <header className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
            <nav aria-label="Ruta de navegación" className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
              <span>Diagnóstico de innovación</span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
              <Link className="hover:text-primary transition-colors" to={`/resultados/${plan.diagnosticoId}`}>
                Informe de resultados
              </Link>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
              <span className="text-primary font-semibold">Plan estratégico</span>
            </nav>

            <button
              className="inline-flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Exportar plan
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-xs">
            <div>
              <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-caps uppercase mb-space-xs">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                Resolución sistemática de contradicciones
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Plan de transformación y hoja de ruta
              </h1>
            </div>

            <div className="flex items-center gap-space-md bg-surface-container-low p-space-sm rounded-lg">
              <div className="px-space-xs text-right">
                <span className="block font-label-caps text-outline uppercase">Madurez actual</span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {plan.indiceActual}
                  <span className="text-body-sm font-normal text-outline">/100</span>
                </span>
              </div>
              <div className="h-8 w-px bg-surface-container-highest"></div>
              <div className="px-space-xs text-left">
                <span className="block font-label-caps text-secondary uppercase">Meta</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  {plan.meta}
                  <span className="text-body-sm font-normal text-outline">/100 (N{plan.nivelMeta})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs mt-space-md pt-space-sm bg-surface-container-low/60 rounded-lg px-space-md py-space-xs font-body-sm text-on-surface-variant">
            <div>
              <span className="font-semibold text-on-surface">Empresa:</span> {plan.empresaNombre}{' '}
              <span className="text-outline font-mono">(NIT {plan.empresaNit})</span>
            </div>
            <div>
              <span className="font-semibold text-on-surface">Diagnóstico:</span>{' '}
              <span className="font-mono text-primary font-medium">{plan.diagnosticoId}</span>
            </div>
            <div>
              <span className="font-semibold text-on-surface">Responsable:</span> {plan.responsable}
            </div>
            <div className="ml-auto text-primary font-label-caps flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span> Ciclo {plan.ciclo}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

          <section className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-md">
                <span className="material-symbols-outlined text-primary text-[24px]">view_quilt</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Lienzo por dimensión</h2>
              </div>

              <div className="flex flex-col gap-space-md">
                {plan.dimensiones.map((d) => {
                  const s = SEVERIDAD[d.severidad]
                  return (
                    <article key={d.id} className={`p-space-md rounded-lg ${s.fondo} transition-colors`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-space-xs">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.punto}`}></span>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            {d.numero}. {d.nombre}
                          </h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-label-caps ${s.chip}`}>
                          {d.puntaje}/100 · N{d.nivel}
                        </span>
                      </div>

                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xs">
                        <span className="font-semibold text-on-surface">{d.etiquetaEstado}:</span> {d.estado}
                      </p>

                      <div className={`flex items-center gap-space-xs font-body-sm text-body-sm ${s.paso}`}>
                        <span className="material-symbols-outlined text-[16px]">{s.icono}</span>
                        <span>{d.siguientePaso}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <span className="material-symbols-outlined text-secondary text-[24px]">hub</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Contradicciones detectadas</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Tensiones entre objetivos que el plan busca resolver sin sacrificar ninguno de los dos lados.
              </p>

              <div className="flex flex-col gap-space-sm">
                {plan.contradicciones.map((c) => (
                  <div key={c.id} className="p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between font-label-caps text-outline mb-1 uppercase">
                      <span>Contradicción {c.id}</span>
                      <span className="text-primary font-bold">{c.referencia}</span>
                    </div>
                    <div className="font-body-md text-body-md font-semibold text-on-surface mb-1">
                      {c.entre} <span className="text-error font-normal">vs.</span> {c.contra}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      <span className="font-medium text-secondary">Resolución:</span> {c.solucion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Iniciativas propuestas</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Acciones sugeridas para cerrar las brechas de cada dimensión
                </p>
              </div>
              <div className="flex items-center gap-space-xs self-start sm:self-auto">
                <span className="font-label-caps text-outline uppercase">Ordenar:</span>
                {ORDENES.map((o) => (
                  <button
                    key={o.id}
                    className={`px-2.5 py-1 rounded font-label-md ${
                      orden === o.id
                        ? 'bg-secondary/10 text-secondary font-semibold'
                        : 'hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                    onClick={() => setOrden(o.id)}
                    type="button"
                  >
                    {o.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            {ordenadas.map((ini) => {
              const dim = dimensionDe(ini.dimensionId)
              const activa = seleccion.includes(ini.id)
              return (
                <article
                  key={ini.id}
                  className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {activa && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-tertiary"></div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm mb-space-sm">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps uppercase">
                          Dimensión {String(dim.numero).padStart(2, '0')} · {dim.nombre}
                        </span>
                        {ini.focoCritico && (
                          <span className="px-2.5 py-0.5 rounded-full bg-error-container/50 text-on-error-container font-label-caps uppercase font-bold">
                            Foco crítico
                          </span>
                        )}
                        {ini.opcional && (
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps uppercase">
                            Opcional
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface">{ini.titulo}</h3>
                    </div>

                    <span className="inline-flex items-center gap-1 text-tertiary font-headline-sm font-bold bg-tertiary/10 px-2.5 py-1 rounded-lg shrink-0">
                      +{ini.impactoDimension} pts{' '}
                      <span className="font-label-caps font-normal text-on-surface-variant">
                        (+{ini.impactoGlobal} global)
                      </span>
                    </span>
                  </div>

                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">{ini.descripcion}</p>

                  <div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs font-body-sm">
                    <div className="flex items-center gap-space-xs text-primary">
                      <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      <span className="font-semibold">Principio aplicado:</span>
                      <span className="text-on-surface">{ini.principio}</span>
                    </div>
                    <div className="text-on-surface font-medium">
                      Plazo: <strong className="font-semibold">{ini.semanas} semanas</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-space-xs">
                    <div className="flex items-center gap-space-xs text-body-sm text-outline">
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      <span>
                        {dim.nombre}: {dim.puntaje} → {(dim.puntaje + ini.impactoDimension).toFixed(1)} pts
                      </span>
                    </div>

                    <button
                      className={`inline-flex items-center gap-space-xs px-4 py-2 rounded-lg font-label-lg transition-transform active:scale-95 ${
                        activa
                          ? 'bg-tertiary text-on-tertiary shadow-sm'
                          : 'bg-surface-container-high text-primary hover:bg-secondary-container hover:text-on-secondary-container'
                      }`}
                      onClick={() => alternar(ini.id)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {activa ? 'check_circle' : 'add_circle'}
                      </span>
                      {activa ? 'En la hoja de ruta' : 'Agregar a la hoja de ruta'}
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        </div>

        <aside
          aria-label="Resumen de la hoja de ruta seleccionada"
          className="fixed bottom-4 left-4 right-4 max-w-7xl mx-auto z-50"
        >
          <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-space-md shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">playlist_add_check</span>
                </div>
                <div>
                  <span className="block font-label-caps text-outline uppercase">Selección</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {elegidas.length} de {plan.iniciativas.length}{' '}
                    <span className="font-normal text-body-sm text-outline">iniciativas</span>
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-surface-container-highest hidden sm:block"></div>

              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
                <div>
                  <span className="block font-label-caps text-outline uppercase">Impacto estimado</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary font-bold">
                    +{impactoGlobal.toFixed(1)} pts{' '}
                    <span className="text-on-surface font-normal text-body-sm">
                      ({plan.indiceActual} → {proyectado.toFixed(1)})
                    </span>
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-surface-container-highest hidden sm:block"></div>

              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">date_range</span>
                </div>
                <div>
                  <span className="block font-label-caps text-outline uppercase">Plazo total</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {plazoTotal} semanas{' '}
                    <span className="text-outline font-normal text-body-sm">(fases en paralelo)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <Link
                className="inline-flex items-center gap-space-xs px-4 py-2.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container-high font-label-lg transition-colors"
                to="/historial"
              >
                <span>Ver evolución</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <button
                className="inline-flex items-center gap-space-xs px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg transition-transform active:scale-95 shadow-md hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={elegidas.length === 0}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                Aprobar hoja de ruta
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
