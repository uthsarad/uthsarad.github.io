import './space-trip.css'

// The renderer models light around a Schwarzschild black hole. This choreography
// is deliberately fictional: a readable website cannot travel through a horizon.
let activeTrip: symbol | undefined

function fragments() {
  const selector = [
    '.site-shell > header', '.site-shell > footer',
    '#main h1', '#main h2', '#main h3', '#main p', '#main article',
    '#main .interest-lab', '#main .button-row', '#main .work-toolbar',
    '#main .background-panel', '#main .contact-links', '#main dl', '#main ul',
  ].join(',')
  const candidates = [...document.querySelectorAll<HTMLElement>(selector)]
  // Cap AFTER dropping off-screen blocks, or a long page's first 32 matches
  // would all be scrolled-past content and nothing visible would move.
  return candidates.filter((element) => {
    if (candidates.some((parent) => parent !== element && parent.contains(element))) return false
    const box = element.getBoundingClientRect()
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight
  }).slice(0, 32)
}

function horizon() {
  const hole = document.querySelector('.black-hole')?.getBoundingClientRect()
  return hole
    ? { x: hole.left + hole.width / 2, y: hole.top + hole.height / 2 }
    : { x: innerWidth * 0.7, y: innerHeight * 0.48 }
}

/** Keep one live DOM tree and one physical canvas. No rasterized text or clones. */
export async function playSpaceTrip(commit: () => void, signal: AbortSignal) {
  const token = Symbol('space-trip')
  activeTrip = token
  const root = document.documentElement
  const media = matchMedia('(prefers-reduced-motion: reduce)')
  const main = document.getElementById('main')
  const wasInert = main?.inert ?? false
  let skipped = false
  let animations: Animation[] = []
  let timer = 0
  let settle: (() => void) | undefined
  const allowed = () => !skipped && !signal.aborted && !document.hidden &&
    !media.matches && root.dataset.motion !== 'off' && typeof Element.prototype.animate === 'function'
  const clearAnimations = () => {
    window.clearTimeout(timer)
    animations.forEach((animation) => animation.cancel())
    animations = []
  }
  const skip = () => {
    skipped = true
    clearAnimations()
    // A cancelled animation never resolves `finished`; release the race now so
    // Escape ends the trip immediately instead of holding until the timeout.
    settle?.()
  }
  const restore = () => {
    clearAnimations()
    if (activeTrip === token) {
      delete root.dataset.transit
      activeTrip = undefined
      if (main) main.inert = wasInert
    }
  }
  const onVisibility = () => { if (document.hidden) skip() }
  const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') skip() }
  const onMotion = () => { if (root.dataset.motion === 'off') skip() }
  const observer = new MutationObserver(onMotion)
  observer.observe(root, { attributes: true, attributeFilter: ['data-motion'] })
  signal.addEventListener('abort', restore, { once: true })
  media.addEventListener('change', skip)
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('keydown', onKey)

  const animate = async (entering: boolean) => {
    if (!allowed()) return
    root.dataset.transit = entering ? 'emerging' : 'ingesting'
    if (main) main.inert = true
    const center = horizon()
    const elements = fragments()
    for (const [index, element] of elements.entries()) {
      const box = element.getBoundingClientRect()
      const dx = center.x - (box.left + box.width / 2)
      const dy = center.y - (box.top + box.height / 2)
      const turn = dx < 0 ? -1 : 1
      // A tangential detour and anisotropic stretch suggest tidal forces before
      // the final contraction. Each block follows its own path to the horizon.
      const frames: Keyframe[] = [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1, filter: 'blur(0px)', offset: 0 },
        { transform: `translate(${dx * 0.35 - dy * 0.12}px, ${dy * 0.35 + dx * 0.12}px) rotate(${turn * 12}deg) scale(0.85, 0.62)`, opacity: 0.92, filter: 'blur(0px)', offset: 0.42 },
        { transform: `translate(${dx * 0.83 - dy * 0.05}px, ${dy * 0.83 + dx * 0.05}px) rotate(${turn * 48}deg) scale(0.32, 0.08)`, opacity: 0.65, filter: 'blur(1px)', offset: 0.78 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${turn * 95}deg) scale(0.001)`, opacity: 0, filter: 'blur(3px)', offset: 1 },
      ]
      animations.push(element.animate(frames, {
        duration: entering ? 650 : 600,
        delay: Math.min(index * 18, 120),
        direction: entering ? 'reverse' : 'normal',
        easing: entering ? 'cubic-bezier(0.55, 0, 0.85, 0.4)' : 'cubic-bezier(0.55, 0, 0.9, 0.45)',
        fill: 'both',
      }))
    }
    // Fade residual section backgrounds without replacing real accessible text.
    if (main) animations.push(main.animate(
      [{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.65 }, { opacity: 0, offset: 1 }],
      { duration: entering ? 760 : 710, direction: entering ? 'reverse' : 'normal', fill: 'both' },
    ))
    const completed = Promise.all(animations.map((animation) => animation.finished.catch(() => {})))
    // Background throttling, disabled animations or a browser bug must never trap navigation.
    await Promise.race([completed, new Promise<void>((resolve) => { settle = () => resolve(); timer = window.setTimeout(resolve, 900) })])
    window.clearTimeout(timer)
    settle = undefined
  }
  try {
    await animate(false)
    if (signal.aborted) return
    root.dataset.transit = 'swapping'
    clearAnimations()
    commit()
    // Let React's resolved lazy modules and the scroll/focus restoration effect
    // settle before measuring destination blocks. The timeout also works hidden.
    await new Promise<void>((resolve) => {
      let frame = 0
      const fallback = window.setTimeout(() => { cancelAnimationFrame(frame); resolve() }, 120)
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => { window.clearTimeout(fallback); resolve() })
      })
    })
    if (signal.aborted) return
    if (allowed()) await animate(true)
  } finally {
    restore()
    observer.disconnect()
    signal.removeEventListener('abort', restore)
    media.removeEventListener('change', skip)
    document.removeEventListener('visibilitychange', onVisibility)
    document.removeEventListener('keydown', onKey)
  }
}
