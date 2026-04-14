import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PocketPixelTip } from './PocketPixelTip'

describe('PocketPixelTip', () => {
  it('renders Pocket Pixel image with correct src for given mood', () => {
    render(<PocketPixelTip mood="happy" />)
    const img = screen.getByAltText('Pocket Pixel') as HTMLImageElement
    expect(img.src).toContain('penny_happy.png')
  })

  it('renders default message and subtext', () => {
    render(<PocketPixelTip />)
    expect(screen.getByText("You're on it!")).toBeTruthy()
    expect(screen.getByText('Stash growing this week.')).toBeTruthy()
  })

  it('renders custom message and subtext', () => {
    render(<PocketPixelTip message="Keep going!" subtext="Almost there." />)
    expect(screen.getByText('Keep going!')).toBeTruthy()
    expect(screen.getByText('Almost there.')).toBeTruthy()
  })

  it('renders correct PNG for each mood', () => {
    const moods = ['happy', 'confident', 'peace', 'fierce', 'shocked', 'sad', 'crying', 'angry'] as const
    for (const mood of moods) {
      const { unmount } = render(<PocketPixelTip mood={mood} />)
      const img = screen.getByAltText('Pocket Pixel') as HTMLImageElement
      expect(img.src).toContain(`penny_${mood}.png`)
      unmount()
    }
  })
})
