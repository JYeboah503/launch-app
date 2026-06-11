'use client'

import { useEffect, useRef } from 'react'

interface CapabilitySpiderChartProps {
  capabilities: Array<{ name: string; level: number }>
  size?: number
}

export function CapabilitySpiderChart({
  capabilities,
  size = 500,
}: CapabilitySpiderChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || capabilities.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) / 2 - 80

    // Clear canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const numCapabilities = Math.min(capabilities.length, 10) // Show up to 10 capabilities
    const angleSlice = (Math.PI * 2) / numCapabilities

    // Color palette for capabilities
    const colors = [
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#EF4444', // red
      '#F97316', // orange
      '#EAB308', // yellow
      '#10B981', // emerald
      '#06B6D4', // cyan
      '#6366F1', // indigo
      '#14B8A6', // teal
    ]

    // Draw grid circles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1.5
    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw radial lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < numCapabilities; i++) {
      const x = centerX + radius * Math.cos(angleSlice * i - Math.PI / 2)
      const y = centerY + radius * Math.sin(angleSlice * i - Math.PI / 2)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    // Draw data polygon with color gradient
    ctx.lineWidth = 3.5
    ctx.beginPath()

    for (let i = 0; i < numCapabilities; i++) {
      const value = Math.min(capabilities[i].level / 100, 1)
      const r = radius * value
      const x = centerX + r * Math.cos(angleSlice * i - Math.PI / 2)
      const y = centerY + r * Math.sin(angleSlice * i - Math.PI / 2)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    // Fill with semi-transparent color
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'
    ctx.fill()

    // Create gradient stroke
    const firstAngle = -Math.PI / 2
    const x1 = centerX + Math.cos(firstAngle)
    const y1 = centerY + Math.sin(firstAngle)
    const lastAngle = angleSlice * (numCapabilities - 1) - Math.PI / 2
    const x2 = centerX + Math.cos(lastAngle)
    const y2 = centerY + Math.sin(lastAngle)

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(0.5, colors[Math.floor(numCapabilities / 2)])
    gradient.addColorStop(1, colors[numCapabilities - 1])
    
    ctx.strokeStyle = gradient
    ctx.stroke()

    // Draw colored data points with values
    for (let i = 0; i < numCapabilities; i++) {
      const value = Math.min(capabilities[i].level / 100, 1)
      const r = radius * value
      const x = centerX + r * Math.cos(angleSlice * i - Math.PI / 2)
      const y = centerY + r * Math.sin(angleSlice * i - Math.PI / 2)
      
      // Outer circle (glow)
      ctx.fillStyle = colors[i] + '40'
      ctx.beginPath()
      ctx.arc(x, y, 11, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      ctx.fillStyle = colors[i]
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Value text with white background for contrast
      const percentText = capabilities[i].level + '%'
      ctx.fillStyle = colors[i]
      ctx.font = 'bold 18px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      
      // Measure text and draw background
      const metrics = ctx.measureText(percentText)
      const textWidth = metrics.width
      const textHeight = 20
      const padding = 4
      
      // White background for text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fillRect(
        x - textWidth / 2 - padding,
        y - textHeight - 6 - padding,
        textWidth + padding * 2,
        textHeight + padding
      )
      
      // Text
      ctx.fillStyle = colors[i]
      ctx.font = 'bold 18px system-ui'
      ctx.fillText(percentText, x, y - 6)
    }

    // Draw labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    
    for (let i = 0; i < numCapabilities; i++) {
      const angle = angleSlice * i - Math.PI / 2
      const labelRadius = radius + 65
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)

      // Split long labels intelligently
      const label = capabilities[i].name
      const words = label.split(' ')
      
      if (words.length > 2) {
        // Split into multiple lines
        const mid = Math.ceil(words.length / 2)
        const line1 = words.slice(0, mid).join(' ')
        const line2 = words.slice(mid).join(' ')
        
        ctx.fillText(line1, x, y - 12)
        ctx.fillText(line2, x, y + 8)
      } else if (words.length === 2) {
        ctx.fillText(label, x, y)
      } else {
        ctx.fillText(label, x, y)
      }
    }

  }, [capabilities])

  return (
    <div className="flex justify-center w-full">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="drop-shadow-lg"
      />
    </div>
  )
}
