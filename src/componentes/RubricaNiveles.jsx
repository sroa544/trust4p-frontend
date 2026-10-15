import { useState } from 'react'
import { DialogoConfirmar, DialogoEdicion } from './Dialogo.jsx'

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

// Mismas reglas que exige el servidor al publicar: la rúbrica cubre la escala
// completa, de principio a fin, sin huecos ni solapamientos.
export function problemasDeLaRubrica(niveles, escalaMin, escalaMax) {
  if (niveles.length === 0) return ['La versión no tiene niveles definidos.']
  const orden = [...niveles].sort((a, b) => Number(a.umbral_min) - Number(b.umbral_min))
  const problemas = []
  if (Number(orden[0].umbral_min) !== Number(escalaMin)) {
    problemas.push(`La rúbrica no cubre el inicio de la escala (${escalaMin}).`)
  }
  if (Number(orden[orden.length - 1].umbral_max) !== Number(escalaMax)) {
    problemas.push(`La rúbrica no cubre el final de la escala (${escalaMax}).`)
  }
  orden.slice(1).forEach((siguiente, i) => {
    const actual = orden[i]
    if (Number(actual.umbral_max) < Number(siguiente.umbral_min)) {
      problemas.push(`Hay un vacío entre el nivel ${actual.nivel} y el nivel ${siguiente.nivel}.`)
    } else if (Number(actual.umbral_max) > Number(siguiente.umbral_min)) {
      problemas.push(`Los niveles ${actual.nivel} y ${siguiente.nivel} tienen rangos solapados.`)
    }
  })
  return problemas
}

const rango = (n) => `${Number(n.umbral_min)} – ${Number(n.umbral_max)}`

// RF-32: escala de niveles de madurez de la versión. Se parte de los 10 niveles
// estándar y se ajusta; en una versión publicada solo se consulta. Cada
// operación devuelve true si se guardó.
export default function RubricaNiveles({ modelo, editable, error = '', alAplicarEstandar, alAgregar, alEditar, alQuitar }) {
  const [dialogo, setDialogo] = useState(null)
  const niveles = [...modelo.niveles].sort((a, b) => Number(a.umbral_min) - Number(b.umbral_min))
  const problemas = problemasDeLaRubrica(niveles, modelo.escala_min, modelo.escala_max)
  const cerrar = () => setDialogo(null)
  const siguienteNumero = niveles.reduce((m, n) => Math.max(m, n.nivel), 0) + 1
  const ultimoMaximo = niveles.length ? Number(niveles[niveles.length - 1].umbral_max) : Number(modelo.escala_min)

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Niveles de madurez</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            El índice global de una empresa cae en el nivel cuyo rango lo contiene; un valor justo en el límite
            pertenece al nivel inferior. {niveles.length} {niveles.length === 1 ? 'nivel' : 'niveles'} sobre una
            escala de {Number(modelo.escala_min)} a {Number(modelo.escala_max)}.
          </p>
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <button
              className={BOTON}
              onClick={() => (niveles.length ? setDialogo({ tipo: 'estandar' }) : alAplicarEstandar())}
              type="button"
            >
              Usar los 10 niveles estándar
            </button>
            <button className={BOTON_PRIMARIO} onClick={() => setDialogo({ tipo: 'agregar' })} type="button">
              Agregar nivel
            </button>
          </div>
        )}
      </div>

      {problemas.length > 0 && (
        <ul className="px-space-lg pb-3 font-body-sm text-body-sm text-error list-disc list-inside" data-testid="problemas-rubrica">
          {problemas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      {niveles.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
              <th className="py-3 px-4">Nivel</th>
              <th className="py-3 px-4">Nombre y descripción</th>
              <th className="py-3 px-4">Rango</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container align-top">
            {niveles.map((n) => (
              <tr key={n.nivel}>
                <td className="py-3 px-4 whitespace-nowrap font-label-lg text-label-lg font-bold">{n.nivel}</td>
                <td className="py-3 px-4">
                  <div className="font-label-lg text-label-lg font-bold">{n.nombre}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{n.descripcion}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">{rango(n)}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  {editable && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button aria-label={`Editar nivel ${n.nivel}`} className={BOTON} onClick={() => setDialogo({ tipo: 'editar', nivel: n })} type="button">Editar</button>
                      <button aria-label={`Quitar nivel ${n.nivel}`} className={BOTON} onClick={() => setDialogo({ tipo: 'quitar', nivel: n })} type="button">Quitar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialogo?.tipo === 'estandar' && (
        <DialogoConfirmar
          mensaje="Se reemplazan los niveles actuales por 10 niveles de igual amplitud sobre la escala. Después puede ajustar el nombre, la descripción y el rango de cada uno."
          onCerrar={cerrar}
          onConfirmar={alAplicarEstandar}
          textoConfirmar="Reemplazar"
          titulo="¿Usar los 10 niveles estándar?"
        />
      )}
      {dialogo?.tipo === 'agregar' && (
        <DialogoEdicion
          campos={[
            { nombre: 'numero', etiqueta: 'Número del nivel', valor: String(siguienteNumero), tipo: 'number', min: 1, requerido: true },
            { nombre: 'nombre', etiqueta: 'Nombre', valor: '', requerido: true, maxLength: 200 },
            { nombre: 'descripcion', etiqueta: 'Descripción', valor: '', tipo: 'textarea', requerido: true, maxLength: 1000 },
            { nombre: 'desde', etiqueta: 'Desde', valor: String(ultimoMaximo), tipo: 'number', step: 'any', requerido: true },
            { nombre: 'hasta', etiqueta: 'Hasta', valor: String(Number(modelo.escala_max)), tipo: 'number', step: 'any', requerido: true },
          ]}
          error={error}
          onCerrar={cerrar}
          onGuardar={(v) =>
            alAgregar({
              nivel: Number(v.numero),
              nombre: v.nombre.trim(),
              descripcion: v.descripcion.trim(),
              umbral_min: String(v.desde),
              umbral_max: String(v.hasta),
            })
          }
          titulo="Agregar un nivel"
        />
      )}
      {dialogo?.tipo === 'editar' && (
        <DialogoEdicion
          campos={[
            { nombre: 'nombre', etiqueta: 'Nombre', valor: dialogo.nivel.nombre, requerido: true, maxLength: 200 },
            { nombre: 'descripcion', etiqueta: 'Descripción', valor: dialogo.nivel.descripcion, tipo: 'textarea', requerido: true, maxLength: 1000 },
            { nombre: 'desde', etiqueta: 'Desde', valor: String(Number(dialogo.nivel.umbral_min)), tipo: 'number', step: 'any', requerido: true },
            { nombre: 'hasta', etiqueta: 'Hasta', valor: String(Number(dialogo.nivel.umbral_max)), tipo: 'number', step: 'any', requerido: true },
          ]}
          error={error}
          onCerrar={cerrar}
          onGuardar={(v) =>
            alEditar(dialogo.nivel.nivel, {
              nombre: v.nombre.trim(),
              descripcion: v.descripcion.trim(),
              umbral_min: String(v.desde),
              umbral_max: String(v.hasta),
            })
          }
          titulo={`Editar el nivel ${dialogo.nivel.nivel}`}
        />
      )}
      {dialogo?.tipo === 'quitar' && (
        <DialogoConfirmar
          mensaje="Al quitarlo, el rango que cubría queda sin nivel: ajuste los niveles vecinos para que la rúbrica cubra toda la escala antes de publicar."
          onCerrar={cerrar}
          onConfirmar={() => alQuitar(dialogo.nivel.nivel)}
          textoConfirmar="Quitar"
          titulo={`¿Quitar el nivel ${dialogo.nivel.nivel} (${dialogo.nivel.nombre})?`}
        />
      )}
    </section>
  )
}
