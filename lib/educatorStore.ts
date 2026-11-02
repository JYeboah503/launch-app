/**
 * Educator workspace store + the class-code join glue.
 *
 * Lives apart from lib/educator.ts (which stays pure/deterministic): this
 * file owns localStorage, is shared by BOTH sides of the demo — the advisor
 * dashboard reads/writes the whole workspace here, and the student
 * dashboard calls joinClassByCode() when a CLASS- code is entered — so a
 * student joining really does appear in the advisor's roster (same-browser
 * localStorage; the real build replaces this with the backend).
 */

import {
  buildEducatorSeed, buildUniversitySeed, makePlaceholderStudent, mulberry32,
  CAPABILITIES,
  type Cohort, type EdStudent, type CapabilityScores, type ScenarioRun, type DecisionStep,
} from '@/lib/educator'
import type { EdWorkspace, EdBranding, Institution } from '@/components/educator/types'
import { loadCapabilityStore } from '@/lib/capabilityProfile'
import { loadProfile as loadJourneyProfile, type RunRecord } from '@/lib/play/journeyProfile'
import { journeyById } from '@/lib/play/journeyScenarios'

// v2 — the whole-school roster (~300 students across Years 10–12). Bumped
// so every browser reseeds; v1 saves are ignored.
export const EDUCATOR_KEY = 'launch.educator.v2'
/** University-advisor workspace — a separate world the top-bar toggle swaps to. */
export const EDUCATOR_UNI_KEY = 'launch.educator.uni.v1'
/** Which persona the advisor last used. */
export const INSTITUTION_KEY = 'launch.educator.institution.v1'
const LIVE_STUDENT_KEY = 'launch.educator.liveStudent.v1'

export const DEFAULT_ED_BRANDING: EdBranding = {
  schoolName: 'Northbridge College',
  logoUrl: null,
  institution: 'school',
}

export const DEFAULT_UNI_BRANDING: EdBranding = {
  schoolName: 'University of Wollongong',
  logoUrl: null,
  institution: 'university',
}

const keyFor = (inst: Institution) => (inst === 'university' ? EDUCATOR_UNI_KEY : EDUCATOR_KEY)

export function loadInstitution(): Institution {
  try { return localStorage.getItem(INSTITUTION_KEY) === 'university' ? 'university' : 'school' } catch { return 'school' }
}
export function saveInstitution(inst: Institution): void {
  try { localStorage.setItem(INSTITUTION_KEY, inst) } catch { /* ignore */ }
}

/** Stable per-string seed for the backfill PRNG. */
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Fill defaults + backfill old saves: groups/guidance/customScenarios/
 *  freePlaySessions default in; stale branding fields are stripped. No key
 *  bump — user-created cohorts survive. For the university workspace the
 *  seeded roster is NOT in the save (2,500 students) — it's regenerated
 *  here and any persisted extras (live/imported students) are appended. */
export function ensureWorkspaceShape(parsed: any, inst: Institution = 'school'): EdWorkspace {
  const defaults = inst === 'university' ? DEFAULT_UNI_BRANDING : DEFAULT_ED_BRANDING
  const branding: EdBranding = {
    schoolName: parsed?.branding?.schoolName || defaults.schoolName,
    logoUrl: parsed?.branding?.logoUrl ?? null,
    institution: inst,
  }
  let students: EdStudent[] = (Array.isArray(parsed?.students) ? parsed.students : []).map((s: EdStudent) => {
    const r = mulberry32(hashSeed(s.id))
    return {
      ...s,
      // Backfill fields older saves lack — deterministic per student id.
      yearGroup: s.yearGroup ?? [12, 11, 10][Math.floor(r() * 3)],
      totalUseHours: s.totalUseHours ?? Math.round((2 + r() * r() * 38) * 10) / 10,
      parentName: s.parentName ?? '',
      parentEmail: s.parentEmail ?? '',
    }
  })
  if (inst === 'university') {
    // Saved uni students are only the extras — prepend the seeded roster.
    students = [...buildUniversitySeed().students, ...students.filter((s) => !s.id.startsWith('uni'))]
  }
  const cohorts: Cohort[] = (Array.isArray(parsed?.cohorts) ? parsed.cohorts : []).map((c: Cohort) => ({
    ...c,
    groups: Array.isArray(c.groups) ? c.groups : [],
  }))
  return {
    branding,
    students,
    cohorts,
    assignments: Array.isArray(parsed?.assignments) ? parsed.assignments : [],
    subjects: Array.isArray(parsed?.subjects) ? parsed.subjects : [],
    customScenarios: Array.isArray(parsed?.customScenarios) ? parsed.customScenarios : [],
    freePlaySessions: Array.isArray(parsed?.freePlaySessions) ? parsed.freePlaySessions : [],
    guidance: parsed?.guidance && typeof parsed.guidance === 'object' ? parsed.guidance : {},
  }
}

export function freshWorkspace(inst: Institution = 'school'): EdWorkspace {
  const s = inst === 'university' ? buildUniversitySeed() : buildEducatorSeed()
  return {
    branding: inst === 'university' ? DEFAULT_UNI_BRANDING : DEFAULT_ED_BRANDING,
    students: s.students,
    cohorts: s.cohorts,
    assignments: s.assignments,
    subjects: s.subjects,
    customScenarios: [],
    freePlaySessions: [],
    guidance: {},
  }
}

/** Load the workspace from localStorage, seeding it if absent. Client-only
 *  (call from effects/handlers, never during render). */
export function loadEducatorWorkspace(inst: Institution = 'school'): EdWorkspace {
  try {
    const raw = localStorage.getItem(keyFor(inst))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.cohorts)) return ensureWorkspaceShape(parsed, inst)
    }
  } catch { /* fall through to seed */ }
  return freshWorkspace(inst)
}

export function saveEducatorWorkspace(ws: EdWorkspace): void {
  try {
    const inst = ws.branding.institution ?? 'school'
    // The university's 2,500-student seeded roster is deterministic — strip
    // it from the save and keep only extras (live/imported students).
    const lean = inst === 'university'
      ? { ...ws, students: ws.students.filter((s) => !s.id.startsWith('uni')) }
      : ws
    localStorage.setItem(keyFor(inst), JSON.stringify(lean))
  } catch { /* ignore */ }
}

/** Case-insensitive, with or without the CLASS- prefix. */
export function findCohortByCode(ws: EdWorkspace, code: string): Cohort | null {
  const norm = code.trim().toUpperCase()
  const withPrefix = norm.startsWith('CLASS-') ? norm : `CLASS-${norm}`
  return ws.cohorts.find((c) => c.code.toUpperCase() === withPrefix) ?? null
}

export type JoinClassResult =
  | { ok: true; cohortId: string; cohortName: string; studentId: string }
  | { ok: false }

/** The same-browser student joins a class: seeds the workspace if the
 *  advisor has never opened it, creates (or reuses) the live student, and
 *  enrols them. Idempotent — re-entering the code never duplicates. */
export function joinClassByCode(code: string, studentName: string): JoinClassResult {
  const ws = loadEducatorWorkspace()
  const cohort = findCohortByCode(ws, code)
  if (!cohort) return { ok: false }

  let liveId: string | null = null
  try { liveId = JSON.parse(localStorage.getItem(LIVE_STUDENT_KEY) || 'null')?.id ?? null } catch { /* ignore */ }

  let student = liveId ? ws.students.find((s) => s.id === liveId) : undefined
  if (!student) {
    student = { ...makePlaceholderStudent(studentName || 'You', '', 9000), isLive: true, scenarioHistory: [] }
    ws.students = [...ws.students, student]
  } else if (studentName.trim() && student.name !== studentName.trim()) {
    const parts = studentName.trim().split(/\s+/)
    student.name = studentName.trim()
    student.initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase() || 'ST'
  }
  if (!cohort.studentIds.includes(student.id)) {
    cohort.studentIds = [...cohort.studentIds, student.id]
  }
  saveEducatorWorkspace(ws)
  try { localStorage.setItem(LIVE_STUDENT_KEY, JSON.stringify({ id: student.id })) } catch { /* ignore */ }
  return { ok: true, cohortId: cohort.id, cohortName: cohort.name, studentId: student.id }
}

/* ────────────────────────────────────────────────────────────────────
   Live-data overlay — the joined student's drill-in reads the student
   side's real localStorage instead of seeded numbers.
   ──────────────────────────────────────────────────────────────────── */

export interface LiveStudentData {
  scores: CapabilityScores | null
  runs: ScenarioRun[]
}

/** Map the student side's 8 canonical capabilities onto the educator's 10.
 *  Seven names match exactly; Self-direction lands on Execution & Ownership.
 *  Problem Solving and Collaboration get no live signal and stay neutral —
 *  coarse by design (noted for the real build). */
const LIVE_CAP_MAP: Record<string, string> = { 'Self-direction': 'Execution & Ownership' }

export function readLiveStudentData(): LiveStudentData {
  let scores: CapabilityScores | null = null
  try {
    const store = loadCapabilityStore()
    if (store.events.length > 0) {
      const counts: Record<string, number> = {}
      for (const e of store.events) {
        const cap = LIVE_CAP_MAP[e.capability] ?? e.capability
        counts[cap] = (counts[cap] || 0) + 1
      }
      scores = {}
      for (const c of CAPABILITIES) scores[c] = Math.min(95, 50 + (counts[c] || 0) * 9)
    }
  } catch { /* no live scores */ }

  let runs: ScenarioRun[] = []
  try {
    const profile = loadJourneyProfile()
    runs = (profile?.runs || []).map((r: RunRecord, i: number): ScenarioRun => {
      const journey = journeyById(r.journeyId)
      const decisions: DecisionStep[] = (r.picks || []).map((p, di) => ({
        prompt: p.prompt,
        skill: p.skill,
        options: (p.options && p.options.length > 0 ? p.options : [p.choiceLabel]).map((label, oi) => ({
          id: `live-${i}-${di}-${oi}`,
          label,
          picked: label === p.choiceLabel,
        })),
      }))
      return {
        id: `live-run-${i}`,
        title: journey?.role ?? r.passionLabel ?? 'Journey',
        origin: r.origin ?? 'journey',
        completedAt: r.completedAt,
        capabilities: Object.keys(r.skillCounts || {}),
        decisions,
      }
    })
  } catch { /* no live runs */ }

  return { scores, runs }
}
