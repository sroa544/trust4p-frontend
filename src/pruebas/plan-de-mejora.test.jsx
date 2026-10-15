import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RutaDeMejora from '../componentes/RutaDeMejora.jsx'
import ConsultoriaDiagnostico from '../paginas/ConsultoriaDiagnostico.jsx'
import { ErrorApi } from '../servicios/api'
import {
  agruparPorNivel,
  avanceDelSiguienteNivel,
  estaVencida,
  fechaLocal,
  formatearFechaLimite,
} from '../servicios/plan'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'

vi.mock('../servicios/consultoria', () => ({
  listarEmpresasAsignadas: vi.fn(),
  listarDiagnosticosDeEmpresa: vi.fn(),
  obtenerDiagnosticoAsignado: vi.fn(),
  obtenerCuestionarioAsignado: vi.fn(),
  registrarRecomendacion: vi.fn(),
  cerrarDiagnostico: vi.fn(),
  editarTarea: vi.fn(),
  avanzarNivel: vi.fn(),
}))

const consultoria = await import('../servicios/consultoria')

// Las recomendaciones son tareas con estado, fecha y nivel objetivo. El consultor
// las gestiona; la empresa las ve agrupadas por el nivel al que llevan.

const NIVELES = Array.from({ length: 10 }, (_, i) => ({
  numero: i + 1,
  nombre: `Nivel ${i + 1}`,
  descripcion: 'd',
  umbral_min: String(i * 10),
  umbral_max: String((i + 1) * 10),
}))
const CUESTIONARIO_10 = { ...CUESTIONARIO, niveles: NIVELES }

const tarea = (id, titulo, extra = {}) => ({
  id,
  origen: 'consultor',
  dimension_codigo: null,
  titulo,
  contenido: `Detalle de ${titulo}`,
  prioridad: null,
  visible: true,
  autor_id: 'c-1',
  autor_nombre: 'Julia Herrera',
  creado_en: '2026-09-03T10:00:00Z',
  estado: 'pendiente',
  fecha_limite: null,
  nivel_objetivo: 4,
  ...extra,
})

const diagnostico = (tareas, extra = {}) => ({
  ...DIAGNOSTICO_EVALUADO,
  resultado: { ...DIAGNOSTICO_EVALUADO.resultado, nivel: 3 },
  nivel_alcanzado: 3,
  avances_de_nivel: [],
  nuevo_diagnostico_recomendado: false,
  niveles_para_nuevo_diagnostico: 2,
  recomendaciones: tareas,
  ...extra,
})

// ---------- helpers ----------

describe('Plan de mejora: utilidades', () => {
  it('una fecha AAAA-MM-DD se muestra como ese mismo día, sin correrse por la zona horaria', () => {
    expect(fechaLocal('2026-12-01').getDate()).toBe(1)
    expect(formatearFechaLimite('2026-12-01')).toMatch(/1 de diciembre de 2026/)
    expect(formatearFechaLimite(null)).toBeNull()
  })

  it('una tarea vence cuando su fecha ya pasó y no está completada', () => {
    const hoy = new Date(2026, 11, 10)
    expect(estaVencida({ fecha_limite: '2026-12-09', estado: 'pendiente' }, hoy)).toBe(true)
    expect(estaVencida({ fecha_limite: '2026-12-10', estado: 'pendiente' }, hoy)).toBe(false)
    expect(estaVencida({ fecha_limite: '2026-12-09', estado: 'completada' }, hoy)).toBe(false)
    expect(estaVencida({ fecha_limite: null, estado: 'pendiente' }, hoy)).toBe(false)
  })

  it('agrupa por nivel objetivo y las tareas antiguas sin nivel van al siguiente del diagnóstico', () => {
    const d = diagnostico([
      tarea('1', 'A', { nivel_objetivo: 5, estado: 'completada' }),
      tarea('2', 'B', { nivel_objetivo: 4 }),
      tarea('3', 'Antigua', { nivel_objetivo: undefined, estado: 'completada' }),
    ])

    const grupos = agruparPorNivel(d)

    expect(grupos.map((g) => [g.nivel, g.total, g.completadas])).toEqual([
      [4, 2, 1],
      [5, 1, 1],
    ])
  })

  it('el avance al siguiente nivel cuenta solo las tareas compartidas', () => {
    const d = diagnostico([
      tarea('1', 'A', { estado: 'completada' }),
      tarea('2', 'B', { estado: 'pendiente' }),
      tarea('3', 'Borrador', { estado: 'pendiente', visible: false }),
    ])

    expect(avanceDelSiguienteNivel(d)).toEqual({ actual: 3, siguiente: 4, total: 2, completadas: 1 })
  })
})

// ---------- consultor ----------

function abrir(tareas, extra) {
  consultoria.obtenerDiagnosticoAsignado.mockResolvedValue(diagnostico(tareas, extra))
  consultoria.obtenerCuestionarioAsignado.mockResolvedValue(CUESTIONARIO_10)
  const usuario = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/consultoria/diagnosticos/diag-1']}>
      <Routes>
        <Route element={<ConsultoriaDiagnostico />} path="/consultoria/diagnosticos/:id" />
      </Routes>
    </MemoryRouter>,
  )
  return usuario
}

const plan = async () => (await screen.findByRole('heading', { name: 'Plan de mejora' })).closest('section')

beforeEach(() => {
  vi.clearAllMocks()
  consultoria.editarTarea.mockResolvedValue({})
  consultoria.avanzarNivel.mockResolvedValue({})
  consultoria.registrarRecomendacion.mockResolvedValue({})
})

describe('El consultor gestiona el plan de mejora', () => {
  it('muestra las tareas agrupadas por el nivel al que llevan, con estado y fecha', async () => {
    abrir([
      tarea('t1', 'Definir comité', { estado: 'en_curso', fecha_limite: '2099-12-01' }),
      tarea('t2', 'Medir resultados', { nivel_objetivo: 5 }),
    ])
    const seccion = within(await plan())

    expect(seccion.getByRole('heading', { name: 'Para llegar al nivel 4 · Nivel 4' })).toBeInTheDocument()
    expect(seccion.getByRole('heading', { name: 'Para llegar al nivel 5 · Nivel 5' })).toBeInTheDocument()
    const fila = seccion.getByText('Definir comité').closest('li')
    expect(within(fila).getAllByText('En curso').length).toBeGreaterThan(0)
    expect(within(fila).getByText(/Para el 1 de diciembre de 2099/)).toBeInTheDocument()
  })

  it('una tarea no compartida se marca como tal', async () => {
    abrir([tarea('t1', 'Borrador', { visible: false })])

    const fila = (await within(await plan()).findByText('Borrador')).closest('li')
    expect(within(fila).getByText('No compartida')).toBeInTheDocument()
  })

  it('cambia el estado de una tarea desde la lista', async () => {
    const usuario = abrir([tarea('t1', 'Definir comité')])
    const seccion = within(await plan())

    await usuario.selectOptions(seccion.getByLabelText('Estado de Definir comité'), 'completada')

    await waitFor(() => expect(consultoria.editarTarea).toHaveBeenCalledWith('diag-1', 't1', { estado: 'completada' }))
    expect(await screen.findByText(/Tarea «Definir comité»: completada/)).toBeInTheDocument()
    expect(consultoria.obtenerDiagnosticoAsignado).toHaveBeenCalledTimes(2) // recarga el plan
  })

  it('edita título, fecha y nivel enviando solo lo que cambió', async () => {
    const usuario = abrir([tarea('t1', 'Definir comité', { fecha_limite: '2099-12-01' })])
    await within(await plan()).findByText('Definir comité')

    await usuario.click(screen.getByRole('button', { name: 'Editar tarea Definir comité' }))
    const dialogo = screen.getByRole('dialog', { name: 'Editar tarea' })
    expect(within(dialogo).getByLabelText('Fecha límite (opcional)')).toHaveValue('2099-12-01')
    await usuario.clear(within(dialogo).getByLabelText('Título'))
    await usuario.type(within(dialogo).getByLabelText('Título'), 'Crear el comité')
    await usuario.clear(within(dialogo).getByLabelText('Nivel al que ayuda a llegar'))
    await usuario.type(within(dialogo).getByLabelText('Nivel al que ayuda a llegar'), '6')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(consultoria.editarTarea).toHaveBeenCalledWith('diag-1', 't1', { titulo: 'Crear el comité', nivel_objetivo: 6 }),
    )
  })

  it('quita la fecha límite enviando null', async () => {
    const usuario = abrir([tarea('t1', 'Definir comité', { fecha_limite: '2099-12-01' })])
    await within(await plan()).findByText('Definir comité')
    await usuario.click(screen.getByRole('button', { name: 'Editar tarea Definir comité' }))
    const dialogo = screen.getByRole('dialog')

    await usuario.clear(within(dialogo).getByLabelText('Fecha límite (opcional)'))
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(consultoria.editarTarea).toHaveBeenCalledWith('diag-1', 't1', { fecha_limite: null }))
  })

  it('si no se cambia nada, cierra sin llamar al servidor', async () => {
    const usuario = abrir([tarea('t1', 'Definir comité')])
    await within(await plan()).findByText('Definir comité')
    await usuario.click(screen.getByRole('button', { name: 'Editar tarea Definir comité' }))

    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(consultoria.editarTarea).not.toHaveBeenCalled()
  })

  it('si el servidor rechaza el cambio, el formulario sigue abierto con el motivo', async () => {
    consultoria.editarTarea.mockRejectedValue(new ErrorApi(400, 'El nivel objetivo no puede superar el nivel máximo (10)'))
    const usuario = abrir([tarea('t1', 'Definir comité')])
    await within(await plan()).findByText('Definir comité')
    await usuario.click(screen.getByRole('button', { name: 'Editar tarea Definir comité' }))
    const dialogo = screen.getByRole('dialog')
    await usuario.clear(within(dialogo).getByLabelText('Nivel al que ayuda a llegar'))
    await usuario.type(within(dialogo).getByLabelText('Nivel al que ayuda a llegar'), '9')

    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('no puede superar el nivel máximo')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('agrega una tarea con fecha y nivel, por defecto el siguiente de la empresa', async () => {
    const usuario = abrir([tarea('t1', 'Definir comité')])
    await within(await plan()).findByText('Definir comité')

    await usuario.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    const dialogo = screen.getByRole('dialog', { name: 'Agregar tarea' })
    expect(within(dialogo).getByLabelText('Nivel al que ayuda a llegar')).toHaveValue(4)
    await usuario.type(within(dialogo).getByLabelText('Título'), 'Capacitar al equipo')
    await usuario.type(within(dialogo).getByLabelText('Qué debe hacer la empresa'), 'Dos talleres')
    await usuario.type(within(dialogo).getByLabelText('Fecha límite (opcional)'), '2099-11-30')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(consultoria.registrarRecomendacion).toHaveBeenCalledWith('diag-1', {
        titulo: 'Capacitar al equipo',
        contenido: 'Dos talleres',
        dimension: '',
        visible: true,
        fecha_limite: '2099-11-30',
        nivel_objetivo: 4,
      }),
    )
  })

  it('no deja confirmar el nivel mientras falten tareas y dice cuántas', async () => {
    abrir([tarea('t1', 'A', { estado: 'completada' }), tarea('t2', 'B', { estado: 'en_curso' })])
    const avance = within((await within(await plan()).findByTestId('avance-de-nivel')))

    expect(avance.getByRole('button', { name: 'Confirmar que alcanzó el nivel 4' })).toBeDisabled()
    expect(avance.getByText(/1 de 2 tareas completadas para llegar al nivel 4 · Nivel 4/)).toBeInTheDocument()
    expect(avance.getByText(/Complete todas para poder confirmarlo/)).toBeInTheDocument()
  })

  it('sin tareas para el siguiente nivel pide agregar al menos una', async () => {
    abrir([tarea('t1', 'Futura', { nivel_objetivo: 6 })])
    const avance = within(await within(await plan()).findByTestId('avance-de-nivel'))

    expect(avance.getByRole('button', { name: 'Confirmar que alcanzó el nivel 4' })).toBeDisabled()
    expect(avance.getByText(/agregue al menos una/)).toBeInTheDocument()
  })

  it('con todas las tareas completadas confirma el nivel después de pedir confirmación', async () => {
    const usuario = abrir([tarea('t1', 'A', { estado: 'completada' }), tarea('t2', 'B', { estado: 'completada' })])
    const avance = within(await within(await plan()).findByTestId('avance-de-nivel'))

    await usuario.click(avance.getByRole('button', { name: 'Confirmar que alcanzó el nivel 4' }))
    const dialogo = screen.getByRole('dialog')
    expect(dialogo).toHaveTextContent('se avisa al representante')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))
    expect(consultoria.avanzarNivel).not.toHaveBeenCalled()

    await usuario.click(avance.getByRole('button', { name: 'Confirmar que alcanzó el nivel 4' }))
    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar nivel' }))

    await waitFor(() => expect(consultoria.avanzarNivel).toHaveBeenCalledWith('diag-1'))
    expect(await screen.findByText('La empresa alcanzó el nivel 4.')).toBeInTheDocument()
  })

  it('tras confirmar niveles muestra el historial y la tarea completada de un nivel alcanzado no se reabre', async () => {
    abrir([tarea('t1', 'Vieja', { estado: 'completada', nivel_objetivo: 4 }), tarea('t2', 'Nueva', { nivel_objetivo: 5 })], {
      nivel_alcanzado: 4,
      avances_de_nivel: [{ nivel: 4, alcanzado_en: '2026-10-05T10:00:00Z', consultor_nombre: 'Julia Herrera' }],
    })
    const seccion = within(await plan())

    expect(await seccion.findByText(/Nivel 4 · Nivel 4 confirmado el .* por Julia Herrera/)).toBeInTheDocument()
    expect(seccion.getByText(/Nivel alcanzado · 1 de 1 completadas/)).toBeInTheDocument()
    expect(seccion.getByLabelText('Estado de Vieja')).toBeDisabled()
    expect(seccion.getByLabelText('Estado de Nueva')).toBeEnabled()
  })

  it('con dos niveles de avance recomienda cerrar el diagnóstico para iniciar uno nuevo', async () => {
    abrir([tarea('t1', 'A', { nivel_objetivo: 6 })], { nivel_alcanzado: 5, nuevo_diagnostico_recomendado: true })

    expect(await screen.findByTestId('aviso-nuevo-diagnostico')).toHaveTextContent('avanzó 2 niveles')
    expect(screen.getByTestId('aviso-nuevo-diagnostico')).toHaveTextContent('cerrarlo')
  })

  it('en el nivel máximo de la rúbrica no ofrece confirmar más niveles', async () => {
    abrir([tarea('t1', 'A', { estado: 'completada', nivel_objetivo: 10 })], { nivel_alcanzado: 10 })
    const avance = within(await within(await plan()).findByTestId('avance-de-nivel'))

    expect(avance.getByText(/nivel máximo de la rúbrica/)).toBeInTheDocument()
    expect(avance.queryByRole('button', { name: /Confirmar que alcanzó/ })).not.toBeInTheDocument()
  })

  it('un diagnóstico fallido (sin resultado) conserva el formulario simple de recomendación', async () => {
    consultoria.obtenerDiagnosticoAsignado.mockResolvedValue({
      ...DIAGNOSTICO_EVALUADO,
      estado: 'fallido',
      resultado: null,
      recomendaciones: [],
    })
    consultoria.obtenerCuestionarioAsignado.mockResolvedValue(CUESTIONARIO_10)
    render(
      <MemoryRouter initialEntries={['/consultoria/diagnosticos/diag-1']}>
        <Routes>
          <Route element={<ConsultoriaDiagnostico />} path="/consultoria/diagnosticos/:id" />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Registrar una recomendación' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Plan de mejora' })).not.toBeInTheDocument()
  })
})

// ---------- empresa ----------

describe('La empresa ve su ruta de mejora', () => {
  const ver = (d) => render(<RutaDeMejora cuestionario={CUESTIONARIO_10} diagnostico={d} />)

  it('muestra el nivel actual y las tareas por nivel con su estado y fecha, sin controles de edición', () => {
    ver(
      diagnostico([
        tarea('t1', 'Definir comité', { estado: 'en_curso', fecha_limite: '2000-01-01' }),
        tarea('t2', 'Medir', { nivel_objetivo: 5, estado: 'completada' }),
      ]),
    )

    expect(screen.getByText('3 · Nivel 3')).toBeInTheDocument()
    const fila = screen.getByText('Definir comité').closest('li')
    expect(within(fila).getByText('En curso')).toBeInTheDocument()
    expect(within(fila).getByText(/Vencida · 1 de enero de 2000/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Para llegar al nivel 5 · Nivel 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('muestra el progreso de cada nivel', () => {
    ver(diagnostico([tarea('t1', 'A', { estado: 'completada' }), tarea('t2', 'B'), tarea('t3', 'C')]))

    expect(screen.getByText('1 de 3 completadas')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Progreso hacia el nivel 4' })).toBeInTheDocument()
  })

  it('tras avanzar muestra el nivel del diagnóstico y el de hoy, y marca como alcanzados los anteriores', () => {
    ver(
      diagnostico([tarea('t1', 'Vieja', { estado: 'completada' }), tarea('t2', 'Nueva', { nivel_objetivo: 5 })], {
        nivel_alcanzado: 4,
      }),
    )

    expect(screen.getByText('4 · Nivel 4')).toBeInTheDocument()
    expect(screen.getByText('Nivel del diagnóstico')).toBeInTheDocument()
    expect(screen.getByText(/Nivel alcanzado · 1 de 1 completadas/)).toBeInTheDocument()
  })

  it('con dos niveles de avance recomienda un nuevo diagnóstico', () => {
    ver(diagnostico([tarea('t1', 'A', { nivel_objetivo: 6 })], { nivel_alcanzado: 5, nuevo_diagnostico_recomendado: true }))

    expect(screen.getByTestId('aviso-nuevo-diagnostico')).toHaveTextContent('Se recomienda realizar uno nuevo')
    expect(screen.getByTestId('aviso-nuevo-diagnostico')).toHaveTextContent('cuando su consultor cierre este')
  })

  it('si el diagnóstico ya está cerrado, dice que ya puede iniciar uno nuevo', () => {
    ver(
      diagnostico([tarea('t1', 'A', { nivel_objetivo: 6 })], {
        estado: 'cerrado',
        nivel_alcanzado: 5,
        nuevo_diagnostico_recomendado: true,
      }),
    )

    expect(screen.getByTestId('aviso-nuevo-diagnostico')).toHaveTextContent('ya puede iniciarlo desde Diagnóstico')
    expect(screen.getByTestId('aviso-nuevo-diagnostico')).not.toHaveTextContent('cuando su consultor cierre')
  })

  it('un diagnóstico antiguo, sin estado ni nivel en sus recomendaciones, se ve como pendiente del siguiente nivel', () => {
    const antiguo = {
      ...DIAGNOSTICO_EVALUADO,
      resultado: { ...DIAGNOSTICO_EVALUADO.resultado, nivel: 3 },
    }
    ver(antiguo)

    expect(screen.getByRole('heading', { name: 'Para llegar al nivel 4 · Nivel 4' })).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
  })

  it('sin tareas no muestra la sección', () => {
    ver(diagnostico([]))

    expect(screen.queryByTestId('ruta-de-mejora')).not.toBeInTheDocument()
  })
})
