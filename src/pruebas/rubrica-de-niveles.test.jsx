import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { problemasDeLaRubrica } from '../componentes/RubricaNiveles.jsx'
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
  agregarDimension: vi.fn(),
  quitarDimension: vi.fn(),
  agregarPregunta: vi.fn(),
  editarPregunta: vi.fn(),
  editarEje: vi.fn(),
  agregarEje: vi.fn(),
  agregarPerfilCultura: vi.fn(),
  editarPerfilCultura: vi.fn(),
  quitarPerfilCultura: vi.fn(),
  aplicarRubricaEstandar: vi.fn(),
  agregarNivel: vi.fn(),
  editarNivel: vi.fn(),
  quitarNivel: vi.fn(),
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const modelos = await import('../servicios/modelos')

// RF-32: la rúbrica de niveles se consulta y se ajusta en un borrador; una
// versión publicada solo se consulta.

const nivel = (n, nombre, min, max) => ({
  nivel: n,
  nombre,
  descripcion: `Descripción de ${nombre}`,
  umbral_min: String(min),
  umbral_max: String(max),
})
const COMPLETA = [nivel(1, 'Inicial', 0, 40), nivel(2, 'Medio', 40, 70), nivel(3, 'Alto', 70, 100)]
const BORRADOR = { ...MODELO_BORRADOR, niveles: COMPLETA }

async function abrir(modelo) {
  modelos.listarModelos.mockResolvedValue([modelo])
  modelos.consultarModelo.mockResolvedValue(modelo)
  const usuario = userEvent.setup()
  render(<GestionCalibracion />)
  await usuario.click(screen.getByRole('tab', { name: /Modelo y preguntas/i }))
  await screen.findByText('Niveles de madurez')
  return usuario
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const f of ['aplicarRubricaEstandar', 'agregarNivel', 'editarNivel', 'quitarNivel']) {
    modelos[f].mockResolvedValue({})
  }
})

describe('Niveles de madurez', () => {
  it('lista los niveles con su nombre, descripción y rango', async () => {
    await abrir(BORRADOR)

    const fila = screen.getByText('Medio').closest('tr')
    expect(within(fila).getByText('Descripción de Medio')).toBeInTheDocument()
    expect(within(fila).getByText('40 – 70')).toBeInTheDocument()
    expect(screen.getByText(/3 niveles sobre una escala de 0 a 100/)).toBeInTheDocument()
    expect(screen.queryByTestId('problemas-rubrica')).not.toBeInTheDocument()
  })

  it('aplica los 10 niveles estándar solo después de confirmar el reemplazo', async () => {
    const usuario = await abrir(BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Usar los 10 niveles estándar' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(modelos.aplicarRubricaEstandar).not.toHaveBeenCalled()

    await usuario.click(screen.getByRole('button', { name: 'Usar los 10 niveles estándar' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Se reemplazan los niveles actuales')
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reemplazar' }))

    await waitFor(() => expect(modelos.aplicarRubricaEstandar).toHaveBeenCalledWith(BORRADOR.id))
  })

  it('sin niveles aplica la rúbrica estándar directamente y avisa que falta la rúbrica', async () => {
    const usuario = await abrir({ ...MODELO_BORRADOR, niveles: [] })
    expect(screen.getByTestId('problemas-rubrica')).toHaveTextContent('no tiene niveles definidos')

    await usuario.click(screen.getByRole('button', { name: 'Usar los 10 niveles estándar' }))

    await waitFor(() => expect(modelos.aplicarRubricaEstandar).toHaveBeenCalledWith(MODELO_BORRADOR.id))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('agrega un nivel con el siguiente número y el rango a continuación del último', async () => {
    const usuario = await abrir({ ...MODELO_BORRADOR, niveles: [nivel(1, 'Inicial', 0, 40), nivel(2, 'Medio', 40, 70)] })

    await usuario.click(screen.getByRole('button', { name: 'Agregar nivel' }))
    const dialogo = screen.getByRole('dialog', { name: 'Agregar un nivel' })
    expect(within(dialogo).getByLabelText('Número del nivel')).toHaveValue(3)
    expect(within(dialogo).getByLabelText('Desde')).toHaveValue(70)
    expect(within(dialogo).getByLabelText('Hasta')).toHaveValue(100)
    await usuario.type(within(dialogo).getByLabelText('Nombre'), '  Alto  ')
    await usuario.type(within(dialogo).getByLabelText('Descripción'), 'Muy buena práctica')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(modelos.agregarNivel).toHaveBeenCalledWith(MODELO_BORRADOR.id, {
        nivel: 3,
        nombre: 'Alto',
        descripcion: 'Muy buena práctica',
        umbral_min: '70',
        umbral_max: '100',
      }),
    )
  })

  it('edita el nombre, la descripción y el rango de un nivel', async () => {
    const usuario = await abrir(BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Editar nivel 2' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar el nivel 2' })
    expect(within(dialogo).getByLabelText('Nombre')).toHaveValue('Medio')
    expect(within(dialogo).getByLabelText('Desde')).toHaveValue(40)
    await usuario.clear(within(dialogo).getByLabelText('Hasta'))
    await usuario.type(within(dialogo).getByLabelText('Hasta'), '65.5')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(modelos.editarNivel).toHaveBeenCalledWith(BORRADOR.id, 2, {
        nombre: 'Medio',
        descripcion: 'Descripción de Medio',
        umbral_min: '40',
        umbral_max: '65.5',
      }),
    )
  })

  it('quita un nivel solo después de confirmar', async () => {
    const usuario = await abrir(BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Quitar nivel 3' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(modelos.quitarNivel).not.toHaveBeenCalled()

    await usuario.click(screen.getByRole('button', { name: 'Quitar nivel 3' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar' }))

    await waitFor(() => expect(modelos.quitarNivel).toHaveBeenCalledWith(BORRADOR.id, 3))
  })

  it('si el servidor rechaza el cambio, el formulario sigue abierto con el motivo', async () => {
    modelos.editarNivel.mockRejectedValue(new ErrorApi(400, 'umbral_min debe ser menor que umbral_max'))
    const usuario = await abrir(BORRADOR)
    await usuario.click(screen.getByRole('button', { name: 'Editar nivel 1' }))
    const dialogo = screen.getByRole('dialog')

    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('umbral_min debe ser menor que umbral_max')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('una versión publicada se consulta pero no se edita', async () => {
    await abrir({ ...MODELO_PUBLICADO, niveles: COMPLETA })

    expect(screen.getByText('Medio')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Agregar nivel|Usar los 10 niveles|Editar nivel|Quitar nivel/ })).not.toBeInTheDocument()
  })

  it('avisa de los huecos y solapamientos antes de publicar', async () => {
    await abrir({ ...MODELO_BORRADOR, niveles: [nivel(1, 'Inicial', 0, 30), nivel(2, 'Medio', 40, 60), nivel(3, 'Alto', 55, 90)] })

    const avisos = screen.getByTestId('problemas-rubrica')
    expect(avisos).toHaveTextContent('Hay un vacío entre el nivel 1 y el nivel 2')
    expect(avisos).toHaveTextContent('Los niveles 2 y 3 tienen rangos solapados')
    expect(avisos).toHaveTextContent('no cubre el final de la escala (100)')
  })
})

describe('problemasDeLaRubrica', () => {
  it('una rúbrica completa no tiene problemas', () => {
    expect(problemasDeLaRubrica(COMPLETA, 0, 100)).toEqual([])
  })

  it('no importa el orden en que lleguen los niveles', () => {
    expect(problemasDeLaRubrica([...COMPLETA].reverse(), 0, 100)).toEqual([])
  })

  it('detecta que no cubre el inicio de la escala', () => {
    expect(problemasDeLaRubrica([nivel(1, 'A', 10, 100)], 0, 100)).toEqual(['La rúbrica no cubre el inicio de la escala (0).'])
  })
})
