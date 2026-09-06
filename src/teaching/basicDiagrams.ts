import type { CrossResult } from '../genetics/types'
import type { Experiment } from '../experiments/types'
import type { TeachingDiagram } from '../advanced/diagramTypes'
import { describePhenotype } from '../components/DistributionBars'

export function basicDiagrams(result: CrossResult, experiment: Experiment): TeachingDiagram[] {
  const female = result.maternalGametes.map(g => ({ label: g.label, value: g.probability.numerator / g.probability.denominator }))
  const male = result.paternalGametes.map(g => ({ label: g.label, value: g.probability.numerator / g.probability.denominator }))
  const chart: TeachingDiagram = { kind: 'chart', title: '把相同表现型的组合归在一起', caption: '每个组合计入一种表现型；以全部组合为分母统计概率。', labels: result.phenotypeDistribution.map(r => describePhenotype(r.label, experiment.loci)), series: [{ label: '子代概率', values: result.phenotypeDistribution.map(r => 100 * r.probability.numerator / r.probability.denominator) }], unit: '%' }
  return [
    { kind: 'flow', title: '确定参与杂交的亲本', caption: '每个亲本在每个位点都有一对等位基因。', stages: [{ label: '亲本 P₁', items: [{ label: result.parentA }] }, { label: '亲本 P₂', items: [{ label: result.parentB }] }] },
    { kind: 'flow', title: '从亲本中分离出配子', caption: '每个配子在每个位点只获得一个等位基因。', stages: [{ label: `亲本 P₁ ${result.parentA}`, items: female.map(g => ({ label: g.label, detail: `${100 * g.value}%` })) }, { label: `亲本 P₂ ${result.parentB}`, items: male.map(g => ({ label: g.label, detail: `${100 * g.value}%` })) }] },
    { kind: 'cross', title: '让配子进入受精棋盘格', caption: '一枚雌配子与一枚雄配子结合；每个格子是一种可能组合。', female, male, cells: result.cells.map(c => ({ label: c.genotype, probability: c.probability.numerator / c.probability.denominator, note: describePhenotype(c.phenotype, experiment.loci) })) },
    chart,
    { ...chart, title: '回到最初的问题：后代会怎样？', caption: '这是理论概率；有限数量的实际后代不一定恰好符合理论比例。' },
  ]
}
