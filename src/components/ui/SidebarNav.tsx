import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from './Sparkles'

type NavItem = {
  id: string
  label: string
  href: string
  icon: (active: boolean) => React.ReactNode
}

export function SidebarNav() {
  const [active, setActive] = useState('hero')
  const [isIdle, setIsIdle] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-hide during activity; show when idle (or hovered)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const onActivity = () => {
      setIsIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => {
        setIsIdle(true)
      }, 1500)
    }

    // Default to idle shortly after initial mount
    timer = setTimeout(() => {
      setIsIdle(true)
    }, 1500)

    window.addEventListener('mousemove', onActivity, { passive: true })
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity, { passive: true })
    window.addEventListener('touchstart', onActivity, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
    }
  }, [])

  useEffect(() => {
    const sections = ['hero', 'about', 'showcase', 'featured', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as string)
        })
      },
      { threshold: 0.35 }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const items: NavItem[] = [
    {
      id: 'hero',
      label: 'Home',
      href: '#hero',
      icon: (isActive) => (
        <svg
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'about',
      label: 'About',
      href: '#about',
      icon: (isActive) => (
        <svg
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'showcase',
      label: 'Work',
      href: '#showcase',
      icon: (isActive) => (
        <svg
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'featured',
      label: 'Featured',
      href: '#featured',
      icon: (isActive) => (
        <svg
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      href: '#contact',
      icon: (isActive) => (
        <svg
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const isVisible = isIdle || isHovered

  return (
    <>
      {/* Invisible edge trigger: hovering near left edge reveals sidebar */}
      <div
        className="fixed left-0 top-0 bottom-0 w-8 z-30 hidden lg:block"
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav
        aria-label="Section navigation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 transition-all duration-500 ease-out',
          isVisible
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-10 pointer-events-none'
        )}
      >
        <div className="glass rounded-3xl p-3 backdrop-blur-xl border border-blue-900/30 bg-black/85 shadow-2xl shadow-black">
          {items.map(({ id, label, href, icon }) => {
            const isActive = active === id
            return (
              <a
                key={id}
                href={href}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300',
                  isActive ? 'text-white' : 'text-slate-400 hover:text-blue-200'
                )}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg shadow-blue-950/60'
                      : 'bg-slate-900/70 border border-white/5 group-hover:bg-blue-950/50 group-hover:border-blue-800/40'
                  )}
                >
                  {icon(isActive)}
                </div>
                <span className="font-medium hidden xl:block">{label}</span>
                {isActive && (
                  <Sparkles
                    className="absolute -inset-2"
                    density={16}
                    color="rgba(59,130,246,0.5)"
                  />
                )}
              </a>
            )
          })}
        </div>
      </nav>
    </>
  )
}
