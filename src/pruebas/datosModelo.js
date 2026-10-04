// Versiones del modelo de madurez con la forma que entrega la API (RF-33/RF-34).

const DIMENSIONES = [
  { codigo: 'proposito', nombre: 'Propósito', descripcion: null, peso: '0.2500', orden: 1 },
  { codigo: 'procesos', nombre: 'Procesos', descripcion: null, peso: '0.2500', orden: 2 },
  { codigo: 'personas', nombre: 'Personas', descripcion: null, peso: '0.2500', orden: 3 },
  { codigo: 'plataforma', nombre: 'Plataforma', descripcion: null, peso: '0.2500', orden: 4 },
]

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
  ejes_perfil_cultural: [],
}

export const MODELO_BORRADOR = { ...MODELO_PUBLICADO, id: 'm-2', version: '2026.2', publicado: false }
