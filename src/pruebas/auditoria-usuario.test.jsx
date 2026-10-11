import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import PanelAuditoria from '../paginas/PanelAuditoria.jsx'
import { ErrorApi } from '../servicios/api'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('../servicios/auditoria', () => ({
  consultarBitacora: vi.fn(),
  ejecucionesDelAgente: vi.fn(),
}))

const autenticacion = await import('../servicios/autenticacion')
const auditoria = await import('../servicios/auditoria')

// La bitácora muestra quién actuó (nombre y correo, que es único) en lugar de un
// id, y se filtra por nombre o correo.

const REGISTROS = [
  {
    id: 'r1',
    usuario_id: '66a0000000000000000000a1',
    usuario_nombre: 'Elena Rostova',
    usuario_correo: 'elena@trust4p.com',
    entidad: 'empresas',
    entidad_id: 'e-1',
    accion: 'actualizar',
    valores_anteriores: { nit: '1' },
    valores_nuevos: { nit: '2' },
    registrado_en: '2026-10-10T10:00:00Z',
  },
  {
    id: 'r2',
    usuario_id: '66a0000000000000000000b2',
    usuario_nombre: null,
    usuario_correo: null,
    entidad: 'usuarios',
    entidad_id: 'u-9',
    accion: 'desactivar',
    valores_anteriores: null,
    valores_nuevos: null,
    registrado_en: '2026-10-10T09:00:00Z',
  },
  {
    id: 'r3',
    usuario_id: null,
    usuario_nombre: null,
    usuario_correo: null,
    entidad: 'sesiones',
    entidad_id: null,
    accion: 'autenticar',
    valores_anteriores: null,
    valores_nuevos: null,
    registrado_en: '2026-10-10T08:00:00Z',
  },
]

function abrir() {
  render(
    <MemoryRouter>
      <SesionProvider>
        <PanelAuditoria />
      </SesionProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador' })
  auditoria.consultarBitacora.mockResolvedValue(REGISTROS)
})

describe('Bitácora: quién realizó la acción', () => {
  it('muestra el nombre y el correo de quien actuó, no su id', async () => {
    abrir()

    const fila = (await screen.findByText('Elena Rostova')).closest('tr')
    expect(within(fila).getByText('elena@trust4p.com')).toBeInTheDocument()
    expect(within(fila).queryByText('66a0000000000000000000a1')).not.toBeInTheDocument()
  })

  it('el id sigue disponible al pasar el cursor, para quien lo necesite', async () => {
    abrir()

    const celda = (await screen.findByText('Elena Rostova')).closest('td')
    expect(celda).toHaveAttribute('title', '66a0000000000000000000a1')
  })

  it('un usuario que ya no existe se indica como no disponible, con su id', async () => {
    abrir()

    const fila = (await screen.findByText('Usuario no disponible')).closest('tr')
    expect(within(fila).getByText('66a0000000000000000000b2')).toBeInTheDocument()
  })

  it('una acción del sistema se muestra como Sistema', async () => {
    abrir()

    const fila = (await screen.findByText('autenticar')).closest('tr')
    expect(within(fila).getByText('Sistema')).toBeInTheDocument()
  })

  it('ya no pide el id del usuario: se filtra por nombre o correo', async () => {
    abrir()
    await screen.findByText('Elena Rostova')

    expect(screen.queryByLabelText('Id del usuario')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('placeholder', 'Nombre o correo')
  })

  it('al escribir consulta con ese texto, esperando a que termine de teclear', async () => {
    const usuario = userEvent.setup()
    abrir()
    await screen.findByText('Elena Rostova')
    auditoria.consultarBitacora.mockClear()

    await usuario.type(screen.getByLabelText('Usuario'), 'elena@trust')

    await waitFor(() =>
      expect(auditoria.consultarBitacora).toHaveBeenLastCalledWith({
        entidad: '',
        entidad_id: '',
        limite: 50,
        usuario: 'elena@trust',
      }),
    )
    // una sola consulta para todo el texto, no una por letra
    expect(auditoria.consultarBitacora).toHaveBeenCalledTimes(1)
  })

  it('los espacios alrededor del texto no cuentan', async () => {
    const usuario = userEvent.setup()
    abrir()
    await screen.findByText('Elena Rostova')

    await usuario.type(screen.getByLabelText('Usuario'), '  julia  ')

    await waitFor(() =>
      expect(auditoria.consultarBitacora).toHaveBeenLastCalledWith(expect.objectContaining({ usuario: 'julia' })),
    )
  })

  it('si nadie coincide, dice que no hay registros', async () => {
    const usuario = userEvent.setup()
    abrir()
    await screen.findByText('Elena Rostova')
    auditoria.consultarBitacora.mockResolvedValue([])

    await usuario.type(screen.getByLabelText('Usuario'), 'nadie')

    expect(await screen.findByText('Sin registros.')).toBeInTheDocument()
  })

  it('el resto de filtros se conserva al buscar por usuario', async () => {
    const usuario = userEvent.setup()
    abrir()
    await screen.findByText('Elena Rostova')

    await usuario.selectOptions(screen.getByLabelText('Entidad'), 'empresas')
    await usuario.type(screen.getByLabelText('Usuario'), 'elena')

    await waitFor(() =>
      expect(auditoria.consultarBitacora).toHaveBeenLastCalledWith({
        entidad: 'empresas',
        entidad_id: '',
        limite: 50,
        usuario: 'elena',
      }),
    )
  })

  it('muestra el mensaje del servidor si la consulta falla', async () => {
    auditoria.consultarBitacora.mockRejectedValue(new ErrorApi(500, 'No se pudo consultar la bitácora'))
    abrir()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar la bitácora')
  })
})
