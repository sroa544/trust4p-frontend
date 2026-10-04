import { useState } from 'react'
import Aviso from '../componentes/Aviso.jsx'
import TarjetaPublica, { CLASE_BOTON, CLASE_ENTRADA, Campo } from '../componentes/TarjetaPublica.jsx'
import { mensajeDeError } from '../servicios/api'
import { solicitarRestablecimiento } from '../servicios/autenticacion'

export default function RecuperarClave() {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await solicitarRestablecimiento(correo.trim())
      setEnviado(true)
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <TarjetaPublica titulo="Revise su correo">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-5xl">mark_email_read</span>
          <p className="font-body-md text-body-md text-on-surface">
            Si el correo está registrado, le enviamos un enlace para restablecer su contraseña. El enlace vence en poco tiempo.
          </p>
        </div>
      </TarjetaPublica>
    )
  }

  return (
    <TarjetaPublica
      subtitulo="Escriba el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva."
      titulo="Recuperar contraseña"
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <Campo etiqueta="Correo corporativo" id="correo">
          <input
            autoComplete="email"
            className={CLASE_ENTRADA}
            id="correo"
            onChange={(e) => setCorreo(e.target.value)}
            required
            type="email"
            value={correo}
          />
        </Campo>
        <Aviso tipo="error">{error}</Aviso>
        <button className={CLASE_BOTON} disabled={enviando} type="submit">
          {enviando ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
    </TarjetaPublica>
  )
}
