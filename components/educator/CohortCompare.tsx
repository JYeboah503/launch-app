'use client'

/** Cross-cohort comparison — overlay two cohorts across the 10 capabilities,
 *  plus completion + average headline. Opened from the educator home. */

import { useState, useMemo } from 'react'
import {
  CAPABILITIES, CAPABILITY_SHORT, cohortAverageScores, completionFor, overallScore,
  type Cohort,
} from '@/lib/educator'
import { type EdWorkspace } from '@/components/educator/types'
import { GroupedBars } from '@/components/educator/charts'
import { ModalShell } from '@/components/educator/ui'

export function CohortCompare({ ws, onClose }: { ws: EdWorkspace; onClose: () => void }) {
  const [aId, setAId] = useState(ws.cohorts[0]?.id || '')
  const [bId, setBId] = useState(ws.cohorts[1]?.id || ws.cohorts[0]?.id || '')

  const summarise = (cohort: Cohort | undefined) => {
    if (!cohort) return null
    const students = ws.students.filter((s) => cohort.studentIds.includes(s.id))
    const avg = cohortAverageScores(students)
    const overall = students.length ? Math.round(students.reduce((n, s) => n + overallScore(s.scores), 0) / students.length) : 0
    let done = 0, total = 0
    for (const a of ws.assignments.filter((x) => x.cohortId === cohort.id)) { const st = completionFor(a, cohort); done += st.completed + st.reviewed; total += st.total }
    return { cohort, students: students.length, avg, overall, completion: total ? Math.round((done / total) * 100) : 0 }
  }

  const A = useMemo(() => summarise(ws.cohorts.find((c) => c.id === aId)), [aId, ws])
  const B = useMemo(() => summarise(ws.cohorts.find((c) => c.id === bId)), [bId, ws])

  const COL_A = '#1B9E8F', COL_B = 'var(--launch-navy)'

  return (
    <ModalShell title="Compare cohorts" onClose={onClose} wide>
      <div className="ed-cmp-pick">
        <select className="ed-select" value={aId} onChange={(e) => setAId(e.target.value)}>
          {ws.cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="ed-cmp-vs">vs</span>
        <select className="ed-select" value={bId} onChange={(e) => setBId(e.target.value)}>
          {ws.cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {A && B && (
        <>
          <div className="ed-cmp-summary">
            {[A, B].map((s, i) => (
              <div key={i} className="ed-cmp-card" style={{ borderColor: i === 0 ? COL_A : 'rgba(10,42,107,0.4)' }}>
                <div className="ed-cmp-name">{s.cohort.name}</div>
                <div className="ed-cmp-stats">
                  <span><strong>{s.students}</strong> students</span>
                  <span><strong>{s.overall}</strong> avg</span>
                  <span><strong>{s.completion}%</strong> done</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <GroupedBars
              categories={CAPABILITIES.map((c) => CAPABILITY_SHORT[c])}
              a={{ label: A.cohort.name, color: COL_A, values: CAPABILITIES.map((c) => A.avg[c] ?? 0) }}
              b={{ label: B.cohort.name, color: COL_B, values: CAPABILITIES.map((c) => B.avg[c] ?? 0) }}
            />
          </div>
        </>
      )}

      <style>{`
        .ed-cmp-pick { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .ed-cmp-pick .ed-select { flex: 1; font-size: 13px; padding: 9px 14px; }
        .ed-cmp-vs { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); }
        .ed-cmp-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px; }
        .ed-cmp-card { border: 1.5px solid; border-radius: 14px; padding: 14px 16px; background: #fff; }
        .ed-cmp-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); margin-bottom: 8px; }
        .ed-cmp-stats { display: flex; gap: 14px; font-size: 12px; color: var(--lq-ink-3); }
        .ed-cmp-stats strong { font-family: var(--font-mono); color: var(--lq-ink); }
      `}</style>
    </ModalShell>
  )
}
