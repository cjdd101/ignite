import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PerspectiveCard } from '@/components/PerspectiveCard'

describe('PerspectiveCard', () => {
  it('should render perspective type and description', () => {
    render(
      <PerspectiveCard
        type="阅读"
        description="通过书籍深入了解"
        firstStep="读一本相关书籍"
        searchPhrase="搜索口令"
        selected={false}
        onSelect={() => {}}
      />
    )
    
    expect(screen.getByText('阅读')).toBeDefined()
    expect(screen.getByText('通过书籍深入了解')).toBeDefined()
  })
  
  it('should render firstStep and searchPhrase', () => {
    render(
      <PerspectiveCard
        type="观看"
        description="通过视频学习"
        firstStep="看一个5分钟视频"
        searchPhrase="搜索视频"
        selected={false}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText('看一个5分钟视频')).toBeDefined()
    expect(screen.getByText(/搜索视频/)).toBeDefined()
  })
  
  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(
      <PerspectiveCard
        type="实践"
        description="动手体验"
        firstStep="做实验"
        searchPhrase="实验教程"
        selected={false}
        onSelect={onSelect}
      />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalled()
  })
  
  it('should show selected state styling', () => {
    const { container } = render(
      <PerspectiveCard
        type="阅读"
        description="描述"
        firstStep="第一步"
        searchPhrase="口令"
        selected={true}
        onSelect={() => {}}
      />
    )
    
    // Check if border-fire-spark class is applied (selected state)
    expect(container.innerHTML).toContain('border-fire-spark')
  })
})
