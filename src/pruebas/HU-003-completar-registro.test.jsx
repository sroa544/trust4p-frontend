import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionProvider } from '../hooks/useSesion.jsx'
import Registro from '../paginas/Registro.jsx'
import { ErrorApi } from '../servicios/api'
import { PERFIL_REPRESENTANTE } from './datos.js'

vi.mock('../servicios/autenticacion', () => ({
  consultarInvitacion: vi.fn(),
  completarRegistro: vi.fn(),
  iniciarSesion: vi.fn(),
  actualizarPerfil: vi.fn(),
  obtenerPerfil: vi.fn(),
  cerrarSesion: vi.fn(),
}))

const servicios = await import('../servicios/autenticacion')

// HU-003 Completar registro
//
// CA-01 (camino principal)
//   Dado que la persona abre una invitación vigente
//   Cuando define su contraseña y acepta el tratamiento de datos
//   Entonces el sistema (API) activa la cuenta y la persona ingresa
//
// CA-02 (excepción): invitación vencida o ya usada → se informa.
//
// CA-03 (excepción)
//   Dado que la persona no acepta la política de tratamiento de datos
//   Cuando intenta completar el registro
//   Entonces el sistema lo impide e informa que la autorización es obligatoria
//
// La política de contraseña la valida el backend (RF-48); la interfaz solo
// orienta mientras se escribe y muestra el mensaje del servidor.

const CLAVE_VALIDA = 'Trust4P!2026Seguro'
const INVITACION = {
  correo: 'ana@innovatech.com',
  nombre: 'Ana Pérez',
  rol_codigo: 'representante',
  empresa_nombre: 'Innovatech SAS',
  empresa_nit: '900123456-7',
  expira_en: '2026-10-10T00:00:00Z',
}

async function montar(ruta = '/registro?codigo=abc123') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider>
        <Routes>
          <Route element={<Registro />} path="/registro" />
          <Route element={<p>Panel de la empresa</p>} path="/panel" />
        </Routes>
      </SesionProvider>
    </MemoryRouter>,
  )
}

const consentimiento = () => screen.getByLabelText(/autorizo el tratamiento de mis datos personales/i)
const representacion = () => screen.getByLabelText(/actúo en representación de la organización/i)
const botonCrear = () => screen.getByRole('button', { name: /Crear cuenta y activar diagnóstico/i })

async function llenarClaves(usuario, clave = CLAVE_VALIDA, confirmacion = clave) {
  await usuario.type(screen.getByLabelText(/Crear contraseña/i), clave)
  await usuario.type(screen.getByLabelText(/Confirmar contraseña/i), confirmacion)
}

describe('HU-003 · Completar registro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicios.obtenerPerfil.mockRejectedValue(new ErrorApi(401, 'No autenticado'))
    servicios.consultarInvitacion.mockResolvedValue(INVITACION)
    servicios.completarRegistro.mockResolvedValue({})
    servicios.iniciarSesion.mockResolvedValue({})
    servicios.actualizarPerfil.mockResolvedValue({})
  })

  it('muestra la empresa y el correo de la invitación, que no se pueden modificar', async () => {
    await montar()

    expect(await screen.findByText('Innovatech SAS')).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo corporativo/i)).toHaveValue('ana@innovatech.com')
    expect(screen.getByLabelText(/Correo corporativo/i)).toHaveAttribute('readonly')
    expect(servicios.consultarInvitacion).toHaveBeenCalledWith('abc123')
  })

  it('CA-02 informa cuando la invitación venció o ya fue usada', async () => {
    servicios.consultarInvitacion.mockRejectedValue(new ErrorApi(401, 'Invitación inválida'))
    await montar()

    expect(await screen.findByText(/La invitación no es válida/i)).toBeInTheDocument()
  })

  it('sin código en el enlace tampoco se puede registrar', async () => {
    await montar('/registro')

    expect(await screen.findByText(/La invitación no es válida/i)).toBeInTheDocument()
    expect(servicios.consultarInvitacion).not.toHaveBeenCalled()
  })

  it('CA-03 impide completar el registro sin autorizar el tratamiento de datos', async () => {
    const usuario = userEvent.setup()
    await montar()
    await screen.findByText('Innovatech SAS')

    await llenarClaves(usuario)
    await usuario.click(representacion())
    expect(consentimiento()).not.toBeChecked()

    await usuario.click(botonCrear())

    expect(consentimiento()).toBeInvalid()
    expect(servicios.completarRegistro).not.toHaveBeenCalled()
  })

  it('CA-03 la autorización cita la Ley 1581 de 2012', async () => {
    await montar()
    await screen.findByText('Innovatech SAS')

    const etiqueta = consentimiento()
    const texto = document.querySelector(`label[for="${etiqueta.id}"]`)
    expect(within(texto).getByText(/Ley 1581 de 2012/i)).toBeInTheDocument()
  })

  it('exige también la declaración de representación de la organización', async () => {
    await montar()
    await screen.findByText('Innovatech SAS')

    expect(representacion()).toBeRequired()
  })

  it('impide continuar cuando las contraseñas no coinciden', async () => {
    const usuario = userEvent.setup()
    await montar()
    await screen.findByText('Innovatech SAS')

    await llenarClaves(usuario, CLAVE_VALIDA, 'Otra4P!2026Distinta')
    await usuario.click(consentimiento())
    await usuario.click(representacion())
    await usuario.click(botonCrear())

    expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument()
    expect(servicios.completarRegistro).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del servidor cuando la contraseña no cumple la política', async () => {
    const usuario = userEvent.setup()
    servicios.completarRegistro.mockRejectedValue(
      new ErrorApi(400, 'La contraseña debe tener al menos 12 caracteres'),
    )
    await montar()
    await screen.findByText('Innovatech SAS')

    await llenarClaves(usuario, 'abcdefgh')
    await usuario.click(consentimiento())
    await usuario.click(representacion())
    await usuario.click(botonCrear())

    expect(await screen.findByText(/al menos 12 caracteres/i)).toBeInTheDocument()
  })

  it('CA-01 completa el registro, inicia sesión y lleva al panel', async () => {
    const usuario = userEvent.setup()
    servicios.obtenerPerfil
      .mockRejectedValueOnce(new ErrorApi(401, 'No autenticado'))
      .mockResolvedValue(PERFIL_REPRESENTANTE)
    await montar()
    await screen.findByText('Innovatech SAS')

    await usuario.type(screen.getByLabelText(/Cargo/i), 'Directora de Innovación')
    await llenarClaves(usuario)
    await usuario.click(consentimiento())
    await usuario.click(representacion())
    await usuario.click(botonCrear())

    await waitFor(() =>
      expect(servicios.completarRegistro).toHaveBeenCalledWith({
        codigo: 'abc123',
        clave: CLAVE_VALIDA,
        nombres: 'Ana',
        apellidos: 'Pérez',
        aceptoTratamiento: true,
      }),
    )
    expect(servicios.iniciarSesion).toHaveBeenCalledWith('ana@innovatech.com', CLAVE_VALIDA)
    expect(servicios.actualizarPerfil).toHaveBeenCalledWith({ cargo: 'Directora de Innovación' })
    expect(await screen.findByText('Panel de la empresa')).toBeInTheDocument()
  })

  it('la barra de seguridad avanza con cada criterio cumplido', async () => {
    const usuario = userEvent.setup()
    await montar()
    await screen.findByText('Innovatech SAS')

    const barra = screen.getByRole('progressbar', { name: /Seguridad de la contraseña/i })
    const campo = screen.getByLabelText(/Crear contraseña/i)
    expect(barra).toHaveAttribute('aria-valuenow', '0')

    // Solo minúsculas y corta: cumple una única regla.
    await usuario.type(campo, 'soela')
    expect(barra).toHaveAttribute('aria-valuenow', '1')

    await usuario.clear(campo)
    await usuario.type(campo, CLAVE_VALIDA)
    expect(barra).toHaveAttribute('aria-valuenow', '5')
    expect(barra).toHaveAccessibleName(/Excelente/i)
  })
})
