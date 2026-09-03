import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Experiment } from '../experiments/types'
import type { CrossResult } from '../genetics/types'
import { DistributionBars, describePhenotype, ratioText } from './DistributionBars'
import { PunnettGrid } from './PunnettGrid'

interface PresentationModeProps {
  experiment: Experiment
  result: CrossResult
  onExit: () => void
}

const steps = ['parents', 'gametes', 'grid', 'distribution', 'summary'] as const

export function PresentationMode({ experiment, result, onExit }: PresentationModeProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit()
      if (event.key === 'ArrowRight') setStepIndex((value) => Math.min(value + 1, steps.length - 1))
      if (event.key === 'ArrowLeft') setStepIndex((value) => Math.max(value - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onExit])

  const step = steps[stepIndex]
  return (
    <div className="presentation-mode" role="dialog" aria-label="教师演示模式" aria-modal="true">
      <header className="presentation-header">
        <div className="presentation-brand"><span>M</span><div><strong>遗传观察所</strong><small>TEACHING MODE · 课堂演示</small></div></div>
        <div className="presentation-progress">{steps.map((item, index) => <button key={item} aria-label={`跳到第 ${index + 1} 步`} className={index <= stepIndex ? 'done' : ''} onClick={() => setStepIndex(index)}><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
        <button className="presentation-exit" onClick={onExit}><X size={20} /> 退出演示</button>
      </header>

      <main className="presentation-stage">
        {step === 'parents' && <section className="teaching-slide parent-slide"><p className="slide-kicker">STEP 01 · 建立问题</p><h2>亲本</h2><p>先明确谁与谁杂交。每个字母代表一个等位基因。</p><div className="giant-cross"><div><span>亲本 P₁</span><strong>{result.parentA}</strong></div><i>×</i><div><span>亲本 P₂</span><strong>{result.parentB}</strong></div></div></section>}
        {step === 'gametes' && <section className="teaching-slide"><p className="slide-kicker">STEP 02 · 分离</p><h2>配子</h2><p>形成配子时，每个基因位点只带走一个等位基因。</p><div className="giant-gametes"><div><span>{result.parentA}</span>{result.maternalGametes.map((gamete) => <b key={gamete.label}>{gamete.label}</b>)}</div><i>×</i><div><span>{result.parentB}</span>{result.paternalGametes.map((gamete) => <b key={gamete.label}>{gamete.label}</b>)}</div></div></section>}
        {step === 'grid' && <section className="teaching-slide grid-slide"><p className="slide-kicker">STEP 03 · 自由组合</p><PunnettGrid result={result} /></section>}
        {step === 'distribution' && <section className="teaching-slide distribution-slide"><p className="slide-kicker">STEP 04 · 统计归纳</p><DistributionBars result={result} loci={experiment.loci} /></section>}
        {step === 'summary' && <section className="teaching-slide conclusion-slide"><p className="slide-kicker">STEP 05 · 得出结论</p><h2>表现型结论</h2><div className="giant-ratio">{ratioText(result.phenotypeDistribution)}</div><div className="conclusion-grid">{result.phenotypeDistribution.map((item) => <article key={item.label}><span>{describePhenotype(item.label, experiment.loci)}</span><strong>{item.count}/{result.totalCells}</strong><small>{item.label}</small></article>)}</div></section>}
      </main>

      <footer className="presentation-footer">
        <span><Maximize2 size={15} /> 使用 ← → 方向键控制</span>
        <div><button onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}><ArrowLeft size={18} /> 上一步</button><button className="final-jump" onClick={() => setStepIndex(steps.length - 1)}>查看结论</button><button onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={stepIndex === steps.length - 1}>下一步 <ArrowRight size={18} /></button></div>
      </footer>
    </div>
  )
}
