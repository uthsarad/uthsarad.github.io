import { startTransition, useEffect, useState, type RefObject } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => startTransition(() => setReduced(query.matches))
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export function useVisible(ref: RefObject<HTMLElement>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  return visible
}
