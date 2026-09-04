import { BookOpen, CircleHelp } from 'lucide-react'
import type { Report } from './types'

const percent = (value: number) => `${Number((value * 100).toFixed(4))}%`

export function ReportView({ report }: { report: Report }) {
  return <div className="topic-report">
    <section className="report-summary"><span className="report-kicker">OBSERVATION / 观察结论</span><p>{report.summary}</p></section>
    <dl className="report-metrics">{report.metrics.map((metric, i) => <div key={`${metric.label}-${i}`} data-testid={`metric-${metric.label}`}><dt>{metric.label}</dt><dd>{metric.value}</dd>{metric.hint && <small>{metric.hint}</small>}</div>)}</dl>
    <div className="report-distributions">{report.distributions.map((distribution, i) => <section className="report-card" key={distribution.title}>
      <div className="report-card-heading"><span>{String(i + 1).padStart(2, '0')}</span><h3>{distribution.title}</h3></div>
      {distribution.rows.length ? <ul className="weighted-bars">{distribution.rows.map((row, j) => <li key={row.label}>
        <div><span>{row.label}</span><strong>{percent(row.value)}</strong></div>
        <div className="weighted-track" aria-hidden="true"><span className={`bar-color-${j % 4}`} style={{ width: percent(row.value) }} /></div>
      </li>)}</ul> : <p className="report-empty">没有存活子代，比例无定义。</p>}
    </section>)}</div>
    {report.table && <section className="report-card report-table-card"><h3>过程数据</h3><div className="report-table-scroll" role="region" aria-label="过程数据表" tabIndex={0}><table><thead><tr>{report.table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{report.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>}
    <section className="report-card derivation"><h3><BookOpen size={19} /> 推导笔记</h3><ol>{report.steps.map((step, i) => <li key={i}>{step}</li>)}</ol></section>
    <aside className="report-assumptions"><h3><CircleHelp size={18} /> 适用条件与易错点</h3><ul>{report.notes.map((note, i) => <li key={i}>{note}</li>)}</ul></aside>
  </div>
}
