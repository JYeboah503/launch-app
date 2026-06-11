'use client'

import { useState, useEffect } from 'react'

interface FlipCardProps {
  skills: string[]
}

export function SkillFlipCard({ skills }: FlipCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleMouseEnter = () => {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % skills.length)
        setIsFlipped(true)
      }, 2000)
    }

    const handleMouseLeave = () => {
      clearInterval(timer)
      setIsFlipped(false)
    }

    const element = document.getElementById('skill-flip-card')
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
        clearInterval(timer)
      }
    }
  }, [skills])

  return (
    <div
      id="skill-flip-card"
      className="w-full h-48 flex items-center justify-center perspective cursor-pointer"
    >
      <div
        className={`relative w-full h-full transition-all duration-500 transform`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full flex items-center justify-center text-center px-4"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <p className="text-4xl md:text-5xl font-black text-[var(--launch-navy)]">
            {skills[0]}
          </p>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full flex items-center justify-center text-center px-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-4xl md:text-5xl font-black text-[var(--launch-navy)]">
            {skills[currentIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
