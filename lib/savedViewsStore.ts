/**
 * Saved-views store for the Submissions surface.
 *
 * Partners build a useful filter combination (score / capability / keyword /
 * hide-not-qualified) once and save it as a named view (e.g. "NSW grad
 * shortlist"). Clicking a saved view loads its filters back in. Persists
 * to localStorage so the views survive reloads.
 */

export interface SavedViewFilters {
  minScore: number
  hideNotQualified: boolean
  capabilityFilter: string[]
  keyword: string
}

export interface SavedView {
  id: string
  name: string
  createdAt: string  // ISO
  filters: SavedViewFilters
}

const KEY = 'launch.savedViews.v1'

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
    /* ignore */
  }
}

export function listViews(): SavedView[] {
  return read()
}

export function saveView(name: string, filters: SavedViewFilters): SavedView {
  const v: SavedView = {
    id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || 'Untitled view',
    createdAt: new Date().toISOString(),
    filters: {
      minScore: filters.minScore,
      hideNotQualified: filters.hideNotQualified,
      capabilityFilter: [...filters.capabilityFilter],
      keyword: filters.keyword,
    },
  }
  const all = read()
  all.unshift(v)
  write(all.slice(0, 30))   // cap so localStorage stays small
  return v
}

export function deleteView(id: string): void {
  const all = read().filter((v) => v.id !== id)
  write(all)
}

/** Same-filter detection so we can highlight the active view if it matches. */
export function filtersMatch(a: SavedViewFilters, b: SavedViewFilters): boolean {
  if (a.minScore !== b.minScore) return false
  if (a.hideNotQualified !== b.hideNotQualified) return false
  if (a.keyword.trim() !== b.keyword.trim()) return false
  const sa = [...a.capabilityFilter].sort()
  const sb = [...b.capabilityFilter].sort()
  if (sa.length !== sb.length) return false
  return sa.every((v, i) => v === sb[i])
}
