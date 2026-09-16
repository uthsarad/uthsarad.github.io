import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type NavItem = {
  id: string
  label: string
  href: string
  icon: (active: boolean) => React.ReactNode
}

export function MobileNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const sections = ['hero', 'about', 'showcase', 'featured', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as string)
        })
      },
      { threshold: 0.3 }
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
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400')}
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
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400')}
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
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400')}
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
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400')}
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
          className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-slate-400')}
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

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden"
    >
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/90 backdrop-blur-xl border border-blue-900/30 shadow-2xl shadow-black">
        {items.map(({ id, label, href, icon }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={href}
              aria-label={label}
              className={cn(
                'relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-colors',
                isActive ? 'text-white' : 'text-slate-400 hover:text-blue-200'
              )}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-700 to-blue-900 shadow-md shadow-blue-950/60"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{icon(isActive)}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
