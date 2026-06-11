'use client'

import { useState } from 'react'
import { TrendingUp, Minus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudentCapabilityScoresProps {
  student: {
    name: string
    capabilities: Array<{ name: string; level: number; change?: number }>
  }
  roleSkills?: string[]
  allStudentsData?: Array<{ id: string; name: string; capabilities: Array<{ name: string; level: number }> }>
}

const BASE_CAPABILITIES = [
  { name: 'Judgement & Decision-Making', short: 'Judgement', key: 'judgement', bgColor: 'bg-blue-500', colorClass: 'text-blue-500' },
  { name: 'Reasoning & Critical Thinking', short: 'Reasoning', key: 'reasoning', bgColor: 'bg-purple-500', colorClass: 'text-purple-500' },
  { name: 'Problem Solving', short: 'Problem Solving', key: 'problemSolving', bgColor: 'bg-pink-500', colorClass: 'text-pink-500' },
  { name: 'Leadership & Influence', short: 'Leadership', key: 'leadership', bgColor: 'bg-red-500', colorClass: 'text-red-500' },
  { name: 'Adaptability & Cognitive Flexibility', short: 'Adaptability', key: 'adaptability', bgColor: 'bg-orange-500', colorClass: 'text-orange-500' },
  { name: 'Emotional Intelligence', short: 'EQ', key: 'emotionalIntelligence', bgColor: 'bg-yellow-500', colorClass: 'text-yellow-500' },
  { name: 'Execution & Ownership', short: 'Execution', key: 'execution', bgColor: 'bg-green-500', colorClass: 'text-green-500' },
  { name: 'Integrity & Ethics', short: 'Integrity', key: 'integrity', bgColor: 'bg-emerald-500', colorClass: 'text-emerald-500' },
  { name: 'Collaboration', short: 'Collaboration', key: 'collaboration', bgColor: 'bg-teal-500', colorClass: 'text-teal-500' },
  { name: 'Situational Awareness & Systems Thinking', short: 'Situational Awareness', key: 'situationalAwareness', bgColor: 'bg-cyan-500', colorClass: 'text-cyan-500' },
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
                <div key={skillName} className={cn(
                  'rounded-lg p-4 border-2 transition-all',
                  'border-accent bg-accent/10'
                )}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs font-semibold text-muted-foreground line-clamp-2">{capability.short}</p>
                    {rank && (
                      <div className="px-2 py-0.5 bg-accent text-slate-900 text-xs font-bold rounded">
                        #{rank}
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{capabilityData.level}</p>
                  <p className="text-xs text-muted-foreground mt-1">out of 100</p>
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
              <div className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold', totalChange > 0 ? 'bg-green-500/15 text-green-600' : totalChange < 0 ? 'bg-red-500/15 text-red-600' : 'bg-muted text-muted-foreground')}>
                <TrendingUp size={16} style={{ transform: totalChange < 0 ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                {totalChange > 0 ? '+' : ''}{totalChange} across all capabilities
              </div>
            </div>
            <div className="flex flex-col items-end">
              {hoveredData && (
                <div className="text-lg font-bold text-blue-950 dark:text-blue-200 uppercase">
                  {student.name} INCREASED THEIR SCORE BY {rangeData.improvementPercent}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-56">
        {BASE_CAPABILITIES.map((capability, index) => {
          const data = scores[index]
          if (!data) return null
          
          const heightPercent = (data.level / maxScore) * 100
          const isHovered = hoveredIndex === index
          const isRoleSkill = roleSkills && roleSkills.includes(data.name)
          const rank = isRoleSkill ? calculateRank(data.name, data.level) : null

          return (
            <button
              key={capability.key}
              className="flex flex-col items-center flex-1 group cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Rank Badge - shown for role-assessed skills */}
              {rank && (
                <div className="mb-2 px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full">
                  #{rank}
                </div>
              )}

              {/* Bar Container - Bottom Aligned */}
              <div className="relative w-full h-40 flex flex-col items-center justify-end">
                <div
                  className={cn(
                    'w-3/4 rounded-t-lg transition-all duration-300 cursor-pointer flex items-center justify-center',
                    isRoleSkill && !isHovered ? 'opacity-100 ring-2 ring-accent' : !isHovered ? 'bg-muted/40 opacity-50' : '',
                    isHovered ? capability.bgColor : isRoleSkill ? capability.bgColor : 'bg-muted/40'
                  )}
                  style={{
                    height: `${heightPercent * 1.6}px`,
                  }}>
                  {/* Score in center of bar on hover */}
                  {isHovered && (
                    <div className="text-white text-2xl font-extrabold">
                      {data.level}
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="text-center w-full">
                <p className={cn('text-xs font-medium leading-tight h-10 flex items-center justify-center px-1', 
                  isRoleSkill ? 'text-foreground font-bold' : 'text-foreground'
                )}>
                  {capability.short}
                </p>
                <div className={cn('flex items-center justify-center gap-0.5 text-xs font-semibold', 
                  (data.change || 0) > 0 ? 'text-green-500' : (data.change || 0) < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
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
