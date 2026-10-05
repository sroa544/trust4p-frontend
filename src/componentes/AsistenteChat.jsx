import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Fab, StylesheetProvider, Webchat, useWebchat } from '@botpress/webchat'
import { useSesion } from '../hooks/useSesion'

const CLIENTE = import.meta.env.VITE_BOTPRESS_CLIENT_ID

const RUTAS_CON_ASISTENTE = [
  '/diagnostico',
  '/resultados',
  '/plan',
  '/historial',
  '/auditoria',
]

export default function AsistenteChat() {
  const { pathname } = useLocation()
  const { estado, perfil } = useSesion()

  const disponible = RUTAS_CON_ASISTENTE.some((ruta) => pathname.startsWith(ruta))

  if (!CLIENTE || !disponible) return null
  if (estado !== 'autenticado' || !perfil?.id) return null

  // Botpress guarda su identidad y su conversación bajo una clave de
  // localStorage que por defecto es la misma para todos ("bp-webchat"). Sin
  // separarla por usuario, dos cuentas que entren desde el mismo navegador
  // comparten el historial del asistente. Se usa el id del perfil y no el
  // correo para no dejar datos personales en el almacenamiento del navegador.
  const claveAlmacen = `bp-webchat-${perfil.id}`

  // La clave de React fuerza el desmontaje al cambiar de cuenta: sin ella el
  // componente conservaría en memoria la conversación de la sesión anterior.
  return <Asistente claveAlmacen={claveAlmacen} key={claveAlmacen} />
}

function Asistente({ claveAlmacen }) {
  const [abierto, setAbierto] = useState(false)
  const { on } = useWebchat({ clientId: CLIENTE, storageKey: claveAlmacen })

  useEffect(() => {
    if (!on) return undefined

    const cancelar = on('webchatVisibility', (visibilidad) => {
      if (visibilidad === 'hide') setAbierto(false)
      if (visibilidad === 'show') setAbierto(true)
      if (visibilidad === 'toggle') setAbierto((estado) => !estado)
    })

    return () => {
      if (typeof cancelar === 'function') cancelar()
    }
  }, [on])

  return (
    <>
      <StylesheetProvider
        color="#00465c"
        fontFamily="inter"
        themeMode="light"
        headerVariant="solid"
      />

      <Webchat
        clientId={CLIENTE}
        storageKey={claveAlmacen}
        style={{
          position: 'fixed',
          bottom: '92px',
          right: '20px',
          width: 'min(400px, calc(100vw - 40px))',
          height: 'min(600px, calc(100vh - 140px))',
          display: abierto ? 'flex' : 'none',
          zIndex: 50,
        }}
      />

      <Fab
        onClick={() => setAbierto((estado) => !estado)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          zIndex: 50,
        }}
      />
    </>
  )
}
