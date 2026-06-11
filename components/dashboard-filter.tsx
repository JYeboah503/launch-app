'use client'

interface DashboardFilterProps {
  selectedCapabilities: string[]
  selectedInterests: string[]
  onCapabilitiesChange: (capabilities: string[]) => void
  onInterestsChange: (interests: string[]) => void
  onClear: () => void
}

const INTERESTS = ['Business', 'Tech', 'Policy', 'Sport', 'Creative', 'Social Impact']

export function DashboardFilter({
  selectedCapabilities,
  selectedInterests,
  onCapabilitiesChange,
  onInterestsChange,
  onClear,
}: DashboardFilterProps) {
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter((i) => i !== interest))
    } else {
      onInterestsChange([...selectedInterests, interest])
    }
  }

  const hasFilters = selectedCapabilities.length > 0 || selectedInterests.length > 0

  return (
    <section className="section-pad-sm">
      <div className="editorial-container">
        <div className="editorial-card p-7">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5">
            <div>
              <div className="editorial-eyebrow mb-1">Filter</div>
              <h3
                className="text-xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  letterSpacing: '-0.018em',
                }}
              >
                By interest
              </h3>
            </div>
            {hasFilters && (
              <button
                onClick={onClear}
                className="editorial-mono"
                style={{ color: 'var(--lq-ink-2)' }}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const active = selectedInterests.includes(interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 h-9 rounded-full transition-all border text-sm ${
                    active
                      ? 'bg-[var(--launch-lime)] border-[var(--launch-lime-2)] text-[var(--lq-ink)]'
                      : 'bg-transparent border-[var(--lq-line-2)] text-[var(--lq-ink-2)] hover:border-[var(--lq-ink-2)] hover:text-[var(--lq-ink)]'
                  }`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: active ? 600 : 500,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
