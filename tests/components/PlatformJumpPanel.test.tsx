import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlatformJumpPanel } from '@/components/PlatformJumpPanel'

// Mock window.open
const mockOpen = vi.fn()
window.open = mockOpen

describe('PlatformJumpPanel', () => {
  it('should render search phrase', () => {
    render(<PlatformJumpPanel searchPhrase="咖啡拉花" onClose={() => {}} />)
    expect(screen.getByText(/咖啡拉花/)).toBeDefined()
  })
  
  it('should render platform buttons', () => {
    render(<PlatformJumpPanel searchPhrase="test" onClose={() => {}} />)
    expect(screen.getByText('B站')).toBeDefined()
    expect(screen.getByText('知乎')).toBeDefined()
    expect(screen.getByText('小红书')).toBeDefined()
  })
  
  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<PlatformJumpPanel searchPhrase="test" onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })
  
  it('should open platform URL when platform button clicked', () => {
    const onClose = vi.fn()
    render(<PlatformJumpPanel searchPhrase="咖啡拉花" onClose={onClose} />)
    fireEvent.click(screen.getByText('B站'))
    expect(mockOpen).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
