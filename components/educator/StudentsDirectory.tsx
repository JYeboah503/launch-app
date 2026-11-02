'use client'

/**
 * StudentsDirectory — the whole-institution database view.
 *
 * School mode: every Year 10–12 student (~300) with overall, last use,
 * hours, email and contact-parent.
 * University mode: every enrolled student (~2,500) with year of study,
 * degree, career interest — paginated, every row clickable through to the
 * full profile + credential.
 */

import { useMemo, useState } from 'react'
import { overallScore, YEAR_GROUPS, UNI_YEARS, UNI_YEAR_LABEL, type EdStudent } from '@/lib/educator'
import { ED_NOW, type EdWorkspace } from '@/components/educator/types'
import { fmtDate } from '@/components/educator/ui'
import { Search, Mail } from 'lucide-react'

type SortKey = 'surname' | 'overall' | 'lastUse' | 'hours'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'surname', label: 'Surname A–Z' },
  { key: 'overall', label: 'Top overall' },
  { key: 'lastUse', label: 'Last used' },
  { key: 'hours', label: 'Most hours' },
]

const PAGE = 120

function surname(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1] || name
}

function lastUseLabel(iso: string): string {
  const days = Math.floor((Date.parse(ED_NOW) - Date.parse(iso)) / 864e5)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 14) return `${days}d ago`
  return fmtDate(iso)
}

export function StudentsDirectory({
  ws, onOpenStudent,
}: {
  ws: EdWorkspace
  onOpenStudent: (studentId: string) => void
}) {
  const uni = ws.branding.institution === 'university'
  const [year, setYear] = useState<number | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('surname')
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(PAGE)

  const years: readonly number[] = uni ? UNI_YEARS : YEAR_GROUPS
  const yearLabel = (y: number) => (uni ? UNI_YEAR_LABEL[y] : `Year ${y}`)

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: ws.students.length }
    for (const y of years) out[y] = ws.students.filter((s) => s.yearGroup === y).length
    return out
  }, [ws.students, years])

  const rows = useMemo(() => {
    let list = ws.students
    if (year !== 'all') list = list.filter((s) => s.yearGroup === year)
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter((s) =>
        s.name.toLowerCase().includes(needle) ||
        s.email.toLowerCase().includes(needle) ||
        (s.course ?? '').toLowerCase().includes(needle) ||
        (s.careerInterest ?? '').toLowerCase().includes(needle),
      )
    }
    const sorted = [...list]
    switch (sort) {
      case 'surname':
        sorted.sort((a, b) => surname(a.name).localeCompare(surname(b.name)) || a.name.localeCompare(b.name))
        break
      case 'overall':
        sorted.sort((a, b) => overallScore(b.scores) - overallScore(a.scores))
        break
      case 'lastUse':
        sorted.sort((a, b) => Date.parse(b.lastActive) - Date.parse(a.lastActive))
        break
      case 'hours':
        sorted.sort((a, b) => b.totalUseHours - a.totalUseHours)
        break
    }
    return sorted
  }, [ws.students, year, sort, q])

  const visible = rows.slice(0, shown)

  return (
    <div className="ed-page">
      <div className="pt-10 sm:pt-12 pb-2">
        <div className="ed-eyebrow">Students</div>
        <h1 className="ed-h1">Every student, one database.</h1>
        <p className="ed-lede">
          {uni
            ? `All ${ws.students.length.toLocaleString()} enrolled students — degree, career interest, scores and usage in one place. Open any profile for the full summary, internship scenarios and credential.`
            : `All ${ws.students.length} students across Years 10–12 — scores, usage and contact in one place. Open a profile for the full summary, top skills, industry alignments and credential.`}
        </p>
      </div>

      {/* Controls */}
      <div className="sdir-controls">
        <div className="sdir-years">
          <button type="button" className={`sdir-chip ${year === 'all' ? 'is-on' : ''}`} onClick={() => { setYear('all'); setShown(PAGE) }}>
            All · {counts.all.toLocaleString()}
          </button>
          {years.map((y) => (
            <button key={y} type="button" className={`sdir-chip ${year === y ? 'is-on' : ''}`} onClick={() => { setYear(y); setShown(PAGE) }}>
              {yearLabel(y)} · {counts[y].toLocaleString()}
            </button>
          ))}
        </div>
        <div className="sdir-right">
          <div className="sdir-search">
            <Search className="w-4 h-4" />
            <input value={q} placeholder={uni ? 'Search name, course or interest…' : 'Search name or email…'} onChange={(e) => { setQ(e.target.value); setShown(PAGE) }} aria-label="Search students" />
          </div>
          <select className="ed-select sdir-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort students">
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* The database */}
      <div className={`sdir-table corp-card ${uni ? 'is-uni' : ''}`}>
        <div className="sdir-row sdir-head" aria-hidden>
          <span>Student</span>
          <span className="sdir-c">Year</span>
          {uni && <span className="sdir-course-h">Course</span>}
          <span className="sdir-c">Overall</span>
          <span className="sdir-c">Last use</span>
          <span className="sdir-c">Hours</span>
          <span className="sdir-email-h">Email</span>
          <span className={uni ? 'sdir-int-h' : 'sdir-c'}>{uni ? 'Career interest' : 'Parent'}</span>
        </div>
        {visible.map((s) => <DirectoryRow key={s.id} s={s} uni={uni} onOpen={() => onOpenStudent(s.id)} />)}
        {rows.length === 0 && <div className="sdir-none">No students match.</div>}
      </div>
      <div className="sdir-foot">
        <span className="sdir-count">
          Showing {Math.min(shown, rows.length).toLocaleString()} of {rows.length.toLocaleString()} students
        </span>
        {rows.length > shown && (
          <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setShown((n) => n + PAGE * 2)}>
            Show more
          </button>
        )}
      </div>

      <style>{sdirStyles}</style>
    </div>
  )
}

function DirectoryRow({ s, uni, onOpen }: { s: EdStudent; uni: boolean; onOpen: () => void }) {
  const overall = overallScore(s.scores)
  return (
    <div
      className="sdir-row"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}
    >
      <span className="sdir-name">
        <span className="sdir-ini">{s.initials}</span>
        <span className="sdir-nm">
          {s.name}
          {s.isLive && <span className="corp-chip" style={{ marginLeft: 8 }}>Live</span>}
        </span>
      </span>
      <span className="sdir-c sdir-year">{uni ? (s.yearGroup === 4 ? 'Hons' : `Y${s.yearGroup}`) : `Y${s.yearGroup}`}</span>
      {uni && <span className="sdir-course">{s.course ?? '—'}</span>}
      <span className="sdir-c sdir-score">{overall}</span>
      <span className="sdir-c sdir-dim">{lastUseLabel(s.lastActive)}</span>
      <span className="sdir-c sdir-dim">{s.totalUseHours ? `${s.totalUseHours}h` : '—'}</span>
      <span className="sdir-email">{s.email}</span>
      {uni ? (
        <span className="sdir-int">{s.careerInterest ?? '—'}</span>
      ) : (
        <span className="sdir-c">
          {s.parentEmail ? (
            <a
              className="sdir-parent"
              href={`mailto:${s.parentEmail}?subject=${encodeURIComponent(`${s.name} — Launch progress`)}`}
              title={`Email ${s.parentName || 'parent'} (${s.parentEmail})`}
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5" /> Contact
            </a>
          ) : (
            <span className="sdir-dim">—</span>
          )}
        </span>
      )}
    </div>
  )
}

const sdirStyles = `
  .sdir-controls { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin: 18px 0 14px; }
  .sdir-years { display: flex; gap: 8px; flex-wrap: wrap; }
  .sdir-chip { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--lq-line-2); background: #fff; font-family: var(--font-body); font-size: 12.5px; font-weight: 600; color: var(--lq-ink-2); cursor: pointer; transition: border-color 140ms ease, background 140ms ease, color 140ms ease; }
  .sdir-chip:hover { border-color: var(--launch-navy); }
  .sdir-chip.is-on { background: var(--launch-navy); border-color: var(--launch-navy); color: var(--lq-cream); }
  .sdir-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .sdir-search { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--lq-line-2); border-radius: 999px; padding: 7px 14px; color: var(--lq-ink-3); }
  .sdir-search input { border: none; outline: none; background: transparent; font-family: var(--font-body); font-size: 13px; color: var(--lq-ink); width: 190px; }
  .sdir-search:focus-within { border-color: var(--launch-navy); }
  .sdir-sort { width: auto; border-radius: 999px; padding: 8px 14px; font-size: 12.5px; cursor: pointer; }

  .sdir-table { padding: 0; overflow: hidden; }
  .sdir-table:hover { transform: none; }
  .sdir-row { display: grid; grid-template-columns: minmax(200px, 1.6fr) 52px 64px 84px 64px minmax(150px, 1.2fr) 96px; align-items: center; gap: 10px; padding: 9px 18px; border-top: 1px solid var(--lq-line); cursor: pointer; transition: background 120ms ease; }
  .sdir-table.is-uni .sdir-row { grid-template-columns: minmax(170px, 1.4fr) 46px minmax(150px, 1.1fr) 58px 76px 56px minmax(140px, 1fr) minmax(120px, 0.9fr); }
  .sdir-row:first-child { border-top: none; }
  .sdir-row:hover { background: rgba(10,42,107,0.04); }
  .sdir-head { cursor: default; background: #fbf8f1; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; color: var(--lq-ink-3); padding-top: 11px; padding-bottom: 11px; }
  .sdir-head:hover { background: #fbf8f1; }
  .sdir-c { text-align: center; }
  .sdir-email-h, .sdir-course-h, .sdir-int-h { text-align: left; }
  .sdir-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .sdir-ini { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; background: rgba(10,42,107,0.08); color: var(--launch-navy); font-family: var(--font-mono); font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .sdir-nm { font-size: 13.5px; font-weight: 600; color: var(--lq-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sdir-year { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--lq-ink-2); }
  .sdir-score { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--launch-navy); }
  .sdir-dim { font-size: 12px; color: var(--lq-ink-3); font-family: var(--font-mono); }
  .sdir-email { font-size: 11.5px; color: var(--lq-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sdir-course { font-size: 12px; color: var(--lq-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sdir-int { font-size: 11.5px; color: var(--lq-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sdir-parent { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 999px; border: 1px solid var(--lq-line-2); background: #fff; font-size: 11.5px; font-weight: 600; color: var(--lq-ink-2); text-decoration: none; transition: border-color 140ms ease, color 140ms ease; }
  .sdir-parent:hover { border-color: var(--launch-navy); color: var(--launch-navy); }
  .sdir-none { padding: 26px; text-align: center; font-style: italic; color: var(--lq-ink-3); }
  .sdir-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
  .sdir-count { font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; font-size: 10px; color: var(--lq-ink-3); }
  @media (max-width: 980px) {
    .sdir-row { grid-template-columns: minmax(170px, 1.6fr) 52px 64px 84px 96px; }
    .sdir-table.is-uni .sdir-row { grid-template-columns: minmax(150px, 1.4fr) 46px minmax(130px, 1fr) 58px minmax(110px, 0.9fr); }
    .sdir-email, .sdir-email-h { display: none; }
    .sdir-row > .sdir-dim:nth-of-type(2), .sdir-head > :nth-child(6) { display: none; }
    .sdir-table:not(.is-uni) .sdir-row > :nth-child(5), .sdir-table:not(.is-uni) .sdir-head > :nth-child(5) { display: none; }
    .sdir-table.is-uni .sdir-row > :nth-child(5), .sdir-table.is-uni .sdir-head > :nth-child(5),
    .sdir-table.is-uni .sdir-row > :nth-child(6), .sdir-table.is-uni .sdir-head > :nth-child(6) { display: none; }
  }
`
