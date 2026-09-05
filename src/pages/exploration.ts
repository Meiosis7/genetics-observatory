export const PATHS = [
  { id: 'all', title: '全部探索', description: '从一个好问题开始' },
  { id: 'offspring', title: '亲本与子代', description: '从亲本出发，预测下一代' },
  { id: 'patterns', title: '特殊遗传', description: '寻找经典比例背后的例外' },
  { id: 'population', title: '群体变化', description: '把时间拉长，观察基因频率' },
  { id: 'molecular', title: 'DNA 与细胞', description: '追踪微观世界里的数量变化' },
]
export const QUESTIONS = [
  { id: 'lethal', path: 'patterns', question: '为什么会出现 2∶1？', hint: '改变致死条件，追踪筛选前后的比例。', mark: '2∶1', action: '观察存活筛选' },
  { id: 'sex', path: 'offspring', question: '同一对父母，儿女的概率为何不同？', hint: '分开看 X、Y 的传递和性别条件概率。', mark: 'X / Y', action: '追踪性染色体' },
  { id: 'blood', path: 'offspring', question: 'A 型和 B 型，能生出哪些血型？', hint: '先区分基因型，再组合双亲的等位基因。', mark: 'Iᴬ Iᴮ i', action: '组合血型' },
  { id: 'pedigree', path: 'offspring', question: '一个家庭，能排除哪些遗传方式？', hint: '保留所有相容模型，练习用证据排除。', mark: '→ ?', action: '开始系谱推理' },
  { id: 'selfing', path: 'population', question: '自交很多代，杂合子会消失吗？', hint: '改变代数和筛选方式，比较每一代。', mark: '½ⁿ', action: '观察世代变化' },
  { id: 'population', path: 'population', question: '看见的比例，就是遗传平衡吗？', hint: '把样本频率与随机交配的理论值对照。', mark: 'p² + 2pq + q²', action: '研究群体频率' },
  { id: 'dna', path: 'molecular', question: '复制后，最初的两条链去了哪里？', hint: '改变复制轮数，区分原始链与原始分子。', mark: '2ⁿ', action: '追踪 DNA 复制' },
  { id: 'division', path: 'molecular', question: 'DNA 加倍，染色体也加倍了吗？', hint: '逐阶段对照染色体、DNA 与染色单体。', mark: '2n → n', action: '进入细胞分裂' },
  { id: 'probability', path: 'offspring', question: '再发生一次，概率会改变吗？', hint: '区分独立事件、恰好 k 次与至少一次。', mark: 'P(X=k)', action: '探索事件概率' },
  { id: 'linkage', path: 'patterns', question: '四种配子，一定等概率吗？', hint: '改变基因相位和重组率，研究连锁交换。', mark: 'AB / ab', action: '调整重组率' },
  { id: 'interaction', path: 'patterns', question: '9∶3∶3∶1，如何变成 9∶7？', hint: '切换显性关系与互作模型，重新归类表现型。', mark: '9∶7', action: '研究基因互作' },
]
