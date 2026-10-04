import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import ContenidoInforme from '../componentes/ContenidoInforme.jsx'
import { useResultado } from '../hooks/useResultado'
import { mensajeDeError } from '../servicios/api'
import { descargarInforme } from '../servicios/diagnosticos'
import { guardarArchivo } from '../servicios/resultados'

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

export default function InformeResultados() {
  const { id } = useParams()
  const { fase, diagnostico, cuestionario, error } = useResultado(id)
  const [descargando, setDescargando] = useState(false)
  const [errorDescarga, setErrorDescarga] = useState('')

  if (fase === 'cargando') {
    return <Mensaje icono="hourglass_top" titulo="Cargando el informe…" />
  }
  if (fase === 'error') {
    return (
      <Mensaje icono="error" titulo="No se pudo cargar el informe">
        <Aviso tipo="error">{error}</Aviso>
      </Mensaje>
    )
  }
  if (fase === 'vacio') {
    return (
      <Mensaje icono="assignment" titulo="Aún no hay resultados">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Su empresa todavía no tiene un diagnóstico con resultado.
        </p>
        <Link className="font-label-lg text-label-lg text-primary font-semibold" to="/diagnostico">Ir al cuestionario</Link>
      </Mensaje>
    )
  }
  if (fase === 'sinResultado') {
    return (
      <Mensaje icono="pending_actions" titulo="El diagnóstico aún no tiene resultado">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Estado actual: {diagnostico.estado}. Complete y envíe el cuestionario para obtener el índice.
        </p>
        <Link className="font-label-lg text-label-lg text-primary font-semibold" to="/diagnostico">Ir al cuestionario</Link>
      </Mensaje>
    )
  }

  async function descargar() {
    setErrorDescarga('')
    setDescargando(true)
    try {
      const pdf = await descargarInforme(diagnostico.id)
      guardarArchivo(pdf, `informe-diagnostico-${diagnostico.consecutivo}.pdf`)
    } catch (falla) {
      setErrorDescarga(mensajeDeError(falla))
    } finally {
      setDescargando(false)
    }
  }

  const acciones = (
    <>
      <button
        className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-primary font-label-lg text-label-lg px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        disabled={descargando || diagnostico.estado === 'completado'}
        onClick={descargar}
        type="button"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        <span>{descargando ? 'Generando…' : 'Descargar informe'}</span>
      </button>
      <Aviso tipo="error">{errorDescarga}</Aviso>
    </>
  )

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <ContenidoInforme acciones={acciones} cuestionario={cuestionario} diagnostico={diagnostico} />
    </main>
  )
}
