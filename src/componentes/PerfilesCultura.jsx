import { useState } from 'react'
import { DialogoConfirmar, DialogoEdicion } from './Dialogo.jsx'

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'

// RF-14: el cálculo del perfil sale de los cuatro ejes; aquí el administrador
// le pone nombre y descripción a cada combinación de polos. Si una combinación
// no está definida (o está desactivada), la descripción la redacta el agente.
// `alAgregar`, `alEditar` y `alQuitar` devuelven true si el cambio se guardó.
export default function PerfilesCultura({ modelo, editable, error = '', alAgregar, alEditar, alQuitar }) {
  const [dialogo, setDialogo] = useState(null)
  const combinaciones = modelo.combinaciones_perfil_cultural ?? []
  const definidos = new Map((modelo.perfiles_cultura ?? []).map((p) => [p.codigo, p]))
  const huerfanos = (modelo.perfiles_cultura ?? []).filter((p) => !combinaciones.includes(p.codigo))
  const filas = [...combinaciones.map((codigo) => ({ codigo, perfil: definidos.get(codigo) })), ...huerfanos.map((perfil) => ({ codigo: perfil.codigo, perfil, huerfano: true }))]
  const cerrar = () => setDialogo(null)

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <div className="p-space-lg">
        <h2 className="font-headline-md text-headline-md font-bold">Catálogo de perfiles de cultura</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Cada combinación de polos (según los ejes de arriba) puede tener un nombre y una descripción propios, que se
          muestran en el resultado y en el informe. Si no se define, la descripción la redacta el agente.
        </p>
        {modelo.ejes_perfil_cultural.length < 4 && (
          <p className="font-body-sm text-body-sm text-error mt-3">
            Configure los cuatro ejes del perfil de cultura: de sus polos salen los perfiles posibles.
          </p>
        )}
      </div>

      {filas.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps uppercase tracking-wider">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Perfil</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container align-top">
            {filas.map(({ codigo, perfil, huerfano }) => (
              <tr key={codigo}>
                <td className="py-3 px-4 whitespace-nowrap font-label-lg text-label-lg font-bold">{codigo}</td>
                <td className="py-3 px-4">
                  {perfil ? (
                    <>
                      <div className="font-label-lg text-label-lg font-bold">{perfil.nombre}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{perfil.descripcion}</div>
                      {huerfano && (
                        <div className="font-body-sm text-body-sm text-error" role="alert">
                          Ya no corresponde a los polos de los ejes: quítelo o vuelva a definirlo antes de publicar.
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-on-surface-variant">Sin definir: la descripción la redacta el agente.</span>
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">{perfil ? (perfil.activo ? 'Activo' : 'Inactivo') : '—'}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  {editable && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {perfil ? (
                        <>
                          <button aria-label={`Editar perfil ${codigo}`} className={BOTON} onClick={() => setDialogo({ tipo: 'editar', codigo, perfil })} type="button">Editar</button>
                          <button
                            aria-label={`${perfil.activo ? 'Desactivar' : 'Activar'} perfil ${codigo}`}
                            className={BOTON}
                            onClick={() => alEditar(codigo, { activo: !perfil.activo })}
                            type="button"
                          >
                            {perfil.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button aria-label={`Quitar perfil ${codigo}`} className={BOTON} onClick={() => setDialogo({ tipo: 'quitar', codigo, perfil })} type="button">Quitar</button>
                        </>
                      ) : (
                        <button aria-label={`Definir perfil ${codigo}`} className={BOTON} onClick={() => setDialogo({ tipo: 'definir', codigo })} type="button">Definir</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialogo?.tipo === 'definir' && (
        <DialogoEdicion
          campos={[
            { nombre: 'nombre', etiqueta: 'Nombre del perfil', valor: '', requerido: true, maxLength: 200 },
            { nombre: 'descripcion', etiqueta: 'Descripción', valor: '', tipo: 'textarea', requerido: true, maxLength: 2000 },
          ]}
          error={error}
          onCerrar={cerrar}
          onGuardar={(v) => alAgregar({ codigo: dialogo.codigo, nombre: v.nombre.trim(), descripcion: v.descripcion.trim() })}
          titulo={`Definir el perfil ${dialogo.codigo}`}
        />
      )}
      {dialogo?.tipo === 'editar' && (
        <DialogoEdicion
          campos={[
            { nombre: 'nombre', etiqueta: 'Nombre del perfil', valor: dialogo.perfil.nombre, requerido: true, maxLength: 200 },
            { nombre: 'descripcion', etiqueta: 'Descripción', valor: dialogo.perfil.descripcion, tipo: 'textarea', requerido: true, maxLength: 2000 },
          ]}
          error={error}
          onCerrar={cerrar}
          onGuardar={(v) => alEditar(dialogo.codigo, { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() })}
          titulo={`Editar el perfil ${dialogo.codigo}`}
        />
      )}
      {dialogo?.tipo === 'quitar' && (
        <DialogoConfirmar
          mensaje="Se elimina del catálogo de esta versión. Los resultados nuevos de esa combinación usarán la descripción que redacte el agente."
          onCerrar={cerrar}
          onConfirmar={() => alQuitar(dialogo.codigo)}
          textoConfirmar="Quitar"
          titulo={`¿Quitar el perfil ${dialogo.codigo} (${dialogo.perfil.nombre})?`}
        />
      )}
    </section>
  )
}
