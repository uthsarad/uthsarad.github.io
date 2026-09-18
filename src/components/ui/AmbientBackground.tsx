import { lazy, Suspense } from 'react'
import type { SceneId } from '@/lib/scene'
import type { PageId } from '@/lib/pages'
const Aurora = lazy(() => import('./reactbits/Aurora'))
const NeonGlobe = lazy(() =>
  import('./NeonGlobe').then((module) => ({ default: module.NeonGlobe })),
)

export function AmbientBackground({
  page,
  scene,
  motionEnabled,
}: {
  page: PageId
  scene: SceneId
  motionEnabled: boolean
}) {
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="aurora-backdrop">
        <div className="aurora-fallback" />
        <Suspense fallback={null}>
          <Aurora enabled={motionEnabled} />
        </Suspense>
      </div>
      <div className="ambient-grid" />
      <Suspense fallback={null}>
        <NeonGlobe page={page} scene={scene} enabled={motionEnabled} />
      </Suspense>
    </div>
  )
}
