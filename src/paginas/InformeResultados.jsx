import { INFORME_RESULTADOS, NIVELES_MADUREZ } from '../datos/informeResultados'

const COLORES = {
  proposito: {
    texto: 'text-tertiary',
    barra: 'bg-tertiary-container',
    acento: 'bg-tertiary-fixed-dim',
    chip: 'bg-tertiary-fixed/30 text-on-tertiary-fixed',
    svg: '#234a15',
  },
  procesos: {
    texto: 'text-primary',
    barra: 'bg-primary-container',
    acento: 'bg-primary',
    chip: 'bg-primary-fixed text-on-primary-fixed',
    svg: '#00465c',
  },
  personas: {
    texto: 'text-secondary',
    barra: 'bg-secondary',
    acento: 'bg-secondary',
    chip: 'bg-secondary-fixed text-on-secondary-fixed',
    svg: '#006877',
  },
  plataforma: {
    texto: 'text-error',
    barra: 'bg-error',
    acento: 'bg-error',
    chip: 'bg-error-container text-on-error-container',
    svg: '#ba1a1a',
  },
}

const CENTRO_X = 210
const CENTRO_Y = 200
const RADIO = 140
const ANGULOS = [-90, 0, 90, 180]

function coordenada(puntaje, indice, radio = RADIO) {
  const rad = (ANGULOS[indice] * Math.PI) / 180
  const r = radio * (puntaje / 100)
  return {
    x: CENTRO_X + r * Math.cos(rad),
    y: CENTRO_Y + r * Math.sin(rad),
  }
}

function anillo(porcentaje) {
  return ANGULOS.map((_, i) => {
    const { x, y } = coordenada(porcentaje, i)
    return `${x},${y}`
  }).join(' ')
}

export default function InformeResultados() {
  const informe = INFORME_RESULTADOS
  const critica = informe.dimensiones.reduce((a, b) => (a.puntaje <= b.puntaje ? a : b))
  const fuerte = informe.dimensiones.reduce((a, b) => (a.puntaje >= b.puntaje ? a : b))

  const poligono = informe.dimensiones
    .map((d, i) => {
      const { x, y } = coordenada(d.puntaje, i)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto gap-space-lg">

        {informe.borrador && (
          <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">science</span>
            <span className="font-label-md text-label-md">
              Informe en borrador. Los puntajes provienen de un modelo de diagnóstico provisional.
            </span>
          </div>
        )}

        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span>Diagnóstico de innovación</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-semibold text-primary">Informe de resultados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Índice de madurez de innovación
                </span>
                <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-2 py-0.5 rounded-full">
                  Modelo v{informe.modeloVersion}
                </span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-space-sm ml-auto">
              <button
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-primary font-label-lg text-label-lg px-4 py-2.5 rounded-lg transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Descargar informe</span>
              </button>
              <div className="flex items-center gap-3 bg-surface-container-low py-1.5 px-3 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm">
                  {informe.iniciales}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                    {informe.usuario}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                    {informe.cargo} · {informe.empresaNombre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Empresa</span>
              <span className="font-label-lg text-label-lg text-on-surface truncate">{informe.empresaNombre}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">NIT {informe.empresaNit}</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Diagnóstico</span>
              <span className="font-label-lg text-label-lg text-on-surface">{informe.diagnosticoId}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{informe.empresaId}</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Fecha de emisión
              </span>
              <span className="font-label-lg text-label-lg text-on-surface">{informe.fechaEmision}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {informe.preguntasRespondidas} de {informe.preguntasTotales} preguntas
              </span>
            </div>
            <div className="bg-primary-container text-on-primary-container p-3 rounded-lg flex flex-col justify-between">
              <span className="font-label-caps text-label-caps uppercase tracking-wider opacity-80">Nivel global</span>
              <span className="font-headline-sm text-headline-sm font-bold">
                Nivel {informe.nivel.numero}: {informe.nivel.nombre}
              </span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-tertiary-fixed-dim to-primary"></div>

            <div>
              <div className="flex items-start justify-between gap-space-md mb-space-md">
                <div>
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Madurez global
                  </span>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mt-1">
                    Índice sintético de madurez
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-label-caps bg-tertiary-fixed/40 text-on-tertiary-fixed">
                  Nivel {informe.nivel.numero}
                </span>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-display-hero text-display-hero text-primary font-bold tracking-tight">
                  {informe.indiceGlobal}
                </span>
                <span className="font-headline-lg text-headline-lg text-outline">/ 100</span>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2 font-label-md text-label-md">
                  <span className="text-on-surface font-semibold">Posición en la escala de madurez</span>
                </div>
                <div className="relative h-3 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-container via-secondary to-primary rounded-full transition-all duration-1000"
                    style={{ width: `${informe.indiceGlobal}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline mt-1 font-label-caps">
                  {NIVELES_MADUREZ.map((n) => (
                    <span key={n.numero}>
                      N{n.numero} {n.nombre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low/50 rounded-lg p-4">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-1">Síntesis del diagnóstico</h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{informe.sintesis}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 bg-surface-container-low/40 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">fact_check</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">
                    {informe.preguntasRespondidas} / {informe.preguntasTotales}
                  </div>
                  <div className="font-label-caps text-label-caps text-outline">Preguntas respondidas</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-tertiary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">{fuerte.nombre}</div>
                  <div className="font-label-caps text-label-caps text-outline">Mayor puntaje ({fuerte.puntaje})</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-error flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">flag</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">{critica.nombre}</div>
                  <div className="font-label-caps text-label-caps text-outline">Menor puntaje ({critica.puntaje})</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Distribución por dimensión
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Radar de madurez</h3>
            </div>

            <div className="w-full flex items-center justify-center py-2">
              <svg
                aria-label="Radar de madurez por dimensión"
                className="w-full max-w-[380px] h-auto overflow-visible select-none"
                viewBox="0 0 420 400"
              >
                <defs>
                  <radialGradient cx="50%" cy="50%" id="radarGlow" r="50%">
                    <stop offset="0%" stopColor="#9aecfe" stopOpacity="0.35"></stop>
                    <stop offset="100%" stopColor="#125f79" stopOpacity="0.05"></stop>
                  </radialGradient>
                </defs>

                {[100, 75, 50, 25].map((p) => (
                  <polygon key={p} fill="none" points={anillo(p)} stroke="#e5e2e1" strokeWidth="1.5" />
                ))}

                <line stroke="#dcd9d9" strokeWidth="1.5" x1="210" x2="210" y1="60" y2="340" />
                <line stroke="#dcd9d9" strokeWidth="1.5" x1="70" x2="350" y1="200" y2="200" />

                <polygon fill="url(#radarGlow)" points={poligono} stroke="#006877" strokeWidth="3" />

                {informe.dimensiones.map((d, i) => {
                  const { x, y } = coordenada(d.puntaje, i)
                  return (
                    <circle key={d.id} cx={x} cy={y} fill={COLORES[d.id].svg} r="5" stroke="#ffffff" strokeWidth="2" />
                  )
                })}

                {informe.dimensiones.map((d, i) => {
                  const { x, y } = coordenada(118, i)
                  return (
                    <text
                      key={d.id}
                      fill="#00465c"
                      fontFamily="Plus Jakarta Sans"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      x={x}
                      y={y}
                    >
                      {d.nombre.toUpperCase()}: {d.puntaje}
                    </text>
                  )
                })}
              </svg>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Fortaleza: {fuerte.nombre} ({fuerte.puntaje})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                Foco: {critica.nombre} ({critica.puntaje})
              </span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Detalle por componentes
              </span>
              <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                Desglose de las dimensiones
              </h3>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant hidden md:inline-block">
              Escala normalizada sobre 100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {informe.dimensiones.map((d) => {
              const color = COLORES[d.id]
              const esCritica = d.id === critica.id
              return (
                <div
                  key={d.id}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${color.acento}`}></div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label-caps text-label-caps text-outline">
                        DIMENSIÓN {String(d.numero).padStart(2, '0')}
                      </span>
                      <span
                        className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${
                          esCritica ? 'bg-error-container text-on-error-container' : color.chip
                        }`}
                      >
                        {esCritica ? 'Foco principal' : `Nivel ${d.nivel}`}
                      </span>
                    </div>

                    <h4 className="font-headline-md text-headline-md text-on-surface font-bold">{d.nombre}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{d.subtitulo}</p>

                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className={`font-headline-xl text-headline-xl font-bold ${color.texto}`}>
                        {d.puntaje}
                        <span className="text-label-md text-outline font-normal">/100</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden mb-4">
                      <div className={`h-full rounded-full ${color.barra}`} style={{ width: `${d.puntaje}%` }}></div>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-lg mb-3">
                      <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold block mb-1">
                        Hallazgo
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{d.hallazgo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className={`material-symbols-outlined text-base shrink-0 ${color.texto}`}>task_alt</span>
                    <span className="truncate" title={d.evidencia}>
                      {d.evidencia}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">route</span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                Siguiente paso
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Recomendaciones para el cierre de brechas
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {informe.recomendaciones.map((r) => (
              <div key={r.id} className="bg-surface-container-lowest p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-caps text-label-caps text-primary font-bold">{r.dimension}</span>
                    <span className="font-label-caps text-label-caps bg-surface-container text-on-surface px-2 py-0.5 rounded">
                      Impacto {r.impacto}
                    </span>
                  </div>
                  <h5 className="font-headline-sm text-headline-sm text-on-surface mb-1">{r.titulo}</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{r.descripcion}</p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between font-label-md text-label-md text-outline">
                  <span>Esfuerzo: {r.esfuerzoSemanas} semanas</span>
                  <span className="text-primary font-semibold">{r.efecto}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
