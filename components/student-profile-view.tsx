'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StudentCapabilityScores } from '@/components/student-capability-scores'

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
  onContactClick?: () => void
  onChallengesClick?: () => void
  roleSkills?: string[]
  allStudentsData?: Array<{ id: string; name: string; capabilities: Array<{ name: string; level: number }> }>
}

export function StudentProfileView({
  student,
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
          <h1 className="editorial-display-sm">{student.name}.</h1>
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
