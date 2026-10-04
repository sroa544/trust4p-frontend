import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InformeResultados from '../paginas/InformeResultados.jsx'
import PlanEstrategico from '../paginas/PlanEstrategico.jsx'
import { ErrorApi } from '../servicios/api'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'

vi.mock('../servicios/diagnosticos', () => ({
  listarDiagnosticos: vi.fn(),
  obtenerDiagnostico: vi.fn(),
  obtenerCuestionario: vi.fn(),
  descargarInforme: vi.fn(),
}))

const servicios = await import('../servicios/diagnosticos')

// HU-014 Puntaje por dimensión
//
// CA-01 (camino principal)
//   Dado que existe un resultado generado
//   Cuando el representante consulta el detalle
//   Entonces el sistema presenta un puntaje por cada dimensión del modelo aplicado

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

describe('HU-014 · Puntaje por dimensión', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicios.obtenerDiagnostico.mockResolvedValue(DIAGNOSTICO_EVALUADO)
    servicios.obtenerCuestionario.mockResolvedValue(CUESTIONARIO)
  })

  it('CA-01 presenta un puntaje por cada dimensión del modelo aplicado', async () => {
    const { container } = montar(<InformeResultados />, '/resultados/diag-1')

    await screen.findByText(/Radar de madurez/i)
    CUESTIONARIO.dimensiones.forEach((dimension) => {
      const puntaje = DIAGNOSTICO_EVALUADO.resultado.dimensiones.find((d) => d.codigo === dimension.codigo).puntaje
      expect(container.textContent).toContain(`${dimension.nombre.toUpperCase()}: ${Number(puntaje)}`)
    })
  })

  it('CA-01 identifica la dimensión más fuerte y la más débil a partir de los puntajes', async () => {
    const { container } = montar(<InformeResultados />, '/resultados/diag-1')

    await screen.findByText(/Radar de madurez/i)
    expect(container.textContent).toContain('Mayor puntaje (81.3)')
    expect(container.textContent).toContain('Menor puntaje (40)')
  })

  it('muestra el origen y el autor de cada recomendación', async () => {
    montar(<InformeResultados />, '/resultados/diag-1')

    expect(await screen.findByText(/Registrada por el consultor · Julia Herrera/i)).toBeInTheDocument()
    expect(screen.getByText(/Generada por el agente/i)).toBeInTheDocument()
  })

  it('pide el diagnóstico y el cuestionario del id indicado', async () => {
    montar(<InformeResultados />, '/resultados/diag-1')

    await screen.findByText(/Radar de madurez/i)
    expect(servicios.obtenerDiagnostico).toHaveBeenCalledWith('diag-1')
    expect(servicios.obtenerCuestionario).toHaveBeenCalledWith('diag-1')
  })

  it('el plan de mejora clasifica cada dimensión según su nivel', async () => {
    montar(<PlanEstrategico />, '/plan/diag-1')

    expect(await screen.findByText('Estado y siguiente paso por dimensión')).toBeInTheDocument()
    // Procesos 81.3 → nivel 4 (máximo) = fortaleza; Personas 40 → nivel 2 = foco de mejora.
    expect(screen.getAllByText('Fortaleza')).toHaveLength(1)
    expect(screen.getAllByText('Foco de mejora').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Reconocer a los equipos/i)).toBeInTheDocument()
  })

  it('informa cuando la empresa todavía no tiene resultados', async () => {
    servicios.listarDiagnosticos.mockResolvedValue([])
    render(
      <MemoryRouter initialEntries={['/resultados']}>
        <Routes>
          <Route element={<InformeResultados />} path="/resultados" />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Aún no hay resultados/i)).toBeInTheDocument()
  })

  it('muestra el error del servidor si no se puede cargar el informe', async () => {
    servicios.obtenerDiagnostico.mockRejectedValue(new ErrorApi(403, 'Este diagnóstico no pertenece a su empresa'))
    montar(<InformeResultados />, '/resultados/diag-1')

    expect(await screen.findByText(/no pertenece a su empresa/i)).toBeInTheDocument()
  })
})
