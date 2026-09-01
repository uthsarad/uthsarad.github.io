import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 450)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25 }}
          aria-label="Scroll to top of page"
          className="fixed bottom-20 lg:bottom-8 right-5 lg:right-8 z-30 p-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-brand-violet/50 hover:bg-slate-800/90 shadow-xl shadow-black/50 transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
