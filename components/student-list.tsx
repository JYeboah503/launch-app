'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface Student {
  id: string
  name: string
  interests: string[]
  topCapabilities: { name: string; level: number }[]
  overallScore: number
  degree?: string
  atar?: number
}

interface StudentListProps {
  students: Student[]
  selectedStudentId: string | null
  onSelectStudent: (studentId: string) => void
}

export function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
}: StudentListProps) {
  const router = useRouter()
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center space-y-2">
          <p className="editorial-eyebrow">No matches</p>
          <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>
            Adjust your criteria to explore more candidates.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {students.map((student, idx) => (
        <button
          key={student.id}
          onClick={() => {
            onSelectStudent(student.id)
            router.push(`/student/${student.id}`)
          }}
          className={cn(
            'w-full p-4 rounded-[18px] transition-all duration-200 text-left border group',
            selectedStudentId === student.id
              ? 'bg-[var(--launch-lime-soft)] border-[var(--launch-lime-2)]'
              : 'bg-card border-[var(--lq-line)] hover:border-[var(--lq-ink-2)] hover:-translate-y-[1px]',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="editorial-mono">{String(idx + 1).padStart(2, '0')}</span>
                <h4
                  className="truncate text-base"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.012em',
                    color: 'var(--lq-ink)',
                  }}
                >
                  {student.name}
                </h4>
              </div>

              {/* Top capability bars */}
              <div className="flex gap-1 mb-3">
                {student.topCapabilities.slice(0, 3).map((cap, i) => (
                  <div
                    key={i}
                    className="h-[3px] rounded-full flex-1"
                    style={{
                      background: 'var(--lq-line)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, cap.level))}%`,
                        background: 'var(--launch-navy)',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-1.5">
                {student.interests.slice(0, 2).map((interest) => (
                  <span key={interest} className="editorial-chip">
                    {interest}
                  </span>
                ))}
                {student.interests.length > 2 && (
                  <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                    +{student.interests.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Score */}
            <div className="flex flex-col items-end flex-shrink-0">
              <div
                className="text-2xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'var(--launch-navy)',
                  lineHeight: 1,
                }}
              >
                {Math.round(student.overallScore)}
              </div>
              <p className="editorial-mono mt-1">overall</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
