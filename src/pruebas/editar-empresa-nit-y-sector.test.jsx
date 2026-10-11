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

// Quien tiene el permiso de edición puede cambiar nombre, NIT, sector y número
// de empleados de una empresa; el servidor audita cada campo.

const SECTORES = [
  { codigo: 'servicios', nombre: 'Servicios profesionales' },
  { codigo: 'fintech', nombre: 'Fintech y Servicios financieros' },
]
const EMPRESA = {
  id: 'emp-1',
  nombre: 'Mateo SAS',
  nit: '900111222',
  sector_codigo: 'servicios',
  sector_nombre: 'Servicios profesionales',
  numero_empleados: 30,
  activo: true,
}
const SIN_NIT = { ...EMPRESA, id: 'emp-2', nombre: 'Sin NIT SAS', nit: null }
const SECTOR_RETIRADO = {
  ...EMPRESA,
  id: 'emp-3',
  nombre: 'Vieja SA',
  nit: '800000111',
  sector_codigo: 'manufactura',
  sector_nombre: 'Manufactura',
}

async function abrir(empresas = [EMPRESA]) {
  administracion.listarEmpresas.mockResolvedValue(empresas)
  const usuario = userEvent.setup()
  render(
    <MemoryRouter>
      <SesionProvider>
        <Usuarios />
      </SesionProvider>
    </MemoryRouter>,
  )
  await usuario.click(await screen.findByRole('tab', { name: 'Empresas' }))
  return usuario
}

async function editarEmpresa(usuario, nombre) {
  const fila = (await screen.findByText(nombre, { selector: 'td' })).closest('tr')
  await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))
  return screen.getByRole('dialog', { name: 'Editar empresa' })
}

beforeEach(() => {
  vi.clearAllMocks()
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador' })
  listarSectores.mockResolvedValue(SECTORES)
  administracion.listarUsuarios.mockResolvedValue([])
  administracion.listarRoles.mockResolvedValue([])
  administracion.listarPermisos.mockResolvedValue([])
  administracion.editarEmpresa.mockResolvedValue({})
})

describe('Editar una empresa', () => {
  it('muestra nombre, NIT, sector y empleados con sus valores actuales', async () => {
    const usuario = await abrir()

    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    expect(within(dialogo).getByLabelText('Nombre de la empresa')).toHaveValue('Mateo SAS')
    expect(within(dialogo).getByLabelText('NIT')).toHaveValue('900111222')
    expect(within(dialogo).getByLabelText('Sector')).toHaveValue('servicios')
    expect(within(dialogo).getByLabelText('Número de empleados')).toHaveValue(30)
  })

  it('cambia el NIT y el sector y envía solo esos campos', async () => {
    const usuario = await abrir()
    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    await usuario.clear(within(dialogo).getByLabelText('NIT'))
    await usuario.type(within(dialogo).getByLabelText('NIT'), '  800555666-1 ')
    await usuario.selectOptions(within(dialogo).getByLabelText('Sector'), 'fintech')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarEmpresa).toHaveBeenCalledWith('emp-1', {
        nit: '800555666-1',
        sector_codigo: 'fintech',
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Empresa actualizada.')).toBeInTheDocument()
  })

  it('puede cambiar los cuatro campos a la vez', async () => {
    const usuario = await abrir()
    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    await usuario.clear(within(dialogo).getByLabelText('Nombre de la empresa'))
    await usuario.type(within(dialogo).getByLabelText('Nombre de la empresa'), 'Nueva SAS')
    await usuario.clear(within(dialogo).getByLabelText('NIT'))
    await usuario.type(within(dialogo).getByLabelText('NIT'), '800555666')
    await usuario.selectOptions(within(dialogo).getByLabelText('Sector'), 'fintech')
    await usuario.clear(within(dialogo).getByLabelText('Número de empleados'))
    await usuario.type(within(dialogo).getByLabelText('Número de empleados'), '120')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(administracion.editarEmpresa).toHaveBeenCalledWith('emp-1', {
        nombre: 'Nueva SAS',
        nit: '800555666',
        sector_codigo: 'fintech',
        numero_empleados: 120,
      }),
    )
  })

  it('si no se cambia nada, cierra sin llamar al servidor', async () => {
    const usuario = await abrir()
    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(administracion.editarEmpresa).not.toHaveBeenCalled()
  })

  it('no deja vaciar el NIT de una empresa que ya lo tiene', async () => {
    const usuario = await abrir()
    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    await usuario.clear(within(dialogo).getByLabelText('NIT'))
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(administracion.editarEmpresa).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('una empresa sin NIT puede recibirlo', async () => {
    const usuario = await abrir([SIN_NIT])
    const dialogo = await editarEmpresa(usuario, 'Sin NIT SAS')
    expect(within(dialogo).getByLabelText('NIT')).toHaveValue('')

    await usuario.type(within(dialogo).getByLabelText('NIT'), '900123456')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(administracion.editarEmpresa).toHaveBeenCalledWith('emp-2', { nit: '900123456' }))
  })

  it('si el sector actual ya no está en el catálogo, se conserva como opción', async () => {
    const usuario = await abrir([SECTOR_RETIRADO])
    const dialogo = await editarEmpresa(usuario, 'Vieja SA')

    const sector = within(dialogo).getByLabelText('Sector')
    expect(sector).toHaveValue('manufactura')
    expect(within(sector).getByRole('option', { name: 'Manufactura' })).toBeInTheDocument()
    expect(within(sector).getByRole('option', { name: 'Fintech y Servicios financieros' })).toBeInTheDocument()

    // y guardar sin tocar el sector no lo envía
    await usuario.clear(within(dialogo).getByLabelText('Número de empleados'))
    await usuario.type(within(dialogo).getByLabelText('Número de empleados'), '12')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(administracion.editarEmpresa).toHaveBeenCalledWith('emp-3', { numero_empleados: 12 }))
  })

  it('un NIT repetido deja el formulario abierto con el motivo', async () => {
    administracion.editarEmpresa.mockRejectedValue(new ErrorApi(409, 'Ya existe una empresa con ese NIT'))
    const usuario = await abrir()
    const dialogo = await editarEmpresa(usuario, 'Mateo SAS')

    await usuario.clear(within(dialogo).getByLabelText('NIT'))
    await usuario.type(within(dialogo).getByLabelText('NIT'), '800555666')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('Ya existe una empresa con ese NIT')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
