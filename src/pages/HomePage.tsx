import { useState } from 'react'
import { ArrowRight, ArrowUpRight, BookOpenCheck, Dna, FlaskConical, GitBranch, LockKeyhole, RefreshCcw, Repeat2, Search, Shuffle, Sparkles } from 'lucide-react'
import { EXPERIMENT_PRESETS, MODE_LABELS, cloneExperiment, presetForMode } from '../experiments/presets'
import type { Experiment, ExperimentMode } from '../experiments/types'
import { calculateCross } from '../genetics/engine'
import { TOPICS } from '../advanced/catalog'
import { PATHS, QUESTIONS } from './exploration'
import './exploration.css'

interface HomePageProps {
  onStart: (experiment: Experiment) => void
  onOpenHistory: () => void
  onOpenAdvanced?: (topicId?: string) => void
}
const MODES: Array<{ mode: ExperimentMode; hint: string; icon: typeof Dna }> = [
  { mode: 'cross', hint: '组合两个亲本', icon: GitBranch },
  { mode: 'self', hint: '观察性状分离', icon: RefreshCcw },
  { mode: 'testcross', hint: '检验未知基因型', icon: FlaskConical },
  { mode: 'backcross', hint: '让子代回到亲本', icon: Repeat2 },
  { mode: 'random', hint: '走进一个群体', icon: Shuffle },
]

export function HomePage({ onStart, onOpenHistory, onOpenAdvanced }: HomePageProps) {
  const [path, setPath] = useState('all')
  const [query, setQuery] = useState('')
  const [parent, setParent] = useState('Aa')
  const [revealed, setRevealed] = useState(false)
  const preview = calculateCross('Aa', parent)
  const matching = QUESTIONS.filter(question => (path === 'all' || question.path === path) && `${question.question} ${question.hint} ${TOPICS.find(t => t.id === question.id)?.title}`.toLowerCase().includes(query.trim().toLowerCase()))
  const dominant = preview.phenotypeDistribution.find(row => row.label === 'A_')!
  const dominantProbability = dominant.probability.numerator / dominant.probability.denominator
  const classicDouble = EXPERIMENT_PRESETS.find(item => item.id === 'classic-double')!
  return <main className="explore-page">
    <section className="explore-hero" aria-labelledby="explore-title">
      <div className="explore-hero-copy">
        <p className="explore-eyebrow"><span /> A FIELD GUIDE TO INHERITANCE</p>
        <h2 id="explore-title">遗传有规律。<br /><em>答案，自己发现。</em></h2>
        <p className="explore-lede">换一个亲本，改变一条条件。<br />让抽象的字母，成为看得见的推理。</p>
        <div className="explore-hero-actions"><a href="#exploration-atlas" className="explore-primary">选择一个问题 <ArrowRight size={18} /></a><button onClick={() => onStart(cloneExperiment(classicDouble))}>开始一次实验 <ArrowUpRight size={17} /></button></div>
        <div className="explore-method"><span>01 提出猜想</span><i /><span>02 改变条件</span><i /><span>03 验证规律</span></div>
      </div>
      <article className="live-specimen" aria-label="试一试单基因杂交">
        <div className="live-specimen-heading"><span>一分钟探索 / 001</span><span className="live-badge">可交互</span></div>
        <h3>只换一个字母，<br />后代会怎样？</h3>
        <div className="live-parents"><div><small>亲本 P₁</small><strong>Aa</strong></div><span>×</span><div><small>亲本 P₂ · 点选</small><div className="live-parent-options">{['Aa', 'aa'].map(value => <button key={value} aria-pressed={parent === value} aria-label={`把亲本 P₂ 改为 ${value}`} onClick={() => { setParent(value); setRevealed(false) }}>{value}</button>)}</div></div></div>
        <div className="live-flow"><span>配子随机结合</span><ArrowRight size={15} /><span>{preview.cells.length} 种等概率组合</span></div>
        <div className="live-offspring" aria-label="子代基因型组合">{preview.cells.map((cell, i) => <div className={cell.phenotype === 'A_' ? 'dominant' : 'recessive'} key={`${parent}-${i}`}><strong>{cell.genotype}</strong><small>{cell.phenotype === 'A_' ? '显性' : '隐性'}</small></div>)}</div>
        {revealed ? <div className="live-answer" aria-live="polite"><div><span>显性 ∶ 隐性</span><strong data-testid="preview-ratio">{preview.phenotypeDistribution.map(row => row.count).join('∶')}</strong></div><div className="live-ratio-track"><span style={{ width: `${dominantProbability * 100}%` }} /></div><p>单基因、完全显性；每次受精独立发生。</p></div> : <button className="live-reveal" aria-label="揭晓后代比例" onClick={() => setRevealed(true)}>先猜一猜，再揭晓后代比例 <ArrowRight size={16} /></button>}
        <p className="live-footnote">格子表示可能组合，不代表每窝必有这些后代。</p>
      </article>
    </section>

    <section className="exploration-atlas" id="exploration-atlas" aria-labelledby="atlas-title">
      <div className="atlas-heading"><div><p className="explore-eyebrow">THE EXPLORATION ATLAS / 探索地图</p><h2 id="atlas-title">你想弄明白什么？</h2></div><label className="atlas-search"><Search size={18} /><input aria-label="搜索探索问题" type="search" placeholder="搜问题、知识点，如 DNA" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <div className="atlas-paths" aria-label="探索路径">{PATHS.map(item => <button key={item.id} aria-pressed={path === item.id} onClick={() => setPath(item.id)}>{item.title}</button>)}</div>
      <div className="atlas-caption"><span>{PATHS.find(item => item.id === path)?.description}</span><span>{matching.length} 个研究问题</span></div>
      <div className="question-grid">{matching.map(question => {
        const topic = TOPICS.find(t => t.id === question.id)!
        return <button className={`question-card path-${question.path}`} key={question.id} onClick={() => onOpenAdvanced?.(question.id)} disabled={!onOpenAdvanced}>
          <div className="question-top"><span>{topic.title}</span>{topic.tag === '拓展' ? <small>拓展</small> : <span className="question-index">{String(QUESTIONS.indexOf(question) + 1).padStart(2, '0')}</span>}</div>
          <div className="question-mark" aria-hidden="true">{question.mark}</div><h3>{question.question}</h3><p>{question.hint}</p><div className="question-action">{question.action}<ArrowUpRight size={19} /></div>
        </button>
      })}</div>
      {!matching.length && <div className="atlas-empty"><Search size={28} /><h3>还没找到这个问题</h3><p>试试“血型”“自交”或“染色体”，也可以查看全部探索。</p><button className="secondary-button" onClick={() => { setQuery(''); setPath('all') }}>查看全部探索</button></div>}
    </section>

    <section className="explore-bench" aria-labelledby="bench-title"><div className="atlas-heading"><div><p className="explore-eyebrow">THE OPEN BENCH / 自由实验台</p><h2 id="bench-title">有自己的题目？从这里开始。</h2></div><p>自定义性状与亲本，观察配子、<br />潘尼特方格和每一步概率。</p></div><div className="bench-modes">{MODES.map(({ mode, hint, icon: Icon }, i) => <button key={mode} onClick={() => onStart(presetForMode(mode))} aria-label={`开始${MODE_LABELS[mode]}实验`}><span>0{i + 1}<Icon size={23} strokeWidth={1.5} /></span><h3>{MODE_LABELS[mode]}</h3><p>{hint}</p><ArrowRight size={18} /></button>)}</div></section>

    <section className="explore-classics" aria-labelledby="classics-title"><div><BookOpenCheck size={23} /><h2 id="classics-title">从经典实验出发</h2><p>把课本里的比例，亲手推一遍。</p></div>{EXPERIMENT_PRESETS.slice(0, 3).map((experiment, i) => <button key={experiment.id} onClick={() => onStart(cloneExperiment(experiment))}><small>CASE 0{i + 1}</small><h3>{experiment.title}</h3><p>{experiment.parentA} × {experiment.parentB}</p><ArrowUpRight size={19} /></button>)}</section>
    <aside className="explore-teaching"><Sparkles size={23} /><div><strong>把观察所带进课堂。</strong><p>逐步揭晓推导，先讨论再展示答案；保存实验条件，下次继续探索。</p></div><button onClick={onOpenHistory}>打开基础实验记录 <ArrowRight size={16} /></button></aside>
    <footer className="explore-footer"><span><LockKeyhole size={15} />无需注册 · 本地计算 · 数据保存在当前浏览器</span><span>遗传观察所 / 为好奇心而建</span></footer>
  </main>
}
