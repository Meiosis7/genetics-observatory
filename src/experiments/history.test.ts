import { beforeEach, describe, expect, it } from 'vitest'
import { calculateCross } from '../genetics/engine'
import type { Experiment } from './types'
import { clearHistory, deleteExperiment, loadHistory, saveExperiment } from './history'

const sampleExperiment: Experiment = {
  id: 'classic-single',
  title: '豌豆种子颜色自交',
  mode: 'self',
  locusCount: 1,
  parentA: 'Aa',
  parentB: 'Aa',
  loci: [{ symbol: 'A', trait: '种子颜色', dominantLabel: '黄色', recessiveLabel: '绿色' }],
}

describe('experiment history', () => {
  beforeEach(() => localStorage.clear())

  it('stores only the latest 12 experiments', () => {
    for (let index = 0; index < 13; index += 1) {
      saveExperiment({ ...sampleExperiment, title: `实验 ${index}` }, calculateCross('Aa', 'Aa'))
    }
    expect(loadHistory()).toHaveLength(12)
    expect(loadHistory()[0].title).toBe('实验 12')
    expect(loadHistory()[11].title).toBe('实验 1')
  })

  it('deletes one experiment without touching the others', () => {
    const first = saveExperiment(sampleExperiment, calculateCross('Aa', 'Aa'))[0]
    saveExperiment({ ...sampleExperiment, title: '第二次实验' }, calculateCross('AA', 'aa'))
    deleteExperiment(first.id)
    expect(loadHistory().map((item) => item.title)).toEqual(['第二次实验'])
  })

  it('clears history', () => {
    saveExperiment(sampleExperiment, calculateCross('Aa', 'Aa'))
    clearHistory()
    expect(loadHistory()).toEqual([])
  })

  it('recovers safely from corrupt browser data', () => {
    localStorage.setItem('genetics-observatory:history:v1', '{bad json')
    expect(loadHistory()).toEqual([])
  })
})
