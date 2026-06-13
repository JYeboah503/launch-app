'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Plus, ChevronLeft } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { CandidateName } from '@/components/candidate-name'

interface ApplicantCuratorProps {
  students: Student[]
  onBack: () => void
  onCuratedListCreated: (curatedStudents: Student[], listName: string) => void
}

export function ApplicantCurator({ students, onBack, onCuratedListCreated }: ApplicantCuratorProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterInterest, setFilterInterest] = useState<string>('')
  const [filterMinScore, setFilterMinScore] = useState<number>(80)
  const [listName, setListName] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)

  const allInterests = useMemo(() => {
    const interests = new Set<string>()
    students.forEach(s => s.interests?.forEach(i => interests.add(i)))
    return Array.from(interests).sort()
  }, [students])

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.degree.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesInterest = !filterInterest || student.interests.includes(filterInterest)
      const matchesScore = student.overallScore >= filterMinScore
      return matchesSearch && matchesInterest && matchesScore
    })
  }, [students, searchTerm, filterInterest, filterMinScore])

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleCreateList = () => {
    if (listName.trim() && selectedStudents.size > 0) {
      const curatedStudents = students.filter(s => selectedStudents.has(s.id))
      onCuratedListCreated(curatedStudents, listName)
      setShowNameModal(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
      {/* Page header — sits below the CorporateTopBar (no double stick) */}
      <div className="border-b border-[var(--lq-line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
            <div>
              <div className="editorial-eyebrow mb-2" style={{ color: 'var(--lq-ink-3)' }}>Talent · curate</div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'clamp(28px, 3.4vw, 40px)',
                  letterSpacing: '-0.022em',
                  lineHeight: 1.08,
                  color: 'var(--lq-ink)',
                }}
              >
                Curate applicants.
              </h1>
              <p className="max-w-[56ch] text-base mt-2" style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}>
                Build a short-list. Filter by score, interests, or search by
                name — then name your list and create a challenge for them.
              </p>
            </div>
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>{filteredStudents.length} candidates</span>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />
              <Input
                placeholder="Search name or degree..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterInterest}
              onChange={(e) => setFilterInterest(e.target.value)}
              className="px-4 py-2 rounded-lg"
              style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
            >
              <option value="">All Interests</option>
              {allInterests.map(interest => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--lq-ink-3)' }}>Min Score: {filterMinScore}</label>
              <input
                type="range"
                min="70"
                max="95"
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--launch-navy)' }}
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold" style={{ color: 'var(--lq-ink)' }}>{selectedStudents.size} Selected</p>
              <p className="text-xs" style={{ color: 'var(--lq-ink-3)' }}>{filteredStudents.length} Matching</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg" style={{ background: 'rgba(10, 42, 107, 0.06)' }}>
          <input
            type="checkbox"
            checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
            onChange={handleSelectAll}
            className="w-5 h-5 rounded"
            style={{ accentColor: 'var(--launch-navy)' }}
          />
          <span className="font-semibold text-sm" style={{ color: 'var(--lq-ink)' }}>
            {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </span>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => handleSelectStudent(student.id)}
              className="corp-card p-4 cursor-pointer"
              style={
                selectedStudents.has(student.id)
                  ? { borderColor: 'var(--launch-navy)', background: 'rgba(10, 42, 107, 0.04)' }
                  : undefined
              }
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.has(student.id)}
                  onChange={() => {}}
                  className="w-5 h-5 rounded mt-1"
                  style={{ accentColor: 'var(--launch-navy)' }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--lq-ink)' }}><CandidateName name={student.name} /></h3>
                  <p className="text-xs" style={{ color: 'var(--lq-ink-3)' }}>{student.degree}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {student.interests.map(interest => (
                      <span key={interest} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(14,24,51,0.06)', color: 'var(--lq-ink-2)' }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <span className="editorial-mono" style={{ color: 'var(--launch-navy)' }}>Score · {student.overallScore}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--lq-ink-2)' }}>ATAR: {student.atar}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: 'var(--lq-ink-3)' }}>No students match your filters</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {selectedStudents.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--lq-line)] p-4" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="font-semibold" style={{ color: 'var(--lq-ink)' }}>{selectedStudents.size} applicants selected</p>
            <button onClick={() => setShowNameModal(true)} className="corp-btn corp-btn-primary">
              Create list
            </button>
          </div>
        </div>
      )}

      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="corp-card shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div><div className="editorial-eyebrow mb-2" style={{ color: 'var(--lq-ink-3)' }}>Curated list</div><h2 className="editorial-display-sm" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', color: 'var(--lq-ink)' }}>Name your list.</h2></div>
              <button
                onClick={() => setShowNameModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              placeholder="e.g., Summer Interns 2024, Finance Team Candidates"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNameModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateList}
                disabled={!listName.trim()}
                className="flex-1"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
