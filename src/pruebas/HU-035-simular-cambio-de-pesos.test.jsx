import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { COHORTE_DEMO, PILARES } from '../datos/configuracionModelo.js'

// HU-035 Simular cambio de pesos
//
// CA-01 (camino principal)
//   Dado que el administrador ejecuta una simulación de ponderaciones
//   Cuando consulta los resultados originales
//   Entonces los resultados almacenados permanecen sin cambios

const PESOS_GUARDADOS = Object.fromEntries(PILARES.map((pilar) => [pilar.id, pilar.peso]))

function indiceCon(puntajes, pesos) {
  return PILARES.reduce(
    (total, pilar) => total + (puntajes[pilar.id] * pesos[pilar.id]) / 100,
    0,
  )
}

function campoDePeso(pilar) {
  return screen.getByLabelText(`Peso de ${pilar.nombre}`)
}

async function escribirPeso(usuario, pilar, valor) {
  const campo = campoDePeso(pilar)
  await usuario.clear(campo)
  await usuario.type(campo, String(valor))
}

describe('HU-035 · Simular cambio de pesos', () => {
  it('CA-01 los índices almacenados no cambian al simular una ponderación distinta', async () => {
    const usuario = userEvent.setup()
    const { container } = render(<GestionCalibracion />)

    // Ponderación alterna que también suma 100.
    await escribirPeso(usuario, PILARES[0], 40)
    await escribirPeso(usuario, PILARES[3], 10)

    await usuario.click(screen.getByRole('button', { name: /Simular impacto/i }))

    COHORTE_DEMO.forEach((caso) => {
      const original = indiceCon(caso.puntajes, PESOS_GUARDADOS)
      expect(container.textContent).toContain(original.toFixed(1))
    })
  })
})
