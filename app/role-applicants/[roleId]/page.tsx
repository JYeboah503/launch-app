'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LaunchStandouts } from '@/components/launch-standouts'
import { MOCK_STUDENTS } from '@/lib/mock-data'
import { ChevronLeft } from 'lucide-react'

// Sample active roles data - in a real app, this would come from a database
const ACTIVE_ROLES = [
  {
    id: '1',
    name: 'Product Manager',
    skills: ['Leadership', 'Adaptability', 'Problem Solving', 'Collaboration'],
    questionsCount: 45,
    accessCode: 'PM-2024'
  },
  {
    id: '2',
    name: 'Data Scientist',
    skills: ['Problem Solving', 'Reasoning', 'Execution', 'EQ'],
    questionsCount: 50,
    accessCode: 'DS-2024'
  },
  {
    id: '3',
    name: 'Software Engineer',
    skills: ['Problem Solving', 'Execution', 'Collaboration', 'Integrity'],
    questionsCount: 55,
    accessCode: 'SE-2024'
  }
]

export default function RoleApplicantsPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.roleId as string
  
  const selectedRole = ACTIVE_ROLES.find(r => r.id === roleId)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  if (!selectedRole) {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-accent font-medium hover:underline mb-6"
          >
            <ChevronLeft size={20} />
            Back to Role
          </button>
          <div className="bg-card rounded-lg p-12 border border-border text-center">
            <p className="text-muted-foreground">Role not found.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-accent font-medium hover:underline mb-4"
          >
            <ChevronLeft size={20} />
            Back to Role
          </button>
          <h1 className="text-4xl font-bold">{selectedRole.name}</h1>
          <p className="text-muted-foreground mt-2">
            All Applicants • 100 candidates
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Skill Filters */}
          {selectedRole.skills && selectedRole.skills.length > 0 && (
            <div className="mb-8 p-6 bg-card border border-accent/20 rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-4">Filter by Skill:</p>
              <div className="flex flex-wrap gap-3">
                {selectedRole.skills.map((skill: string) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setSelectedSkill(selectedSkill === skill ? null : skill)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      selectedSkill === skill
                        ? 'bg-accent text-slate-900'
                        : 'border border-accent/30 text-muted-foreground hover:border-accent'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Applicants Grid - Show first 100 candidates */}
          <LaunchStandouts
            students={MOCK_STUDENTS.slice(0, 100)}
            onSelectStudent={() => {}}
          />
        </div>
      </div>
    </main>
  )
}
