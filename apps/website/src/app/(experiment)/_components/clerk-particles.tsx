'use client'

import * as React from 'react'

// Particle-shader logo, after basement.studio's effect for Vercel Ship:
// https://basement.studio/post/shipping-ship-behind-the-particle-shader-effect-for-vercels-conf
//
// Architecture (raw WebGL2, no deps):
//  1. The wordmark SVG is rasterized offscreen and sampled into a grid of
//     particle "home" positions (one particle per oversampled device pixel).
//  2. A low-res ping-pong "flow" FBO encodes direction-toward-cursor in RG
//     and magnitude in B, fading each frame — this is what gives particles
//     inertia instead of 1:1 cursor tracking.
//  3. A ping-pong position/velocity FBO (RGBA32F) integrates: flow-field
//     attraction toward the cursor + spring back to home + damping.
//  4. Particles draw as additive point sprites via gl_VertexID (no buffers).
// The static <img> stays for layout/no-JS/reduced-motion and fades out while
// the particles fly in from scatter on first intersection.

const GRID_CSS = 1.5 // grid pitch between particles, in css px
const MAX_PARTICLES = 65536
const FLOW_DOWNSCALE = 3
const FLOW_RADIUS_CSS = 26
const FORCE = 2.2
const SPRING = 0.06
const DAMPING = 0.885
const WOBBLE = 0

const FULLSCREEN_VS = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FLOW_FS = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uRadius;
uniform float uDt;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec3 prev = texture(uPrev, vUv).rgb;
  vec2 px = vUv * uRes;
  vec2 to = uMouse - px;
  float d = length(to);
  float infl = exp(-(d * d) / (2.0 * uRadius * uRadius)) * uStrength;
  infl = clamp(infl, 0.0, 1.0);
  vec2 dir = mix(prev.rg * 2.0 - 1.0, to / max(d, 0.0001), infl);
  float len = length(dir);
  if (len > 0.0001) dir /= len;
  float mag = max(prev.b * pow(0.94, uDt), infl);
  outColor = vec4(dir * 0.5 + 0.5, mag, 1.0);
}`

const SIM_FS = `#version 300 es
precision highp float;
uniform sampler2D uPos;
uniform sampler2D uHome;
uniform sampler2D uFlow;
uniform vec2 uCanvasRes;
uniform float uDt;
uniform float uForce;
uniform float uSpring;
uniform float uDamp;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 p = texture(uPos, vUv);
  vec4 h = texture(uHome, vUv);
  vec3 f = texture(uFlow, clamp(p.xy / uCanvasRes, 0.0, 1.0)).rgb;
  // negated flow direction: particles repel away from the cursor
  vec2 acc = -(f.rg * 2.0 - 1.0) * f.b * f.b * uForce;
  acc += (h.xy - p.xy) * uSpring * (0.6 + 0.8 * fract(h.w * 3.71));
  vec2 vel = (p.zw + acc * uDt) * pow(uDamp, uDt);
  outColor = vec4(p.xy + vel * uDt, vel);
}`

const POINTS_VS = `#version 300 es
precision highp float;
uniform sampler2D uPos;
uniform sampler2D uHome;
uniform vec2 uCanvasRes;
uniform float uTime;
uniform float uPointSize;
uniform float uWobble;
out float vAlpha;
out float vGlow;
void main() {
  ivec2 ts = textureSize(uPos, 0);
  ivec2 tc = ivec2(gl_VertexID % ts.x, gl_VertexID / ts.x);
  vec4 p = texelFetch(uPos, tc, 0);
  vec4 h = texelFetch(uHome, tc, 0);
  if (h.z <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    vGlow = 0.0;
    return;
  }
  float seed = h.w;
  vec2 wob = vec2(
    sin(uTime * 1.4 + seed * 6.2832),
    cos(uTime * 1.9 + seed * 9.4248)
  ) * uWobble * (0.35 + 0.65 * fract(seed * 7.13));
  float speed = length(p.zw);
  vec2 clip = (p.xy + wob) / uCanvasRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uPointSize * (1.0 + min(speed * 0.02, 0.5));
  vAlpha = h.z;
  vGlow = min(speed * 0.1, 1.0);
}`

const POINTS_FS = `#version 300 es
precision highp float;
in float vAlpha;
in float vGlow;
out vec4 outColor;
void main() {
  float a = vAlpha * (0.95 + 0.05 * vGlow);
  vec3 col = mix(vec3(1.0), vec3(1.0, 0.85, 0.55), vGlow * 0.6);
  outColor = vec4(col * a, a);
}`

function compileProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed')
    }
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'program link failed')
  }
  return p
}

function createTexture(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
  data: ArrayBufferView | null,
) {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

function createFbo(gl: WebGL2RenderingContext, tex: WebGLTexture) {
  const fbo = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  )
  const ok =
    gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  if (!ok) throw new Error('framebuffer incomplete')
  return fbo
}

type ParticleSystem = {
  step: (dtFrames: number, timeSec: number) => void
  setPointer: (x: number, y: number, strength: number) => void
  destroy: () => void
}

function createParticleSystem(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  logoCssWidth: number,
  logoCssHeight: number,
  padCss: number,
  dpr: number,
): ParticleSystem | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
  })
  if (!gl) return null
  if (!gl.getExtension('EXT_color_buffer_float')) return null

  const canvasW = Math.round((logoCssWidth + padCss * 2) * dpr)
  const canvasH = Math.round((logoCssHeight + padCss * 2) * dpr)
  canvas.width = canvasW
  canvas.height = canvasH

  // Rasterize the wordmark, then sample it on a coarse grid so individual
  // particle squares stay visible (the Ship-effect look). Integer device-px
  // pitch and cell size keep the resting grid rasterizing cleanly.
  const pitch = Math.max(2, Math.round(GRID_CSS * dpr))
  const cols = Math.max(1, Math.floor((logoCssWidth * dpr) / pitch))
  const rows = Math.max(1, Math.floor((logoCssHeight * dpr) / pitch))
  const raster = document.createElement('canvas')
  raster.width = cols
  raster.height = rows
  const ctx = raster.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, cols, rows)
  const pixels = ctx.getImageData(0, 0, cols, rows).data

  const lit: number[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const a = pixels[(y * cols + x) * 4 + 3]
      if (a > 115) lit.push(x, y, 1)
    }
  }
  const litCount = lit.length / 3
  const step = Math.max(1, Math.ceil(litCount / MAX_PARTICLES))
  const count = Math.floor(litCount / step)
  if (count === 0) return null
  const simSize = Math.ceil(Math.sqrt(count))

  const pointSize = Math.max(1, pitch - 1)
  // Snap resting squares so their edges fall between fragment centers —
  // otherwise sub-pixel residuals randomly flip cells by a pixel.
  const snap = (v: number) =>
    pointSize % 2 === 0 ? Math.round(v) : Math.floor(v) + 0.5

  const padDev = padCss * dpr
  const scatterR = Math.hypot(canvasW, canvasH) * 0.32
  const home = new Float32Array(simSize * simSize * 4)
  const initial = new Float32Array(simSize * simSize * 4)
  initial.fill(-9999)
  for (let i = 0; i < count; i++) {
    const j = i * step * 3
    const hx = snap(padDev + (lit[j] + 0.5) * pitch)
    const hy = snap(padDev + (lit[j + 1] + 0.5) * pitch)
    home[i * 4] = hx
    home[i * 4 + 1] = hy
    home[i * 4 + 2] = lit[j + 2]
    home[i * 4 + 3] = Math.random()
    const angle = Math.random() * Math.PI * 2
    const r = (0.15 + 0.85 * Math.pow(Math.random(), 0.6)) * scatterR
    initial[i * 4] = hx + Math.cos(angle) * r
    initial[i * 4 + 1] = hy + Math.sin(angle) * r
    initial[i * 4 + 2] = (Math.random() - 0.5) * 2
    initial[i * 4 + 3] = (Math.random() - 0.5) * 2
  }

  const flowW = Math.max(1, Math.round(canvasW / FLOW_DOWNSCALE))
  const flowH = Math.max(1, Math.round(canvasH / FLOW_DOWNSCALE))
  const flowInit = new Uint8Array(flowW * flowH * 4)
  for (let i = 0; i < flowW * flowH; i++) {
    flowInit[i * 4] = 128
    flowInit[i * 4 + 1] = 128
  }

  let homeTex: WebGLTexture
  let posTex: WebGLTexture[]
  let flowTex: WebGLTexture[]
  let posFbo: WebGLFramebuffer[]
  let flowFbo: WebGLFramebuffer[]
  let flowProg: WebGLProgram
  let simProg: WebGLProgram
  let pointsProg: WebGLProgram
  try {
    homeTex = createTexture(
      gl, simSize, simSize, gl.RGBA32F, gl.RGBA, gl.FLOAT, gl.NEAREST, home,
    )
    posTex = [initial, null].map(data =>
      createTexture(
        gl, simSize, simSize, gl.RGBA32F, gl.RGBA, gl.FLOAT, gl.NEAREST, data,
      ),
    )
    flowTex = [0, 1].map(() =>
      createTexture(
        gl, flowW, flowH, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR,
        flowInit,
      ),
    )
    posFbo = posTex.map(t => createFbo(gl, t))
    flowFbo = flowTex.map(t => createFbo(gl, t))
    flowProg = compileProgram(gl, FULLSCREEN_VS, FLOW_FS)
    simProg = compileProgram(gl, FULLSCREEN_VS, SIM_FS)
    pointsProg = compileProgram(gl, POINTS_VS, POINTS_FS)
  } catch {
    return null
  }

  const u = (prog: WebGLProgram, name: string) =>
    gl.getUniformLocation(prog, name)

  // Pointer state, in canvas device pixels; y-down to match particle space.
  let mouseX = -1e4
  let mouseY = -1e4
  let strength = 0
  let targetStrength = 0

  let cur = 0 // index of the texture holding current positions
  let flowCur = 0

  const setPointer = (x: number, y: number, s: number) => {
    mouseX = x
    mouseY = y
    targetStrength = s
  }

  const step_ = (dtFrames: number, timeSec: number) => {
    strength += (targetStrength - strength) * Math.min(1, 0.18 * dtFrames)

    // 1. Flow field update
    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, flowFbo[1 - flowCur])
    gl.viewport(0, 0, flowW, flowH)
    gl.useProgram(flowProg)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, flowTex[flowCur])
    gl.uniform1i(u(flowProg, 'uPrev'), 0)
    gl.uniform2f(u(flowProg, 'uRes'), flowW, flowH)
    gl.uniform2f(
      u(flowProg, 'uMouse'),
      mouseX / FLOW_DOWNSCALE,
      mouseY / FLOW_DOWNSCALE,
    )
    gl.uniform1f(u(flowProg, 'uStrength'), strength)
    gl.uniform1f(
      u(flowProg, 'uRadius'),
      (FLOW_RADIUS_CSS * dpr) / FLOW_DOWNSCALE,
    )
    gl.uniform1f(u(flowProg, 'uDt'), dtFrames)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    flowCur = 1 - flowCur

    // 2. Position/velocity integration
    gl.bindFramebuffer(gl.FRAMEBUFFER, posFbo[1 - cur])
    gl.viewport(0, 0, simSize, simSize)
    gl.useProgram(simProg)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, posTex[cur])
    gl.uniform1i(u(simProg, 'uPos'), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, homeTex)
    gl.uniform1i(u(simProg, 'uHome'), 1)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, flowTex[flowCur])
    gl.uniform1i(u(simProg, 'uFlow'), 2)
    gl.uniform2f(u(simProg, 'uCanvasRes'), canvasW, canvasH)
    gl.uniform1f(u(simProg, 'uDt'), dtFrames)
    gl.uniform1f(u(simProg, 'uForce'), FORCE * dpr)
    gl.uniform1f(u(simProg, 'uSpring'), SPRING)
    gl.uniform1f(u(simProg, 'uDamp'), DAMPING)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    cur = 1 - cur

    // 3. Draw particles
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvasW, canvasH)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.useProgram(pointsProg)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, posTex[cur])
    gl.uniform1i(u(pointsProg, 'uPos'), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, homeTex)
    gl.uniform1i(u(pointsProg, 'uHome'), 1)
    gl.uniform2f(u(pointsProg, 'uCanvasRes'), canvasW, canvasH)
    gl.uniform1f(u(pointsProg, 'uTime'), timeSec)
    gl.uniform1f(u(pointsProg, 'uPointSize'), pointSize)
    gl.uniform1f(u(pointsProg, 'uWobble'), WOBBLE * dpr)
    gl.drawArrays(gl.POINTS, 0, count)
  }

  const destroy = () => {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { step: step_, setPointer, destroy }
}

export function ClerkParticles({
  src,
  alt,
  height,
  pad = 56,
}: {
  src: string
  alt: string
  height: number
  pad?: number
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [live, setLive] = React.useState(false)

  React.useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let system: ParticleSystem | null = null
    let raf = 0
    let lastT = 0
    let startT = 0
    let running = false
    let destroyed = false
    let visible = false

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const frame = (t: number) => {
      if (!running || destroyed) return
      if (!startT) startT = lastT = t
      const dtFrames = Math.min(Math.max((t - lastT) / 16.667, 0.25), 2.5)
      lastT = t
      system?.step(dtFrames, (t - startT) / 1000)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || destroyed || !system) return
      running = true
      lastT = 0
      raf = requestAnimationFrame(t => {
        lastT = t
        frame(t)
      })
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    let lastPtrT = 0
    let lastPtrX = 0
    let lastPtrY = 0
    const onPointerMove = (e: PointerEvent) => {
      if (!system) return
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height
      const inside =
        e.clientX > rect.left - 40 &&
        e.clientX < rect.right + 40 &&
        e.clientY > rect.top - 40 &&
        e.clientY < rect.bottom + 40
      const dt = Math.max(e.timeStamp - lastPtrT, 1)
      const speed =
        Math.hypot(e.clientX - lastPtrX, e.clientY - lastPtrY) / dt
      lastPtrT = e.timeStamp
      lastPtrX = e.clientX
      lastPtrY = e.clientY
      system.setPointer(
        x,
        y,
        inside ? Math.min(0.45 + speed * 0.5, 1) : 0,
      )
    }

    let initStarted = false
    const init = () => {
      if (initStarted) return
      initStarted = true
      const image = new Image()
      image.src = src
      const boot = () => {
        if (destroyed || !image.naturalWidth) return
        const cssW = (height * image.naturalWidth) / image.naturalHeight
        system = createParticleSystem(canvas, image, cssW, height, pad, dpr)
        if (!system) return
        canvas.style.width = `${cssW + pad * 2}px`
        canvas.style.height = `${height + pad * 2}px`
        setLive(true)
        window.addEventListener('pointermove', onPointerMove, {
          passive: true,
        })
        if (visible) start()
      }
      if (image.complete) boot()
      else image.onload = boot
    }

    const io = new IntersectionObserver(
      entries => {
        visible = entries.some(e => e.isIntersecting)
        if (visible && !system) init()
        else if (visible) start()
        else stop()
      },
      { rootMargin: '80px' },
    )
    io.observe(wrap)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (system) start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      destroyed = true
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      system?.destroy()
    }
  }, [src, height, pad])

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          height,
          width: 'auto',
          opacity: live ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'absolute',
          top: -pad,
          left: -pad,
          pointerEvents: 'none',
          opacity: live ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
