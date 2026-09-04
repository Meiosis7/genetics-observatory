import {
  ArrowRight,
  BookOpenCheck,
  Dna,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  RefreshCcw,
  Repeat2,
  Shuffle,
} from 'lucide-react'
import { EditorialCard } from '../components/EditorialCard'
import { EXPERIMENT_PRESETS, MODE_LABELS, cloneExperiment, presetForMode } from '../experiments/presets'
import type { Experiment, ExperimentMode } from '../experiments/types'

interface HomePageProps {
  onStart: (experiment: Experiment) => void
  onOpenHistory: () => void
  onOpenAdvanced?: () => void
}

const modeDetails: Array<{ mode: ExperimentMode; description: string; icon: typeof Dna }> = [
  { mode: 'cross', description: '自由设置两个亲本，观察等位基因如何重新组合。', icon: GitBranch },
  { mode: 'self', description: '同一个体产生雌雄配子，验证经典分离比。', icon: RefreshCcw },
  { mode: 'testcross', description: '与隐性纯合子杂交，反推未知亲本的基因型。', icon: FlaskConical },
  { mode: 'backcross', description: '让子一代与亲本再次杂交，比较后代差异。', icon: Repeat2 },
  { mode: 'random', description: '从等位基因频率出发，观察群体自由交配结果。', icon: Shuffle },
]

const specimenCells = ['AABB', 'AABb', 'AaBB', 'AaBb', 'AABb', 'AAbb', 'AaBb', 'Aabb', 'AaBB', 'AaBb', 'aaBB', 'aaBb', 'AaBb', 'Aabb', 'aaBb', 'aabb']

export function HomePage({ onStart, onOpenHistory, onOpenAdvanced }: HomePageProps) {
  const classicDouble = EXPERIMENT_PRESETS.find((item) => item.id === 'classic-double')!
  const classics = EXPERIMENT_PRESETS.slice(0, 3)

  return (
    <div className="page">
      {onOpenAdvanced && <section className="topic-home-entry"><div><h2>高中遗传 · 专题工具箱</h2><p>致死筛选、伴性遗传、系谱、DNA 与细胞分裂……11 个专题，带计算与推导。</p></div><button onClick={onOpenAdvanced}>进入专题工具箱 <ArrowRight size={17} /></button></section>}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Interactive Genetics Lab · 01</p>
          <h2>把遗传规律，<br />放到<em>眼前</em>。</h2>
          <p className="hero-lede">设置亲本、观察配子、推演子代。从基因型到表现型，每一步都有证据，而不是只给你一个答案。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onStart(cloneExperiment(classicDouble))}>
              开始一次实验 <ArrowRight size={18} />
            </button>
            <button className="secondary-button" onClick={onOpenHistory}>查看实验记录</button>
          </div>
        </div>
        <div className="hero-specimen" aria-label="双因子杂交结果示意图">
          <div className="specimen-orbit" aria-hidden="true" />
          <article className="specimen-card">
            <div className="specimen-top">
              <div><span className="specimen-index">SPECIMEN · 021</span><h3>双因子杂交</h3></div>
              <span className="ratio-stamp">9∶3∶3∶1</span>
            </div>
            <div className="parent-row">
              <div className="parent-chip"><span>亲本 P₁</span>AaBb</div>
              <div className="cross-mark">×</div>
              <div className="parent-chip"><span>亲本 P₂</span>AaBb</div>
            </div>
            <div className="mini-grid" aria-hidden="true">
              {specimenCells.map((cell, index) => <span className="mini-cell" key={`${cell}-${index}`}>{cell}</span>)}
            </div>
            <p className="specimen-note">16 种等概率组合 · 双显性表现型出现概率为 9/16</p>
          </article>
        </div>
      </section>

      <section className="section section-rule" aria-labelledby="modes-title">
        <div className="section-heading">
          <div><span className="section-number">01 / EXPERIMENT</span><h2 id="modes-title">选择实验方式</h2></div>
          <p>不必记住计算流程。选择一个研究问题，观察所会引导你完成后面的每一步。</p>
        </div>
        <div className="mode-grid">
          {modeDetails.map(({ mode, description, icon: Icon }, index) => (
            <EditorialCard key={mode} onClick={() => onStart(presetForMode(mode))} aria-label={`开始${MODE_LABELS[mode]}实验`}>
              <span className="mode-index">0{index + 1}</span>
              <Icon className="mode-icon" size={32} strokeWidth={1.6} />
              <h3>{MODE_LABELS[mode]}</h3>
              <p>{description}</p>
              <span className="mode-arrow"><ArrowRight size={15} /></span>
            </EditorialCard>
          ))}
        </div>
      </section>

      <section className="section section-rule" aria-labelledby="classic-title">
        <div className="section-heading">
          <div><span className="section-number">02 / CLASSIC CASES</span><h2 id="classic-title">从经典问题开始</h2></div>
          <p>案例已设置好性状与亲本。你可以直接播放推导，也可以把参数改成自己的题目。</p>
        </div>
        <div className="classic-grid">
          {classics.map((experiment, index) => (
            <article className={`classic-card ${index === 0 ? 'featured' : ''}`} key={experiment.id}>
              <div className="classic-meta"><span>CASE · 0{index + 1}</span><BookOpenCheck size={17} /></div>
              <h3>{experiment.title}</h3>
              <p>{experiment.loci.map((locus) => `${locus.dominantLabel} / ${locus.recessiveLabel}`).join(' · ')}</p>
              <div className="genotype-line">{experiment.parentA}<span>×</span>{experiment.parentB}</div>
              <button className="text-button" onClick={() => onStart(cloneExperiment(experiment))} aria-label={`打开${experiment.title}`}>
                打开案例 <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="privacy-note"><LockKeyhole size={16} /><span>无需注册 · 所有计算与实验记录只保存在你的浏览器中</span></div>
        <span>遗传观察所 · 高中遗传计算与推导</span>
      </footer>
    </div>
  )
}
