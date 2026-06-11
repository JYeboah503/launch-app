'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Student } from '@/components/student-list'

interface CreateChallengeProps {
  curatedList: { students: Student[], name: string } | null
  onBack: () => void
  onChallengeCreated: (challenge: any) => void
}

export function CreateChallenge({ curatedList, onBack, onChallengeCreated }: CreateChallengeProps) {
  const [step, setStep] = useState(1)
  const [challengeData, setChallengeData] = useState({
    title: '',
    description: '',
    industry: 'Technology',
    difficulty: 'Medium',
    skills: [] as string[],
    timeLimit: 60,
    questionCount: 3,
    scenarioType: 'Business'
  })

  const industries = ['Technology', 'Finance', 'Operations', 'Marketing', 'Design', 'Strategy', 'Sales', 'HR']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const skills = [
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
  const scenarioTypes = ['Business', 'Technical', 'Ethical', 'Strategic', 'Operational']

  const toggleSkill = (skill: string) => {
    setChallengeData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const generateAccessCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `LAUNCH-${new Date().getFullYear()}-${random}${timestamp.slice(-3)}`
  }

  const handleCreateChallenge = () => {
    if (!challengeData.title || !challengeData.description || challengeData.skills.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const accessCode = generateAccessCode()
    const challenge = {
      ...challengeData,
      accessCode,
      applicantCount: curatedList?.students.length || 0,
      applicantList: curatedList?.name || 'Selected Applicants',
      createdAt: new Date().toISOString()
    }

    onChallengeCreated(challenge)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
      <div className="relative z-10">
        {/* Header */}
      <div className="border-b border-[var(--lq-line)] sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="editorial-mono mb-6 inline-flex items-center gap-2"
            style={{ color: 'var(--lq-ink-2)' }}
          >
            <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
              <div>
                <div className="editorial-eyebrow mb-2">Challenge · new</div>
                <h1 className="editorial-display-sm">Create a challenge.</h1>
              </div>
              <span className="editorial-mono">Step {step} / 3</span>
            </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-[3px] flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-[var(--launch-navy)]' : 'bg-[var(--lq-line)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <div className="editorial-eyebrow mb-3">Step 1 · the brief</div>
              <h2 className="editorial-display-sm mb-3" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}>Challenge details.</h2>
              <p className="editorial-lede mb-6" style={{ color: 'var(--lq-ink-2)', fontSize: 16 }}>Define the core challenge your applicants will tackle.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="editorial-mono block mb-2">Challenge title *</label>
                <Input
                  placeholder="e.g., Market Entry Strategy, Supply Chain Optimization"
                  value={challengeData.title}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="editorial-mono block mb-2">Challenge description *</label>
                <textarea
                  placeholder="Describe the challenge, scenario, and what you want applicants to solve..."
                  value={challengeData.description}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none"
                  style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="editorial-mono block mb-2">Industry</label>
                  <select
                    value={challengeData.industry}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="editorial-mono block mb-2">Difficulty</label>
                  <select
                    value={challengeData.difficulty}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <div className="editorial-eyebrow mb-3">Step 2 · the shape</div>
              <h2 className="editorial-display-sm mb-3" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}>Required skills & customisation.</h2>
              <p className="editorial-lede mb-6" style={{ color: 'var(--lq-ink-2)', fontSize: 16 }}>Select the capabilities you want to measure and tune the parameters.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-4">Required Skills *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="p-3 text-left rounded-lg transition-all"
                      style={
                        challengeData.skills.includes(skill)
                          ? { background: 'rgba(10, 42, 107, 0.06)', border: '1px solid var(--launch-navy)' }
                          : { background: '#fff', border: '1px solid var(--lq-line-2)' }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={challengeData.skills.includes(skill)}
                          onChange={() => {}}
                          className="w-4 h-4"
                          style={{ accentColor: 'var(--launch-navy)' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-medium" style={{ color: 'var(--lq-ink)' }}>{skill}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Scenario Type</label>
                  <select
                    value={challengeData.scenarioType}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, scenarioType: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
                  >
                    {scenarioTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="editorial-mono block mb-2">Time limit (mins)</label>
                  <Input
                    type="number"
                    min="15"
                    max="180"
                    value={challengeData.timeLimit}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="editorial-mono block mb-2">Questions</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={challengeData.questionCount}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <div className="editorial-eyebrow mb-3">Step 3 · review</div>
              <h2 className="editorial-display-sm mb-3" style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}>Review & generate access code.</h2>
              <p className="editorial-lede mb-6" style={{ color: 'var(--lq-ink-2)', fontSize: 16 }}>Confirm the brief, then issue the code.</p>
            </div>

            <div className="corp-card p-8 space-y-6">
              <div>
                <div className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>Challenge</div>
                <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--lq-ink)' }}>{challengeData.title}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--lq-line)]">
                {[['Industry', challengeData.industry], ['Difficulty', challengeData.difficulty], ['Time limit', `${challengeData.timeLimit} mins`], ['Questions', challengeData.questionCount]].map(([label, value]) => (
                  <div key={String(label)}>
                    <div className="editorial-mono">{label as string}</div>
                    <p className="mt-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18 }}>{value as React.ReactNode}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--lq-line)]">
                <div className="editorial-mono mb-2">Description</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lq-ink-2)' }}>{challengeData.description}</p>
              </div>

              <div className="pt-4 border-t border-[var(--lq-line)]">
                <div className="editorial-mono mb-2">Required skills</div>
                <div className="flex flex-wrap gap-2">
                  {challengeData.skills.map(skill => (
                    <span key={skill} className="corp-chip">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--lq-line)]">
                <div className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>Applicants receiving this</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--lq-ink)' }}>{curatedList?.students.length} applicants from "{curatedList?.name}"</p>
              </div>
            </div>

            <div className="corp-card p-8" style={{ background: 'rgba(10, 42, 107, 0.05)', borderColor: 'rgba(10, 42, 107, 0.18)' }}>
              <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>Generated access code</div>
              <p className="text-4xl mb-2" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--launch-navy)' }}>{generateAccessCode()}</p>
              <p className="text-sm" style={{ color: 'var(--lq-ink-2)' }}>Share this code with your applicants to access the challenge.</p>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-3 justify-end fixed bottom-0 left-0 right-0 border-t border-[var(--lq-line)] z-30" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : onBack()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Back' : 'Previous'}
        </Button>
        {step < 3 && (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && (!challengeData.title || !challengeData.description)) ||
              (step === 2 && challengeData.skills.length === 0)
            }
            className="font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={handleCreateChallenge}
            className="font-semibold"
          >
            Create Challenge
          </Button>
        )}
      </div>

      {/* Padding for fixed buttons */}
      <div className="h-24" />
    </div>
  )
}
