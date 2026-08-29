'use client'

/**
 * The persistent, mode-agnostic capability Scorecard. Journeys and Work
 * scenarios are two equal modes measuring the same underlying capabilities
 * — this is where the evidence from BOTH actually accumulates, instead of
 * a single most-recent-run report. Reachable from either mode's header
 * (never mid-play). Echoes the corporate capability-detail-view's
 * single-select drill-down interaction, not the component itself — that
 * one is shaped for a partner browsing many candidates, wrong shape for
 * a student's own evidence.
 */

import { useMemo, useState } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { jinStyles } from '@/components/journey/jin-styles'
import {
  aggregateByCapability,
  loadCapabilityStore,
  CANONICAL_CAPABILITIES,
  type CapabilityAggregate,
} from '@/lib/capabilityProfile'

interface StudentScorecardViewProps {
  onBack: () => void
}

function shortName(capability: string): string {
  return capability.split(' & ')[0]
}

function buildContrastLines(selfAssessed: string[], aggregate: CapabilityAggregate[]): string[] {
  if (selfAssessed.length === 0 || aggregate.length === 0) return []
  const topOverall = aggregate[0]
  const byCap = new Map(aggregate.map((a) => [a.capability, a]))
  const lines: string[] = []
  for (const cap of selfAssessed) {
    const demonstrated = byCap.get(cap)
    if (demonstrated && demonstrated.capability === topOverall.capability) {
      lines.push(`You said ${shortName(cap).toLowerCase()} — confirmed. It's exactly what showed up most.`)
    } else if (demonstrated && demonstrated.count > 0) {
      lines.push(
        `You said ${shortName(cap).toLowerCase()} — it showed up, but ${shortName(topOverall.capability).toLowerCase()} shone through even more.`,
      )
    } else {
      lines.push(
        `You said ${shortName(cap).toLowerCase()}, but what actually shone through was ${shortName(topOverall.capability).toLowerCase()}.`,
      )
    }
  }
  return lines
}

export function StudentScorecardView({ onBack }: StudentScorecardViewProps) {
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null)
  const [credUnlocked, setCredUnlocked] = useState(false)

  const store = useMemo(() => loadCapabilityStore(), [])
  const aggregate = useMemo(() => aggregateByCapability(store), [store])
  const contrastLines = useMemo(() => buildContrastLines(store.selfAssessed, aggregate), [store, aggregate])
  const byCap = useMemo(() => new Map(aggregate.map((a) => [a.capability, a])), [aggregate])

  const selected = selectedCapability ? byCap.get(selectedCapability) : null

  return (
    <main className="jin-root scorecard-root">
      <div className="jin-top">
        <LaunchWordmark height={34} tone="light" ariaLabel="LAUNCH" />
        <span className="jin-top-meta">· scorecard</span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="jin-ghost"
          onClick={selectedCapability ? () => setSelectedCapability(null) : onBack}
        >
          {selectedCapability ? '← All capabilities' : '← Back'}
        </button>
      </div>

      <section className="jin-stage">
        {!selected ? (
          <div className="jin-card scorecard-wide" key="grid">
            <div className="jin-eyebrow">Your Launch Scorecard</div>
            <h1 className="jin-q">Everything you've shown, in one place.</h1>
            <p className="jin-sub">
              Journeys and Work scenarios both measure the same capabilities — this is where it all adds up.
            </p>

            {contrastLines.length > 0 && (
              <div className="scorecard-contrast">
                {contrastLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}

            <div className="scorecard-grid">
              {CANONICAL_CAPABILITIES.map((cap) => {
                const agg = byCap.get(cap)
                const count = agg?.count || 0
                const journeyCount = agg?.events.filter((e) => e.source === 'journey').length || 0
                const workCount = agg?.events.filter((e) => e.source === 'work').length || 0
                return (
                  <button
                    key={cap}
                    type="button"
                    className={`scorecard-card ${count === 0 ? 'is-empty' : ''}`}
                    onClick={() => count > 0 && setSelectedCapability(cap)}
                    disabled={count === 0}
                  >
                    <span className="scorecard-card-title">{cap}</span>
                    <span className="scorecard-card-count">{count}</span>
                    <span className="scorecard-card-sub">
                      {count === 0
                        ? 'Not shown yet'
                        : `${journeyCount ? `${journeyCount} journey${journeyCount > 1 ? 's' : ''}` : ''}${journeyCount && workCount ? ' · ' : ''}${workCount ? `${workCount} work scenario${workCount > 1 ? 's' : ''}` : ''}`}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="scorecard-download">
              <div className="scorecard-download-title">Launch Scorecard</div>
              <div className="scorecard-download-sub">
                {credUnlocked
                  ? 'A verified record of everything you\'ve shown, for schools and employers.'
                  : 'Download a verified record of everything you\'ve shown, for schools and employers.'}
              </div>
              <button
                type="button"
                className="scorecard-download-btn"
                onClick={() => setCredUnlocked(true)}
                style={credUnlocked ? { cursor: 'default' } : undefined}
              >
                {credUnlocked ? '✓ Unlocked (demo)' : 'Unlock (demo) →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="jin-card scorecard-wide" key="drilldown">
            <div className="jin-eyebrow">{selected.capability}</div>
            <h1 className="jin-q">{selected.count} time{selected.count > 1 ? 's' : ''} demonstrated</h1>
            <div className="scorecard-events">
              {selected.events.map((ev) => (
                <div className="scorecard-event" key={ev.id}>
                  <div className="scorecard-event-meta">
                    {ev.scenarioTitle} · {ev.source === 'journey' ? 'Journey' : 'Work scenario'} ·{' '}
                    {new Date(ev.at).toLocaleDateString()}
                  </div>
                  <div className="scorecard-event-line">{ev.evidenceLine}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .scorecard-wide { max-width: 920px; }
        .scorecard-contrast {
          margin: -4px 0 22px;
          padding: 14px 18px;
          border-radius: 12px;
          background: rgba(146, 184, 255, 0.08);
          border: 1px solid rgba(146, 184, 255, 0.18);
        }
        .scorecard-contrast p {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 14.5px;
          line-height: 1.5;
          color: rgba(246,242,234,0.88);
          margin: 0;
        }
        .scorecard-contrast p + p { margin-top: 6px; }
        .scorecard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 4px;
        }
        .scorecard-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
          padding: 16px 16px 13px;
          border-radius: 14px;
          border: 1px solid rgba(246, 242, 234, 0.10);
          background: rgba(246, 242, 234, 0.05);
          cursor: pointer;
          transition: background 200ms ease, border-color 200ms ease, transform 200ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .scorecard-card:not(.is-empty):hover {
          background: color-mix(in srgb, #92b8ff 9%, rgba(246, 242, 234, 0.05));
          border-color: color-mix(in srgb, #92b8ff 42%, transparent);
          transform: translateY(-2px);
        }
        .scorecard-card.is-empty { opacity: 0.4; cursor: default; }
        .scorecard-card-title {
          font-family: var(--font-body);
          font-weight: 650;
          font-size: 13px;
          color: var(--lq-cream, #f6f2ea);
        }
        .scorecard-card-count {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 28px;
          color: #92b8ff;
        }
        .scorecard-card-sub {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(246,242,234,0.5);
        }
        .scorecard-download {
          margin-top: 26px;
          padding: 18px 20px;
          border-radius: 14px;
          border: 1px solid rgba(246, 242, 234, 0.14);
          background: rgba(246, 242, 234, 0.04);
        }
        .scorecard-download-title {
          font-family: var(--font-display);
          font-size: 17px;
          color: var(--lq-cream, #f6f2ea);
          margin-bottom: 4px;
        }
        .scorecard-download-sub {
          font-size: 13px;
          color: rgba(246,242,234,0.6);
          margin-bottom: 14px;
        }
        .scorecard-download-btn {
          border: none;
          border-radius: 999px;
          padding: 11px 20px;
          background: var(--lq-cream, #f6f2ea);
          color: #131b33;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
        }
        .scorecard-events { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .scorecard-event {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(246, 242, 234, 0.10);
          background: rgba(246, 242, 234, 0.04);
        }
        .scorecard-event-meta {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(146, 184, 255, 0.8);
          margin-bottom: 6px;
        }
        .scorecard-event-line {
          font-size: 14.5px;
          line-height: 1.5;
          color: rgba(246,242,234,0.9);
        }
      `}</style>
      <style>{jinStyles}</style>
    </main>
  )
}
