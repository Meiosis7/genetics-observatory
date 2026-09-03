import { formatFraction } from '../genetics/fraction'
import type { CrossResult } from '../genetics/types'

interface GameteFlowProps { result: CrossResult }

export function GameteFlow({ result }: GameteFlowProps) {
  return (
    <section className="result-section gamete-section" aria-labelledby="gametes-heading">
      <div className="result-section-head"><span className="result-step">01</span><div><p>配子形成</p><h3 id="gametes-heading">亲本分别能产生哪些配子？</h3></div></div>
      <div className="gamete-flow">
        <div className="gamete-parent"><span>亲本 P₁</span><strong>{result.parentA}</strong><div className="connector-line" /></div>
        <div className="gamete-cloud">{result.maternalGametes.map((gamete) => <span className="gamete-chip maternal" key={gamete.label}>{gamete.label}<small>{formatFraction(gamete.probability)}</small></span>)}</div>
        <div className="flow-cross">×</div>
        <div className="gamete-cloud">{result.paternalGametes.map((gamete) => <span className="gamete-chip paternal" key={gamete.label}>{gamete.label}<small>{formatFraction(gamete.probability)}</small></span>)}</div>
        <div className="gamete-parent"><span>亲本 P₂</span><strong>{result.parentB}</strong><div className="connector-line reverse" /></div>
      </div>
    </section>
  )
}
