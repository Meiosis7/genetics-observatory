import { Component, createRef, type ReactNode } from 'react'
import './teaching.css'

type Position = { rect: DOMRect; signature: string }
type Snapshot = Map<string, Position>
interface Props { transitionKey: string | number; duration?: number; replayKey?: number; children: ReactNode }

// Capture before React changes the scene, then move the new rendering from its old position.
export class MotionStage extends Component<Props> {
  private root = createRef<HTMLDivElement>()
  private animations: Animation[] = []
  private lastTransition: Snapshot = new Map()
  private reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  getSnapshotBeforeUpdate(previous: Props): Snapshot {
    const positions: Snapshot = new Map()
    if (previous.transitionKey === this.props.transitionKey || this.reduced()) return positions
    this.root.current?.querySelectorAll<HTMLElement>('[data-motion-id]').forEach(node => {
      const position = { rect: node.getBoundingClientRect(), signature: `${node.textContent}|${node.className}` }
      positions.set(node.dataset.motionId!, position)
      if (node.dataset.motionAlias) positions.set(node.dataset.motionAlias, position)
    })
    return positions
  }
  componentDidMount() { this.transition(new Map()) }
  componentDidUpdate(previous: Props, _state: unknown, snapshot: Snapshot) {
    if (previous.transitionKey !== this.props.transitionKey) { this.lastTransition = snapshot; this.transition(snapshot) }
    else if (previous.replayKey !== this.props.replayKey) this.transition(this.lastTransition)
  }
  componentWillUnmount() { this.animations.forEach(animation => animation.cancel()) }
  private transition(positions: Snapshot) {
    this.animations.forEach(animation => animation.cancel())
    this.animations = []
    if (this.reduced()) return
    const duration = this.props.duration ?? 850
    this.root.current?.querySelectorAll<HTMLElement>('[data-motion-id]').forEach((node, index) => {
      if (typeof node.animate !== 'function') return
      const previous = positions.get(node.dataset.motionId!) ?? positions.get(node.dataset.motionAlias ?? '') ?? positions.get(node.dataset.motionSource ?? '')
      const current = node.getBoundingClientRect()
      const frames: Keyframe[] = previous && current.width && current.height ? [
        { transform: `translate(${previous.rect.left - current.left}px, ${previous.rect.top - current.top}px) scale(${previous.rect.width / current.width}, ${previous.rect.height / current.height})`, opacity: .55, transformOrigin: 'top left' },
        { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, transformOrigin: 'top left' },
      ] : [{ transform: 'translateY(22px) scale(.92)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }]
      const animation = node.animate(frames, { duration, delay: previous ? 0 : Math.min(index * 65, 650), easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'backwards' })
      this.animations.push(animation)
      if (previous && previous.signature !== `${node.textContent}|${node.className}`) this.animations.push(node.animate([{ filter: 'brightness(1.28)' }, { filter: 'brightness(1)' }], { duration: duration * 1.4 }))
    })
  }
  render() { return <div className="motion-stage" ref={this.root}>{this.props.children}</div> }
}
