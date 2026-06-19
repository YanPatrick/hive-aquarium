import { useEffect, useRef } from 'react'
import { initEngine, type FishEngine } from '../../engine/fishEngine'
import { useAppStore } from '../../store/appStore'

export default function Aquarium() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<FishEngine | null>(null)
  const myFish = useAppStore(s => s.myFish)

  useEffect(() => {
    if (!canvasRef.current) return
    canvasRef.current.width  = window.innerWidth
    canvasRef.current.height = window.innerHeight
    engineRef.current = initEngine(canvasRef.current)

    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return
      canvasRef.current.width  = window.innerWidth
      canvasRef.current.height = window.innerHeight
      engineRef.current.destroy()
      engineRef.current = initEngine(canvasRef.current)
      myFish.forEach(f => engineRef.current!.spawnFish(f.id))
    }
    window.addEventListener('resize', handleResize)

    return () => {
      engineRef.current?.destroy()
      window.removeEventListener('resize', handleResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.clearFish()
    myFish.forEach(f => engineRef.current!.spawnFish(f.id))
  }, [myFish])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
