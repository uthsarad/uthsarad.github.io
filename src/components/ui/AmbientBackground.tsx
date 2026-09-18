import { lazy, Suspense } from 'react'
import type { SceneId } from '@/lib/scene'
const NeonGlobe = lazy(() =>
  import('./NeonGlobe').then((module) => ({ default: module.NeonGlobe })),
)

export function AmbientBackground({
  scene,
  motionEnabled,
}: {
  scene: SceneId
  motionEnabled: boolean
}) {
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-glow glow-cobalt" />
      <div className="ambient-glow glow-ice" />
      <div className="ambient-glow glow-deep" />
      <div className="ambient-grid" />
      <Suspense fallback={null}>
        <NeonGlobe scene={scene} enabled={motionEnabled} />
      </Suspense>
    </div>
  )
}
