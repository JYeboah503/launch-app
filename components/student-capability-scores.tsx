'use client'

import { useState } from 'react'
import { TrendingUp, Minus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CandidateName } from '@/components/candidate-name'

interface StudentCapabilityScoresProps {
  student: {
    name: string
    capabilities: Array<{ name: string; level: number; change?: number }>
  }
  roleSkills?: string[]
  allStudentsData?: Array<{ id: string; name: string; capabilities: Array<{ name: string; level: number }> }>
}

/* All capability metadata only — no per-cap colour. The chart and cards
 * use the LAUNCH palette (navy + teal + cream) uniformly; emphasis comes
 * from being required vs not, not from a rainbow per capability. */
const BASE_CAPABILITIES = [
  { name: 'Judgement & Decision-Making',          short: 'Judgement',             key: 'judgement' },
  { name: 'Reasoning & Critical Thinking',        short: 'Reasoning',             key: 'reasoning' },
  { name: 'Problem Solving',                       short: 'Problem Solving',       key: 'problemSolving' },
  { name: 'Leadership & Influence',                short: 'Leadership',            key: 'leadership' },
  { name: 'Adaptability & Cognitive Flexibility',  short: 'Adaptability',          key: 'adaptability' },
  { name: 'Emotional Intelligence',                short: 'EQ',                    key: 'emotionalIntelligence' },
  { name: 'Execution & Ownership',                 short: 'Execution',             key: 'execution' },
  { name: 'Integrity & Ethics',                    short: 'Integrity',             key: 'integrity' },
  { name: 'Collaboration',                         short: 'Collaboration',         key: 'collaboration' },
  { name: 'Situational Awareness & Systems Thinking', short: 'Situational',         key: 'situationalAwareness' },
]

const STUDENT_SCORES_DATA = {
  Weekly: {
    change: 2,
    improvementPercent: 3,
  },
  Monthly: {
    change: 2,
    improvementPercent: 4,
  },
  Yearly: {
    change: 3,
    improvementPercent: 8,
  },
}

const timeRanges = ['Weekly', 'Monthly', 'Yearly']

export function StudentCapabilityScores({ student, roleSkills, allStudentsData }: StudentCapabilityScoresProps) {
  const [selectedRange, setSelectedRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly')
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Calculate ranks for role-specific skills
  const calculateRank = (capabilityName: string, currentScore: number): number | null => {
    if (!roleSkills || !allStudentsData) return null
    
    const allScoresForCapability = allStudentsData
      .map(s => {
        const cap = s.capabilities.find(c => c.name === capabilityName)
        return cap?.level || 0
      })
      .sort((a, b) => b - a)
    
    const rank = allScoresForCapability.findIndex(score => score <= currentScore) + 1
    return rank
  }

  const rangeData = STUDENT_SCORES_DATA[selectedRange]
  const scores = student.capabilities
  const maxScore = Math.max(...scores.map((s) => s.level), 100)
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.level, 0) / scores.length)
  const totalChange = rangeData.change
  const hoveredData = hoveredIndex !== null ? scores[hoveredIndex] : null

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      {/* Card Header with Time Range Toggle */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Aggregated Capability Scores</h2>
          <p className="text-sm text-muted-foreground mt-1">Performance across all capabilities</p>
        </div>
        {!roleSkills || roleSkills.length === 0 && (
          <div className="flex flex-col items-end gap-2">
            <div className="relative inline-flex">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground"
              >
                {selectedRange}
                <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedRange(range as 'Weekly' | 'Monthly' | 'Yearly')
                        setIsOpen(false)
                        setHoveredIndex(null)
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-sm text-left transition-colors',
                        selectedRange === range
                          ? 'bg-accent/20 text-accent font-semibold'
                          : 'text-foreground hover:bg-secondary/50'
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total Value Section - Show role skills summary when in role context */}
      {roleSkills && roleSkills.length > 0 ? (
        <div className="mb-10 pb-8 border-b border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Scores on Required Capabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {roleSkills.map((skillName) => {
              const capabilityData = scores.find(s => s.name === skillName)
              const capability = BASE_CAPABILITIES.find(c => c.name === skillName)
              if (!capabilityData || !capability) return null
              
              const rank = calculateRank(skillName, capabilityData.level)
              
              return (
                <div
                  key={skillName}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: '#fbf8f1',
                    border: '1px solid rgba(10, 42, 107, 0.18)',
                    boxShadow: '0 1px 0 rgba(10, 42, 107, 0.02), 0 4px 14px -12px rgba(10, 42, 107, 0.10)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p
                      className="text-xs line-clamp-2"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--lq-ink-3)',
                        fontWeight: 600,
                      }}
                    >
                      {capability.short}
                    </p>
                    {rank && (
                      <div
                        className="px-2 py-0.5 text-xs rounded"
                        style={{
                          background: 'var(--launch-navy)',
                          color: 'var(--lq-cream)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          fontSize: 10,
                        }}
                      >
                        #{rank}
                      </div>
                    )}
                  </div>
                  <p
                    className="text-3xl"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      color: 'var(--launch-navy)',
                      lineHeight: 1,
                    }}
                  >
                    {capabilityData.level}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--lq-ink-3)' }}
                  >
                    out of 100
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-10 pb-8 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-5xl font-bold tracking-tight text-foreground">
                  {avgScore}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Average Capability Score</p>
              </div>
              <div
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  background:
                    totalChange > 0
                      ? 'rgba(27, 158, 143, 0.14)'
                      : totalChange < 0
                        ? 'rgba(122, 14, 42, 0.10)'
                        : 'rgba(10, 42, 107, 0.06)',
                  color:
                    totalChange > 0
                      ? 'var(--launch-teal-3)'
                      : totalChange < 0
                        ? '#7a0e2a'
                        : 'var(--lq-ink-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                }}
              >
                <TrendingUp size={14} style={{ transform: totalChange < 0 ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                {totalChange > 0 ? '+' : ''}{totalChange} across all capabilities
              </div>
            </div>
            <div className="flex flex-col items-end">
              {hoveredData && (
                <div className="text-lg font-bold text-blue-950 dark:text-blue-200 uppercase">
                  <CandidateName name={student.name} /> INCREASED THEIR SCORE BY {rangeData.improvementPercent}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart — restrained navy palette. Required-capability bars
          fill solid navy; non-required sit as cream-tinted ghosts so the
          required ones read at a glance without rainbow colour-coding. */}
      <div className="flex items-end justify-between gap-2 h-56">
        {BASE_CAPABILITIES.map((capability, index) => {
          const data = scores[index]
          if (!data) return null

          const heightPercent = (data.level / maxScore) * 100
          const isHovered = hoveredIndex === index
          const isRoleSkill = roleSkills && roleSkills.includes(data.name)
          const rank = isRoleSkill ? calculateRank(data.name, data.level) : null

          // Single navy ramp — required bars filled solid, non-required as
          // subtle parchment ghosts. Hover lifts any bar to the same solid
          // navy so the partner can probe.
          const barStyle: React.CSSProperties = {
            height: `${heightPercent * 1.6}px`,
            transition: 'background 200ms ease, box-shadow 200ms ease, transform 160ms ease',
          }
          if (isRoleSkill || isHovered) {
            // Active state: solid navy with a slight inner highlight
            barStyle.background = `linear-gradient(180deg, var(--launch-navy-2) 0%, var(--launch-navy) 100%)`
            barStyle.boxShadow = '0 8px 18px -12px rgba(10, 42, 107, 0.40)'
          } else {
            // Idle non-required: cream ghost with a thin navy border
            barStyle.background = '#f6efe0'
            barStyle.border = '1px solid rgba(10, 42, 107, 0.08)'
          }

          return (
            <button
              key={capability.key}
              className="flex flex-col items-center flex-1 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            >
              {/* Rank chip — only shown for role-assessed skills */}
              {rank && (
                <div
                  className="mb-2 px-2 py-1 rounded-full"
                  style={{
                    background: 'var(--launch-navy)',
                    color: 'var(--lq-cream)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontSize: 10,
                  }}
                >
                  #{rank}
                </div>
              )}

              {/* Bar Container — Bottom Aligned */}
              <div className="relative w-full h-40 flex flex-col items-center justify-end">
                <div
                  className="w-3/4 rounded-t-lg cursor-pointer flex items-center justify-center"
                  style={barStyle}
                >
                  {/* Score read-out — visible on hover OR on required bars
                      when score reads well at this height. */}
                  {isHovered && (
                    <div
                      style={{
                        color: 'var(--lq-cream)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 24,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {data.level}
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="text-center w-full mt-2">
                <p
                  className="text-xs leading-tight h-10 flex items-center justify-center px-1"
                  style={{
                    color: isRoleSkill ? 'var(--lq-ink)' : 'var(--lq-ink-2)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: isRoleSkill ? 600 : 500,
                  }}
                >
                  {capability.short}
                </p>
                <div
                  className="flex items-center justify-center gap-0.5 text-xs"
                  style={{
                    color:
                      (data.change || 0) > 0
                        ? 'var(--launch-teal-3)'
                        : (data.change || 0) < 0
                          ? '#7a0e2a'
                          : 'var(--lq-ink-3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {(data.change || 0) > 0 ? (
                    <>
                      <TrendingUp size={12} />
                      {data.change}
                    </>
                  ) : (data.change || 0) < 0 ? (
                    <>
                      <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} />
                      {Math.abs(data.change || 0)}
                    </>
                  ) : (
                    <>
                      <Minus size={12} />
                      Flat
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
