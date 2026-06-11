/**
 * Multi-audience role + scenario-variant model (Section A — Foundation).
 *
 * Front-end only: these are the domain concepts that the routing in
 * `app/page.tsx` and the scenario pipeline hang off. No backend / real auth.
 */

/** Who is using the platform. A student/candidate is a "player". */
export type UserRole = 'player' | 'teacher' | 'corporate'

/** Top-level app surface the user is currently in. */
export type AppMode =
  | 'landing'
  | 'manage-select'
  | 'play'
  | 'teacher'
  | 'corporate'

/** Who authored a scenario — drives the locked/unlocked variant rule. */
export type CreatorType = 'student-self' | 'teacher' | 'corporate'

/** The visual register the play flow renders in. */
export type ScenarioVariant = 'playful' | 'professional'

export interface ScenarioMeta {
  creatorType: CreatorType
  variant: ScenarioVariant
}

/**
 * Variant rule (single source of truth):
 *   teacher-assigned   → playful (locked)
 *   corporate-assigned → professional (locked)
 *   student-self       → playful by default, but the student may toggle it
 */
export function variantForCreator(c: CreatorType): ScenarioVariant {
  if (c === 'teacher') return 'playful'
  if (c === 'corporate') return 'professional'
  return 'playful'
}

/** Self-created scenarios are the only ones a student may re-toggle. */
export function isVariantLocked(c: CreatorType): boolean {
  return c !== 'student-self'
}

/**
 * Scenario level — the career-stage register. Drives the in-play interface:
 *   - 'early'    → playful flow (current narrative-driven cinema interface)
 *   - 'advanced' → clean Q&A flow (square Apple-restrained, deck-aligned)
 *
 * Maps 1:1 to the older `ScenarioVariant` ('playful' | 'professional') so
 * existing data + types continue to work; new code should prefer `level`.
 */
export type ScenarioLevel = 'early' | 'advanced'

export function variantToLevel(v: ScenarioVariant): ScenarioLevel {
  return v === 'professional' ? 'advanced' : 'early'
}
export function levelToVariant(l: ScenarioLevel): ScenarioVariant {
  return l === 'advanced' ? 'professional' : 'playful'
}
export function levelLabel(l: ScenarioLevel): string {
  return l === 'advanced' ? 'Advanced career' : 'Early career'
}
export function defaultLevelForCreator(c: CreatorType): ScenarioLevel {
  // Teachers default to early (school context). Corporates default to early
  // too for safety — easier to bump to advanced than to flatten an
  // accidentally-advanced experience. Both creator types can override.
  return 'early'
}

/**
 * A teacher's classroom. Holds enrolled students + assigned scenarios.
 * Front-end-only for now; lives in component state with optional
 * localStorage persistence.
 */
export interface Classroom {
  id: string
  code: string              // shareable join code, e.g. "CLASS-AB12CD"
  name: string
  subject?: string          // optional, e.g. "Year 11 Business"
  studentIds: string[]      // refs into MOCK_STUDENTS
  scenarioIds: string[]     // refs into the sample library OR builder-emitted ids
  createdAt: string         // ISO timestamp
}

/** Generate a shareable, memorable class code. */
export function generateClassCode(): string {
  // 6 chars, no ambiguous 0/O/1/I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `CLASS-${out}`
}
