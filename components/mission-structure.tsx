'use client'

import { CheckCircle2, Lock, ChevronRight } from 'lucide-react'

export interface SubScenario {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'locked'
}

export interface Mission {
  id: string
  title: string
  description: string
  subScenarios: SubScenario[]
}

interface MissionStructureProps {
  missions: Mission[]
  onSubScenarioClick?: (missionId: string, subScenarioId: string) => void
}

/**
 * MissionStructure — horizontal mission map.
 *
 * Each mission is an editorial card. The current mission is opened with its
 * sub-scenarios listed. Locked missions fade. Mirrors the LQ scenario flow's
 * tone: cream surfaces, navy ink, lime live-pulse markers, mono labels.
 */
export function MissionStructure({ missions, onSubScenarioClick }: MissionStructureProps) {
  // Find the current mission (one that has any current or incomplete sub-scenarios)
  const currentMissionId = missions.find((m) =>
    m.subScenarios.some((s) => s.status !== 'completed')
  )?.id

  return (
    <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
      {missions.map((mission, index) => {
        const isCurrent = mission.id === currentMissionId
        const isLocked = missions
          .slice(0, index)
          .some((m) => m.subScenarios.some((s) => s.status !== 'completed'))
        const completedSubScenarios = mission.subScenarios.filter(
          (s) => s.status === 'completed'
        ).length
        const total = mission.subScenarios.length
        const progress = total > 0 ? (completedSubScenarios / total) * 100 : 0

        return (
          <div
            key={mission.id}
            className="flex-shrink-0 min-w-[300px] sm:min-w-[340px] max-w-[360px] rounded-[22px] overflow-hidden transition-all duration-300"
            style={{
              background: isCurrent
                ? 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(220,228,243,0.50) 100%)'
                : 'rgba(255, 255, 255, 0.45)',
              border: `1px solid ${
                isCurrent ? 'var(--launch-navy)' : 'var(--lq-line)'
              }`,
              opacity: isLocked ? 0.42 : 1,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            {/* Mission Card Header */}
            <div className="p-6 sm:p-7 border-b border-[var(--lq-line)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="editorial-mono"
                    style={{
                      color: isCurrent
                        ? 'var(--launch-navy)'
                        : isLocked
                        ? 'var(--lq-ink-3)'
                        : 'var(--lq-ink-3)',
                    }}
                  >
                    Mission {String(index + 1).padStart(2, '0')}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--launch-lime)',
                        display: 'inline-block',
                        animation: 'missionPulse 1.6s ease-in-out infinite',
                      }}
                      aria-hidden
                    />
                  )}
                </div>
                {isLocked && <Lock className="w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />}
              </div>

              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 22,
                  letterSpacing: '-0.018em',
                  lineHeight: 1.2,
                  color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink)',
                }}
              >
                {mission.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{
                  color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink-2)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                }}
              >
                {mission.description}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 h-[3px] rounded-full overflow-hidden"
                  style={{ background: 'rgba(14, 24, 51, 0.10)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: isCurrent ? 'var(--launch-navy)' : 'var(--lq-ink-3)',
                    }}
                  />
                </div>
                <span
                  className="editorial-mono"
                  style={{
                    color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink-2)',
                    minWidth: 40,
                    textAlign: 'right',
                  }}
                >
                  {completedSubScenarios}/{total}
                </span>
              </div>
            </div>

            {/* Sub-Scenarios */}
            {isCurrent ? (
              <div className="p-6 sm:p-7 pt-5 space-y-2 max-h-96 overflow-y-auto">
                {mission.subScenarios.map((subScenario) => (
                  <SubScenarioCard
                    key={subScenario.id}
                    subScenario={subScenario}
                    onClick={() => onSubScenarioClick?.(mission.id, subScenario.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 sm:px-7 py-4 flex items-center justify-between">
                <span
                  className="editorial-mono"
                  style={{ color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink-2)' }}
                >
                  {isLocked ? 'Locked' : 'Upcoming'}
                </span>
                {!isLocked && (
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />
                )}
              </div>
            )}
          </div>
        )
      })}
      <style>{`
        @keyframes missionPulse {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(27, 158, 143, 0.55); }
          50%      { transform: scale(1.4); opacity: 0.7; box-shadow: 0 0 0 5px rgba(27, 158, 143, 0); }
        }
      `}</style>
    </div>
  )
}

interface SubScenarioCardProps {
  subScenario: SubScenario
  onClick?: () => void
}

function SubScenarioCard({ subScenario, onClick }: SubScenarioCardProps) {
  const isLocked = subScenario.status === 'locked'
  const isCompleted = subScenario.status === 'completed'
  const isCurrent = subScenario.status === 'current'

  const baseStyle: React.CSSProperties = {
    background: isCurrent
      ? 'rgba(27, 158, 143, 0.12)'
      : isCompleted
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(255, 255, 255, 0.4)',
    border: `1px solid ${
      isCurrent
        ? 'var(--launch-lime-2)'
        : isLocked
        ? 'rgba(14, 24, 51, 0.06)'
        : 'var(--lq-line)'
    }`,
    opacity: isLocked ? 0.5 : 1,
    cursor: isLocked ? 'not-allowed' : 'pointer',
    borderRadius: 14,
  }

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="w-full text-left p-3.5 transition-all duration-200 hover:translate-x-[2px]"
      style={baseStyle}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5 flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--launch-lime-3)' }} />
          ) : isLocked ? (
            <Lock className="w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} />
          ) : isCurrent ? (
            <span
              className="block"
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid var(--launch-lime-2)',
                position: 'relative',
              }}
            >
              <span
                className="block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--launch-lime)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'missionPulse 1.6s ease-in-out infinite',
                }}
              />
            </span>
          ) : (
            <span
              className="block"
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid var(--lq-line-2)',
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 15,
              letterSpacing: '-0.012em',
              color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink)',
              lineHeight: 1.3,
            }}
          >
            {subScenario.title}
          </h4>
          <p
            className="text-xs mt-1"
            style={{
              color: isLocked ? 'var(--lq-ink-3)' : 'var(--lq-ink-2)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
            }}
          >
            {subScenario.description}
          </p>
        </div>
      </div>
    </button>
  )
}
