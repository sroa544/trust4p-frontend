import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { mensajeDeError } from '../servicios/api'
import { obtenerCuestionario, obtenerEvolucion } from '../servicios/diagnosticos'
import { nivelDe } from '../servicios/resultados'
import { formatearFecha, numero } from '../servicios/validaciones'

const PALETA = [
  { svg: '#234a15', fondo: 'bg-tertiary' },
  { svg: '#00465c', fondo: 'bg-primary' },
  { svg: '#006877', fondo: 'bg-secondary' },
  { svg: '#ba1a1a', fondo: 'bg-error' },
  { svg: '#6b5d00', fondo: 'bg-outline' },
]

const ANCHO = 740
const IZQ = 70
const DER = 710
const ARRIBA = 15
const ABAJO = 255

function fechaCorta(valor) {
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
}

function signo(valor) {
  const n = Number(valor)
  return `${n > 0 ? '+' : ''}${numero(n)}`
}

function useEvolucion() {
  const [estado, setEstado] = useState({ fase: 'cargando', evolucion: null, cuestionario: null, error: '' })

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        const evolucion = await obtenerEvolucion()
        const historial = [...evolucion.historial].sort((a, b) => a.consecutivo - b.consecutivo)
        if (!historial.length) {
          if (activo) setEstado({ fase: 'vacio', evolucion, cuestionario: null, error: '' })
          return
        }
        const cuestionario = await obtenerCuestionario(historial[historial.length - 1].diagnostico_id)
        if (activo) setEstado({ fase: 'listo', evolucion: { ...evolucion, historial }, cuestionario, error: '' })
      } catch (falla) {
        if (activo) setEstado({ fase: 'error', evolucion: null, cuestionario: null, error: mensajeDeError(falla) })
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  return estado
}

function Mensaje({ icono, titulo, children }) {
  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg max-w-lg text-center flex flex-col items-center gap-space-sm">
        <span className="material-symbols-outlined text-primary text-4xl">{icono}</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{titulo}</h1>
        {children}
        <Link className="font-label-md text-label-md text-primary" to="/panel">Volver al panel</Link>
      </div>
    </main>
  )
}

export default function EvolucionHistorica() {
  const { fase, evolucion, cuestionario, error } = useEvolucion()

  if (fase === 'cargando') return <Mensaje icono="hourglass_top" titulo="Cargando el historial…" />
  if (fase === 'error') {
    return (
      <Mensaje icono="error" titulo="No se pudo cargar el historial">
        <Aviso tipo="error">{error}</Aviso>
      </Mensaje>
    )
  }
  if (fase === 'vacio') {
    return (
      <Mensaje icono="timeline" titulo="Aún no hay historial">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cuando su empresa tenga diagnósticos evaluados aparecerá aquí su evolución.
        </p>
      </Mensaje>
    )
  }

  const { historial, comparacion } = evolucion
  const total = historial.length
  const escalaMin = Number(cuestionario.escala_min)
  const escalaMax = Number(cuestionario.escala_max)
  const dimensiones = [...cuestionario.dimensiones].sort((a, b) => a.orden - b.orden)
  const actual = historial[total - 1]
  const anterior = total > 1 ? historial[total - 2] : null
  const base = historial[0]
  const nivelActual = nivelDe(Number(actual.indice_global), cuestionario.niveles)
  const variacionTotal = Number(actual.indice_global) - Number(base.indice_global)

  const coordenadaY = (valor) =>
    ABAJO - ((Number(valor) - escalaMin) / (escalaMax - escalaMin)) * (ABAJO - ARRIBA)
  const coordenadaX = (i) => (total === 1 ? (IZQ + DER) / 2 : IZQ + 50 + (i * (DER - IZQ - 100)) / (total - 1))
  const trazo = (obtener) => historial.map((p, i) => `${coordenadaX(i)},${coordenadaY(obtener(p))}`).join(' ')

  const ganancias = dimensiones
    .map((d) => ({ ...d, ganancia: Number(actual.dimensiones[d.codigo] ?? 0) - Number(base.dimensiones[d.codigo] ?? 0) }))
    .sort((a, b) => b.ganancia - a.ganancia)
  const masAvance = ganancias[0]
  const menorPuntaje = [...dimensiones].sort(
    (a, b) => Number(actual.dimensiones[a.codigo] ?? 0) - Number(actual.dimensiones[b.codigo] ?? 0),
  )[0]

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto gap-space-lg">
        <header className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <div className="max-w-3xl space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded font-label-caps uppercase tracking-wider bg-primary/10 text-primary">
              Análisis longitudinal
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Evolución histórica de la madurez
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {total === 1
                ? 'Su empresa tiene un diagnóstico evaluado. La comparación aparece desde el segundo.'
                : `Comparación de los ${total} diagnósticos evaluados de su empresa, del N.° ${base.consecutivo} al N.° ${actual.consecutivo}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-space-md pt-space-md border-t border-surface-container">
            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Índice actual (N.° {actual.consecutivo})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">{numero(actual.indice_global)}</span>
                <span className="font-body-sm text-body-sm text-outline">/ {escalaMax}</span>
                {comparacion && (
                  <span className="ml-auto font-label-caps text-label-caps font-bold bg-surface-container px-1.5 py-0.5 rounded">
                    {signo(comparacion.variacion_indice_global)} vs anterior
                  </span>
                )}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                Nivel {nivelActual?.numero ?? actual.nivel}
                {nivelActual?.nombre ? `: ${nivelActual.nombre}` : ''}
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">
                Variación desde el N.° {base.consecutivo}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl text-tertiary font-bold">{signo(variacionTotal)}</span>
                <span className="font-body-sm text-body-sm text-outline">puntos</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                De {numero(base.indice_global)} a {numero(actual.indice_global)} en {total - 1}{' '}
                {total - 1 === 1 ? 'ciclo' : 'ciclos'}
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3.5">
              <span className="font-label-caps text-label-caps text-outline uppercase block">Último diagnóstico</span>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                {formatearFecha(actual.generado_en)}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">
                Versión del modelo {actual.modelo_version}
              </span>
            </div>
          </div>

          {comparacion?.advertencia && (
            <div className="mt-space-md">
              <Aviso tipo="info">{comparacion.advertencia}</Aviso>
            </div>
          )}
        </header>

        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <div className="pb-4 border-b border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Trayectoria por dimensión</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cada punto es un diagnóstico evaluado; la línea punteada es el índice global.
            </p>
          </div>

          <div className="relative mt-4 w-full h-[330px] select-none">
            <svg aria-label="Trayectoria de la madurez" className="w-full h-full overflow-visible" role="img" viewBox={`0 0 ${ANCHO} 300`}>
              {cuestionario.niveles.map((n) => (
                <g key={n.numero}>
                  <line stroke="#e5e2e1" strokeDasharray="2 2" strokeWidth="1" x1={IZQ} x2={DER} y1={coordenadaY(n.umbral_max)} y2={coordenadaY(n.umbral_max)} />
                  <text fill="#70787d" fontSize="10" fontWeight="600" textAnchor="end" x={IZQ - 10} y={coordenadaY(n.umbral_max) + 4}>
                    {numero(n.umbral_max)}
                  </text>
                  <text fill="#70787d" fontSize="9.5" fontWeight="700" textAnchor="end" x={DER - 5} y={coordenadaY(n.umbral_max) + 14}>
                    N{n.numero}: {n.nombre}
                  </text>
                </g>
              ))}
              <line stroke="#70787d" strokeWidth="1.5" x1={IZQ} x2={DER} y1={ABAJO} y2={ABAJO} />
              <text fill="#70787d" fontSize="10" fontWeight="600" textAnchor="end" x={IZQ - 10} y={ABAJO + 4}>{escalaMin}</text>

              {historial.map((p, i) => (
                <line key={p.diagnostico_id} stroke="#f0eded" strokeWidth="2" x1={coordenadaX(i)} x2={coordenadaX(i)} y1={ARRIBA} y2={ABAJO} />
              ))}

              {dimensiones.map((d, k) => (
                <g key={d.codigo}>
                  {total > 1 && (
                    <polyline fill="none" points={trazo((p) => p.dimensiones[d.codigo] ?? 0)} stroke={PALETA[k % PALETA.length].svg} strokeLinecap="round" strokeWidth="3" />
                  )}
                  {historial.map((p, i) => (
                    <circle
                      cx={coordenadaX(i)}
                      cy={coordenadaY(p.dimensiones[d.codigo] ?? 0)}
                      fill={PALETA[k % PALETA.length].svg}
                      key={`${p.diagnostico_id}-${d.codigo}`}
                      r={i === total - 1 ? 7 : 5}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              ))}

              {total > 1 && <polyline fill="none" points={trazo((p) => p.indice_global)} stroke="#1c1b1c" strokeDasharray="3 3" strokeWidth="2" />}

              {historial.map((p, i) => (
                <g key={`eje-${p.diagnostico_id}`}>
                  <text fill={i === total - 1 ? '#00465c' : '#70787d'} fontSize="12" fontWeight="700" textAnchor="middle" x={coordenadaX(i)} y={ABAJO + 25}>
                    N.° {p.consecutivo}
                  </text>
                  <text fill="#70787d" fontSize="10" fontWeight="500" textAnchor="middle" x={coordenadaX(i)} y={ABAJO + 39}>
                    {fechaCorta(p.generado_en)} ({numero(p.indice_global)})
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 mt-3 border-t border-surface-container">
            {dimensiones.map((d, k) => (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-low" key={d.codigo}>
                <span className={`w-3 h-3 rounded-full shrink-0 ${PALETA[k % PALETA.length].fondo}`}></span>
                <div className="truncate">
                  <span className="font-label-md text-label-md font-bold text-on-surface block">{d.nombre}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {numero(actual.dimensiones[d.codigo] ?? 0)} pts
                    {anterior && (
                      <strong className="ml-1 text-on-surface">
                        ({signo(Number(actual.dimensiones[d.codigo] ?? 0) - Number(anterior.dimensiones[d.codigo] ?? 0))})
                      </strong>
                    )}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-on-surface shrink-0"></span>
              <div className="truncate">
                <span className="font-label-md text-label-md font-bold text-on-surface block">Índice global</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{numero(actual.indice_global)} pts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="p-space-lg border-b border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Puntaje por diagnóstico</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Puntaje de cada dimensión en los diagnósticos evaluados y su variación respecto al anterior.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface font-label-caps uppercase tracking-wider border-b border-surface-container">
                  <th className="py-3.5 px-4">Dimensión</th>
                  {historial.map((p) => (
                    <th className="py-3.5 px-3 text-center" key={p.diagnostico_id}>N.° {p.consecutivo}</th>
                  ))}
                  {anterior && <th className="py-3.5 px-3 text-center">Variación</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {dimensiones.map((d, k) => (
                  <tr className="hover:bg-surface-container-low/60 transition-colors" key={d.codigo}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-8 rounded-full shrink-0 ${PALETA[k % PALETA.length].fondo}`}></div>
                        <div>
                          <div className="font-label-lg text-label-lg font-bold text-on-surface">{d.nombre}</div>
                          <div className="font-body-sm text-body-sm text-outline">{d.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    {historial.map((p, i) => (
                      <td
                        className={`py-4 px-3 text-center font-body-md text-body-md ${i === total - 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
                        key={p.diagnostico_id}
                      >
                        {numero(p.dimensiones[d.codigo] ?? 0)}
                      </td>
                    ))}
                    {anterior && (
                      <td className="py-4 px-3 text-center font-label-lg text-label-lg font-bold">
                        {signo(Number(actual.dimensiones[d.codigo] ?? 0) - Number(anterior.dimensiones[d.codigo] ?? 0))}
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="bg-surface-container-low font-bold border-t-2 border-surface-container-high">
                  <td className="py-4 px-4 font-label-lg text-label-lg text-on-surface uppercase">Índice global</td>
                  {historial.map((p, i) => (
                    <td className={`py-4 px-3 text-center font-headline-sm text-headline-sm ${i === total - 1 ? 'text-primary' : 'text-on-surface-variant'}`} key={p.diagnostico_id}>
                      {numero(p.indice_global)}
                    </td>
                  ))}
                  {anterior && (
                    <td className="py-4 px-3 text-center font-headline-sm text-headline-sm">
                      {signo(comparacion?.variacion_indice_global ?? Number(actual.indice_global) - Number(anterior.indice_global))}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase block">Mayor avance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 block">
                  {masAvance.nombre} ({signo(masAvance.ganancia)} pts)
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  {total === 1 ? 'Disponible desde el segundo diagnóstico.' : `Dimensión que más cambió desde el diagnóstico N.° ${base.consecutivo}.`}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-error/10 text-error shrink-0">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <div>
                <span className="font-label-caps text-label-caps text-outline uppercase block">Menor puntaje actual</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5 block">
                  {menorPuntaje.nombre} ({numero(actual.dimensiones[menorPuntaje.codigo] ?? 0)} pts)
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Es la dimensión con más margen de mejora en el último diagnóstico.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container">
            <Link
              className="inline-flex items-center gap-2 px-4 py-2.5 font-label-lg text-label-lg text-on-surface bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
              to={`/plan/${actual.diagnostico_id}`}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver al plan de mejora</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
