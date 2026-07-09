'use client'

/**
 * RoleShortlistTools — the export / saved-views / shortlist-compare toolbar
 * that sits between the filter strip and the applicant list on a role
 * detail page.
 *
 * The job-to-be-done: Savills runs Launch as ONE step of their application
 * process and wants to validate it against their traditional CV screen.
 * So this surface does three things:
 *
 *   1. SAVED VIEWS — named ApplicantFilters snapshots per role ("Sydney
 *      grads · Problem Solving ≥ 70"), re-openable chips.
 *   2. EXPORT — Excel/CSV (real download, one row per candidate, filter
 *      summary stamped in a header block), PDF report (print-styled branded
 *      page via the browser's print dialog), and a view-only share link
 *      (mocked in the prototype — copies a URL).
 *   3. COMPARE SHORTLIST — paste/upload their internal shortlist; we match
 *      on email or full name and show three buckets. The "Launch surfaced
 *      candidates your screen missed" bucket is deliberately front and
 *      centre — that disagreement list is Launch's whole pitch.
 *
 * Identity note: the dashboard blurs candidate names, but exports + the
 * compare view show REAL names + emails (per partner decision) — the
 * comparison needs a join key against their internal list.
 */

import { useMemo, useRef, useState } from 'react'
import {
  Download, FileSpreadsheet, FileText, Link2, BookmarkPlus,
  ArrowLeftRight, X, Check, Upload,
} from 'lucide-react'
import type { Student } from '@/components/student-list'
import type { ApplicantFilters } from '@/components/role-applicant-filters'
import type { SeedRole } from '@/lib/seedData'
import { listSavedViews, saveView, deleteSavedView, type SavedView } from '@/lib/savedViewsStore'

interface Props {
  role: SeedRole
  /** The pool AFTER the current filters — what the partner sees below. */
  filtered: Student[]
  /** The role's full applicant pool (pre-filter) — compare needs it to tell
   *  "filtered out by you" apart from "never applied". */
  allApplicants: Student[]
  filters: ApplicantFilters
  setFilters: (f: ApplicantFilters) => void
}

/* ---------- filter summary (stamped onto exports) ---------- */

function describeFilters(f: ApplicantFilters): string {
  const parts: string[] = []
  if (f.keyword.trim()) parts.push(`Search: "${f.keyword.trim()}"`)
  if (f.prequalStatus !== 'all') parts.push(`Pre-qualifier: ${f.prequalStatus}`)
  if (f.atarRange[0] > 0) parts.push(`ATAR ≥ ${f.atarRange[0]}`)
  if (f.degrees.length) parts.push(`Degrees: ${f.degrees.join(', ')}`)
  if ((f.universities || []).length) parts.push(`Universities: ${f.universities.join(', ')}`)
  if ((f.gradYears || []).length) parts.push(`Class of ${f.gradYears.join('/')}`)
  if (f.industries.length) parts.push(`Industries: ${f.industries.join(', ')}`)
  if (f.workRights.length) parts.push(`Work rights: ${f.workRights.join(', ')}`)
  if (f.salaryBands.length) parts.push(`Salary: ${f.salaryBands.join(', ')}`)
  if (f.relocate.length) parts.push(`Relocate: ${f.relocate.join(', ')}`)
  if (f.minOverall > 0) parts.push(`Overall ≥ ${f.minOverall}`)
  const caps = Object.entries(f.minByCapability || {}).filter(([, v]) => v > 0)
  if (caps.length) parts.push(caps.map(([k, v]) => `${k} ≥ ${v}`).join(' · '))
  return parts.length ? parts.join(' · ') : 'No filters — full applicant pool'
}

/* ---------- CSV ---------- */

function csvEscape(v: string | number | undefined): string {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function buildCsv(role: SeedRole, students: Student[], filters: ApplicantFilters): string {
  const skills = role.skills || []
  const meta = [
    ['Role', role.name],
    ['Access code', role.accessCode],
    ['Exported', new Date().toLocaleString()],
    ['Filters', describeFilters(filters)],
    ['Candidates', String(students.length)],
  ].map((r) => r.map(csvEscape).join(',')).join('\n')
  const header = [
    'Rank', 'Name', 'Email', 'Overall',
    ...skills,
    'Pre-qualifier', 'ATAR', 'Degree', 'University', 'Grad year', 'Location', 'Submitted',
  ].map(csvEscape).join(',')
  const rows = students.map((s, i) => [
    i + 1, s.name, s.email || '', s.overallScore,
    ...skills.map((sk) => s.topCapabilities.find((c) => c.name === sk)?.level ?? ''),
    s.prequalStatus === 'flagged' ? 'Flagged' : 'Passed',
    s.atar ?? '', s.degree ?? '', s.university ?? '', s.graduationYear ?? '', s.location ?? '',
    s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '',
  ].map(csvEscape).join(',')).join('\n')
  return `${meta}\n\n${header}\n${rows}\n`
}

function downloadCsv(role: SeedRole, students: Student[], filters: ApplicantFilters): void {
  const blob = new Blob([buildCsv(role, students, filters)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${role.accessCode.toLowerCase()}-shortlist.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- shortlist matching ---------- */

interface CompareResult {
  both: Student[]        // on their list AND clears the current Launch filters
  onlyLaunch: Student[]  // clears the filters, absent from their list
  onlyTheirs: Student[]  // on their list, applied, but filtered out by Launch
  unmatched: string[]    // entries we couldn't find among this role's applicants
}

function runCompare(entries: string[], filtered: Student[], all: Student[]): CompareResult {
  const norm = (s: string) => s.trim().toLowerCase()
  const wanted = new Set(entries.map(norm).filter(Boolean))
  const matchesEntry = (s: Student) =>
    wanted.has(norm(s.name)) || (s.email ? wanted.has(norm(s.email)) : false)

  const filteredIds = new Set(filtered.map((s) => s.id))
  const theirMatches = all.filter(matchesEntry)
  const matchedKeys = new Set<string>()
  for (const s of theirMatches) {
    matchedKeys.add(norm(s.name))
    if (s.email) matchedKeys.add(norm(s.email))
  }
  return {
    both: theirMatches.filter((s) => filteredIds.has(s.id)),
    onlyLaunch: filtered.filter((s) => !matchesEntry(s)),
    onlyTheirs: theirMatches.filter((s) => !filteredIds.has(s.id)),
    unmatched: [...wanted].filter((w) => !matchedKeys.has(w)),
  }
}

/* ================================================================== */

export function RoleShortlistTools({ role, filtered, allApplicants, filters, setFilters }: Props) {
  /* Saved views */
  const [views, setViews] = useState<SavedView[]>(() => listSavedViews(role.id))
  const [showSave, setShowSave] = useState(false)
  const [viewName, setViewName] = useState('')
  const filtersKey = JSON.stringify(filters)
  const handleSaveView = () => {
    if (!viewName.trim()) return
    saveView(role.id, viewName, filters)
    setViews(listSavedViews(role.id))
    setViewName('')
    setShowSave(false)
  }

  /* Export menu */
  const [exportOpen, setExportOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [printing, setPrinting] = useState(false)
  const handlePdf = () => {
    setExportOpen(false)
    setPrinting(true)
    // Let the print-only report mount with current data before the dialog.
    setTimeout(() => { window.print(); setPrinting(false) }, 60)
  }
  const handleShareLink = () => {
    // Prototype-grade: the real build mints a tokenised view-only URL.
    const url = `https://launchapp.au/share/${role.accessCode.toLowerCase()}-${views.length}${filtered.length.toString(36)}`
    try { navigator.clipboard?.writeText(url) } catch { /* ignore */ }
    setExportOpen(false)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2600)
  }

  /* Compare */
  const [compareOpen, setCompareOpen] = useState(false)
  const [pasted, setPasted] = useState('')
  const [result, setResult] = useState<CompareResult | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const entries = useMemo(
    () => pasted.split(/[\n,;]+/).map((e) => e.replace(/^["']|["']$/g, '').trim()).filter(Boolean),
    [pasted],
  )
  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPasted((prev) => (prev ? prev + '\n' : '') + String(reader.result || ''))
    reader.readAsText(file)
  }

  return (
    <div className="rst-root">
      {/* ── Toolbar row ─────────────────────────────────────────── */}
      <div className="rst-bar">
        <div className="rst-views">
          {views.length > 0 && <span className="rst-views-label editorial-mono">Saved views</span>}
          {views.map((v) => {
            const active = JSON.stringify(v.filters) === filtersKey
            return (
              <span key={v.id} className={`rst-chip ${active ? 'is-on' : ''}`}>
                <button type="button" className="rst-chip-apply" onClick={() => setFilters(v.filters)}>
                  {v.name}
                </button>
                <button
                  type="button"
                  className="rst-chip-x"
                  aria-label={`Delete view ${v.name}`}
                  onClick={() => { deleteSavedView(v.id); setViews(listSavedViews(role.id)) }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
        <div className="rst-actions">
          <button type="button" className="corp-btn corp-btn-ghost" onClick={() => setShowSave(true)}>
            <BookmarkPlus className="w-4 h-4" /> Save view
          </button>
          <button
            type="button"
            className="corp-btn corp-btn-ghost"
            aria-expanded={compareOpen}
            onClick={() => setCompareOpen((v) => !v)}
          >
            <ArrowLeftRight className="w-4 h-4" /> Compare your shortlist
          </button>
          <div className="rst-export">
            <button
              type="button"
              className="corp-btn corp-btn-primary"
              aria-expanded={exportOpen}
              onClick={() => setExportOpen((v) => !v)}
            >
              <Download className="w-4 h-4" /> Export {filtered.length} candidate{filtered.length === 1 ? '' : 's'}
            </button>
            {exportOpen && (
              <div className="rst-export-menu" role="menu">
                <button type="button" className="rst-export-item" onClick={() => { downloadCsv(role, filtered, filters); setExportOpen(false) }}>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel / CSV<em>One row per candidate, filters stamped on top</em></span>
                </button>
                <button type="button" className="rst-export-item" onClick={handlePdf}>
                  <FileText className="w-4 h-4" />
                  <span>PDF report<em>Branded shortlist for a hiring manager</em></span>
                </button>
                <button type="button" className="rst-export-item" onClick={handleShareLink}>
                  <Link2 className="w-4 h-4" />
                  <span>Copy view-only link<em>Opens this filtered view, read-only</em></span>
                </button>
              </div>
            )}
            {linkCopied && (
              <span className="rst-copied editorial-mono"><Check className="w-3 h-3" /> Link copied</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Compare panel ───────────────────────────────────────── */}
      {compareOpen && (
        <div className="rst-compare corp-card">
          <div className="rst-compare-head">
            <div>
              <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)', marginBottom: 4 }}>
                Shortlist validation
              </div>
              <h3 className="rst-compare-title">Does Launch agree with your screen?</h3>
              <p className="rst-compare-sub">
                Paste the candidates your traditional screening picked (names or
                emails, one per line) — we&rsquo;ll match them against this
                role&rsquo;s applicants and show where the two lists agree and
                where they don&rsquo;t. Identities are shown here for matching.
              </p>
            </div>
            <button type="button" className="rst-x" aria-label="Close compare" onClick={() => { setCompareOpen(false); setResult(null) }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            className="rst-paste"
            rows={4}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder={'e.g.\nsarah.chen@email.com\nJames Riley\nmaya.patel@email.com'}
          />
          <div className="rst-compare-foot">
            <button type="button" className="corp-btn corp-btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload .csv / .txt
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
              {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
            </span>
            <button
              type="button"
              className="corp-btn corp-btn-primary"
              style={{ marginLeft: 'auto' }}
              disabled={entries.length === 0}
              onClick={() => setResult(runCompare(entries, filtered, allApplicants))}
            >
              Run comparison
            </button>
          </div>

          {result && (
            <div className="rst-buckets">
              {/* The money bucket — what Launch found that their screen missed */}
              <div className="rst-bucket rst-bucket-launch">
                <div className="rst-bucket-num">{result.onlyLaunch.length}</div>
                <div className="rst-bucket-label">Launch surfaced — your screen missed</div>
                <BucketList students={result.onlyLaunch} />
              </div>
              <div className="rst-bucket">
                <div className="rst-bucket-num">{result.both.length}</div>
                <div className="rst-bucket-label">Both lists agree</div>
                <BucketList students={result.both} />
              </div>
              <div className="rst-bucket">
                <div className="rst-bucket-num">{result.onlyTheirs.length}</div>
                <div className="rst-bucket-label">Your picks below the Launch bar</div>
                <BucketList students={result.onlyTheirs} />
                {result.unmatched.length > 0 && (
                  <div className="rst-unmatched editorial-mono">
                    +{result.unmatched.length} entr{result.unmatched.length === 1 ? 'y' : 'ies'} not found among applicants
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Save-view modal ─────────────────────────────────────── */}
      {showSave && (
        <div className="rst-modal-root" role="dialog" aria-modal="true" aria-label="Save view">
          <div className="rst-modal-backdrop" onClick={() => setShowSave(false)} />
          <div className="rst-modal-card">
            <div className="rst-modal-head">
              <div>
                <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)', marginBottom: 4 }}>Saved view</div>
                <h3 className="rst-modal-title">Name this view</h3>
              </div>
              <button type="button" className="rst-x" aria-label="Close" onClick={() => setShowSave(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="rst-modal-sub">{describeFilters(filters)}</p>
            <input
              type="text"
              className="rst-input"
              value={viewName}
              autoFocus
              placeholder="e.g. Sydney grads · Problem Solving ≥ 70"
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveView() }}
            />
            <div className="rst-modal-foot">
              <button type="button" className="corp-btn corp-btn-ghost" onClick={() => setShowSave(false)}>Cancel</button>
              <button type="button" className="corp-btn corp-btn-primary" disabled={!viewName.trim()} onClick={handleSaveView}>
                Save view
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print-only PDF report ───────────────────────────────── */}
      {printing && (
        <div className="rst-print">
          <div className="rst-print-brand">LAUNCH</div>
          <h1 className="rst-print-title">{role.name} — shortlist report</h1>
          <div className="rst-print-meta">
            {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{filtered.length} candidate{filtered.length === 1 ? '' : 's'}
            {' · '}Access code {role.accessCode}
          </div>
          <div className="rst-print-filters">{describeFilters(filters)}</div>
          <table className="rst-print-table">
            <thead>
              <tr>
                <th>#</th><th>Candidate</th><th>Email</th><th>Overall</th>
                {(role.skills || []).map((s) => <th key={s}>{s}</th>)}
                <th>Pre-qualifier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.email || '—'}</td>
                  <td>{s.overallScore}</td>
                  {(role.skills || []).map((sk) => (
                    <td key={sk}>{s.topCapabilities.find((c) => c.name === sk)?.level ?? '—'}</td>
                  ))}
                  <td>{s.prequalStatus === 'flagged' ? 'Flagged' : 'Passed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rst-print-foot">Generated by Launch · launchapp.au</div>
        </div>
      )}

      <style>{rstStyles}</style>
    </div>
  )
}

function BucketList({ students }: { students: Student[] }) {
  const MAX = 6
  return (
    <ul className="rst-bucket-list">
      {students.slice(0, MAX).map((s) => (
        <li key={s.id}>
          <span className="rst-bl-name">{s.name}</span>
          <span className="rst-bl-score">{s.overallScore}</span>
        </li>
      ))}
      {students.length > MAX && (
        <li className="rst-bl-more editorial-mono">+ {students.length - MAX} more — export for the full list</li>
      )}
      {students.length === 0 && <li className="rst-bl-empty">None</li>}
    </ul>
  )
}

const rstStyles = `
  .rst-root { margin-top: 14px; }
  .rst-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .rst-views {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 34px;
  }
  .rst-views-label { color: var(--lq-ink-3); }
  .rst-chip {
    display: inline-flex;
    align-items: center;
    background: #fff;
    border: 1px solid var(--lq-line-2);
    border-radius: 999px;
    overflow: hidden;
    transition: border-color 140ms ease;
  }
  .rst-chip:hover { border-color: var(--launch-navy); }
  .rst-chip.is-on { border-color: var(--launch-navy); background: rgba(10, 42, 107, 0.06); }
  .rst-chip-apply {
    appearance: none; background: transparent; border: none; cursor: pointer;
    padding: 6px 4px 6px 14px;
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    color: var(--lq-ink);
  }
  .rst-chip-x {
    appearance: none; background: transparent; border: none; cursor: pointer;
    padding: 6px 10px 6px 6px;
    color: var(--lq-ink-3);
    display: inline-flex; align-items: center;
  }
  .rst-chip-x:hover { color: var(--launch-danger); }
  .rst-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rst-export { position: relative; }
  .rst-export-menu {
    position: absolute; top: calc(100% + 6px); right: 0; z-index: 50;
    width: 300px;
    background: #fff;
    border: 1px solid var(--lq-line);
    border-radius: 14px;
    padding: 6px;
    box-shadow: 0 18px 36px -16px rgba(10, 42, 107, 0.24);
  }
  .rst-export-item {
    appearance: none; background: transparent; border: none; cursor: pointer;
    width: 100%; padding: 10px 12px;
    display: flex; align-items: flex-start; gap: 10px;
    text-align: left; border-radius: 8px;
    color: var(--launch-navy);
    transition: background 120ms ease;
  }
  .rst-export-item:hover { background: rgba(10, 42, 107, 0.05); }
  .rst-export-item span {
    display: flex; flex-direction: column; gap: 1px;
    font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--lq-ink);
  }
  .rst-export-item em {
    font-style: normal; font-weight: 400; font-size: 11.5px; color: var(--lq-ink-3);
  }
  .rst-copied {
    position: absolute; top: calc(100% + 8px); right: 0;
    display: inline-flex; align-items: center; gap: 5px;
    color: var(--launch-teal-3, #1b9e8f);
    background: #fff;
    border: 1px solid var(--lq-line);
    border-radius: 999px;
    padding: 4px 12px;
    box-shadow: 0 8px 18px -12px rgba(10, 42, 107, 0.25);
    white-space: nowrap;
  }

  /* Compare panel */
  .rst-compare { margin-top: 14px; padding: 22px 24px; }
  .rst-compare-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .rst-compare-title {
    margin: 0 0 6px;
    font-family: var(--font-display); font-weight: 500; font-size: 20px;
    letter-spacing: -0.015em; color: var(--lq-ink);
  }
  .rst-compare-sub { margin: 0; font-size: 13px; color: var(--lq-ink-2); line-height: 1.55; max-width: 62ch; }
  .rst-x {
    appearance: none; background: transparent; cursor: pointer;
    border: 1px solid var(--lq-line-2); border-radius: 999px;
    width: 30px; height: 30px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--lq-ink-2);
    transition: color 140ms ease, border-color 140ms ease;
  }
  .rst-x:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
  .rst-paste {
    width: 100%;
    border: 1px solid var(--lq-line-2); border-radius: 10px;
    padding: 12px 14px;
    font-family: var(--font-mono); font-size: 13px; line-height: 1.6;
    color: var(--lq-ink);
    background: #fff;
    resize: vertical;
  }
  .rst-paste:focus { outline: none; border-color: var(--launch-navy); }
  .rst-compare-foot { display: flex; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
  .rst-buckets {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    margin-top: 18px;
  }
  @media (max-width: 900px) { .rst-buckets { grid-template-columns: 1fr; } }
  .rst-bucket {
    border: 1px solid var(--lq-line); border-radius: 12px;
    padding: 16px 16px 12px;
    background: #fff;
  }
  .rst-bucket-launch {
    border-color: var(--launch-navy);
    background: rgba(10, 42, 107, 0.04);
    box-shadow: 0 0 0 3px rgba(10, 42, 107, 0.08);
  }
  .rst-bucket-num {
    font-family: var(--font-mono); font-weight: 600; font-size: 30px;
    color: var(--launch-navy); line-height: 1;
  }
  .rst-bucket-label {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600;
    color: var(--lq-ink-3);
    margin: 6px 0 10px;
  }
  .rst-bucket-list { list-style: none; margin: 0; padding: 0; }
  .rst-bucket-list li {
    display: flex; justify-content: space-between; gap: 10px;
    padding: 6px 0;
    border-top: 1px solid var(--lq-line);
    font-size: 13px; color: var(--lq-ink);
  }
  .rst-bl-score { font-family: var(--font-mono); font-weight: 600; color: var(--launch-navy); }
  .rst-bl-more, .rst-bl-empty { color: var(--lq-ink-3); font-size: 11px; }
  .rst-unmatched { color: var(--lq-ink-3); margin-top: 8px; font-size: 10px; }

  /* Save-view modal */
  .rst-modal-root { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .rst-modal-backdrop { position: absolute; inset: 0; background: rgba(10, 42, 107, 0.40); backdrop-filter: blur(4px); }
  .rst-modal-card {
    position: relative; background: #fff; border-radius: 18px;
    width: 100%; max-width: 440px; padding: 22px 26px;
    box-shadow: 0 24px 60px -18px rgba(10, 42, 107, 0.32);
  }
  .rst-modal-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
  .rst-modal-title { margin: 0; font-family: var(--font-display); font-weight: 500; font-size: 20px; letter-spacing: -0.015em; color: var(--lq-ink); }
  .rst-modal-sub { margin: 10px 0 14px; font-size: 12px; color: var(--lq-ink-2); line-height: 1.55; }
  .rst-input {
    width: 100%;
    border: 1px solid var(--lq-line-2); border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-body); font-size: 14px; color: var(--lq-ink);
  }
  .rst-input:focus { outline: none; border-color: var(--launch-navy); }
  .rst-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }

  /* Print-only report */
  @media screen { .rst-print { display: none; } }
  @media print {
    body * { visibility: hidden; }
    .rst-print, .rst-print * { visibility: visible; }
    .rst-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; color: #0e1833; }
    .rst-print-brand { font-family: var(--font-mono, monospace); font-weight: 700; letter-spacing: 0.3em; font-size: 13px; color: #0a2a6b; }
    .rst-print-title { font-size: 24px; margin: 10px 0 4px; }
    .rst-print-meta { font-size: 12px; color: #555; margin-bottom: 4px; }
    .rst-print-filters { font-size: 11px; color: #555; margin-bottom: 16px; border-left: 3px solid #0a2a6b; padding-left: 8px; }
    .rst-print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .rst-print-table th, .rst-print-table td { border-bottom: 1px solid #ddd; padding: 5px 6px; text-align: left; }
    .rst-print-table th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; }
    .rst-print-foot { margin-top: 18px; font-size: 10px; color: #999; }
  }
`
