import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TapToSpeakCard } from './TapToSpeakCard'

describe('TapToSpeakCard', () => {
  it('renders "TAP TO SPEAK" button', () => {
    render(<TapToSpeakCard onTap={vi.fn()} />)
    expect(screen.getByRole('button', { name: /tap to speak/i })).toBeTruthy()
  })

  it('button has correct aria-label', () => {
    render(<TapToSpeakCard onTap={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe('Tap to speak and log a transaction')
  })

  it('calls onTap when button is clicked', () => {
    const onTap = vi.fn()
    render(<TapToSpeakCard onTap={onTap} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledOnce()
  })
})
