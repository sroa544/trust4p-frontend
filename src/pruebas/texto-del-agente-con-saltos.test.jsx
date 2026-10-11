import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InformeResultados from '../paginas/InformeResultados.jsx'
import PlanEstrategico from '../paginas/PlanEstrategico.jsx'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'

// El agente redacta observaciones y recomendaciones en varios párrafos. El
// navegador colapsa los saltos de línea salvo que se le indique lo contrario,
// de modo que un texto estructurado se mostraba como un bloque corrido. No es
// un fallo visible —no hay error, solo un párrafo largo— y por eso conviene
// que una prueba lo sostenga.

vi.mock('../servicios/diagnosticos', () => ({
  listarDiagnosticos: vi.fn(),
  obtenerDiagnostico: vi.fn(),
  obtenerCuestionario: vi.fn(),
  descargarInforme: vi.fn(),
}))

const servicios = await import('../servicios/diagnosticos')

const OBSERVACION = 'Situación actual.\n\nEvidencia en las respuestas.'
const CONTENIDO = 'Qué hacer.\n\nCómo medirlo.'
const SINTESIS = 'Lectura general.\n\nPrioridad del ciclo.'

const CON_VARIOS_PARRAFOS = {
  ...DIAGNOSTICO_EVALUADO,
  resultado: {
    ...DIAGNOSTICO_EVALUADO.resultado,
    sintesis: SINTESIS,
    dimensiones: DIAGNOSTICO_EVALUADO.resultado.dimensiones.map((d, i) =>
      i === 0 ? { ...d, observacion: OBSERVACION } : d,
    ),
  },
  recomendaciones: DIAGNOSTICO_EVALUADO.recomendaciones.map((r, i) =>
    i === 0 ? { ...r, contenido: CONTENIDO } : r,
  ),
}

function montar(elemento, ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route element={elemento} path="/resultados/:id" />
        <Route element={elemento} path="/plan/:id" />
      </Routes>
    </MemoryRouter>,
  )
}

// getByText normaliza los espacios, así que se busca por el texto normalizado
// y se comprueba sobre el nodo encontrado que conserva el salto y el estilo.
function parrafoCon(inicio) {
  return screen
    .getAllByText((_, nodo) => nodo?.tagName === 'P' && nodo.textContent.startsWith(inicio))
    .at(-1)
}

describe('texto del agente en varios párrafos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicios.obtenerDiagnostico.mockResolvedValue(CON_VARIOS_PARRAFOS)
    servicios.obtenerCuestionario.mockResolvedValue(CUESTIONARIO)
  })

  it('el plan de mejora conserva los saltos de la observación por dimensión', async () => {
    montar(<PlanEstrategico />, '/plan/diag-1')
    await screen.findByText(/Situación actual/)

    const parrafo = parrafoCon('Situación actual')
    expect(parrafo.textContent).toBe(OBSERVACION)
    expect(parrafo).toHaveClass('whitespace-pre-line')
  })

  it('el plan de mejora conserva los saltos del contenido de una recomendación', async () => {
    montar(<PlanEstrategico />, '/plan/diag-1')
    await screen.findByText(/Qué hacer/)

    const parrafo = parrafoCon('Qué hacer')
    expect(parrafo.textContent).toBe(CONTENIDO)
    expect(parrafo).toHaveClass('whitespace-pre-line')
  })

  it('el informe de resultados conserva los saltos de la síntesis', async () => {
    montar(<InformeResultados />, '/resultados/diag-1')
    await screen.findByText(/Lectura general/)

    const parrafo = parrafoCon('Lectura general')
    expect(parrafo.textContent).toBe(SINTESIS)
    expect(parrafo).toHaveClass('whitespace-pre-line')
  })

  it('el informe de resultados conserva los saltos de la observación', async () => {
    montar(<InformeResultados />, '/resultados/diag-1')
    await screen.findByText(/Situación actual/)

    const parrafo = parrafoCon('Situación actual')
    expect(parrafo).toHaveClass('whitespace-pre-line')
  })
})
