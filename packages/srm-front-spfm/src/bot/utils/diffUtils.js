/**
 * diffUtils — 行级代码差异计算工具
 *
 * 使用 Myers diff 算法简化版，生成适用于 DiffViewer 的变更列表。
 * 每条变更记录包含：行号、类型（add/del/equal）、旧文本、新文本。
 *
 * @date: 2026-06-12
 */

/**
 * @typedef {Object} DiffLine
 * @property {'add'|'del'|'equal'} type - 变更类型
 * @property {number} [oldLine] - 旧文本行号（1-indexed）
 * @property {number} [newLine] - 新文本行号（1-indexed）
 * @property {string} oldText - 旧文本内容
 * @property {string} newText - 新文本内容
 */

/**
 * 计算两段文本的行级差异
 *
 * @param {string} oldText - 原始文本
 * @param {string} newText - 新文本
 * @returns {DiffLine[]} 差异行列表
 */
export function computeDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // 使用 LCS（最长公共子序列）算法计算最小编辑距离
  const lcs = computeLCS(oldLines, newLines);

  const result = [];
  let oldIdx = 0;
  let newIdx = 0;

  for (const common of lcs) {
    // 旧文本中不在 LCS 中的行 → 删除
    while (oldIdx < common.oldIdx) {
      result.push({
        type: 'del',
        oldLine: oldIdx + 1,
        newLine: null,
        oldText: oldLines[oldIdx],
        newText: '',
      });
      oldIdx++;
    }

    // 新文本中不在 LCS 中的行 → 添加
    while (newIdx < common.newIdx) {
      result.push({
        type: 'add',
        oldLine: null,
        newLine: newIdx + 1,
        oldText: '',
        newText: newLines[newIdx],
      });
      newIdx++;
    }

    // 公共行 → 相等
    result.push({
      type: 'equal',
      oldLine: oldIdx + 1,
      newLine: newIdx + 1,
      oldText: oldLines[oldIdx],
      newText: newLines[newIdx],
    });
    oldIdx++;
    newIdx++;
  }

  // 旧文本中剩余行 → 删除
  while (oldIdx < oldLines.length) {
    result.push({
      type: 'del',
      oldLine: oldIdx + 1,
      newLine: null,
      oldText: oldLines[oldIdx],
      newText: '',
    });
    oldIdx++;
  }

  // 新文本中剩余行 → 添加
  while (newIdx < newLines.length) {
    result.push({
      type: 'add',
      oldLine: null,
      newLine: newIdx + 1,
      oldText: '',
      newText: newLines[newIdx],
    });
    newIdx++;
  }

  return result;
}

/**
 * 计算最长公共子序列（LCS）的索引对
 * 返回 { oldIdx, newIdx }[]，表示两文本中匹配行的位置
 *
 * @param {string[]} a - 旧文本行数组
 * @param {string[]} b - 新文本行数组
 * @returns {Array<{ oldIdx: number, newIdx: number }>}
 */
function computeLCS(a, b) {
  const m = a.length;
  const n = b.length;

  // 构建 DP 表
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯构建 LCS 路径
  const result = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift({ oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/**
 * 生成简单差异摘要文本（用于展示变更概要）
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {string} 如 "+2 -1 / 10 lines"
 */
export function generateDiffSummary(oldText, newText) {
  const diffs = computeDiff(oldText, newText);
  let adds = 0;
  let dels = 0;
  for (const d of diffs) {
    if (d.type === 'add') adds++;
    if (d.type === 'del') dels++;
  }
  const total = diffs.filter((d) => d.type !== 'equal').length;
  if (total === 0) return '无变更';
  return `+${adds} -${dels} / ${total} 处变更`;
}

/**
 * 计算差异统计（包装 computeDiff，返回结构化统计）
 *
 * 用于需要 totalChanges/addedLines/removedLines 的场景（如 modify_script 行级 diff 对齐 TG）。
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {{ totalChanges: number, addedLines: number, removedLines: number, diffs: DiffLine[] }}
 */
export function computeDiffStats(oldText, newText) {
  const diffs = computeDiff(oldText, newText);
  let adds = 0;
  let dels = 0;
  for (const d of diffs) {
    if (d.type === 'add') adds++;
    if (d.type === 'del') dels++;
  }
  return {
    totalChanges: adds + dels,
    addedLines: adds,
    removedLines: dels,
    diffs,
  };
}

/**
 * 生成简化的差异文本（可供 LLM 阅读）
 *
 * 对齐 TG diffUtils.generateSimpleDiff。
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {string} 如 "代码修改摘要：\n• 总变化：5 处\n• 新增行：3\n• 删除行：2"
 */
export function generateSimpleDiff(oldText, newText) {
  const stats = computeDiffStats(oldText, newText);

  if (stats.totalChanges === 0) {
    return '代码没有变化';
  }

  const lines = [];
  lines.push('代码修改摘要：');
  lines.push(`• 总变化：${stats.totalChanges} 处`);
  lines.push(`• 新增行：${stats.addedLines}`);
  lines.push(`• 删除行：${stats.removedLines}`);

  // 显示前 3 个差异块的概要
  const chunks = [];
  let currentChunk = null;
  for (const d of stats.diffs) {
    if (d.type === 'equal') {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = null;
      }
    } else {
      if (!currentChunk) {
        currentChunk = { adds: 0, dels: 0, startOld: d.oldLine, startNew: d.newLine };
      }
      if (d.type === 'add') currentChunk.adds++;
      if (d.type === 'del') currentChunk.dels++;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  lines.push('');
  lines.push('主要变化：');
  for (let i = 0; i < Math.min(3, chunks.length); i++) {
    const c = chunks[i];
    const oldPos = c.startOld ? `行 ${c.startOld}` : '?';
    const newPos = c.startNew ? `行 ${c.startNew}` : '?';
    lines.push(`  块 ${i + 1}（${oldPos} → ${newPos}）：+${c.adds}/-${c.dels}`);
  }
  if (chunks.length > 3) {
    lines.push(`  ... 还有 ${chunks.length - 3} 个差异块`);
  }

  return lines.join('\n');
}

/**
 * 检查代码修改安全性
 *
 * 对齐 TG diffUtils.checkCodeModificationSafety，提供函数/import/结构级变更检测。
 *
 * @param {string} oldCode
 * @param {string} newCode
 * @returns {{ safe: boolean, warnings: string[], changes: { linesChanged: number, functionsChanged: number, importsChanged: boolean, structureChanged: boolean } }}
 */
export function checkCodeModificationSafety(oldCode, newCode) {
  const warnings = [];
  const changes = {
    linesChanged: 0,
    functionsChanged: 0,
    importsChanged: false,
    structureChanged: false,
  };

  const stats = computeDiffStats(oldCode, newCode);
  changes.linesChanged = stats.totalChanges;

  // 提取函数名（对齐 TG extractFunctionNames）
  const extractFunctionNames = (code) => {
    const regex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)|function)|(\w+)\s*[=(]\s*(?:async\s*)?\(/g;
    const names = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      const name = match[1] || match[2] || match[3];
      if (name && !name.startsWith('_') && name !== 'async') {
        names.push(name);
      }
    }
    return names;
  };

  const oldFunctions = extractFunctionNames(oldCode);
  const newFunctions = extractFunctionNames(newCode);
  const addedFunctions = newFunctions.filter((f) => !oldFunctions.includes(f));
  const removedFunctions = oldFunctions.filter((f) => !newFunctions.includes(f));

  changes.functionsChanged = addedFunctions.length + removedFunctions.length;

  if (addedFunctions.length > 0) {
    warnings.push(`新增函数：${addedFunctions.join(', ')}`);
  }
  if (removedFunctions.length > 0) {
    warnings.push(`删除函数：${removedFunctions.join(', ')}`);
  }

  // 检查 import 语句变化
  const extractImports = (code) => {
    const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  };

  const oldImports = extractImports(oldCode);
  const newImports = extractImports(newCode);
  changes.importsChanged = JSON.stringify(oldImports) !== JSON.stringify(newImports);

  if (changes.importsChanged) {
    warnings.push('import 语句有变化');
  }

  // 检查代码结构变化
  const analyzeStructure = (code) => {
    const lines = code.split('\n');
    const funcs = extractFunctionNames(code);
    const imports = extractImports(code);
    const structureString = `${lines.length}:${funcs.length}:${imports.length}`;
    try {
      return btoa(structureString).substring(0, 16);
    } catch {
      return structureString;
    }
  };

  const oldHash = analyzeStructure(oldCode);
  const newHash = analyzeStructure(newCode);
  changes.structureChanged = oldHash !== newHash;

  if (changes.structureChanged) {
    warnings.push('代码结构有较大变化');
  }

  // 安全性评估
  const safe =
    changes.linesChanged < 50 &&
    changes.functionsChanged < 3 &&
    !changes.structureChanged &&
    warnings.length < 5;

  return { safe, warnings, changes };
}

/**
 * diffUtils 统一导出对象（对齐 TG diffUtils 命名空间）
 */
export const diffUtils = {
  computeDiff,
  computeDiffStats,
  generateDiffSummary,
  generateSimpleDiff,
  checkCodeModificationSafety,
};
