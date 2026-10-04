import { useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import { consultarIndicadores, exportarIndicadores } from '../servicios/indicadores'
import { guardarArchivo } from '../servicios/resultados'
import { listarSectores } from '../servicios/solicitudes'
import { numero } from '../servicios/validaciones'

const TAMANOS = [
  { valor: 'micro', texto: 'Microempresa' },
  { valor: 'pequena', texto: 'Pequeña' },
  { valor: 'mediana', texto: 'Mediana' },
  { valor: 'grande', texto: 'Grande' },
]

function TablaGrupos({ titulo, grupos }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
      <h2 className="font-headline-md text-headline-md font-bold mb-3">{titulo}</h2>
      {grupos.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Sin datos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {grupos.map((g) => (
            <li key={g.clave}>
              <div className="flex justify-between font-label-lg text-label-lg">
                <span>{g.etiqueta}</span>
                <span>
                  {g.empresas} · {numero(g.porcentaje)}% · índice {numero(g.indice_promedio)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, Number(g.porcentaje))}%` }}></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Indicadores() {
  const { rol } = useSesion()
  const esAdmin = rol === 'A4'
  const [filtros, setFiltros] = useState({ sector: '', tamano: '' })
  const [sectores, setSectores] = useState([])
  const [estado, setEstado] = useState({ fase: esAdmin ? 'listo' : 'cargando', datos: null, error: '' })
  const [exportando, setExportando] = useState(false)
  const [errorExportar, setErrorExportar] = useState('')

  useEffect(() => {
    listarSectores().then(setSectores).catch(() => setSectores([]))
  }, [])

  useEffect(() => {
    if (esAdmin) return undefined
    let activo = true
    setEstado((previo) => ({ ...previo, fase: 'cargando' }))
    consultarIndicadores(filtros)
      .then((datos) => activo && setEstado({ fase: 'listo', datos, error: '' }))
      .catch((falla) => activo && setEstado({ fase: 'error', datos: null, error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [filtros, esAdmin])

  async function exportar() {
    setErrorExportar('')
    setExportando(true)
    try {
      guardarArchivo(await exportarIndicadores(filtros), 'indicadores_agregados.csv')
    } catch (falla) {
      setErrorExportar(mensajeDeError(falla))
    } finally {
      setExportando(false)
    }
  }

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })
  const datos = estado.datos

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Indicadores agregados</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Comportamiento del portafolio</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {esAdmin
              ? 'Exporte los datos anonimizados por sector, tamaño y nivel. Las celdas con menos de tres empresas se omiten.'
              : 'Resumen de las empresas que acompaña. Con menos de tres empresas en el filtro no se muestra el detalle.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-space-md items-end">
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
            {esAdmin && (
              <button className="h-11 px-6 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60" disabled={exportando} onClick={exportar} type="button">
                {exportando ? 'Exportando…' : 'Exportar CSV'}
              </button>
            )}
          </div>
          <Aviso className="mt-3" tipo="error">{errorExportar}</Aviso>
        </header>

        {!esAdmin && (
          <>
            <Aviso tipo="error">{estado.error}</Aviso>
            {estado.fase === 'cargando' && <p className="text-on-surface-variant" role="status">Cargando…</p>}
            {datos && !datos.detalle_disponible && <Aviso tipo="info">{datos.mensaje}</Aviso>}
            {datos?.detalle_disponible && (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                    <span className="font-label-caps text-label-caps text-outline uppercase">Empresas</span>
                    <div className="font-headline-xl text-headline-xl font-bold text-primary">{datos.total_empresas}</div>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                    <span className="font-label-caps text-label-caps text-outline uppercase">Índice promedio</span>
                    <div className="font-headline-xl text-headline-xl font-bold text-primary">{numero(datos.indice_promedio)}</div>
                  </div>
                </section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <TablaGrupos grupos={datos.por_nivel} titulo="Por nivel de madurez" />
                  <TablaGrupos grupos={datos.por_sector} titulo="Por sector" />
                  <TablaGrupos grupos={datos.por_tamano} titulo="Por tamaño" />
                </div>
                <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                  <h2 className="font-headline-md text-headline-md font-bold mb-3">Promedio por dimensión</h2>
                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(datos.promedio_por_dimension).map(([codigo, valor]) => (
                      <li className="bg-surface-container-low rounded-lg p-3" key={codigo}>
                        <span className="font-label-caps text-label-caps text-outline uppercase block">{codigo}</span>
                        <span className="font-headline-sm text-headline-sm font-bold">{numero(valor)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
