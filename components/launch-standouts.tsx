'use client'

import type { Student } from '@/components/student-list'
import { RevealOnScroll } from '@/components/motion'

interface LaunchStandoutsProps {
  students: Student[]
  onSelectStudent: (studentId: string) => void
}

export function LaunchStandouts({ students, onSelectStudent }: LaunchStandoutsProps) {
  const standouts = students.slice(0, 6)

  if (standouts.length === 0) {
    return (
      <section className="section-pad-sm">
        <div className="editorial-container">
          <div className="corp-card p-12 text-center">
            <div className="editorial-eyebrow mb-3" style={{ color: 'var(--lq-ink-3)' }}>No matches</div>
            <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>
              No candidates match the current filters. Try widening your view.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-pad-sm">
      <div className="editorial-container">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="editorial-eyebrow mb-2">Standouts · this week</div>
            <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>
              Surfaced by their decision pattern.
            </h2>
          </div>
          <span className="editorial-mono">{standouts.length} of {students.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standouts.map((student, idx) => {
            const top = student.topCapabilities[0]
            const others = student.topCapabilities.slice(1, 3)
            return (
              <RevealOnScroll key={student.id} delay={idx * 70} y={20}>
              <article
                role="button"
                tabIndex={0}
                onClick={() => onSelectStudent(student.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectStudent(student.id) }}
                className="corp-card relative overflow-hidden p-7 flex flex-col gap-5 cursor-pointer group h-full"
              >
                {/* Mono header line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="editorial-mono">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                      · {student.degree || 'Candidate'}
                    </span>
                  </div>
                  <span aria-hidden className="inline-block rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ width: 8, height: 8, background: 'var(--launch-navy)' }} />
                </div>

                {/* Name */}
                <div>
                  <h3
                    className="text-2xl mb-2 leading-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      letterSpacing: '-0.018em',
                    }}
                  >
                    {student.name}
                  </h3>
                  <div className="flex items-baseline gap-3">
                    {student.atar && (
                      <span className="editorial-mono">
                        ATAR · {student.atar.toFixed(1)}
                      </span>
                    )}
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--launch-navy)',
                        fontWeight: 500,
                      }}
                    >
                      {Math.round(student.overallScore)}
                      <span
                        className="ml-1 text-xs"
                        style={{ color: 'var(--lq-ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
                      >
                        OVERALL
                      </span>
                    </span>
                  </div>
                </div>

                {/* Interests */}
                {student.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {student.interests.slice(0, 3).map((interest) => (
                      <span key={interest} className="editorial-chip">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Top capability — bar + label */}
                {top && (
                  <div className="pt-4 border-t border-[var(--lq-line)]">
                    <div className="editorial-mono mb-2">Excelling in</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[3px] rounded-full bg-[var(--lq-line)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(0, Math.min(100, top.level))}%`,
                            background: 'linear-gradient(90deg, var(--launch-navy), var(--launch-navy-2))',
                          }}
                        />
                      </div>
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: 'var(--lq-ink)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {top.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Other strengths */}
                {others.length > 0 && (
                  <div>
                    <div className="editorial-mono mb-2">Other strengths</div>
                    <div className="space-y-1.5">
                      {others.map((cap, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--lq-ink-2)' }}>
                          <span
                            className="inline-block w-1 h-1 rounded-full"
                            style={{ background: 'var(--launch-navy)' }}
                            aria-hidden
                          />
                          {cap.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
