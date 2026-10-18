import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import ConsultoriaDiagnostico from '../paginas/ConsultoriaDiagnostico.jsx'
import InformesEmpresas from '../paginas/InformesEmpresas.jsx'
import { ErrorApi } from '../servicios/api'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO, PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('../servicios/reportes', () => ({
  listarEmpresasParaReporte: vi.fn(),
  descargarInformeDeEmpresa: vi.fn(),
}))
vi.mock('../servicios/consultoria', () => ({
  cerrarDiagnostico: vi.fn(),
  reprocesarDiagnostico: vi.fn(),
  reprocesarPendientes: vi.fn(),
  obtenerDiagnosticoAsignado: vi.fn(),
  obtenerCuestionarioAsignado: vi.fn(),
  registrarRecomendacion: vi.fn(),
  editarTarea: vi.fn(),
  avanzarNivel: vi.fn(),
}))
vi.mock('../servicios/solicitudes', () => ({ listarSectores: vi.fn() }))

const autenticacion = await import('../servicios/autenticacion')
const reportes = await import('../servicios/reportes')
const consultoria = await import('../servicios/consultoria')
const { listarSectores } = await import('../servicios/solicitudes')

// El administrador cierra y reprocesa desde «Informes por empresa» (la empresa
// puede no tener consultor); el consultor reprocesa desde el detalle del
// diagnóstico de una empresa asignada.

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
      { id: 'd-1-1', consecutivo: 1, estado: 'evaluado', nivel: 2, indice_global: '45', evaluado_en: '2026-08-01T10:00:00Z' },
    ],
    fallidos: [],
  },
  {
    empresa_id: 'e-2',
    nombre: 'Beta SAS',
    nit: null,
    sector_codigo: 'fintech',
    sector_nombre: 'Fintech y Servicios financieros',
    numero_empleados: 40,
    tamano: 'pequena',
    diagnosticos: [
      { id: 'd-2-1', consecutivo: 1, estado: 'cerrado', nivel: 3, indice_global: '70', evaluado_en: '2026-07-01T10:00:00Z' },
    ],
    fallidos: [{ id: 'd-2-2', consecutivo: 2 }],
  },
  {
    empresa_id: 'e-3',
    nombre: 'Gamma SAS',
    nit: null,
    sector_codigo: 'fintech',
    sector_nombre: 'Fintech y Servicios financieros',
    numero_empleados: 400,
    tamano: 'grande',
    diagnosticos: [],
    fallidos: [{ id: 'd-3-1', consecutivo: 1 }],
  },
]

function montarInformes(rol) {
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: rol })
  render(
    <MemoryRouter>
      <SesionProvider>
        <InformesEmpresas />
      </SesionProvider>
    </MemoryRouter>,
  )
}

const filaDe = async (nombre) => (await screen.findByText(nombre)).closest('tr')

beforeEach(() => {
  vi.clearAllMocks()
  listarSectores.mockResolvedValue([])
  reportes.listarEmpresasParaReporte.mockResolvedValue(EMPRESAS)
})

describe('Informes por empresa: cierre y reproceso por el administrador', () => {
  it('el diagnóstico evaluado se puede cerrar, previa confirmación, y la lista se actualiza', async () => {
    consultoria.cerrarDiagnostico.mockResolvedValue({})
    const usuario = userEvent.setup()
    montarInformes('administrador')
    const fila = await filaDe('Alfa SAS')

    expect(within(fila).queryByRole('button', { name: /Reprocesar/ })).not.toBeInTheDocument()
    await usuario.click(within(fila).getByRole('button', { name: 'Cerrar el diagnóstico N.° 1 de Alfa SAS' }))
    expect(consultoria.cerrarDiagnostico).not.toHaveBeenCalled()
    await usuario.click(screen.getByRole('button', { name: 'Sí, cerrar definitivamente' }))

    await waitFor(() => expect(consultoria.cerrarDiagnostico).toHaveBeenCalledWith('d-1-1'))
    expect(await screen.findByText('Diagnóstico cerrado.')).toBeInTheDocument()
    await waitFor(() => expect(reportes.listarEmpresasParaReporte).toHaveBeenCalledTimes(2))
  })

  it('cancelar la confirmación no cierra nada', async () => {
    const usuario = userEvent.setup()
    montarInformes('administrador')
    const fila = await filaDe('Alfa SAS')

    await usuario.click(within(fila).getByRole('button', { name: 'Cerrar el diagnóstico N.° 1 de Alfa SAS' }))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(consultoria.cerrarDiagnostico).not.toHaveBeenCalled()
  })

  it('un diagnóstico ya cerrado no ofrece acciones', async () => {
    montarInformes('administrador')
    const fila = await filaDe('Beta SAS')
    const usuario = userEvent.setup()

    await usuario.selectOptions(within(fila).getByLabelText('Diagnóstico de Beta SAS'), 'd-2-1')

    expect(within(fila).queryByRole('button', { name: /Cerrar el diagnóstico/ })).not.toBeInTheDocument()
    expect(within(fila).queryByRole('button', { name: /Reprocesar/ })).not.toBeInTheDocument()
  })

  it('el diagnóstico con evaluación pendiente se elige en la lista, no tiene informe y se puede reprocesar', async () => {
    consultoria.reprocesarDiagnostico.mockResolvedValue({})
    const usuario = userEvent.setup()
    montarInformes('administrador')
    const fila = await filaDe('Beta SAS')

    expect(within(fila).getByLabelText('Diagnóstico de Beta SAS')).toHaveValue('d-2-2')
    expect(within(fila).getByText('Evaluación pendiente')).toBeInTheDocument()
    expect(within(fila).getByRole('button', { name: 'Descargar informe de Beta SAS' })).toBeDisabled()

    await usuario.click(
      within(fila).getByRole('button', { name: 'Reprocesar la evaluación del diagnóstico N.° 2 de Beta SAS' }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Reprocesar' }))

    await waitFor(() => expect(consultoria.reprocesarDiagnostico).toHaveBeenCalledWith('d-2-2'))
    expect(await screen.findByText(/se está reprocesando en segundo plano/)).toBeInTheDocument()
  })

  it('una empresa solo con diagnósticos pendientes los muestra en vez de «Sin informe disponible»', async () => {
    montarInformes('administrador')
    const fila = await filaDe('Gamma SAS')

    expect(within(fila).queryByText('Sin informe disponible')).not.toBeInTheDocument()
    expect(within(fila).getByRole('option', { name: 'N.° 1 · evaluación pendiente' })).toBeInTheDocument()
  })

  it('muestra el mensaje del servidor si el cierre falla', async () => {
    consultoria.cerrarDiagnostico.mockRejectedValue(
      new ErrorApi(400, 'El diagnóstico debe estar evaluado o fallido para cerrarse (estado actual: completado)'),
    )
    const usuario = userEvent.setup()
    montarInformes('administrador')
    const fila = await filaDe('Alfa SAS')

    await usuario.click(within(fila).getByRole('button', { name: 'Cerrar el diagnóstico N.° 1 de Alfa SAS' }))
    await usuario.click(screen.getByRole('button', { name: 'Sí, cerrar definitivamente' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/debe estar evaluado o fallido/)
  })

  it('el administrador reprocesa todas las evaluaciones pendientes y se le dice cuántas', async () => {
    consultoria.reprocesarPendientes.mockResolvedValue({ en_cola: 2, diagnosticos: ['d-2-2', 'd-3-1'] })
    const usuario = userEvent.setup()
    montarInformes('administrador')
    await filaDe('Alfa SAS')

    await usuario.click(screen.getByRole('button', { name: 'Reprocesar evaluaciones pendientes' }))
    await usuario.click(screen.getByRole('button', { name: 'Reprocesar' }))

    await waitFor(() => expect(consultoria.reprocesarPendientes).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/2 diagnósticos se están reprocesando/)).toBeInTheDocument()
  })

  it('si no hay nada pendiente el lote lo dice', async () => {
    consultoria.reprocesarPendientes.mockResolvedValue({ en_cola: 0, diagnosticos: [] })
    const usuario = userEvent.setup()
    montarInformes('administrador')
    await filaDe('Alfa SAS')

    await usuario.click(screen.getByRole('button', { name: 'Reprocesar evaluaciones pendientes' }))
    await usuario.click(screen.getByRole('button', { name: 'Reprocesar' }))

    expect(await screen.findByText('No hay diagnósticos con la evaluación pendiente.')).toBeInTheDocument()
  })

  it('el consultor no ve las acciones del administrador en esta pantalla', async () => {
    montarInformes('consultor')
    const fila = await filaDe('Alfa SAS')

    expect(within(fila).queryByRole('button', { name: /Cerrar el diagnóstico/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reprocesar evaluaciones pendientes' })).not.toBeInTheDocument()
  })
})

describe('Detalle del diagnóstico de una empresa asignada: reproceso', () => {
  function montarDetalle(estadoDiagnostico) {
    consultoria.obtenerDiagnosticoAsignado.mockResolvedValue({
      ...DIAGNOSTICO_EVALUADO,
      estado: estadoDiagnostico,
      recomendaciones: [],
    })
    consultoria.obtenerCuestionarioAsignado.mockResolvedValue(CUESTIONARIO)
    render(
      <MemoryRouter initialEntries={['/consultoria/diagnosticos/diag-1']}>
        <Routes>
          <Route element={<ConsultoriaDiagnostico />} path="/consultoria/diagnosticos/:id" />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('un diagnóstico con evaluación pendiente ofrece reprocesarla y avisa que sigue en segundo plano', async () => {
    consultoria.reprocesarDiagnostico.mockResolvedValue({})
    const usuario = userEvent.setup()
    montarDetalle('fallido')

    await usuario.click(await screen.findByRole('button', { name: 'Reprocesar evaluación' }))
    await usuario.click(screen.getByRole('button', { name: 'Reprocesar' }))

    await waitFor(() => expect(consultoria.reprocesarDiagnostico).toHaveBeenCalledWith('diag-1'))
    expect(await screen.findByText(/se está reprocesando en segundo plano/)).toBeInTheDocument()
  })

  it('un diagnóstico evaluado no ofrece reprocesar', async () => {
    montarDetalle('evaluado')

    await screen.findByRole('heading', { name: 'Cerrar el diagnóstico' })
    expect(screen.queryByRole('button', { name: 'Reprocesar evaluación' })).not.toBeInTheDocument()
  })
})
