import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatBot } from '../../client/src/components/ChatBot'
import { mockFetchForComponent } from '../helpers/mock-ai'

// Only mock fetch for component isolation - real integration tests use real API
const mockFetch = mockFetchForComponent()
global.fetch = mockFetch

describe('ChatBot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chat interface', () => {
    render(<ChatBot language="en" />)
    
    expect(screen.getByPlaceholderText(/ask stallman/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ChatBot language="en" />)
    
    const input = screen.getByPlaceholderText(/ask stallman/i)
    const submitButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'Hello Stallman')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello Stallman',
          language: 'en'
        })
      })
    })
  })

  it('displays chat messages', async () => {
    const user = userEvent.setup()
    render(<ChatBot language="en" />)
    
    const input = screen.getByPlaceholderText(/ask stallman/i)
    
    await user.type(input, 'What is freedom?')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText('What is freedom?')).toBeInTheDocument()
      expect(screen.getByText('Test response from Stallman AI')).toBeInTheDocument()
    })
  })

  it('handles different languages', async () => {
    const user = userEvent.setup()
    render(<ChatBot language="es" />)
    
    const input = screen.getByPlaceholderText(/pregunta a stallman/i)
    
    await user.type(input, '¿Qué es la libertad?')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '¿Qué es la libertad?',
          language: 'es'
        })
      })
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<ChatBot language="en" />)
    
    const input = screen.getByPlaceholderText(/ask stallman/i)
    
    await user.type(input, 'Hello')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatBot language="en" />)
    
    const input = screen.getByPlaceholderText(/ask stallman/i) as HTMLInputElement
    
    await user.type(input, 'Hello')
    expect(input.value).toBe('Hello')
    
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })
})
