import { Dna, History, FlaskConical } from 'lucide-react'

interface AppHeaderProps {
  onHome: () => void
  onOpenHistory: () => void
  onOpenAdvanced?: () => void
}

export function AppHeader({ onHome, onOpenHistory, onOpenAdvanced }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand-button" onClick={onHome} aria-label="返回遗传观察所首页">
        <span className="brand-mark"><Dna size={22} strokeWidth={2.3} /></span>
        <span className="brand-copy">
          <h1>遗传观察所</h1>
          <span>GENETICS OBSERVATORY</span>
        </span>
      </button>
      <nav className="header-actions" aria-label="主导航">
        {onOpenAdvanced && <button className="header-link" onClick={onOpenAdvanced}><FlaskConical size={16} /><span>高中专题</span></button>}
        <button className="header-link" onClick={onOpenHistory}>
          <History size={16} /> <span>实验记录</span>
        </button>
      </nav>
    </header>
  )
}
