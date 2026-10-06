// Versiones del modelo de madurez con la forma que entrega la API (RF-33/RF-34).

const DIMENSIONES = [
  { codigo: 'proposito', nombre: 'Propósito', descripcion: null, peso: '0.2500', orden: 1 },
  { codigo: 'procesos', nombre: 'Procesos', descripcion: null, peso: '0.2500', orden: 2 },
  { codigo: 'personas', nombre: 'Personas', descripcion: null, peso: '0.2500', orden: 3 },
  { codigo: 'plataforma', nombre: 'Plataforma', descripcion: null, peso: '0.2500', orden: 4 },
]

const EJES = [
  ['EJE-A', 'Orientación al cambio', 'A', 'Abierta', 'B', 'Conservadora', 'proposito'],
  ['EJE-B', 'Forma de decidir', 'C', 'Colaborativa', 'D', 'Jerárquica', 'procesos'],
  ['EJE-C', 'Relación con el talento', 'E', 'Empoderada', 'F', 'Controlada', 'personas'],
  ['EJE-D', 'Uso de la tecnología', 'G', 'Habilitadora', 'H', 'De soporte', 'plataforma'],
].map(([codigo, nombre, altoC, altoN, bajoC, bajoN, dimension]) => ({
  codigo,
  nombre,
  polo_alto_codigo: altoC,
  polo_alto_nombre: altoN,
  polo_bajo_codigo: bajoC,
  polo_bajo_nombre: bajoN,
  dimension_codigo: dimension,
  umbral: '50.0000',
}))

const PREGUNTAS = [
  {
    codigo: 'PROP-01',
    dimension_codigo: 'proposito',
    enunciado: '¿Existe una tesis de innovación formalizada?',
    ayuda: null,
    tipo: 'seleccion_unica',
    obligatoria: true,
    peso: '0.2500',
    en_demo: true,
    orden: 1,
    opciones: [],
    condicion: null,
    activo: true,
  },
]

export const MODELO_PUBLICADO = {
  id: 'm-1',
  version: '2026.1',
  nombre: 'Modelo Trust 4P',
  descripcion: null,
  escala_min: 0,
  escala_max: 100,
  publicado: true,
  dimensiones: DIMENSIONES,
  preguntas: PREGUNTAS,
  niveles: [],
  ejes_perfil_cultural: EJES,
}

export const MODELO_BORRADOR = { ...MODELO_PUBLICADO, id: 'm-2', version: '2026.2', publicado: false }
