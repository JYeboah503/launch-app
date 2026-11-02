'use client'

/**
 * CredentialModal — the FULL Launch Institute Candidate Credential, shown
 * from a student profile. A faithful replica of the designed credential
 * document (Launch_Candidate Credential_Sample.pdf): header + verified
 * mark, headline strengths, the ten-capability table with levels and
 * published instruments, Launch summary, recent workplace scenarios, and
 * the assessment record with verification. Populated from the student's
 * real data. Below it: the $39 purchase CTA — the demo's sales moment.
 * (Full build: name + a couple of skills visible, the rest blurred behind
 * purchase.)
 */

import { useState } from 'react'
import {
  overallScore, topStrengths, careerHighlights, growthSince, growthAreas,
  CAPABILITY_SHORT, UNI_YEAR_LABEL,
  type EdStudent, type CapabilityScores,
} from '@/lib/educator'
import type { Institution } from '@/components/educator/types'
import { ModalShell } from '@/components/educator/ui'
import { Download, BadgeCheck } from 'lucide-react'

/* ── Credential copy per capability (demo voice, from the sample) ──── */

const FAMILIES: { family: string; caps: string[] }[] = [
  { family: 'Reasoning & Judgement', caps: ['Problem Solving', 'Reasoning & Critical Thinking', 'Judgement & Decision-Making', 'Situational Awareness & Systems Thinking', 'Adaptability & Cognitive Flexibility'] },
  { family: 'People & Influence', caps: ['Emotional Intelligence', 'Leadership & Influence', 'Collaboration'] },
  { family: 'Character & Drive', caps: ['Integrity & Ethics', 'Execution & Ownership'] },
]

const DEMONSTRATED: Record<string, string> = {
  'Problem Solving': 'Solves novel, ambiguous problems; names assumptions and weighs evidence for quality',
  'Reasoning & Critical Thinking': 'Tests assumptions; weighs evidence by quality, not volume',
  'Judgement & Decision-Making': 'Makes sound calls on incomplete information; pre-sets a point to reverse',
  'Situational Awareness & Systems Thinking': 'Reads multiple cues and projects the next step',
  'Adaptability & Cognitive Flexibility': 'Changes strategy when new information warrants',
  'Emotional Intelligence': 'Infers others’ emotions from cues, not labels',
  'Leadership & Influence': 'Leads through explanation and shared purpose',
  'Collaboration': 'Backs teammates up; thinks in team outcomes',
  'Integrity & Ethics': 'Discloses own interest; consistent throughout',
  'Execution & Ownership': 'Finishes what they start; owns the outcome under strain',
}

const BASIS: Record<string, string> = {
  'Problem Solving': 'PISA CPS · Raven’s APM',
  'Reasoning & Critical Thinking': 'Halpern HCTA · Watson-Glaser',
  'Judgement & Decision-Making': 'A-DMC · Klein RPD',
  'Situational Awareness & Systems Thinking': 'Endsley SA model · SAGAT',
  'Adaptability & Cognitive Flexibility': 'I-ADAPT-M · Pulakos taxonomy',
  'Emotional Intelligence': 'MSCEIT (ability EI)',
  'Leadership & Influence': 'MLQ-5X · French & Raven',
  'Collaboration': 'Salas Big Five of Teamwork · TKI',
  'Integrity & Ethics': 'HEXACO Honesty-Humility',
  'Execution & Ownership': 'Grit Scale · NEO Conscientiousness',
}

function levelFor(score: number): { label: string; filled: number; cls: string } {
  if (score >= 80) return { label: 'Advanced', filled: 4, cls: 'lv-adv' }
  if (score >= 65) return { label: 'Proficient', filled: 3, cls: 'lv-pro' }
  if (score >= 50) return { label: 'Developing', filled: 2, cls: 'lv-dev' }
  return { label: 'Emerging', filled: 1, cls: 'lv-emg' }
}

/** Deterministic QR-looking mark (demo — real build links launchapp.au/verify). */
function QrMark({ seed }: { seed: string }) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const cells: boolean[] = []
  let a = h >>> 0
  for (let i = 0; i < 121; i++) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    cells.push((a & 0xff) > 118)
  }
  return (
    <svg viewBox="0 0 11 11" width="74" height="74" aria-hidden style={{ display: 'block' }}>
      <rect width="11" height="11" fill="#fff" />
      {cells.map((on, i) => on && <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" fill="#0e1833" />)}
      {[[0, 0], [8, 0], [0, 8]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#0e1833" />
          <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" fill="#fff" />
          <rect x={x + 1.1} y={y + 1.1} width="0.8" height="0.8" fill="#0e1833" />
        </g>
      ))}
    </svg>
  )
}

export function CredentialModal({
  student, scores, schoolName, institution, runs: runsProp, onClose,
}: {
  student: EdStudent
  /** Live-aware scores (the profile passes what it displays). */
  scores: CapabilityScores
  schoolName: string
  institution: Institution
  /** The runs the profile shows (lazy-generated or live). */
  runs?: import('@/lib/educator').ScenarioRun[]
  onClose: () => void
}) {
  const [purchased, setPurchased] = useState(false)
  const uni = institution === 'university'
  const first = student.name.split(' ')[0]
  const overall = overallScore(scores)
  const growth = growthSince(student)
  const strengths = topStrengths(scores, 3)
  const focus = growthAreas(scores, 1)[0]
  const industries = careerHighlights(scores, 3)
  const runs = (runsProp ?? student.scenarioHistory ?? []).slice(0, 3)
  const gradYear = uni ? 2026 + Math.max(0, 3 - Math.min(student.yearGroup, 3)) : 2026 + Math.max(0, 12 - student.yearGroup)
  const atar = Math.min(99, 55 + Math.round(overall * 0.45))
  const wam = Math.min(92, 48 + Math.round(overall * 0.42))
  const yearLabel = uni ? UNI_YEAR_LABEL[student.yearGroup] ?? `Year ${student.yearGroup}` : `Year ${student.yearGroup}`
  const credentialId = `LCH-2026-NSW-${(1000 + (student.id.length * 97 + student.id.charCodeAt(2) * 31) % 9000)}`

  return (
    <ModalShell title="Launch Credential" onClose={onClose} wide>
      {/* ── The credential document ─────────────────────────────── */}
      <div className="crd">
        {/* Header */}
        <div className="crd-head">
          <img src="images/launch-wordmark-dark.png" alt="LAUNCH INSTITUTE" style={{ height: 44 }} />
          <div className="crd-head-r">
            <div className="crd-doc-title">Candidate Credential</div>
            <div className="crd-verified">✓ Verified by FUSE</div>
          </div>
        </div>
        <div className="crd-rule" />

        {/* Identity */}
        <h2 className="crd-name">{student.name}</h2>
        <div className="crd-tags">
          {student.careerInterest && <span className="crd-tag">{student.careerInterest}</span>}
          {industries.slice(0, student.careerInterest ? 2 : 3).map((c) => <span key={c.name} className="crd-tag">{c.name}</span>)}
        </div>
        <div className="crd-idline">
          {uni ? (
            <>
              <strong>{student.course ?? 'Undergraduate'} · {yearLabel}</strong>
              <span className="crd-sep">|</span> WAM <strong>{wam}</strong>
              <span className="crd-sep">|</span> {schoolName}
              <span className="crd-sep">|</span> Graduating {gradYear}
            </>
          ) : (
            <>
              <strong>Year {student.yearGroup} · {schoolName}</strong>
              <span className="crd-sep">|</span> ATAR track <strong>{atar}</strong>
              <span className="crd-sep">|</span> Cohort: school leaver {gradYear}
            </>
          )}
        </div>

        {/* Headline strengths */}
        <div className="crd-sec">Headline strengths</div>
        <div className="crd-strengths">
          {strengths.map((s, i) => (
            <div key={s.name} className={`crd-str ${i === 0 ? 'is-first' : ''}`}>
              <div className="crd-str-eyebrow">Strength 0{i + 1}{i === 0 ? ' · Strongest' : ''}</div>
              <div className="crd-str-name">{CAPABILITY_SHORT[s.name] ?? s.name}</div>
              <p className="crd-str-body">{DEMONSTRATED[s.name] ?? 'Demonstrated across live scenarios.'}.</p>
            </div>
          ))}
        </div>

        {/* Capability table */}
        <div className="crd-sec">Capability profile · all ten capabilities</div>
        <table className="crd-table">
          <thead>
            <tr><th>Family</th><th>Capability</th><th>Level</th><th>What {first} demonstrated</th><th>Published basis</th></tr>
          </thead>
          <tbody>
            {FAMILIES.map((fam) =>
              fam.caps.map((cap, ci) => {
                const lv = levelFor(scores[cap] ?? 0)
                return (
                  <tr key={cap}>
                    <td className="crd-fam">{ci === 0 ? fam.family : ''}</td>
                    <td className="crd-cap">{cap}</td>
                    <td className={`crd-lv ${lv.cls}`}>
                      <span className="crd-sq">{[0, 1, 2, 3].map((i) => <i key={i} className={i < lv.filled ? 'on' : ''} />)}</span>
                      {lv.label}
                    </td>
                    <td className="crd-dem">{DEMONSTRATED[cap]}</td>
                    <td className="crd-basis">{BASIS[cap]}</td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
        <p className="crd-legend">
          <b>Levels:</b> <b>Advanced</b> consistently expert reasoning · <b className="t">Proficient</b> sound and reliable · <b>Developing</b> present, still building · <b>Emerging</b> early signal only
        </p>

        {/* Launch summary */}
        <div className="crd-sec">Launch summary</div>
        <blockquote className="crd-quote">
          “{first} is in {uni ? (student.yearGroup >= 4 ? 'the Honours year' : `${yearLabel.toLowerCase()} of ${student.course ?? 'their degree'}`) : `Year ${student.yearGroup}`}, and the capability profile tells a story a {uni ? 'transcript' : 'report card'} can’t.
          Across live scenarios {first} shows {CAPABILITY_SHORT[strengths[0].name]?.toLowerCase()}, {CAPABILITY_SHORT[strengths[1].name]?.toLowerCase()} and {CAPABILITY_SHORT[strengths[2].name]?.toLowerCase()} under real pressure.
          {focus ? ` ${CAPABILITY_SHORT[focus.name]} is the one to keep developing — and it is improving with each attempt.` : ''}”
        </blockquote>

        {/* Recent scenarios */}
        {runs.length > 0 && (
          <>
            <div className="crd-sec">Recent workplace scenarios</div>
            <div className="crd-runs">
              {runs.map((r, i) => (
                <div key={r.id} className="crd-run">
                  <span className="crd-run-n">{i + 1}</span>
                  <b>{r.title}</b>
                  <span className="crd-run-meta">{r.capabilities.map((c) => CAPABILITY_SHORT[c] ?? c).join(' · ')}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Assessment record */}
        <div className="crd-sec">Assessment record and verification</div>
        <div className="crd-record">
          <div className="crd-rec-cols">
            <div>
              <div className="crd-rec-row"><span>Credential ID</span><b>{credentialId}</b></div>
              <div className="crd-rec-row"><span>Issued</span><b>21 July 2026</b></div>
              <div className="crd-rec-row"><span>Valid to</span><b>21 July 2028, then re-assessed</b></div>
              <div className="crd-rec-row"><span>Scoring</span><b>FUSE rubric, each rule anchored to a published source; flagged items reviewed by a human marker</b></div>
            </div>
            <div>
              <div className="crd-rec-row"><span>Scenarios completed</span><b>{Math.max(runs.length, 3) + Math.round(student.totalUseHours / 1.5)} across live tracks</b></div>
              <div className="crd-rec-row"><span>Engagement</span><b>{student.totalUseHours || 12.4} hours · {student.streakWeeks || 3}-week streak · 100% completion</b></div>
              <div className="crd-rec-row"><span>Score growth</span><b className="t">+{Math.max(growth, 2)}% across all capabilities since first attempt</b></div>
              <div className="crd-rec-row"><span>AI-integrity check</span><b className="t">Passed · responses consistent in style and reasoning across sessions; no generated-text signal</b></div>
            </div>
            <div className="crd-qr">
              <QrMark seed={credentialId} />
              <span>launchapp.au/verify</span>
            </div>
          </div>
        </div>

        <p className="crd-fine">
          Capabilities are assessed by FUSE, Launch’s scenario-based assessment engine. Candidates work through realistic, role-relevant scenarios in open text and are scored on how they reason, decide and act — capabilities a CV cannot evidence. Levels reflect demonstrated performance across completed scenarios at the time of assessment. A credential informs a hiring decision alongside interview and reference checks; it is never the sole basis for one.
        </p>
      </div>

      {/* ── Purchase ────────────────────────────────────────────── */}
      <div className="cred-buy">
        {purchased ? (
          <div className="cred-done">
            <BadgeCheck className="w-5 h-5" style={{ color: 'var(--launch-teal)' }} />
            <span>Demo preview — secure checkout and the downloadable credential arrive with the full build.</span>
          </div>
        ) : (
          <>
            <button type="button" className="ed-btn ed-btn-primary cred-buy-btn" onClick={() => setPurchased(true)}>
              <Download className="w-4 h-4" /> Purchase your certified Launch Credential — $39
            </button>
            <p className="cred-hint">Download your Launch Institute Credential here.</p>
            <p className="cred-founding">
              Founding {uni ? 'university' : 'school'} partners signing before Christmas receive their first 12 months of credentials free.
            </p>
          </>
        )}
      </div>

      <style>{credStyles}</style>
    </ModalShell>
  )
}

const credStyles = `
  /* This modal carries a full document — give it more room than the default. */
  .ed-modal-card:has(.crd) { max-width: 900px; }

  .crd { background: #fff; border: 1px solid var(--lq-line); border-radius: 12px; padding: 26px 28px; box-shadow: 0 10px 34px -18px rgba(14,24,51,0.25); }

  .crd-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
  .crd-head-r { text-align: right; }
  .crd-doc-title { font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--launch-navy); }
  .crd-verified { font-family: var(--font-body); font-weight: 700; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--launch-teal-2); margin-top: 3px; }
  .crd-rule { height: 1px; background: var(--lq-line-2); margin: 16px 0 18px; }

  .crd-name { font-family: var(--font-body); font-weight: 800; font-size: clamp(26px, 4vw, 34px); letter-spacing: -0.02em; color: var(--lq-ink); margin: 0 0 8px; }
  .crd-tags { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
  .crd-tag { font-family: var(--font-body); font-weight: 700; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--launch-teal-3); background: rgba(27,158,143,0.10); padding: 4px 10px; border-radius: 4px; }
  .crd-idline { font-size: 14px; color: var(--lq-ink-2); }
  .crd-idline strong { color: var(--lq-ink); }
  .crd-sep { margin: 0 9px; color: var(--lq-ink-3); }

  .crd-sec { font-family: var(--font-body); font-weight: 800; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lq-ink-2); margin: 22px 0 10px; }

  .crd-strengths { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  @media (max-width: 640px) { .crd-strengths { grid-template-columns: 1fr; } }
  .crd-str { background: #faf6ec; border: 1px solid rgba(201,160,80,0.25); border-radius: 6px; padding: 13px 14px; }
  .crd-str.is-first { background: #16294e; border-color: #16294e; }
  .crd-str-eyebrow { font-family: var(--font-body); font-weight: 800; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--launch-teal-2); margin-bottom: 6px; }
  .crd-str.is-first .crd-str-eyebrow { color: #4fd1c0; }
  .crd-str-name { font-family: var(--font-body); font-weight: 800; font-size: 18px; letter-spacing: -0.01em; color: var(--lq-ink); margin-bottom: 6px; }
  .crd-str.is-first .crd-str-name { color: #fff; }
  .crd-str-body { font-size: 12px; line-height: 1.5; color: var(--lq-ink-2); }
  .crd-str.is-first .crd-str-body { color: rgba(255,255,255,0.82); }

  .crd-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .crd-table th { text-align: left; font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lq-ink-3); padding: 7px 8px 7px 0; border-bottom: 1px solid var(--lq-line-2); }
  .crd-table td { padding: 9px 8px 9px 0; border-bottom: 1px solid var(--lq-line); vertical-align: top; line-height: 1.45; }
  .crd-fam { font-weight: 700; color: var(--launch-teal-3); width: 92px; font-size: 11.5px; }
  .crd-cap { font-weight: 700; color: var(--lq-ink); width: 170px; }
  .crd-lv { white-space: nowrap; font-weight: 700; width: 118px; }
  .crd-lv.lv-adv { color: var(--launch-navy); }
  .crd-lv.lv-pro { color: var(--launch-teal-3); }
  .crd-lv.lv-dev { color: var(--lq-ink-2); }
  .crd-lv.lv-emg { color: var(--lq-ink-3); }
  .crd-sq { display: inline-flex; gap: 2px; margin-right: 7px; vertical-align: -1px; }
  .crd-sq i { width: 7px; height: 7px; background: var(--lq-line-2); display: inline-block; }
  .crd-sq i.on { background: currentColor; }
  .crd-dem { color: var(--lq-ink-2); }
  .crd-basis { color: var(--lq-ink-3); font-size: 11px; width: 140px; }
  .crd-legend { font-size: 11px; color: var(--lq-ink-3); margin-top: 9px; }
  .crd-legend b { color: var(--lq-ink-2); }
  .crd-legend b.t { color: var(--launch-teal-3); }

  .crd-quote { margin: 0; background: rgba(27,158,143,0.06); border-left: 3px solid var(--launch-teal); border-radius: 0 8px 8px 0; padding: 14px 16px; font-family: var(--font-display); font-style: italic; font-size: 14.5px; line-height: 1.6; color: var(--lq-ink-2); }

  .crd-runs { display: flex; flex-direction: column; gap: 8px; }
  .crd-run { display: flex; align-items: baseline; gap: 10px; font-size: 13px; color: var(--lq-ink); flex-wrap: wrap; }
  .crd-run-n { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: var(--launch-navy); color: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700; border-radius: 3px; flex-shrink: 0; align-self: center; }
  .crd-run-meta { color: var(--lq-ink-3); font-size: 12px; }

  .crd-record { border: 1px solid var(--lq-line-2); border-radius: 8px; padding: 14px 16px; background: #fbf8f1; }
  .crd-rec-cols { display: grid; grid-template-columns: 1fr 1.2fr auto; gap: 18px; }
  @media (max-width: 680px) { .crd-rec-cols { grid-template-columns: 1fr; } }
  .crd-rec-row { margin-bottom: 8px; font-size: 11.5px; line-height: 1.45; }
  .crd-rec-row span { display: block; font-weight: 800; font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-bottom: 1px; }
  .crd-rec-row b { font-weight: 600; color: var(--lq-ink); }
  .crd-rec-row b.t { color: var(--launch-teal-3); font-weight: 700; }
  .crd-qr { display: flex; flex-direction: column; align-items: center; gap: 6px; align-self: center; }
  .crd-qr span { font-family: var(--font-body); font-weight: 700; font-size: 10px; color: var(--lq-ink-2); }

  .crd-fine { margin-top: 16px; font-size: 9.5px; line-height: 1.55; color: var(--lq-ink-3); }

  .cred-buy { text-align: center; padding: 20px 6px 2px; }
  .cred-buy-btn { font-size: 14.5px; padding: 12px 24px; }
  .cred-hint { font-size: 12.5px; color: var(--lq-ink-3); margin-top: 10px; }
  .cred-founding { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--launch-navy); margin-top: 10px; }
  .cred-done { display: inline-flex; align-items: center; gap: 10px; background: rgba(27,158,143,0.10); border: 1px solid rgba(27,158,143,0.30); border-radius: 12px; padding: 12px 18px; font-size: 13.5px; color: var(--lq-ink-2); text-align: left; }
`
