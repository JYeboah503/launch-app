'use client'

/** Per-student guidance — the differentiator. Turns a capability profile
 *  into career highlights, subject suggestions, subject-fit, growth, and
 *  badges. Advisor can add a note + override the auto guidance. */

import { useMemo, useState } from 'react'
import {
  CAPABILITIES, CAPABILITY_SHORT, BADGE_BY_ID,
  overallScore, topStrengths, growthAreas, careerHighlights, suggestedSubjects,
  cohortAverageScores, growthSince, subjectFit,
  type Cohort, type EdStudent,
} from '@/lib/educator'
import { type EdWorkspace } from '@/components/educator/types'
import { CapabilityRadar, FitBar, GrowthSparkline } from '@/components/educator/charts'
import {
  ArrowLeft, FileText, Flame, TrendingUp, Sparkles, Target, Pencil, Check,
} from 'lucide-react'

const ADVISOR_TARGET = 70

export function StudentView({ ws, cohort, student, onBack }: { ws: EdWorkspace; cohort: Cohort; student: EdStudent; onBack: () => void }) {
  const cohortStudents = useMemo(() => ws.students.filter((s) => cohort.studentIds.includes(s.id)), [ws.students, cohort.studentIds])
  const average = useMemo(() => cohortAverageScores(cohortStudents), [cohortStudents])

  const overall = overallScore(student.scores)
  const growth = growthSince(student)
  const strengths = topStrengths(student.scores, 3)
  const grow = growthAreas(student.scores, 2)
  const careers = careerHighlights(student.scores, 3)
  const subjects = suggestedSubjects(student.scores, ws.subjects, 3)
  const overallTrend = student.history.map((h) => overallScore(h.scores))

  const [note, setNote] = useState('')
  const [editingNote, setEditingNote] = useState(false)

  return (
    <div className="ed-page ed-student">
      <button type="button" className="ed-back" onClick={onBack}><ArrowLeft className="w-4 h-4" /> {cohort.name}</button>

      {/* Header */}
      <div className="ed-shead">
        <div className="ed-shead-id">
          <span className="ed-shead-ini">{student.initials}</span>
          <div>
            <h1 className="ed-h1" style={{ fontSize: 'clamp(24px,3vw,34px)', marginBottom: 4 }}>{student.name}</h1>
            <div className="ed-shead-email">{student.email}</div>
          </div>
        </div>
        <div className="ed-shead-stats">
          <div className="ed-sstat"><span className="ed-sstat-num">{overall}</span><span className="ed-sstat-lbl">Overall</span></div>
          <div className="ed-sstat"><span className="ed-sstat-num" style={{ color: 'var(--ed-accent)' }}>▲ {growth}</span><span className="ed-sstat-lbl">Growth</span></div>
          <div className="ed-sstat"><span className="ed-sstat-num"><Flame className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2 }} /> {student.streakWeeks}</span><span className="ed-sstat-lbl">Week streak</span></div>
          <button type="button" className="ed-btn ed-btn-ghost" onClick={() => window.print()}><FileText className="w-4 h-4" /> Report</button>
        </div>
      </div>

      {/* Badges */}
      {student.badges.length > 0 && (
        <div className="ed-badges">
          {student.badges.map((b) => {
            const badge = BADGE_BY_ID[b]
            if (!badge) return null
            return <span key={b} className="ed-badge" title={badge.blurb}><span className="ed-badge-emoji">{badge.emoji}</span> {badge.label}</span>
          })}
        </div>
      )}

      <div className="ed-sgrid">
        {/* Left: radar + growth */}
        <div className="ed-scol">
          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3">Capability profile</h3><span className="ed-legend"><i className="lg-you" /> {student.name.split(' ')[0]} <i className="lg-avg" /> cohort <i className="lg-tgt" /> target</span></div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <CapabilityRadar scores={student.scores} compare={average} target={ADVISOR_TARGET} size={280} />
            </div>
          </div>

          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3">Growth this term</h3><GrowthSparkline values={overallTrend} /></div>
            <div className="ed-deltas">
              {CAPABILITIES.map((c) => {
                const first = student.history[0].scores[c] ?? 0
                const now = student.scores[c] ?? 0
                const d = now - first
                return (
                  <div key={c} className="ed-delta">
                    <span className="ed-delta-lbl">{CAPABILITY_SHORT[c]}</span>
                    <span className="ed-delta-bar"><span className="ed-delta-fill" style={{ width: `${now}%` }} /></span>
                    <span className="ed-delta-val">{now}</span>
                    <span className={`ed-delta-chg ${d >= 0 ? 'up' : 'down'}`}>{d >= 0 ? '+' : ''}{d}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: guidance */}
        <div className="ed-scol">
          <div className="ed-scard ed-scard-accent">
            <div className="ed-scard-head"><h3 className="ed-h3"><Sparkles className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2, color: 'var(--ed-accent)' }} /> Career highlights</h3><span className="ed-auto">Auto · editable</span></div>
            <p className="ed-guide-note">Directions this student is well-suited to, based on their strongest capabilities.</p>
            <div className="ed-careers">
              {careers.map((c) => (
                <div key={c.name} className="ed-career">
                  <span className="ed-career-emoji">{c.emoji}</span>
                  <span className="ed-career-name">{c.name}</span>
                  <span className="ed-career-fit">{c.fit}% fit</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3"><TrendingUp className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2 }} /> Subjects to lean into</h3></div>
            <p className="ed-guide-note">Where their profile maps most strongly across your defined subjects.</p>
            {ws.subjects.length === 0
              ? <p className="ed-dim">Define subjects in the cohort&rsquo;s Subject-fit tab to see this.</p>
              : subjects.map((s) => <FitBar key={s.id} label={s.name} emoji={s.emoji} value={s.fit} sub={`Fit across ${ws.subjects.find(x=>x.id===s.id)?.attributes.length ?? 0} attributes`} />)}
          </div>

          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3"><Target className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2 }} /> Strengths &amp; focus</h3></div>
            <div className="ed-sf-row">
              <div>
                <div className="ed-sf-lbl">Top strengths</div>
                {strengths.map((s) => <div key={s.name} className="ed-sf-item"><span>{CAPABILITY_SHORT[s.name]}</span><span className="ed-sf-score" style={{ color: 'var(--ed-accent)' }}>{s.score}</span></div>)}
              </div>
              <div>
                <div className="ed-sf-lbl">Focus areas</div>
                {grow.map((s) => <div key={s.name} className="ed-sf-item"><span>{CAPABILITY_SHORT[s.name]}</span><span className="ed-sf-score" style={{ color: 'var(--launch-danger)' }}>{s.score}</span></div>)}
              </div>
            </div>
          </div>

          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3">Advisor note</h3>{!editingNote && <button type="button" className="ed-icon-btn" onClick={() => setEditingNote(true)}><Pencil className="w-3.5 h-3.5" /></button>}</div>
            {editingNote
              ? <><textarea className="ed-input" style={{ minHeight: 90 }} autoFocus value={note} placeholder="Add a private note or a suggested next step for this student…" onChange={(e) => setNote(e.target.value)} /><div className="ed-modal-foot" style={{ marginTop: 10 }}><button type="button" className="ed-btn ed-btn-primary" onClick={() => setEditingNote(false)}><Check className="w-4 h-4" /> Save note</button></div></>
              : <p className="ed-note-body">{note || 'No note yet. Add a private note or a suggested next step.'}</p>}
          </div>
        </div>
      </div>

      {/* Print-only report */}
      <div className="ed-print">
        <div className="ed-print-brand">LAUNCH · {ws.branding.schoolName}</div>
        <h1 className="ed-print-title">{student.name} — growth report</h1>
        <div className="ed-print-meta">{cohort.name} · {cohort.term} · Overall {overall} · Growth ▲{growth}</div>
        <h2 className="ed-print-h2">Capabilities</h2>
        <table className="ed-print-table"><tbody>
          {CAPABILITIES.map((c) => <tr key={c}><td>{c}</td><td style={{ textAlign: 'right' }}>{student.scores[c] ?? 0}</td></tr>)}
        </tbody></table>
        <h2 className="ed-print-h2">Career highlights</h2>
        <p>{careers.map((c) => `${c.name} (${c.fit}%)`).join(' · ')}</p>
        <h2 className="ed-print-h2">Suggested subjects</h2>
        <p>{subjects.map((s) => `${s.name} (${s.fit}%)`).join(' · ') || '—'}</p>
        {note && <><h2 className="ed-print-h2">Advisor note</h2><p>{note}</p></>}
        <div className="ed-print-foot">Generated by Launch · launchapp.au</div>
      </div>

      <style>{studentStyles}</style>
    </div>
  )
}

const studentStyles = `
  .ed-shead { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 18px; }
  .ed-shead-id { display: flex; align-items: center; gap: 16px; }
  .ed-shead-ini { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 999px; background: var(--ed-accent-soft); color: var(--ed-accent); font-family: var(--font-mono); font-size: 20px; font-weight: 700; flex-shrink: 0; }
  .ed-shead-email { font-size: 13px; color: var(--lq-ink-3); }
  .ed-shead-stats { display: flex; align-items: center; gap: 18px; }
  .ed-sstat { text-align: center; }
  .ed-sstat-num { display: block; font-family: var(--font-mono); font-weight: 700; font-size: 20px; color: var(--lq-ink); line-height: 1; }
  .ed-sstat-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-top: 5px; }

  .ed-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .ed-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid var(--lq-line); font-size: 12px; font-weight: 600; color: var(--lq-ink); animation: ed-badge-glow 1.6s ease-out both; }
  .ed-badges .ed-badge:nth-child(2) { animation-delay: 120ms; }
  .ed-badges .ed-badge:nth-child(3) { animation-delay: 240ms; }
  .ed-badges .ed-badge:nth-child(4) { animation-delay: 360ms; }
  .ed-badges .ed-badge:nth-child(5) { animation-delay: 480ms; }
  /* The "delight" moment — one soft glow pulse as badges land, then calm. */
  @keyframes ed-badge-glow {
    0% { box-shadow: 0 0 0 0 transparent; border-color: var(--lq-line); }
    35% { box-shadow: 0 0 0 6px var(--ed-accent-soft); border-color: var(--ed-accent); }
    100% { box-shadow: 0 0 0 0 transparent; border-color: var(--lq-line); }
  }
  .ed-badge:hover { border-color: var(--ed-accent); }
  .ed-badge-emoji { font-size: 14px; }

  .ed-sgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) { .ed-sgrid { grid-template-columns: 1fr; } }
  .ed-scol { display: flex; flex-direction: column; gap: 16px; }
  .ed-scard { background: #fff; border: 1px solid var(--lq-line); border-radius: 18px; padding: 20px; }
  .ed-scard-accent { border-color: var(--ed-accent); box-shadow: 0 0 0 3px var(--ed-accent-soft); }
  .ed-scard-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .ed-auto, .ed-legend { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lq-ink-3); }
  .ed-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin: 0 3px 0 8px; vertical-align: 0; }
  .ed-legend .lg-you { background: var(--ed-accent); }
  .ed-legend .lg-avg { background: rgba(10,42,107,0.4); }
  .ed-legend .lg-tgt { background: var(--launch-teal-3); }
  .ed-guide-note { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; margin-bottom: 14px; }
  .ed-careers { display: flex; flex-direction: column; gap: 8px; }
  .ed-career { display: flex; align-items: center; gap: 11px; padding: 11px 13px; border-radius: 12px; background: #fbfaf7; border: 1px solid var(--lq-line); }
  .ed-career-emoji { font-size: 18px; }
  .ed-career-name { flex: 1; font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); }
  .ed-career-fit { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--ed-accent); }

  .ed-deltas { display: flex; flex-direction: column; gap: 7px; }
  .ed-delta { display: grid; grid-template-columns: 84px 1fr 28px 30px; align-items: center; gap: 8px; }
  .ed-delta-lbl { font-size: 11px; color: var(--lq-ink-2); }
  .ed-delta-bar { height: 7px; border-radius: 999px; background: var(--lq-line); overflow: hidden; }
  .ed-delta-fill { height: 100%; background: var(--ed-accent); border-radius: 999px; }
  .ed-delta-val { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--lq-ink-2); text-align: right; }
  .ed-delta-chg { font-family: var(--font-mono); font-size: 10px; text-align: right; }
  .ed-delta-chg.up { color: var(--ed-accent); }
  .ed-delta-chg.down { color: var(--launch-danger); }

  .ed-sf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .ed-sf-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-bottom: 8px; }
  .ed-sf-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--lq-line); font-size: 13px; color: var(--lq-ink); }
  .ed-sf-score { font-family: var(--font-mono); font-weight: 700; }
  .ed-icon-btn { background: none; border: 1px solid var(--lq-line-2); border-radius: 8px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lq-ink-3); }
  .ed-icon-btn:hover { color: var(--ed-accent); border-color: var(--ed-accent); }
  .ed-note-body { font-size: 13px; color: var(--lq-ink-2); line-height: 1.55; font-style: italic; }
  .ed-dim { font-family: var(--font-mono); font-size: 11px; color: var(--lq-ink-3); }

  @media screen { .ed-print { display: none; } }
  @media print {
    body * { visibility: hidden; }
    .ed-print, .ed-print * { visibility: visible; }
    .ed-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; color: #0e1833; }
    .ed-print-brand { font-family: var(--font-mono, monospace); font-weight: 700; letter-spacing: 0.2em; font-size: 12px; color: var(--ed-accent); }
    .ed-print-title { font-size: 24px; margin: 8px 0 4px; }
    .ed-print-meta { font-size: 12px; color: #555; margin-bottom: 14px; }
    .ed-print-h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin: 16px 0 6px; }
    .ed-print-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .ed-print-table td { border-bottom: 1px solid #eee; padding: 4px 0; }
    .ed-print-foot { margin-top: 20px; font-size: 10px; color: #999; }
  }
`
