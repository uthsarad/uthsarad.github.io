import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Card3DProps = {
  children: ReactNode
  className?: string
  max?: number
}

// Pointer-tracked 3D tilt with a subtle glare.
export function Card3D({ children, className, max = 7 }: Card3DProps) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 18 })
  const sry = useSpring(ry, { stiffness: 150, damping: 18 })
  const reduce = useReducedMotion()

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set(-(py - 0.5) * max * 2)
  }

  function onLeave() {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className={cn('relative will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}
