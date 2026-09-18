// Aurora shader adapted from React Bits by David Haz. See THIRD_PARTY_NOTICES.md.
// Raw WebGL2 keeps the original noise curtain without adding an OGL runtime.
import { useEffect, useRef, useState } from 'react'

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform float elapsed;
out vec4 fragColor;
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 cobalt = vec3(0.12, 0.27, 0.86);
  vec3 ice = vec3(0.27, 0.61, 1.0);
  vec3 blue = vec3(0.13, 0.32, 0.79);
  vec3 ramp = uv.x < 0.5 ? mix(cobalt, ice, uv.x * 2.0) : mix(ice, blue, uv.x * 2.0 - 1.0);
  float height = exp(snoise(vec2(uv.x * 2.0 + elapsed * 0.1, elapsed * 0.25)) * 0.65);
  float intensity = max(0.0, 0.6 * (uv.y * 2.0 - height + 0.2));
  float alpha = smoothstep(-0.1, 0.5, intensity);
  fragColor = vec4(intensity * ramp * alpha, alpha);
}`

export default function Aurora({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enabledRef = useRef(enabled)
  const refresh = useRef<() => void>()
  const [generation, setGeneration] = useState(0)
  useEffect(() => {
    enabledRef.current = enabled
    refresh.current?.()
  }, [enabled])

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
    const buffer = gl.createBuffer()
    if (!program || !buffer) {
      if (program) gl.deleteProgram(program)
      if (buffer) gl.deleteBuffer(buffer)
      return
    }
    const shaders: WebGLShader[] = []
    const release = () => {
      shaders.forEach(shader => gl.deleteShader(shader))
      gl.deleteBuffer(buffer)
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, 'resolution')
    const time = gl.getUniformLocation(program, 'elapsed')
    let frame = 0,
      previous = 0,
      elapsed = 4,
      lost = false
    const draw = () => {
      if (lost) return
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const tick = (now: number) => {
      frame = 0
      if (lost || !enabledRef.current || document.hidden) return
      if (now - previous >= 1000 / 20) {
        elapsed += Math.min((now - previous) / 1000, 0.15) * 0.45
        previous = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      const active = enabledRef.current && !document.hidden && !lost
      canvas.dataset.renderState = lost ? 'fallback' : active ? 'running' : 'paused'
      if (active) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(
        1,
        (rect.width < 760 ? 480 : 720) / Math.max(1, rect.width),
        480 / Math.max(1, rect.height),
      )
      const width = Math.max(1, Math.round(rect.width * ratio))
      const height = Math.max(1, Math.round(rect.height * ratio))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      draw()
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      sync()
    }
    const onRestored = () => setGeneration(value => value + 1)
    const observer = new ResizeObserver(resize)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    document.addEventListener('visibilitychange', sync)
    observer.observe(canvas)
    refresh.current = sync
    resize()
    draw()
    sync()
    return () => {
      cancelAnimationFrame(frame)
      refresh.current = undefined
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      document.removeEventListener('visibilitychange', sync)
      release()
      delete canvas.dataset.renderState
    }
  }, [generation])

  return <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />
}
