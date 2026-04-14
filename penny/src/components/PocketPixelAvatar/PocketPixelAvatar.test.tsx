import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PocketPixelAvatar } from './PocketPixelAvatar'

describe('PocketPixelAvatar', () => {
  it('renders role="img" with default aria-label', () => {
    render(<PocketPixelAvatar />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('aria-label')).toBe('Pocket Pixel, your saving buddy')
  })

  it('renders custom aria-label', () => {
    render(<PocketPixelAvatar aria-label="Custom" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Custom')
  })

  it('renders sm size (40px)', () => {
    render(<PocketPixelAvatar size="sm" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 40px')
    expect(el.getAttribute('style')).toContain('height: 40px')
  })

  it('renders md size (80px)', () => {
    render(<PocketPixelAvatar size="md" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 80px')
  })

  it('renders lg size (160px)', () => {
    render(<PocketPixelAvatar size="lg" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 160px')
  })

  it('renders correct PNG src for each mood', () => {
    const moods = ['happy', 'confident', 'peace', 'fierce', 'shocked', 'sad', 'crying', 'angry'] as const
    for (const mood of moods) {
      const { unmount } = render(<PocketPixelAvatar mood={mood} />)
      const img = screen.getByRole('img').querySelector('img')
      expect(img?.getAttribute('src')).toContain(`penny_${mood}.png`)
      unmount()
    }
  })

  it('defaults to peace mood', () => {
    render(<PocketPixelAvatar />)
    const img = screen.getByRole('img').querySelector('img')
    expect(img?.getAttribute('src')).toContain('penny_peace.png')
  })
})
