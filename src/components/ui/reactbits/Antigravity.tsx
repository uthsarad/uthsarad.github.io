// Motion adapted from React Bits Antigravity by David Haz.
// Its magnetic ring, depth projection, waves, and easing use a bounded Canvas2D
// renderer here instead of Three/Fiber. See THIRD_PARTY_NOTICES.md.
import { useEffect, useRef, type PointerEvent } from 'react'

const fraction = (value: number) => value - Math.floor(value)
const seeds = Array.from({ length: 224 }, (_, i) => ({
  x: fraction(Math.sin(i * 127.1 + 13) * 43758.5453) - 0.5,
  y: fraction(Math.sin(i * 311.7 + 7) * 19341.592) - 0.5,
  z: fraction(Math.sin(i * 73.3 + 19) * 29341.327) - 0.5,
}))

export default function Antigravity({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enabledRef = useRef(enabled)
  const update = useRef<() => void>()
  const pointer = useRef({ x: 0, y: 0, moved: -10, step: 0 })
  const clock = useRef(0)
  useEffect(() => {
    enabledRef.current = enabled
    update.current?.()
  }, [enabled])

  function steer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' && event.type !== 'pointerdown') return
    const rect = event.currentTarget.getBoundingClientRect()
    pointer.current.x = (event.clientX - rect.left) / rect.width - 0.5
    pointer.current.y = 0.5 - (event.clientY - rect.top) / rect.height
    pointer.current.moved = clock.current
    if (!enabled) update.current?.()
  }
  function shift() {
    const step = ++pointer.current.step
    pointer.current.x = Math.sin(step * 2.4) * 0.22
    pointer.current.y = Math.cos(step * 2.4) * 0.18
    pointer.current.moved = clock.current
    update.current?.()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return
    const particles = seeds.map(seed => ({ ...seed, cx: 0, cy: 0, cz: 0 }))
    let frame = 0,
      previous = 0,
      elapsed = 0,
      virtualX = 0,
      virtualY = 0
    let initialized = false,
      lost = false
    const draw = (snap = false, delta = 1 / 30) => {
      if (lost) return
      const width = canvas.width, height = canvas.height
      const worldHeight = 20, worldWidth = worldHeight * width / height
      const active = enabledRef.current
      const idle = active && elapsed - pointer.current.moved > 2.5
      const destX = idle
        ? Math.sin(elapsed * 0.35) * worldWidth * 0.14
        : pointer.current.x * worldWidth
      const destY = idle
        ? Math.cos(elapsed * 0.7) * worldHeight * 0.12
        : pointer.current.y * worldHeight
      const blend = snap ? 1 : 1 - Math.exp(-delta * 4.5)
      virtualX += (destX - virtualX) * blend
      virtualY += (destY - virtualY) * blend
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      const unit = height / worldHeight
      const ringRadius = 6.2
      particles.forEach((particle, i) => {
        const mx = particle.x * worldWidth, my = particle.y * worldHeight
        const mz = particle.z * 12
        const projection = 1 - particle.cz / 50
        const targetX = virtualX * projection, targetY = virtualY * projection
        const dx = mx - targetX, dy = my - targetY
        const distance = Math.hypot(dx, dy)
        const phase = elapsed * (0.4 + particle.z * 0.2) + i * 0.2
        let x = mx, y = my, z = mz
        if (distance < 10) {
          const angle = Math.atan2(dy, dx) + elapsed * 0.06
          const wave = Math.sin(phase + angle) * 0.45
          const radius = ringRadius + wave + particle.z * 1.1
          x = targetX + radius * Math.cos(angle)
          y = targetY + radius * Math.sin(angle)
          z += Math.sin(phase) * 0.7
        }
        particle.cx += (x - particle.cx) * blend
        particle.cy += (y - particle.cy) * blend
        particle.cz += (z - particle.cz) * blend
        const depth = 1 / (1 - particle.cz / 50)
        const distFromRing = Math.abs(Math.hypot(particle.cx - targetX, particle.cy - targetY) - ringRadius)
        const size = Math.max(0, 1 - distFromRing / 10) * (0.8 + Math.sin(phase * 3) * 0.16)
        if (size < 0.06) return
        const angle = Math.atan2(particle.cy - targetY, particle.cx - targetX)
        const px = width / 2 + particle.cx * depth * unit
        const py = height / 2 - particle.cy * depth * unit
        const length = (0.14 + (particle.z + 0.5) * 0.2) * unit * size * depth
        const vx = Math.cos(angle) * length, vy = -Math.sin(angle) * length
        context.globalAlpha = Math.min(1, 0.45 + size * 0.55)
        context.strokeStyle = ['#79afff', '#acd6ff', '#5bc8eb'][i % 3]
        context.lineWidth = Math.max(1, unit * 0.1 * size * depth)
        context.beginPath()
        context.moveTo(px - vx, py - vy)
        context.lineTo(px + vx, py + vy)
        context.stroke()
      })
      context.globalAlpha = 1
    }
    const tick = (now: number) => {
      frame = 0
      if (!enabledRef.current || document.hidden || lost) return
      if (now - previous >= 1000 / 30) {
        const delta = Math.min((now - previous) / 1000, 0.1)
        elapsed += delta
        clock.current = elapsed
        previous = now
        draw(false, delta)
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      const running = enabledRef.current && !document.hidden && !lost
      canvas.dataset.renderState = lost ? 'fallback' : running ? 'running' : 'paused'
      if (running) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      } else if (!document.hidden) draw(true)
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(Math.min(640, rect.width)))
      const height = Math.max(
        1,
        Math.round(rect.height * width / Math.max(1, rect.width)),
      )
      if (canvas.width === width && canvas.height === height && initialized) return
      canvas.width = width
      canvas.height = height
      draw(!initialized)
      initialized = true
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      sync()
    }
    const onRestored = () => {
      lost = false
      draw(true)
      sync()
    }
    const observer = new ResizeObserver(resize)
    canvas.addEventListener('contextlost', onLost)
    canvas.addEventListener('contextrestored', onRestored)
    document.addEventListener('visibilitychange', sync)
    observer.observe(canvas)
    update.current = sync
    resize()
    sync()
    return () => {
      cancelAnimationFrame(frame)
      update.current = undefined
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('contextlost', onLost)
      canvas.removeEventListener('contextrestored', onRestored)
      delete canvas.dataset.renderState
    }
  }, [])

  return (
    <>
      <div className="interest-scene antigravity-scene" onPointerMove={steer} onPointerDown={steer}>
        <svg className="antigravity-fallback" viewBox="0 0 520 340" aria-hidden="true">
          {seeds.slice(0, 64).map((seed, i) => {
            const angle = i / 64 * Math.PI * 2
            const radius = 106 + seed.z * 24
            return <path key={i} d={`M${260 + Math.cos(angle) * radius} ${170 + Math.sin(angle) * radius}l${Math.cos(angle) * 7} ${Math.sin(angle) * 7}`} />
          })}
        </svg>
        <canvas ref={canvasRef} role="img" aria-label="An illustrative field of blue data particles bending into a ring around a moving focus." />
      </div>
      <div className="antigravity-controls">
        <p>Move or tap to bend the field.</p>
        <button type="button" className="lab-action" onClick={shift}>Shift field <span aria-hidden="true">↗</span></button>
      </div>
    </>
  )
}
