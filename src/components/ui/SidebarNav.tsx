import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from './Sparkles'

type NavItem = {
  id: string
  label: string
  href: string
}

// Left vertical sidebar navigation with magnetic hover and active state.
export function SidebarNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const sections = ['hero', 'about', 'showcase', 'featured', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as string)
        })
      },
      { threshold: 0.4 }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const items: NavItem[] = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'showcase', label: 'Work', href: '#showcase' },
    { id: 'featured', label: 'Featured', href: '#featured' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]

  return (
    <nav aria-label="Section navigation" className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
      <div className="glass rounded-3xl p-3 backdrop-blur-xl border border-white/5 shadow-2xl">
        {items.map(({ id, label, href }) => (
          <a
            key={id}
            href={href}
            className={cn(
              'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300',
              active === id ? 'text-white' : 'text-slate-400 hover:text-slate-100',
            )}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                active === id
                  ? 'bg-gradient-to-br from-brand-blue to-brand-purple shadow-lg shadow-brand-purple/30'
                  : 'bg-slate-800/50 group-hover:bg-slate-700/50',
              )}
            >
              {/* Icon placeholder — could be replaced with actual icon components */}
              <span className="text-lg">{label === 'Home' ? '🏠' : label === 'About' ? '👨‍💻' : label === 'Work' ? '💼' : label === 'Featured' ? '⭐' : '📧'}</span>
            </div>
            <span className="font-medium hidden xl:block">{label}</span>
            {active === id && <Sparkles className="absolute -inset-2" density={20} color="rgba(168,85,247,0.5)" />}
          </a>
        ))}
      </div>
    </nav>
  )
}
