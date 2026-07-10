'use client'

/**
 * Scenario library — the educator's window into what students can play.
 *
 * Shows the pre-built scenarios + the teacher's own creations ("Yours"),
 * each previewable and assignable to a cohort. The dashed "Build your own"
 * card opens the classroom-lens dialog: pick a subject, describe the angle
 * ("A Nike scenario focused on economics"), then the full ScenarioBuilder
 * opens — same authoring power the corporates get, teacher register.
 */

import { useState } from 'react'
import {
  CAPABILITY_SHORT, ASSIGNABLE_SCENARIOS,
  type Cohort, type EdAssignment,
} from '@/lib/educator'
import { ED_NOW, type EdWorkspace, type EdScenario } from '@/components/educator/types'
import { ModalShell } from '@/components/educator/ui'
import { Plus, Eye, Send, Check, Sparkles, PencilRuler } from 'lucide-react'

export function ScenarioLibrary({
  ws, onAssign, onOpenBuilder,
}: {
  ws: EdWorkspace
  onAssign: (a: EdAssignment) => void
  /** Opens the ScenarioBuilder, optionally seeded with a classroom lens. */
  onOpenBuilder: (lens: { subjectName?: string; brief?: string }) => void
}) {
  const [preview, setPreview] = useState<EdScenario | null>(null)
  const [assigning, setAssigning] = useState<EdScenario | null>(null)
  const [lensOpen, setLensOpen] = useState(false)

  const scenarios: EdScenario[] = [
    ...ws.customScenarios,
    ...ASSIGNABLE_SCENARIOS.map((s) => ({ ...s })),
  ]

  return (
    <div className="ed-lib">
      <div className="ed-section-head" style={{ marginTop: 44 }}>
        <div>
          <h2 className="ed-h2">Scenario library</h2>
          <p className="ed-lib-sub">What your students can play — preview anything, assign it to a cohort, or author your own through your subject&rsquo;s lens.</p>
        </div>
        <button type="button" className="ed-btn ed-btn-primary" onClick={() => setLensOpen(true)}>
          <PencilRuler className="w-4 h-4" /> Build your own
        </button>
      </div>

      <div className="ed-lib-grid">
        {/* Build-your-own card leads the grid */}
        <button type="button" className="ed-lib-build" onClick={() => setLensOpen(true)}>
          <Sparkles className="w-5 h-5" style={{ color: 'var(--ed-accent)' }} />
          <span className="ed-lib-build-title">Author for your classroom</span>
          <span className="ed-lib-build-sub">&ldquo;A Nike scenario focused on economics&rdquo; — describe the angle, we&rsquo;ll draft it with you.</span>
        </button>

        {scenarios.map((s) => (
          <article key={s.id} className="ed-lib-card">
            <div className="ed-lib-top">
              <span className="ed-lib-emoji">{s.emoji}</span>
              {s.isCustom && <span className="ed-lib-yours">Yours{s.subjectName ? ` · ${s.subjectName}` : ''}</span>}
            </div>
            <h3 className="ed-lib-name">{s.title}</h3>
            <p className="ed-lib-blurb">{s.blurb}</p>
            <div className="ed-lib-tags">
              {s.capabilities.map((c) => <span key={c} className="ed-lib-tag">{CAPABILITY_SHORT[c] || c}</span>)}
            </div>
            <div className="ed-lib-foot">
              <span className="ed-dim">{s.decisions} decisions · ~{s.mins} min</span>
              <span className="ed-lib-actions">
                <button type="button" className="ed-lib-btn" onClick={() => setPreview(s)}><Eye className="w-3.5 h-3.5" /> Preview</button>
                <button type="button" className="ed-lib-btn ed-lib-btn-primary" onClick={() => setAssigning(s)}><Send className="w-3.5 h-3.5" /> Assign</button>
              </span>
            </div>
          </article>
        ))}
      </div>

      {preview && (
        <PreviewModal scenario={preview} onClose={() => setPreview(null)} onAssign={() => { setAssigning(preview); setPreview(null) }} />
      )}
      {assigning && (
        <AssignToCohort scenario={assigning} cohorts={ws.cohorts} onClose={() => setAssigning(null)} onAssign={(a) => { onAssign(a); setAssigning(null) }} />
      )}
      {lensOpen && (
        <LensDialog subjects={ws.subjects.map((s) => s.name)} onClose={() => setLensOpen(false)} onGo={(lens) => { setLensOpen(false); onOpenBuilder(lens) }} />
      )}

      <style>{libStyles}</style>
    </div>
  )
}

/* ── Preview ──────────────────────────────────────────────────────── */

function PreviewModal({ scenario, onClose, onAssign }: { scenario: EdScenario; onClose: () => void; onAssign: () => void }) {
  return (
    <ModalShell title={`${scenario.emoji}  ${scenario.title}`} onClose={onClose} wide>
      <p className="ed-prev-blurb">{scenario.blurb}</p>
      <div className="ed-prev-meta">
        <div><span className="ed-prev-num">{scenario.decisions}</span><span className="ed-prev-lbl">Live decisions</span></div>
        <div><span className="ed-prev-num">~{scenario.mins}</span><span className="ed-prev-lbl">Minutes</span></div>
        <div><span className="ed-prev-num">{scenario.capabilities.length}</span><span className="ed-prev-lbl">Capabilities tested</span></div>
      </div>
      <div className="ed-field">
        <label className="ed-label">What it measures</label>
        <div className="ed-lib-tags">{scenario.capabilities.map((c) => <span key={c} className="ed-lib-tag">{CAPABILITY_SHORT[c] || c}</span>)}</div>
      </div>
      <div className="ed-prev-how">
        <div className="ed-label" style={{ marginBottom: 8 }}>How students experience it</div>
        <p>They step into the role, face {scenario.decisions} live decisions — each with three answers or their own words — and Launch scores every choice against the capability benchmarks. You see their full path afterwards.</p>
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Close</button>
        <button type="button" className="ed-btn ed-btn-primary" onClick={onAssign}><Send className="w-4 h-4" /> Assign to a cohort</button>
      </div>
      <style>{`
        .ed-prev-blurb { font-family: var(--font-display); font-style: italic; font-size: 17px; color: var(--lq-ink-2); line-height: 1.5; margin-bottom: 18px; }
        .ed-prev-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
        .ed-prev-meta > div { background: #fbfaf7; border: 1px solid var(--lq-line); border-radius: 12px; padding: 12px; text-align: center; }
        .ed-prev-num { display: block; font-family: var(--font-mono); font-weight: 700; font-size: 22px; color: var(--ed-accent); }
        .ed-prev-lbl { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); }
        .ed-prev-how { background: var(--ed-accent-soft); border-radius: 12px; padding: 14px 16px; margin-top: 4px; }
        .ed-prev-how p { font-size: 13px; color: var(--lq-ink-2); line-height: 1.6; }
      `}</style>
    </ModalShell>
  )
}

/* ── Assign to cohort ─────────────────────────────────────────────── */

function AssignToCohort({ scenario, cohorts, onClose, onAssign }: { scenario: EdScenario; cohorts: Cohort[]; onClose: () => void; onAssign: (a: EdAssignment) => void }) {
  const [cohortId, setCohortId] = useState(cohorts[0]?.id || '')
  const [due, setDue] = useState('')
  const [done, setDone] = useState(false)
  const cohort = cohorts.find((c) => c.id === cohortId)

  const go = () => {
    if (!cohort) return
    onAssign({
      id: `as-${Date.now().toString(36)}`,
      cohortId: cohort.id,
      title: scenario.title,
      capabilities: scenario.capabilities,
      assignedTo: 'cohort',
      dueAt: due ? new Date(due).toISOString() : undefined,
      createdAt: new Date(ED_NOW).toISOString(),
      progress: cohort.studentIds.map((id) => ({ studentId: id, state: 'not-started' as const })),
    })
    setDone(true)
  }

  return (
    <ModalShell title={`Assign ${scenario.title}`} onClose={onClose}>
      {done ? (
        <div style={{ textAlign: 'center', padding: '18px 0' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}><Check className="w-9 h-9" style={{ display: 'inline', color: 'var(--ed-accent)' }} /></div>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--lq-ink-2)' }}>
            Assigned to {cohort?.name} — track it on the cohort&rsquo;s Assignments tab.
          </p>
        </div>
      ) : (
        <>
          <div className="ed-field">
            <label className="ed-label">Cohort</label>
            <select className="ed-input" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
              {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.studentIds.length} students</option>)}
            </select>
          </div>
          <div className="ed-field">
            <label className="ed-label">Due date (optional)</label>
            <input type="date" className="ed-input" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="ed-modal-foot">
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="ed-btn ed-btn-primary" disabled={!cohort} onClick={go}>
              Assign to {cohort?.studentIds.length ?? 0} students
            </button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ── Classroom lens dialog ────────────────────────────────────────── */

function LensDialog({ subjects, onClose, onGo }: { subjects: string[]; onClose: () => void; onGo: (lens: { subjectName?: string; brief?: string }) => void }) {
  const [subject, setSubject] = useState(subjects[0] || '')
  const [brief, setBrief] = useState('')
  return (
    <ModalShell title="Author for your classroom" onClose={onClose}>
      <p className="ed-lens-note">
        Describe the scenario the way you&rsquo;d brief a colleague. An economics
        teacher might want <em>&ldquo;a Nike scenario focused on economics&rdquo;</em>;
        business studies might want <em>&ldquo;one built around supply and demand&rdquo;</em>.
        The builder drafts it with you — you edit everything before it ships.
      </p>
      <div className="ed-field">
        <label className="ed-label">Your subject</label>
        <select className="ed-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.length === 0 && <option value="">General</option>}
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="ed-field">
        <label className="ed-label">The angle</label>
        <textarea
          className="ed-input" style={{ minHeight: 84 }} autoFocus
          placeholder="A Nike scenario where students run the sneaker launch — pricing, demand, and a supply shock…"
          value={brief} onChange={(e) => setBrief(e.target.value)}
        />
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="ed-btn ed-btn-primary" onClick={() => onGo({ subjectName: subject || undefined, brief: brief.trim() || undefined })}>
          <PencilRuler className="w-4 h-4" /> Open the builder
        </button>
      </div>
      <style>{`.ed-lens-note { font-size: 13.5px; color: var(--lq-ink-2); line-height: 1.6; margin-bottom: 16px; } .ed-lens-note em { color: var(--lq-ink); }`}</style>
    </ModalShell>
  )
}

/* ── styles ───────────────────────────────────────────────────────── */

const libStyles = `
  .ed-lib-sub { font-size: 13.5px; color: var(--lq-ink-2); margin-top: 6px; max-width: 64ch; line-height: 1.55; }
  .ed-lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .ed-lib-card { background: #fff; border: 1px solid var(--lq-line); border-radius: 18px; padding: 18px 20px; display: flex; flex-direction: column; transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
  .ed-lib-card:hover { border-color: var(--ed-accent); box-shadow: 0 12px 30px -18px var(--ed-accent); transform: translateY(-2px); }
  .ed-lib-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .ed-lib-emoji { font-size: 24px; }
  .ed-lib-yours { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ed-accent); background: var(--ed-accent-soft); border-radius: 999px; padding: 3px 9px; }
  .ed-lib-name { font-family: var(--font-display); font-weight: 500; font-size: 18px; letter-spacing: -0.012em; color: var(--lq-ink); margin-bottom: 6px; }
  .ed-lib-blurb { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; margin-bottom: 12px; flex: 1; }
  .ed-lib-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
  .ed-lib-tag { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.05em; color: var(--lq-ink-2); background: #f2efe8; border-radius: 999px; padding: 3px 8px; }
  .ed-lib-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px solid var(--lq-line); }
  .ed-lib-actions { display: flex; gap: 6px; }
  .ed-lib-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 999px; border: 1px solid var(--lq-line-2); background: #fff; font-size: 11.5px; font-weight: 600; color: var(--lq-ink-2); cursor: pointer; transition: border-color 140ms ease, color 140ms ease; }
  .ed-lib-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }
  .ed-lib-btn-primary { background: var(--ed-accent); border-color: var(--ed-accent); color: #fff; }
  .ed-lib-btn-primary:hover { color: #fff; opacity: 0.92; }
  .ed-lib-build { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; text-align: left; background: var(--ed-accent-soft); border: 1.5px dashed var(--ed-accent); border-radius: 18px; padding: 20px; cursor: pointer; transition: transform 180ms ease, box-shadow 180ms ease; }
  .ed-lib-build:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -18px var(--ed-accent); }
  .ed-lib-build-title { font-family: var(--font-display); font-weight: 500; font-size: 18px; color: var(--lq-ink); }
  .ed-lib-build-sub { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; }
`
