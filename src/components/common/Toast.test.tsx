import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import Toast, { useToastStore } from './Toast'

describe('Toast', () => {
  it('is hidden by default', () => {
    render(<Toast />)
    const el = document.getElementById('toast-container')
    expect(el).toBeTruthy()
    expect(el!.style.transform).toContain('120%')
  })

  it('shows when showToast is called', () => {
    render(<Toast />)
    act(() => { useToastStore.getState().show('Título', 'Corpo', false) })
    const el = document.getElementById('toast-container')!
    expect(el.style.transform).not.toContain('120%')
  })
})
