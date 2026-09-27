import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InformeResultados from '../paginas/InformeResultados.jsx'
import { INFORME_RESULTADOS } from '../datos/informeResultados'

// HU-014 Puntaje por dimensión
//
// CA-01 (camino principal)
//   Dado que existe un resultado generado
//   Cuando el representante consulta el detalle
//   Entonces el sistema presenta un puntaje por cada dimensión del modelo aplicado

describe('HU-014 · Puntaje por dimensión', () => {
  it('CA-01 presenta un puntaje por cada dimensión del modelo aplicado', () => {
    const { container } = render(<InformeResultados />)

    expect(INFORME_RESULTADOS.dimensiones).toHaveLength(4)

    INFORME_RESULTADOS.dimensiones.forEach((dimension) => {
      expect(container.textContent).toContain(
        `${dimension.nombre.toUpperCase()}: ${dimension.puntaje}`,
      )
    })
  })

  it('CA-01 identifica la dimensión más fuerte y la más débil a partir de los puntajes', () => {
    const { container } = render(<InformeResultados />)

    const puntajes = INFORME_RESULTADOS.dimensiones.map((d) => d.puntaje)
    const mayor = Math.max(...puntajes)
    const menor = Math.min(...puntajes)

    expect(container.textContent).toContain(`Mayor puntaje (${mayor})`)
    expect(container.textContent).toContain(`Menor puntaje (${menor})`)
  })

  it('advierte que el informe proviene de un modelo provisional', () => {
    render(<InformeResultados />)

    expect(screen.getByText(/Informe en borrador/i)).toBeInTheDocument()
  })
})
