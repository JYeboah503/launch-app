'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StudentCapabilityScores } from '@/components/student-capability-scores'
import { CandidateName } from '@/components/candidate-name'
import type { Submission } from '@/lib/submissionStore'

export interface StudentProfile {
  id: string
  name: string
  interests: string[]
  capabilities: Array<{ name: string; level: number; insight?: string }>
  bio?: string
  degree?: string
  atar?: number
  school?: string
}

interface StudentProfileViewProps {
  student: StudentProfile
  /** Original Submission, when the candidate came via an active scenario.
   *  Surfaces the raw answers to every pre-qualifier question + AI verdict
   *  so the partner can read what the candidate actually said. */
  submission?: Submission | null
  onContactClick?: () => void
  onChallengesClick?: () => void
  roleSkills?: string[]
  allStudentsData?: Array<{ id: string; name: string; capabilities: Array<{ name: string; level: number }> }>
}

export function StudentProfileView({
  student,
  submission,
  onContactClick,
  onChallengesClick,
  roleSkills,
  allStudentsData,
}: StudentProfileViewProps) {
  const [, setExpandedCapability] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="editorial-card p-8 space-y-5">
        <div>
          <div className="editorial-eyebrow mb-2">Candidate</div>
          <h1 className="editorial-display-sm"><CandidateName name={student.name} suffix="." /></h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {student.interests.map((interest) => (
            <span key={interest} className="editorial-chip editorial-chip-lime">
              {interest}
            </span>
          ))}
        </div>

        {(student.degree || student.atar || student.school) && (
          <div className="grid grid-cols-3 gap-6 pt-5 border-t border-[var(--lq-line)]">
            {student.degree && (
              <div>
                <div className="editorial-mono mb-2">Degree</div>
                <p
                  className="text-base"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}
                >
                  {student.degree}
                </p>
              </div>
            )}
            {student.atar && (
              <div>
                <div className="editorial-mono mb-2">ATAR</div>
                <p
                  className="text-base"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}
                >
                  {student.atar.toFixed(1)}
                </p>
              </div>
            )}
            {student.school && (
              <div>
                <div className="editorial-mono mb-2">School</div>
                <p
                  className="text-base"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}
                >
                  {student.school}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Summary */}
      {student.bio && (
        <div className="editorial-card p-8" style={{ background: 'linear-gradient(180deg, rgba(27, 158, 143,0.10), rgba(27, 158, 143,0.04))' }}>
          <div className="editorial-eyebrow mb-3">Launch summary</div>
          <p
            className="text-base leading-relaxed"
            style={{
              color: 'var(--lq-ink-2)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
            }}
          >
            {student.bio}
          </p>
        </div>
      )}

      {/* Intake answers — collapsible card. Closed by default so the
          partner sees the at-a-glance status badge first; click to drill
          into the raw responses. */}
      {submission && submission.intake && submission.intake.length > 0 && (
        <IntakeAnswersCard submission={submission} />
      )}

      {/* Decision path — the candidate's journey through the scenario.
          Vertical sequence of questions; each shows all three options
          with their pick highlighted. A connecting line traces the path
          they took from start → finish. */}
      {submission && submission.decisions && submission.decisions.some(d => d.options && d.options.length > 0) && (
        <DecisionPathCard submission={submission} />
      )}

      {/* Capability Scores */}
      {student.capabilities && student.capabilities.length > 0 && (
        <StudentCapabilityScores
          student={student as any}
          roleSkills={roleSkills}
          allStudentsData={allStudentsData}
        />
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button onClick={() => onContactClick?.()} size="lg" className="w-full">
          Contact via LAUNCH →
        </Button>
        <Button
          onClick={() => onChallengesClick?.()}
          size="lg"
          variant="outline"
          className="w-full"
        >
          View challenges
        </Button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   IntakeAnswersCard — collapsible card showing every pre-qualifier
   question + the candidate's raw answer + AI verdict. Closed by
   default so the partner sees the status badge first; click to drill.
   ────────────────────────────────────────────────────────────────── */
function IntakeAnswersCard({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false)
  const flaggedCount = submission.intake.filter((v) => v.belowBenchmark === true).length

  return (
    <div className="editorial-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 flex-wrap transition-colors hover:bg-[var(--corp-canvas)]"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="editorial-eyebrow mb-1">Pre-qualifier answers</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17, color: 'var(--lq-ink)' }}>
              {submission.intake.length} question{submission.intake.length === 1 ? '' : 's'} answered
            </span>
            {flaggedCount > 0 && (
              <span className="editorial-mono" style={{ color: '#7a0e2a', fontSize: 11, letterSpacing: '0.14em' }}>
                {flaggedCount} flagged
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="editorial-mono px-3 py-1 rounded-full"
            style={{
              background: submission.notQualified ? 'rgba(122, 14, 42, 0.10)' : 'rgba(27, 158, 143, 0.14)',
              color: submission.notQualified ? '#7a0e2a' : 'var(--launch-teal-3)',
              fontSize: 10,
              letterSpacing: '0.14em',
              fontWeight: 700,
            }}
          >
            {submission.notQualified ? 'Below benchmark' : 'Passed pre-quals'}
          </span>
          <span
            className="editorial-mono"
            style={{
              fontSize: 14,
              color: 'var(--lq-ink-3)',
              transition: 'transform 200ms ease',
              display: 'inline-block',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-[var(--lq-line)] space-y-3">
          {submission.intake.map((v, i) => {
            const flagged = v.belowBenchmark === true
            return (
              <div
                key={v.questionId || i}
                className="rounded-lg p-4"
                style={{
                  background: flagged ? 'rgba(122, 14, 42, 0.04)' : '#fff',
                  border: `1px solid ${flagged ? 'rgba(122, 14, 42, 0.18)' : 'var(--lq-line)'}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                  <div className="text-sm flex-1 min-w-0" style={{ color: 'var(--lq-ink-2)' }}>
                    <span className="editorial-mono mr-2" style={{ color: 'var(--lq-ink-3)' }}>Q{i + 1}.</span>
                    {v.prompt}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="editorial-mono"
                      style={{ color: flagged ? '#7a0e2a' : 'var(--launch-navy)', fontWeight: 700, fontSize: 12 }}
                    >
                      {v.overall}/10
                    </span>
                    {flagged && (
                      <span
                        className="editorial-mono px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(122, 14, 42, 0.10)', color: '#7a0e2a', fontSize: 9, letterSpacing: '0.14em', fontWeight: 700 }}
                      >
                        Flagged
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="text-sm pt-2 mt-2 border-t"
                  style={{ borderColor: 'var(--lq-line)', color: 'var(--lq-ink)' }}
                >
                  {v.answer
                    ? <span style={{ fontFamily: 'var(--font-display)', fontStyle: v.kind === 'open-text' ? 'italic' : 'normal' }}>“{v.answer}”</span>
                    : <em style={{ color: 'var(--lq-ink-3)' }}>— (no answer recorded)</em>
                  }
                </div>
                {v.oneLiner && (
                  <div className="text-xs mt-2" style={{ color: 'var(--lq-ink-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>VERDICT · </span>
                    {v.oneLiner}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   DecisionPathCard — vertical sequence of scenario decisions, each
   showing all three options with the candidate's pick highlighted.
   A navy line traces between the picked options from start → finish
   so the partner can see the literal path through the scenario.
   ────────────────────────────────────────────────────────────────── */
function DecisionPathCard({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false)
  const steps = submission.decisions.filter((d) => d.options && d.options.length > 0)
  if (steps.length === 0) return null

  return (
    <div className="editorial-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 flex-wrap transition-colors hover:bg-[var(--corp-canvas)]"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="editorial-eyebrow mb-1">Decision path</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17, color: 'var(--lq-ink)' }}>
              {steps.length} decision{steps.length === 1 ? '' : 's'} · path through the scenario
            </span>
          </div>
        </div>
        <span
          className="editorial-mono"
          style={{
            fontSize: 14,
            color: 'var(--lq-ink-3)',
            transition: 'transform 200ms ease',
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-4 border-t border-[var(--lq-line)]">
          <div className="dp-stack">
            {steps.map((d, idx) => {
              const pickedIdx = (d.options || []).findIndex((o) => o.picked)
              return (
                <div key={idx} className="dp-step">
                  <div className="dp-step-head">
                    <span className="dp-step-num">Q{idx + 1}</span>
                    {d.skill && <span className="dp-step-skill">Tests · {d.skill}</span>}
                  </div>
                  <p className="dp-prompt">{d.prompt}</p>
                  <div className="dp-options" data-picked-idx={pickedIdx >= 0 ? pickedIdx : ''}>
                    {(d.options || []).map((o, oi) => (
                      <div
                        key={o.id}
                        className={`dp-option ${o.picked ? 'is-picked' : ''}`}
                      >
                        <span className="dp-option-letter">{String.fromCharCode(65 + oi)}</span>
                        <span className="dp-option-text">{o.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p
            className="text-xs mt-6 text-center"
            style={{ color: 'var(--lq-ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            ▼ End of scenario
          </p>
        </div>
      )}

      <style>{`
        .dp-stack {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dp-step { position: relative; }
        .dp-step-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .dp-step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--launch-navy);
          color: var(--lq-cream);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .dp-step-skill {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          font-weight: 600;
        }
        .dp-prompt {
          margin: 0 0 12px 0;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 15px;
          line-height: 1.45;
          color: var(--lq-ink);
          max-width: 64ch;
        }
        .dp-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .dp-option {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid var(--lq-line);
          border-radius: 10px;
          background: #fff;
          transition: background 160ms ease, border-color 160ms ease;
        }
        .dp-option.is-picked {
          background: rgba(10, 42, 107, 0.05);
          border-color: var(--launch-navy);
        }
        .dp-option-letter {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: rgba(10, 42, 107, 0.08);
          color: var(--lq-ink-3);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          margin-top: 1px;
        }
        .dp-option.is-picked .dp-option-letter {
          background: var(--launch-navy);
          color: var(--lq-cream);
        }
        .dp-option-text {
          font-size: 13px;
          line-height: 1.5;
          color: var(--lq-ink);
        }
        .dp-option.is-picked .dp-option-text { font-weight: 500; }

        /* The connecting LINE — drops down from each step's picked option
           to the next step's Q-number circle. Implemented per-step as a
           single navy stripe positioned over the picked option's letter
           anchor so the path traces visually through the scenario. */
        .dp-step::after {
          content: '';
          position: absolute;
          left: 15px;             /* aligned to the Q-number circle centre */
          bottom: -24px;          /* spans the gap to next step */
          width: 2px;
          height: 24px;
          background: var(--launch-navy);
          opacity: 0.55;
        }
        .dp-step:last-of-type::after {
          height: 12px;           /* short tail into the "End of scenario" bookend */
          opacity: 0.35;
        }
      `}</style>
    </div>
  )
}
