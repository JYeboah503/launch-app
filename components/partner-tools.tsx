'use client'

import { useState } from 'react'
import { X, ArrowUpRight } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { CandidateName } from '@/components/candidate-name'
import { RevealOnScroll } from '@/components/motion'

interface PartnerToolsProps {
  onToolSelect?: (tool: string, option: string) => void
  selectedTool?: { tool: string; option: string } | null
  students?: Student[]
  onSelectStudent?: (studentId: string) => void
}

export function PartnerTools({
  onToolSelect,
  selectedTool,
  students = [],
  onSelectStudent,
}: PartnerToolsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const tools = [
    {
      id: 'topCandidates',
      eyebrow: 'Volume',
      title: 'Top candidates this week',
      blurb: 'Surface the highest decision-quality cohort across every scenario.',
      options: ['Top 10', 'Top 20', 'Top 50', 'Top 100'],
    },
    {
      id: 'topByCapability',
      eyebrow: 'Capability',
      title: 'Top candidates by capability',
      blurb: 'Filter by the skill that actually matters for the role you\'re hiring.',
      options: [
        'Integrity & Ethics',
        'Reasoning & Critical Thinking',
        'Leadership & Influence',
        'Adaptability & Cognitive Flexibility',
        'Judgment & Decision-Making',
        'Situational Awareness & Systems Thinking',
      ],
    },
    {
      id: 'topByIndustry',
      eyebrow: 'Industry',
      title: 'Top candidates by industry',
      blurb: 'Cut by the domain context they\'ve been tested against.',
      options: ['Business', 'Finance', 'Technology', 'Law', 'Marketing', 'Consulting'],
    },
  ]

  const handleOptionSelect = (tool: string, option: string) => {
    setSelectedOption(option)
    onToolSelect?.(tool, option)
  }

  return (
    <>
      <div className="border-b border-[var(--lq-line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
            <div>
              <div className="editorial-eyebrow mb-2">Partner tools</div>
              <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>
                Cut the talent pool the way you actually want.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool, idx) => {
            const isSelected = selectedTool?.tool === tool.id
            const selectedTxt = isSelected ? selectedTool?.option : null
            return (
              <RevealOnScroll key={tool.id} delay={idx * 90} y={20}>
              <button
                onClick={() => setActiveModal(tool.id)}
                className={`corp-card relative overflow-hidden p-7 text-left w-full group ${
                  isSelected ? 'corp-card-selected' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="editorial-mono">{String(idx + 1).padStart(2, '0')} · {tool.eyebrow}</div>
                  <ArrowUpRight
                    className="w-4 h-4 transition-transform group-hover:-translate-y-[1px] group-hover:translate-x-[1px]"
                    style={{ color: 'var(--lq-ink-3)' }}
                  />
                </div>
                <h3
                  className="text-2xl mb-3"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.018em',
                    color: 'var(--lq-ink)',
                    lineHeight: 1.1,
                  }}
                >
                  {tool.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--lq-ink-2)' }}>
                  {tool.blurb}
                </p>
                {selectedTxt ? (
                  <span className="corp-chip">
                    Showing · {selectedTxt}
                  </span>
                ) : (
                  <span className="editorial-mono group-hover:translate-x-1 inline-block transition-transform" style={{ color: 'var(--lq-ink-3)' }}>Tap to filter →</span>
                )}
              </button>
              </RevealOnScroll>
            )
          })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            setActiveModal(null)
            setSelectedOption(null)
          }}
        >
          <div
            className="corp-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 border-b border-[var(--lq-line)] p-6 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
              <div>
                <div className="editorial-eyebrow mb-1" style={{ color: 'var(--lq-ink-3)' }}>Filter</div>
                <h2
                  className="text-xl"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.018em',
                  }}
                >
                  {tools.find((t) => t.id === activeModal)?.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null)
                  setSelectedOption(null)
                }}
                className="p-2 rounded-full hover:bg-[rgba(14,24,51,0.05)] transition-colors"
                style={{ color: 'var(--lq-ink-2)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!selectedOption ? (
                <div className="space-y-2">
                  {tools.find((t) => t.id === activeModal)?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(activeModal, option)}
                      className="w-full px-5 py-4 text-left rounded-[14px] border border-[var(--lq-line)] hover:border-[var(--lq-ink-2)] hover:bg-[rgba(14,24,51,0.03)] transition-all flex items-center justify-between group"
                    >
                      <span
                        className="text-base"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          letterSpacing: '-0.012em',
                          color: 'var(--lq-ink)',
                        }}
                      >
                        {option}
                      </span>
                      <span
                        className="editorial-mono opacity-50 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex items-baseline justify-between gap-3">
                    <div>
                      <div className="editorial-eyebrow mb-1">Showing</div>
                      <h3
                        className="text-xl mb-1"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          letterSpacing: '-0.018em',
                        }}
                      >
                        {selectedOption}
                      </h3>
                      <p className="editorial-mono">{students.length} candidates available</p>
                    </div>
                    <button
                      onClick={() => setSelectedOption(null)}
                      className="editorial-mono"
                      style={{ color: 'var(--lq-ink-2)' }}
                    >
                      ← Back
                    </button>
                  </div>

                  {students.length > 0 ? (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {students.map((student, idx) => (
                        <button
                          key={student.id}
                          onClick={() => {
                            onSelectStudent?.(student.id)
                            setActiveModal(null)
                            setSelectedOption(null)
                          }}
                          className="w-full px-5 py-4 text-left rounded-[14px] border border-[var(--lq-line)] hover:border-[var(--lq-ink-2)] hover:-translate-y-[1px] transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="editorial-mono">{String(idx + 1).padStart(2, '0')}</span>
                              <p
                                className="text-base"
                                style={{
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 500,
                                  letterSpacing: '-0.012em',
                                  color: 'var(--lq-ink)',
                                }}
                              >
                                <CandidateName name={student.name} />
                              </p>
                            </div>
                            {student.atar && (
                              <span className="editorial-chip">ATAR {student.atar}</span>
                            )}
                          </div>
                          <p className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>
                            {student.degree}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {student.topCapabilities.slice(0, 2).map((cap, j) => (
                              <span key={j} className="editorial-chip">{cap.name}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-center py-10 editorial-lede"
                      style={{ color: 'var(--lq-ink-3)' }}
                    >
                      No candidates available for this filter.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
