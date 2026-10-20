/**
 * scriptSafety — 脚本 AST 安全分析
 *
 * 对 MarmotScript 做静态分析，检测高风险 module 引用和语法错误。
 *
 * 高风险模块（MarmotScript 高阶桥接 API，发消息/改数据/调 HTTP）：
 *   - marmot/v1/message-client — 消息发送
 *   - marmot/v1/file-client — 文件操作
 *   - marmot/v1/flow — 工作流启动
 *   - marmot/v1/http-client — HTTP 请求
 *   - marmot/v1/db-client — 数据库直连
 *
 * 实现策略：当前使用正则表达式做基础分析。
 * 🏗️ 后续可引入 espree（ECMAScript 解析器）做完整 AST 分析，
 * 以精确区分注释/字符串中的 require 提及 vs 真实调用。
 *
 * 移植自 TG scriptSafety.ts（269 行），当前为简化版（正则 + 行级分析）。
 *
 * @date: 2026-06-15
 */

/** 高风险模块列表 */
const HIGH_RISK_MODULES = Object.freeze([
  { path: 'marmot/v1/message-client', label: '消息发送', risk: 'notify' },
  { path: 'marmot/v1/file-client', label: '文件操作', risk: 'file' },
  { path: 'marmot/v1/flow', label: '工作流启动', risk: 'flow' },
  { path: 'marmot/v1/http-client', label: 'HTTP 请求', risk: 'network' },
  { path: 'marmot/v1/db-client', label: '数据库直连', risk: 'write' },
]);

/** 禁用的模块（阻止执行） */
const BLOCKED_MODULES = Object.freeze(['marmot/v1/shell-client', 'marmot/v1/process-client']);

/**
 * 分析脚本安全性
 *
 * @param {string} sourceCode - 脚本源码
 * @returns {{ passed: boolean, safe: boolean, warnings: string[], riskLevel: string, highRiskModules: Array<{ module: string, label: string, line: number }> }}
 */
function analyzeScriptSafety(sourceCode) {
  const warnings = [];
  const highRiskModules = [];
  const lines = sourceCode.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // 跳过注释行和空行（if-else 替代 continue）
    if (
      trimmed &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('/*')
    ) {
      // 检查 require 语句
      const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (requireMatch) {
        const modulePath = requireMatch[1];

        // 检查禁用模块
        for (const blocked of BLOCKED_MODULES) {
          if (modulePath.includes(blocked)) {
            warnings.push(`第 ${lineNum} 行: 引用了禁用模块 "${modulePath}"`);
          }
        }

        // 检查高风险模块
        for (const risk of HIGH_RISK_MODULES) {
          if (modulePath.includes(risk.path)) {
            highRiskModules.push({
              module: modulePath,
              label: risk.label,
              line: lineNum,
              risk: risk.risk,
            });
          }
        }
      }

      // 检查 eval 使用
      if (/\beval\s*\(/.test(line)) {
        warnings.push(`第 ${lineNum} 行: 使用了 eval，可能存在安全风险`);
      }
    }
  }

  // 综合评级（与 TG analyzeScriptSafety 行为一致）
  const detailsCount = highRiskModules.length;
  const riskLevel = detailsCount >= 3 ? 'high' : detailsCount > 0 ? 'medium' : 'low';

  return {
    passed: highRiskModules.length === 0 && warnings.length === 0,
    safe: riskLevel === 'low',
    warnings,
    riskLevel,
    highRiskModules,
  };
}

/**
 * 基本语法检查（正则级别，非完整 AST）
 *
 * @param {string} sourceCode
 * @returns {{ passed: boolean, errors: Array<{ line: number, column: number, message: string }> }}
 */
function checkSyntaxBasic(sourceCode) {
  const errors = [];

  // 检查括号匹配
  let parenCount = 0;
  let braceCount = 0;
  let bracketCount = 0;

  for (let i = 0; i < sourceCode.length; i++) {
    const ch = sourceCode[i];
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
  }

  if (parenCount !== 0) {
    errors.push({
      line: 1,
      column: 1,
      message: `括号不匹配: 缺少 ${Math.abs(parenCount)} 个 ${parenCount > 0 ? ')' : '('}`,
    });
  }
  if (braceCount !== 0) {
    errors.push({
      line: 1,
      column: 1,
      message: `大括号不匹配: 缺少 ${Math.abs(braceCount)} 个 ${braceCount > 0 ? '}' : '{'}`,
    });
  }
  if (bracketCount !== 0) {
    errors.push({
      line: 1,
      column: 1,
      message: `中括号不匹配: 缺少 ${Math.abs(bracketCount)} 个 ${bracketCount > 0 ? ']' : '['}`,
    });
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

/**
 * 前端 AST 预检 — 使用 espree 做完整语法解析
 *
 * 两阶段语法检查的第一阶段：在调用后端语法检查之前先用 espree 做 AST 级预检。
 * espree 的错误消息包含行号/列号和具体 token 信息，比后端 generic 错误更详细。
 *
 * 如果 espree 不可用（如依赖未安装），透明降级到 checkSyntaxBasic（括号匹配检查）。
 *
 * @param {string} sourceCode - 脚本源码
 * @returns {Promise<{ passed: boolean, errors: Array<{ line: number, column: number, message: string }> }>}
 */
async function checkSyntaxByEspree(sourceCode) {
  if (!sourceCode || sourceCode.trim().length === 0) {
    return { passed: true, errors: [] };
  }

  let espreeModule;
  try {
    // 动态加载 espree（可能为 transitive dep，不能静态 import）
    espreeModule = await import('espree');
  } catch {
    // espree 不可用，降级到基础语法检查
    return checkSyntaxBasic(sourceCode);
  }

  try {
    espreeModule.parse(sourceCode, {
      ecmaVersion: 2020,
      sourceType: 'module',
      loc: true,
    });
    return { passed: true, errors: [] };
  } catch (parseError) {
    return {
      passed: false,
      errors: [
        {
          line: parseError.lineNumber || 1,
          column: parseError.column || 1,
          message: parseError.message || '语法错误',
        },
      ],
    };
  }
}

/**
 * 检测脚本是否有 selfTest 方法
 *
 * 使用正则类定义检测（与 TG hasSelfTestMethod 行为一致）：
 * - class App { selfTest() { ... } }
 * - export default class App { ... }
 *
 * 🏗️ 后续引入 espree AST 后，改为 AST 节点精确匹配，避免注释中的 false positive。
 *
 * @param {string} sourceCode
 * @returns {boolean}
 */
function hasSelfTestMethod(sourceCode) {
  // 从注释中移除后再检查
  const codeWithoutComments = sourceCode
    .replace(/\/\/.*$/gm, '') // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行注释

  // class App { ... selfTest() { ... } }
  const classAppMatch = codeWithoutComments.match(/class\s+App\s*\{[\s\S]*?\}/);
  if (!classAppMatch) return false;

  const classBody = classAppMatch[0];
  return /\bselfTest\s*\(/.test(classBody);
}

export { analyzeScriptSafety, checkSyntaxBasic, checkSyntaxByEspree, hasSelfTestMethod };
