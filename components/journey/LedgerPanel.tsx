'use client'

/**
 * A visible running-numbers dashboard — replaces the abstract goal meter
 * for journeys whose mechanic is "watch a real number move" (a market
 * stall's cash tin, a farm's day count, etc.) rather than an opaque 0-100
 * score. Swapped into JourneySim's header when script.ledger is present;
 * everything else about the engine is unchanged.
 */

import { useEffect, useRef, useState } from 'react'
import type { LedgerConfig, LedgerKeySpec } from '@/lib/play/journeySim'

export function formatLedgerValue(spec: LedgerKeySpec, value: number): string {
  if (spec.format === 'currency') {
    const sign = value < 0 ? '-' : ''
    return `${sign}$${Math.abs(Math.round(value))}`
  }
  if (spec.format === 'hours') return `${Math.round(value)}h`
  if (spec.format === 'percent') return `${Math.round(value)}%`
  return `${Math.round(value)}`
}

/** Whether a delta is good or bad news for this key — a falling countdown
 *  (farm's dry hours) must read as bad even though the sign is negative. */
export function deltaTone(spec: LedgerKeySpec, delta: number): 'good' | 'bad' {
  return (delta > 0) === ((spec.goodDirection ?? 'up') === 'up') ? 'good' : 'bad'
}

/** Re-arms on every value change, unlike AnimatedCounter's one-shot
 *  scroll-triggered count-up — this needs to tick every time play updates
 *  the ledger, not just once when it scrolls into view. */
function useTickingNumber(value: number, durationMs = 550) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return
    // Hidden documents never fire rAF — snap instead of freezing stale.
    if (typeof document !== 'undefined' && document.hidden) {
      fromRef.current = to
      setDisplay(to)
      return
    }
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(step)
      else fromRef.current = to
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])
  return display
}

interface LedgerPanelProps {
  config: LedgerConfig
  values: Record<string, number>
  /** The delta just applied, if any — drives the up/down tick indicator. */
  lastDelta?: Record<string, number>
}

export function LedgerPanel({ config, values, lastDelta }: LedgerPanelProps) {
  return (
    <div className="ledger-panel">
      {Object.entries(config.keys).map(([key, spec]) => (
        <LedgerKeyDisplay key={key} spec={spec} value={values[key] ?? spec.start} delta={lastDelta?.[key]} />
      ))}
      <style>{`
        .ledger-panel { display: flex; gap: 28px; margin-top: 10px; }
        .ledger-key { display: flex; flex-direction: column; gap: 2px; }
        .ledger-key-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(246,242,234,0.55);
        }
        .ledger-key-row { display: flex; align-items: baseline; gap: 9px; }
        .ledger-key-value {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 34px;
          letter-spacing: -0.015em;
          line-height: 1.05;
          color: var(--jsim-accent, var(--lq-cream, #f6f2ea));
        }
        .ledger-key-delta {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          animation: ledgerDeltaIn 1400ms ease both;
        }
        .ledger-key-delta.is-up { color: #7ddba3; }
        .ledger-key-delta.is-down { color: #f2b56b; }
        @keyframes ledgerDeltaIn {
          0% { opacity: 0; transform: translateY(3px); }
          15% { opacity: 1; transform: translateY(0); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function LedgerKeyDisplay({ spec, value, delta }: { spec: LedgerKeySpec; value: number; delta?: number }) {
  const display = useTickingNumber(value)
  return (
    <div className="ledger-key">
      <span className="ledger-key-label">{spec.label}</span>
      <div className="ledger-key-row">
        <span className="ledger-key-value">{formatLedgerValue(spec, display)}</span>
        {!!delta && (
          <span
            key={`${value}-${delta}`}
            className={`ledger-key-delta ${deltaTone(spec, delta) === 'good' ? 'is-up' : 'is-down'}`}
          >
            {delta > 0 ? '+' : ''}
            {formatLedgerValue(spec, delta)}
          </span>
        )}
      </div>
    </div>
  )
}

/** Footy-style computed dashboard — jobs sorted n/total from stream
 *  statuses, no script effect changes needed. Own style block: the
 *  .ledger-* rules above only exist when LedgerPanel mounts. */
export function StreamsPanel({ label, sorted, total }: { label: string; sorted: number; total: number }) {
  const prev = useRef(sorted)
  const bumped = sorted > prev.current
  useEffect(() => {
    prev.current = sorted
  }, [sorted])
  return (
    <div className="streams-panel">
      <div className="streams-key">
        <span className="streams-key-label">{label}</span>
        <div className="streams-key-row">
          <span className="streams-key-value">
            {sorted}/{total}
          </span>
          {bumped && (
            <span key={sorted} className="streams-key-delta">
              +1
            </span>
          )}
        </div>
      </div>
      <style>{`
        .streams-panel { display: flex; gap: 28px; margin-top: 10px; }
        .streams-key { display: flex; flex-direction: column; gap: 2px; }
        .streams-key-label {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(246,242,234,0.55);
        }
        .streams-key-row { display: flex; align-items: baseline; gap: 9px; }
        .streams-key-value {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 34px;
          letter-spacing: -0.015em;
          line-height: 1.05;
          color: var(--jsim-accent, var(--lq-cream, #f6f2ea));
        }
        .streams-key-delta {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          color: #7ddba3;
          animation: streamsDeltaIn 1400ms ease both;
        }
        @keyframes streamsDeltaIn {
          0% { opacity: 0; transform: translateY(3px); }
          15% { opacity: 1; transform: translateY(0); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
