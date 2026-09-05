import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { EXPERIMENT_PRESETS } from '../experiments/presets'
import { calculateRandomMating } from '../genetics/engine'
import { RandomMatingResult } from './RandomMatingResult'

it('describes both traits in a two-locus random mating result', () => {
  const experiment = { ...EXPERIMENT_PRESETS[1], alleleFrequencies: { A: .5, a: .5, B: .5, b: .5 } }
  render(<RandomMatingResult experiment={experiment} result={calculateRandomMating(experiment.alleleFrequencies)} />)
  expect(within(screen.getByRole('region', { name: '随机结合后的基因型分布' })).getByText('aabb').closest('article')).toHaveTextContent('绿色 · 皱粒')
})

it('includes a weighted gamete combination diagram for random mating', () => {
  const experiment = { ...EXPERIMENT_PRESETS[4], alleleFrequencies: { A: .6, a: .4 } }
  render(<RandomMatingResult experiment={experiment} result={calculateRandomMating(experiment.alleleFrequencies)} />)
  expect(screen.getByRole('figure', { name: '自由交配的加权棋盘格' })).toHaveTextContent('形成概率 36%')
  expect(screen.getByRole('figure', { name: '自由交配的加权棋盘格' })).toHaveTextContent('形成概率 24%')
})
