import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { getPage, type PageId } from './pages'
import { loadPage } from './page-content'

// Real hrefs and generated HTML remain the fallback. Only ordinary local page
// clicks are enhanced, keeping the physical canvas and React runtime alive.
export function usePageNavigation(initialPath: string, motionEnabled: boolean) {
  const [location, setLocation] = useState(() => ({
    page: getPage(initialPath), key: '', y: 0, hash: '',
  }))
  const [pending, setPending] = useState(false)
  const activeKey = useRef('')
  const positions = useRef(new Map<string, number>())
  const request = useRef(0)
  const controller = useRef<AbortController>()
  const motion = useRef(motionEnabled)
  motion.current = motionEnabled

  const changePage = async (
    page: PageId | undefined,
    destination: { key: string; y: number; hash: string },
    url?: URL,
  ) => {
    const id = ++request.current
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    positions.current.set(activeKey.current, window.scrollY)
    setPending(true)
    let committed = false
    const commit = () => {
      if (id !== request.current || abort.signal.aborted) return
      if (url) history.pushState({ portfolioEntry: destination.key }, '', url.pathname + url.hash)
      activeKey.current = destination.key
      committed = true
      // The outgoing blocks have reached the horizon. Swap React content while
      // hidden, then measure the destination only after scroll restoration.
      flushSync(() => setLocation({ page, ...destination }))
    }
    try {
      if (page) await loadPage(page)
      if (id !== request.current) return
      const animate = motion.current && !document.hidden &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches &&
        document.documentElement.dataset.motion !== 'off'
      if (animate) {
        // Keep the choreography outside the critical initial-page bundle.
        const { playSpaceTrip } = await import('./space-trip')
        if (id !== request.current) return
        await playSpaceTrip(commit, abort.signal)
      } else commit()
    } catch {
      // Animation is progressive enhancement, never a navigation dependency.
      if (id === request.current) {
        if (committed) document.getElementById('main')?.focus({ preventScroll: true })
        else if (url) window.location.assign(url.href)
        else window.location.reload()
      }
    } finally {
      if (id === request.current) {
        setPending(false)
        if (committed) document.getElementById('main')?.focus({ preventScroll: true })
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
      const key = history.state?.portfolioEntry ?? crypto.randomUUID()
      void changeRef.current(getPage(window.location.pathname), {
        key, y: positions.current.get(key) ?? 0, hash: window.location.hash,
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
    if (!location.key) return // Preserve native scroll restoration on a direct visit.
    const frame = requestAnimationFrame(() => {
      if (!document.getElementById('main')?.inert)
        document.getElementById('main')?.focus({ preventScroll: true })
      const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
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
    // Let in-page anchors, including the skip link, retain native behavior.
    if (url.pathname === window.location.pathname) return
    event.preventDefault()
    await changePage(page, { key: crypto.randomUUID(), y: 0, hash: url.hash }, url)
  }

  return { page: location.page, pending, navigate }
}
