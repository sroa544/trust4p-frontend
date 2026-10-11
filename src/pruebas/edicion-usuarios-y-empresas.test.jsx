import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import Usuarios from '../paginas/Usuarios.jsx'
import { ErrorApi } from '../servicios/api'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('../servicios/administracion', () => ({
  agregarPermiso: vi.fn(),
  asignarEmpresa: vi.fn(),
  crearEmpresa: vi.fn(),
  crearUsuario: vi.fn(),
  desactivarEmpresa: vi.fn(),
  desactivarUsuario: vi.fn(),
  desbloquearUsuario: vi.fn(),
  editarEmpresa: vi.fn(),
  editarUsuario: vi.fn(),
  finalizarAsignacion: vi.fn(),
  listarEmpresas: vi.fn(),
  listarPermisos: vi.fn(),
  listarRoles: vi.fn(),
  listarUsuarios: vi.fn(),
  quitarPermiso: vi.fn(),
  reactivarEmpresa: vi.fn(),
  reactivarUsuario: vi.fn(),
}))
vi.mock('../servicios/solicitudes', () => ({ listarSectores: vi.fn() }))

const administracion = await import('../servicios/administracion')
const autenticacion = await import('../servicios/autenticacion')
const { listarSectores } = await import('../servicios/solicitudes')

const USUARIO = {
  id: 'u-9',
  correo: 'ana@innovatech.com',
  nombres: 'Mateo Julian',
  apellidos: 'Sotelo Acosta',
  rol_codigo: 'representante',
  empresa_id: 'emp-1',
  activo: true,
}
const EMPRESA = { id: 'emp-1', nombre: 'Mateo SAS', numero_empleados: 30, activo: true }

beforeEach(() => {
  vi.clearAllMocks()
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador' })
  listarSectores.mockResolvedValue([])
  administracion.listarUsuarios.mockResolvedValue([USUARIO])
  administracion.listarEmpresas.mockResolvedValue([EMPRESA])
  administracion.listarRoles.mockResolvedValue([])
  administracion.listarPermisos.mockResolvedValue([])
})

async function abrir() {
  const usuario = userEvent.setup()
  render(
    <MemoryRouter>
      <SesionProvider>
        <Usuarios />
      </SesionProvider>
    </MemoryRouter>,
  )
  await screen.findByText('Mateo Julian Sotelo Acosta')
  return usuario
}

describe('Edición de usuarios', () => {
  it('abre un formulario propio con los datos actuales, sin cuadros del navegador', async () => {
    const pregunta = vi.spyOn(window, 'prompt')
    const usuario = await abrir()

    await usuario.click(screen.getByRole('button', { name: 'Editar' }))

    const dialogo = screen.getByRole('dialog', { name: 'Editar usuario' })
    expect(within(dialogo).getByLabelText('Nombres')).toHaveValue('Mateo Julian')
    expect(within(dialogo).getByLabelText('Apellidos')).toHaveValue('Sotelo Acosta')
    expect(pregunta).not.toHaveBeenCalled()
    pregunta.mockRestore()
  })

  it('guarda los cambios y cierra el formulario', async () => {
    administracion.editarUsuario.mockResolvedValue({})
    const usuario = await abrir()
    await usuario.click(screen.getByRole('button', { name: 'Editar' }))
    const dialogo = screen.getByRole('dialog')

    await usuario.clear(within(dialogo).getByLabelText('Nombres'))
    await usuario.type(within(dialogo).getByLabelText('Nombres'), '  Mateo  ')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarUsuario).toHaveBeenCalledWith('u-9', {
        nombres: 'Mateo',
        apellidos: 'Sotelo Acosta',
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Usuario actualizado.')).toBeInTheDocument()
  })

  it('Cancelar o Escape cierran sin guardar', async () => {
    const usuario = await abrir()

    await usuario.click(screen.getByRole('button', { name: 'Editar' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Editar' }))
    await usuario.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(administracion.editarUsuario).not.toHaveBeenCalled()
  })

  it('si el servidor rechaza el cambio, el formulario sigue abierto y muestra el motivo', async () => {
    administracion.editarUsuario.mockRejectedValue(new ErrorApi(400, 'Nombre no válido'))
    const usuario = await abrir()
    await usuario.click(screen.getByRole('button', { name: 'Editar' }))
    const dialogo = screen.getByRole('dialog')

    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('Nombre no válido')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('no deja guardar los nombres vacíos', async () => {
    const usuario = await abrir()
    await usuario.click(screen.getByRole('button', { name: 'Editar' }))
    const dialogo = screen.getByRole('dialog')

    await usuario.clear(within(dialogo).getByLabelText('Nombres'))
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(administracion.editarUsuario).not.toHaveBeenCalled()
  })
})

describe('Edición de empresas', () => {
  it('edita el nombre y el número de empleados desde un formulario propio', async () => {
    administracion.editarEmpresa.mockResolvedValue({})
    const usuario = await abrir()
    await usuario.click(screen.getByRole('tab', { name: 'Empresas' }))
    await usuario.click(await screen.findByRole('button', { name: 'Editar' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar empresa' })
    expect(within(dialogo).getByLabelText('Nombre de la empresa')).toHaveValue('Mateo SAS')
    expect(within(dialogo).getByLabelText('Número de empleados')).toHaveValue(30)

    await usuario.clear(within(dialogo).getByLabelText('Número de empleados'))
    await usuario.type(within(dialogo).getByLabelText('Número de empleados'), '45')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarEmpresa).toHaveBeenCalledWith('emp-1', { nombre: 'Mateo SAS', numero_empleados: 45 }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
