'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface PartnerSignup {
  companyName: string
  companyEmail: string
  industry: string
  companySize: string
  location: string
  contactName: string
  contactEmail: string
  contactPosition: string
}

interface PartnerAuthViewProps {
  onSignup: (data: PartnerSignup) => void
  onBack: () => void
}

const INDUSTRIES = [
  'Technology', 'Finance', 'Consulting', 'Retail', 'Healthcare',
  'Manufacturing', 'Education', 'Government', 'Real Estate', 'Other',
]

const COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1000+']

export function PartnerAuthView({ onSignup, onBack }: PartnerAuthViewProps) {
  const [step, setStep] = useState<'company' | 'contact' | 'review'>('company')
  const [formData, setFormData] = useState<PartnerSignup>({
    companyName: '', companyEmail: '', industry: '', companySize: '',
    location: '', contactName: '', contactEmail: '', contactPosition: '',
  })

  const stepIdx = step === 'company' ? 1 : step === 'contact' ? 2 : 3

  const handleNext = () => {
    if (step === 'company') {
      if (formData.companyName && formData.companyEmail && formData.industry && formData.companySize && formData.location) {
        setStep('contact')
      }
    } else if (step === 'contact') {
      if (formData.contactName && formData.contactEmail && formData.contactPosition) {
        setStep('review')
      }
    }
  }
  const handleSubmit = () => onSignup(formData)

  const canProceedCompany = formData.companyName && formData.companyEmail && formData.industry && formData.companySize && formData.location
  const canProceedContact = formData.contactName && formData.contactEmail && formData.contactPosition

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <button
          onClick={onBack}
          className="editorial-mono mb-12 block"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          ← Back
        </button>

        {/* Top eyebrow */}
        <div className="mb-10">
          <div className="editorial-eyebrow mb-4">Sign up · partner</div>
          <h1 className="editorial-display-sm mb-4">
            {step === 'company' && 'Find the people who actually move teams.'}
            {step === 'contact' && 'Who should we talk to?'}
            {step === 'review' && 'Almost there.'}
          </h1>
          <p className="editorial-lede" style={{ color: 'var(--lq-ink-2)' }}>
            {step === 'company' && "Tell us about your company. We'll surface the candidates whose decision-making fits."}
            {step === 'contact' && `Who's the lead at ${formData.companyName || 'your team'}?`}
            {step === 'review' && 'Review your information before getting started.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-10 items-center">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-[3px] flex-1 rounded-full transition-colors ${s <= stepIdx ? 'bg-[var(--launch-navy)]' : 'bg-[var(--lq-line)]'}`}
            />
          ))}
          <span className="editorial-mono ml-3">{stepIdx} / 3</span>
        </div>

        <div className="editorial-card p-8 space-y-6">
          {step === 'company' && (
            <>
              <Field label="Company name">
                <Input
                  type="text"
                  placeholder="Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </Field>
              <Field label="Company email">
                <Input
                  type="email"
                  placeholder="hiring@acme.com"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                />
              </Field>
              <Field label="Industry">
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-5 h-11 rounded-full bg-[rgba(255,255,255,0.5)] border border-[var(--lq-line-2)] text-[var(--lq-ink)] font-medium"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </Field>
              <Field label="Company size">
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full px-5 h-11 rounded-full bg-[rgba(255,255,255,0.5)] border border-[var(--lq-line-2)] text-[var(--lq-ink)] font-medium"
                >
                  <option value="">Select company size</option>
                  {COMPANY_SIZES.map((size) => <option key={size} value={size}>{size} employees</option>)}
                </select>
              </Field>
              <Field label="Location">
                <Input
                  type="text"
                  placeholder="Melbourne, Australia"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Field>

              <Button onClick={handleNext} disabled={!canProceedCompany} size="lg" className="w-full">
                Next →
              </Button>
            </>
          )}

          {step === 'contact' && (
            <>
              <Field label="Full name">
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </Field>
              <Field label="Email address">
                <Input
                  type="email"
                  placeholder="jane@acme.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </Field>
              <Field label="Position">
                <Input
                  type="text"
                  placeholder="Head of Talent"
                  value={formData.contactPosition}
                  onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                />
              </Field>

              <div className="flex gap-3">
                <Button onClick={() => setStep('company')} variant="outline" size="lg" className="flex-1">Back</Button>
                <Button onClick={handleNext} disabled={!canProceedContact} size="lg" className="flex-1">Review →</Button>
              </div>
            </>
          )}

          {step === 'review' && (
            <>
              <ReviewRow label="Company">{formData.companyName}</ReviewRow>
              <ReviewRow label="Location · industry">{formData.location} · {formData.industry}</ReviewRow>
              <ReviewRow label="Size">{formData.companySize} employees</ReviewRow>
              <ReviewRow label="Key contact">
                <span className="block">{formData.contactName}</span>
                <span className="block editorial-mono mt-1" style={{ letterSpacing: '0.04em' }}>
                  {formData.contactPosition} · {formData.contactEmail}
                </span>
              </ReviewRow>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep('contact')} variant="outline" size="lg" className="flex-1">Edit</Button>
                <Button onClick={handleSubmit} size="lg" className="flex-1">Step in →</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="editorial-mono block mb-2">{label}</label>
      {children}
    </div>
  )
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--lq-line)] first:border-t-0 first:pt-0 pt-5">
      <div className="editorial-mono mb-2">{label}</div>
      <div
        className="text-lg"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--lq-ink)',
          fontWeight: 500,
        }}
      >
        {children}
      </div>
    </div>
  )
}
