import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('starts the classic dihybrid experiment', async () => {
    const onStart = vi.fn()
    render(<HomePage onStart={onStart} onOpenHistory={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: /双因子经典杂交/ }))
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
      parentA: 'AaBb',
      parentB: 'AaBb',
    }))
  })

  it('offers all five experiment modes', () => {
    render(<HomePage onStart={() => undefined} onOpenHistory={() => undefined} />)
    expect(screen.getByText('普通杂交')).toBeInTheDocument()
    expect(screen.getByText('自交')).toBeInTheDocument()
    expect(screen.getByText('测交')).toBeInTheDocument()
    expect(screen.getByText('回交')).toBeInTheDocument()
    expect(screen.getByText('自由交配')).toBeInTheDocument()
  })
})
