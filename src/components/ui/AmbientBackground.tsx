import type { SceneId } from '@/lib/scene'
import type { PageId } from '@/lib/pages'
import type { SectionId } from '@/data/sections'
import { BlackHole } from './BlackHole'

export function AmbientBackground({
  page,
  scene,
  motionEnabled,
  section,
}: {
  page: PageId
  scene: SceneId
  motionEnabled: boolean
  section?: SectionId
}) {
  return (
    <div className="ambient-background" data-section={section} aria-hidden="true">
      <BlackHole page={page} scene={scene} enabled={motionEnabled} />
    </div>
  )
}
