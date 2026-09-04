import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { HistoryDrawer } from './components/HistoryDrawer'
import { PresentationMode } from './components/PresentationMode'
import type { Experiment } from './experiments/types'
import type { CrossResult } from './genetics/types'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import { AdvancedPage } from './advanced/AdvancedPage'
import './styles/global.css'

export default function App() {
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [loadKey, setLoadKey] = useState(0)
  const [presentation, setPresentation] = useState<{ experiment: Experiment; result: CrossResult } | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [experiment, advanced])

  const loadExperiment = (next: Experiment) => {
    setExperiment(next)
    setAdvanced(false)
    setLoadKey(key => key + 1)
    setHistoryOpen(false)
  }

  return (
    <div className="app-shell">
      <AppHeader onHome={() => { setExperiment(null); setAdvanced(false) }} onOpenHistory={() => setHistoryOpen(true)} onOpenAdvanced={() => setAdvanced(true)} />
      {advanced ? <AdvancedPage onBack={() => { setAdvanced(false); setExperiment(null) }} /> : experiment ? (
        <LabPage key={loadKey} initialExperiment={experiment} onBack={() => setExperiment(null)} onPresent={(nextExperiment, result) => setPresentation({ experiment: nextExperiment, result })} />
      ) : (
        <HomePage onStart={setExperiment} onOpenHistory={() => setHistoryOpen(true)} onOpenAdvanced={() => setAdvanced(true)} />
      )}
      {historyOpen && <HistoryDrawer onLoad={loadExperiment} onClose={() => setHistoryOpen(false)} />}
      {presentation && <PresentationMode experiment={presentation.experiment} result={presentation.result} onExit={() => setPresentation(null)} />}
    </div>
  )
}
