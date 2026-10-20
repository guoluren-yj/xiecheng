/**
 * BotPanel - 盘古 Bot 主面板组件（Phase 3 增强版）
 *
 * 嵌入 MarmotScriptEditor 作为 50/50 分栏的左侧面板。
 * Phase 3 新增功能：
 *   1. 确认弹窗 + Diff 对比（PendingStore 接通）
 *   2. BotMarkdown 增强（think 块折叠）
 *   3. 工具调用视觉反馈（执行中/成功/失败）
 *   4. 工具开关 UI（localStorage 持久化）
 *   5. 错误边界（BotErrorBoundary）
 *   6. 模型配置面板（模型选择 + API Key）
 *
 * @date: 2026-06-12
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import logger from '../utils/logger';
import BotSessionManager from '../orchestration/BotSessionManager';
import AgenticLoop from '../orchestration/AgenticLoop';
import PendingStore from '../orchestration/PendingStore';
import ToolRegistry from '../tools/ToolRegistry';
import { registerAllTools } from '../tools/definitions/index.js';
import { collectPanguContext } from '../orchestration/contextUtils';
import * as toolContext from '../orchestration/toolContext';
import { loadModelConfig, isValidProvider } from '../orchestration/ModelProvider';
import BotMessages from './BotMessages';
import BotInput from './BotInput';
import BotConfirmationDialog from './BotConfirmationDialog';
import BotToolbar from './BotToolbar';
import BotErrorBoundary from './BotErrorBoundary';
import BotTopControls from './BotTopControls';
import styles from './BotStyles.less';

/**
 * @param {Object} props
 * @param {Object} [props.scriptCodeDs] - 编辑器 DataSet（用于获取脚本上下文）
 * @param {Object} [props.scriptOutputDs] - 执行结果 DataSet（用于获取执行结果）
 * @param {Object} [props.codeRef] - CodeMirror CodeArea ref（用于确认后即时更新编辑器视图）
 */
function BotPanel({ scriptCodeDs, scriptOutputDs, codeRef, testParam = {} }) {
  // 注入编辑器执行参数到工具运行时上下文
  toolContext.setInputEntityCode(testParam.inputEntityCode);
  toolContext.setOutputEntityCode(testParam.outputEntityCode);
  toolContext.setDebugTenantNum(testParam.debugTenantNum);
  // ========== 状态管理 ==========
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 确认弹窗状态
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  // 模型配置状态（从 localStorage 加载，无默认值）
  const [currentProvider, setCurrentProvider] = useState(() => {
    const saved = loadModelConfig();
    return saved && saved.provider ? saved.provider : null;
  });

  // 工具调用视觉反馈
  /** @type {Object<string, 'executing'|'success'|'error'>} */
  const [activeToolCalls, setActiveToolCalls] = useState({});
  /** @type {string[]} */
  const [completedToolCalls, setCompletedToolCalls] = useState([]);

  // 上下文超限警告状态
  const [contextOverLimit, setContextOverLimit] = useState(false);

  // 同步 provider ref
  useEffect(() => {
    providerRef.current = currentProvider;
  }, [currentProvider]);

  // 修改&运行脚本开关（从 localStorage 初始化）
  const [scriptModifyEnabled, setScriptModifyEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('bot_script_modify_enabled');
      if (stored !== null) return JSON.parse(stored) === true;
    } catch (e) {
      /* ignore */
    }
    return true;
  });

  // Refs
  const botPanelRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isAutoScrollRef = useRef(true);
  const sessionManagerRef = useRef(null);
  const agenticLoopRef = useRef(null);
  const pendingStoreRef = useRef(null);
  const toolRegistryRef = useRef(null);
  const providerRef = useRef(currentProvider);

  // ========== 初始化编排层 ==========
  useEffect(() => {
    const sessionManager = new BotSessionManager();
    const pendingStore = new PendingStore();
    const toolRegistry = new ToolRegistry();
    registerAllTools(toolRegistry);
    const agenticLoop = new AgenticLoop(sessionManager, toolRegistry, pendingStore);

    // 注册消息更新监听
    sessionManager.onUpdate((updatedMessages) => {
      setMessages([...updatedMessages]);
    });

    // [Phase 5] 后端持久化就绪后，在此处加载历史会话：
    //   const saved = await fetch('/v1/bot/session/latest');
    //   if (saved?.messages) sessionManager.loadFromBackend(saved.messages);

    sessionManagerRef.current = sessionManager;
    agenticLoopRef.current = agenticLoop;
    pendingStoreRef.current = pendingStore;
    toolRegistryRef.current = toolRegistry;

    return () => {
      agenticLoop.stop();
      sessionManagerRef.current = null;
      agenticLoopRef.current = null;
      pendingStoreRef.current = null;
      toolRegistryRef.current = null;
    };
  }, []);

  // ========== 自动滚动 ==========
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isAutoScrollRef.current = distanceFromBottom <= 50;
  }, []);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || !isAutoScrollRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ========== 发送消息 ==========
  const handleSend = useCallback(async () => {
    const question = inputValue.trim();
    if (!question || !agenticLoopRef.current) return;

    const provider = providerRef.current;
    if (!provider || !isValidProvider(provider)) {
      notification.error({
        message: intl.get('spfm.bot.notification.noModel.title').d('模型未配置'),
        description: intl
          .get('spfm.bot.notification.noModel.desc')
          .d('请在右上角模型配置中选择一个模型并填写 API Key'),
      });
      return;
    }

    setInputValue('');
    setIsProcessing(true);
    isAutoScrollRef.current = true;
    setShowConfirmation(false);
    setPendingItem(null);
    setContextOverLimit(false);
    setActiveToolCalls({});
    setCompletedToolCalls([]);

    // 收集当前上下文
    const context = collectPanguContext(scriptCodeDs, scriptOutputDs);

    // 开始工具调用跟踪
    const onToolCallStart = (toolName) => {
      setActiveToolCalls((prev) => ({ ...prev, [toolName]: 'executing' }));
    };

    const onToolCallEnd = (toolName) => {
      setActiveToolCalls((prev) => {
        const next = { ...prev };
        delete next[toolName];
        return next;
      });
      setCompletedToolCalls((prev) => [...prev, toolName]);
    };

    try {
      const result = await agenticLoopRef.current.handleUserMessage(question, {
        context,
        scriptCodeDs,
        modelProvider: providerRef.current,
        onUpdate: () => {
          // BotSessionManager 的 onUpdate 已自动 setMessages
        },
        onStatusChange: (processing) => {
          setIsProcessing(processing);
        },
        onToolCallStart,
        onToolCallEnd,
        onTokenWarning: (warning) => {
          // Token 用量接近上限时显示横幅
          if (warning) setContextOverLimit(true);
        },
        onError: (error) => {
          logger.error('Bot 处理错误', error, { category: 'bot', component: 'BotPanel' });
        },
        // 根据"修改&运行脚本"开关过滤工具：关闭时排除 modify_script 和 execute_script
        enabledToolNames: scriptModifyEnabled
          ? undefined
          : ['query_call', 'reasoning_action', 'stop_session'],
      });

      // 检查是否需要用户确认（确认门禁）
      if (result && result.requiresConfirmation) {
        // 从 PendingStore 读取待确认项
        const pending = pendingStoreRef.current ? pendingStoreRef.current.peek() : null;

        if (pending) {
          setPendingItem(pending);
          setShowConfirmation(true);
        }
      } else if (result && result.needsFollowUp) {
        // 无确认需求但需要续跑：达到轮次上限后自动恢复 AI 循环
        logger.info('达到轮次上限，自动续跑', {}, { category: 'bot', component: 'BotPanel' });
        agenticLoopRef.current.resumeSession({
          onStatusChange: (processing) => {
            setIsProcessing(processing);
          },
        });
      }
    } catch (e) {
      logger.error('Bot 处理异常', e, { category: 'bot', component: 'BotPanel' });
      setIsProcessing(false);
    }
  }, [inputValue, scriptCodeDs, scriptOutputDs]);

  // ========== 确认/取消回调 ==========
  const handleConfirmSuccess = useCallback(async () => {
    setShowConfirmation(false);
    setPendingItem(null);

    // 确认后继续 AI 循环（resumeSession 让 AI 继续处理后续工具调用）
    if (agenticLoopRef.current) {
      try {
        const result = await agenticLoopRef.current.resumeSession({
          onStatusChange: (processing) => {
            setIsProcessing(processing);
          },
        });

        // 处理 resumeSession 返回结果（与 handleSend 保持一致）
        if (result && result.requiresConfirmation) {
          const pending = pendingStoreRef.current ? pendingStoreRef.current.peek() : null;
          if (pending) {
            setPendingItem(pending);
            setShowConfirmation(true);
          }
        }
      } catch (e) {
        logger.error('resumeSession 异常', e, { category: 'bot', component: 'BotPanel' });
      }
    }
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmation(false);
    setPendingItem(null);

    // 取消后清除 pending 状态
    if (pendingStoreRef.current) {
      pendingStoreRef.current.clear();
    }
  }, []);

  // ========== 停止处理 ==========
  const handleStop = useCallback(() => {
    if (agenticLoopRef.current) {
      agenticLoopRef.current.stop();
    }
    setIsProcessing(false);
    setActiveToolCalls({});
  }, []);

  // ========== 清空会话 ==========
  const handleClear = useCallback(() => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.reset();
    }
    setMessages([]);
    setInputValue('');
    setShowConfirmation(false);
    setPendingItem(null);
    setActiveToolCalls({});
    setCompletedToolCalls([]);
  }, []);

  // ========== 输入框变化 ==========
  const handleInputChange = useCallback((value) => {
    setInputValue(value);
  }, []);

  // 脚本修改开关变化时持久化
  useEffect(() => {
    try {
      localStorage.setItem('bot_script_modify_enabled', JSON.stringify(scriptModifyEnabled));
    } catch (e) {
      /* ignore */
    }
  }, [scriptModifyEnabled]);

  // ========== 脚本修改开关变化 ==========
  const handleScriptModifyToggle = useCallback(() => {
    setScriptModifyEnabled((prev) => !prev);
  }, []);

  // ========== 模型配置变化 ==========
  const handleProviderChange = useCallback((provider) => {
    setCurrentProvider(provider);
    logger.info('模型切换', { provider }, { category: 'bot', component: 'BotPanel' });
  }, []);

  const handleApiKeyChange = useCallback((apiKey) => {
    // Phase 3: 预留 API Key 设置
    logger.info('API Key 已设置', { hasKey: !!apiKey }, { category: 'bot', component: 'BotPanel' });
  }, []);

  return (
    <BotErrorBoundary>
      <div className={styles['bot-panel']} ref={botPanelRef}>
        {/* Top controls — 当前模型显示 + 配置按钮 */}
        <BotTopControls
          currentProvider={currentProvider}
          onProviderChange={handleProviderChange}
          onApiKeyChange={handleApiKeyChange}
          containerRef={botPanelRef}
        />

        {/* Session bar：标题 + 操作按钮 */}
        <div className={styles['bot-session-bar']}>
          <div className={styles['session-bar-left']}>
            <span className={styles['session-bar-title']}>
              {intl.get('spfm.bot.view.title.bot').d('Bot')}
            </span>
          </div>
          <div className={styles['session-bar-right']}>
            <Tooltip
              title={intl.get('spfm.bot.tooltip.diagnostic').d('导出诊断数据')}
              placement="bottom"
            >
              <Button
                funcType="flat"
                icon="get_app"
                onClick={() => {
                  import('../utils/diagnostic').then(({ exportDiagnosticData }) => {
                    exportDiagnosticData({
                      sessionManager: sessionManagerRef.current,
                      modelProvider: currentProvider,
                      toolStates: { script_modify_execute: scriptModifyEnabled },
                    });
                  });
                }}
                disabled={messages.length === 0}
                size="small"
                className={styles['bot-toolbar-btn']}
              >
                {intl.get('spfm.bot.button.export').d('导出')}
              </Button>
            </Tooltip>
            <Button
              funcType="flat"
              icon="delete_sweep"
              onClick={() => {
                Modal.confirm({
                  title: '确认清空',
                  children: '确定要清空当前会话吗？所有消息将不可恢复。',
                }).then((button) => {
                  if (button === 'ok') handleClear();
                });
              }}
              disabled={messages.length === 0}
              size="small"
              className={styles['bot-toolbar-btn']}
            >
              {intl.get('spfm.bot.button.clear').d('清空')}
            </Button>
          </div>
        </div>

        {/* Messages area — flex: 1, scrollable */}
        <div
          className={styles['bot-messages-container']}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <BotMessages
            messages={messages}
            isProcessing={isProcessing}
            activeToolCalls={activeToolCalls}
            completedToolCalls={completedToolCalls}
          />
        </div>

        {/* 上下文超限警告横幅 */}
        {contextOverLimit && (
          <div
            className={styles['bot-context-warning-banner']}
            onClick={() => {
              Modal.confirm({
                title: '清空会话',
                children: '上下文大小已超过限制，是否清空会话？',
              }).then((button) => {
                if (button === 'ok') handleClear();
              });
            }}
          >
            <span
              className={styles['bot-context-warning-banner-icon']}
              role="img"
              aria-label="warning"
            >
              ⚠️
            </span>
            <span className={styles['bot-context-warning-banner-text']}>
              {intl.get('spfm.bot.warning.contextOverLimit').d('上下文大小已超过限制，请清空会话')}
            </span>
            <span className={styles['bot-context-warning-banner-action']}>
              {intl.get('spfm.bot.warning.clearNow').d('清空会话')}
            </span>
          </div>
        )}

        {/* BotToolbar — 位于消息区和输入区之间 */}
        <BotToolbar
          scriptModifyEnabled={scriptModifyEnabled}
          onScriptModifyToggle={handleScriptModifyToggle}
        />

        {/* Input area */}
        <div className={styles['bot-input']}>
          <BotInput
            value={inputValue}
            onChange={handleInputChange}
            onSend={handleSend}
            disabled={false}
            isProcessing={isProcessing}
            onStop={handleStop}
          />
        </div>

        {/* Confirmation Dialog — 在 PendingStore 有 pending 时弹窗 */}
        <BotConfirmationDialog
          visible={showConfirmation}
          pendingItem={pendingItem}
          sessionManager={sessionManagerRef.current}
          pendingStore={pendingStoreRef.current}
          codeRef={codeRef}
          onConfirmSuccess={handleConfirmSuccess}
          onCancel={handleCancelConfirm}
        />
      </div>
    </BotErrorBoundary>
  );
}

export default formatterCollections({ code: ['spfm.bot'] })(BotPanel);
