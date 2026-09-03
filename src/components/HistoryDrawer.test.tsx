import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { EXPERIMENT_PRESETS } from '../experiments/presets'
import { saveExperiment } from '../experiments/history'
import { calculateCross } from '../genetics/engine'
import { HistoryDrawer } from './HistoryDrawer'

describe('HistoryDrawer', () => {
  beforeEach(() => {
    localStorage.clear()
    const experiment = EXPERIMENT_PRESETS[0]
    saveExperiment(experiment, calculateCross(experiment.parentA, experiment.parentB))
  })

  it('asks before clearing every experiment', async () => {
    render(<HistoryDrawer onLoad={() => undefined} onClose={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: '清空记录' }))
    expect(screen.getByRole('dialog', { name: '确认清空全部记录' })).toBeVisible()
  })

  it('deletes a single experiment', async () => {
    render(<HistoryDrawer onLoad={() => undefined} onClose={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: '删除豌豆种子颜色自交' }))
    expect(screen.getByText('还没有实验记录')).toBeVisible()
  })
})
