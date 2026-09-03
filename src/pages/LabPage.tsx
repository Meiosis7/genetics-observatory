import { MonitorUp, Save, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DistributionBars } from '../components/DistributionBars'
import { ExperimentForm } from '../components/ExperimentForm'
import { GameteFlow } from '../components/GameteFlow'
import { PunnettGrid } from '../components/PunnettGrid'
import { RandomMatingResult } from '../components/RandomMatingResult'
import { ResultSummary } from '../components/ResultSummary'
import { cloneExperiment, presetForMode } from '../experiments/presets'
import { saveExperiment } from '../experiments/history'
import type { Experiment, ExperimentMode } from '../experiments/types'
import { calculateCross, calculateRandomMating } from '../genetics/engine'
import type { CrossResult } from '../genetics/types'

interface LabPageProps {
  initialExperiment: Experiment
  onBack: () => void
  onPresent?: (experiment: Experiment, result: CrossResult) => void
}

export function LabPage({ initialExperiment, onBack, onPresent }: LabPageProps) {
  const [experiment, setExperiment] = useState(() => cloneExperiment(initialExperiment))
  const [saved, setSaved] = useState(false)

  const crossOutcome = useMemo(() => {
    if (experiment.mode === 'random') return { result: null, error: '' }
    try { return { result: calculateCross(experiment.parentA, experiment.parentB), error: '' } }
    catch (error) { return { result: null, error: error instanceof Error ? error.message : '无法完成计算' } }
  }, [experiment.mode, experiment.parentA, experiment.parentB])

  const populationResult = useMemo(() => experiment.mode === 'random'
    ? calculateRandomMating(experiment.alleleFrequencies ?? { A: 0.6, a: 0.4 })
    : null, [experiment.mode, experiment.alleleFrequencies])

  const changeMode = (mode: ExperimentMode) => setExperiment(presetForMode(mode))
  const save = () => {
    if (crossOutcome.result) saveExperiment(experiment, crossOutcome.result)
    if (populationResult) {
      const summary = Object.entries(populationResult.genotypeFrequencies).map(([key, value]) => `${key} ${Number((value * 100).toFixed(2))}%`).join('，')
      saveExperiment(experiment, { summary })
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  return (
    <main className="lab-page">
      <ExperimentForm experiment={experiment} error={crossOutcome.error} onChange={setExperiment} onModeChange={changeMode} onReset={() => setExperiment(cloneExperiment(initialExperiment))} onBack={onBack} onPresent={() => crossOutcome.result && onPresent?.(experiment, crossOutcome.result)} onSave={save} />
      <section className="result-workspace">
        <header className="workspace-header"><div><p>LIVE OBSERVATION · 实时观察</p><h2>{experiment.title}</h2></div><div className="workspace-status"><span><Sparkles size={14} /> 结果实时更新</span><button onClick={() => crossOutcome.result && onPresent?.(experiment, crossOutcome.result)} disabled={!crossOutcome.result}><MonitorUp size={16} /> 教师演示</button></div></header>
        {saved && <div className="save-toast"><Save size={15} /> 已保存到本机实验记录</div>}
        {experiment.mode === 'random' && populationResult ? <RandomMatingResult experiment={experiment} result={populationResult} /> : crossOutcome.result ? <div className="result-stack"><GameteFlow result={crossOutcome.result} /><PunnettGrid result={crossOutcome.result} /><DistributionBars result={crossOutcome.result} loci={experiment.loci} /><ResultSummary result={crossOutcome.result} loci={experiment.loci} /></div> : <div className="empty-result"><span>?</span><h3>等待有效的亲本基因型</h3><p>{crossOutcome.error || '请在左侧完成实验设置。'}</p></div>}
      </section>
    </main>
  )
}
