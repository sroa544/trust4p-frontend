import { useState } from 'react'
import { CLASE_ENTRADA } from './TarjetaPublica.jsx'

// Los cuatro ejes del marco teórico (RF-14) con su definición habitual: ni más
// ni menos. Si una versión se quedó sin alguno, se configura con estos valores.
export const EJES_ESTANDAR = [
  { codigo: 'extroversion', nombre: 'Extroversión', alto: ['E', 'Extrovertida'], bajo: ['I', 'Introvertida'] },
  { codigo: 'intuicion', nombre: 'Intuición', alto: ['N', 'Intuitiva'], bajo: ['S', 'Sensorial'] },
  { codigo: 'sentimiento', nombre: 'Sentimiento', alto: ['F', 'Sentimental'], bajo: ['T', 'Racional'] },
  { codigo: 'percepcion', nombre: 'Percepción', alto: ['P', 'Perceptiva'], bajo: ['J', 'Juiciosa'] },
]

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

function EjeNuevo({ estandar, modelo, alCrear }) {
  const [dimension, setDimension] = useState(modelo.dimensiones[0]?.codigo ?? '')
  const [umbral, setUmbral] = useState('62.5')
  const [polos, setPolos] = useState({
    altoCodigo: estandar.alto[0],
    altoNombre: estandar.alto[1],
    bajoCodigo: estandar.bajo[0],
    bajoNombre: estandar.bajo[1],
  })
  const poner = (campo) => (e) => setPolos({ ...polos, [campo]: e.target.value })

  function crear(e) {
    e.preventDefault()
    alCrear({
      codigo: estandar.codigo,
      nombre: estandar.nombre,
      dimension_codigo: dimension,
      umbral: String(umbral),
      polo_alto_codigo: polos.altoCodigo.trim(),
      polo_alto_nombre: polos.altoNombre.trim(),
      polo_bajo_codigo: polos.bajoCodigo.trim(),
      polo_bajo_nombre: polos.bajoNombre.trim(),
    })
  }

  return (
    <form aria-label={`Configurar eje ${estandar.nombre}`} className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3" onSubmit={crear}>
      <div>
        <h3 className="font-headline-sm text-headline-sm font-bold">{estandar.nombre}</h3>
        <p className="font-body-sm text-body-sm text-error" role="alert">
          Este eje no está configurado en la versión: configúrelo para poder publicar.
        </p>
      </div>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Dimensión que determina este eje
        <select className={CLASE_ENTRADA} onChange={(e) => setDimension(e.target.value)} required value={dimension}>
          {modelo.dimensiones.map((d) => (
            <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-label-md text-label-md">
        Umbral (puntaje de la dimensión)
        <input className={CLASE_ENTRADA} max={modelo.escala_max} min={modelo.escala_min} onChange={(e) => setUmbral(e.target.value)} required step="any" type="number" value={umbral} />
      </label>
      <div className="grid grid-cols-[1fr_3fr] gap-2">
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Código del polo alto
          <input className={CLASE_ENTRADA} maxLength={10} onChange={poner('altoCodigo')} required value={polos.altoCodigo} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Nombre del polo alto
          <input className={CLASE_ENTRADA} maxLength={200} onChange={poner('altoNombre')} required value={polos.altoNombre} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Código del polo bajo
          <input className={CLASE_ENTRADA} maxLength={10} onChange={poner('bajoCodigo')} required value={polos.bajoCodigo} />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Nombre del polo bajo
          <input className={CLASE_ENTRADA} maxLength={200} onChange={poner('bajoNombre')} required value={polos.bajoNombre} />
        </label>
      </div>
      <button className={`${BOTON_PRIMARIO} self-start`} type="submit">Configurar eje</button>
    </form>
  )
}

// RF-14: el perfil de cultura se calcula con cuatro ejes; cada uno se determina
// con la dimensión que el administrador le asigne. Así las dimensiones del
// modelo se pueden agregar, renombrar o reemplazar sin quedar atadas a las
// originales.
export default function EjesPerfilCultura({ modelo, editable, alGuardar, alCrear }) {
  const configurados = new Set(modelo.ejes_perfil_cultural.map((e) => e.codigo))
  const faltantes = editable ? EJES_ESTANDAR.filter((e) => !configurados.has(e.codigo)) : []
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
        {faltantes.map((estandar) => (
          <EjeNuevo alCrear={alCrear} estandar={estandar} key={`${modelo.id}-${estandar.codigo}`} modelo={modelo} />
        ))}
      </div>
    </section>
  )
}
