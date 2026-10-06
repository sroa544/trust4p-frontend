import { useState } from 'react'
import { CLASE_ENTRADA } from './TarjetaPublica.jsx'

const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

function Eje({ eje, modelo, editable, alGuardar }) {
  const [dimension, setDimension] = useState(eje.dimension_codigo)
  const [umbral, setUmbral] = useState(String(Number(eje.umbral)))
  const [polos, setPolos] = useState({ alto: eje.polo_alto_nombre, bajo: eje.polo_bajo_nombre })
  const existe = modelo.dimensiones.some((d) => d.codigo === eje.dimension_codigo)
  const cambios =
    dimension !== eje.dimension_codigo ||
    Number(umbral) !== Number(eje.umbral) ||
    polos.alto !== eje.polo_alto_nombre ||
    polos.bajo !== eje.polo_bajo_nombre

  function guardar(e) {
    e.preventDefault()
    alGuardar(eje.codigo, {
      dimension_codigo: dimension,
      umbral: String(umbral),
      polo_alto_nombre: polos.alto.trim(),
      polo_bajo_nombre: polos.bajo.trim(),
    })
  }

  return (
    <form aria-label={`Eje ${eje.nombre}`} className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3" onSubmit={guardar}>
      <div>
        <h3 className="font-headline-sm text-headline-sm font-bold">{eje.nombre}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Si el puntaje de la dimensión asociada es igual o mayor al umbral, la empresa se inclina al polo alto
          ({eje.polo_alto_codigo}); si no, al polo bajo ({eje.polo_bajo_codigo}).
        </p>
        {!existe && (
          <p className="font-body-sm text-body-sm text-error" role="alert">
            La dimensión «{eje.dimension_codigo}» ya no existe: elija otra antes de publicar.
          </p>
        )}
      </div>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Dimensión que determina este eje
        <select className={CLASE_ENTRADA} disabled={!editable} onChange={(e) => setDimension(e.target.value)} value={dimension}>
          {!existe && <option value={eje.dimension_codigo}>{eje.dimension_codigo} (inexistente)</option>}
          {modelo.dimensiones.map((d) => (
            <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Umbral (puntaje de la dimensión)
        <input
          className={CLASE_ENTRADA}
          disabled={!editable}
          max={modelo.escala_max}
          min={modelo.escala_min}
          onChange={(e) => setUmbral(e.target.value)}
          required
          step="any"
          type="number"
          value={umbral}
        />
      </label>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Nombre del polo alto
        <input className={CLASE_ENTRADA} disabled={!editable} maxLength={200} onChange={(e) => setPolos({ ...polos, alto: e.target.value })} required value={polos.alto} />
      </label>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Nombre del polo bajo
        <input className={CLASE_ENTRADA} disabled={!editable} maxLength={200} onChange={(e) => setPolos({ ...polos, bajo: e.target.value })} required value={polos.bajo} />
      </label>
      {editable && (
        <button className={`${BOTON_PRIMARIO} self-start`} disabled={!cambios} type="submit">Guardar eje</button>
      )}
    </form>
  )
}

// RF-14: el perfil de cultura se calcula con cuatro ejes; cada uno se determina
// con la dimensión que el administrador le asigne. Así las dimensiones del
// modelo se pueden agregar, renombrar o reemplazar sin quedar atadas a las
// originales.
export default function EjesPerfilCultura({ modelo, editable, alGuardar }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
      <h2 className="font-headline-md text-headline-md font-bold">Perfil de cultura</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
        Cada eje usa una dimensión para decidir hacia qué polo se inclina la empresa. Para quitar una dimensión que usa un
        eje, primero asigne ese eje a otra.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {modelo.ejes_perfil_cultural.map((eje) => (
          <Eje alGuardar={alGuardar} editable={editable} eje={eje} key={`${modelo.id}-${eje.codigo}-${eje.dimension_codigo}-${eje.umbral}`} modelo={modelo} />
        ))}
      </div>
    </section>
  )
}
