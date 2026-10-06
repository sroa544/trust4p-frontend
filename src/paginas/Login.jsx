import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import {
  ResumenDelModelo,
  SeccionDimensiones,
  SeccionNiveles,
  useModeloVigente,
} from '../componentes/EstructuraDelModelo.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'

export default function Login() {
  const [verClave, setVerClave] = useState(false)
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const { iniciarSesion } = useSesion()
  const { modelo } = useModeloVigente()

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(correo.trim(), clave)
      navigate(ubicacion.state?.desde ?? '/panel', { replace: true })
    } catch (falla) {
      setError(mensajeDeError(falla))
      setClave('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto text-on-surface">

        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 lg:py-12">

          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/30 text-primary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">Plataforma de Diagnóstico Estratégico</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-tight">
                De la Visión a la Solución: Evalúa y Acelera la Cultura de Innovación
              </h1>
              <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary"></div>
            </div>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Mide el nivel de madurez real de tu empresa a través del modelo Trust 4P. Identifica brechas, gestiona iniciativas empíricas y conecta decisiones estratégicas con asignación presupuestaria ágil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-2">
              <ResumenDelModelo modelo={modelo} />
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-tertiary mb-2">
                  <span className="material-symbols-outlined text-headline-md">model_training</span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">IA</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant font-medium">Diagnóstico &amp; Recomendaciones</p>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">Puntaje determinista con narrativa asistida por un agente</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-label-md text-label-md">
                <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span>Confidencialidad empresarial garantizada</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-md text-label-md">
                <span className="material-symbols-outlined text-secondary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span>Tratamiento de datos conforme a la Ley 1581 de 2012</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-md text-label-md">
                <span className="material-symbols-outlined text-tertiary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span>Reportes ejecutivos auditables</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary"></div>

              <div className="flex flex-col items-start gap-4 mb-6">
                <div className="h-10 flex items-center">
                  <img alt="Logo Trust 4P" className="h-8 object-contain" src="/logo-trust4p.png" />
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Ingreso Corporativo</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Accede a tu diagnóstico en curso o administra tu organización.
                  </p>
                </div>
              </div>

              <form className="flex flex-col gap-4" onSubmit={enviar}>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between" htmlFor="correo">
                    <span>Correo corporativo</span>
                    <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Requerido</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-body-lg pointer-events-none">mail</span>
                    <input
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 transition-all"
                      id="correo"
                      name="correo"
                      placeholder="nombre@empresa.com"
                      required
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-lg text-label-lg text-on-surface" htmlFor="clave">Contraseña</label>
                    <Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors font-medium" to="/recuperar">¿Olvidaste tu contraseña?</Link>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-body-lg pointer-events-none">lock</span>
                    <input
                      className="w-full pl-11 pr-11 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 transition-all"
                      id="clave"
                      name="clave"
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      type={verClave ? 'text' : 'password'}
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                    />
                    <button
                      aria-label="Mostrar u ocultar clave"
                      className="absolute right-3 text-outline hover:text-on-surface focus:outline-none"
                      onClick={() => setVerClave(!verClave)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-body-lg">
                        {verClave ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-3 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
                  disabled={enviando}
                  type="submit"
                >
                  <span>{enviando ? 'Verificando…' : 'Ingresar al Panel de Innovación'}</span>
                  <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                </button>

                <Aviso className="text-center" tipo="error">{error}</Aviso>
                <Aviso className="text-center" tipo="exito">{ubicacion.state?.aviso}</Aviso>

                <div className="mt-4 pt-4 flex flex-col items-center gap-2 bg-surface-container-low p-3.5 rounded-xl text-center">
                  <span className="font-label-md text-label-md text-on-surface-variant">¿Aún no tienes cuenta?</span>
                  <Link className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:text-primary font-semibold transition-colors" to="/solicitar-acceso">
                    <span>Solicitar acceso para mi empresa</span>
                    <span className="material-symbols-outlined text-sm">how_to_reg</span>
                  </Link>
                  <Link className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-secondary font-semibold transition-colors" to="/demo">
                    <span>Probar el diagnóstico de demostración</span>
                    <span className="material-symbols-outlined text-sm">quiz</span>
                  </Link>
                  <span className="font-body-sm text-body-sm text-outline">
                    ¿Recibiste una invitación? Ábrela desde el enlace del correo.
                  </span>
                </div>
              </form>
            </div>
          </div>
        </section>

        <SeccionDimensiones modelo={modelo} />

        <SeccionNiveles modelo={modelo} />

        <section className="w-full bg-gradient-to-r from-primary via-primary-container to-secondary rounded-2xl p-8 sm:p-12 text-on-primary shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-tertiary-fixed-dim/15 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 text-secondary-fixed">
                <span className="material-symbols-outlined text-body-lg">verified</span>
                <span className="font-label-caps text-label-caps uppercase font-bold tracking-wider">Acompañamiento Consultivo Especializado</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl tracking-tight text-on-primary">
                ¿Tu organización requiere una evaluación personalizada para su Comité Ejecutivo?
              </h2>
              <p className="font-body-lg text-body-lg text-on-primary/80 max-w-2xl">
                Coordina una sesión guiada con un consultor de Trust 4P. Revisaremos la compatibilidad de tu estructura y modelaremos un roadmap preliminar con benchmarks sectoriales.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-stretch lg:items-end">
              <Link className="px-6 py-3.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-bright font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" to="/solicitar-acceso">
                <span className="material-symbols-outlined text-body-lg">how_to_reg</span>
                <span>Solicitar acceso</span>
              </Link>
              <Link className="px-6 py-3 rounded-lg text-on-primary hover:bg-on-primary/10 font-label-md text-label-md flex items-center justify-center gap-2 text-center transition-colors" to="/demo">
                <span>Probar la demostración</span>
                <span className="material-symbols-outlined text-body-md">chevron_right</span>
              </Link>
            </div>
          </div>
        </section>

        <footer className="w-full py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-outline font-body-sm text-body-sm">
          <div className="flex items-center gap-3">
            <span>Trust 4P — Identidad visual 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="hover:text-on-surface transition-colors" href="#terminos">Términos de Servicio</a>
            <a className="hover:text-on-surface transition-colors" href="#privacidad">Política de Privacidad</a>
            <a className="hover:text-on-surface transition-colors" href="#soporte">Soporte Técnico</a>
            <span className="font-label-caps text-label-caps">v2026.1.0</span>
          </div>
        </footer>

      </div>
    </main>
  )
}
