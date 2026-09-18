import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { pageEntries, type PageId } from '@/lib/pages'

export function Navigation({
  page,
  topic,
  pinned,
}: {
  page: PageId | undefined
  topic: string
  pinned: boolean
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
          <span className="header-topic" data-pinned={pinned} title={topic}>
            <span key={topic}>{topic}</span>
          </span>
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
    </header>
  )
}
