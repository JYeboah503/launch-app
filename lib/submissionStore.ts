/**
 * Candidate submission store.
 *
 * When a candidate finishes (or even just answers the intake portion of)
 * a scenario launched from an access code, we save a Submission so the
 * org can review their answers + AI scores. Persists to localStorage so
 * the org's view survives reloads.
 */

import type { QuestionVerdict } from '@/lib/aiEvaluator'

export interface Submission {
  id: string
  scenarioCode: string
  scenarioTitle: string
  candidateName: string
  variant: 'playful' | 'professional'
  submittedAt: string  // ISO
  /** AI verdicts on each intake question (open text answers + 0–10 scores). */
  intake: QuestionVerdict[]
  /** True if any hard-filter intake question came back as not qualified —
   *  surfaces a top-level red badge on the Submissions surface so the org
   *  can sort/filter quickly. */
  notQualified?: boolean
  /** Decisions the candidate made in the scenario, plus skill credited. */
  decisions: Array<{
    stepIdx: number
    label?: string
    skill?: string
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
  write(all.slice(0, 200)) // cap so localStorage doesn't run away
}

export function listSubmissions(): Submission[] {
  return read()
}

export function listSubmissionsForCode(code: string): Submission[] {
  const needle = code.trim().toUpperCase()
  return read().filter((s) => s.scenarioCode.toUpperCase() === needle)
}
