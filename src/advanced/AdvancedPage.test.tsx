import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AdvancedPage } from './AdvancedPage'

describe('high-school workbench', () => {
  it('opens lethal selection with the standard 75 percent example', () => {
    render(<AdvancedPage onBack={() => undefined} />)
    expect(screen.getByRole('heading', { name: '致死与存活筛选' })).toBeInTheDocument()
    expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('75%')
    expect(screen.getByRole('table')).toHaveTextContent('66.6667%')
  })
  it('changes rules, hides stale results on invalid input, and resets', async () => {
    render(<AdvancedPage onBack={() => undefined} />)
    await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
    expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('100%')
    await userEvent.clear(screen.getByLabelText('命中规则的合子致死率（%）'))
    expect(screen.getByRole('alert')).toHaveTextContent('致死率')
    expect(screen.queryByTestId('metric-合子存活率')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '重置本题' }))
    expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('75%')
  })
  it('navigates to sex linkage and uses its default valid settings', async () => {
    render(<AdvancedPage onBack={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: /伴性遗传/ }))
    expect(screen.getByRole('heading', { name: '伴性遗传' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('遗传模型')).toHaveValue('xr')
  })
  it('keeps interaction parents compatible when choosing single-locus models', async () => {
    render(<AdvancedPage onBack={() => undefined} initialTopic="interaction" />)
    await userEvent.selectOptions(screen.getByLabelText('表现型模型'), 'incomplete')
    expect(screen.getByLabelText('亲本 P₁')).toHaveValue('Aa')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('handles clipboard failure honestly', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'))
    render(<AdvancedPage onBack={() => undefined} />)
    await user.click(screen.getByRole('button', { name: '复制结果' }))
    expect(screen.getByRole('status')).toHaveTextContent('复制失败')
  })
  it('provides valid results for every topic default', async () => {
    const { TOPICS } = await import('./catalog')
    for (const topic of TOPICS) {
      const report = topic.calculate(topic.defaults)
      expect(report.summary, topic.id).not.toMatch(/NaN|Infinity|undefined/)
      expect(report.steps.length, topic.id).toBeGreaterThan(0)
      report.distributions.forEach(d => {
        d.rows.forEach(row => expect(row.value).toBeGreaterThanOrEqual(0))
        if (d.rows.length) expect(d.rows.reduce((sum, r) => sum + r.value, 0), `${topic.id}: ${d.title}`).toBeCloseTo(1, 8)
      })
    }
  })
  it('offers navigation back to the basic experiments', async () => {
    const onBack = vi.fn()
    render(<AdvancedPage onBack={onBack} />)
    await userEvent.click(within(screen.getByRole('navigation', { name: '高中专题' })).getByRole('button', { name: /基础实验/ }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

it('searches topics and explains an empty match', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.type(screen.getByRole('searchbox', { name: '查找专题' }), 'DNA')
  expect(screen.getByRole('button', { name: /DNA/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /伴性遗传/ })).not.toBeInTheDocument()
  await userEvent.clear(screen.getByRole('searchbox', { name: '查找专题' }))
  await userEvent.type(screen.getByRole('searchbox', { name: '查找专题' }), '不存在的专题')
  expect(screen.getByText('没有匹配的专题，试试其他关键词。')).toBeInTheDocument()
})

it('preserves conditions when switching between topics', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
  await userEvent.click(screen.getByRole('button', { name: /伴性遗传/ }))
  await userEvent.click(screen.getByRole('button', { name: /致死与存活筛选/ }))
  expect(screen.getByLabelText('A 位点合子致死')).toHaveValue('none')
  expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('100%')
})

it('saves a named experiment across remounts, restores and deletes it', async () => {
  localStorage.clear()
  const view = render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
  await userEvent.type(screen.getByLabelText('实验名称'), '课堂对照组')
  await userEvent.click(screen.getByRole('button', { name: '保存本题' }))
  expect(screen.getByRole('status')).toHaveTextContent('已保存')
  view.unmount()
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '恢复 课堂对照组' }))
  expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('100%')
  await userEvent.click(screen.getByRole('button', { name: '删除 课堂对照组' }))
  expect(screen.queryByRole('button', { name: '恢复 课堂对照组' })).not.toBeInTheDocument()
  localStorage.clear()
})

it('reveals classroom steps before the answer and resets on changed conditions', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  expect(screen.queryByTestId('metric-合子存活率')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /AA 致死 · 2∶1/ })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '复制结果' })).toBeDisabled()
  while (screen.queryByRole('button', { name: '揭晓下一步' })) {
    await userEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  }
  await userEvent.click(screen.getByRole('button', { name: '显示完整结果' }))
  expect(screen.getByTestId('metric-合子存活率')).toHaveTextContent('75%')
  await userEvent.selectOptions(screen.getByLabelText('A 位点合子致死'), 'none')
  expect(screen.queryByTestId('metric-合子存活率')).not.toBeInTheDocument()
})

it('hides a revealed classroom answer when resetting identical conditions', async () => {
  render(<AdvancedPage onBack={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '课堂推导' }))
  while (screen.queryByRole('button', { name: '揭晓下一步' })) await userEvent.click(screen.getByRole('button', { name: '揭晓下一步' }))
  await userEvent.click(screen.getByRole('button', { name: '显示完整结果' }))
  expect(screen.getByTestId('metric-合子存活率')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '重置本题' }))
  expect(screen.queryByTestId('metric-合子存活率')).not.toBeInTheDocument()
})
