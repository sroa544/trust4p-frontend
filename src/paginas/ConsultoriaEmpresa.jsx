import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import { mensajeDeError } from '../servicios/api'
import { listarDiagnosticosDeEmpresa } from '../servicios/consultoria'
import { formatearFecha, numero } from '../servicios/validaciones'
import { ESTADOS_DIAGNOSTICO } from './Consultoria.jsx'

// HU-021: historial de diagnósticos de una empresa asignada.
export default function ConsultoriaEmpresa() {
  const { empresaId } = useParams()
  const [estado, setEstado] = useState({ fase: 'cargando', diagnosticos: [], error: '' })

  useEffect(() => {
    let activo = true
    listarDiagnosticosDeEmpresa(empresaId)
      .then((lista) =>
        activo &&
        setEstado({ fase: 'listo', diagnosticos: [...lista].sort((a, b) => b.consecutivo - a.consecutivo), error: '' }),
      )
      .catch((falla) => activo && setEstado({ fase: 'error', diagnosticos: [], error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [empresaId])

  const nombre = estado.diagnosticos[0]?.empresa_nombre

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <Link className="font-label-md text-label-md text-primary" to="/consultoria">← Empresas asignadas</Link>
          <h1 className="font-headline-xl text-headline-xl font-bold mt-1">{nombre ?? 'Historial de diagnósticos'}</h1>
        </header>

        <Aviso tipo="error">{estado.error}</Aviso>

        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-3.5 px-4">N.°</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Iniciado</th>
                <th className="py-3.5 px-4">Modelo</th>
                <th className="py-3.5 px-4">Índice</th>
                <th className="py-3.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {estado.fase === 'cargando' && (
                <tr><td className="py-6 px-4 text-on-surface-variant" colSpan="6">Cargando…</td></tr>
              )}
              {estado.fase === 'listo' && estado.diagnosticos.length === 0 && (
                <tr><td className="py-6 px-4 text-on-surface-variant" colSpan="6">La empresa aún no tiene diagnósticos.</td></tr>
              )}
              {estado.diagnosticos.map((d) => (
                <tr className="hover:bg-surface-container-low/60" key={d.id}>
                  <td className="py-4 px-4 font-bold">{d.consecutivo}</td>
                  <td className="py-4 px-4">{ESTADOS_DIAGNOSTICO[d.estado] ?? d.estado}</td>
                  <td className="py-4 px-4">{formatearFecha(d.iniciado_en)}</td>
                  <td className="py-4 px-4">{d.modelo_version}</td>
                  <td className="py-4 px-4">{d.resultado ? numero(d.resultado.indice_global) : '—'}</td>
                  <td className="py-4 px-4 text-right">
                    <Link className="text-primary font-semibold" to={`/consultoria/diagnosticos/${d.id}`}>Abrir</Link>
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
