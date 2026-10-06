import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { ErrorApi } from '../servicios/api'
import { MODELO_PUBLICADO } from './datosModelo.js'

vi.mock('../servicios/solicitudes', () => ({
  listarSolicitudes: vi.fn().mockResolvedValue([]),
  aprobarSolicitud: vi.fn(),
  rechazarSolicitud: vi.fn(),
}))
vi.mock('../servicios/modelos', () => ({
  listarModelos: vi.fn(),
  consultarModelo: vi.fn(),
  crearNuevaVersion: vi.fn(),
  publicarModelo: vi.fn(),
  editarDimension: vi.fn(),
  agregarDimension: vi.fn(),
  quitarDimension: vi.fn(),
  agregarPregunta: vi.fn(),
  editarPregunta: vi.fn(),
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const modelos = await import('../servicios/modelos')

// HU-035 Simular cambio de pesos
//
// CA-01 (camino principal)
//   Dado que el administrador ejecuta una simulación de ponderaciones
//   Cuando consulta los resultados originales
//   Entonces los resultados almacenados permanecen sin cambios
//
// El recálculo es del backend (en memoria, sin persistir); la interfaz envía
// los pesos propuestos, muestra la comparación y nunca modifica el modelo.

const SIMULACION = {
  modelo_version: '2026.1',
  total: 2,
  con_cambio_de_nivel: 1,
  variacion_promedio: '-2.50',
  comparaciones: [
    {
      diagnostico_id: 'd1',
      empresa_id: 'e1',
      empresa_nombre: 'Innovatech SAS',
      consecutivo: 1,
      indice_original: '62.5',
      nivel_original: 3,
      indice_simulado: '48.0',
      nivel_simulado: 2,
      variacion_indice: '-14.5',
      cambia_de_nivel: true,
    },
    {
      diagnostico_id: 'd2',
      empresa_id: 'e2',
      empresa_nombre: 'Logística Andina',
      consecutivo: 2,
      indice_original: '40',
      nivel_original: 2,
      indice_simulado: '41',
      nivel_simulado: 2,
      variacion_indice: '1',
      cambia_de_nivel: false,
    },
  ],
  no_simulables: [],
}

async function abrirSimulacion() {
  modelos.listarModelos.mockResolvedValue([MODELO_PUBLICADO])
  modelos.consultarModelo.mockResolvedValue(MODELO_PUBLICADO)
  const usuario = userEvent.setup()
  render(<GestionCalibracion />)
  await usuario.click(screen.getByRole('tab', { name: /Simulación de pesos/i }))
  await screen.findByLabelText(/Propósito/i)
  return usuario
}

describe('HU-035 · Simular cambio de pesos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    modelos.simularPesos.mockResolvedValue(SIMULACION)
  })

  it('CA-01 envía los pesos propuestos y muestra original frente a simulado', async () => {
    const usuario = await abrirSimulacion()

    await usuario.clear(screen.getByLabelText(/Propósito/i))
    await usuario.type(screen.getByLabelText(/Propósito/i), '0.4')
    await usuario.clear(screen.getByLabelText(/Plataforma/i))
    await usuario.type(screen.getByLabelText(/Plataforma/i), '0.1')
    await usuario.click(screen.getByRole('button', { name: /^Simular$/i }))

    await waitFor(() =>
      expect(modelos.simularPesos).toHaveBeenCalledWith('m-1', {
        proposito: '0.4',
        procesos: '0.25',
        personas: '0.25',
        plataforma: '0.1',
      }),
    )
    expect(await screen.findByText('62.5 (N3)')).toBeInTheDocument()
    expect(screen.getByText('48 (N2)')).toBeInTheDocument()
    expect(screen.getByText(/cambia de nivel/i)).toBeInTheDocument()
  })

  it('CA-01 simular nunca modifica el modelo almacenado', async () => {
    const usuario = await abrirSimulacion()

    await usuario.click(screen.getByRole('button', { name: /^Simular$/i }))
    await screen.findByText('62.5 (N3)')

    expect(modelos.editarDimension).not.toHaveBeenCalled()
    expect(modelos.publicarModelo).not.toHaveBeenCalled()
    expect(modelos.crearNuevaVersion).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del servidor si los pesos no suman 1', async () => {
    modelos.simularPesos.mockRejectedValue(new ErrorApi(400, 'Los pesos deben sumar exactamente 1'))
    const usuario = await abrirSimulacion()

    await usuario.clear(screen.getByLabelText(/Propósito/i))
    await usuario.type(screen.getByLabelText(/Propósito/i), '0.9')
    await usuario.click(screen.getByRole('button', { name: /^Simular$/i }))

    expect(await screen.findByText(/sumar exactamente 1/i)).toBeInTheDocument()
  })

  it('informa la suma propuesta mientras se editan los pesos', async () => {
    const usuario = await abrirSimulacion()

    expect(screen.getByText(/Suma propuesta: 1 /i)).toBeInTheDocument()
    await usuario.clear(screen.getByLabelText(/Propósito/i))
    await usuario.type(screen.getByLabelText(/Propósito/i), '0.4')

    expect(screen.getByText(/Suma propuesta: 1.15 /i)).toBeInTheDocument()
  })
})
