import { useState } from 'react'
import { CLASE_ENTRADA } from './TarjetaPublica.jsx'

const TIPOS = [
  { valor: 'seleccion_unica', texto: 'Selección única' },
  { valor: 'seleccion_multiple', texto: 'Selección múltiple' },
  { valor: 'escala', texto: 'Escala' },
  { valor: 'numerica', texto: 'Numérica' },
  { valor: 'texto_libre', texto: 'Texto libre' },
]

const OPERADORES = [
  { valor: 'igual', texto: 'es igual a' },
  { valor: 'diferente', texto: 'es diferente de' },
  { valor: 'mayor_que', texto: 'es mayor que' },
  { valor: 'menor_que', texto: 'es menor que' },
  { valor: 'contiene', texto: 'contiene' },
]

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

export const esDeSeleccion = (tipo) => tipo === 'seleccion_unica' || tipo === 'seleccion_multiple'

function inicial(pregunta, modelo) {
  if (!pregunta) {
    const orden = Math.max(0, ...modelo.preguntas.map((p) => p.orden)) + 1
    return {
      codigo: '',
      dimension_codigo: modelo.dimensiones[0]?.codigo ?? '',
      enunciado: '',
      ayuda: '',
      tipo: 'seleccion_unica',
      obligatoria: true,
      peso: '',
      en_demo: false,
      orden: String(orden),
      opciones: [{ codigo: '', etiqueta: '', valor: '' }],
      conCondicion: false,
      condicion: { pregunta_codigo: '', operador: 'igual', valor: '' },
    }
  }
  return {
    codigo: pregunta.codigo,
    dimension_codigo: pregunta.dimension_codigo,
    enunciado: pregunta.enunciado,
    ayuda: pregunta.ayuda ?? '',
    tipo: pregunta.tipo,
    obligatoria: pregunta.obligatoria,
    peso: String(Number(pregunta.peso)),
    en_demo: pregunta.en_demo,
    orden: String(pregunta.orden),
    opciones: pregunta.opciones.map((o) => ({ codigo: o.codigo, etiqueta: o.etiqueta, valor: String(Number(o.valor)) })),
    conCondicion: false,
    condicion: { pregunta_codigo: '', operador: 'igual', valor: '' },
  }
}

// Cuerpo que espera la API: al crear va completo (incluida la condición de
// activación); al editar solo lo que la API permite cambiar.
export function cuerpoDePregunta(datos, { creando }) {
  const opciones = esDeSeleccion(datos.tipo)
    ? datos.opciones.map((o) => ({ codigo: o.codigo.trim(), etiqueta: o.etiqueta.trim(), valor: String(o.valor) }))
    : []
  const base = {
    dimension_codigo: datos.dimension_codigo,
    enunciado: datos.enunciado.trim(),
    ayuda: datos.ayuda.trim() || null,
    tipo: datos.tipo,
    obligatoria: datos.obligatoria,
    peso: String(datos.peso),
    en_demo: datos.en_demo,
    orden: Number(datos.orden),
    opciones,
  }
  if (!creando) return base
  return {
    ...base,
    codigo: datos.codigo.trim(),
    condicion: datos.conCondicion
      ? { pregunta_codigo: datos.condicion.pregunta_codigo, operador: datos.condicion.operador, valor: datos.condicion.valor.trim() }
      : null,
  }
}

// Alta y edición de una pregunta del banco (solo en versiones en borrador). Las
// reglas (pesos, opciones, condiciones) las valida el backend al guardar y al
// publicar; aquí solo se arma el formulario.
export default function FormularioPregunta({ modelo, pregunta = null, guardando = false, alGuardar, alCancelar }) {
  const creando = pregunta === null
  const [datos, setDatos] = useState(() => inicial(pregunta, modelo))
  const poner = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })
  const marcar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.checked })

  function cambiarOpcion(indice, campo, valor) {
    setDatos({ ...datos, opciones: datos.opciones.map((o, i) => (i === indice ? { ...o, [campo]: valor } : o)) })
  }

  function enviar(e) {
    e.preventDefault()
    alGuardar(cuerpoDePregunta(datos, { creando }), datos.codigo.trim())
  }

  return (
    <form aria-label="Formulario de pregunta" className="p-space-lg border-b border-surface-container" onSubmit={enviar}>
      <h3 className="font-headline-sm text-headline-sm font-bold">{creando ? 'Agregar pregunta' : `Editar pregunta ${pregunta.codigo}`}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
        Los pesos de las preguntas activas de cada dimensión deben sumar 1 al publicar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Código
          <input className={CLASE_ENTRADA} disabled={!creando} maxLength={50} onChange={poner('codigo')} placeholder="ej. PROP-05" required value={datos.codigo} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Dimensión
          <select className={CLASE_ENTRADA} onChange={poner('dimension_codigo')} required value={datos.dimension_codigo}>
            {modelo.dimensiones.map((d) => (
              <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Tipo de respuesta
          <select className={CLASE_ENTRADA} onChange={poner('tipo')} value={datos.tipo}>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>{t.texto}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Peso en su dimensión
          <input className={CLASE_ENTRADA} max="1" min="0" onChange={poner('peso')} required step="0.01" type="number" value={datos.peso} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md sm:col-span-2 lg:col-span-4">
          Enunciado
          <input className={CLASE_ENTRADA} maxLength={1000} onChange={poner('enunciado')} required value={datos.enunciado} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md sm:col-span-2 lg:col-span-4">
          Ayuda para quien responde (opcional)
          <input className={CLASE_ENTRADA} onChange={poner('ayuda')} value={datos.ayuda} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Orden
          <input className={CLASE_ENTRADA} min="1" onChange={poner('orden')} required type="number" value={datos.orden} />
        </label>
        <label className="flex items-center gap-2 font-body-md text-body-md self-end h-11">
          <input checked={datos.obligatoria} className="w-4 h-4 accent-primary" onChange={marcar('obligatoria')} type="checkbox" />
          Obligatoria
        </label>
        <label className="flex items-center gap-2 font-body-md text-body-md self-end h-11">
          <input checked={datos.en_demo} className="w-4 h-4 accent-primary" onChange={marcar('en_demo')} type="checkbox" />
          Incluir en la demostración
        </label>
      </div>

      {esDeSeleccion(datos.tipo) && (
        <fieldset className="mt-4 flex flex-col gap-2">
          <legend className="font-label-lg text-label-lg font-semibold mb-1">Opciones de respuesta</legend>
          {datos.opciones.map((o, i) => (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr_auto] gap-2 items-end" key={i}>
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Código de la opción {i + 1}
                <input className={CLASE_ENTRADA} onChange={(e) => cambiarOpcion(i, 'codigo', e.target.value)} placeholder="ej. N1" required value={o.codigo} />
              </label>
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Texto de la opción {i + 1}
                <input className={CLASE_ENTRADA} onChange={(e) => cambiarOpcion(i, 'etiqueta', e.target.value)} required value={o.etiqueta} />
              </label>
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Valor de la opción {i + 1}
                <input className={CLASE_ENTRADA} onChange={(e) => cambiarOpcion(i, 'valor', e.target.value)} required step="any" type="number" value={o.valor} />
              </label>
              <button
                aria-label={`Quitar la opción ${i + 1}`}
                className={BOTON}
                disabled={datos.opciones.length === 1}
                onClick={() => setDatos({ ...datos, opciones: datos.opciones.filter((_, j) => j !== i) })}
                type="button"
              >
                Quitar
              </button>
            </div>
          ))}
          <button className={`${BOTON} self-start`} onClick={() => setDatos({ ...datos, opciones: [...datos.opciones, { codigo: '', etiqueta: '', valor: '' }] })} type="button">
            Agregar opción
          </button>
        </fieldset>
      )}

      {creando && (
        <fieldset className="mt-4 flex flex-col gap-2">
          <label className="flex items-center gap-2 font-body-md text-body-md">
            <input checked={datos.conCondicion} className="w-4 h-4 accent-primary" onChange={marcar('conCondicion')} type="checkbox" />
            Mostrar solo si se respondió otra pregunta de cierta forma
          </label>
          {datos.conCondicion && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Pregunta de la que depende
                <select
                  className={CLASE_ENTRADA}
                  onChange={(e) => setDatos({ ...datos, condicion: { ...datos.condicion, pregunta_codigo: e.target.value } })}
                  required
                  value={datos.condicion.pregunta_codigo}
                >
                  <option value="">Seleccione…</option>
                  {modelo.preguntas.map((p) => (
                    <option key={p.codigo} value={p.codigo}>{p.codigo}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Condición
                <select className={CLASE_ENTRADA} onChange={(e) => setDatos({ ...datos, condicion: { ...datos.condicion, operador: e.target.value } })} value={datos.condicion.operador}>
                  {OPERADORES.map((o) => (
                    <option key={o.valor} value={o.valor}>{o.texto}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 font-label-md text-label-md">
                Valor
                <input className={CLASE_ENTRADA} onChange={(e) => setDatos({ ...datos, condicion: { ...datos.condicion, valor: e.target.value } })} required value={datos.condicion.valor} />
              </label>
            </div>
          )}
        </fieldset>
      )}

      <div className="flex gap-2 mt-4">
        <button className={BOTON_PRIMARIO} disabled={guardando} type="submit">{creando ? 'Agregar pregunta' : 'Guardar cambios'}</button>
        <button className={BOTON} onClick={alCancelar} type="button">Cancelar</button>
      </div>
    </form>
  )
}
