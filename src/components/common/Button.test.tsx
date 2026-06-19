import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeTruthy()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>OK</Button>)
    fireEvent.click(screen.getByText('OK'))
    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
