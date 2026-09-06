import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { AdvancedPage } from './AdvancedPage'
import { TOPICS } from './catalog'

it('renders a diagram beside every normal derivation step', () => {
  for (const topic of TOPICS) {
    const view = render(<AdvancedPage initialTopic={topic.id} onBack={() => undefined} />)
    const section = screen.getByRole('region', { name: '图解推导' })
    expect(within(section).getAllByRole('figure')).toHaveLength(topic.calculate(topic.defaults).steps.length)
    view.unmount()
  }
})
it('reveals diagrams with their step and resets them with parameters', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  expect(screen.getAllByRole('figure')).toHaveLength(1)
  await userEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  expect(screen.getAllByRole('figure')).toHaveLength(1)
  await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
})

it('does not repeat all step diagrams when the full classroom result is revealed', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  while (screen.queryByRole('button', { name: '揭晓下一步' })) await userEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  const count = screen.getAllByRole('figure').length
  await userEvent.click(screen.getByRole('button', { name: '显示完整结果' }))
  expect(screen.getAllByRole('figure')).toHaveLength(count)
})

it('gives different chart series independent animation identities', () => {
  const view = render(<AdvancedPage onBack={() => undefined} />)
  const figure = screen.getByRole('figure', { name: '从合子概率到存活贡献' })
  const ids = [...figure.querySelectorAll('[data-motion-id]')].map(node => node.getAttribute('data-motion-id'))
  expect(new Set(ids).size).toBe(ids.length)
  view.unmount()
})
