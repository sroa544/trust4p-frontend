import { Link } from 'react-router-dom'
import {
  ETIQUETA_ORIGEN,
  LIENZO_BLOQUES,
  dimensionesDelResultado,
  nivelDe,
  ordenarRecomendaciones,
} from '../servicios/resultados'
import { formatearFecha, numero } from '../servicios/validaciones'

const PALETA = [
  { texto: 'text-tertiary', barra: 'bg-tertiary-container', acento: 'bg-tertiary-fixed-dim', chip: 'bg-tertiary-fixed/30 text-on-tertiary-fixed', svg: '#234a15' },
  { texto: 'text-primary', barra: 'bg-primary-container', acento: 'bg-primary', chip: 'bg-primary-fixed text-on-primary-fixed', svg: '#00465c' },
  { texto: 'text-secondary', barra: 'bg-secondary', acento: 'bg-secondary', chip: 'bg-secondary-fixed text-on-secondary-fixed', svg: '#006877' },
  { texto: 'text-error', barra: 'bg-error', acento: 'bg-error', chip: 'bg-error-container text-on-error-container', svg: '#ba1a1a' },
]

const CENTRO_X = 210
const CENTRO_Y = 200
const RADIO = 140

function coordenada(porcentaje, indice, total, radio = RADIO) {
  const rad = ((-90 + (360 / total) * indice) * Math.PI) / 180
  const r = radio * (porcentaje / 100)
  return { x: CENTRO_X + r * Math.cos(rad), y: CENTRO_Y + r * Math.sin(rad) }
}

function anillo(porcentaje, total) {
  return Array.from({ length: total }, (_, i) => {
    const { x, y } = coordenada(porcentaje, i, total)
    return `${x},${y}`
  }).join(' ')
}

// Cuerpo del informe de un diagnóstico con resultado (HU-013 a HU-017). Lo usan
// el representante (su empresa) y el consultor (empresas asignadas).
export default function ContenidoInforme({ diagnostico, cuestionario, acciones = null, conEnlacePlan = true }) {
  const resultado = diagnostico.resultado
  const dimensiones = dimensionesDelResultado(diagnostico, cuestionario)
  const nivel = nivelDe(Number(resultado.indice_global), cuestionario.niveles)
  const indice = Number(resultado.indice_global)
  const escalaMax = Number(cuestionario.escala_max)
  const porcentajeIndice = Math.max(0, Math.min(100, (indice / escalaMax) * 100))
  const fuerte = dimensiones.reduce((a, b) => (a.puntaje >= b.puntaje ? a : b))
  const critica = dimensiones.reduce((a, b) => (a.puntaje <= b.puntaje ? a : b))
  const poligono = dimensiones
    .map((d, i) => {
      const { x, y } = coordenada(d.porcentaje, i, dimensiones.length)
      return `${x},${y}`
    })
    .join(' ')
  const recomendaciones = ordenarRecomendaciones(diagnostico.recomendaciones)
  const lienzo = resultado.lienzo_negocio
  const sinNarrativa = !resultado.sintesis
  const fecha = diagnostico.evaluado_en ?? diagnostico.completado_en ?? diagnostico.iniciado_en

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto gap-space-lg">
      {diagnostico.estado === 'fallido' && (
        <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 flex items-center gap-2" role="alert">
          <span className="material-symbols-outlined text-base">warning</span>
          <span className="font-label-md text-label-md">
            La interpretación del agente no estuvo disponible. El índice y los puntajes por
            dimensión sí se calcularon y son válidos; la evaluación narrativa queda pendiente.
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
                Modelo v{cuestionario.modelo_version}
              </span>
            </div>
          </div>
          {acciones && <div className="flex items-center flex-wrap gap-space-sm ml-auto">{acciones}</div>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Empresa</span>
            <span className="font-label-lg text-label-lg text-on-surface truncate">{diagnostico.empresa_nombre}</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Diagnóstico</span>
            <span className="font-label-lg text-label-lg text-on-surface">N.° {diagnostico.consecutivo}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant capitalize">{diagnostico.estado}</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Fecha</span>
            <span className="font-label-lg text-label-lg text-on-surface">{formatearFecha(fecha)}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {diagnostico.respuestas.length} respuestas registradas
            </span>
          </div>
          <div className="bg-primary-container text-on-primary-container p-3 rounded-lg flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase tracking-wider opacity-80">Nivel global</span>
            <span className="font-headline-sm text-headline-sm font-bold">
              Nivel {resultado.nivel}: {nivel?.nombre}
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
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Madurez global</span>
                <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mt-1">Índice sintético de madurez</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-label-caps bg-tertiary-fixed/40 text-on-tertiary-fixed">
                Nivel {resultado.nivel}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-display-hero text-display-hero text-primary font-bold tracking-tight" data-testid="indice-global">
                {numero(indice)}
              </span>
              <span className="font-headline-lg text-headline-lg text-outline">/ {escalaMax}</span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 mb-6">
              <div className="mb-2 font-label-md text-label-md text-on-surface font-semibold">
                Posición en la escala de madurez
              </div>
              <div className="relative h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-container via-secondary to-primary rounded-full transition-all duration-1000"
                  style={{ width: `${porcentajeIndice}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-outline mt-1 font-label-caps">
                {[...cuestionario.niveles].sort((a, b) => a.numero - b.numero).map((n) => (
                  <span key={n.numero}>N{n.numero} {n.nombre}</span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low/50 rounded-lg p-4">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-1">Descripción del nivel</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{resultado.nivel_descripcion}</p>
              <h4 className="font-headline-sm text-headline-sm text-primary mt-4 mb-1">Síntesis del diagnóstico</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {sinNarrativa ? 'La síntesis del agente todavía no está disponible.' : resultado.sintesis}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 bg-surface-container-low/40 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface">{diagnostico.respuestas.length}</div>
                <div className="font-label-caps text-label-caps text-outline">Respuestas</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-tertiary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">trending_up</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface">{fuerte.nombre}</div>
                <div className="font-label-caps text-label-caps text-outline">Mayor puntaje ({numero(fuerte.puntaje)})</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-error flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">flag</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface">{critica.nombre}</div>
                <div className="font-label-caps text-label-caps text-outline">Menor puntaje ({numero(critica.puntaje)})</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Distribución por dimensión</span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Radar de madurez</h3>
          </div>

          <div className="w-full flex items-center justify-center py-2">
            <svg aria-label="Radar de madurez por dimensión" className="w-full max-w-[380px] h-auto overflow-visible select-none" viewBox="0 0 420 400">
              <defs>
                <radialGradient cx="50%" cy="50%" id="radarGlow" r="50%">
                  <stop offset="0%" stopColor="#9aecfe" stopOpacity="0.35"></stop>
                  <stop offset="100%" stopColor="#125f79" stopOpacity="0.05"></stop>
                </radialGradient>
              </defs>
              {[100, 75, 50, 25].map((p) => (
                <polygon key={p} fill="none" points={anillo(p, dimensiones.length)} stroke="#e5e2e1" strokeWidth="1.5" />
              ))}
              {dimensiones.map((d, i) => {
                const { x, y } = coordenada(100, i, dimensiones.length)
                return <line key={d.id} stroke="#dcd9d9" strokeWidth="1.5" x1={CENTRO_X} x2={x} y1={CENTRO_Y} y2={y} />
              })}
              <polygon fill="url(#radarGlow)" points={poligono} stroke="#006877" strokeWidth="3" />
              {dimensiones.map((d, i) => {
                const { x, y } = coordenada(d.porcentaje, i, dimensiones.length)
                return <circle key={d.id} cx={x} cy={y} fill={PALETA[i % PALETA.length].svg} r="5" stroke="#ffffff" strokeWidth="2" />
              })}
              {dimensiones.map((d, i) => {
                const { x, y } = coordenada(118, i, dimensiones.length)
                return (
                  <text key={d.id} fill="#00465c" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" textAnchor="middle" x={x} y={y}>
                    {d.nombre.toUpperCase()}: {numero(d.puntaje)}
                  </text>
                )
              })}
            </svg>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Fortaleza: {fuerte.nombre}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              Foco: {critica.nombre}
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-space-md">
        <div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Detalle por componentes</span>
          <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold">Desglose de las dimensiones</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {dimensiones.map((d, i) => {
            const color = PALETA[i % PALETA.length]
            const esCritica = d.id === critica.id
            return (
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow" key={d.id}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${color.acento}`}></div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-caps text-label-caps text-outline">DIMENSIÓN {String(d.numero).padStart(2, '0')}</span>
                    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${esCritica ? 'bg-error-container text-on-error-container' : color.chip}`}>
                      {esCritica ? 'Foco principal' : `Nivel ${d.nivel?.numero}`}
                    </span>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-surface font-bold">{d.nombre}</h4>
                  {d.subtitulo && <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{d.subtitulo}</p>}

                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className={`font-headline-xl text-headline-xl font-bold ${color.texto}`}>
                      {numero(d.puntaje)}
                      <span className="text-label-md text-outline font-normal">/{escalaMax}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full ${color.barra}`} style={{ width: `${d.porcentaje}%` }}></div>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-lg mb-3">
                    <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold block mb-1">Hallazgo</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {d.observacion ?? 'Observación del agente pendiente.'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Perfil de cultura</span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-3">Cultura de innovación</h3>
          <span className="inline-block font-display-hero text-headline-xl text-primary font-bold tracking-widest bg-primary/10 px-4 py-1 rounded-lg" data-testid="perfil-codigo">
            {resultado.perfil_cultura.codigo}
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-3">
            {resultado.perfil_cultura.descripcion ?? 'La descripción del perfil todavía no está disponible.'}
          </p>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Modelo de negocio</span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-3">Lienzo de la organización</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LIENZO_BLOQUES.map((bloque) => (
              <div className="bg-surface-container-low p-3 rounded-lg" key={bloque.clave}>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold block mb-1">{bloque.titulo}</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {lienzo?.[bloque.clave] || 'No determinado'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">route</span>
            </div>
            <div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">Siguiente paso</span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Recomendaciones para el cierre de brechas</h3>
            </div>
          </div>
          {diagnostico.id && conEnlacePlan && (
            <Link className="font-label-lg text-label-lg text-primary font-semibold" to={`/plan/${diagnostico.id}`}>
              Ver el plan de mejora
            </Link>
          )}
        </div>

        {recomendaciones.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            Todavía no hay recomendaciones registradas para este diagnóstico.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {recomendaciones.map((r, i) => (
              <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-2" key={`${r.titulo}-${i}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-label-caps text-label-caps text-primary font-bold">
                    {dimensiones.find((d) => d.id === r.dimension_codigo)?.nombre ?? 'General'}
                  </span>
                  <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                    {ETIQUETA_ORIGEN[r.origen] ?? r.origen}
                    {r.origen === 'consultor' && r.autor_nombre ? ` · ${r.autor_nombre}` : ''}
                  </span>
                </div>
                {r.visible === false && (
                  <span className="self-start font-label-caps text-label-caps bg-secondary-container/50 px-2 py-0.5 rounded-full">
                    Aún no compartida con la empresa
                  </span>
                )}
                <h5 className="font-headline-sm text-headline-sm text-on-surface">{r.titulo}</h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{r.contenido}</p>
                <span className="font-label-caps text-label-caps text-outline">{formatearFecha(r.creado_en)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
