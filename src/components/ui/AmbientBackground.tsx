import type { SceneId } from '@/lib/scene'
import type { PageId } from '@/lib/pages'
import { BlackHole } from './BlackHole'

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
      <BlackHole page={page} scene={scene} enabled={motionEnabled} />
    </div>
  )
}
