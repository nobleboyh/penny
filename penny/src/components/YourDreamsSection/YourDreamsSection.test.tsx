import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { YourDreamsSection } from './YourDreamsSection'

vi.mock('../../store/goalStore', () => ({
  useGoalStore: vi.fn(),
}))

import { useGoalStore } from '../../store/goalStore'
const mockUseGoalStore = useGoalStore as unknown as ReturnType<typeof vi.fn>

function renderSection() {
  return render(
    <MemoryRouter>
      <YourDreamsSection />
    </MemoryRouter>
  )
}

describe('YourDreamsSection', () => {
  beforeEach(() => {
    mockUseGoalStore.mockReturnValue({
      goalName: 'AirPods Pro',
      goalAmount: 200,
      savedAmount: 150,
      isJustSaving: false,
    })
  })

  it('renders scroll container with role="list" and aria-label="Your Dreams"', () => {
    renderSection()
    const list = screen.getByRole('list', { name: 'Your Dreams' })
    expect(list).toBeTruthy()
  })

  it('renders featured card with goal name and progress badge', () => {
    renderSection()
    expect(screen.getByText('AirPods Pro')).toBeTruthy()
    expect(screen.getByText('75%')).toBeTruthy()
  })

  it('renders "View All" link to /wishlist', () => {
    renderSection()
    const link = screen.getByRole('link', { name: /view all dreams/i })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/wishlist')
  })

  it('each card has role="listitem"', () => {
    renderSection()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Just Saving" featured card when isJustSaving', () => {
    mockUseGoalStore.mockReturnValue({
      goalName: 'Just saving',
      goalAmount: null,
      savedAmount: 42,
      isJustSaving: true,
    })
    renderSection()
    expect(screen.getByText('Just Saving 💰')).toBeTruthy()
  })

  it('renders CTA card when no goal set', () => {
    mockUseGoalStore.mockReturnValue({
      goalName: null,
      goalAmount: null,
      savedAmount: 0,
      isJustSaving: false,
    })
    renderSection()
    expect(screen.getByText('Add your first dream ✨')).toBeTruthy()
  })

  it('renders placeholder secondary cards', () => {
    renderSection()
    const placeholders = screen.getAllByTestId('placeholder-card')
    expect(placeholders.length).toBe(2)
  })
})
