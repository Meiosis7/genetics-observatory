import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { cloneExperiment, EXPERIMENT_PRESETS } from '../experiments/presets'
import { calculateCross } from '../genetics/engine'
import { PresentationMode } from './PresentationMode'

const experiment = cloneExperiment(EXPERIMENT_PRESETS.find((item) => item.id === 'classic-double')!)
const result = calculateCross(experiment.parentA, experiment.parentB)

describe('PresentationMode', () => {
  it('reveals one teaching step at a time', async () => {
    render(<PresentationMode experiment={experiment} result={result} onExit={() => undefined} />)
    expect(screen.getByRole('heading', { name: '亲本' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: '表现型结论' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getByRole('heading', { name: '配子' })).toBeVisible()
  })

  it('can jump to the final conclusion', async () => {
    render(<PresentationMode experiment={experiment} result={result} onExit={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: '查看结论' }))
    expect(screen.getByRole('heading', { name: '表现型结论' })).toBeVisible()
    expect(screen.getByText('9∶3∶3∶1')).toBeVisible()
  })
})
