'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Challenge {
  id: string
  title: string
  capability: string
  interest?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
}

interface ChallengesViewProps {
  challenges: Challenge[]
  onBack: () => void
  onSelectChallenge?: (challenge: Challenge) => void
}

const difficultyColors = {
  Easy: 'bg-green-100 text-slate-900',
  Medium: 'bg-yellow-100 text-slate-900',
  Hard: 'bg-red-100 text-slate-900',
}

export function ChallengesView({
  challenges,
  onBack,
  onSelectChallenge,
}: ChallengesViewProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  if (selectedChallenge) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => setSelectedChallenge(null)}
          className="editorial-mono"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          ← Back to challenges
        </button>

        <div className="space-y-6">
          <div>
            <div className="editorial-eyebrow mb-2">Challenge</div>
            <h2 className="editorial-display-sm">{selectedChallenge.title}</h2>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="editorial-chip">{selectedChallenge.difficulty}</span>
            <span className="editorial-chip editorial-chip-lime">{selectedChallenge.capability}</span>
          </div>

          <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>{selectedChallenge.description}</p>

          <Button size="lg" className="w-full">Start challenge →</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="editorial-mono"
        style={{ color: 'var(--lq-ink-2)' }}
      >
        ← Back to profile
      </button>

      {/* Engagement Stats */}
      <div className="grid grid-cols-3 gap-6 editorial-card p-8">
        {[
          ['Challenges completed', '12'],
          ['Hours on LAUNCH', '24h'],
          ['Avg. performance score', '8.2'],
        ].map(([label, value]) => (
          <div key={label} className="text-center">
            <div className="editorial-stat" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)' }}>{value}</div>
            <p className="editorial-mono mt-3">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="editorial-display-sm mb-6" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>Available challenges</h2>

        <div className="space-y-3">
          {challenges.length === 0 ? (
            <p className="editorial-lede text-center py-8" style={{ color: 'var(--lq-ink-3)' }}>
              No challenges available for this student.
            </p>
          ) : (
            challenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className="w-full p-6 editorial-card hover:-translate-y-[2px] hover:border-[var(--lq-ink-2)] text-left transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}>{challenge.title}</h3>
                    <span className="editorial-chip">{challenge.difficulty}</span>
                  </div>

                  <p className="text-sm leading-relaxed" style={{ color: 'var(--lq-ink-2)' }}>{challenge.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="editorial-chip editorial-chip-lime">{challenge.capability}</span>
                    {challenge.interest && (
                      <span className="editorial-chip">{challenge.interest}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
