import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Aviso from '../componentes/Aviso.jsx'
import TarjetaPublica, { CLASE_BOTON, CLASE_ENTRADA, Campo } from '../componentes/TarjetaPublica.jsx'
import { mensajeDeError } from '../servicios/api'
import { listarSectores, radicarSolicitud } from '../servicios/solicitudes'

const INICIAL = {
  empresa: '',
  nit: '',
  sector: '',
  empleados: '',
  ciudad: '',
  nombre: '',
  cargo: '',
  correo: '',
  telefono: '',
  acepto: false,
}

export default function SolicitarAcceso() {
  const [datos, setDatos] = useState(INICIAL)
  const [sectores, setSectores] = useState([])
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [radicada, setRadicada] = useState(null)

  useEffect(() => {
    let activo = true
    listarSectores()
      .then((lista) => activo && setSectores(lista))
      .catch((falla) => activo && setError(mensajeDeError(falla)))
    return () => {
      activo = false
    }
  }, [])

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      setRadicada(await radicarSolicitud(datos))
    } catch (falla) {
      setError(mensajeDeError(falla))
    } finally {
      setEnviando(false)
    }
  }

  if (radicada) {
    return (
      <TarjetaPublica titulo="Solicitud radicada">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-5xl">mark_email_read</span>
          <p className="font-body-md text-body-md text-on-surface">
            Recibimos la solicitud de <strong>{radicada.nombre_empresa}</strong>. Un administrador la revisará y,
            si se aprueba, recibirá en {datos.correo} la invitación para activar su cuenta.
          </p>
          <span className="font-body-sm text-body-sm text-outline">Estado: {radicada.estado}</span>
        </div>
      </TarjetaPublica>
    )
  }

  return (
    <TarjetaPublica
      ancho="max-w-2xl"
      subtitulo="Cuéntenos sobre su empresa. Un administrador revisará la solicitud y le enviará una invitación por correo."
      titulo="Solicitar acceso para mi empresa"
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo etiqueta="Nombre de la empresa" id="empresa">
            <input className={CLASE_ENTRADA} id="empresa" onChange={cambiar('empresa')} required value={datos.empresa} />
          </Campo>
          <Campo ayuda="Con o sin dígito de verificación" etiqueta="NIT" id="nit">
            <input className={CLASE_ENTRADA} id="nit" onChange={cambiar('nit')} placeholder="900123456-7" required value={datos.nit} />
          </Campo>
          <Campo etiqueta="Sector" id="sector">
            <select className={CLASE_ENTRADA} id="sector" onChange={cambiar('sector')} required value={datos.sector}>
              <option value="">Seleccione…</option>
              {sectores.map((s) => (
                <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Número de empleados" id="empleados">
            <input className={CLASE_ENTRADA} id="empleados" min="1" onChange={cambiar('empleados')} required type="number" value={datos.empleados} />
          </Campo>
          <Campo etiqueta="Ciudad" id="ciudad" requerido={false}>
            <input className={CLASE_ENTRADA} id="ciudad" onChange={cambiar('ciudad')} value={datos.ciudad} />
          </Campo>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-variant">
          <Campo etiqueta="Su nombre completo" id="nombre">
            <input className={CLASE_ENTRADA} id="nombre" onChange={cambiar('nombre')} required value={datos.nombre} />
          </Campo>
          <Campo etiqueta="Cargo" id="cargo">
            <input className={CLASE_ENTRADA} id="cargo" onChange={cambiar('cargo')} required value={datos.cargo} />
          </Campo>
          <Campo etiqueta="Correo corporativo" id="correo">
            <input className={CLASE_ENTRADA} id="correo" onChange={cambiar('correo')} required type="email" value={datos.correo} />
          </Campo>
          <Campo etiqueta="Teléfono" id="telefono">
            <input className={CLASE_ENTRADA} id="telefono" onChange={cambiar('telefono')} placeholder="+57 300 123 4567" required type="tel" value={datos.telefono} />
          </Campo>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            checked={datos.acepto}
            className="mt-1 w-4 h-4 accent-primary"
            onChange={(e) => setDatos({ ...datos, acepto: e.target.checked })}
            required
            type="checkbox"
          />
          <span className="font-body-sm text-body-sm text-on-surface leading-relaxed">
            Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 para gestionar esta solicitud.
          </span>
        </label>

        <Aviso tipo="error">{error}</Aviso>

        <button className={CLASE_BOTON} disabled={enviando} type="submit">
          {enviando ? 'Enviando…' : 'Radicar solicitud'}
        </button>

        <p className="text-center font-body-sm text-body-sm text-outline">
          ¿Solo quiere conocer el modelo?{' '}
          <Link className="text-primary font-semibold" to="/demo">Pruebe el diagnóstico de demostración</Link>
        </p>
      </form>
    </TarjetaPublica>
  )
}
