import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

export function usePlayback(index: number, last: number, advance: () => void) {
  const [playing, setPlaying] = useState(false)
  const [delay, setDelay] = useState(5000)
  useEffect(() => {
    if (!playing) return
    if (index >= last) { setPlaying(false); return }
    const timer = window.setTimeout(advance, delay)
    return () => window.clearTimeout(timer)
  }, [playing, index, last, delay, advance])
  return { playing, setPlaying, delay, setDelay }
}
export function PlaybackControls({ playing, toggle, delay, setDelay, disabled }: { playing: boolean; toggle: () => void; delay: number; setDelay: (delay: number) => void; disabled: boolean }) {
  return <div className="playback-controls"><button disabled={disabled} onClick={toggle} aria-label={playing ? '暂停自动播放' : '自动播放'}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? '暂停自动播放' : '自动播放'}</button><label>节奏<select aria-label="播放速度" value={delay} onChange={event => setDelay(Number(event.target.value))}><option value={8000}>慢速 · 8 秒</option><option value={5000}>标准 · 5 秒</option><option value={3000}>快速 · 3 秒</option></select></label></div>
}
