import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [verClave, setVerClave] = useState(false)
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const navigate = useNavigate()

  function enviar(e) {
    e.preventDefault()
    setMensaje(`Autenticando ${correo} en el ecosistema...`)
    setTimeout(() => {
      setMensaje('Acceso validado. Redireccionando al panel de diagnóstico.')
      navigate('/panel')
    }, 1200)
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
              Mide el nivel de madurez real de tu empresa a través del modelo 4P. Identifica brechas, gestiona iniciativas empíricas y conecta decisiones estratégicas con asignación presupuestaria ágil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-2">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-headline-md">hub</span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">4P</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant font-medium">Dimensiones Clave</p>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">Propósito, Procesos, Personas, Plataforma</span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-secondary mb-2">
                  <span className="material-symbols-outlined text-headline-md">timeline</span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">N1–N4</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant font-medium">Escala de Madurez</p>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">De estático a fondos continuos</span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 text-tertiary mb-2">
                  <span className="material-symbols-outlined text-headline-md">model_training</span>
                  <span className="font-headline-lg text-headline-lg text-on-surface">TRIZ</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant font-medium">Diagnóstico &amp; Ruta</p>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">Resolución sistemática de contradicciones</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-label-md text-label-md">
                <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span>Confidencialidad empresarial garantizada</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-md text-label-md">
                <span className="material-symbols-outlined text-secondary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span>Cumplimiento ISO / IEC 56002</span>
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
                <input name="modelo_version" type="hidden" defaultValue="2026.1" />
                <input name="diagnostico_id" type="hidden" defaultValue="DIAG-CORP-4P" />

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
                    <a className="font-label-md text-label-md text-secondary hover:text-primary transition-colors font-medium" href="#recuperar">¿Olvidaste tu contraseña?</a>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-body-lg pointer-events-none">lock</span>
                    <input
                      className="w-full pl-11 pr-11 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 transition-all"
                      id="clave"
                      name="clave"
                      placeholder="••••••••••••"
                      required
                      type={verClave ? 'text' : 'password'}
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

                <div className="flex items-center gap-2.5 pt-1">
                  <input className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" id="recordar_sesion" name="recordar_sesion" type="checkbox" />
                  <label className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="recordar_sesion">
                    Recordar sesión en este equipo de trabajo
                  </label>
                </div>

                <button className="w-full mt-2 py-3 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]" type="submit">
                  <span>Ingresar al Panel de Innovación</span>
                  <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                </button>

                {mensaje && (
                  <div className="p-2.5 rounded-md bg-tertiary-fixed/40 text-tertiary font-label-md text-label-md text-center">
                    {mensaje}
                  </div>
                )}

                <div className="mt-4 pt-4 flex flex-col items-center gap-2 bg-surface-container-low p-3.5 rounded-xl text-center">
                  <span className="font-label-md text-label-md text-on-surface-variant">¿Eres una empresa invitada o nuevo registro?</span>
                  <a className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:text-primary font-semibold transition-colors" href="/registro">
                    <span>Activar invitación corporativa</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="w-full py-12 sm:py-16">
          <div className="flex flex-col items-start gap-2 mb-10">
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Estructura Diagnóstica</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Las 4 Dimensiones del Ecosistema 4P
            </h2>
            <div className="h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary-container"></div>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-1">
              Una estructura integral e interconectada para diagnosticar la capacidad real de innovar en cada nivel organizacional, desde la estrategia de junta directiva hasta el código y la experimentación diaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-headline-lg">track_changes</span>
                </div>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">Dimensión 01</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-2">1. Propósito</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Alineación de la visión directiva con la tesis de innovación y los objetivos de negocio cuantificables.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-surface-container-low -mx-6 -mb-6 p-4 flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Indicador Nuclear</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Tesis de Innovación &amp; Gobernanza</span>
              </div>
            </div>

            <div className="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-headline-lg">published_with_changes</span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider">Dimensión 02</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-2">2. Procesos</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Metodologías de validación empírica, embudos de desarrollo y criterios ágiles de reasignación presupuestaria.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-surface-container-low -mx-6 -mb-6 p-4 flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Indicador Nuclear</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Embudos Ágiles &amp; Presupuestos Dinámicos</span>
              </div>
            </div>

            <div className="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary-container"></div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-tertiary-fixed/50 text-tertiary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-headline-lg">groups_3</span>
                </div>
                <span className="font-label-caps text-label-caps text-tertiary uppercase font-bold tracking-wider">Dimensión 03</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-2">3. Personas</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Desarrollo de capacidades, incentivos al intraemprendimiento, tolerancia al riesgo y liderazgo colaborativo.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-surface-container-low -mx-6 -mb-6 p-4 flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Indicador Nuclear</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Talento, Cultura &amp; Reconocimiento</span>
              </div>
            </div>

            <div className="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-on-surface"></div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-variant text-on-surface flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-headline-lg">layers</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold tracking-wider">Dimensión 04</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-2">4. Plataforma</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Ecosistema digital, herramientas de gestión de ideas, analítica de portafolio y habilitadores tecnológicos.
                </p>
              </div>
              <div className="mt-6 pt-4 bg-surface-container-low -mx-6 -mb-6 p-4 flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Indicador Nuclear</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Stack Digital, Datos &amp; Soluciones IA</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 sm:py-16 bg-surface-container-low rounded-2xl p-6 sm:p-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">Matriz de Evolución</span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Escala de Madurez Organizacional (N1 a N4)</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                El modelo Trust 4P diagnostica el comportamiento real del capital financiero y humano, midiendo la transición desde silos rígidos hacia asignaciones adaptativas continuas.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-lg shadow-sm">
              <span className="font-label-caps text-label-caps text-outline px-2">Nivel Objetivo:</span>
              <span className="px-2.5 py-1 rounded bg-secondary-container/40 text-primary font-label-md text-label-md font-semibold">N4 Excelencia</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-label-caps font-bold">NIVEL 1</span>
                  <span className="material-symbols-outlined text-outline text-body-md">lock_clock</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Asignación Anual Estática</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Madurez inicial tradicional. El presupuesto de innovación compite con el OPEX ordinario y se aprueba una sola vez al año sin margen de pivotaje empírico.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2 text-outline font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-outline"></span>
                <span>Cultura Reactiva / Silos</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-secondary-fixed/40 text-secondary font-label-caps text-label-caps font-bold">NIVEL 2</span>
                  <span className="material-symbols-outlined text-secondary text-body-md">update</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Revisión Semestral</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Procesos en desarrollo. Se implementan comités cada seis meses para revisar avances de proyectos, con ajustes tácticos limitados y métricas vanidosas.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2 text-secondary font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Procesos en Desarrollo</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-tertiary font-label-caps text-label-caps font-bold">NIVEL 3</span>
                  <span className="material-symbols-outlined text-tertiary text-body-md">sync</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Trimestral Ágil</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Validación sistemática continua. Los equipos acceden a micro-fondos basados en evidencias de hipótesis validadas en ciclos de 90 días.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2 text-tertiary font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span>Validación Sistemática</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-caps text-label-caps font-bold">NIVEL 4</span>
                  <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Fondos Continuos Dinámicos</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Excelencia adaptativa y gobernanza empírica. El capital fluye en tiempo real hacia iniciativas que demuestran tracción y rentabilidad de aprendizaje.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2 text-primary font-label-md text-label-md font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Ecosistema Autónomo</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6">
            <div className="flex items-center justify-between text-label-caps font-label-caps text-outline mb-2">
              <span>Madurez Inicial (N1)</span>
              <span>Madurez Intermedia (N2 - N3)</span>
              <span>Madurez Transformacional (N4)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary w-full"></div>
            </div>
          </div>
        </section>

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
              <button className="px-6 py-3.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-bright font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" type="button">
                <span className="material-symbols-outlined text-body-lg">calendar_today</span>
                <span>Solicitar Demostración Guiada</span>
              </button>
              <a className="px-6 py-3 rounded-lg text-on-primary hover:bg-on-primary/10 font-label-md text-label-md flex items-center justify-center gap-2 text-center transition-colors" href="#metodologia">
                <span>Conocer Metodología y Normas ISO</span>
                <span className="material-symbols-outlined text-body-md">chevron_right</span>
              </a>
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
