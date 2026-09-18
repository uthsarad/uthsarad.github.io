// Adapted from React Bits ShinyText. See THIRD_PARTY_NOTICES.md.
// CSS drives the same moving gradient without a per-frame React animation loop.
import { useRef } from 'react'
import { useVisible } from '@/lib/motion'

export function ShinyText({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useVisible(ref)
  return (
    <span
      ref={ref}
      className={'shiny-text ' + className}
      style={{ animationPlayState: visible ? 'running' : 'paused' }}
    >
      {text}
    </span>
  )
}
