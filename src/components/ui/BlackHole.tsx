import { useEffect, useRef, useState } from 'react'
import type { PageId } from '@/lib/pages'
import type { SceneId } from '@/lib/scene'
import type { createPhysicalBlackHoleRenderer } from '@/lib/blackHolePhysical/webgl'
import type { Camera } from '@/lib/blackHolePhysical/voyage'
import '@/styles/black-hole.css'

type Renderer = ReturnType<typeof createPhysicalBlackHoleRenderer>
const assetBase = `${import.meta.env.BASE_URL}black-hole/`

/** Persistent, decorative Schwarzschild beam tracer. The page scroll flies the observer around the hole. */
export function BlackHole({ page, scene, enabled }: {
  page: PageId
  scene: SceneId
  enabled: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<Camera | null>(null)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Decorative voyage code loads only after the visitor enables motion.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled || reducedMotion) return
    let disposed = false
    let stop: (() => void) | undefined
    void import('@/lib/blackHolePhysical/voyage').then(({ startVoyage }) => {
      if (!disposed) stop = startVoyage(root, () => cameraRef.current)
    }).catch(() => {
      // Navigation and the static black hole remain usable if this optional chunk fails.
    })
    return () => {
      disposed = true
      stop?.()
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
    let startupTimer = 0
    const resize = () => {
      if (!renderer || disposed) return
      try {
        renderer.setSize(root.clientWidth, root.clientHeight, 1)
      } catch {
        renderer.dispose()
        renderer = null
        cameraRef.current = null
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
          maxFps: window.innerWidth < 700 ? 20 : 30,
          // Fast enough that the disc visibly spins, slow enough to stay calm.
          timeScale: 1.2,
        })
        renderer = candidate
        resize()
        await candidate.loadAll()
        if (disposed || current !== generation || renderer !== candidate) {
          candidate.dispose()
          return
        }
        candidate.renderOnce()
        cameraRef.current = model as unknown as Camera
        setReady(true)
        candidate.setRunning(!document.hidden)
      } catch {
        candidate?.dispose()
        if (!disposed && current === generation) {
          renderer = null
          cameraRef.current = null
          failed = true
          setReady(false)
        }
      } finally {
        if (current === generation) loading = false
      }
    }
    const visibility = () => {
      if (renderer) renderer.setRunning(!document.hidden)
      else if (!startupTimer) void initialize()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      generation += 1
      loading = false
      failed = true
      renderer?.dispose()
      renderer = null
      cameraRef.current = null
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
    // Paint readable HTML and the short arrival before compiling shaders or fetching physics tables.
    // Resume later in the same document remains immediate, without another artificial wait.
    startupTimer = window.setTimeout(() => {
      startupTimer = 0
      void initialize()
    }, Math.max(0, 2500 - performance.now()))
    return () => {
      disposed = true
      window.clearTimeout(startupTimer)
      generation += 1
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('webglcontextlost', contextLost)
      canvas.removeEventListener('webglcontextrestored', contextRestored)
      renderer?.dispose()
      renderer = null
      cameraRef.current = null
    }
  }, [enabled, reducedMotion])

  return (
    <div ref={rootRef} className="black-hole" data-page={page} data-scene={scene}
      data-ready={ready} data-motion={enabled && !reducedMotion} aria-hidden="true">
      <div className="black-hole__visual">
        <img className="black-hole__fallback" src={`${assetBase}preview-blue.jpg`} alt="" decoding="async" />
        <canvas ref={canvasRef} className="black-hole__canvas" />
      </div>
    </div>
  )
}
