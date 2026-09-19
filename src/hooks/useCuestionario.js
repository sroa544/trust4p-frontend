import { useMemo, useState } from 'react'
import { MODELO_DIAGNOSTICO } from '../datos/modeloDiagnostico'

export function useCuestionario(modelo = MODELO_DIAGNOSTICO) {
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [comentarios, setComentarios] = useState({})

  const preguntas = useMemo(
    () =>
      modelo.dimensiones.flatMap((dimension) =>
        dimension.preguntas.map((pregunta) => ({ ...pregunta, dimension })),
      ),
    [modelo],
  )

  const actual = preguntas[indice] ?? null
  const respondidas = Object.keys(respuestas).length
  const progreso = preguntas.length ? Math.round((respondidas / preguntas.length) * 100) : 0

  const avance = useMemo(
    () =>
      modelo.dimensiones.map((dimension) => {
        const total = dimension.preguntas.length
        const hechas = dimension.preguntas.filter((p) => respuestas[p.id]).length
        return {
          ...dimension,
          total,
          hechas,
          porcentaje: total ? Math.round((hechas / total) * 100) : 0,
          activa: actual?.dimension.id === dimension.id,
        }
      }),
    [modelo, respuestas, actual],
  )

  function responder(preguntaId, nivel) {
    setRespuestas((previas) => ({ ...previas, [preguntaId]: nivel }))
  }

  function comentar(preguntaId, texto) {
    setComentarios((previos) => ({ ...previos, [preguntaId]: texto }))
  }

  function siguiente() {
    setIndice((i) => Math.min(i + 1, preguntas.length - 1))
  }

  function anterior() {
    setIndice((i) => Math.max(i - 1, 0))
  }

  return {
    modelo,
    preguntas,
    actual,
    indice,
    respuestas,
    comentarios,
    respondidas,
    progreso,
    avance,
    esPrimera: indice === 0,
    esUltima: indice === preguntas.length - 1,
    responder,
    comentar,
    siguiente,
    anterior,
  }
}