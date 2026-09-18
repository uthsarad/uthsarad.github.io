// Adapted from React Bits Particles (David Haz). See THIRD_PARTY_NOTICES.md.
// A bounded WebGL2 renderer retains its point-sprite shader and wave motion;
// synthetic clustering and on-demand Anime.js transitions are local additions.
import { useEffect, useRef, useState } from 'react'

type Tween = { cancel: () => void }
type Animate = (
  target: { mix: number },
  options: { mix: number; duration: number; ease: string },
) => Tween
let animePromise: Promise<Animate | null> | undefined
function loadAnime() {
  const url = 'https://cdn.jsdelivr.net/npm/animejs@4.1.3/lib/anime.esm.js'
  return (animePromise ??= import(/* @vite-ignore */ url)
    .then((module) =>
      typeof module.animate === 'function' ? (module.animate as Animate) : null,
    )
    .catch(() => null))
}

const vertex = `#version 300 es
in vec3 position;
in vec3 cluster;
in vec3 color;
in vec2 random;
uniform float elapsed;
uniform float blend;
uniform float aspect;
uniform float pointScale;
out vec3 vColor;
void main() {
  vec3 p = mix(position, cluster, blend);
  float t = elapsed * 0.18;
  p.x += sin(t * random.y + 6.28 * random.x) * 0.09 * (1.0 - blend * 0.8);
  p.y += sin(t * random.x + 6.28 * random.y) * 0.09 * (1.0 - blend * 0.8);
  float perspective = 3.6 / (3.6 + p.z);
  gl_Position = vec4(p.x * perspective / (aspect * 1.4), p.y * perspective / 1.4, 0.0, 1.0);
  gl_PointSize = (4.0 + random.x * 5.0) * perspective * pointScale;
  vColor = mix(vec3(0.40, 0.66, 1.0), color, blend);
}`
const fragment = `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main() {
  float d = length(gl_PointCoord.xy - vec2(0.5));
  if (d > 0.5) discard;
  float circle = 1.0 - smoothstep(0.14, 0.5, d);
  fragColor = vec4(vColor, circle * 0.9);
}`
const count = 168
const fraction = (value: number) => value - Math.floor(value)
const samples = Array.from({ length: count }, (_, i) => {
  const a = fraction(Math.sin(i * 127.1 + 13) * 43758.5453)
  const b = fraction(Math.sin(i * 311.7 + 7) * 19341.592)
  const c = fraction(Math.sin(i * 73.3 + 19) * 29341.327)
  const group = i % 3
  return {
    position: [(a - 0.5) * 3.9, (b - 0.5) * 2.35, (c - 0.5) * 1.3],
    cluster: [
      [-0.9, 0.4],
      [0.05, -0.5],
      [0.95, 0.4],
    ][group]
      .map((center, axis) => center + (axis ? b - 0.5 : a - 0.5) * 0.72)
      .concat((c - 0.5) * 0.55),
    color: [
      [0.4, 0.7, 1],
      [0.48, 0.9, 0.92],
      [0.85, 0.9, 1],
    ][group],
    random: [a, b],
  }
})

export default function DataParticles({ enabled }: { enabled: boolean }) {
  const [clustered, setClustered] = useState(false)
  const [generation, setGeneration] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const control = useRef<{
    update: (active: boolean, grouped: boolean) => void
  }>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!gl) return
    const program = gl.createProgram()
    if (!program) return
    const shaders: WebGLShader[] = []
    const buffers: WebGLBuffer[] = []
    const release = () => {
      buffers.forEach((buffer) => gl.deleteBuffer(buffer))
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
    }
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type)
      if (!shader) {
        release()
        return
      }
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        release()
        return
      }
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release()
      return
    }
    gl.useProgram(program)
    for (const [key, size] of [
      ['position', 3],
      ['cluster', 3],
      ['color', 3],
      ['random', 2],
    ] as const) {
      const buffer = gl.createBuffer()
      if (!buffer) {
        release()
        return
      }
      buffers.push(buffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(samples.flatMap((sample) => sample[key])),
        gl.STATIC_DRAW,
      )
      const location = gl.getAttribLocation(program, key)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
    }
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const time = gl.getUniformLocation(program, 'elapsed')
    const blend = gl.getUniformLocation(program, 'blend')
    const aspect = gl.getUniformLocation(program, 'aspect')
    const pointScale = gl.getUniformLocation(program, 'pointScale')
    const model = { mix: 0 }
    let active = false,
      target = 0,
      disposed = false,
      lost = false
    let frame = 0,
      previous = 0,
      elapsed = 0,
      lastDraw = 0
    let animate: Animate | null = null
    let tween: Tween | undefined
    let transition: { from: number; start: number } | undefined
    void loadAnime().then((value) => {
      if (!disposed) {
        animate = value
        canvas.dataset.engine = value ? 'animejs' : 'local'
      }
    })
    const draw = () => {
      if (lost) return
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(time, elapsed)
      gl.uniform1f(blend, model.mix)
      gl.uniform1f(aspect, canvas.width / Math.max(canvas.height, 1))
      gl.uniform1f(pointScale, Math.max(0.7, canvas.width / 520))
      gl.drawArrays(gl.POINTS, 0, count)
    }
    const tick = (now: number) => {
      frame = 0
      if (!active || document.hidden || lost) return
      elapsed += Math.min((now - previous) / 1000, 0.1)
      previous = now
      if (transition) {
        const progress = Math.min(1, (now - transition.start) / 1100)
        const eased = progress * progress * (3 - 2 * progress)
        model.mix = transition.from + (target - transition.from) * eased
        if (progress === 1) transition = undefined
      }
      if (now - lastDraw >= 1000 / 30) {
        draw()
        lastDraw = now
      }
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      tween?.cancel()
      tween = undefined
      transition = undefined
    }
    const sync = () => {
      stop()
      const running = active && !document.hidden && !lost
      canvas.dataset.renderState = lost
        ? 'fallback'
        : running
          ? 'running'
          : 'paused'
      if (running) {
        if (animate)
          tween = animate(model, {
            mix: target,
            duration: 1100,
            ease: 'inOutCubic',
          })
        else transition = { from: model.mix, start: performance.now() }
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      } else {
        model.mix = target
        draw()
      }
    }
    control.current = {
      update: (value, grouped) => {
        active = value
        target = grouped ? 1 : 0
        sync()
      },
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(Math.min(720, rect.width)))
      canvas.height = Math.max(
        1,
        Math.round((rect.height * canvas.width) / Math.max(rect.width, 1)),
      )
      draw()
    }
    const observer = new ResizeObserver(resize)
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      sync()
    }
    const onRestored = () => setGeneration((value) => value + 1)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    document.addEventListener('visibilitychange', sync)
    observer.observe(canvas)
    resize()
    return () => {
      disposed = true
      stop()
      observer.disconnect()
      control.current = undefined
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      document.removeEventListener('visibilitychange', sync)
      release()
      delete canvas.dataset.renderState
    }
  }, [generation])

  useEffect(() => {
    control.current?.update(enabled, clustered)
  }, [enabled, clustered, generation])

  return (
    <>
      <div
        className="interest-scene particle-scene"
        role="img"
        aria-label={
          clustered
            ? 'Illustrative particles grouped into three clusters.'
            : 'Illustrative data points floating in a particle cloud.'
        }
      >
        <svg
          className="particle-fallback"
          viewBox="0 0 520 340"
          aria-hidden="true"
        >
          {samples.slice(0, 72).map((sample, i) => {
            const p = clustered ? sample.cluster : sample.position
            return (
              <circle
                key={i}
                cx={260 + p[0] * 105}
                cy={170 - p[1] * 105}
                r="3"
              />
            )
          })}
        </svg>
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <div className="particle-controls">
        <button
          type="button"
          className="lab-action"
          aria-pressed={clustered}
          onClick={() => setClustered(!clustered)}
        >
          {clustered ? 'Scatter points' : 'Find clusters'}{' '}
          <span aria-hidden="true">↗</span>
        </button>
        <span>Illustrative data</span>
      </div>
      <span role="status" className="sr-only">
        {clustered ? 'Three clusters revealed.' : 'Data points scattered.'}
      </span>
    </>
  )
}
