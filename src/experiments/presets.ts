import type { Experiment, ExperimentMode } from './types'

export const MODE_LABELS: Record<ExperimentMode, string> = {
  cross: '普通杂交',
  self: '自交',
  testcross: '测交',
  backcross: '回交',
  random: '自由交配',
}

export const EXPERIMENT_PRESETS: Experiment[] = [
  {
    id: 'classic-single',
    title: '豌豆种子颜色自交',
    mode: 'self',
    locusCount: 1,
    parentA: 'Aa',
    parentB: 'Aa',
    loci: [{ symbol: 'A', trait: '种子颜色', dominantLabel: '黄色', recessiveLabel: '绿色' }],
  },
  {
    id: 'classic-double',
    title: '双因子经典杂交',
    mode: 'cross',
    locusCount: 2,
    parentA: 'AaBb',
    parentB: 'AaBb',
    loci: [
      { symbol: 'A', trait: '种子颜色', dominantLabel: '黄色', recessiveLabel: '绿色' },
      { symbol: 'B', trait: '种子形状', dominantLabel: '圆粒', recessiveLabel: '皱粒' },
    ],
  },
  {
    id: 'testcross-double',
    title: '双因子测交',
    mode: 'testcross',
    locusCount: 2,
    parentA: 'AaBb',
    parentB: 'aabb',
    loci: [
      { symbol: 'A', trait: '种子颜色', dominantLabel: '黄色', recessiveLabel: '绿色' },
      { symbol: 'B', trait: '种子形状', dominantLabel: '圆粒', recessiveLabel: '皱粒' },
    ],
  },
  {
    id: 'backcross-single',
    title: 'F₁ 与隐性亲本回交',
    mode: 'backcross',
    locusCount: 1,
    parentA: 'Aa',
    parentB: 'aa',
    loci: [{ symbol: 'A', trait: '花色', dominantLabel: '紫花', recessiveLabel: '白花' }],
  },
  {
    id: 'random-single',
    title: '群体自由交配',
    mode: 'random',
    locusCount: 1,
    parentA: 'Aa',
    parentB: 'Aa',
    loci: [{ symbol: 'A', trait: '种子颜色', dominantLabel: '黄色', recessiveLabel: '绿色' }],
    alleleFrequencies: { A: 0.6, a: 0.4 },
  },
]

export function cloneExperiment(experiment: Experiment): Experiment {
  return JSON.parse(JSON.stringify(experiment)) as Experiment
}

export function presetForMode(mode: ExperimentMode): Experiment {
  return cloneExperiment(EXPERIMENT_PRESETS.find((item) => item.mode === mode) ?? EXPERIMENT_PRESETS[1])
}
