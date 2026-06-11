'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface StudentSignup {
  name: string
  email: string
  university: string
  institutionType: 'university' | 'school'
  yearOfStudy?: string
  degree?: string
  gpa?: number
  atar?: number
}

interface StudentAuthViewProps {
  onSignup: (data: StudentSignup) => void
  onBack: () => void
}

const INTERESTS = [
  'Product',
  'Technology',
  'Strategy',
  'Finance',
  'Marketing',
  'Operations',
  'Design',
  'Sales',
  'Leadership',
  'Innovation',
]

export function StudentAuthView({ onSignup, onBack }: StudentAuthViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<StudentSignup>({
    name: '',
    email: '',
    university: '',
    institutionType: 'university',
    yearOfStudy: undefined,
    degree: '',
    gpa: undefined,
    atar: undefined,
  })

  const handleNext = () => {
    if (step === 1 && formData.name && formData.email) {
      setStep(2)
    } else if (step === 2 && formData.university && formData.institutionType) {
      setStep(3)
    }
  }

  const handleSubmit = () => {
    onSignup(formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={onBack}
          className="editorial-mono mb-8"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          ← Back
        </button>
        <div className="editorial-eyebrow mb-4">Sign up · student</div>
        <h1 className="editorial-display-sm mb-4">Step in.</h1>
        <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>
          Discover your capabilities and unlock the kind of opportunity that
          actually fits the way you think.
        </p>
      </div>

      {/* Form */}
      <div className="editorial-card p-8 space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="editorial-mono block mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="Sarah Chen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>
              <label className="editorial-mono block mb-2">Email</label>
              <Input
                type="email"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
          </div>
        )}

        {/* Step 2: Institution Name and Type Toggle */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="editorial-mono block mb-2">Institution Name</label>
              <Input
                type="text"
                placeholder="University of Melbourne"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
            </div>

            <div>
              <label className="editorial-mono block mb-3">Type of Institution</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, institutionType: 'university' })}
                  className={`px-6 py-4 rounded-[14px] font-medium transition-all border ${
                    formData.institutionType === 'university'
                      ? 'bg-[var(--launch-lime)] text-[var(--lq-ink)] border-[var(--launch-lime-2)]'
                      : 'bg-transparent border-[var(--lq-line-2)] text-[var(--lq-ink)] hover:border-[var(--lq-ink-2)]'
                  }`}
                >
                  University
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, institutionType: 'school' })}
                  className={`px-6 py-4 rounded-[14px] font-medium transition-all border ${
                    formData.institutionType === 'school'
                      ? 'bg-[var(--launch-lime)] text-[var(--lq-ink)] border-[var(--launch-lime-2)]'
                      : 'bg-transparent border-[var(--lq-line-2)] text-[var(--lq-ink)] hover:border-[var(--lq-ink-2)]'
                  }`}
                >
                  School
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Year of Study and Additional Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="editorial-mono block mb-2">
                {formData.institutionType === 'university' ? 'Year of study' : 'School year'}
              </label>
              <select
                value={formData.yearOfStudy || ''}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className="w-full px-5 h-11 rounded-full bg-[rgba(255,255,255,0.5)] border border-[var(--lq-line-2)] text-[var(--lq-ink)] font-medium"
              >
                <option value="">Select a year</option>
                {formData.institutionType === 'university' ? (
                  <>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5+">Year 5+</option>
                  </>
                ) : (
                  <>
                    <option value="7">Year 7</option>
                    <option value="8">Year 8</option>
                    <option value="9">Year 9</option>
                    <option value="10">Year 10</option>
                    <option value="11">Year 11</option>
                    <option value="12">Year 12</option>
                  </>
                )}
              </select>
            </div>

            {formData.institutionType === 'university' && (
              <>
                <div>
                  <label className="editorial-mono block mb-2">Degree / Program (optional)</label>
                  <Input
                    type="text"
                    placeholder="Commerce, Engineering, etc."
                    value={formData.degree || ''}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        />
                </div>
                <div>
                  <label className="editorial-mono block mb-2">GPA (optional)</label>
                  <Input
                    type="number"
                    placeholder="3.5"
                    step="0.1"
                    min="0"
                    max="4.0"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : undefined })}
                        />
                </div>
              </>
            )}

            {formData.institutionType === 'school' && (
              <div>
                <label className="editorial-mono block mb-2">ATAR (optional)</label>
                <Input
                  type="number"
                  placeholder="99.5"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.atar || ''}
                  onChange={(e) => setFormData({ ...formData, atar: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
              </div>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex gap-2 pt-4 items-center">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-[3px] flex-1 rounded-full transition-colors ${s <= step ? 'bg-[var(--launch-navy)]' : 'bg-[var(--lq-line)]'}`}
            />
          ))}
          <span className="editorial-mono ml-3">{step} / 3</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              type="button"
              onClick={() => setStep((s) => {
                if (s === 1) return 1
                return (s - 1) as 1 | 2 | 3
              })}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Back
            </Button>
          )}
          {step < 3 && (
            <Button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.name || !formData.email)) ||
                (step === 2 && (!formData.university || !formData.institutionType))
              }
              size="lg"
              className="flex-1"
            >
              Next →
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.yearOfStudy}
              size="lg"
              className="flex-1"
            >
              Step in →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
