'use client'

/** Live free-play session card — join code, real countdown, students-in,
 *  "see what students see" (jumps into the actual student play experience),
 *  and End session. Renders on the educator home while a session runs. */

import { useEffect, useState } from 'react'
import type { FreePlaySession, EdWorkspace } from '@/components/educator/types'
import { Gamepad2, Eye, X, Copy, Check } from 'lucide-react'

export function FreePlayCard({
  ws, session, onEnd, onPreview,
}: {
  ws: EdWorkspace
  session: FreePlaySession
  onEnd: () => void
  onPreview: () => void
}) {
  const cohort = ws.cohorts.find((c) => c.id === session.cohortId)
  const [now, setNow] = useState(() => Date.now())
  const [copied, setCopied] = useState(false)

  // Real wall-clock countdown — ticks every second while the card is mounted.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const endsAt = Date.parse(session.startedAt) + session.durationMins * 60_000
  const remaining = Math.max(0, endsAt - now)
  const mm = Math.floor(remaining / 60_000)
  const ss = Math.floor((remaining % 60_000) / 1000)
  const expired = remaining === 0

  // Design-level "students in session" — a steady majority of the cohort.
  const joined = cohort ? Math.max(1, Math.round(cohort.studentIds.length * 0.72)) : 0

  return (
    <div className={`ed-fp ${expired ? 'is-over' : ''}`}>
      <div className="ed-fp-left">
        <span className="ed-fp-ico"><Gamepad2 className="w-5 h-5" /></span>
        <div>
          <div className="ed-fp-title">Free play · {cohort?.name ?? 'Cohort'}</div>
          <div className="ed-fp-sub">
            {expired
              ? 'Session ended — results are in the cohort’s Insights.'
              : `${joined} of ${cohort?.studentIds.length ?? 0} students in · results land as they finish`}
          </div>
        </div>
      </div>
      <div className="ed-fp-right">
        <button type="button" className="ed-fp-code" onClick={() => { navigator.clipboard?.writeText(session.code); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>
          {session.code} {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <span className={`ed-fp-clock ${expired ? 'is-over' : ''}`}>{expired ? '0:00' : `${mm}:${String(ss).padStart(2, '0')}`}</span>
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onPreview}><Eye className="w-4 h-4" /> See what students see</button>
        <button type="button" className="ed-fp-end" aria-label="End session" onClick={onEnd}><X className="w-4 h-4" /></button>
      </div>
      <style>{`
        .ed-fp { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: linear-gradient(135deg, var(--ed-accent-soft), #fff 60%); border: 1.5px solid var(--ed-accent); border-radius: 20px; padding: 18px 22px; margin-bottom: 28px; animation: ed-rise 440ms cubic-bezier(0.2,0.7,0.2,1) both; }
        .ed-fp.is-over { border-color: var(--lq-line-2); background: #fff; }
        .ed-fp-left { display: flex; align-items: center; gap: 14px; }
        .ed-fp-ico { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 14px; background: var(--ed-accent); color: #fff; flex-shrink: 0; }
        .ed-fp-title { font-family: var(--font-display); font-weight: 500; font-size: 17px; color: var(--lq-ink); }
        .ed-fp-sub { font-size: 12.5px; color: var(--lq-ink-2); margin-top: 2px; }
        .ed-fp-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .ed-fp-code { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-weight: 700; font-size: 15px; letter-spacing: 0.06em; color: var(--ed-accent); background: #fff; border: 1px solid var(--lq-line-2); border-radius: 999px; padding: 7px 14px; cursor: pointer; }
        .ed-fp-code:hover { border-color: var(--ed-accent); }
        .ed-fp-clock { font-family: var(--font-mono); font-weight: 700; font-size: 20px; color: var(--lq-ink); min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; }
        .ed-fp-clock.is-over { color: var(--lq-ink-3); }
        .ed-fp-end { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 999px; border: 1px solid var(--lq-line-2); background: #fff; color: var(--lq-ink-3); cursor: pointer; }
        .ed-fp-end:hover { color: var(--launch-danger); border-color: var(--launch-danger); }
      `}</style>
    </div>
  )
}
