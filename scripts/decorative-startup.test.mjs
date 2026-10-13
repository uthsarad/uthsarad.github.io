import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Execute the actual production source, not a copied scheduler implementation.
// This deterministic browser-API harness proves scheduling behavior, not real GPU paint timing.
const sourceUrl = new URL('../src/lib/decorative-startup.ts', import.meta.url)
const compiled = ts.transpileModule(readFileSync(sourceUrl, 'utf8'), {
  fileName: sourceUrl.pathname,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
})
assert.deepEqual(compiled.diagnostics ?? [], [], 'Scheduler source must transpile without diagnostics')

const fcp = { name: 'first-contentful-paint' }

function browserHarness({ now = 0, paints = [], hidden = false, observerMode = 'supported' } = {}) {
  let clock = now
  let nextId = 1
  const entries = [...paints]
  const timers = new Map()
  const frames = new Map()
  const listeners = new Map()
  const observers = []
  const starts = []
  const document = {
    hidden,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type).add(callback)
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback)
    },
  }
  class PaintObserver {
    static supportedEntryTypes = observerMode === 'unsupported' ? [] : ['paint']
    constructor(callback) {
      if (observerMode === 'constructor-throws') throw new Error('Observer constructor unavailable')
      this.callback = callback
      this.connected = false
      this.disconnectCount = 0
      observers.push(this)
    }
    observe(options) {
      this.options = options
      if (observerMode === 'observe-throws') throw new Error('Paint observation unavailable')
      this.connected = true
    }
    disconnect() {
      this.connected = false
      this.disconnectCount++
    }
  }
  const exports = {}
  runInNewContext(compiled.outputText, {
    exports,
    document,
    performance: {
      now: () => clock,
      getEntriesByType: (type) => type === 'paint' ? [...entries] : [],
    },
    PerformanceObserver: observerMode === 'missing' ? undefined : PaintObserver,
    window: {
      setTimeout(callback, delay) {
        const id = nextId++
        timers.set(id, { callback, due: clock + delay })
        return id
      },
      clearTimeout: (id) => timers.delete(id),
    },
    requestAnimationFrame(callback) {
      const id = nextId++
      frames.set(id, callback)
      return id
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  }, { filename: sourceUrl.pathname, timeout: 1000 })
  assert.equal(typeof exports.scheduleDecorativeStartup, 'function')

  function advanceTo(target) {
    assert.ok(target >= clock, 'The fake clock cannot travel backwards')
    let iterations = 0
    while (true) {
      const due = [...timers].filter(([, timer]) => timer.due <= target)
        .sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0]
      if (!due) break
      assert.ok(++iterations < 100, 'Timer queue must settle')
      const [id, timer] = due
      timers.delete(id)
      clock = Math.max(clock, timer.due)
      timer.callback()
    }
    clock = target
  }
  function frame() {
    advanceTo(clock + 16)
    // A nested rAF belongs to the next frame, never this same snapshot.
    const queued = [...frames]
    for (const [id, callback] of queued) {
      if (!frames.delete(id)) continue
      callback(clock)
    }
  }
  function paint(name = fcp.name) {
    const entry = { name }
    entries.push(entry)
    for (const observer of [...observers]) {
      if (observer.connected) observer.callback({ getEntries: () => [entry] })
    }
  }
  function visibility(value) {
    document.hidden = value
    for (const callback of [...(listeners.get('visibilitychange') ?? [])]) callback()
  }
  function assertClean() {
    assert.equal(timers.size, 0, 'No startup timer remains')
    assert.equal(frames.size, 0, 'No animation frame remains')
    assert.equal(observers.filter((observer) => observer.connected).length, 0, 'No paint observer remains')
    assert.equal(listeners.get('visibilitychange')?.size ?? 0, 0, 'No visibility listener remains')
  }
  return {
    timers, frames, observers, starts, advanceTo, frame, paint, visibility, assertClean,
    schedule: () => exports.scheduleDecorativeStartup(() => starts.push(clock)),
  }
}

function releaseInTwoFrames(browser) {
  assert.equal(browser.frames.size, 1)
  browser.frame()
  assert.equal(browser.starts.length, 0, 'The first frame must not release work')
  assert.equal(browser.frames.size, 1)
  browser.frame()
  assert.equal(browser.starts.length, 1, 'The second frame releases work once')
  browser.assertClean()
}

test('FCP before 2500ms waits for the floor and then two frames', () => {
  const browser = browserHarness({ now: 100 })
  browser.schedule()
  const [observer] = browser.observers
  assert.equal(observer.options.type, 'paint')
  assert.equal(observer.options.buffered, true)
  browser.paint('first-paint')
  assert.equal(observer.connected, true, 'First paint alone is not FCP')
  assert.equal(browser.frames.size, 0)
  browser.advanceTo(1000)
  browser.paint()
  assert.equal(observer.connected, false)
  assert.equal(browser.frames.size, 0)
  browser.advanceTo(2499)
  assert.equal(browser.starts.length, 0)
  assert.equal(browser.frames.size, 0)
  browser.advanceTo(2500)
  releaseInTwoFrames(browser)
})

test('A late scheduler waits for FCP even after the floor, then yields two frames', () => {
  const browser = browserHarness({ now: 3200 })
  browser.schedule()
  browser.advanceTo(4000)
  browser.frame()
  assert.equal(browser.starts.length, 0)
  assert.equal(browser.frames.size, 0)
  assert.equal(browser.observers[0].connected, true)
  browser.paint()
  assert.equal(browser.starts.length, 0)
  releaseInTwoFrames(browser)
})

test('An existing buffered FCP on resume yields two frames without a fresh 2500ms wait', () => {
  const browser = browserHarness({ now: 8000, paints: [fcp] })
  browser.schedule()
  assert.equal(browser.observers.length, 0, 'Known FCP needs no new observer')
  releaseInTwoFrames(browser)
  assert.equal(browser.starts[0], 8032)
})

test('A non-FCP buffered paint entry does not bypass the real FCP observer', () => {
  const browser = browserHarness({ now: 3000, paints: [{ name: 'first-paint' }] })
  browser.schedule()
  browser.advanceTo(3100)
  assert.equal(browser.frames.size, 0)
  browser.paint()
  releaseInTwoFrames(browser)
})

test('Becoming hidden before the floor timer expires waits until visible', () => {
  const browser = browserHarness({ now: 100, paints: [fcp] })
  browser.schedule()
  browser.visibility(true)
  browser.advanceTo(3000)
  assert.equal(browser.starts.length, 0)
  assert.equal(browser.frames.size, 0)
  browser.visibility(false)
  releaseInTwoFrames(browser)
})

test('FCP and an expired floor while already hidden do not release work', () => {
  const browser = browserHarness({ now: 3000, hidden: true })
  browser.schedule()
  browser.advanceTo(4000)
  browser.paint()
  assert.equal(browser.frames.size, 0)
  assert.equal(browser.starts.length, 0)
  browser.visibility(false)
  releaseInTwoFrames(browser)
})

for (const completedFrames of [0, 1]) {
  test(`Hiding after ${completedFrames} queued release frames defers until visible`, () => {
    const browser = browserHarness({ now: 3000, paints: [fcp] })
    browser.schedule()
    for (let index = 0; index < completedFrames; index++) browser.frame()
    browser.visibility(true)
    browser.frame()
    browser.frame()
    assert.equal(browser.starts.length, 0)
    assert.equal(browser.frames.size, 0)
    browser.advanceTo(5000)
    browser.visibility(false)
    releaseInTwoFrames(browser)
  })
}

for (const observerMode of ['missing', 'unsupported', 'constructor-throws', 'observe-throws']) {
  test(`${observerMode} paint observer uses a two-frame fallback without bypassing the floor`, () => {
    const browser = browserHarness({ now: 100, observerMode })
    browser.schedule()
    assert.equal(browser.frames.size, 1)
    browser.frame()
    assert.equal(browser.starts.length, 0)
    assert.equal(browser.frames.size, 1)
    browser.frame()
    assert.equal(browser.starts.length, 0)
    assert.equal(browser.frames.size, 0, 'The fallback paint opportunity still waits for the floor')
    assert.equal(browser.observers.filter((observer) => observer.connected).length, 0)
    browser.advanceTo(2499)
    assert.equal(browser.frames.size, 0)
    browser.advanceTo(2500)
    releaseInTwoFrames(browser)
  })

  test(`${observerMode} late fallback yields a paint opportunity and two release frames`, () => {
    const browser = browserHarness({ now: 4000, observerMode })
    browser.schedule()
    browser.frame()
    assert.equal(browser.starts.length, 0)
    browser.frame()
    assert.equal(browser.starts.length, 0, 'Fallback frames are not proof of an observed FCP')
    releaseInTwoFrames(browser)
    assert.equal(browser.starts[0], 4064, 'No new navigation-relative delay is added')
  })
}

const cancellationStages = {
  'waiting for the floor': (browser) => {},
  'waiting for paint': (browser) => {},
  'first fallback frame': (browser) => {},
  'second fallback frame': (browser) => browser.frame(),
  'first release frame': (browser) => {},
  'second release frame': (browser) => browser.frame(),
}
for (const [stage, prepare] of Object.entries(cancellationStages)) {
  test(`Cancellation during ${stage} removes timers, observers, frames and listeners`, () => {
    const fallback = stage.includes('fallback')
    const release = stage.includes('release')
    const browser = browserHarness({
      now: release || stage === 'waiting for paint' ? 3000 : 100,
      paints: stage === 'waiting for the floor' || release ? [fcp] : [],
      observerMode: fallback ? 'unsupported' : 'supported',
    })
    const cancel = browser.schedule()
    prepare(browser)
    const queuedObservers = [...browser.observers]
    assert.ok(browser.timers.size + browser.frames.size + queuedObservers.filter((observer) => observer.connected).length > 0)
    cancel()
    cancel()
    browser.assertClean()
    for (const observer of queuedObservers) {
      assert.ok(observer.disconnectCount > 0)
      // A previously queued observer delivery must not revive a disposed schedule.
      observer.callback({ getEntries: () => [fcp] })
    }
    browser.paint()
    browser.visibility(true)
    browser.visibility(false)
    browser.advanceTo(10000)
    browser.frame()
    browser.frame()
    assert.equal(browser.starts.length, 0)
    browser.assertClean()
  })
}

test('Repeated paints, timer expiry and visibility events release the callback exactly once', () => {
  const browser = browserHarness({ now: 3000 })
  const cancel = browser.schedule()
  const [observer] = browser.observers
  browser.advanceTo(3000)
  browser.paint()
  browser.visibility(false)
  observer.callback({ getEntries: () => [fcp, fcp] })
  assert.equal(browser.frames.size, 1, 'Repeated signals cannot queue multiple release chains')
  browser.frame()
  observer.callback({ getEntries: () => [fcp] })
  browser.visibility(false)
  assert.equal(browser.frames.size, 1)
  browser.frame()
  browser.assertClean()
  browser.paint()
  observer.callback({ getEntries: () => [fcp] })
  browser.visibility(true)
  browser.visibility(false)
  browser.advanceTo(10000)
  browser.frame()
  cancel()
  assert.equal(browser.starts.length, 1)
  browser.assertClean()
})
