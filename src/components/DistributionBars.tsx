import { formatFraction, toPercent } from '../genetics/fraction'
import type { CrossResult, DistributionItem } from '../genetics/types'
import type { LocusDefinition } from '../experiments/types'

interface DistributionBarsProps { result: CrossResult; loci: LocusDefinition[] }

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

export function ratioText(items: DistributionItem[]): string {
  const divisor = items.map((item) => item.count).reduce(gcd)
  return items.map((item) => item.count / divisor).join('∶')
}

export function describePhenotype(key: string, loci: LocusDefinition[]): string {
  let cursor = 0
  return loci.map((locus) => {
    const dominant = key.slice(cursor, cursor + 2) === `${locus.symbol}_`
    cursor += 2
    return dominant ? locus.dominantLabel : locus.recessiveLabel
  }).join(' · ')
}

function BarList({ items, phenotype, loci }: { items: DistributionItem[]; phenotype?: boolean; loci: LocusDefinition[] }) {
  return <div className="distribution-list">{items.map((item, index) => {
    const name = phenotype ? describePhenotype(item.label, loci) : item.label
    const testId = phenotype ? `phenotype-${item.label}` : `genotype-${item.label}`
    return <div className="distribution-row" data-testid={testId} key={item.label}><div className="distribution-label"><span className={`color-dot color-${index % 4}`} /><strong>{name}</strong><code>{item.label}</code></div><div className="bar-track"><span style={{ width: `${item.probability.numerator / item.probability.denominator * 100}%` }} /></div><div className="probability"><strong>{toPercent(item.probability)}</strong><small>{formatFraction(item.probability)}</small></div></div>
  })}</div>
}

export function DistributionBars({ result, loci }: DistributionBarsProps) {
  return (
    <section className="result-section" aria-labelledby="distribution-heading">
      <div className="result-section-head"><span className="result-step">03</span><div><p>统计与归纳</p><h3 id="distribution-heading">子代分布</h3></div><span className="ratio-display">{ratioText(result.phenotypeDistribution)}</span></div>
      <div className="distribution-tabs">
        <div className="distribution-panel"><div className="panel-label"><span>表现型</span><small>由性状观察分类</small></div><BarList items={result.phenotypeDistribution} phenotype loci={loci} /></div>
        <div className="distribution-panel subtle"><div className="panel-label"><span>基因型</span><small>按等位基因组合分类</small></div><BarList items={result.genotypeDistribution} loci={loci} /></div>
      </div>
    </section>
  )
}
