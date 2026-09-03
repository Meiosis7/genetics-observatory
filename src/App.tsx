import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import type { Experiment } from './experiments/types'
import { HomePage } from './pages/HomePage'
import './styles/global.css'

export default function App() {
  const [experiment, setExperiment] = useState<Experiment | null>(null)

  return (
    <div className="app-shell">
      <AppHeader onHome={() => setExperiment(null)} onOpenHistory={() => undefined} />
      {experiment ? (
        <main className="page placeholder-page">
          <div><p className="eyebrow">实验准备完成</p><h2>{experiment.title}</h2><button className="secondary-button" onClick={() => setExperiment(null)}>返回首页</button></div>
        </main>
      ) : (
        <HomePage onStart={setExperiment} onOpenHistory={() => undefined} />
      )}
    </div>
  )
}
