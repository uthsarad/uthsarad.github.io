import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CopyEmailButton({
  email,
  className = '',
}: {
  email: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleCopy}
        className={className}
        aria-label="Copy email address to clipboard"
      >
        <span className="relative z-10 flex items-center gap-2">
          {copied ? (
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
          <span>{copied ? 'Copied to clipboard!' : 'Copy email'}</span>
        </span>
      </button>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 -top-11 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-white/10 text-xs font-medium text-green-400 shadow-xl backdrop-blur pointer-events-none whitespace-nowrap z-30"
          >
            ✓ Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
