import {
  useEffect,
  useState,
  type FocusEvent,
  type PointerEvent,
  type MouseEvent,
} from 'react'
import { pages, type PageId } from './pages'

export type SceneId =
  'home' | 'security' | 'data' | 'projects' | 'coursework' | 'about' | 'contact'
type Topic = { label: string; scene: SceneId }
const sceneIds: SceneId[] = [
  'home',
  'security',
  'data',
  'projects',
  'coursework',
  'about',
  'contact',
]

function topicFrom(element: Element | null, interactive = false): Topic | null {
  const target = element?.closest<HTMLElement>(
    interactive ? '[data-topic]:not([data-scene-section])' : '[data-topic]',
  )
  const scene = target?.dataset.scene as SceneId
  return target?.dataset.topic && sceneIds.includes(scene)
    ? { label: target.dataset.topic, scene }
    : null
}

export function useScene(page: PageId | undefined) {
  const initial: Topic = {
    label: page && page !== 'home' ? pages[page].label : 'Portfolio',
    scene: page ?? 'home',
  }
  const [reading, setReading] = useState(initial)
  const [pinned, setPinned] = useState<Topic | null>(null)
  const [hovered, setHovered] = useState<Topic | null>(null)
  const [focused, setFocused] = useState<Topic | null>(null)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const line = Math.min(window.innerHeight * 0.42, 360)
      const sections = [
        ...document.querySelectorAll<HTMLElement>('[data-scene-section]'),
      ]
      const passed = sections.filter((el) => {
        const box = el.getBoundingClientRect()
        return box.top <= line && box.bottom > 80
      })
      const current = passed[passed.length - 1]
      const next = topicFrom(current ?? sections[0] ?? null) ?? initial
      setReading((previous) =>
        previous.label === next.label && previous.scene === next.scene
          ? previous
          : next,
      )
    }
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', scroll)
    }
  }, [page])

  const active = hovered ?? focused ?? pinned ?? reading
  return {
    ...active,
    pinned: pinned?.label === active.label,
    handlers: {
      onPointerOver: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse')
          setHovered(topicFrom(event.target as Element, true))
      },
      onPointerOut: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse')
          setHovered(
            topicFrom(
              event.relatedTarget instanceof Element
                ? event.relatedTarget
                : null,
              true,
            ),
          )
      },
      onFocusCapture: (event: FocusEvent<HTMLDivElement>) => {
        const topic = topicFrom(event.target, true)
        setHovered(null)
        setFocused(topic)
        if (event.target.getAttribute('role') === 'tab' && topic)
          setPinned(topic)
      },
      onBlurCapture: (event: FocusEvent<HTMLDivElement>) =>
        setFocused(
          topicFrom(
            event.relatedTarget instanceof Element ? event.relatedTarget : null,
            true,
          ),
        ),
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const topic = topicFrom(event.target as Element, true)
        if (topic) setPinned(topic)
      },
    },
  }
}

// Content remains visible without JS. Each block gets a single gentle falling entrance.
export function useContentEntrance(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const seen = new WeakSet<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          ;(entry.target as HTMLElement).dataset.revealed = 'true'
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.08 },
    )
    const scan = () =>
      document.querySelectorAll('[data-reveal]').forEach((element) => {
        if (!seen.has(element)) {
          seen.add(element)
          observer.observe(element)
        }
      })
    scan()
    const mutations = new MutationObserver(scan)
    const main = document.querySelector('main')
    if (main) mutations.observe(main, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [enabled])
}
