/**
 * Multi-audience role + scenario-variant model (Section A — Foundation).
 *
 * Front-end only: these are the domain concepts that the routing in
 * `app/page.tsx` and the scenario pipeline hang off. No backend / real auth.
 */

/** Who is using the platform. A student/candidate is a "player". */
export type UserRole = 'player' | 'teacher' | 'corporate'

/** Top-level app surface the user is currently in.
 *  The hero offers two direct doors — Schools and Companies. Companies
 *  routes straight into the corporate dashboard (isPartnerLoggedIn gates
 *  that, not this enum). Schools opens the student/advisor chooser
 *  ('schoolChoice'); advisor routes to 'teacher'; student sets
 *  isStudentLoggedIn and never touches this enum again — see
 *  ScenarioSection for which surface a logged-in student sees. */
export type AppMode =
  | 'landing'
  | 'schoolChoice'
  | 'teacher'

/** Who authored a scenario — drives the locked/unlocked variant rule. */
export type CreatorType = 'student-self' | 'teacher' | 'corporate'

/** The visual register the play flow renders in. */
export type ScenarioVariant = 'playful' | 'professional'

/** Which student-facing surface is showing — Work scenarios (the classic
 *  candidate-style play flow) or Journeys (passion-led node sim). Orthogonal
 *  to ScenarioVariant/ScenarioLevel above: this picks the SURFACE, not the
 *  narrative register within it. Freely toggled by the student except while
 *  a scenario/journey is actively being played. */
export type ScenarioSection = 'work' | 'journey'

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

// (The old teacher `Classroom` type + generateClassCode moved into the
//  educator module — see lib/educator.ts, which owns cohorts now.)
