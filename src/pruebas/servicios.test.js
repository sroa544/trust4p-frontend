import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, mensajeDeError, solicitar, textoDeDetalle } from '../servicios/api'
import { estaRespondida, evaluarCondicion, indiceDeRetoma } from '../servicios/cuestionario'
import { dimensionesDelResultado, nivelDe, ordenarRecomendaciones } from '../servicios/resultados'
import { dividirNombre, evaluarClave, numero } from '../servicios/validaciones'
import { CUESTIONARIO, DIAGNOSTICO_EVALUADO } from './datos.js'

describe('cliente HTTP', () => {
  afterEach(() => vi.restoreAllMocks())

  it('envía la cookie de sesión y el cuerpo JSON', async () => {
    const fetchSimulado = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: 1 }) })
    vi.stubGlobal('fetch', fetchSimulado)

    await solicitar('/auth/login', { metodo: 'POST', cuerpo: { correo: 'a@b.co' } })

    const [url, opciones] = fetchSimulado.mock.calls[0]
    expect(url).toContain('/v1/auth/login')
    expect(opciones.credentials).toBe('include')
    expect(opciones.body).toBe('{"correo":"a@b.co"}')
  })

  it('traduce los errores de validación de FastAPI a un mensaje legible', () => {
    const detalle = [
      { loc: ['body', 'nit'], msg: 'Value error, El NIT debe ser numérico' },
      { loc: ['body', 'nombre_empresa'], msg: 'Field required' },
    ]
    expect(textoDeDetalle(detalle, 422)).toBe('NIT: El NIT debe ser numérico. Empresa: es obligatorio')
  })

  it('usa el mensaje del servidor cuando es un texto', () => {
    expect(textoDeDetalle('Credenciales inválidas', 401)).toBe('Credenciales inválidas')
  })

  it('anuncia la expiración de sesión ante un 401 salvo que se pida lo contrario', async () => {
    const escuchador = vi.fn()
    window.addEventListener('trust4p:sesion-expirada', escuchador)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: 'x' }) }))

    await expect(solicitar('/mi-perfil')).rejects.toBeInstanceOf(ErrorApi)
    expect(escuchador).toHaveBeenCalledTimes(1)

    await expect(solicitar('/mi-perfil', { anunciarExpiracion: false })).rejects.toBeInstanceOf(ErrorApi)
    expect(escuchador).toHaveBeenCalledTimes(1)
    window.removeEventListener('trust4p:sesion-expirada', escuchador)
  })

  it('un fallo de red produce un mensaje de conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fallo')))
    const error = await solicitar('/x').catch((e) => e)
    expect(mensajeDeError(error)).toMatch(/No se pudo conectar/)
  })
})

describe('validaciones de apoyo', () => {
  it('refleja la política de contraseña del backend (12 caracteres y 3 tipos)', () => {
    expect(evaluarClave('Corta1!').cumple).toBe(false)
    expect(evaluarClave('soloMinusculasLargas').cumple).toBe(false)
    expect(evaluarClave('Trust4P!2026Seguro').cumple).toBe(true)
  })

  it('divide nombres completos en nombres y apellidos', () => {
    expect(dividirNombre('Ana Pérez')).toEqual({ nombres: 'Ana', apellidos: 'Pérez' })
    expect(dividirNombre('Ana María Pérez Gómez')).toEqual({ nombres: 'Ana María', apellidos: 'Pérez Gómez' })
    expect(dividirNombre('Ana')).toEqual({ nombres: 'Ana', apellidos: '' })
  })

  it('formatea números sin ceros sobrantes', () => {
    expect(numero('75.0')).toBe('75')
    expect(numero('81.25')).toBe('81.3')
    expect(numero(null)).toBe('0')
    expect(numero('abc')).toBe('—')
  })
})

describe('lógica del cuestionario', () => {
  it('evalúa las condiciones de activación de preguntas', () => {
    const respuestas = { P1: { pregunta_codigo: 'P1', opciones_codigo: ['N3'] } }
    expect(evaluarCondicion({ pregunta_codigo: 'P1', operador: 'igual', valor: 'N3' }, respuestas)).toBe(true)
    expect(evaluarCondicion({ pregunta_codigo: 'P1', operador: 'diferente', valor: 'N3' }, respuestas)).toBe(false)
    expect(evaluarCondicion({ pregunta_codigo: 'P9', operador: 'igual', valor: 'N3' }, respuestas)).toBe(false)
  })

  it('reconoce preguntas respondidas por tipo y retoma en la primera pendiente', () => {
    const preguntas = [
      { codigo: 'A', tipo: 'seleccion_unica' },
      { codigo: 'B', tipo: 'texto_libre' },
    ]
    const diagnostico = { respuestas: [{ pregunta_codigo: 'A', opciones_codigo: ['N1'] }] }
    expect(estaRespondida(preguntas[0], diagnostico.respuestas[0])).toBe(true)
    expect(estaRespondida(preguntas[1], undefined)).toBe(false)
    expect(indiceDeRetoma(preguntas, diagnostico)).toBe(1)
  })
})

describe('preparación de resultados', () => {
  it('asigna el nivel de la rúbrica según el puntaje', () => {
    expect(nivelDe(10, CUESTIONARIO.niveles).numero).toBe(1)
    expect(nivelDe(62.5, CUESTIONARIO.niveles).numero).toBe(3)
    expect(nivelDe(100, CUESTIONARIO.niveles).numero).toBe(4)
  })

  it('une el resultado con los nombres de dimensión del cuestionario, en orden', () => {
    const dimensiones = dimensionesDelResultado(DIAGNOSTICO_EVALUADO, CUESTIONARIO)
    expect(dimensiones.map((d) => d.nombre)).toEqual(['Propósito', 'Procesos', 'Personas', 'Plataforma'])
    expect(dimensiones[1].nivel.numero).toBe(4)
    expect(dimensiones[3].observacion).toBeNull()
  })

  it('ordena las recomendaciones por prioridad y luego por fecha', () => {
    const ordenadas = ordenarRecomendaciones(DIAGNOSTICO_EVALUADO.recomendaciones)
    expect(ordenadas.map((r) => r.origen)).toEqual(['agente', 'consultor'])
  })
})
