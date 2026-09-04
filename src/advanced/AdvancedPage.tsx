import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Copy, FlaskConical, Printer, RotateCcw } from 'lucide-react'
import { TOPICS } from './catalog'
import { ReportView } from './ReportView'
import type { Values } from './types'
import './advanced.css'

export function AdvancedPage({ onBack, initialTopic = 'lethal' }: { onBack: () => void; initialTopic?: string }) {
  const initial = TOPICS.find(topic => topic.id === initialTopic) ?? TOPICS[0]
  const [topicId, setTopicId] = useState(initial.id)
  const [values, setValues] = useState<Values>({ ...initial.defaults })
  const [notice, setNotice] = useState('')
  const topic = TOPICS.find(item => item.id === topicId)!
  const outcome = useMemo(() => {
    try { return { report: topic.calculate(values), error: '' } }
    catch (error) { return { report: null, error: error instanceof Error ? error.message : '请检查输入参数' } }
  }, [topic, values])

  useEffect(() => { setNotice('') }, [values, topicId])
  const changeTopic = (id: string) => {
    const next = TOPICS.find(item => item.id === id)!
    setTopicId(id)
    setValues({ ...next.defaults })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
  const changeValue = (key: string, value: string) => {
    setValues(current => {
      const next = { ...current, [key]: value }
      if (topicId === 'interaction' && key === 'model') {
        const single = ['incomplete', 'codominance'].includes(value)
        next.parentA = single ? current.parentA.slice(0, 2) : current.parentA.length === 2 ? `${current.parentA}Bb` : current.parentA
        next.parentB = single ? current.parentB.slice(0, 2) : current.parentB.length === 2 ? `${current.parentB}Bb` : current.parentB
      }
      return next
    })
  }
  const copy = async () => {
    if (!outcome.report) return
    const report = outcome.report
    const text = [topic.title, ...topic.fields.filter(field => !field.when || field.when(values)).map(field => `${field.label}：${values[field.key]}`), report.summary,
      ...report.metrics.map(metric => `${metric.label}：${metric.value}`),
      ...report.distributions.map(d => `${d.title}\n${d.rows.map(r => `${r.label}：${Number((r.value * 100).toFixed(4))}%`).join('\n')}`),
      ...(report.table ? [report.table.headers.join('\t'), ...report.table.rows.map(row => row.join('\t'))] : []),
      '推导', ...report.steps, '适用条件', ...report.notes].join('\n')
    try { await navigator.clipboard.writeText(text); setNotice('已复制结果与推导') }
    catch { setNotice('复制失败，请选中结果复制，或使用打印保存。') }
  }

  return <main className="advanced-shell">
    <nav className="topic-nav" aria-label="高中专题">
      <div className="topic-nav-title"><FlaskConical size={19} /><span>高中专题</span><small>{TOPICS.length}</small></div>
      <div className="topic-nav-list">{TOPICS.map((item, i) => <button key={item.id} className={item.id === topicId ? 'active' : ''} aria-current={item.id === topicId ? 'page' : undefined} onClick={() => changeTopic(item.id)}><span>{String(i + 1).padStart(2, '0')}</span>{item.title}{item.tag === '拓展' && <small>拓展</small>}</button>)}</div>
      <button className="topic-back" onClick={onBack}><ArrowLeft size={15} /> 返回基础实验</button>
      <p className="topic-local-note">本地计算 · 无需注册<br />仅用于学习与教学</p>
    </nav>
    <div className="topic-main">
      <header className="topic-heading"><div><p>FIELD NOTES / 高中遗传专题 <span>{topic.tag}</span></p><h2>{topic.title}</h2><div className="topic-intro">{topic.intro}</div></div><span className="topic-number" aria-hidden="true">{String(TOPICS.indexOf(topic) + 1).padStart(2, '0')}</span></header>
      <div className="topic-workbench">
        <aside className="topic-settings">
          <div className="settings-heading"><h3>实验条件</h3><button onClick={() => setValues({ ...topic.defaults })} aria-label="重置本题"><RotateCcw size={16} /></button></div>
          {topic.examples && <div className="topic-examples"><span>经典题型</span>{topic.examples.map(example => <button key={example.label} onClick={() => setValues({ ...example.values })}>{example.label}<ArrowUpRight size={13} /></button>)}</div>}
          <form onSubmit={event => event.preventDefault()} noValidate>
            {topic.fields.filter(field => !field.when || field.when(values)).map(field => <div className="topic-field" key={`${field.key}-${field.label}`}>
              <label htmlFor={`topic-${field.key}`}>{field.label}</label>
              {field.options ? <select id={`topic-${field.key}`} value={values[field.key]} onChange={event => changeValue(field.key, event.target.value)}>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={`topic-${field.key}`} type={field.type ?? 'text'} value={values[field.key]} min={field.min} max={field.max} step={field.step ?? 'any'} autoComplete="off" spellCheck={false} aria-describedby={field.hint ? `hint-${field.key}` : undefined} onChange={event => changeValue(field.key, event.target.value)} />}
              {field.hint && <small id={`hint-${field.key}`}>{field.hint}</small>}
            </div>)}
          </form>
          <p className="settings-footnote">修改条件后自动重新计算。<br />百分比显示保留至小数点后 4 位。</p>
        </aside>
        <div className="topic-results">
          <div className="topic-result-toolbar"><span><i /> 实时推导</span><div><button disabled={!outcome.report} onClick={copy}><Copy size={15} />复制结果</button><button disabled={!outcome.report} onClick={() => window.print()}><Printer size={15} />打印 / PDF</button></div></div>
          {notice && <p className="topic-notice" role="status">{notice}</p>}
          {outcome.report ? <ReportView report={outcome.report} /> : <section className="topic-error" role="alert"><span>请检查实验条件</span><p>{outcome.error}</p><small>输入修正后，结果会自动恢复。</small></section>}
          <footer className="topic-sources">模型参考：<a href="https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits" target="_blank" rel="noreferrer">OpenStax · 遗传规律</a><span> / </span><a href="https://www.moe.gov.cn/srcsite/A26/s8001/202006/t20200603_462199.html" target="_blank" rel="noreferrer">高中课程标准</a><p>涵盖常见计算模型；连锁与互作列为拓展。系谱工具限核心家庭，不替代多代家系分析或医学诊断。</p></footer>
        </div>
      </div>
    </div>
  </main>
}
