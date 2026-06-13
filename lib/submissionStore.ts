/**
 * Candidate submission store.
 *
 * When a candidate finishes (or even just answers the intake portion of)
 * a scenario launched from an access code, we save a Submission so the
 * org can review their answers + AI scores. Persists to localStorage so
 * the org's view survives reloads.
 */

import type { QuestionVerdict } from '@/lib/aiEvaluator'
import type { CandidateProfile } from '@/lib/candidateProfile'

export interface Submission {
  id: string
  scenarioCode: string
  scenarioTitle: string
  candidateName: string
  variant: 'playful' | 'professional'
  submittedAt: string  // ISO
  /** ISO timestamp of when the candidate first entered the scenario.
   *  Used by the role-detail filter to surface "time to complete"
   *  as a confidence proxy. Optional for back-compat. */
  startedAt?: string
  /** Full candidate-collected basic profile — captured on the intake
   *  screen BEFORE the scenario. This is the single source of truth
   *  for partner-side filtering on the role detail page (ATAR, degree,
   *  graduation year, industries, salary expectations, etc.). */
  profile?: CandidateProfile
  /** AI verdicts on each intake question (open text answers + 0–10 scores). */
  intake: QuestionVerdict[]
  /** True if any pre-qualifier benchmark was missed — hard-filter wrong
   *  answer OR open-text score below the partner-set minScore. Surfaces
   *  a top-level red badge on the Submissions surface so the org can
   *  sort/filter quickly. */
  notQualified?: boolean
  /** Decisions the candidate made in the scenario, plus skill credited.
   *  Optional `prompt` + `options` carry the full decision tree so the
   *  partner can visualise the path the candidate took (which one of
   *  the alternatives they picked at each step). */
  decisions: Array<{
    stepIdx: number
    label?: string
    skill?: string
    /** The decision prompt the candidate saw. */
    prompt?: string
    /** All options shown, with which one was picked. */
    options?: Array<{
      id: string
      label: string
      picked: boolean
    }>
  }>
}

const KEY = 'launch.submissions.v1'

function read(): Submission[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Submission[]) : []
  } catch {
    return []
  }
}

function write(list: Submission[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function addSubmission(s: Submission): void {
  const all = read()
  all.unshift(s)
  // Cap kept generous (500) — seed data alone places ~190 entries; the
  // partner's later real submissions push the oldest seeds out as they go.
  write(all.slice(0, 500))
}

export function listSubmissions(): Submission[] {
  return read()
}

export function listSubmissionsForCode(code: string): Submission[] {
  const needle = code.trim().toUpperCase()
  return read().filter((s) => s.scenarioCode.toUpperCase() === needle)
}
