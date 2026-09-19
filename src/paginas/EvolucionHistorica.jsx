import { Link } from 'react-router-dom'
import { EVOLUCION_HISTORICA } from '../datos/evolucionHistorica'

const COLORES = {
  proposito: { svg: '#234a15', texto: 'text-tertiary', fondo: 'bg-tertiary', chip: 'bg-tertiary-fixed/30 text-on-tertiary-fixed' },
  procesos: { svg: '#00465c', texto: 'text-primary', fondo: 'bg-primary', chip: 'bg-primary-fixed text-on-primary-fixed' },
  personas: { svg: '#006877', texto: 'text-secondary', fondo: 'bg-secondary', chip: 'bg-secondary-fixed text-on-secondary-fixed' },
  plataforma: { svg: '#ba1a1a', texto: 'text-error', fondo: 'bg-error', chip: 'bg-error-container text-on-error-container' },
}

const ANCHO = 740
const IZQ = 70
const DER = 710
const ARRIBA = 15
const ABAJO = 255

function coordenadaY(valor) {
  return ABAJO - (valor / 100) * (ABAJO - ARRIBA)
}

function coordenadaX(indice, total) {
  const util = DER - IZQ - 100
  return IZQ + 50 + (indice * util) / (total - 1)
}

export default function EvolucionHistorica() {
  const datos = EVOLUCION_HISTORICA
  const periodos = datos.periodos
  const total = periodos.length
  const reales = periodos.filter((p) => !p.proyectado)
  const actual = reales[reales.length - 1]
  const anterior = reales[reales.length - 2]
  const base = periodos[0]
  const meta = periodos[total - 1]

  const variacionAnual = actual.indice - anterior.indice
  const variacionTotal = actual.indice - base.indice
  const nivelActual = datos.niveles.find((n) => actual.indice >= n.desde && actual.indice <= n.hasta)
  const nivelMeta = datos.niveles.find((n) => meta.indice >= n.desde && meta.indice <= n.hasta)

  const aceleracion = datos.dimensiones
    .map((d) => ({ ...d, ganancia: actual.puntajes[d.id] - base.puntajes[d.id] }))
    .sort((a, b) => b.ganancia - a.ganancia)[0]

  const rezagada = datos.dimensiones
    .map((d) => ({ ...d, brecha: meta.puntajes[d.id] - actual.puntajes[d.id] }))
    .sort((a, b) => b.brecha - a.brecha)[0]

  function trazo(obtener, soloReales) {
    const puntos = periodos
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (soloReales ? !p.proyectado : true))
    return puntos.map(({ p, i }) => `${coordenadaX(i, total)},${coordenadaY(obtener(p))}`).join(' ')
  }

  function trazoProyeccion(obtener) {
    const i = total - 2
    const j = total - 1
    return `${coordenadaX(i, total)},${coordenadaY(obtener(periodos[i]))} ${coordenadaX(j, total)},${coordenadaY(obtener(periodos[j]))}`
  }

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto gap-space-lg">

        {datos.borrador && (
          <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">science</span>
            <span className="font-label-md text-label-md">
              Serie histórica en borrador. Los diagnósticos anteriores y la proyección son provisionales.
            </span>
          </div>
        )}

        <header className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="max-w-3xl space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded font-label-caps uppercase tracking-wider bg-primary/10 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Análisis longitudinal
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Evolución histórica de la madurez
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Comparación de los diagnósticos de {base.anio} a {actual.anio} y proyección de la hoja de ruta
                para {meta.anio}.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-xl self-start lg:self-center">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center font-bold">
                {datos.iniciales}
              </div>
              <div>
                <div className="font-label-lg text-label-lg text-on-surface font-semibold">{datos.empresaNombre}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {reales.length} diagnósticos registrados
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-space-md pt-space-md border-t border-surface-container">
            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Índice actual ({actual.anio})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">{actual.indice}</span>
                <span className="font-body-sm text-body-sm text-outline">/ 100</span>
                <span className="ml-auto font-label-caps text-label-caps font-bold text-tertiary bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">
                  +{variacionAnual} vs {anterior.anio}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                Nivel {nivelActual.numero}: {nivelActual.nombre}
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Variación desde {base.anio}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl text-tertiary font-bold">+{variacionTotal}</span>
                <span className="font-body-sm text-body-sm text-outline">puntos</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                De {base.indice} a {actual.indice} en {reales.length - 1} ciclos
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Meta {meta.anio}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl text-error font-bold">{meta.indice}</span>
                <span className="font-body-sm text-body-sm text-outline">/ 100</span>
                <span className="ml-auto font-label-caps text-label-caps font-bold text-on-error-container bg-error-container px-1.5 py-0.5 rounded">
                  Nivel {nivelMeta.numero}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                Según la hoja de ruta aprobada
              </span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">

          <article className="xl:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-surface-container">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Trayectoria por dimensión
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Línea continua: diagnósticos realizados. Línea punteada: proyección de la hoja de ruta.
                </p>
              </div>

              <div className="relative mt-4 w-full h-[330px] select-none">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${ANCHO} 300`}>
                  {datos.niveles.map((n) => (
                    <g key={n.numero}>
                      <line
                        stroke="#e5e2e1"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                        x1={IZQ}
                        x2={DER}
                        y1={coordenadaY(n.hasta)}
                        y2={coordenadaY(n.hasta)}
                      />
                      <text
                        fill="#70787d"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="end"
                        x={IZQ - 10}
                        y={coordenadaY(n.hasta) + 4}
                      >
                        {n.hasta}
                      </text>
                      <text
                        fill="#70787d"
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="end"
                        x={DER - 5}
                        y={coordenadaY(n.hasta) + 14}
                      >
                        N{n.numero}: {n.nombre}
                      </text>
                    </g>
                  ))}

                  <line stroke="#70787d" strokeWidth="1.5" x1={IZQ} x2={DER} y1={ABAJO} y2={ABAJO} />
                  <text fill="#70787d" fontSize="10" fontWeight="600" textAnchor="end" x={IZQ - 10} y={ABAJO + 4}>
                    0
                  </text>

                  {periodos.map((p, i) => (
                    <line
                      key={p.anio}
                      stroke={p.proyectado ? '#ba1a1a' : '#f0eded'}
                      strokeDasharray={p.proyectado ? '4 4' : undefined}
                      strokeWidth={p.proyectado ? 1.5 : 2}
                      x1={coordenadaX(i, total)}
                      x2={coordenadaX(i, total)}
                      y1={ARRIBA}
                      y2={ABAJO}
                    />
                  ))}

                  {datos.dimensiones.map((d) => (
                    <g key={d.id}>
                      <polyline
                        fill="none"
                        points={trazo((p) => p.puntajes[d.id], true)}
                        stroke={COLORES[d.id].svg}
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                      <polyline
                        fill="none"
                        points={trazoProyeccion((p) => p.puntajes[d.id])}
                        stroke={COLORES[d.id].svg}
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                    </g>
                  ))}

                  <polyline
                    fill="none"
                    points={trazo((p) => p.indice, false)}
                    stroke="#1c1b1c"
                    strokeDasharray="3 3"
                    strokeWidth="2"
                  />

                  {periodos.map((p, i) =>
                    datos.dimensiones.map((d) => (
                      <circle
                        key={`${p.anio}-${d.id}`}
                        cx={coordenadaX(i, total)}
                        cy={coordenadaY(p.puntajes[d.id])}
                        fill={p.proyectado ? '#ffffff' : COLORES[d.id].svg}
                        r={p.anio === actual.anio ? 7 : 5}
                        stroke={p.proyectado ? COLORES[d.id].svg : '#ffffff'}
                        strokeWidth={p.proyectado ? 3 : 2}
                      />
                    )),
                  )}

                  {periodos.map((p, i) => (
                    <g key={`eje-${p.anio}`}>
                      <text
                        fill={p.proyectado ? '#ba1a1a' : p.anio === actual.anio ? '#00465c' : '#70787d'}
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                        x={coordenadaX(i, total)}
                        y={ABAJO + 25}
                      >
                        {p.anio}
                      </text>
                      <text
                        fill="#70787d"
                        fontSize="10"
                        fontWeight="500"
                        textAnchor="middle"
                        x={coordenadaX(i, total)}
                        y={ABAJO + 39}
                      >
                        {p.etiqueta} ({p.indice})
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 mt-3 border-t border-surface-container">
              {datos.dimensiones.map((d) => (
                <div key={d.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-low">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${COLORES[d.id].fondo}`}></span>
                  <div className="truncate">
                    <span className="font-label-md text-label-md font-bold text-on-surface block">{d.nombre}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {actual.puntajes[d.id]} pts{' '}
                      <strong className="text-tertiary">
                        (+{actual.puntajes[d.id] - anterior.puntajes[d.id]})
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-on-surface shrink-0"></span>
                <div className="truncate">
                  <span className="font-label-md text-label-md font-bold text-on-surface block">Índice global</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {actual.indice} pts <strong className="text-primary">(+{variacionTotal})</strong>
                  </span>
                </div>
              </div>
            </div>
          </article>

          <aside className="xl:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <span className="material-symbols-outlined text-primary">timeline</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Hitos por ciclo</h2>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {periodos.map((p) => (
                <div
                  key={p.anio}
                  className={`rounded-lg p-3 border ${
                    p.proyectado
                      ? 'bg-error-container/20 border-error/30'
                      : p.anio === actual.anio
                        ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                        : 'bg-surface-container-low border-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-label-lg text-label-lg font-bold ${
                        p.proyectado ? 'text-error' : p.anio === actual.anio ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {p.anio} · {p.etiqueta}
                    </span>
                    <span
                      className={`font-label-caps text-label-caps font-bold px-1.5 py-0.5 rounded ${
                        p.proyectado
                          ? 'bg-error text-on-error'
                          : p.anio === actual.anio
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {p.indice} pts
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{p.hito}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="p-space-lg border-b border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Variación por dimensión
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Puntaje de cada dimensión en los diagnósticos registrados y su meta
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface font-label-caps uppercase tracking-wider border-b border-surface-container">
                  <th className="py-3.5 px-4">Dimensión</th>
                  {periodos.map((p) => (
                    <th
                      key={p.anio}
                      className={`py-3.5 px-3 text-center ${p.proyectado ? 'text-error' : p.anio === actual.anio ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {p.anio}
                    </th>
                  ))}
                  <th className="py-3.5 px-3 text-center text-tertiary">Variación</th>
                  <th className="py-3.5 px-4">Iniciativa asociada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {datos.dimensiones.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-8 rounded-full shrink-0 ${COLORES[d.id].fondo}`}></div>
                        <div>
                          <div className="font-label-lg text-label-lg font-bold text-on-surface">
                            {d.numero}. {d.nombre}
                          </div>
                          <div className="font-body-sm text-body-sm text-outline">{d.subtitulo}</div>
                        </div>
                      </div>
                    </td>
                    {periodos.map((p) => (
                      <td
                        key={p.anio}
                        className={`py-4 px-3 text-center font-body-md text-body-md ${
                          p.proyectado
                            ? 'text-error font-bold'
                            : p.anio === actual.anio
                              ? 'text-primary font-bold'
                              : 'text-on-surface-variant'
                        }`}
                      >
                        {p.puntajes[d.id]}
                      </td>
                    ))}
                    <td className="py-4 px-3 text-center">
                      <span className="font-label-caps text-label-caps font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded">
                        +{actual.puntajes[d.id] - anterior.puntajes[d.id]} pts
                      </span>
                    </td>
                    <td className="py-4 px-4 font-body-sm text-body-sm text-on-surface-variant">
                      {datos.iniciativasPorDimension[d.id]}
                    </td>
                  </tr>
                ))}

                <tr className="bg-surface-container-low font-bold border-t-2 border-surface-container-high">
                  <td className="py-4 px-4 font-label-lg text-label-lg text-on-surface uppercase">Índice global</td>
                  {periodos.map((p) => (
                    <td
                      key={p.anio}
                      className={`py-4 px-3 text-center font-headline-sm text-headline-sm ${
                        p.proyectado ? 'text-error' : p.anio === actual.anio ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {p.indice}
                    </td>
                  ))}
                  <td className="py-4 px-3 text-center font-headline-sm text-headline-sm text-tertiary">
                    +{variacionAnual}
                  </td>
                  <td className="py-4 px-4 font-body-sm text-body-sm text-on-surface-variant">
                    Hoja de ruta {meta.anio}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase block">Mayor avance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 block">
                  {aceleracion.nombre} (+{aceleracion.ganancia} pts)
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Es la dimensión que más creció desde la línea base de {base.anio}.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-error/10 text-error shrink-0">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase block">Mayor brecha</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 block">
                  {rezagada.nombre} ({rezagada.brecha} pts)
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Es lo que falta para alcanzar la meta de {meta.anio} en esa dimensión.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-tertiary/10 text-tertiary shrink-0">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase block">Ritmo por ciclo</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 block">
                  {(variacionTotal / (reales.length - 1)).toFixed(1)} pts
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Promedio de mejora entre diagnósticos consecutivos.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              className="inline-flex items-center gap-2 px-4 py-2.5 font-label-lg text-label-lg text-on-surface bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
              to={`/plan/${datos.diagnosticoId}`}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver al plan estratégico</span>
            </Link>

            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 font-label-lg text-label-lg text-on-primary bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Descargar informe de evolución</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
