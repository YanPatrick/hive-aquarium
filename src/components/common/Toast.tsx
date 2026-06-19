import { useEffect, useRef } from 'react'
import { create } from 'zustand'

interface ToastState {
  title: string
  body: string
  isError: boolean
  visible: boolean
  show(title: string, body: string, isError?: boolean): void
  hide(): void
}

export const useToastStore = create<ToastState>((set) => ({
  title: '',
  body: '',
  isError: false,
  visible: false,
  show: (title, body, isError = false) => set({ title, body, isError, visible: true }),
  hide: () => set({ visible: false }),
}))

export function useShowToast() {
  return useToastStore(s => s.show)
}

export default function Toast() {
  const { title, body, isError, visible, hide } = useToastStore()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(hide, 4000)
    }
    return () => clearTimeout(timerRef.current)
  }, [visible, title, hide])

  const borderColor = isError ? '#ff6b6b' : 'var(--glow)'
  const shadowColor = isError ? 'rgba(255,80,80,0.3)' : 'rgba(0,212,255,0.3)'

  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        bottom: 110,
        right: 24,
        zIndex: 500,
        background: 'rgba(0,30,60,0.97)',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '14px 20px',
        maxWidth: 320,
        boxShadow: `0 0 30px ${shadowColor}`,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        fontSize: '0.88rem',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, color: isError ? '#ff8080' : 'var(--glow)', marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ color: 'var(--text)' }}>{body}</div>
    </div>
  )
}
