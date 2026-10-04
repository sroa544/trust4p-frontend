import { solicitar } from './api'

// Público: catálogo de sectores para el formulario de solicitud (RF-01).
export const listarSectores = () => solicitar('/sectores', { anunciarExpiracion: false })

// Público: radica la solicitud de acceso de una empresa (HU-001).
export const radicarSolicitud = (datos) =>
  solicitar('/solicitudes-acceso', {
    metodo: 'POST',
    anunciarExpiracion: false,
    cuerpo: {
      nombre_empresa: datos.empresa.trim(),
      nit: datos.nit.trim(),
      sector_codigo: datos.sector,
      numero_empleados: Number(datos.empleados),
      ciudad: datos.ciudad.trim() || null,
      nombre_solicitante: datos.nombre.trim(),
      cargo: datos.cargo.trim(),
      correo_solicitante: datos.correo.trim(),
      telefono: datos.telefono.trim(),
      acepto_tratamiento: datos.acepto,
    },
  })

// Administración (HU-002).
export const listarSolicitudes = (estado) => solicitar('/solicitudes-acceso', { consulta: { estado } })

export const aprobarSolicitud = (id) => solicitar(`/solicitudes-acceso/${id}/aprobar`, { metodo: 'POST' })

export const rechazarSolicitud = (id, motivo) =>
  solicitar(`/solicitudes-acceso/${id}/rechazar`, { metodo: 'POST', cuerpo: { motivo } })
