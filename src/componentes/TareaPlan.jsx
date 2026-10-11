import { ETIQUETA_ESTADO, estadoDe, estaVencida, formatearFechaLimite } from '../servicios/plan'

const ESTILO_ESTADO = {
  pendiente: 'bg-surface-container text-on-surface-variant',
  en_curso: 'bg-secondary/10 text-secondary',
  completada: 'bg-tertiary/10 text-tertiary',
}

export function ChipEstadoTarea({ tarea }) {
  const estado = estadoDe(tarea)
  return (
    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold ${ESTILO_ESTADO[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}

// Fecha límite de una tarea; se marca cuando venció sin completarse.
export function FechaLimite({ tarea }) {
  const texto = formatearFechaLimite(tarea.fecha_limite)
  if (!texto) return null
  const vencida = estaVencida(tarea)
  return (
    <span className={`font-label-caps text-label-caps ${vencida ? 'text-error font-bold' : 'text-outline'}`}>
      {vencida ? 'Vencida · ' : 'Para el '}
      {texto}
    </span>
  )
}

export function BarraDeProgreso({ completadas, total, etiqueta }) {
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100)
  return (
    <div aria-label={etiqueta} className="h-2 rounded-full bg-surface-container overflow-hidden" role="img">
      <div className="h-full bg-primary" style={{ width: `${porcentaje}%` }}></div>
    </div>
  )
}
