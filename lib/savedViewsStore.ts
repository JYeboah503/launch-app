/**
 * Saved filter views — named ApplicantFilters snapshots, scoped per role.
 *
 * A recruiter working a pipeline over weeks saves "Sydney grads · Problem
 * Solving ≥ 70" once and re-opens it from a chip on the role detail page.
 * Views are also the unit of export: the CSV/PDF stamps the view's filter
 * summary so the file is self-describing.
 *
 * localStorage-backed like every other store in this prototype.
 */

import type { ApplicantFilters } from '@/components/role-applicant-filters'

export interface SavedView {
  id: string
  /** The role (scenario) this view belongs to — views never leak across roles. */
  roleId: string
  name: string
  filters: ApplicantFilters
  createdAt: string // ISO
}

const KEY = 'launch.savedViews.v2'

function read(): SavedView[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedView[]) : []
  } catch {
    return []
  }
}

function write(list: SavedView[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore quota / private mode */
  }
}

export function listSavedViews(roleId: string): SavedView[] {
  return read().filter((v) => v.roleId === roleId)
}

export function saveView(roleId: string, name: string, filters: ApplicantFilters): SavedView {
  const view: SavedView = {
    id: `view-${Date.now().toString(36)}`,
    roleId,
    name: name.trim(),
    // Deep-copy so later filter edits don't mutate the saved snapshot.
    filters: JSON.parse(JSON.stringify(filters)) as ApplicantFilters,
    createdAt: new Date().toISOString(),
  }
  write([view, ...read()])
  return view
}

export function deleteSavedView(id: string): void {
  write(read().filter((v) => v.id !== id))
}
