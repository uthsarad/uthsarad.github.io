// Adapted from React Bits DepthText. See THIRD_PARTY_NOTICES.md.
// Layered CSS transforms keep the dimensional face legible when motion is off.
import { type CSSProperties, type PointerEvent, useRef } from 'react'

export function DepthText({
  text,
  enabled = true,
}: {
  text: string
  enabled?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  function move(event: PointerEvent<HTMLSpanElement>) {
    if (!enabled || event.pointerType !== 'mouse' || !ref.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    ref.current.style.setProperty(
      '--depth-x',
      (0.5 - (event.clientY - rect.top) / rect.height) * 14 + 'deg',
    )
    ref.current.style.setProperty(
      '--depth-y',
      ((event.clientX - rect.left) / rect.width - 0.5) * 20 + 'deg',
    )
  }
  function reset() {
    ref.current?.style.removeProperty('--depth-x')
    ref.current?.style.removeProperty('--depth-y')
  }
  return (
    <span
      ref={ref}
      className="depth-text"
      onPointerMove={move}
      onPointerLeave={reset}
      data-enabled={enabled}
    >
      <span className="depth-text-stage">
        {Array.from({ length: 18 }, (_, i) => {
          const depth = 18 - i
          return (
            <span
              aria-hidden="true"
              key={depth}
              className="depth-text-layer"
              style={
                {
                  transform: 'translateZ(-' + depth * 1.5 + 'px)',
                  color:
                    'color-mix(in srgb, #b6d7ff ' +
                    (12 + i * 3) +
                    '%, #1545a4)',
                } as CSSProperties
              }
            >
              {text}
            </span>
          )
        })}
        <span className="depth-text-face">{text}</span>
      </span>
    </span>
  )
}
