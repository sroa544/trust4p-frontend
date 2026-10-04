import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import {
  actualizarPerfil,
  completarRegistro,
  consultarInvitacion,
} from '../servicios/autenticacion'
import {
  REGLAS_CLAVE,
  TEXTO_POLITICA_CLAVE,
  dividirNombre,
  evaluarClave,
  formatearFecha,
} from '../servicios/validaciones'

const ROLES = {
  representante: 'Representante de empresa',
  consultor: 'Consultor',
  administrador: 'Administrador',
}

// Estado inicial: todavía no se ha escrito nada, no es una valoración.
const SIN_CLAVE = { texto: 'Pendiente', color: 'text-outline', relleno: 'bg-transparent', ancho: '0%' }

// Índice = reglas de la política cumplidas (0 a 5). Con cero se muestra un
// tramo mínimo para que haya señal visual.
const NIVELES_CLAVE = [
  { texto: 'Muy baja', color: 'text-error', relleno: 'bg-error', ancho: '10%' },
  { texto: 'Muy baja', color: 'text-error', relleno: 'bg-error', ancho: '20%' },
  { texto: 'Baja', color: 'text-error', relleno: 'bg-error', ancho: '40%' },
  { texto: 'Media', color: 'text-secondary', relleno: 'bg-secondary', ancho: '60%' },
  { texto: 'Robusta', color: 'text-secondary', relleno: 'bg-secondary-fixed-dim', ancho: '80%' },
  { texto: 'Excelente', color: 'text-tertiary', relleno: 'bg-tertiary', ancho: '100%' },
]

function Pantalla({ children }) {
  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg max-w-lg text-center flex flex-col gap-space-sm">
        {children}
      </div>
    </main>
  )
}

export default function Registro() {
  const [parametros] = useSearchParams()
  const codigo = parametros.get('codigo') ?? ''
  const [invitacion, setInvitacion] = useState(null)
  const [estadoInvitacion, setEstadoInvitacion] = useState(codigo ? 'cargando' : 'invalida')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [cargo, setCargo] = useState('')
  const [clave, setClave] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [verConfirmacion, setVerConfirmacion] = useState(false)
  const [acepto, setAcepto] = useState(false)
  const [represento, setRepresento] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const { iniciarSesion } = useSesion()

  useEffect(() => {
    if (!codigo) return undefined
    let activo = true
    consultarInvitacion(codigo)
      .then((datos) => {
        if (!activo) return
        const partes = dividirNombre(datos.nombre)
        setInvitacion(datos)
        setNombres(partes.nombres)
        setApellidos(partes.apellidos)
        setEstadoInvitacion('lista')
      })
      .catch(() => activo && setEstadoInvitacion('invalida'))
    return () => {
      activo = false
    }
  }, [codigo])

  const criterios = evaluarClave(clave)
  const puntaje = REGLAS_CLAVE.filter((regla) => criterios[regla.clave]).length
  const nivel = clave.length === 0 ? SIN_CLAVE : NIVELES_CLAVE[puntaje]

  async function enviar(e) {
    e.preventDefault()
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await completarRegistro({
        codigo,
        clave,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        aceptoTratamiento: acepto,
      })
      await iniciarSesion(invitacion.correo, clave)
      if (cargo.trim()) {
        try {
          await actualizarPerfil({ cargo: cargo.trim() })
        } catch {
          // El cargo es opcional para el acceso; se puede completar en "Mi cuenta".
        }
      }
      navigate('/panel', { replace: true })
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  if (estadoInvitacion === 'cargando') {
    return (
      <Pantalla>
        <span className="font-body-md text-body-md text-on-surface-variant" role="status">
          Verificando la invitación…
        </span>
      </Pantalla>
    )
  }

  if (estadoInvitacion === 'invalida') {
    return (
      <Pantalla>
        <span className="material-symbols-outlined text-error text-4xl">link_off</span>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
          La invitación no es válida
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          El enlace ya fue utilizado, venció o no existe. Puedes solicitar acceso de nuevo para
          que la consultora emita otra invitación.
        </p>
        <Link
          className="inline-flex items-center justify-center gap-1 h-11 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg"
          to="/solicitar-acceso"
        >
          Solicitar una nueva invitación
        </Link>
        <Link className="font-label-md text-label-md text-primary" to="/login">
          Volver al inicio de sesión
        </Link>
      </Pantalla>
    )
  }

  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto min-w-0">
        <div className="w-full h-1.5 bg-gradient-to-r from-secondary via-tertiary-fixed-dim to-primary rounded-t-xl"></div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-xl rounded-b-xl bg-surface-container-lowest">
          <aside className="lg:col-span-5 relative bg-primary-container text-on-primary flex flex-col justify-between p-6 sm:p-8 xl:p-10 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-secondary-fixed opacity-10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-tertiary-fixed opacity-15 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <img alt="Trust 4P" className="h-10 w-auto object-contain" src="/logo-trust4p-blanco.png" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-label-caps text-label-caps tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  INVITACIÓN OFICIAL
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <h1 className="font-headline-xl text-headline-xl text-on-primary font-bold tracking-tight">
                  Activación de Cuenta Corporativa
                </h1>
                <p className="font-body-md text-body-md text-on-primary-container">
                  Has sido invitado para conducir el diagnóstico de madurez de innovación de tu organización.
                </p>
              </div>

              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-xl p-5 shadow-sm space-y-3.5">
                {invitacion.empresa_nombre && (
                  <div className="flex items-start justify-between pb-3 border-b border-on-primary/10">
                    <div className="space-y-0.5">
                      <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Empresa asignada</span>
                      <p className="font-headline-sm text-headline-sm text-on-primary font-semibold">{invitacion.empresa_nombre}</p>
                      {invitacion.empresa_nit && (
                        <p className="font-body-sm text-body-sm text-on-primary-container">NIT: {invitacion.empresa_nit}</p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Rol asignado</span>
                    <p className="font-body-sm text-body-sm text-on-primary font-semibold">{ROLES[invitacion.rol_codigo] ?? invitacion.rol_codigo}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Vigente hasta</span>
                    <p className="font-body-sm text-body-sm text-tertiary-fixed font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {formatearFecha(invitacion.expira_en)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-on-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">lock</span>
                <span className="font-body-sm text-[11px] leading-tight">Sesión segura</span>
              </div>
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">verified_user</span>
                <span className="font-body-sm text-[11px] leading-tight">Acuerdo de confidencialidad</span>
              </div>
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">shield</span>
                <span className="font-body-sm text-[11px] leading-tight">Ley 1581 de 2012</span>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-10 xl:p-12 flex flex-col justify-between">
            <div className="w-full max-w-xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold">1</span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">Credenciales de acceso</span>
                </div>
                <Link className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-primary-container transition-colors group" to="/login">
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                  Volver
                </Link>
              </div>

              <div className="space-y-1">
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Configura tus credenciales</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {invitacion.empresa_nombre
                    ? `Completa la información para vincular tu perfil a ${invitacion.empresa_nombre}`
                    : 'Completa la información para activar tu cuenta'}
                </p>
              </div>

              <form className="space-y-5" onSubmit={enviar}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="nombres">
                      Nombres <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full h-11 px-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                      id="nombres"
                      name="nombres"
                      required
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="apellidos">
                      Apellidos <span className="text-error">*</span>
                    </label>
                    <input
                      className="w-full h-11 px-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                      id="apellidos"
                      name="apellidos"
                      required
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="correo">Correo corporativo</label>
                    <span className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase font-bold text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Verificado
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-high text-on-surface-variant cursor-not-allowed rounded-lg font-body-md text-body-md font-medium select-all shadow-inner"
                      id="correo"
                      name="correo"
                      readOnly
                      type="email"
                      value={invitacion.correo}
                    />
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    El correo está ligado a la invitación y no puede modificarse.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="cargo">
                    Cargo
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm transition-all"
                      id="cargo"
                      name="cargo"
                      placeholder="ej. Director de Innovación"
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="clave">
                      Crear contraseña <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">key</span>
                      <input
                        autoComplete="new-password"
                        className="w-full h-11 pl-11 pr-10 bg-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm transition-all"
                        id="clave"
                        name="clave"
                        placeholder="Ingresa tu contraseña"
                        required
                        type={verClave ? 'text' : 'password'}
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                      />
                      <button
                        aria-label="Alternar visibilidad de la contraseña"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none"
                        onClick={() => setVerClave(!verClave)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">{verClave ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="confirmacion">
                      Confirmar contraseña <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock_reset</span>
                      <input
                        autoComplete="new-password"
                        className="w-full h-11 pl-11 pr-10 bg-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm transition-all"
                        id="confirmacion"
                        name="confirmacion"
                        placeholder="Repite tu contraseña"
                        required
                        type={verConfirmacion ? 'text' : 'password'}
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                      />
                      <button
                        aria-label="Alternar visibilidad de la confirmación"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none"
                        onClick={() => setVerConfirmacion(!verConfirmacion)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">{verConfirmacion ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between font-label-md text-label-md">
                    <span className="text-on-surface-variant font-medium">Seguridad de la contraseña:</span>
                    <span className={`font-bold ${nivel.color}`}>{nivel.texto}</span>
                  </div>
                  <div
                    aria-label={`Seguridad de la contraseña: ${nivel.texto}`}
                    aria-valuemax={5}
                    aria-valuemin={0}
                    aria-valuenow={clave.length === 0 ? 0 : puntaje}
                    className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden"
                    role="progressbar"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${nivel.relleno}`}
                      style={{ width: nivel.ancho }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-body-sm text-[11px]">
                    {REGLAS_CLAVE.map((regla) => (
                      <span
                        key={regla.clave}
                        className={`flex items-center gap-1 ${criterios[regla.clave] ? 'text-tertiary font-medium' : 'text-outline'}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {criterios[regla.clave] ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {regla.texto}
                      </span>
                    ))}
                  </div>
                  <p className="font-body-sm text-[11px] text-outline">{TEXTO_POLITICA_CLAVE}</p>
                </div>

                <fieldset className="space-y-3 pt-1">
                  <legend className="sr-only">Consentimiento y tratamiento de datos</legend>
                  <div className="flex items-start gap-3">
                    <input
                      checked={acepto}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                      id="acuerdo_confidencialidad"
                      name="acuerdo_confidencialidad"
                      onChange={(e) => setAcepto(e.target.checked)}
                      required
                      type="checkbox"
                    />
                    <label className="font-body-sm text-body-sm text-on-surface leading-relaxed cursor-pointer select-none" htmlFor="acuerdo_confidencialidad">
                      Acepto los términos del acuerdo de confidencialidad y autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      checked={represento}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                      id="representacion"
                      name="representacion"
                      onChange={(e) => setRepresento(e.target.checked)}
                      required
                      type="checkbox"
                    />
                    <label className="font-body-sm text-body-sm text-on-surface leading-relaxed cursor-pointer select-none" htmlFor="representacion">
                      Confirmo que actúo en representación de la organización designada y que mis respuestas reflejarán la realidad operativa del negocio.
                    </label>
                  </div>
                </fieldset>

                <Aviso className="text-center" tipo="error">{error}</Aviso>

                <div className="pt-3">
                  <button
                    className="w-full h-12 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] group disabled:opacity-60"
                    disabled={enviando}
                    type="submit"
                  >
                    <span>{enviando ? 'Creando cuenta…' : 'Crear cuenta y activar diagnóstico'}</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="font-body-sm text-body-sm text-on-surface-variant">¿Tienes dudas sobre tu rol o empresa asignada?</p>
                <a className="font-label-md text-label-md font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors" href="mailto:soporte@trust4p.com">
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  Contactar al consultor
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
