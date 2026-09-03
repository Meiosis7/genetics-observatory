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
  const updateLocus = (index: number, field: 'trait' | 'dominantLabel' | 'recessiveLabel', value: string) => onChange({ ...experiment, loci: experiment.loci.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) })
  const changeLocusCount = (locusCount: 1 | 2) => {
    if (locusCount === experiment.locusCount) return
    if (locusCount === 1) {
      const first = experiment.loci[0]
      onChange({ ...experiment, locusCount, parentA: experiment.parentA.slice(0, 2), parentB: experiment.parentB.slice(0, 2), loci: [first], alleleFrequencies: experiment.mode === 'random' ? { [first.symbol]: experiment.alleleFrequencies?.[first.symbol] ?? 0.6, [first.symbol.toLowerCase()]: experiment.alleleFrequencies?.[first.symbol.toLowerCase()] ?? 0.4 } : undefined })
      return
    }
    const second = { symbol: 'B', trait: '种子形状', dominantLabel: '圆粒', recessiveLabel: '皱粒' }
    const parentA = `${experiment.parentA.slice(0, 2)}Bb`
    let parentB = `${experiment.parentB.slice(0, 2)}Bb`
    if (experiment.mode === 'self') parentB = parentA
    if (experiment.mode === 'testcross') parentB = `${experiment.loci[0].symbol.toLowerCase().repeat(2)}bb`
    onChange({ ...experiment, locusCount, parentA, parentB, loci: [experiment.loci[0], second], alleleFrequencies: experiment.mode === 'random' ? { ...experiment.alleleFrequencies, B: 0.5, b: 0.5 } : undefined })
  }

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

      <fieldset className="field-group">
        <legend>基因位点</legend>
        <div className="locus-segments">
          <button type="button" className={experiment.locusCount === 1 ? 'active' : ''} aria-pressed={experiment.locusCount === 1} onClick={() => changeLocusCount(1)}>单基因</button>
          <button type="button" className={experiment.locusCount === 2 ? 'active' : ''} aria-pressed={experiment.locusCount === 2} onClick={() => changeLocusCount(2)}>双基因</button>
        </div>
      </fieldset>

      {experiment.mode === 'random' ? (
        <fieldset className="field-group frequency-group">
          <legend>群体等位基因频率</legend>
          {experiment.loci.map((locus) => {
            const dominantFrequency = experiment.alleleFrequencies?.[locus.symbol] ?? 0.5
            return <div className="frequency-control" key={locus.symbol}><div className="frequency-value"><span>{locus.symbol}</span><strong>{Math.round(dominantFrequency * 100)}%</strong></div><input aria-label={`${locus.symbol} 等位基因频率`} type="range" min="5" max="95" step="5" value={dominantFrequency * 100} onChange={(event) => { const p = Number(event.target.value) / 100; onChange({ ...experiment, alleleFrequencies: { ...experiment.alleleFrequencies, [locus.symbol]: p, [locus.symbol.toLowerCase()]: 1 - p } }) }} /><div className="frequency-scale"><span>{locus.symbol.toLowerCase()} {Math.round((1 - dominantFrequency) * 100)}%</span><span>总和 100%</span></div></div>
          })}
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
              {experiment.loci.map((item, index) => <div className="trait-row trait-editor" key={item.symbol}><span className="allele-badge">{item.symbol}</span><div className="trait-fields"><input aria-label={`${item.symbol} 位点性状名称`} value={item.trait} onChange={(event) => updateLocus(index, 'trait', event.target.value)} /><div><input aria-label={`${item.symbol} 位点显性表现`} value={item.dominantLabel} onChange={(event) => updateLocus(index, 'dominantLabel', event.target.value)} /><span>/</span><input aria-label={`${item.symbol} 位点隐性表现`} value={item.recessiveLabel} onChange={(event) => updateLocus(index, 'recessiveLabel', event.target.value)} /></div></div></div>)}
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
