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

// El administrador puede cambiar el rol (y la empresa del representante) de un
// usuario. El servidor cierra las sesiones abiertas del usuario al cambiarlos.

const REPRESENTANTE = {
  id: 'u-9',
  correo: 'ana@innovatech.com',
  nombres: 'Ana',
  apellidos: 'Pérez',
  rol_codigo: 'representante',
  empresa_id: 'emp-1',
  activo: true,
  bloqueado: false,
}
const CONSULTOR = { ...REPRESENTANTE, id: 'u-8', correo: 'julia@x.com', nombres: 'Julia', rol_codigo: 'consultor', empresa_id: null }
const YO = { ...REPRESENTANTE, id: PERFIL_REPRESENTANTE.id, correo: 'yo@x.com', nombres: 'Elena', rol_codigo: 'administrador', empresa_id: null }
const EMPRESAS = [
  { id: 'emp-1', nombre: 'Mateo SAS', numero_empleados: 30, activo: true },
  { id: 'emp-2', nombre: 'Roa Sas', numero_empleados: 10, activo: true },
  { id: 'emp-3', nombre: 'Cerrada SA', numero_empleados: 5, activo: false },
]

async function abrir(usuarios, nombre) {
  administracion.listarUsuarios.mockResolvedValue(usuarios)
  const usuario = userEvent.setup()
  render(
    <MemoryRouter>
      <SesionProvider>
        <Usuarios />
      </SesionProvider>
    </MemoryRouter>,
  )
  // El nombre aparece también en el selector de consultores: se toma el de la tabla.
  const fila = (await screen.findByText(nombre, { selector: 'td div' })).closest('tr')
  return { usuario, fila }
}

const dialogo = () => screen.getByRole('dialog', { name: 'Editar usuario' })

beforeEach(() => {
  vi.clearAllMocks()
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador' })
  listarSectores.mockResolvedValue([])
  administracion.listarEmpresas.mockResolvedValue(EMPRESAS)
  administracion.listarRoles.mockResolvedValue([])
  administracion.listarPermisos.mockResolvedValue([])
  administracion.editarUsuario.mockResolvedValue({})
})

describe('Editar el rol de un usuario', () => {
  it('muestra el rol actual y, para un representante, su empresa (sin las inactivas)', async () => {
    const { usuario, fila } = await abrir([REPRESENTANTE], 'Ana Pérez')

    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))

    expect(within(dialogo()).getByLabelText('Rol')).toHaveValue('representante')
    const empresa = within(dialogo()).getByLabelText('Empresa')
    expect(empresa).toHaveValue('emp-1')
    expect(within(empresa).queryByRole('option', { name: 'Cerrada SA' })).not.toBeInTheDocument()
  })

  it('al pasar a consultor oculta la empresa y envía solo el rol', async () => {
    const { usuario, fila } = await abrir([REPRESENTANTE], 'Ana Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))

    await usuario.selectOptions(within(dialogo()).getByLabelText('Rol'), 'consultor')

    expect(within(dialogo()).queryByLabelText('Empresa')).not.toBeInTheDocument()
    expect(within(dialogo()).getByText(/se cierra la sesión que el usuario tenga abierta/)).toBeInTheDocument()
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarUsuario).toHaveBeenCalledWith('u-9', {
        nombres: 'Ana',
        apellidos: 'Pérez',
        rol_codigo: 'consultor',
      }),
    )
    expect(await screen.findByText(/se cerró su sesión abierta/)).toBeInTheDocument()
  })

  it('al pasar de consultor a representante pide la empresa y la envía', async () => {
    const { usuario, fila } = await abrir([CONSULTOR], 'Julia Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))
    expect(within(dialogo()).queryByLabelText('Empresa')).not.toBeInTheDocument()

    await usuario.selectOptions(within(dialogo()).getByLabelText('Rol'), 'representante')
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))
    expect(administracion.editarUsuario).not.toHaveBeenCalled() // empresa obligatoria

    await usuario.selectOptions(within(dialogo()).getByLabelText('Empresa'), 'emp-2')
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarUsuario).toHaveBeenCalledWith('u-8', {
        nombres: 'Julia',
        apellidos: 'Pérez',
        rol_codigo: 'representante',
        empresa_id: 'emp-2',
      }),
    )
  })

  it('cambiar solo la empresa de un representante envía la empresa y no el rol', async () => {
    const { usuario, fila } = await abrir([REPRESENTANTE], 'Ana Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))

    await usuario.selectOptions(within(dialogo()).getByLabelText('Empresa'), 'emp-2')
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarUsuario).toHaveBeenCalledWith('u-9', {
        nombres: 'Ana',
        apellidos: 'Pérez',
        empresa_id: 'emp-2',
      }),
    )
  })

  it('editar solo el nombre no toca rol ni empresa ni avisa del cierre de sesión', async () => {
    const { usuario, fila } = await abrir([REPRESENTANTE], 'Ana Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))

    await usuario.clear(within(dialogo()).getByLabelText('Nombres'))
    await usuario.type(within(dialogo()).getByLabelText('Nombres'), 'Anita')
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarUsuario).toHaveBeenCalledWith('u-9', { nombres: 'Anita', apellidos: 'Pérez' }),
    )
    expect(await screen.findByText('Usuario actualizado.')).toBeInTheDocument()
  })

  it('no permite cambiar el propio rol', async () => {
    const { usuario, fila } = await abrir([YO], 'Elena Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))

    expect(within(dialogo()).getByLabelText('Rol')).toBeDisabled()
    expect(within(dialogo()).getByText('No puede cambiar su propio rol.')).toBeInTheDocument()
  })

  it('si el servidor rechaza el cambio, el formulario sigue abierto con el motivo', async () => {
    administracion.editarUsuario.mockRejectedValue(new ErrorApi(400, 'La empresa indicada está inactiva'))
    const { usuario, fila } = await abrir([REPRESENTANTE], 'Ana Pérez')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))
    await usuario.selectOptions(within(dialogo()).getByLabelText('Empresa'), 'emp-2')

    await usuario.click(within(dialogo()).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo()).findByRole('alert')).toHaveTextContent('La empresa indicada está inactiva')
  })
})

describe('Desbloquear', () => {
  it('solo aparece en los usuarios bloqueados, que se marcan como tales', async () => {
    const bloqueado = { ...REPRESENTANTE, id: 'u-7', nombres: 'Luis', bloqueado: true }
    const { fila } = await abrir([REPRESENTANTE, bloqueado], 'Luis Pérez')

    expect(within(fila).getByRole('button', { name: 'Desbloquear' })).toBeInTheDocument()
    expect(within(fila).getByText('Bloqueado')).toBeInTheDocument()
    const filaNormal = screen.getByText('Ana Pérez').closest('tr')
    expect(within(filaNormal).queryByRole('button', { name: 'Desbloquear' })).not.toBeInTheDocument()
    expect(within(filaNormal).getByText('Activo')).toBeInTheDocument()
  })

  it('al pulsarlo desbloquea la cuenta', async () => {
    administracion.desbloquearUsuario.mockResolvedValue({})
    const bloqueado = { ...REPRESENTANTE, id: 'u-7', nombres: 'Luis', bloqueado: true }
    const { usuario, fila } = await abrir([bloqueado], 'Luis Pérez')

    await usuario.click(within(fila).getByRole('button', { name: 'Desbloquear' }))

    await waitFor(() => expect(administracion.desbloquearUsuario).toHaveBeenCalledWith('u-7'))
    expect(await screen.findByText('Cuenta desbloqueada.')).toBeInTheDocument()
  })
})
