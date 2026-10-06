import { useCallback, useEffect, useState } from 'react'
import { mensajeDeError } from '../servicios/api'
import {
  CATEGORIAS,
  actualizarDocumento,
  cargarDocumento,
  desactivarDocumento,
  listarDocumentos,
  reactivarDocumento,
} from '../servicios/baseConocimiento'
import { formatearFechaHora } from '../servicios/validaciones'
import Aviso from './Aviso.jsx'
import { CLASE_ENTRADA } from './TarjetaPublica.jsx'

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

export const TAMANO_MAXIMO_MB = 20

const nombreDeCategoria = (valor) => CATEGORIAS.find((c) => c.valor === valor)?.texto ?? valor

// El navegador no siempre informa el tipo; se acepta también por la extensión.
export function errorDeArchivo(archivo) {
  if (!archivo) return 'Seleccione un archivo PDF.'
  const esPdf = archivo.type === 'application/pdf' || archivo.name?.toLowerCase().endsWith('.pdf')
  if (!esPdf) return 'Solo se aceptan documentos PDF.'
  if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) return `El archivo supera los ${TAMANO_MAXIMO_MB} MB.`
  return ''
}

function Formulario({ documento, guardando, alGuardar, alCancelar }) {
  const actualizando = Boolean(documento)
  const [datos, setDatos] = useState({
    titulo: documento?.titulo ?? '',
    categoria: documento?.categoria ?? CATEGORIAS[0].valor,
    version: '',
    fuente: documento?.fuente ?? '',
  })
  const [archivo, setArchivo] = useState(null)
  const [errorArchivo, setErrorArchivo] = useState('')
  const poner = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })
  const categoria = CATEGORIAS.find((c) => c.valor === datos.categoria)

  function elegir(e) {
    const elegido = e.target.files?.[0] ?? null
    setArchivo(elegido)
    setErrorArchivo(elegido ? errorDeArchivo(elegido) : '')
  }

  function enviar(e) {
    e.preventDefault()
    const problema = errorDeArchivo(archivo)
    if (problema) {
      setErrorArchivo(problema)
      return
    }
    alGuardar({ ...datos, archivo })
  }

  return (
    <form aria-label="Formulario de documento" className="p-space-lg border-b border-surface-container" onSubmit={enviar}>
      <h3 className="font-headline-sm text-headline-sm font-bold">
        {actualizando ? `Nueva versión de «${documento.titulo}»` : 'Cargar documento'}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
        {actualizando
          ? 'Se crea una versión nueva y la anterior deja de usarse; el historial se conserva.'
          : 'El PDF se divide en fragmentos y se vectoriza. Desde ese momento el agente lo consulta en las evaluaciones.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Título
          <input className={CLASE_ENTRADA} maxLength={200} onChange={poner('titulo')} required value={datos.titulo} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Categoría
          <select className={CLASE_ENTRADA} onChange={poner('categoria')} value={datos.categoria}>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>{c.texto}</option>
            ))}
          </select>
          {categoria && <span className="font-body-sm text-body-sm text-outline">{categoria.uso}</span>}
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Versión
          <input className={CLASE_ENTRADA} maxLength={50} onChange={poner('version')} placeholder="ej. 1.0" required value={datos.version} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Fuente (opcional)
          <input className={CLASE_ENTRADA} maxLength={300} onChange={poner('fuente')} placeholder="ej. Tesis, capítulo 3" value={datos.fuente} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md sm:col-span-2">
          Archivo PDF (máximo {TAMANO_MAXIMO_MB} MB)
          <input accept="application/pdf,.pdf" className={CLASE_ENTRADA} onChange={elegir} type="file" />
        </label>
      </div>
      <Aviso className="mt-3" tipo="error">{errorArchivo}</Aviso>
      <div className="flex gap-2 mt-4">
        <button className={BOTON_PRIMARIO} disabled={guardando} type="submit">
          {guardando ? 'Procesando el documento…' : actualizando ? 'Cargar nueva versión' : 'Cargar documento'}
        </button>
        <button className={BOTON} disabled={guardando} onClick={alCancelar} type="button">Cancelar</button>
      </div>
    </form>
  )
}

// HU-036 / RF-41: gestión de los documentos que alimentan al agente. Solo el
// administrador. Cargar, actualizar o desactivar un documento afecta las
// evaluaciones siguientes: el agente solo recupera fragmentos de documentos
// activos.
export default function BaseConocimiento() {
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [formulario, setFormulario] = useState(null) // null | 'nuevo' | documento
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(async () => {
    try {
      const lista = await listarDocumentos()
      setDocumentos([...lista].sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en)))
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  async function ejecutar(accion, exito) {
    setMensaje({ tipo: 'info', texto: '' })
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: exito })
      await recargar()
      return true
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
      return false
    }
  }

  async function guardar(datos) {
    setGuardando(true)
    const actualizando = formulario !== 'nuevo'
    const ok = await ejecutar(
      () => (actualizando ? actualizarDocumento(formulario.id, datos) : cargarDocumento(datos)),
      actualizando
        ? 'Nueva versión cargada. La anterior dejó de usarse.'
        : 'Documento cargado. Se usará desde la próxima evaluación.',
    )
    setGuardando(false)
    if (ok) setFormulario(null)
  }

  const activos = documentos.filter((d) => d.activo).length

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Base de conocimiento del agente</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {documentos.length} documentos, {activos} activos. El agente toma de aquí las referencias con las que redacta la
            interpretación de cada diagnóstico; un documento desactivado deja de usarse sin borrarse.
          </p>
        </div>
        {formulario === null && (
          <button className={BOTON_PRIMARIO} onClick={() => setFormulario('nuevo')} type="button">Cargar documento</button>
        )}
      </div>
      <div className="px-space-lg">
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      </div>

      {formulario !== null && (
        <Formulario
          alCancelar={() => setFormulario(null)}
          alGuardar={guardar}
          documento={formulario === 'nuevo' ? null : formulario}
          guardando={guardando}
          key={formulario === 'nuevo' ? 'nuevo' : formulario.id}
        />
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
            <th className="py-3 px-4">Título</th>
            <th className="py-3 px-4">Categoría</th>
            <th className="py-3 px-4">Versión</th>
            <th className="py-3 px-4">Fuente</th>
            <th className="py-3 px-4">Cargado</th>
            <th className="py-3 px-4">Estado</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container align-top">
          {cargando && <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="7">Cargando…</td></tr>}
          {!cargando && documentos.length === 0 && (
            <tr>
              <td className="py-4 px-4 text-on-surface-variant" colSpan="7">
                Aún no hay documentos. Sin ellos el agente redacta solo con la rúbrica del modelo.
              </td>
            </tr>
          )}
          {documentos.map((d) => (
            <tr key={d.id}>
              <td className="py-3 px-4 font-label-lg text-label-lg font-bold">{d.titulo}</td>
              <td className="py-3 px-4">{nombreDeCategoria(d.categoria)}</td>
              <td className="py-3 px-4">{d.version}</td>
              <td className="py-3 px-4">{d.fuente ?? '—'}</td>
              <td className="py-3 px-4 whitespace-nowrap">{formatearFechaHora(d.creado_en)}</td>
              <td className="py-3 px-4">{d.activo ? 'Activo' : 'Inactivo'}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button aria-label={`Nueva versión de ${d.titulo}`} className={BOTON} onClick={() => setFormulario(d)} type="button">
                    Nueva versión
                  </button>
                  <button
                    aria-label={`${d.activo ? 'Desactivar' : 'Reactivar'} ${d.titulo}`}
                    className={BOTON}
                    onClick={() =>
                      ejecutar(
                        () => (d.activo ? desactivarDocumento(d.id) : reactivarDocumento(d.id)),
                        d.activo ? 'Documento desactivado: ya no se usa en las evaluaciones.' : 'Documento reactivado.',
                      )
                    }
                    type="button"
                  >
                    {d.activo ? 'Desactivar' : 'Reactivar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
