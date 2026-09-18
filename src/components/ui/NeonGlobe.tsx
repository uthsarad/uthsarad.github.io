import { useEffect, useRef, useState } from 'react'
import type { SceneId } from '@/lib/scene'

type Globe = {
  update: (options: Record<string, unknown>) => void
  destroy: () => void
}
type CreateGlobe = (
  canvas: HTMLCanvasElement,
  options: Record<string, unknown>,
) => Globe
let modulePromise: Promise<CreateGlobe | null> | undefined
function loadCobe() {
  const url = 'https://cdn.jsdelivr.net/npm/cobe@2.0.1/dist/index.esm.js'
  return (modulePromise ??= import(/* @vite-ignore */ url)
    .then((module) =>
      typeof module.default === 'function'
        ? (module.default as CreateGlobe)
        : null,
    )
    .catch(() => null))
}

const home: [number, number] = [6.9271, 79.8612]
// Illustrative connections from Colombo, not client locations or work-history claims.
const destinations: [number, number][] = [
  [51.51, -0.13],
  [1.35, 103.82],
  [35.68, 139.69],
  [-33.87, 151.21],
  [40.71, -74.01],
  [-33.92, 18.42],
]
const views: Record<
  SceneId,
  { phi: number; theta: number; scale: number; connections: number }
> = {
  home: { phi: 3.32, theta: 0.15, scale: 1, connections: 3 },
  security: { phi: 3.05, theta: 0.35, scale: 1.06, connections: 2 },
  data: { phi: 3.85, theta: 0.12, scale: 0.92, connections: 6 },
  projects: { phi: 4.5, theta: 0.24, scale: 0.98, connections: 4 },
  coursework: { phi: 3.55, theta: -0.08, scale: 0.92, connections: 5 },
  about: { phi: 3.32, theta: 0.12, scale: 1.15, connections: 1 },
  contact: { phi: 2.85, theta: 0.18, scale: 0.9, connections: 6 },
}

export function NeonGlobe({
  scene,
  enabled,
}: {
  scene: SceneId
  enabled: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const props = useRef({ scene, enabled })
  const refresh = useRef<() => void>()
  const [generation, setGeneration] = useState(0)
  useEffect(() => {
    props.current = { scene, enabled }
    refresh.current?.()
  }, [scene, enabled])

  useEffect(() => {
    const container = host.current
    if (!container) return
    // COBE wraps its canvas; keep that DOM outside React's managed children.
    const canvas = document.createElement('canvas')
    container.append(canvas)
    let disposed = false,
      lost = false,
      frame = 0,
      previous = 0,
      drift = 0
    let globe: Globe | undefined
    let contextHandle: WebGLRenderingContext | WebGL2RenderingContext | null =
      null
    let resizeObserver: ResizeObserver | undefined
    let activeScene = props.current.scene
    const current = { ...views[activeScene] }
    let scroll = 0,
      currentScroll = 0
    const measureScroll = () => {
      const height = document.documentElement.scrollHeight - innerHeight
      scroll = height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0
    }
    const draw = () => {
      globe?.update({
        phi: current.phi + currentScroll * 0.7 + drift,
        theta: current.theta - currentScroll * 0.12,
        scale: current.scale,
      })
    }
    const tick = (now: number) => {
      frame = 0
      if (disposed || lost || document.hidden || !props.current.enabled) return
      const delta = now - previous
      if (delta >= 1000 / 30) {
        const seconds = Math.min(delta / 1000, 0.1)
        previous = now
        const target = views[props.current.scene]
        const blend = 1 - Math.exp(-seconds * 4)
        currentScroll += (scroll - currentScroll) * blend
        current.phi += (target.phi - current.phi) * blend
        current.theta += (target.theta - current.theta) * blend
        current.scale += (target.scale - current.scale) * blend
        drift = Math.sin(now / 26000) * 0.09
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const updateConnections = () => {
      const targets = destinations.slice(
        0,
        views[props.current.scene].connections,
      )
      globe?.update({
        markers: [
          { location: home, size: 0.065, color: [0.85, 0.94, 1] },
          ...targets.map((location) => ({ location, size: 0.025 })),
        ],
        arcs: targets.map((to) => ({ from: home, to })),
      })
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (!globe || disposed || lost) return
      if (activeScene !== props.current.scene) {
        activeScene = props.current.scene
        updateConnections()
      }
      const running = props.current.enabled && !document.hidden
      container.dataset.renderState = running ? 'running' : 'paused'
      if (running) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      } else {
        // Settle to the selected view without movement when motion is disabled.
        Object.assign(current, views[props.current.scene])
        drift = 0
        draw()
      }
    }
    const onScroll = () => {
      if (!props.current.enabled) return
      measureScroll()
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      container.dataset.renderState = 'fallback'
    }
    const onRestored = () => setGeneration((value) => value + 1)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('scroll', onScroll, { passive: true })
    refresh.current = sync
    measureScroll()
    void loadCobe().then((createGlobe) => {
      if (disposed || !createGlobe) return
      try {
        const context = {
          alpha: true,
          antialias: false,
          powerPreference: 'low-power' as const,
        }
        const gl =
          canvas.getContext('webgl2', context) ??
          canvas.getContext('webgl', context)
        if (!gl || !('getExtension' in gl)) return
        contextHandle = gl
        const size = Math.min(
          760,
          Math.max(1, Math.round(container.clientWidth)),
        )
        globe = createGlobe(canvas, {
          width: size,
          height: size,
          devicePixelRatio: 1,
          ...current,
          dark: 1,
          diffuse: 1.6,
          mapSamples: 14000,
          mapBrightness: 9,
          mapBaseBrightness: 0,
          baseColor: [0.18, 0.4, 0.9],
          markerColor: [0.5, 0.75, 1],
          glowColor: [0.12, 0.3, 0.8],
          arcColor: [0.25, 0.6, 1],
          arcWidth: 0.65,
          arcHeight: 0.24,
          markerElevation: 0.035,
          context,
        })
        container.dataset.engine = 'cobe'
        updateConnections()
        resizeObserver = new ResizeObserver(() => {
          const width = Math.min(
            760,
            Math.max(1, Math.round(container.clientWidth)),
          )
          globe?.update({ width, height: width })
          measureScroll()
          draw()
        })
        resizeObserver.observe(container)
        sync()
      } catch {
        globe?.destroy()
        globe = undefined
        container.dataset.renderState = 'fallback'
      }
    })
    return () => {
      disposed = true
      refresh.current = undefined
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('scroll', onScroll)
      globe?.destroy()
      // Also release the texture/context retained by COBE after destroy().
      contextHandle?.getExtension('WEBGL_lose_context')?.loseContext()
      container.replaceChildren()
      delete container.dataset.renderState
      delete container.dataset.engine
    }
  }, [generation])

  return (
    <div className="neon-globe" data-scene={scene}>
      <svg className="globe-fallback" viewBox="0 0 500 500" aria-hidden="true">
        <circle cx="250" cy="250" r="190" />
        <ellipse cx="250" cy="250" rx="95" ry="190" />
        <ellipse cx="250" cy="250" rx="165" ry="190" />
        <ellipse cx="250" cy="250" rx="190" ry="65" />
        <ellipse cx="250" cy="250" rx="190" ry="135" />
        <path d="M60 250h380M250 60v380" />
      </svg>
      <div ref={host} className="globe-canvas" />
    </div>
  )
}
