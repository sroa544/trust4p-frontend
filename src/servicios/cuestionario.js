// Lógica del cuestionario que el cliente necesita para mostrarlo.
//
// El motor de cálculo, las validaciones y el avance son del backend; aquí solo
// se decide QUÉ preguntas se muestran (réplica de la lógica adaptativa, RF-08)
// y en qué orden, para que la persona no vea bloques que no le aplican.

function valoresComparables(respuesta) {
  if (respuesta.opciones_codigo?.length) return respuesta.opciones_codigo.map(String)
  if (respuesta.texto !== null && respuesta.texto !== undefined) return [String(respuesta.texto)]
  if (respuesta.valor !== null && respuesta.valor !== undefined) return [String(respuesta.valor)]
  return []
}

export function evaluarCondicion(condicion, respuestasPorPregunta) {
  const respuesta = respuestasPorPregunta[condicion.pregunta_codigo]
  if (!respuesta) return false
  const valores = valoresComparables(respuesta)
  if (!valores.length) return false

  switch (condicion.operador) {
    case 'igual':
      return valores.includes(condicion.valor)
    case 'diferente':
      return !valores.includes(condicion.valor)
    case 'contiene':
      return valores.some((v) => v.includes(condicion.valor))
    case 'mayor_que':
    case 'menor_que': {
      const umbral = Number(condicion.valor)
      if (Number.isNaN(umbral)) return false
      const valor = valores.map(Number).find((n) => !Number.isNaN(n))
      if (valor === undefined) return false
      return condicion.operador === 'mayor_que' ? valor > umbral : valor < umbral
    }
    default:
      return false
  }
}

export function ordenarPreguntas(cuestionario) {
  const orden = new Map(cuestionario.dimensiones.map((d) => [d.codigo, d.orden]))
  return [...cuestionario.preguntas].sort(
    (a, b) =>
      (orden.get(a.dimension_codigo) ?? 0) - (orden.get(b.dimension_codigo) ?? 0) ||
      a.orden - b.orden,
  )
}

export function respuestasPorPregunta(diagnostico) {
  return Object.fromEntries(diagnostico.respuestas.map((r) => [r.pregunta_codigo, r]))
}

export function preguntasAplicables(cuestionario, diagnostico) {
  const respuestas = respuestasPorPregunta(diagnostico)
  return ordenarPreguntas(cuestionario).filter(
    (p) => !p.condicion || evaluarCondicion(p.condicion, respuestas),
  )
}

export function estaRespondida(pregunta, respuesta) {
  if (!respuesta) return false
  if (pregunta.tipo === 'texto_libre') return Boolean(respuesta.texto?.trim())
  if (pregunta.tipo === 'escala' || pregunta.tipo === 'numerica') {
    return respuesta.valor !== null && respuesta.valor !== undefined
  }
  return respuesta.opciones_codigo?.length > 0
}

// Índice de la primera pregunta obligatoria aplicable sin responder (donde se
// retoma el cuestionario, HU-010); si todo está respondido, la última.
export function indiceDeRetoma(aplicables, diagnostico) {
  const respuestas = respuestasPorPregunta(diagnostico)
  const primera = aplicables.findIndex((p) => !estaRespondida(p, respuestas[p.codigo]))
  return primera === -1 ? Math.max(aplicables.length - 1, 0) : primera
}

export function avancePorDimension(cuestionario, diagnostico, aplicables) {
  const respuestas = respuestasPorPregunta(diagnostico)
  return [...cuestionario.dimensiones]
    .sort((a, b) => a.orden - b.orden)
    .map((dimension) => {
      const propias = aplicables.filter((p) => p.dimension_codigo === dimension.codigo)
      const hechas = propias.filter((p) => estaRespondida(p, respuestas[p.codigo])).length
      return {
        ...dimension,
        total: propias.length,
        hechas,
        porcentaje: propias.length ? Math.round((hechas / propias.length) * 100) : 0,
      }
    })
}
