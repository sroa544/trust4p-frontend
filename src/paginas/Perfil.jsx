import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { CLASE_BOTON, CLASE_ENTRADA, Campo } from '../componentes/TarjetaPublica.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import { actualizarPerfil, cambiarContrasena, eliminarMisDatos } from '../servicios/autenticacion'
import { TEXTO_POLITICA_CLAVE, evaluarClave } from '../servicios/validaciones'

const ROLES = { representante: 'Representante de empresa', consultor: 'Consultor', administrador: 'Administrador' }

function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
      <div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{titulo}</h2>
        {descripcion && <p className="font-body-sm text-body-sm text-on-surface-variant">{descripcion}</p>}
      </div>
      {children}
    </section>
  )
}

function DatosPersonales() {
  const { perfil, recargar } = useSesion()
  const [datos, setDatos] = useState({
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    cargo: perfil.cargo ?? '',
    telefono: perfil.telefono ?? '',
  })
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [enviando, setEnviando] = useState(false)
  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    setMensaje({ tipo: 'info', texto: '' })
    setEnviando(true)
    try {
      await actualizarPerfil({
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        cargo: datos.cargo.trim() || null,
        telefono: datos.telefono.trim() || null,
      })
      await recargar()
      setMensaje({ tipo: 'exito', texto: 'Datos actualizados.' })
    } catch (falla) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(falla) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Seccion descripcion="El correo y el rol los administra la plataforma." titulo="Datos personales">
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={guardar}>
        <Campo etiqueta="Nombres" id="nombres">
          <input className={CLASE_ENTRADA} id="nombres" onChange={cambiar('nombres')} required value={datos.nombres} />
        </Campo>
        <Campo etiqueta="Apellidos" id="apellidos">
          <input className={CLASE_ENTRADA} id="apellidos" onChange={cambiar('apellidos')} required value={datos.apellidos} />
        </Campo>
        <Campo etiqueta="Cargo" id="cargo" requerido={false}>
          <input className={CLASE_ENTRADA} id="cargo" onChange={cambiar('cargo')} value={datos.cargo} />
        </Campo>
        <Campo etiqueta="Teléfono" id="telefono" requerido={false}>
          <input className={CLASE_ENTRADA} id="telefono" onChange={cambiar('telefono')} type="tel" value={datos.telefono} />
        </Campo>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
          <button className={`${CLASE_BOTON} sm:w-60`} disabled={enviando} type="submit">
            {enviando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Seccion>
  )
}

function CambioDeClave() {
  const { recargar } = useSesion()
  const navigate = useNavigate()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const criterios = evaluarClave(nueva)

  async function enviar(e) {
    e.preventDefault()
    if (nueva !== confirmar) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await cambiarContrasena(actual, nueva, confirmar)
      // El backend cierra las sesiones al cambiar la contraseña (RF-26).
      await recargar()
      navigate('/login', { replace: true, state: { aviso: 'Contraseña actualizada. Inicie sesión de nuevo.' } })
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Seccion descripcion={TEXTO_POLITICA_CLAVE} titulo="Cambiar contraseña">
      <form className="grid grid-cols-1 sm:grid-cols-3 gap-4" onSubmit={enviar}>
        <Campo etiqueta="Contraseña actual" id="actual">
          <input autoComplete="current-password" className={CLASE_ENTRADA} id="actual" onChange={(e) => setActual(e.target.value)} required type="password" value={actual} />
        </Campo>
        <Campo ayuda={nueva && !criterios.cumple ? 'Aún no cumple la política.' : undefined} etiqueta="Contraseña nueva" id="nueva">
          <input autoComplete="new-password" className={CLASE_ENTRADA} id="nueva" onChange={(e) => setNueva(e.target.value)} required type="password" value={nueva} />
        </Campo>
        <Campo etiqueta="Confirmar" id="confirmar">
          <input autoComplete="new-password" className={CLASE_ENTRADA} id="confirmar" onChange={(e) => setConfirmar(e.target.value)} required type="password" value={confirmar} />
        </Campo>
        <div className="sm:col-span-3 flex flex-col gap-2">
          <Aviso tipo="error">{error}</Aviso>
          <button className={`${CLASE_BOTON} sm:w-60`} disabled={enviando} type="submit">
            {enviando ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </Seccion>
  )
}

function EliminarDatos() {
  const { recargar } = useSesion()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function eliminar() {
    setError('')
    setEnviando(true)
    try {
      await eliminarMisDatos()
      await recargar()
      navigate('/login', { replace: true, state: { aviso: 'Sus datos personales fueron eliminados.' } })
    } catch (falla) {
      setError(mensajeDeError(falla))
      setEnviando(false)
    }
  }

  return (
    <Seccion
      descripcion="Anonimiza sus datos personales y cierra su cuenta (Ley 1581 de 2012). Esta acción no se puede deshacer."
      titulo="Eliminar mis datos personales"
    >
      {!abierto ? (
        <button
          className="h-11 px-5 rounded-lg bg-error-container text-on-error-container font-label-lg text-label-lg font-semibold self-start"
          onClick={() => setAbierto(true)}
          type="button"
        >
          Quiero eliminar mis datos
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <Aviso tipo="error">
            ¿Seguro? Perderá el acceso a la plataforma y no podrá recuperar su cuenta.
          </Aviso>
          <Aviso tipo="error">{error}</Aviso>
          <div className="flex gap-3">
            <button className="h-11 px-5 rounded-lg bg-error text-on-error font-label-lg text-label-lg font-semibold disabled:opacity-60" disabled={enviando} onClick={eliminar} type="button">
              {enviando ? 'Eliminando…' : 'Sí, eliminar definitivamente'}
            </button>
            <button className="h-11 px-5 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg" disabled={enviando} onClick={() => setAbierto(false)} type="button">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Seccion>
  )
}

export default function Perfil() {
  const { perfil } = useSesion()
  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Mi cuenta</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">
            {perfil.nombres} {perfil.apellidos}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {perfil.correo} · {ROLES[perfil.rol_codigo] ?? perfil.rol_codigo}
            {perfil.empresa_nombre ? ` · ${perfil.empresa_nombre}` : ''}
          </p>
        </header>
        <DatosPersonales />
        <CambioDeClave />
        <EliminarDatos />
      </div>
    </main>
  )
}
