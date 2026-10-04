import { solicitar } from './api'

export const iniciarSesion = (correo, clave) =>
  solicitar('/auth/login', { metodo: 'POST', cuerpo: { correo, clave }, anunciarExpiracion: false })

export const cerrarSesion = () => solicitar('/mi-perfil/cerrar-sesion', { metodo: 'POST', anunciarExpiracion: false })

// 401 aquí significa "no hay sesión", no "la sesión expiró": no se anuncia.
export const obtenerPerfil = () => solicitar('/mi-perfil', { anunciarExpiracion: false })

export const actualizarPerfil = (datos) => solicitar('/mi-perfil', { metodo: 'PATCH', cuerpo: datos })

export const cambiarContrasena = (claveActual, claveNueva, confirmar) =>
  solicitar('/mi-perfil/cambiar-contrasena', {
    metodo: 'POST',
    cuerpo: { clave_actual: claveActual, clave_nueva: claveNueva, confirmar_clave: confirmar },
  })

export const eliminarMisDatos = () =>
  solicitar('/mi-perfil/eliminar', { metodo: 'POST', cuerpo: { confirmar: true } })

export const consultarInvitacion = (codigo) =>
  solicitar('/auth/invitacion', { consulta: { codigo }, anunciarExpiracion: false })

export const completarRegistro = ({ codigo, clave, nombres, apellidos, aceptoTratamiento }) =>
  solicitar('/auth/completar-registro', {
    metodo: 'POST',
    anunciarExpiracion: false,
    cuerpo: {
      codigo_token: codigo,
      clave,
      nombres,
      apellidos,
      acepto_tratamiento: aceptoTratamiento,
    },
  })

export const solicitarRestablecimiento = (correo) =>
  solicitar('/auth/solicitar-restablecimiento', {
    metodo: 'POST',
    cuerpo: { correo },
    anunciarExpiracion: false,
  })

export const restablecerContrasena = (codigo, claveNueva) =>
  solicitar('/auth/restablecer-contrasena', {
    metodo: 'POST',
    cuerpo: { codigo_token: codigo, clave_nueva: claveNueva },
    anunciarExpiracion: false,
  })
