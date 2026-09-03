import { Beaker, Clock3, RotateCcw, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { clearHistory, deleteExperiment, loadHistory } from '../experiments/history'
import { cloneExperiment, MODE_LABELS } from '../experiments/presets'
import type { Experiment, ExperimentRecord } from '../experiments/types'

interface HistoryDrawerProps {
  onLoad: (experiment: Experiment) => void
  onClose: () => void
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function HistoryDrawer({ onLoad, onClose }: HistoryDrawerProps) {
  const [records, setRecords] = useState<ExperimentRecord[]>(() => loadHistory())
  const [confirming, setConfirming] = useState(false)

  const remove = (id: string) => setRecords(deleteExperiment(id))
  const clear = () => { clearHistory(); setRecords([]); setConfirming(false) }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="history-drawer" role="dialog" aria-label="实验记录" aria-modal="true">
        <header><div><p>LOCAL ARCHIVE · 本机档案</p><h2>实验记录</h2></div><button aria-label="关闭实验记录" onClick={onClose}><X size={20} /></button></header>
        <div className="history-toolbar"><span>最近保存 · 最多 12 条</span>{records.length > 0 && <button onClick={() => setConfirming(true)}><Trash2 size={14} /> 清空记录</button>}</div>
        <div className="history-list">
          {records.length === 0 ? <div className="history-empty"><span><Beaker size={26} /></span><h3>还没有实验记录</h3><p>在实验台点击“保存”，结果就会留在这台设备上。</p></div> : records.map((record, index) => <article className="history-item" key={record.id}><div className="history-index">{String(index + 1).padStart(2, '0')}</div><div className="history-content"><span className="history-type">{MODE_LABELS[record.experiment.mode]}</span><h3>{record.title}</h3><div className="history-cross">{record.experiment.mode === 'random' ? '群体频率模型' : `${record.experiment.parentA} × ${record.experiment.parentB}`}</div><p>{record.summary}</p><span className="history-time"><Clock3 size={12} /> {formatTime(record.createdAt)}</span></div><div className="history-actions"><button onClick={() => onLoad(cloneExperiment(record.experiment))}><RotateCcw size={14} /> 载入</button><button aria-label={`删除${record.title}`} onClick={() => remove(record.id)}><Trash2 size={14} /></button></div></article>)}
        </div>
      </aside>
      {confirming && <div className="confirm-dialog" role="dialog" aria-label="确认清空全部记录" aria-modal="true"><span className="confirm-icon"><Trash2 size={24} /></span><h3>清空全部记录？</h3><p>这会删除保存在本机的所有实验，且无法恢复。</p><div><button onClick={() => setConfirming(false)}>取消</button><button className="danger-button" onClick={clear}>确认清空</button></div></div>}
    </div>
  )
}
