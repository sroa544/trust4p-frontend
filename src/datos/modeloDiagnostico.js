export const ESCALA_BASE = [
  {
    nivel: 'N1',
    titulo: 'Inicial',
    puntaje: 25,
    descripcion: 'La práctica no existe o se ejecuta de forma reactiva y aislada.',
  },
  {
    nivel: 'N2',
    titulo: 'En desarrollo',
    puntaje: 50,
    descripcion: 'La práctica existe de manera parcial, sin periodicidad ni responsables definidos.',
  },
  {
    nivel: 'N3',
    titulo: 'Sistemático',
    puntaje: 75,
    descripcion: 'La práctica está formalizada, se ejecuta con periodicidad y produce evidencia verificable.',
  },
  {
    nivel: 'N4',
    titulo: 'Optimizado',
    puntaje: 100,
    descripcion: 'La práctica se mide, se compara y se ajusta de forma continua con base en resultados.',
  },
]

function pendiente(id) {
  return {
    id,
    borrador: true,
    enunciado: `Enunciado pendiente de definición (${id})`,
    guia: 'El banco de preguntas y su ponderación se definen en HU-029, HU-031 y HU-032.',
    opciones: ESCALA_BASE,
  }
}

export const MODELO_DIAGNOSTICO = {
  version: '0.1-borrador',
  borrador: true,
  dimensiones: [
    {
      id: 'proposito',
      numero: 1,
      nombre: 'Propósito',
      subtitulo: 'Estrategia y dirección',
      peso: 0.25,
      preguntas: [pendiente('PROP-01'), pendiente('PROP-02'), pendiente('PROP-03'), pendiente('PROP-04')],
    },
    {
      id: 'procesos',
      numero: 2,
      nombre: 'Procesos',
      subtitulo: 'Embudos ágiles y presupuestos dinámicos',
      peso: 0.25,
      preguntas: [
        {
          id: 'PROC-01',
          borrador: true,
          enunciado:
            '¿Con qué frecuencia su organización evalúa y reasigna presupuestos hacia iniciativas de innovación basadas en validación empírica?',
          guia: 'Considere el comportamiento real del capital y de los comités de aprobación durante los últimos doce meses frente a pivotes y experimentos validados.',
          opciones: [
            {
              nivel: 'N1',
              titulo: 'Asignación anual estática',
              puntaje: 25,
              descripcion:
                'El presupuesto se aprueba una vez al año y está ligado a silos funcionales, sin posibilidad de reasignación rápida.',
            },
            {
              nivel: 'N2',
              titulo: 'Revisión semestral',
              puntaje: 50,
              descripcion:
                'Comités semestrales revisan hitos, con ajustes menores y procesos burocráticos para redirigir fondos.',
            },
            {
              nivel: 'N3',
              titulo: 'Trimestral ágil',
              puntaje: 75,
              descripcion:
                'Ciclos de noventa días. Los equipos acceden a micro-fondos basados en evidencia y descartan hipótesis fallidas.',
            },
            {
              nivel: 'N4',
              titulo: 'Fondos continuos dinámicos',
              puntaje: 100,
              descripcion:
                'Gobernanza adaptativa continua. El capital fluye según tracción comprobable y aprendizaje validado.',
            },
          ],
        },
        pendiente('PROC-02'),
        pendiente('PROC-03'),
        pendiente('PROC-04'),
      ],
    },
    {
      id: 'personas',
      numero: 3,
      nombre: 'Personas',
      subtitulo: 'Cultura y liderazgo',
      peso: 0.25,
      preguntas: [pendiente('PERS-01'), pendiente('PERS-02'), pendiente('PERS-03'), pendiente('PERS-04')],
    },
    {
      id: 'plataforma',
      numero: 4,
      nombre: 'Plataforma',
      subtitulo: 'Tecnología y ecosistema',
      peso: 0.25,
      preguntas: [pendiente('PLAT-01'), pendiente('PLAT-02'), pendiente('PLAT-03'), pendiente('PLAT-04')],
    },
  ],
}