/**
 * ModelProvider — AI 模型提供者（对齐 TG LightweightModelProvider）
 *
 * 支持 5 个模型：
 *   minimax_internal_test — MiniMax-M3 内部测试渠道
 *   deepseek_chat        — DeepSeek-V4-Flash
 *   minimax_m2_7         — MiniMax-M3 (Token Plan)
 *   mimo_v2_5            — MiMo-V2.5
 *   deepseek_v4_flash_tencent — DeepSeek-V4-Flash（腾讯云）
 *
 * 存储格式：{ provider, keys: { deepseek_chat: 'sk-xxx', ... } }
 *
 * @date: 2026-06-24
 */

/** 5 个模型供应商，对齐 TG LightweightModelProvider.getAllProviders() */
const MODEL_PROVIDERS = Object.freeze([
  {
    key: 'minimax_internal_test',
    label: 'MiniMax-M3内部测试渠道',
    description: '内测专用，加密存储，仅限Marmot平台使用',
  },
  {
    key: 'deepseek_chat',
    label: 'DeepSeek-V4-Flash',
    description: 'DeepSeek官方API，需要填写API密钥',
  },
  {
    key: 'minimax_m2_7',
    label: 'MiniMax-M3(Token Plan)',
    description: 'MiniMax AI模型(Token Plan)，需要填写API密钥',
  },
  {
    key: 'mimo_v2_5',
    label: 'MiMo-V2.5',
    description: '小米MiMo 2.5 Omni模型，支持全模态理解、深度思考、函数调用、1M上下文窗口',
  },
  {
    key: 'deepseek_v4_flash_tencent',
    label: 'DeepSeek-V4-Flash(腾讯云)',
    description: '腾讯云内部测试渠道，通过tokenhub代理访问DeepSeek-V4-Flash',
  },
]);

/** localStorage 存储键（对齐 TG） */
const MODEL_CONFIG_KEY = 'lightweight_model_provider_config';

/**
 * 获取模型提供商列表
 * @returns {Array<{ key: string, label: string, description: string }>}
 */
function getModelProviders() {
  return MODEL_PROVIDERS.map((p) => ({ ...p }));
}

/**
 * 获取模型提供商的显示名
 * @param {string} providerKey
 * @returns {string}
 */
function getProviderDisplayName(providerKey) {
  const found = MODEL_PROVIDERS.find((p) => p.key === providerKey);
  return found ? found.label : providerKey;
}

/**
 * 获取配置摘要（用于显示）
 */
function getConfigSummary(config) {
  if (!config || !config.provider || !isValidProvider(config.provider)) {
    return '无效配置';
  }
  const displayName = getProviderDisplayName(config.provider);
  const hasApiKey = !!(config.keys && config.keys[config.provider]);
  return `供应商: ${displayName} | API密钥: ${hasApiKey ? '已设置' : '未设置'}`;
}

/**
 * 验证模型提供商是否支持
 * @param {string} providerKey
 * @returns {boolean}
 */
function isValidProvider(providerKey) {
  return MODEL_PROVIDERS.some((p) => p.key === providerKey);
}

/**
 * 从 localStorage 加载模型配置
 * @returns {{ provider: string, keys?: Object.<string, string> }|null}
 */
function loadModelConfig() {
  try {
    const stored = localStorage.getItem(MODEL_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.provider) {
        // 规范化旧 provider code（对齐 TG normalizeProviderCode）
        const normalized = normalizeProviderCode(parsed.provider);
        // 迁移旧格式：apiKey → keys
        if (parsed.apiKey && !parsed.keys) {
          parsed.keys = { [parsed.provider]: parsed.apiKey };
          delete parsed.apiKey;
        }
        if (!parsed.keys) parsed.keys = {};
        return { ...parsed, provider: normalized };
      }
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

/**
 * 保存模型配置到 localStorage
 */
function saveModelConfig(config) {
  try {
    localStorage.setItem(MODEL_CONFIG_KEY, JSON.stringify({ ...config, timestamp: Date.now() }));
  } catch (e) {
    /* ignore */
  }
}

/**
 * 规范化供应商代码（向后兼容旧代码）
 * 对齐 TG normalizeProviderCode
 */
function normalizeProviderCode(provider) {
  const normalized = String(provider).toLowerCase().trim();
  const legacyMapping = {
    deepseek: 'deepseek_chat',
    minimax: 'minimax_m2_7',
    qwen: 'deepseek_chat',
    internal_test: 'minimax_internal_test',
    mimo: 'mimo_v2_5',
    deepseek_v4_flash: 'deepseek_chat',
    deepseek_v4_flash_tencent: 'deepseek_v4_flash_tencent',
  };
  return legacyMapping[normalized] || provider;
}

export {
  getModelProviders,
  isValidProvider,
  loadModelConfig,
  saveModelConfig,
  getConfigSummary,
  MODEL_CONFIG_KEY,
};
