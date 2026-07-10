'use client'

/** Cohort Insights — the deeper analytics: momentum over time, per-capability
 *  trend, score distribution, biggest movers, and where to point next. */

import { useMemo, useState } from 'react'
import {
  CAPABILITIES, CAPABILITY_SHORT, SCORE_BANDS,
  cohortTrend, cohortAverageScores, distribution, biggestMovers, weakestCapabilities, overallScore,
  type EdStudent,
} from '@/lib/educator'
import { LineChart, GrowthSparkline, DistributionBars } from '@/components/educator/charts'
import { TrendingUp, Target } from 'lucide-react'

export function InsightsTab({ students, onOpenStudent }: { students: EdStudent[]; onOpenStudent: (id: string) => void }) {
  const trend = useMemo(() => cohortTrend(students), [students])
  const average = useMemo(() => cohortAverageScores(students), [students])
  const movers = useMemo(() => biggestMovers(students, 5), [students])
  const weakest = useMemo(() => weakestCapabilities(average, 3), [average])
  const [distCap, setDistCap] = useState<string>('__overall')

  if (students.length === 0 || trend.length < 2) {
    return <div className="ed-empty"><p>Insights appear once students have a few weeks of activity.</p></div>
  }

  const overallTrend = trend.map((t) => overallScore(t.scores))
  const momentum = overallTrend[overallTrend.length - 1] - overallTrend[0]
  const xLabels = trend.map((_, i) => `Wk ${i + 1}`)
  const counts = distribution(students, distCap === '__overall' ? undefined : distCap)

  return (
    <div className="ed-insights">
      {/* Momentum */}
      <div className="ed-scard">
        <div className="ed-scard-head">
          <div>
            <h3 className="ed-h3">Cohort momentum</h3>
            <span className="ed-dim">Average overall score, week by week</span>
          </div>
          <span className="ed-momentum">{momentum >= 0 ? '▲' : '▼'} {Math.abs(momentum)} pts this term</span>
        </div>
        <LineChart series={[{ values: overallTrend, color: 'var(--ed-accent)', label: 'Cohort average' }]} xLabels={xLabels} />
      </div>

      {/* Per-capability trend grid */}
      <div className="ed-block-head" style={{ marginTop: 26 }}><h3 className="ed-h3">Where the growth is</h3><span className="ed-dim">Each capability, trended across the term</span></div>
      <div className="ed-mini-grid">
        {CAPABILITIES.map((c) => {
          const vals = trend.map((t) => t.scores[c] ?? 0)
          const delta = vals[vals.length - 1] - vals[0]
          return (
            <div key={c} className="ed-mini">
              <div className="ed-mini-top"><span className="ed-mini-lbl">{CAPABILITY_SHORT[c]}</span><span className={`ed-mini-delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? '+' : ''}{delta}</span></div>
              <GrowthSparkline values={vals} width={150} height={30} />
              <div className="ed-mini-now">{vals[vals.length - 1]}</div>
            </div>
          )
        })}
      </div>

      <div className="ed-ins-two">
        {/* Distribution */}
        <div className="ed-scard">
          <div className="ed-scard-head">
            <h3 className="ed-h3">Score spread</h3>
            <select className="ed-select" value={distCap} onChange={(e) => setDistCap(e.target.value)}>
              <option value="__overall">Overall</option>
              {CAPABILITIES.map((c) => <option key={c} value={c}>{CAPABILITY_SHORT[c]}</option>)}
            </select>
          </div>
          <DistributionBars bands={SCORE_BANDS} counts={counts} />
        </div>

        {/* Movers + focus */}
        <div className="ed-ins-col">
          <div className="ed-scard">
            <div className="ed-scard-head"><h3 className="ed-h3"><TrendingUp className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2 }} /> Biggest movers</h3></div>
            {movers.map((m) => (
              <button key={m.student.id} className="ed-mover" onClick={() => onOpenStudent(m.student.id)}>
                <span className="ed-attn-ini" style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}>{m.student.initials}</span>
                <span className="ed-mover-name">{m.student.name}</span>
                <span className="ed-mover-growth">▲ {m.growth}</span>
              </button>
            ))}
          </div>
          <div className="ed-scard ed-scard-accent">
            <div className="ed-scard-head"><h3 className="ed-h3"><Target className="w-4 h-4" style={{ display: 'inline', verticalAlign: -2, color: 'var(--ed-accent)' }} /> Where to point next</h3></div>
            <p className="ed-guide-note">The cohort&rsquo;s softest capabilities — assign scenarios that stretch these.</p>
            {weakest.map((w) => (
              <div key={w.name} className="ed-weak"><span>{CAPABILITY_SHORT[w.name]}</span><span className="ed-weak-score">{w.score}</span></div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ed-insights { display: flex; flex-direction: column; }
        .ed-momentum { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--ed-accent); }
        .ed-mini-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
        .ed-mini { background: #fff; border: 1px solid var(--lq-line); border-radius: 14px; padding: 12px 14px; }
        .ed-mini-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .ed-mini-lbl { font-size: 12px; font-weight: 600; color: var(--lq-ink); }
        .ed-mini-delta { font-family: var(--font-mono); font-size: 10px; }
        .ed-mini-delta.up { color: var(--ed-accent); }
        .ed-mini-delta.down { color: var(--launch-danger); }
        .ed-mini-now { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--lq-ink-2); text-align: right; margin-top: 2px; }
        .ed-ins-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 26px; }
        @media (max-width: 860px) { .ed-ins-two { grid-template-columns: 1fr; } }
        .ed-ins-col { display: flex; flex-direction: column; gap: 16px; }
        .ed-select { border: 1px solid var(--lq-line-2); border-radius: 999px; padding: 5px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--lq-ink-2); background: #fff; cursor: pointer; }
        .ed-mover { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; background: none; border: none; cursor: pointer; text-align: left; }
        .ed-mover:hover { background: rgba(27,158,143,0.05); }
        .ed-mover-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--lq-ink); }
        .ed-mover-growth { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--ed-accent); }
        .ed-weak { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--lq-line); font-size: 13px; color: var(--lq-ink); }
        .ed-weak-score { font-family: var(--font-mono); font-weight: 700; color: var(--launch-danger); }
      `}</style>
    </div>
  )
}
