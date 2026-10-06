import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { getPage, type PageId } from './pages'
import { loadPage } from './page-content'

function hashTarget(hash: string) {
  try { return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null }
  catch { return null /* A malformed URL must never trap navigation. */ }
}

function focusDestination(hash: string) {
  const target = hashTarget(hash) ?? document.getElementById('main')
  target?.focus({ preventScroll: true })
}

// Real hrefs and generated HTML remain the fallback. Only ordinary local page
// clicks are enhanced, keeping the physical canvas and React runtime alive.
export function usePageNavigation(initialPath: string, motionEnabled: boolean) {
  const [location, setLocation] = useState(() => ({
    page: getPage(initialPath), key: '', y: 0, hash: '', restoreOffset: false,
  }))
  const [pending, setPending] = useState(false)
  const activeKey = useRef('')
  const positions = useRef(new Map<string, number>())
  const request = useRef(0)
  const controller = useRef<AbortController>()
  const uncommittedPush = useRef(false)
  const renderedPage = useRef(location.page)
  renderedPage.current = location.page
  const motion = useRef(motionEnabled)
  motion.current = motionEnabled

  const changePage = async (
    page: PageId | undefined,
    destination: { key: string; y: number; hash: string; restoreOffset?: boolean },
    url?: URL,
  ) => {
    const id = ++request.current
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    positions.current.set(activeKey.current, window.scrollY)
    // Record the history entry immediately rather than after the animation.
    // An interrupting Back press then always operates on the real URL, so the
    // address bar and rendered page can never drift apart. A click that
    // supersedes a trip which never committed replaces its entry, matching
    // how a browser cancels an unfinished native navigation.
    if (url) {
      const entry = [{ portfolioEntry: destination.key }, '', url.pathname + url.hash] as const
      if (uncommittedPush.current) history.replaceState(...entry)
      else history.pushState(...entry)
      uncommittedPush.current = true
    }
    setPending(true)
    let committed = false
    const commit = () => {
      if (id !== request.current || abort.signal.aborted) return
      activeKey.current = destination.key
      uncommittedPush.current = false
      committed = true
      // The outgoing blocks have reached the horizon. Swap React content while
      // hidden, then measure the destination only after scroll restoration.
      flushSync(() => setLocation({ page, restoreOffset: false, ...destination }))
    }
    try {
      if (page) await loadPage(page)
      if (id !== request.current) return
      const animate = motion.current && !document.hidden &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches &&
        document.documentElement.dataset.motion !== 'off' &&
        page !== renderedPage.current // Hash-only history steps stay instant.
      if (animate) {
        // Keep the choreography outside the critical initial-page bundle.
        const { playSpaceTrip } = await import('./space-trip')
        if (id !== request.current) return
        await playSpaceTrip(commit, abort.signal)
      } else commit()
    } catch {
      // Animation is progressive enhancement, never a navigation dependency.
      if (id === request.current) {
        if (committed) focusDestination(destination.hash)
        // The URL is already current, so a reload shows the right document.
        else window.location.reload()
      }
    } finally {
      if (id === request.current) {
        setPending(false)
        if (committed) focusDestination(destination.hash)
      }
    }
  }
  // The history listener uses the current transition closure without being
  // reinstalled on every render (which would reset scroll-restoration state).
  const changeRef = useRef(changePage)
  changeRef.current = changePage

  useEffect(() => {
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    activeKey.current = history.state?.portfolioEntry ?? crypto.randomUUID()
    history.replaceState({ ...history.state, portfolioEntry: activeKey.current }, '')
    const pop = () => {
      // The browser moved to an existing entry, so no pending entry is ours to replace.
      uncommittedPush.current = false
      const key = history.state?.portfolioEntry ?? crypto.randomUUID()
      void changeRef.current(getPage(window.location.pathname), {
        key, y: positions.current.get(key) ?? 0,
        hash: window.location.hash, restoreOffset: positions.current.has(key),
      })
    }
    window.addEventListener('popstate', pop)
    return () => {
      ++request.current
      controller.current?.abort()
      history.scrollRestoration = restoration
      window.removeEventListener('popstate', pop)
    }
  }, [])

  useEffect(() => {
    // Preserve native direct-visit scrolling, but move keyboard focus to its section.
    if (!location.key) {
      if (!window.location.hash) return
      const frame = requestAnimationFrame(() => focusDestination(window.location.hash))
      return () => cancelAnimationFrame(frame)
    }
    const frame = requestAnimationFrame(() => {
      if (!document.getElementById('main')?.inert) focusDestination(location.hash)
      const target = hashTarget(location.hash)
      if (target && !location.restoreOffset) target.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: location.y, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location])

  const navigate = async (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.altKey || event.shiftKey) return
    const anchor = event.target instanceof Element ? event.target.closest('a') : null
    if (!anchor || anchor.hasAttribute('download') ||
      (anchor.target && anchor.target !== '_self')) return
    const url = new URL(anchor.href)
    const page = getPage(url.pathname)
    if (url.origin !== window.location.origin || !page || url.search) return
    if (getPage(window.location.pathname) === page && page === renderedPage.current) {
      const target = hashTarget(url.hash)
      if (!target) return // Unknown anchors retain native behavior.
      event.preventDefault()
      controller.current?.abort()
      ++request.current
      setPending(false)
      positions.current.set(activeKey.current, window.scrollY)
      if (url.hash !== window.location.hash) {
        activeKey.current = crypto.randomUUID()
        history.pushState({ portfolioEntry: activeKey.current }, '', url.pathname + url.hash)
      }
      uncommittedPush.current = false
      target.focus({ preventScroll: true })
      // Keep one page and one canvas. No ingest/emerge trip between subsections.
      target.scrollIntoView({
        behavior: motion.current && document.documentElement.dataset.motion !== 'off' &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
        block: 'start',
      })
      return
    }
    event.preventDefault()
    await changePage(page, { key: crypto.randomUUID(), y: 0, hash: url.hash }, url)
  }

  return { page: location.page, pending, navigate }
}
