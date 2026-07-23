'use client'

/**
 * NewScenarioFlow — THE way teachers create + assign. Purpose first:
 *
 *   Step 1 · PURPOSE   — Subject focus / General practice / Free play
 *   Step 2 · DETAILS   — audience (a cohort, or open) + purpose-specific setup
 *
 * Purpose is the WHY; the cohort is the WHO (picked inside step 2).
 * When a cohort is chosen, Launch reads its weakest capabilities and
 * suggests scenario angles that stretch exactly those — the analytics
 * feeding the authoring.
 */

import { useMemo, useState } from 'react'
import {
  CAPABILITY_SHORT, GENERAL_PACKS, ASSIGNABLE_SCENARIOS,
  cohortAverageScores, weakestCapabilities,
} from '@/lib/educator'
import type { EdWorkspace, BuilderLens, FreePlaySession } from '@/components/educator/types'
import { ModalShell } from '@/components/educator/ui'
import { BookOpen, Dumbbell, Gamepad2, ArrowLeft, Sparkles, Check } from 'lucide-react'

type Purpose = 'subject' | 'general' | 'freeplay'

export function NewScenarioFlow({
  ws, onClose, onOpenBuilder, onAssignPack, onStartFreePlay,
}: {
  ws: EdWorkspace
  onClose: () => void
  onOpenBuilder: (lens: BuilderLens) => void
  /** Assigns every scenario in the pack to the cohort; returns the count. */
  onAssignPack: (cohortId: string, packId: string, dueIso?: string) => number
  /** Creates + returns the live session so the code can be shown. */
  onStartFreePlay: (cohortId: string, durationMins: number) => FreePlaySession
}) {
  const [purpose, setPurpose] = useState<Purpose | null>(null)

  return (
    <ModalShell title={purpose === null ? 'What are we doing today?' : PURPOSE_META[purpose].title} onClose={onClose} wide>
      {purpose === null ? (
        <div className="ed-nsf-purposes">
          {(Object.keys(PURPOSE_META) as Purpose[]).map((p) => {
            const m = PURPOSE_META[p]
            return (
              <button key={p} type="button" className="ed-nsf-purpose" onClick={() => setPurpose(p)}>
                <span className="ed-nsf-ico">{m.icon}</span>
                <span className="ed-nsf-name">{m.name}</span>
                <span className="ed-nsf-sub">{m.sub}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <button type="button" className="ed-nsf-back" onClick={() => setPurpose(null)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Purpose
          </button>
          {purpose === 'subject' && <SubjectStep ws={ws} onGo={onOpenBuilder} />}
          {purpose === 'general' && <GeneralStep ws={ws} onAssignPack={onAssignPack} />}
          {purpose === 'freeplay' && <FreePlayStep ws={ws} onStart={onStartFreePlay} />}
        </>
      )}
      <style>{nsfStyles}</style>
    </ModalShell>
  )
}

const PURPOSE_META: Record<Purpose, { name: string; title: string; sub: string; icon: React.ReactNode }> = {
  subject: {
    name: 'Subject focus',
    title: 'Teach through your subject',
    sub: 'Author through your subject’s lens.',
    icon: <BookOpen className="w-5 h-5" />,
  },
  general: {
    name: 'General practice',
    title: 'A broad capability workout',
    sub: 'Assign a curated pack in one go.',
    icon: <Dumbbell className="w-5 h-5" />,
  },
  freeplay: {
    name: 'Free play',
    title: 'Open the platform, timed',
    sub: 'Timed open play. Results roll in.',
    icon: <Gamepad2 className="w-5 h-5" />,
  },
}

/* ── Audience picker (shared) ─────────────────────────────────────── */

function AudienceSelect({ ws, value, onChange, allowOpen }: { ws: EdWorkspace; value: string; onChange: (v: string) => void; allowOpen?: boolean }) {
  return (
    <div className="ed-field">
      <label className="ed-label">Who is this for?</label>
      <select className="ed-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {allowOpen && <option value="">Open — any of my students</option>}
        {ws.cohorts.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.studentIds.length} students</option>)}
      </select>
    </div>
  )
}

/* ── Subject focus ────────────────────────────────────────────────── */

function SubjectStep({ ws, onGo }: { ws: EdWorkspace; onGo: (lens: BuilderLens) => void }) {
  const [cohortId, setCohortId] = useState('')
  const [subject, setSubject] = useState(ws.subjects[0]?.name || '')
  const [brief, setBrief] = useState('')

  // Gap-informed suggestions: read the chosen cohort's weakest capabilities
  // and propose angles that stretch exactly those.
  const suggestions = useMemo(() => {
    if (!cohortId) return []
    const cohort = ws.cohorts.find((c) => c.id === cohortId)
    if (!cohort) return []
    const students = ws.students.filter((s) => cohort.studentIds.includes(s.id))
    if (students.length === 0) return []
    return weakestCapabilities(cohortAverageScores(students), 3).map((w) => ({
      cap: CAPABILITY_SHORT[w.name],
      text: `A ${subject || 'classroom'} scenario where ${CAPABILITY_SHORT[w.name].toLowerCase()} decides the outcome — their current soft spot (${w.score}).`,
    }))
  }, [cohortId, subject, ws])

  return (
    <>
      <AudienceSelect ws={ws} value={cohortId} onChange={setCohortId} allowOpen />
      <div className="ed-field">
        <label className="ed-label">Your subject</label>
        <select className="ed-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {ws.subjects.length === 0 && <option value="">General</option>}
          {ws.subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>
      <div className="ed-field">
        <label className="ed-label">The angle</label>
        <textarea
          className="ed-input" style={{ minHeight: 88 }}
          placeholder="A Nike scenario where students run the sneaker launch — pricing, demand, and a supply shock…"
          value={brief} onChange={(e) => setBrief(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="ed-nsf-sugg">
            <span className="ed-nsf-sugg-lbl"><Sparkles className="w-3 h-3" /> Based on this cohort&rsquo;s gaps</span>
            {suggestions.map((s) => (
              <button key={s.cap} type="button" className="ed-nsf-chip" onClick={() => setBrief(s.text)}>
                Stretch {s.cap}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-primary" onClick={() => onGo({ subjectName: subject || undefined, brief: brief.trim() || undefined, cohortId: cohortId || undefined })}>
          Open the builder
        </button>
      </div>
    </>
  )
}

/* ── General practice (packs) ─────────────────────────────────────── */

function GeneralStep({ ws, onAssignPack }: { ws: EdWorkspace; onAssignPack: (cohortId: string, packId: string, dueIso?: string) => number }) {
  const [cohortId, setCohortId] = useState(ws.cohorts[0]?.id || '')
  const [packId, setPackId] = useState(GENERAL_PACKS[0].id)
  const [due, setDue] = useState('')
  const [assigned, setAssigned] = useState<number | null>(null)
  const pack = GENERAL_PACKS.find((p) => p.id === packId)!

  if (assigned !== null) {
    return (
      <div className="ed-nsf-done">
        <Check className="w-9 h-9" style={{ color: 'var(--ed-accent)' }} />
        <p>{assigned} scenarios assigned to {ws.cohorts.find((c) => c.id === cohortId)?.name}. Track them on the cohort&rsquo;s Assignments tab — scores roll up as students play.</p>
      </div>
    )
  }

  return (
    <>
      <AudienceSelect ws={ws} value={cohortId} onChange={setCohortId} />
      <label className="ed-label">Pick a pack</label>
      <div className="ed-nsf-packs">
        {GENERAL_PACKS.map((p) => (
          <button key={p.id} type="button" className={`ed-nsf-pack ${packId === p.id ? 'is-on' : ''}`} onClick={() => setPackId(p.id)}>
            <span className="ed-nsf-pack-emoji">{p.emoji}</span>
            <span className="ed-nsf-pack-name">{p.name}</span>
            <span className="ed-nsf-pack-blurb">{p.blurb}</span>
            <span className="ed-nsf-pack-meta">{p.scenarioIds.length} scenarios · {p.scenarioIds.map((id) => ASSIGNABLE_SCENARIOS.find((s) => s.id === id)?.emoji).join(' ')}</span>
          </button>
        ))}
      </div>
      <div className="ed-field" style={{ marginTop: 16 }}>
        <label className="ed-label">Due date (optional)</label>
        <input type="date" className="ed-input" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
      <div className="ed-modal-foot">
        <button
          type="button" className="ed-btn ed-btn-primary" disabled={!cohortId}
          onClick={() => setAssigned(onAssignPack(cohortId, packId, due ? new Date(due).toISOString() : undefined))}
        >
          Assign {pack.scenarioIds.length} scenarios
        </button>
      </div>
    </>
  )
}

/* ── Free play ────────────────────────────────────────────────────── */

function FreePlayStep({ ws, onStart }: { ws: EdWorkspace; onStart: (cohortId: string, durationMins: number) => FreePlaySession }) {
  const [cohortId, setCohortId] = useState(ws.cohorts[0]?.id || '')
  const [mins, setMins] = useState(30)
  const [session, setSession] = useState<FreePlaySession | null>(null)

  if (session) {
    return (
      <div className="ed-nsf-done">
        <div className="ed-nsf-code">{session.code}</div>
        <p>Session live for {session.durationMins} minutes. Students enter this code on the Scenario door and play anything — results land in the cohort as they finish. The session card is on your home screen.</p>
      </div>
    )
  }

  return (
    <>
      <AudienceSelect ws={ws} value={cohortId} onChange={setCohortId} />
      <div className="ed-field">
        <label className="ed-label">How long?</label>
        <div className="ed-seg">
          {[15, 30, 45, 60].map((m) => (
            <button key={m} type="button" className={mins === m ? 'is-on' : ''} onClick={() => setMins(m)}>{m} min</button>
          ))}
        </div>
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-primary" disabled={!cohortId} onClick={() => setSession(onStart(cohortId, mins))}>
          <Gamepad2 className="w-4 h-4" /> Start session
        </button>
      </div>
    </>
  )
}

/* ── styles ───────────────────────────────────────────────────────── */

const nsfStyles = `
  .ed-nsf-purposes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 6px 0 10px; }
  @media (max-width: 640px) { .ed-nsf-purposes { grid-template-columns: 1fr; } }
  .ed-nsf-purpose { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; text-align: left; padding: 22px 20px; border-radius: 18px; border: 1.5px solid var(--lq-line); background: #fff; cursor: pointer; transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease; }
  .ed-nsf-purpose:hover { border-color: var(--ed-accent); transform: translateY(-2px); box-shadow: 0 14px 30px -20px var(--ed-accent); }
  .ed-nsf-ico { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 12px; background: var(--ed-accent-soft); color: var(--ed-accent); }
  .ed-nsf-name { font-family: var(--font-display); font-weight: 500; font-size: 17px; color: var(--lq-ink); }
  .ed-nsf-sub { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; }
  .ed-nsf-back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); }
  .ed-nsf-back:hover { color: var(--ed-accent); }
  .ed-nsf-sugg { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
  .ed-nsf-sugg-lbl { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ed-accent); font-weight: 700; }
  .ed-nsf-chip { padding: 6px 12px; border-radius: 999px; border: 1px dashed var(--ed-accent); background: var(--ed-accent-soft); font-size: 12px; font-weight: 600; color: var(--ed-accent); cursor: pointer; transition: transform 140ms ease; }
  .ed-nsf-chip:hover { transform: translateY(-1px); }
  .ed-nsf-packs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  @media (max-width: 640px) { .ed-nsf-packs { grid-template-columns: 1fr; } }
  .ed-nsf-pack { display: flex; flex-direction: column; gap: 6px; text-align: left; padding: 16px; border-radius: 14px; border: 1.5px solid var(--lq-line); background: #fff; cursor: pointer; transition: border-color 160ms ease; }
  .ed-nsf-pack.is-on { border-color: var(--ed-accent); background: var(--ed-accent-soft); }
  .ed-nsf-pack-emoji { font-size: 20px; }
  .ed-nsf-pack-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); }
  .ed-nsf-pack-blurb { font-size: 12px; color: var(--lq-ink-2); line-height: 1.5; flex: 1; }
  .ed-nsf-pack-meta { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.05em; color: var(--lq-ink-3); }
  .ed-seg { display: inline-flex; background: #f2efe8; border-radius: 999px; padding: 3px; }
  .ed-seg button { padding: 8px 14px; border-radius: 999px; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--lq-ink-3); white-space: nowrap; }
  .ed-seg button.is-on { background: #fff; color: var(--ed-accent); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .ed-nsf-done { text-align: center; padding: 22px 10px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .ed-nsf-done p { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--lq-ink-2); line-height: 1.6; max-width: 46ch; }
  .ed-nsf-code { font-family: var(--font-mono); font-weight: 700; font-size: 30px; letter-spacing: 0.08em; color: var(--ed-accent); background: var(--ed-accent-soft); border-radius: 16px; padding: 14px 22px; }
`
