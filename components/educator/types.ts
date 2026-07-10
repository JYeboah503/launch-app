/** Shared educator-UI types + the workspace shape passed between views. */

import type { Cohort, EdStudent, EdAssignment, SubjectProfile } from '@/lib/educator'

export interface EdBranding {
  schoolName: string
  /** Accent hex — lightly themes buttons/highlights (school-managed). */
  accent: string
  logoUrl: string | null
  /** Cover image data URL; null = use the generative default. */
  coverUrl: string | null
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
}

/** Advisor's per-student overrides for career / subject guidance. */
export interface GuidanceOverride {
  careers?: string[]
  note?: string
}

export const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: 'Teal', hex: '#1B9E8F' },
  { name: 'Indigo', hex: '#4F5BD5' },
  { name: 'Plum', hex: '#8E4B8B' },
  { name: 'Amber', hex: '#C9822E' },
  { name: 'Forest', hex: '#3C7A4E' },
  { name: 'Coral', hex: '#D65C4E' },
]

/** "now" for the prototype — fixed so seeded overdue/upcoming logic is stable. */
export const ED_NOW = '2026-07-10T09:00:00.000Z'
