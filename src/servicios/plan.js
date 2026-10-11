// Plan de mejora: cada recomendación es una tarea con estado, fecha límite y el
// nivel de madurez que ayuda a alcanzar. Los datos tolerantes a lo que aún no
// traiga el servidor (diagnósticos anteriores) se completan aquí.

export const ESTADOS_TAREA = [
  { valor: 'pendiente', texto: 'Pendiente' },
  { valor: 'en_curso', texto: 'En curso' },
  { valor: 'completada', texto: 'Completada' },
]

export const ETIQUETA_ESTADO = Object.fromEntries(ESTADOS_TAREA.map((e) => [e.valor, e.texto]))

export const estadoDe = (tarea) => tarea.estado ?? 'pendiente'

// 'AAAA-MM-DD' como fecha local: new Date('2026-12-01') es medianoche UTC y en
// Colombia mostraría el día anterior.
export function fechaLocal(texto) {
  if (!texto) return null
  const [anio, mes, dia] = String(texto).slice(0, 10).split('-').map(Number)
  if (!anio || !mes || !dia) return null
  return new Date(anio, mes - 1, dia)
}

export function formatearFechaLimite(texto) {
  const fecha = fechaLocal(texto)
  if (!fecha) return null
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function estaVencida(tarea, hoy = new Date()) {
  const limite = fechaLocal(tarea.fecha_limite)
  if (!limite || estadoDe(tarea) === 'completada') return false
  const inicioDeHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return limite < inicioDeHoy
}

export const nombreDeNivel = (niveles, numero) => niveles.find((n) => n.numero === numero)?.nombre ?? null

export const nivelMaximo = (niveles) => niveles.reduce((m, n) => Math.max(m, n.numero), 0)

// Tareas agrupadas por el nivel al que llevan, del más bajo al más alto. Las que
// no traen nivel (diagnósticos anteriores) apuntan al siguiente del diagnóstico.
export function agruparPorNivel(diagnostico) {
  const base = (diagnostico.resultado?.nivel ?? 0) + 1
  const grupos = new Map()
  for (const tarea of diagnostico.recomendaciones) {
    const nivel = tarea.nivel_objetivo ?? base
    if (!grupos.has(nivel)) grupos.set(nivel, [])
    grupos.get(nivel).push(tarea)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([nivel, tareas]) => ({
      nivel,
      tareas,
      total: tareas.length,
      completadas: tareas.filter((t) => estadoDe(t) === 'completada').length,
    }))
}

// Lo que cuenta para confirmar un nivel (igual que en el servidor): solo las
// tareas compartidas con la empresa.
export function avanceDelSiguienteNivel(diagnostico) {
  const actual = diagnostico.nivel_alcanzado ?? diagnostico.resultado?.nivel ?? 0
  const siguiente = actual + 1
  const tareas = (agruparPorNivel(diagnostico).find((g) => g.nivel === siguiente)?.tareas ?? []).filter((t) => t.visible)
  const completadas = tareas.filter((t) => estadoDe(t) === 'completada').length
  return { actual, siguiente, total: tareas.length, completadas }
}
