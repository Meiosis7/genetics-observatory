import type { Report, Values } from './types'

const percent = (n: number) => `${Number((100 * n).toFixed(4))}%`
const fieldLabels: Record<string, string> = {
  generations: '自交代数',
  selection: '选择方式',
  AA: 'AA 个体数',
  Aa: 'Aa 个体数',
  aa: 'aa 个体数',
  pairs: '碱基对数',
  gc: 'GC 百分比',
  rounds: '复制轮数',
  diploid: '二倍体染色体数',
  division: '分裂类型',
  probability: '单次事件概率',
  births: '重复次数',
  affected: '事件发生次数',
}
function number(
  v: Values,
  key: string,
  min: number,
  max: number,
  integer = true,
) {
  const n = Number(v[key])
  if (
    !v[key]?.trim() ||
    !Number.isFinite(n) ||
    n < min ||
    n > max ||
    (integer && !Number.isInteger(n))
  )
    throw new Error(
      `${fieldLabels[key]} 必须为 ${min}～${max} 的${integer ? '整数' : '数值'}`,
    )
  return n
}
function choice(v: Values, key: string, allowed: string[]) {
  if (!allowed.includes(v[key])) throw new Error(`${fieldLabels[key]} 选项无效`)
  return v[key]
}
const distribution = (title: string, labels: string[], values: number[]) => ({
  title,
  rows: labels.map((label, i) => ({ label, value: values[i] })),
})
const metric = (label: string, value: string | number) => ({
  label,
  value: String(value),
})

export function selfingReport(v: Values): Report {
  const n = number(v, 'generations', 0, 20),
    select = choice(v, 'selection', ['none', 'dominant'])
  let a = 0,
    h = 1,
    b = 0
  const rows = [['0', percent(a), percent(h), percent(b), '100%']]
  for (let i = 1; i <= n; i++) {
    let nextA = a + h / 4,
      nextH = h / 2,
      nextB = b + h / 4
    const retained = select === 'dominant' ? nextA + nextH : 1
    if (select === 'dominant') {
      nextA /= retained
      nextH /= retained
      nextB = 0
    }
    a = nextA
    h = nextH
    b = nextB
    rows.push([
      String(i),
      percent(a),
      percent(h),
      percent(b),
      percent(retained),
    ])
  }
  return {
    summary: `Aa 连续自交 ${n} 代${select === 'dominant' ? '，每代去除 aa 后归一化' : ''}。`,
    metrics: [metric('杂合子频率', percent(h))],
    distributions: [
      distribution('本代基因型频率', ['AA', 'Aa', 'aa'], [a, h, b]),
    ],
    table: { headers: ['代数', 'AA', 'Aa', 'aa', '本代保留比例'], rows },
    steps: [
      '初代 AA=0，Aa=1，aa=0。',
      '自交递推：AA′=AA+Aa/4；Aa′=Aa/2；aa′=aa+Aa/4。',
      select === 'dominant'
        ? '每代繁殖后去除 aa；保留比例 R=AA′+Aa′，其余频率除以 R。'
        : '无选择时杂合子每代减半：Hₙ=(1/2)ⁿ。',
    ],
    notes: [
      '假设各基因型繁殖力相同、无突变、完全显性。自交不是随机交配。',
      '保留比例是该代相对选择前的比例，不是跨代累计存活率。',
    ],
  }
}
export function populationReport(v: Values): Report {
  const counts = ['AA', 'Aa', 'aa'].map((k) => number(v, k, 0, 1e9)),
    N = counts.reduce((a, b) => a + b, 0)
  if (!N) throw new Error('种群总数必须大于 0')
  const p = (2 * counts[0] + counts[1]) / (2 * N),
    q = 1 - p
  return {
    summary: `样本共 ${N} 个二倍体个体；观测频率与理论预测分开显示。`,
    metrics: [
      metric('A 等位基因频率 p', percent(p)),
      metric('a 等位基因频率 q', percent(q)),
    ],
    distributions: [
      distribution(
        '观测基因型频率',
        ['AA', 'Aa', 'aa'],
        counts.map((x) => x / N),
      ),
      distribution(
        '下一代理论 Hardy–Weinberg 频率',
        ['AA', 'Aa', 'aa'],
        [p * p, 2 * p * q, q * q],
      ),
    ],
    steps: [
      `N=${counts.join('+')}=${N}。`,
      `p=(2×AA+Aa)/(2N)=${p}；q=1−p=${q}。`,
      '随机交配时：AA=p²，Aa=2pq，aa=q²。',
    ],
    notes: [
      '理论假设：大种群、随机交配，无选择、迁移或突变。',
      '输入计数本身不能证明种群处于遗传平衡；理论值不是观测值。',
    ],
  }
}
export function dnaReport(v: Values): Report {
  const pairs = number(v, 'pairs', 1, 1e6),
    gc = number(v, 'gc', 0, 100, false),
    rounds = number(v, 'rounds', 0, 30),
    g = (pairs * gc) / 100
  if (Math.abs(g - Math.round(g)) > 1e-7)
    throw new Error('GC 比例与碱基对数必须产生整数 GC 碱基对')
  const G = Math.round(g),
    A = pairs - G,
    m = 2 ** rounds,
    old = rounds === 0 ? 1 : 2,
    newCount = rounds === 0 ? 0 : m - 2
  return {
    summary: `双链 DNA 含 ${pairs} 对碱基，半保留复制 ${rounds} 轮。`,
    metrics: [
      metric('A = T', A),
      metric('G = C', G),
      metric('氢键数', 2 * A + 3 * G),
      metric('DNA 分子数', m),
      metric('含原始链的分子数', old),
      metric('全新链分子数', newCount),
      metric('累计新合成核苷酸', 2 * pairs * (m - 1)),
      metric(
        '最后一轮消耗核苷酸',
        rounds === 0 ? 0 : 2 * pairs * 2 ** (rounds - 1),
      ),
      metric('含原始链分子的比例', percent(old / m)),
      metric('原始链占全部链的比例', percent(1 / m)),
    ],
    distributions: [
      distribution(
        '分子来源',
        ['含原始链', '两条链均新合成'],
        [old / m, newCount / m],
      ),
    ],
    steps: [
      `GC 对数=${pairs}×${gc}%=${G}；AT 对数=${A}；A=T=${A}，G=C=${G}。`,
      `氢键=2×AT+3×GC=${2 * A + 3 * G}。`,
      `复制后分子数=2ⁿ=${m}；累计新增核苷酸=2L(2ⁿ−1)。`,
      'n≥1 时仅 2 个分子各含一条原始链；原始链占全部链的比例始终为 1/2ⁿ。',
    ],
    notes: [
      '理想双链 DNA 完整复制，不计突变、损耗或修复。',
      '含原始链的分子比例与原始链比例不同；第 0 轮只有原始分子。',
      'GC% 指 G+C 占全部碱基的百分比。',
    ],
  }
}
export function divisionReport(v: Values): Report {
  const d = number(v, 'diploid', 2, 200)
  if (d % 2) throw new Error('二倍体染色体数必须为偶数')
  const mode = choice(v, 'division', ['mitosis', 'meiosis']),
    n = d / 2
  const entries: [string, number, number, number][] =
    mode === 'mitosis'
      ? [
          ['G1 期', d, d, 0],
          ['复制后前期／中期', d, 2 * d, 2 * d],
          ['有丝分裂后期', 2 * d, 2 * d, 0],
          ['分裂后子细胞', d, d, 0],
        ]
      : [
          ['G1 期', d, d, 0],
          ['减数Ⅰ前期／中期', d, 2 * d, 2 * d],
          ['减数Ⅰ后期', d, 2 * d, 2 * d],
          ['减数Ⅰ分裂后子细胞', n, d, d],
          ['减数Ⅱ中期', n, d, d],
          ['减数Ⅱ后期', d, d, 0],
          ['配子', n, n, 0],
        ]
  return {
    summary: `以 2n=${d} 为例，逐阶段统计单个完整细胞。`,
    metrics: [metric('体细胞染色体数 2n', d), metric('配子染色体数 n', n)],
    distributions: [],
    table: {
      headers: [
        '阶段',
        '染色体数／细胞',
        'DNA 分子数／细胞',
        '染色单体数／细胞',
      ],
      rows: entries.map((row) => row.map(String)),
    },
    steps: [
      '染色体按着丝粒数计数；每条染色单体含一个 DNA 分子。',
      'S 期 DNA 复制使 DNA 和染色单体加倍，染色体数不变。',
      '着丝粒分裂后姐妹染色单体成为独立染色体，此时染色单体按教材记为 0。',
      mode === 'meiosis'
        ? '减数Ⅰ同源染色体分离；减数Ⅱ姐妹染色单体分离，两次分裂之间不再复制 DNA。'
        : '有丝分裂后期着丝粒分裂，完整细胞染色体数暂时加倍。',
    ],
    notes: [
      '后期数值是整个细胞，不是一个细胞极；子细胞数值指胞质分裂完成后。',
      '采用高中教材常用染色单体计数约定。',
    ],
  }
}
export function probabilityReport(v: Values): Report {
  const p = number(v, 'probability', 0, 100, false) / 100,
    n = number(v, 'births', 1, 50),
    k = number(v, 'affected', 0, n)
  function probability(i: number) {
    let c = 1
    for (let j = 1; j <= i; j++) c = (c * (n - j + 1)) / j
    return c * p ** i * (1 - p) ** (n - i)
  }
  const none = (1 - p) ** n
  return {
    summary: `独立重复 ${n} 次，每次事件概率 ${percent(p)}。`,
    metrics: [
      metric('恰好 k 次', percent(probability(k))),
      metric('至少一次', percent(1 - none)),
      metric('一次也没有', percent(none)),
    ],
    distributions: [
      distribution(
        '发生次数的二项分布',
        Array.from({ length: n + 1 }, (_, i) => `${i} 次`),
        Array.from({ length: n + 1 }, (_, i) => probability(i)),
      ),
    ],
    steps: [
      `P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ；n=${n}，k=${k}，p=${p}。`,
      'C(n,k)=n!/[k!(n−k)!]，表示事件出现位置的组合数。',
      'P(X≥1)=1−P(X=0)=1−(1−p)ⁿ。',
    ],
    notes: [
      '假设每次独立、概率恒定；此前结果不会改变下一次概率。',
      '仅为概率模型教学，不提供临床生育风险判断。',
    ],
  }
}
