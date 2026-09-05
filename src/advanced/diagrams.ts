import { generateGametes } from '../genetics/engine'
import { classifyInteraction } from './crossing'
import type { Report, Values } from './types'
import type { CrossDiagram, DiagramItem, TeachingDiagram } from './diagramTypes'

type Pool = { label: string; value: number }[]
const pct = (x: number) => `${Number((x * 100).toFixed(4))}%`
const pair = (a: string, b: string) => [...a].map((letter, i) => [letter, b[i]].sort().join('')).join('')
const pool = (g: string): Pool => generateGametes(g).map(x => ({ label: x.label, value: x.probability.numerator / x.probability.denominator }))
const items = (p: Pool): DiagramItem[] => p.map(g => ({ label: g.label, detail: pct(g.value) }))
const flow = (title: string, caption: string, stages: { label: string; items: DiagramItem[] }[]): Extract<TeachingDiagram, { kind: 'flow' }> => ({ kind: 'flow', title, caption, stages })
const chart = (title: string, caption: string, labels: string[], series: { label: string; values: number[] }[], unit = '%', connect = false): TeachingDiagram => ({ kind: 'chart', title, caption, labels, series, unit, connect })
const grid = (title: string, female: Pool, male: Pool, combine = pair, caption = '行是雌配子，列是雄配子。每格概率 = 行概率 × 列概率；相同基因型需要合并。'): CrossDiagram => ({ kind: 'cross', title, caption, female, male, cells: female.flatMap(a => male.map(b => ({ label: combine(a.label, b.label), probability: a.value * b.value }))) })
const distChart = (d: Report['distributions'][number], title = d.title): TeachingDiagram => chart(title, '柱长按当前参数计算；数值以图中的标签为准。', d.rows.map(r => r.label), [{ label: d.title, values: d.rows.map(r => r.value * 100) }])
const metric = (r: Report, name: string) => r.metrics.find(m => m.label === name)?.value ?? '无定义'

function lethal(v: Values, r: Report): TeachingDiagram[] {
  const f = pool(v.parentA), m = pool(v.parentB)
  const deleted = (p: Pool, input: string): DiagramItem[] => {
    const dead = (input ?? '').split(/[,，\s]+/)
    return p.map(g => ({ label: g.label, detail: `${pct(g.value)}${dead.includes(g.label) ? ' · 删除' : ' · 保留'}`, tone: dead.includes(g.label) ? 'dead' : 'normal' }))
  }
  const filtering = flow('配子筛选图', '删除发生在各自配子池内；雌雄分别筛选，不把两池存活率相乘解释为生育率。', [
    { label: `雌方 ${v.parentA}`, items: deleted(f, v.femaleDead) },
    { label: `雄方 ${v.parentB}`, items: deleted(m, v.maleDead) },
  ])
  if (!r.distributions.length) return [filtering, flow('受精停止', '至少一方没有存活配子；不存在可绘制的合子棋盘格。', [{ label: '雌配子池', items: [{ label: metric(r, '雌配子存活率') }] }, { label: '雄配子池', items: [{ label: metric(r, '雄配子存活率') }] }, { label: '不能随机结合', items: [{ label: '无合子', tone: 'dead' }] }])]
  const female = r.distributions[0].rows, male = r.distributions[1].rows
  const fertilization = grid('受精棋盘格', female, male)
  const selected: CrossDiagram = { ...fertilization, title: '在棋盘格中标记合子存活权重', caption: '格内概率仍以受精合子为分母；存活权重是该基因型存活的条件概率，二者不可混用。', cells: fertilization.cells.map(c => {
    let survival = 1
    ;[v.lethalA, ...(v.parentA.length > 2 ? [v.lethalB] : [])].forEach((rule, i) => { if (rule !== 'none' && c.label.slice(i * 2, i * 2 + 2) === rule) survival *= 1 - Number(v.penetrance) / 100 })
    return { ...c, survival }
  }) }
  const table = r.table!.rows
  return [
    flow('亲本 → 原始配子', '每个位点只向配子传递一个等位基因；这里显示筛选前的原始概率。', [{ label: `雌方 ${v.parentA}`, items: items(f) }, { label: `雄方 ${v.parentB}`, items: items(m) }]),
    { ...filtering, stages: [...filtering.stages, { label: '雌方存活池内', items: items(female) }, { label: '雄方存活池内', items: items(male) }] },
    fertilization, selected,
    chart('从合子概率到存活贡献', '每个基因型的贡献 = 致死前概率 × 存活权重；全部贡献之和是合子存活率。', table.map(row => row[0]), [{ label: '致死前', values: table.map(row => parseFloat(row[1])) }, { label: '存活贡献', values: table.map(row => parseFloat(row[2])) }]),
    r.distributions[3].rows.length ? distChart(r.distributions[3], '存活后重新归一化') : flow('分母为零', '全部合子死亡，不能生成存活后代比例。', [{ label: '合子存活率', items: [{ label: '0%', tone: 'dead' }] }, { label: '存活后比例', items: [{ label: '无定义', tone: 'dead' }] }]),
  ]
}

function sex(v: Values, r: Report): TeachingDiagram[] {
  if (v.model === 'y') return [flow('Y 染色体传递路径', '父亲把 Y 传给儿子，把 X 传给女儿；母亲向两种性别都传 X。', [{ label: '父亲', items: [{ label: v.father === 'a' ? 'Y 携带目标性状' : 'Y 不携带目标性状' }] }, { label: '儿子', items: [{ label: v.father === 'a' ? '全部表现' : '全部不表现', tone: 'accent' }] }, { label: '女儿', items: [{ label: '不继承父亲的 Y' }] }]), distChart(r.distributions[0], '从性别条件概率到总体概率')]
  const f = pool(v.mother).map(g => ({ ...g, label: `X${g.label}` }))
  const m = [{ label: `X${v.father}`, value: .5 }, { label: 'Y', value: .5 }]
  const g = grid('X 与 Y 的受精棋盘格', f, m, (a, b) => b === 'Y' ? `${a}Y` : [...[a[1], b[1]].sort()].map(x => `X${x}`).join(''))
  return [g, flow('基因型 → 性别与表现型', '分别判断女儿与儿子的表型；这里每个分支的概率以全部子代为分母。', [{ label: v.model === 'xr' ? 'a 隐性致病' : 'A 显性致病', items: r.distributions[0].rows.map(row => ({ label: row.label, detail: pct(row.value) })) }]), flow('性别条件概率 → 总体概率', '男女出生概率各 1/2。先乘性别概率，再相加。', [{ label: '女儿中患病', items: [{ label: metric(r, '女儿中患病概率'), detail: '× 1/2' }] }, { label: '加上儿子中患病', items: [{ label: metric(r, '儿子中患病概率'), detail: '× 1/2' }] }, { label: '全部孩子患病', items: [{ label: metric(r, '全部孩子患病概率'), tone: 'accent' }] }])]
}
function blood(v: Values, r: Report): TeachingDiagram[] {
  const bloodPool = (s: string): Pool => [...new Set(s)].map(label => ({ label, value: [...s].filter(x => x === label).length / 2 }))
  const f = bloodPool(v.mother), m = bloodPool(v.father)
  return [flow('双亲的等位基因分离', 'A、B、O 分别简写 Iᴬ、Iᴮ、i。相同配子合并后标出真实概率。', [{ label: `母亲 ${v.mother}`, items: items(f) }, { label: `父亲 ${v.father}`, items: items(m) }]), grid('ABO 受精棋盘格', f, m, (a, b) => [a, b].sort().join('')), flow('基因型合并为血型', '同一种血型可以对应不同基因型；所有箭头按本题实际子代生成。', r.distributions[1].rows.filter(row => row.value > 0).map(row => ({ label: `${row.label} 型 · ${pct(row.value)}`, items: r.distributions[0].rows.filter(g => (g.label === 'AB' ? 'AB' : g.label.includes('A') ? 'A' : g.label.includes('B') ? 'B' : 'O') === row.label).map(g => ({ label: g.label, detail: pct(g.value) })) })))]
}
function interaction(v: Values, r: Report): TeachingDiagram[] {
  return [grid('先看基因型：受精棋盘格', pool(v.parentA), pool(v.parentB)), flow('再看表现型：归类与合并', '同一行中的基因型归入同一种表现型；百分比是本题的实际概率。', r.distributions[1].rows.map(row => ({ label: `${row.label} · ${pct(row.value)}`, items: r.distributions[0].rows.filter(g => classifyInteraction(v.model, g.label) === row.label).map(g => ({ label: g.label, detail: pct(g.value) })) }))), distChart(r.distributions[1], '按新分组统计表现型')]
}

export function buildDiagrams(id: string, v: Values, r: Report): TeachingDiagram[] {
  switch (id) {
    case 'lethal': return lethal(v, r)
    case 'sex': return sex(v, r)
    case 'blood': return blood(v, r)
    case 'interaction': return interaction(v, r)
    case 'linkage': return [flow('同源染色体上的基因排列', '斜线两侧分别为两条同源染色体；每条染色体上的两个字母表示两个位点。', [{ label: '雌方相位', items: v.phaseA.split('/').map(label => ({ label, detail: '同一条染色体上的 A、B 位点' })) }, { label: '雄方相位', items: v.phaseB.split('/').map(label => ({ label, detail: '同一条染色体上的 A、B 位点' })) }]), flow('重组率 → 不等概率配子', '双杂合子亲本型各 (1−r)/2，重组型各 r/2；纯合位点产生的同名配子已合并。', [{ label: `雌方 r=${v.rA}%`, items: items(r.distributions[0].rows) }, { label: `雄方 r=${v.rB}%`, items: items(r.distributions[1].rows) }]), grid('连锁与交换的加权棋盘格', r.distributions[0].rows, r.distributions[1].rows)]
    case 'pedigree': {
      const models = ['AR', 'AD', 'XR', 'XD', 'Y']
      return [{ kind: 'pedigree', title: '把题目画成核心家庭', caption: '方形为男性，圆形为女性；实心表示表现该性状，空心表示不表现。仅分析此核心家庭。', mother: v.mother === 'affected', father: v.father === 'affected', child: v.child === 'affected', sex: v.childSex }, flow('逐个模型检验双亲组合', '针对每个模型，枚举与双亲表型相容的基因型，再检查子代是否可能出现。', [{ label: '输入证据', items: [{ label: `母亲${v.mother === 'affected' ? '表现' : '不表现'}` }, { label: `父亲${v.father === 'affected' ? '表现' : '不表现'}` }] }, { label: '候选遗传方式', items: models.map(label => ({ label })) }, { label: '检验子代', items: [{ label: `${v.childSex === 'male' ? '儿子' : '女儿'}${v.child === 'affected' ? '表现' : '不表现'}` }] }]), flow('相容模型与排除结果', '相容意味着存在至少一种可行组合，不代表模型已确诊，也不代表各模型等概率。', models.map(model => ({ label: model, items: [{ label: r.table!.rows.some(row => row[0] === model) ? '仍相容' : '排除', detail: r.table!.rows.find(row => row[0] === model)?.[1], tone: r.table!.rows.some(row => row[0] === model) ? 'accent' : 'dead' }] })))]
    }
    case 'selfing': {
      const rows = r.table!.rows
      return [flow('第 0 代：全部为杂合子', '从 Aa 出发；初代尚未进行自交或筛选。', [{ label: '初代', items: [{ label: 'Aa', detail: '100%' }] }, { label: '产生配子', items: [{ label: 'A', detail: '1/2' }, { label: 'a', detail: '1/2' }] }]), flow('每一种亲本怎样贡献下一代', '按当代三种基因型的频率加权求和，得到下一代选择前频率。', [{ label: 'AA 自交', items: [{ label: 'AA', detail: '100%' }] }, { label: 'Aa 自交', items: [{ label: 'AA', detail: '25%' }, { label: 'Aa', detail: '50%' }, { label: 'aa', detail: '25%' }] }, { label: 'aa 自交', items: [{ label: 'aa', detail: '100%' }] }]), chart('自交各代的基因型频率', v.selection === 'dominant' ? '每代去除 aa 后，保留个体重新归一化；横轴 0 表示初代。' : '不筛选时 Aa 每代减半，两个纯合子频率逐渐增加；横轴为自交代数。', rows.map(row => row[0]), ['AA', 'Aa', 'aa'].map((label, i) => ({ label, values: rows.map(row => parseFloat(row[i + 1])) })), '%', true)]
    }
    case 'population': {
      const a = Number(v.AA), h = Number(v.Aa), b = Number(v.aa), total = a + h + b
      const p = (2 * a + h) / (2 * total), q = 1 - p
      return [chart('样本中三类个体', '这里是实际观测计数，不是平衡模型的预测值。', ['AA', 'Aa', 'aa'], [{ label: '个体数', values: [a, h, b] }], '个'), flow('个体计数 → 等位基因计数', '每个二倍体个体贡献两个等位基因；Aa 分别贡献一个 A 和一个 a。', [{ label: 'A 的来源', items: [{ label: `2×${a} + ${h}`, detail: `${2 * a + h} 个 A` }] }, { label: 'a 的来源', items: [{ label: `2×${b} + ${h}`, detail: `${2 * b + h} 个 a` }] }, { label: `等位基因总数 ${2 * total}`, items: [{ label: `p=${pct(p)}` }, { label: `q=${pct(q)}` }] }]), grid('随机配子结合得到 p²、pq、q²', [{ label: 'A', value: p }, { label: 'a', value: q }], [{ label: 'A', value: p }, { label: 'a', value: q }], pair, 'AA=p²；两格 Aa 概率相加为 2pq；aa=q²。这里是随机交配的理论预测。')]
    }
    case 'dna': {
      const gc = Math.round(Number(v.pairs) * Number(v.gc) / 100), at = Number(v.pairs) - gc, rounds = Number(v.rounds)
      const generations = [...Array.from({ length: Math.min(rounds, 3) + 1 }, (_, i) => i), ...(rounds > 3 ? [rounds] : [])].map(generation => ({ generation, total: 2 ** generation, original: generation === 0 ? 1 : 0, hybrid: generation === 0 ? 0 : 2, fresh: generation === 0 ? 0 : 2 ** generation - 2 }))
      const dna: TeachingDiagram = { kind: 'dna', title: '半保留复制的链来源图', caption: '深绿色为最初两条原始链，珊瑚色为新合成链；每个双链符号代表一类分子，乘数表示实际数量。大于 3 轮时省略中间轮次。', generations }
      return [{ kind: 'bases', title: '互补配对：一对碱基，两条链', caption: '下图分别代表 AT 类与 GC 类碱基对，标注的是整条 DNA 的实际对数。', at, gc, bonds: false }, { kind: 'bases', title: '每对碱基贡献多少氢键', caption: `AT 每对 2 个氢键，GC 每对 3 个氢键；总计 ${2 * at + 3 * gc} 个。`, at, gc, bonds: true }, dna, { ...dna, title: '追踪原始链与含原始链的分子', caption: rounds === 0 ? '尚未复制：1 个双链分子含 2 条原始链，没有新链。' : `第 ${rounds} 轮：仍只有 2 条原始链，分处 2 个分子；全部有 ${2 ** rounds} 个分子、${2 ** (rounds + 1)} 条链。`, generations: generations.slice(-1) }]
    }
    case 'division': {
      const stages = r.table!.rows.map(row => ({ label: row[0], chromosomes: Number(row[1]), dna: Number(row[2]), chromatids: Number(row[3]) }))
      const diagram = (title: string, selected: typeof stages): TeachingDiagram => ({ kind: 'chromosomes', title, caption: '每框代表单个完整细胞；按着丝粒计染色体，分离后染色单体记为 0。超过 8 条时仅画 8 条形态示意，以数值为准。', stages: selected })
      return [diagram('复制前：一条染色体对应一个 DNA', [stages[0]]), diagram('S 期后：DNA 加倍，染色体数不变', [stages[0], stages[1]]), diagram('着丝粒分裂：姐妹染色单体成为染色体', v.division === 'meiosis' ? [stages[4], stages[5]] : [stages[1], stages[2]]), diagram('完整细胞中的阶段变化', stages)]
    }
    case 'probability': {
      const p = Number(v.probability) / 100, n = Number(v.births), k = Number(v.affected)
      return [flow('一次事件分成两条概率分支', '每次重复都使用相同的 p；前一次发生与否不会改变下一次概率。', [{ label: `独立重复 ${n} 次`, items: [{ label: '发生', detail: `p=${pct(p)}`, tone: 'accent' }, { label: '不发生', detail: `1−p=${pct(1 - p)}` }] }, { label: '一种指定顺序', items: [{ label: `${k} 次发生`, detail: `p^${k}` }, { label: `${n - k} 次不发生`, detail: `(1−p)^${n - k}` }] }]), flow('安排 k 次发生的位置', `图示前 ${Math.min(n, 12)} 次的位置；${n > 12 ? '后续位置省略。' : ''}这只是一种顺序，需要乘以 C(${n},${k}) 才得到恰好 k 次的概率。`, [{ label: '一种位置排列', items: Array.from({ length: Math.min(n, 12) }, (_, i) => ({ label: `${i + 1}`, detail: i < k ? '发生' : '不发生', tone: i < k ? 'accent' as const : 'muted' as const })) }, { label: '全部排列', items: [{ label: `C(${n},${k}) 种` }] }]), flow('用对立事件计算至少一次', '“至少一次”与“零次”互斥且穷尽所有可能。', [{ label: '全部可能', items: [{ label: '100%' }] }, { label: '减去零次', items: [{ label: metric(r, '一次也没有'), detail: `(1−p)^${n}` }] }, { label: '至少一次', items: [{ label: metric(r, '至少一次'), tone: 'accent' }] }])]
    }
    default: throw new Error(`专题 ${id} 缺少图解`)
  }
}

export function randomMatingDiagram(frequencies: Record<string, number>): CrossDiagram {
  const loci = Object.keys(frequencies).filter(allele => allele.length === 1 && allele === allele.toUpperCase()).sort()
  const gametes = loci.reduce<Pool>((current, allele) => current.flatMap(g => [allele, allele.toLowerCase()].map(a => ({ label: g.label + a, value: g.value * frequencies[a] }))), [{ label: '', value: 1 }])
  return grid('自由交配的加权棋盘格', gametes, gametes, pair, '行列分别表示群体雌雄配子库；每格乘实际配子概率，相同基因型相加。双位点按独立分配且处于连锁平衡的模型计算。')
}
