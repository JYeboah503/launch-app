'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
}

interface QuickScenario {
  id: string
  name: string
  description: string
  company: string
}

interface ProjectsGalleryProps {
  projects: Project[]
  onBack: () => void
  onProjectSelect: (project: Project) => void
  onDashboard?: () => void
}

export function ProjectsGallery({ projects, onBack, onProjectSelect, onDashboard }: ProjectsGalleryProps) {
  const quickScenarios: QuickScenario[] = [
    { id: 'qs1', name: 'Supply Chain Optimization', description: 'Optimise inventory management and distribution networks', company: 'Nike' },
    { id: 'qs2', name: 'Crisis Management', description: 'Navigate and resolve unexpected business challenges', company: 'Apple' },
    { id: 'qs3', name: 'Market Expansion', description: 'Develop strategies for entering new geographic markets', company: 'Coca-Cola' },
    { id: 'qs4', name: 'Product Launch', description: 'Execute a successful new product introduction', company: 'Google' },
  ]

  return (
    <div className="min-h-screen bg-background pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top row */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="editorial-mono inline-flex items-center gap-2"
          style={{ color: 'var(--lq-ink-2)' }}
        >
          <ChevronLeft className="w-3 h-3" />
          Back
        </button>
        {onDashboard && (
          <button
            onClick={onDashboard}
            className="flex items-center gap-3"
          >
            <span className="brand-mark" aria-hidden />
            <span
              className="text-[12px] tracking-[0.22em] uppercase font-semibold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--lq-ink)' }}
            >
              LAUNCH
            </span>
          </button>
        )}
      </div>

      {/* All Projects Section */}
      <section className="mb-20">
        <div className="mb-10">
          <div className="editorial-eyebrow mb-2">Projects · all</div>
          <h2 className="editorial-display-sm">All projects.</h2>
          <p className="editorial-lede mt-3" style={{ color: 'var(--lq-ink-2)' }}>
            Continue your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <article
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => onProjectSelect(project)}
              onKeyDown={(e) => { if (e.key === 'Enter') onProjectSelect(project) }}
              className="editorial-card p-7 hover:-translate-y-[2px] hover:border-[var(--lq-ink-2)] transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="editorial-mono mb-3">Project</div>
                <h3
                  className="text-2xl sm:text-3xl mb-3 line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                  }}
                >
                  {project.name}
                </h3>
                <p
                  className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: 'var(--lq-ink-2)' }}
                >
                  {project.description}
                </p>
              </div>

              <Button
                onClick={(e) => { e.stopPropagation(); onProjectSelect(project) }}
                size="sm"
                variant="outline"
                className="self-start mt-6"
              >
                Resume <span aria-hidden>→</span>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Recent Quick Scenarios */}
      <section>
        <div className="mb-10">
          <div className="editorial-eyebrow mb-2">Quick scenarios · recent</div>
          <h2 className="editorial-display-sm">Recent quick scenarios.</h2>
          <p className="editorial-lede mt-3" style={{ color: 'var(--lq-ink-2)' }}>
            Short-form decisions to sharpen the way you read a room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="editorial-card p-6 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="editorial-mono mb-3">{scenario.company}</div>
                <h3
                  className="text-xl mb-3 line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.1,
                  }}
                >
                  {scenario.name}
                </h3>
                <p
                  className="text-sm leading-relaxed line-clamp-2"
                  style={{ color: 'var(--lq-ink-2)' }}
                >
                  {scenario.description}
                </p>
              </div>
              <span className="editorial-chip self-start mt-5">Completed</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
