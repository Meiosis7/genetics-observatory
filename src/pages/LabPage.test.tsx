import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { cloneExperiment, EXPERIMENT_PRESETS } from '../experiments/presets'
import { LabPage } from './LabPage'

const singleGenePreset = EXPERIMENT_PRESETS.find((item) => item.id === 'classic-single')!
const doubleGenePreset = EXPERIMENT_PRESETS.find((item) => item.id === 'classic-double')!

describe('LabPage', () => {
  it('updates results when a parent changes', async () => {
    render(<LabPage initialExperiment={cloneExperiment(singleGenePreset)} onBack={() => undefined} />)
    const parentA = screen.getByLabelText('亲本 P₁ 基因型')
    await userEvent.clear(parentA)
    await userEvent.type(parentA, 'AA')
    expect(screen.getByTestId('phenotype-A_')).toHaveTextContent('100%')
    expect(screen.getAllByTestId('punnett-cell')).toHaveLength(1)
  })

  it('renders a 4 × 4 Punnett grid for a dihybrid cross', () => {
    render(<LabPage initialExperiment={cloneExperiment(doubleGenePreset)} onBack={() => undefined} />)
    expect(screen.getAllByTestId('punnett-cell')).toHaveLength(16)
    expect(screen.getByText('9∶3∶3∶1')).toBeInTheDocument()
  })

  it('shows inline validation for malformed genotypes', async () => {
    render(<LabPage initialExperiment={cloneExperiment(singleGenePreset)} onBack={() => undefined} />)
    const parentA = screen.getByLabelText('亲本 P₁ 基因型')
    await userEvent.clear(parentA)
    await userEvent.type(parentA, 'Ab')
    expect(screen.getByRole('alert')).toHaveTextContent('同一位点')
  })

  it('switches a cross between one and two loci', async () => {
    render(<LabPage initialExperiment={cloneExperiment(doubleGenePreset)} onBack={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: '单基因' }))
    expect(screen.getByLabelText('亲本 P₁ 基因型')).toHaveValue('Aa')
    expect(screen.getByLabelText('亲本 P₂ 基因型')).toHaveValue('Aa')
    expect(screen.getAllByTestId('punnett-cell')).toHaveLength(4)
  })

  it('uses custom phenotype descriptions in the result', async () => {
    render(<LabPage initialExperiment={cloneExperiment(singleGenePreset)} onBack={() => undefined} />)
    const dominantLabel = screen.getByLabelText('A 位点显性表现')
    await userEvent.clear(dominantLabel)
    await userEvent.type(dominantLabel, '高茎')
    expect(screen.getByTestId('phenotype-A_')).toHaveTextContent('高茎')
  })
})
