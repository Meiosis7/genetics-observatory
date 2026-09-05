import { interactionReport, lethalReport, linkageReport } from './crossing'
import { divisionReport, dnaReport, populationReport, probabilityReport, selfingReport } from './curriculum'
import { bloodReport, pedigreeReport, sexLinkedReport } from './inheritance'
import { buildDiagrams } from './diagrams'
import type { Field, Topic } from './types'

const options = (items: string[]) => items.map(value => ({ value, label: value }))
const parents: Field[] = [
  { key: 'parentA', label: '亲本 P₁', hint: '致死专题中作为雌方；可输入 Aa 或 AaBb。' },
  { key: 'parentB', label: '亲本 P₂', hint: '致死专题中作为雄方；位点须与 P₁ 一致。' },
]
const health = [{ value: 'healthy', label: '不表现该性状' }, { value: 'affected', label: '表现该性状' }]

const topicDefinitions: Topic[] = [
  {
    id: 'lethal', title: '致死与存活筛选', tag: '遗传规律',
    intro: '从配子到合子，分清在哪一步致死、用谁作分母。',
    calculate: lethalReport,
    defaults: { parentA: 'Aa', parentB: 'Aa', femaleDead: '', maleDead: '', lethalA: 'AA', lethalB: 'none', penetrance: '100' },
    fields: [...parents,
      { key: 'femaleDead', label: '雌方致死配子', hint: '留空表示无；单基因填 A、a，双基因填 AB、Ab、aB、ab；多个用逗号分隔。' },
      { key: 'maleDead', label: '雄方致死配子', hint: '完整配子类型，例如 a 或 ab；不会自动作用于另一性别。' },
      { key: 'lethalA', label: 'A 位点合子致死', options: [{ value: 'none', label: '无' }, ...options(['AA', 'Aa', 'aa'])] },
      { key: 'lethalB', label: 'B 位点合子致死', options: [{ value: 'none', label: '无' }, ...options(['BB', 'Bb', 'bb'])], when: v => v.parentA.length > 2 },
      { key: 'penetrance', label: '命中规则的合子致死率（%）', type: 'number', min: 0, max: 100, step: 1, hint: '100 为完全致死；多条规则独立作用。' },
    ],
    examples: [
      { label: 'AA 致死 · 2∶1', values: { parentA: 'Aa', parentB: 'Aa', femaleDead: '', maleDead: '', lethalA: 'AA', lethalB: 'none', penetrance: '100' } },
      { label: '雄 a 配子致死', values: { parentA: 'Aa', parentB: 'Aa', femaleDead: '', maleDead: 'a', lethalA: 'none', lethalB: 'none', penetrance: '100' } },
      { label: '双位点致死', values: { parentA: 'AaBb', parentB: 'AaBb', femaleDead: '', maleDead: '', lethalA: 'AA', lethalB: 'bb', penetrance: '100' } },
    ],
  },
  {
    id: 'sex', title: '伴性遗传', tag: '遗传规律', intro: '把“全部子代中的比例”和“儿子或女儿中的比例”分开观察。',
    calculate: sexLinkedReport, defaults: { model: 'xr', mother: 'Aa', father: 'A' },
    fields: [
      { key: 'model', label: '遗传模型', options: [{ value: 'xr', label: '伴 X 隐性 · a 为致病等位基因' }, { value: 'xd', label: '伴 X 显性 · A 为致病等位基因' }, { value: 'y', label: '伴 Y 遗传' }] },
      { key: 'mother', label: '母方 X 基因型', options: [{ value: 'AA', label: 'XᴬXᴬ' }, { value: 'Aa', label: 'XᴬXᵃ' }, { value: 'aa', label: 'XᵃXᵃ' }], when: v => v.model !== 'y' },
      { key: 'father', label: '父方 X 基因型', options: [{ value: 'A', label: 'XᴬY' }, { value: 'a', label: 'XᵃY' }], when: v => v.model !== 'y' },
      { key: 'father', label: '父方 Y 连锁性状', options: [{ value: 'A', label: '不表现' }, { value: 'a', label: '表现' }], when: v => v.model === 'y' },
    ],
  },
  {
    id: 'blood', title: 'ABO 血型', tag: '复等位基因', intro: '同一种血型可能有不同基因型。先选基因型，再看后代血型。',
    calculate: bloodReport, defaults: { mother: 'AO', father: 'BO' },
    fields: ['mother', 'father'].map((key, i) => ({ key, label: i ? '父方基因型' : '母方基因型', options: [{ value: 'AA', label: 'IᴬIᴬ · A 型' }, { value: 'AO', label: 'Iᴬi · A 型' }, { value: 'BB', label: 'IᴮIᴮ · B 型' }, { value: 'BO', label: 'Iᴮi · B 型' }, { value: 'AB', label: 'IᴬIᴮ · AB 型' }, { value: 'OO', label: 'ii · O 型' }] })),
  },
  {
    id: 'pedigree', title: '系谱模型排除', tag: '推理训练', intro: '用父母与一个子代的表型排除不可能的模型；保留所有符合条件的解释。',
    calculate: pedigreeReport, defaults: { mother: 'healthy', father: 'healthy', childSex: 'female', child: 'affected' },
    fields: [
      { key: 'mother', label: '母亲表型', options: health }, { key: 'father', label: '父亲表型', options: health },
      { key: 'childSex', label: '子代性别', options: [{ value: 'female', label: '女儿' }, { value: 'male', label: '儿子' }] },
      { key: 'child', label: '子代表型', options: health },
    ],
  },
  {
    id: 'selfing', title: '连续自交与筛选', tag: '世代变化', intro: '从 Aa 出发，逐代比较不筛选与每代只保留显性个体的结果。',
    calculate: selfingReport, defaults: { generations: '3', selection: 'none' },
    fields: [
      { key: 'generations', label: '连续自交代数', type: 'number', min: 0, max: 20, step: 1, hint: '第 0 代为 Aa；最多展示 20 代。' },
      { key: 'selection', label: '每代筛选方式', options: [{ value: 'none', label: '不筛选 · 保留全部子代' }, { value: 'dominant', label: '每代去除 aa · 保留显性个体' }] },
    ],
  },
  {
    id: 'population', title: '基因频率与平衡', tag: '群体遗传', intro: '由实际数量求等位基因频率，再与理想随机交配的理论分布对照。',
    calculate: populationReport, defaults: { AA: '36', Aa: '48', aa: '16' },
    fields: ['AA', 'Aa', 'aa'].map(key => ({ key, label: `${key} 个体数`, type: 'number', min: 0, max: 1e9, step: 1 })),
  },
  {
    id: 'dna', title: 'DNA 与半保留复制', tag: '分子遗传', intro: '一起计算碱基数、氢键数和复制后含原始链的 DNA 分子比例。',
    calculate: dnaReport, defaults: { pairs: '1000', gc: '40', rounds: '3' },
    fields: [
      { key: 'pairs', label: '双链 DNA 的碱基对数', type: 'number', min: 1, max: 1000000, step: 1 },
      { key: 'gc', label: 'G＋C 占全部碱基（%）', type: 'number', min: 0, max: 100, step: .1, hint: '需能对应整数个 GC 碱基对。' },
      { key: 'rounds', label: '复制轮数', type: 'number', min: 0, max: 30, step: 1 },
    ],
  },
  {
    id: 'division', title: '细胞分裂数量', tag: '染色体与 DNA', intro: '以一个完整细胞为单位，对比各时期染色体、DNA 与染色单体数。',
    calculate: divisionReport, defaults: { diploid: '46', division: 'meiosis' },
    fields: [
      { key: 'diploid', label: '体细胞染色体数（2n）', type: 'number', min: 2, max: 200, step: 2, hint: '输入偶数；例如豌豆 14，人类 46。' },
      { key: 'division', label: '分裂方式', options: [{ value: 'meiosis', label: '减数分裂' }, { value: 'mitosis', label: '有丝分裂' }] },
    ],
  },
  {
    id: 'probability', title: '子代事件概率', tag: '概率计算', intro: '每次独立遗传事件中，恰好出现几次？至少一次又是多少？',
    calculate: probabilityReport, defaults: { probability: '25', births: '2', affected: '1' },
    fields: [
      { key: 'probability', label: '单次目标事件概率（%）', type: 'number', min: 0, max: 100, step: .1, hint: '输入已由遗传模型算出的概率；如某基因型出现 25%。' },
      { key: 'births', label: '独立事件次数 n', type: 'number', min: 1, max: 50, step: 1 },
      { key: 'affected', label: '恰好出现次数 k', type: 'number', min: 0, max: 50, step: 1 },
    ],
  },
  {
    id: 'linkage', title: '连锁与交换', tag: '拓展', intro: '明确两条同源染色体上的基因排列，用重组率计算不等概率配子。',
    calculate: linkageReport, defaults: { phaseA: 'AB/ab', phaseB: 'ab/ab', rA: '20', rB: '0' },
    fields: [
      { key: 'phaseA', label: '雌方染色体相位', hint: '例如 AB/ab（相引）或 Ab/aB（相斥）。' },
      { key: 'phaseB', label: '雄方染色体相位', hint: '例如 ab/ab 为测交亲本。' },
      { key: 'rA', label: '雌方重组率（%）', type: 'number', min: 0, max: 50, step: .1 },
      { key: 'rB', label: '雄方重组率（%）', type: 'number', min: 0, max: 50, step: .1 },
    ],
  },
  {
    id: 'interaction', title: '显性关系与基因互作', tag: '拓展', intro: '先计算基因型，再按表型规则合并，追踪特殊分离比的来源。',
    calculate: interactionReport, defaults: { parentA: 'AaBb', parentB: 'AaBb', model: 'complementary' },
    fields: [
      { key: 'model', label: '表现型模型', options: [
        { value: 'incomplete', label: '不完全显性 · 1∶2∶1' }, { value: 'codominance', label: '共显性 · 1∶2∶1' },
        { value: 'mendel', label: '独立双因子 · 9∶3∶3∶1' }, { value: 'complementary', label: '互补作用 · 9∶7' },
        { value: 'duplicate', label: '重叠显性 · 15∶1' }, { value: 'recessive', label: '隐性上位 · 9∶3∶4' },
        { value: 'dominant', label: '显性上位 · 12∶3∶1' }, { value: 'suppressor', label: '显性抑制 · 13∶3' }, { value: 'additive', label: '累加效应 · 9∶6∶1' },
      ] },
      ...parents.map(field => ({ ...field, hint: '单基因模型用 Aa；双基因模型用 AaBb。' })),
    ],
  },
]

export const TOPICS: Topic[] = topicDefinitions.map(topic => ({ ...topic, calculate: values => { const report = topic.calculate(values); return { ...report, diagrams: buildDiagrams(topic.id, values, report) } } }))
