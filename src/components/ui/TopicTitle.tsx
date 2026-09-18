import type { PropsWithChildren } from 'react'
import type { SceneId } from '@/lib/scene'

export function TopicTitle({
  label,
  scene,
  children,
}: PropsWithChildren<{ label: string; scene: SceneId }>) {
  return (
    <button
      type="button"
      className="topic-title"
      data-topic={label}
      data-scene={scene}
      title={'Keep ' + label + ' selected'}
    >
      {children ?? label}
    </button>
  )
}
