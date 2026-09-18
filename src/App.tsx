import { useEffect, useState } from 'react'
import { useReducedMotion } from './lib/motion'
import { Navigation } from './components/ui/Navigation'
import { Footer } from './components/ui/Footer'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Showcase } from './sections/Showcase'
import { Contact } from './sections/Contact'
import { WorkGateway } from './sections/WorkGateway'
import { AmbientBackground } from './components/ui/AmbientBackground'
import { getPage, pages } from './lib/pages'
import { useScene, useContentEntrance } from './lib/scene'
import { profile } from './data/profile'

const page = getPage(window.location.pathname)
const motionKey = 'portfolio:motion-paused'

function readMotionPreference() {
  try {
    return localStorage.getItem(motionKey) === 'true'
  } catch {
    return false
  }
}

export default function App() {
  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(readMotionPreference)
  const motionEnabled = !reduceMotion && !paused
  const scene = useScene(page)
  useContentEntrance(motionEnabled)

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
    const restore = () => setPaused(readMotionPreference())
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
    document.title = `${page ? scene.label : 'Page not found'} — ${profile.name}`
  }, [scene.label])

  useEffect(() => {
    if (!page) return
    const metadata = pages[page]
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', metadata.description)
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', 'https://uthsarad.github.io' + metadata.href)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off'
    return () => {
      delete document.documentElement.dataset.motion
    }
  }, [motionEnabled])

  return (
    <div className="site-shell" id="top" {...scene.handlers}>
      <AmbientBackground scene={scene.scene} motionEnabled={motionEnabled} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation page={page} topic={scene.label} pinned={scene.pinned} />
      <main
        id="main"
        className={'page page-' + (page ?? 'not-found')}
        tabIndex={-1}
      >
        {page === 'home' && (
          <>
            <Hero motionEnabled={motionEnabled} />
            <WorkGateway />
          </>
        )}
        {page === 'projects' && (
          <Showcase collection="projects" motionEnabled={motionEnabled} />
        )}
        {page === 'coursework' && (
          <Showcase collection="coursework" motionEnabled={motionEnabled} />
        )}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
        {!page && (
          <section className="section container not-found">
            <p className="eyebrow section-index">404 / OFF THE MAP</p>
            <h1>This page wandered off.</h1>
            <p>
              My projects, coursework, and contact details are a click away.
            </p>
            <a className="button button-primary" href="/">
              Back to the portfolio
            </a>
          </section>
        )}
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
