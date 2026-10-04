import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RutaPorRol from '../componentes/RutaPorRol.jsx'
import { SesionProvider } from '../hooks/useSesion.jsx'
import Panel from '../paginas/Panel.jsx'
import { ErrorApi } from '../servicios/api'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))

const servicios = await import('../servicios/autenticacion')

// Control de acceso por rol en la interfaz. La autorización real la hace el
// backend (permisos efectivos por endpoint, R-16/R-17); aquí se verifica que la
// persona no vea ni llegue a pantallas que no son de su rol.

function montar(ruta) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider>
        <Routes>
          <Route element={<p>Pantalla de ingreso</p>} path="/login" />
          <Route element={<Panel />} path="/panel" />
          <Route
            element={
              <RutaPorRol roles={['A4']}>
                <p>Gestión de administración</p>
              </RutaPorRol>
            }
            path="/gestion"
          />
          <Route
            element={
              <RutaPorRol roles={['A2']}>
                <p>Cuestionario de la empresa</p>
              </RutaPorRol>
            }
            path="/diagnostico"
          />
        </Routes>
      </SesionProvider>
    </MemoryRouter>,
  )
}

describe('Acceso por rol', () => {
  beforeEach(() => vi.clearAllMocks())

  it('una persona sin sesión es enviada al ingreso', async () => {
    servicios.obtenerPerfil.mockRejectedValue(new ErrorApi(401, 'No autenticado'))
    montar('/diagnostico')

    expect(await screen.findByText('Pantalla de ingreso')).toBeInTheDocument()
  })

  it('el representante entra a su cuestionario', async () => {
    servicios.obtenerPerfil.mockResolvedValue(PERFIL_REPRESENTANTE)
    montar('/diagnostico')

    expect(await screen.findByText('Cuestionario de la empresa')).toBeInTheDocument()
  })

  it('el representante no entra a la administración y vuelve a su panel', async () => {
    servicios.obtenerPerfil.mockResolvedValue(PERFIL_REPRESENTANTE)
    montar('/gestion')

    expect(await screen.findByText(/Disponible para su rol/i)).toBeInTheDocument()
    expect(screen.queryByText('Gestión de administración')).not.toBeInTheDocument()
  })

  it('el panel solo ofrece los accesos del rol y no los de otros', async () => {
    servicios.obtenerPerfil.mockResolvedValue(PERFIL_REPRESENTANTE)
    montar('/panel')

    expect(await screen.findByText('Cuestionario de diagnóstico')).toBeInTheDocument()
    expect(screen.getByText('Plan de mejora')).toBeInTheDocument()
    expect(screen.queryByText('Auditoría')).not.toBeInTheDocument()
    expect(screen.queryByText('Empresas asignadas')).not.toBeInTheDocument()
    expect(screen.getByText('Innovatech SAS')).toBeInTheDocument()
  })

  it('el administrador ve las pantallas de gobierno', async () => {
    servicios.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: 'administrador', empresa_nombre: null })
    montar('/panel')

    expect(await screen.findByText('Auditoría')).toBeInTheDocument()
    expect(screen.getByText('Gestión y calibración')).toBeInTheDocument()
    expect(screen.queryByText('Cuestionario de diagnóstico')).not.toBeInTheDocument()
  })
})
