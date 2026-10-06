import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import Login from '../paginas/Login.jsx'
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
  agregarDimension: vi.fn(),
  quitarDimension: vi.fn(),
  agregarPregunta: vi.fn(),
  editarPregunta: vi.fn(),
  editarEje: vi.fn(),
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))
vi.mock('../servicios/modelo', () => ({ obtenerModeloVigente: vi.fn() }))
vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn().mockRejectedValue(new Error('sin sesión')),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('../servicios/baseConocimiento', async (original) => ({
  ...(await original()),
  listarDocumentos: vi.fn().mockResolvedValue([]),
}))

const modelos = await import('../servicios/modelos')
const { obtenerModeloVigente } = await import('../servicios/modelo')

// Las dimensiones del modelo no están atadas a las cuatro originales: el perfil
// de cultura se reasigna a cualquier dimensión y la página de inicio muestra
// siempre lo que está publicado.

describe('Ejes del perfil de cultura', () => {
  beforeEach(() => vi.clearAllMocks())

  async function abrir(modelo) {
    modelos.listarModelos.mockResolvedValue([modelo])
    modelos.consultarModelo.mockResolvedValue(modelo)
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)
    await usuario.click(screen.getByRole('tab', { name: /Modelo y preguntas/i }))
    await screen.findByText(/^Perfil de cultura$/i)
    return usuario
  }

  it('en un borrador permite asignar un eje a otra dimensión', async () => {
    modelos.editarEje.mockResolvedValue({})
    const usuario = await abrir(MODELO_BORRADOR)
    const eje = within(screen.getByRole('form', { name: 'Eje Orientación al cambio' }))

    await usuario.selectOptions(eje.getByLabelText(/Dimensión que determina este eje/), 'plataforma')
    await usuario.click(eje.getByRole('button', { name: 'Guardar eje' }))

    await waitFor(() =>
      expect(modelos.editarEje).toHaveBeenCalledWith(MODELO_BORRADOR.id, 'EJE-A', {
        dimension_codigo: 'plataforma',
        umbral: '50',
        polo_alto_nombre: 'Abierta',
        polo_bajo_nombre: 'Conservadora',
      }),
    )
    expect(await screen.findByText(/Eje EJE-A actualizado/i)).toBeInTheDocument()
  })

  it('el botón de guardar solo se habilita cuando hay cambios', async () => {
    const usuario = await abrir(MODELO_BORRADOR)
    const eje = within(screen.getByRole('form', { name: 'Eje Forma de decidir' }))

    expect(eje.getByRole('button', { name: 'Guardar eje' })).toBeDisabled()
    await usuario.clear(eje.getByLabelText(/Umbral/))
    await usuario.type(eje.getByLabelText(/Umbral/), '60')

    expect(eje.getByRole('button', { name: 'Guardar eje' })).toBeEnabled()
  })

  it('una versión publicada muestra los ejes en solo lectura', async () => {
    await abrir(MODELO_PUBLICADO)
    const eje = within(screen.getByRole('form', { name: 'Eje Orientación al cambio' }))

    expect(eje.getByLabelText(/Dimensión que determina este eje/)).toBeDisabled()
    expect(eje.queryByRole('button', { name: 'Guardar eje' })).not.toBeInTheDocument()
  })

  it('avisa cuando un eje apunta a una dimensión que ya no existe', async () => {
    const huerfano = {
      ...MODELO_BORRADOR,
      ejes_perfil_cultural: MODELO_BORRADOR.ejes_perfil_cultural.map((e, i) =>
        i === 0 ? { ...e, dimension_codigo: 'fantasma' } : e,
      ),
    }
    await abrir(huerfano)

    expect(screen.getByText(/La dimensión «fantasma» ya no existe/i)).toBeInTheDocument()
  })

  it('muestra el mensaje del servidor si no se puede guardar el eje', async () => {
    modelos.editarEje.mockRejectedValue(new ErrorApi(400, "No existe la dimensión 'x' en esta versión"))
    const usuario = await abrir(MODELO_BORRADOR)
    const eje = within(screen.getByRole('form', { name: 'Eje Forma de decidir' }))

    await usuario.selectOptions(eje.getByLabelText(/Dimensión que determina este eje/), 'personas')
    await usuario.click(eje.getByRole('button', { name: 'Guardar eje' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/No existe la dimensión/i)
  })
})

describe('Pestaña de base de conocimiento', () => {
  it('está en Gestión y calibración', async () => {
    modelos.listarModelos.mockResolvedValue([])
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)

    await usuario.click(screen.getByRole('tab', { name: /Base de conocimiento/i }))

    expect(await screen.findByText(/Base de conocimiento del agente/i)).toBeInTheDocument()
  })
})

describe('Página de inicio con el modelo vigente', () => {
  const MODELO = {
    version: '2026.1',
    nombre: 'Modelo',
    escala_min: 0,
    escala_max: 100,
    dimensiones: [
      { codigo: 'a', nombre: 'Propósito', descripcion: 'Estrategia y dirección', orden: 1, peso: '0.2' },
      { codigo: 'b', nombre: 'Procesos', descripcion: null, orden: 2, peso: '0.2' },
      { codigo: 'c', nombre: 'Personas', descripcion: 'Cultura', orden: 3, peso: '0.2' },
      { codigo: 'd', nombre: 'Plataforma', descripcion: 'Tecnología', orden: 4, peso: '0.2' },
      { codigo: 'e', nombre: 'Clientes', descripcion: 'Mercado', orden: 5, peso: '0.2' },
    ],
    niveles: [
      { numero: 1, nombre: 'Inicial', descripcion: 'Sin práctica', umbral_min: '0', umbral_max: '33' },
      { numero: 2, nombre: 'Gestionado', descripcion: 'Parcial', umbral_min: '33.01', umbral_max: '66' },
      { numero: 3, nombre: 'Optimizado', descripcion: 'Continua', umbral_min: '66.01', umbral_max: '100' },
    ],
  }

  function montar() {
    render(
      <MemoryRouter>
        <SesionProvider>
          <Login />
        </SesionProvider>
      </MemoryRouter>,
    )
  }

  it('refleja las dimensiones publicadas, aunque sean más de cuatro', async () => {
    obtenerModeloVigente.mockResolvedValue(MODELO)
    montar()

    expect(await screen.findByText('Las 5 dimensiones del modelo Trust 4P')).toBeInTheDocument()
    expect(screen.getByText('5. Clientes')).toBeInTheDocument()
    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.getAllByText('20 %')).toHaveLength(5)
  })

  it('refleja los niveles publicados con su rango de puntaje', async () => {
    obtenerModeloVigente.mockResolvedValue(MODELO)
    montar()

    expect(await screen.findByText('Escala de Madurez Organizacional (N1 a N3)')).toBeInTheDocument()
    expect(screen.getByText('Gestionado', { selector: 'h4' })).toBeInTheDocument()
    expect(screen.getByText('33.01 a 66 puntos')).toBeInTheDocument()
    expect(screen.getByText('N3 Optimizado')).toBeInTheDocument()
  })

  it('una dimensión renombrada se ve renombrada', async () => {
    obtenerModeloVigente.mockResolvedValue({
      ...MODELO,
      dimensiones: MODELO.dimensiones.map((d) => (d.codigo === 'a' ? { ...d, nombre: 'Estrategia' } : d)),
    })
    montar()

    expect(await screen.findByText('1. Estrategia')).toBeInTheDocument()
    expect(screen.queryByText('1. Propósito')).not.toBeInTheDocument()
  })

  it('si no hay modelo publicado la página de ingreso sigue funcionando', async () => {
    obtenerModeloVigente.mockRejectedValue(new ErrorApi(404, 'No hay ninguna versión publicada del modelo'))
    montar()

    expect(await screen.findByRole('button', { name: /Ingresar al Panel/i })).toBeInTheDocument()
    expect(screen.queryByText(/dimensiones del modelo Trust 4P/i)).not.toBeInTheDocument()
  })
})
