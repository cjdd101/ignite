import 'fake-indexeddb/auto'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { afterEach } from 'vitest'

// Global render helper for Zustand tests
globalThis.render = render

afterEach(() => {
  // Cleanup after each test if needed
})