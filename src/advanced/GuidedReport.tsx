import { useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { ReportView } from './ReportView'
import type { Report } from './types'

export function GuidedReport({ report }: { report: Report }) {
  const [step, setStep] = useState(0)
  const [revealed, setRevealed] = useState(false)
  return <div className="guided-report">
    <section className="guided-controls" aria-label="课堂分步推导">
      <div><span className="report-kicker">THINK · REVEAL · DISCUSS</span><h3>先推理，再看答案。</h3><p>从左侧实验条件出发，先判断配子、概率或计数依据，再逐步核对。</p></div>
      <div className="guided-progress"><span aria-live="polite">已揭晓 {step} / {report.steps.length} 步</span><progress value={step} max={Math.max(1, report.steps.length)} /></div>
      {step > 0 && <ol className="guided-steps">{report.steps.slice(0, step).map((text, i) => <li key={i}>{text}</li>)}</ol>}
      <div className="guided-actions">
        {step < report.steps.length ? <button className="primary-button" onClick={() => setStep(s => s + 1)}>揭晓下一步 <ArrowRight size={16} /></button> : !revealed && <button className="primary-button" onClick={() => setRevealed(true)}>显示完整结果 <ArrowRight size={16} /></button>}
        <button className="secondary-button" disabled={step === 0} onClick={() => { setStep(0); setRevealed(false) }}><RotateCcw size={15} />重新推导</button>
      </div>
    </section>
    {revealed && <ReportView report={report} />}
  </div>
}
