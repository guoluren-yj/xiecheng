/**
 * BotConfirmationDialog - 盘古 Bot 确认弹窗组件
 *
 * 当工具返回 requiresConfirmation: true 时弹窗，展示 Diff 对比。
 * 使用 choerodon-ui/pro Modal.open() API（与 PG 项目 146 处使用一致）。
 *
 * 通用管线：
 *   pendingStore.peek() → 找到 contract → onConfirm/onCancel
 *     → forHistory 精简 → batchSaveToolExchange → resumeSession
 *
 * @date: 2026-06-12
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';
import logger from '../utils/logger';
import DiffViewer from './DiffViewer';
import { getConfirmationContract } from '../confirmation/registry';
import { getToolDisplayName } from '../utils/toolDisplayUtils';
import styles from './BotStyles.less';

/**
 * 获取操作类型标签文本
 *
 * @param {string} [opType] - 操作类型
 * @returns {string} 中文标签
 */
function getOperationTypeLabel(opType) {
  switch (opType) {
    case 'snippet_replace':
      return '局部修改';
    case 'full_replace':
    default:
      return '完整替换';
  }
}

/**
 * 渲染修改位置预览（仅 snippet_replace 模式）
 *
 * @param {Object} modificationPosition - 修改位置信息
 * @returns {React.ReactNode|null}
 */
function renderModificationPosition(modificationPosition) {
  if (!modificationPosition) return null;

  const { originalSnippet } = modificationPosition;
  if (!originalSnippet) return null;

  const truncated =
    originalSnippet.length > 80 ? `${originalSnippet.substring(0, 80)}...` : originalSnippet;

  return (
    <div className={styles['bot-confirm-position']}>
      <span className={styles['bot-confirm-position-label']}>原代码片段：</span>
      <code className={styles['bot-confirm-position-snippet']}>{truncated}</code>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {boolean} props.visible - 是否显示弹窗
 * @param {import('../types').PendingItem|null} props.pendingItem - 待确认项
 * @param {import('../orchestration/BotSessionManager').default} props.sessionManager - 会话管理器
 * @param {import('../orchestration/PendingStore').default} props.pendingStore - 待确认暂存
 * @param {Object} [props.codeRef] - CodeMirror CodeArea ref，用于确认后即时更新编辑器
 * @param {Function} props.onConfirmSuccess - 确认成功回调
 * @param {Function} props.onCancel - 取消回调
 */
function BotConfirmationDialog({
  visible,
  pendingItem,
  sessionManager,
  pendingStore,
  codeRef,
  onConfirmSuccess,
  onCancel,
}) {
  // 使用 ref 存储回调依赖，防止 useEffect 因 useCallback 引用变化而重复触发 Modal.open
  const pendingItemRef = useRef(pendingItem);
  const sessionManagerRef = useRef(sessionManager);
  const pendingStoreRef = useRef(pendingStore);
  const codeRefLocal = useRef(codeRef);
  const onConfirmSuccessRef = useRef(onConfirmSuccess);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    pendingItemRef.current = pendingItem;
  }, [pendingItem]);
  useEffect(() => {
    sessionManagerRef.current = sessionManager;
  }, [sessionManager]);
  useEffect(() => {
    pendingStoreRef.current = pendingStore;
  }, [pendingStore]);
  useEffect(() => {
    codeRefLocal.current = codeRef;
  }, [codeRef]);
  useEffect(() => {
    onConfirmSuccessRef.current = onConfirmSuccess;
  }, [onConfirmSuccess]);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const handleConfirm = useCallback(async () => {
    const pi = pendingItemRef.current;
    const sm = sessionManagerRef.current;
    const ps = pendingStoreRef.current;

    if (!pi || !sm || !ps) {
      return { success: false };
    }

    // [C8] 消费 pending，防双击
    const consumed = ps.get();
    if (!consumed) {
      logger.warn(
        'pending 已被消费，跳过确认',
        {},
        { category: 'bot', component: 'BotConfirmationDialog' }
      );
      if (onConfirmSuccessRef.current) onConfirmSuccessRef.current();
      return { success: true };
    }

    const contract = getConfirmationContract(pi.toolName);
    if (!contract) {
      logger.warn(
        '未找到确认合约',
        { toolName: pi.toolName },
        { category: 'bot', component: 'BotConfirmationDialog' }
      );
      ps.clear();
      if (onConfirmSuccessRef.current) onConfirmSuccessRef.current();
      return { success: true };
    }

    try {
      const ctx = { pendingItem: pi, sessionManager: sm, pendingStore: ps };
      const result = await contract.onConfirm(ctx);

      if (result.success) {
        // 确认成功后即时更新编辑器视图（TG "确认即见"对齐）
        const mod = pi.pendingModification || {};
        const cr = codeRefLocal.current;
        if (cr && cr.current && mod.newScriptContent) {
          try {
            cr.current.setValue(mod.newScriptContent);
          } catch (e) {
            logger.warn('编辑器即时更新失败', e, {
              category: 'bot',
              component: 'BotConfirmationDialog',
            });
          }
        }

        // 将确认结果写入 session history（C7 原子写入）
        const forHistory = result.forHistory || { action: pi.toolName, status: 'confirmed' };
        try {
          sm.batchSaveToolExchange(
            pi.assistantMessageId,
            [{ id: pi.toolCallId, name: pi.toolName, arguments: pi.originalArgs || {} }],
            [{ toolCallId: pi.toolCallId, toolName: pi.toolName, result: forHistory }]
          );
          const toolDisplayName = getToolDisplayName(pi.toolName);
          sm.addSystemMessage(forHistory.summary || `"${toolDisplayName}" 已确认`);
        } catch (e) {
          logger.error('确认结果写入历史失败', e, {
            category: 'bot',
            component: 'BotConfirmationDialog',
          });
        }

        ps.clear();
        if (onConfirmSuccessRef.current) onConfirmSuccessRef.current(result);
        return { success: true };
      }

      logger.error(
        '确认执行失败',
        { error: result.error },
        { category: 'bot', component: 'BotConfirmationDialog' }
      );
      return { success: false, error: result.error };
    } catch (e) {
      logger.error('确认回调异常', e, { category: 'bot', component: 'BotConfirmationDialog' });
      return { success: false, error: e.message };
    }
  }, []); // 所有依赖通过 ref 读取，不需要依赖项

  const handleCancelAction = useCallback(() => {
    const pi = pendingItemRef.current;
    const sm = sessionManagerRef.current;
    const ps = pendingStoreRef.current;
    const oc = onCancelRef.current;

    if (!pi) return;

    // 执行取消合约，获取 forHistory
    const toolDisplayName = getToolDisplayName(pi.toolName);
    let forHistory = {
      action: pi.toolName,
      status: 'cancelled',
      summary: `用户取消了${toolDisplayName}`,
    };
    const contract = getConfirmationContract(pi.toolName);
    if (contract && contract.onCancel) {
      try {
        const cancelResult = contract.onCancel({
          pendingItem: pi,
          sessionManager: sm,
          pendingStore: ps,
        });
        if (cancelResult && cancelResult.forHistory) {
          const { forHistory: cancelForHistory } = cancelResult.forHistory;
          forHistory = cancelForHistory;
        }
      } catch (e) {
        logger.warn('取消回调异常', e, { category: 'bot', component: 'BotConfirmationDialog' });
      }
    }

    // 将取消结果写入 session history（C7 原子写入）
    try {
      sm.batchSaveToolExchange(
        pi.assistantMessageId,
        [{ id: pi.toolCallId, name: pi.toolName, arguments: pi.originalArgs || {} }],
        [{ toolCallId: pi.toolCallId, toolName: pi.toolName, result: forHistory }]
      );
      sm.addSystemMessage(forHistory.summary || `"${toolDisplayName}" 已取消`);
    } catch (e) {
      logger.error('取消结果写入历史失败', e, {
        category: 'bot',
        component: 'BotConfirmationDialog',
      });
    }

    ps.clear();
    if (oc) oc();
  }, []); // 所有依赖通过 ref 读取

  useEffect(() => {
    if (visible && pendingItem) {
      const mod = pendingItem.pendingModification || {};

      // 检测操作类型（snippet_replace 或 full_replace）
      const { operationType = 'full_replace' } = mod;
      const isSimplifiedMode = operationType === 'snippet_replace';
      const { modificationPosition } = mod;

      const content = (
        <div className={styles['bot-confirm-dialog-content']}>
          <p className={styles['bot-confirm-description']}>
            工具 {getToolDisplayName(pendingItem.toolName || '')} 将修改脚本内容，请确认变更：
          </p>

          {/* 操作类型标签 */}
          <div className={styles['bot-confirm-optype-section']}>
            <span className={styles['bot-confirm-optype-badge']}>
              {getOperationTypeLabel(operationType)}
            </span>
          </div>

          {/* snippet_replace 模式：显示修改位置 */}
          {isSimplifiedMode && modificationPosition && (
            <div className={styles['bot-confirm-position-section']}>
              <div className={styles['bot-confirm-diff-label']}>修改位置：</div>
              {renderModificationPosition(modificationPosition)}
            </div>
          )}

          {/* snippet_replace 模式：简化 Diff 预览 */}
          {isSimplifiedMode && mod.newScriptContent && mod.currentScriptContent && (
            <div className={styles['bot-confirm-diff-section']}>
              <div className={styles['bot-confirm-diff-label']}>变更对比：</div>
              <DiffViewer oldText={mod.currentScriptContent} newText={mod.newScriptContent} />
            </div>
          )}

          {/* full_replace 模式：保持现有完整 DiffViewer */}
          {!isSimplifiedMode && mod.newScriptContent && mod.currentScriptContent && (
            <div className={styles['bot-confirm-diff-section']}>
              <div className={styles['bot-confirm-diff-label']}>变更对比：</div>
              <DiffViewer oldText={mod.currentScriptContent} newText={mod.newScriptContent} />
            </div>
          )}

          {mod.newScriptContent && !mod.currentScriptContent && (
            <div className={styles['bot-confirm-newcode-section']}>
              <div className={styles['bot-confirm-diff-label']}>新脚本内容：</div>
              <pre className={styles['bot-confirm-pre']}>{mod.newScriptContent}</pre>
            </div>
          )}

          {!mod.newScriptContent && (
            <p className={styles['bot-confirm-no-content']}>无脚本内容变更。</p>
          )}
        </div>
      );

      Modal.open({
        key: 'bot-confirmation',
        title: '确认修改',
        children: content,
        maskClosable: false,
        destroyOnClose: true,
        style: { width: 700 },
        okText: '确认',
        cancelText: '取消',
        okProps: { color: 'primary' },
        cancelProps: { color: 'default' },

        // onOk 返回 Promise：成功自动关，失败保持打开
        onOk: async () => {
          const result = await handleConfirm();
          if (!result.success) {
            Modal.error({
              title: '确认失败',
              content: result.error || '操作执行失败，请重试',
            });
            throw new Error(result.error || '操作失败');
          }
        },

        onCancel: () => {
          handleCancelAction();
        },
      });
    }
  }, [visible, pendingItem, handleConfirm, handleCancelAction]);

  return null;
}

export default BotConfirmationDialog;
