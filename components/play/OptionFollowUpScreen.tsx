'use client'

/**
 * Option follow-up screen — runs immediately after a candidate picks a
 * scenario option that carries a follow-up. Layout:
 *
 *   ┌ "WHY THAT ONE?" pill (centred)
 *   │ Why did you choose this approach?          (italic serif prompt)
 *   │
 *   │ [ cream card A ]  [ cream card B ]  [ cream card C ]
 *   │
 *   │ ┌ YOUR REASONING — RECOMMENDED
 *   │ │ Take 30 seconds to explain why you picked this…
 *   │ │ [ textarea ]
 *   │ │ 0 / 2000                        [ Continue → ]
 *   │ └
 *   └
 *
 * The cards SELECT (they don't auto-advance). The optional reasoning
 * textarea lets the candidate explain in their own words — that's the
 * part the partner scores against. A "Continue" button in the bottom-
 * right of the reasoning panel commits both to history and advances.
 */

import { useState } from 'react'
import type { HistoryEntry } from '@/components/play/screens'

type Leaning = 'support' | 'neutral' | 'challenge'

interface FollowUp {
  prompt: string
  choices: { id: string; text: string; leaning: Leaning; reasoning?: string }[]
}

interface OptionFollowUpScreenProps {
  entry: HistoryEntry
  followUp: FollowUp
  theme: string
  isProfessional: boolean
  onPick: (choice: { id: string; text: string; leaning: Leaning; reasoning?: string }) => void
}

const MAX_REASONING = 2000

export function OptionFollowUpScreen({ entry, followUp, isProfessional, onPick }: OptionFollowUpScreenProps) {
  void entry
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reasoning, setReasoning] = useState('')

  const selected = followUp.choices.find((c) => c.id === selectedId) || null

  const submit = () => {
    if (!selected) return
    onPick({
      id: selected.id,
      text: selected.text,
      leaning: selected.leaning,
      reasoning: reasoning.trim() || undefined,
    })
  }

  return (
    <div className="ofu-root">
      <div className="ofu-wrap">
        {/* Centred pill — "WHY THAT ONE?" */}
        <div className="ofu-chip mono">Why that one?</div>

        {/* Italic serif prompt */}
        <h2 className="ofu-prompt">{followUp.prompt}</h2>

        {/* 3 cream cards — click to select */}
        <div className="ofu-choices">
          {followUp.choices.map((c) => {
            const isSel = selectedId === c.id
            return (
              <button
                key={c.id}
                type="button"
                className={`ofu-card ${isSel ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(c.id)}
                aria-pressed={isSel}
              >
                <span className="ofu-card-text">{c.text}</span>
              </button>
            )
          })}
        </div>

        {/* Reasoning panel — dark navy card, "RECOMMENDED" eyebrow */}
        <div className="ofu-reason">
          <div className="ofu-reason-head mono">
            <span>Your reasoning</span>
            <span className="ofu-reason-arrow" aria-hidden>&nbsp;—&nbsp;</span>
            <span className="ofu-reason-rec">Recommended</span>
          </div>
          <p className="ofu-reason-hint">
            Take 30 seconds to explain why you picked this. This is the part the
            team scores on &mdash; a quick sentence or two is enough.
          </p>
          <textarea
            className="ofu-reason-text"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value.slice(0, MAX_REASONING))}
            placeholder="e.g. I prioritised stabilising the immediate risk because…"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && selected) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <div className="ofu-reason-foot">
            <span className="ofu-reason-count mono">{reasoning.length} / {MAX_REASONING}</span>
            <button
              type="button"
              className="ofu-continue"
              onClick={submit}
              disabled={!selected}
              title={selected ? 'Continue' : 'Pick one of the cards above first'}
            >
              Continue <span aria-hidden>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ofu-root {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 4vw, 56px);
          background: var(--bg);
          overflow-y: auto;
        }
        .ofu-wrap {
          width: 100%;
          max-width: ${isProfessional ? 1080 : 1160}px;
          margin: 0 auto;
          text-align: center;
        }

        /* Pill — "WHY THAT ONE?" */
        .ofu-chip {
          display: inline-block;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid var(--line-2);
          background: transparent;
          color: var(--accent);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 22px;
        }

        /* Italic serif prompt */
        .ofu-prompt {
          font-family: var(--f-display);
          font-weight: 500;
          font-style: italic;
          font-size: clamp(24px, 3.4vw, 40px);
          letter-spacing: -0.018em;
          line-height: 1.18;
          color: var(--ink);
          margin: 0 0 38px;
        }

        /* Cream cards — 3 across, click to select */
        .ofu-choices {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 34px;
        }
        .ofu-card {
          appearance: none;
          background: var(--lq-cream, #f4ecdc);
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 26px 24px;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
          box-shadow: 0 2px 0 rgba(10, 42, 107, 0.04);
        }
        .ofu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -14px rgba(0, 0, 0, 0.45);
        }
        .ofu-card.is-selected {
          border-color: var(--accent, #4a90e2);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.20), 0 10px 20px -14px rgba(0, 0, 0, 0.45);
        }
        .ofu-card-text {
          font-family: var(--f-display);
          font-weight: 500;
          font-size: 17px;
          line-height: 1.4;
          color: var(--launch-navy, #0a2a6b);
        }

        /* Reasoning panel — dark, bordered */
        .ofu-reason {
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 14px;
          padding: 22px 24px;
          background: rgba(255, 255, 255, 0.02);
        }
        .ofu-reason-head {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--ink-3);
          margin-bottom: 8px;
        }
        .ofu-reason-arrow {
          color: var(--ink-3);
          opacity: 0.6;
        }
        .ofu-reason-rec {
          color: #d4748a;  /* soft rose, matches the "challenge" leaning */
        }
        .ofu-reason-hint {
          margin: 0 0 14px;
          font-size: 13.5px;
          color: var(--ink-2);
          line-height: 1.55;
        }
        .ofu-reason-text {
          width: 100%;
          min-height: 96px;
          resize: vertical;
          background: rgba(0, 0, 0, 0.20);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--ink);
          font-family: var(--f-body);
          font-size: 14px;
          line-height: 1.55;
        }
        .ofu-reason-text:focus {
          outline: none;
          border-color: var(--accent);
        }
        .ofu-reason-text::placeholder {
          color: var(--ink-3);
          opacity: 0.7;
        }
        .ofu-reason-foot {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .ofu-reason-count {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--ink-3);
        }
        .ofu-continue {
          appearance: none;
          background: var(--accent);
          border: 1px solid var(--accent);
          border-radius: 999px;
          padding: 9px 22px;
          color: #fff;
          font-family: var(--f-body);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 160ms ease, transform 160ms ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ofu-continue:hover { transform: translateY(-1px); }
        .ofu-continue:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .ofu-choices { grid-template-columns: 1fr; }
          .ofu-card { min-height: 80px; padding: 18px 20px; }
        }
      `}</style>
    </div>
  )
}
