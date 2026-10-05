import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import EntradaPregunta from '../componentes/EntradaPregunta.jsx'
import { mensajeDeError } from '../servicios/api'
import { estaRespondida, evaluarCondicion } from '../servicios/cuestionario'
import { preguntasDemo, resultadoDemo } from '../servicios/diagnosticos'
import { numero } from '../servicios/validaciones'

// Encabezado propio de la demostracion: es pantalla publica, y BarraSesion no
// se monta sin sesion, asi que sin esto la pagina no tiene marca ni salida.
function Encabezado() {
  return (
    <header className="w-full bg-surface-container-lowest shadow-sm px-margin-mobile lg:px-margin py-2.5 flex items-center justify-between gap-4">
      <Link aria-label="Ir al inicio de sesión" className="flex items-center" to="/login">
        <img alt="Trust 4P" className="h-8 w-auto object-contain" src="/logo-trust4p.png" />
      </Link>

      <Link
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-primary hover:bg-surface-container transition-colors font-label-md text-label-md"
        to="/login"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_back</span>
        <span>Volver al inicio de sesión</span>
      </Link>
    </header>
  )
}

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

  // Avance real sobre las preguntas visibles. No requiere nada de la API: sale
  // del mismo estado que ya decide si el boton de enviar esta habilitado. El
  // total se recalcula solo, porque una condicion puede mostrar u ocultar
  // preguntas segun lo que la persona vaya respondiendo.
  const respondidas = visibles.filter((p) => estaRespondida(p, respuestas[p.codigo])).length
  const porcentaje = visibles.length ? Math.round((respondidas / visibles.length) * 100) : 0

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
      <>
        <Encabezado />

        <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-space-md">
            <section className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary-container via-tertiary-fixed to-primary-container"
              />

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
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, Number(d.puntaje))}%` }}></div>
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
              className="h-12 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              to="/solicitar-acceso"
            >
              <span>Quiero el diagnóstico completo para mi empresa</span>
              <span aria-hidden="true" className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>

            <Link className="text-center font-label-md text-label-md text-primary" to="/login">Volver al inicio de sesión</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Encabezado />

      <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-space-md pb-24">
          <header className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-secondary-container via-tertiary-fixed to-primary-container"
            />
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"
            />

            <span className="relative inline-flex items-center gap-1.5 self-start font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-fixed">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Diagnóstico de demostración
            </span>

            <h1 className="relative font-headline-xl text-headline-xl font-bold">Conozca el modelo 4P</h1>

            <Aviso tipo="info">{aviso}</Aviso>
          </header>

          {/* El avance se queda pegado arriba al desplazar: con todas las
              preguntas en una sola pagina, es la unica referencia de cuanto
              falta. */}
          <section className="sticky top-0 z-10 bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-label-lg text-label-lg text-on-surface">
                {respondidas} de {visibles.length} respondidas
              </span>
              <span className="font-label-caps text-label-caps text-primary">{porcentaje}%</span>
            </div>

            <div
              aria-label="Avance de la demostración"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={porcentaje}
              className="h-2 rounded-full bg-surface-container overflow-hidden"
              role="progressbar"
            >
              <div
                className="h-full bg-gradient-to-r from-secondary via-primary-container to-primary rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </section>

          {visibles.map((p, i) => (
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg" key={p.codigo}>
              <div className="flex items-center gap-space-sm mb-space-sm">
                <span className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-label-lg text-label-lg">
                  {i + 1}
                </span>

                {!p.obligatoria && (
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    Opcional
                  </span>
                )}
              </div>

              <h2 className="font-headline-sm text-headline-sm font-bold">{p.enunciado}</h2>

              {p.ayuda && (
                <div className="mt-space-sm p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                  <span aria-hidden="true" className="material-symbols-outlined text-lg text-primary shrink-0">info</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{p.ayuda}</p>
                </div>
              )}

              <EntradaPregunta onCambiar={(parcial) => cambiar(p, parcial)} pregunta={p} respuesta={respuestas[p.codigo]} />
            </section>
          ))}

          <Aviso tipo="error">{error}</Aviso>

          <button
            className="h-12 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-60 disabled:shadow-none"
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
    </>
  )
}
