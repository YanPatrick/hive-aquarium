import { FISH_CATALOG, FISH_DIMS } from '../data/fishCatalog'
import { FISH_DRAW_FNS } from './fishPaths'
import { createInstance, updateInstance, type FishInstance } from './behaviors'
import type { Rarity } from '../data/fishCatalog'

export interface FishEngine {
  spawnFish(fishId: string, opts?: { owner?: string }): void
  clearFish(): void
  destroy(): void
}

const RARITY_GLOW: Record<Rarity, number> = { common: 0, rare: 8, epic: 16, legendary: 28 }

function shadeHex(hex: string, pct: number): string {
  if (!hex.startsWith('#')) return hex
  let r = parseInt(hex.slice(1,3),16)
  let g = parseInt(hex.slice(3,5),16)
  let b = parseInt(hex.slice(5,7),16)
  r = Math.max(0, Math.min(255, r + Math.round(pct * 2.55)))
  g = Math.max(0, Math.min(255, g + Math.round(pct * 2.55)))
  b = Math.max(0, Math.min(255, b + Math.round(pct * 2.55)))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function buildOffscreenDecorations(w: number, h: number): HTMLCanvasElement {
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h

  const ctx = offscreen.getContext('2d')
  if (!ctx) return offscreen

  const isMobile = w < 500
  const isTablet = w >= 500 && w < 900
  const sc = Math.min(1, w / 1400)
  const floorH = Math.round(h * 0.10)

  // Sand base
  const sandGrad = ctx.createLinearGradient(0, h - floorH * 1.1, 0, h)
  sandGrad.addColorStop(0, 'transparent')
  sandGrad.addColorStop(0.25, 'rgba(40,30,15,0.5)')
  sandGrad.addColorStop(1, 'rgba(20,15,8,0.95)')
  ctx.fillStyle = sandGrad
  ctx.fillRect(0, h - floorH * 1.1, w, floorH * 1.1)

  const pebbleColors = ['#4a7a9b','#5b8fa8','#3d6b82','#6a9db5','#c8a96e','#b09060','#8a7050','#5d9eb8','#d4b878','#a08048']
  const pebbleCount = isMobile ? 80 : isTablet ? 150 : 250
  for (let i = 0; i < pebbleCount; i++) {
    const sz = (3 + Math.random() * 9) * Math.max(0.5, sc)
    const left = Math.random() * w
    const bottom = 1 + Math.random() * floorH * 0.35
    const col = pebbleColors[Math.floor(Math.random() * pebbleColors.length)]
    ctx.globalAlpha = 0.5 + Math.random() * 0.6
    ctx.beginPath()
    ctx.ellipse(left, h - bottom, sz, sz * 0.62, 0, 0, Math.PI * 2)
    ctx.fillStyle = col
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const plantDefs = [
    { x: 0.02, color: '#cc2222', hFrac: 0.16 }, { x: 0.07, color: '#dd3322', hFrac: 0.12 },
    { x: 0.13, color: '#1a88ee', hFrac: 0.17 }, { x: 0.19, color: '#22aa44', hFrac: 0.14 },
    { x: 0.26, color: '#2244ee', hFrac: 0.18 }, { x: 0.33, color: '#22cc44', hFrac: 0.13 },
    { x: 0.39, color: '#aa22dd', hFrac: 0.16 }, { x: 0.45, color: '#22cc88', hFrac: 0.12 },
    { x: 0.51, color: '#ee44aa', hFrac: 0.17 }, { x: 0.57, color: '#22aa44', hFrac: 0.14 },
    { x: 0.63, color: '#ee44aa', hFrac: 0.14 }, { x: 0.69, color: '#1a88ee', hFrac: 0.16 },
    { x: 0.75, color: '#aa22dd', hFrac: 0.13 }, { x: 0.80, color: '#cc2222', hFrac: 0.15 },
  ]
  const step = isMobile ? 3 : isTablet ? 2 : 1
  const baseY = h - floorH * 0.95
  plantDefs.filter((_, i) => i % step === 0).forEach(pl => {
    drawPlant(ctx, pl.x * w, baseY, pl.color, Math.min(h * 0.40, pl.hFrac * h))
  })

  if (!isMobile) {
    ;[
      { x: 0.44, color: '#ff5566', h: 0.08 },
      { x: 0.62, color: '#ff3344', h: 0.065 },
      { x: 0.48, color: '#ff7744', h: 0.058 },
    ].forEach(c => drawCoral(ctx, c.x * w, baseY, c.color, Math.min(h * 0.12, c.h * h)))

    const logW = Math.round(130 * sc)
    ;[[0.18, logW, -7, '#3d2810'], [0.52, Math.round(logW*0.75), 4, '#4a3218']].forEach(([xFrac, lw, rot, col]) => {
      ctx.save()
      ctx.translate((xFrac as number) * w + (lw as number) / 2, h - floorH * 0.98)
      ctx.rotate((rot as number) * Math.PI / 180)
      const lh = Math.round(17 * sc)
      if (lh >= 4) {
        const lg = ctx.createLinearGradient(0, -lh, 0, 0)
        lg.addColorStop(0, shadeHex(col as string, 20))
        lg.addColorStop(1, '#1a1008')
        ctx.fillStyle = lg
        ctx.beginPath()
        ctx.roundRect(-(lw as number)/2, -lh, lw as number, lh, lh / 2)
        ctx.fill()
      }
      ctx.restore()
    })
  }

  return offscreen
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string, h: number) {
  const dark = shadeHex(color, -40)
  const light = shadeHex(color, 30)
  const numLeaves = 4 + Math.floor(h / 35)

  ctx.strokeStyle = dark; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, baseY)
  ctx.quadraticCurveTo(x + 3, baseY - h * 0.4, x - 2, baseY - h * 0.7)
  ctx.quadraticCurveTo(x + 1, baseY - h * 0.85, x, baseY - h)
  ctx.stroke()

  for (let i = 0; i < numLeaves; i++) {
    const y = baseY - 15 - i * (h * 0.7 / numLeaves)
    const side = i % 2 === 0 ? 1 : -1
    const lw = 12 + Math.random() * 8
    const lh = 18 + Math.random() * 10
    const cx = x + side * lw * 0.5
    ctx.globalAlpha = 0.85 + Math.random() * 0.15
    ctx.fillStyle = i % 3 === 0 ? light : color
    ctx.beginPath()
    ctx.ellipse(cx, y, lw * 0.5, lh * 0.35, side * 25 * Math.PI / 180, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = light; ctx.globalAlpha = 0.9
  ctx.beginPath(); ctx.ellipse(x, baseY - h, 7, 12, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = color; ctx.globalAlpha = 0.8
  ctx.beginPath(); ctx.ellipse(x - 5, baseY - h + 4, 5, 9, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + 5, baseY - h + 4, 5, 9, 0, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
}

function drawCoral(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string, h: number) {
  const dark = shadeHex(color, -30)
  ctx.lineWidth = 4.5; ctx.lineCap = 'round'
  ctx.strokeStyle = color
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x-11, baseY-h*0.45, x-9, baseY-h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x+11, baseY-h*0.45, x+9, baseY-h); ctx.stroke()
  ctx.lineWidth = 5.5
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, baseY-h*0.72); ctx.stroke()
  ctx.lineWidth = 3; ctx.strokeStyle = dark
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x-14, baseY-h*0.3, x-14, baseY-h*0.4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x+14, baseY-h*0.3, x+14, baseY-h*0.4); ctx.stroke()
  ctx.fillStyle = color
  ;[[-9,-h],[9,-h],[0,-h*0.72-8],[-14,-h*0.4],[14,-h*0.4]].forEach(([ox,oy],i) => {
    ctx.beginPath(); ctx.arc(x+(ox as number), baseY+(oy as number), i===2?6.5:i<3?5.5:4, 0, Math.PI*2); ctx.fill()
  })
}

export function initEngine(canvas: HTMLCanvasElement): FishEngine {
  const ctx = canvas.getContext('2d')!
  let instances: FishInstance[] = []
  let rafId: number | null = null
  let offscreen = buildOffscreenDecorations(canvas.width, canvas.height)
  let last = performance.now()

  const bubbles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * (0.85 + Math.random() * 0.1),
    r: 3 + Math.random() * 12,
    speed: (5 + Math.random() * 10) * 0.01,
    drift: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
    opacity: 0,
  }))

  function loop(now: number) {
    const dt = Math.min((now - last) / 16.67, 3)
    last = now

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(offscreen as CanvasImageSource, 0, 0)

    bubbles.forEach(b => {
      b.y -= b.speed * dt * 60
      b.x += b.drift * dt
      b.phase += 0.02 * dt
      b.x += Math.sin(b.phase) * 0.3
      if (b.y < -b.r * 2) { b.y = H * 0.85 + Math.random() * H * 0.1; b.x = Math.random() * W }
      b.opacity = Math.min(0.7, b.opacity + 0.01 * dt)
      ctx.globalAlpha = b.opacity
      const gr = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, 0, b.x, b.y, b.r)
      gr.addColorStop(0, 'rgba(255,255,255,0.4)')
      gr.addColorStop(1, 'rgba(0,180,255,0.1)')
      ctx.fillStyle = gr
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(150,220,255,0.5)'; ctx.lineWidth = 0.5
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    const bounds = {
      w: W, h: H,
      floor: H * 0.87, ceil: H * 0.09,
      left: W * 0.01, right: W * 0.97,
    }

    instances.forEach(f => {
      if (f.isDashing) {
        ctx.save()
        ctx.globalAlpha = 0.3
        const dims = FISH_DIMS[f.fishId]
        if (dims) {
          ctx.translate(f.x - f.vx * 3, f.y)
          ctx.scale(f.baseScale * f.facing, f.baseScale)
          ctx.translate(-dims.cx, -dims.cy)
          FISH_DRAW_FNS[f.fishId]?.(ctx, f.special)
        }
        ctx.restore()
      }

      const dims = FISH_DIMS[f.fishId]
      if (!dims || !FISH_DRAW_FNS[f.fishId]) return

      const catalog = FISH_CATALOG.find(c => c.id === f.fishId)
      const baseGlow = RARITY_GLOW[f.rarity]
      const totalGlow = baseGlow + f.special.glowExtra

      ctx.save()
      if (totalGlow > 0) {
        ctx.shadowBlur = totalGlow
        ctx.shadowColor = catalog?.glowColor ?? 'rgba(0,212,255,0.6)'
      }

      const bob = Math.sin(f.bobPhase) * ({ common:1.5, rare:2.5, epic:2.5, legendary:3.5 }[f.rarity] ?? 2)
      ctx.translate(f.x, f.y + bob)
      ctx.scale(f.baseScale * f.special.scaleMultiplier * f.facing, f.baseScale * f.special.scaleMultiplier)
      ctx.translate(-dims.cx, -dims.cy)
      FISH_DRAW_FNS[f.fishId](ctx, f.special)
      ctx.restore()

      f.particles.forEach(p => {
        const t = 1 - p.life / p.maxLife
        const opacity = t < 0.1 ? t * 10 : t > 0.8 ? (1 - t) * 5 : 1
        const sz = p.size * (1 + t * p.grow)
        ctx.globalAlpha = opacity * p.baseOpacity
        ctx.beginPath()
        ctx.arc(p.x, p.y, sz / 2, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = sz * 0.8
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      })
      ctx.globalAlpha = 1

      updateInstance(f, dt, bounds)
    })

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)

  return {
    spawnFish(fishId, _opts = {}) {
      const catalog = FISH_CATALOG.find(c => c.id === fishId)
      if (!catalog) return
      const W = canvas.width
      const H = canvas.height
      const x = W * 0.05 + Math.random() * W * 0.85
      const y = H * 0.08 + Math.random() * H * 0.62
      instances.push(createInstance(fishId, catalog.rarity, x, y))
    },

    clearFish() {
      instances = []
    },

    destroy() {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
    },
  }
}
