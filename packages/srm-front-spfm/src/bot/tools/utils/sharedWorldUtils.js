/**
 * sharedWorldUtils — 数据清洗工具
 *
 * 清理 API 返回数据中的审计字段、重命名 enabledFlag、简化枚举值。
 * 减少发给 LLM 的 Token 浪费。
 *
 * @date: 2026-06-12
 */

/** 审计字段（清洗时移除，对齐 TG sharedWorldUtils.ts AUDIT_FIELDS 16 项） */
const AUDIT_FIELDS = new Set([
  'createdBy',
  'createdDate',
  'lastModifiedBy',
  'lastModifiedDate',
  'deleteFlag',
  'deletedFlag',
  'objectVersionNumber',
  '_token',
  'requestId',
  'requestDate',
  'tenant',
  'metaInfo',
  'mdtCreateVersion',
  'mdtCustomFlag',
  'mdtDataControlType',
  'mdtLastUpdateVersion',
  '__PredefinedUpdateFlag',
  '__PredefinedFlag',
  '__CanDeleteFlag',
  '__CanEnabledFlag',
]);

/** 字段重命名映射 */
const RENAME_FIELDS = {
  enabledFlag: 'enabled',
  deleteFlag: 'deleted',
  objectVersionNumber: 'version',
  tenantId: 'tenant',
  organizationId: 'orgId',
};

/** 枚举值简化 */
const ENUM_SIMPLIFICATIONS = {
  status: {
    ENABLED: '启用',
    DISABLED: '禁用',
    ACTIVE: '启用',
    INACTIVE: '禁用',
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
    DELETED: '已删除',
    PENDING: '待处理',
    APPROVED: '已审批',
    REJECTED: '已拒绝',
    SUBMITTED: '已提交',
  },
  type: {
    PAGE: '页面',
    FLOW: '流程',
    OBJECT: '对象',
    INTERFACE: '接口',
    REPORT: '报表',
    SCRIPT: '脚本',
    ADAPTOR: '适配器',
    SCRIPT_LIB: '函数库',
    REL_ACTION: '触发器',
  },
};

/**
 * 清洗单个记录对象
 * @param {Object} item
 * @returns {Object}
 */
function cleanSingle(item) {
  if (!item || typeof item !== 'object') return item;

  const cleaned = {};
  for (const [key, value] of Object.entries(item)) {
    // 跳过审计字段
    if (!AUDIT_FIELDS.has(key)) {
      // 字段重命名
      const newKey = RENAME_FIELDS[key] || key;

      // 枚举简化
      let newValue = value;
      if (typeof value === 'string' && ENUM_SIMPLIFICATIONS[newKey]?.[value]) {
        newValue = ENUM_SIMPLIFICATIONS[newKey][value];
      }

      // 递归清洗嵌套对象
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[newKey] = cleanSingle(value);
      } else {
        cleaned[newKey] = newValue;
      }
    }
  }
  return cleaned;
}

/**
 * 清洗数组中的每个记录
 * @param {Object[]} items
 * @returns {Object[]}
 */
function cleanArray(items) {
  if (!Array.isArray(items)) return items;
  return items.map(cleanSingle);
}

/**
 * 清洗 API 响应
 * 自动检测 content[] 或 data 字段进行清洗
 * @param {Object} response
 * @returns {Object}
 */
function cleanApiResponse(response) {
  if (!response || typeof response !== 'object') return response;

  const cleaned = {};
  for (const [key, value] of Object.entries(response)) {
    if (key === 'content' && Array.isArray(value)) {
      cleaned[key] = cleanArray(value);
    } else if (key === 'data' && value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = cleanSingle(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * 将 JSON 数据转换为 CSV 格式（减少 Token）
 * @param {Object[]} data
 * @returns {string}
 */
function jsonToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const lines = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      // 对象/数组用 JSON.stringify 序列化，避免 String({}) → "[object Object]"
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // 转义逗号和引号
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

export { cleanSingle, cleanArray, cleanApiResponse, jsonToCSV };
