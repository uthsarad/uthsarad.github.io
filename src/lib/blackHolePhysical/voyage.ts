import { sectionEntries } from '@/data/sections'

/**
 * One stop on the voyage. The first three values slide the view across the page (vw, vh, scale),
 * the rest steer the real camera around the hole (radians, Schwarzschild radii).
 */
type Pose = {
  x: number
  y: number
  scale: number
  /** Banking of the whole view, degrees. */
  roll: number
  /** Look left and right of the hole. */
  yaw: number
  /** Look above and below the hole. */
  pitch: number
  /** Camera height above (+) or below (-) the plane of the accretion disc. */
  incl: number
  /** Camera distance from the hole. */
  dist: number
}
const keys: (keyof Pose)[] = ['x', 'y', 'scale', 'roll', 'yaw', 'pitch', 'incl', 'dist']

const waypoints: Record<string, Pose> = {
  hero: { x: 0, y: 0, scale: 1, roll: 0, yaw: 0, pitch: 0, incl: 0.12, dist: 32.9 },
  interests: { x: -12, y: -8, scale: 0.92, roll: -9, yaw: 0.1, pitch: -0.04, incl: 0.5, dist: 29 },
  projects: { x: -38, y: 10, scale: 0.86, roll: 11, yaw: -0.12, pitch: 0.05, incl: 0.03, dist: 36 },
  coursework: { x: -6, y: -10, scale: 0.96, roll: -6, yaw: 0.08, pitch: -0.06, incl: 0.62, dist: 26 },
  about: { x: -32, y: 8, scale: 0.9, roll: 13, yaw: -0.1, pitch: 0.06, incl: -0.28, dist: 34 },
  contact: { x: -14, y: -4, scale: 1.04, roll: -4, yaw: 0.04, pitch: 0, incl: 0.3, dist: 24 },
}

/** Smooth curve through the stops, so the path turns instead of stopping at each one. */
const spline = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)

export type Camera = {
  cameraYaw: { setValue(value: number): void }
  cameraPitch: { setValue(value: number): void }
  orbitInclination: { setValue(value: number): void }
  startRadius: { setValue(value: number): void }
}

// The voyage. Scroll picks the target pose along a smooth path. The view eases toward it with
// some inertia and a slow idle sway, so it keeps drifting even when the reader pauses.
// Everything goes straight to CSS variables and the camera, never through React state.
// Deferred separately from the critical page runtime, just like the physical renderer.
export function startVoyage(root: HTMLElement, getCamera: () => Camera | null) {
  let frame = 0
  let dirty = true
  let marks: { top: number; pose: Pose }[] = []
  let current: Pose | null = null
  let last = performance.now()
  let lastCamera = 0
  const narrow = () => window.innerWidth < 700

  const target = (): Pose => {
    const y = window.scrollY
    if (dirty) {
      dirty = false
      marks = sectionEntries.flatMap(({ id }) => {
        const element = document.getElementById(id)
        return element ? [{ top: element.getBoundingClientRect().top + y, pose: waypoints[id] }] : []
      })
    }
    if (!marks.length) return waypoints.hero
    const line = y + window.innerHeight * 0.42
    let index = 0
    for (let i = 0; i < marks.length; i++) if (marks[i].top <= line) index = i
    const next = Math.min(index + 1, marks.length - 1)
    const span = marks[next].top - marks[index].top
    const t = span > 0 ? Math.max(0, Math.min(1, (line - marks[index].top) / span)) : 0
    const before = marks[Math.max(index - 1, 0)].pose
    const after = marks[Math.min(index + 2, marks.length - 1)].pose
    const result = {} as Pose
    for (const key of keys)
      result[key] = spline(before[key], marks[index].pose[key], marks[next].pose[key], after[key], t)
    return result
  }

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick)
    if (document.hidden) {
      last = now
      return
    }
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const goal = target()
    if (!current) current = { ...goal }
    const ease = 1 - Math.exp(-dt * 3.2)
    for (const key of keys) current[key] += (goal[key] - current[key]) * ease

    const s = now / 1000
    const sway = narrow() ? 0.5 : 1
    const x = (current.x + 1.4 * Math.sin(s * 0.21)) * (narrow() ? 0.35 : 1)
    const y = current.y + 1.1 * Math.cos(s * 0.17)
    const roll = current.roll * sway + 1.6 * Math.sin(s * 0.13)
    root.style.setProperty('--drift-x', `${x.toFixed(2)}vw`)
    root.style.setProperty('--drift-y', `${y.toFixed(2)}vh`)
    root.style.setProperty('--drift-scale', current.scale.toFixed(3))
    root.style.setProperty('--drift-rot', `${roll.toFixed(2)}deg`)

    const camera = getCamera()
    if (camera && now - lastCamera > 33) {
      lastCamera = now
      // The model's yaw runs 0..2pi, so negative angles wrap round.
      camera.cameraYaw.setValue((current.yaw + 0.03 * Math.sin(s * 0.23) + 2 * Math.PI) % (2 * Math.PI))
      camera.cameraPitch.setValue(current.pitch + 0.02 * Math.sin(s * 0.31 + 1))
      camera.orbitInclination.setValue(Math.max(-0.7, Math.min(0.9, current.incl + 0.05 * Math.sin(s * 0.17))))
      camera.startRadius.setValue(Math.max(14, Math.min(48, current.dist + 0.8 * Math.sin(s * 0.11))))
    }
  }
  const invalidate = () => {
    dirty = true
  }
  const resize = new ResizeObserver(invalidate)
  resize.observe(document.body)
  window.addEventListener('resize', invalidate)
  frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frame)
    resize.disconnect()
    window.removeEventListener('resize', invalidate)
    for (const name of ['--drift-x', '--drift-y', '--drift-scale', '--drift-rot']) root.style.removeProperty(name)
  }
}
