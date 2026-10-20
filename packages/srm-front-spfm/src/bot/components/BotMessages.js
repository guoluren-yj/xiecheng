/**
 * BotMessages - 盘古 Bot 消息列表组件
 *
 * Phase 3 增强：
 *   - 用 BotMarkdown 替换基础 ReactMarkdown（支持 think 块折叠）
 *   - 工具调用状态指示器（执行中/成功/失败）
 *   - tool 消息精简展示（C5 UI 过滤）
 *   - 工作区显示当前活跃的工具调用
 *
 * Phase 4 增强：
 *   - 打字指示器动画（TypingIndicator）
 *   - 消息气泡样式优化
 *
 * @date: 2026-06-15
 */

import React from 'react';
import intl from 'utils/intl';
import { getToolDisplayName } from '../utils/toolDisplayUtils';
import BotMarkdown from './BotMarkdown';
import styles from './BotStyles.less';

/**
 * 打字指示器组件（Phase 4 新增）
 *
 * 三个跳动圆点，模拟 AI 正在输入的效果。
 */
function TypingIndicator() {
  return (
    <span className={styles['bot-typing-indicator']}>
      <span className={styles['bot-typing-dot']} />
      <span className={styles['bot-typing-dot']} />
      <span className={styles['bot-typing-dot']} />
    </span>
  );
}

/**
 * 工具调用状态徽章组件
 *
 * @param {Object} props
 * @param {'executing'|'success'|'error'} props.status
 * @param {string} props.toolName - 工具显示名
 */
function ToolStatusBadge({ status, toolName }) {
  if (status === 'executing') {
    return (
      <span className={styles['bot-tool-status-executing']}>
        <span className={styles['bot-tool-status-spinner']} />
        {intl.get('spfm.bot.tool.status.executing').d(`正在使用 ${toolName}...`)}
      </span>
    );
  }

  if (status === 'success') {
    return (
      <span className={styles['bot-tool-status-success']}>
        <span role="img" aria-label="success">
          ✅
        </span>{' '}
        {intl.get('spfm.bot.tool.status.success').d(`${toolName} 完成`)}
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className={styles['bot-tool-status-error']}>
        <span role="img" aria-label="error">
          ❌
        </span>{' '}
        {intl.get('spfm.bot.tool.status.error').d(`${toolName} 失败`)}
      </span>
    );
  }

  return null;
}

/**
 * @param {Object} props
 * @param {import('../types').ChatMessage[]} props.messages - 消息列表
 * @param {boolean} props.isProcessing - 是否正在处理
 * @param {Object<string, 'executing'|'success'|'error'>} [props.activeToolCalls] - 工具调用状态映射 { toolName: 'executing' }
 * @param {string[]} [props.completedToolCalls] - 已完成工具列表
 */
function BotMessages({ messages, isProcessing, activeToolCalls = {}, completedToolCalls = [] }) {
  if (!messages || messages.length === 0) {
    return (
      <div className={styles['bot-messages']}>
        <div className={styles['bot-messages-empty']}>
          <div className={styles['bot-messages-empty-icon']}>
            <span role="img" aria-label="bot">
              🤖
            </span>
          </div>
          <div className={styles['bot-messages-empty-text']}>
            {intl.get('spfm.bot.view.message.empty').d('Bot 已就绪')}
          </div>
          <div className={styles['bot-messages-empty-hint']}>
            {intl
              .get('spfm.bot.view.message.emptyHint')
              .d('我可以帮助您编写、查询和调试 Marmot 脚本。')}
          </div>
          <div className={styles['bot-messages-empty-tips']}>
            <div className={styles['bot-messages-empty-tip-item']}>
              {intl.get('spfm.bot.view.empty.tip1').d('💡 您可以问我关于脚本或业务对象的问题')}
            </div>
            <div className={styles['bot-messages-empty-tip-item']}>
              {intl.get('spfm.bot.view.empty.tip2').d('📝 我可以帮您修改和优化现有脚本')}
            </div>
            <div className={styles['bot-messages-empty-tip-item']}>
              {intl.get('spfm.bot.view.empty.tip3').d('🔍 输入问题后按 Enter 发送')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 收集活跃工具调用名称
  const executingTools = Object.entries(activeToolCalls)
    .filter(([, status]) => status === 'executing')
    .map(([name]) => name);

  return (
    <div className={styles['bot-messages']}>
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className={`${styles['bot-message']} ${styles['bot-message-user']}`}>
              <pre className={styles['bot-message-user-content']}>{msg.content}</pre>
            </div>
          );
        }

        if (msg.role === 'assistant') {
          // 空内容且无工具调用时隐藏气泡
          if (!msg.content && (!msg.toolCalls || msg.toolCalls.length === 0) && !isProcessing) {
            return null;
          }
          return (
            <div
              key={msg.id}
              className={`${styles['bot-message']} ${styles['bot-message-assistant']}`}
            >
              {msg.content ? (
                <BotMarkdown content={msg.content} />
              ) : isProcessing ? (
                <span className={styles['bot-message-processing']}>
                  <TypingIndicator />
                </span>
              ) : null}

              {/* 显示 assistant 消息中的工具调用状态 */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className={styles['bot-tool-calls-inline']}>
                  {msg.toolCalls.map((tc) => {
                    const displayName = getToolDisplayName(tc.name);
                    const completed = completedToolCalls.includes(tc.name);
                    const isExecuting = activeToolCalls[tc.name] === 'executing';
                    const status = isExecuting ? 'executing' : completed ? 'success' : null;

                    if (!status) return null;
                    return (
                      <div key={tc.id} className={styles['bot-tool-call-item']}>
                        <ToolStatusBadge status={status} toolName={displayName} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        if (msg.role === 'tool') {
          // [C5] UI 过滤：不展示原始 tool 消息 JSON（展示精简版本）
          let displayContent = '';
          let parsed = null;

          try {
            parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
          } catch (e) {
            parsed = null;
          }

          if (parsed && parsed.success !== undefined) {
            displayContent = parsed.success
              ? `✅ 执行成功`
              : `❌ 执行失败: ${parsed.error || '未知错误'}`;
          } else if (typeof msg.content === 'string' && msg.content.length > 100) {
            displayContent = `⚙️ 返回结果 (${msg.content.length} 字符)`;
          } else {
            displayContent = msg.content;
          }

          return (
            <div key={msg.id} className={`${styles['bot-message']} ${styles['bot-message-tool']}`}>
              <div className={styles['bot-message-tool-header']}>
                <span role="img" aria-label="tool">
                  ⚙️
                </span>
                <span className={styles['bot-message-tool-name']}>
                  {getToolDisplayName(msg.toolName)}
                </span>
              </div>
              <pre className={styles['bot-message-tool-content']}>{displayContent}</pre>
            </div>
          );
        }

        // system 消息（精简显示）
        if (msg.role === 'system') {
          try {
            const sys = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            if (sys.summary) {
              return (
                <div
                  key={msg.id}
                  className={`${styles['bot-message']} ${styles['bot-message-system']}`}
                >
                  <span className={styles['bot-message-system-content']}>
                    <span role="img" aria-label="note">
                      📋
                    </span>{' '}
                    {sys.summary}
                  </span>
                </div>
              );
            }
          } catch (e) {
            // 非 JSON 的 system 消息，跳过显示
          }
          return null;
        }

        return null;
      })}

      {/* 正在处理且最新的消息不是 assistant 时显示处理中的指示器 */}
      {isProcessing && executingTools.length > 0 && (
        <div className={styles['bot-message-processing']} style={{ marginRight: 'auto' }}>
          {executingTools.map((name) => (
            <ToolStatusBadge key={name} status="executing" toolName={name} />
          ))}
        </div>
      )}

      {/* 处理中但无工具调用（与 assistant 空白消息统一使用 TypingIndicator） */}
      {isProcessing &&
        executingTools.length === 0 &&
        messages.length > 0 &&
        messages[messages.length - 1].role !== 'assistant' && (
          <div className={styles['bot-message-processing']} style={{ marginRight: 'auto' }}>
            <TypingIndicator />
          </div>
        )}
    </div>
  );
}

export default BotMessages;
