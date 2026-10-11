import { useEffect, useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import { useSesion } from '../hooks/useSesion'
import { mensajeDeError } from '../servicios/api'
import { consultarIndicadores, exportarIndicadores } from '../servicios/indicadores'
import { obtenerModeloVigente } from '../servicios/modelo'
import { listarEmpresasParaReporte } from '../servicios/reportes'
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

// HU-023: el administrador ve el tablero de todas las empresas y el consultor el
// de las que tiene asignadas; ambos pueden filtrar por sector y tamaño o ver una
// sola empresa de su alcance. El administrador, además, exporta el CSV
// anonimizado.
export default function Indicadores() {
  const { rol } = useSesion()
  const esAdmin = rol === 'A4'
  const [filtros, setFiltros] = useState({ empresa_id: '', sector: '', tamano: '' })
  const [sectores, setSectores] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [nombresDimension, setNombresDimension] = useState({})
  const [estado, setEstado] = useState({ fase: 'cargando', datos: null, error: '' })
  const [exportando, setExportando] = useState(false)
  const [errorExportar, setErrorExportar] = useState('')

  useEffect(() => {
    listarSectores().then(setSectores).catch(() => setSectores([]))
    listarEmpresasParaReporte().then(setEmpresas).catch(() => setEmpresas([]))
    // Con el nombre de cada dimensión del modelo vigente; si no se puede
    // consultar se muestra el código.
    obtenerModeloVigente()
      .then((modelo) => setNombresDimension(Object.fromEntries(modelo.dimensiones.map((d) => [d.codigo, d.nombre]))))
      .catch(() => setNombresDimension({}))
  }, [])

  useEffect(() => {
    let activo = true
    setEstado((previo) => ({ ...previo, fase: 'cargando' }))
    consultarIndicadores(filtros)
      .then((datos) => activo && setEstado({ fase: 'listo', datos, error: '' }))
      .catch((falla) => activo && setEstado({ fase: 'error', datos: null, error: mensajeDeError(falla) }))
    return () => {
      activo = false
    }
  }, [filtros])

  async function exportar() {
    setErrorExportar('')
    setExportando(true)
    try {
      const { sector, tamano } = filtros
      guardarArchivo(await exportarIndicadores({ sector, tamano }), 'indicadores_agregados.csv')
    } catch (falla) {
      setErrorExportar(mensajeDeError(falla))
    } finally {
      setExportando(false)
    }
  }

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value })
  // Al elegir una empresa, sector y tamaño dejan de aplicar.
  const elegirEmpresa = (e) => setFiltros({ empresa_id: e.target.value, sector: '', tamano: '' })
  const datos = estado.datos
  const porEmpresa = Boolean(filtros.empresa_id)

  return (
    <main className="w-full flex-1 flex flex-col p-margin-mobile lg:p-margin">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-space-md pb-24">
        <header className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
          <span className="font-label-caps text-label-caps text-secondary uppercase">Indicadores agregados</span>
          <h1 className="font-headline-xl text-headline-xl font-bold">Comportamiento del portafolio</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {esAdmin
              ? 'Resumen de todas las empresas, o de una sola. Puede exportar los datos anonimizados por sector, tamaño y nivel.'
              : 'Resumen de las empresas que acompaña, o de una sola. Con menos de tres empresas en el filtro no se muestra el detalle agregado.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-space-md items-end">
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Empresa
              <select className="h-11 px-3 rounded-lg bg-surface-container-low" onChange={elegirEmpresa} value={filtros.empresa_id}>
                <option value="">{esAdmin ? 'Todas las empresas' : 'Todas mis empresas'}</option>
                {empresas.map((e) => (
                  <option key={e.empresa_id} value={e.empresa_id}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Sector
              <select className="h-11 px-3 rounded-lg bg-surface-container-low disabled:opacity-50" disabled={porEmpresa} onChange={cambiar('sector')} value={filtros.sector}>
                <option value="">Todos</option>
                {sectores.map((s) => (
                  <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-label-md text-label-md">
              Tamaño
              <select className="h-11 px-3 rounded-lg bg-surface-container-low disabled:opacity-50" disabled={porEmpresa} onChange={cambiar('tamano')} value={filtros.tamano}>
                <option value="">Todos</option>
                {TAMANOS.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.texto}</option>
                ))}
              </select>
            </label>
            {esAdmin && (
              <button className="h-11 px-6 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60" disabled={exportando || porEmpresa} onClick={exportar} type="button">
                {exportando ? 'Exportando…' : 'Exportar CSV'}
              </button>
            )}
          </div>
          <Aviso className="mt-3" tipo="error">{errorExportar}</Aviso>
        </header>

        <Aviso tipo="error">{estado.error}</Aviso>
        {estado.fase === 'cargando' && <p className="text-on-surface-variant" role="status">Cargando…</p>}
        {datos && !datos.detalle_disponible && <Aviso tipo="info">{datos.mensaje}</Aviso>}
        {datos?.detalle_disponible && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  {datos.ambito === 'empresa' ? 'Empresa' : 'Empresas'}
                </span>
                <div className="font-headline-xl text-headline-xl font-bold text-primary">
                  {datos.ambito === 'empresa' ? datos.empresa_nombre : datos.total_empresas}
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  {datos.ambito === 'empresa' ? 'Índice global' : 'Índice promedio'}
                </span>
                <div className="font-headline-xl text-headline-xl font-bold text-primary">{numero(datos.indice_promedio)}</div>
              </div>
            </section>
            {datos.ambito !== 'empresa' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TablaGrupos grupos={datos.por_nivel} titulo="Por nivel de madurez" />
                <TablaGrupos grupos={datos.por_sector} titulo="Por sector" />
                <TablaGrupos grupos={datos.por_tamano} titulo="Por tamaño" />
              </div>
            )}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
              <h2 className="font-headline-md text-headline-md font-bold mb-3">
                {datos.ambito === 'empresa' ? 'Puntaje por dimensión' : 'Promedio por dimensión'}
              </h2>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(datos.promedio_por_dimension).map(([codigo, valor]) => (
                  <li className="bg-surface-container-low rounded-lg p-3" key={codigo}>
                    <span className="font-label-caps text-label-caps text-outline uppercase block">{nombresDimension[codigo] ?? codigo}</span>
                    <span className="font-headline-sm text-headline-sm font-bold">{numero(valor)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
