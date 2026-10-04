import { Link, useParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { useResultado } from '../hooks/useResultado'
import {
  ETIQUETA_ORIGEN,
  dimensionesDelResultado,
  ordenarRecomendaciones,
} from '../servicios/resultados'
import { formatearFecha, numero } from '../servicios/validaciones'

const SEVERIDAD = {
  bien: { etiqueta: 'Fortaleza', punto: 'bg-tertiary', chip: 'bg-tertiary/10 text-tertiary', fondo: 'bg-surface-container-low/60' },
  medio: { etiqueta: 'En consolidación', punto: 'bg-secondary', chip: 'bg-secondary/10 text-secondary', fondo: 'bg-surface-container-low/60' },
  critico: { etiqueta: 'Foco de mejora', punto: 'bg-error', chip: 'bg-error/15 text-error', fondo: 'bg-error-container/20' },
}

// Severidad según qué tan cerca está el nivel de la dimensión del nivel máximo
// de la rúbrica de la versión aplicada.
function severidadDe(dimension, niveles) {
  const maximo = Math.max(...niveles.map((n) => n.numero))
  const razon = (dimension.nivel?.numero ?? 0) / maximo
  if (razon >= 1) return 'bien'
  if (razon >= 0.75) return 'medio'
  return 'critico'
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

export default function PlanEstrategico() {
  const { id } = useParams()
  const { fase, diagnostico, cuestionario, error } = useResultado(id)

  if (fase === 'cargando') return <Mensaje icono="hourglass_top" titulo="Cargando el plan…" />
  if (fase === 'error') {
    return (
      <Mensaje icono="error" titulo="No se pudo cargar el plan">
        <Aviso tipo="error">{error}</Aviso>
      </Mensaje>
    )
  }
  if (fase !== 'listo') {
    return (
      <Mensaje icono="pending_actions" titulo="Aún no hay un plan de mejora">
        <p className="font-body-md text-body-md text-on-surface-variant">
          El plan se construye a partir del resultado de un diagnóstico evaluado.
        </p>
      </Mensaje>
    )
  }

  const dimensiones = dimensionesDelResultado(diagnostico, cuestionario)
  const recomendaciones = ordenarRecomendaciones(diagnostico.recomendaciones)
  const generales = recomendaciones.filter(
    (r) => !dimensiones.some((d) => d.id === r.dimension_codigo),
  )
  const escalaMax = Number(cuestionario.escala_max)

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto pb-32 text-on-surface gap-space-lg">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-wrap items-center justify-between gap-space-md">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Plan de mejora · Diagnóstico N.° {diagnostico.consecutivo}
            </span>
            <h1 className="font-headline-xl text-headline-xl font-bold">{diagnostico.empresa_nombre}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Índice actual {numero(diagnostico.resultado.indice_global)} / {escalaMax} · Nivel{' '}
              {diagnostico.resultado.nivel}
            </p>
          </div>
          <Link className="font-label-lg text-label-lg text-primary font-semibold" to={`/resultados/${diagnostico.id}`}>
            Ver el informe de resultados
          </Link>
        </header>

        <section className="flex flex-col gap-space-md">
          <h2 className="font-headline-lg text-headline-lg font-bold">Estado y siguiente paso por dimensión</h2>

          {dimensiones.map((d) => {
            const sev = SEVERIDAD[severidadDe(d, cuestionario.niveles)]
            const propias = recomendaciones.filter((r) => r.dimension_codigo === d.id)
            return (
              <article className={`rounded-xl p-space-md shadow-sm ${sev.fondo}`} key={d.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${sev.punto}`}></span>
                    <h3 className="font-headline-md text-headline-md font-bold">{d.nombre}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${sev.chip}`}>
                      {sev.etiqueta}
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface-variant">
                      {numero(d.puntaje)} / {escalaMax} · Nivel {d.nivel?.numero}
                    </span>
                  </div>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant mb-3">
                  {d.observacion ?? 'La observación del agente para esta dimensión todavía no está disponible.'}
                </p>

                {propias.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-outline">Sin recomendaciones específicas para esta dimensión.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {propias.map((r, i) => (
                      <li className="bg-surface-container-lowest rounded-lg p-3" key={`${r.titulo}-${i}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-headline-sm text-headline-sm">{r.titulo}</span>
                          <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                            {ETIQUETA_ORIGEN[r.origen] ?? r.origen}
                            {r.origen === 'consultor' && r.autor_nombre ? ` · ${r.autor_nombre}` : ''}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{r.contenido}</p>
                        <span className="font-label-caps text-label-caps text-outline">{formatearFecha(r.creado_en)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </section>

        {generales.length > 0 && (
          <section className="flex flex-col gap-space-sm">
            <h2 className="font-headline-lg text-headline-lg font-bold">Recomendaciones generales</h2>
            {generales.map((r, i) => (
              <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm" key={`${r.titulo}-${i}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-headline-sm text-headline-sm">{r.titulo}</h3>
                  <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                    {ETIQUETA_ORIGEN[r.origen] ?? r.origen}
                    {r.origen === 'consultor' && r.autor_nombre ? ` · ${r.autor_nombre}` : ''}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{r.contenido}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
