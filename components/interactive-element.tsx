'use client'

import { useState, useEffect } from 'react'

export function InteractiveElement() {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ x: 2, y: 2 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x
        let newY = prev.y + velocity.y
        let newVelX = velocity.x
        let newVelY = velocity.y

        if (newX <= 0 || newX >= 100) newVelX = -velocity.x
        if (newY <= 0 || newY >= 100) newVelY = -velocity.y

        setVelocity({ x: newVelX, y: newVelY })
        return { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [velocity])

  const handleClick = () => {
    setVelocity({ x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 })
  }

  return (
    <div className="relative w-full h-64 rounded-2xl bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30 border-2 border-lime-300 dark:border-lime-600 overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Moving ball */}
      <div
        className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-lime-500 to-green-500 shadow-lg transition-transform duration-300"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%) scale(' + (isHovered ? 1.3 : 1) + ')',
        }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-lime-200 opacity-50" />
        <div className="absolute inset-4 rounded-full border border-lime-100 opacity-30" />
      </div>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-950 text-center px-4">
          Click to play 🎮
        </p>
      </div>
    </div>
  )
}
