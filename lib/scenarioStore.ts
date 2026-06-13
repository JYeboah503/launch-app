/**
 * Custom scenario store.
 *
 * Persists scenarios authored via the ScenarioBuilder (teacher- or corporate-
 * authored) to localStorage so they survive reloads, are addressable by code,
 * and can be resolved into something the play flow can run.
 *
 * The builder's `onRoleCreated` payload only carries the role metadata, not
 * the actual decision-tree content (that lives transiently inside the builder
 * editor today). Until we wire the editor's tree through, custom scenarios
 * "resolve" by mapping their role title into a sample scenario via
 * `pickScenarioForTitle`. The creator + variant metadata is what matters for
 * routing/UI, and that's preserved here losslessly.
 */

import type { CreatorType, ScenarioVariant } from '@/lib/roles'
import type { GenericIntakeQuestion } from '@/lib/play/types'

/**
 * Lifecycle state for a scenario.
 *  - 'open'   — accepting new candidate submissions (default).
 *  - 'closed' — no new candidates can enter the access code; existing
 *               submissions stay viewable on the corporate side.
 *
 * Missing on legacy stubs in localStorage; readers should treat undefined
 * as 'open' so saved demos don't break after the migration.
 */
export type ScenarioStatus = 'open' | 'closed'

export interface CustomScenarioStub {
  /** The builder's emitted id (also the access/share code). */
  id: string
  /** The shareable code students enter to launch this scenario. */
  code: string
  /** Role title (also used as scenario seed via pickScenarioForTitle). */
  title: string
  skills: string[]
  questionsCount: number
  creatorType: CreatorType
  variant: ScenarioVariant
  createdAt: string  // ISO
  /** Generic intake questions the candidate answers before the scenario. */
  genericQuestions?: GenericIntakeQuestion[]
  /** Lifecycle state; defaults to 'open' if missing on legacy entries. */
  status?: ScenarioStatus
  /** ISO timestamp the scenario was last closed (cleared on reopen). */
  closedAt?: string
}

const KEY = 'launch.scenarioStore.v1'

function read(): CustomScenarioStub[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as CustomScenarioStub[] : []
  } catch {
    return []
  }
}

function write(list: CustomScenarioStub[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Persist a freshly authored scenario stub. Idempotent on id. */
export function addCustomScenarioStub(stub: CustomScenarioStub): void {
  const all = read()
  const filtered = all.filter((s) => s.id !== stub.id)
  filtered.unshift(stub)
  write(filtered)
}

/** Look up a scenario stub by its access code (case-insensitive). */
export function getCustomScenarioByCode(code: string): CustomScenarioStub | undefined {
  if (!code) return undefined
  const needle = code.trim().toUpperCase()
  return read().find((s) => s.code.toUpperCase() === needle)
}

/** Look up by id. */
export function getCustomScenarioById(id: string): CustomScenarioStub | undefined {
  return read().find((s) => s.id === id)
}

/** All stubs, newest first. */
export function listCustomScenarios(): CustomScenarioStub[] {
  return read()
}

/**
 * Close (or reopen) a scenario by id. Closing stamps `closedAt` so the UI can
 * show "Closed 3 Jun"; reopening clears both fields back to the open default.
 * No-op if the id isn't found.
 */
export function setScenarioStatus(id: string, status: ScenarioStatus): void {
  const all = read()
  const next = all.map((s) => {
    if (s.id !== id) return s
    if (status === 'closed') return { ...s, status, closedAt: new Date().toISOString() }
    // Reopen: strip both status + closedAt so the entry returns to the
    // default-open shape. Cleaner than leaving status: 'open' littered around.
    const { closedAt: _drop, status: _drop2, ...rest } = s
    return rest as CustomScenarioStub
  })
  write(next)
}

/**
 * Permanently delete a scenario by id. Returns true if removed, false if no
 * entry matched. Candidate submissions for the removed code remain in
 * submissionStore — those are independent and the partner may still want to
 * review them after closing the role.
 */
export function deleteCustomScenario(id: string): boolean {
  const all = read()
  const next = all.filter((s) => s.id !== id)
  if (next.length === all.length) return false
  write(next)
  return true
}
