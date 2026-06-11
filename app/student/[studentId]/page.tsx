'use client'

import { useRouter, useParams } from 'next/navigation'
import { StudentProfileView } from '@/components/student-profile-view'
import { MOCK_STUDENTS, STUDENT_PROFILES } from '@/lib/mock-data'
import { ChevronLeft } from 'lucide-react'

export default function StudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string

  // Find the student from mock data
  const student = MOCK_STUDENTS.find(s => s.id === studentId)
  const studentProfile = STUDENT_PROFILES[studentId]

  if (!student || !studentProfile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-accent font-medium hover:underline mb-8"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Student Not Found</h1>
            <p className="text-muted-foreground">The student profile you're looking for could not be found.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-accent font-medium hover:underline mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        
        <StudentProfileView
          student={studentProfile}
          onContactClick={() => {
            alert(`Contact request for ${student.name} submitted through LAUNCH platform`)
          }}
          onChallengesClick={() => {
            // This could navigate to challenges if needed
          }}
        />
      </div>
    </main>
  )
}
