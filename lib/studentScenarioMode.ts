/**
 * Persisted "Work scenarios vs Journeys" preference. A student picks once
 * on first entry (via the two-option screen in SchoolChooser); after that,
 * every fresh login skips straight to their last choice, with the header
 * toggle free to change it any other time — same localStorage idiom as
 * lib/play/journeyProfile.ts.
 */

import type { ScenarioSection } from '@/lib/roles'

const KEY = 'launch.studentScenarioMode.v1'

export function loadScenarioModePreference(): ScenarioSection | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw === 'work' || raw === 'journey' ? raw : null
  } catch {
    return null
  }
}

export function saveScenarioModePreference(mode: ScenarioSection): void {
  try {
    localStorage.setItem(KEY, mode)
  } catch {}
}
