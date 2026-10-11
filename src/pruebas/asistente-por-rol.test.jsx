import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.stubEnv('VITE_BOTPRESS_CLIENT_ID', 'cliente-de-prueba')

vi.mock('../servicios/autenticacion', () => ({
  obtenerPerfil: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}))
vi.mock('@botpress/webchat', () => ({
  Fab: () => <button type="button">Abrir asistente</button>,
  StylesheetProvider: () => null,
  Webchat: () => null,
  useWebchat: () => ({ on: undefined }),
}))

const autenticacion = await import('../servicios/autenticacion')
const { default: AsistenteChat } = await import('../componentes/AsistenteChat.jsx')

async function montar(ruta, rol) {
  autenticacion.obtenerPerfil.mockResolvedValue({ ...PERFIL_REPRESENTANTE, rol_codigo: rol })
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider>
        <p>contenido</p>
        <AsistenteChat />
      </SesionProvider>
    </MemoryRouter>,
  )
  // Espera a que la sesión termine de cargar.
  await screen.findByText('contenido')
  await new Promise((r) => setTimeout(r, 20))
}

const hayAsistente = () => screen.queryByRole('button', { name: 'Abrir asistente' }) !== null

beforeEach(() => vi.clearAllMocks())

describe('Asistente de ayuda por rol', () => {
  it.each(['/panel', '/indicadores', '/informes', '/gestion', '/usuarios', '/auditoria', '/perfil'])(
    'el administrador lo tiene en %s',
    async (ruta) => {
      await montar(ruta, 'administrador')
      expect(hayAsistente()).toBe(true)
    },
  )

  it.each(['/diagnostico', '/resultados', '/plan', '/historial'])('el representante lo tiene en %s', async (ruta) => {
    await montar(ruta, 'representante')
    expect(hayAsistente()).toBe(true)
  })

  it('el representante no lo tiene fuera de su diagnóstico', async () => {
    await montar('/perfil', 'representante')
    expect(hayAsistente()).toBe(false)
  })

  it('el consultor no lo tiene', async () => {
    await montar('/consultoria', 'consultor')
    expect(hayAsistente()).toBe(false)
  })

  it('el administrador no lo tiene en las pantallas del representante', async () => {
    await montar('/diagnostico', 'administrador')
    expect(hayAsistente()).toBe(false)
  })
})
