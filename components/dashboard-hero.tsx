'use client'

import { useState } from 'react'
import { TrendingUp, Minus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeroProps {
  onStudentClick?: (studentId: string) => void
  onCapabilityClick?: (capabilityKey: string, capabilityName: string) => void
  /** Optional. When provided, the chart REFLECTS YOUR PIPELINE — bars are
   *  weighted by how many of your active scenarios test each capability
   *  (weighted further by applicants per scenario). Without this, the chart
   *  shows the global aggregate baseline as before. */
  roleWeights?: Array<{ capability: string; weight: number }>
  /** Optional override for the headline + helper line so the chart can
   *  read as "What my scenarios are measuring" vs the default. */
  customTitle?: string
  customSubtitle?: string
}

const BASE_CAPABILITIES = [
  { name: 'Judgement & Decision-Making', short: 'Judgement', key: 'judgement' },
  { name: 'Reasoning & Critical Thinking', short: 'Reasoning', key: 'reasoning' },
  { name: 'Problem Solving', short: 'Problem Solving', key: 'problemSolving' },
  { name: 'Leadership & Influence', short: 'Leadership', key: 'leadership' },
  { name: 'Adaptability & Cognitive Flexibility', short: 'Adaptability', key: 'adaptability' },
  { name: 'Emotional Intelligence', short: 'EQ', key: 'emotionalIntelligence' },
  { name: 'Execution & Ownership', short: 'Execution', key: 'execution' },
  { name: 'Integrity & Ethics', short: 'Integrity', key: 'integrity' },
  { name: 'Collaboration', short: 'Collaboration', key: 'collaboration' },
  { name: 'Situational Awareness & Systems Thinking', short: 'Situational', key: 'situationalAwareness' },
]

const SCORES_DATA = {
  Weekly: {
    scores: [
      { score: 72, change: 2, topPercent: 22, candidatesImproved: 12, improvementPercent: 3 },
      { score: 76, change: -1, topPercent: 28, candidatesImproved: 15, improvementPercent: 2 },
      { score: 79, change: 2, topPercent: 32, candidatesImproved: 18, improvementPercent: 4 },
      { score: 65, change: 1, topPercent: 12, candidatesImproved: 8, improvementPercent: 2 },
      { score: 70, change: 2, topPercent: 24, candidatesImproved: 14, improvementPercent: 3 },
      { score: 75, change: 0, topPercent: 30, candidatesImproved: 10, improvementPercent: 2 },
      { score: 78, change: 2, topPercent: 33, candidatesImproved: 16, improvementPercent: 3 },
      { score: 82, change: 1, topPercent: 44, candidatesImproved: 22, improvementPercent: 5 },
      { score: 74, change: 2, topPercent: 28, candidatesImproved: 13, improvementPercent: 2 },
      { score: 71, change: -1, topPercent: 21, candidatesImproved: 9, improvementPercent: 2 },
    ],
  },
  Monthly: {
    scores: [
      { score: 78, change: 2, topPercent: 28, candidatesImproved: 18, improvementPercent: 4 },
      { score: 82, change: -1, topPercent: 35, candidatesImproved: 20, improvementPercent: 5 },
      { score: 85, change: 3, topPercent: 42, candidatesImproved: 25, improvementPercent: 6 },
      { score: 71, change: 1, topPercent: 18, candidatesImproved: 11, improvementPercent: 3 },
      { score: 76, change: 2, topPercent: 31, candidatesImproved: 19, improvementPercent: 4 },
      { score: 81, change: 0, topPercent: 38, candidatesImproved: 14, improvementPercent: 3 },
      { score: 84, change: 3, topPercent: 40, candidatesImproved: 23, improvementPercent: 5 },
      { score: 89, change: 1, topPercent: 52, candidatesImproved: 28, improvementPercent: 6 },
      { score: 80, change: 2, topPercent: 36, candidatesImproved: 21, improvementPercent: 4 },
      { score: 77, change: -1, topPercent: 29, candidatesImproved: 12, improvementPercent: 3 },
    ],
  },
  Yearly: {
    scores: [
      { score: 85, change: 3, topPercent: 38, candidatesImproved: 32, improvementPercent: 8 },
      { score: 89, change: 2, topPercent: 45, candidatesImproved: 35, improvementPercent: 9 },
      { score: 92, change: 4, topPercent: 52, candidatesImproved: 42, improvementPercent: 10 },
      { score: 78, change: 2, topPercent: 28, candidatesImproved: 22, improvementPercent: 6 },
      { score: 83, change: 3, topPercent: 42, candidatesImproved: 34, improvementPercent: 8 },
      { score: 88, change: 2, topPercent: 48, candidatesImproved: 38, improvementPercent: 9 },
      { score: 91, change: 3, topPercent: 50, candidatesImproved: 41, improvementPercent: 10 },
      { score: 96, change: 2, topPercent: 62, candidatesImproved: 48, improvementPercent: 11 },
      { score: 87, change: 3, topPercent: 44, candidatesImproved: 36, improvementPercent: 9 },
      { score: 84, change: 2, topPercent: 38, candidatesImproved: 30, improvementPercent: 8 },
    ],
  },
}

const timeRanges = ['Weekly', 'Monthly', 'Yearly'] as const

export function DashboardHero({ onCapabilityClick, roleWeights, customTitle, customSubtitle }: DashboardHeroProps) {
  const [selectedRange, setSelectedRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly')
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const rangeData = SCORES_DATA[selectedRange]
  // If roleWeights provided, override the base scores so each bar's HEIGHT
  // reflects how much that capability is being measured across the partner's
  // active scenarios (weighted by applicant volume). Otherwise fall back
  // to the baseline aggregate.
  const scores = roleWeights && roleWeights.length > 0
    ? BASE_CAPABILITIES.map((cap) => {
        const matching = roleWeights.find((r) => r.capability === cap.name)
        const weight = matching ? matching.weight : 0
        return {
          score: Math.min(100, 40 + Math.round(weight * 60)),  // 40..100 scaled by weight 0..1
          change: 0,
          topPercent: 0,
          candidatesImproved: 0,
          improvementPercent: 0,
        }
      })
    : rangeData.scores
  const maxScore = Math.max(...scores.map((s) => s.score), 100)
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
  const totalChange = scores.reduce((sum, s) => sum + s.change, 0)
  const hoveredData = hoveredIndex !== null ? scores[hoveredIndex] : null
  const usingRoleWeights = !!(roleWeights && roleWeights.length > 0)

  return (
    <section className="section-pad-sm">
      <div className="editorial-container">
        <div className="corp-card p-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="editorial-eyebrow mb-2" style={{ color: 'var(--lq-ink-3)' }}>
                {usingRoleWeights ? 'Your pipeline · capability mix' : 'Capabilities · aggregate'}
              </div>
              <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>
                {customTitle ?? (usingRoleWeights ? 'What your scenarios are measuring.' : 'The shape of the talent pool.')}
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--lq-ink-2)' }}>
                {customSubtitle ?? (usingRoleWeights
                  ? 'Weighted by applicants per role — the taller the bar, the more capability volume in your pipeline tests it.'
                  : 'Average decision-quality across every candidate, by capability.')}
              </p>
            </div>
            <div className="relative inline-flex">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--lq-line-2)] hover:border-[var(--lq-ink-2)] transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lq-ink)' }}
              >
                {selectedRange}
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />
              </button>
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-[var(--lq-line)] rounded-[14px] shadow-lg z-10 overflow-hidden min-w-[140px]">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedRange(range)
                        setIsOpen(false)
                        setHoveredIndex(null)
                      }}
                      className={cn(
                        'w-full px-5 py-3 text-left transition-colors',
                        selectedRange === range
                          ? 'bg-[rgba(10,42,107,0.06)]'
                          : 'hover:bg-[rgba(14,24,51,0.04)]'
                      )}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lq-ink)' }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Total Value Section */}
          <div className="mb-10 pb-8 border-b border-[var(--lq-line)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div className="flex flex-col gap-3">
                <p
                  className="editorial-stat"
                  style={{ fontSize: 'clamp(48px, 6vw, 80px)', color: 'var(--launch-navy)' }}
                >
                  {avgScore}
                </p>
                <div className="editorial-mono">Average capability score</div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    totalChange >= 0 ? 'corp-chip' : 'editorial-chip'
                  )}
                  style={
                    totalChange < 0
                      ? { background: 'rgba(220,20,60,0.10)', color: '#7a0e2a' }
                      : undefined
                  }
                >
                  <TrendingUp size={12} style={{ transform: totalChange < 0 ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  {totalChange > 0 ? '+' : ''}{totalChange} across all
                </span>
              </div>
              {hoveredData ? (
                <div className="max-w-sm text-right">
                  <div className="editorial-mono mb-2">Live · hover</div>
                  <p
                    className="text-base"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      color: 'var(--lq-ink)',
                    }}
                  >
                    {hoveredData.candidatesImproved} candidates increased their score by {hoveredData.improvementPercent}%.
                  </p>
                </div>
              ) : (
                <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                  Hover a bar →
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-56">
            {BASE_CAPABILITIES.map((capability, index) => {
              const data = scores[index]
              const heightPercent = (data.score / maxScore) * 100
              const isHovered = hoveredIndex === index

              return (
                <button
                  key={capability.key}
                  className="flex flex-col items-center flex-1 group cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onCapabilityClick?.(capability.key, capability.name)}
                >
                  <div className="relative w-full h-40 flex flex-col items-center justify-end">
                    <div
                      className="w-3/4 rounded-t-[8px] transition-all duration-300 flex items-center justify-center"
                      style={{
                        height: `${heightPercent * 1.6}px`,
                        background: isHovered
                          ? 'linear-gradient(180deg, var(--launch-navy-2), var(--launch-navy))'
                          : 'rgba(14, 24, 51, 0.12)',
                      }}
                    >
                      {isHovered && (
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            fontSize: 22,
                            letterSpacing: '-0.015em',
                            color: 'var(--lq-cream)',
                          }}
                        >
                          {data.score}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center w-full mt-2">
                    <p
                      className="text-[11px] leading-tight h-10 flex items-center justify-center px-1"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isHovered ? 'var(--lq-ink)' : 'var(--lq-ink-3)',
                      }}
                    >
                      {capability.short}
                    </p>
                    <div
                      className="flex items-center justify-center gap-0.5 mt-0.5 text-[10px]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.04em',
                        color:
                          data.change > 0
                            ? 'var(--launch-navy)'
                            : data.change < 0
                            ? '#7a0e2a'
                            : 'var(--lq-ink-3)',
                      }}
                    >
                      {data.change > 0 ? (
                        <>
                          <TrendingUp size={10} />+{data.change}
                        </>
                      ) : data.change < 0 ? (
                        <>
                          <TrendingUp size={10} style={{ transform: 'rotate(180deg)' }} />
                          {Math.abs(data.change)}
                        </>
                      ) : (
                        <>
                          <Minus size={10} />
                          flat
                        </>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
