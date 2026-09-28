import { useEffect, useRef, useState } from 'react'
import type { PageId } from '@/lib/pages'
import type { SceneId } from '@/lib/scene'
import type { createPhysicalBlackHoleRenderer } from '@/lib/blackHolePhysical/webgl'
import '@/styles/black-hole.css'

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
