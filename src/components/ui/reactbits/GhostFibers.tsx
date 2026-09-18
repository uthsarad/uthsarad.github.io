// Shader adapted from React Bits GhostFibers by David Haz.
// https://reactbits.dev/backgrounds/ghost-fibers; see THIRD_PARTY_NOTICES.md.
// Native WebGL adapter: no extra renderer dependency, capped resolution and FPS,
// offscreen/hidden-tab suspension, static fallback, and context recovery.
import { useEffect, useRef, useState } from 'react'

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`
const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform float elapsed;
out vec4 fragColor;
mat2 rotate2d(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / max(resolution.y, 1.0);
  float t = elapsed * 0.17;
  vec2 p = rotate2d(0.42 + t * 0.14) * uv / 1.6;
  vec3 linesColor = vec3(0.06, 0.16, 0.47);
  vec3 glowColor = vec3(0.03, 0.15, 0.53);
  vec3 color = vec3(0.0);
  for (int index = 0; index < 4; index++) {
    float fi = float(index) + 1.0;
    p += 0.025 * sin(p.yx * fi * 3.0 + t * (0.15 + fi * 0.08));
    float radius = length(p);
    float angle = atan(p.y, p.x);
    angle += sin(radius * 5.0 - t * 1.2 + fi) * 0.17;
    p = vec2(cos(angle), sin(angle)) * radius;
    float lines = abs(sin(p.x * (8.0 + fi * 3.0) + sin(p.y * 3.0 + t)));
    lines = pow(max(0.0, 1.0 - lines), 24.0);
    color += linesColor * lines / fi;
    float glow = exp(-10.0 * abs(sin(p.x * 3.0 + t + fi)));
    color += glowColor * glow * 1.6 / (fi * 2.0);
  }
  float center = exp(-2.2 * dot(uv, uv));
  color += linesColor * center * 0.4;
  float vignette = 1.0 - smoothstep(0.35, 1.75, length(uv));
  color *= mix(0.22, 1.0, vignette);
  color = 1.0 - exp(-color * 2.0);
  fragColor = vec4(vec3(0.025, 0.045, 0.085) + color, 1.0);
}
`

export function GhostFibers({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!gl) return
    const shaders: WebGLShader[] = []
    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    if (!program || !buffer) {
      if (program) gl.deleteProgram(program)
      if (buffer) gl.deleteBuffer(buffer)
      return
    }
    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)
      if (!shader) return null
      shaders.push(shader)
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null
    }
    const vs = compile(gl.VERTEX_SHADER, vertex)
    const fs = compile(gl.FRAGMENT_SHADER, fragment)
    const release = () => {
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
    if (!vs || !fs) {
      release()
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release()
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, 'resolution')
    const time = gl.getUniformLocation(program, 'elapsed')
    let frame = 0
    let elapsed = 8
    let previous = performance.now()
    let lastDraw = 0
    let visible = false
    let lost = false
    const draw = () => {
      if (lost) return
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      canvas.dataset.renderState = lost ? 'fallback' : 'paused'
    }
    const tick = (now: number) => {
      frame = 0
      if (!enabled || !visible || document.hidden || lost) return
      elapsed += Math.min((now - previous) / 1000, 0.1)
      previous = now
      if (now - lastDraw >= 1000 / 30) {
        draw()
        lastDraw = now
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      if (enabled && visible && !document.hidden && !lost) {
        canvas.dataset.renderState = 'running'
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(Math.min(rect.width, 900)))
      canvas.height = Math.max(
        1,
        Math.round((rect.height * canvas.width) / Math.max(1, rect.width)),
      )
      draw()
    }
    const resizeObserver = new ResizeObserver(resize)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      stop()
    }
    const onRestored = () => setGeneration((value) => value + 1)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    document.addEventListener('visibilitychange', sync)
    resizeObserver.observe(canvas)
    observer.observe(canvas)
    resize()
    sync()
    return () => {
      stop()
      resizeObserver.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      release()
      delete canvas.dataset.renderState
    }
  }, [enabled, generation])

  return (
    <div className="ghost-fibers" aria-hidden="true">
      <svg
        className="fiber-fallback"
        viewBox="0 0 500 340"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 22 }, (_, i) => (
          <path
            key={i}
            d={
              'M' +
              (-100 + i * 27) +
              ' 360 C' +
              (210 + i * 11) +
              ' 230 ' +
              (40 + i * 13) +
              ' 85 ' +
              (110 + i * 24) +
              ' -40'
            }
          />
        ))}
      </svg>
      <canvas ref={canvasRef} />
    </div>
  )
}
