// Sesión y accesos por rol.
//
// Datos de demostración. Cuando exista la API de negocio, el rol y el nombre
// provienen del token de sesión y esta estructura se reemplaza por la
// respuesta del servicio de autenticación. El componente no cambia.
//
// El actor A1 (Visitante) se incluye en el selector para poder recorrer los
// cuatro roles en una demostración. En el sistema real no llega al panel,
// porque no tiene sesión iniciada.

export const ACTORES = [
  {
    id: 'A1',
    nombre: 'Visitante',
    definicion:
      'Persona no registrada que consulta la página pública, ejecuta el diagnóstico de demostración y radica solicitudes de acceso.',
    persona: 'Invitado',
  },
  {
    id: 'A2',
    nombre: 'Representante de empresa',
    definicion: 'Responde el diagnóstico y consulta los resultados de su organización.',
    persona: 'Alejandro Morales',
    organizacion: 'InnovaTech Logistics Corp.',
  },
  {
    id: 'A3',
    nombre: 'Consultor',
    definicion: 'Acompaña a las empresas clientes en su proceso de mejora.',
    persona: 'Julia Herrera',
    organizacion: 'Trust 4P',
  },
  {
    id: 'A4',
    nombre: 'Administrador',
    definicion: 'Gobierna la configuración y el modelo de la plataforma.',
    persona: 'Elena Rostova',
    organizacion: 'Trust 4P',
  },
]

export const ROL_INICIAL = 'A2'

export const ACCESOS = [
  {
    id: 'diagnostico',
    ruta: '/diagnostico',
    titulo: 'Cuestionario de diagnóstico',
    descripcion: 'Responder el instrumento de madurez de innovación por dimensiones.',
    icono: 'assignment',
    roles: ['A2'],
    historia: 'HU-008',
    estado: 'disponible',
  },
  {
    id: 'resultados',
    ruta: '/resultados/1',
    titulo: 'Informe de resultados',
    descripcion: 'Índice global, nivel de madurez y puntaje por cada dimensión.',
    icono: 'insights',
    roles: ['A2', 'A3'],
    historia: 'HU-013',
    estado: 'disponible',
  },
  {
    id: 'plan',
    ruta: '/plan/1',
    titulo: 'Plan de mejora',
    descripcion: 'Iniciativas priorizadas y proyección del índice.',
    icono: 'route',
    roles: ['A2', 'A3'],
    historia: 'HU-017',
    estado: 'disponible',
  },
  {
    id: 'historial',
    ruta: '/historial',
    titulo: 'Evolución histórica',
    descripcion: 'Variación del índice y de cada dimensión entre diagnósticos.',
    icono: 'trending_up',
    roles: ['A2', 'A3'],
    historia: 'HU-019',
    estado: 'disponible',
  },
  {
    id: 'solicitud',
    ruta: null,
    titulo: 'Solicitud de acceso',
    descripcion: 'Radicar la solicitud para que la consultora evalúe el ingreso de la empresa.',
    icono: 'how_to_reg',
    roles: ['A1'],
    historia: 'HU-001',
    estado: 'pendiente',
  },
  {
    id: 'demostracion',
    ruta: null,
    titulo: 'Diagnóstico de demostración',
    descripcion: 'Versión reducida del cuestionario para conocer el instrumento sin registrarse.',
    icono: 'quiz',
    roles: ['A1'],
    historia: 'HU-007',
    estado: 'pendiente',
  },
  {
    id: 'empresas',
    ruta: null,
    titulo: 'Empresas asignadas',
    descripcion: 'Listado de las empresas acompañadas con el estado de su diagnóstico.',
    icono: 'apartment',
    roles: ['A3'],
    historia: 'HU-020',
    estado: 'pendiente',
  },
  {
    id: 'respuestas',
    ruta: null,
    titulo: 'Detalle de respuestas',
    descripcion: 'Revisión de las respuestas de una empresa evaluada.',
    icono: 'fact_check',
    roles: ['A3'],
    historia: 'HU-021',
    estado: 'pendiente',
  },
  {
    id: 'indicadores',
    ruta: null,
    titulo: 'Indicadores agregados',
    descripcion: 'Comportamiento del portafolio de empresas acompañadas.',
    icono: 'leaderboard',
    roles: ['A3'],
    historia: 'HU-023',
    estado: 'pendiente',
  },
  {
    id: 'gestion',
    ruta: '/gestion',
    titulo: 'Gestión y calibración',
    descripcion: 'Solicitudes de acceso, ponderación del modelo y banco de preguntas.',
    icono: 'tune',
    roles: ['A4'],
    historia: 'HU-029, HU-031, HU-035',
    estado: 'disponible',
  },
  {
    id: 'auditoria',
    ruta: '/auditoria',
    titulo: 'Auditoría y evidencias',
    descripcion: 'Trazabilidad de las acciones y respaldo documental del diagnóstico.',
    icono: 'verified_user',
    roles: ['A4'],
    historia: 'HU-030, HU-037',
    estado: 'disponible',
  },
  {
    id: 'usuarios',
    ruta: null,
    titulo: 'Usuarios y permisos',
    descripcion: 'Alta de usuarios, asignación de consultores y control de roles.',
    icono: 'manage_accounts',
    roles: ['A4'],
    historia: 'HU-026, HU-027, HU-028',
    estado: 'pendiente',
  },
]

export function actorDe(rolId) {
  return ACTORES.find((actor) => actor.id === rolId) ?? ACTORES[0]
}

export function accesosDe(rolId) {
  return ACCESOS.filter((acceso) => acceso.roles.includes(rolId))
}
