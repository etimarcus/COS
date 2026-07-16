/**
 * Demo: Parameterized community narratives
 *
 * Each narrative is decomposed into meaningful blocks ("tokens").
 * Editable blocks have a semantic type (with its color tone)
 * and a list of variants proposed by the community. The variant with
 * the highest relevance (votes) is shown as the current text.
 *
 * Fixed blocks ({ text }) are non-editable connectors.
 */

export const TOKEN_TYPES = {
  sujeto: { label: 'Subject', color: '#64b5f6' },
  accion: { label: 'Action', color: '#81c784' },
  objeto: { label: 'Object', color: '#ffb74d' },
  condicion: { label: 'Condition', color: '#ba68c8' },
  valor: { label: 'Value / Criterion', color: '#4dd0e1' },
  consecuencia: { label: 'Consequence', color: '#e57373' },
}

// Demo branch injected into the word cloud (not stored in Supabase)
export const DEMO_BRANCH = {
  id: 'demo-leyes',
  label: 'Laws & Regulations',
  color: '#c9a227',
  topics: [
    { id: 'demo-leyes-agua', label: 'Water Use', narrativeId: 'agua' },
    { id: 'demo-leyes-convivencia', label: 'Coexistence', narrativeId: 'convivencia' },
    { id: 'demo-leyes-prestamos', label: 'Community Loans', narrativeId: 'prestamos' },
  ],
}

export const NARRATIVES = {
  agua: {
    id: 'agua',
    title: 'Water Use',
    category: 'Laws & Regulations',
    intro: 'Community narrative about the use of water from the communal network. Click a colored block to view, vote, or propose variants.',
    blocks: [
      {
        id: 'agua-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'Each member of the community', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'Every person living in the cell', votes: 2, author: 'Josu' },
          { id: 'v3', text: 'Each family unit', votes: 1, author: 'Rocío' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'may use', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'shall have the right to use', votes: 2, author: 'Teo' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-objeto',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'water from the communal network', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'drinking and irrigation water', votes: 1, author: 'Marcos' },
        ],
      },
      { text: ' for ' },
      {
        id: 'agua-uso',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'household consumption and irrigation of family gardens', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'any use that does not harm other members', votes: 1, author: 'Teo' },
        ],
      },
      { text: ', ' },
      {
        id: 'agua-limite',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'as long as it does not exceed 200 liters per day per person', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'as long as it does not exceed 150 liters per day per person', votes: 2, author: 'Ana' },
          { id: 'v3', text: 'with no fixed limit, by agreement among neighbors', votes: 0, author: 'Josu' },
        ],
      },
      { text: '. ' },
      {
        id: 'agua-sequia',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'In times of drought', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'When the aquifer level drops below 40%', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', ' },
      {
        id: 'agua-autoridad',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'the Cell Council', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'the members\' assembly', votes: 2, author: 'Rocío' },
        ],
      },
      { text: ' ' },
      {
        id: 'agua-reduccion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'may reduce this limit', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'must reduce this limit', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', prioritizing ' },
      {
        id: 'agua-prioridad',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'human consumption and food production', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'human consumption above any other use', votes: 2, author: 'Josu' },
        ],
      },
      { text: '. ' },
      {
        id: 'agua-sancion',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'Whoever exceeds the limits must compensate the community with work hours on the water infrastructure', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'Whoever exceeds the limits will pay a progressive fee into the common fund', votes: 2, author: 'Marcos' },
          { id: 'v3', text: 'Excesses will be addressed in assembly, case by case', votes: 1, author: 'Josu' },
        ],
      },
      { text: '.' },
    ],
  },

  convivencia: {
    id: 'convivencia',
    title: 'Coexistence',
    category: 'Laws & Regulations',
    intro: 'Noise coexistence agreement narrated by the community. Each colored block is a piece that can evolve.',
    blocks: [
      {
        id: 'conv-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'All people in the cell', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'Members and visitors', votes: 2, author: 'Teo' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'commit to maintaining', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'must maintain', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-objeto',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'reasonable sound levels', votes: 3, author: 'Josu' },
          { id: 'v2', text: 'silence in common areas', votes: 1, author: 'Marcos' },
        ],
      },
      { text: ' ' },
      {
        id: 'conv-horario',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'between 22:00 and 07:00', votes: 4, author: 'Ana' },
          { id: 'v2', text: 'between 23:00 and 08:00', votes: 2, author: 'Teo' },
        ],
      },
      { text: '. ' },
      {
        id: 'conv-excepcion',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'For community celebrations', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'With 48 hours prior notice', votes: 2, author: 'Marcos' },
        ],
      },
      { text: ', ' },
      {
        id: 'conv-extension',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'the hours may be extended', votes: 3, author: 'Josu' },
          { id: 'v2', text: 'an exception will be agreed in assembly', votes: 2, author: 'Ana' },
        ],
      },
      { text: '. ' },
      {
        id: 'conv-conflicto',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'Conflicts will be resolved first through direct dialogue and then in a mediation circle', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'Conflicts will go directly to the mediation circle', votes: 1, author: 'Teo' },
        ],
      },
      { text: '.' },
    ],
  },

  prestamos: {
    id: 'prestamos',
    title: 'Community Loans',
    category: 'Laws & Regulations',
    intro: 'Common fund regulation narrated collectively. Vote or propose variants on each meaningful block.',
    blocks: [
      {
        id: 'prest-sujeto',
        type: 'sujeto',
        variants: [
          { id: 'v1', text: 'The cell\'s common fund', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'The community treasury', votes: 2, author: 'Ana' },
        ],
      },
      { text: ' ' },
      {
        id: 'prest-accion',
        type: 'accion',
        variants: [
          { id: 'v1', text: 'may grant loans', votes: 3, author: 'Teo' },
          { id: 'v2', text: 'will grant loans', votes: 1, author: 'Josu' },
        ],
      },
      { text: ' ' },
      {
        id: 'prest-destino',
        type: 'objeto',
        variants: [
          { id: 'v1', text: 'to productive projects of its members', votes: 3, author: 'Rocío' },
          { id: 'v2', text: 'to any member who requests one', votes: 1, author: 'Josu' },
        ],
      },
      { text: ', ' },
      {
        id: 'prest-condicion',
        type: 'condicion',
        variants: [
          { id: 'v1', text: 'when there is surplus capacity in the fund', votes: 3, author: 'Marcos' },
          { id: 'v2', text: 'up to a maximum of 20% of the fund', votes: 2, author: 'Ana' },
        ],
      },
      { text: '. ' },
      {
        id: 'prest-prioridad',
        type: 'valor',
        variants: [
          { id: 'v1', text: 'Priority will go to projects that generate food, housing, or energy for the community', votes: 4, author: 'Rocío' },
          { id: 'v2', text: 'Priority will be decided by open vote', votes: 2, author: 'Teo' },
        ],
      },
      { text: '. ' },
      {
        id: 'prest-impago',
        type: 'consecuencia',
        variants: [
          { id: 'v1', text: 'In case of default, the debt will convert into community work hours agreed in assembly', votes: 3, author: 'Ana' },
          { id: 'v2', text: 'In case of default, the fund will absorb the loss up to an annual limit', votes: 1, author: 'Marcos' },
        ],
      },
      { text: '.' },
    ],
  },
}
