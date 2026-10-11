import { BarraDeProgreso, ChipEstadoTarea, FechaLimite } from './TareaPlan.jsx'
import { agruparPorNivel, nombreDeNivel } from '../servicios/plan'

// Vista de la empresa del plan de mejora: las tareas que su consultor gestiona,
// agrupadas por el nivel de madurez al que llevan. Solo lectura.
export default function RutaDeMejora({ diagnostico, cuestionario }) {
  const grupos = agruparPorNivel(diagnostico)
  if (grupos.length === 0) return null
  const niveles = cuestionario.niveles
  const nivelDelDiagnostico = diagnostico.resultado.nivel
  const actual = diagnostico.nivel_alcanzado ?? nivelDelDiagnostico
  const etiqueta = (n) => (nombreDeNivel(niveles, n) ? `${n} · ${nombreDeNivel(niveles, n)}` : String(n))

  return (
    <section className="flex flex-col gap-space-md" data-testid="ruta-de-mejora">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold">Su ruta de mejora</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Estas tareas lo llevan al siguiente nivel de madurez. Su consultor las gestiona y confirma cuándo alcanzan cada nivel.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-wrap items-center gap-space-lg">
        <div>
          <span className="font-label-caps text-label-caps text-outline uppercase">Nivel actual</span>
          <div className="font-headline-md text-headline-md font-bold text-primary">{etiqueta(actual)}</div>
        </div>
        {actual > nivelDelDiagnostico && (
          <div>
            <span className="font-label-caps text-label-caps text-outline uppercase">Nivel del diagnóstico</span>
            <div className="font-headline-sm text-headline-sm">{etiqueta(nivelDelDiagnostico)}</div>
          </div>
        )}
      </div>

      {diagnostico.nuevo_diagnostico_recomendado && (
        <p className="bg-secondary-container/40 text-on-surface rounded-md p-3 font-body-md text-body-md" data-testid="aviso-nuevo-diagnostico">
          Su empresa avanzó {diagnostico.niveles_para_nuevo_diagnostico} niveles desde este diagnóstico. Se recomienda realizar uno nuevo
          para medir su progreso real
          {diagnostico.estado === 'cerrado'
            ? ': ya puede iniciarlo desde Diagnóstico.'
            : '; cuando su consultor cierre este, podrá iniciarlo desde Diagnóstico.'}
        </p>
      )}

      {grupos.map((grupo) => {
        const alcanzado = grupo.nivel <= actual
        const contenido = (
          <ul className="flex flex-col gap-2 mt-2">
            {grupo.tareas.map((tarea) => (
              <li className="bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-1" key={tarea.id ?? tarea.titulo}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm">{tarea.titulo}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <FechaLimite tarea={tarea} />
                    <ChipEstadoTarea tarea={tarea} />
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{tarea.contenido}</p>
              </li>
            ))}
          </ul>
        )
        const encabezado = (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-headline-md text-headline-md font-bold">Para llegar al nivel {etiqueta(grupo.nivel)}</h3>
              <span className="font-label-lg text-label-lg text-on-surface-variant">
                {alcanzado ? 'Nivel alcanzado · ' : ''}
                {grupo.completadas} de {grupo.total} completadas
              </span>
            </div>
            <BarraDeProgreso completadas={grupo.completadas} etiqueta={`Progreso hacia el nivel ${grupo.nivel}`} total={grupo.total} />
          </div>
        )
        return alcanzado ? (
          <details className="bg-surface-container-low/60 rounded-xl p-space-md" key={grupo.nivel}>
            <summary className="cursor-pointer list-none flex items-start gap-2 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="material-symbols-outlined text-outline">expand_more</span>
              <div className="flex-1">{encabezado}</div>
            </summary>
            {contenido}
          </details>
        ) : (
          <article className="bg-surface-container-low/60 rounded-xl p-space-md" key={grupo.nivel}>
            {encabezado}
            {contenido}
          </article>
        )
      })}
    </section>
  )
}
