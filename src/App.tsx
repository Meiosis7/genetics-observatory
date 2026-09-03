import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { HistoryDrawer } from './components/HistoryDrawer'
import { PresentationMode } from './components/PresentationMode'
import type { Experiment } from './experiments/types'
import type { CrossResult } from './genetics/types'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import './styles/global.css'

export default function App() {
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [presentation, setPresentation] = useState<{ experiment: Experiment; result: CrossResult } | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [experiment])

  const loadExperiment = (next: Experiment) => {
    setExperiment(next)
    setHistoryOpen(false)
  }

  return (
    <div className="app-shell">
      <AppHeader onHome={() => setExperiment(null)} onOpenHistory={() => setHistoryOpen(true)} />
      {experiment ? (
        <LabPage initialExperiment={experiment} onBack={() => setExperiment(null)} onPresent={(nextExperiment, result) => setPresentation({ experiment: nextExperiment, result })} />
      ) : (
        <HomePage onStart={setExperiment} onOpenHistory={() => setHistoryOpen(true)} />
      )}
      {historyOpen && <HistoryDrawer onLoad={loadExperiment} onClose={() => setHistoryOpen(false)} />}
      {presentation && <PresentationMode experiment={presentation.experiment} result={presentation.result} onExit={() => setPresentation(null)} />}
    </div>
  )
}
