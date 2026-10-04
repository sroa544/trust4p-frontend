import { solicitar } from './api'

// Administración de usuarios, empresas, asignaciones y permisos (HU-025 a
// HU-028). Todas exigen rol administrador; el backend valida cada regla.

export const listarUsuarios = (filtros = {}) => solicitar('/usuarios', { consulta: filtros })

export const crearUsuario = (datos) =>
  solicitar('/usuarios', {
    metodo: 'POST',
    cuerpo: {
      correo: datos.correo.trim(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      rol_codigo: datos.rol,
      empresa_id: datos.rol === 'representante' ? datos.empresaId || null : null,
    },
  })

export const editarUsuario = (id, cambios) => solicitar(`/usuarios/${id}`, { metodo: 'PATCH', cuerpo: cambios })

export const desactivarUsuario = (id) => solicitar(`/usuarios/${id}/desactivar`, { metodo: 'POST' })

export const reactivarUsuario = (id) => solicitar(`/usuarios/${id}/reactivar`, { metodo: 'POST' })

export const desbloquearUsuario = (id) => solicitar(`/usuarios/${id}/desbloquear`, { metodo: 'POST' })

export const asignarEmpresa = (consultorId, empresaId) =>
  solicitar(`/usuarios/${consultorId}/asignaciones`, { metodo: 'POST', cuerpo: { empresa_id: empresaId } })

export const finalizarAsignacion = (consultorId, empresaId) =>
  solicitar(`/usuarios/${consultorId}/asignaciones/${empresaId}`, { metodo: 'DELETE' })

export const listarEmpresas = (filtros = {}) => solicitar('/empresas', { consulta: filtros })

export const crearEmpresa = (datos, sector) =>
  solicitar('/empresas', {
    metodo: 'POST',
    cuerpo: {
      nit: datos.nit.trim(),
      nombre: datos.nombre.trim(),
      sector_id: sector.id,
      sector_codigo: sector.codigo,
      sector_nombre: sector.nombre,
      numero_empleados: Number(datos.empleados),
      ciudad: datos.ciudad.trim() || null,
    },
  })

export const editarEmpresa = (id, cambios) => solicitar(`/empresas/${id}`, { metodo: 'PATCH', cuerpo: cambios })

export const desactivarEmpresa = (id) => solicitar(`/empresas/${id}/desactivar`, { metodo: 'POST' })

export const reactivarEmpresa = (id) => solicitar(`/empresas/${id}/reactivar`, { metodo: 'POST' })

export const listarRoles = () => solicitar('/roles')

export const listarPermisos = () => solicitar('/roles/permisos')

export const agregarPermiso = (rol, permiso) =>
  solicitar(`/roles/${rol}/permisos`, { metodo: 'POST', cuerpo: { codigo_permiso: permiso } })

export const quitarPermiso = (rol, permiso) => solicitar(`/roles/${rol}/permisos/${permiso}`, { metodo: 'DELETE' })
