import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PennyAvatar } from './PennyAvatar'

vi.mock('lottie-react', () => ({ default: () => <div data-testid="lottie" /> }))
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))

import { useReducedMotion } from '../../hooks/useReducedMotion'
const mockReducedMotion = useReducedMotion as ReturnType<typeof vi.fn>

describe('PennyAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReducedMotion.mockReturnValue(false)
    // Default: fetch fails → emoji fallback
    global.fetch = vi.fn(() => Promise.reject())
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

  it('renders emoji fallback when Lottie fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject())
    render(<PennyAvatar mood="happy" />)
    await waitFor(() => {
      expect(screen.getByText('🐷')).toBeTruthy()
    })
  })

  it('renders Lottie when fetch succeeds', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ v: '5.0' }) } as Response)
    )
    render(<PennyAvatar mood="happy" />)
    await waitFor(() => {
      expect(screen.getByTestId('lottie')).toBeTruthy()
    })
  })

  it('renders emoji fallback when reduced motion is true', () => {
    mockReducedMotion.mockReturnValue(true)
    render(<PennyAvatar mood="excited" />)
    expect(screen.getByText('🐷')).toBeTruthy()
  })

  it('does not render Lottie when reduced motion is true', () => {
    mockReducedMotion.mockReturnValue(true)
    render(<PennyAvatar mood="excited" />)
    expect(screen.queryByTestId('lottie')).toBeNull()
  })
})
