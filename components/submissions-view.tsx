'use client'

/**
 * Corporate "Submissions" surface — shows every candidate submission
 * that's come in through scenario access codes, with their intake
 * answers + AI verdict scores so the org can scan and filter.
 *
 * Reads from lib/submissionStore.ts (localStorage-backed).
 */

import { useEffect, useMemo, useState } from 'react'
import { listSubmissions, type Submission } from '@/lib/submissionStore'
import { CAPABILITIES } from '@/lib/builderData'
import { Search, X, Bookmark, BookmarkPlus, Trash2 } from 'lucide-react'
import {
  listViews,
  saveView,
  deleteView,
  filtersMatch,
  type SavedView,
} from '@/lib/savedViewsStore'

export function SubmissionsView() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  // ---- Filters ----
  const [minScore, setMinScore] = useState<number>(0)
  const [hideNotQualified, setHideNotQualified] = useState<boolean>(false)
  const [capabilityFilter, setCapabilityFilter] = useState<string[]>([])
  const [keyword, setKeyword] = useState<string>('')

  // ---- Saved views ----
  const [views, setViews] = useState<SavedView[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')

  useEffect(() => {
    setSubmissions(listSubmissions())
    setViews(listViews())
  }, [refreshTick])

  const currentFilters = { minScore, hideNotQualified, capabilityFilter, keyword }
  const activeViewId = views.find((v) => filtersMatch(v.filters, currentFilters))?.id || null

  const applyView = (v: SavedView) => {
    setMinScore(v.filters.minScore)
    setHideNotQualified(v.filters.hideNotQualified)
    setCapabilityFilter([...v.filters.capabilityFilter])
    setKeyword(v.filters.keyword)
  }
  const removeView = (id: string) => {
    deleteView(id)
    setViews(listViews())
  }
  const handleSave = () => {
    if (!saveName.trim()) return
    saveView(saveName, currentFilters)
    setViews(listViews())
    setSaveName('')
    setShowSaveModal(false)
  }

  /** Score on a submission for filter purposes — average across open-text only. */
  const scoreFor = (s: Submission): number | null => {
    const scored = s.intake.filter((v) => v.kind !== 'hard-filter')
    if (scored.length === 0) return null
    return Math.round(scored.reduce((n, v) => n + v.overall, 0) / scored.length)
  }

  /** Which capabilities a candidate "tested strong on" — based on decisions
   *  they made + the capability tagged on each decision. */
  const strongCapsFor = (s: Submission): Set<string> => {
    const out = new Set<string>()
    s.decisions.forEach((d) => { if (d.skill) out.add(d.skill) })
    return out
  }

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return submissions.filter((s) => {
      const score = scoreFor(s)
      if (score !== null && score < minScore) return false
      if (hideNotQualified && s.notQualified) return false
      if (capabilityFilter.length > 0) {
        const strong = strongCapsFor(s)
        const any = capabilityFilter.some((c) => strong.has(c))
        if (!any) return false
      }
      if (k) {
        const corpus = [
          s.candidateName,
          s.scenarioTitle,
          s.scenarioCode,
          ...s.intake.map((v) => `${v.prompt} ${v.answer}`),
        ].join(' ').toLowerCase()
        if (!corpus.includes(k)) return false
      }
      return true
    })
  }, [submissions, minScore, hideNotQualified, capabilityFilter, keyword])

  const totalCount = submissions.length
  const filteredCount = filtered.length
  const activeFilterCount = (minScore > 0 ? 1 : 0) + (hideNotQualified ? 1 : 0) + (capabilityFilter.length > 0 ? 1 : 0) + (keyword.trim() ? 1 : 0)

  const clearAll = () => {
    setMinScore(0)
    setHideNotQualified(false)
    setCapabilityFilter([])
    setKeyword('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2
          className="editorial-display-sm"
          style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', color: 'var(--lq-ink)' }}
        >
          Submissions
        </h2>
        <div className="flex items-center gap-3">
          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
            {activeFilterCount > 0
              ? `${filteredCount} / ${totalCount} submission${totalCount === 1 ? '' : 's'}`
              : `${totalCount} submission${totalCount === 1 ? '' : 's'}`}
          </span>
          <button
            type="button"
            onClick={() => setRefreshTick((n) => n + 1)}
            className="corp-btn corp-btn-ghost"
          >
            Refresh
          </button>
        </div>
      </div>

      <p
        className="mb-6"
        style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55, maxWidth: '60ch' }}
      >
        Every candidate who enters a scenario access code lands here with
        their intake answers + an AI verdict per question. Filter to find
        the shortlist; tap a card to see the full answers and per-criterion
        scores.
      </p>

      {/* ---- Saved views strip ---- */}
      {views.length > 0 && (
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Bookmark className="w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />
          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)', marginRight: 4 }}>Saved views</span>
          {views.map((v) => {
            const isActive = activeViewId === v.id
            return (
              <div
                key={v.id}
                className="inline-flex items-center"
                style={{
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--launch-navy)' : 'var(--lq-line-2)',
                  background: isActive ? 'var(--launch-navy)' : '#fff',
                  color: isActive ? 'var(--lq-cream)' : 'var(--lq-ink-2)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => applyView(v)}
                  style={{
                    appearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {v.name}
                </button>
                <button
                  type="button"
                  onClick={() => removeView(v.id)}
                  aria-label={`Delete view ${v.name}`}
                  title="Delete view"
                  style={{
                    appearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 10px 6px 0',
                    color: 'inherit',
                    cursor: 'pointer',
                    opacity: 0.7,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ---- Filters ---- */}
      <div className="corp-card mb-6" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>Filters</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {activeFilterCount > 0 && !activeViewId && (
              <button
                type="button"
                className="editorial-mono"
                style={{ background: 'transparent', border: '1px solid var(--lq-line-2)', borderRadius: 999, padding: '5px 12px', color: 'var(--launch-teal-3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => { setSaveName(''); setShowSaveModal(true) }}
                title="Save the current filter combination as a named view"
              >
                <BookmarkPlus className="w-3 h-3" /> Save as view
              </button>
            )}
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="editorial-mono"
                style={{ background: 'transparent', border: 'none', color: 'var(--launch-navy)', cursor: 'pointer' }}
                onClick={clearAll}
              >
                Clear all <X className="w-3 h-3" style={{ display: 'inline', marginLeft: 4 }} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          {/* Keyword search */}
          <div style={{ position: 'relative' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--lq-ink-3)' }} />
            <input
              className="w-full"
              style={{ padding: '10px 14px 10px 36px', borderRadius: 10, border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)', outline: 'none' }}
              placeholder="Search intake answers, candidate name, scenario title…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* Score range */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>Minimum AI score</span>
              <span className="editorial-mono" style={{ color: 'var(--launch-navy)', fontWeight: 600 }}>{minScore}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--launch-navy)' }}
            />
          </div>

          {/* Not-qualified toggle */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hideNotQualified}
              onChange={(e) => setHideNotQualified(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--launch-navy)' }}
            />
            <span style={{ color: 'var(--lq-ink-2)', fontSize: 14 }}>Hide candidates flagged Not qualified</span>
          </label>

          {/* Capability strength */}
          <div>
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)', display: 'block', marginBottom: 6 }}>
              Strong in capability {capabilityFilter.length > 0 ? `· ${capabilityFilter.length} selected` : '(pick any)'}
            </span>
            <div>
              {CAPABILITIES.map((c) => {
                const on = capabilityFilter.includes(c.name)
                return (
                  <button
                    key={c.key}
                    type="button"
                    className="b2-criterion"
                    style={on
                      ? { background: 'var(--launch-navy)', color: 'var(--lq-cream)', borderColor: 'var(--launch-navy)', fontWeight: 600 }
                      : undefined}
                    onClick={() => setCapabilityFilter((prev) => prev.includes(c.name) ? prev.filter((x) => x !== c.name) : [...prev, c.name])}
                    title={c.measure}
                  >
                    {c.short}
                  </button>
                )
              })}
            </div>
            <p style={{ color: 'var(--lq-ink-3)', fontSize: 12, marginTop: 6 }}>
              Matches candidates who showed strength on at least one of the picked capabilities during the scenario.
            </p>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="corp-card p-12 text-center">
          <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
            No submissions yet
          </div>
          <p style={{ color: 'var(--lq-ink-2)', maxWidth: '48ch', margin: '0 auto' }}>
            Share a scenario access code with a candidate. As soon as they
            answer the intake questions, their submission appears here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="corp-card p-12 text-center">
          <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
            No matches
          </div>
          <p style={{ color: 'var(--lq-ink-2)', maxWidth: '48ch', margin: '0 auto 16px' }}>
            None of your {totalCount} submission{totalCount === 1 ? '' : 's'} match the current filters.
          </p>
          <button type="button" className="corp-btn corp-btn-ghost" onClick={clearAll}>Clear filters</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const isOpen = expanded === s.id
            // Average only across open-text (AI-scored) verdicts. Hard
            // filters are pass/fail, not a 0–10 axis — mixing them muddies
            // the headline number.
            const scoredVerdicts = s.intake.filter((v) => v.kind !== 'hard-filter')
            const intakeAvg = scoredVerdicts.length
              ? Math.round(
                  scoredVerdicts.reduce((n, v) => n + v.overall, 0) / scoredVerdicts.length,
                )
              : null
            const tone =
              intakeAvg === null
                ? 'neutral'
                : intakeAvg >= 8
                  ? 'strong'
                  : intakeAvg >= 5
                    ? 'ok'
                    : 'weak'
            return (
              <article key={s.id} className="corp-card p-5">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full text-left flex items-center justify-between gap-4 flex-wrap"
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="editorial-mono mb-1" style={{ color: 'var(--lq-ink-3)' }}>
                      {new Date(s.submittedAt).toLocaleString()} ·{' '}
                      {s.variant === 'professional' ? 'Advanced career' : 'Early career'}
                    </div>
                    <h3
                      className="truncate"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        fontSize: 18,
                        color: 'var(--lq-ink)',
                      }}
                    >
                      {s.candidateName} <span style={{ color: 'var(--lq-ink-3)' }}>·</span>{' '}
                      <span style={{ color: 'var(--lq-ink-2)' }}>{s.scenarioTitle}</span>
                    </h3>
                    <div className="editorial-mono mt-1" style={{ color: 'var(--lq-ink-3)' }}>
                      Code · {s.scenarioCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {s.notQualified && (() => {
                      // Disambiguate WHY they're flagged so the partner sees
                      // "Below benchmark" (open-text score missed) vs the
                      // original "Not qualified" (hard-filter wrong answer).
                      const failedKinds = new Set(
                        (s.intake || [])
                          .filter(v => v.belowBenchmark === true)
                          .map(v => v.kind)
                      )
                      const onlyOpen = failedKinds.has('open-text') && !failedKinds.has('hard-filter')
                      const label = onlyOpen ? 'Below benchmark' : 'Not qualified'
                      const title = onlyOpen
                        ? 'One or more open-text answers fell below the partner-set minimum score.'
                        : 'Failed one or more pre-qualifier benchmarks (hard filter or open-text minimum score).'
                      return (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(122, 14, 42, 0.10)',
                          color: '#7a0e2a',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                        title={title}
                      >
                        {label}
                      </span>
                    )})()}
                    {intakeAvg !== null && (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{
                          background:
                            tone === 'strong'
                              ? 'var(--launch-teal-soft)'
                              : tone === 'ok'
                                ? 'rgba(10, 42, 107, 0.08)'
                                : 'rgba(122, 14, 42, 0.10)',
                          color:
                            tone === 'strong'
                              ? 'var(--launch-teal-3)'
                              : tone === 'ok'
                                ? 'var(--launch-navy)'
                                : '#7a0e2a',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        AI {intakeAvg}/10
                      </span>
                    )}
                    <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                      {isOpen ? 'Hide ↑' : 'Show ↓'}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-[var(--lq-line)]">
                    {s.intake.length === 0 ? (
                      <p style={{ color: 'var(--lq-ink-3)' }}>
                        No intake questions were attached to this scenario.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {s.intake.map((v) => {
                          const isFilter = v.kind === 'hard-filter'
                          const filterPass = isFilter && v.qualified === true
                          const filterFail = isFilter && v.qualified === false
                          const vTone = isFilter
                            ? (filterPass ? 'strong' : 'weak')
                            : v.overall >= 8 ? 'strong' : v.overall >= 5 ? 'ok' : 'weak'
                          const badge = isFilter
                            ? (filterPass ? 'Meets' : 'Doesn’t meet')
                            : `${v.overall}/10`
                          return (
                            <div
                              key={v.questionId}
                              className="p-4 rounded-lg"
                              style={{
                                background: 'rgba(10, 42, 107, 0.03)',
                                border: '1px solid var(--lq-line)',
                              }}
                            >
                              <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                                <div
                                  style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: 'var(--lq-ink)',
                                  }}
                                >
                                  {isFilter && (
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lq-ink-3)', marginRight: 8 }}>
                                      Hard filter
                                    </span>
                                  )}
                                  {v.prompt}
                                </div>
                                <span
                                  className="inline-flex items-center px-2.5 py-1 rounded-full"
                                  style={{
                                    background:
                                      vTone === 'strong'
                                        ? 'var(--launch-teal-soft)'
                                        : vTone === 'ok'
                                          ? 'rgba(10, 42, 107, 0.08)'
                                          : 'rgba(122, 14, 42, 0.10)',
                                    color:
                                      vTone === 'strong'
                                        ? 'var(--launch-teal-3)'
                                        : vTone === 'ok'
                                          ? 'var(--launch-navy)'
                                          : '#7a0e2a',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                  }}
                                >
                                  {badge}
                                </span>
                              </div>
                              <p
                                className="mb-3"
                                style={{
                                  color: 'var(--lq-ink-2)',
                                  fontSize: 14,
                                  lineHeight: 1.55,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {v.answer || (
                                  <span style={{ color: 'var(--lq-ink-3)', fontStyle: 'italic' }}>
                                    Candidate left this blank.
                                  </span>
                                )}
                              </p>
                              <p
                                className="editorial-mono mb-2"
                                style={{ color: 'var(--launch-teal-3)' }}
                              >
                                {v.kind === 'hard-filter' ? 'Filter' : 'AI'} · {v.oneLiner}
                              </p>
                              {v.criteria.length > 0 && (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                  {v.criteria.map((c) => (
                                    <li
                                      key={c.criterionId}
                                      className="flex items-baseline gap-3 py-1"
                                    >
                                      <span
                                        style={{
                                          fontFamily: 'var(--font-mono)',
                                          fontSize: 11,
                                          color: 'var(--lq-ink-3)',
                                          minWidth: 28,
                                        }}
                                      >
                                        {c.score}/10
                                      </span>
                                      <span style={{ flex: 1, color: 'var(--lq-ink-2)', fontSize: 13 }}>
                                        <strong style={{ color: 'var(--lq-ink)' }}>{c.criterionLabel}.</strong>{' '}
                                        {c.rationale}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* ---- Save as view modal ---- */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="corp-card w-full max-w-md"
            style={{ padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="editorial-mono mb-2" style={{ color: 'var(--launch-teal-3)' }}>
              New saved view
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: '-0.015em',
                color: 'var(--lq-ink)',
                margin: 0,
              }}
            >
              Name this view.
            </h3>
            <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, lineHeight: 1.5, marginTop: 6, marginBottom: 16 }}>
              We'll remember the current filters under this name. Click it any
              time to load them back in.
            </p>
            <label className="editorial-mono" style={{ color: 'var(--lq-ink-3)', display: 'block', marginBottom: 6 }}>
              View name
            </label>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              placeholder="e.g. NSW grad shortlist · Strong communication · Top scores"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--lq-line-2)',
                background: '#fff',
                color: 'var(--lq-ink)',
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                outline: 'none',
              }}
            />
            {/* Summary of what's being saved */}
            <div style={{ marginTop: 14, padding: 12, background: 'rgba(10, 42, 107, 0.04)', borderRadius: 8 }}>
              <div className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>You're saving</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--lq-ink-2)' }}>
                {minScore > 0 && <li>Minimum AI score · {minScore}/10</li>}
                {hideNotQualified && <li>Hiding flagged Not qualified</li>}
                {capabilityFilter.length > 0 && <li>Strong in · {capabilityFilter.join(', ')}</li>}
                {keyword.trim() && <li>Keyword · "{keyword.trim()}"</li>}
                {activeFilterCount === 0 && <li style={{ fontStyle: 'italic' }}>Nothing yet — set some filters first.</li>}
              </ul>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" className="corp-btn corp-btn-ghost" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="corp-btn corp-btn-primary"
                onClick={handleSave}
                disabled={!saveName.trim() || activeFilterCount === 0}
              >
                Save view
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
