import { useEffect, useId, useRef, useState } from 'react'
import Aviso from './Aviso.jsx'
import { CLASE_ENTRADA } from './TarjetaPublica.jsx'

const BOTON = 'h-10 px-4 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'

// Ventana modal de la propia aplicación (reemplaza los cuadros del navegador).
// Se cierra con Escape o al pulsar fuera.
function Dialogo({ titulo, onCerrar, children }) {
  const idTitulo = useId()

  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-margin-mobile"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        aria-labelledby={idTitulo}
        aria-modal="true"
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md"
        role="dialog"
      >
        <h2 className="font-headline-md text-headline-md font-bold" id={idTitulo}>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

// Formulario de edición. `campos`: [{ nombre, etiqueta, valor, tipo?, min?, step?, maxLength?, requerido?,
// opciones?, deshabilitado?, visibleSi?, ayuda? }]. `tipo` puede ser 'textarea' (texto largo) o 'select'
// (con `opciones: [{ valor, texto }]`); `visibleSi(valores)` muestra el campo solo cuando aplica y
// `ayuda(valores)` devuelve una nota opcional bajo el campo.
// `onGuardar(valores)` devuelve true si todo salió bien (entonces se cierra); si
// no, la ventana sigue abierta y muestra `error`.
export function DialogoEdicion({ titulo, campos, error = '', onGuardar, onCerrar }) {
  const [valores, setValores] = useState(() => Object.fromEntries(campos.map((c) => [c.nombre, c.valor ?? ''])))
  const [guardando, setGuardando] = useState(false)
  const primero = useRef(null)
  const prefijo = useId()

  useEffect(() => {
    primero.current?.focus()
    primero.current?.select()
  }, [])

  async function enviar(e) {
    e.preventDefault()
    setGuardando(true)
    const ok = await onGuardar(valores)
    setGuardando(false)
    if (ok) onCerrar()
  }

  return (
    <Dialogo onCerrar={onCerrar} titulo={titulo}>
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        {campos.map((c, i) => (c.visibleSi && !c.visibleSi(valores) ? null : (
          <div className="flex flex-col gap-1" key={c.nombre}>
          <label className="flex flex-col gap-1 font-label-md text-label-md text-on-surface" htmlFor={`${prefijo}-${c.nombre}`}>
            {c.etiqueta}
            {c.tipo === 'select' ? (
              <select
                className={`${CLASE_ENTRADA} disabled:opacity-60`}
                aria-describedby={c.ayuda?.(valores) ? `${prefijo}-${c.nombre}-ayuda` : undefined}
                disabled={c.deshabilitado}
                id={`${prefijo}-${c.nombre}`}
                onChange={(e) => setValores({ ...valores, [c.nombre]: e.target.value })}
                ref={i === 0 ? primero : undefined}
                required={c.requerido}
                value={valores[c.nombre]}
              >
                {c.vacio && <option value="">{c.vacio}</option>}
                {c.opciones.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.texto}</option>
                ))}
              </select>
            ) : c.tipo === 'textarea' ? (
              <textarea
                className={`${CLASE_ENTRADA} h-auto py-3 resize-y`}
                id={`${prefijo}-${c.nombre}`}
                maxLength={c.maxLength}
                onChange={(e) => setValores({ ...valores, [c.nombre]: e.target.value })}
                ref={i === 0 ? primero : undefined}
                required={c.requerido}
                rows={6}
                value={valores[c.nombre]}
              />
            ) : (
              <input
                className={CLASE_ENTRADA}
                id={`${prefijo}-${c.nombre}`}
                maxLength={c.maxLength}
                min={c.min}
                step={c.step}
                onChange={(e) => setValores({ ...valores, [c.nombre]: e.target.value })}
                ref={i === 0 ? primero : undefined}
                required={c.requerido}
                type={c.tipo ?? 'text'}
                value={valores[c.nombre]}
              />
            )}
          </label>
          {c.ayuda?.(valores) && (
            <span className="font-body-sm text-body-sm text-on-surface-variant" id={`${prefijo}-${c.nombre}-ayuda`}>
              {c.ayuda(valores)}
            </span>
          )}
          </div>
        )))}
        <Aviso tipo="error">{error}</Aviso>
        <div className="flex justify-end gap-2">
          <button className={BOTON} onClick={onCerrar} type="button">Cancelar</button>
          <button className={BOTON_PRIMARIO} disabled={guardando} type="submit">
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

// Pregunta de confirmación antes de una acción que no se puede deshacer.
export function DialogoConfirmar({ titulo, mensaje, textoConfirmar = 'Confirmar', onConfirmar, onCerrar }) {
  const [trabajando, setTrabajando] = useState(false)

  async function confirmar() {
    setTrabajando(true)
    await onConfirmar()
    setTrabajando(false)
    onCerrar()
  }

  return (
    <Dialogo onCerrar={onCerrar} titulo={titulo}>
      <p className="font-body-md text-body-md text-on-surface-variant">{mensaje}</p>
      <div className="flex justify-end gap-2">
        <button className={BOTON} onClick={onCerrar} type="button">Cancelar</button>
        <button className={BOTON_PRIMARIO} disabled={trabajando} onClick={confirmar} type="button">
          {textoConfirmar}
        </button>
      </div>
    </Dialogo>
  )
}
