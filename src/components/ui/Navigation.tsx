import { useEffect, useRef, useState, type RefObject } from 'react'
import { Icon } from './Icon'
import { ResumeButton } from './ResumeButton'
import { sectionEntries, type SectionId } from '@/data/sections'

export function Navigation({
  section,
  progressRef,
}: {
  section: SectionId | undefined
  progressRef: RefObject<HTMLSpanElement>
}) {
  const [enhanced, setEnhanced] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const active = sectionEntries.find((item) => item.id === section)

  useEffect(() => setEnhanced(true), [])
  useEffect(() => {
    const drawer = dialog.current
    if (!drawer) return
    if (open && !drawer.open) drawer.showModal()
    else if (!open && drawer.open) drawer.close()
  }, [open])

  function close() {
    // Close synchronously so the section receiving focus is no longer inert.
    dialog.current?.close()
    setOpen(false)
  }

  function links() {
    return sectionEntries.map((item) => (
      <a
        key={item.id}
        href={'/#' + item.id}
        aria-current={section === item.id ? 'location' : undefined}
        data-section-link
      >
        <span className="nav-number" aria-hidden="true">{item.number}</span>
        <span>{item.label}</span>
        <Icon name="arrow" width="18" height="18" />
      </a>
    ))
  }

  return (
    <header className="side-navigation">
      <a className="side-brand" href="/#hero" aria-label="Uthsara Dahanaike, introduction">
        <span className="monogram">u<span>.</span></span>
      </a>
      <button
        ref={menuButton}
        type="button"
        className="icon-button side-menu-toggle"
        hidden={!enhanced}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="navigation-drawer"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" />
      </button>
      {/* Native disclosure keeps section navigation usable without JavaScript. */}
      <details className="menu-fallback" hidden={enhanced}>
        <summary className="icon-button" aria-label="Open navigation">
          <Icon name="menu" /><span className="sr-only">Open navigation</span>
        </summary>
        <nav className="static-section-nav" aria-label="Portfolio sections">{links()}</nav>
      </details>
      <div className="side-reading" aria-hidden="true">
        <span className="side-number">{active?.number ?? '01'}</span>
        <span className="side-progress-track">
          <span className="side-progress" ref={progressRef} />
        </span>
        <span className="side-section-label">{active?.label ?? 'Portfolio'}</span>
      </div>
      <dialog
        id="navigation-drawer"
        ref={dialog}
        className="navigation-drawer"
        aria-labelledby="navigation-title"
        onCancel={(event) => { event.preventDefault(); close() }}
        onClose={(event) => {
          // A delayed close event from an earlier opening must not close a new one.
          if (!event.currentTarget.open) setOpen(false)
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const box = event.currentTarget.getBoundingClientRect()
          if (event.clientX < box.left || event.clientX > box.right ||
              event.clientY < box.top || event.clientY > box.bottom) close()
        }}
      >
        <div className="navigation-sheet">
          <div className="drawer-heading">
            <p className="eyebrow" id="navigation-title">Explore the portfolio</p>
            <button
              type="button"
              className="icon-button"
              aria-label="Close navigation"
              autoFocus
              onClick={() => { close(); menuButton.current?.focus() }}
            ><Icon name="close" /></button>
          </div>
          <nav
            id="primary-navigation"
            className="section-navigation"
            aria-label="Main navigation"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest('a')) close()
            }}
          >{links()}</nav>
          <div className="drawer-footer">
            <ResumeButton id="drawer-resume" />
            <p>Cybersecurity, data science + AI.<br />A little about what I build.</p>
          </div>
        </div>
      </dialog>
    </header>
  )
}
