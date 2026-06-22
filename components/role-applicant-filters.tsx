'use client'

/**
 * RoleApplicantFilters — the filter pipeline that lives at the top of a
 * partner's role detail page. Auto-generated from the candidate profile
 * fields collected at intake + the partner-set benchmarks.
 *
 * Design goals:
 *  - Filter chips are FLAT — every active chip is visible, every other
 *    filter is one click away. No "advanced filters" hidden behind a
 *    second drawer.
 *  - LIVE count of "X of Y candidates" at the top, so the partner
 *    feels the narrowing.
 *  - "Clear all" reset on demand.
 *  - Self-contained — caller passes in the candidate pool, gets back a
 *    filtered pool. Filter state can be lifted up if the host wants
 *    saved views.
 *
 * The component is intentionally narrow-scoped. Capability-level filters
 * (e.g. "min 80 on Collaboration") and the role-specific skill picker
 * stay on the role detail page itself; this component handles the
 * profile-driven slice.
 */

import { useState, useMemo } from 'react'
import type { Student } from '@/components/student-list'

const SALARY_LABELS: Record<string, string> = {
  'under-60': '< $60k',
  '60-75': '$60–75k',
  '75-90': '$75–90k',
  '90-110': '$90–110k',
  '110-130': '$110–130k',
  '130-150': '$130–150k',
  '150-plus': '$150k+',
  'flexible': 'Flexible',
}
const WORK_RIGHTS_LABELS: Record<string, string> = {
  'citizen-permanent': 'Citizen/PR',
  'visa-unrestricted': 'Visa — unrestricted',
  'visa-restricted': 'Visa — needs sponsorship',
  'no-rights': 'None',
}
const RELOCATE_LABELS: Record<string, string> = {
  'yes-anywhere': 'Anywhere',
  'yes-in-country': 'Within country',
  'yes-in-state': 'Within state',
  'no': 'Local only',
}

export interface ApplicantFilters {
  /** Min/max ATAR. */
  atarRange: [number, number]
  /** Subset of degree strings to include. Empty = all. */
  degrees: string[]
  /** Graduation years to include (multi-select toggle). Empty = all. */
  gradYears: number[]
  /** Universities to include (multi-select toggle). Empty = all. */
  universities: string[]
  /** Industries of interest. Empty = all. */
  industries: string[]
  /** Work rights statuses to include. */
  workRights: string[]
  /** Salary buckets to include. */
  salaryBands: string[]
  /** Willing-to-relocate values to include. */
  relocate: string[]
  /** Pre-qualifier status filter. */
  prequalStatus: 'all' | 'passed' | 'flagged'
  /** Minimum overall scenario score. */
  minOverall: number
  /** Per-capability min-score gate. Key = capability name (e.g. "Problem
   *  Solving"), value = 0-100 threshold. Capabilities not in the map are
   *  unfiltered. Only populated when the partner has actually moved a
   *  slider above 0. */
  minByCapability: Record<string, number>
  /** Free-text keyword (matches name / university / degree). */
  keyword: string
}

export const DEFAULT_FILTERS: ApplicantFilters = {
  atarRange: [0, 100],
  degrees: [],
  gradYears: [],
  universities: [],
  industries: [],
  workRights: [],
  salaryBands: [],
  relocate: [],
  prequalStatus: 'all',
  minOverall: 0,
  minByCapability: {},
  keyword: '',
}

export function applyApplicantFilters(students: Student[], f: ApplicantFilters): Student[] {
  const kw = f.keyword.trim().toLowerCase()
  return students.filter((s) => {
    // Defensive on new fields — saved-view localStorage may still carry
    // the older filter shape without these arrays defined.
    const gradYears = f.gradYears || []
    const universities = f.universities || []
    if (s.atar !== undefined && (s.atar < f.atarRange[0] || s.atar > f.atarRange[1])) return false
    if (f.degrees.length > 0 && s.degree && !f.degrees.includes(s.degree)) return false
    if (gradYears.length > 0 && (s.graduationYear === undefined || !gradYears.includes(s.graduationYear))) return false
    if (universities.length > 0 && (!s.university || !universities.includes(s.university))) return false
    if (f.industries.length > 0 && !(s.industries || []).some((i) => f.industries.includes(i))) return false
    if (f.workRights.length > 0 && (!s.workRights || !f.workRights.includes(s.workRights))) return false
    if (f.salaryBands.length > 0 && (!s.expectedSalary || !f.salaryBands.includes(s.expectedSalary))) return false
    if (f.relocate.length > 0 && (!s.willingRelocate || !f.relocate.includes(s.willingRelocate))) return false
    if (f.prequalStatus !== 'all' && s.prequalStatus && s.prequalStatus !== f.prequalStatus) return false
    if (s.overallScore < f.minOverall) return false
    // Per-capability gates. Defensive on missing field so older saved
    // views still load. A candidate is dropped if any gated capability
    // they don't have OR have below threshold.
    const caps = f.minByCapability || {}
    for (const capName of Object.keys(caps)) {
      const min = caps[capName]
      if (!min || min <= 0) continue
      const hit = s.topCapabilities.find((c) => c.name === capName)
      if (!hit || hit.level < min) return false
    }
    if (kw) {
      const hay = `${s.name} ${s.degree || ''} ${s.university || ''}`.toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })
}

interface Props {
  students: Student[]
  /** Optional limit for the "all degrees" picker so the chip strip
   *  doesn't blow up — top N by frequency in the pool. */
  topDegrees?: number
  filters: ApplicantFilters
  setFilters: (f: ApplicantFilters) => void
  /** Capability names this scenario was scored against. Drives the
   *  Capabilities tab — one slider per name. If empty/undefined, the
   *  tab doesn't render. */
  scenarioCapabilities?: string[]
}

export function RoleApplicantFilters({ students, filters, setFilters, topDegrees = 12, scenarioCapabilities }: Props) {
  const totalCount = students.length
  const filteredCount = useMemo(() => applyApplicantFilters(students, filters).length, [students, filters])

  // Build dynamic option lists from the pool so the filter only shows
  // values that actually exist in the data the partner is looking at.
  const allDegrees = useMemo(() => {
    const tally: Record<string, number> = {}
    for (const s of students) if (s.degree) tally[s.degree] = (tally[s.degree] || 0) + 1
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, topDegrees).map(([d]) => d)
  }, [students, topDegrees])
  const allIndustries = useMemo(() => {
    const tally: Record<string, number> = {}
    for (const s of students) for (const i of s.industries || []) tally[i] = (tally[i] || 0) + 1
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([i]) => i)
  }, [students])
  const minGradYear = Math.min(...students.map((s) => s.graduationYear ?? 2099), 2099)
  const maxGradYear = Math.max(...students.map((s) => s.graduationYear ?? 0), 0)

  const [expanded, setExpanded] = useState<'profile' | 'eligibility' | 'looking' | 'capabilities' | null>(null)

  const capList = scenarioCapabilities ?? []
  const activeCapCount = Object.values(filters.minByCapability || {}).filter((v) => v > 0).length

  const patch = (p: Partial<ApplicantFilters>) => setFilters({ ...filters, ...p })
  const toggleInList = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v]

  // Build the universities option list — top 8 by frequency in the pool.
  const allUniversities = useMemo(() => {
    const tally: Record<string, number> = {}
    for (const s of students) if (s.university) tally[s.university] = (tally[s.university] || 0) + 1
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([u]) => u)
  }, [students])
  // Build the graduation year option list — every year present in the pool.
  const allGradYears = useMemo(() => {
    const set = new Set<number>()
    for (const s of students) if (s.graduationYear !== undefined) set.add(s.graduationYear)
    return Array.from(set).sort()
  }, [students])

  const activeFilterCount =
    (filters.degrees.length > 0 ? 1 : 0) +
    ((filters.universities || []).length > 0 ? 1 : 0) +
    ((filters.gradYears || []).length > 0 ? 1 : 0) +
    (filters.industries.length > 0 ? 1 : 0) +
    (filters.workRights.length > 0 ? 1 : 0) +
    (filters.salaryBands.length > 0 ? 1 : 0) +
    (filters.relocate.length > 0 ? 1 : 0) +
    (filters.prequalStatus !== 'all' ? 1 : 0) +
    (filters.minOverall > 0 ? 1 : 0) +
    (filters.keyword.trim().length > 0 ? 1 : 0) +
    (filters.atarRange[0] > 0 ? 1 : 0) +
    activeCapCount

  return (
    <div className="raf-root">
      {/* Count strip + clear all */}
      <div className="raf-count-strip">
        <div className="raf-count">
          <span className="raf-count-num">{filteredCount.toLocaleString()}</span>
          <span className="raf-count-of">of {totalCount.toLocaleString()} applicants</span>
        </div>
        <div className="raf-count-meta">
          {activeFilterCount > 0 ? (
            <button type="button" className="raf-clear" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} ×
            </button>
          ) : (
            <span className="raf-count-meta-hint">Filter to narrow the pool</span>
          )}
        </div>
      </div>

      {/* Always-visible primary controls */}
      <div className="raf-primary">
        <div className="raf-search">
          <input
            type="text"
            className="raf-search-input"
            value={filters.keyword}
            onChange={(e) => patch({ keyword: e.target.value })}
            placeholder="Search by name, degree, or university"
          />
        </div>
        <div className="raf-quick">
          <SegmentedToggle
            label="Pre-qualifier status"
            options={[
              { value: 'all', label: 'All' },
              { value: 'passed', label: 'Passed gates' },
              { value: 'flagged', label: 'Flagged' },
            ]}
            value={filters.prequalStatus}
            onChange={(v) => patch({ prequalStatus: v as any })}
          />
        </div>
      </div>

      {/* Filter group toggle row */}
      <div className="raf-groups">
        <FilterGroupTab name="Profile" active={expanded === 'profile'} onToggle={() => setExpanded(expanded === 'profile' ? null : 'profile')} count={
          (filters.atarRange[0] > 0 ? 1 : 0)
          + ((filters.gradYears || []).length > 0 ? 1 : 0)
          + (filters.degrees.length > 0 ? 1 : 0)
          + ((filters.universities || []).length > 0 ? 1 : 0)
        } />
        <FilterGroupTab name="Eligibility" active={expanded === 'eligibility'} onToggle={() => setExpanded(expanded === 'eligibility' ? null : 'eligibility')} count={filters.workRights.length + filters.industries.length} />
        <FilterGroupTab name="Looking for" active={expanded === 'looking'} onToggle={() => setExpanded(expanded === 'looking' ? null : 'looking')} count={filters.salaryBands.length + filters.relocate.length} />
        {capList.length > 0 && (
          <FilterGroupTab
            name="Capabilities"
            active={expanded === 'capabilities'}
            onToggle={() => setExpanded(expanded === 'capabilities' ? null : 'capabilities')}
            count={activeCapCount}
          />
        )}
      </div>

      {expanded === 'profile' && (
        <div className="raf-panel">
          {/* 1. ATAR — single-handle minimum threshold. The partner picks
                  the floor ("show candidates with ATAR ≥ X"); the upper
                  bound is always 100. The second handle was redundant for
                  recruitment filtering — you almost never want to exclude
                  the top end. */}
          <MinField
            label="ATAR"
            min={0}
            max={100}
            step={0.5}
            value={filters.atarRange[0]}
            onChange={(v) => patch({ atarRange: [v, 100] })}
            format={(n) => n.toFixed(1)}
          />

          {/* 2. Graduation year — segmented multi-pick toggle. Different
                  mechanic than the slider above; better fit for a
                  discrete-year filter. */}
          <YearTogglePicker
            label="Graduation year"
            options={allGradYears}
            value={filters.gradYears || []}
            onToggle={(v) => {
              const cur = filters.gradYears || []
              patch({
                gradYears: cur.includes(v)
                  ? cur.filter((y) => y !== v)
                  : [...cur, v],
              })
            }}
          />

          {/* 3. Degrees — chip multi-pick (unchanged content; different
                  mechanic than the year toggles above). */}
          <MultiChipPicker
            label={`Degrees (top ${allDegrees.length})`}
            options={allDegrees}
            value={filters.degrees}
            onToggle={(v) => patch({ degrees: toggleInList(filters.degrees, v) })}
          />

          {/* 4. Universities — multi-select dropdown. A 4th distinct input
                  type (not a slider, not a toggle row, not a chip wrap). */}
          <UniversityMultiSelect
            label={`Universities (top ${allUniversities.length})`}
            options={allUniversities}
            value={filters.universities || []}
            onToggle={(v) => patch({ universities: toggleInList(filters.universities || [], v) })}
          />
        </div>
      )}

      {expanded === 'eligibility' && (
        <div className="raf-panel">
          <MultiChipPicker
            label="Work rights"
            options={Object.keys(WORK_RIGHTS_LABELS)}
            renderLabel={(v) => WORK_RIGHTS_LABELS[v] || v}
            value={filters.workRights}
            onToggle={(v) => patch({ workRights: toggleInList(filters.workRights, v) })}
          />
          <MultiChipPicker
            label="Industries of interest"
            options={allIndustries}
            value={filters.industries}
            onToggle={(v) => patch({ industries: toggleInList(filters.industries, v) })}
          />
        </div>
      )}

      {expanded === 'looking' && (
        <div className="raf-panel">
          <MultiChipPicker
            label="Salary expectations"
            options={Object.keys(SALARY_LABELS)}
            renderLabel={(v) => SALARY_LABELS[v] || v}
            value={filters.salaryBands}
            onToggle={(v) => patch({ salaryBands: toggleInList(filters.salaryBands, v) })}
          />
          <MultiChipPicker
            label="Willing to relocate"
            options={Object.keys(RELOCATE_LABELS)}
            renderLabel={(v) => RELOCATE_LABELS[v] || v}
            value={filters.relocate}
            onToggle={(v) => patch({ relocate: toggleInList(filters.relocate, v) })}
          />
        </div>
      )}

      {/* Capabilities panel — one min-score slider per Launch capability the
          scenario was authored to test. No intro card, no reset button —
          just the sliders. */}
      {expanded === 'capabilities' && capList.length > 0 && (
        <div className="raf-panel">
          {capList.map((capName) => (
            <MinField
              key={capName}
              label={capName}
              min={0}
              max={100}
              step={5}
              value={filters.minByCapability?.[capName] || 0}
              onChange={(v) => {
                const next = { ...(filters.minByCapability || {}) }
                if (v <= 0) delete next[capName]
                else next[capName] = v
                patch({ minByCapability: next })
              }}
              format={(n) => String(Math.round(n))}
            />
          ))}
        </div>
      )}

      <style>{`
        .raf-root {
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 1px 0 rgba(10, 42, 107, 0.02), 0 4px 14px -10px rgba(10, 42, 107, 0.08);
        }
        .raf-count-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .raf-count {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .raf-count-num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 32px;
          line-height: 1;
          color: var(--launch-navy);
          letter-spacing: -0.02em;
        }
        .raf-count-of {
          color: var(--lq-ink-3);
          font-size: 14px;
        }
        .raf-count-meta-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
        }
        .raf-clear {
          appearance: none;
          background: rgba(122, 14, 42, 0.10);
          color: #7a0e2a;
          border: 1px solid rgba(122, 14, 42, 0.24);
          border-radius: 999px;
          padding: 6px 14px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          font-weight: 600;
          transition: background 160ms ease;
        }
        .raf-clear:hover { background: rgba(122, 14, 42, 0.18); }

        .raf-primary {
          display: grid;
          gap: 10px;
          grid-template-columns: 1fr auto;
          margin-bottom: 14px;
        }
        @media (max-width: 720px) {
          .raf-primary { grid-template-columns: 1fr; }
        }
        .raf-search-input {
          width: 100%;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          padding: 10px 16px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--lq-ink);
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .raf-search-input:focus {
          border-color: var(--launch-navy);
          box-shadow: 0 0 0 3px rgba(10, 42, 107, 0.08);
        }

        .raf-groups {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .raf-panel {
          margin-top: 12px;
          padding: 16px 18px;
          background: #fbf8f1;
          border: 1px solid rgba(10, 42, 107, 0.08);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .raf-panel-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 540px) { .raf-panel-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

function FilterGroupTab({ name, count, active, onToggle }: { name: string; count: number; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`raf-group-tab ${active ? 'is-active' : ''}`}
    >
      {name}
      {count > 0 && <span className="raf-group-tab-count">{count}</span>}
      <span className="raf-group-tab-caret">{active ? '▴' : '▾'}</span>
      <style>{`
        .raf-group-tab {
          appearance: none;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          padding: 8px 14px;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 13px;
          color: var(--lq-ink-2);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
        }
        .raf-group-tab:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
        .raf-group-tab.is-active {
          background: rgba(10, 42, 107, 0.08);
          color: var(--launch-navy);
          border-color: var(--launch-navy);
          font-weight: 600;
        }
        .raf-group-tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--launch-navy);
          color: var(--lq-cream);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          padding: 1px 6px;
          min-width: 18px;
        }
        .raf-group-tab-caret { color: var(--lq-ink-3); font-size: 9px; }
      `}</style>
    </button>
  )
}

function MultiChipPicker({
  label,
  options,
  value,
  onToggle,
  renderLabel,
}: {
  label: string
  options: string[]
  value: string[]
  onToggle: (v: string) => void
  renderLabel?: (v: string) => string
}) {
  return (
    <div className="raf-multi">
      <div className="raf-multi-label">{label}</div>
      <div className="raf-multi-chips">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              className={`raf-chip ${on ? 'is-on' : ''}`}
              onClick={() => onToggle(o)}
            >
              {renderLabel ? renderLabel(o) : o}
            </button>
          )
        })}
      </div>
      <style>{`
        .raf-multi-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .raf-multi-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .raf-chip {
          appearance: none;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          padding: 6px 12px;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
        }
        .raf-chip:hover { border-color: var(--launch-navy); color: var(--lq-ink); }
        .raf-chip.is-on {
          background: var(--launch-navy);
          color: var(--lq-cream);
          border-color: var(--launch-navy);
        }
      `}</style>
    </div>
  )
}

/** Single-handle minimum-threshold slider. Renders one slider that sets the
 *  minimum value; the upper bound is implicitly the slider's `max`. Replaces
 *  the previous 2-handle RangeField, which gave partners a redundant "upper
 *  bound" control they never used in recruitment filtering. */
function MinField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  format: (n: number) => string
}) {
  return (
    <div className="raf-range">
      {/* "ATAR · ≥ 0" reads as a single phrase. When the partner hasn't
          touched the slider, show "any" in place of the number so the
          default state isn't read as "ATAR ≥ 0 (filtered)". */}
      <div className="raf-range-label">
        <span className="raf-range-label-name">{label}</span>
        <span className="raf-range-label-sep">·</span>
        <span className="raf-range-value">
          {value <= min ? 'any' : <>&ge; {format(value)}</>}
        </span>
      </div>
      <div className="raf-range-controls">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
      <style>{`
        .raf-range-label {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .raf-range-label-name { color: var(--lq-ink-3); }
        .raf-range-label-sep { color: var(--lq-ink-3); opacity: 0.5; }
        .raf-range-value { color: var(--launch-navy); }
        .raf-range-controls { display: flex; gap: 8px; }
        .raf-range-controls input[type="range"] {
          flex: 1;
          accent-color: var(--launch-navy);
        }
      `}</style>
    </div>
  )
}

/** Graduation year multi-toggle — small year pills, click to add/remove. */
function YearTogglePicker({
  label,
  options,
  value,
  onToggle,
}: {
  label: string
  options: number[]
  value: number[]
  onToggle: (v: number) => void
}) {
  return (
    <div className="raf-yearpick">
      <div className="raf-yearpick-label">
        <span>{label}</span>
        <span className="raf-yearpick-meta">
          {value.length === 0 ? 'any year' : value.length === 1 ? `Class of ${value[0]}` : `${value.length} years picked`}
        </span>
      </div>
      <div className="raf-yearpick-row">
        {options.map((y) => {
          const on = value.includes(y)
          return (
            <button
              key={y}
              type="button"
              onClick={() => onToggle(y)}
              className={`raf-yearpick-pill ${on ? 'is-on' : ''}`}
            >
              {y}
            </button>
          )
        })}
      </div>
      <style>{`
        .raf-yearpick-label {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--lq-ink-3);
        }
        .raf-yearpick-meta { color: var(--launch-navy); }
        .raf-yearpick-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .raf-yearpick-pill {
          appearance: none;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 8px;
          padding: 7px 14px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
        }
        .raf-yearpick-pill:hover { border-color: var(--launch-navy); color: var(--lq-ink); }
        .raf-yearpick-pill.is-on {
          background: var(--launch-navy);
          color: var(--lq-cream);
          border-color: var(--launch-navy);
        }
      `}</style>
    </div>
  )
}

/** University multi-select dropdown — click to open, tick boxes for each
 *  university. Closes on outside click. */
function UniversityMultiSelect({
  label,
  options,
  value,
  onToggle,
}: {
  label: string
  options: string[]
  value: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="raf-uni" onMouseLeave={() => setOpen(false)}>
      <div className="raf-uni-label">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="raf-uni-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="raf-uni-trigger-text">
          {value.length === 0 ? 'Pick one or more universities' : value.length === 1 ? value[0] : `${value.length} universities picked`}
        </span>
        <span className="raf-uni-trigger-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="raf-uni-menu">
          {options.map((u) => {
            const on = value.includes(u)
            return (
              <button
                key={u}
                type="button"
                onClick={() => onToggle(u)}
                className={`raf-uni-item ${on ? 'is-on' : ''}`}
              >
                <span className="raf-uni-item-check">{on ? '✓' : ''}</span>
                <span className="raf-uni-item-name">{u}</span>
              </button>
            )
          })}
        </div>
      )}
      <style>{`
        .raf-uni { position: relative; }
        .raf-uni-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .raf-uni-trigger {
          appearance: none;
          width: 100%;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--lq-ink);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 140ms ease;
        }
        .raf-uni-trigger:hover { border-color: var(--launch-navy); }
        .raf-uni-trigger-text {
          color: ${value.length === 0 ? 'var(--lq-ink-3)' : 'var(--lq-ink)'};
        }
        .raf-uni-trigger-caret { color: var(--lq-ink-3); font-size: 10px; }
        .raf-uni-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 10px;
          box-shadow: 0 8px 24px -10px rgba(10, 42, 107, 0.20);
          padding: 4px;
          z-index: 10;
          max-height: 280px;
          overflow-y: auto;
        }
        .raf-uni-item {
          appearance: none;
          background: transparent;
          border: none;
          width: 100%;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--lq-ink-2);
          text-align: left;
          transition: background 120ms ease, color 120ms ease;
        }
        .raf-uni-item:hover { background: rgba(10, 42, 107, 0.04); color: var(--lq-ink); }
        .raf-uni-item-check {
          flex-shrink: 0;
          width: 16px;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--launch-navy);
        }
        .raf-uni-item.is-on { color: var(--launch-navy); font-weight: 600; }
      `}</style>
    </div>
  )
}

function SegmentedToggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="raf-seg-wrap" aria-label={label}>
      <div className="raf-seg">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={value === o.value ? 'is-on' : ''}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <style>{`
        .raf-seg {
          display: inline-flex;
          background: rgba(10, 42, 107, 0.04);
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          padding: 3px;
        }
        .raf-seg button {
          appearance: none;
          background: transparent;
          border: none;
          padding: 7px 14px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 12px;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
        }
        .raf-seg button:hover:not(.is-on) { color: var(--lq-ink); }
        .raf-seg button.is-on {
          background: var(--launch-navy);
          color: var(--lq-cream);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
