import type { CrossResult } from '../genetics/types'

interface PunnettGridProps { result: CrossResult }

export function PunnettGrid({ result }: PunnettGridProps) {
  const columns = result.paternalGametes.length + 1
  return (
    <section className="result-section" aria-labelledby="punnett-heading">
      <div className="result-section-head"><span className="result-step">02</span><div><p>组合展开</p><h3 id="punnett-heading">潘尼特方格</h3></div><span className="section-badge">{result.totalCells} 种等概率组合</span></div>
      <div className="punnett-wrap">
        <div className="punnett-grid" style={{ gridTemplateColumns: `minmax(58px,.7fr) repeat(${columns - 1}, minmax(64px,1fr))` }}>
          <div className="punnett-corner">♀ × ♂</div>
          {result.paternalGametes.map((gamete) => <div className="punnett-header" key={`top-${gamete.label}`}>{gamete.label}</div>)}
          {result.maternalGametes.map((maternal) => (
            <div className="punnett-row" style={{ display: 'contents' }} key={`row-${maternal.label}`}>
              <div className="punnett-header">{maternal.label}</div>
              {result.cells.filter((cell) => cell.maternalGamete === maternal.label).map((cell) => <div data-testid="punnett-cell" className={`punnett-cell phenotype-${cell.phenotype.replaceAll('_', 'd')}`} key={`${cell.maternalGamete}-${cell.paternalGamete}`}><strong>{cell.genotype}</strong><small>{cell.phenotype}</small></div>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
