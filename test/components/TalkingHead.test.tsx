import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TalkingHead } from '../../client/src/components/TalkingHead'

describe('TalkingHead Component', () => {
  it('renders Stallman avatar', () => {
    render(<TalkingHead isAnimated={false} />)
    
    expect(screen.getByAltText(/stallman/i)).toBeInTheDocument()
  })

  it('applies animation class when animated', () => {
    render(<TalkingHead isAnimated={true} />)
    
    const avatar = screen.getByAltText(/stallman/i)
    expect(avatar).toHaveClass('animate-pulse')
  })

  it('does not apply animation class when not animated', () => {
    render(<TalkingHead isAnimated={false} />)
    
    const avatar = screen.getByAltText(/stallman/i)
    expect(avatar).not.toHaveClass('animate-pulse')
  })

  it('has correct accessibility attributes', () => {
    render(<TalkingHead isAnimated={false} />)
    
    const avatar = screen.getByAltText(/stallman/i)
    expect(avatar).toHaveAttribute('alt')
    expect(avatar.getAttribute('alt')).toContain('Stallman')
  })
})
