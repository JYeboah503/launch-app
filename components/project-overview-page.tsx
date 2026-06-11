'use client'

import { ArrowLeft } from 'lucide-react'
import { MissionStructure, Mission } from '@/components/mission-structure'

interface ProjectOverviewPageProps {
  project: {
    id: string
    name: string
    description: string
    missions: Mission[]
  }
  onBack?: () => void
  onResumeMission?: () => void
}

export function ProjectOverviewPage({ project, onBack }: ProjectOverviewPageProps) {
  const completedMissions = project.missions.filter((m) =>
    m.subScenarios.every((s) => s.status === 'completed')
  ).length

  return (
    <div className="min-h-screen bg-background pt-12 pb-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="editorial-mono mb-8 inline-flex items-center gap-2"
        style={{ color: 'var(--lq-ink-2)' }}
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Dashboard
      </button>

      <div className="mb-10">
        <div className="editorial-eyebrow mb-2">Project</div>
        <h1 className="editorial-display-sm mb-4">{project.name}.</h1>
        <p className="editorial-lede max-w-3xl" style={{ color: 'var(--lq-ink-2)' }}>
          {project.description}
        </p>

        <div className="flex gap-4 pt-6 items-baseline">
          <span
            className="text-3xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              color: 'var(--launch-navy)',
              letterSpacing: '-0.02em',
            }}
          >
            {completedMissions}
          </span>
          <span className="editorial-mono">of {project.missions.length} missions complete</span>
        </div>
      </div>

      <div className="editorial-card p-8">
        <div className="editorial-eyebrow mb-6">Mission map</div>
        <MissionStructure missions={project.missions} />
      </div>
    </div>
  )
}
