export const NIVELES_MADUREZ = [
  { numero: 1, nombre: 'Inicial', desde: 0, hasta: 25 },
  { numero: 2, nombre: 'En desarrollo', desde: 26, hasta: 50 },
  { numero: 3, nombre: 'Sistemático', desde: 51, hasta: 75 },
  { numero: 4, nombre: 'Optimizado', desde: 76, hasta: 100 },
]

export const INFORME_RESULTADOS = {
  borrador: true,
  diagnosticoId: 'DIAG-2026-8842',
  empresaId: 'EMP-INNOVATECH-01',
  empresaNombre: 'InnovaTech Logistics Corp.',
  empresaNit: '900.842.119-4',
  modeloVersion: '0.1-borrador',
  fechaEmision: '24 de octubre de 2026',
  usuario: 'Alejandro Morales',
  iniciales: 'AM',
  cargo: 'Representante de empresa',
  indiceGlobal: 74,
  nivel: { numero: 3, nombre: 'Sistemático' },
  preguntasRespondidas: 16,
  preguntasTotales: 16,
  sintesis:
    'La organización muestra una base sólida en gobernanza y en la asignación sistemática de presupuestos por ciclos cortos. La brecha principal para alcanzar el nivel superior está en consolidar una infraestructura metodológica común en la dimensión Plataforma.',
  dimensiones: [
    {
      id: 'proposito',
      numero: 1,
      nombre: 'Propósito',
      subtitulo: 'Estrategia y dirección',
      puntaje: 30,
      nivel: 4,
      hallazgo:
        'Tesis de innovación ratificada por la junta directiva y vinculada a objetivos ejecutivos de crecimiento.',
      evidencia: 'Acta de directorio y declaración de gobernanza',
    },
    {
      id: 'procesos',
      numero: 2,
      nombre: 'Procesos',
      subtitulo: 'Embudos ágiles y presupuestos dinámicos',
      puntaje: 75,
      nivel: 3,
      hallazgo:
        'Comités trimestrales de reasignación presupuestaria activos, con criterios de salida definidos.',
      evidencia: 'Matriz de objetivos trimestrales y registro de hipótesis',
    },
    {
      id: 'personas',
      numero: 3,
      nombre: 'Personas',
      subtitulo: 'Cultura y liderazgo',
      puntaje: 70,
      nivel: 3,
      hallazgo:
        'Programas de intraemprendimiento consolidados, aunque los incentivos dependen de aprobaciones lineales.',
      evidencia: 'Encuesta de clima de innovación',
    },
    {
      id: 'plataforma',
      numero: 4,
      nombre: 'Plataforma',
      subtitulo: 'Tecnología y ecosistema',
      puntaje: 63,
      nivel: 2,
      hallazgo:
        'Herramientas dispersas y ausencia de un repositorio común de datos de validación.',
      evidencia: 'Inventario de herramientas digitales',
    },
  ],
  recomendaciones: [
    {
      id: 'REC-01',
      dimension: 'Plataforma',
      titulo: 'Centralizar la experimentación en una plataforma común',
      descripcion:
        'Consolidar los repositorios aislados en un espacio unificado para acelerar el descarte de hipótesis.',
      esfuerzoSemanas: 6,
      impacto: 'Alto',
      efecto: '+8 puntos en Plataforma',
    },
    {
      id: 'REC-02',
      dimension: 'Personas',
      titulo: 'Descentralizar los incentivos al aprendizaje',
      descripcion:
        'Vincular la compensación a la velocidad de aprendizaje validado y no solo al retorno de corto plazo.',
      esfuerzoSemanas: 4,
      impacto: 'Medio',
      efecto: '+5 puntos en Personas',
    },
    {
      id: 'REC-03',
      dimension: 'Procesos',
      titulo: 'Formalizar un fondo continuo de innovación',
      descripcion:
        'Asignar capital permanente para proyectos de horizonte largo aprobados por comités autónomos.',
      esfuerzoSemanas: 8,
      impacto: 'Estratégico',
      efecto: 'Habilita el nivel 4',
    },
  ],
}
