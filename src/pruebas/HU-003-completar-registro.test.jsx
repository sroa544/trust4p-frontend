import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Registro from '../paginas/Registro.jsx'

// HU-003 Completar registro
//
// CA-03 (excepción)
//   Dado que la persona no acepta la política de tratamiento de datos
//   Cuando intenta completar el registro
//   Entonces el sistema lo impide e informa que la autorización es obligatoria
//
// CA-01 y CA-02 dependen del servicio de invitaciones y no se cubren aquí.
// Estas pruebas verifican únicamente las reglas que hoy vive el frontend.

const CLAVE_VALIDA = 'Trust4P!2026'

function montar() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <Registro />
    </MemoryRouter>,
  )
}

const consentimiento = () =>
  screen.getByLabelText(/autorizo el tratamiento de mis datos personales/i)

const representacion = () =>
  screen.getByLabelText(/actúo en representación de la organización/i)

const botonCrear = () =>
  screen.getByRole('button', { name: /Crear cuenta y activar diagnóstico/i })

// Llena todos los campos obligatorios salvo las casillas de consentimiento,
// para que cualquier bloqueo posterior provenga solo de ellas.
async function llenarFormulario(usuario, clave = CLAVE_VALIDA, confirmacion = clave) {
  await usuario.type(screen.getByLabelText(/Cargo/i), 'Directora de Innovación')
  await usuario.type(screen.getByLabelText(/Crear contraseña/i), clave)
  await usuario.type(screen.getByLabelText(/Confirmar contraseña/i), confirmacion)
}

async function aceptarConsentimientos(usuario) {
  await usuario.click(consentimiento())
  await usuario.click(representacion())
}

describe('HU-003 · Completar registro', () => {
  it('CA-03 impide completar el registro sin autorizar el tratamiento de datos', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarFormulario(usuario)
    await usuario.click(representacion())

    expect(consentimiento()).not.toBeChecked()

    await usuario.click(botonCrear())

    // El formulario sigue en pantalla y la casilla queda marcada como inválida.
    expect(botonCrear()).toBeInTheDocument()
    expect(consentimiento()).toBeInvalid()
  })

  it('CA-03 la autorización cita la Ley 1581 de 2012', () => {
    montar()

    const etiqueta = screen.getByLabelText(
      /autorizo el tratamiento de mis datos personales/i,
    )
    const texto = document.querySelector(`label[for="${etiqueta.id}"]`)

    expect(within(texto).getByText(/Ley 1581 de 2012/i)).toBeInTheDocument()
  })

  it('exige también la declaración de representación de la organización', () => {
    montar()

    expect(representacion()).toBeRequired()
  })

  it('impide continuar cuando las contraseñas no coinciden', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarFormulario(usuario, CLAVE_VALIDA, 'Otra4P!2026')
    await aceptarConsentimientos(usuario)
    await usuario.click(botonCrear())

    expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('impide continuar cuando la contraseña no cumple los criterios de seguridad', async () => {
    const usuario = userEvent.setup()
    montar()

    await llenarFormulario(usuario, 'abcdefgh')
    await aceptarConsentimientos(usuario)
    await usuario.click(botonCrear())

    expect(
      await screen.findByText(/no cumple todos los criterios de seguridad/i),
    ).toBeInTheDocument()
  })

  it('la fuerza de la contraseña distingue el campo vacío de una contraseña débil', async () => {
    const usuario = userEvent.setup()
    montar()

    const campo = screen.getByLabelText(/Crear contraseña/i)

    expect(screen.getByText('Pendiente')).toBeInTheDocument()

    await usuario.type(campo, 'soela')
    expect(screen.getByText('Muy baja')).toBeInTheDocument()

    // Ocho caracteres en minuscula: solo cumple el criterio de longitud.
    await usuario.type(campo, 'aaa')
    expect(screen.getByText('Baja')).toBeInTheDocument()

    // Se agrega una mayuscula: dos criterios cumplidos.
    await usuario.type(campo, 'X')
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('reconoce una contraseña que cumple los cuatro criterios', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.type(screen.getByLabelText(/Crear contraseña/i), CLAVE_VALIDA)

    expect(screen.getByText('Excelente')).toBeInTheDocument()
  })

  it('la barra de seguridad avanza con cada criterio cumplido', async () => {
    const usuario = userEvent.setup()
    montar()

    const barra = screen.getByRole('progressbar', { name: /Seguridad de la contraseña/i })
    const campo = screen.getByLabelText(/Crear contraseña/i)

    expect(barra).toHaveAttribute('aria-valuenow', '0')

    await usuario.type(campo, 'soela')
    expect(barra).toHaveAttribute('aria-valuenow', '0')
    expect(barra).toHaveAccessibleName(/Muy baja/i)

    await usuario.type(campo, 'aaa')
    expect(barra).toHaveAttribute('aria-valuenow', '1')

    await usuario.clear(campo)
    await usuario.type(campo, CLAVE_VALIDA)
    expect(barra).toHaveAttribute('aria-valuenow', '4')
    expect(barra).toHaveAccessibleName(/Excelente/i)
  })
})
