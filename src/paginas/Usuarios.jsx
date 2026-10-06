import { useCallback, useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { CLASE_ENTRADA } from '../componentes/TarjetaPublica.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import {
  agregarPermiso,
  asignarEmpresa,
  crearEmpresa,
  crearUsuario,
  desactivarEmpresa,
  desactivarUsuario,
  desbloquearUsuario,
  editarEmpresa,
  editarUsuario,
  finalizarAsignacion,
  listarEmpresas,
  listarPermisos,
  listarRoles,
  listarUsuarios,
  quitarPermiso,
  reactivarEmpresa,
  reactivarUsuario,
} from '../servicios/administracion'
import { listarSectores } from '../servicios/solicitudes'

const ROLES = [
  { codigo: 'representante', nombre: 'Representante' },
  { codigo: 'consultor', nombre: 'Consultor' },
  { codigo: 'administrador', nombre: 'Administrador' },
]

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-11 px-6 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

// Ejecuta una acción de administración mostrando su resultado y recargando.
function useAccion(recargar) {
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const ejecutar = useCallback(
    async (accion, exito) => {
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
    },
    [recargar],
  )
  return [mensaje, ejecutar]
}

function Etiqueta({ id, texto, children }) {
  return (
    <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface" htmlFor={id}>
      {texto}
      {children}
    </label>
  )
}

function PestanaUsuarios({ empresas }) {
  const { perfil } = useSesion()
  const [usuarios, setUsuarios] = useState([])
  const [filtro, setFiltro] = useState({ empresa_id: '', rol: '', texto: '' })
  const [nuevo, setNuevo] = useState({ correo: '', nombres: '', apellidos: '', rol: 'representante', empresaId: '' })
  const [asignacion, setAsignacion] = useState({ consultorId: '', empresaId: '' })
  const recargar = useCallback(
    () => listarUsuarios({ empresa_id: filtro.empresa_id }).then(setUsuarios),
    [filtro.empresa_id],
  )
  const [mensaje, ejecutar] = useAccion(recargar)

  useEffect(() => {
    recargar().catch(() => setUsuarios([]))
  }, [recargar])

  const visibles = usuarios.filter(
    (u) =>
      (!filtro.rol || u.rol_codigo === filtro.rol) &&
      (!filtro.texto || `${u.nombres} ${u.apellidos} ${u.correo}`.toLowerCase().includes(filtro.texto.toLowerCase())),
  )
  const consultores = usuarios.filter((u) => u.rol_codigo === 'consultor' && u.activo)
  const nombreEmpresa = (id) => empresas.find((e) => e.id === id)?.nombre ?? '—'

  async function crear(e) {
    e.preventDefault()
    const ok = await ejecutar(() => crearUsuario(nuevo), 'Usuario creado; se envió la invitación por correo.')
    if (ok) setNuevo({ correo: '', nombres: '', apellidos: '', rol: 'representante', empresaId: '' })
  }

  async function renombrar(u) {
    const nombres = window.prompt('Nombres', u.nombres)
    if (nombres === null) return
    const apellidos = window.prompt('Apellidos', u.apellidos)
    if (apellidos === null) return
    await ejecutar(() => editarUsuario(u.id, { nombres, apellidos }), 'Usuario actualizado.')
  }

  return (
    <div className="flex flex-col gap-space-md">
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>

      <form className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={crear}>
        <h2 className="md:col-span-3 font-headline-md text-headline-md font-bold">Crear usuario</h2>
        <Etiqueta id="u-correo" texto="Correo">
          <input className={CLASE_ENTRADA} id="u-correo" onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} required type="email" value={nuevo.correo} />
        </Etiqueta>
        <Etiqueta id="u-nombres" texto="Nombres">
          <input className={CLASE_ENTRADA} id="u-nombres" onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })} required value={nuevo.nombres} />
        </Etiqueta>
        <Etiqueta id="u-apellidos" texto="Apellidos">
          <input className={CLASE_ENTRADA} id="u-apellidos" onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })} required value={nuevo.apellidos} />
        </Etiqueta>
        <Etiqueta id="u-rol" texto="Rol">
          <select className={CLASE_ENTRADA} id="u-rol" onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })} value={nuevo.rol}>
            {ROLES.map((r) => (
              <option key={r.codigo} value={r.codigo}>{r.nombre}</option>
            ))}
          </select>
        </Etiqueta>
        {nuevo.rol === 'representante' && (
          <Etiqueta id="u-empresa" texto="Empresa">
            <select className={CLASE_ENTRADA} id="u-empresa" onChange={(e) => setNuevo({ ...nuevo, empresaId: e.target.value })} required value={nuevo.empresaId}>
              <option value="">Seleccione…</option>
              {empresas.filter((e) => e.activo).map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </Etiqueta>
        )}
        <div className="md:col-span-3">
          <button className={BOTON_PRIMARIO} type="submit">Crear e invitar</button>
        </div>
      </form>

      <form
        className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="md:col-span-4 font-headline-md text-headline-md font-bold">Asignar empresas a consultores</h2>
        <Etiqueta id="a-consultor" texto="Consultor">
          <select className={CLASE_ENTRADA} id="a-consultor" onChange={(e) => setAsignacion({ ...asignacion, consultorId: e.target.value })} value={asignacion.consultorId}>
            <option value="">Seleccione…</option>
            {consultores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>
            ))}
          </select>
        </Etiqueta>
        <Etiqueta id="a-empresa" texto="Empresa">
          <select className={CLASE_ENTRADA} id="a-empresa" onChange={(e) => setAsignacion({ ...asignacion, empresaId: e.target.value })} value={asignacion.empresaId}>
            <option value="">Seleccione…</option>
            {empresas.filter((e) => e.activo).map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </Etiqueta>
        <button
          className={BOTON_PRIMARIO}
          disabled={!asignacion.consultorId || !asignacion.empresaId}
          onClick={() => ejecutar(() => asignarEmpresa(asignacion.consultorId, asignacion.empresaId), 'Empresa asignada.')}
          type="button"
        >
          Asignar
        </button>
        <button
          className={BOTON}
          disabled={!asignacion.consultorId || !asignacion.empresaId}
          onClick={() => ejecutar(() => finalizarAsignacion(asignacion.consultorId, asignacion.empresaId), 'Asignación finalizada.')}
          type="button"
        >
          Finalizar asignación
        </button>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <div className="p-space-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Etiqueta id="f-texto" texto="Buscar">
            <input className={CLASE_ENTRADA} id="f-texto" onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} placeholder="Nombre o correo" value={filtro.texto} />
          </Etiqueta>
          <Etiqueta id="f-rol" texto="Rol">
            <select className={CLASE_ENTRADA} id="f-rol" onChange={(e) => setFiltro({ ...filtro, rol: e.target.value })} value={filtro.rol}>
              <option value="">Todos</option>
              {ROLES.map((r) => (
                <option key={r.codigo} value={r.codigo}>{r.nombre}</option>
              ))}
            </select>
          </Etiqueta>
          <Etiqueta id="f-empresa" texto="Empresa">
            <select className={CLASE_ENTRADA} id="f-empresa" onChange={(e) => setFiltro({ ...filtro, empresa_id: e.target.value })} value={filtro.empresa_id}>
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </Etiqueta>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Empresa</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {visibles.length === 0 && (
              <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="5">Sin usuarios.</td></tr>
            )}
            {visibles.map((u) => (
              <tr key={u.id}>
                <td className="py-3 px-4">
                  <div className="font-label-lg text-label-lg font-bold">{u.nombres} {u.apellidos}</div>
                  <div className="font-body-sm text-body-sm text-outline">{u.correo}</div>
                </td>
                <td className="py-3 px-4 capitalize">{u.rol_codigo}</td>
                <td className="py-3 px-4">{u.empresa_id ? nombreEmpresa(u.empresa_id) : '—'}</td>
                <td className="py-3 px-4">
                  {u.registro_pendiente ? 'Invitación pendiente' : u.activo ? 'Activo' : 'Inactivo'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button className={BOTON} onClick={() => renombrar(u)} type="button">Editar</button>
                    <button className={BOTON} onClick={() => ejecutar(() => desbloquearUsuario(u.id), 'Cuenta desbloqueada.')} type="button">Desbloquear</button>
                    {u.activo ? (
                      <button
                        className={BOTON}
                        disabled={u.id === perfil.id}
                        onClick={() => ejecutar(() => desactivarUsuario(u.id), 'Usuario desactivado.')}
                        type="button"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button className={BOTON} onClick={() => ejecutar(() => reactivarUsuario(u.id), 'Usuario reactivado.')} type="button">Reactivar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function PestanaEmpresas({ sectores, empresas, recargarEmpresas }) {
  const [nueva, setNueva] = useState({ nit: '', nombre: '', sector: '', empleados: '', ciudad: '' })
  const [filtro, setFiltro] = useState('')
  const [mensaje, ejecutar] = useAccion(recargarEmpresas)

  async function crear(e) {
    e.preventDefault()
    const sector = sectores.find((s) => s.codigo === nueva.sector)
    const ok = await ejecutar(() => crearEmpresa(nueva, sector), 'Empresa creada.')
    if (ok) setNueva({ nit: '', nombre: '', sector: '', empleados: '', ciudad: '' })
  }

  async function editar(emp) {
    const nombre = window.prompt('Nombre de la empresa', emp.nombre)
    if (nombre === null) return
    const empleados = window.prompt('Número de empleados', emp.numero_empleados ?? '')
    if (empleados === null) return
    await ejecutar(
      () => editarEmpresa(emp.id, { nombre, numero_empleados: empleados === '' ? undefined : Number(empleados) }),
      'Empresa actualizada.',
    )
  }

  const visibles = empresas.filter((e) => !filtro || e.nombre.toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div className="flex flex-col gap-space-md">
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      <form className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={crear}>
        <h2 className="md:col-span-3 font-headline-md text-headline-md font-bold">Crear empresa</h2>
        <Etiqueta id="e-nombre" texto="Nombre">
          <input className={CLASE_ENTRADA} id="e-nombre" onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} required value={nueva.nombre} />
        </Etiqueta>
        <Etiqueta id="e-nit" texto="NIT">
          <input className={CLASE_ENTRADA} id="e-nit" onChange={(e) => setNueva({ ...nueva, nit: e.target.value })} required value={nueva.nit} />
        </Etiqueta>
        <Etiqueta id="e-sector" texto="Sector">
          <select className={CLASE_ENTRADA} id="e-sector" onChange={(e) => setNueva({ ...nueva, sector: e.target.value })} required value={nueva.sector}>
            <option value="">Seleccione…</option>
            {sectores.map((s) => (
              <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
            ))}
          </select>
        </Etiqueta>
        <Etiqueta id="e-empleados" texto="Empleados">
          <input className={CLASE_ENTRADA} id="e-empleados" min="1" onChange={(e) => setNueva({ ...nueva, empleados: e.target.value })} required type="number" value={nueva.empleados} />
        </Etiqueta>
        <Etiqueta id="e-ciudad" texto="Ciudad (opcional)">
          <input className={CLASE_ENTRADA} id="e-ciudad" onChange={(e) => setNueva({ ...nueva, ciudad: e.target.value })} value={nueva.ciudad} />
        </Etiqueta>
        <div className="md:col-span-3">
          <button className={BOTON_PRIMARIO} type="submit">Crear empresa</button>
        </div>
      </form>

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <div className="p-space-lg max-w-sm">
          <Etiqueta id="e-filtro" texto="Buscar por nombre">
            <input className={CLASE_ENTRADA} id="e-filtro" onChange={(e) => setFiltro(e.target.value)} value={filtro} />
          </Etiqueta>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
              <th className="py-3 px-4">Empresa</th>
              <th className="py-3 px-4">NIT</th>
              <th className="py-3 px-4">Sector</th>
              <th className="py-3 px-4">Empleados</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {visibles.length === 0 && (
              <tr><td className="py-4 px-4 text-on-surface-variant" colSpan="6">Sin empresas.</td></tr>
            )}
            {visibles.map((e) => (
              <tr key={e.id}>
                <td className="py-3 px-4 font-label-lg text-label-lg font-bold">{e.nombre}</td>
                <td className="py-3 px-4">{e.nit ?? '—'}</td>
                <td className="py-3 px-4">{e.sector_nombre ?? '—'}</td>
                <td className="py-3 px-4">{e.numero_empleados ?? '—'}</td>
                <td className="py-3 px-4">{e.activo ? 'Activa' : 'Inactiva'}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <div className="flex gap-2 justify-end">
                    <button className={BOTON} onClick={() => editar(e)} type="button">Editar</button>
                    {e.activo ? (
                      <button className={BOTON} onClick={() => ejecutar(() => desactivarEmpresa(e.id), 'Empresa desactivada.')} type="button">Desactivar</button>
                    ) : (
                      <button className={BOTON} onClick={() => ejecutar(() => reactivarEmpresa(e.id), 'Empresa reactivada.')} type="button">Reactivar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function PestanaPermisos() {
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const recargar = useCallback(() => listarRoles().then(setRoles), [])
  const [mensaje, ejecutar] = useAccion(recargar)

  useEffect(() => {
    recargar().catch(() => setRoles([]))
    listarPermisos().then(setPermisos).catch(() => setPermisos([]))
  }, [recargar])

  const modulos = [...new Set(permisos.map((p) => p.modulo))]

  return (
    <div className="flex flex-col gap-space-md">
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <div className="p-space-lg border-b border-surface-container">
          <h2 className="font-headline-md text-headline-md font-bold">Permisos por rol</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Los cambios aplican en la siguiente sesión de cada persona. Los roles de sistema no se pueden eliminar.
          </p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
              <th className="py-3 px-4">Permiso</th>
              {roles.map((r) => (
                <th className="py-3 px-4 text-center" key={r.codigo}>{r.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {modulos.map((modulo) => (
              <FilasModulo ejecutar={ejecutar} key={modulo} modulo={modulo} permisos={permisos} roles={roles} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function FilasModulo({ modulo, permisos, roles, ejecutar }) {
  return (
    <>
      <tr className="bg-surface-container-low/50">
        <td className="py-2 px-4 font-label-caps text-label-caps uppercase text-secondary" colSpan={roles.length + 1}>{modulo}</td>
      </tr>
      {permisos.filter((p) => p.modulo === modulo).map((p) => (
        <tr key={p.codigo}>
          <td className="py-3 px-4">
            <div className="font-label-lg text-label-lg">{p.codigo}</div>
            <div className="font-body-sm text-body-sm text-outline">{p.descripcion}</div>
          </td>
          {roles.map((r) => {
            const tiene = r.permisos.includes(p.codigo)
            return (
              <td className="py-3 px-4 text-center" key={r.codigo}>
                <input
                  aria-label={`${r.nombre}: ${p.codigo}`}
                  checked={tiene}
                  className="w-4 h-4 accent-primary"
                  onChange={() =>
                    ejecutar(
                      () => (tiene ? quitarPermiso(r.codigo, p.codigo) : agregarPermiso(r.codigo, p.codigo)),
                      tiene ? 'Permiso retirado.' : 'Permiso concedido.',
                    )
                  }
                  type="checkbox"
                />
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}

const PESTANAS = [
  { id: 'usuarios', texto: 'Usuarios' },
  { id: 'empresas', texto: 'Empresas' },
  { id: 'permisos', texto: 'Roles y permisos' },
]

// HU-025 a HU-028: administración de usuarios, empresas, asignaciones y permisos.
export default function Usuarios() {
  const [pestana, setPestana] = useState('usuarios')
  const [empresas, setEmpresas] = useState([])
  const [sectores, setSectores] = useState([])
  const [error, setError] = useState('')

  const recargarEmpresas = useCallback(() => listarEmpresas({ solo_activas: false }).then(setEmpresas), [])

  useEffect(() => {
    recargarEmpresas().catch((falla) => setError(mensajeDeError(falla)))
    listarSectores().then(setSectores).catch(() => setSectores([]))
  }, [recargarEmpresas])

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Administración</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Usuarios, empresas y permisos</h1>
          <Aviso tipo="error">{error}</Aviso>
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

        {pestana === 'usuarios' && <PestanaUsuarios empresas={empresas} />}
        {pestana === 'empresas' && <PestanaEmpresas empresas={empresas} recargarEmpresas={recargarEmpresas} sectores={sectores} />}
        {pestana === 'permisos' && <PestanaPermisos />}
      </div>
    </main>
  )
}
