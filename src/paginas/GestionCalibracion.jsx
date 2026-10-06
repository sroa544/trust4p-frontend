import { useCallback, useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { CLASE_ENTRADA } from '../componentes/TarjetaPublica.jsx'
import { mensajeDeError } from '../servicios/api'
import BaseConocimiento from '../componentes/BaseConocimiento.jsx'
import EjesPerfilCultura from '../componentes/EjesPerfilCultura.jsx'
import FormularioPregunta from '../componentes/FormularioPregunta.jsx'
import {
  agregarDimension,
  agregarPregunta,
  consultarModelo,
  crearNuevaVersion,
  desactivarPregunta,
  editarDimension,
  editarEje,
  editarPregunta,
  listarModelos,
  publicarModelo,
  quitarDimension,
  reactivarPregunta,
  simularPesos,
} from '../servicios/modelos'
import { aprobarSolicitud, listarSolicitudes, rechazarSolicitud } from '../servicios/solicitudes'
import { formatearFechaHora, numero } from '../servicios/validaciones'

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

const DIMENSION_VACIA = { codigo: '', nombre: '', peso: '', orden: '', descripcion: '' }

const ESTADOS_SOLICITUD = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' }

function PestanaSolicitudes() {
  const [estadoFiltro, setEstadoFiltro] = useState('pendiente')
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [rechazando, setRechazando] = useState(null)
  const [motivo, setMotivo] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setSolicitudes(await listarSolicitudes(estadoFiltro))
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
    } finally {
      setCargando(false)
    }
  }, [estadoFiltro])

  useEffect(() => {
    recargar()
  }, [recargar])

  async function ejecutar(accion, exito) {
    setMensaje({ tipo: 'info', texto: '' })
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: exito })
      setRechazando(null)
      setMotivo('')
      await recargar()
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg flex flex-col gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Solicitudes de acceso</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Al aprobar se crea la empresa y se envía la invitación al solicitante. Un rechazo exige un motivo.
          </p>
        </div>
        <label className="flex flex-col gap-1 font-label-md text-label-md max-w-xs">
          Estado
          <select className={CLASE_ENTRADA} onChange={(e) => setEstadoFiltro(e.target.value)} value={estadoFiltro}>
            <option value="">Todas</option>
            {Object.entries(ESTADOS_SOLICITUD).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
            <th className="py-3 px-4">Empresa</th>
            <th className="py-3 px-4">Solicitante</th>
            <th className="py-3 px-4">Sector y tamaño</th>
            <th className="py-3 px-4">Radicada</th>
            <th className="py-3 px-4">Estado</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container align-top">
          {cargando && <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="6">Cargando…</td></tr>}
          {!cargando && solicitudes.length === 0 && (
            <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="6">No hay solicitudes.</td></tr>
          )}
          {solicitudes.map((s) => (
            <tr key={s.id}>
              <td className="py-3 px-4">
                <div className="font-label-lg text-label-lg font-bold">{s.nombre_empresa}</div>
                <div className="font-body-sm text-body-sm text-outline">NIT {s.nit ?? '—'}{s.ciudad ? ` · ${s.ciudad}` : ''}</div>
              </td>
              <td className="py-3 px-4">
                <div>{s.nombre_solicitante}{s.cargo ? ` (${s.cargo})` : ''}</div>
                <div className="font-body-sm text-body-sm text-outline">{s.correo_solicitante}{s.telefono ? ` · ${s.telefono}` : ''}</div>
              </td>
              <td className="py-3 px-4">
                {s.sector_nombre ?? '—'}
                <div className="font-body-sm text-body-sm text-outline">
                  {s.numero_empleados ?? '—'} empleados{s.tamano ? ` · ${s.tamano}` : ''}
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">{formatearFechaHora(s.creado_en)}</td>
              <td className="py-3 px-4">
                {ESTADOS_SOLICITUD[s.estado] ?? s.estado}
                {s.motivo_rechazo && <div className="font-body-sm text-body-sm text-outline">{s.motivo_rechazo}</div>}
              </td>
              <td className="py-3 px-4">
                {s.estado === 'pendiente' &&
                  (rechazando === s.id ? (
                    <div className="flex flex-col gap-2 min-w-56">
                      <textarea
                        aria-label="Motivo del rechazo"
                        className="p-2 rounded-lg bg-surface-container-low"
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Motivo del rechazo"
                        rows="3"
                        value={motivo}
                      />
                      <div className="flex gap-2">
                        <button className={BOTON} disabled={!motivo.trim()} onClick={() => ejecutar(() => rechazarSolicitud(s.id, motivo.trim()), 'Solicitud rechazada.')} type="button">
                          Confirmar rechazo
                        </button>
                        <button className={BOTON} onClick={() => setRechazando(null)} type="button">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className={BOTON_PRIMARIO} onClick={() => ejecutar(() => aprobarSolicitud(s.id), 'Solicitud aprobada; se envió la invitación.')} type="button">
                        Aprobar
                      </button>
                      <button className={BOTON} onClick={() => setRechazando(s.id)} type="button">Rechazar</button>
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function useModelo() {
  const [modelos, setModelos] = useState([])
  const [modeloId, setModeloId] = useState('')
  const [modelo, setModelo] = useState(null)
  const [error, setError] = useState('')

  const cargarLista = useCallback(async () => {
    try {
      const lista = await listarModelos()
      setModelos(lista)
      setModeloId((actual) => actual || (lista.find((m) => m.publicado) ?? lista[0])?.id || '')
      return lista
    } catch (falla) {
      setError(mensajeDeError(falla))
      return []
    }
  }, [])

  const cargarModelo = useCallback(async (id) => {
    if (!id) return
    try {
      setModelo(await consultarModelo(id))
    } catch (falla) {
      setError(mensajeDeError(falla))
    }
  }, [])

  useEffect(() => {
    cargarLista()
  }, [cargarLista])

  useEffect(() => {
    cargarModelo(modeloId)
  }, [modeloId, cargarModelo])

  return { modelos, modeloId, setModeloId, modelo, error, recargar: async () => { await cargarLista(); await cargarModelo(modeloId) } }
}

function SelectorModelo({ modelos, modeloId, setModeloId }) {
  return (
    <label className="flex flex-col gap-1 font-label-md text-label-md max-w-sm">
      Versión del modelo
      <select className={CLASE_ENTRADA} onChange={(e) => setModeloId(e.target.value)} value={modeloId}>
        {modelos.map((m) => (
          <option key={m.id} value={m.id}>
            v{m.version} · {m.nombre} · {m.publicado ? 'publicada' : 'borrador'}
          </option>
        ))}
      </select>
    </label>
  )
}

function PestanaModelo({ estado }) {
  const { modelos, modeloId, setModeloId, modelo, error, recargar } = estado
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [pesos, setPesos] = useState({})
  const [nueva, setNueva] = useState(DIMENSION_VACIA)
  // null = sin formulario; 'nueva' = alta; un código = edición de esa pregunta.
  const [edicion, setEdicion] = useState(null)
  const [guardandoPregunta, setGuardandoPregunta] = useState(false)

  useEffect(() => {
    if (modelo) setPesos(Object.fromEntries(modelo.dimensiones.map((d) => [d.codigo, String(Number(d.peso))])))
  }, [modelo])

  async function ejecutar(accion, exito) {
    setMensaje({ tipo: 'info', texto: '' })
    try {
      const resultado = await accion()
      setMensaje({ tipo: 'exito', texto: exito })
      await recargar()
      return resultado
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
      return null
    }
  }

  async function nuevaVersion() {
    const creada = await ejecutar(() => crearNuevaVersion(modelo.id), 'Se creó una nueva versión en borrador.')
    if (creada) setModeloId(creada.id)
  }

  async function guardarPesos() {
    await ejecutar(async () => {
      for (const d of modelo.dimensiones) {
        if (Number(pesos[d.codigo]) !== Number(d.peso)) await editarDimension(modelo.id, d.codigo, { peso: String(pesos[d.codigo]) })
      }
    }, 'Ponderación guardada. Se valida que sume 1 al publicar.')
  }

  async function renombrar(d) {
    const nombre = window.prompt('Nombre de la dimensión', d.nombre)
    if (nombre === null || !nombre.trim() || nombre.trim() === d.nombre) return
    await ejecutar(() => editarDimension(modelo.id, d.codigo, { nombre: nombre.trim() }), 'Dimensión renombrada.')
  }

  async function quitar(d) {
    const aviso = `¿Quitar la dimensión «${d.nombre}» de este borrador? Se elimina de la versión (no queda inactiva) y solo es posible si ya no tiene preguntas activas.`
    if (!window.confirm(aviso)) return
    await ejecutar(() => quitarDimension(modelo.id, d.codigo), 'Dimensión quitada del borrador.')
  }

  async function agregar(e) {
    e.preventDefault()
    const creada = await ejecutar(
      () => agregarDimension(modelo.id, { ...nueva, orden: nueva.orden || siguienteOrden }),
      'Dimensión agregada. Ajuste los pesos para que sumen 1.',
    )
    if (creada) setNueva(DIMENSION_VACIA)
  }

  async function guardarPregunta(cuerpo, codigo) {
    setGuardandoPregunta(true)
    const creando = edicion === 'nueva'
    const resultado = await ejecutar(
      () => (creando ? agregarPregunta(modelo.id, cuerpo) : editarPregunta(modelo.id, edicion, cuerpo)),
      creando ? `Pregunta ${codigo} agregada.` : `Pregunta ${edicion} actualizada.`,
    )
    setGuardandoPregunta(false)
    if (resultado) setEdicion(null)
  }

  const suma = Object.values(pesos).reduce((acc, p) => acc + (Number(p) || 0), 0)
  const borrador = modelo && !modelo.publicado
  const siguienteOrden = modelo ? Math.max(0, ...modelo.dimensiones.map((d) => d.orden)) + 1 : 1

  return (
    <div className="flex flex-col gap-space-md">
      <Aviso tipo="error">{error}</Aviso>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SelectorModelo modeloId={modeloId} modelos={modelos} setModeloId={setModeloId} />
          {modelo && (
            <div className="flex gap-2">
              <button className={BOTON} onClick={nuevaVersion} type="button">Crear nueva versión</button>
              {borrador && (
                <button className={BOTON_PRIMARIO} onClick={() => ejecutar(() => publicarModelo(modelo.id), 'Versión publicada.')} type="button">
                  Publicar
                </button>
              )}
            </div>
          )}
        </div>
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
        {modelo && !borrador && (
          <Aviso tipo="info">
            Esta versión está publicada y es inmutable. Para cambiar la ponderación o las preguntas cree una nueva versión.
          </Aviso>
        )}
      </section>

      {modelo && (
        <>
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
            <h2 className="font-headline-md text-headline-md font-bold">Ponderación por dimensión</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
              Los pesos deben sumar 1 (suma actual: {numero(suma, 4)}).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...modelo.dimensiones].sort((a, b) => a.orden - b.orden).map((d) => (
                <div className="flex flex-col gap-2" key={d.codigo}>
                  <label className="flex flex-col gap-1 font-label-md text-label-md">
                    {d.nombre}
                    <input
                      className={CLASE_ENTRADA}
                      disabled={!borrador}
                      max="1"
                      min="0"
                      onChange={(e) => setPesos({ ...pesos, [d.codigo]: e.target.value })}
                      step="0.01"
                      type="number"
                      value={pesos[d.codigo] ?? ''}
                    />
                  </label>
                  {borrador && (
                    <div className="flex gap-2">
                      <button aria-label={`Renombrar ${d.nombre}`} className={BOTON} onClick={() => renombrar(d)} type="button">Renombrar</button>
                      <button aria-label={`Quitar ${d.nombre}`} className={BOTON} onClick={() => quitar(d)} type="button">Quitar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {borrador && (
              <button className={`${BOTON_PRIMARIO} mt-4`} onClick={guardarPesos} type="button">Guardar ponderación</button>
            )}

            {borrador && (
              <form className="mt-6 pt-4 border-t border-surface-container" onSubmit={agregar}>
                <h3 className="font-headline-sm text-headline-sm font-bold">Agregar dimensión</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                  La nueva dimensión necesita al menos una pregunta activa antes de publicar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex flex-col gap-1 font-label-md text-label-md">
                    Código
                    <input className={CLASE_ENTRADA} maxLength={50} onChange={(e) => setNueva({ ...nueva, codigo: e.target.value })} placeholder="ej. clientes" required value={nueva.codigo} />
                  </label>
                  <label className="flex flex-col gap-1 font-label-md text-label-md">
                    Nombre
                    <input className={CLASE_ENTRADA} maxLength={200} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} required value={nueva.nombre} />
                  </label>
                  <label className="flex flex-col gap-1 font-label-md text-label-md">
                    Peso
                    <input className={CLASE_ENTRADA} max="1" min="0" onChange={(e) => setNueva({ ...nueva, peso: e.target.value })} required step="0.01" type="number" value={nueva.peso} />
                  </label>
                  <label className="flex flex-col gap-1 font-label-md text-label-md">
                    Orden
                    <input className={CLASE_ENTRADA} min="1" onChange={(e) => setNueva({ ...nueva, orden: e.target.value })} placeholder={String(siguienteOrden)} type="number" value={nueva.orden} />
                  </label>
                  <label className="flex flex-col gap-1 font-label-md text-label-md sm:col-span-2 lg:col-span-4">
                    Descripción (opcional)
                    <input className={CLASE_ENTRADA} onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })} value={nueva.descripcion} />
                  </label>
                </div>
                <button className={`${BOTON_PRIMARIO} mt-4`} type="submit">Agregar dimensión</button>
              </form>
            )}
          </section>

          <EjesPerfilCultura
            alGuardar={(codigo, cambios) => ejecutar(() => editarEje(modelo.id, codigo, cambios), `Eje ${codigo} actualizado.`)}
            editable={Boolean(borrador)}
            modelo={modelo}
          />

          <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
            <div className="p-space-lg flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold">Banco de preguntas</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {modelo.preguntas.length} preguntas.{' '}
                  {borrador ? 'Puede agregar, editar, activar o desactivar preguntas.' : 'Solo lectura.'}
                </p>
              </div>
              {borrador && edicion === null && (
                <button className={BOTON_PRIMARIO} onClick={() => setEdicion('nueva')} type="button">Agregar pregunta</button>
              )}
            </div>
            {borrador && edicion !== null && (
              <FormularioPregunta
                alCancelar={() => setEdicion(null)}
                alGuardar={guardarPregunta}
                guardando={guardandoPregunta}
                key={edicion}
                modelo={modelo}
                pregunta={edicion === 'nueva' ? null : modelo.preguntas.find((p) => p.codigo === edicion)}
              />
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Enunciado</th>
                  <th className="py-3 px-4">Dimensión</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Peso</th>
                  <th className="py-3 px-4">Demo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container align-top">
                {[...modelo.preguntas].sort((a, b) => a.orden - b.orden).map((p) => (
                  <tr key={p.codigo}>
                    <td className="py-3 px-4 whitespace-nowrap">{p.codigo}</td>
                    <td className="py-3 px-4">{p.enunciado}</td>
                    <td className="py-3 px-4">{p.dimension_codigo}</td>
                    <td className="py-3 px-4">{p.tipo}</td>
                    <td className="py-3 px-4">{numero(p.peso, 2)}</td>
                    <td className="py-3 px-4">{p.en_demo ? 'Sí' : 'No'}</td>
                    <td className="py-3 px-4">{p.activo ? 'Activa' : 'Inactiva'}</td>
                    <td className="py-3 px-4">
                      {borrador && (
                        <div className="flex gap-2">
                          <button aria-label={`Editar ${p.codigo}`} className={BOTON} onClick={() => setEdicion(p.codigo)} type="button">
                            Editar
                          </button>
                          <button
                            aria-label={`${p.activo ? 'Desactivar' : 'Reactivar'} ${p.codigo}`}
                            className={BOTON}
                            onClick={() =>
                              ejecutar(
                                () => (p.activo ? desactivarPregunta(modelo.id, p.codigo) : reactivarPregunta(modelo.id, p.codigo)),
                                p.activo ? 'Pregunta desactivada.' : 'Pregunta reactivada.',
                              )
                            }
                            type="button"
                          >
                            {p.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}

function PestanaSimulacion({ estado }) {
  const { modelos, modeloId, setModeloId, modelo, error } = estado
  const [pesos, setPesos] = useState({})
  const [resultado, setResultado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [simulando, setSimulando] = useState(false)

  useEffect(() => {
    if (modelo) setPesos(Object.fromEntries(modelo.dimensiones.map((d) => [d.codigo, String(Number(d.peso))])))
    setResultado(null)
  }, [modelo])

  const suma = Object.values(pesos).reduce((acc, p) => acc + (Number(p) || 0), 0)

  async function simular(e) {
    e.preventDefault()
    setMensaje('')
    setSimulando(true)
    try {
      setResultado(await simularPesos(modeloId, pesos))
    } catch (falla) {
      setResultado(null)
      setMensaje(mensajeDeError(falla))
    } finally {
      setSimulando(false)
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <Aviso tipo="error">{error}</Aviso>
      <form className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-4" onSubmit={simular}>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Simular un cambio de pesos</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Recalcula en memoria los diagnósticos históricos de la versión con los pesos propuestos. No modifica ningún dato.
          </p>
        </div>
        <SelectorModelo modeloId={modeloId} modelos={modelos} setModeloId={setModeloId} />
        {modelo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...modelo.dimensiones].sort((a, b) => a.orden - b.orden).map((d) => (
              <label className="flex flex-col gap-1 font-label-md text-label-md" key={d.codigo}>
                {d.nombre} (actual {numero(d.peso, 2)})
                <input
                  className={CLASE_ENTRADA}
                  max="1"
                  min="0"
                  onChange={(e) => setPesos({ ...pesos, [d.codigo]: e.target.value })}
                  step="0.01"
                  type="number"
                  value={pesos[d.codigo] ?? ''}
                />
              </label>
            ))}
          </div>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">Suma propuesta: {numero(suma, 4)} (debe ser 1).</p>
        <Aviso tipo="error">{mensaje}</Aviso>
        <button className={`${BOTON_PRIMARIO} self-start`} disabled={simulando || !modelo} type="submit">
          {simulando ? 'Simulando…' : 'Simular'}
        </button>
      </form>

      {resultado && (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
          <div className="p-space-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><span className="font-label-caps text-label-caps text-outline uppercase block">Diagnósticos simulados</span><span className="font-headline-lg text-headline-lg font-bold">{resultado.total}</span></div>
            <div><span className="font-label-caps text-label-caps text-outline uppercase block">Cambian de nivel</span><span className="font-headline-lg text-headline-lg font-bold">{resultado.con_cambio_de_nivel}</span></div>
            <div><span className="font-label-caps text-label-caps text-outline uppercase block">Variación promedio del índice</span><span className="font-headline-lg text-headline-lg font-bold">{numero(resultado.variacion_promedio, 2)}</span></div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Diagnóstico</th>
                <th className="py-3 px-4">Original</th>
                <th className="py-3 px-4">Simulado</th>
                <th className="py-3 px-4">Variación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {resultado.comparaciones.map((c) => (
                <tr key={c.diagnostico_id}>
                  <td className="py-3 px-4">{c.empresa_nombre}</td>
                  <td className="py-3 px-4">N.° {c.consecutivo}</td>
                  <td className="py-3 px-4">{numero(c.indice_original)} (N{c.nivel_original})</td>
                  <td className="py-3 px-4">{numero(c.indice_simulado)} (N{c.nivel_simulado})</td>
                  <td className={`py-3 px-4 ${c.cambia_de_nivel ? 'font-bold text-error' : ''}`}>
                    {numero(c.variacion_indice, 2)}{c.cambia_de_nivel ? ' · cambia de nivel' : ''}
                  </td>
                </tr>
              ))}
              {resultado.no_simulables.map((n) => (
                <tr className="text-outline" key={n.diagnostico_id}>
                  <td className="py-3 px-4" colSpan="5">Diagnóstico {n.diagnostico_id} no simulable: {n.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

const PESTANAS = [
  { id: 'solicitudes', texto: 'Solicitudes de acceso' },
  { id: 'modelo', texto: 'Modelo y preguntas' },
  { id: 'simulacion', texto: 'Simulación de pesos' },
  { id: 'conocimiento', texto: 'Base de conocimiento' },
]

// HU-002, HU-029 a HU-035: solicitudes de acceso y gobierno del modelo de madurez.
export default function GestionCalibracion() {
  const [pestana, setPestana] = useState('solicitudes')
  const estadoModelo = useModelo()

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Administración</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Gestión y calibración</h1>
          <div className="flex gap-2 mt-space-md flex-wrap" role="tablist">
            {PESTANAS.map((p) => (
              <button
                aria-selected={pestana === p.id}
                className={`h-10 px-5 rounded-lg font-label-lg text-label-lg ${
                  pestana === p.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                }`}
                key={p.id}
                onClick={() => setPestana(p.id)}
                role="tab"
                type="button"
              >
                {p.texto}
              </button>
            ))}
          </div>
        </header>

        {pestana === 'solicitudes' && <PestanaSolicitudes />}
        {pestana === 'modelo' && <PestanaModelo estado={estadoModelo} />}
        {pestana === 'simulacion' && <PestanaSimulacion estado={estadoModelo} />}
        {pestana === 'conocimiento' && <BaseConocimiento />}
      </div>
    </main>
  )
}
