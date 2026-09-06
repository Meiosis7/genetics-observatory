import { render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MotionStage } from './MotionStage'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
it('moves a retained entity from its old measured position and replays the same path', () => {
  const animate = vi.fn((_frames: Keyframe[], _options?: KeyframeAnimationOptions) => ({ cancel: vi.fn() } as unknown as Animation))
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { left: Number(this.dataset.x ?? 0), top: 0, width: 50, height: 30 } as DOMRect
  })
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate })
  const view = render(<MotionStage transitionKey={0} replayKey={0}><div data-motion-id="A" data-x="10">A</div></MotionStage>)
  animate.mockClear()
  view.rerender(<MotionStage transitionKey={1} replayKey={0}><div data-motion-id="A" data-x="110">A</div></MotionStage>)
  expect(animate.mock.calls[0][0][0].transform).toContain('translate(-100px, 0px)')
  animate.mockClear()
  view.rerender(<MotionStage transitionKey={1} replayKey={1}><div data-motion-id="A" data-x="110">A</div></MotionStage>)
  expect(animate.mock.calls[0][0][0].transform).toContain('translate(-100px, 0px)')
  view.unmount()
  delete (Element.prototype as { animate?: unknown }).animate
})
it('does not animate when the user requests reduced motion', () => {
  const animate = vi.fn()
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate })
  const view = render(<MotionStage transitionKey={0}><div data-motion-id="A">A</div></MotionStage>)
  view.rerender(<MotionStage transitionKey={1}><div data-motion-id="A">a</div></MotionStage>)
  expect(animate).not.toHaveBeenCalled()
  view.unmount()
  delete (Element.prototype as { animate?: unknown }).animate
})
