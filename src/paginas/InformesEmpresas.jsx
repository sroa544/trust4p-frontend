import { useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
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

function Fila({ empresa, alError }) {
  const [elegido, setElegido] = useState(empresa.diagnosticos[0]?.id ?? '')
  const [descargando, setDescargando] = useState(false)
  const diagnostico = empresa.diagnosticos.find((d) => d.id === elegido)

  async function descargar() {
    alError('')
    setDescargando(true)
    try {
      const pdf = await descargarInformeDeEmpresa(elegido)
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
        {diagnostico ? `Nivel ${diagnostico.nivel} · índice ${numero(diagnostico.indice_global)}` : '—'}
      </td>
      <td className="py-4 px-4">
        {empresa.diagnosticos.length === 0 ? (
          <span className="text-on-surface-variant">Sin informe disponible</span>
        ) : (
          <select
            aria-label={`Diagnóstico de ${empresa.nombre}`}
            className="h-10 px-3 rounded-lg bg-surface-container-low"
            onChange={(e) => setElegido(e.target.value)}
            value={elegido}
          >
            {empresa.diagnosticos.map((d) => (
              <option key={d.id} value={d.id}>
                N.° {d.consecutivo} · {formatearFecha(d.evaluado_en)}
                {d.estado === 'cerrado' ? ' · cerrado' : ''}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <button
          aria-label={`Descargar informe de ${empresa.nombre}`}
          className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-50"
          disabled={!diagnostico || descargando}
          onClick={descargar}
          type="button"
        >
          {descargando ? 'Generando…' : 'Descargar informe'}
        </button>
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
  }, [filtros])

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })
  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Informes</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Informes por empresa</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {esAdmin
              ? 'Consulte el resultado de cualquier empresa y descargue su informe.'
              : 'Consulte el resultado de las empresas que acompaña y descargue su informe.'}
          </p>
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
                  <Fila alError={setErrorDescarga} empresa={empresa} key={empresa.empresa_id} />
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  )
}
