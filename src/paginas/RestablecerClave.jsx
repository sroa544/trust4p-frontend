import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import TarjetaPublica, { CLASE_BOTON, CLASE_ENTRADA, Campo } from '../componentes/TarjetaPublica.jsx'
import { mensajeDeError } from '../servicios/api'
import { restablecerContrasena } from '../servicios/autenticacion'
import { REGLAS_CLAVE, TEXTO_POLITICA_CLAVE, evaluarClave } from '../servicios/validaciones'

export default function RestablecerClave() {
  const [parametros] = useSearchParams()
  const codigo = parametros.get('codigo') ?? ''
  const [clave, setClave] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const navigate = useNavigate()
  const criterios = evaluarClave(clave)

  async function enviar(e) {
    e.preventDefault()
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await restablecerContrasena(codigo, clave)
      setListo(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  if (!codigo) {
    return (
      <TarjetaPublica titulo="Enlace no válido">
        <p className="font-body-md text-body-md text-on-surface-variant text-center">
          El enlace está incompleto. Solicite uno nuevo desde{' '}
          <Link className="text-primary font-semibold" to="/recuperar">Recuperar contraseña</Link>.
        </p>
      </TarjetaPublica>
    )
  }

  if (listo) {
    return (
      <TarjetaPublica titulo="Contraseña actualizada">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-5xl">check_circle</span>
          <p className="font-body-md text-body-md text-on-surface">
            Ya puede iniciar sesión con su nueva contraseña. Lo llevamos al inicio de sesión…
          </p>
        </div>
      </TarjetaPublica>
    )
  }

  return (
    <TarjetaPublica subtitulo={TEXTO_POLITICA_CLAVE} titulo="Nueva contraseña">
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <Campo etiqueta="Contraseña nueva" id="clave">
          <input
            autoComplete="new-password"
            className={CLASE_ENTRADA}
            id="clave"
            onChange={(e) => setClave(e.target.value)}
            required
            type="password"
            value={clave}
          />
        </Campo>
        <Campo etiqueta="Confirmar contraseña" id="confirmacion">
          <input
            autoComplete="new-password"
            className={CLASE_ENTRADA}
            id="confirmacion"
            onChange={(e) => setConfirmacion(e.target.value)}
            required
            type="password"
            value={confirmacion}
          />
        </Campo>
        <ul className="grid grid-cols-2 gap-1 font-body-sm text-[11px]">
          {REGLAS_CLAVE.map((regla) => (
            <li className={criterios[regla.clave] ? 'text-tertiary font-medium' : 'text-outline'} key={regla.clave}>
              {criterios[regla.clave] ? '✓' : '○'} {regla.texto}
            </li>
          ))}
        </ul>
        <Aviso tipo="error">{error}</Aviso>
        <button className={CLASE_BOTON} disabled={enviando} type="submit">
          {enviando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </TarjetaPublica>
  )
}
