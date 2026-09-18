import type { SceneId } from './scene'

export function sceneFavicon(scene: SceneId) {
  const variant = scene === 'security' || scene === 'data' ? '-' + scene : ''
  return `/favicon${variant}.svg?v=2`
}
