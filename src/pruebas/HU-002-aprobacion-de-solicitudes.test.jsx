import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'

vi.mock('../servicios/solicitudes', () => ({
  listarSolicitudes: vi.fn(),
  aprobarSolicitud: vi.fn(),
  rechazarSolicitud: vi.fn(),
}))
vi.mock('../servicios/modelos', () => ({
  listarModelos: vi.fn().mockResolvedValue([]),
  consultarModelo: vi.fn(),
  crearNuevaVersion: vi.fn(),
  publicarModelo: vi.fn(),
  editarDimension: vi.fn(),
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const servicios = await import('../servicios/solicitudes')

// HU-002 Aprobación de solicitudes
//
// CA-01 (camino principal)
//   Dado que existe una solicitud pendiente
//   Cuando el administrador la aprueba
//   Entonces el sistema (API de negocio) crea la empresa y emite la invitación
//
// CA-02 (alterno)
//   Dado que existe una solicitud en estado pendiente
//   Cuando el administrador la rechaza indicando el motivo
//   Entonces el sistema registra el rechazo con su motivo
//
// CA-03 (excepción)
//   Dado que el administrador rechaza una solicitud sin indicar el motivo
//   Cuando intenta confirmar la operación
//   Entonces el sistema la impide y señala el campo obligatorio

const SOLICITUD = {
  id: 'sol-1',
  estado: 'pendiente',
  nombre_empresa: 'Logística Andina SAS',
  nit: '900123456-7',
  sector_codigo: 'logistica',
  sector_nombre: 'Cadena de suministro / Logística',
  numero_empleados: 120,
  tamano: 'mediana',
  ciudad: 'Bogotá',
  nombre_solicitante: 'Laura Gómez',
  cargo: 'Gerente',
  correo_solicitante: 'laura@andina.co',
  telefono: '+573001234567',
  motivo_rechazo: null,
  creado_en: '2026-09-20T10:00:00Z',
}

const fila = () => screen.getByText('Logística Andina SAS').closest('tr')

async function montar() {
  render(<GestionCalibracion />)
  await screen.findByText('Logística Andina SAS')
}

describe('HU-002 · Aprobación de solicitudes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicios.listarSolicitudes.mockResolvedValue([SOLICITUD])
    servicios.aprobarSolicitud.mockResolvedValue({})
    servicios.rechazarSolicitud.mockResolvedValue({})
  })

  it('lista las solicitudes pendientes con los datos que radicó la empresa', async () => {
    await montar()

    expect(servicios.listarSolicitudes).toHaveBeenCalledWith('pendiente')
    expect(within(fila()).getByText(/NIT 900123456-7/)).toBeInTheDocument()
    expect(within(fila()).getByText(/Gerente/)).toBeInTheDocument()
    expect(within(fila()).getByText(/mediana/)).toBeInTheDocument()
  })

  it('CA-03 no permite confirmar el rechazo sin indicar el motivo', async () => {
    const usuario = userEvent.setup()
    await montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))
    expect(within(fila()).getByRole('button', { name: /Confirmar rechazo/i })).toBeDisabled()

    // Los espacios en blanco no cuentan como motivo.
    await usuario.type(within(fila()).getByPlaceholderText(/Motivo del rechazo/i), '   ')
    expect(within(fila()).getByRole('button', { name: /Confirmar rechazo/i })).toBeDisabled()
    expect(servicios.rechazarSolicitud).not.toHaveBeenCalled()
  })

  it('CA-02 registra el rechazo junto con su motivo', async () => {
    const usuario = userEvent.setup()
    await montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))
    await usuario.type(within(fila()).getByPlaceholderText(/Motivo del rechazo/i), 'Documentación incompleta')
    await usuario.click(within(fila()).getByRole('button', { name: /Confirmar rechazo/i }))

    await waitFor(() => expect(servicios.rechazarSolicitud).toHaveBeenCalledWith('sol-1', 'Documentación incompleta'))
    expect(await screen.findByText(/Solicitud rechazada/i)).toBeInTheDocument()
  })

  it('el rechazo puede cancelarse sin alterar la solicitud', async () => {
    const usuario = userEvent.setup()
    await montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))
    await usuario.click(within(fila()).getByRole('button', { name: /Cancelar/i }))

    expect(within(fila()).getByRole('button', { name: /^Aprobar$/i })).toBeInTheDocument()
    expect(servicios.rechazarSolicitud).not.toHaveBeenCalled()
  })

  it('CA-01 la aprobación se delega a la API y recarga la lista', async () => {
    const usuario = userEvent.setup()
    await montar()
    servicios.listarSolicitudes.mockResolvedValue([])

    await usuario.click(within(fila()).getByRole('button', { name: /^Aprobar$/i }))

    await waitFor(() => expect(servicios.aprobarSolicitud).toHaveBeenCalledWith('sol-1'))
    expect(await screen.findByText(/Solicitud aprobada/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Logística Andina SAS')).not.toBeInTheDocument())
  })

  it('muestra el motivo del servidor si la API rechaza la operación', async () => {
    const { ErrorApi } = await import('../servicios/api')
    const usuario = userEvent.setup()
    await montar()
    servicios.aprobarSolicitud.mockRejectedValue(new ErrorApi(409, 'La solicitud ya fue resuelta'))

    await usuario.click(within(fila()).getByRole('button', { name: /^Aprobar$/i }))

    expect(await screen.findByText(/ya fue resuelta/i)).toBeInTheDocument()
  })
})
