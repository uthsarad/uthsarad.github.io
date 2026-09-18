import { Icon } from './Icon'
import { profile } from '@/data/profile'
import { pageEntries, type PageId } from '@/lib/pages'

export function Footer({
  page,
  motionEnabled,
  motionLocked,
  onToggleMotion,
}: {
  page: PageId | undefined
  motionEnabled: boolean
  motionLocked: boolean
  onToggleMotion: () => void
}) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <a className="wordmark" href="/" aria-label="Uthsara Dahanaike, home">
            <span className="monogram">
              u<span>.</span>
            </span>
            <span>Uthsara Dahanaike</span>
          </a>
          <nav className="footer-nav" aria-label="Footer navigation">
            {pageEntries
              .filter(([id]) => id !== 'home')
              .map(([id, item]) => (
                <a
                  key={id}
                  href={item.href}
                  aria-current={page === id ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <div className="footer-controls">
            <button
              type="button"
              className="motion-switch"
              role="switch"
              aria-label="Visual animations"
              aria-checked={motionEnabled}
              aria-describedby={motionLocked ? 'motion-preference' : undefined}
              disabled={motionLocked}
              onClick={onToggleMotion}
              title={
                motionLocked
                  ? 'Your system prefers reduced motion'
                  : 'Turn visual animations on or off'
              }
            >
              <span className="switch-track" aria-hidden="true">
                <span />
              </span>
              <span>Motion {motionEnabled ? 'on' : 'off'}</span>
            </button>
            {motionLocked && (
              <span id="motion-preference" className="sr-only">
                Animations are disabled by your system’s reduced-motion
                preference.
              </span>
            )}
            <a className="text-link" href="#top">
              Back to top <Icon name="arrow" width="13" height="13" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
