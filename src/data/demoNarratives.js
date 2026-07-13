/**
 * Demo: Narrativas comunitarias parametrizadas
 *
 * Cada narrativa se descompone en bloques significantes ("tokens").
 * Los bloques editables tienen un tipo semántico (con su tonalidad de color)
 * y una lista de variantes propuestas por la comunidad. La variante con
 * mayor relevancia (votos) es la que se muestra como texto vigente.
 *
 * Los bloques fijos ({ text }) son conectores no editables.
 */

export const TOKEN_TYPES = {
  sujeto: { label: 'Sujeto', color: '#64b5f6' },
  accion: { label: 'Acción', color: '#81c784' },
  objeto: { label: 'Objeto', color: '#ffb74d' },
  condicion: { label: 'Condición', color: '#ba68c8' },
  valor: { label: 'Valor / Criterio', color: '#4dd0e1' },
  consecuencia: { label: 'Consecuencia', color: '#e57373' },
}

// Rama demo que se inyecta en la nube de palabras (no vive en Supabase)
export const DEMO_BRANCH = {
  id: 'demo-leyes',
  label: 'Leyes y Reglamentos',
  color: '#c9a227',
  topics: [
    { id: 'demo-leyes-agua', label: 'Uso del Agua', narrativeId: 'agua' },
    { id: 'demo-leyes-convivencia', label: 'Convivencia', narrativeId: 'convivencia' },
    { id: 'demo-leyes-prestamos', label: 'Préstamos Comunitarios', narrativeId: 'prestamos' },
  ],
}

export const NARRATIVES = {
  agua: {
    id: 'agua',
    title: 'Uso del Agua',
    category: 'Leyes y Reglamentos',
    intro: 'Narrativa comunitaria sobre el uso del agua de la red comunal. Clickeá un bloque de color para ver, votar o proponer variantes.',
    blocks: [
      {
        id: 'agua-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'Cada miembro de la comunidad', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'Toda persona que habite la célula', votes: 2, author: 'Josu' },
          { id: 'v3', text: 'Cada unidad familiar', votes: 1, author: 'Rocío' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'podrá utilizar', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'tendrá derecho a usar', votes: 2, author: 'Teo' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-objeto',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'el agua de la red comunal', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'el agua potable y de riego', votes: 1, author: 'Marcos' },
        ],
      },
      { text: ' para ' },
      {
        id: 'agua-uso',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'consumo doméstico y riego de huertas familiares', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'cualquier uso que no perjudique a otros miembros', votes: 1, author: 'Teo' },
        ],
      },
      { text: ', ' },
      {
        id: 'agua-limite',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'siempre que no exceda los 200 litros diarios por persona', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'siempre que no exceda los 150 litros diarios por persona', votes: 2, author: 'Ana' },
          { id: 'v3', text: 'sin límite fijo, según acuerdo entre vecinos', votes: 0, author: 'Josu' },
        ],
      },
      { text: '. ' },
      {
        id: 'agua-sequia',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'En épocas de sequía', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'Cuando el nivel del acuífero baje del 40%', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', ' },
      {
        id: 'agua-autoridad',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'el Consejo de la Célula', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'la asamblea de miembros', votes: 2, author: 'Rocío' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-reduccion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'podrá reducir este límite', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'deberá reducir este límite', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', priorizando ' },
      {
        id: 'agua-prioridad',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'el consumo humano y la producción de alimentos', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'el consumo humano por encima de todo otro uso', votes: 2, author: 'Josu' },
        ],
      },
      { text: '. ' },
      {
        id: 'agua-sancion',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'Quien exceda los límites deberá compensar a la comunidad con horas de trabajo en la infraestructura hídrica', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'Quien exceda los límites pagará una tarifa progresiva al fondo común', votes: 2, author: 'Marcos' },
          { id: 'v3', text: 'Los excesos se tratarán en asamblea, caso por caso', votes: 1, author: 'Josu' },
        ],
      },
      { text: '.' },
    ],
  },

  convivencia: {
    id: 'convivencia',
    title: 'Convivencia',
    category: 'Leyes y Reglamentos',
    intro: 'Acuerdo de convivencia sonora narrado por la comunidad. Cada bloque de color es una pieza que puede evolucionar.',
    blocks: [
      {
        id: 'conv-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'Todas las personas de la célula', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'Miembros y visitantes', votes: 2, author: 'Teo' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'se comprometen a mantener', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'deberán mantener', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-objeto',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'niveles de sonido razonables', votes: 3, author: 'Josu' },
          { id: 'v2', text: 'silencio en las áreas comunes', votes: 1, author: 'Marcos' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-horario',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'entre las 22:00 y las 07:00', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'entre las 23:00 y las 08:00', votes: 2, author: 'Teo' },
        ],
      },
      { text: '. ' },
      {
        id: 'conv-excepcion',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'Para celebraciones comunitarias', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'Con aviso previo de 48 horas', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', ' },
      {
        id: 'conv-extension',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'podrá extenderse el horario', votes: 3, author: 'Josu' },
          { id: 'v2', text: 'se acordará una excepción en asamblea', votes: 2, author: 'Ana' },
        ],
      },
      { text: '. ' },
      {
        id: 'conv-conflicto',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'Los conflictos se resolverán primero en diálogo directo y luego en círculo de mediación', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'Los conflictos pasarán directamente al círculo de mediación', votes: 1, author: 'Teo' },
        ],
      },
      { text: '.' },
    ],
  },

  prestamos: {
    id: 'prestamos',
    title: 'Préstamos Comunitarios',
    category: 'Leyes y Reglamentos',
    intro: 'Reglamento del fondo común narrado colectivamente. Votá o proponé variantes sobre cada bloque significante.',
    blocks: [
      {
        id: 'prest-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'El fondo común de la célula', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'La tesorería comunitaria', votes: 2, author: 'Ana' },
        ],
      },
      { text: ' ' },
      {
        id: 'prest-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'podrá otorgar préstamos', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'otorgará préstamos', votes: 1, author: 'Josu' },
        ],
      },
      { text: ' ' },
      {
        id: 'prest-destino',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'a proyectos productivos de sus miembros', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'a cualquier miembro que lo solicite', votes: 1, author: 'Josu' },
        ],
      },
      { text: ', ' },
      {
        id: 'prest-condicion',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'cuando exista capacidad excedente en el fondo', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'hasta un máximo del 20% del fondo', votes: 2, author: 'Ana' },
        ],
      },
      { text: '. ' },
      {
        id: 'prest-prioridad',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'La prioridad será para proyectos que generen alimento, vivienda o energía para la comunidad', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'La prioridad se decidirá por votación abierta', votes: 2, author: 'Teo' },
        ],
      },
      { text: '. ' },
      {
        id: 'prest-impago',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'En caso de impago, la deuda se convertirá en horas de trabajo comunitario acordadas en asamblea', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'En caso de impago, el fondo absorberá la pérdida hasta un límite anual', votes: 1, author: 'Marcos' },
        ],
      },
      { text: '.' },
    ],
  },
}
