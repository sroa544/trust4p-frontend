import { useEffect, useState } from 'react'

// Control de respuesta de una pregunta del banco, según su tipo (RF-07):
// selección única o múltiple, escala o valor numérico, y texto libre.
// Las opciones se guardan en cuanto se eligen; los campos de número y de texto
// se guardan al salir del campo (onBlur) o al pulsar "Guardar y continuar".
export default function EntradaPregunta({ pregunta, respuesta, onCambiar, deshabilitado, escala }) {
  const [valor, setValor] = useState('')
  const [texto, setTexto] = useState('')

  useEffect(() => {
    setValor(respuesta?.valor ?? '')
    setTexto(respuesta?.texto ?? '')
  }, [pregunta.codigo, respuesta?.valor, respuesta?.texto])

  const elegidas = respuesta?.opciones_codigo ?? []

  if (pregunta.tipo === 'seleccion_unica' || pregunta.tipo === 'seleccion_multiple') {
    const multiple = pregunta.tipo === 'seleccion_multiple'
    return (
      <fieldset className="flex flex-col gap-3 my-2" disabled={deshabilitado}>
        <legend className="sr-only">
          {multiple ? 'Seleccione todas las que apliquen' : 'Seleccione una opción'}
        </legend>
        {pregunta.opciones.map((opcion) => {
          const elegida = elegidas.includes(opcion.codigo)
          return (
            <label
              className={`relative flex items-start p-4 rounded-xl cursor-pointer transition-all ${
                elegida
                  ? 'bg-primary/5 shadow-md'
                  : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
              }`}
              key={opcion.codigo}
            >
              {elegida && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
              )}
              <input
                checked={elegida}
                className="mt-1 h-4 w-4 accent-primary"
                name={`respuesta-${pregunta.codigo}`}
                onChange={() => {
                  if (multiple) {
                    const nuevas = elegida
                      ? elegidas.filter((c) => c !== opcion.codigo)
                      : [...elegidas, opcion.codigo]
                    onCambiar({ opciones_codigo: nuevas })
                  } else {
                    onCambiar({ opciones_codigo: [opcion.codigo] })
                  }
                }}
                type={multiple ? 'checkbox' : 'radio'}
                value={opcion.codigo}
              />
              <div className="ml-3.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`font-headline-sm text-headline-sm font-bold ${
                      elegida ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {opcion.codigo}
                  </span>
                  <span
                    className={`font-label-caps text-label-caps font-bold ${
                      elegida
                        ? 'bg-primary text-on-primary px-2.5 py-0.5 rounded-full'
                        : 'text-outline bg-surface-container px-2 py-0.5 rounded'
                    }`}
                  >
                    {Number(opcion.valor)} pts
                  </span>
                </div>
                <p
                  className={`font-body-md text-body-md mt-1 ${
                    elegida ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  {opcion.etiqueta}
                </p>
              </div>
            </label>
          )
        })}
      </fieldset>
    )
  }

  if (pregunta.tipo === 'escala' || pregunta.tipo === 'numerica') {
    return (
      <div className="flex flex-col gap-1.5 my-2">
        <label className="font-label-lg text-label-lg text-on-surface font-semibold" htmlFor={`valor-${pregunta.codigo}`}>
          Su respuesta{escala ? ` (entre ${escala.min} y ${escala.max})` : ''}
        </label>
        <input
          className="w-40 h-11 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={deshabilitado}
          id={`valor-${pregunta.codigo}`}
          max={escala?.max}
          min={escala?.min}
          onBlur={() => valor !== '' && onCambiar({ valor: Number(valor) })}
          onChange={(e) => setValor(e.target.value)}
          step="any"
          type="number"
          value={valor}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 my-2">
      <label className="font-label-lg text-label-lg text-on-surface font-semibold" htmlFor={`texto-${pregunta.codigo}`}>
        Su respuesta
      </label>
      <textarea
        className="w-full rounded-lg bg-surface-container-low p-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y"
        disabled={deshabilitado}
        id={`texto-${pregunta.codigo}`}
        maxLength={2000}
        onBlur={() => texto.trim() && onCambiar({ texto: texto.trim() })}
        onChange={(e) => setTexto(e.target.value)}
        rows="4"
        value={texto}
      />
    </div>
  )
}
