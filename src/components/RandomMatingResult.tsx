import type { PopulationResult } from '../genetics/types'
import type { Experiment } from '../experiments/types'
import { describePhenotype } from './DistributionBars'
import { phenotypeKey } from '../genetics/engine'

interface RandomMatingResultProps { experiment: Experiment; result: PopulationResult }

export function RandomMatingResult({ experiment, result }: RandomMatingResultProps) {
  return <div className="random-result"><section className="result-section"><div className="result-section-head"><span className="result-step">01</span><div><p>群体配子库</p><h3>等位基因频率</h3></div></div><div className="allele-pool">{Object.entries(experiment.alleleFrequencies ?? {}).map(([allele, value]) => <div key={allele}><span>{allele}</span><strong>{Math.round(value * 100)}%</strong><i style={{ height: `${value * 130}px` }} /></div>)}</div></section><section className="result-section"><div className="result-section-head"><span className="result-step">02</span><div><p>Hardy–Weinberg 平衡</p><h3>随机结合后的基因型</h3></div></div><div className="population-cards">{Object.entries(result.genotypeFrequencies).map(([genotype, value]) => <article key={genotype}><span>{genotype}</span><strong>{Number((value * 100).toFixed(2))}%</strong><small>{describePhenotype(phenotypeKey(genotype), experiment.loci)}</small></article>)}</div><div className="formula-note">p² + 2pq + q² = 1</div></section></div>
}
