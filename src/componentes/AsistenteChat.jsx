import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Fab, StylesheetProvider, Webchat, useWebchat } from '@botpress/webchat'

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

  const disponible = RUTAS_CON_ASISTENTE.some((ruta) => pathname.startsWith(ruta))

  if (!CLIENTE || !disponible) return null

  return <Asistente />
}

function Asistente() {
  const [abierto, setAbierto] = useState(false)
  const { on } = useWebchat({ clientId: CLIENTE })

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
