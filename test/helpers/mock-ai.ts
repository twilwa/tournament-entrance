// Minimal AI mocking - only for component tests that can't use real API
export function createMockAIResponse(message: string = 'Test response from Stallman AI') {
  return {
    choices: [{
      message: {
        content: message,
        role: 'assistant'
      }
    }]
  }
}

// Only mock when absolutely necessary for isolated component testing
export function mockFetchForComponent() {
  return vi.fn().mockImplementation(async (url: string, options: any) => {
    if (url.includes('/api/chat')) {
      return {
        ok: true,
        json: async () => createMockAIResponse(),
      }
    }
    throw new Error(`Unmocked fetch call to ${url}`)
  })
}
