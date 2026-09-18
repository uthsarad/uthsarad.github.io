// Adapted from React Bits SpotlightCard by David Haz.
// https://reactbits.dev/components/spotlight-card — see THIRD_PARTY_NOTICES.md.
import { useRef, type PointerEvent, type PropsWithChildren } from 'react'

export function SpotlightCard({
  children,
  className = '',
  enabled = true,
}: PropsWithChildren<{ className?: string; enabled?: boolean }>) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.pointerType !== 'mouse' || !ref.current) return
    const bounds = ref.current.getBoundingClientRect()
    ref.current.style.setProperty(
      '--mouse-x',
      event.clientX - bounds.left + 'px',
    )
    ref.current.style.setProperty(
      '--mouse-y',
      event.clientY - bounds.top + 'px',
    )
  }
  return (
    <div
      ref={ref}
      onPointerMove={enabled ? onMove : undefined}
      className={'card-spotlight ' + className}
      data-spotlight={enabled}
    >
      {children}
    </div>
  )
}
