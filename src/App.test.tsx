import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Genetics Observatory brand', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '遗传观察所' })).toBeInTheDocument()
  })

  it('scrolls to the top when opening an experiment', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '开始一次实验' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
    scrollTo.mockRestore()
  })
})
