import { startTransition, useEffect, useState } from 'react'
import { useReducedMotion } from './lib/motion'
import { Navigation } from './components/ui/Navigation'
import { Footer } from './components/ui/Footer'
import { AmbientBackground } from './components/ui/AmbientBackground'
import { pages } from './lib/pages'
import { PageContent } from './lib/page-content'
import { usePageNavigation } from './lib/navigation'
import { useScene } from './lib/scene'
import { profile } from './data/profile'
import { sceneFavicon } from './lib/branding'

const motionKey = 'portfolio:motion-paused'

function readMotionPreference() {
  try {
    return localStorage.getItem(motionKey) === 'true'
  } catch {
    return false
  }
}

export default function App({
  initialPath = typeof window === 'undefined' ? '/' : window.location.pathname,
}: {
  initialPath?: string
}) {
  const { page, pending, navigate } = usePageNavigation(initialPath)
  const reduceMotion = useReducedMotion()
  // Match the generated HTML, then restore browser preferences after hydration.
  const [paused, setPaused] = useState(false)
  const motionEnabled = !reduceMotion && !paused
  const scene = useScene(page)

  function toggleMotion() {
    const next = !paused
    setPaused(next)
    try {
      localStorage.setItem(motionKey, String(next))
    } catch {
      /* The switch still works when browser storage is unavailable. */
    }
  }

  useEffect(() => {
    const restore = () =>
      startTransition(() => setPaused(readMotionPreference()))
    restore()
    const changed = (event: StorageEvent) => {
      if (event.key === motionKey) restore()
    }
    // Full-page navigation can restore a previous document from the back/forward cache.
    window.addEventListener('pageshow', restore)
    window.addEventListener('storage', changed)
    return () => {
      window.removeEventListener('pageshow', restore)
      window.removeEventListener('storage', changed)
    }
  }, [])

  useEffect(() => {
    document.title = `${page ? scene.label : 'Page not found'} | ${profile.name}`
  }, [page, scene.label])

  useEffect(() => {
    document
      .querySelector<HTMLLinkElement>('#portfolio-favicon')
      ?.setAttribute('href', sceneFavicon(scene.scene))
  }, [scene.scene])

  useEffect(() => {
    if (!page) return
    const metadata = pages[page]
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', metadata.description)
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', 'https://uthsarad.github.io' + metadata.href)
    for (const [key, value] of Object.entries({
      'og:title': metadata.title,
      'og:description': metadata.description,
      'og:url': 'https://uthsarad.github.io' + metadata.href,
      'twitter:title': metadata.title,
      'twitter:description': metadata.description,
    })) {
      document
        .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
        ?.setAttribute('content', value)
    }
  }, [page])

  useEffect(() => {
    // The first hydration render matches the HTML. Keep the early preference
    // script's pause in place until browser state has finished restoring.
    const allowed =
      motionEnabled &&
      !readMotionPreference() &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.dataset.motion = allowed ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.motion
    }
  }, [motionEnabled])

  return (
    <div className="site-shell" id="top" {...scene.handlers} onClick={navigate}>
      <AmbientBackground
        page={page ?? 'home'}
        scene={scene.scene}
        motionEnabled={motionEnabled}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation
        page={page}
        topic={scene.label}
        pinned={scene.pinned}
        scene={scene.scene}
        progressRef={scene.progressRef}
        onTogglePin={scene.togglePin}
      />
      <main
        id="main"
        className={'page page-' + (page ?? 'not-found')}
        tabIndex={-1}
        aria-busy={pending || undefined}
      >
        <PageContent page={page} motionEnabled={motionEnabled} />
      </main>
      <Footer
        page={page}
        motionEnabled={motionEnabled}
        motionLocked={Boolean(reduceMotion)}
        onToggleMotion={toggleMotion}
      />
    </div>
  )
}
