import { useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { CLASE_ENTRADA } from '../componentes/TarjetaPublica.jsx'
import { mensajeDeError } from '../servicios/api'
import { consultarBitacora, ejecucionesDelAgente } from '../servicios/auditoria'
import { formatearFechaHora } from '../servicios/validaciones'

const ENTIDADES = [
  'usuarios',
  'empresas',
  'diagnosticos',
  'solicitudes_acceso',
  'modelos_madurez',
  'roles',
  'sesiones',
]

function Json({ valor }) {
  if (!valor) return <span className="text-outline">—</span>
  return (
    <pre className="whitespace-pre-wrap break-words font-body-sm text-[11px] bg-surface-container-low rounded p-2 max-w-xs">
      {JSON.stringify(valor, null, 2)}
    </pre>
  )
}

function Bitacora() {
  const [filtros, setFiltros] = useState({ entidad: '', entidad_id: '', usuario_id: '', limite: 50 })
  const [estado, setEstado] = useState({ fase: 'cargando', registros: [], error: '' })

  useEffect(() => {
    let activo = true
    setEstado((previo) => ({ ...previo, fase: 'cargando' }))
    consultarBitacora(filtros)
      .then((registros) => activo && setEstado({ fase: 'listo', registros, error: '' }))
      .catch((falla) => activo && setEstado({ fase: 'error', registros: [], error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [filtros])

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg flex flex-col gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Bitácora de acciones</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cada cambio queda con quién lo hizo, cuándo y los valores anterior y nuevo.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <label className="flex flex-col gap-1 font-label-md text-label-md">
            Entidad
            <select className={CLASE_ENTRADA} onChange={cambiar('entidad')} value={filtros.entidad}>
              <option value="">Todas</option>
              {ENTIDADES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-label-md text-label-md">
            Id del recurso
            <input className={CLASE_ENTRADA} onChange={cambiar('entidad_id')} value={filtros.entidad_id} />
          </label>
          <label className="flex flex-col gap-1 font-label-md text-label-md">
            Id del usuario
            <input className={CLASE_ENTRADA} onChange={cambiar('usuario_id')} value={filtros.usuario_id} />
          </label>
          <label className="flex flex-col gap-1 font-label-md text-label-md">
            Máximo de registros
            <select className={CLASE_ENTRADA} onChange={cambiar('limite')} value={filtros.limite}>
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <Aviso tipo="error">{estado.error}</Aviso>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
            <th className="py-3 px-4">Fecha</th>
            <th className="py-3 px-4">Entidad</th>
            <th className="py-3 px-4">Acción</th>
            <th className="py-3 px-4">Usuario</th>
            <th className="py-3 px-4">Anterior</th>
            <th className="py-3 px-4">Nuevo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container align-top">
          {estado.fase === 'cargando' && (
            <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="6">Cargando…</td></tr>
          )}
          {estado.fase === 'listo' && estado.registros.length === 0 && (
            <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="6">Sin registros.</td></tr>
          )}
          {estado.registros.map((r) => (
            <tr key={r.id}>
              <td className="py-3 px-4 whitespace-nowrap">{formatearFechaHora(r.registrado_en)}</td>
              <td className="py-3 px-4">
                <div>{r.entidad}</div>
                <div className="font-body-sm text-[11px] text-outline">{r.entidad_id ?? ''}</div>
              </td>
              <td className="py-3 px-4">{r.accion}</td>
              <td className="py-3 px-4 font-body-sm text-[11px]">{r.usuario_id ?? 'Sistema'}</td>
              <td className="py-3 px-4"><Json valor={r.valores_anteriores} /></td>
              <td className="py-3 px-4"><Json valor={r.valores_nuevos} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function EjecucionesAgente() {
  const [diagnosticoId, setDiagnosticoId] = useState('')
  const [estado, setEstado] = useState({ fase: 'inicial', ejecuciones: [], error: '' })

  async function buscar(e) {
    e.preventDefault()
    setEstado({ fase: 'cargando', ejecuciones: [], error: '' })
    try {
      const ejecuciones = await ejecucionesDelAgente(diagnosticoId.trim())
      setEstado({ fase: 'listo', ejecuciones, error: '' })
    } catch (falla) {
      setEstado({ fase: 'error', ejecuciones: [], error: mensajeDeError(falla) })
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-3">
      <div>
        <h2 className="font-headline-md text-headline-md font-bold">Ejecuciones del agente</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Petición, fragmentos recuperados y respuesta de cada intento de evaluación de un diagnóstico (solo lectura).
        </p>
      </div>
      <form className="flex flex-wrap gap-3 items-end" onSubmit={buscar}>
        <label className="flex flex-col gap-1 font-label-md text-label-md flex-1 min-w-60">
          Id del diagnóstico
          <input className={CLASE_ENTRADA} onChange={(e) => setDiagnosticoId(e.target.value)} required value={diagnosticoId} />
        </label>
        <button className="h-11 px-6 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold" type="submit">
          Consultar
        </button>
      </form>
      <Aviso tipo="error">{estado.error}</Aviso>
      {estado.fase === 'cargando' && <p className="text-on-surface-variant" role="status">Consultando…</p>}
      {estado.fase === 'listo' && estado.ejecuciones.length === 0 && (
        <p className="text-on-surface-variant">Este diagnóstico no tiene ejecuciones del agente.</p>
      )}
      {estado.ejecuciones.map((x) => (
        <details className="bg-surface-container-low rounded-lg p-3" key={x.id}>
          <summary className="cursor-pointer font-label-lg text-label-lg">
            Intento {x.intento} · {x.estado} · {x.modelo} · {formatearFechaHora(x.ejecutado_en)}
            {x.duracion_ms !== null ? ` · ${x.duracion_ms} ms` : ''}
          </summary>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3 font-body-sm text-body-sm">
            <div><dt className="text-outline">Proveedor</dt><dd>{x.proveedor}</dd></div>
            <div><dt className="text-outline">Versión del prompt</dt><dd>{x.version_prompt}</dd></div>
            <div><dt className="text-outline">Versión del modelo 4P</dt><dd>{x.modelo_version}</dd></div>
            <div><dt className="text-outline">Tokens (entrada/salida)</dt><dd>{x.tokens_entrada ?? '—'} / {x.tokens_salida ?? '—'}</dd></div>
          </dl>
          {x.mensaje_error && <Aviso tipo="error">{x.mensaje_error}</Aviso>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <h3 className="font-label-lg text-label-lg font-bold">Petición</h3>
              <Json valor={x.peticion} />
              <h3 className="font-label-lg text-label-lg font-bold mt-2">Fragmentos recuperados</h3>
              <Json valor={x.fragmentos_recuperados} />
            </div>
            <div>
              <h3 className="font-label-lg text-label-lg font-bold">Respuesta</h3>
              <Json valor={x.respuesta} />
            </div>
          </div>
        </details>
      ))}
    </section>
  )
}

// HU-030 y HU-037: bitácora de acciones y ejecuciones del agente. Solo datos
// que el sistema registra: no se muestra información que no exista.
export default function PanelAuditoria() {
  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Auditoría</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Trazabilidad de la plataforma</h1>
        </header>
        <Bitacora />
        <EjecucionesAgente />
      </div>
    </main>
  )
}
