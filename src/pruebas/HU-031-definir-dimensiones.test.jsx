import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { ErrorApi } from '../servicios/api'
import { MODELO_BORRADOR, MODELO_PUBLICADO } from './datosModelo.js'

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
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const modelos = await import('../servicios/modelos')

// HU-031 Definir dimensiones
//
// CA-01 (excepción)
//   Dado que los pesos de las dimensiones no suman la unidad
//   Cuando el administrador intenta publicar la versión
//   Entonces el sistema lo impide e indica la inconsistencia
//
// La regla (R-02) la valida el backend al publicar; la interfaz muestra la
// suma mientras se edita y presenta el mensaje del servidor.

async function abrirModelo(modelo) {
  modelos.listarModelos.mockResolvedValue([modelo])
  modelos.consultarModelo.mockResolvedValue(modelo)
  const usuario = userEvent.setup()
  render(<GestionCalibracion />)
  await usuario.click(screen.getByRole('tab', { name: /Modelo y preguntas/i }))
  await screen.findByText(/Ponderación por dimensión/i)
  return usuario
}

const campo = (nombre) => screen.getByLabelText(nombre)

describe('HU-031 · Definir dimensiones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    modelos.editarDimension.mockResolvedValue({})
  })

  it('una versión publicada es inmutable: los pesos no se pueden editar', async () => {
    await abrirModelo(MODELO_PUBLICADO)

    expect(campo('Propósito')).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Guardar ponderación/i })).not.toBeInTheDocument()
    expect(screen.getByText(/es inmutable/i)).toBeInTheDocument()
  })

  it('en un borrador muestra la suma actual de los pesos', async () => {
    const usuario = await abrirModelo(MODELO_BORRADOR)

    expect(screen.getByText(/suma actual: 1\)/i)).toBeInTheDocument()
    await usuario.clear(campo('Propósito'))
    await usuario.type(campo('Propósito'), '0.4')

    expect(screen.getByText(/suma actual: 1.15/i)).toBeInTheDocument()
  })

  it('CA-01 el servidor impide publicar cuando los pesos no suman 1 y se muestra su mensaje', async () => {
    modelos.publicarModelo.mockRejectedValue(
      new ErrorApi(400, 'Los pesos de las dimensiones deben sumar 1 (suma actual: 1.15)'),
    )
    const usuario = await abrirModelo(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: /^Publicar$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/deben sumar 1/i)
    expect(modelos.publicarModelo).toHaveBeenCalledWith(MODELO_BORRADOR.id)
  })

  it('guarda solo las dimensiones cuyo peso cambió', async () => {
    const usuario = await abrirModelo(MODELO_BORRADOR)

    await usuario.clear(campo('Propósito'))
    await usuario.type(campo('Propósito'), '0.4')
    await usuario.clear(campo('Plataforma'))
    await usuario.type(campo('Plataforma'), '0.1')
    await usuario.click(screen.getByRole('button', { name: /Guardar ponderación/i }))

    await waitFor(() => expect(modelos.editarDimension).toHaveBeenCalledTimes(2))
    expect(modelos.editarDimension).toHaveBeenCalledWith(MODELO_BORRADOR.id, 'proposito', { peso: '0.4' })
    expect(modelos.editarDimension).toHaveBeenCalledWith(MODELO_BORRADOR.id, 'plataforma', { peso: '0.1' })
  })

  it('una versión publicada solo se cambia creando una nueva versión', async () => {
    modelos.crearNuevaVersion.mockResolvedValue({ ...MODELO_BORRADOR, id: 'm-3' })
    const usuario = await abrirModelo(MODELO_PUBLICADO)

    await usuario.click(screen.getByRole('button', { name: /Crear nueva versión/i }))

    await waitFor(() => expect(modelos.crearNuevaVersion).toHaveBeenCalledWith(MODELO_PUBLICADO.id))
    expect(await screen.findByText(/nueva versión en borrador/i)).toBeInTheDocument()
  })
})
