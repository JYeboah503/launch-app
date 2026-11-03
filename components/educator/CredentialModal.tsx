'use client'

/**
 * CredentialModal — the six-page Launch Capability Report, opened from a
 * student profile. A faithful replica of the designed document
 * (Launch_Capability_Report_Sample.pdf): the credential face, two pages
 * of profile interpretation with observed behaviours and interview
 * probes, the levels rubric, response & integrity indicators, and the
 * interview guide. Every page is populated from the student's own data
 * via lib/credentialReport.ts, so all ~2,800 sample students render
 * their own report. Below the document: the $39 purchase CTA — the
 * demo's sales moment. (Full build: name + a couple of skills visible,
 * the rest blurred behind purchase.)
 */

import { useState } from 'react'
import {
  overallScore, careerHighlights, CAPABILITY_SHORT, UNI_YEAR_LABEL,
  type EdStudent, type CapabilityScores,
} from '@/lib/educator'
import {
  REPORT_FAMILIES, LEVEL_LEGEND, LEVEL_RUBRIC, MEASUREMENT_ROWS,
  scoredCaps, familyBlurb, launchSummary, roleFitReading, reportGains, fillScenarios,
  type ReportLevel, type ScoredCap,
} from '@/lib/credentialReport'
import type { Institution } from '@/components/educator/types'
import { ModalShell } from '@/components/educator/ui'
import { Download, BadgeCheck } from 'lucide-react'

/* ── Small marks ───────────────────────────────────────────────────── */

/** Deterministic QR-looking mark (demo — real build links launchapp.au/verify). */
function QrMark({ seed, size = 72 }: { seed: string; size?: number }) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const cells: boolean[] = []
  let a = h >>> 0
  for (let i = 0; i < 121; i++) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    cells.push((a & 0xff) > 118)
  }
  return (
    <svg viewBox="0 0 11 11" width={size} height={size} aria-hidden style={{ display: 'block' }}>
      <rect width="11" height="11" fill="#fff" />
      {cells.map((on, i) => on && <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" fill="#1c2435" />)}
      {[[0, 0], [8, 0], [0, 8]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#1c2435" />
          <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" fill="#fff" />
          <rect x={x + 1.1} y={y + 1.1} width="0.8" height="0.8" fill="#1c2435" />
        </g>
      ))}
    </svg>
  )
}

/** The circular FUSE seal from the document's top-right corner. */
function Seal({ size = 92 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        <path id="crp-seal-arc" d="M 50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#ad8a3b" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#ad8a3b" strokeWidth="0.8" />
      <text fontSize="8" letterSpacing="1.6" style={{ fill: '#2a3550', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
        <textPath href="#crp-seal-arc">VERIFIED BY FUSE · LAUNCH INSTITUTE · ISSUED 21</textPath>
      </text>
      <text x="50" y="57" textAnchor="middle" fontSize="20" fill="#ad8a3b" style={{ fontFamily: 'var(--font-display)' }}>✦</text>
    </svg>
  )
}

/** Edward Morgan's signature flourish. */
function SignatureMark() {
  return (
    <svg viewBox="0 0 150 40" width="124" height="33" aria-hidden>
      <path
        d="M8 28 C 15 7, 26 5, 23 16 C 20 28, 9 34, 17 32 C 29 28, 32 11, 42 11 C 51 11, 42 29, 53 25 C 62 22, 68 9, 77 15 C 84 20, 95 19, 106 13 M 100 22 C 113 17, 128 24, 144 19"
        stroke="#232b3e" strokeWidth="1.7" fill="none" strokeLinecap="round"
      />
    </svg>
  )
}

/** Five level squares + the level badge. */
function LevelMark({ level, squares = true }: { level: ReportLevel; squares?: boolean }) {
  return (
    <span className={`crp-lvl ${level.cls}`}>
      {squares && (
        <span className="crp-sq">
          {[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < level.filled ? 'on' : ''} />)}
        </span>
      )}
      <span className="crp-badge">{level.label.toUpperCase()}</span>
    </span>
  )
}

/** Letterspaced section head with its trailing hairline (page 1). */
function SectionHead({ children }: { children: React.ReactNode }) {
  return <div className="crp-shead"><span>{children}</span><i /></div>
}

/* ── Page chrome (pages 2–6) ───────────────────────────────────────── */

function PageHead({ name, credentialId, page }: { name: string; credentialId: string; page: number }) {
  return (
    <div className="crp-phead">
      <img src="images/launch-wordmark-dark.png" alt="LAUNCH INSTITUTE" style={{ height: 24, opacity: 0.85 }} />
      <span className="crp-phead-mid">Capability Report · {name} · {credentialId}</span>
      <span className="crp-phead-page">Page {page} of 6</span>
    </div>
  )
}

function PageFoot() {
  return (
    <div className="crp-pfoot">
      <p>
        Capabilities are assessed by FUSE, Launch Institute’s scenario-based assessment engine, under the Launch
        Capability Measurement Framework. This report accompanies the credential on page 1 and is a rendering of the
        live record at <b>launchapp.au/verify</b>. Independent validation of the FUSE engine is being pursued.
      </p>
      <span><b>Launch Institute Pty Ltd</b> · ABN 66 691 248 414</span>
    </div>
  )
}

/* ── Profile-interpretation family block (pages 2–3) ───────────────── */

function FamilyBlock({ idx, caps, blurb, runTitles }: {
  idx: number
  caps: ScoredCap[]
  blurb: string
  runTitles: string[]
}) {
  return (
    <div className="crp-famblock">
      <div className="crp-fam-banner">
        <div className="crp-fam-id">
          <div className="crp-fam-eyebrow">Family 0{idx} of 03</div>
          <div className="crp-fam-name">{caps[0].cap.family}</div>
        </div>
        <p>{blurb}</p>
      </div>
      <div className="crp-interp-head">
        <span>Capability · level</span><span>Observed behaviours</span><span>Implications at work</span><span>Interview probe</span>
      </div>
      {caps.map((sc) => (
        <div className="crp-interp-row" key={sc.cap.id}>
          <div>
            <div className="crp-interp-name">{sc.cap.name}</div>
            <LevelMark level={sc.level} />
            <div className="crp-basis">{sc.cap.basis}</div>
          </div>
          <p>{fillScenarios(sc.cap.observed[sc.level.band], runTitles)}</p>
          <p>{sc.cap.implications[sc.level.band]}</p>
          <p className="crp-probe">{sc.cap.probe}</p>
        </div>
      ))}
    </div>
  )
}

/* ── The modal ─────────────────────────────────────────────────────── */

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

  const all = scoredCaps(scores)
  const strengths = [...all].sort((a, b) => b.score - a.score).slice(0, 3)
  const weakest = [...all].sort((a, b) => a.score - b.score)[0]
  const gains = reportGains(student)

  const runs = (runsProp ?? student.scenarioHistory ?? []).slice(0, 3)
  const runTitles = runs.map((r) => r.title)

  const gradYear = uni ? 2026 + Math.max(0, 3 - Math.min(student.yearGroup, 3)) : 2026 + Math.max(0, 12 - student.yearGroup)
  const atar = Math.min(99, 55 + Math.round(overall * 0.45))
  const wam = Math.min(92, 48 + Math.round(overall * 0.42))
  const yearLabel = uni ? UNI_YEAR_LABEL[student.yearGroup] ?? `Year ${student.yearGroup}` : `Year ${student.yearGroup}`
  const credentialId = `LCH-2026-NSW-${(1000 + (student.id.length * 97 + student.id.charCodeAt(2) * 31) % 9000)}`

  // Deterministic engagement numbers (demo — the real build reads the record).
  let hash = 0
  for (let i = 0; i < student.id.length; i++) hash = ((hash << 5) - hash + student.id.charCodeAt(i)) | 0
  hash = Math.abs(hash)
  const hours = student.totalUseHours || 12.4
  const scenCount = Math.max(9, Math.round(hours * 1.6))
  const weeksSpan = 6 + (hash % 5)
  const medianMins = Math.min(44, Math.max(24, Math.round((hours * 60) / scenCount)))

  const tags = [
    ...(student.careerInterest ? [student.careerInterest] : []),
    ...careerHighlights(scores, 3).map((c) => c.name),
  ].filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i).slice(0, 3)

  const summary = launchSummary(student, all, uni, yearLabel)
  const roleFit = roleFitReading(student, all, uni)
  const famBlurbs = REPORT_FAMILIES.map((f) => familyBlurb(f, all, first, uni))
  const famCaps = REPORT_FAMILIES.map((f) => all.filter((c) => c.cap.family === f))

  return (
    <ModalShell title="Launch Credential" onClose={onClose} wide>
      <div className="crp-doc">

        {/* ════ PAGE 1 — the credential face ════════════════════════ */}
        <div className="crp-page">
          <div className="crp-p1-head">
            <div className="crp-p1-brand">
              <img src="images/launch-wordmark-dark.png" alt="LAUNCH INSTITUTE" style={{ height: 38 }} />
              <div className="crp-p1-hca">Human Capability Assessment</div>
            </div>
            <div className="crp-p1-title">
              <h2>Capability<br />Credential</h2>
              <p>Assessed under the Launch Capability Measurement Framework, built on published psychometric instruments and reviewed by human markers.</p>
            </div>
            <Seal />
          </div>
          <div className="crp-rule-gold" />

          <div className="crp-id-row">
            <div>
              <h1 className="crp-name">{student.name}</h1>
              <div className="crp-tags">
                {tags.map((t) => <span key={t} className="crp-tag">{t}</span>)}
              </div>
              <div className="crp-idline">
                {uni ? (
                  <>
                    <strong>{student.course ?? 'Undergraduate'} · {yearLabel}</strong>
                    <span className="crp-sep">|</span> WAM <strong>{wam}</strong>
                    <span className="crp-sep">|</span> {schoolName}
                    <span className="crp-sep">|</span> Cohort: graduate {gradYear}
                  </>
                ) : (
                  <>
                    <strong>Year {student.yearGroup} · {schoolName}</strong>
                    <span className="crp-sep">|</span> ATAR track <strong>{atar}</strong>
                    <span className="crp-sep">|</span> Cohort: school leaver {gradYear}
                  </>
                )}
              </div>
            </div>
            <div className="crp-credid">
              <div>Credential ID <b>{credentialId}</b></div>
              <div>Issued <b>21 July 2026</b> · Valid to <b>21 July 2028</b></div>
              <div>Verify at <b>launchapp.au/verify</b></div>
            </div>
          </div>

          <SectionHead>Headline strengths</SectionHead>
          <div className="crp-strengths">
            {strengths.map((s, i) => (
              <div key={s.cap.id} className={`crp-str ${i === 0 ? 'is-first' : ''}`}>
                <div className="crp-str-eyebrow">Strength 0{i + 1} · {s.level.label}</div>
                <div className="crp-str-name">{s.cap.short}</div>
                <p className="crp-str-body">
                  {s.level.band === 'low'
                    ? `${s.cap.demoLow}. The core behaviours are there; consistency is the work in progress.`
                    : s.cap.card}
                </p>
                <p className="crp-str-tail">{s.level.tail}</p>
              </div>
            ))}
          </div>

          <SectionHead>Capability profile · all ten FUSE capabilities</SectionHead>
          <table className="crp-table">
            <thead>
              <tr><th>Family</th><th>Capability · measurement basis</th><th>Level</th><th>What {first} demonstrated</th></tr>
            </thead>
            <tbody>
              {REPORT_FAMILIES.map((fam, fi) =>
                famCaps[fi].map((sc, ci) => (
                  <tr key={sc.cap.id} className={ci === 0 && fi > 0 ? 'is-fam-first' : ''}>
                    <td className="crp-td-fam">{ci === 0 ? fam : ''}</td>
                    <td className="crp-td-cap">
                      <b>{sc.cap.name}</b>
                      <i>{sc.cap.basis}</i>
                    </td>
                    <td className="crp-td-lvl"><LevelMark level={sc.level} /></td>
                    <td className="crp-td-dem">{sc.level.band === 'low' ? sc.cap.demoLow : sc.cap.demoHigh}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>

          <div className="crp-legend">
            {LEVEL_LEGEND.map((l) => (
              <div key={l.label} className={l.cls}>
                <b>{l.label.toUpperCase()}</b>
                <p>{l.blurb}</p>
              </div>
            ))}
          </div>

          <SectionHead>Launch summary</SectionHead>
          <blockquote className="crp-quote">“{summary}”</blockquote>

          {runs.length > 0 && (
            <>
              <SectionHead>Recent workplace scenarios</SectionHead>
              <div className="crp-runs">
                {runs.map((r, i) => (
                  <div key={r.id} className="crp-run">
                    <span className="crp-run-n">{i + 1}</span>
                    <b>{r.title}</b>
                    <span className="crp-run-meta">{r.capabilities.map((c) => CAPABILITY_SHORT[c] ?? c).join(' · ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <SectionHead>Assessment record and verification</SectionHead>
          <div className="crp-record">
            <div>
              <div className="crp-rec-row"><span>Scenarios</span><b>{scenCount} across three tracks</b></div>
              <div className="crp-rec-row"><span>Engagement</span><b>{hours} hours over {weeksSpan} weeks, 100% complete</b></div>
              <div className="crp-rec-row"><span>Score growth</span><b className="g">+{gains.overall}% since first attempt</b></div>
            </div>
            <div>
              <div className="crp-rec-row"><span>Scoring</span><b>FUSE rubric, each rule source-anchored</b></div>
              <div className="crp-rec-row"><span>Human review</span><b>Flagged items checked by a marker</b></div>
              <div className="crp-rec-row"><span>AI-integrity</span><b className="g">Passed, no generated-text signal</b></div>
            </div>
            <div className="crp-qr">
              <QrMark seed={credentialId} />
              <span>launchapp.au/verify</span>
            </div>
          </div>

          <div className="crp-sign-row">
            <div className="crp-sign">
              <SignatureMark />
              <div className="crp-sign-name">Edward Morgan</div>
              <div className="crp-sign-role">Founder and Chief Executive, Launch Institute Pty Ltd</div>
            </div>
            <p className="crp-live-note">
              This credential is live. Levels describe performance on the date this copy was produced.
              The holder can issue a current copy at any time.
            </p>
          </div>

          <p className="crp-fine">
            Capabilities are assessed by FUSE, Launch Institute’s scenario-based assessment engine. Candidates are
            scored on how they reason, decide and act in realistic scenarios, against a rubric built on the published
            instruments named above, with flagged items reviewed by a human marker. A credential informs a hiring
            decision alongside interview and reference checks. Independent validation of the FUSE engine is being
            pursued. Launch Institute Pty Ltd, ABN 66 691 248 414.
          </p>
        </div>

        {/* ════ PAGE 2 — profile interpretation, family 1 ═══════════ */}
        <div className="crp-page">
          <PageHead name={student.name} credentialId={credentialId} page={2} />
          <h2 className="crp-ptitle">Profile interpretation</h2>
          <p className="crp-intro">
            Each capability is reported at one of five levels, set against the Launch rubric for that capability.
            Observed behaviours are what {first} actually did across the scenarios that elicit the capability.
            Implications describe how the pattern is likely to show at work. Interview probes are for confirming the
            level in conversation; use them to verify Distinguished and Advanced levels and to explore Developing ones.
          </p>
          <FamilyBlock idx={1} caps={famCaps[0]} blurb={famBlurbs[0]} runTitles={runTitles} />
          <PageFoot />
        </div>

        {/* ════ PAGE 3 — families 2 & 3 + role-fit reading ══════════ */}
        <div className="crp-page">
          <PageHead name={student.name} credentialId={credentialId} page={3} />
          <h2 className="crp-ptitle">Profile interpretation, continued</h2>
          <FamilyBlock idx={2} caps={famCaps[1]} blurb={famBlurbs[1]} runTitles={runTitles} />
          <FamilyBlock idx={3} caps={famCaps[2]} blurb={famBlurbs[2]} runTitles={runTitles} />
          <div className="crp-callout">
            <b>Reading this profile for a {uni ? 'graduate role' : 'school-leaver program'}.</b> {roleFit}
          </div>
          <PageFoot />
        </div>

        {/* ════ PAGE 4 — reading the levels (static rubric) ═════════ */}
        <div className="crp-page">
          <PageHead name={student.name} credentialId={credentialId} page={4} />
          <h2 className="crp-ptitle">Reading the levels</h2>
          <p className="crp-intro">
            Levels are criterion-referenced. Each one describes a pattern of behaviour against the capability’s rubric,
            so the same level means the same thing for every candidate and every intake.
          </p>
          <div className="crp-rubric-head">
            <span>Level</span><span>What the evidence showed</span><span>What you will see at work</span><span>How to confirm it</span>
          </div>
          {LEVEL_RUBRIC.map((r) => (
            <div className="crp-rubric-row" key={r.label}>
              <div className={`crp-lvl ${r.cls}`}>
                <span className="crp-sq">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < r.filled ? 'on' : ''} />)}</span>
                <span className="crp-badge">{r.label.toUpperCase()}</span>
              </div>
              <p>{r.evidence}</p>
              <p>{r.atWork}</p>
              <p>{r.confirm}</p>
            </div>
          ))}
          <div className="crp-callout">
            <b>Checking the scale against your own standard.</b> Run one intake alongside your existing process and
            compare Launch levels with your interview ratings and probation outcomes. Launch shares its rater-alignment
            and reliability figures with employers who do.
          </div>
          <PageFoot />
        </div>

        {/* ════ PAGE 5 — integrity indicators + measurement basis ═══ */}
        <div className="crp-page">
          <PageHead name={student.name} credentialId={credentialId} page={5} />
          <h2 className="crp-ptitle">Response and integrity indicators</h2>
          <div className="crp-ind-head"><span>Indicator</span><span>Result</span><span>What it means</span></div>
          {[
            { ind: 'Cross-scenario consistency', res: 'High', g: false, means: `Levels were stable across all ${scenCount} scenarios. No capability varied by more than one level between attempts, the condition for reporting a level rather than a range.` },
            { ind: 'Response authenticity', res: 'Passed', g: true, means: `Writing style, reasoning pattern and vocabulary were consistent across ${weeksSpan} weeks of sessions. No generated-text signal in any response.` },
            { ind: 'Engagement pattern', res: 'Within range', g: false, means: `${hours} hours in total, median ${medianMins} minutes per scenario, 100% completion. No rushed, abandoned or timed-out responses.` },
            { ind: 'Score trajectory', res: `+${gains.overall}%`, g: true, means: `Improvement since first attempt across all ten capabilities. Largest gains in ${gains.gains[0].short} (+${gains.gains[0].pct}%) and ${gains.gains[1].short} (+${gains.gains[1].pct}%). ${gains.weakestGain.short} +${gains.weakestGain.pct}%.` },
            { ind: 'Self-description credited', res: 'None', g: false, means: `Statements ${first} made about themselves without behavioural evidence in the response were not scored, in line with the rubric.` },
          ].map((r) => (
            <div className="crp-ind-row" key={r.ind}>
              <b>{r.ind}</b>
              <span className={r.g ? 'is-green' : ''}>{r.res}</span>
              <p>{r.means}</p>
            </div>
          ))}

          <h2 className="crp-ptitle" style={{ marginTop: 26 }}>Measurement basis and how levels are set</h2>
          <div className="crp-ind-head"><span>Element</span><span>Status</span><span>Detail</span></div>
          {MEASUREMENT_ROWS.map((r) => (
            <div className="crp-ind-row" key={r.element}>
              <b>{r.element}</b>
              <span>{r.status}</span>
              <p>{r.detail}</p>
            </div>
          ))}
          <PageFoot />
        </div>

        {/* ════ PAGE 6 — interview guide + using this report ════════ */}
        <div className="crp-page">
          <PageHead name={student.name} credentialId={credentialId} page={6} />
          <h2 className="crp-ptitle">Interview guide</h2>
          <p className="crp-intro">
            The ten probes from pages 2 and 3 in one place for the interviewer. Each draws out a specific, first-person
            example of the behaviour the level is based on. Confirm the Distinguished and Advanced levels first, then
            spend the remaining time on {weakest.cap.short}.
          </p>
          <div className="crp-guide-head"><span /><span>Capability</span><span>Level</span><span>Probe</span></div>
          {all.map((sc, i) => (
            <div className="crp-guide-row" key={sc.cap.id}>
              <span className="crp-guide-n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <b>{sc.cap.name}</b>
                <i>{sc.cap.basis}</i>
              </div>
              <LevelMark level={sc.level} squares={false} />
              <p className="crp-probe">{sc.cap.probe}</p>
            </div>
          ))}

          <h2 className="crp-ptitle" style={{ marginTop: 26 }}>Using this report</h2>
          <div className="crp-using">
            <div>
              <span>01</span>
              <b>Suggested weighting</b>
              <p>Use the profile to rank and shortlist before CV review. Confirm Distinguished and Advanced levels and explore Developing levels at interview with the probes on pages 2 and 3. Combine with interview, work sample and references. A credential informs a decision; it is never the sole basis for one.</p>
            </div>
            <div>
              <span>02</span>
              <b>Role fit reading</b>
              <p>{roleFit}</p>
            </div>
            <div>
              <span>03</span>
              <b>Verification</b>
              <p>Scan the code below or enter {credentialId} at launchapp.au/verify to see the live record, issue and validity dates and any updates since this copy was produced. The record in Launch’s system is the credential; this document is a rendering of it.</p>
            </div>
          </div>

          <div className="crp-sign-row">
            <div className="crp-sign">
              <SignatureMark />
              <div className="crp-sign-name">Edward Morgan</div>
              <div className="crp-sign-role">Founder and Chief Executive, Launch Institute Pty Ltd</div>
            </div>
            <div className="crp-qr">
              <QrMark seed={credentialId} size={64} />
              <span>launchapp.au/verify</span>
            </div>
          </div>
          <PageFoot />
        </div>
      </div>

      {/* ── Purchase — the sales moment stays wrapped around it ────── */}
      <div className="cred-buy">
        {purchased ? (
          <div className="cred-done">
            <BadgeCheck className="w-5 h-5" style={{ color: 'var(--launch-teal)' }} />
            <span>Demo preview — secure checkout and the downloadable report arrive with the full build.</span>
          </div>
        ) : (
          <>
            <button type="button" className="ed-btn ed-btn-primary cred-buy-btn" onClick={() => setPurchased(true)}>
              <Download className="w-4 h-4" /> Purchase your certified Launch Credential — $39
            </button>
            <p className="cred-hint">The full six-page Capability Report, issued and verifiable at launchapp.au/verify.</p>
            <p className="cred-founding">
              Founding {uni ? 'university' : 'school'} partners signing before Christmas receive their first 12 months of credentials free.
            </p>
          </>
        )}
      </div>

      <style>{crpStyles}</style>
    </ModalShell>
  )
}

/* ── Document styles — the designed report's register: cream paper,
     gold inner frame, serif display, navy & gold level system ──────── */

const crpStyles = `
  .ed-modal-card:has(.crp-doc) { max-width: 1020px; }

  .crp-doc { display: flex; flex-direction: column; gap: 18px; --crp-paper: #f8f4e9; --crp-ink: #20283a; --crp-ink2: #4c5468; --crp-ink3: #7c8296; --crp-navy: #1c2a46; --crp-gold: #ad8a3b; --crp-line: rgba(32,40,58,0.16); --crp-line2: rgba(32,40,58,0.3); --crp-green: #2e7d5c; }

  .crp-page { position: relative; background: var(--crp-paper); border: 1px solid #d9cfb6; border-radius: 4px; padding: 34px 38px 28px; box-shadow: 0 12px 36px -20px rgba(14,24,51,0.35); color: var(--crp-ink); }
  .crp-page::before { content: ''; position: absolute; inset: 10px; border: 1px solid rgba(173,138,59,0.5); border-radius: 2px; pointer-events: none; }

  /* ── Page 1 head ── */
  .crp-p1-head { display: grid; grid-template-columns: 1fr 1.2fr auto; gap: 24px; align-items: start; }
  .crp-p1-hca { margin-top: 10px; font-family: var(--font-display); font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--crp-ink); }
  .crp-p1-title { text-align: center; }
  .crp-p1-title h2 { font-family: var(--font-display); font-weight: 600; font-size: 30px; line-height: 1.08; letter-spacing: 0.06em; text-transform: uppercase; color: var(--crp-navy); margin: 0 0 8px; }
  .crp-p1-title p { font-size: 11.5px; line-height: 1.5; color: var(--crp-ink2); }
  .crp-rule-gold { height: 2px; background: linear-gradient(90deg, var(--crp-gold), rgba(173,138,59,0.25)); margin: 18px 0 20px; }

  .crp-id-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
  .crp-name { font-family: var(--font-display); font-weight: 600; font-size: clamp(28px, 4vw, 38px); letter-spacing: -0.01em; color: var(--crp-ink); margin: 0 0 10px; }
  .crp-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .crp-tag { font-family: var(--font-body); font-weight: 800; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--crp-ink); border: 1.5px solid var(--crp-line2); padding: 5px 11px; background: rgba(255,255,255,0.4); }
  .crp-idline { font-size: 13.5px; color: var(--crp-ink2); }
  .crp-idline strong { color: var(--crp-ink); font-weight: 700; }
  .crp-sep { margin: 0 9px; color: var(--crp-ink3); }
  .crp-credid { text-align: right; font-size: 12.5px; color: var(--crp-ink2); line-height: 1.7; flex-shrink: 0; }
  .crp-credid b { color: var(--crp-ink); font-weight: 700; }

  .crp-shead { display: flex; align-items: center; gap: 12px; margin: 22px 0 10px; }
  .crp-shead span { font-family: var(--font-body); font-weight: 800; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--crp-ink); white-space: nowrap; }
  .crp-shead i { flex: 1; height: 1px; background: var(--crp-line); }

  /* ── Headline strengths ── */
  .crp-strengths { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  @media (max-width: 680px) { .crp-strengths { grid-template-columns: 1fr; } }
  .crp-str { background: #fdfcf7; border: 1px solid var(--crp-line); padding: 14px 16px; }
  .crp-str-eyebrow { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--crp-gold); margin-bottom: 7px; }
  .crp-str-name { font-family: var(--font-display); font-weight: 600; font-size: 21px; letter-spacing: -0.01em; color: var(--crp-ink); margin-bottom: 7px; }
  .crp-str-body { font-size: 12px; line-height: 1.55; color: var(--crp-ink2); margin-bottom: 8px; }
  .crp-str-tail { font-family: var(--font-display); font-style: italic; font-size: 12.5px; color: var(--crp-ink2); }
  .crp-str.is-first { background: var(--crp-navy); border-color: var(--crp-navy); }
  .crp-str.is-first .crp-str-name { color: #fff; }
  .crp-str.is-first .crp-str-body { color: rgba(255,255,255,0.85); }
  .crp-str.is-first .crp-str-tail { color: #d8bd7e; }

  /* ── Level marks ── */
  .crp-lvl { display: inline-flex; align-items: center; gap: 9px; white-space: nowrap; }
  .crp-sq { display: inline-flex; gap: 2.5px; }
  .crp-sq i { width: 9px; height: 9px; display: inline-block; border: 1px solid var(--crp-line2); background: transparent; }
  .crp-sq i.on { background: var(--crp-navy); border-color: var(--crp-navy); }
  .lv-dst .crp-sq i.on { background: var(--crp-gold); border-color: var(--crp-gold); }
  .crp-badge { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.1em; padding: 3px 8px; border: 1.5px solid var(--crp-line2); color: var(--crp-ink2); background: transparent; }
  .lv-dst .crp-badge { background: var(--crp-gold); border-color: var(--crp-gold); color: #fff; }
  .lv-adv .crp-badge { background: var(--crp-navy); border-color: var(--crp-navy); color: #fff; }
  .lv-pro .crp-badge { border-color: var(--crp-navy); color: var(--crp-navy); }
  .lv-dev .crp-badge { border-color: var(--crp-line2); color: var(--crp-ink2); }
  .lv-emg .crp-badge { border-color: var(--crp-line); color: var(--crp-ink3); }

  /* ── Page 1 capability table ── */
  .crp-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .crp-table th { text-align: left; font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink2); padding: 6px 10px 7px 0; border-bottom: 1.5px solid var(--crp-line2); }
  .crp-table td { padding: 8px 10px 8px 0; border-bottom: 1px solid var(--crp-line); vertical-align: middle; line-height: 1.4; }
  .crp-table tr.is-fam-first td { border-top: 1.5px solid var(--crp-line2); }
  .crp-td-fam { font-family: var(--font-display); font-size: 13px; color: var(--crp-ink); width: 96px; vertical-align: top; padding-top: 10px; }
  .crp-td-cap b { display: block; font-weight: 700; color: var(--crp-ink); font-size: 12.5px; }
  .crp-td-cap i { font-family: var(--font-display); font-style: italic; font-size: 11.5px; color: var(--crp-ink2); }
  .crp-td-lvl { width: 215px; }
  .crp-td-dem { color: var(--crp-ink); font-size: 12.5px; }

  .crp-legend { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-top: 14px; }
  @media (max-width: 680px) { .crp-legend { grid-template-columns: 1fr 1fr; } }
  .crp-legend b { display: block; font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; color: var(--crp-ink2); margin-bottom: 3px; }
  .crp-legend .lv-dst b { color: var(--crp-gold); }
  .crp-legend .lv-adv b, .crp-legend .lv-pro b { color: var(--crp-navy); }
  .crp-legend p { font-size: 10.5px; line-height: 1.45; color: var(--crp-ink2); }

  .crp-quote { margin: 0; background: #fdfcf7; border-left: 3px solid var(--crp-gold); padding: 13px 16px; font-family: var(--font-display); font-style: italic; font-size: 14px; line-height: 1.6; color: var(--crp-ink); }

  .crp-runs { display: flex; flex-direction: column; gap: 7px; }
  .crp-run { display: flex; align-items: baseline; gap: 10px; font-size: 13px; color: var(--crp-ink); flex-wrap: wrap; }
  .crp-run-n { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: var(--crp-navy); color: #fff; font-family: var(--font-mono); font-size: 10px; font-weight: 700; flex-shrink: 0; align-self: center; }
  .crp-run b { font-weight: 700; }
  .crp-run-meta { color: var(--crp-ink3); font-size: 12px; }

  .crp-record { display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; border: 1px solid var(--crp-line); background: #fdfcf7; padding: 14px 18px; align-items: center; }
  @media (max-width: 680px) { .crp-record { grid-template-columns: 1fr; } }
  .crp-rec-row { display: grid; grid-template-columns: 112px 1fr; gap: 8px; align-items: baseline; margin-bottom: 7px; font-size: 12px; line-height: 1.45; }
  .crp-rec-row span { font-family: var(--font-body); font-weight: 800; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink3); }
  .crp-rec-row b { font-weight: 600; color: var(--crp-ink); }
  .crp-rec-row b.g { color: var(--crp-green); font-weight: 700; }
  .crp-qr { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .crp-qr span { font-family: var(--font-body); font-weight: 700; font-size: 10px; color: var(--crp-ink2); }

  .crp-sign-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 20px; }
  .crp-sign-name { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--crp-ink); border-top: 1px solid var(--crp-line2); padding-top: 5px; margin-top: 2px; }
  .crp-sign-role { font-size: 11.5px; color: var(--crp-ink2); margin-top: 2px; }
  .crp-live-note { max-width: 420px; text-align: right; font-size: 11.5px; line-height: 1.55; color: var(--crp-ink2); }

  .crp-fine { margin-top: 16px; padding-top: 10px; border-top: 1px solid var(--crp-line); font-size: 9.5px; line-height: 1.55; color: var(--crp-ink3); }

  /* ── Pages 2–6 chrome ── */
  .crp-phead { display: flex; align-items: center; gap: 16px; padding-bottom: 12px; border-bottom: 2px solid rgba(173,138,59,0.45); margin-bottom: 18px; }
  .crp-phead-mid { flex: 1; text-align: center; font-family: var(--font-display); font-size: 12.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--crp-ink2); }
  .crp-phead-page { font-family: var(--font-body); font-weight: 800; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--crp-ink2); }

  .crp-ptitle { font-family: var(--font-display); font-weight: 600; font-size: 24px; letter-spacing: -0.01em; color: var(--crp-ink); margin: 0 0 10px; }
  .crp-intro { font-size: 13px; line-height: 1.6; color: var(--crp-ink); max-width: 760px; margin-bottom: 18px; }

  .crp-pfoot { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 22px; padding-top: 10px; border-top: 1px solid var(--crp-line); }
  .crp-pfoot p { font-size: 9.5px; line-height: 1.5; color: var(--crp-ink3); max-width: 540px; }
  .crp-pfoot p b, .crp-pfoot span b { color: var(--crp-ink2); }
  .crp-pfoot > span { font-size: 9.5px; color: var(--crp-ink3); white-space: nowrap; }

  /* ── Family blocks (pages 2–3) ── */
  .crp-famblock { margin-bottom: 20px; }
  .crp-fam-banner { display: grid; grid-template-columns: 240px 1fr; gap: 24px; align-items: center; background: var(--crp-navy); padding: 16px 20px; margin-bottom: 0; }
  @media (max-width: 680px) { .crp-fam-banner { grid-template-columns: 1fr; } }
  .crp-fam-eyebrow { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #d8bd7e; margin-bottom: 4px; }
  .crp-fam-name { font-family: var(--font-display); font-weight: 600; font-size: 20px; color: #fff; }
  .crp-fam-banner p { font-size: 12.5px; line-height: 1.55; color: rgba(255,255,255,0.92); }

  .crp-interp-head, .crp-interp-row { display: grid; grid-template-columns: 215px 1.25fr 1fr 0.85fr; gap: 18px; }
  @media (max-width: 760px) { .crp-interp-head { display: none; } .crp-interp-row { grid-template-columns: 1fr; gap: 8px; } }
  .crp-interp-head { padding: 10px 0 7px; border-bottom: 1.5px solid var(--crp-line2); }
  .crp-interp-head span { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink2); }
  .crp-interp-row { padding: 14px 0; border-bottom: 1px solid var(--crp-line); }
  .crp-interp-row:last-child { border-bottom: none; }
  .crp-interp-name { font-weight: 700; font-size: 13.5px; color: var(--crp-ink); line-height: 1.3; margin-bottom: 7px; }
  .crp-interp-row .crp-lvl { margin-bottom: 6px; }
  .crp-basis { font-family: var(--font-display); font-style: italic; font-size: 11.5px; color: var(--crp-ink2); }
  .crp-interp-row > p { font-size: 12.5px; line-height: 1.55; color: var(--crp-ink); }
  .crp-probe { font-family: var(--font-display); font-style: italic; font-size: 13px; line-height: 1.55; color: var(--crp-ink); }

  .crp-callout { background: #fdfcf7; border-left: 3px solid var(--crp-gold); border-top: 1px solid var(--crp-line); border-bottom: 1px solid var(--crp-line); padding: 13px 16px; font-size: 12.5px; line-height: 1.6; color: var(--crp-ink); margin-top: 6px; }
  .crp-callout b { font-weight: 800; }

  /* ── Page 4 rubric ── */
  .crp-rubric-head, .crp-rubric-row { display: grid; grid-template-columns: 170px 1.2fr 1fr 1fr; gap: 18px; }
  @media (max-width: 760px) { .crp-rubric-head { display: none; } .crp-rubric-row { grid-template-columns: 1fr; gap: 8px; } }
  .crp-rubric-head { padding: 8px 0 7px; border-bottom: 1.5px solid var(--crp-line2); }
  .crp-rubric-head span { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink2); }
  .crp-rubric-row { padding: 13px 0; border-bottom: 1px solid var(--crp-line); }
  .crp-rubric-row .crp-lvl { flex-direction: column; align-items: flex-start; display: inline-flex; gap: 6px; }
  .crp-rubric-row p { font-size: 12px; line-height: 1.55; color: var(--crp-ink); }

  /* ── Page 5 indicator tables ── */
  .crp-ind-head, .crp-ind-row { display: grid; grid-template-columns: 180px 150px 1fr; gap: 18px; }
  @media (max-width: 680px) { .crp-ind-head { display: none; } .crp-ind-row { grid-template-columns: 1fr; gap: 4px; } }
  .crp-ind-head { padding: 8px 0 7px; border-bottom: 1.5px solid var(--crp-line2); }
  .crp-ind-head span { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink2); }
  .crp-ind-row { padding: 11px 0; border-bottom: 1px solid var(--crp-line); font-size: 12.5px; }
  .crp-ind-row b { font-weight: 700; color: var(--crp-ink); line-height: 1.45; }
  .crp-ind-row > span { font-weight: 700; color: var(--crp-ink); line-height: 1.45; }
  .crp-ind-row > span.is-green { color: var(--crp-green); }
  .crp-ind-row p { line-height: 1.55; color: var(--crp-ink); }

  /* ── Page 6 interview guide ── */
  .crp-guide-head, .crp-guide-row { display: grid; grid-template-columns: 34px 1.1fr 150px 1.4fr; gap: 16px; align-items: center; }
  @media (max-width: 680px) { .crp-guide-head { display: none; } .crp-guide-row { grid-template-columns: 34px 1fr; } }
  .crp-guide-head { padding: 8px 0 7px; border-bottom: 1.5px solid var(--crp-line2); }
  .crp-guide-head span { font-family: var(--font-body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--crp-ink2); }
  .crp-guide-row { padding: 10px 0; border-bottom: 1px solid var(--crp-line); }
  .crp-guide-n { font-family: var(--font-display); font-size: 15px; color: var(--crp-gold); }
  .crp-guide-row > div b { display: block; font-weight: 700; font-size: 12.5px; color: var(--crp-ink); line-height: 1.3; }
  .crp-guide-row > div i { font-family: var(--font-display); font-style: italic; font-size: 11px; color: var(--crp-ink2); }
  .crp-guide-row .crp-probe { font-size: 12.5px; }

  .crp-using { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  @media (max-width: 680px) { .crp-using { grid-template-columns: 1fr; } }
  .crp-using > div { border: 1px solid var(--crp-line); background: #fdfcf7; padding: 14px 16px; }
  .crp-using span { display: block; font-family: var(--font-body); font-weight: 800; font-size: 10px; letter-spacing: 0.14em; color: var(--crp-gold); margin-bottom: 6px; }
  .crp-using b { display: block; font-family: var(--font-display); font-weight: 600; font-size: 16px; color: var(--crp-ink); margin-bottom: 6px; }
  .crp-using p { font-size: 11.5px; line-height: 1.55; color: var(--crp-ink2); }

  /* ── Purchase ── */
  .cred-buy { text-align: center; padding: 20px 6px 2px; }
  .cred-buy-btn { font-size: 14.5px; padding: 12px 24px; }
  .cred-hint { font-size: 12.5px; color: var(--lq-ink-3); margin-top: 10px; }
  .cred-founding { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--launch-navy); margin-top: 10px; }
  .cred-done { display: inline-flex; align-items: center; gap: 10px; background: rgba(27,158,143,0.10); border: 1px solid rgba(27,158,143,0.30); border-radius: 12px; padding: 12px 18px; font-size: 13.5px; color: var(--lq-ink-2); text-align: left; }
`
