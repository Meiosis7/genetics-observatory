import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { AdvancedPage } from './AdvancedPage'

it('keeps a baseline while changing conditions, and hides comparison in class', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '设为对照' }))
  await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
  const comparison = screen.getByRole('region', { name: '实验对照' })
  const survivalRow = within(comparison).getByRole('row', { name: '合子存活率 75% 100%' })
  expect(survivalRow).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  expect(screen.queryByRole('region', { name: '实验对照' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '退出课堂推导' }))
  await userEvent.click(screen.getByRole('button', { name: '清除对照' }))
  expect(screen.queryByRole('region', { name: '实验对照' })).not.toBeInTheDocument()
})
