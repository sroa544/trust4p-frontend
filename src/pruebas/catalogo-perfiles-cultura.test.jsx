import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContenidoInforme from '../componentes/ContenidoInforme.jsx'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { ErrorApi } from '../servicios/api'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'
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
  desactivarPregunta: vi.fn(),
  reactivarPregunta: vi.fn(),
  simularPesos: vi.fn(),
}))

const modelos = await import('../servicios/modelos')

// RF-14: catálogo de perfiles de cultura. El administrador le pone nombre y
// descripción a cada combinación de polos; el cálculo no cambia.

const PERFIL = { codigo: 'ACEG', nombre: 'Innovador nato', descripcion: 'Descripción curada del perfil.', activo: true }
const BORRADOR_CON_PERFIL = { ...MODELO_BORRADOR, perfiles_cultura: [PERFIL] }

async function abrirModelo(modelo) {
  modelos.listarModelos.mockResolvedValue([modelo])
  modelos.consultarModelo.mockResolvedValue(modelo)
  const usuario = userEvent.setup()
  render(<GestionCalibracion />)
  await usuario.click(screen.getByRole('tab', { name: /Modelo y preguntas/i }))
  await screen.findByText('Catálogo de perfiles de cultura')
  return usuario
}

beforeEach(() => {
  vi.clearAllMocks()
  modelos.agregarPerfilCultura.mockResolvedValue({})
  modelos.editarPerfilCultura.mockResolvedValue({})
  modelos.quitarPerfilCultura.mockResolvedValue({})
})

describe('Catálogo de perfiles de cultura', () => {
  it('lista las 16 combinaciones, con las no definidas marcadas', async () => {
    await abrirModelo(BORRADOR_CON_PERFIL)

    const fila = screen.getByText('ACEG', { selector: 'td' }).closest('tr')
    expect(within(fila).getByText('Innovador nato')).toBeInTheDocument()
    expect(within(fila).getByText('Activo')).toBeInTheDocument()
    expect(screen.getAllByText(/Sin definir/)).toHaveLength(15)
    expect(screen.getAllByRole('button', { name: /^Definir perfil / })).toHaveLength(15)
  })

  it('define un perfil nuevo desde un formulario propio', async () => {
    const usuario = await abrirModelo(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Definir perfil BDFH' }))
    const dialogo = screen.getByRole('dialog', { name: 'Definir el perfil BDFH' })
    await usuario.type(within(dialogo).getByLabelText('Nombre del perfil'), '  Prudente  ')
    await usuario.type(within(dialogo).getByLabelText('Descripción'), 'Prefiere la estabilidad.')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(modelos.agregarPerfilCultura).toHaveBeenCalledWith(MODELO_BORRADOR.id, {
        codigo: 'BDFH',
        nombre: 'Prudente',
        descripcion: 'Prefiere la estabilidad.',
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('edita el nombre y la descripción con los datos actuales precargados', async () => {
    const usuario = await abrirModelo(BORRADOR_CON_PERFIL)

    await usuario.click(screen.getByRole('button', { name: 'Editar perfil ACEG' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar el perfil ACEG' })
    expect(within(dialogo).getByLabelText('Nombre del perfil')).toHaveValue('Innovador nato')
    expect(within(dialogo).getByLabelText('Descripción')).toHaveValue('Descripción curada del perfil.')
    await usuario.clear(within(dialogo).getByLabelText('Nombre del perfil'))
    await usuario.type(within(dialogo).getByLabelText('Nombre del perfil'), 'Pionero')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(modelos.editarPerfilCultura).toHaveBeenCalledWith(BORRADOR_CON_PERFIL.id, 'ACEG', {
        nombre: 'Pionero',
        descripcion: 'Descripción curada del perfil.',
      }),
    )
  })

  it('desactiva un perfil sin pedir confirmación', async () => {
    const usuario = await abrirModelo(BORRADOR_CON_PERFIL)

    await usuario.click(screen.getByRole('button', { name: 'Desactivar perfil ACEG' }))

    await waitFor(() =>
      expect(modelos.editarPerfilCultura).toHaveBeenCalledWith(BORRADOR_CON_PERFIL.id, 'ACEG', { activo: false }),
    )
  })

  it('quita un perfil solo después de confirmar', async () => {
    const usuario = await abrirModelo(BORRADOR_CON_PERFIL)

    await usuario.click(screen.getByRole('button', { name: 'Quitar perfil ACEG' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(modelos.quitarPerfilCultura).not.toHaveBeenCalled()

    await usuario.click(screen.getByRole('button', { name: 'Quitar perfil ACEG' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar' }))
    await waitFor(() => expect(modelos.quitarPerfilCultura).toHaveBeenCalledWith(BORRADOR_CON_PERFIL.id, 'ACEG'))
  })

  it('si el servidor rechaza el cambio, el formulario sigue abierto con el motivo', async () => {
    modelos.agregarPerfilCultura.mockRejectedValue(new ErrorApi(400, 'El perfil ya está definido'))
    const usuario = await abrirModelo(MODELO_BORRADOR)

    await usuario.click(screen.getByRole('button', { name: 'Definir perfil BDFH' }))
    const dialogo = screen.getByRole('dialog')
    await usuario.type(within(dialogo).getByLabelText('Nombre del perfil'), 'X')
    await usuario.type(within(dialogo).getByLabelText('Descripción'), 'Y')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('El perfil ya está definido')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('una versión publicada se ve pero no se edita', async () => {
    await abrirModelo({ ...MODELO_PUBLICADO, perfiles_cultura: [PERFIL] })

    expect(screen.getByText('Innovador nato')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Definir perfil|Editar perfil|Quitar perfil|Desactivar perfil/ })).not.toBeInTheDocument()
  })

  it('un perfil que ya no corresponde a los polos se señala', async () => {
    await abrirModelo({ ...BORRADOR_CON_PERFIL, perfiles_cultura: [{ ...PERFIL, codigo: 'ZZZZ' }] })

    expect(screen.getByText(/Ya no corresponde a los polos/)).toBeInTheDocument()
  })
})

describe('Resultado con perfil del catálogo', () => {
  it('muestra el nombre del perfil junto al código', () => {
    const resultado = {
      ...DIAGNOSTICO_EVALUADO.resultado,
      perfil_cultura: { codigo: 'ENFP', nombre: 'Innovador nato', descripcion: 'Texto' },
    }
    render(<ContenidoInforme conEnlacePlan={false} cuestionario={CUESTIONARIO} diagnostico={{ ...DIAGNOSTICO_EVALUADO, resultado }} />)

    expect(screen.getByTestId('perfil-nombre')).toHaveTextContent('Innovador nato')
    expect(screen.getByTestId('perfil-codigo')).toHaveTextContent('ENFP')
  })

  it('sin nombre solo muestra el código', () => {
    render(<ContenidoInforme conEnlacePlan={false} cuestionario={CUESTIONARIO} diagnostico={DIAGNOSTICO_EVALUADO} />)

    expect(screen.queryByTestId('perfil-nombre')).not.toBeInTheDocument()
  })
})
