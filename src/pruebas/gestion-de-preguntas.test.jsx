import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cuerpoDePregunta } from '../componentes/FormularioPregunta.jsx'
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
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const modelos = await import('../servicios/modelos')

// Gestión del banco de preguntas (HU-029, HU-032): solo en versiones en
// borrador. Las reglas de pesos y opciones las valida el backend.

const formulario = () => within(screen.getByRole('form', { name: 'Formulario de pregunta' }))

async function abrir(modelo) {
  modelos.listarModelos.mockResolvedValue([modelo])
  modelos.consultarModelo.mockResolvedValue(modelo)
  const usuario = userEvent.setup()
  render(<GestionCalibracion />)
  await usuario.click(screen.getByRole('tab', { name: /Modelo y preguntas/i }))
  await screen.findByText(/Banco de preguntas/i)
  return usuario
}

describe('Gestión del banco de preguntas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('una versión publicada es de solo lectura', async () => {
    await abrir(MODELO_PUBLICADO)

    expect(screen.queryByRole('button', { name: /Agregar pregunta/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Editar /i })).not.toBeInTheDocument()
  })

  it('agrega una pregunta de selección con sus opciones', async () => {
    modelos.agregarPregunta.mockResolvedValue({})
    const usuario = await abrir(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: /^Agregar pregunta$/i }))
    await usuario.type(formulario().getByLabelText('Código'), 'PROP-05')
    await usuario.type(screen.getByLabelText('Enunciado'), '¿Existe un comité de innovación?')
    await usuario.type(screen.getByLabelText('Peso en su dimensión'), '0.25')
    await usuario.type(screen.getByLabelText('Código de la opción 1'), 'N1')
    await usuario.type(screen.getByLabelText('Texto de la opción 1'), 'No existe')
    await usuario.type(screen.getByLabelText('Valor de la opción 1'), '25')
    await usuario.click(screen.getByRole('button', { name: /^Agregar pregunta$/i, hidden: false }))

    await waitFor(() => expect(modelos.agregarPregunta).toHaveBeenCalledTimes(1))
    const [id, cuerpo] = modelos.agregarPregunta.mock.calls[0]
    expect(id).toBe(MODELO_BORRADOR.id)
    expect(cuerpo).toMatchObject({
      codigo: 'PROP-05',
      dimension_codigo: 'proposito',
      enunciado: '¿Existe un comité de innovación?',
      tipo: 'seleccion_unica',
      obligatoria: true,
      peso: '0.25',
      en_demo: false,
      orden: 2,
      opciones: [{ codigo: 'N1', etiqueta: 'No existe', valor: '25' }],
      condicion: null,
    })
    expect(await screen.findByText(/Pregunta PROP-05 agregada/i)).toBeInTheDocument()
  })

  it('muestra el mensaje del servidor si la pregunta no es válida', async () => {
    modelos.agregarPregunta.mockRejectedValue(new ErrorApi(400, "Ya existe una pregunta con código 'PROP-01' en esta versión"))
    const usuario = await abrir(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: /^Agregar pregunta$/i }))
    await usuario.type(formulario().getByLabelText('Código'), 'PROP-01')
    await usuario.type(screen.getByLabelText('Enunciado'), 'Repetida')
    await usuario.type(screen.getByLabelText('Peso en su dimensión'), '0.25')
    await usuario.type(screen.getByLabelText('Código de la opción 1'), 'N1')
    await usuario.type(screen.getByLabelText('Texto de la opción 1'), 'Sí')
    await usuario.type(screen.getByLabelText('Valor de la opción 1'), '100')
    await usuario.click(screen.getByRole('button', { name: /^Agregar pregunta$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Ya existe una pregunta/i)
  })

  it('edita una pregunta existente sin poder cambiar su código', async () => {
    modelos.editarPregunta.mockResolvedValue({})
    const usuario = await abrir(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Editar PROP-01' }))
    expect(formulario().getByLabelText('Código')).toBeDisabled()
    const enunciado = screen.getByLabelText('Enunciado')
    await usuario.clear(enunciado)
    await usuario.type(enunciado, 'Enunciado corregido')
    await usuario.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    await waitFor(() => expect(modelos.editarPregunta).toHaveBeenCalledTimes(1))
    const [id, codigo, cuerpo] = modelos.editarPregunta.mock.calls[0]
    expect([id, codigo]).toEqual([MODELO_BORRADOR.id, 'PROP-01'])
    expect(cuerpo.enunciado).toBe('Enunciado corregido')
    expect(cuerpo).not.toHaveProperty('codigo')
    expect(cuerpo).not.toHaveProperty('condicion')
  })

  it('cancelar cierra el formulario sin llamar al servidor', async () => {
    const usuario = await abrir(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: /^Agregar pregunta$/i }))
    await usuario.click(within(screen.getByRole('button', { name: 'Cancelar' }).closest('form')).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByLabelText('Enunciado')).not.toBeInTheDocument()
    expect(modelos.agregarPregunta).not.toHaveBeenCalled()
  })

  it('desactiva una pregunta desde su fila', async () => {
    modelos.desactivarPregunta.mockResolvedValue({})
    const usuario = await abrir(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Desactivar PROP-01' }))

    await waitFor(() => expect(modelos.desactivarPregunta).toHaveBeenCalledWith(MODELO_BORRADOR.id, 'PROP-01'))
  })
})

describe('cuerpoDePregunta', () => {
  const base = {
    codigo: ' P-1 ',
    dimension_codigo: 'proposito',
    enunciado: ' ¿Algo? ',
    ayuda: '',
    tipo: 'escala',
    obligatoria: true,
    peso: '0.5',
    en_demo: true,
    orden: '3',
    opciones: [{ codigo: 'X', etiqueta: 'Y', valor: '1' }],
    conCondicion: false,
    condicion: { pregunta_codigo: '', operador: 'igual', valor: '' },
  }

  it('una pregunta que no es de selección no envía opciones', () => {
    expect(cuerpoDePregunta(base, { creando: true }).opciones).toEqual([])
  })

  it('al crear incluye código y condición; al editar no', () => {
    const creada = cuerpoDePregunta(
      { ...base, conCondicion: true, condicion: { pregunta_codigo: 'P-0', operador: 'igual', valor: ' N3 ' } },
      { creando: true },
    )
    expect(creada.codigo).toBe('P-1')
    expect(creada.condicion).toEqual({ pregunta_codigo: 'P-0', operador: 'igual', valor: 'N3' })

    const editada = cuerpoDePregunta(base, { creando: false })
    expect(editada).not.toHaveProperty('codigo')
    expect(editada).not.toHaveProperty('condicion')
    expect(editada.orden).toBe(3)
    expect(editada.ayuda).toBeNull()
  })
})
