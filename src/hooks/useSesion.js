import { useSyncExternalStore } from 'react'
import { ROL_INICIAL, accesosDe, actorDe } from '../datos/sesion'

let rol = ROL_INICIAL
const oyentes = new Set()

function emitir() {
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

function leer() {
  return rol
}

export function cambiarRol(nuevo) {
  if (rol === nuevo) return
  rol = nuevo
  emitir()
}

export function useSesion() {
  const rolActual = useSyncExternalStore(suscribir, leer, leer)

  return {
    rol: rolActual,
    actor: actorDe(rolActual),
    accesos: accesosDe(rolActual),
    puede: (rutaRoles) => rutaRoles.includes(rolActual),
  }
}
