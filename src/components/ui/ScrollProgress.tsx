import { useState, useEffect } from 'react'

// Scroll progress bar at top of viewport (visible on desktop).
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 origin-left bg-gradient-to-r from-brand-blue via-brand-purple to-brand-violet transition-all duration-100" style={{ width: `${progress}%` }} aria-hidden="true" />
  )
}
