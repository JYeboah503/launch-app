'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CAPABILITIES = [
  'Judgement & Decision-Making',
  'Reasoning & Critical Thinking',
  'Problem Solving',
  'Leadership & Influence',
  'Adaptability & Cognitive Flexibility',
  'Emotional Intelligence',
  'Execution & Ownership',
  'Integrity & Ethics',
  'Collaboration',
  'Situational Awareness',
]

const INTERESTS = [
  'Technology',
  'Finance',
  'Marketing',
  'Product',
  'Operations',
  'Design',
  'Sales',
]

interface CapabilityFilterProps {
  selectedCapabilities: string[]
  selectedInterests: string[]
  strengthLevel: number
  onCapabilitiesChange: (capabilities: string[]) => void
  onInterestsChange: (interests: string[]) => void
  onStrengthLevelChange: (level: number) => void
}

export function CapabilityFilter({
  selectedCapabilities,
  selectedInterests,
  strengthLevel,
  onCapabilitiesChange,
  onInterestsChange,
  onStrengthLevelChange,
}: CapabilityFilterProps) {
  const toggleCapability = (capability: string) => {
    const updated = selectedCapabilities.includes(capability)
      ? selectedCapabilities.filter((c) => c !== capability)
      : [...selectedCapabilities, capability]
    onCapabilitiesChange(updated)
  }

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest]
    onInterestsChange(updated)
  }

  return (
    <div className="space-y-8">
      {/* Capabilities Section */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Core Capabilities</h3>
        <div className="grid grid-cols-2 gap-3">
          {CAPABILITIES.map((capability) => (
            <button
              key={capability}
              onClick={() => toggleCapability(capability)}
              className={cn(
                'px-4 py-3 rounded-full text-sm font-medium transition-all duration-200',
                selectedCapabilities.includes(capability)
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              )}
            >
              {capability}
            </button>
          ))}
        </div>
      </div>

      {/* Strength Level */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Capability Strength</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100"
            value={strengthLevel}
            onChange={(e) => onStrengthLevelChange(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Any</span>
            <span className="font-medium">{strengthLevel}%</span>
            <span>Expert</span>
          </div>
        </div>
      </div>

      {/* Student Interests */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Student Interests</h3>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                selectedInterests.includes(interest)
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              )}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
