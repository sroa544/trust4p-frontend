// Sesión y accesos por rol.
//
// El rol, el nombre y la empresa provienen de la API de negocio (GET
// /mi-perfil): aquí solo se traducen los códigos del backend a los actores
// documentados y se declara qué pantallas tiene cada uno.

export const ACTORES = [
  {
    id: 'A1',
    nombre: 'Visitante',
    definicion:
      'Persona no registrada que consulta la página pública, ejecuta el diagnóstico de demostración y radica solicitudes de acceso.',
  },
  {
    id: 'A2',
    nombre: 'Representante de empresa',
    definicion: 'Responde el diagnóstico y consulta los resultados de su organización.',
  },
  {
    id: 'A3',
    nombre: 'Consultor',
    definicion: 'Acompaña a las empresas clientes en su proceso de mejora.',
  },
  {
    id: 'A4',
    nombre: 'Administrador',
    definicion: 'Gobierna la configuración y el modelo de la plataforma.',
  },
]

// Código de rol del backend → actor documentado.
export const ACTOR_POR_ROL = {
  representante: 'A2',
  consultor: 'A3',
  administrador: 'A4',
}

export const ACCESOS = [
  {
    id: 'diagnostico',
    ruta: '/diagnostico',
    titulo: 'Cuestionario de diagnóstico',
    descripcion: 'Responder el instrumento de madurez de innovación por dimensiones.',
    icono: 'assignment',
    roles: ['A2'],
    historia: 'HU-008',
  },
  {
    id: 'resultados',
    ruta: '/resultados',
    titulo: 'Informe de resultados',
    descripcion: 'Índice global, nivel de madurez, perfil de cultura, lienzo y puntaje por dimensión.',
    icono: 'insights',
    roles: ['A2'],
    historia: 'HU-013, HU-018',
  },
  {
    id: 'plan',
    ruta: '/plan',
    titulo: 'Plan de mejora',
    descripcion: 'Recomendaciones del agente y de su consultor, por dimensión.',
    icono: 'route',
    roles: ['A2'],
    historia: 'HU-017',
  },
  {
    id: 'historial',
    ruta: '/historial',
    titulo: 'Evolución histórica',
    descripcion: 'Variación del índice y de cada dimensión entre diagnósticos.',
    icono: 'trending_up',
    roles: ['A2'],
    historia: 'HU-019',
  },
  {
    id: 'empresas-asignadas',
    ruta: '/consultoria',
    titulo: 'Empresas asignadas',
    descripcion: 'Empresas acompañadas con el estado y el nivel de su diagnóstico más reciente.',
    icono: 'apartment',
    roles: ['A3'],
    historia: 'HU-020, HU-021, HU-022, HU-024',
  },
  {
    id: 'indicadores',
    ruta: '/indicadores',
    titulo: 'Indicadores agregados',
    descripcion: 'Comportamiento del portafolio por sector, tamaño y nivel de madurez.',
    icono: 'leaderboard',
    roles: ['A3', 'A4'],
    historia: 'HU-023',
  },
  {
    id: 'gestion',
    ruta: '/gestion',
    titulo: 'Gestión y calibración',
    descripcion: 'Solicitudes de acceso, ponderación del modelo, banco de preguntas y simulación.',
    icono: 'tune',
    roles: ['A4'],
    historia: 'HU-002, HU-029, HU-031, HU-035',
  },
  {
    id: 'usuarios',
    ruta: '/usuarios',
    titulo: 'Usuarios, empresas y permisos',
    descripcion: 'Alta de usuarios y empresas, asignación de consultores y control de roles.',
    icono: 'manage_accounts',
    roles: ['A4'],
    historia: 'HU-025, HU-026, HU-027, HU-028',
  },
  {
    id: 'auditoria',
    ruta: '/auditoria',
    titulo: 'Auditoría',
    descripcion: 'Bitácora de acciones y ejecuciones del agente de evaluación.',
    icono: 'verified_user',
    roles: ['A4'],
    historia: 'HU-030, HU-037',
  },
  {
    id: 'perfil',
    ruta: '/perfil',
    titulo: 'Mi cuenta',
    descripcion: 'Datos de perfil, cambio de contraseña y eliminación de datos personales.',
    icono: 'account_circle',
    roles: ['A2', 'A3', 'A4'],
    historia: 'HU-006',
  },
]

export function actorDe(rolId) {
  return ACTORES.find((actor) => actor.id === rolId) ?? ACTORES[0]
}

export function accesosDe(rolId) {
  return ACCESOS.filter((acceso) => acceso.roles.includes(rolId))
}
