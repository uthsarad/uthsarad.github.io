import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type TextGenerateProps = {
  text: string
  className?: string
  speed?: number
}

// Typewriter-style reveal of a headline/line.
export function TextGenerateEffect({ text, className, speed = 28 }: TextGenerateProps) {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(reduce ? text.length : 0)

  useEffect(() => {
    if (reduce) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, reduce])

  const done = count >= text.length

  return (
    <span className={cn('inline', className)}>
      {text.slice(0, count)}
      {!done && <span className="animate-pulse font-light text-brand-violet">|</span>}
    </span>
  )
}
