'use client'

import { TrendingUp } from 'lucide-react'

interface StatMetric {
  icon: React.ReactNode
  label: string
  value: string | number
  unit: string
  color: string
  bgColor: string
  trend?: number
}

interface StatsboardProps {
  metrics: StatMetric[]
}

export function Statsboard({ metrics }: StatsboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-0 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group`}
          style={{
            background: `linear-gradient(135deg, ${metric.bgColor}, ${metric.color}15)`,
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at top right, ${metric.color}20, transparent)`,
            }}
          />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Icon and trend */}
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: metric.color + '20',
                  color: metric.color,
                }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6">
                  {metric.icon}
                </div>
              </div>
              {metric.trend !== undefined && (
                <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm" 
                  style={{
                    backgroundColor: metric.color + '20',
                    color: metric.color,
                  }}>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  {metric.trend}%
                </div>
              )}
            </div>

            {/* Label */}
            <p className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 opacity-75" style={{ color: metric.color }}>
              {metric.label}
            </p>

            {/* Value */}
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-3xl sm:text-5xl font-black" style={{ color: metric.color }}>
                {metric.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold opacity-60">{metric.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
