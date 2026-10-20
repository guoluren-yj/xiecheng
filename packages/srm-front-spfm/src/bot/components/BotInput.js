/**
 * BotInput - 盘古 Bot 输入框组件
 *
 * 使用 choerodon-ui/pro 的 TextArea + Button。
 *
 * @date: 2026-06-12
 */

import React, { useRef } from 'react';
import { TextArea, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './BotStyles.less';

/**
 * @param {Object} props
 * @param {string} props.value - 输入框值
 * @param {Function} props.onChange - (value: string) => void
 * @param {Function} props.onSend - () => void
 * @param {boolean} props.disabled - 是否禁用
 * @param {boolean} props.isProcessing - 是否正在处理
 * @param {Function} props.onStop - 停止处理
 */
function BotInput({ value, onChange, onSend, disabled, isProcessing, onStop }) {
  // IME 输入合成状态，避免中文输入法 Enter 误提交
  const isComposingRef = useRef(false);

  const handleKeyDown = (e) => {
    // IME 合成期间忽略 Enter
    if (isComposingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
  };

  const handleTextChange = (val) => {
    if (onChange) onChange(val);
  };

  return (
    <div className={styles['bot-input-container']}>
      <TextArea
        value={value}
        onChange={handleTextChange}
        disabled={disabled || isProcessing}
        valueChangeAction="input"
        rows={3}
        placeholder={intl
          .get('spfm.bot.view.input.placeholder')
          .d('输入您的问题...(Shift+Enter 换行)')}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        style={{
          flex: 1,
          marginRight: 0,
          resize: 'none',
          minHeight: 60,
          maxHeight: 200,
          fontSize: 14,
        }}
      />
      <div className={styles['bot-input-actions']}>
        {isProcessing ? (
          <Button onClick={onStop} color="red" disabled={!isProcessing}>
            {intl.get('spfm.bot.button.stop').d('停止')}
          </Button>
        ) : (
          <Button onClick={onSend} color="primary" disabled={disabled || !(value && value.trim())}>
            {intl.get('spfm.bot.button.send').d('发送')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default BotInput;
