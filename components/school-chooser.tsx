'use client'

/**
 * Schools door — "Are you a student, or a careers advisor/leader?" Dark
 * cinema register, built from JourneyFlow's existing jin-* intake pattern
 * (same shell, same question-card idiom) rather than inventing new visual
 * language.
 *
 * Student picks a first-time-only second question (Work scenarios vs
 * Journeys, each with a one-line description) if no preference is stored
 * yet; after that, returning students skip straight past it — the header
 * toggle (StudentScenarioHeader) is how they change their mind later.
 */

import { useState } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { jinStyles } from '@/components/journey/jin-styles'
import { loadScenarioModePreference, saveScenarioModePreference } from '@/lib/studentScenarioMode'
import type { ScenarioSection } from '@/lib/roles'

interface SchoolChooserProps {
  onSelectStudent: (mode: ScenarioSection) => void
  onSelectAdvisor: () => void
  onBack: () => void
}

export function SchoolChooser({ onSelectStudent, onSelectAdvisor, onBack }: SchoolChooserProps) {
  const [stage, setStage] = useState<'role' | 'mode'>('role')

  const chooseStudent = () => {
    const pref = loadScenarioModePreference()
    if (pref) {
      onSelectStudent(pref)
      return
    }
    setStage('mode')
  }

  const chooseMode = (mode: ScenarioSection) => {
    saveScenarioModePreference(mode)
    onSelectStudent(mode)
  }

  return (
    <main className="jin-root">
      <div className="jin-top">
        <LaunchWordmark height={34} tone="light" ariaLabel="LAUNCH" />
        <span className="jin-top-meta">· schools</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="jin-ghost" onClick={stage === 'mode' ? () => setStage('role') : onBack}>
          ← Back
        </button>
      </div>

      <section className="jin-stage">
        {stage === 'role' ? (
          <div className="jin-card" key="role">
            <div className="jin-eyebrow">Schools</div>
            <h1 className="jin-q">Are you a student, or a careers advisor/leader?</h1>
            <p className="jin-sub">Pick the door that&rsquo;s yours.</p>
            <div className="chooser-options">
              <button type="button" className="chooser-option" onClick={chooseStudent}>
                <span className="chooser-option-eyebrow">Student</span>
                <span className="chooser-option-title">I&rsquo;m a student</span>
                <span className="chooser-option-blurb">Work scenarios and Journeys — step into a role.</span>
                <span className="chooser-option-arrow">Step in →</span>
              </button>
              <button type="button" className="chooser-option" onClick={onSelectAdvisor}>
                <span className="chooser-option-eyebrow">Careers advisor / leader</span>
                <span className="chooser-option-title">I&rsquo;m a careers advisor</span>
                <span className="chooser-option-blurb">Cohorts, heatmap, subject-fit, per-student guidance.</span>
                <span className="chooser-option-arrow">Step in →</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="jin-card" key="mode">
            <div className="jin-eyebrow">One more thing</div>
            <h1 className="jin-q">Work scenarios, or Journeys?</h1>
            <p className="jin-sub">You can switch anytime once you&rsquo;re in — this just picks where you start.</p>
            <div className="chooser-options">
              <button type="button" className="chooser-option" onClick={() => chooseMode('work')}>
                <span className="chooser-option-eyebrow">Work scenarios</span>
                <span className="chooser-option-title">Work scenarios</span>
                <span className="chooser-option-blurb">A real workplace decision, right now.</span>
                <span className="chooser-option-arrow">Step in →</span>
              </button>
              <button type="button" className="chooser-option" onClick={() => chooseMode('journey')}>
                <span className="chooser-option-eyebrow">Journeys</span>
                <span className="chooser-option-title">Journeys</span>
                <span className="chooser-option-blurb">Pick something you love, and step into a story built around it.</span>
                <span className="chooser-option-arrow">Step in →</span>
              </button>
            </div>
          </div>
        )}
      </section>
      <style>{jinStyles}</style>
    </main>
  )
}
