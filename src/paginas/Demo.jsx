import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import EntradaPregunta from '../componentes/EntradaPregunta.jsx'
import { mensajeDeError } from '../servicios/api'
import { estaRespondida, evaluarCondicion } from '../servicios/cuestionario'
import { preguntasDemo, resultadoDemo } from '../servicios/diagnosticos'
import { numero } from '../servicios/validaciones'

// HU-007 / RF-49: diagnóstico de demostración para visitantes. No hay sesión,
// no se guarda nada y el resultado es orientativo.
export default function Demo() {
  const [estado, setEstado] = useState({ fase: 'cargando', datos: null, error: '' })
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true
    preguntasDemo()
      .then((datos) => activo && setEstado({ fase: 'listo', datos, error: '' }))
      .catch((falla) => activo && setEstado({ fase: 'error', datos: null, error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [])

  if (estado.fase === 'cargando') {
    return (
      <main className="w-full flex-1 flex items-center justify-center p-margin">
        <span className="font-body-md text-body-md text-on-surface-variant" role="status">Cargando la demostración…</span>
      </main>
    )
  }

  if (estado.fase === 'error') {
    return (
      <main className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-margin">
        <Aviso tipo="error">{estado.error}</Aviso>
        <Link className="font-label-md text-label-md text-primary" to="/login">Volver al inicio de sesión</Link>
      </main>
    )
  }

  const { aviso, preguntas } = estado.datos
  const visibles = [...preguntas]
    .sort((a, b) => a.orden - b.orden)
    .filter((p) => !p.condicion || evaluarCondicion(p.condicion, respuestas))
  const pendientes = visibles.filter((p) => p.obligatoria && !estaRespondida(p, respuestas[p.codigo]))

  function cambiar(pregunta, parcial) {
    setRespuestas((previas) => ({
      ...previas,
      [pregunta.codigo]: { pregunta_codigo: pregunta.codigo, opciones_codigo: [], ...previas[pregunta.codigo], ...parcial },
    }))
  }

  async function enviar() {
    setError('')
    setEnviando(true)
    try {
      const lista = visibles
        .filter((p) => estaRespondida(p, respuestas[p.codigo]))
        .map((p) => {
          const r = respuestas[p.codigo]
          return {
            pregunta_codigo: p.codigo,
            opciones_codigo: r.opciones_codigo ?? [],
            valor: r.valor ?? null,
            texto: r.texto ?? null,
          }
        })
      setResultado(await resultadoDemo(lista))
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-space-md">
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
            <Aviso tipo="info">{resultado.aviso}</Aviso>
            <span className="font-label-caps text-label-caps text-secondary uppercase">Resultado orientativo</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-display-hero text-primary font-bold">{numero(resultado.indice_global)}</span>
              <span className="font-body-md text-body-md text-outline">/ 100</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold">
              Nivel {resultado.nivel}: {resultado.nivel_nombre}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{resultado.nivel_descripcion}</p>
            <p className="font-body-sm text-body-sm text-outline">
              Basado en {resultado.preguntas_respondidas} de {resultado.total_preguntas} preguntas.
            </p>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-3">
            <h2 className="font-headline-md text-headline-md font-bold">Por dimensión</h2>
            {resultado.dimensiones.map((d) => (
              <div key={d.codigo}>
                <div className="flex justify-between font-label-lg text-label-lg">
                  <span>{d.nombre}</span>
                  <span>{numero(d.puntaje)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, Number(d.puntaje))}%` }}></div>
                </div>
              </div>
            ))}
            {resultado.dimensiones_sin_evaluar.length > 0 && (
              <p className="font-body-sm text-body-sm text-outline">
                Sin evaluar en la demostración: {resultado.dimensiones_sin_evaluar.join(', ')}.
              </p>
            )}
          </section>

          <Link
            className="h-12 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center"
            to="/solicitar-acceso"
          >
            Quiero el diagnóstico completo para mi empresa
          </Link>
          <Link className="text-center font-label-md text-label-md text-primary" to="/login">Volver al inicio de sesión</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Diagnóstico de demostración</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Conozca el modelo 4P</h1>
          <Aviso tipo="info">{aviso}</Aviso>
        </header>

        {visibles.map((p, i) => (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg" key={p.codigo}>
            <span className="font-label-caps text-label-caps text-outline">Pregunta {i + 1}</span>
            <h2 className="font-headline-sm text-headline-sm font-bold mb-1">{p.enunciado}</h2>
            {p.ayuda && <p className="font-body-sm text-body-sm text-on-surface-variant">{p.ayuda}</p>}
            <EntradaPregunta onCambiar={(parcial) => cambiar(p, parcial)} pregunta={p} respuesta={respuestas[p.codigo]} />
          </section>
        ))}

        <Aviso tipo="error">{error}</Aviso>
        <button
          className="h-12 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60"
          disabled={enviando || pendientes.length > 0}
          onClick={enviar}
          type="button"
        >
          {enviando
            ? 'Calculando…'
            : pendientes.length
              ? `Faltan ${pendientes.length} pregunta(s) obligatoria(s)`
              : 'Ver mi resultado orientativo'}
        </button>
        <Link className="text-center font-label-md text-label-md text-primary" to="/login">Volver al inicio de sesión</Link>
      </div>
    </main>
  )
}
