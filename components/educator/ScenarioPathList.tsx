'use client'

/**
 * ScenarioPathList — "Scenarios & path" on the student drill-in.
 *
 * Every scenario a student has completed, tagged with how they got in
 * (SAM origin: pre-existing journey / guided start / own adventure) and
 * expandable into the DECISION PATH — the corporate candidate profile's
 * DecisionPathCard pattern (student-profile-view.tsx), restyled onto the
 * educator's corp-card host. A navy line traces pick → pick so the
 * advisor can see the literal path through the scenario.
 */

import { useState } from 'react'
import { SAM_LABEL, type ScenarioRun } from '@/lib/educator'
import { fmtDate } from '@/components/educator/ui'

export function ScenarioPathList({ runs }: { runs: ScenarioRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="ed-empty">
        <div className="ed-eyebrow" style={{ marginBottom: 8 }}>No scenarios yet</div>
        <p>Completed scenarios — and the path taken through each — will appear here.</p>
      </div>
    )
  }
  const ordered = [...runs].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
  return (
    <div className="spl">
      {ordered.map((run) => <RunCard key={run.id} run={run} />)}
      <style>{splStyles}</style>
    </div>
  )
}

function RunCard({ run }: { run: ScenarioRun }) {
  const [open, setOpen] = useState(false)
  const hasPath = run.decisions.length > 0
  return (
    <div className="ed-scard spl-card">
      <button type="button" className="spl-head" aria-expanded={open} onClick={() => hasPath && setOpen((v) => !v)} style={!hasPath ? { cursor: 'default' } : undefined}>
        <div className="spl-title">
          {run.emoji && <span className="spl-emoji" aria-hidden>{run.emoji}</span>}
          <div>
            <div className="spl-name">{run.title}</div>
            <div className="spl-meta">
              {run.capabilities.join(' · ') || '—'}
            </div>
          </div>
        </div>
        <div className="spl-side">
          <span className="corp-chip">{SAM_LABEL[run.origin]}</span>
          <span className="spl-date">{fmtDate(run.completedAt)}</span>
          {run.score != null && <span className="spl-score">{run.score}</span>}
          {hasPath
            ? <span className="spl-chev" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
            : <span className="spl-nopath">path not captured</span>}
        </div>
      </button>

      {open && hasPath && (
        <div className="spl-body">
          <div className="dp-stack">
            {run.decisions.map((d, idx) => (
              <div key={idx} className="dp-step">
                <div className="dp-step-head">
                  <span className="dp-step-num">Q{idx + 1}</span>
                  {d.skill && <span className="dp-step-skill">Tests · {d.skill}</span>}
                </div>
                <p className="dp-prompt">{d.prompt}</p>
                <div className="dp-options">
                  {d.options.map((o, oi) => (
                    <div key={o.id} className={`dp-option ${o.picked ? 'is-picked' : ''}`}>
                      <span className="dp-option-letter">{String.fromCharCode(65 + oi)}</span>
                      <span className="dp-option-text">{o.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="spl-end">▼ End of scenario</p>
        </div>
      )}
    </div>
  )
}

const splStyles = `
  .spl { display: flex; flex-direction: column; gap: 10px; }
  .spl-card { padding: 0; overflow: hidden; }
  .spl-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 20px; background: none; border: none; cursor: pointer; text-align: left; transition: background 160ms ease; flex-wrap: wrap; }
  .spl-head:hover { background: var(--corp-canvas); }
  .spl-title { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .spl-emoji { font-size: 20px; }
  .spl-name { font-family: var(--font-display); font-weight: 500; font-size: 16px; color: var(--lq-ink); }
  .spl-meta { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--lq-ink-3); margin-top: 2px; }
  .spl-side { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .spl-date { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lq-ink-3); }
  .spl-score { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--launch-navy); }
  .spl-chev { font-family: var(--font-mono); font-size: 13px; color: var(--lq-ink-3); transition: transform 200ms ease; display: inline-block; }
  .spl-nopath { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); font-style: italic; }
  .spl-body { padding: 16px 20px 20px; border-top: 1px solid var(--lq-line); }
  .spl-end { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lq-ink-3); text-align: center; margin: 24px 0 0; }

  .dp-stack { position: relative; display: flex; flex-direction: column; gap: 24px; }
  .dp-step { position: relative; }
  .dp-step-head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .dp-step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 999px;
    background: var(--launch-navy); color: var(--lq-cream);
    font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  }
  .dp-step-skill { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--lq-ink-3); font-weight: 600; }
  .dp-prompt { margin: 0 0 12px 0; font-family: var(--font-display); font-weight: 500; font-size: 15px; line-height: 1.45; color: var(--lq-ink); max-width: 64ch; }
  .dp-options { display: grid; grid-template-columns: 1fr; gap: 8px; }
  .dp-option {
    position: relative; display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 14px; border: 1px solid var(--lq-line); border-radius: 10px; background: #fff;
    transition: background 160ms ease, border-color 160ms ease;
  }
  .dp-option.is-picked { background: rgba(10, 42, 107, 0.05); border-color: var(--launch-navy); }
  .dp-option-letter {
    flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 999px;
    background: rgba(10, 42, 107, 0.08); color: var(--lq-ink-3);
    font-family: var(--font-mono); font-size: 11px; font-weight: 700; margin-top: 1px;
  }
  .dp-option.is-picked .dp-option-letter { background: var(--launch-navy); color: var(--lq-cream); }
  .dp-option-text { font-size: 13px; line-height: 1.5; color: var(--lq-ink); }
  .dp-option.is-picked .dp-option-text { font-weight: 500; }

  /* The connecting navy line that traces the path step → step. */
  .dp-step::after {
    content: ''; position: absolute; left: 15px; bottom: -24px;
    width: 2px; height: 24px; background: var(--launch-navy); opacity: 0.55;
  }
  .dp-step:last-of-type::after { height: 12px; opacity: 0.35; }
`
