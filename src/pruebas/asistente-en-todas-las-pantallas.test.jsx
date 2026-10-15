import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import { PERFIL_REPRESENTANTE } from './datos.js'

// El asistente debe acompañar a los cuatro roles. Una lista fija de rutas lo
// dejaba fuera de todas las pantallas del consultor y de casi todas las del
// administrador, que es un defecto difícil de ver salvo entrando con cada rol.

vi.mock('@botpress/webchat', () => ({
  Fab: (propiedades) => <button type="button" {...propiedades}>Abrir asistente</button>,
  StylesheetProvider: () => null,
  Webchat: () => <div data-testid="asistente" />,
  useWebchat: () => ({ on: null }),
}))

// Sin perfil inicial, el proveedor consulta la sesión; que falle es lo que
// deja el estado en 'anonimo', que es la condición de la última prueba.
vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn().mockRejectedValue(new Error('sin sesión')),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))

vi.stubEnv('VITE_BOTPRESS_CLIENT_ID', 'cliente-de-prueba')

const { default: AsistenteChat } = await import('../componentes/AsistenteChat.jsx')

const PERFIL_ADMINISTRADOR = {
  ...PERFIL_REPRESENTANTE,
  id: 'u-9',
  correo: 'admin@trust4p.co',
  rol_codigo: 'administrador',
  permisos: ['modelo.gestionar', 'usuarios.gestionar', 'auditoria.consultar'],
}

const PERFIL_CONSULTOR = {
  ...PERFIL_REPRESENTANTE,
  id: 'u-7',
  correo: 'consultor@trust4p.co',
  rol_codigo: 'consultor',
  permisos: ['diagnosticos.consultar'],
}

function montar(ruta, perfil) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider perfilInicial={perfil}>
        <AsistenteChat />
      </SesionProvider>
    </MemoryRouter>,
  )
}

describe('asistente conversacional', () => {
  it.each([
    ['/gestion', 'gestión y calibración'],
    ['/usuarios', 'usuarios'],
    ['/indicadores', 'indicadores'],
    ['/informes', 'informes'],
    ['/auditoria', 'auditoría'],
    ['/panel', 'panel'],
  ])('está disponible para el administrador en %s (%s)', (ruta) => {
    montar(ruta, PERFIL_ADMINISTRADOR)
    expect(screen.getByTestId('asistente')).toBeInTheDocument()
  })

  it('está disponible para el consultor en sus pantallas', () => {
    montar('/consultoria', PERFIL_CONSULTOR)
    expect(screen.getByTestId('asistente')).toBeInTheDocument()
  })

  it('sigue disponible para el representante de empresa', () => {
    montar('/plan', PERFIL_REPRESENTANTE)
    expect(screen.getByTestId('asistente')).toBeInTheDocument()
  })

  it('no aparece en las pantallas públicas, donde no hay sesión', () => {
    montar('/login', null)
    expect(screen.queryByTestId('asistente')).not.toBeInTheDocument()
  })
})
