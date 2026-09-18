import {
  useEffect,
  useRef,
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
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    let dirty = true
    let scrollable = 0
    let line = 0
    let sections: { topic: Topic; top: number; bottom: number }[] = []
    setReading(initial)
    setPinned(null)
    setHovered(null)
    setFocused(null)
    const measure = () => {
      frame = 0
      const y = window.scrollY
      if (dirty) {
        dirty = false
        scrollable = document.documentElement.scrollHeight - window.innerHeight
        line = Math.min(window.innerHeight * 0.42, 360)
        sections = [
          ...document.querySelectorAll<HTMLElement>('[data-scene-section]'),
        ].flatMap((element) => {
          const topic = topicFrom(element)
          const box = element.getBoundingClientRect()
          return topic
            ? [{ topic, top: box.top + y, bottom: box.bottom + y }]
            : []
        })
      }
      const progress =
        scrollable > 0 ? Math.max(0, Math.min(1, y / scrollable)) : 0
      // Scroll progress is visual, not React state. No whole-page render per pixel.
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${progress})`
      let next = sections[0]?.topic ?? initial
      for (const section of sections) {
        if (section.top <= y + line && section.bottom > y + 80)
          next = section.topic
      }
      setReading((previous) =>
        previous.label === next.label && previous.scene === next.scene
          ? previous
          : next,
      )
    }
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const invalidate = () => {
      dirty = true
      scroll()
    }
    measure()
    const resize = new ResizeObserver(invalidate)
    resize.observe(document.body)
    const mutations = new MutationObserver(invalidate)
    const main = document.querySelector('main')
    if (main) mutations.observe(main, { childList: true, subtree: true })
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', invalidate)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutations.disconnect()
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', invalidate)
    }
  }, [page])

  const active = hovered ?? focused ?? pinned ?? reading
  return {
    ...active,
    progressRef,
    pinned: pinned?.label === active.label,
    togglePin: () => {
      setPinned(pinned ? null : active)
      setHovered(null)
      setFocused(null)
    },
    handlers: {
      onPointerOver: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse')
          setHovered((previous) =>
            sameTopic(previous, topicFrom(event.target as Element, true)),
          )
      },
      onPointerOut: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse')
          setHovered((previous) =>
            sameTopic(
              previous,
              topicFrom(
                event.relatedTarget instanceof Element
                  ? event.relatedTarget
                  : null,
                true,
              ),
            ),
          )
      },
      onFocusCapture: (event: FocusEvent<HTMLDivElement>) => {
        const topic = topicFrom(event.target, true)
        setHovered(null)
        setFocused((previous) => sameTopic(previous, topic))
        if (event.target.getAttribute('role') === 'tab' && topic)
          setPinned((previous) => sameTopic(previous, topic))
      },
      onBlurCapture: (event: FocusEvent<HTMLDivElement>) =>
        setFocused((previous) =>
          sameTopic(
            previous,
            topicFrom(
              event.relatedTarget instanceof Element
                ? event.relatedTarget
                : null,
              true,
            ),
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
        if (topic) setPinned((previous) => sameTopic(previous, topic))
      },
    },
  }
}

function sameTopic(previous: Topic | null, next: Topic | null) {
  return previous?.label === next?.label && previous?.scene === next?.scene
    ? previous
    : next
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
    const watch = (element: Element) => {
      if (!seen.has(element) && !element.hasAttribute('data-revealed')) {
        seen.add(element)
        observer.observe(element)
      }
    }
    document.querySelectorAll('[data-reveal]').forEach(watch)
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue
          if (node.matches('[data-reveal]')) watch(node)
          node.querySelectorAll('[data-reveal]').forEach(watch)
        }
    })
    const main = document.querySelector('main')
    if (main) mutations.observe(main, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [enabled])
}
