import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SparklesProps = {
  className?: string
  density?: number
  color?: string
}

// Lightweight canvas of drifting, twinkling particles.
export function Sparkles({
  className,
  density = 48,
  color = 'rgba(59,130,246,0.85)',
}: SparklesProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    if (reduce) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let t = 0

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const actualDensity = isMobile ? Math.max(12, Math.floor(density * 0.5)) : density

    const parts = Array.from({ length: actualDensity }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      s: Math.random() * 0.4 + 0.1,
      p: Math.random() * Math.PI * 2,
    }))

    function resize() {
      if (!c) return
      const r = c.getBoundingClientRect()
      w = r.width
      h = r.height
      c.width = Math.max(1, w * dpr)
      c.height = Math.max(1, h * dpr)
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function frame() {
      if (!ctx || w === 0 || h === 0) return
      ctx.clearRect(0, 0, w, h)
      t += 0.01
      for (const s of parts) {
        const a = (Math.sin(t * s.s * 6 + s.p) + 1) / 2
        const x = s.x * w
        let y = (s.y * h + Math.sin(t + s.p) * 6) % h
        if (y < 0) y += h
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.globalAlpha = a * 0.8
        ctx.fillStyle = color
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density, color, reduce])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
