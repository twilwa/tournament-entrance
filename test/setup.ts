import '@testing-library/jest-dom'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Set up test environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  process.env.OPENAI_API_KEY = 'test-key'
  process.env.OPENROUTER_API_KEY = 'test-key'
  
  console.log('Test environment NODE_ENV:', process.env.NODE_ENV)
})

// Clean up after each test
afterEach(() => {
  cleanup()
})
