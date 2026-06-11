'use client'

/**
 * Corporate "Submissions" surface — shows every candidate submission
 * that's come in through scenario access codes, with their intake
 * answers + AI verdict scores so the org can scan and filter.
 *
 * Reads from lib/submissionStore.ts (localStorage-backed).
 */

import { useEffect, useState } from 'react'
import { listSubmissions, type Submission } from '@/lib/submissionStore'

export function SubmissionsView() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    setSubmissions(listSubmissions())
  }, [refreshTick])

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
            {submissions.length} submission{submissions.length === 1 ? '' : 's'}
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
        className="mb-8"
        style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55, maxWidth: '60ch' }}
      >
        Every candidate who enters a scenario access code lands here with
        their intake answers + an AI verdict per question. Tap a card to
        see the full answers and per-criterion scores.
      </p>

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
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isOpen = expanded === s.id
            const intakeAvg = s.intake.length
              ? Math.round(
                  s.intake.reduce((n, v) => n + v.overall, 0) / s.intake.length,
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
                          const vTone =
                            v.overall >= 8 ? 'strong' : v.overall >= 5 ? 'ok' : 'weak'
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
                                  {v.overall}/10
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
                                AI · {v.oneLiner}
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
    </div>
  )
}
