'use client'

import { useMemo, useState } from 'react'
import type { Classroom } from '@/lib/roles'
import { MOCK_STUDENTS } from '@/lib/mock-data'
import { SCENARIOS, getSampleScenarioById } from '@/lib/play/sampleScenarios'
import { Search, X, Copy, Check } from 'lucide-react'

interface ClassroomDetailProps {
  classroom: Classroom
  onBack: () => void
  onUpdate: (patch: Partial<Classroom>) => void
  onDelete?: () => void
  /** Called when the teacher chooses "Build my own" — parent opens ScenarioBuilder. */
  onBuildScenario?: () => void
}

/**
 * Teacher → classroom detail. Three sections: Students · Scenarios · Performance.
 * Shares the warm school-friendly register from the teacher home (the parent
 * mounts `.teacher-*` styles, which we reuse here).
 */
export function ClassroomDetail({ classroom, onBack, onUpdate, onDelete, onBuildScenario }: ClassroomDetailProps) {
  const [enrolOpen, setEnrolOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  // Resolve enrolled students from MOCK_STUDENTS by id.
  const enrolled = useMemo(
    () => classroom.studentIds
      .map((id) => MOCK_STUDENTS.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [classroom.studentIds]
  )

  // Resolve assigned scenarios from the sample library by id. (Builder-emitted
  // ids won't resolve here yet — that lands when we wire the builder pipeline.)
  const assigned = useMemo(
    () => classroom.scenarioIds
      .map((id) => getSampleScenarioById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [classroom.scenarioIds]
  )

  // Class-scoped performance: average overall score + most common top capability.
  const avgScore = enrolled.length
    ? Math.round(enrolled.reduce((n, s) => n + s.overallScore, 0) / enrolled.length)
    : 0
  const topCapability = useMemo(() => {
    if (enrolled.length === 0) return '—'
    const counts: Record<string, number> = {}
    enrolled.forEach((s) => {
      const t = s.topCapabilities[0]?.name
      if (t) counts[t] = (counts[t] || 0) + 1
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] || '—'
  }, [enrolled])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const enrolStudents = (ids: string[]) => {
    const merged = Array.from(new Set([...classroom.studentIds, ...ids]))
    onUpdate({ studentIds: merged })
  }
  const removeStudent = (id: string) => {
    onUpdate({ studentIds: classroom.studentIds.filter((sid) => sid !== id) })
  }

  const assignScenario = (id: string) => {
    if (classroom.scenarioIds.includes(id)) return
    onUpdate({ scenarioIds: [...classroom.scenarioIds, id] })
  }
  const removeScenario = (id: string) => {
    onUpdate({ scenarioIds: classroom.scenarioIds.filter((sid) => sid !== id) })
  }

  return (
    <>
      {/* Back link + classroom header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="editorial-mono inline-flex items-center gap-2 mb-6"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          ← Back to classrooms
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            {classroom.subject && (
              <div className="editorial-mono mb-2" style={{ color: 'var(--launch-lime-3)' }}>
                {classroom.subject}
              </div>
            )}
            <h1
              className="mb-3 max-w-[24ch]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 48px)',
                letterSpacing: '-0.024em',
                lineHeight: 1.05,
                color: 'var(--lq-ink)',
              }}
            >
              {classroom.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={copyCode}
                className="teacher-codepill"
                title="Copy class code"
              >
                <span style={{ color: 'var(--lq-ink-3)' }}>Class code</span>
                <span style={{ color: 'var(--launch-lime-3)', fontWeight: 600 }}>{classroom.code}</span>
                {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                {enrolled.length} student{enrolled.length === 1 ? '' : 's'} · {assigned.length} scenario{assigned.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${classroom.name}"? This can't be undone.`)) onDelete()
              }}
              className="teacher-btn teacher-btn-ghost"
              style={{ color: '#7a0e2a' }}
            >
              Delete class
            </button>
          )}
        </div>
      </div>

      {/* Performance — small KPI strip first so teachers see the pulse */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Average score', value: enrolled.length ? avgScore : '—' },
          { label: 'Most-trending capability', value: topCapability, isLong: true },
          { label: 'Scenarios live', value: assigned.length },
        ].map((s) => (
          <div key={s.label} className="teacher-stat">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: s.isLong ? 'clamp(18px, 2vw, 22px)' : 'clamp(28px, 3vw, 40px)',
                letterSpacing: '-0.02em',
                color: 'var(--lq-ink)',
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div className="editorial-mono mt-2" style={{ color: 'var(--lq-ink-3)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Students section */}
      <Section
        title="Students"
        count={enrolled.length}
        emptyHint="Hand out the code or hand-pick from the roster."
        action={
          <button type="button" onClick={() => setEnrolOpen(true)} className="teacher-btn teacher-btn-primary">
            + Enrol students
          </button>
        }
        items={enrolled.length}
      >
        {enrolled.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrolled.map((s) => (
              <div key={s.id} className="teacher-card teacher-card-tight flex items-start justify-between">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--lq-ink)' }}>{s.name}</div>
                  <div className="editorial-mono mt-1" style={{ color: 'var(--lq-ink-3)' }}>
                    {s.degree || 'Student'} · score {Math.round(s.overallScore)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStudent(s.id)}
                  aria-label={`Remove ${s.name}`}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--lq-ink-3)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Scenarios section */}
      <Section
        title="Scenarios"
        count={assigned.length}
        emptyHint="Pick from the library or build your own."
        action={
          <button type="button" onClick={() => setAssignOpen(true)} className="teacher-btn teacher-btn-primary">
            + Assign scenario
          </button>
        }
        items={assigned.length}
      >
        {assigned.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assigned.map((s) => (
              <article key={s.id} className="teacher-card teacher-card-tight">
                <div className="flex items-start justify-between mb-2">
                  <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                    Scenario
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScenario(s.id)}
                    aria-label="Remove scenario"
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--lq-ink-3)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: 1.2,
                    color: 'var(--lq-ink)',
                  }}
                >
                  {s.role}
                </h3>
                <div className="editorial-mono line-clamp-1" style={{ color: 'var(--lq-ink-3)' }}>
                  {s.meta}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* Enrol modal */}
      {enrolOpen && (
        <EnrolModal
          classroomName={classroom.name}
          code={classroom.code}
          alreadyEnrolledIds={classroom.studentIds}
          onClose={() => setEnrolOpen(false)}
          onEnrol={(ids) => {
            enrolStudents(ids)
            setEnrolOpen(false)
          }}
        />
      )}

      {/* Assign-scenario modal */}
      {assignOpen && (
        <AssignModal
          alreadyAssignedIds={classroom.scenarioIds}
          onClose={() => setAssignOpen(false)}
          onAssign={(id) => {
            assignScenario(id)
            setAssignOpen(false)
          }}
          onBuild={onBuildScenario ? () => {
            setAssignOpen(false)
            onBuildScenario()
          } : undefined}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  title,
  count,
  emptyHint,
  action,
  items,
  children,
}: {
  title: string
  count: number
  emptyHint: string
  action?: React.ReactNode
  items: number
  children: React.ReactNode
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 border-t border-[var(--lq-line)]">
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              letterSpacing: '-0.018em',
              color: 'var(--lq-ink)',
            }}
          >
            {title}
          </h2>
          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>{count}</span>
        </div>
        {action}
      </div>
      {items === 0 ? (
        <div className="teacher-card teacher-empty-small">
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              color: 'var(--lq-ink-2)',
              fontSize: 16,
              lineHeight: 1.5,
              textAlign: 'center',
              padding: '24px 12px',
            }}
          >
            {emptyHint}
          </p>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Enrol modal — code share + hand-pick                                */
/* ------------------------------------------------------------------ */

function EnrolModal({
  classroomName,
  code,
  alreadyEnrolledIds,
  onClose,
  onEnrol,
}: {
  classroomName: string
  code: string
  alreadyEnrolledIds: string[]
  onClose: () => void
  onEnrol: (ids: string[]) => void
}) {
  const [tab, setTab] = useState<'code' | 'pick'>('code')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_STUDENTS
      .filter((s) => !alreadyEnrolledIds.includes(s.id))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || (s.degree || '').toLowerCase().includes(q))
      .slice(0, 60)
  }, [search, alreadyEnrolledIds])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="teacher-card w-full max-w-2xl p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="editorial-mono mb-1" style={{ color: 'var(--launch-lime-3)' }}>
            Enrol students
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: '-0.015em',
              color: 'var(--lq-ink)',
            }}
          >
            {classroomName}
          </h2>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[var(--lq-line)]">
          {(['code', 'pick'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="teacher-tab"
              style={{
                color: tab === t ? 'var(--lq-ink)' : 'var(--lq-ink-3)',
                borderBottomColor: tab === t ? 'var(--launch-lime-2)' : 'transparent',
              }}
            >
              {t === 'code' ? 'Share code' : 'Hand-pick'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {tab === 'code' ? (
            <div className="p-6 text-center">
              <p
                className="mb-5 max-w-[40ch] mx-auto"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'var(--lq-ink-2)',
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                Give this code to your students. They&rsquo;ll enter it on their dashboard to join the class.
              </p>
              <div
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-3"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(27, 158, 143, 0.16), rgba(27, 158, 143, 0.06))',
                  border: '1px solid rgba(109, 182, 26, 0.32)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: 'clamp(22px, 3.2vw, 32px)',
                    letterSpacing: '0.06em',
                    color: 'var(--launch-lime-3)',
                  }}
                >
                  {code}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="teacher-btn teacher-btn-ghost"
                  style={{ padding: '6px 12px' }}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <p className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                Share via email, post it on the board, paste it in your LMS.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />
                <input
                  type="text"
                  placeholder="Search by name or degree..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="teacher-input w-full pl-9"
                />
              </div>
              {candidates.length === 0 ? (
                <p className="text-center py-10" style={{ color: 'var(--lq-ink-3)' }}>
                  No matching students.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {candidates.map((s) => {
                    const isSel = selected.has(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        className="teacher-pick-row"
                        style={
                          isSel
                            ? { borderColor: 'var(--launch-lime-2)', background: 'rgba(27, 158, 143, 0.10)' }
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="teacher-check"
                            style={
                              isSel
                                ? { background: 'var(--launch-lime)', borderColor: 'var(--launch-lime-2)' }
                                : undefined
                            }
                          >
                            {isSel && <Check className="w-3 h-3" style={{ color: 'var(--lq-ink)' }} />}
                          </span>
                          <span>
                            <span className="block font-semibold" style={{ color: 'var(--lq-ink)' }}>{s.name}</span>
                            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                              {s.degree || 'Student'} · {Math.round(s.overallScore)}
                            </span>
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--lq-line)] flex items-center justify-between gap-3">
          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
            {tab === 'pick' && selected.size > 0 ? `${selected.size} selected` : ' '}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="teacher-btn teacher-btn-ghost">
              {tab === 'code' ? 'Done' : 'Cancel'}
            </button>
            {tab === 'pick' && (
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={() => onEnrol(Array.from(selected))}
                className="teacher-btn teacher-btn-primary"
              >
                Enrol {selected.size > 0 ? selected.size : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal-local styles (small additions on top of teacher-* base) */}
      <style>{`
        .teacher-tab {
          flex: 1;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 200ms ease, border-color 200ms ease;
        }
        .teacher-card-tight {
          padding: 14px 16px;
        }
        .teacher-empty-small {
          padding: 8px 0;
        }
        .teacher-codepill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid var(--lq-line-2);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          cursor: pointer;
          transition: border-color 200ms ease, transform 200ms ease;
        }
        .teacher-codepill:hover {
          border-color: var(--launch-lime-2);
          transform: translateY(-1px);
        }
        .teacher-pick-row {
          text-align: left;
          padding: 10px 12px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid var(--lq-line);
          cursor: pointer;
          transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
        }
        .teacher-pick-row:hover {
          border-color: var(--launch-lime-2);
          transform: translateY(-1px);
        }
        .teacher-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 6px;
          border: 1.5px solid var(--lq-line-2);
          background: #ffffff;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Assign-scenario modal — Library + Build-your-own placeholder       */
/* ------------------------------------------------------------------ */

function AssignModal({
  alreadyAssignedIds,
  onClose,
  onAssign,
  onBuild,
}: {
  alreadyAssignedIds: string[]
  onClose: () => void
  onAssign: (id: string) => void
  onBuild?: () => void
}) {
  const [tab, setTab] = useState<'library' | 'build'>('library')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="teacher-card w-full max-w-3xl p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="editorial-mono mb-1" style={{ color: 'var(--launch-lime-3)' }}>
            Assign a scenario
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: '-0.015em',
              color: 'var(--lq-ink)',
            }}
          >
            Pick from the library or build your own.
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--lq-line)]">
          {(['library', 'build'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="teacher-tab"
              style={{
                color: tab === t ? 'var(--lq-ink)' : 'var(--lq-ink-3)',
                borderBottomColor: tab === t ? 'var(--launch-lime-2)' : 'transparent',
              }}
            >
              {t === 'library' ? 'Library' : 'Build my own'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {tab === 'library' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => {
                const already = alreadyAssignedIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={already}
                    onClick={() => onAssign(s.id)}
                    className="teacher-card teacher-lib-card text-left"
                    style={already ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  >
                    <div className="editorial-mono mb-2" style={{ color: 'var(--launch-lime-3)' }}>
                      {already ? 'Already assigned' : 'Library scenario'}
                    </div>
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        fontSize: 18,
                        lineHeight: 1.2,
                        color: 'var(--lq-ink)',
                      }}
                    >
                      {s.role}
                    </h3>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--lq-ink-2)', lineHeight: 1.5 }}
                    >
                      {s.opening.title}
                    </p>
                    <div className="mt-3 pt-3 border-t border-[var(--lq-line)] editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                      {s.steps.length} decisions · goal {s.goal.target}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p
                className="mx-auto mb-6"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'var(--lq-ink-2)',
                  fontSize: 18,
                  lineHeight: 1.5,
                  maxWidth: '42ch',
                }}
              >
                Author your own scenario from scratch — the same four-step
                builder, locked to the playful student experience. We&rsquo;ll
                attach the finished scenario to this classroom automatically.
              </p>
              <button
                type="button"
                onClick={onBuild}
                disabled={!onBuild}
                className="teacher-btn teacher-btn-primary"
                style={!onBuild ? { opacity: 0.55 } : undefined}
              >
                Open builder
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--lq-line)] flex justify-end">
          <button type="button" onClick={onClose} className="teacher-btn teacher-btn-ghost">
            Close
          </button>
        </div>
      </div>

      <style>{`
        .teacher-lib-card {
          padding: 18px 20px 20px;
          cursor: pointer;
          transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }
        .teacher-lib-card:hover:not(:disabled) {
          border-color: var(--launch-lime-2);
          box-shadow: 0 8px 22px rgba(60, 90, 14, 0.08);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}
