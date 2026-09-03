import { ArrowLeft, ArrowRightLeft, Play, RotateCcw, Save } from 'lucide-react'
import { MODE_LABELS } from '../experiments/presets'
import type { Experiment, ExperimentMode } from '../experiments/types'

interface ExperimentFormProps {
  experiment: Experiment
  error: string
  onChange: (experiment: Experiment) => void
  onModeChange: (mode: ExperimentMode) => void
  onReset: () => void
  onBack: () => void
  onPresent: () => void
  onSave: () => void
}

const modes = Object.keys(MODE_LABELS) as ExperimentMode[]

export function ExperimentForm({ experiment, error, onChange, onModeChange, onReset, onBack, onPresent, onSave }: ExperimentFormProps) {
  const updateParent = (field: 'parentA' | 'parentB', value: string) => {
    const next = { ...experiment, [field]: value }
    if (experiment.mode === 'self' && field === 'parentA') next.parentB = value
    onChange(next)
  }

  const swapParents = () => onChange({ ...experiment, parentA: experiment.parentB, parentB: experiment.parentA })
  const locus = experiment.loci[0]
  const dominantFrequency = experiment.alleleFrequencies?.[locus.symbol] ?? 0.6

  return (
    <aside className="experiment-sidebar">
      <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> 返回实验首页</button>
      <div className="lab-title-block">
        <p className="lab-kicker">EXPERIMENT SETUP · 实验设置</p>
        <input className="title-input" aria-label="实验名称" value={experiment.title} onChange={(event) => onChange({ ...experiment, title: event.target.value })} />
      </div>

      <fieldset className="field-group">
        <legend>实验类型</legend>
        <div className="mode-segments">
          {modes.map((mode) => <button type="button" className={experiment.mode === mode ? 'active' : ''} aria-pressed={experiment.mode === mode} key={mode} onClick={() => onModeChange(mode)}>{MODE_LABELS[mode]}</button>)}
        </div>
      </fieldset>

      {experiment.mode === 'random' ? (
        <fieldset className="field-group frequency-group">
          <legend>群体等位基因频率</legend>
          <div className="frequency-value"><span>{locus.symbol}</span><strong>{Math.round(dominantFrequency * 100)}%</strong></div>
          <input aria-label={`${locus.symbol} 等位基因频率`} type="range" min="5" max="95" step="5" value={dominantFrequency * 100} onChange={(event) => {
            const p = Number(event.target.value) / 100
            onChange({ ...experiment, alleleFrequencies: { [locus.symbol]: p, [locus.symbol.toLowerCase()]: 1 - p } })
          }} />
          <div className="frequency-scale"><span>{locus.symbol.toLowerCase()} {Math.round((1 - dominantFrequency) * 100)}%</span><span>总和 100%</span></div>
        </fieldset>
      ) : (
        <>
          <fieldset className="field-group">
            <legend>亲本基因型</legend>
            <label className="input-label">亲本 P₁ 基因型<input aria-label="亲本 P₁ 基因型" value={experiment.parentA} maxLength={experiment.locusCount * 2} onChange={(event) => updateParent('parentA', event.target.value)} spellCheck="false" /></label>
            <div className="parent-divider"><span />×<span /></div>
            <label className="input-label">亲本 P₂ 基因型<input aria-label="亲本 P₂ 基因型" value={experiment.parentB} maxLength={experiment.locusCount * 2} readOnly={experiment.mode === 'self' || experiment.mode === 'testcross'} onChange={(event) => updateParent('parentB', event.target.value)} spellCheck="false" /></label>
            {experiment.mode === 'self' && <p className="field-note">自交模式会让两个亲本保持相同。</p>}
            {experiment.mode === 'testcross' && <p className="field-note">测交亲本 P₂ 固定为隐性纯合子。</p>}
            {error && <p className="inline-error" role="alert">{error}</p>}
          </fieldset>

          <fieldset className="field-group">
            <legend>性状说明</legend>
            <div className="trait-table">
              {experiment.loci.map((item) => <div className="trait-row" key={item.symbol}><span className="allele-badge">{item.symbol}</span><span><b>{item.trait}</b><small>{item.dominantLabel} / {item.recessiveLabel}</small></span></div>)}
            </div>
          </fieldset>
        </>
      )}

      <div className="sidebar-actions">
        <button className="primary-button full" onClick={onPresent} disabled={Boolean(error)}><Play size={17} fill="currentColor" /> 播放推导</button>
        <div className="utility-row">
          <button onClick={swapParents} disabled={experiment.mode === 'self' || experiment.mode === 'testcross' || experiment.mode === 'random'}><ArrowRightLeft size={15} /> 交换</button>
          <button onClick={onReset}><RotateCcw size={15} /> 重置</button>
          <button onClick={onSave} disabled={Boolean(error)}><Save size={15} /> 保存</button>
        </div>
      </div>
    </aside>
  )
}
