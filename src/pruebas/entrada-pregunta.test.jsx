import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EntradaPregunta from '../componentes/EntradaPregunta.jsx'

// La respuesta es el título de cada opción; el código interno (N1, N2…) no se muestra.

const PREGUNTA = {
  codigo: 'PROP-01',
  tipo: 'seleccion_unica',
  opciones: [
    { codigo: 'N1', etiqueta: 'No existe una tesis de innovación', valor: '25' },
    { codigo: 'N2', etiqueta: 'Existe, pero no está formalizada', valor: '50' },
    { codigo: 'N3', etiqueta: 'Está formalizada y se revisa cada año', valor: '75' },
    { codigo: 'N4', etiqueta: 'Se mide y se ajusta de forma continua', valor: '100' },
  ],
}

describe('Opciones de una pregunta de selección', () => {
  it('muestra la respuesta como texto principal de cada opción', () => {
    render(<EntradaPregunta onCambiar={vi.fn()} pregunta={PREGUNTA} respuesta={undefined} />)

    for (const opcion of PREGUNTA.opciones) {
      expect(screen.getByText(opcion.etiqueta)).toBeInTheDocument()
    }
  })

  it('no muestra el código interno de la opción', () => {
    render(<EntradaPregunta onCambiar={vi.fn()} pregunta={PREGUNTA} respuesta={undefined} />)

    for (const codigo of ['N1', 'N2', 'N3', 'N4']) {
      expect(screen.queryByText(codigo)).not.toBeInTheDocument()
    }
  })

  it('cada opción se puede elegir por su respuesta y guarda su código', async () => {
    const alCambiar = vi.fn()
    const usuario = userEvent.setup()
    render(<EntradaPregunta onCambiar={alCambiar} pregunta={PREGUNTA} respuesta={undefined} />)

    await usuario.click(screen.getByLabelText(/Está formalizada y se revisa cada año/))

    expect(alCambiar).toHaveBeenCalledWith({ opciones_codigo: ['N3'] })
  })

  it('marca como elegida la opción que ya tiene respuesta', () => {
    render(<EntradaPregunta onCambiar={vi.fn()} pregunta={PREGUNTA} respuesta={{ opciones_codigo: ['N2'] }} />)

    expect(screen.getByLabelText(/Existe, pero no está formalizada/)).toBeChecked()
    expect(screen.getByLabelText(/No existe una tesis/)).not.toBeChecked()
  })

  it('en selección múltiple se pueden marcar varias y conservan sus códigos', async () => {
    const alCambiar = vi.fn()
    const usuario = userEvent.setup()
    render(
      <EntradaPregunta
        onCambiar={alCambiar}
        pregunta={{ ...PREGUNTA, tipo: 'seleccion_multiple' }}
        respuesta={{ opciones_codigo: ['N1'] }}
      />,
    )

    await usuario.click(screen.getByLabelText(/Se mide y se ajusta/))

    expect(alCambiar).toHaveBeenCalledWith({ opciones_codigo: ['N1', 'N4'] })
  })

  it('sigue mostrando el puntaje de cada opción', () => {
    render(<EntradaPregunta onCambiar={vi.fn()} pregunta={PREGUNTA} respuesta={undefined} />)

    expect(screen.getByText('25 pts')).toBeInTheDocument()
    expect(screen.getByText('100 pts')).toBeInTheDocument()
  })
})
