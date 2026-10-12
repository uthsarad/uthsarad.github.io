import { useEffect, useRef, useState } from 'react'
import type { PageId } from '@/lib/pages'
import type { SceneId } from '@/lib/scene'
import type { createPhysicalBlackHoleRenderer } from '@/lib/blackHolePhysical/webgl'
import { sectionEntries } from '@/data/sections'
import '@/styles/black-hole.css'

/** Where the hole sits at the top of each section, as an offset from its resting spot (vw, vh, scale). */
const waypoints: Record<string, [number, number, number]> = {
  hero: [0, 0, 1],
  interests: [-12, -8, 0.92],
  projects: [-38, 10, 0.86],
  coursework: [-6, -10, 0.96],
  about: [-32, 8, 0.9],
  contact: [-14, -4, 1.04],
}
const ease = (t: number) => t * t * (3 - 2 * t)

type Renderer = ReturnType<typeof createPhysicalBlackHoleRenderer>
const assetBase = `${import.meta.env.BASE_URL}black-hole/`

/** Persistent, decorative Schwarzschild beam tracer. The observer stays fixed during navigation. */
export function BlackHole({ page, scene, enabled }: {
  page: PageId
  scene: SceneId
  enabled: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Scroll-linked drift: the fixed hole glides along a path as the reader moves through sections.
  // Written straight to CSS variables, so scrolling never re-renders React.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled || reducedMotion) return
    let frame = 0
    let dirty = true
    let marks: { top: number; point: [number, number, number] }[] = []
    const apply = () => {
      frame = 0
      const y = window.scrollY
      if (dirty) {
        dirty = false
        marks = sectionEntries.flatMap(({ id }) => {
          const element = document.getElementById(id)
          return element
            ? [{ top: element.getBoundingClientRect().top + y, point: waypoints[id] }]
            : []
        })
      }
      if (!marks.length) return
      const line = y + window.innerHeight * 0.42
      let index = 0
      for (let i = 0; i < marks.length; i++) if (marks[i].top <= line) index = i
      const from = marks[index]
      const to = marks[index + 1] ?? from
      const span = to.top - from.top
      const t = span > 0 ? ease(Math.max(0, Math.min(1, (line - from.top) / span))) : 0
      const narrow = window.innerWidth < 700 ? 0.35 : 1
      const x = (from.point[0] + (to.point[0] - from.point[0]) * t) * narrow
      const yy = from.point[1] + (to.point[1] - from.point[1]) * t
      const s = from.point[2] + (to.point[2] - from.point[2]) * t
      root.style.setProperty('--drift-x', `${x.toFixed(2)}vw`)
      root.style.setProperty('--drift-y', `${yy.toFixed(2)}vh`)
      root.style.setProperty('--drift-scale', s.toFixed(3))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const invalidate = () => {
      dirty = true
      schedule()
    }
    apply()
    const resize = new ResizeObserver(invalidate)
    resize.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', invalidate)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', invalidate)
      root.style.removeProperty('--drift-x')
      root.style.removeProperty('--drift-y')
      root.style.removeProperty('--drift-scale')
    }
  }, [enabled, reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    setReady(false)
    if (!canvas || !root || !enabled || reducedMotion) return

    let disposed = false
    let generation = 0
    let renderer: Renderer | null = null
    let loading = false
    let failed = false
    const resize = () => {
      if (!renderer || disposed) return
      try {
        renderer.setSize(root.clientWidth, root.clientHeight, 1)
      } catch {
        renderer.dispose()
        renderer = null
        failed = true
        setReady(false)
      }
    }
    const initialize = async () => {
      if (disposed || loading || renderer || document.hidden || failed) return
      loading = true
      const current = ++generation
      let candidate: Renderer | null = null
      try {
        const [{ createPhysicalBlackHoleRenderer }, { BlackHolePhysicalModel }] = await Promise.all([
          import('@/lib/blackHolePhysical/webgl'),
          import('@/lib/blackHolePhysical/model'),
        ])
        if (disposed || generation !== current) return
        const model = new BlackHolePhysicalModel()
        // Original physical temperature, opacity, density and lensing equations are unchanged.
        model.startRadius.setIndex(850)
        candidate = createPhysicalBlackHoleRenderer(canvas, {
          assetBase,
          model,
          exposure: model.exposure.getValue(),
          dprCap: 1,
          maxDimension: window.innerWidth < 700 ? 560 : 960,
          maxFps: window.innerWidth < 700 ? 18 : 24,
          timeScale: 0.35,
        })
        renderer = candidate
        resize()
        await candidate.loadAll()
        if (disposed || current !== generation || renderer !== candidate) {
          candidate.dispose()
          return
        }
        candidate.renderOnce()
        setReady(true)
        candidate.setRunning(!document.hidden)
      } catch {
        candidate?.dispose()
        if (!disposed && current === generation) {
          renderer = null
          failed = true
          setReady(false)
        }
      } finally {
        if (current === generation) loading = false
      }
    }
    const visibility = () => {
      if (renderer) renderer.setRunning(!document.hidden)
      else void initialize()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      generation += 1
      loading = false
      failed = true
      renderer?.dispose()
      renderer = null
      setReady(false)
    }
    const contextRestored = () => {
      failed = false
      void initialize()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(root)
    document.addEventListener('visibilitychange', visibility)
    canvas.addEventListener('webglcontextlost', contextLost)
    canvas.addEventListener('webglcontextrestored', contextRestored)
    void initialize()
    return () => {
      disposed = true
      generation += 1
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('webglcontextlost', contextLost)
      canvas.removeEventListener('webglcontextrestored', contextRestored)
      renderer?.dispose()
      renderer = null
    }
  }, [enabled, reducedMotion])

  return (
    <div ref={rootRef} className="black-hole" data-page={page} data-scene={scene}
      data-ready={ready} data-motion={enabled && !reducedMotion} aria-hidden="true">
      <div className="black-hole__visual">
        <img className="black-hole__fallback" src={`${assetBase}preview.jpg`} alt="" decoding="async" />
        <canvas ref={canvasRef} className="black-hole__canvas" />
      </div>
    </div>
  )
}
