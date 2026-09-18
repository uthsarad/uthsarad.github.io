import { lazy, Suspense, useRef, useState, type KeyboardEvent } from 'react'
import { useVisible } from '@/lib/motion'
import { GhostFibers } from './reactbits/GhostFibers'
import { DepthText } from './reactbits/DepthText'

const DataParticles = lazy(() => import('./reactbits/DataParticles'))
const interests = [
  { id: 'security', label: 'Cybersecurity' },
  { id: 'data', label: 'Data Science + AI' },
] as const

export function InterestLab({ motionEnabled }: { motionEnabled: boolean }) {
  const [selected, setSelected] = useState<'security' | 'data'>('security')
  const ref = useRef<HTMLDivElement>(null)
  const visible = useVisible(ref)
  const animate = motionEnabled && visible

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 1
          : ['ArrowRight', 'ArrowLeft'].includes(event.key)
            ? 1 - index
            : undefined
    if (next === undefined) return
    event.preventDefault()
    setSelected(interests[next].id)
    document.getElementById('interest-tab-' + interests[next].id)?.focus()
  }

  return (
    <div ref={ref} className="interest-lab" data-animate={animate} data-reveal>
      <div className="interest-tabs" role="tablist" aria-label="Interests">
        {interests.map((interest, index) => (
          <button
            key={interest.id}
            id={'interest-tab-' + interest.id}
            role="tab"
            type="button"
            data-topic={interest.label}
            data-scene={interest.id}
            aria-selected={selected === interest.id}
            aria-controls="interest-panel"
            tabIndex={selected === interest.id ? 0 : -1}
            onKeyDown={(event) => onTabKey(event, index)}
            onClick={() => setSelected(interest.id)}
          >
            {interest.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="interest-panel"
        aria-labelledby={'interest-tab-' + selected}
        tabIndex={0}
        className={'interest-panel interest-' + selected}
      >
        {selected === 'security' ? (
          <>
            <div className="interest-scene">
              <GhostFibers enabled={animate} />
              <div className="security-depth">
                <DepthText text="UNSEEN" enabled={animate} />
              </div>
            </div>
            <p className="scene-caption">
              Reverse engineering &amp; digital forensics
            </p>
          </>
        ) : (
          <Suspense
            fallback={
              <div className="particle-loading" role="status">
                Loading the data scene…
              </div>
            }
          >
            <DataParticles enabled={animate} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
