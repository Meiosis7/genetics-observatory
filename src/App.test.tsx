import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { saveExperiment } from './experiments/history'
import { EXPERIMENT_PRESETS } from './experiments/presets'

describe('App', () => {
  it('renders the Genetics Observatory brand', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '遗传观察所' })).toBeInTheDocument()
  })

  it('opens the high-school workbench from the header', async () => {
    render(<App />)
    expect(screen.getByRole('button', { name: '高中专题' })).toHaveAttribute('aria-label', '高中专题')
    await userEvent.click(screen.getByRole('button', { name: '高中专题' }))
    expect(screen.getByRole('heading', { name: '致死与存活筛选' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '返回遗传观察所首页' }))
    expect(screen.getByRole('button', { name: '开始一次实验' })).toBeInTheDocument()
  })

  it('loads a saved experiment while a different experiment is already open', async () => {
    localStorage.clear()
    saveExperiment(EXPERIMENT_PRESETS[0], { summary: 'saved sample' })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '开始一次实验' }))
    expect(screen.getByLabelText('亲本 P₁ 基因型')).toHaveValue('AaBb')
    await userEvent.click(screen.getByRole('button', { name: '实验记录' }))
    await userEvent.click(within(screen.getByRole('dialog', { name: '实验记录' })).getByRole('button', { name: '载入' }))
    expect(screen.getByLabelText('亲本 P₁ 基因型')).toHaveValue('Aa')
    localStorage.clear()
  })

  it('scrolls to the top when opening an experiment', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '开始一次实验' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
    scrollTo.mockRestore()
  })
})

it('routes a homepage question to its matching workbench', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /复制后，最初的两条链去了哪里/ }))
  expect(screen.getByRole('heading', { name: 'DNA 与半保留复制' })).toBeInTheDocument()
})
