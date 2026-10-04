// Datos de apoyo para las pruebas: tienen la misma forma que entrega la API de
// negocio (diagnóstico evaluado y cuestionario de su versión del modelo).

export const CUESTIONARIO = {
  modelo_version: '2026.1',
  escala_min: 0,
  escala_max: 100,
  niveles: [
    { numero: 1, nombre: 'Inicial', descripcion: 'Sin práctica.', umbral_min: '0', umbral_max: '25' },
    { numero: 2, nombre: 'En desarrollo', descripcion: 'Parcial.', umbral_min: '25.01', umbral_max: '50' },
    { numero: 3, nombre: 'Sistemático', descripcion: 'Formalizada.', umbral_min: '50.01', umbral_max: '75' },
    { numero: 4, nombre: 'Optimizado', descripcion: 'Continua.', umbral_min: '75.01', umbral_max: '100' },
  ],
  dimensiones: [
    { codigo: 'proposito', nombre: 'Propósito', descripcion: 'Estrategia y dirección', orden: 1 },
    { codigo: 'procesos', nombre: 'Procesos', descripcion: 'Embudos ágiles', orden: 2 },
    { codigo: 'personas', nombre: 'Personas', descripcion: 'Cultura y liderazgo', orden: 3 },
    { codigo: 'plataforma', nombre: 'Plataforma', descripcion: 'Tecnología', orden: 4 },
  ],
  preguntas: [],
}

export const DIAGNOSTICO_EVALUADO = {
  id: 'diag-1',
  empresa_id: 'emp-1',
  empresa_nombre: 'Innovatech SAS',
  consecutivo: 3,
  estado: 'evaluado',
  respuestas: [],
  iniciado_en: '2026-09-01T10:00:00Z',
  completado_en: '2026-09-02T10:00:00Z',
  evaluado_en: '2026-09-02T10:01:00Z',
  resultado: {
    indice_global: '62.5',
    nivel: 3,
    nivel_descripcion: 'La práctica está formalizada.',
    dimensiones: [
      { codigo: 'proposito', puntaje: '75', observacion: 'Tesis formalizada.' },
      { codigo: 'procesos', puntaje: '81.3', observacion: 'Presupuesto dinámico.' },
      { codigo: 'personas', puntaje: '40', observacion: 'Poco reconocimiento.' },
      { codigo: 'plataforma', puntaje: '53.7', observacion: null },
    ],
    perfil_cultura: { codigo: 'ENEI', descripcion: 'Perfil exploratorio.' },
    lienzo_negocio: null,
    sintesis: 'Nivel sistemático con brechas en personas.',
  },
  recomendaciones: [
    {
      origen: 'agente',
      dimension_codigo: 'personas',
      titulo: 'Reconocer a los equipos',
      contenido: 'Definir un programa de reconocimiento.',
      prioridad: 1,
      visible: true,
      autor_id: null,
      autor_nombre: null,
      creado_en: '2026-09-02T10:01:00Z',
    },
    {
      origen: 'consultor',
      dimension_codigo: null,
      titulo: 'Formalizar el comité',
      contenido: 'Documentar actas y responsables.',
      prioridad: null,
      visible: true,
      autor_id: 'c-1',
      autor_nombre: 'Julia Herrera',
      creado_en: '2026-09-03T10:00:00Z',
    },
  ],
}

export const PERFIL_REPRESENTANTE = {
  id: 'u-1',
  correo: 'ana@innovatech.com',
  nombres: 'Ana',
  apellidos: 'Pérez',
  cargo: 'Directora',
  telefono: null,
  rol_codigo: 'representante',
  empresa_id: 'emp-1',
  empresa_nombre: 'Innovatech SAS',
  permisos: ['resultados.consultar'],
}
