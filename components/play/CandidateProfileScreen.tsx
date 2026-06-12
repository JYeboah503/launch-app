'use client'

import { useState } from 'react'
import {
  type CandidateProfile,
  type ProfileSectionKey,
  PROFILE_SECTIONS,
  INDUSTRIES,
  SELF_RATE_OPTIONS,
  EMPTY_PROFILE,
  isProfileMinimallyComplete,
  type Industry,
} from '@/lib/candidateProfile'

/**
 * CandidateProfileScreen — runs before the scenario (and before any
 * pre-qualifier intake questions). Captures the basic + comprehensive
 * profile fields that power the partner's filter UX on the role detail
 * page.
 *
 * Section-by-section so candidates don't see a wall of fields. Section 1
 * (Basics) is required; the rest are skippable but encouraged.
 *
 * Visual theme follows the play-shell's data-theme attribute — same
 * register-aware styling as the rest of the play flow.
 */

interface Props {
  initialProfile?: CandidateProfile
  isProfessional: boolean
  onContinue: (profile: CandidateProfile) => void
}

const CURRENT_YEAR = 2026

export function CandidateProfileScreen({ initialProfile, isProfessional, onContinue }: Props) {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile ?? EMPTY_PROFILE())
  const [section, setSection] = useState<ProfileSectionKey>('basics')

  const sectionIndex = PROFILE_SECTIONS.findIndex(s => s.key === section)
  const sectionDef = PROFILE_SECTIONS[sectionIndex]
  const isLastSection = sectionIndex === PROFILE_SECTIONS.length - 1

  const patch = (p: Partial<CandidateProfile>) => setProfile((prev) => ({ ...prev, ...p }))

  const canAdvance =
    section === 'basics' ? isProfileMinimallyComplete(profile) : true

  const goNext = () => {
    if (!canAdvance) return
    if (isLastSection) {
      onContinue(profile)
    } else {
      setSection(PROFILE_SECTIONS[sectionIndex + 1].key)
    }
  }
  const goSkip = () => {
    if (isLastSection) {
      onContinue(profile)
    } else {
      setSection(PROFILE_SECTIONS[sectionIndex + 1].key)
    }
  }
  const goBack = () => {
    if (sectionIndex > 0) setSection(PROFILE_SECTIONS[sectionIndex - 1].key)
  }

  // Toggle helpers for multi-select fields
  const toggleIndustry = (i: Industry) => {
    const cur = profile.industries || []
    patch({
      industries: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i],
    })
  }
  const toggleStrength = (key: string) => {
    const cur = profile.selfRatedStrengths || []
    if (cur.includes(key)) {
      patch({ selfRatedStrengths: cur.filter((x) => x !== key) })
    } else if (cur.length < 3) {
      patch({ selfRatedStrengths: [...cur, key] })
    }
  }

  return (
    <div className="cp-root">
      <div className="cp-wrap">
        {/* Progress strip */}
        <div className="cp-progress">
          {PROFILE_SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={`cp-progress-bar ${i <= sectionIndex ? 'is-on' : ''}`}
            />
          ))}
        </div>

        <div className="cp-eyebrow">
          About you · Section {sectionIndex + 1} of {PROFILE_SECTIONS.length}
        </div>
        <h1 className="cp-title">{sectionDef.title}</h1>
        <p className="cp-helper">{sectionDef.helper}</p>

        {/* Section body */}
        <div className="cp-body">
          {section === 'basics' && (
            <>
              <Field label="Full name" required>
                <input
                  className="cp-input"
                  value={profile.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Jane Patel"
                  autoFocus
                />
              </Field>
              <Field label="Email" required>
                <input
                  className="cp-input"
                  type="email"
                  value={profile.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  placeholder="jane.patel@email.com"
                />
              </Field>
              <div className="cp-grid-2">
                <Field label="Phone (optional)">
                  <input
                    className="cp-input"
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => patch({ phone: e.target.value })}
                    placeholder="04xx xxx xxx"
                  />
                </Field>
                <Field label="Location">
                  <input
                    className="cp-input"
                    value={profile.location || ''}
                    onChange={(e) => patch({ location: e.target.value })}
                    placeholder="Sydney, NSW"
                  />
                </Field>
              </div>
            </>
          )}

          {section === 'education' && (
            <>
              <div className="cp-grid-2">
                <Field label="ATAR or equivalent">
                  <input
                    className="cp-input"
                    type="number"
                    step="0.05"
                    min={0}
                    max={99.95}
                    value={profile.atar ?? ''}
                    onChange={(e) => patch({ atar: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    placeholder="95.30"
                  />
                </Field>
                <Field label="Graduation year">
                  <input
                    className="cp-input"
                    type="number"
                    min={CURRENT_YEAR - 10}
                    max={CURRENT_YEAR + 5}
                    value={profile.graduationYear ?? ''}
                    onChange={(e) => patch({ graduationYear: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
                    placeholder={String(CURRENT_YEAR + 1)}
                  />
                </Field>
              </div>
              <Field label="University">
                <input
                  className="cp-input"
                  value={profile.university || ''}
                  onChange={(e) => patch({ university: e.target.value })}
                  placeholder="University of Sydney"
                />
              </Field>
              <Field label="Degree">
                <input
                  className="cp-input"
                  value={profile.degree || ''}
                  onChange={(e) => patch({ degree: e.target.value })}
                  placeholder="B. Commerce / B. Property Economics"
                />
              </Field>
              <Field label="Major or specialisation (optional)">
                <input
                  className="cp-input"
                  value={profile.major || ''}
                  onChange={(e) => patch({ major: e.target.value })}
                  placeholder="Finance, Real Estate, Marketing…"
                />
              </Field>
            </>
          )}

          {section === 'background' && (
            <>
              <Field label="Work rights">
                <Picker
                  options={[
                    { value: 'citizen-permanent', label: 'Citizen or PR' },
                    { value: 'visa-unrestricted', label: 'Visa — unrestricted' },
                    { value: 'visa-restricted', label: 'Visa — sponsorship needed' },
                    { value: 'no-rights', label: 'Not yet' },
                  ]}
                  value={profile.workRights || ''}
                  onPick={(v) => patch({ workRights: v as any })}
                />
              </Field>
              <Field label="Current status">
                <Picker
                  options={[
                    { value: 'studying', label: 'Studying full-time' },
                    { value: 'studying-working-pt', label: 'Studying + part-time work' },
                    { value: 'working-pt', label: 'Working part-time' },
                    { value: 'working-ft', label: 'Working full-time' },
                    { value: 'between-roles', label: 'Between roles' },
                    { value: 'graduated-job-seeking', label: 'Graduated — looking' },
                  ]}
                  value={profile.employmentStatus || ''}
                  onPick={(v) => patch({ employmentStatus: v as any })}
                />
              </Field>
              <Field label="Industries you're drawn to" helper="Multi-select.">
                <div className="cp-chips">
                  {INDUSTRIES.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`cp-chip ${(profile.industries || []).includes(i) ? 'is-on' : ''}`}
                      onClick={() => toggleIndustry(i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </Field>
              <Field
                label="Your strongest 3 capabilities"
                helper={`Pick up to 3 — what you think you're best at. ${(profile.selfRatedStrengths || []).length}/3.`}
              >
                <div className="cp-chips">
                  {SELF_RATE_OPTIONS.map((s) => {
                    const on = (profile.selfRatedStrengths || []).includes(s.key)
                    const disabled = !on && (profile.selfRatedStrengths || []).length >= 3
                    return (
                      <button
                        key={s.key}
                        type="button"
                        disabled={disabled}
                        className={`cp-chip ${on ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
                        onClick={() => toggleStrength(s.key)}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </>
          )}

          {section === 'looking' && (
            <>
              <Field label="Earliest start date">
                <input
                  className="cp-input"
                  type="date"
                  value={profile.availableFrom || ''}
                  onChange={(e) => patch({ availableFrom: e.target.value })}
                />
              </Field>
              <Field label="Expected salary range (AUD)">
                <Picker
                  options={[
                    { value: 'under-60', label: 'Under $60k' },
                    { value: '60-75', label: '$60–75k' },
                    { value: '75-90', label: '$75–90k' },
                    { value: '90-110', label: '$90–110k' },
                    { value: '110-130', label: '$110–130k' },
                    { value: '130-150', label: '$130–150k' },
                    { value: '150-plus', label: '$150k+' },
                    { value: 'flexible', label: 'Flexible / open' },
                  ]}
                  value={profile.expectedSalary || ''}
                  onPick={(v) => patch({ expectedSalary: v as any })}
                />
              </Field>
              <Field label="Willing to relocate">
                <Picker
                  options={[
                    { value: 'yes-anywhere', label: 'Anywhere' },
                    { value: 'yes-in-country', label: 'Within country' },
                    { value: 'yes-in-state', label: 'Within state' },
                    { value: 'no', label: 'No — local only' },
                  ]}
                  value={profile.willingRelocate || ''}
                  onPick={(v) => patch({ willingRelocate: v as any })}
                />
              </Field>
              <Field label="Why are you looking right now? (optional)" helper="Keep it short — 1–2 sentences.">
                <textarea
                  className="cp-textarea"
                  value={profile.whyLooking || ''}
                  onChange={(e) => patch({ whyLooking: e.target.value })}
                  placeholder="Finishing my Property Economics degree and ready to put it to work."
                  rows={3}
                />
              </Field>
            </>
          )}
        </div>

        {/* Footer — Back / Skip / Next */}
        <div className="cp-foot">
          {sectionIndex > 0 ? (
            <button type="button" className="cp-btn cp-btn-ghost" onClick={goBack}>
              ← Back
            </button>
          ) : <span />}

          <div className="cp-foot-right">
            {!sectionDef.required && (
              <button type="button" className="cp-btn cp-btn-text" onClick={goSkip}>
                Skip this section
              </button>
            )}
            <button
              type="button"
              className="cp-btn cp-btn-primary"
              onClick={goNext}
              disabled={!canAdvance}
            >
              {isLastSection ? 'Continue to scenario →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cp-root {
          position: absolute;
          inset: 0;
          z-index: 6;
          background: var(--bg);
          color: var(--ink);
          display: flex;
          justify-content: center;
          padding: clamp(28px, 5vw, 64px) clamp(20px, 4vw, 56px);
          overflow-y: auto;
        }
        .cp-wrap {
          width: 100%;
          max-width: ${isProfessional ? 680 : 760}px;
          margin: 0 auto;
        }
        .cp-progress {
          display: flex;
          gap: 4px;
          margin-bottom: 28px;
        }
        .cp-progress-bar {
          flex: 1;
          height: 3px;
          border-radius: 999px;
          background: var(--line-2);
          transition: background 200ms ease;
        }
        .cp-progress-bar.is-on { background: var(--accent); }
        .cp-eyebrow {
          font-family: var(--f-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 12px;
        }
        .cp-title {
          font-family: var(--f-display);
          font-weight: 500;
          font-size: clamp(28px, 3.6vw, 40px);
          letter-spacing: -0.022em;
          line-height: 1.08;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .cp-helper {
          margin: 0 0 28px;
          color: var(--ink-2);
          font-size: 15px;
          line-height: 1.55;
        }
        .cp-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .cp-grid-2 {
          display: grid;
          gap: 18px;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 540px) {
          .cp-grid-2 { grid-template-columns: 1fr; }
        }
        .cp-input, .cp-textarea {
          width: 100%;
          background: var(--bg-2);
          border: 1px solid var(--line-2);
          border-radius: ${isProfessional ? 8 : 12}px;
          padding: 12px 14px;
          font-family: var(--f-body);
          font-size: 15px;
          line-height: 1.45;
          color: var(--ink);
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .cp-input:focus, .cp-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .cp-textarea { resize: vertical; min-height: 80px; }
        .cp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cp-chip {
          appearance: none;
          background: var(--bg-2);
          border: 1px solid var(--line-2);
          border-radius: 999px;
          padding: 7px 13px;
          font-family: var(--f-body);
          font-size: 13px;
          color: var(--ink-2);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
        }
        .cp-chip:hover:not(.is-disabled) {
          border-color: var(--accent);
          color: var(--ink);
        }
        .cp-chip.is-on {
          background: var(--accent-soft);
          color: var(--accent);
          border-color: var(--accent);
        }
        .cp-chip.is-disabled { opacity: 0.4; cursor: not-allowed; }
        .cp-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 36px;
          padding-top: 22px;
          border-top: 1px solid var(--line-2);
        }
        .cp-foot-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .cp-btn {
          appearance: none;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 10px 18px;
          font-family: var(--f-body);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .cp-btn-primary {
          background: var(--accent);
          color: var(--bg);
          border-color: var(--accent);
        }
        .cp-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .cp-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .cp-btn-ghost {
          background: transparent;
          color: var(--ink-2);
          border-color: var(--line-2);
        }
        .cp-btn-ghost:hover { color: var(--ink); border-color: var(--accent); }
        .cp-btn-text {
          background: transparent;
          color: var(--ink-3);
          border: none;
          padding: 10px 12px;
          font-size: 13px;
        }
        .cp-btn-text:hover { color: var(--ink); }
      `}</style>
    </div>
  )
}

/* ---- helper sub-components ---- */

function Field({
  label,
  helper,
  required,
  children,
}: { label: string; helper?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="cp-field">
      <label className="cp-label">
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {helper && <p className="cp-field-helper">{helper}</p>}
      {children}
      <style>{`
        .cp-field { display: flex; flex-direction: column; gap: 6px; }
        .cp-label {
          font-family: var(--f-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-3);
          font-weight: 600;
        }
        .cp-field-helper {
          margin: -2px 0 4px;
          font-size: 12px;
          color: var(--ink-3);
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

function Picker({
  options,
  value,
  onPick,
}: {
  options: { value: string; label: string }[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <div className="cp-chips">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`cp-chip ${value === o.value ? 'is-on' : ''}`}
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
