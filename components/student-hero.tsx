'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { StudentProfile } from '@/components/student-profile-view'

interface StudentHeroProps {
  student: StudentProfile
  onCapabilityClick?: (capabilityName: string) => void
}

export function StudentHero({ student, onCapabilityClick }: StudentHeroProps) {
  const [interest, setInterest] = useState('')

  const handleStartScenario = () => {
    if (interest.trim()) {
      console.log('[v0] Starting scenario with interest:', interest)
    }
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 md:p-12 lg:p-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[400px]">
        {/* Left Side - Launch Text */}
        <div className="flex flex-col justify-center">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold">
              <span className="text-lime-500 font-black tracking-tight">LAUNCH</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 font-light max-w-md">
              Explore scenarios tailored to your interests and unlock your potential
            </p>
          </div>
        </div>

        {/* Right Side - Input Box */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <label htmlFor="interest" className="block text-sm font-semibold text-gray-800">
              What interests you?
            </label>
            <input
              id="interest"
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Type your interest here"
              className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-colors placeholder-gray-400 text-gray-900"
              onKeyPress={(e) => e.key === 'Enter' && handleStartScenario()}
            />
          </div>

          <button
            onClick={handleStartScenario}
            disabled={!interest.trim()}
            className="group inline-flex items-center justify-between w-full px-6 py-4 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Start Random Scenario</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
