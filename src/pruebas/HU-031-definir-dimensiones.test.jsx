import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import GestionCalibracion from '../paginas/GestionCalibracion.jsx'
import { PILARES } from '../datos/configuracionModelo.js'

// HU-031 Definir dimensiones
//
// CA-01 (excepción)
//   Dado que los pesos de las dimensiones no suman la unidad
//   Cuando el administrador intenta publicar la versión
//   Entonces el sistema lo impide e indica la inconsistencia

const campoDePeso = (pilar) => screen.getByLabelText(`Peso de ${pilar.nombre}`)

const botonGuardar = () => screen.getByRole('button', { name: /Guardar parámetros/i })

async function escribirPeso(usuario, pilar, valor) {
  const campo = campoDePeso(pilar)
  await usuario.clear(campo)
  await usuario.type(campo, String(valor))
}

describe('HU-031 · Definir dimensiones', () => {
  it('CA-01 impide guardar cuando los pesos no suman 100', async () => {
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)

    await escribirPeso(usuario, PILARES[0], 40)

    expect(botonGuardar()).toBeDisabled()
  })

  it('CA-01 indica la inconsistencia y el valor actual de la suma', async () => {
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)

    await escribirPeso(usuario, PILARES[0], 40)

    // 40 + 25 + 25 + 25
    expect(screen.getByText(/Ponderación inconsistente: la suma va en 115.0%/i)).toBeInTheDocument()
    expect(screen.getByText(/Guardado bloqueado/i)).toBeInTheDocument()
  })

  it('CA-01 también impide simular con una ponderación inconsistente', async () => {
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)

    await escribirPeso(usuario, PILARES[0], 40)

    expect(screen.getByRole('button', { name: /Simular impacto/i })).toBeDisabled()
  })

  it('habilita el guardado cuando la suma vuelve a 100', async () => {
    const usuario = userEvent.setup()
    render(<GestionCalibracion />)

    await escribirPeso(usuario, PILARES[0], 40)
    await escribirPeso(usuario, PILARES[3], 10)

    expect(botonGuardar()).toBeEnabled()
    expect(screen.getByText(/Motor activo/i)).toBeInTheDocument()
  })
})
