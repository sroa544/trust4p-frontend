// Preparación de los datos de un diagnóstico para mostrarlos (informe, plan,
// historial). Todo se deriva de lo que entrega el backend: nombres de
// dimensiones y rúbrica vienen del cuestionario del propio diagnóstico, de
// modo que la versión del modelo aplicada manda y nada queda "quemado".

export const LIENZO_BLOQUES = [
  { clave: 'segmentos_clientes', titulo: 'Segmentos de clientes' },
  { clave: 'propuesta_valor', titulo: 'Propuesta de valor' },
  { clave: 'canales', titulo: 'Canales' },
  { clave: 'relacion_clientes', titulo: 'Relación con clientes' },
  { clave: 'fuente_ingresos', titulo: 'Fuentes de ingreso' },
  { clave: 'recursos_clave', titulo: 'Recursos clave' },
  { clave: 'actividades_clave', titulo: 'Actividades clave' },
  { clave: 'alianzas_clave', titulo: 'Alianzas clave' },
  { clave: 'estructura_costos', titulo: 'Estructura de costos' },
]

export function nivelDe(puntaje, niveles) {
  const orden = [...niveles].sort((a, b) => a.numero - b.numero)
  return (
    orden.find((n) => puntaje >= Number(n.umbral_min) && puntaje <= Number(n.umbral_max)) ??
    orden[orden.length - 1] ??
    null
  )
}

export function porcentajeDeEscala(puntaje, cuestionario) {
  const minimo = Number(cuestionario.escala_min)
  const maximo = Number(cuestionario.escala_max)
  if (maximo <= minimo) return 0
  return Math.max(0, Math.min(100, ((Number(puntaje) - minimo) / (maximo - minimo)) * 100))
}

export function dimensionesDelResultado(diagnostico, cuestionario) {
  const porCodigo = new Map(diagnostico.resultado.dimensiones.map((d) => [d.codigo, d]))
  return [...cuestionario.dimensiones]
    .sort((a, b) => a.orden - b.orden)
    .filter((d) => porCodigo.has(d.codigo))
    .map((d, i) => {
      const resultado = porCodigo.get(d.codigo)
      const puntaje = Number(resultado.puntaje)
      return {
        id: d.codigo,
        numero: i + 1,
        nombre: d.nombre,
        subtitulo: d.descripcion,
        puntaje,
        porcentaje: porcentajeDeEscala(puntaje, cuestionario),
        nivel: nivelDe(puntaje, cuestionario.niveles),
        observacion: resultado.observacion,
      }
    })
}

export const ETIQUETA_ORIGEN = {
  agente: 'Generada por el agente',
  consultor: 'Registrada por el consultor',
}

export function ordenarRecomendaciones(recomendaciones) {
  return [...recomendaciones].sort(
    (a, b) =>
      (a.prioridad ?? 999) - (b.prioridad ?? 999) ||
      new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime(),
  )
}

export function guardarArchivo(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
