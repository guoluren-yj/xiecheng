/**
 * DiffViewer - 行级代码差异展示组件
 *
 * 显示两段代码的差异对比，支持统一视图（类似 git diff 风格）。
 * 使用 computeDiff 算法生成差异行，按类型着色：
 *   - add（绿色）: 新增行
 *   - del（红色）: 删除行
 *   - equal（白色）: 未变更行
 *
 * @date: 2026-06-12
 */

import React, { useMemo } from 'react';
import { computeDiff } from '../utils/diffUtils';
import styles from './BotStyles.less';

/**
 * @param {Object} props
 * @param {string} props.oldText - 原始代码
 * @param {string} props.newText - 新代码
 * @param {number} [props.maxLines=200] - 最多显示的差异行数（防止大文件卡死）
 */
function DiffViewer({ oldText = '', newText = '', maxLines = 200 }) {
  // 一次计算 diff，缓存完整结果供摘要统计使用
  const diffResult = useMemo(() => {
    const allDiffs = computeDiff(oldText, newText);
    const adds = allDiffs.filter((d) => d.type === 'add').length;
    const dels = allDiffs.filter((d) => d.type === 'del').length;
    const totals = allDiffs.filter((d) => d.type !== 'equal').length;

    // 截断逻辑
    let displayLines = allDiffs;
    if (allDiffs.length > maxLines) {
      const changes = allDiffs.filter((d) => d.type !== 'equal');
      if (changes.length > 50) {
        // 差异太多，仅显示摘要
        displayLines = [];
      } else {
        displayLines = allDiffs.slice(0, maxLines);
      }
    }

    return { allDiffs, displayLines, adds, dels, totals };
  }, [oldText, newText, maxLines]);

  const { displayLines, adds, dels, totals } = diffResult;

  // 需要显示摘要（差异行过多导致截断，或零差异）
  if (displayLines.length === 0) {
    if (adds === 0 && dels === 0) {
      return (
        <div className={styles['diff-viewer-empty']}>
          <span role="img" aria-label="ok">
            ✅
          </span>{' '}
          代码无变更
        </div>
      );
    }

    return (
      <div className={styles['diff-viewer-summary']}>
        <div className={styles['diff-viewer-summary-title']}>变更过多，仅显示摘要：</div>
        <div className={styles['diff-viewer-summary-stats']}>
          <span className={styles['diff-viewer-add-badge']}>+{adds} 新增</span>
          <span className={styles['diff-viewer-del-badge']}>-{dels} 删除</span>
          <span>{Math.round((totals / (totals + adds + dels || 1)) * 100)}% 行变更</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['diff-viewer']}>
      <table className={styles['diff-viewer-table']}>
        <tbody>
          {displayLines.map((line) => {
            const key = `${line.oldLine || ''}-${line.newLine || ''}-${line.type}`;
            const lineClasses = [
              styles['diff-viewer-line'],
              styles[`diff-viewer-line-${line.type}`],
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr key={key} className={lineClasses}>
                <td className={styles['diff-viewer-line-number-old']}>{line.oldLine || ''}</td>
                <td className={styles['diff-viewer-line-number-new']}>{line.newLine || ''}</td>
                <td className={styles['diff-viewer-line-type']}>
                  {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                </td>
                <td className={styles['diff-viewer-line-content']}>
                  <pre className={styles['diff-viewer-line-pre']}>
                    {line.type === 'add' ? line.newText : line.oldText}
                  </pre>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DiffViewer;
