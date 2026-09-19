import { useState } from 'react'
import { AUDITORIA } from '../datos/auditoriaEvidencias'

const ESTADO_PILAR = {
  conforme: { chip: 'bg-tertiary-fixed text-on-tertiary-fixed', barra: 'bg-tertiary' },
  observacion: { chip: 'bg-secondary-fixed text-on-secondary-fixed', barra: 'bg-secondary' },
  noConforme: { chip: 'bg-error-container text-on-error-container', barra: 'bg-error' },
}

const ESTADO_EVIDENCIA = {
  conforme: { chip: 'bg-tertiary-fixed text-on-tertiary-fixed', icono: 'task_alt', color: 'text-tertiary' },
  observada: { chip: 'bg-error-container text-on-error-container', icono: 'error', color: 'text-error' },
}

const ICONO_FORMATO = { pdf: 'picture_as_pdf', hoja: 'table_chart', texto: 'description' }

export default function PanelAuditoria() {
  const datos = AUDITORIA
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const evidencias = datos.evidencias.filter((e) => {
    const pasaFiltro =
      filtro === 'todas' || (filtro === 'observadas' ? e.estado === 'observada' : e.pilarId === filtro)
    const texto = `${e.archivo} ${e.clausula} ${e.hash}`.toLowerCase()
    return pasaFiltro && texto.includes(busqueda.toLowerCase())
  })

  const ind = datos.indicadores

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="flex flex-col w-full text-on-surface gap-space-lg">

        {datos.borrador && (
          <div className="w-full bg-error-container text-on-error-container rounded-xl px-space-lg py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">science</span>
            <span className="font-label-md text-label-md">
              Revisión en borrador. El expediente, las evidencias y el dictamen son provisionales.
            </span>
          </div>
        )}

        <header className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <nav className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
                <span>Diagnóstico</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>Resultados</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-semibold text-primary">Auditoría y evidencias</span>
              </nav>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-caps text-label-caps tracking-wider uppercase">
                  Revisión de conformidad
                </span>
                <span className="text-on-surface-variant font-body-sm text-body-sm">
                  {datos.marco} · Expediente {datos.expediente}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-md text-label-md text-on-surface">Estado:</span>
                <span className="font-label-lg text-label-lg text-primary font-bold">
                  {datos.estado} ({datos.avance}%)
                </span>
              </div>
              <button
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2.5 rounded-lg font-label-lg text-label-lg transition-all shadow-sm flex items-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span>Registrar dictamen</span>
              </button>
              <button
                className="bg-surface-container hover:bg-surface-container-high text-primary px-3.5 py-2.5 rounded-lg font-label-lg text-label-lg transition-colors flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">archive</span>
                <span className="hidden sm:inline">Descargar expediente</span>
              </button>
            </div>
          </div>

          <div className="mt-space-md pt-space-sm border-t border-surface-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-low/50 p-3 rounded-lg">
            {[datos.revisor, datos.auditado].map((persona, i) => (
              <div key={persona.nombre} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-label-lg text-label-lg ${
                    i === 0 ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {persona.iniciales}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">{persona.nombre}</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">{persona.rol}</span>
                </div>
              </div>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[
            {
              titulo: 'Requisitos evaluados',
              icono: 'fact_check',
              color: 'text-primary',
              valor: `${ind.requisitosPresentados}`,
              sufijo: `/${ind.requisitosTotales}`,
              chip: '100 % presentados',
              pie: `${ind.conformes} conformes · ${ind.conObservacion} con observación`,
            },
            {
              titulo: 'Índice de conformidad',
              icono: 'verified_user',
              color: 'text-tertiary',
              valor: `${ind.indiceConformidad} %`,
              sufijo: '',
              chip: `+${ind.variacion} % vs anterior`,
              pie: 'Cláusulas 4 a 9 evaluadas con la matriz ISO 56002',
            },
            {
              titulo: 'Integridad de archivos',
              icono: 'key',
              color: 'text-secondary',
              valor: ind.algoritmoIntegridad,
              sufijo: '',
              chip: 'Huella calculada',
              pie: `Huella registrada en las ${ind.requisitosTotales} evidencias`,
            },
            {
              titulo: 'Próxima revisión',
              icono: 'event_available',
              color: 'text-primary',
              valor: ind.proximaRevision,
              sufijo: '',
              chip: null,
              pie: 'Revisión interna programada',
            },
          ].map((m) => (
            <div key={m.titulo} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-fixed via-tertiary-fixed-dim to-primary"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{m.titulo}</span>
                <span className={`p-1.5 rounded-lg bg-surface-container material-symbols-outlined text-lg ${m.color}`}>
                  {m.icono}
                </span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {m.valor}
                  {m.sufijo && <span className="font-headline-sm text-on-surface-variant font-normal">{m.sufijo}</span>}
                </span>
                {m.chip && (
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                    {m.chip}
                  </span>
                )}
              </div>
              <p className="mt-2 text-on-surface-variant font-body-sm text-body-sm">{m.pie}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

          <section className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Conformidad por dimensión</h2>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    Mapeo contra cláusulas mandatarias ISO 56002
                  </p>
                </div>
                <span className="font-label-caps text-label-caps bg-surface-container px-2.5 py-1 rounded-full text-on-surface-variant">
                  {datos.pilares.length} dimensiones
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {datos.pilares.map((p) => {
                  const e = ESTADO_PILAR[p.estado]
                  const pct = Math.round((p.aprobadas / p.total) * 100)
                  return (
                    <button
                      key={p.id}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        filtro === p.id ? 'bg-surface-container' : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                      onClick={() => setFiltro(filtro === p.id ? 'todas' : p.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">
                            {p.codigo}
                          </span>
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{p.nombre}</span>
                        </div>
                        <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full ${e.chip}`}>
                          {p.aprobadas}/{p.total}
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-sm text-body-sm mb-2">{p.clausulas}</p>
                      <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.barra}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hallazgos</h2>
                <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
                  {datos.hallazgos.length} acciones requeridas
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {datos.hallazgos.map((h) => (
                  <div key={h.id} className="p-3.5 rounded-lg bg-surface-container-low">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-lg ${
                            h.tipo === 'noConforme' ? 'text-error' : 'text-secondary'
                          }`}
                        >
                          {h.tipo === 'noConforme' ? 'warning' : 'info'}
                        </span>
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">{h.titulo}</span>
                      </div>
                      <span
                        className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                          h.tipo === 'noConforme'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {h.plazo}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-body-sm text-body-sm mt-2">{h.descripcion}</p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-surface-variant/50">
                      <span className="text-on-surface-variant font-label-md text-label-md">{h.clausula}</span>
                      <button
                        className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1"
                        type="button"
                      >
                        <span>{h.accion}</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-variant/40">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Bandeja de evidencias</h2>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    {evidencias.length} de {datos.evidencias.length} documentos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-on-surface-variant">Filtro:</span>
                  <select
                    className="bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg px-2.5 py-1.5 outline-none focus:bg-surface-container"
                    onChange={(ev) => setFiltro(ev.target.value)}
                    value={filtro}
                  >
                    <option value="todas">Todas</option>
                    {datos.pilares.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo}: {p.nombre}
                      </option>
                    ))}
                    <option value="observadas">Con observación</option>
                  </select>
                </div>
              </div>

              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-lg outline-none focus:ring-1 focus:ring-primary"
                  onChange={(ev) => setBusqueda(ev.target.value)}
                  placeholder="Buscar por nombre de archivo, cláusula o huella"
                  type="text"
                  value={busqueda}
                />
              </div>

              <div className="flex flex-col gap-3">
                {evidencias.length === 0 && (
                  <p className="text-on-surface-variant font-body-md text-body-md text-center py-6">
                    Ninguna evidencia coincide con el filtro.
                  </p>
                )}

                {evidencias.map((ev) => {
                  const est = ESTADO_EVIDENCIA[ev.estado]
                  const pilar = datos.pilares.find((p) => p.id === ev.pilarId)
                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-lg bg-surface-container-low hover:bg-surface-container/80 transition-all flex flex-col gap-2.5 ${
                        ev.estado === 'observada' ? 'border-l-4 border-error' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`p-2 rounded-lg material-symbols-outlined shrink-0 ${
                              ev.estado === 'observada'
                                ? 'bg-error-container text-error'
                                : 'bg-primary-container/20 text-primary'
                            }`}
                          >
                            {ICONO_FORMATO[ev.formato]}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-lg text-label-lg text-on-surface font-bold">{ev.archivo}</span>
                              <span className="font-label-caps text-label-caps text-on-surface-variant">{ev.tamano}</span>
                            </div>
                            <span className="text-on-surface-variant font-body-sm text-body-sm">
                              {pilar.nombre} ({pilar.codigo}) · Cláusula {ev.clausula}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-label-caps text-label-caps px-2.5 py-1 rounded-full font-bold self-start sm:self-center shrink-0 ${est.chip}`}
                        >
                          {ev.etiquetaEstado}
                        </span>
                      </div>

                      {ev.nota && (
                        <div className="bg-surface-container-lowest p-2.5 rounded-md text-on-surface font-body-sm text-body-sm">
                          <span className="font-semibold text-error">Comentario del revisor: </span>
                          <span>{ev.nota}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-variant/40 font-body-sm text-body-sm text-on-surface-variant">
                        <div className="flex items-center gap-3 flex-wrap">
                          {ev.vence ? (
                            <span className="flex items-center gap-1 text-error font-medium">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              Vence subsanación: {ev.vence}
                            </span>
                          ) : (
                            <span>
                              Subido por {ev.subidoPor} ({ev.fecha})
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-primary font-mono text-xs">
                            <span className={`material-symbols-outlined text-xs ${est.color}`}>{est.icono}</span>
                            {ind.algoritmoIntegridad}: {ev.hash}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {ev.estado === 'observada' && (
                            <button
                              className="bg-error text-on-error hover:bg-error-container hover:text-on-error-container px-3 py-1 rounded font-label-md text-label-md transition-colors"
                              type="button"
                            >
                              Solicitar subsanación
                            </button>
                          )}
                          <button
                            className="bg-surface-container text-primary hover:bg-surface-container-high px-3 py-1 rounded font-label-md text-label-md flex items-center gap-1"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            <span>Ver documento</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <section className="w-full bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-tertiary to-primary"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-tertiary text-2xl">verified</span>
                <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold tracking-wider">
                  Dictamen de la revisión interna
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold leading-tight">
                {datos.dictamen.titulo}
              </h3>
              <p className="mt-2 text-on-surface-variant font-body-md text-body-md max-w-3xl">
                {datos.dictamen.texto}
              </p>

              <div className="flex flex-wrap gap-4 mt-space-md pt-space-sm border-t border-surface-variant/50 text-on-surface-variant font-body-sm text-body-sm">
                <span>
                  Dictamen: <strong className="text-on-surface">{datos.dictamen.numero}</strong>
                </span>
                <span>·</span>
                <span>
                  Huella: <strong className="text-on-surface font-mono text-xs">{datos.dictamen.hash}</strong>
                </span>
                <span>·</span>
                <span>
                  Vigencia: <strong className="text-on-surface">{datos.dictamen.vigencia}</strong>
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 bg-surface-container-low p-space-md rounded-xl flex flex-col sm:flex-row lg:flex-col items-center gap-space-md">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-surface-container flex flex-col items-center justify-center text-primary border border-surface-variant/60">
                  <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                  <span className="font-label-caps text-label-caps text-[9px]">Expediente</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">Firma del revisor</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">{datos.revisor.nombre}</span>
                  <span className="font-label-caps text-label-caps text-primary">{datos.revisor.rol}</span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-2">
                <button
                  className="w-full bg-primary text-on-primary hover:bg-primary-container px-4 py-2.5 rounded-lg font-label-lg text-label-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">draw</span>
                  <span>Firmar dictamen</span>
                </button>
                <button
                  className="w-full bg-surface-container hover:bg-surface-container-high text-primary px-3 py-2 rounded-lg font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Descargar acta de revisión</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
