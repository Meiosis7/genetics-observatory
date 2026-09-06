import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Experiment } from '../experiments/types'
import type { CrossResult } from '../genetics/types'
import { ratioText } from './DistributionBars'
import { DiagramView } from '../advanced/DiagramView'
import { basicDiagrams } from '../teaching/basicDiagrams'
import { MotionStage } from '../teaching/MotionStage'
import { PlaybackControls, usePlayback } from '../teaching/playback'

interface PresentationModeProps {
  experiment: Experiment
  result: CrossResult
  onExit: () => void
}

const steps = ['parents', 'gametes', 'grid', 'distribution', 'summary'] as const

export function PresentationMode({ experiment, result, onExit }: PresentationModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [replay, setReplay] = useState(0)
  const advance = useCallback(() => setStepIndex(i => Math.min(i + 1, 4)), [])
  const playback = usePlayback(stepIndex, 4, advance)
  const diagrams = useMemo(() => basicDiagrams(result, experiment), [result, experiment])
  const go = (index: number) => { playback.setPlaying(false); setStepIndex(index) }
  const titles = ['亲本', '配子', '自由组合', '统计归纳', '表现型结论']

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onExit(); return }
      if ((event.target as HTMLElement)?.closest?.('input,select,textarea,button,a')) return
      if (event.key === 'ArrowRight') { event.preventDefault(); playback.setPlaying(false); setStepIndex((value) => Math.min(value + 1, steps.length - 1)) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); playback.setPlaying(false); setStepIndex((value) => Math.max(value - 1, 0)) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onExit])

  return (
    <div className="presentation-mode" role="dialog" aria-label="教师演示模式" aria-modal="true">
      <header className="presentation-header">
        <div className="presentation-brand"><span>M</span><div><strong>遗传观察所</strong><small>TEACHING MODE · 课堂演示</small></div></div>
        <div className="presentation-progress">{steps.map((item, index) => <button key={item} aria-label={`跳到第 ${index + 1} 步`} className={index <= stepIndex ? 'done' : ''} onClick={() => go(index)}><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
        <button className="presentation-exit" onClick={onExit}><X size={20} /> 退出演示</button>
      </header>

      <main className="presentation-stage"><section className="animated-basic">
        <PlaybackControls playing={playback.playing} toggle={() => playback.setPlaying(value => !value)} delay={playback.delay} setDelay={playback.setDelay} disabled={stepIndex === 4} />
        <div className="continuous-scene" role="region" aria-label="连续推导演播台"><div className="scene-bridge"><span>{stepIndex ? diagrams[stepIndex - 1].title : '从实验条件出发'}</span><ArrowRight size={16} /><strong>第 {stepIndex + 1} 步 / 5</strong></div>
        <MotionStage transitionKey={stepIndex} replayKey={replay} duration={playback.delay / 6}><h2>{titles[stepIndex]}</h2>{stepIndex === 4 && <div className="giant-ratio">{ratioText(result.phenotypeDistribution)}</div>}<DiagramView diagram={diagrams[stepIndex]} /></MotionStage></div>
        <button className="text-button" onClick={() => { playback.setPlaying(false); setReplay(r => r + 1) }}>重播本步动画</button>
      </section></main>

      <footer className="presentation-footer">
        <span><Maximize2 size={15} /> 使用 ← → 方向键控制</span>
        <div><button onClick={() => go(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}><ArrowLeft size={18} /> 上一步</button><button className="final-jump" onClick={() => go(steps.length - 1)}>查看结论</button><button onClick={() => go(Math.min(steps.length - 1, stepIndex + 1))} disabled={stepIndex === steps.length - 1}>下一步 <ArrowRight size={18} /></button></div>
      </footer>
    </div>
  )
}
