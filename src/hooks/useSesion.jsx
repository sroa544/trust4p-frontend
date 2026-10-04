import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ACTOR_POR_ROL, accesosDe, actorDe } from '../datos/sesion'
import { EVENTO_SESION_EXPIRADA } from '../servicios/api'
import {
  cerrarSesion as cerrarSesionApi,
  iniciarSesion as iniciarSesionApi,
  obtenerPerfil,
} from '../servicios/autenticacion'

// Estados: 'cargando' (aún no se sabe si hay sesión), 'anonimo', 'autenticado'.
const ContextoSesion = createContext(null)

export function SesionProvider({ children, perfilInicial = null }) {
  const [estado, setEstado] = useState(perfilInicial ? 'autenticado' : 'cargando')
  const [perfil, setPerfil] = useState(perfilInicial)

  const recargar = useCallback(async () => {
    try {
      const datos = await obtenerPerfil()
      setPerfil(datos)
      setEstado('autenticado')
      return datos
    } catch {
      setPerfil(null)
      setEstado('anonimo')
      return null
    }
  }, [])

  useEffect(() => {
    if (!perfilInicial) recargar()
  }, [perfilInicial, recargar])

  useEffect(() => {
    const expirar = () => {
      setPerfil(null)
      setEstado('anonimo')
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, expirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, expirar)
  }, [])

  const iniciarSesion = useCallback(
    async (correo, clave) => {
      await iniciarSesionApi(correo, clave)
      return recargar()
    },
    [recargar],
  )

  const cerrarSesion = useCallback(async () => {
    try {
      await cerrarSesionApi()
    } finally {
      setPerfil(null)
      setEstado('anonimo')
    }
  }, [])

  const valor = useMemo(() => {
    const rol = perfil ? ACTOR_POR_ROL[perfil.rol_codigo] ?? 'A1' : 'A1'
    const base = actorDe(rol)
    return {
      estado,
      perfil,
      rol,
      actor: {
        ...base,
        persona: perfil ? `${perfil.nombres} ${perfil.apellidos}`.trim() : 'Invitado',
        organizacion: perfil ? perfil.empresa_nombre ?? 'Trust 4P' : undefined,
      },
      accesos: accesosDe(rol),
      puede: (roles) => estado === 'autenticado' && roles.includes(rol),
      tienePermiso: (permiso) => Boolean(perfil?.permisos?.includes(permiso)),
      iniciarSesion,
      cerrarSesion,
      recargar,
    }
  }, [estado, perfil, iniciarSesion, cerrarSesion, recargar])

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}

export function useSesion() {
  const contexto = useContext(ContextoSesion)
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return contexto
}
