import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Genetics Observatory brand', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '遗传观察所' })).toBeInTheDocument()
  })
})
