import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TextoDelAgente from '../componentes/TextoDelAgente.jsx'
import InformeResultados from '../paginas/InformeResultados.jsx'
import PlanEstrategico from '../paginas/PlanEstrategico.jsx'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'

// El agente redacta en varios párrafos y, en las recomendaciones, cada uno
// abre con un rótulo. El navegador colapsa los saltos de línea salvo que se
// le indique lo contrario, y aun conservándolos el texto se lee como una
// pared si todos los párrafos van seguidos y sin jerarquía.

vi.mock('../servicios/diagnosticos', () => ({
  listarDiagnosticos: vi.fn(),
  obtenerDiagnostico: vi.fn(),
  obtenerCuestionario: vi.fn(),
  descargarInforme: vi.fn(),
}))

const servicios = await import('../servicios/diagnosticos')

const OBSERVACION = 'Situación actual de la dimensión.\n\nEvidencia en las respuestas.'
const CONTENIDO = [
  'Qué hacer: formalizar la tesis de innovación.',
  'Primeros pasos: inventariar las iniciativas vigentes.',
  'Horizonte: corto plazo, tres meses.',
].join('\n\n')
const SINTESIS = 'Lectura general del estado.\n\nPrioridad del ciclo.'

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

function parrafoCon(inicio) {
  return screen
    .getAllByText((_, nodo) => nodo?.tagName === 'P' && nodo.textContent.startsWith(inicio))
    .at(-1)
}

describe('TextoDelAgente', () => {
  it('separa en párrafos y conserva los saltos dentro de cada uno', () => {
    render(<TextoDelAgente texto={'Primero.\nSegunda línea.\n\nSegundo párrafo.'} />)

    const parrafos = screen.getAllByText(/párrafo|línea|Primero/, { selector: 'p' })
    expect(parrafos).toHaveLength(2)
    expect(parrafos[0].textContent).toBe('Primero.\nSegunda línea.')
    expect(parrafos[0]).toHaveClass('whitespace-pre-line')
  })

  it('destaca el rótulo del párrafo sin repetirlo en el cuerpo', () => {
    render(<TextoDelAgente texto="Horizonte: corto plazo, tres meses." />)

    const rotulo = screen.getByText('Horizonte:')
    expect(rotulo).toHaveClass('font-bold')
    expect(rotulo.parentElement.textContent).toBe('Horizonte: corto plazo, tres meses.')
  })

  it('un párrafo sin rótulo se muestra tal cual', () => {
    render(<TextoDelAgente texto="La organización asigna recursos explícitos." />)

    expect(screen.getByText('La organización asigna recursos explícitos.')).toBeInTheDocument()
    expect(screen.queryByText(/:$/)).not.toBeInTheDocument()
  })

  it('no pinta nada cuando no hay texto', () => {
    const { container } = render(<TextoDelAgente texto={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('texto del agente en las pantallas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicios.obtenerDiagnostico.mockResolvedValue(CON_VARIOS_PARRAFOS)
    servicios.obtenerCuestionario.mockResolvedValue(CUESTIONARIO)
  })

  it('el plan separa la observación por dimensión en párrafos', async () => {
    montar(<PlanEstrategico />, '/plan/diag-1')
    await screen.findByText(/Situación actual/)

    const parrafo = parrafoCon('Situación actual')
    expect(parrafo.textContent).toBe('Situación actual de la dimensión.')
    expect(parrafo).toHaveClass('whitespace-pre-line')
    expect(screen.getByText('Evidencia en las respuestas.')).toBeInTheDocument()
  })

  it('el plan destaca los rótulos de una recomendación', async () => {
    montar(<PlanEstrategico />, '/plan/diag-1')
    await screen.findByText('Qué hacer:')

    for (const rotulo of ['Qué hacer:', 'Primeros pasos:', 'Horizonte:']) {
      expect(screen.getByText(rotulo)).toHaveClass('font-bold')
    }
  })

  it('el informe separa la síntesis en párrafos', async () => {
    montar(<InformeResultados />, '/resultados/diag-1')
    await screen.findByText(/Lectura general/)

    const parrafo = parrafoCon('Lectura general')
    expect(parrafo.textContent).toBe('Lectura general del estado.')
    expect(parrafo).toHaveClass('whitespace-pre-line')
  })

  it('el informe destaca los rótulos del contenido de una recomendación', async () => {
    const { container } = montar(<InformeResultados />, '/resultados/diag-1')
    await screen.findAllByText('Qué hacer:')

    expect(within(container).getAllByText('Primeros pasos:').at(0)).toHaveClass('font-bold')
  })
})
