import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PennyAvatar } from './PennyAvatar'

describe('PennyAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders role="img" and default aria-label', () => {
    render(<PennyAvatar />)
    const el = screen.getByRole('img')
    expect(el).toBeTruthy()
    expect(el.getAttribute('aria-label')).toBe('Penny, your saving buddy')
  })

  it('renders custom aria-label when provided', () => {
    render(<PennyAvatar aria-label="Custom label" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Custom label')
  })

  it('renders sm size (40px)', () => {
    render(<PennyAvatar size="sm" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 40px')
    expect(el.getAttribute('style')).toContain('height: 40px')
  })

  it('renders md size (80px)', () => {
    render(<PennyAvatar size="md" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 80px')
    expect(el.getAttribute('style')).toContain('height: 80px')
  })

  it('renders lg size (160px)', () => {
    render(<PennyAvatar size="lg" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('style')).toContain('width: 160px')
    expect(el.getAttribute('style')).toContain('height: 160px')
  })

  it('renders PNG img for each mood', () => {
    const moods = ['happy', 'confident', 'peace', 'fierce', 'shocked', 'sad', 'crying', 'angry'] as const
    for (const mood of moods) {
      const { unmount } = render(<PennyAvatar mood={mood} />)
      const img = screen.getAllByRole('img')[0].querySelector('img')
      expect(img?.getAttribute('src')).toContain(`penny_${mood}.png`)
      unmount()
    }
  })

  it('defaults to peace mood', () => {
    render(<PennyAvatar />)
    const img = screen.getByRole('img').querySelector('img')
    expect(img?.getAttribute('src')).toContain('penny_peace.png')
  })
})
