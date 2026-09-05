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

it('opens a topic directly from a research question', async () => {
  const onOpenAdvanced = vi.fn()
  render(<HomePage onStart={() => undefined} onOpenHistory={() => undefined} onOpenAdvanced={onOpenAdvanced} />)
  await userEvent.click(screen.getByRole('button', { name: /为什么会出现 2∶1/ }))
  expect(onOpenAdvanced).toHaveBeenCalledWith('lethal')
})
it('filters the exploration atlas by path', async () => {
  render(<HomePage onStart={() => undefined} onOpenHistory={() => undefined} onOpenAdvanced={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: 'DNA 与细胞' }))
  expect(screen.getByRole('button', { name: /复制后，最初的两条链去了哪里/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /为什么会出现 2∶1/ })).not.toBeInTheDocument()
})
it('lets the visitor change a parent and reveal the live offspring ratio', async () => {
  render(<HomePage onStart={() => undefined} onOpenHistory={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '把亲本 P₂ 改为 aa' }))
  await userEvent.click(screen.getByRole('button', { name: '揭晓后代比例' }))
  expect(screen.getByTestId('preview-ratio')).toHaveTextContent('1∶1')
  await userEvent.click(screen.getByRole('button', { name: '把亲本 P₂ 改为 Aa' }))
  expect(screen.queryByTestId('preview-ratio')).not.toBeInTheDocument()
})
