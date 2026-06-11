'use client'

/**
 * Intake questions screen — runs BEFORE the scenario when the
 * scenario has generic intake questions attached. Open-text answers.
 * Never blocking — candidate can leave any answer blank and continue.
 *
 * Visual register matches the play theme (cream / cinema / professional)
 * via the existing `.lq-play-root[data-theme]` tokens.
 */

import { useState } from 'react'
import type { GenericIntakeQuestion } from '@/lib/play/types'

interface IntakeQuestionsScreenProps {
  questions: GenericIntakeQuestion[]
  candidateName?: string
  onComplete: (answers: Record<string, string>) => void
}

export function IntakeQuestionsScreen({
  questions,
  candidateName,
  onComplete,
}: IntakeQuestionsScreenProps) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const q = questions[idx]
  const last = idx === questions.length - 1

  const next = () => {
    if (last) onComplete(answers)
    else setIdx(idx + 1)
  }
  const back = () => setIdx(Math.max(0, idx - 1))

  if (!q) {
    // Defensive — no questions, just bail out.
    onComplete({})
    return null
  }

  return (
    <div className="iq-root">
      <div className="iq-card">
        <div className="iq-eyebrow">
          Before we start
          {candidateName ? ` · ${candidateName}` : ''}
        </div>
        <div className="iq-progress">
          Question {idx + 1} of {questions.length}
        </div>
        <h2 className="iq-prompt">{q.prompt || 'Tell us about yourself.'}</h2>
        <p className="iq-hint">
          Open text answer. Take your time. You can leave it blank if
          you&rsquo;d rather move on.
        </p>
        <textarea
          className="iq-textarea"
          value={answers[q.id] || ''}
          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          placeholder="Type your answer here…"
          autoFocus
          rows={7}
        />

        <div className="iq-actions">
          <button
            type="button"
            onClick={back}
            disabled={idx === 0}
            className="iq-btn iq-btn-ghost"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => onComplete(answers)}
            className="iq-btn iq-btn-skip"
          >
            Skip all
          </button>
          <button type="button" onClick={next} className="iq-btn iq-btn-primary">
            {last ? 'Start scenario →' : 'Next question →'}
          </button>
        </div>
      </div>

      <style>{`
        .iq-root {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 4vw, 56px);
          background: var(--bg);
        }
        .iq-card {
          width: 100%;
          max-width: 720px;
          background: var(--bg-2);
          border: 1px solid var(--line);
          border-radius: var(--card-r, 16px);
          padding: clamp(24px, 4vw, 40px);
        }
        .iq-eyebrow {
          font-family: var(--f-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .iq-progress {
          font-family: var(--f-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 18px;
        }
        .iq-prompt {
          margin: 0 0 8px;
          font-family: var(--f-display);
          font-weight: 500;
          font-size: clamp(22px, 2.6vw, 30px);
          letter-spacing: -0.018em;
          line-height: 1.18;
          color: var(--ink);
        }
        .iq-hint {
          margin: 0 0 18px;
          color: var(--ink-2);
          font-size: 14px;
          line-height: 1.5;
        }
        .iq-textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--line-2);
          border-radius: 10px;
          padding: 14px 16px;
          color: var(--ink);
          font-family: var(--f-body);
          font-size: 15px;
          line-height: 1.55;
          resize: vertical;
          min-height: 140px;
          outline: none;
          transition: border-color 160ms ease;
        }
        .iq-textarea:focus { border-color: var(--accent); }
        .iq-actions {
          margin-top: 18px;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .iq-btn {
          appearance: none;
          border: 1px solid transparent;
          padding: 10px 18px;
          border-radius: 10px;
          font-family: var(--f-body);
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.005em;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .iq-btn-primary {
          background: var(--accent);
          color: var(--bg);
          border-color: var(--accent);
        }
        .iq-btn-primary:hover { filter: brightness(1.05); }
        .iq-btn-ghost {
          background: transparent;
          color: var(--ink-2);
          border-color: var(--line-2);
        }
        .iq-btn-ghost:hover:not(:disabled) { color: var(--ink); border-color: var(--accent); }
        .iq-btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }
        .iq-btn-skip {
          background: transparent;
          color: var(--ink-3);
          border-color: transparent;
        }
        .iq-btn-skip:hover { color: var(--ink-2); }
      `}</style>
    </div>
  )
}
