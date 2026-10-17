import { useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { DialogoConfirmar } from '../componentes/Dialogo.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import { cerrarDiagnostico, reprocesarDiagnostico, reprocesarPendientes } from '../servicios/consultoria'
import { descargarInformeDeEmpresa, listarEmpresasParaReporte } from '../servicios/reportes'
import { guardarArchivo } from '../servicios/resultados'
import { listarSectores } from '../servicios/solicitudes'
import { formatearFecha, numero } from '../servicios/validaciones'

const TAMANOS = [
  { valor: 'micro', texto: 'Microempresa' },
  { valor: 'pequena', texto: 'Pequeña' },
  { valor: 'mediana', texto: 'Mediana' },
  { valor: 'grande', texto: 'Grande' },
]
const NOMBRE_TAMANO = Object.fromEntries(TAMANOS.map((t) => [t.valor, t.texto]))

const BOTON_SECUNDARIO =
  'h-10 px-4 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold disabled:opacity-50'

function Fila({ empresa, esAdmin, alError, alExito, alCambiar }) {
  // Los diagnósticos con la evaluación pendiente no tienen informe, pero el
  // administrador puede reprocesarlos o cerrarlos; se eligen en la misma lista.
  const opciones = [
    ...empresa.diagnosticos,
    ...(empresa.fallidos ?? []).map((f) => ({ ...f, estado: 'fallido' })),
  ].sort((a, b) => b.consecutivo - a.consecutivo)
  const [elegido, setElegido] = useState(opciones[0]?.id ?? '')
  const [descargando, setDescargando] = useState(false)
  const [dialogo, setDialogo] = useState(null)
  const diagnostico = opciones.find((d) => d.id === elegido) ?? opciones[0]
  const pendiente = diagnostico?.estado === 'fallido'
  const puedeActuar = esAdmin && diagnostico && diagnostico.estado !== 'cerrado'

  async function actuar(accion, textoExito) {
    alError('')
    alExito('')
    try {
      await accion(diagnostico.id)
      alExito(textoExito)
      alCambiar()
    } catch (falla) {
      alError(mensajeDeError(falla))
    }
  }

  async function descargar() {
    alError('')
    setDescargando(true)
    try {
      const pdf = await descargarInformeDeEmpresa(diagnostico.id)
      guardarArchivo(pdf, `informe-${empresa.nombre}-diagnostico-${diagnostico.consecutivo}.pdf`)
    } catch (falla) {
      alError(mensajeDeError(falla))
    } finally {
      setDescargando(false)
    }
  }

  return (
    <tr className="hover:bg-surface-container-low/60">
      <td className="py-4 px-4">
        <div className="font-label-lg text-label-lg font-bold">{empresa.nombre}</div>
        {empresa.nit && <div className="font-body-sm text-body-sm text-outline">NIT {empresa.nit}</div>}
      </td>
      <td className="py-4 px-4">{empresa.sector_nombre}</td>
      <td className="py-4 px-4">{NOMBRE_TAMANO[empresa.tamano] ?? '—'}</td>
      <td className="py-4 px-4">
        {pendiente
          ? 'Evaluación pendiente'
          : diagnostico
            ? `Nivel ${diagnostico.nivel} · índice ${numero(diagnostico.indice_global)}`
            : '—'}
      </td>
      <td className="py-4 px-4">
        {opciones.length === 0 ? (
          <span className="text-on-surface-variant">Sin informe disponible</span>
        ) : (
          <select
            aria-label={`Diagnóstico de ${empresa.nombre}`}
            className="h-10 px-3 rounded-lg bg-surface-container-low"
            onChange={(e) => setElegido(e.target.value)}
            value={diagnostico?.id ?? ''}
          >
            {opciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.estado === 'fallido'
                  ? `N.° ${d.consecutivo} · evaluación pendiente`
                  : `N.° ${d.consecutivo} · ${formatearFecha(d.evaluado_en)}${d.estado === 'cerrado' ? ' · cerrado' : ''}`}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col items-end gap-2">
          <button
            aria-label={`Descargar informe de ${empresa.nombre}`}
            className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-50"
            disabled={!diagnostico || pendiente || descargando}
            onClick={descargar}
            type="button"
          >
            {descargando ? 'Generando…' : 'Descargar informe'}
          </button>
          {puedeActuar && pendiente && (
            <button
              aria-label={`Reprocesar la evaluación del diagnóstico N.° ${diagnostico.consecutivo} de ${empresa.nombre}`}
              className={BOTON_SECUNDARIO}
              onClick={() => setDialogo('reprocesar')}
              type="button"
            >
              Reprocesar evaluación
            </button>
          )}
          {puedeActuar && (
            <button
              aria-label={`Cerrar el diagnóstico N.° ${diagnostico.consecutivo} de ${empresa.nombre}`}
              className={BOTON_SECUNDARIO}
              onClick={() => setDialogo('cerrar')}
              type="button"
            >
              Cerrar diagnóstico
            </button>
          )}
        </div>
        {dialogo === 'reprocesar' && (
          <DialogoConfirmar
            mensaje={`Se volverá a evaluar el diagnóstico N.° ${diagnostico.consecutivo} de ${empresa.nombre}. El resultado numérico se recalcula y la interpretación se genera en segundo plano.`}
            onCerrar={() => setDialogo(null)}
            onConfirmar={() =>
              actuar(
                reprocesarDiagnostico,
                'La evaluación se está reprocesando en segundo plano. Consulte la lista de nuevo en unos minutos.',
              )
            }
            textoConfirmar="Reprocesar"
            titulo="Reprocesar la evaluación"
          />
        )}
        {dialogo === 'cerrar' && (
          <DialogoConfirmar
            mensaje={`Al cerrar el diagnóstico N.° ${diagnostico.consecutivo} de ${empresa.nombre} concluye el acompañamiento y ya no admite nuevas recomendaciones. No se puede deshacer.`}
            onCerrar={() => setDialogo(null)}
            onConfirmar={() => actuar(cerrarDiagnostico, 'Diagnóstico cerrado.')}
            textoConfirmar="Sí, cerrar definitivamente"
            titulo="Cerrar el diagnóstico"
          />
        )}
      </td>
    </tr>
  )
}

// RF-17: el administrador consulta y descarga el informe de cualquier empresa y
// el consultor el de las que tiene asignadas. Se filtra por nombre, sector y
// tamaño para revisar empresa por empresa.
export default function InformesEmpresas() {
  const { rol } = useSesion()
  const esAdmin = rol === 'A4'
  const [filtros, setFiltros] = useState({ nombre: '', sector: '', tamano: '' })
  const [sectores, setSectores] = useState([])
  const [estado, setEstado] = useState({ fase: 'cargando', empresas: [], error: '' })
  const [errorDescarga, setErrorDescarga] = useState('')
  const [exito, setExito] = useState('')
  const [version, setVersion] = useState(0)
  const [confirmandoLote, setConfirmandoLote] = useState(false)

  useEffect(() => {
    listarSectores().then(setSectores).catch(() => setSectores([]))
  }, [])

  // El nombre se consulta con una pequeña espera para no pedir en cada tecla.
  useEffect(() => {
    let activo = true
    const espera = setTimeout(() => {
      setEstado((previo) => ({ ...previo, fase: 'cargando' }))
      listarEmpresasParaReporte({
        nombre: filtros.nombre.trim(),
        sector: filtros.sector,
        tamano: filtros.tamano,
      })
        .then((empresas) => activo && setEstado({ fase: 'listo', empresas, error: '' }))
        .catch((falla) => activo && setEstado({ fase: 'error', empresas: [], error: mensajeDeError(falla) }))
    }, 300)
    return () => {
      activo = false
      clearTimeout(espera)
    }
  }, [filtros, version])

  async function reprocesarTodo() {
    setErrorDescarga('')
    setExito('')
    try {
      const { en_cola: enCola } = await reprocesarPendientes()
      setExito(
        enCola === 0
          ? 'No hay diagnósticos con la evaluación pendiente.'
          : `${enCola} ${enCola === 1 ? 'diagnóstico se está reprocesando' : 'diagnósticos se están reprocesando'} en segundo plano. Consulte la lista de nuevo en unos minutos.`,
      )
      setVersion((v) => v + 1)
    } catch (falla) {
      setErrorDescarga(mensajeDeError(falla))
    }
  }

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })
  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase">Informes</span>
              <h1 className="font-headline-xl text-headline-xl font-bold">Informes por empresa</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {esAdmin
                  ? 'Consulte el resultado de cualquier empresa y descargue su informe.'
                  : 'Consulte el resultado de las empresas que acompaña y descargue su informe.'}
              </p>
            </div>
            {esAdmin && (
              <button className={BOTON_SECUNDARIO} onClick={() => setConfirmandoLote(true)} type="button">
                Reprocesar evaluaciones pendientes
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-space-md">
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Nombre de la empresa
              <input
                className="h-11 px-3 rounded-lg bg-surface-container-low"
                onChange={cambiar('nombre')}
                placeholder="Escriba para buscar"
                value={filtros.nombre}
              />
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Sector
              <select className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('sector')} value={filtros.sector}>
                <option value="">Todos</option>
                {sectores.map((s) => (
                  <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Tamaño
              <select className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('tamano')} value={filtros.tamano}>
                <option value="">Todos</option>
                {TAMANOS.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.texto}</option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <Aviso tipo="error">{estado.error}</Aviso>
        <Aviso tipo="error">{errorDescarga}</Aviso>
        <Aviso tipo="exito">{exito}</Aviso>

        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4">Tamaño</th>
                <th className="py-3.5 px-4">Resultado</th>
                <th className="py-3.5 px-4">Diagnóstico</th>
                <th className="py-3.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {estado.fase === 'cargando' && (
                <tr><td className="py-6 px-4 text-on-surface-variant" colSpan="6">Cargando…</td></tr>
              )}
              {estado.fase === 'listo' && estado.empresas.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-on-surface-variant" colSpan="6">
                    {hayFiltros ? 'Ninguna empresa coincide con los filtros.' : 'No hay empresas para mostrar.'}
                  </td>
                </tr>
              )}
              {estado.fase === 'listo' &&
                estado.empresas.map((empresa) => (
                  <Fila
                    alCambiar={() => setVersion((v) => v + 1)}
                    alError={setErrorDescarga}
                    alExito={setExito}
                    empresa={empresa}
                    esAdmin={esAdmin}
                    key={empresa.empresa_id}
                  />
                ))}
            </tbody>
          </table>
        </section>
      </div>

      {confirmandoLote && (
        <DialogoConfirmar
          mensaje="Se volverá a evaluar, una tras otra y en segundo plano, cada diagnóstico con la evaluación pendiente de todas las empresas."
          onCerrar={() => setConfirmandoLote(false)}
          onConfirmar={reprocesarTodo}
          textoConfirmar="Reprocesar"
          titulo="Reprocesar las evaluaciones pendientes"
        />
      )}
    </main>
  )
}
