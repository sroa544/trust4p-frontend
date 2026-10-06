import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { activarMensajesEnEspanol, mensajeDeValidacion } from '../servicios/validacionNativa'

// Los avisos nativos del navegador salen en su idioma («Please check this
// box…»). La aplicación es en español: se reemplazan por textos propios sin
// cambiar el diseño de los formularios.

function Formulario() {
  return (
    <form aria-label="prueba" onSubmit={(e) => e.preventDefault()}>
      <label>
        Correo
        <input name="correo" required type="email" />
      </label>
      <label>
        Empleados
        <input min="1" name="empleados" type="number" />
      </label>
      <label>
        Sector
        <select name="sector" required>
          <option value="">Seleccione…</option>
          <option value="a">A</option>
        </select>
      </label>
      <label>
        Acepto
        <input name="acepto" required type="checkbox" />
      </label>
      <button type="submit">Enviar</button>
    </form>
  )
}

describe('mensajes de validación en español', () => {
  beforeAll(() => activarMensajesEnEspanol())

  it('la casilla obligatoria pide marcarla, en español', () => {
    render(<Formulario />)
    const formulario = screen.getByRole('form', { name: 'prueba' })

    expect(formulario.reportValidity()).toBe(false)

    expect(screen.getByLabelText('Acepto').validationMessage).toBe('Debe marcar esta casilla para continuar.')
    expect(screen.getByLabelText('Acepto').validationMessage).not.toMatch(/please/i)
  })

  it('cada tipo de error tiene su propio mensaje', () => {
    render(<Formulario />)

    expect(mensajeDeValidacion(screen.getByLabelText('Correo'))).toBe('Complete este campo.')
    expect(mensajeDeValidacion(screen.getByLabelText('Sector'))).toBe('Seleccione una opción de la lista.')
  })

  it('un correo mal escrito se explica con un ejemplo', async () => {
    const usuario = userEvent.setup()
    render(<Formulario />)
    const correo = screen.getByLabelText('Correo')

    await usuario.type(correo, 'sin-arroba')

    expect(mensajeDeValidacion(correo)).toMatch(/correo electrónico válido/i)
  })

  it('un número por debajo del mínimo indica el límite', async () => {
    const usuario = userEvent.setup()
    render(<Formulario />)
    const empleados = screen.getByLabelText('Empleados')

    await usuario.type(empleados, '0')

    expect(mensajeDeValidacion(empleados)).toBe('El valor debe ser mayor o igual a 1.')
  })

  it('al corregir el campo se limpia el mensaje para que el navegador revalide', async () => {
    const usuario = userEvent.setup()
    render(<Formulario />)
    const formulario = screen.getByRole('form', { name: 'prueba' })
    formulario.reportValidity()
    const correo = screen.getByLabelText('Correo')
    expect(correo.validationMessage).toBe('Complete este campo.')

    await usuario.type(correo, 'ana@empresa.com')

    expect(correo.validationMessage).toBe('')
  })
})
