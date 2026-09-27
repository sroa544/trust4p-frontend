import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { SOLICITUDES } from '../datos/configuracionModelo.js'

// HU-002 Aprobación de solicitudes
//
// CA-02 (alterno)
//   Dado que existe una solicitud en estado pendiente
//   Cuando el administrador la rechaza indicando el motivo
//   Entonces el sistema registra el rechazo con su motivo y notifica al solicitante
//
// CA-03 (excepción)
//   Dado que el administrador rechaza una solicitud sin indicar el motivo
//   Cuando intenta confirmar la operación
//   Entonces el sistema la impide y señala el campo obligatorio
//
// CA-01 exige crear la empresa y emitir la invitación: depende de la API de
// negocio. Aquí solo se verifica el cambio de estado en la interfaz.

const PRIMERA = SOLICITUDES[0]

function filaDe(razonSocial) {
  return screen.getByText(razonSocial).closest('tr')
}

function montar() {
  const utilidades = render(<GestionCalibracion />)
  return { ...utilidades, fila: () => filaDe(PRIMERA.razonSocial) }
}

describe('HU-002 · Aprobación de solicitudes', () => {
  it('CA-03 no permite confirmar el rechazo sin indicar el motivo', async () => {
    const usuario = userEvent.setup()
    const { fila } = montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))

    const confirmar = within(fila()).getByRole('button', { name: /Confirmar rechazo/i })
    expect(confirmar).toBeDisabled()

    // Los espacios en blanco no cuentan como motivo.
    await usuario.type(within(fila()).getByPlaceholderText(/Motivo del rechazo/i), '   ')
    expect(within(fila()).getByRole('button', { name: /Confirmar rechazo/i })).toBeDisabled()
  })

  it('CA-02 registra el rechazo junto con su motivo', async () => {
    const usuario = userEvent.setup()
    const { fila } = montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))
    await usuario.type(
      within(fila()).getByPlaceholderText(/Motivo del rechazo/i),
      'Documentación incompleta',
    )
    await usuario.click(within(fila()).getByRole('button', { name: /Confirmar rechazo/i }))

    expect(within(fila()).getByText(/Motivo: Documentación incompleta/i)).toBeInTheDocument()
    expect(within(fila()).queryByRole('button', { name: /^Aprobar$/i })).not.toBeInTheDocument()
  })

  it('el rechazo puede cancelarse sin alterar la solicitud', async () => {
    const usuario = userEvent.setup()
    const { fila } = montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Rechazar$/i }))
    await usuario.click(within(fila()).getByRole('button', { name: /Cancelar/i }))

    expect(within(fila()).getByRole('button', { name: /^Aprobar$/i })).toBeInTheDocument()
  })

  it('CA-01 (parcial) la aprobación retira la solicitud de las pendientes', async () => {
    const usuario = userEvent.setup()
    const { fila } = montar()

    await usuario.click(within(fila()).getByRole('button', { name: /^Aprobar$/i }))

    expect(within(fila()).queryByRole('button', { name: /^Aprobar$/i })).not.toBeInTheDocument()
    expect(within(fila()).queryByRole('button', { name: /^Rechazar$/i })).not.toBeInTheDocument()
  })
})
