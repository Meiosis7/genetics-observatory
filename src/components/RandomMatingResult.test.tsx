import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { EXPERIMENT_PRESETS } from '../experiments/presets'
import { calculateRandomMating } from '../genetics/engine'
import { RandomMatingResult } from './RandomMatingResult'

it('describes both traits in a two-locus random mating result', () => {
  const experiment = { ...EXPERIMENT_PRESETS[1], alleleFrequencies: { A: .5, a: .5, B: .5, b: .5 } }
  render(<RandomMatingResult experiment={experiment} result={calculateRandomMating(experiment.alleleFrequencies)} />)
  expect(screen.getByText('aabb').closest('article')).toHaveTextContent('绿色 · 皱粒')
})
