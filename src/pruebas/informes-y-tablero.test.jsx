import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import Indicadores from '../paginas/Indicadores.jsx'
import InformesEmpresas from '../paginas/InformesEmpresas.jsx'
import { ErrorApi } from '../servicios/api'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('../servicios/reportes', () => ({
  listarEmpresasParaReporte: vi.fn(),
  descargarInformeDeEmpresa: vi.fn(),
}))
vi.mock('../servicios/indicadores', () => ({
  consultarIndicadores: vi.fn(),
  exportarIndicadores: vi.fn(),
}))
vi.mock('../servicios/modelo', () => ({ obtenerModeloVigente: vi.fn() }))
vi.mock('../servicios/solicitudes', () => ({ listarSectores: vi.fn() }))
vi.mock('../servicios/resultados', async (original) => ({
  ...(await original()),
  guardarArchivo: vi.fn(),
}))

const autenticacion = await import('../servicios/autenticacion')
const reportes = await import('../servicios/reportes')
const indicadores = await import('../servicios/indicadores')
const { obtenerModeloVigente } = await import('../servicios/modelo')
const { listarSectores } = await import('../servicios/solicitudes')
const { guardarArchivo } = await import('../servicios/resultados')

// El administrador alcanza a todas las empresas; el consultor, a las suyas (lo
// decide el servidor). La interfaz ofrece los mismos filtros a ambos.

const EMPRESAS = [
  {
    empresa_id: 'e-1',
    nombre: 'Alfa SAS',
    nit: '900111',
    sector_codigo: 'tecnologia',
    sector_nombre: 'Tecnología y Software',
    numero_empleados: 30,
    tamano: 'pequena',
    diagnosticos: [
      { id: 'd-1-2', consecutivo: 2, estado: 'cerrado', nivel: 3, indice_global: '71.5', evaluado_en: '2026-09-20T10:00:00Z' },
      { id: 'd-1-1', consecutivo: 1, estado: 'evaluado', nivel: 2, indice_global: '45', evaluado_en: '2026-08-01T10:00:00Z' },
    ],
  },
  {
    empresa_id: 'e-2',
    nombre: 'Beta SAS',
    nit: null,
    sector_codigo: 'fintech',
    sector_nombre: 'Fintech y Servicios financieros',
    numero_empleados: 400,
    tamano: 'grande',
    diagnosticos: [],
  },
]

function montar(pagina, rol) {
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: rol })
  render(
    <MemoryRouter>
      <SesionProvider>{pagina}</SesionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listarSectores.mockResolvedValue([
    { codigo: 'tecnologia', nombre: 'Tecnología y Software' },
    { codigo: 'fintech', nombre: 'Fintech y Servicios financieros' },
  ])
  reportes.listarEmpresasParaReporte.mockResolvedValue(EMPRESAS)
  obtenerModeloVigente.mockResolvedValue({
    dimensiones: [
      { codigo: 'proposito', nombre: 'Propósito' },
      { codigo: 'procesos', nombre: 'Procesos' },
    ],
  })
})

describe('Informes por empresa', () => {
  it('lista las empresas con su resultado y el diagnóstico más reciente elegido', async () => {
    montar(<InformesEmpresas />, 'administrador')

    const fila = (await screen.findByText('Alfa SAS')).closest('tr')
    expect(within(fila).getByText(/Nivel 3 · índice 71.5/)).toBeInTheDocument()
    expect(within(fila).getByText('Pequeña')).toBeInTheDocument()
    expect(within(fila).getByLabelText('Diagnóstico de Alfa SAS')).toHaveValue('d-1-2')
  })

  it('una empresa sin diagnóstico evaluado no permite descargar', async () => {
    montar(<InformesEmpresas />, 'administrador')

    const fila = (await screen.findByText('Beta SAS')).closest('tr')
    expect(within(fila).getByText('Sin informe disponible')).toBeInTheDocument()
    expect(within(fila).getByRole('button', { name: /Descargar informe/ })).toBeDisabled()
  })

  it('descarga el informe del diagnóstico elegido', async () => {
    reportes.descargarInformeDeEmpresa.mockResolvedValue(new Blob(['%PDF']))
    const usuario = userEvent.setup()
    montar(<InformesEmpresas />, 'administrador')
    const fila = (await screen.findByText('Alfa SAS')).closest('tr')

    await usuario.selectOptions(within(fila).getByLabelText('Diagnóstico de Alfa SAS'), 'd-1-1')
    await usuario.click(within(fila).getByRole('button', { name: 'Descargar informe de Alfa SAS' }))

    await waitFor(() => expect(reportes.descargarInformeDeEmpresa).toHaveBeenCalledWith('d-1-1'))
    expect(guardarArchivo).toHaveBeenCalledWith(expect.any(Blob), 'informe-Alfa SAS-diagnostico-1.pdf')
  })

  it('muestra el mensaje del servidor si la descarga falla', async () => {
    reportes.descargarInformeDeEmpresa.mockRejectedValue(new ErrorApi(403, 'No tiene acceso al informe de esta empresa'))
    const usuario = userEvent.setup()
    montar(<InformesEmpresas />, 'consultor')

    await usuario.click(await screen.findByRole('button', { name: 'Descargar informe de Alfa SAS' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/No tiene acceso al informe/)
  })

  it('filtra por nombre, sector y tamaño', async () => {
    const usuario = userEvent.setup()
    montar(<InformesEmpresas />, 'administrador')
    await screen.findByText('Alfa SAS')

    await usuario.type(screen.getByLabelText('Nombre de la empresa'), 'alf')
    await usuario.selectOptions(screen.getByLabelText('Sector'), 'tecnologia')
    await usuario.selectOptions(screen.getByLabelText('Tamaño'), 'pequena')

    await waitFor(() =>
      expect(reportes.listarEmpresasParaReporte).toHaveBeenLastCalledWith({
        nombre: 'alf',
        sector: 'tecnologia',
        tamano: 'pequena',
      }),
    )
  })

  it('sin coincidencias lo dice cuando hay filtros', async () => {
    const usuario = userEvent.setup()
    montar(<InformesEmpresas />, 'administrador')
    await screen.findByText('Alfa SAS')
    reportes.listarEmpresasParaReporte.mockResolvedValue([])

    await usuario.type(screen.getByLabelText('Nombre de la empresa'), 'zzz')

    expect(await screen.findByText(/Ninguna empresa coincide con los filtros/)).toBeInTheDocument()
  })

  it('el texto cambia según el rol', async () => {
    montar(<InformesEmpresas />, 'consultor')

    expect(await screen.findByText(/empresas que acompaña/i)).toBeInTheDocument()
  })
})

describe('Tablero de indicadores', () => {
  const AGREGADO = {
    detalle_disponible: true,
    ambito: 'total',
    total_empresas: 5,
    indice_promedio: '59.06',
    por_nivel: [{ clave: '2', etiqueta: 'Nivel 2', empresas: 3, porcentaje: '60', indice_promedio: '50' }],
    por_sector: [],
    por_tamano: [],
    promedio_por_dimension: { proposito: '70', procesos: '55' },
  }

  beforeEach(() => {
    indicadores.consultarIndicadores.mockResolvedValue(AGREGADO)
  })

  it.each(['administrador', 'consultor'])('el rol %s ve el tablero apenas entra', async (rol) => {
    montar(<Indicadores />, rol)

    expect(await screen.findByText('59.1')).toBeInTheDocument()
    expect(indicadores.consultarIndicadores).toHaveBeenCalledWith({ empresa_id: '', sector: '', tamano: '' })
  })

  it('muestra el nombre de cada dimensión, no su código', async () => {
    montar(<Indicadores />, 'administrador')

    expect(await screen.findByText('Propósito')).toBeInTheDocument()
    expect(screen.getByText('Procesos')).toBeInTheDocument()
    expect(screen.queryByText('proposito')).not.toBeInTheDocument()
  })

  it('el administrador ve «Todas las empresas» y el consultor «Todas mis empresas»', async () => {
    montar(<Indicadores />, 'administrador')
    expect(await screen.findByRole('option', { name: 'Todas las empresas' })).toBeInTheDocument()
  })

  it('el consultor ve «Todas mis empresas»', async () => {
    montar(<Indicadores />, 'consultor')
    expect(await screen.findByRole('option', { name: 'Todas mis empresas' })).toBeInTheDocument()
  })

  it('solo el administrador exporta el CSV', async () => {
    montar(<Indicadores />, 'consultor')
    await screen.findByText('59.1')
    expect(screen.queryByRole('button', { name: 'Exportar CSV' })).not.toBeInTheDocument()
  })

  it('al elegir una empresa pide solo esa empresa y deshabilita sector, tamaño y exportación', async () => {
    indicadores.consultarIndicadores.mockImplementation(async (filtros) =>
      filtros.empresa_id
        ? {
            detalle_disponible: true,
            ambito: 'empresa',
            empresa_nombre: 'Alfa SAS',
            total_empresas: 1,
            indice_promedio: '71.5',
            por_nivel: [],
            por_sector: [],
            por_tamano: [],
            promedio_por_dimension: { proposito: '80', procesos: '63' },
          }
        : AGREGADO,
    )
    const usuario = userEvent.setup()
    montar(<Indicadores />, 'administrador')
    await screen.findByText('59.1')
    await screen.findByRole('option', { name: 'Alfa SAS' })

    await usuario.selectOptions(screen.getByLabelText('Empresa'), 'e-1')

    expect(await screen.findByText('Alfa SAS', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByText('Puntaje por dimensión')).toBeInTheDocument()
    expect(indicadores.consultarIndicadores).toHaveBeenLastCalledWith({ empresa_id: 'e-1', sector: '', tamano: '' })
    expect(screen.getByLabelText('Sector')).toBeDisabled()
    expect(screen.getByLabelText('Tamaño')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
    expect(screen.queryByText('Por nivel de madurez')).not.toBeInTheDocument()
  })

  it('al consultor con pocas empresas se le explica por qué no hay detalle', async () => {
    indicadores.consultarIndicadores.mockResolvedValue({
      detalle_disponible: false,
      mensaje: 'El filtro aplicado agrupa menos de 3 empresas; el detalle agregado no se presenta para preservar la confidencialidad',
    })
    montar(<Indicadores />, 'consultor')

    expect(await screen.findByText(/preservar la confidencialidad/)).toBeInTheDocument()
  })

  it('muestra el mensaje del servidor si la consulta falla', async () => {
    indicadores.consultarIndicadores.mockRejectedValue(new ErrorApi(403, 'La empresa no está dentro de su alcance'))
    montar(<Indicadores />, 'consultor')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no está dentro de su alcance/)
  })
})
