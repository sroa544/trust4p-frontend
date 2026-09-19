// Configuración metodológica del modelo Trust 4P.
//
// Datos de demostración. La parametrización real (pilares, pesos, banco de
// preguntas y rúbricas) se define con el modelo validado en HU-029, HU-031 y
// HU-032. Cuando exista la API, este archivo se reemplaza por una llamada al
// servicio de configuración y la pantalla no cambia.

export const CONFIGURACION = {
  borrador: true,
  version: 'v2.4',
  marco: 'ISO 56002:2019',
  hash: '8f9c1...a4e7b',
  totalPreguntas: 16,
  totalPilares: 4,
  totalSubdimensiones: 8,
  ultimoGuardado: '12 de septiembre de 2026, 09:42',
  responsable: {
    iniciales: 'ER',
    nombre: 'Elena Rostova',
    cargo: 'Administradora metodológica',
  },
}

export const PILARES = [
  {
    id: 'p1',
    codigo: 'P1',
    nombre: 'Propósito y Gobernanza',
    corto: 'Propósito',
    descripcion:
      'Estrategia, asignación de recursos corporativos y tesis de innovación ejecutiva.',
    clausula: 'Cláusula ISO 5.1 y 5.2 — Tesis, liderazgo y comités',
    peso: 25,
    clases: {
      barra: 'bg-primary',
      punto: 'bg-primary',
      borde: 'bg-primary',
      texto: 'text-primary',
      chip: 'bg-primary/10 text-primary',
      campo: 'text-primary focus:ring-primary',
      control: 'accent-primary',
    },
  },
  {
    id: 'p2',
    codigo: 'P2',
    nombre: 'Procesos y Embudos',
    corto: 'Procesos',
    descripcion:
      'Metodologías ágiles, compuertas de decisión, experimentación empírica y ritmo.',
    clausula: 'Cláusula ISO 8.1 y 8.3 — Sprints, validación y stage-gate',
    peso: 25,
    clases: {
      barra: 'bg-secondary',
      punto: 'bg-secondary',
      borde: 'bg-secondary',
      texto: 'text-secondary',
      chip: 'bg-secondary-container/50 text-secondary',
      campo: 'text-secondary focus:ring-secondary',
      control: 'accent-secondary',
    },
  },
  {
    id: 'p3',
    codigo: 'P3',
    nombre: 'Personas y Cultura',
    corto: 'Personas',
    descripcion:
      'Alineación de talento, programas de incentivos y tolerancia operativa al error.',
    clausula: 'Cláusula ISO 7.2 y 7.3 — Competencias, incentivos y mentalidad',
    peso: 25,
    clases: {
      barra: 'bg-tertiary-fixed-dim',
      punto: 'bg-tertiary-fixed-dim',
      borde: 'bg-tertiary',
      texto: 'text-tertiary',
      chip: 'bg-tertiary-fixed/40 text-tertiary',
      campo: 'text-tertiary focus:ring-tertiary',
      control: 'accent-tertiary',
    },
  },
  {
    id: 'p4',
    codigo: 'P4',
    nombre: 'Plataforma y Herramientas',
    corto: 'Plataforma',
    descripcion:
      'Infraestructura tecnológica, repositorios de conocimiento, propiedad intelectual y suite analítica.',
    clausula: 'Cláusula ISO 7.1 y 7.5 — Infraestructura, repositorios y TRIZ',
    peso: 25,
    clases: {
      barra: 'bg-on-surface-variant',
      punto: 'bg-on-surface-variant',
      borde: 'bg-on-surface-variant',
      texto: 'text-on-surface-variant',
      chip: 'bg-surface-container text-on-surface-variant',
      campo: 'text-on-surface-variant focus:ring-outline',
      control: 'accent-outline',
    },
  },
]

export const SECTORES = [
  { clave: 'logistica', nombre: 'Cadena de suministro / Logística' },
  { clave: 'biotecnologia', nombre: 'Biotecnología y Salud' },
  { clave: 'fintech', nombre: 'Fintech y Servicios financieros' },
  { clave: 'alimentos', nombre: 'Alimentos y Agroindustria' },
]

export const ESCALAS = [
  { clave: 'pyme', nombre: 'Mediana (100 a 499 colaboradores)' },
  { clave: 'enterprise', nombre: 'Gran empresa (500 o más colaboradores)' },
]

export const SOLICITUDES = [
  {
    id: 'SOL-001',
    sigla: 'LA',
    razonSocial: 'LogiTrans Andina S.A.S.',
    nit: '900.842.119-4',
    ciudad: 'Bogotá, CO',
    sector: 'Cadena de suministro',
    sectorClave: 'logistica',
    colaboradores: 1200,
    escala: 'enterprise',
    solicitante: { nombre: 'Mariana Silva', cargo: 'VP de Transformación Digital' },
    modelo: 'Auditoría ISO 56002 completa',
    recibido: 'Hace 2 horas',
    documentos: { validados: 2, detalle: 'RUT y certificado de Cámara' },
    estado: 'pendiente',
    motivo: null,
    clases: {
      avatar: 'bg-primary-container text-on-primary-container',
      modelo: 'bg-primary/10 text-primary',
    },
  },
  {
    id: 'SOL-002',
    sigla: 'BF',
    razonSocial: 'BioFarma Labs Latam',
    nit: '830.124.992-1',
    ciudad: 'Medellín, CO',
    sector: 'Biotecnología y Salud',
    sectorClave: 'biotecnologia',
    colaboradores: 340,
    escala: 'pyme',
    solicitante: { nombre: 'Carlos Restrepo', cargo: 'Director de I+D corporativo' },
    modelo: 'Diagnóstico 4P exprés',
    recibido: 'Ayer, 16:40',
    documentos: { validados: 2, detalle: 'Firma del representante legal' },
    estado: 'pendiente',
    motivo: null,
    clases: {
      avatar: 'bg-secondary-container text-on-secondary-container',
      modelo: 'bg-secondary-container/50 text-secondary',
    },
  },
  {
    id: 'SOL-003',
    sigla: 'FN',
    razonSocial: 'Fintech Nova Sur',
    nit: '901.445.601-8',
    ciudad: 'Santiago, CL',
    sector: 'Fintech y Pagos',
    sectorClave: 'fintech',
    colaboradores: 480,
    escala: 'pyme',
    solicitante: { nombre: 'Valeria Montero', cargo: 'Directora de Innovación' },
    modelo: 'Auditoría ISO 56002 completa',
    recibido: 'Hace 2 días',
    documentos: { validados: 2, detalle: 'Documento de constitución' },
    estado: 'pendiente',
    motivo: null,
    clases: {
      avatar: 'bg-tertiary-fixed text-on-tertiary-fixed',
      modelo: 'bg-primary/10 text-primary',
    },
  },
  {
    id: 'SOL-004',
    sigla: 'AC',
    razonSocial: 'Alimentos del Caribe S.A.',
    nit: '890.301.782-9',
    ciudad: 'Barranquilla, CO',
    sector: 'Alimentos y consumo masivo',
    sectorClave: 'alimentos',
    colaboradores: 2850,
    escala: 'enterprise',
    solicitante: { nombre: 'Jorge Meza', cargo: 'Gerente de Nuevos Negocios' },
    modelo: 'Diagnóstico 4P exprés',
    recibido: 'Hace 3 días',
    documentos: { validados: 2, detalle: 'Estatutos y certificación' },
    estado: 'pendiente',
    motivo: null,
    clases: {
      avatar: 'bg-surface-variant text-on-surface-variant',
      modelo: 'bg-secondary-container/50 text-secondary',
    },
  },
]

export const BANCO_PREGUNTAS = [
  {
    id: 'P2.2',
    pilarId: 'p2',
    enunciado:
      '¿Con qué frecuencia su organización evalúa y reasigna presupuestos hacia iniciativas de innovación basadas en validación empírica?',
    clausula: 'Cláusula ISO 56002: 8.3 y 8.1 — Ciclos de asignación iterativa',
    subdimension: 'Embudos ágiles y presupuestos dinámicos',
    pesoPilar: 25,
    escala: 'N1 a N4',
    evidenciaObligatoria: true,
    activa: true,
  },
  {
    id: 'P1.1',
    pilarId: 'p1',
    enunciado:
      '¿Existe una tesis de innovación corporativa formalizada y aprobada por la junta directiva, alineada a horizontes H1, H2 y H3?',
    clausula: 'Cláusula ISO 56002: 5.1 — Liderazgo y compromiso estratégico',
    subdimension: 'Tesis y alineación estratégica',
    pesoPilar: 25,
    escala: 'N1 a N4',
    evidenciaObligatoria: true,
    activa: true,
  },
  {
    id: 'P3.1',
    pilarId: 'p3',
    enunciado:
      '¿Qué esquemas de reconocimiento e incentivos no salariales se aplican a los equipos que validan hipótesis fallidas de forma temprana?',
    clausula: 'Cláusula ISO 56002: 7.3 — Cultura de aprendizaje y tolerancia al error',
    subdimension: 'Incentivos y seguridad psicológica',
    pesoPilar: 25,
    escala: 'N1 a N4',
    evidenciaObligatoria: false,
    activa: true,
  },
  {
    id: 'P4.1',
    pilarId: 'p4',
    enunciado:
      '¿La organización cuenta con un repositorio centralizado de activos de innovación y con herramientas de vigilancia tecnológica?',
    clausula: 'Cláusula ISO 56002: 7.1 — Recursos de conocimiento e infraestructura',
    subdimension: 'Infraestructura digital y analítica',
    pesoPilar: 25,
    escala: 'N1 a N4',
    evidenciaObligatoria: true,
    activa: true,
  },
]

// Cohorte que usa el simulador: permite recalcular el índice global de
// diagnósticos ya cerrados con una ponderación distinta, sin inventar cifras.
export const COHORTE_DEMO = [
  {
    id: 'DIA-2026-031',
    empresa: 'LogiTrans Andina',
    puntajes: { p1: 78, p2: 64, p3: 71, p4: 55 },
  },
  {
    id: 'DIA-2026-028',
    empresa: 'BioFarma Labs',
    puntajes: { p1: 62, p2: 80, p3: 58, p4: 74 },
  },
  {
    id: 'DIA-2026-024',
    empresa: 'Fintech Nova Sur',
    puntajes: { p1: 88, p2: 75, p3: 70, p4: 63 },
  },
]

export const EVENTOS = [
  {
    id: 'EV-014',
    fecha: '12/09/2026 09:42',
    actor: 'E. Rostova',
    accion: 'Guardó la ponderación 25 / 25 / 25 / 25 y publicó el modelo v2.4.',
  },
  {
    id: 'EV-013',
    fecha: '10/09/2026 16:05',
    actor: 'E. Rostova',
    accion: 'Activó el reactivo P4.1 en el banco maestro de preguntas.',
  },
  {
    id: 'EV-012',
    fecha: '09/09/2026 11:20',
    actor: 'J. Herrera',
    accion: 'Habilitó el expediente de diagnóstico de Andes Retail Group.',
  },
  {
    id: 'EV-011',
    fecha: '05/09/2026 08:15',
    actor: 'E. Rostova',
    accion: 'Marcó como obligatoria la evidencia del reactivo P1.1.',
  },
]
