/**
 * 声明式工具框架 — createDeclarativeTool
 *
 * 核心思想：用纯数据描述（metadata）定义工具，框架自动处理：
 *   1. 参数验证（validateParameters）
 *   2. OpenAI function schema 自动生成（buildParameterSchema）
 *   3. 描述自动拼接（buildDescription）
 *   4. 展示器绑定（presenter）
 *
 * @date: 2026-06-12
 */

/**
 * 构建工具描述（四要素拼接）
 * @param {import('../types').ToolDefinitionMetadata} m
 * @returns {string}
 */
function buildDescription(m) {
  let desc = `${m.description}。用途：${m.purpose}。使用方法：${m.usage}`;
  if (m.notes) desc += `。注意事项：${m.notes}`;
  desc += `。是否幂等：${m.isIdempotent ? '是' : '否'}`;
  return desc;
}

/**
 * 构建 OpenAI function calling 参数 Schema
 * @param {import('../types').ParameterDefinition[]} params
 * @returns {Object}
 */
function buildParameterSchema(params) {
  const properties = {};
  const required = [];

  for (const p of params || []) {
    const prop = { type: p.type, description: p.description };
    if (p.enum) prop.enum = p.enum;
    if (p.default !== undefined) prop.default = p.default;
    if (p.items) prop.items = p.items;
    properties[p.name] = prop;
    if (p.required) required.push(p.name);
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false,
  };
}

/**
 * 参数验证
 * @param {import('../types').ParameterDefinition[]} params
 * @param {Object} args
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateParameters(params, args) {
  const errors = [];

  for (const p of params || []) {
    let value = args[p.name];
    if (p.required && (value === undefined || value === null || value === '')) {
      errors.push(`缺少必填参数: ${p.name}`);
    } else if (value !== undefined && value !== null) {
      // 防御性修复：LLM 偶发将 array/object 参数双重 JSON 序列化为字符串（对齐 TG definitions.ts 行 82-93）
      let parseFailed = false;
      if (typeof value === 'string' && (p.type === 'array' || p.type === 'object')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // 二次尝试：部分模型在 strict mode 下会双重转义内部引号
          try {
            const unescaped = value.replace(/\\"/g, '"');
            value = JSON.parse(unescaped);
          } catch (e2) {
            errors.push(`参数 ${p.name} 类型错误: 期望 ${p.type}, 但值为不可解析的字符串`);
            parseFailed = true;
          }
        }
      }

      if (!parseFailed) {
        if (p.type === 'string' && typeof value !== 'string') {
          errors.push(`参数 ${p.name} 应为 string，实际为 ${typeof value}`);
        } else if (p.type === 'number' && typeof value !== 'number') {
          errors.push(`参数 ${p.name} 应为 number，实际为 ${typeof value}`);
        } else if (p.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`参数 ${p.name} 应为 boolean，实际为 ${typeof value}`);
        } else if (p.type === 'array' && !Array.isArray(value)) {
          errors.push(`参数 ${p.name} 应为 array，实际为 ${typeof value}`);
        } else if (p.enum && !p.enum.includes(value)) {
          errors.push(`参数 ${p.name} 值 "${value}" 不在允许范围内: ${p.enum.join(', ')}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 创建声明式工具
 *
 * @param {Object} definition - 工具定义
 * @param {import('../types').ToolDefinitionMetadata} definition.metadata - 元数据
 * @param {Function} [definition.execute] - 执行函数 (args, context) => Promise<unknown>
 * @param {Function} [definition.validate] - 自定义验证函数 (args) => { valid, errors }
 * @param {import('../types').ToolPresenter} [definition.presenter] - 展示器
 * @param {Object} [context] - 执行上下文
 * @returns {import('../types').Tool}
 */
function createDeclarativeTool(definition, context) {
  const { metadata, execute: executeFn, validate: customValidate, presenter } = definition;

  if (!metadata || !metadata.name) {
    throw new Error('createDeclarativeTool: metadata.name 必填');
  }

  const description = buildDescription(metadata);
  const parameterSchema = buildParameterSchema(metadata.parameters);

  const tool = {
    name: metadata.name,
    type: metadata.type,
    description,
    isIdempotent: metadata.isIdempotent,
    usage: metadata.usage,
    purpose: metadata.purpose,

    /**
     * 执行工具
     * @param {Object} args - 工具参数
     * @returns {Promise<{ success: boolean, data?: *, error?: string }>}
     */
    async execute(args) {
      // 自定义验证优先
      if (customValidate) {
        const { valid, errors } = customValidate(args);
        if (!valid) {
          return { success: false, error: `参数验证失败: ${errors.join('; ')}` };
        }
      } else {
        // 自动参数验证
        const { valid, errors } = validateParameters(metadata.parameters, args);
        if (!valid) {
          return { success: false, error: `参数验证失败: ${errors.join('; ')}` };
        }
      }

      if (!executeFn) {
        return { success: true, data: null };
      }

      try {
        const result = await executeFn(args, context);
        return {
          success: result.success !== false,
          data: result.data !== undefined ? result.data : result,
          error: result.error,
        };
      } catch (e) {
        return { success: false, error: `工具执行错误 (${metadata.name}): ${e.message}` };
      }
    },

    /**
     * 获取 OpenAI function calling 定义
     * @returns {Object}
     */
    getDefinition() {
      return {
        type: 'function',
        function: {
          name: metadata.name,
          description,
          parameters: parameterSchema,
          strict: true,
        },
      };
    },

    /**
     * 获取展示器
     * @returns {import('../types').ToolPresenter|undefined}
     */
    getPresenter() {
      return presenter;
    },
  };

  return tool;
}

export { createDeclarativeTool, buildDescription, buildParameterSchema, validateParameters };
