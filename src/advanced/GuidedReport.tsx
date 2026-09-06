import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { DiagramView } from './DiagramView'
import { ReportView } from './ReportView'
import { MotionStage } from '../teaching/MotionStage'
import { PlaybackControls, usePlayback } from '../teaching/playback'
import type { Report } from './types'

export function GuidedReport({ report }: { report: Report }) {
  const [step, setStep] = useState(0)
  const [replay, setReplay] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const advance = useCallback(() => setStep(s => Math.min(report.steps.length, s + 1)), [report.steps.length])
  const playback = usePlayback(step, report.steps.length, advance)
  const navigate = (next: number) => { playback.setPlaying(false); setRevealed(false); setStep(next) }
  const current = report.diagrams?.[step - 1]
  return <div className="guided-report">
    <section className="guided-controls" aria-label="课堂分步推导">
      <div className="animation-intro"><span className="report-kicker">FOLLOW THE EVIDENCE / 连续推导</span><h3>看着上一步，走向下一步。</h3><p>同一画面内追踪变化。可以自动播放，也可以逐步停下来讨论。</p></div>
      <PlaybackControls playing={playback.playing} toggle={() => { if (step === 0) advance(); playback.setPlaying(p => !p) }} delay={playback.delay} setDelay={playback.setDelay} disabled={step === report.steps.length} />
      <div className="animation-timeline" aria-label="推导进度">{report.steps.map((_, i) => <button key={i} disabled={i + 1 > step} aria-label={`回看第 ${i + 1} 步`} aria-current={i + 1 === step ? 'step' : undefined} onClick={() => navigate(i + 1)}><span>{i + 1}</span></button>)}</div>
      <div className="continuous-scene" role="region" aria-label="连续推导演播台" tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight') { event.preventDefault(); navigate(Math.min(step + 1, report.steps.length)) } if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(Math.max(0, step - 1)) } }}>
        <div className="scene-bridge" aria-live="polite">{step ? <><span>{step > 1 ? report.diagrams?.[step - 2]?.title ?? '上一步的证据' : '从实验条件出发'}</span><ArrowRight size={16} /><strong>第 {step} 步 / {report.steps.length}</strong></> : <span>先观察左侧条件，再开始动画推导</span>}</div>
        <MotionStage transitionKey={step} replayKey={replay} duration={playback.delay / 6}>
          {step > 0 ? <><p className="scene-narration">{report.steps[step - 1]}</p>{current && <DiagramView diagram={current} />}</> : <div className="scene-ready"><span>01 → 02 → 03</span><h4>准备好追踪变化了吗？</h4><p>点击“揭晓下一步”或“自动播放”。答案随推理展开。</p></div>}
        </MotionStage>
      </div>
      <div className="guided-actions">
        <button className="secondary-button" disabled={step <= 1} onClick={() => navigate(step - 1)}><ArrowLeft size={16} />上一步</button>
        {step < report.steps.length ? <button className="primary-button" onClick={() => navigate(step + 1)}>揭晓下一步 <ArrowRight size={16} /></button> : !revealed && <button className="primary-button" onClick={() => setRevealed(true)}>显示完整结果 <ArrowRight size={16} /></button>}
        <button className="secondary-button" disabled={step === 0} onClick={() => { playback.setPlaying(false); setReplay(r => r + 1) }}>重播本步动画</button>
        <button className="secondary-button" disabled={step === 0} onClick={() => navigate(0)}><RotateCcw size={15} />重新推导</button>
      </div>
      {step > 0 && <details className="scene-transcript"><summary>回看已讲步骤</summary><ol>{report.steps.slice(0, step).map((text, i) => <li key={i}>{text}</li>)}</ol></details>}
    </section>
    {revealed && <ReportView report={report} showDerivation={false} />}
  </div>
}
