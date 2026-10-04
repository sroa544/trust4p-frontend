import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { mensajeDeError } from '../servicios/api'
import { listarEmpresasAsignadas } from '../servicios/consultoria'
import { formatearFecha, numero } from '../servicios/validaciones'

export const ESTADOS_DIAGNOSTICO = {
  borrador: 'En borrador',
  completado: 'Completado',
  evaluado: 'Evaluado',
  fallido: 'Evaluación pendiente',
  cerrado: 'Cerrado',
}

// HU-020: empresas asignadas al consultor con el estado y el nivel de su
// diagnóstico más reciente.
export default function Consultoria() {
  const [filtros, setFiltros] = useState({ estado: '', fecha_desde: '', fecha_hasta: '' })
  const [estado, setEstado] = useState({ fase: 'cargando', empresas: [], error: '' })

  useEffect(() => {
    let activo = true
    setEstado((previo) => ({ ...previo, fase: 'cargando' }))
    const consulta = {
      estado: filtros.estado,
      fecha_desde: filtros.fecha_desde ? `${filtros.fecha_desde}T00:00:00Z` : '',
      fecha_hasta: filtros.fecha_hasta ? `${filtros.fecha_hasta}T23:59:59Z` : '',
    }
    listarEmpresasAsignadas(consulta)
      .then((empresas) => activo && setEstado({ fase: 'listo', empresas, error: '' }))
      .catch((falla) => activo && setEstado({ fase: 'error', empresas: [], error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [filtros])

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Consultoría</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Empresas asignadas</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Empresas que acompaña, con el estado y el nivel de su diagnóstico más reciente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-space-md">
            <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface">
              Estado del diagnóstico
              <select className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('estado')} value={filtros.estado}>
                <option value="">Todos</option>
                {Object.entries(ESTADOS_DIAGNOSTICO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface">
              Iniciado desde
              <input className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('fecha_desde')} type="date" value={filtros.fecha_desde} />
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface">
              Iniciado hasta
              <input className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={cambiar('fecha_hasta')} type="date" value={filtros.fecha_hasta} />
            </label>
          </div>
        </header>

        <Aviso tipo="error">{estado.error}</Aviso>

        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Diagnóstico</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Iniciado</th>
                <th className="py-3.5 px-4">Índice</th>
                <th className="py-3.5 px-4">Nivel</th>
                <th className="py-3.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {estado.fase === 'cargando' && (
                <tr><td className="py-6 px-4 text-on-surface-variant" colSpan="7">Cargando…</td></tr>
              )}
              {estado.fase === 'listo' && estado.empresas.length === 0 && (
                <tr><td className="py-6 px-4 text-on-surface-variant" colSpan="7">No hay empresas que coincidan.</td></tr>
              )}
              {estado.empresas.map((e) => (
                <tr className="hover:bg-surface-container-low/60" key={e.empresa_id}>
                  <td className="py-4 px-4 font-label-lg text-label-lg font-bold">{e.empresa_nombre}</td>
                  <td className="py-4 px-4">{e.consecutivo ? `N.° ${e.consecutivo}` : 'Sin diagnósticos'}</td>
                  <td className="py-4 px-4">{ESTADOS_DIAGNOSTICO[e.estado] ?? '—'}</td>
                  <td className="py-4 px-4">{formatearFecha(e.iniciado_en)}</td>
                  <td className="py-4 px-4">{e.indice_global !== null ? numero(e.indice_global) : '—'}</td>
                  <td className="py-4 px-4">{e.nivel ?? '—'}</td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {e.diagnostico_id && (
                      <Link className="text-primary font-semibold mr-4" to={`/consultoria/diagnosticos/${e.diagnostico_id}`}>
                        Ver último
                      </Link>
                    )}
                    <Link className="text-primary font-semibold" to={`/consultoria/empresas/${e.empresa_id}`}>
                      Historial
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  )
}
