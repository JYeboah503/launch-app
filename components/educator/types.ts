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

export interface EdWorkspace {
  branding: EdBranding
  students: EdStudent[]
  cohorts: Cohort[]
  assignments: EdAssignment[]
  subjects: SubjectProfile[]
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
