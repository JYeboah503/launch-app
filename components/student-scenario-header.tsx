'use client'

/**
 * Shared fixed header for the two student-facing scenario surfaces (Work
 * scenarios / Journeys). The two were previously byte-for-byte duplicated
 * inline in StudentDashboard and JourneyFlow — extracted here so the new
 * Work-scenarios ⇄ Journeys toggle exists in exactly one place. Renders the
 * mode toggle between the wordmark and the action button; the caller hides
 * it (hideModeToggle) whenever a scenario is actively being played, so a
 * student can't switch modes mid-run.
 */

import { LaunchWordmark } from '@/components/launch-wordmark'
import { saveScenarioModePreference } from '@/lib/studentScenarioMode'
import type { ScenarioSection } from '@/lib/roles'

interface StudentScenarioHeaderProps {
  subLabel: 'student' | 'journeys'
  actionLabel: 'Logout' | 'Exit'
  onAction: () => void
  mode: ScenarioSection
  onModeChange: (m: ScenarioSection) => void
  /** True while a scenario/journey is actively being played — the toggle
   *  is omitted entirely (not just disabled) so switching mid-run isn't
   *  possible even via keyboard/assistive tech. */
  hideModeToggle: boolean
  /** Opens the mode-agnostic capability Scorecard. Same visibility rule
   *  as the mode toggle — hidden mid-play. */
  onOpenScorecard?: () => void
}

export function StudentScenarioHeader({
  subLabel,
  actionLabel,
  onAction,
  mode,
  onModeChange,
  hideModeToggle,
  onOpenScorecard,
}: StudentScenarioHeaderProps) {
  const setMode = (m: ScenarioSection) => {
    if (m === mode) return
    saveScenarioModePreference(m)
    onModeChange(m)
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 border-b"
      style={{
        borderColor: 'rgba(146, 184, 255, 0.12)',
        background: 'rgba(7, 9, 28, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LaunchWordmark height={40} tone="light" ariaLabel="LAUNCH" />
          <span className="hidden sm:inline editorial-mono" style={{ color: 'rgba(246, 242, 234, 0.5)' }}>
            · {subLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!hideModeToggle && (
            <div className="scenario-mode-toggle" role="radiogroup" aria-label="Scenario section">
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'work'}
                className={`scenario-mode-opt ${mode === 'work' ? 'is-on' : ''}`}
                onClick={() => setMode('work')}
              >
                Work scenarios
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'journey'}
                className={`scenario-mode-opt ${mode === 'journey' ? 'is-on' : ''}`}
                onClick={() => setMode('journey')}
              >
                Journeys
              </button>
            </div>
          )}
          {!hideModeToggle && onOpenScorecard && (
            <button type="button" onClick={onOpenScorecard} className="editorial-pill editorial-pill-ghost text-xs">
              Scorecard
            </button>
          )}
          <button type="button" onClick={onAction} className="editorial-pill editorial-pill-ghost text-xs">
            {actionLabel}
          </button>
        </div>
      </div>
      <style>{`.scenario-mode-toggle { display: inline-flex; gap: 4px; } .scenario-mode-opt { padding: 6px 13px; border-radius: 999px; border: 1px solid rgba(246,242,234,0.2); background: transparent; color: rgba(246,242,234,0.7); font-family: var(--font-body); font-weight: 600; font-size: 12px; cursor: pointer; transition: background 180ms ease, color 180ms ease, border-color 180ms ease; } .scenario-mode-opt:hover { color: var(--lq-cream, #f6f2ea); border-color: rgba(146,184,255,0.5); } .scenario-mode-opt.is-on { background: var(--lq-cream, #f6f2ea); color: #131b33; border-color: var(--lq-cream, #f6f2ea); }`}</style>
    </div>
  )
}
