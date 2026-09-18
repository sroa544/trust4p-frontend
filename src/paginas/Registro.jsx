import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Datos provisionales. Se reemplazan por la respuesta del endpoint de
// invitación cuando exista la API de negocio (objetivo 3).
const INVITACION = {
  empresaId: 'EMP-900842119',
  empresaNombre: 'InnovaTech Logistics Corp.',
  empresaNit: '900.842.119-4',
  diagnosticoId: 'DIAG-2026-8842',
  modeloVersion: '2026.1',
  nombre: 'Alejandro Morales Peña',
  correo: 'a.morales@innovatech.com',
  rol: 'Sponsor de Innovación',
}

const NIVELES_CLAVE = [
  { texto: 'Pendiente', color: 'text-outline', barras: [] },
  { texto: 'Baja', color: 'text-error', barras: ['bg-error'] },
  { texto: 'Media', color: 'text-secondary', barras: ['bg-secondary', 'bg-secondary'] },
  {
    texto: 'Robusta',
    color: 'text-secondary',
    barras: ['bg-secondary-fixed-dim', 'bg-secondary-fixed-dim', 'bg-secondary'],
  },
  {
    texto: 'Excelente',
    color: 'text-tertiary',
    barras: ['bg-tertiary-fixed-dim', 'bg-tertiary-fixed-dim', 'bg-tertiary-container', 'bg-tertiary'],
  },
]

function evaluarClave(clave) {
  return {
    longitud: clave.length >= 8,
    mayuscula: /[A-Z]/.test(clave),
    numero: /[0-9]/.test(clave),
    especial: /[^A-Za-z0-9]/.test(clave),
  }
}

export default function Registro() {
  const [clave, setClave] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [verConfirmacion, setVerConfirmacion] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const criterios = evaluarClave(clave)
  const puntaje = Object.values(criterios).filter(Boolean).length
  const nivel = clave.length === 0 ? NIVELES_CLAVE[0] : NIVELES_CLAVE[puntaje]

  const listaCriterios = [
    { cumple: criterios.longitud, texto: 'Mínimo 8 caracteres' },
    { cumple: criterios.mayuscula, texto: 'Al menos 1 mayúscula' },
    { cumple: criterios.numero, texto: 'Incluye números' },
    { cumple: criterios.especial, texto: 'Símbolo especial (!@#$)' },
  ]

  function enviar(e) {
    e.preventDefault()
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (puntaje < 4) {
      setError('La contraseña no cumple todos los criterios de seguridad.')
      return
    }
    setError('')
    navigate('/panel')
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
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center backdrop-blur-sm shadow-sm">
                    <svg className="w-6 h-6 text-secondary-fixed" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 11C7 8.23858 9.23858 6 12 6H16C18.7614 6 21 8.23858 21 11V13C21 15.7614 18.7614 18 16 18H12C9.23858 18 7 15.7614 7 13V11Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                      <path d="M11 19C11 16.2386 13.2386 14 16 14H20C22.7614 14 25 16.2386 25 19V21C25 23.7614 22.7614 26 20 26H16C13.2386 26 11 23.7614 11 21V19Z" stroke="#9ECC89" strokeLinecap="round" strokeWidth="2.5"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-primary">
                      TRUST <span className="text-secondary-fixed">4P</span>
                    </span>
                    <span className="font-label-caps text-label-caps text-on-primary-container tracking-wider">DE LA VISIÓN A LA SOLUCIÓN</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-label-caps text-label-caps tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  INVITACIÓN OFICIAL v{INVITACION.modeloVersion}
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
                <div className="flex items-start justify-between pb-3 border-b border-on-primary/10">
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Empresa asignada</span>
                    <p className="font-headline-sm text-headline-sm text-on-primary font-semibold">{INVITACION.empresaNombre}</p>
                    <p className="font-body-sm text-body-sm text-on-primary-container">NIT: {INVITACION.empresaNit}</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Rol asignado</span>
                    <p className="font-body-sm text-body-sm text-on-primary font-semibold">{INVITACION.rol}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Diagnóstico</span>
                    <p className="font-body-sm text-body-sm text-secondary-fixed font-mono font-medium">{INVITACION.diagnosticoId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Versión del modelo</span>
                    <p className="font-body-sm text-body-sm text-on-primary font-medium">{INVITACION.modeloVersion}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Vigencia</span>
                    <p className="font-body-sm text-body-sm text-tertiary-fixed font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 72 horas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-on-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">lock</span>
                <span className="font-body-sm text-[11px] leading-tight">Cifrado extremo a extremo</span>
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
                  Completa la información para vincular tu perfil al diagnóstico de {INVITACION.empresaNombre}
                </p>
              </div>

              <form className="space-y-5" onSubmit={enviar}>
                <input name="empresa_id" type="hidden" defaultValue={INVITACION.empresaId} />
                <input name="diagnostico_id" type="hidden" defaultValue={INVITACION.diagnosticoId} />
                <input name="modelo_version" type="hidden" defaultValue={INVITACION.modeloVersion} />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="nombre">Nombre completo</label>
                    <span className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      Precargado
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-high text-on-surface-variant cursor-not-allowed rounded-lg font-body-md text-body-md font-medium select-all shadow-inner"
                      id="nombre"
                      name="nombre"
                      readOnly
                      type="text"
                      value={INVITACION.nombre}
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
                      value={INVITACION.correo}
                    />
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    El correo está ligado al token de invitación y no puede modificarse.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-label-lg text-label-lg font-semibold text-on-surface" htmlFor="cargo">
                    Cargo <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                    <input
                      className="w-full h-11 pl-11 pr-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm transition-all"
                      id="cargo"
                      name="cargo"
                      placeholder="ej. Director de Innovación"
                      required
                      type="text"
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
                  <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden flex">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-full w-1/4 transition-all duration-300 ${nivel.barras[i] || 'bg-transparent'}`}></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-body-sm text-[11px]">
                    {listaCriterios.map((criterio) => (
                      <span
                        key={criterio.texto}
                        className={`flex items-center gap-1 ${criterio.cumple ? 'text-tertiary font-medium' : 'text-outline'}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {criterio.cumple ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {criterio.texto}
                      </span>
                    ))}
                  </div>
                </div>

                <fieldset className="space-y-3 pt-1">
                  <legend className="sr-only">Consentimiento y tratamiento de datos</legend>
                  <div className="flex items-start gap-3">
                    <input
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                      id="acuerdo_confidencialidad"
                      name="acuerdo_confidencialidad"
                      required
                      type="checkbox"
                    />
                    <label className="font-body-sm text-body-sm text-on-surface leading-relaxed cursor-pointer select-none" htmlFor="acuerdo_confidencialidad">
                      Acepto los términos del <a className="font-semibold text-primary underline hover:text-primary-container" href="#nda">acuerdo de confidencialidad</a> y autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                      id="representacion"
                      name="representacion"
                      required
                      type="checkbox"
                    />
                    <label className="font-body-sm text-body-sm text-on-surface leading-relaxed cursor-pointer select-none" htmlFor="representacion">
                      Confirmo que actúo en representación de la organización designada y que mis respuestas reflejarán la realidad operativa del negocio.
                    </label>
                  </div>
                </fieldset>

                {error && (
                  <p className="p-2.5 rounded-md bg-error-container text-on-error-container font-label-md text-label-md text-center">
                    {error}
                  </p>
                )}

                <div className="pt-3">
                  <button
                    className="w-full h-12 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] group"
                    type="submit"
                  >
                    <span>Crear cuenta y activar diagnóstico</span>
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