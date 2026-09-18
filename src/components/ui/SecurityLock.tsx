import { useEffect, useId, useState, type CSSProperties } from 'react'

// A local illustration: scattered glass pieces assemble into a closed padlock.
// The entrance runs once per mount and pauses, rather than restarting, offscreen.
export function SecurityLock({ enabled }: { enabled: boolean }) {
  const gradient = useId()
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (enabled) setStarted(true)
  }, [enabled])

  return (
    <div className="security-lock" data-intro={started} data-enabled={enabled}>
      <svg
        viewBox="0 0 360 280"
        role="img"
        aria-label="A blue padlock assembling from fragments and closing."
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#c8e5ff" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="#5292ee" stopOpacity="0.42" />
            <stop offset="1" stopColor="#183e85" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <g className="lock-circuits" fill="none" stroke="#77afff" strokeWidth="1">
          <path pathLength="1" d="M22 102h35l30 30h25M338 102h-35l-30 30h-25M38 219h42l22-22h10M322 219h-42l-22-22h-10" />
          <circle cx="22" cy="102" r="3" />
          <circle cx="338" cy="102" r="3" />
          <circle cx="38" cy="219" r="3" />
          <circle cx="322" cy="219" r="3" />
        </g>
        <path className="lock-shackle-shadow" d="M132 130V91a48 48 0 0 1 96 0v39" />
        <path className="lock-shackle" pathLength="1" d="M132 130V91a48 48 0 0 1 96 0v39" />
        <g fill={`url(#${gradient})`}>
          {Array.from({ length: 12 }, (_, i) => {
            const column = i % 4
            const row = Math.floor(i / 4)
            return (
              <rect
                className="lock-piece"
                key={i}
                x={112 + column * 34}
                y={126 + row * 34}
                width="33" height="33" rx="4"
                style={{
                  '--piece-x': `${(column - 1.5) * 65}px`,
                  '--piece-y': `${(row - 1) * 70 - 25}px`,
                  '--piece-turn': `${(i % 2 ? 1 : -1) * (24 + i * 4)}deg`,
                  '--piece-delay': `${i * 45}ms`,
                } as CSSProperties}
              />
            )
          })}
        </g>
        <rect className="lock-outline" pathLength="1" x="110" y="124" width="140" height="106" rx="15" />
        <g className="lock-keyhole" fill="#06152d" stroke="#b9dcff" strokeWidth="1.5">
          <path d="M173 178a12 12 0 1 1 14 0l4 21h-22z" />
        </g>
      </svg>
    </div>
  )
}
