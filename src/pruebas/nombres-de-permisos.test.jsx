import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import Usuarios from '../paginas/Usuarios.jsx'
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

// El código del permiso (roles.gestionar) es interno: la pantalla muestra el
// nombre legible del permiso y del módulo.

const PERMISOS = [
  {
    id: 'p1',
    codigo: 'roles.gestionar',
    nombre: 'Gestionar roles y permisos',
    modulo: 'administracion',
    modulo_nombre: 'Administración',
    descripcion: 'Gestionar roles y permisos',
  },
  {
    id: 'p2',
    codigo: 'usuarios.gestionar',
    nombre: 'Gestionar usuarios',
    modulo: 'administracion',
    modulo_nombre: 'Administración',
    descripcion: 'Gestionar usuarios y asignaciones de consultores',
  },
  {
    id: 'p3',
    codigo: 'diagnosticos.responder',
    nombre: 'Responder el diagnóstico',
    modulo: 'diagnosticos',
    modulo_nombre: 'Diagnósticos',
    descripcion: 'Iniciar, responder y completar el diagnóstico de su empresa',
  },
]
const ROLES = [
  { codigo: 'administrador', nombre: 'Administrador', permisos: ['roles.gestionar'] },
  { codigo: 'representante', nombre: 'Representante de empresa', permisos: [] },
]

async function abrirPermisos(permisos = PERMISOS) {
  administracion.listarPermisos.mockResolvedValue(permisos)
  const usuario = userEvent.setup()
  render(
    <MemoryRouter>
      <SesionProvider>
        <Usuarios />
      </SesionProvider>
    </MemoryRouter>,
  )
  await usuario.click(await screen.findByRole('tab', { name: 'Roles y permisos' }))
  await screen.findByText('Permisos por rol')
  return usuario
}

beforeEach(() => {
  vi.clearAllMocks()
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador' })
  listarSectores.mockResolvedValue([])
  administracion.listarUsuarios.mockResolvedValue([])
  administracion.listarEmpresas.mockResolvedValue([])
  administracion.listarRoles.mockResolvedValue(ROLES)
  administracion.agregarPermiso.mockResolvedValue({})
  administracion.quitarPermiso.mockResolvedValue({})
})

describe('Nombres de los permisos', () => {
  it('muestra el nombre legible de cada permiso y no su código', async () => {
    await abrirPermisos()

    expect(await screen.findByText('Gestionar usuarios')).toBeInTheDocument()
    expect(screen.getByText('Responder el diagnóstico')).toBeInTheDocument()
    expect(screen.queryByText('roles.gestionar')).not.toBeInTheDocument()
    expect(screen.queryByText('usuarios.gestionar')).not.toBeInTheDocument()
    expect(screen.queryByText('diagnosticos.responder')).not.toBeInTheDocument()
  })

  it('conserva la descripción bajo el nombre', async () => {
    await abrirPermisos()

    const fila = (await screen.findByText('Gestionar usuarios')).closest('tr')
    expect(within(fila).getByText('Gestionar usuarios y asignaciones de consultores')).toBeInTheDocument()
  })

  it('agrupa por módulo con su nombre, con tilde y sin código interno', async () => {
    await abrirPermisos()

    expect(await screen.findByText('Administración', { selector: 'td' })).toBeInTheDocument()
    expect(screen.getByText('Diagnósticos', { selector: 'td' })).toBeInTheDocument()
    expect(screen.queryByText('administracion')).not.toBeInTheDocument()
    expect(screen.getAllByText('Administración', { selector: 'td' })).toHaveLength(1) // un encabezado por módulo
  })

  it('conceder y retirar un permiso sigue usando su código', async () => {
    const usuario = await abrirPermisos()

    await usuario.click(await screen.findByLabelText('Representante de empresa: Gestionar usuarios'))
    await waitFor(() => expect(administracion.agregarPermiso).toHaveBeenCalledWith('representante', 'usuarios.gestionar'))

    await usuario.click(screen.getByLabelText('Administrador: Gestionar roles y permisos'))
    await waitFor(() => expect(administracion.quitarPermiso).toHaveBeenCalledWith('administrador', 'roles.gestionar'))
  })

  it('con una API que todavía no entrega el nombre, muestra el código y no falla', async () => {
    await abrirPermisos([{ id: 'p9', codigo: 'reportes.ver', modulo: 'reportes', descripcion: 'Ver reportes' }])

    expect(await screen.findByText('reportes.ver')).toBeInTheDocument()
    expect(screen.getByText('reportes')).toBeInTheDocument()
  })
})
