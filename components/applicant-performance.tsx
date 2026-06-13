'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { CandidateName } from '@/components/candidate-name'

const CAPABILITY_NAMES = [
  'Problem Solving',
  'Reasoning & Critical Thinking',
  'Leadership & Influence',
  'Execution & Ownership',
  'Integrity & Ethics',
  'Collaboration',
  'Emotional Intelligence',
  'Adaptability & Cognitive Flexibility',
  'Judgement & Decision-Making',
  'Situational Awareness & Systems Thinking'
]

const EXAMPLE_ROLES = [
  { id: '1', title: 'Product Manager', department: 'Product', openPositions: 5 },
  { id: '2', title: 'Strategy Consultant', department: 'Strategy', openPositions: 8 },
  { id: '3', title: 'Operations Manager', department: 'Operations', openPositions: 3 },
  { id: '4', title: 'Finance Analyst', department: 'Finance', openPositions: 6 },
  { id: '5', title: 'Engineering Lead', department: 'Technology', openPositions: 4 },
]

interface ApplicantPerformanceProps {
  students: Student[]
  onBack: () => void
  roleSkills?: string[] // Optional: if provided, only show these skills in filters
  roleName?: string // Optional: role name for display
  roleInfo?: { id: string; accessCode: string; questionsCount: number }
}

export function ApplicantPerformance({ students, onBack, roleSkills, roleName, roleInfo }: ApplicantPerformanceProps) {
  // Use role-specific skills if provided, otherwise use all capabilities
  const displaySkills = roleSkills && roleSkills.length > 0 ? roleSkills : CAPABILITY_NAMES
  const [selectedRole, setSelectedRole] = useState<typeof EXAMPLE_ROLES[0] | null>(null)
  const [minimumScores, setMinimumScores] = useState<Record<string, number>>(
    displaySkills.reduce((acc, cap) => ({ ...acc, [cap]: 0 }), {})
  )
  const [searchTerm, setSearchTerm] = useState('')

  // Calculate capability scores for all students
  const studentsWithAllCapabilities = useMemo(() => {
    return students.map(student => {
      const capabilityMap = new Map()
      student.topCapabilities.forEach(cap => {
        capabilityMap.set(cap.name, cap.level)
      })

      // Fill missing capabilities with 0 or estimate based on overall score
      const allCapabilities = displaySkills.map(capName => ({
        name: capName,
        level: capabilityMap.get(capName) || Math.max(0, student.overallScore - 10 + Math.random() * 20)
      }))

      return {
        ...student,
        allCapabilities
      }
    })
  }, [students])

  // Filter students based on minimum scores and search
  const filteredStudents = useMemo(() => {
    return studentsWithAllCapabilities.filter(student => {
      // Check if all minimum scores are met
      const meetsScoreRequirements = displaySkills.every(capName => {
        const capScore = student.allCapabilities.find(c => c.name === capName)?.level || 0
        return capScore >= minimumScores[capName]
      })

      // Check if search term matches
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())

      return meetsScoreRequirements && matchesSearch
    })
  }, [studentsWithAllCapabilities, minimumScores, searchTerm, displaySkills])

  if (selectedRole) {
    return (
      <div className="min-h-screen pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ background: 'var(--corp-canvas)' }}>
        {/* Header */}
        <button
          onClick={() => setSelectedRole(null)}
          className="editorial-mono mb-6 inline-flex items-center gap-2"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          <ChevronLeft className="w-3 h-3" />
          Back
        </button>
        <div className="flex items-baseline justify-between mb-10 flex-wrap gap-3">
          <div>
            <div className="editorial-eyebrow mb-2">Role · {selectedRole.department}</div>
            <h1 className="editorial-display-sm">{selectedRole.title}.</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--lq-ink-2)' }}>
              {selectedRole.openPositions} open positions
            </p>
          </div>
          <span className="editorial-chip">
            {filteredStudents.length} candidates
          </span>
        </div>

        {/* Filter Section */}
        <div className="corp-card mb-8 p-6">
          <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}>Filter by capability scores</h2>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none"
              style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
            />
          </div>

          {/* Capability Score Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySkills.map((capability) => (
              <div key={capability}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--lq-ink-2)' }}>{capability}</label>
                  <span className="text-sm font-bold" style={{ color: 'var(--launch-navy)' }}>{minimumScores[capability]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minimumScores[capability]}
                  onChange={(e) => {
                    setMinimumScores({
                      ...minimumScores,
                      [capability]: parseInt(e.target.value)
                    })
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: 'var(--launch-navy)',
                    background: `linear-gradient(to right, var(--launch-navy) 0%, var(--launch-navy) ${minimumScores[capability]}%, rgba(10, 42, 107, 0.14) ${minimumScores[capability]}%, rgba(10, 42, 107, 0.14) 100%)`
                  }}
                />
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setMinimumScores(displaySkills.reduce((acc, cap) => ({ ...acc, [cap]: 0 }), {}))
              setSearchTerm('')
            }}
            className="corp-btn corp-btn-ghost mt-6"
          >
            Reset filters
          </button>
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div key={student.id} className="corp-card p-6">
                <div className="mb-4">
                  <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}><CandidateName name={student.name} /></h3>
                  <p className="text-sm" style={{ color: 'var(--lq-ink-3)' }}>{student.degree} • ATAR: {student.atar}</p>
                </div>

                {/* Capability Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {student.allCapabilities.map((cap) => (
                    <div key={cap.name} className="rounded-lg p-3" style={{ background: 'rgba(10, 42, 107, 0.06)' }}>
                      <p className="text-xs mb-1 font-semibold line-clamp-2" style={{ color: 'var(--lq-ink-3)' }}>{cap.name}</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--launch-navy)' }}>{Math.round(cap.level)}</p>
                    </div>
                  ))}
                </div>

                {/* Overall Score */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--lq-ink-3)' }}>Overall score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(10, 42, 107, 0.12)' }}>
                      <div
                        className="h-full"
                        style={{ width: `${student.overallScore}%`, background: 'var(--launch-navy)' }}
                      />
                    </div>
                    <span className="text-lg font-bold" style={{ color: 'var(--lq-ink)' }}>{student.overallScore}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--lq-ink-3)' }}>No candidates match your filters</p>
              <button
                onClick={() => {
                  setMinimumScores(CAPABILITY_NAMES.reduce((acc, cap) => ({ ...acc, [cap]: 0 }), {}))
                  setSearchTerm('')
                }}
                className="mt-4 hover:underline"
                style={{ color: 'var(--launch-navy)' }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Role Selection View
  // (CorporateTopBar already provides "← Dashboard" — no duplicate back button here)
  return (
    <div className="min-h-screen pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ background: 'var(--corp-canvas)' }}>
      <div className="max-w-4xl mb-10">
        <div className="editorial-eyebrow mb-2">Performance · roles</div>
        <h1 className="editorial-display-sm mb-3">Active roles.</h1>
        <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>
          Select a role to view applicant performance and filter by capability scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXAMPLE_ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className="text-left corp-card p-6 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>{role.department}</div>
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--lq-ink)' }}>
                  {role.title}
                </h2>
              </div>
              <span className="corp-chip">{role.openPositions} open</span>
            </div>
            <p className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>View applicants →</p>
          </button>
        ))}
      </div>
    </div>
  )
}
