'use client'

/**
 * Option follow-up screen — runs immediately after a candidate picks a
 * scenario option that carries a follow-up branch ("Why did you pick THIS?").
 * Three leaning-tagged sub-choices; click → record + continue to the next
 * decision (or wherever the parent flow goes).
 *
 * Visual register matches the play theme via the existing `.lq-play-root[data-theme]`
 * tokens — same look as DecisionScreen options, just inside an interstitial.
 */

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
  onPick: (choice: { id: string; text: string; leaning: Leaning }) => void
}

export function OptionFollowUpScreen({ entry, followUp, isProfessional, onPick }: OptionFollowUpScreenProps) {
  const echo = entry.label || ''
  return (
    <div className="ofu-root">
      <div className="ofu-wrap">
        {echo && (
          <div className="ofu-echo">
            <span className="ofu-kicker">You chose</span>
            <span className="ofu-echo-text">{echo}</span>
          </div>
        )}
        <h2 className="ofu-prompt">{followUp.prompt}</h2>
        <p className="ofu-hint">
          Pick the answer that&rsquo;s closest to what you were actually thinking.
        </p>

        <div className="ofu-choices">
          {followUp.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`ofu-choice ofu-${c.leaning}`}
              onClick={() => onPick({ id: c.id, text: c.text, leaning: c.leaning })}
            >
              <span className="ofu-leaning">{c.leaning}</span>
              <span className="ofu-choice-text">{c.text}</span>
            </button>
          ))}
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
        }
        .ofu-wrap {
          width: 100%;
          max-width: ${isProfessional ? 720 : 800}px;
          margin: 0 auto;
          text-align: ${isProfessional ? 'center' : 'left'};
        }
        .ofu-echo {
          margin: 0 0 18px;
          padding: 10px 14px;
          border-left: 2px solid var(--accent);
          background: var(--accent-soft);
          border-radius: 6px;
          display: ${isProfessional ? 'none' : 'inline-flex'};
          flex-direction: column;
          gap: 2px;
        }
        .ofu-kicker {
          font-family: var(--f-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .ofu-echo-text {
          font-family: var(--f-display);
          font-weight: 500;
          font-style: italic;
          color: var(--ink);
          font-size: 15px;
        }
        .ofu-prompt {
          font-family: var(--f-display);
          font-weight: 500;
          font-size: clamp(22px, 2.8vw, 32px);
          letter-spacing: -0.018em;
          line-height: 1.2;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .ofu-hint {
          margin: 0 0 22px;
          color: var(--ink-2);
          font-size: 14px;
          line-height: 1.5;
        }
        .ofu-choices {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .ofu-choice {
          appearance: none;
          background: var(--bg-2);
          border: 1px solid var(--line-2);
          border-radius: ${isProfessional ? 10 : 14}px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          cursor: pointer;
          color: var(--ink);
          transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
        }
        .ofu-choice:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .ofu-leaning {
          flex-shrink: 0;
          padding: 3px 9px;
          border-radius: 999px;
          font-family: var(--f-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .ofu-support  .ofu-leaning { background: rgba(27, 158, 143, 0.18); color: var(--accent); }
        .ofu-neutral  .ofu-leaning { background: rgba(146, 184, 255, 0.18); color: var(--ink-2); }
        .ofu-challenge .ofu-leaning { background: rgba(122, 14, 42, 0.16); color: #d4748a; }
        .ofu-choice-text {
          font-family: var(--f-body);
          font-size: 15px;
          line-height: 1.5;
          color: var(--ink);
        }
      `}</style>
    </div>
  )
}
