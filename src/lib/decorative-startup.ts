/** Release optional GPU/scroll work only after content has painted and the startup window ends. */
export function scheduleDecorativeStartup(start: () => void) {
  let disposed = false
  let released = false
  let painted = performance.getEntriesByType('paint').some(
    (entry) => entry.name === 'first-contentful-paint',
  )
  let timer = 0
  let frame = 0
  let observer: PerformanceObserver | undefined
  const cancel = () => {
    disposed = true
    window.clearTimeout(timer)
    cancelAnimationFrame(frame)
    observer?.disconnect()
    document.removeEventListener('visibilitychange', attempt)
  }
  const attempt = () => {
    if (disposed || released || !painted || document.hidden || performance.now() < 2500 || frame) return
    // Yield a complete rendering opportunity, including when hydration arrived after the deadline.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0
        if (disposed || document.hidden) return
        released = true
        cancel()
        start()
      })
    })
  }
  const afterPaint = () => {
    painted = true
    observer?.disconnect()
    attempt()
  }
  if (!painted) {
    try {
      if (typeof PerformanceObserver === 'undefined' || !PerformanceObserver.supportedEntryTypes.includes('paint')) throw new Error('No paint observer')
      observer = new PerformanceObserver((entries) => {
        if (entries.getEntries().some((entry) => entry.name === 'first-contentful-paint')) afterPaint()
      })
      observer.observe({ type: 'paint', buffered: true })
    } catch {
      observer?.disconnect()
      observer = undefined
      // Older engines have no paint timing API. Two frames offer a paint opportunity, not FCP proof.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          frame = 0
          if (!disposed) afterPaint()
        })
      })
    }
  }
  document.addEventListener('visibilitychange', attempt)
  timer = window.setTimeout(attempt, Math.max(0, 2500 - performance.now()))
  attempt()
  return cancel
}
