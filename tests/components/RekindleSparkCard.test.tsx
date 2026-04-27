import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RekindleSparkCard } from '@/components/RekindleSparkCard'

describe('RekindleSparkCard', () => {
  it('should render spark content', () => {
    render(
      <RekindleSparkCard
        content="这是一个测试火种内容"
        onRetain={() => {}}
        onDiscard={() => {}}
        retained={false}
        discarded={false}
      />
    )
    expect(screen.getByText('这是一个测试火种内容')).toBeInTheDocument()
  })

  it('should show retain and discard buttons', () => {
    render(
      <RekindleSparkCard
        content="测试"
        onRetain={() => {}}
        onDiscard={() => {}}
        retained={false}
        discarded={false}
      />
    )
    expect(screen.getByText('保留')).toBeInTheDocument()
    expect(screen.getByText('丢弃')).toBeInTheDocument()
  })

  it('should call onRetain when retain button clicked', () => {
    const onRetain = vi.fn()
    render(
      <RekindleSparkCard
        content="测试"
        onRetain={onRetain}
        onDiscard={() => {}}
        retained={false}
        discarded={false}
      />
    )
    fireEvent.click(screen.getByText('保留'))
    expect(onRetain).toHaveBeenCalled()
  })

  it('should call onDiscard when discard button clicked', () => {
    const onDiscard = vi.fn()
    render(
      <RekindleSparkCard
        content="测试"
        onRetain={() => {}}
        onDiscard={onDiscard}
        retained={false}
        discarded={false}
      />
    )
    fireEvent.click(screen.getByText('丢弃'))
    expect(onDiscard).toHaveBeenCalled()
  })

  it('should not render when retained or discarded', () => {
    const { container } = render(
      <RekindleSparkCard
        content="测试"
        onRetain={() => {}}
        onDiscard={() => {}}
        retained={true}
        discarded={false}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
