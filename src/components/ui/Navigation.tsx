import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { pageEntries, type PageId } from '@/lib/pages'
import type { SceneId } from '@/lib/scene'
import { sceneFavicon } from '@/lib/branding'

export function Navigation({
  page,
  topic,
  pinned,
  scene,
  progress,
  onTogglePin,
}: {
  page: PageId | undefined
  topic: string
  pinned: boolean
  scene: SceneId
  progress: number
  onTogglePin: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 760px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    document.addEventListener('keydown', escape)
    document.addEventListener('pointerdown', outside)
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.removeEventListener('keydown', escape)
      document.removeEventListener('pointerdown', outside)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  return (
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <div className="header-brand">
          <a
            className="wordmark"
            href="/"
            aria-label="Uthsara Dahanaike, home"
            data-topic="Portfolio"
            data-scene="home"
          >
            <span className="monogram">
              u<span>.</span>
            </span>
            <span>uthsara</span>
          </a>
          <span className="header-divider" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className="header-topic"
            data-pinned={pinned}
            aria-pressed={pinned}
            aria-label={
              pinned
                ? 'Unpin ' + topic + ' and follow the page'
                : 'Pin ' + topic + ' title'
            }
            title={
              pinned
                ? 'Click to follow the page'
                : 'Click to keep this title selected'
            }
            onClick={onTogglePin}
          >
            <img
              className="topic-symbol"
              src={sceneFavicon(scene)}
              width="24"
              height="24"
              alt=""
            />
            <span className="topic-label" key={topic}>
              {topic}
            </span>
            <svg
              className="topic-pin"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path d="m6 2 6 6-2 1-1 3-2-2-4 4m4-4-3-3 3-1 1-2" />
            </svg>
          </button>
        </div>
        <div className="header-actions">
          <button
            ref={menuButton}
            type="button"
            className="icon-button menu-toggle"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
        <nav
          id="primary-navigation"
          className={'primary-nav ' + (open ? 'is-open' : '')}
          aria-label="Main navigation"
          onBlur={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              !header.current?.contains(event.relatedTarget)
            )
              setOpen(false)
          }}
        >
          {pageEntries.map(([id, item]) => (
            <a
              key={id}
              href={item.href}
              aria-current={page === id ? 'page' : undefined}
              data-topic={id === 'home' ? 'Portfolio' : item.label}
              data-scene={id}
            >
              {item.label}
              {id === 'contact' && <Icon name="arrow" width="15" height="15" />}
            </a>
          ))}
        </nav>
      </div>
      <span
        className="header-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </header>
  )
}
