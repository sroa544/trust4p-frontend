import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import ContenidoInforme from '../componentes/ContenidoInforme.jsx'
import { mensajeDeError } from '../servicios/api'
import {
  cerrarDiagnostico,
  obtenerCuestionarioAsignado,
  obtenerDiagnosticoAsignado,
  registrarRecomendacion,
} from '../servicios/consultoria'
import { formatearFechaHora } from '../servicios/validaciones'
import { ESTADOS_DIAGNOSTICO } from './Consultoria.jsx'

function textoDeRespuesta(pregunta, respuesta) {
  if (respuesta.opciones_codigo?.length) {
    return respuesta.opciones_codigo
      .map((codigo) => pregunta?.opciones.find((o) => o.codigo === codigo)?.etiqueta ?? codigo)
      .join('; ')
  }
  if (respuesta.valor !== null && respuesta.valor !== undefined) return String(Number(respuesta.valor))
  return respuesta.texto ?? '—'
}

function RespuestasRegistradas({ diagnostico, cuestionario }) {
  const preguntas = new Map(cuestionario.preguntas.map((p) => [p.codigo, p]))
  const dimensiones = new Map(cuestionario.dimensiones.map((d) => [d.codigo, d.nombre]))
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg border-b border-surface-container">
        <h2 className="font-headline-md text-headline-md font-bold">Respuestas del representante</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {diagnostico.respuestas.length} respuestas registradas.
        </p>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
            <th className="py-3 px-4">Dimensión</th>
            <th className="py-3 px-4">Pregunta</th>
            <th className="py-3 px-4">Respuesta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container align-top">
          {diagnostico.respuestas.length === 0 && (
            <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="3">Aún no hay respuestas.</td></tr>
          )}
          {diagnostico.respuestas.map((r) => {
            const pregunta = preguntas.get(r.pregunta_codigo)
            return (
              <tr key={r.pregunta_codigo}>
                <td className="py-3 px-4 whitespace-nowrap">{dimensiones.get(r.dimension_codigo) ?? r.dimension_codigo}</td>
                <td className="py-3 px-4">{pregunta?.enunciado ?? r.pregunta_codigo}</td>
                <td className="py-3 px-4 font-semibold">{textoDeRespuesta(pregunta, r)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function FormularioRecomendacion({ diagnosticoId, cuestionario, alRegistrar }) {
  const [datos, setDatos] = useState({ titulo: '', contenido: '', dimension: '', visible: true })
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [enviando, setEnviando] = useState(false)
  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setMensaje({ tipo: 'info', texto: '' })
    setEnviando(true)
    try {
      await registrarRecomendacion(diagnosticoId, datos)
      setDatos({ titulo: '', contenido: '', dimension: '', visible: true })
      setMensaje({ tipo: 'exito', texto: 'Recomendación registrada.' })
      await alRegistrar()
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
      <h2 className="font-headline-md text-headline-md font-bold">Registrar una recomendación</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
        Queda a su nombre y, si la comparte, se notifica al representante de la empresa.
      </p>
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <label className="flex flex-col gap-1 font-label-lg text-label-lg">
          Título
          <input className="h-11 px-3 rounded-lg bg-surface-container-low" maxLength={200} onChange={cambiar('titulo')} required value={datos.titulo} />
        </label>
        <label className="flex flex-col gap-1 font-label-lg text-label-lg">
          Contenido
          <textarea className="p-3 rounded-lg bg-surface-container-low" maxLength={2000} onChange={cambiar('contenido')} required rows="4" value={datos.contenido} />
        </label>
        <label className="flex flex-col gap-1 font-label-lg text-label-lg">
          Dimensión (opcional)
          <select className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('dimension')} value={datos.dimension}>
            <option value="">General</option>
            {[...cuestionario.dimensiones].sort((a, b) => a.orden - b.orden).map((d) => (
              <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 font-body-md text-body-md">
          <input checked={datos.visible} className="w-4 h-4 accent-primary" onChange={(e) => setDatos({ ...datos, visible: e.target.checked })} type="checkbox" />
          Compartir con la empresa ahora
        </label>
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
        <button className="h-11 px-6 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold self-start disabled:opacity-60" disabled={enviando} type="submit">
          {enviando ? 'Registrando…' : 'Registrar recomendación'}
        </button>
      </form>
    </section>
  )
}

// HU-021, HU-022 y HU-024: detalle de un diagnóstico asignado, recomendaciones
// del consultor y cierre del acompañamiento.
export default function ConsultoriaDiagnostico() {
  const { id } = useParams()
  const [estado, setEstado] = useState({ fase: 'cargando', diagnostico: null, cuestionario: null, error: '' })
  const [confirmando, setConfirmando] = useState(false)
  const [errorCierre, setErrorCierre] = useState('')
  const [cerrando, setCerrando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const [diagnostico, cuestionario] = await Promise.all([
        obtenerDiagnosticoAsignado(id),
        obtenerCuestionarioAsignado(id),
      ])
      setEstado({ fase: 'listo', diagnostico, cuestionario, error: '' })
    } catch (falla) {
      setEstado({ fase: 'error', diagnostico: null, cuestionario: null, error: mensajeDeError(falla) })
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function cerrar() {
    setErrorCierre('')
    setCerrando(true)
    try {
      await cerrarDiagnostico(id)
      setConfirmando(false)
      await cargar()
    } catch (falla) {
      setErrorCierre(mensajeDeError(falla))
    } finally {
      setCerrando(false)
    }
  }

  if (estado.fase === 'cargando') {
    return <main className="w-full flex-1 flex items-center justify-center p-margin" role="status">Cargando el diagnóstico…</main>
  }
  if (estado.fase === 'error') {
    return (
      <main className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-margin">
        <Aviso tipo="error">{estado.error}</Aviso>
        <Link className="text-primary font-label-md text-label-md" to="/consultoria">Volver a empresas asignadas</Link>
      </main>
    )
  }

  const { diagnostico, cuestionario } = estado
  const admiteCambios = diagnostico.estado === 'evaluado' || diagnostico.estado === 'fallido'

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-lg pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="font-label-md text-label-md text-primary" to={`/consultoria/empresas/${diagnostico.empresa_id}`}>
            ← Historial de {diagnostico.empresa_nombre}
          </Link>
          <span className="font-label-caps text-label-caps bg-surface-container px-3 py-1 rounded-full">
            {ESTADOS_DIAGNOSTICO[diagnostico.estado] ?? diagnostico.estado}
            {diagnostico.cerrado_en ? ` · ${formatearFechaHora(diagnostico.cerrado_en)}` : ''}
          </span>
        </div>

        {diagnostico.resultado ? (
          <ContenidoInforme cuestionario={cuestionario} conEnlacePlan={false} diagnostico={diagnostico} />
        ) : (
          <Aviso tipo="info">
            Este diagnóstico todavía no tiene resultado (estado: {ESTADOS_DIAGNOSTICO[diagnostico.estado] ?? diagnostico.estado}).
          </Aviso>
        )}

        <RespuestasRegistradas cuestionario={cuestionario} diagnostico={diagnostico} />

        {admiteCambios && (
          <>
            <FormularioRecomendacion alRegistrar={cargar} cuestionario={cuestionario} diagnosticoId={id} />

            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-2">
              <h2 className="font-headline-md text-headline-md font-bold">Cerrar el diagnóstico</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Al cerrarlo concluye el acompañamiento y ya no admite nuevas recomendaciones.
              </p>
              <Aviso tipo="error">{errorCierre}</Aviso>
              {!confirmando ? (
                <button className="h-11 px-6 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold self-start" onClick={() => setConfirmando(true)} type="button">
                  Cerrar diagnóstico
                </button>
              ) : (
                <div className="flex gap-3">
                  <button className="h-11 px-6 rounded-lg bg-error text-on-error font-label-lg text-label-lg font-semibold disabled:opacity-60" disabled={cerrando} onClick={cerrar} type="button">
                    {cerrando ? 'Cerrando…' : 'Sí, cerrar definitivamente'}
                  </button>
                  <button className="h-11 px-6 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg" disabled={cerrando} onClick={() => setConfirmando(false)} type="button">
                    Cancelar
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
