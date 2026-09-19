import { useState } from 'react'
import {
  BANCO_PREGUNTAS,
  COHORTE_DEMO,
  CONFIGURACION,
  ESCALAS,
  EVENTOS,
  PILARES,
  SECTORES,
  SOLICITUDES,
} from '../datos/configuracionModelo.js'

const PESOS_INICIALES = Object.fromEntries(PILARES.map((pilar) => [pilar.id, pilar.peso]))

function indiceGlobal(puntajes, pesos) {
  return PILARES.reduce((total, pilar) => total + (puntajes[pilar.id] * pesos[pilar.id]) / 100, 0)
}

function marcaDeTiempo() {
  return new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
}

export default function GestionCalibracion() {
  // Módulo 1: solicitudes
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES)
  const [busquedaEmpresa, setBusquedaEmpresa] = useState('')
  const [sector, setSector] = useState('')
  const [escala, setEscala] = useState('')
  const [rechazando, setRechazando] = useState(null)
  const [motivo, setMotivo] = useState('')

  // Módulo 2: calibración
  const [pesos, setPesos] = useState(PESOS_INICIALES)
  const [guardados, setGuardados] = useState(PESOS_INICIALES)
  const [guardadoEn, setGuardadoEn] = useState(CONFIGURACION.ultimoGuardado)
  const [simulacion, setSimulacion] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [verLogs, setVerLogs] = useState(false)

  // Módulo 3: banco de preguntas
  const [banco, setBanco] = useState(BANCO_PREGUNTAS)
  const [busquedaPregunta, setBusquedaPregunta] = useState('')
  const [pilarFiltro, setPilarFiltro] = useState('todos')

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length

  const solicitudesVisibles = solicitudes.filter((s) => {
    const texto = `${s.razonSocial} ${s.nit} ${s.solicitante.nombre}`.toLowerCase()
    const coincideTexto = texto.includes(busquedaEmpresa.trim().toLowerCase())
    const coincideSector = sector === '' || s.sectorClave === sector
    const coincideEscala = escala === '' || s.escala === escala
    return coincideTexto && coincideSector && coincideEscala
  })

  const suma = PILARES.reduce((total, pilar) => total + (pesos[pilar.id] || 0), 0)
  const valida = Math.abs(suma - 100) < 0.01
  const hayCambios = PILARES.some((pilar) => pesos[pilar.id] !== guardados[pilar.id])

  const preguntasVisibles = banco.filter((pregunta) => {
    const texto = `${pregunta.id} ${pregunta.enunciado} ${pregunta.clausula} ${pregunta.subdimension}`
    const coincideTexto = texto.toLowerCase().includes(busquedaPregunta.trim().toLowerCase())
    const coincidePilar = pilarFiltro === 'todos' || pregunta.pilarId === pilarFiltro
    return coincideTexto && coincidePilar
  })

  function cambiarPeso(id, valor) {
    const limpio = Math.max(0, Math.min(100, Number.isFinite(valor) ? valor : 0))
    setPesos((previos) => ({ ...previos, [id]: limpio }))
    setSimulacion(null)
    setAviso(null)
  }

  function aprobar(id) {
    setSolicitudes((previas) =>
      previas.map((s) => (s.id === id ? { ...s, estado: 'habilitada', motivo: null } : s)),
    )
    setRechazando(null)
  }

  function confirmarRechazo(id) {
    if (motivo.trim() === '') return
    setSolicitudes((previas) =>
      previas.map((s) => (s.id === id ? { ...s, estado: 'rechazada', motivo: motivo.trim() } : s)),
    )
    setRechazando(null)
    setMotivo('')
  }

  function guardar() {
    if (!valida) return
    setGuardados(pesos)
    setGuardadoEn(marcaDeTiempo())
    setSimulacion(null)
    setAviso({
      tipo: 'exito',
      texto: `Ponderación guardada: ${PILARES.map((p) => `${p.codigo} ${pesos[p.id]}%`).join(' · ')}.`,
    })
  }

  function restablecer() {
    setPesos(guardados)
    setSimulacion(null)
    setAviso({ tipo: 'info', texto: 'Se restauró la última ponderación guardada.' })
  }

  function simular() {
    if (!valida) return
    setSimulacion(
      COHORTE_DEMO.map((caso) => {
        const anterior = indiceGlobal(caso.puntajes, guardados)
        const nuevo = indiceGlobal(caso.puntajes, pesos)
        return { ...caso, anterior, nuevo, delta: nuevo - anterior }
      }),
    )
    setAviso(null)
  }

  function alternarPregunta(id) {
    setBanco((previas) =>
      previas.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)),
    )
  }

  return (
    <main className="w-full flex-1 flex flex-col items-center p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-8 pb-16 text-on-surface">
        {/* Encabezado y consola de administración */}
        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary" />

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                Trust 4P
              </span>
              <div className="h-8 w-px bg-surface-container-high hidden md:block" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                <span>Administración</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-semibold">Gestión y calibración metodológica</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  Modelo activo: {CONFIGURACION.version} ({CONFIGURACION.marco})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary font-label-caps text-label-caps">
                  <span className="h-2 w-2 rounded-full bg-tertiary" />
                  Motor de cálculo operativo
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between xl:justify-end gap-4 border-t xl:border-t-0 pt-4 xl:pt-0 border-surface-container">
            <div className="flex items-center gap-3 pr-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold">
                {CONFIGURACION.responsable.iniciales}
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-body-md font-semibold text-on-surface leading-tight">
                  {CONFIGURACION.responsable.nombre}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {CONFIGURACION.responsable.cargo}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setVerLogs((visible) => !visible)}
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-body-sm flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-outline">history</span>
                <span>{verLogs ? 'Ocultar registro' : 'Registro de cambios'}</span>
              </button>

              <button
                type="button"
                onClick={restablecer}
                disabled={!hayCambios}
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-body-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg text-outline">restart_alt</span>
                <span>Restablecer</span>
              </button>

              <button
                type="button"
                onClick={guardar}
                disabled={!valida || !hayCambios}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-body-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Guardar parámetros</span>
              </button>
            </div>
          </div>
        </header>

        {CONFIGURACION.borrador && (
          <div className="w-full flex items-start gap-3 px-5 py-3 rounded-xl bg-surface-container-low text-on-surface-variant">
            <span className="material-symbols-outlined text-lg text-outline">draft</span>
            <p className="font-body-sm text-body-sm">
              Datos de demostración. Los pilares, los pesos y el banco de preguntas que se muestran
              aquí son una maqueta de la interfaz; la parametrización definitiva del modelo se carga
              cuando esté validado.
            </p>
          </div>
        )}

        {verLogs && (
          <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Registro de cambios de configuración
              </h2>
            </div>

            <ul className="flex flex-col divide-y divide-surface-container">
              {EVENTOS.map((evento) => (
                <li key={evento.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="font-mono text-body-sm text-outline w-20 shrink-0">{evento.id}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant w-44 shrink-0">
                    {evento.fecha}
                  </span>
                  <span className="font-body-md text-body-sm text-on-surface flex-1">{evento.accion}</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    {evento.actor}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Módulo 1: solicitudes de diagnóstico */}
        <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-xl">corporate_fare</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Solicitudes de diagnóstico en espera
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Habilitación previa y verificación documental antes de abrir el expediente
                </p>
              </div>
            </div>

            <span className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-caps text-label-caps">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {pendientes === 0
                ? 'Sin solicitudes pendientes'
                : `${pendientes} ${pendientes === 1 ? 'empresa pendiente' : 'empresas pendientes'} de habilitación`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-surface-container-low rounded-lg">
            <div className="md:col-span-6 flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg">
              <span className="material-symbols-outlined text-outline text-lg">search</span>
              <input
                type="text"
                value={busquedaEmpresa}
                onChange={(evento) => setBusquedaEmpresa(evento.target.value)}
                placeholder="Buscar por razón social, NIT o contacto líder..."
                className="w-full bg-transparent font-body-md text-body-sm text-on-surface focus:outline-none placeholder:text-outline"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={sector}
                onChange={(evento) => setSector(evento.target.value)}
                className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg font-body-sm text-on-surface focus:outline-none"
              >
                <option value="">Todos los sectores</option>
                {SECTORES.map((item) => (
                  <option key={item.clave} value={item.clave}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={escala}
                onChange={(evento) => setEscala(evento.target.value)}
                className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg font-body-sm text-on-surface focus:outline-none"
              >
                <option value="">Cualquier tamaño</option>
                {ESCALAS.map((item) => (
                  <option key={item.clave} value={item.clave}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                  <th className="py-3 px-4 rounded-l-lg">Empresa / Razón social</th>
                  <th className="py-3 px-4">Sector y escala</th>
                  <th className="py-3 px-4">Solicitante líder</th>
                  <th className="py-3 px-4">Modelo solicitado</th>
                  <th className="py-3 px-4">Documentación</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Acción</th>
                </tr>
              </thead>

              <tbody>
                {solicitudesVisibles.map((solicitud) => (
                  <tr key={solicitud.id} className="hover:bg-surface-container-low transition-colors align-top">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-body-sm ${solicitud.clases.avatar}`}
                        >
                          {solicitud.sigla}
                        </div>
                        <div>
                          <div className="font-headline-sm text-body-md font-semibold text-on-surface">
                            {solicitud.razonSocial}
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            NIT: {solicitud.nit} · {solicitud.ciudad}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block font-medium text-on-surface">{solicitud.sector}</span>
                      <div className="text-on-surface-variant font-body-sm">
                        {solicitud.colaboradores.toLocaleString('es-CO')} colaboradores
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-on-surface">{solicitud.solicitante.nombre}</div>
                      <div className="text-on-surface-variant font-body-sm">{solicitud.solicitante.cargo}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-caps text-label-caps ${solicitud.clases.modelo}`}
                      >
                        {solicitud.modelo}
                      </span>
                      <div className="text-on-surface-variant font-body-sm mt-0.5">{solicitud.recibido}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-tertiary font-label-caps text-label-caps">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>{solicitud.documentos.validados} documentos validados</span>
                      </div>
                      <span className="text-on-surface-variant font-body-sm">
                        {solicitud.documentos.detalle}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {solicitud.estado === 'pendiente' && rechazando !== solicitud.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => aprobar(solicitud.id)}
                            className="px-3 py-1.5 rounded-lg bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-lg text-body-sm transition-all shadow-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRechazando(solicitud.id)
                              setMotivo('')
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface font-label-lg text-body-sm transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {solicitud.estado === 'pendiente' && rechazando === solicitud.id && (
                        <div className="flex flex-col items-end gap-2">
                          <input
                            type="text"
                            value={motivo}
                            onChange={(evento) => setMotivo(evento.target.value)}
                            placeholder="Motivo del rechazo"
                            className="w-56 bg-surface-container-low px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface text-left focus:outline-none focus:ring-1 focus:ring-error"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => confirmarRechazo(solicitud.id)}
                              disabled={motivo.trim() === ''}
                              className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-lg text-body-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Confirmar rechazo
                            </button>
                            <button
                              type="button"
                              onClick={() => setRechazando(null)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-lg text-body-sm transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {solicitud.estado === 'habilitada' && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/40 text-tertiary font-label-caps text-label-caps">
                            <span className="material-symbols-outlined text-base">task_alt</span>
                            Expediente habilitado
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Pendiente de enviar el enlace al contacto líder
                          </span>
                        </div>
                      )}

                      {solicitud.estado === 'rechazada' && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps">
                            <span className="material-symbols-outlined text-base">block</span>
                            Solicitud rechazada
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant max-w-[16rem] text-right">
                            Motivo: {solicitud.motivo}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {solicitudesVisibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-on-surface-variant font-body-md text-body-sm">
                      Ninguna solicitud coincide con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Módulo 2: calibración de la ponderación */}
        <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Calibración de la ponderación 4P
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Ajuste de los pesos con que se calcula el índice de madurez. Los cuatro pilares deben
                sumar exactamente 100% para poder guardar la configuración.
              </p>
            </div>

            <button
              type="button"
              onClick={simular}
              disabled={!valida}
              className="px-4 py-2 rounded-lg bg-secondary-container/40 hover:bg-secondary-container/70 text-secondary font-label-lg text-body-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              <span>Simular impacto en diagnósticos cerrados</span>
            </button>
          </div>

          {valida ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-tertiary-fixed/30 text-tertiary gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
                <div>
                  <div className="font-headline-sm text-body-md font-bold">
                    Suma actual: {suma.toFixed(1)}% — configuración balanceada
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Ponderación normalizada a 1.0 sobre las cláusulas evaluadas de la norma ISO 56002.
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-tertiary font-label-caps text-label-caps shadow-sm self-start sm:self-auto">
                Motor activo
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-error-container text-on-error-container gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-error">error</span>
                <div>
                  <div className="font-headline-sm text-body-md font-bold">
                    Ponderación inconsistente: la suma va en {suma.toFixed(1)}%
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    La suma debe ser exactamente 100.0%. Mientras difiera, no se puede guardar ni
                    aplicar a nuevos diagnósticos.
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-error font-label-caps text-label-caps shadow-sm self-start sm:self-auto">
                Guardado bloqueado
              </span>
            </div>
          )}

          {aviso && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body-md text-body-sm ${
                aviso.tipo === 'exito'
                  ? 'bg-tertiary-fixed/30 text-tertiary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {aviso.tipo === 'exito' ? 'check_circle' : 'info'}
              </span>
              <span>{aviso.texto}</span>
            </div>
          )}

          <div className="p-4 bg-surface-container-low rounded-xl flex flex-col space-y-2">
            <div className="flex items-center justify-between text-body-sm font-label-caps text-label-caps text-on-surface-variant">
              <span>Distribución relativa</span>
              <span className={`font-semibold ${valida ? 'text-tertiary' : 'text-error'}`}>
                {valida ? '100% asignado' : `${suma.toFixed(1)}% asignado`}
              </span>
            </div>

            <div className="h-3.5 w-full bg-surface-container rounded-full overflow-hidden flex">
              {PILARES.map((pilar) => (
                <div
                  key={pilar.id}
                  className={`h-full transition-all duration-300 ${pilar.clases.barra}`}
                  style={{ width: `${pesos[pilar.id]}%` }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {PILARES.map((pilar) => (
                <div key={pilar.id} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${pilar.clases.punto}`} />
                  <span className="font-body-sm text-body-sm text-on-surface">
                    {pilar.codigo}: {pilar.corto} ({pesos[pilar.id]}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PILARES.map((pilar) => (
              <div
                key={pilar.id}
                className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${pilar.clases.borde}`} />

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {pilar.codigo}: {pilar.nombre}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label className="sr-only" htmlFor={`peso-${pilar.id}`}>
                        Peso de {pilar.nombre}
                      </label>
                      <input
                        id={`peso-${pilar.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={pesos[pilar.id]}
                        onChange={(evento) => cambiarPeso(pilar.id, Number(evento.target.value))}
                        className={`w-16 text-center font-headline-sm text-headline-sm font-bold bg-surface-container-lowest py-1 rounded-lg focus:outline-none focus:ring-1 ${pilar.clases.campo}`}
                      />
                      <span className="font-bold text-on-surface-variant">%</span>
                    </div>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {pilar.descripcion}
                  </p>

                  <span
                    className={`inline-block mt-2 px-2.5 py-1 rounded font-label-caps text-label-caps ${pilar.clases.chip}`}
                  >
                    {pilar.clausula}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={pesos[pilar.id]}
                  onChange={(evento) => cambiarPeso(pilar.id, Number(evento.target.value))}
                  aria-label={`Ajustar el peso de ${pilar.nombre}`}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-container-high ${pilar.clases.control}`}
                />
              </div>
            ))}
          </div>

          {simulacion && (
            <div className="p-5 rounded-xl bg-surface-container-low flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">analytics</span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Impacto de la nueva ponderación sobre {simulacion.length} diagnósticos cerrados
                </h3>
              </div>

              <table className="w-full text-left font-body-md text-body-sm">
                <thead>
                  <tr className="text-on-surface-variant font-label-caps text-label-caps">
                    <th className="py-2">Expediente</th>
                    <th className="py-2">Empresa</th>
                    <th className="py-2 text-right">Índice guardado</th>
                    <th className="py-2 text-right">Índice simulado</th>
                    <th className="py-2 text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacion.map((caso) => (
                    <tr key={caso.id} className="border-t border-surface-container">
                      <td className="py-2.5 font-mono text-body-sm text-on-surface-variant">{caso.id}</td>
                      <td className="py-2.5 font-medium text-on-surface">{caso.empresa}</td>
                      <td className="py-2.5 text-right text-on-surface-variant">
                        {caso.anterior.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-on-surface">
                        {caso.nuevo.toFixed(1)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-semibold ${
                          Math.abs(caso.delta) < 0.05
                            ? 'text-on-surface-variant'
                            : caso.delta > 0
                              ? 'text-tertiary'
                              : 'text-error'
                        }`}
                      >
                        {caso.delta > 0 ? '+' : ''}
                        {caso.delta.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="font-body-sm text-body-sm text-on-surface-variant">
                La simulación es solo una proyección: los expedientes cerrados conservan el índice con
                el que fueron emitidos hasta que se publique una nueva versión del modelo.
              </p>
            </div>
          )}
        </section>

        {/* Módulo 3: banco de preguntas */}
        <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">dataset</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Banco maestro de preguntas y criterios de evaluación
                </h2>
              </div>
              <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body-sm">
                <span>{CONFIGURACION.totalPreguntas} preguntas previstas</span>
                <span>·</span>
                <span>{CONFIGURACION.totalPilares} pilares</span>
                <span>·</span>
                <span>{CONFIGURACION.totalSubdimensiones} subdimensiones</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-body-sm flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Exportar matriz</span>
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-body-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Nueva pregunta</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-surface-container-low rounded-lg">
            <div className="md:col-span-8 flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg">
              <span className="material-symbols-outlined text-outline text-lg">search</span>
              <input
                type="text"
                value={busquedaPregunta}
                onChange={(evento) => setBusquedaPregunta(evento.target.value)}
                placeholder="Buscar por código (por ejemplo P2.2), enunciado o cláusula..."
                className="w-full bg-transparent font-body-md text-body-sm text-on-surface focus:outline-none placeholder:text-outline"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={pilarFiltro}
                onChange={(evento) => setPilarFiltro(evento.target.value)}
                className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg font-body-sm text-on-surface focus:outline-none"
              >
                <option value="todos">Todos los pilares ({banco.length} reactivos)</option>
                {PILARES.map((pilar) => (
                  <option key={pilar.id} value={pilar.id}>
                    {pilar.codigo}: {pilar.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                  <th className="py-3 px-4 rounded-l-lg w-20">Código</th>
                  <th className="py-3 px-4 min-w-[320px]">Pregunta y criterio</th>
                  <th className="py-3 px-4">Subdimensión</th>
                  <th className="py-3 px-4">Peso</th>
                  <th className="py-3 px-4">Escala y evidencia</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Operaciones</th>
                </tr>
              </thead>

              <tbody>
                {preguntasVisibles.map((pregunta) => {
                  const pilar = PILARES.find((item) => item.id === pregunta.pilarId)
                  const pesoGlobal = (pregunta.pesoPilar * pesos[pregunta.pilarId]) / 100

                  return (
                    <tr key={pregunta.id} className="hover:bg-surface-container-low transition-colors align-top">
                      <td className={`py-4 px-4 font-mono font-bold ${pilar.clases.texto}`}>{pregunta.id}</td>

                      <td className="py-4 px-4">
                        <div className="font-headline-sm text-body-md font-semibold text-on-surface leading-snug">
                          {pregunta.enunciado}
                        </div>
                        <div className="text-on-surface-variant font-body-sm mt-0.5">{pregunta.clausula}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-caps text-label-caps ${pilar.clases.chip}`}
                        >
                          {pregunta.subdimension}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-on-surface">{pregunta.pesoPilar}% del pilar</div>
                        <div className="text-on-surface-variant font-body-sm">
                          ({pesoGlobal.toFixed(2)}% global)
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-on-surface">Escala {pregunta.escala}</div>
                        {pregunta.evidenciaObligatoria ? (
                          <div className="text-tertiary font-body-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">attach_file</span>
                            <span>Evidencia obligatoria</span>
                          </div>
                        ) : (
                          <div className="text-on-surface-variant font-body-sm">Evidencia opcional</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {pregunta.activa ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary font-label-caps text-label-caps">
                            <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                            <span className="h-1.5 w-1.5 rounded-full bg-outline" />
                            En pausa
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar parámetros y rúbrica"
                            className="p-1.5 text-outline hover:text-primary rounded-lg hover:bg-surface-container"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            type="button"
                            title="Ver la rúbrica de cuatro niveles"
                            className="p-1.5 text-outline hover:text-secondary rounded-lg hover:bg-surface-container"
                          >
                            <span className="material-symbols-outlined text-lg">rule</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => alternarPregunta(pregunta.id)}
                            title={pregunta.activa ? 'Pausar el reactivo' : 'Activar el reactivo'}
                            className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {pregunta.activa ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {preguntasVisibles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-on-surface-variant font-body-md text-body-sm">
                      Ningún reactivo coincide con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="w-full bg-surface-container-low rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-base">verified</span>
              <span>Modelo metodológico Trust 4P · {CONFIGURACION.version}</span>
            </span>
            <span>·</span>
            <span className="font-mono text-xs">Hash de configuración: {CONFIGURACION.hash}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-tertiary" />
            <span>
              Último guardado: {guardadoEn} ({CONFIGURACION.responsable.nombre})
            </span>
          </div>
        </footer>
      </div>
    </main>
  )
}
