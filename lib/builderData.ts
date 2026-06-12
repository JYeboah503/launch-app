/**
 * Builder reference data — the curated lists the new Scenario Builder uses
 * to (a) explain what each capability measures to the org, and (b) offer
 * templated AI-evaluation criteria for generic intake questions.
 *
 * Adding/editing entries here is the single source of truth — the builder
 * picks them up automatically, no UI changes needed.
 */

/* ---------------------------------------------------------------- */
/* The ten capabilities, with a one-line "how we measure" hint that  */
/* sits next to every question in the editor so the org knows what   */
/* they're actually testing.                                          */
/* ---------------------------------------------------------------- */

export interface CapabilityMeta {
  key: string
  name: string
  short: string
  measure: string  // one-line how-we-measure hint shown next to each question
  example?: string // optional collapsible "strong vs weak signal" example
}

export const CAPABILITIES: CapabilityMeta[] = [
  {
    key: 'judgement',
    name: 'Judgement & Decision-Making',
    short: 'Judgement',
    measure: 'How they evaluate trade-offs under pressure when the right answer isn’t obvious.',
    example: 'Strong: weighs constraints before committing. Weak: defaults to the safest option without justification.',
  },
  {
    key: 'reasoning',
    name: 'Reasoning & Critical Thinking',
    short: 'Reasoning',
    measure: 'Whether their answer holds up logically when you trace its steps backwards.',
    example: 'Strong: chains cause → effect cleanly. Weak: jumps to a conclusion that doesn’t follow from the facts shown.',
  },
  {
    key: 'problemSolving',
    name: 'Problem Solving',
    short: 'Problem Solving',
    measure: 'How they decompose a messy situation into something they can actually act on.',
    example: 'Strong: names the real problem, not the surface one. Weak: tries to fix the loudest symptom.',
  },
  {
    key: 'leadership',
    name: 'Leadership & Influence',
    short: 'Leadership',
    measure: 'Whether they move the room toward a decision or react to whoever is loudest.',
    example: 'Strong: takes a position with reasons. Weak: defers to consensus to avoid friction.',
  },
  {
    key: 'adaptability',
    name: 'Adaptability & Cognitive Flexibility',
    short: 'Adaptability',
    measure: 'How fast they update when new information contradicts what they just said.',
    example: 'Strong: revises and names the update. Weak: doubles down to preserve their first answer.',
  },
  {
    key: 'emotionalIntelligence',
    name: 'Emotional Intelligence',
    short: 'EQ',
    measure: 'How well they read the people in the room — not just the problem on the table.',
    example: 'Strong: factors stakeholder reaction into the decision. Weak: treats people as ignorable.',
  },
  {
    key: 'execution',
    name: 'Execution & Ownership',
    short: 'Execution',
    measure: 'Whether their answer ends in a concrete next step they’d actually take.',
    example: 'Strong: names a specific first move. Weak: ends in intent without action.',
  },
  {
    key: 'integrity',
    name: 'Integrity & Ethics',
    short: 'Integrity',
    measure: 'How they frame trade-offs when no one is watching and the easy path is also the wrong one.',
    example: 'Strong: names the harder choice and why it matters. Weak: optimises for what looks good externally.',
  },
  {
    key: 'collaboration',
    name: 'Collaboration',
    short: 'Collaboration',
    measure: 'Whether they raise the people around them or solve it alone in their head.',
    example: 'Strong: brings others in deliberately. Weak: treats the team as obstacles.',
  },
  {
    key: 'situationalAwareness',
    name: 'Situational Awareness & Systems Thinking',
    short: 'Situational',
    measure: 'How far past the immediate question they see — second- and third-order effects.',
    example: 'Strong: anticipates downstream consequences. Weak: stops at the first effect.',
  },
]

export function getCapability(key: string): CapabilityMeta | undefined {
  return CAPABILITIES.find((c) => c.key === key)
}

/* ---------------------------------------------------------------- */
/* Templated AI criteria for generic intake questions.               */
/* Orgs pick from these as checkboxes; AI evaluates the candidate's  */
/* free-text answer against each ticked criterion and returns a 0-10 */
/* score + one-line rationale per question.                          */
/* ---------------------------------------------------------------- */

export interface CriterionTemplate {
  id: string
  label: string       // shown on the chip / checkbox
  hint: string        // helper text shown when ticked, explains to the org
  category: 'intent' | 'values' | 'communication' | 'experience' | 'fit'
}

export const CRITERION_TEMPLATES: CriterionTemplate[] = [
  // Intent / motivation
  {
    id: 'strong-interest',
    label: 'Shows strong, specific interest',
    hint: 'Looks for answers that reference the specific role or organisation by name, not generic enthusiasm.',
    category: 'intent',
  },
  {
    id: 'career-narrative',
    label: 'Has a coherent career narrative',
    hint: 'Looks for a believable through-line between past experience and the reason for this application.',
    category: 'intent',
  },
  {
    id: 'genuine-curiosity',
    label: 'Demonstrates genuine curiosity',
    hint: 'Looks for evidence of having actually researched the work, the team, or the industry.',
    category: 'intent',
  },

  // Values alignment
  {
    id: 'references-values',
    label: 'References our values',
    hint: 'Looks for clear language echoing the organisation’s stated values or principles.',
    category: 'values',
  },
  {
    id: 'mission-fit',
    label: 'Connects to our mission',
    hint: 'Looks for explicit articulation of why this organisation’s purpose matters to the candidate personally.',
    category: 'values',
  },

  // Communication quality
  {
    id: 'tone-confidence',
    label: 'Tone of confidence (not arrogance)',
    hint: 'Looks for clear, decisive language without false humility or grandstanding.',
    category: 'communication',
  },
  {
    id: 'clear-concise',
    label: 'Clear and concise',
    hint: 'Penalises hedging, jargon, and rambling. Rewards answers that get to the point.',
    category: 'communication',
  },
  {
    id: 'specific-examples',
    label: 'Uses specific examples',
    hint: 'Looks for concrete situations or numbers rather than abstract claims about themselves.',
    category: 'communication',
  },

  // Experience / capability evidence
  {
    id: 'relevant-experience',
    label: 'Names relevant experience',
    hint: 'Looks for past work, projects, or studies that directly map to what the role demands.',
    category: 'experience',
  },
  {
    id: 'self-aware-growth',
    label: 'Self-aware about growth areas',
    hint: 'Looks for candid acknowledgement of what they’re still learning, not a polished perfection narrative.',
    category: 'experience',
  },
  {
    id: 'demonstrable-skill',
    label: 'Names a demonstrable skill',
    hint: 'Looks for an answer that ties a concrete skill to a concrete output or result.',
    category: 'experience',
  },

  // Fit / cultural signal
  {
    id: 'team-collaborative',
    label: 'Signals collaborative instincts',
    hint: 'Looks for credit-sharing, references to teammates, or evidence of working through conflict.',
    category: 'fit',
  },
  {
    id: 'ownership-instinct',
    label: 'Shows ownership instinct',
    hint: 'Looks for first-person agency — "I did", "I decided" — over passive observer language.',
    category: 'fit',
  },
  {
    id: 'long-game',
    label: 'Thinking on the long-game',
    hint: 'Looks for answers that hint at sustained interest beyond the immediate hire — trajectory, growth, building.',
    category: 'fit',
  },
]

export function getCriterion(id: string): CriterionTemplate | undefined {
  return CRITERION_TEMPLATES.find((c) => c.id === id)
}

/** Pre-baked generic question starter prompts the org can pick or edit. */
export const GENERIC_QUESTION_SUGGESTIONS = [
  'Why are you interested in this role?',
  'What about our organisation made you apply?',
  'What did you study, and how does it connect to this work?',
  'Tell us about a time you owned something end-to-end.',
  'What would you want to be doing in three years?',
  'What would you bring to our team that we don’t already have?',
]

/* ---------------------------------------------------------------- */
/* Attribute library — softer "trait" axes (e.g. Savills' 14) that  */
/* map onto the underlying 10 capabilities. Orgs pick attributes;   */
/* the AI generator uses them as input + the scoring continues to   */
/* roll up via the capability key.                                  */
/* ---------------------------------------------------------------- */

export interface AttributeMeta {
  key: string
  name: string
  /** Underlying capability this attribute scores against. */
  capabilityKey: string
  /** One-line description shown in the picker. */
  description: string
}

export const ATTRIBUTES: AttributeMeta[] = [
  // Softer "trait" attributes from Savills' email
  { key: 'positive-attitude',  name: 'Positive attitude',        capabilityKey: 'emotionalIntelligence', description: 'Brings constructive energy even when things go sideways.' },
  { key: 'willingness-learn',  name: 'Willingness to learn',     capabilityKey: 'adaptability',          description: 'Open to feedback; treats every situation as a chance to grow.' },
  { key: 'inquisitive',        name: 'Inquisitive nature',       capabilityKey: 'reasoning',             description: 'Asks the second question, not just the first.' },
  { key: 'communication',      name: 'Strong communication',     capabilityKey: 'collaboration',         description: 'Writes and speaks clearly under pressure; reads the room.' },
  { key: 'teamwork',           name: 'Teamwork & collaboration', capabilityKey: 'collaboration',         description: 'Raises the team around them; credits-shares; resolves friction.' },
  { key: 'problem-solving',    name: 'Problem-solving ability',  capabilityKey: 'problemSolving',        description: 'Decomposes mess into something they can act on.' },
  { key: 'time-management',    name: 'Time management',          capabilityKey: 'execution',             description: 'Prioritises ruthlessly; finishes what they start.' },
  { key: 'adaptability',       name: 'Adaptability',             capabilityKey: 'adaptability',          description: 'Updates fast when new information changes the picture.' },
  { key: 'initiative',         name: 'Initiative & ownership',   capabilityKey: 'execution',             description: 'Takes the first step before being asked; owns the outcome.' },
  { key: 'professionalism',    name: 'Professionalism',          capabilityKey: 'integrity',             description: 'Conducts themselves credibly with clients, peers, leadership.' },
  { key: 'digital-skills',     name: 'Basic technical / digital', capabilityKey: 'execution',            description: 'Comfortable with the tooling the work needs (spreadsheets, CRMs, etc).' },
  { key: 'resilience',         name: 'Resilience under pressure', capabilityKey: 'judgement',            description: 'Holds judgement together when the stakes are high.' },
  { key: 'motivation',         name: 'Motivation & drive',       capabilityKey: 'execution',             description: 'Self-starts; sustains effort over the long arc.' },
  { key: 'diligence',          name: 'Diligence',                capabilityKey: 'integrity',             description: 'Quietly thorough; checks the detail no one is asking about.' },
]

export function getAttribute(key: string): AttributeMeta | undefined {
  return ATTRIBUTES.find((a) => a.key === key)
}
