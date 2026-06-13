'use client'

import { ArrowDown, TrendingUp } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { cn } from '@/lib/utils'
import { CandidateName } from '@/components/candidate-name'

interface CapabilityDetailViewProps {
  capabilityName: string
  capabilityKey: string
  students: Student[]
  onSelectStudent: (studentId: string) => void
}

const capabilityColors: Record<string, { bg: string; text: string; border: string }> = {
  judgement: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
  reasoning: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
  problemSolving: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200' },
  leadership: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
  adaptability: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
  emotionalIntelligence: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' },
  execution: { bg: 'bg-green-500', text: 'text-slate-900', border: 'border-green-200' },
  integrity: { bg: 'bg-emerald-500', text: 'text-slate-900', border: 'border-emerald-200' },
  collaboration: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200' },
  situationalAwareness: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
}

export function CapabilityDetailView({
  capabilityName,
  capabilityKey,
  students,
  onSelectStudent,
}: CapabilityDetailViewProps) {
  const colors = capabilityColors[capabilityKey] || capabilityColors.reasoning
  
  // Filter and sort students by this capability
  const sortedStudents = [...students]
    .filter((s) => s.topCapabilities.some((c) => c.name === capabilityName))
    .sort((a, b) => {
      const aLevel = a.topCapabilities.find((c) => c.name === capabilityName)?.level || 0
      const bLevel = b.topCapabilities.find((c) => c.name === capabilityName)?.level || 0
      return bLevel - aLevel
    })

  const topStudents = sortedStudents.slice(0, 20)
  const avgLevel =
    topStudents.length > 0
      ? Math.round(
          topStudents.reduce((sum, s) => {
            const level = s.topCapabilities.find((c) => c.name === capabilityName)?.level || 0
            return sum + level
          }, 0) / topStudents.length
        )
      : 0

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-8">
          <div>
            <div className="editorial-eyebrow mb-3">Capability detail</div>
            <h1 className="editorial-display-sm">{capabilityName}.</h1>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="editorial-card p-6">
              <div className="editorial-mono mb-3">Top talent pool</div>
              <p className="editorial-stat" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)' }}>{topStudents.length}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--lq-ink-3)' }}>candidates tracked</p>
            </div>

            <div className="editorial-card p-6">
              <div className="editorial-mono mb-3">Average score</div>
              <p className="editorial-stat" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)' }}>{avgLevel}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--lq-ink-3)' }}>capability level</p>
            </div>

            <div className="editorial-card p-6">
              <div className="editorial-mono mb-3">Excellence threshold</div>
              <p className="editorial-stat" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)' }}>85+</p>
              <p className="text-xs mt-2" style={{ color: 'var(--lq-ink-3)' }}>elite performers</p>
            </div>

            <div className="editorial-card p-6">
              <div className="editorial-mono mb-3">Best performer</div>
              <p className="editorial-stat" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)' }}>
                {topStudents.length > 0
                  ? topStudents[0].topCapabilities.find((c) => c.name === capabilityName)?.level || 0
                  : 0}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--lq-ink-3)' }}>max score</p>
            </div>
          </div>

          {/* Employer Insight */}
          <div className="editorial-card p-8">
            <div className="editorial-mono mb-3">Why this capability matters</div>
            <p className="text-base leading-relaxed" style={{ color: 'var(--lq-ink-2)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18 }}>
              {capabilityName === 'Reasoning & Critical Thinking'
                ? 'Top candidates in this area excel at analyzing complex information, identifying patterns, and drawing logical conclusions. They break down ambiguous problems and challenge assumptions. Ideal for roles requiring strategic analysis and technical depth.'
                : capabilityName === 'Problem Solving'
                  ? 'Exceptional problem solvers approach challenges systematically, generate innovative solutions, and implement them effectively. They thrive in dynamic environments and drive tangible results. Essential for product, operations, and strategic roles.'
                  : capabilityName === 'Leadership & Influence'
                    ? 'Leaders in this space inspire teams, align stakeholders, and drive organizational change. They build trust and motivate others toward shared goals. Perfect for management, executive, and cross-functional leadership positions.'
                    : capabilityName === 'Execution & Ownership'
                      ? 'High-execution candidates take ownership, deliver on commitments, and drive projects to completion. They manage complexity and maintain focus on key outcomes. Valuable across operations, project management, and delivery roles.'
                      : capabilityName === 'Integrity & Ethics'
                        ? 'These candidates maintain principled decision-making, uphold organizational values, and build credibility. They navigate ethical dilemmas thoughtfully and inspire trust. Critical for leadership, compliance, and client-facing roles.'
                        : capabilityName === 'Emotional Intelligence'
                          ? 'High-EQ candidates read social dynamics, manage relationships effectively, and communicate with empathy. They excel in cross-functional collaboration and stakeholder management. Ideal for leadership, sales, and people-focused roles.'
                          : capabilityName === 'Collaboration'
                            ? 'Exceptional collaborators work effectively across teams, share knowledge openly, and amplify collective impact. They build strong relationships and break down silos. Essential for matrix organizations and team-oriented roles.'
                            : capabilityName === 'Adaptability & Cognitive Flexibility'
                              ? 'Adaptable thinkers thrive in ambiguity, pivot strategies quickly, and learn rapidly. They embrace change and remain composed under pressure. Valuable in fast-moving, evolving environments.'
                              : capabilityName === 'Judgement & Decision-Making'
                                ? 'Strong decision-makers assess trade-offs, weigh multiple perspectives, and make sound calls with incomplete information. They learn from outcomes and refine their judgment. Critical for leadership, strategy, and risk management roles.'
                                : 'These candidates consistently demonstrate excellence in systems thinking, understanding organizational dynamics, and considering broader implications. Ideal for strategic planning and senior leadership roles.'}
            </p>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>Top performers</h2>
            <span className="editorial-mono inline-flex items-center gap-2">
              <TrendingUp size={12} />
              Sorted by capability level
            </span>
          </div>

          {/* Employer-Focused Candidate List */}
          <div className="space-y-3">
            {topStudents.map((student, idx) => {
              const capLevel =
                student.topCapabilities.find((c) => c.name === capabilityName)?.level || 0
              const rank = idx + 1

              return (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className={`w-full rounded-2xl border-2 ${colors.border} bg-card hover:shadow-lg transition-all p-6 text-left`}
                >
                  <div className="flex items-start gap-6">
                    {/* Rank & Score */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`${colors.bg} rounded-xl w-12 h-12 flex items-center justify-center text-white font-bold`}>
                        #{rank}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${colors.text}`}>{capLevel}</p>
                        <p className="text-xs text-muted-foreground">score</p>
                      </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground"><CandidateName name={student.name} /></h3>
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2">
                        {student.interests.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-accent">{Math.round(student.overallScore)}</div>
                      <p className="text-xs text-muted-foreground">overall</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {topStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students found with this capability.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
