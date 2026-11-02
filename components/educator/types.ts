/** Shared educator-UI types + the workspace shape passed between views. */

import type { Cohort, EdStudent, EdAssignment, SubjectProfile } from '@/lib/educator'

export type Institution = 'school' | 'university'

export interface EdBranding {
  schoolName: string
  logoUrl: string | null
  /** Which advisor persona this workspace serves — drives wording, the
   *  student roster shape (year groups vs year-of-study + course) and the
   *  scenario library (classroom vs internships at real employers). */
  institution: Institution
}

/** A scenario the educator can browse / preview / assign. Pre-built ones
 *  ship in ASSIGNABLE_SCENARIOS; teacher-authored ones are added here with
 *  isCustom + their classroom lens (subject + brief). */
export interface EdScenario {
  id: string
  title: string
  emoji: string
  capabilities: string[]
  blurb: string
  decisions: number
  mins: number
  isCustom?: boolean
  /** The classroom lens it was authored through, e.g. "Economics". */
  subjectName?: string
}

/** A live timed free-play session — students join with the code and play
 *  anything; results roll into the cohort as they finish. */
export interface FreePlaySession {
  id: string
  cohortId: string
  durationMins: number
  startedAt: string // ISO — real wall-clock, drives the countdown
  code: string
}

/** The classroom lens carried from the purpose-first flow into the builder. */
export interface BuilderLens {
  subjectName?: string
  brief?: string
  /** When set, the created scenario is auto-assigned to this cohort. */
  cohortId?: string
}

export interface EdWorkspace {
  branding: EdBranding
  students: EdStudent[]
  cohorts: Cohort[]
  assignments: EdAssignment[]
  subjects: SubjectProfile[]
  /** Teacher-authored scenarios (via the builder). */
  customScenarios: EdScenario[]
  /** Live free-play sessions. */
  freePlaySessions: FreePlaySession[]
  /** Advisor's per-student guidance overrides (persisted notes etc.). */
  guidance: Record<string, GuidanceOverride>
}

/** Advisor's per-student overrides for career / subject guidance. */
export interface GuidanceOverride {
  careers?: string[]
  note?: string
}

/** "now" for the prototype — fixed so seeded overdue/upcoming logic is stable. */
export const ED_NOW = '2026-07-10T09:00:00.000Z'
