import type { Report, Values } from './types'
const pct = (x: number) => `${Number((x * 100).toFixed(4))}%`
function allowed(value: string, choices: string[], name: string) {
  if (!choices.includes(value)) throw new Error(`${name} 选项无效`)
  return value
}
const canonical = (s: string) => s.split('').sort().join('')
const rows = (m: Map<string, number>) =>
  Array.from(m, ([label, value]) => ({ label, value }))
export function sexLinkedReport(v: Values): Report {
  const model = allowed(v.model, ['xr', 'xd', 'y'], '遗传模型'),
    father = allowed(v.father, ['A', 'a'], '父亲基因型'),
    dist = new Map<string, number>()
  let daughters = 0,
    sons = 0
  if (model === 'y') {
    sons = father === 'a' ? 1 : 0
    dist.set('女儿：不表现 Y 连锁性状', 0.5)
    dist.set(`儿子：${sons ? '表现' : '不表现'} Y 连锁性状`, 0.5)
  } else {
    const mother = allowed(v.mother, ['AA', 'Aa', 'aa'], '母亲基因型')
    for (const a of mother) {
      const female = canonical(a + father),
        fd = model === 'xr' ? female === 'aa' : female.includes('A'),
        sd = model === 'xr' ? a === 'a' : a === 'A'
      daughters += Number(fd) / 2
      sons += Number(sd) / 2
      for (const [label] of [
        [
          `女儿 X${female[0]}X${female[1]}：${fd ? '患病' : model === 'xr' && female === 'Aa' ? '正常携带者' : '正常'}`,
        ],
        [`儿子 X${a}Y：${sd ? '患病' : '正常'}`],
      ])
        dist.set(label, (dist.get(label) ?? 0) + 0.25)
    }
  }
  const riskLabel = model === 'y' ? '性状表现概率' : '患病概率'
  return {
    summary: `${model === 'xr' ? 'X 连锁隐性' : model === 'xd' ? 'X 连锁显性' : 'Y 连锁'}遗传，男女出生概率各 1/2。`,
    metrics: [
      { label: `全部孩子${riskLabel}`, value: pct((daughters + sons) / 2) },
      { label: `女儿中${riskLabel}`, value: pct(daughters) },
      { label: `儿子中${riskLabel}`, value: pct(sons) },
    ],
    distributions: [{ title: '全部孩子的基因型／性状分布', rows: rows(dist) }],
    steps:
      model === 'y'
        ? [
            '父亲的 Y 只传给儿子，所有儿子继承，女儿不继承。',
            '全部孩子表现概率=1/2×儿子中表现概率。',
          ]
        : [
            '女儿获得父亲的 X 和母亲随机一个 X；儿子获得父亲的 Y 和母亲随机一个 X。',
            model === 'xr'
              ? 'a 为致病等位基因：aa 女儿、a 儿子患病；Aa 女儿为正常携带者。'
              : 'A 为致病等位基因：含 A 的女儿与 A 儿子患病，不使用“正常携带者”标签。',
            '总体患病概率=(女儿中患病概率+儿子中患病概率)/2。',
          ],
    notes: ['假设完全外显、无新突变、无致死效应，仅用于遗传学教学。'],
  }
}
export function bloodReport(v: Values): Report {
  const options = ['AA', 'AO', 'BB', 'BO', 'AB', 'OO'],
    m = allowed(v.mother, options, '母亲基因型'),
    f = allowed(v.father, options, '父亲基因型'),
    gen = new Map<string, number>(),
    phen = new Map([
      ['A', 0],
      ['B', 0],
      ['AB', 0],
      ['O', 0],
    ])
  for (const a of m)
    for (const b of f) {
      const g = canonical(a + b)
      gen.set(g, (gen.get(g) ?? 0) + 0.25)
      const p =
        g === 'AB' ? 'AB' : g.includes('A') ? 'A' : g.includes('B') ? 'B' : 'O'
      phen.set(p, phen.get(p)! + 0.25)
    }
  return {
    summary: `${m} × ${f} 的 ABO 血型遗传。`,
    metrics: [
      {
        label: '可能血型',
        value: rows(phen)
          .filter((x) => x.value > 0)
          .map((x) => x.label)
          .join('、'),
      },
    ],
    distributions: [
      { title: '基因型分布', rows: rows(gen) },
      { title: '血型表现型分布', rows: rows(phen) },
    ],
    steps: [
      'A、B、O 分别表示 Iᴬ、Iᴮ、i；Iᴬ 与 Iᴮ 共显性，i 为隐性。',
      '每位亲本随机提供一个等位基因，将 2×2 种配子组合各按 1/4 累加。',
      'AA/AO→A 型，BB/BO→B 型，AB→AB 型，OO→O 型。',
    ],
    notes: [
      '表现型 A 可能为 AA 或 AO，因此输入必须选择基因型。',
      '仅讨论经典 ABO 模型，不考虑罕见变异，不能用于法医亲子鉴定。',
    ],
  }
}
type Model = 'AR' | 'AD' | 'XR' | 'XD' | 'Y'
function affected(model: Model, g: string, sex: string) {
  if (model === 'Y') return sex === 'male' && g === 'a'
  return model === 'AR' || model === 'XR'
    ? g.split('').every((x) => x === 'a')
    : g.includes('A')
}
export function pedigreeReport(v: Values): Report {
  const mother = allowed(v.mother, ['healthy', 'affected'], '母亲表现型'),
    father = allowed(v.father, ['healthy', 'affected'], '父亲表现型'),
    sex = allowed(v.childSex, ['female', 'male'], '子女性别'),
    child = allowed(v.child, ['healthy', 'affected'], '子代表现型'),
    result: string[][] = []
  for (const model of ['AR', 'AD', 'XR', 'XD', 'Y'] as Model[]) {
    const mg = model === 'Y' ? ['AA'] : ['AA', 'Aa', 'aa'],
      fg =
        model === 'XR' || model === 'XD' || model === 'Y'
          ? ['A', 'a']
          : ['AA', 'Aa', 'aa']
    const feasible: string[] = []
    for (const m of mg)
      for (const f of fg) {
        if (
          affected(model, m, 'female') !== (mother === 'affected') ||
          affected(model, f, 'male') !== (father === 'affected')
        )
          continue
        const children =
          model === 'Y'
            ? [sex === 'male' ? f : 'AA']
            : model === 'XR' || model === 'XD'
              ? sex === 'male'
                ? m.split('')
                : m.split('').map((a) => canonical(a + f))
              : m
                  .split('')
                  .flatMap((a) => f.split('').map((b) => canonical(a + b)))
        if (
          children.some(
            (g) => affected(model, g, sex) === (child === 'affected'),
          )
        )
          feasible.push(`${m} × ${f}`)
      }
    if (feasible.length) result.push([model, feasible.join('；')])
  }
  return {
    summary: result.length
      ? `在限定假设下，${result.length} 种模型仍与该家庭相容。`
      : '在限定假设下没有相容模型。',
    metrics: [{ label: '候选模型数', value: String(result.length) }],
    distributions: [],
    table: { headers: ['候选模型', '可行母亲 × 父亲基因型'], rows: result },
    steps: [
      'AR=常染色体隐性；AD=常染色体显性；XR=X 连锁隐性；XD=X 连锁显性；Y=Y 连锁。',
      '对每个模型枚举与双亲表现型相容的所有基因型。',
      '逐个配对检查：是否能够以非零概率产生指定性别及表现型的孩子；只要存在一组则保留。',
    ],
    notes: [
      '只分析一个核心家庭，假设完全外显、无突变、无表型模拟。',
      '候选模型之间没有分配概率；相容不代表确诊，也不是完整多代系谱分析。',
      'AR/XR 中 a 为致病等位基因；AD/XD 中 A 为致病等位基因；Y 中 a 表示致病 Y。',
    ],
  }
}
