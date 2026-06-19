import type { SpecialState } from './behaviors'

export type DrawFn = (ctx: CanvasRenderingContext2D, special: SpecialState) => void

function drawClownfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.beginPath()
  ctx.ellipse(32, 22, 20, 13, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(14, 22, 6, 9, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.globalAlpha = 0.85
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.ellipse(22, 22, 3, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(36, 22, 3, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.moveTo(52, 22); ctx.lineTo(65, 10); ctx.lineTo(65, 34); ctx.closePath()
  ctx.fillStyle = '#ff6a00'
  ctx.fill()
  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath(); ctx.arc(14, 18, 3, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill()
  ctx.beginPath(); ctx.arc(14, 18, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(13.3, 17.3, 0.5, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill()

  ctx.strokeStyle = '#e05000'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(25,12); ctx.quadraticCurveTo(30,5,38,10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(25,32); ctx.quadraticCurveTo(30,40,38,35); ctx.stroke()

  ctx.restore()
}

function drawTang(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.beginPath(); ctx.ellipse(32,25,20,14,0,0,Math.PI*2); ctx.fillStyle='#1a6ee0'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(14,25,7,11,0,0,Math.PI*2); ctx.fillStyle='#1a6ee0'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(52,25); ctx.lineTo(66,12); ctx.lineTo(66,38); ctx.closePath()
  ctx.fillStyle='#ffcc00'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(10,20); ctx.quadraticCurveTo(5,12,2,25); ctx.quadraticCurveTo(5,38,10,30); ctx.closePath()
  ctx.fillStyle='#1a6ee0'; ctx.fill()

  ctx.strokeStyle='#0040a0'; ctx.lineWidth=2.5
  ctx.beginPath(); ctx.moveTo(20,11); ctx.quadraticCurveTo(32,25,20,39); ctx.stroke()

  ctx.strokeStyle='#ffcc00'; ctx.lineWidth=3
  ctx.beginPath(); ctx.moveTo(46,15); ctx.quadraticCurveTo(55,25,46,35); ctx.stroke()

  ctx.beginPath(); ctx.arc(14,21,3,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(14,21,1.5,0,Math.PI*2); ctx.fillStyle='#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(13.3,20.3,0.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.restore()
}

function drawAngelfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.beginPath(); ctx.ellipse(27,35,14,20,0,0,Math.PI*2); ctx.fillStyle='#c8a0f0'; ctx.fill()

  ctx.beginPath(); ctx.moveTo(20,15); ctx.quadraticCurveTo(27,0,34,15); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill(); ctx.strokeStyle='#8050c0'; ctx.lineWidth=1; ctx.stroke()

  ctx.beginPath(); ctx.moveTo(20,55); ctx.quadraticCurveTo(27,70,34,55); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill(); ctx.strokeStyle='#8050c0'; ctx.lineWidth=1; ctx.stroke()

  ctx.globalAlpha=0.7; ctx.strokeStyle='#8050c0'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(22,16); ctx.quadraticCurveTo(20,35,22,54); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(32,16); ctx.quadraticCurveTo(34,35,32,54); ctx.stroke()
  ctx.globalAlpha=1

  ctx.beginPath(); ctx.moveTo(41,35); ctx.lineTo(55,22); ctx.lineTo(55,48); ctx.closePath()
  ctx.fillStyle='#a070e0'; ctx.fill()

  ctx.beginPath(); ctx.arc(18,28,3.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(18,28,2,0,Math.PI*2); ctx.fillStyle='#220044'; ctx.fill()
  ctx.beginPath(); ctx.arc(17,27,0.7,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.restore()
}

function drawPufferfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.scale(special.scaleMultiplier, special.scaleMultiplier)
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createRadialGradient(29,24,0,29,24,36)
  grad.addColorStop(0,'#ffe066'); grad.addColorStop(0.6,'#f0b800'); grad.addColorStop(1,'#c08000')

  ctx.beginPath(); ctx.ellipse(30,30,24,22,0,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()

  ctx.globalAlpha=0.5
  ctx.beginPath(); ctx.ellipse(30,36,16,12,0,0,Math.PI*2); ctx.fillStyle='#fffbe0'; ctx.fill()
  ctx.globalAlpha=1

  const spots:number[][] = [[20,22,3,0.45],[34,18,2.5,0.4],[44,26,2,0.4],[22,36,2.5,0.35],[38,38,2,0.35],[28,28,1.5,0.3]]
  spots.forEach(([cx,cy,r,a]) => {
    ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#8a6000'; ctx.fill()
  })
  ctx.globalAlpha=1

  ctx.strokeStyle='#c09000'; ctx.lineWidth=1.5; ctx.lineCap='round'
  const spines:number[][] = [[12,22,6,16],[14,16,10,9],[22,10,20,3],[32,8,32,1],[42,10,44,3],[50,16,55,10],[14,40,9,46],[24,50,22,57],[36,51,36,58],[46,46,50,52]]
  spines.forEach(([x1,y1,x2,y2]) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke() })

  ctx.beginPath(); ctx.moveTo(54,30); ctx.quadraticCurveTo(64,22,62,30); ctx.quadraticCurveTo(64,38,54,30); ctx.closePath()
  ctx.fillStyle='#f0b800'; ctx.fill(); ctx.strokeStyle='#c08000'; ctx.lineWidth=1; ctx.stroke()

  ctx.beginPath(); ctx.ellipse(8,32,3,2.5,0,0,Math.PI*2); ctx.fillStyle='#d09000'; ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,32,1.5,1.2,0,0,Math.PI*2); ctx.fillStyle='#804000'; ctx.fill()

  ctx.beginPath(); ctx.arc(12,24,5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(12,24,3,0,Math.PI*2); ctx.fillStyle='#1a1a00'; ctx.fill()
  ctx.beginPath(); ctx.arc(11,23,1.2,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.globalAlpha=0.8
  ctx.beginPath(); ctx.moveTo(28,20); ctx.quadraticCurveTo(20,14,18,20); ctx.quadraticCurveTo(20,26,28,24); ctx.closePath()
  ctx.fillStyle='#f0c020'; ctx.fill()
  ctx.globalAlpha=1

  ctx.restore()
}

function drawJellyfish(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createRadialGradient(27.5,18,0,27.5,18,28)
  grad.addColorStop(0,'rgba(224,160,255,0.95)')
  grad.addColorStop(0.7,'rgba(128,32,192,0.8)')
  grad.addColorStop(1,'rgba(74,0,160,0.7)')

  ctx.beginPath(); ctx.moveTo(5,30); ctx.quadraticCurveTo(5,5,27,5); ctx.quadraticCurveTo(49,5,49,30); ctx.closePath()
  ctx.fillStyle=grad; ctx.fill()
  ctx.strokeStyle='rgba(220,160,255,0.6)'; ctx.lineWidth=1.5; ctx.stroke()

  ctx.beginPath(); ctx.moveTo(13,28); ctx.quadraticCurveTo(13,10,27,8); ctx.quadraticCurveTo(38,10,41,28); ctx.closePath()
  ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.fill()

  const tentacles:[string,string,number,number][] = [
    ['M12,30 Q9,42 12,52 Q9,60 10,65','#d080ff',1.5,0.75],
    ['M18,30 Q15,43 18,54 Q15,62 16,68','#d080ff',1.5,0.75],
    ['M27,31 Q25,44 27,56 Q25,64 27,70','#cc70ff',2,0.8],
    ['M36,30 Q39,43 36,54 Q39,62 38,68','#d080ff',1.5,0.75],
    ['M42,30 Q45,42 42,52 Q45,60 44,65','#d080ff',1.5,0.75],
  ]
  tentacles.forEach(([d,color,lw,alpha]) => {
    ctx.save()
    ctx.globalAlpha = alpha * special.tentacleAlpha
    if (special.tentacleScaleY !== 1) ctx.scale(1, special.tentacleScaleY)
    ctx.strokeStyle=color; ctx.lineWidth=lw
    const coords = d.replace(/[MmQq]/g,'').split(/[\s,]+/).map(Number)
    ctx.beginPath(); ctx.moveTo(coords[0],coords[1])
    ctx.quadraticCurveTo(coords[2],coords[3],coords[4],coords[5])
    ctx.quadraticCurveTo(coords[6],coords[7],coords[8],coords[9])
    ctx.stroke()
    ctx.restore()
  })

  ;[[18,16,2.5,0.8],[27,12,2,0.7],[36,16,2,0.7],[22,22,1.5,0.6],[32,20,1.5,0.6]].forEach(([x,y,r,a]) => {
    ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='rgba(255,220,255,0.9)'; ctx.fill()
  })
  ctx.globalAlpha=1

  ctx.restore()
}

function drawSeahorse(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  ctx.fillStyle='#f0a030'
  ctx.beginPath()
  ctx.moveTo(20,12); ctx.quadraticCurveTo(30,12,30,22); ctx.quadraticCurveTo(30,32,22,35)
  ctx.quadraticCurveTo(28,40,28,50); ctx.quadraticCurveTo(28,62,20,65)
  ctx.quadraticCurveTo(12,62,12,50); ctx.quadraticCurveTo(12,40,18,35)
  ctx.quadraticCurveTo(10,32,10,22); ctx.quadraticCurveTo(10,12,20,12)
  ctx.fill()

  ctx.beginPath(); ctx.arc(20,10,8,0,Math.PI*2); ctx.fill()

  ctx.strokeStyle='#d08020'; ctx.lineWidth=3; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(20,8); ctx.quadraticCurveTo(35,10,36,14); ctx.stroke()

  ctx.globalAlpha=0.7; ctx.fillStyle='#e09025'
  ctx.beginPath(); ctx.moveTo(30,28); ctx.quadraticCurveTo(40,25,38,32); ctx.quadraticCurveTo(36,38,28,33); ctx.closePath(); ctx.fill()
  ctx.globalAlpha=1

  ctx.strokeStyle='#d08020'; ctx.lineWidth=1; ctx.globalAlpha=0.5
  ;[[12,22,28,22],[12,28,28,28],[14,42,26,42],[14,50,26,50]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })
  ctx.globalAlpha=1

  ctx.beginPath(); ctx.arc(24,9,2.5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()
  ctx.beginPath(); ctx.arc(24,9,1.3,0,Math.PI*2); ctx.fillStyle='#111'; ctx.fill()
  ctx.beginPath(); ctx.arc(23.4,8.4,0.4,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.strokeStyle='#d08020'; ctx.lineWidth=1.5
  ;[[15,4,16,0],[20,3,20,0],[24,4,25,0]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })

  ctx.restore()
}

function drawDragon(ctx: CanvasRenderingContext2D, special: SpecialState) {
  ctx.save()
  ctx.rotate(special.rotation * Math.PI / 180)

  const grad = ctx.createLinearGradient(0,0,90,0)
  grad.addColorStop(0,'#ff4400'); grad.addColorStop(0.5,'#ff8800'); grad.addColorStop(1,'#ffcc00')

  ctx.beginPath(); ctx.ellipse(40,27,28,16,0,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()
  ctx.beginPath(); ctx.ellipse(16,27,9,13,0,0,Math.PI*2); ctx.fillStyle='#ff5500'; ctx.fill()

  const scaleSegs:number[][] = [[20,15,28,18,20,22],[30,13,38,16,30,20],[40,12,48,15,40,19],[50,14,58,17,50,21]]
  scaleSegs.forEach(([mx,my,cx,cy,ex,ey]) => {
    ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(cx,cy,ex,ey); ctx.closePath()
    ctx.fillStyle='rgba(255,100,0,0.3)'; ctx.fill()
    ctx.strokeStyle='rgba(200,60,0,0.5)'; ctx.lineWidth=0.5; ctx.stroke()
  })

  ctx.beginPath()
  ctx.moveTo(20,11); ctx.lineTo(23,3); ctx.lineTo(27,11); ctx.lineTo(31,2); ctx.lineTo(35,11)
  ctx.lineTo(39,4); ctx.lineTo(43,11); ctx.lineTo(47,3); ctx.lineTo(51,11); ctx.lineTo(55,6); ctx.lineTo(59,14)
  ctx.fillStyle='#cc3300'; ctx.fill(); ctx.strokeStyle='#aa2200'; ctx.lineWidth=1; ctx.stroke()

  ctx.globalAlpha=0.7
  ctx.beginPath(); ctx.moveTo(20,43); ctx.quadraticCurveTo(35,52,55,43); ctx.closePath()
  ctx.fillStyle='#cc3300'; ctx.fill()
  ctx.globalAlpha=1

  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(85,12); ctx.lineTo(80,27); ctx.lineTo(85,42); ctx.closePath()
  ctx.fillStyle='#ff6600'; ctx.fill()
  ctx.strokeStyle='#cc4400'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(82,15); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(68,27); ctx.lineTo(82,39); ctx.stroke()

  ctx.strokeStyle='#ffaa00'; ctx.lineWidth=2; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(12,14); ctx.lineTo(9,6); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14,12); ctx.lineTo(14,5); ctx.stroke()

  ctx.beginPath(); ctx.arc(12,22,4,0,Math.PI*2); ctx.fillStyle='#ffee00'; ctx.fill()
  ctx.beginPath(); ctx.arc(12,22,2,0,Math.PI*2); ctx.fillStyle='#660000'; ctx.fill()
  ctx.beginPath(); ctx.arc(11,21,0.7,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill()

  ctx.globalAlpha=0.2
  ctx.beginPath(); ctx.ellipse(40,27,30,18,0,0,Math.PI*2)
  ctx.strokeStyle='rgba(255,180,0,1)'; ctx.lineWidth=4; ctx.stroke()
  ctx.globalAlpha=1

  ctx.restore()
}

export const FISH_DRAW_FNS: Record<string, DrawFn> = {
  clownfish:  drawClownfish,
  tang:       drawTang,
  angelfish:  drawAngelfish,
  pufferfish: drawPufferfish,
  jellyfish:  drawJellyfish,
  seahorse:   drawSeahorse,
  dragon:     drawDragon,
}
