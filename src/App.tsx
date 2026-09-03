import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import type { Experiment } from './experiments/types'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'
import './styles/global.css'

export default function App() {
  const [experiment, setExperiment] = useState<Experiment | null>(null)

  return (
    <div className="app-shell">
      <AppHeader onHome={() => setExperiment(null)} onOpenHistory={() => undefined} />
      {experiment ? (
        <LabPage initialExperiment={experiment} onBack={() => setExperiment(null)} />
      ) : (
        <HomePage onStart={setExperiment} onOpenHistory={() => undefined} />
      )}
    </div>
  )
}
