import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AdvancedPage } from './AdvancedPage'
import { PresentationMode } from '../components/PresentationMode'
import { EXPERIMENT_PRESETS } from '../experiments/presets'
import { calculateCross } from '../genetics/engine'

afterEach(() => vi.useRealTimers())
it('uses one continuous stage, supports going back and replaying a transition', () => {
  render(<AdvancedPage onBack={() => undefined} />)
  fireEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  fireEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  const stage = screen.getByRole('region', { name: '连续推导演播台' })
  fireEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  expect(screen.getByRole('region', { name: '连续推导演播台' })).toBe(stage)
  expect(screen.getAllByRole('figure')).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: '上一步' }))
  expect(screen.getByRole('figure', { name: '亲本 → 原始配子' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '重播本步动画' }))
  expect(screen.getAllByRole('figure')).toHaveLength(1)
})
it('automatically advances, pauses, and stops when parameters change', () => {
  vi.useFakeTimers()
  render(<AdvancedPage onBack={() => undefined} />)
  fireEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  fireEvent.click(screen.getByRole('button', { name: '自动播放' }))
  expect(screen.getByRole('figure', { name: '亲本 → 原始配子' })).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(5000))
  expect(screen.getByRole('figure', { name: '配子筛选图' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '暂停自动播放' }))
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByRole('figure', { name: '配子筛选图' })).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('A 位点合子致死'), { target: { value: 'none' } })
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '自动播放' })).toBeInTheDocument()
})
it('adds playback to the basic presentation without losing its conclusion', () => {
  vi.useFakeTimers()
  const experiment = EXPERIMENT_PRESETS[1]
  render(<PresentationMode experiment={experiment} result={calculateCross(experiment.parentA, experiment.parentB)} onExit={() => undefined} />)
  fireEvent.click(screen.getByRole('button', { name: '自动播放' }))
  act(() => vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading', { name: '配子' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '查看结论' }))
  expect(screen.getByText('9∶3∶3∶1')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '自动播放' })).toBeDisabled()
})

it('keeps Escape available while presentation controls are focused', () => {
  const onExit = vi.fn()
  const experiment = EXPERIMENT_PRESETS[1]
  render(<PresentationMode experiment={experiment} result={calculateCross(experiment.parentA, experiment.parentB)} onExit={onExit} />)
  fireEvent.keyDown(screen.getByRole('button', { name: '自动播放' }), { key: 'Escape' })
  expect(onExit).toHaveBeenCalledOnce()
})
