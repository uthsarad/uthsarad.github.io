import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { getPage } from './pages'
import { loadPage } from './page-content'

// Real hrefs and generated HTML remain the fallback. Only ordinary local page
// clicks are enhanced, keeping the globe, CSS, and React runtime alive.
export function usePageNavigation(initialPath: string) {
  const [location, setLocation] = useState(() => ({
    page: getPage(initialPath),
    key: '',
    y: 0,
    hash: '',
  }))
  const [pending, setPending] = useState(false)
  const activeKey = useRef('')
  const positions = useRef(new Map<string, number>())
  const request = useRef(0)

  useEffect(() => {
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    activeKey.current = history.state?.portfolioEntry ?? crypto.randomUUID()
    history.replaceState(
      { ...history.state, portfolioEntry: activeKey.current },
      '',
    )
    const pop = async () => {
      const id = ++request.current
      positions.current.set(activeKey.current, window.scrollY)
      const key = history.state?.portfolioEntry ?? crypto.randomUUID()
      const page = getPage(window.location.pathname)
      setPending(true)
      try {
        if (page) await loadPage(page)
        if (id !== request.current) return
        activeKey.current = key
        setLocation({ page, key, y: positions.current.get(key) ?? 0, hash: '' })
        setPending(false)
      } catch {
        if (id === request.current) window.location.reload()
      }
    }
    window.addEventListener('popstate', pop)
    return () => {
      ++request.current
      history.scrollRestoration = restoration
      window.removeEventListener('popstate', pop)
    }
  }, [])

  useEffect(() => {
    if (!location.key) return // Preserve native scroll restoration on a direct visit.
    const frame = requestAnimationFrame(() => {
      document.getElementById('main')?.focus({ preventScroll: true })
      if (location.hash) {
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: 'instant', block: 'start' })
      } else window.scrollTo({ top: location.y, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location])

  const navigate = async (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    )
      return
    const anchor =
      event.target instanceof Element ? event.target.closest('a') : null
    if (
      !anchor ||
      anchor.hasAttribute('download') ||
      (anchor.target && anchor.target !== '_self')
    )
      return
    const url = new URL(anchor.href)
    const page = getPage(url.pathname)
    if (
      url.origin !== window.location.origin ||
      !page ||
      url.search ||
      (url.pathname === window.location.pathname && !url.hash) ||
      (url.hash &&
        (url.pathname !== window.location.pathname ||
          !document.getElementById(url.hash.slice(1))))
    )
      return
    event.preventDefault()
    const id = ++request.current
    setPending(true)
    try {
      await loadPage(page)
      if (id !== request.current) return
      positions.current.set(activeKey.current, window.scrollY)
      const key = crypto.randomUUID()
      history.pushState({ portfolioEntry: key }, '', url.pathname + url.hash)
      activeKey.current = key
      setLocation({ page, key, y: 0, hash: url.hash })
      setPending(false)
    } catch {
      if (id === request.current) window.location.assign(url.href)
    }
  }

  return { page: location.page, pending, navigate }
}
