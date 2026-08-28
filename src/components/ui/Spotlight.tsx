import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SpotlightProps = {
  children: ReactNode
  className?: string
  intensity?: number
  radius?: number
}

// A violet radial highlight that tracks the pointer across the container.
export function Spotlight({
  children,
  className,
  intensity = 0.55,
  radius = 320,
}: SpotlightProps) {
  const [pos, setPos] = useState({ x: 0, y: 0, active: false })

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top, active: true })
  }

  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      onMouseMove={onMove}
      onMouseLeave={() => setPos((p) => ({ ...p, active: false }))}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: pos.active ? intensity : 0,
          background: `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.28), transparent 70%)`,
        }}
      />
    </div>
  )
}
