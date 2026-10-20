/**
 * BotTopControls - 盘古 Bot 顶部控制栏组件
 *
 *
 *   - 左上角：显示当前模型名称（只读文字，非下拉框）
 *   - 右上角：配置按钮，点击弹出配置弹窗
 *   - 配置弹窗内含模型选择 + API Key 输入
 *   - 弹窗通过 getContainer 相对于 Bot 面板定位
 *   - localStorage 持久化模型配置
 *
 * @date: 2026-06-12
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Select, Button, Password } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import {
  getModelProviders,
  loadModelConfig,
  saveModelConfig,
  MODEL_CONFIG_KEY,
  getConfigSummary,
} from '../orchestration/ModelProvider';
import styles from './BotStyles.less';

/** 当前支持的模型供应商列表 */
const MODEL_PROVIDERS = getModelProviders();

/**
 * 根据 provider key 获取显示名
 * @param {string} providerKey
 * @returns {string}
 */
function getModelDisplayName(providerKey) {
  const found = MODEL_PROVIDERS.find((p) => p.key === providerKey);
  return found ? found.label : providerKey;
}

/**
 * @typedef {Object} ModelConfig
 * @property {string} provider - 模型供应商 key
 * @property {Object.<string, string>} [keys] - 各供应商的 API Key 映射
 */

/**
 * @param {Object} props
 * @param {string} props.currentProvider - 当前模型供应商 key
 * @param {Function} props.onProviderChange - (provider: string) => void
 * @param {Function} [props.onApiKeyChange] - (apiKey: string) => void
 * @param {Object} [props.containerRef] - Bot 面板容器的 ref，用于弹窗定位
 */
function BotTopControls({ currentProvider, onProviderChange, onApiKeyChange, containerRef }) {
  // 通过 ref 存储最新值，避免 onOk 闭包过期
  const providerRef = useRef(currentProvider);
  const apiKeyRef = useRef('');

  // 当前模型配置摘要（未配置时 getConfigSummary 返回"无效配置"）
  const savedConfig = loadModelConfig();
  const configSummary = getConfigSummary(savedConfig);

  // 同步 ref
  useEffect(() => {
    providerRef.current = currentProvider;
  }, [currentProvider]);

  /** 打开配置弹窗 */
  const handleOpenConfig = useCallback(() => {
    const saved = loadModelConfig();
    // 初始化 ref 值为当前配置（未配置时用当前 provider 或空）
    const currentSaved = saved || {};
    providerRef.current = currentSaved.provider || currentProvider || '';
    apiKeyRef.current = (currentSaved.keys && currentSaved.keys[currentSaved.provider]) || '';

    // 用于触发 Select/TextField 重新渲染的 state
    const initialProvider = providerRef.current;

    Modal.open({
      key: 'bot-model-config',
      title: '模型配置',
      destroyOnClose: true,
      maskClosable: false,
      style: { width: 400 },
      // 相对于 Bot 面板定位
      getContainer: containerRef && containerRef.current ? () => containerRef.current : undefined,
      okText: '保存',
      cancelText: '取消',
      okProps: { color: 'primary' },
      children: (
        <BotModelConfigForm
          initialProvider={initialProvider}
          onProviderChange={(v) => {
            providerRef.current = v;
          }}
          onApiKeyChange={(v) => {
            apiKeyRef.current = v;
          }}
        />
      ),

      // onOk 读取 ref 中的最新值，绕过闭包过期
      onOk: async () => {
        const newProvider = providerRef.current;
        const newApiKey = apiKeyRef.current;
        // 保留各供应商 key，仅更新当前供应商的 key
        const existingConfig = loadModelConfig() || {};
        const config = {
          provider: newProvider,
          keys: { ...(existingConfig.keys || {}), [newProvider]: newApiKey },
        };
        saveModelConfig(config);
        if (onProviderChange && newProvider !== currentProvider) {
          onProviderChange(newProvider);
        }
        if (onApiKeyChange) {
          onApiKeyChange(newApiKey);
        }
        // resolve → modal auto-close
      },
    });
  }, [currentProvider, onProviderChange, onApiKeyChange, containerRef]);

  return (
    <div className={styles['bot-top-controls']}>
      <div className={styles['bot-top-controls-left']}>
        <span className={styles['bot-top-controls-model-value']}>{configSummary}</span>
      </div>
      <div className={styles['bot-top-controls-right']}>
        <Button
          funcType="flat"
          icon="vpn_key"
          onClick={handleOpenConfig}
          size="small"
          className={styles['bot-top-controls-btn']}
        >
          {intl.get('spfm.bot.button.config').d('配置')}
        </Button>
      </div>
    </div>
  );
}

/**
 * 模型配置表单子组件（内嵌在 Modal.open 的 children 中）
 * 使用受控组件 + 回调将最新值同步到 ref
 *
 * @param {Object} props
 * @param {string} props.initialProvider
 * @param {Function} props.onProviderChange
 * @param {Function} props.onApiKeyChange
 */
function BotModelConfigForm({ initialProvider, onProviderChange, onApiKeyChange }) {
  const [provider, setProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState('');

  // 初始化时读取 localStorage
  useEffect(() => {
    const saved = loadModelConfig();
    setProvider(saved ? saved.provider : initialProvider);
    // 从 keys 映射中读取当前供应商的 key
    const currentKey = (saved && saved.keys && saved.keys[initialProvider]) || '';
    setApiKey(currentKey);
  }, [initialProvider]);

  const handleProviderChange = useCallback(
    (value) => {
      setProvider(value);
      onProviderChange(value);
      // 切换供应商时自动加载该供应商的 key
      const saved = loadModelConfig();
      const keyForProvider = (saved && saved.keys && saved.keys[value]) || '';
      setApiKey(keyForProvider);
    },
    [onProviderChange]
  );

  const handleApiKeyChange = useCallback(
    (value) => {
      setApiKey(value);
      onApiKeyChange(value);
    },
    [onApiKeyChange]
  );

  return (
    <div className={styles['bot-model-config-form']}>
      {/* 模型选择 */}
      <div className={styles['bot-model-config-field']}>
        <span className={styles['bot-model-config-label']}>选择模型</span>
        <Select
          id="bot-model-select"
          value={provider}
          onChange={handleProviderChange}
          clearButton={false}
          style={{ width: '100%' }}
        >
          {MODEL_PROVIDERS.map((p) => (
            <Select.Option key={p.key} value={p.key}>
              {p.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* API Key */}
      <div className={styles['bot-model-config-field']}>
        <span className={styles['bot-model-config-label']}>API Key</span>
        <Password
          id="bot-api-key-input"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="请输入 API Key（可选）"
          valueChangeAction="input"
          style={{ width: '100%' }}
        />
      </div>

      <div className={styles['bot-model-config-hint']}>
        API Key 仅存储在浏览器本地，不会上传到服务器。
      </div>
    </div>
  );
}

export default BotTopControls;
export { MODEL_PROVIDERS, loadModelConfig, saveModelConfig, MODEL_CONFIG_KEY, getModelDisplayName };
