'use client'

/**
 * Educator charts — presentational SVG/CSS viz, no data fetching.
 *   · CapabilityHeatmap — the signature students × 10-capabilities grid
 *   · CapabilityRadar   — 10-spoke radar (student vs cohort vs target)
 *   · ProgressRing      — circular completion %
 *   · GrowthSparkline   — trend of a value over snapshots
 *   · FitBar            — labelled horizontal 0–100 bar
 */

import {
  CAPABILITIES, CAPABILITY_SHORT, heatColor, heatTextLight,
  type CapabilityScores, type EdStudent,
} from '@/lib/educator'

/* ── Capability heatmap ───────────────────────────────────────────── */

export function CapabilityHeatmap({
  students,
  average,
  target,
  onSelectStudent,
}: {
  students: EdStudent[]
  average: CapabilityScores
  target?: number
  onSelectStudent?: (id: string) => void
}) {
  return (
    <div className="ed-heat-wrap">
      <table className="ed-heat">
        <thead>
          <tr>
            <th className="ed-heat-name-h">Student</th>
            {CAPABILITIES.map((c) => (
              <th key={c} title={c}><span>{CAPABILITY_SHORT[c]}</span></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={s.id}
              className={onSelectStudent ? 'ed-heat-row' : ''}
              onClick={onSelectStudent ? () => onSelectStudent(s.id) : undefined}
              tabIndex={onSelectStudent ? 0 : undefined}
              onKeyDown={onSelectStudent ? (e) => { if (e.key === 'Enter') onSelectStudent(s.id) } : undefined}
            >
              <td className="ed-heat-name">
                <span className="ed-heat-ini">{s.initials}</span>
                <span className="ed-heat-nm">{s.name}</span>
              </td>
              {CAPABILITIES.map((c) => {
                const v = s.scores[c] ?? 0
                const belowTarget = target != null && v < target
                return (
                  <td key={c}>
                    <span
                      className={`ed-heat-cell ${belowTarget ? 'is-below' : ''}`}
                      style={{ background: heatColor(v), color: heatTextLight(v) ? '#fff' : 'var(--lq-ink)' }}
                      title={`${s.name} · ${c}: ${v}`}
                    >
                      {v}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="ed-heat-name ed-heat-avg-lbl">Cohort average</td>
            {CAPABILITIES.map((c) => (
              <td key={c}>
                <span className="ed-heat-avg">{average[c] ?? 0}</span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <style>{heatStyles}</style>
    </div>
  )
}

const heatStyles = `
  .ed-heat-wrap { overflow-x: auto; border: 1px solid var(--lq-line); border-radius: 16px; background: #fff; }
  .ed-heat { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 720px; }
  .ed-heat th, .ed-heat td { padding: 0; }
  .ed-heat thead th {
    position: sticky; top: 0;
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
    font-weight: 600; color: var(--lq-ink-3);
    padding: 12px 4px 10px; text-align: center; vertical-align: bottom;
    background: #fff; border-bottom: 1px solid var(--lq-line);
  }
  .ed-heat thead th span { display: inline-block; }
  .ed-heat-name-h { text-align: left !important; padding-left: 16px !important; }
  .ed-heat-name {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 16px !important; white-space: nowrap;
    border-bottom: 1px solid var(--lq-line);
  }
  .ed-heat-ini {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 999px; flex-shrink: 0;
    background: var(--launch-teal-soft); color: var(--launch-teal-3);
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  }
  .ed-heat-nm { font-size: 13px; color: var(--lq-ink); font-weight: 500; }
  .ed-heat tbody td { border-bottom: 1px solid var(--lq-line); text-align: center; padding: 6px 5px; }
  .ed-heat-cell {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 26px; border-radius: 7px;
    font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  }
  .ed-heat-cell.is-below { outline: 2px solid var(--launch-danger); outline-offset: -2px; }
  .ed-heat-row { cursor: pointer; transition: background 120ms ease; }
  .ed-heat-row:hover td { background: rgba(27, 158, 143, 0.05); }
  .ed-heat tfoot td { padding: 8px 5px; text-align: center; background: #fbfaf7; }
  .ed-heat-avg-lbl { justify-content: flex-start; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); border-bottom: none; }
  .ed-heat-avg { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--lq-ink-2); }
`

/* ── Radar ────────────────────────────────────────────────────────── */

export function CapabilityRadar({
  scores,
  compare,
  target,
  size = 260,
}: {
  scores: CapabilityScores
  compare?: CapabilityScores // e.g. cohort average
  target?: number
  size?: number
}) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 34
  const n = CAPABILITIES.length
  const pt = (i: number, val: number) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2
    const rr = (val / 100) * r
    return [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]
  }
  const poly = (s: CapabilityScores) =>
    CAPABILITIES.map((c, i) => pt(i, s[c] ?? 0).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Capability radar">
      {/* rings */}
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={CAPABILITIES.map((_, i) => pt(i, ring).join(',')).join(' ')}
          fill="none" stroke="var(--lq-line)" strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {CAPABILITIES.map((_, i) => {
        const [x, y] = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--lq-line)" strokeWidth="1" />
      })}
      {/* target ring */}
      {target != null && (
        <polygon
          points={CAPABILITIES.map((_, i) => pt(i, target).join(',')).join(' ')}
          fill="none" stroke="var(--launch-teal-3)" strokeWidth="1.5" strokeDasharray="3 3"
        />
      )}
      {/* compare (cohort avg) */}
      {compare && (
        <polygon points={poly(compare)} fill="rgba(10,42,107,0.06)" stroke="rgba(10,42,107,0.35)" strokeWidth="1.5" />
      )}
      {/* student */}
      <polygon points={poly(scores)} fill="rgba(27,158,143,0.20)" stroke="var(--launch-teal)" strokeWidth="2" />
      {CAPABILITIES.map((c, i) => {
        const [x, y] = pt(i, scores[c] ?? 0)
        return <circle key={c} cx={x} cy={y} r="2.5" fill="var(--launch-teal-3)" />
      })}
      {/* short labels */}
      {CAPABILITIES.map((c, i) => {
        const [x, y] = pt(i, 118)
        return (
          <text
            key={c} x={x} y={y}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, fill: 'var(--lq-ink-3)', letterSpacing: '0.04em' }}
          >
            {CAPABILITY_SHORT[c].toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

/* ── Progress ring ────────────────────────────────────────────────── */

export function ProgressRing({ pct, size = 88, label }: { pct: number; size?: number; label?: string }) {
  const stroke = 9
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off = circ * (1 - pct / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--lq-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--launch-teal)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: size * 0.24, color: 'var(--lq-ink)', lineHeight: 1 }}>{pct}%</span>
        {label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lq-ink-3)', marginTop: 2 }}>{label}</span>}
      </div>
    </div>
  )
}

/* ── Growth sparkline ─────────────────────────────────────────────── */

export function GrowthSparkline({ values, width = 120, height = 34 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null
  const min = Math.min(...values), max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2
    const y = height - 3 - ((v - min) / span) * (height - 6)
    return [x, y]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const rising = values[values.length - 1] >= values[0]
  const col = rising ? 'var(--launch-teal)' : 'var(--launch-danger)'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      <path d={d} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={col} />
    </svg>
  )
}

/* ── Fit bar ──────────────────────────────────────────────────────── */

export function FitBar({ label, emoji, value, sub }: { label: string; emoji?: string; value: number; sub?: string }) {
  return (
    <div className="ed-fit">
      <div className="ed-fit-top">
        <span className="ed-fit-label">{emoji && <span aria-hidden style={{ marginRight: 6 }}>{emoji}</span>}{label}</span>
        <span className="ed-fit-val">{value}</span>
      </div>
      <div className="ed-fit-track"><div className="ed-fit-fill" style={{ width: `${value}%`, background: heatColor(value) }} /></div>
      {sub && <div className="ed-fit-sub">{sub}</div>}
      <style>{`
        .ed-fit { margin-bottom: 12px; }
        .ed-fit-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
        .ed-fit-label { font-size: 13px; color: var(--lq-ink); font-weight: 500; }
        .ed-fit-val { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--lq-ink-2); }
        .ed-fit-track { height: 8px; border-radius: 999px; background: var(--lq-line); overflow: hidden; }
        .ed-fit-fill { height: 100%; border-radius: 999px; transition: width 400ms cubic-bezier(0.2,0.7,0.2,1); }
        .ed-fit-sub { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lq-ink-3); margin-top: 4px; }
      `}</style>
    </div>
  )
}
