import { generateGametes, parseGenotype, phenotypeKey } from '../genetics/engine'
import type { Report, Values } from './types'

type Pool = { label: string; value: number }[]
const percent = (value: number) => `${Number((value * 100).toFixed(4))}%`
const distribution = (title: string, map: Record<string, number>) => ({ title, rows: Object.entries(map).filter(([, value]) => value > 0).map(([label, value]) => ({ label, value })) })

function numeric(value: string, label: string, max = 100) {
  const number = Number(value)
  if (!value?.trim() || !Number.isFinite(number) || number < 0 || number > max) throw new Error(`${label}须为 0–${max} 之间的数值`)
  return number
}

function combine(a: string, b: string) {
  return [...a].map((letter, i) => [letter, b[i]].sort().join('')).join('')
}

function cross(a: Pool, b: Pool) {
  const result: Record<string, number> = {}
  for (const left of a) for (const right of b) {
    const key = combine(left.label, right.label)
    result[key] = (result[key] ?? 0) + left.value * right.value
  }
  return result
}

function phenotypes(genotypes: Record<string, number>, classify = phenotypeKey) {
  const result: Record<string, number> = {}
  for (const [genotype, value] of Object.entries(genotypes)) {
    const key = classify(genotype)
    result[key] = (result[key] ?? 0) + value
  }
  return result
}

function validateParents(a: string, b: string) {
  const first = parseGenotype(a).map(p => p.symbol).join('')
  const second = parseGenotype(b).map(p => p.symbol).join('')
  if (first !== second) throw new Error('两个亲本须有相同且顺序一致的基因位点')
  if (!['A', 'AB'].includes(first)) throw new Error('本专题请使用 A 位点或 A、B 两个位点，例如 Aa 或 AaBb')
  return first
}

function pool(genotype: string): Pool {
  return generateGametes(genotype).map(g => ({ label: g.label, value: g.probability.numerator / g.probability.denominator }))
}

function selectGametes(initial: Pool, input: string, sex: string) {
  const dead = input.trim() ? input.trim().split(/[,，\s]+/).filter(Boolean) : []
  const length = initial[0].label.length
  const valid = length === 1 ? ['A', 'a'] : ['AB', 'Ab', 'aB', 'ab']
  if (dead.some(g => !valid.includes(g))) throw new Error(`${sex}致死配子格式无效；可填 ${valid.join('、')}，多个用逗号分隔`)
  const survivors = initial.filter(g => !dead.includes(g.label))
  const survival = survivors.reduce((sum, g) => sum + g.value, 0)
  return { survival, pool: survivors.map(g => ({ ...g, value: g.value / survival })) }
}

export function lethalReport(v: Values): Report {
  const loci = validateParents(v.parentA, v.parentB)
  const penetrance = numeric(v.penetrance, '致死率') / 100
  const rules = [v.lethalA, ...(loci === 'AB' ? [v.lethalB] : [])]
  rules.forEach((rule, i) => {
    const symbol = i === 0 ? 'A' : 'B'
    if (!['none', symbol.repeat(2), symbol + symbol.toLowerCase(), symbol.toLowerCase().repeat(2)].includes(rule)) throw new Error(`${symbol} 位点致死基因型无效`)
  })
  const female = selectGametes(pool(v.parentA), v.femaleDead ?? '', '雌')
  const male = selectGametes(pool(v.parentB), v.maleDead ?? '', '雄')
  const metrics: Report['metrics'] = [
    { label: '雌配子存活率', value: percent(female.survival), hint: '占该亲本原始雌配子池' },
    { label: '雄配子存活率', value: percent(male.survival), hint: '占该亲本原始雄配子池' },
  ]
  const notes = ['完全显性、常染色体；双位点默认独立分配。配子致死为完全致死，合子规则可设部分致死率。', '先在雌雄配子池内分别筛选并归一化，再假定剩余配子随机结合。两池存活率的乘积不等于个体生育率。', '合子存活率以已形成的合子为分母；双位点致死规则独立作用。这里的“致死率”不是显性或隐性的命名依据。']
  if (!female.survival || !male.survival) return { summary: '至少一方没有存活配子，无法形成合子。', metrics: [...metrics, { label: '合子存活率', value: '无定义' }], distributions: [], steps: ['删除设定的致死配子。', '一个配子池为空，停止受精与子代比例计算。'], notes }
  const before = cross(female.pool, male.pool)
  const viable: Record<string, number> = {}
  for (const [genotype, probability] of Object.entries(before)) {
    let viability = 1
    rules.forEach((rule, index) => { if (rule !== 'none' && genotype.slice(index * 2, index * 2 + 2) === rule) viability *= 1 - penetrance })
    viable[genotype] = probability * viability
  }
  const survival = Object.values(viable).reduce((sum, value) => sum + value, 0)
  const normalized = survival ? Object.fromEntries(Object.entries(viable).map(([key, value]) => [key, value / survival])) : {}
  const selection = rules.filter(rule => rule !== 'none').join('、') || '无合子致死规则'
  return {
    summary: survival ? `${v.parentA} × ${v.parentB}：受精后合子中 ${percent(survival)} 存活。下方存活子代比例已重新归一化。` : '受精后全部合子死亡，无存活子代；存活后代比例无定义。',
    metrics: [...metrics, { label: '合子存活率', value: percent(survival), hint: '占已受精形成的合子' }, { label: '合子致死率', value: percent(1 - survival) }],
    distributions: [{ title: '存活雌配子 · 池内比例', rows: female.pool }, { title: '存活雄配子 · 池内比例', rows: male.pool }, distribution('受精后 · 致死前基因型', before), distribution('存活子代 · 基因型', normalized), distribution('存活子代 · 表现型', phenotypes(normalized))],
    steps: [`原始雌配子：${pool(v.parentA).map(g => `${g.label} ${percent(g.value)}`).join('，')}；原始雄配子：${pool(v.parentB).map(g => `${g.label} ${percent(g.value)}`).join('，')}。`, '删除致死配子，分别用剩余概率除以各自配子存活率。', '合子概率 = 存活雌配子的池内概率 × 存活雄配子的池内概率。', `合子筛选：${selection}；每条命中规则致死率 ${percent(penetrance)}。`, `合子存活率 = 各基因型“致死前概率 × 存活权重”之和 = ${percent(survival)}。`, survival ? '存活后某基因型比例 = 该基因型存活概率 ÷ 合子存活率。' : '分母为 0，不进行归一化。'], notes,
    table: { headers: ['基因型', '致死前', '存活贡献（未归一化）', '存活后'], rows: Object.entries(before).map(([key, value]) => [key, percent(value), percent(viable[key]), survival ? percent(normalized[key]) : '无定义']) },
  }
}

function linkedPool(phase: string, rate: number): Pool {
  if (!/^[Aa][Bb]\/[Aa][Bb]$/.test(phase)) throw new Error('染色体相位请写成 AB/ab 或 Ab/aB 等形式')
  const [a, b] = phase.split('/')
  const weighted = [{ label: a, value: (1 - rate) / 2 }, { label: b, value: (1 - rate) / 2 }, { label: a[0] + b[1], value: rate / 2 }, { label: b[0] + a[1], value: rate / 2 }]
  const values: Record<string, number> = {}
  weighted.forEach(g => { values[g.label] = (values[g.label] ?? 0) + g.value })
  return ['AB', 'Ab', 'aB', 'ab'].filter(label => values[label] > 0).map(label => ({ label, value: values[label] }))
}

export function linkageReport(v: Values): Report {
  const rateA = numeric(v.rA, '雌方重组率', 50) / 100
  const rateB = numeric(v.rB, '雄方重组率', 50) / 100
  const a = linkedPool(v.phaseA, rateA)
  const b = linkedPool(v.phaseB, rateB)
  const offspring = cross(a, b)
  return {
    summary: `${v.phaseA} × ${v.phaseB}，按各配子的实际权重计算子代，不按棋盘格数量计数。`,
    metrics: [{ label: '雌方重组率', value: percent(rateA) }, { label: '雄方重组率', value: percent(rateB) }, { label: '子代基因型', value: `${Object.keys(offspring).length} 种` }],
    distributions: [{ title: '雌配子比例', rows: a }, { title: '雄配子比例', rows: b }, distribution('子代基因型', offspring), distribution('子代表现型', phenotypes(offspring))],
    steps: ['斜线分隔两条同源染色体，例如 AB/ab 为相引，Ab/aB 为相斥。', '双杂合子两类亲本型配子各为 (1 − r)/2，两类重组型各为 r/2；同名配子合并。', '将雌雄配子的概率相乘，再按相同子代基因型求和。'],
    notes: ['拓展模型：两个常染色体位点、完全显性、不含致死及染色体异常。雌雄可设置不同重组率。', 'r 限于 0–50%。r=50% 时两位点的配子比例表现为独立分配，但不能据此判定它们一定在不同染色体上。', '本工具使用重组率，不将其直接等同于长距离遗传图距。'],
  }
}

const interactionRules: Record<string, { groups: string[]; note: string }> = {
  mendel: { groups: ['双显性', 'A 显性、bb', 'aa、B 显性', '双隐性'], note: 'A_B_ : A_bb : aaB_ : aabb = 9:3:3:1' },
  complementary: { groups: ['两种显性基因同时存在', '缺少至少一种显性基因', '缺少至少一种显性基因', '缺少至少一种显性基因'], note: '互补作用：A_B_ : 其余 = 9:7' },
  duplicate: { groups: ['至少一种显性基因', '至少一种显性基因', '至少一种显性基因', '双隐性'], note: '重叠显性：前三组 : aabb = 15:1' },
  recessive: { groups: ['表型一', '表型二', '隐性上位表型', '隐性上位表型'], note: '隐性上位：A_B_ : A_bb : aa__ = 9:3:4' },
  dominant: { groups: ['显性上位表型', '显性上位表型', '表型二', '表型三'], note: '显性上位：A___ : aaB_ : aabb = 12:3:1' },
  suppressor: { groups: ['受抑制或无产物', '受抑制或无产物', '未受抑制且有产物', '受抑制或无产物'], note: '显性抑制：A___ 与 aabb : aaB_ = 13:3' },
  additive: { groups: ['双显性效应', '单显性效应', '单显性效应', '无显性效应'], note: '累加效应：A_B_ : A_bb 与 aaB_ : aabb = 9:6:1' },
}

export function interactionReport(v: Values): Report {
  const loci = validateParents(v.parentA, v.parentB)
  const single = ['incomplete', 'codominance'].includes(v.model)
  if ((single && loci !== 'A') || (!single && loci !== 'AB')) throw new Error(single ? '此模型请填写单基因亲本，如 Aa' : '此模型请填写双基因亲本，如 AaBb')
  if (!single && !interactionRules[v.model]) throw new Error('请选择有效的表现型模型')
  const genotypes = cross(pool(v.parentA), pool(v.parentB))
  const rule = interactionRules[v.model]
  const classify = (g: string) => {
    if (single) return g === 'AA' ? 'AA · 纯合表型一' : g === 'aa' ? 'aa · 纯合表型二' : v.model === 'incomplete' ? 'Aa · 中间表型' : 'Aa · 两种性状共同表达'
    const key = phenotypeKey(g)
    return rule.groups[['A_B_', 'A_bb', 'aaB_', 'aabb'].indexOf(key)]
  }
  const actualPhenotypes = phenotypes(genotypes, classify)
  const actualSummary = Object.entries(actualPhenotypes)
    .map(([label, probability]) => `${label} ${percent(probability)}`)
    .join('；')
  return {
    summary: `${v.parentA} × ${v.parentB}：实际表现型概率为 ${actualSummary}。`,
    metrics: [{ label: '子代基因型', value: `${Object.keys(genotypes).length} 种` }, { label: '表现型', value: `${Object.keys(actualPhenotypes).length} 类` }],
    distributions: [distribution('基因型分布', genotypes), distribution('表现型分布', actualPhenotypes)],
    steps: ['先按亲本产生的配子计算基因型概率。', single ? 'AA、Aa、aa 对应三种不同表型；不完全显性是中间表型，共显性是两种性状共同表达。' : `按模型合并表现型；AaBb × AaBb 示例比例：${rule.note}。`, '特殊表现型比例源于基因型到表型的映射变化，并不意味着分离规律失效。'],
    notes: ['比例示例只适用于相应杂合子自交；更换亲本后请以实际分布为准。', '双基因模型默认独立分配、无致死、完全外显；这是指定互作机制的教学模型，不从比例单独确定分子机制。'],
  }
}
