import type { Rarity } from '../data/fishCatalog'

export type BehaviorName = 'cruise' | 'wander' | 'zigzag' | 'patrol' | 'spiral' | 'dash'

export interface Bounds {
  w: number; h: number
  floor: number; ceil: number; left: number; right: number
}

export interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  life: number; maxLife: number
  color: string
  grow: number
  buoyancy: number
  baseOpacity: number
}

export interface SpecialState {
  rotation: number
  scaleMultiplier: number
  glowExtra: number
  tentacleAlpha: number
  tentacleScaleY: number
}

export interface FishInstance {
  fishId: string
  rarity: Rarity
  x: number; y: number
  vx: number; vy: number
  facing: number
  behavior: BehaviorName
  behaviorTick: number
  baseScale: number
  bobPhase: number
  dashCooldown: number
  isDashing: boolean
  spiralAngle: number
  spiralCenterX: number
  spiralCenterY: number
  specialTimer: number
  specialActive: boolean
  specialPhase: number
  special: SpecialState
  particles: Particle[]
}

const BEHAVIORS: Record<Rarity, BehaviorName[]> = {
  common:    ['cruise', 'wander', 'zigzag'],
  rare:      ['cruise', 'wander', 'zigzag', 'patrol'],
  epic:      ['cruise', 'wander', 'zigzag', 'patrol', 'spiral'],
  legendary: ['cruise', 'wander', 'zigzag', 'patrol', 'spiral', 'dash'],
}

export function pickBehavior(rarity: Rarity): BehaviorName {
  const list = BEHAVIORS[rarity]
  return list[Math.floor(Math.random() * list.length)]
}

const BASE_SPEEDS: Record<Rarity, number> = { common: 0.5, rare: 0.65, epic: 0.8, legendary: 0.9 }
const MAX_SPEEDS:  Record<Rarity, number> = { common: 1.4, rare: 1.8, epic: 2.4, legendary: 4.5 }
const CHANGE_EVERY: Record<Rarity, number> = { common: 400, rare: 320, epic: 260, legendary: 200 }
const SPECIAL_INTERVAL = 1800

function defaultSpecial(): SpecialState {
  return { rotation: 0, scaleMultiplier: 1, glowExtra: 0, tentacleAlpha: 0.75, tentacleScaleY: 1 }
}

export function createInstance(fishId: string, rarity: Rarity, x: number, y: number): FishInstance {
  const baseScale =
    fishId === 'dragon'         ? 1.6 + Math.random() * 0.4
    : rarity === 'legendary'   ? 1.1 + Math.random() * 0.3
    : rarity === 'epic'        ? 0.9 + Math.random() * 0.3
    : 0.7 + Math.random() * 0.4

  const spd = BASE_SPEEDS[rarity] * (0.8 + Math.random() * 0.5)
  const angle = (Math.random() - 0.5) * 0.6
  const dirX = Math.random() > 0.5 ? 1 : -1
  const vx = Math.cos(angle) * spd * dirX
  const vy = Math.sin(angle) * spd * 0.4

  return {
    fishId, rarity,
    x, y, vx, vy,
    facing: vx >= 0 ? 1 : -1,
    behavior: pickBehavior(rarity),
    behaviorTick: 0,
    baseScale,
    bobPhase: Math.random() * Math.PI * 2,
    dashCooldown: 0,
    isDashing: false,
    spiralAngle: Math.random() * Math.PI * 2,
    spiralCenterX: x,
    spiralCenterY: y,
    specialTimer: Math.random() * SPECIAL_INTERVAL,
    specialActive: false,
    specialPhase: 0,
    special: defaultSpecial(),
    particles: [],
  }
}

export function updateInstance(f: FishInstance, dt: number, bounds: Bounds): void {
  f.behaviorTick += dt
  f.bobPhase += 0.03 * dt
  f.dashCooldown = Math.max(0, f.dashCooldown - dt)

  switch (f.behavior) {
    case 'cruise':
      f.vy += Math.sin(f.bobPhase * 0.5) * 0.006 * dt
      f.vy *= 0.96
      break

    case 'wander': {
      const turn = (Math.random() - 0.5) * 0.05 * dt
      const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy) || 0.4
      const ang = Math.atan2(f.vy, f.vx) + turn
      f.vx = Math.cos(ang) * spd
      f.vy = Math.sin(ang) * spd * 0.5
      break
    }

    case 'zigzag':
      if (f.behaviorTick > 50 + Math.random() * 70) {
        f.vy = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8)
        f.behaviorTick = 0
      }
      break

    case 'patrol':
      f.vy *= 0.88
      if (Math.abs(f.vx) < 0.3) f.vx = 0.3 * f.facing
      break

    case 'spiral': {
      if (f.behaviorTick < 2) {
        f.spiralCenterX = f.x
        f.spiralCenterY = f.y
      }
      f.spiralAngle += 0.018 * dt
      const radius = 70 + f.baseScale * 20
      const targetX = f.spiralCenterX + Math.cos(f.spiralAngle) * radius
      const targetY = f.spiralCenterY + Math.sin(f.spiralAngle) * radius * 0.5
      f.vx += (targetX - f.x) * 0.012 * dt
      f.vy += (targetY - f.y) * 0.012 * dt
      f.vx *= 0.92
      f.vy *= 0.92
      break
    }

    case 'dash':
      if (!f.isDashing && f.dashCooldown === 0 && f.behaviorTick > 80) {
        f.vx = f.facing * (3.5 + Math.random() * 2.5)
        f.vy = (Math.random() - 0.5) * 0.8
        f.isDashing = true
        f.dashCooldown = 120 + Math.random() * 80
        f.behaviorTick = 0
      }
      if (f.isDashing) {
        f.vx *= 0.962
        f.vy *= 0.95
        if (Math.abs(f.vx) < 0.5) f.isDashing = false
      }
      break
  }

  // Auto-change behavior
  if (f.behaviorTick > (CHANGE_EVERY[f.rarity] || 350) + Math.random() * 150) {
    f.behavior = pickBehavior(f.rarity)
    f.behaviorTick = 0
  }

  // Speed cap
  const maxSpd = MAX_SPEEDS[f.rarity]
  const curSpd = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (curSpd > maxSpd) { f.vx = (f.vx / curSpd) * maxSpd; f.vy = (f.vy / curSpd) * maxSpd }

  // Min horizontal speed
  if (Math.abs(f.vx) < 0.2) f.vx = 0.2 * (f.vx >= 0 ? 1 : -1)

  // Move
  f.x += f.vx * dt
  f.y += f.vy * dt

  // Bounce
  if (f.x < bounds.left)  { f.x = bounds.left;  f.vx =  Math.abs(f.vx) * 0.85 }
  if (f.x > bounds.right) { f.x = bounds.right; f.vx = -Math.abs(f.vx) * 0.85 }
  if (f.y < bounds.ceil)  { f.y = bounds.ceil;  f.vy =  Math.abs(f.vy) * 0.7 }
  if (f.y > bounds.floor) { f.y = bounds.floor; f.vy = -Math.abs(f.vy) * 0.7 }

  // Facing (seahorse has reversed logic — snout points right in SVG)
  if (f.fishId === 'seahorse') {
    if (f.vx > 0.08)  f.facing = -1
    if (f.vx < -0.08) f.facing =  1
  } else {
    if (f.vx > 0.08)  f.facing =  1
    if (f.vx < -0.08) f.facing = -1
  }

  tickSpecial(f, dt)

  f.particles = f.particles.filter(p => {
    p.life -= dt
    if (p.life <= 0) return false
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy -= p.buoyancy * dt
    p.vx *= 0.98
    return true
  })
}

function spawnParticle(f: FishInstance, opts: Omit<Particle, 'x' | 'y' | 'maxLife'>, offX = 0, offY = 0) {
  f.particles.push({ ...opts, x: f.x + offX, y: f.y + offY, maxLife: opts.life })
}

function tickSpecial(f: FishInstance, dt: number) {
  f.specialTimer += dt
  if (f.specialActive) {
    f.specialPhase += dt
    runSpecialFrame(f, dt)
  } else if (f.specialTimer > SPECIAL_INTERVAL) {
    f.specialTimer = 0
    f.specialActive = true
    f.specialPhase = 0
    f.special = defaultSpecial()
  }
}

function runSpecialFrame(f: FishInstance, _dt: number) {
  const p = f.specialPhase

  switch (f.fishId) {
    case 'pufferfish': {
      if (p < 90) {
        const t = p / 90
        f.special.scaleMultiplier = 1 + t * 0.75
        f.special.glowExtra = t * 24
      } else if (p < 210) {
        f.special.scaleMultiplier = 1.75
        if (Math.floor(p) === 100) {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2
            spawnParticle(f, { vx: Math.cos(a)*1.5, vy: Math.sin(a)*1.5, color:'rgba(255,220,50,0.9)', size:5, life:40, grow:0.5, buoyancy:0, baseOpacity:0.85 })
          }
        }
      } else if (p < 300) {
        const t = (p - 210) / 90
        f.special.scaleMultiplier = 1.75 - t * 0.75
        f.special.glowExtra = (1 - t) * 24
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'dragon': {
      if (p < 60) {
        const t = p / 60
        f.special.glowExtra = t * 38
        f.special.rotation = Math.sin(p * 0.8) * t * 3
      } else if (p < 160) {
        const t2 = p - 60
        f.special.rotation = 0
        f.special.glowExtra = 38 * (1 - t2 / 100)
        if (Math.floor(p) % 8 === 0) {
          const fireDir = f.facing === 1 ? 1 : -1
          const colors = ['rgba(255,60,0,0.95)', 'rgba(255,160,0,0.9)', 'rgba(255,230,60,0.85)']
          for (let i = 0; i < 3; i++) {
            spawnParticle(f, { vx: fireDir*(2+Math.random()*2.5), vy:(Math.random()-0.5)*0.8, color:colors[i], size:7+Math.random()*11, life:55+Math.random()*35, grow:1.3, buoyancy:0.03+Math.random()*0.035, baseOpacity:0.92 }, fireDir * 30, 0)
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'jellyfish': {
      if (p < 80) {
        const t = p / 80
        f.special.tentacleAlpha = 0.75 * (1 - t)
        f.special.tentacleScaleY = 1 - t * 0.7
        f.special.glowExtra = t * 24
        f.special.scaleMultiplier = 1 - t * 0.1
      } else if (p < 120) {
        f.special.glowExtra = 50
      } else if (p < 180) {
        const t = (p - 120) / 60
        f.special.tentacleAlpha = t * 0.75
        f.special.tentacleScaleY = t * 1.1
        f.special.glowExtra = 24 * (1 - t)
        f.special.scaleMultiplier = 1 + Math.sin(t * Math.PI) * 0.25
        if (Math.floor(p) === 122) {
          const txs = [12, 18, 27, 36, 42]
          txs.forEach(tx => {
            for (let i = 0; i < 2; i++) {
              spawnParticle(f, { vx:(Math.random()-0.5)*1.2, vy:-0.5-Math.random()*0.8, color:`rgba(${210+Math.floor(Math.random()*45)},${80+Math.floor(Math.random()*80)},255,0.88)`, size:5+Math.random()*7, life:90+Math.random()*60, grow:0.25, buoyancy:0.07, baseOpacity:0.88 }, tx - 27, 35)
            }
          })
        }
      } else if (p < 250) {
        const t = (p - 180) / 70
        f.special.glowExtra = 8 * (1 - t)
        f.special.scaleMultiplier = 1
        f.special.tentacleAlpha = 0.75
        f.special.tentacleScaleY = 1
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'seahorse': {
      if (p < 180) {
        f.special.rotation = (p / 180) * 720
        f.special.glowExtra = Math.sin((p / 180) * Math.PI) * 20
        if (Math.floor(p) % 8 === 0) {
          const a = f.special.rotation * Math.PI / 180
          for (let i = 0; i < 3; i++) {
            const angle = a + (i / 3) * Math.PI * 2
            spawnParticle(f, { vx:Math.cos(angle)*(1+Math.random()*0.8), vy:Math.sin(angle)*(0.5+Math.random()*0.4), color:`rgba(255,${160+Math.floor(Math.random()*95)},${30+Math.floor(Math.random()*80)},0.92)`, size:4+Math.random()*5, life:55, grow:0.15, buoyancy:0.03, baseOpacity:0.92 })
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'angelfish': {
      if (p < 100) {
        const t = p / 100
        f.special.rotation = Math.sin(t * Math.PI * 2) * 12
        f.special.glowExtra = Math.abs(Math.sin(t * Math.PI * 4)) * 18
        if (Math.floor(p) % 12 === 0) {
          for (let i = 0; i < 3; i++) {
            spawnParticle(f, { vx:(Math.random()-0.5)*1.2, vy:-0.5-Math.random()*0.5, color:'rgba(230,200,255,0.9)', size:3+Math.random()*4, life:45, grow:0.1, buoyancy:0.04, baseOpacity:0.9 })
          }
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'clownfish': {
      if (p < 80) {
        f.special.rotation = Math.sin(p * 0.6) * 8
        if (Math.floor(p) % 10 === 0) {
          spawnParticle(f, { vx:(Math.random()-0.5)*0.6, vy:-0.6-Math.random()*0.4, color:'rgba(200,240,255,0.8)', size:4+Math.random()*4, life:60, grow:0.4, buoyancy:0.08, baseOpacity:0.75 })
        }
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    case 'tang': {
      if (p < 20) {
        f.special.glowExtra = 30
      } else if (p < 100) {
        const burstDir = f.facing === 1 ? 1 : -1
        if (Math.floor(p) === 20) { f.vx = burstDir * 5.5; f.vy *= 0.2 }
        const glowT = 1 - (p - 20) / 80
        f.special.glowExtra = glowT * 18
        f.vx *= 0.96
        spawnParticle(f, { vx:-burstDir*(0.5+Math.random()*0.5), vy:(Math.random()-0.5)*0.4, color:Math.floor(p)%3===0?'rgba(255,220,0,0.8)':'rgba(60,180,255,0.75)', size:8+Math.random()*12, life:20+Math.random()*15, grow:0, buoyancy:0, baseOpacity:0.75 }, -burstDir*15, (Math.random()-0.5)*8)
      } else {
        f.special = defaultSpecial()
        f.specialActive = false
      }
      break
    }

    default:
      f.specialActive = false
  }
}
