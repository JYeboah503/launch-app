/**
 * Candidate profile — basic demographic + background info collected from
 * every candidate at the start of a scenario run.
 *
 * Architecture: this is the upstream pipe that powers the partner's filter
 * UX on the role detail page. Each field that lands here becomes a
 * filterable axis on that page (ATAR range, degree multi-select, year
 * range, industries, etc.).
 *
 * Sections are presented to candidates one at a time on the intake screen
 * so they don't see a wall of fields. Basics is mandatory; the rest are
 * optional with a "Skip this section" affordance.
 */

export type WorkRightsStatus =
  | 'citizen-permanent'           // citizen or permanent resident
  | 'visa-unrestricted'           // visa with unrestricted work rights
  | 'visa-restricted'             // visa with conditions (hours, sponsorship needed)
  | 'no-rights'                   // none
  | ''                            // not answered

export type EmploymentStatus =
  | 'studying'
  | 'studying-working-pt'         // studying + part-time work
  | 'working-pt'
  | 'working-ft'
  | 'between-roles'
  | 'graduated-job-seeking'
  | ''

export type WillingRelocate =
  | 'yes-anywhere'
  | 'yes-in-country'
  | 'yes-in-state'
  | 'no'
  | ''

/** Industries of interest — graduate-program-tuned, easy to extend.
 *  Used as multi-select in the profile screen + on the role detail filter. */
export const INDUSTRIES = [
  'Property / Real Estate',
  'Finance / Banking',
  'Consulting / Strategy',
  'Technology',
  'Engineering',
  'Marketing',
  'Operations',
  'Sales',
  'Design',
  'Government / Public Sector',
  'Healthcare',
  'Education',
  'Legal',
  'Media / Communications',
  'Hospitality',
  'Other',
] as const

export type Industry = (typeof INDUSTRIES)[number]

/** A capability "key" the candidate can self-rate as a personal strength.
 *  Mirrors the keys in lib/builderData.ts CAPABILITIES. */
export const SELF_RATE_OPTIONS = [
  { key: 'judgement', label: 'Judgement & Decision-Making' },
  { key: 'reasoning', label: 'Reasoning & Critical Thinking' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'leadership', label: 'Leadership & Influence' },
  { key: 'adaptability', label: 'Adaptability' },
  { key: 'emotionalIntelligence', label: 'Emotional Intelligence' },
  { key: 'execution', label: 'Execution & Ownership' },
  { key: 'integrity', label: 'Integrity & Ethics' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'situationalAwareness', label: 'Situational Awareness' },
] as const

export interface CandidateProfile {
  /* ───────── Section 1 — Basics (required) ───────── */
  name: string
  email: string
  /** Optional phone. */
  phone?: string
  /** Free-text city / state. e.g. "Sydney, NSW" */
  location?: string

  /* ───────── Section 2 — Education ───────── */
  /** Australian ATAR equivalent, 0–99.95. Optional. */
  atar?: number
  university?: string
  degree?: string
  /** Year of graduation. 4-digit. May be in the future. */
  graduationYear?: number
  /** Optional major / specialisation field. */
  major?: string

  /* ───────── Section 3 — Background ───────── */
  workRights?: WorkRightsStatus
  employmentStatus?: EmploymentStatus
  /** Multi-select from INDUSTRIES. */
  industries?: Industry[]
  /** Self-rated strengths — candidate picks up to 3 capability keys
   *  they think they're strongest in. Partner can later filter for
   *  "self-awareness gap": rated themselves high but scored low. */
  selfRatedStrengths?: string[]

  /* ───────── Section 4 — Looking for ───────── */
  /** ISO date of earliest available start. */
  availableFrom?: string
  /** Expected salary range — partner-friendly band labels. */
  expectedSalary?:
    | 'under-60'
    | '60-75'
    | '75-90'
    | '90-110'
    | '110-130'
    | '130-150'
    | '150-plus'
    | 'flexible'
    | ''
  willingRelocate?: WillingRelocate
  /** Optional short answer — why are you looking right now? */
  whyLooking?: string
}

/** A blank profile to seed the intake screen with. */
export const EMPTY_PROFILE = (): CandidateProfile => ({
  name: '',
  email: '',
})

/** Sections are presented one at a time to avoid wall-of-fields. */
export const PROFILE_SECTIONS = [
  {
    key: 'basics',
    title: 'About you',
    helper: 'How we reach you. Required.',
    required: true,
  },
  {
    key: 'education',
    title: 'Education',
    helper: 'Helps partners filter for grad-window + degree match.',
    required: false,
  },
  {
    key: 'background',
    title: 'Background',
    helper: 'Where you’re coming from and what you’re into.',
    required: false,
  },
  {
    key: 'looking',
    title: 'Looking for',
    helper: 'What kind of role would actually suit you right now.',
    required: false,
  },
] as const

export type ProfileSectionKey = (typeof PROFILE_SECTIONS)[number]['key']

/** True if all required fields are present + reasonably formatted. */
export function isProfileMinimallyComplete(p: CandidateProfile): boolean {
  return p.name.trim().length > 0 && /\S+@\S+\.\S+/.test(p.email)
}
