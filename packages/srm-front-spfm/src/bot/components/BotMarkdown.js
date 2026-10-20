/**
 * BotMarkdown - 盘古 Bot Markdown 渲染组件（增强版）
 *
 * 两阶段处理：
 *   阶段 ①：正则 `<think>([\s\S]*?)<\/think>` 提取思维块为可折叠区域，默认收起
 *   阶段 ②：剩余内容用 ReactMarkdown 渲染
 *
 * Phase 4 增强：
 *   - 代码语法高亮（react-syntax-highlighter Prism + darcula 主题）
 *   - 代码块右上角复制按钮（navigator.clipboard + fallback）
 *   - 复制状态反馈（2 秒恢复）
 *
 * 说明：remark-gfm 插件不可用（环境中未安装），表格/删除线等 GFM 扩展语法
 * 以基础 Markdown 渲染。如需完整 GFM 支持，请执行 `yarn add remark-gfm` 后
 * 在 import 处恢复 `import remarkGfm from 'remark-gfm'` 并传给 remarkPlugins。
 *
 * @date: 2026-06-15
 */

import React, { useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import intl from 'utils/intl';
import styles from './BotStyles.less';

/**
 * 提取 <think> 思维块
 *
 * @param {string} content - 原始 Markdown 内容
 * @returns {{ thinkBlocks: string[], otherParts: string[] }}
 */
function extractThinkBlocks(content) {
  const blocks = [];
  const parts = [];
  const regex = /<think>([\s\S]*?)<\/think>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 添加 think 块之前的内容
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    blocks.push(match[1].trim());
    lastIndex = match.index + match[0].length;
  }

  // 添加剩余内容
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return { thinkBlocks: blocks, otherParts: parts };
}

/**
 * 复制文本到剪贴板（含 fallback 方案）
 *
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback: 使用 document.execCommand('copy')
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackErr) {
      return false;
    }
  }
}

/**
 * @param {Object} props
 * @param {string} props.content - Markdown 内容
 */
function BotMarkdown({ content = '' }) {
  const [copiedStates, setCopiedStates] = useState({});
  const processed = useMemo(() => {
    if (!content) return { thinkBlocks: [], otherParts: [''] };
    return extractThinkBlocks(content);
  }, [content]);

  const { thinkBlocks, otherParts } = processed;

  const handleCopy = useCallback((code, codeId) => {
    copyToClipboard(code);
    setCopiedStates((prev) => ({ ...prev, [codeId]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [codeId]: false }));
    }, 2000);
  }, []);

  /**
   * 自定义代码块渲染：语法高亮 + 复制按钮
   */
  const codeComponents = useMemo(
    () => ({
      code({ inline, className, children, ...otherProps }) {
        const match = /language-(\w+)/.exec(className || '');
        const codeString = String(children).replace(/\n$/, '');
        const codeId = `code-${match?.[1] || 'text'}-${codeString.substring(0, 20)}`;

        if (!inline && match) {
          // 带语法高亮的代码块
          return (
            <div className={styles['bot-code-block-container']}>
              <div className={styles['bot-code-block-header']}>
                <span className={styles['bot-code-block-lang']}>{match[1]}</span>
                <button
                  type="button"
                  className={styles['bot-code-copy-button']}
                  onClick={() => handleCopy(codeString, codeId)}
                >
                  {copiedStates[codeId]
                    ? intl.get('spfm.bot.markdown.copy.done').d('已复制')
                    : intl.get('spfm.bot.markdown.copy').d('复制')}
                </button>
              </div>
              <SyntaxHighlighter
                style={darcula}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: '0 0 6px 6px' }}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          );
        }

        // 行内代码或未匹配语言的代码块
        return (
          <code {...otherProps} className={className}>
            {children}
          </code>
        );
      },
    }),
    [copiedStates, handleCopy]
  );

  // 没有 think 块，直接渲染 Markdown
  if (thinkBlocks.length === 0) {
    return (
      <div className={styles['bot-markdown-content']}>
        <ReactMarkdown components={codeComponents}>{content}</ReactMarkdown>
      </div>
    );
  }

  // 有 think 块，交错渲染
  const segments = [];
  const maxLen = Math.max(thinkBlocks.length, otherParts.length);

  for (let i = 0; i < maxLen; i++) {
    // 先渲染其他内容
    if (i < otherParts.length && otherParts[i]) {
      segments.push(
        <div key={`part-${i}`} className={styles['bot-markdown-content']}>
          <ReactMarkdown components={codeComponents}>{otherParts[i]}</ReactMarkdown>
        </div>
      );
    }

    // 再渲染 think 块
    if (i < thinkBlocks.length) {
      segments.push(
        <details key={`think-${i}`} className={styles['bot-think-block']}>
          <summary className={styles['bot-think-summary']}>
            <span className={styles['bot-think-icon']} role="img" aria-label="think">
              🧠
            </span>{' '}
            {intl.get('spfm.bot.markdown.think.expand').d('思考过程（点击展开）')}
          </summary>
          <div className={styles['bot-think-content']}>
            <ReactMarkdown components={codeComponents}>{thinkBlocks[i]}</ReactMarkdown>
          </div>
        </details>
      );
    }
  }

  return <div className={styles['bot-markdown-root']}>{segments}</div>;
}

export default BotMarkdown;
