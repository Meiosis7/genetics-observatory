import { CheckCircle2, Copy } from 'lucide-react'
import { useState } from 'react'
import { formatFraction, toPercent } from '../genetics/fraction'
import type { CrossResult } from '../genetics/types'
import type { LocusDefinition } from '../experiments/types'
import { describePhenotype, ratioText } from './DistributionBars'

interface ResultSummaryProps { result: CrossResult; loci: LocusDefinition[] }

export function ResultSummary({ result, loci }: ResultSummaryProps) {
  const [copied, setCopied] = useState(false)
  const sentences = result.phenotypeDistribution.map((item) => `${describePhenotype(item.label, loci)}为 ${formatFraction(item.probability)}（${toPercent(item.probability)}）`)
  const summary = `${result.parentA} × ${result.parentB} 的子代表现型比例为 ${ratioText(result.phenotypeDistribution)}。${sentences.join('；')}。`
  const copy = async () => {
    await navigator.clipboard?.writeText(summary)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }
  return <section className="summary-card"><div className="summary-icon"><CheckCircle2 size={24} /></div><div><span>实验结论</span><p>{summary}</p></div><button onClick={copy}><Copy size={15} /> {copied ? '已复制' : '复制结论'}</button></section>
}
