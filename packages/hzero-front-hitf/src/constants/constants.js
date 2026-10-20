import intl from 'hzero-front/lib/utils/intl';

export const SERVICE_CONSTANT = {
  NEW: 'NEW',
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  DISABLED_INPROGRESS: 'DISABLED_INPROGRESS',
  DS: 'DS',
  MODELER: 'MODELER',
  FILE: 'FILE',
  COMPOSITE: 'COMPOSITE',
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
  EXTERNAL_FRONTAL: 'EXTERNAL_FRONTAL',
  REST: 'REST',
  SOAP: 'SOAP',
  REST_SOAP: 'REST_SOAP',
  SOAP_REST: 'SOAP_REST',
};

// 服务类别
export const SERVICE_CATEGORY_CONSTANT = {
  // 内部接口
  INTERNAL: 'INTERNAL',
  // 外部接口
  EXTERNAL: 'EXTERNAL',
  // 组合接口
  COMPOSITE: 'COMPOSITE',
  // 数据源
  DS: 'DS',
  // 前置机
  EXTERNAL_FRONTAL: 'EXTERNAL_FRONTAL',
  // 文件协议
  FILE: 'FILE',
};

// 字符串类型
export const STRING_LIST = ['VARCHAR', 'CHAR', 'LONGTEXT'];

// 数字类型
export const NUMBER_LIST = ['INT', 'FLOAT', 'TINYINT', 'BIGINT', 'DECIMAL'];

// 日期类型
export const DATE_LIST = ['DATE'];

// 时间类型
export const DATETIME_LIST = ['DATETIME', 'TIMESTAMP'];

export const FRONTAL_MACHINE_STATUS = {
  EDIT: ['NEW', 'DISABLED'],
  ENABLE: ['DISABLED'],
  DISABLE: ['ONLINE', 'OFFLINE'],
};

// 接口文档地址
export const DOCS_URI = 'http://hzerodoc.saas.hand-china.com/zh/docs/user-guide';

export const FRONTAL_JOB_JOB_STATUS = {
  EDIT: ['NEW', 'MODIFIED', 'PUBLISHED'],
  PUBLISH: ['NEW', 'MODIFIED'],
  DISABLE: ['PUBLISHED'],
  ENABLE: ['DISABLED'],
};

// 动态消息队列配置选项分类
export const DYNAMIC_MQ_OPTION_CLASS = {
  BINDER: 'BINDER', // 消息中间件
  BINDING: 'BINDING', // 消息绑定
};

// 动态消息队列配置选项分类
export const BINDING_TYPE = {
  PRODUCER: 'PRODUCER', // 生产者
};

export const BINDER_TYPE_STATUS = [
  {
    status: 'RABBITMQ',
    color: 'green',
  },
  {
    status: 'ROCKETMQ',
    color: 'red',
  },
  {
    status: 'KAKFA',
    color: 'gold',
  },
  {
    status: 'REDIS',
    color: 'green',
  },
];

export const BINDING_TYPE_STATUS = [
  {
    status: 'PRODUCER',
    color: 'green',
  },
  {
    status: 'CONSUMER',
    color: 'gold',
  },
];

export const CHARSET_STATUS = [
  {
    status: 'UTF-8',
    color: 'green',
    text: 'UTF-8',
  },
  {
    status: 'GBK',
    color: 'gold',
    text: 'GBK',
  },
];

export const CONTENT_TYPE_STATUS = [
  {
    status: 'application/json',
    color: 'green',
    text: 'application/json',
  },
  {
    status: 'application/x',
    color: 'red',
    text: 'application/x-www-form-urlencoded',
  },
  {
    status: 'image/jpeg',
    color: 'gold',
    text: 'image/jpeg',
  },
  {
    status: 'image/png',
    color: 'green',
    text: 'image/png',
  },
  {
    status: 'multipart/form-data',
    color: 'orange',
    text: 'multipart/form-data',
  },
  {
    status: 'text/asp',
    color: 'blue',
    text: 'text/asp',
  },
  {
    status: 'text/css',
    color: 'yellow',
    text: 'text/css',
  },
  {
    status: 'text/html',
    color: 'blue',
    text: 'text/html',
  },
  {
    status: 'text/html; charset=UTF-8',
    color: 'lime',
    text: 'text/html',
  },
  {
    status: 'text/plain',
    color: 'green',
    text: 'text/plain',
  },
  {
    status: 'text/xml',
    color: 'purple',
    text: 'text/xml',
  },
];

// 需要展示Field的subject
export const SUBJECT = ['HEADER', 'JSON_BODY', 'XML_BODY'];

export const CAST_TYPE_MAP = {
  EXPR: 'EXPR', // 表达式
  SQL: 'SQL', // SQL转换
  URL: 'URL', // 接口调用
  LOV: 'LOV', // LOV值转换
  VAL: 'VAL', // 值映射
  DATE_TIME: 'DATE_TIME', // 日期时间
};

export const CAST_TYPE_TAGS = [
  {
    status: 'EXPR',
    color: 'gold',
  },
  {
    status: 'SQL',
    color: 'purple',
  },
  {
    status: 'URL',
    color: 'cyan',
  },
  {
    status: 'VAL',
    color: 'green',
  },
  {
    status: 'LOV',
    color: 'blue',
  },
  {
    status: 'DATE_TIME',
    color: 'orange',
  },
  {
    status: 'DESENSITIZE',
    color: 'red',
  },
];

export const TRANSFORM_STATUS = {
  NEW: 'NEW',
  PUBLISHED: 'PUBLISHED',
  MODIFYING: 'MODIFYING',
  OFFLINE: 'OFFLINE',
  DISABLED: 'DISABLED',
};

// 字段映射状态
export const FIELD_MAPPING_TAG_STATUS = [
  {
    status: 'NEW',
    color: 'blue',
  },
  {
    status: 'MODIFYING',
    color: 'orange',
  },
  {
    status: 'PUBLISHED',
    color: 'green',
  },
  {
    status: 'OFFLINE',
    color: 'red',
  },
];

// 数据映射状态
export const DATA_MAPPING_STATUS = {
  NEW: 'NEW',
  PUBLISHED: 'PUBLISHED',
  MODIFYING: 'MODIFYING',
};

// 数据映射状态
export const DATA_MAPPING_TAG_STATUS = [
  {
    status: 'NEW',
    color: 'blue',
  },
  {
    status: 'MODIFYING',
    color: 'orange',
  },
  {
    status: 'PUBLISHED',
    color: 'green',
  },
  {
    status: 'OFFLINE',
    color: 'red',
  },
];

// 来源类型
export const SOURCE_TYPE = {
  // 透传
  PASS_THROUGH: 'PASS-THROUGH',
};

// 服务状态
export const SERVICE_STATUS_TAGS = [
  {
    status: 'NEW',
    color: 'gold',
  },
  {
    status: 'OFFLINE',
    color: 'red',
  },
  {
    status: 'PUBLISHED',
    color: 'green',
  },
];

// 接口状态
export const INTERFACE_STATUS_TAGS = [
  {
    status: 'ENABLED',
    color: 'green',
  },
  {
    status: 'DISABLED',
    color: 'red',
  },
  {
    status: 'DISABLED_INPROGRESS',
    color: 'orange',
  },
  {
    status: 'NEW',
    color: 'blue',
  },
];

// 服务类型
export const SERVICE_TYPE_TAGS = [
  {
    status: 'SOAP',
    color: 'blue',
  },
  {
    status: 'REST',
    color: 'purple',
  },
];

// 服务类别
export const SERVICE_CATEGORY_TAGS = [
  {
    status: 'INTERNAL',
    color: 'blue',
  },
  {
    status: 'EXTERNAL',
    color: 'orange',
  },
  {
    status: 'COMPOSITE',
    color: 'green',
  },
  {
    status: 'DS',
    color: 'cyan',
  },
  {
    status: 'EXTERNAL_FRONTAL',
    color: 'gold',
  },
  {
    status: 'FILE',
    color: 'red',
  },
];

// 服务类别
export const TRANSFORM_TYPE = {
  // JSON 转 JSON
  REST_TO_REST: 'REST_TO_REST',
  // JSON 转 XML
  REST_TO_SOAP: 'REST_TO_SOAP',
  // XML 转 JSON
  SOAP_TO_REST: 'SOAP_TO_REST',
  // XML 转 XML
  SOAP_TO_SOAP: 'SOAP_TO_SOAP',
};

// 执行策略
export const EXECUTIVE_STRATEGY_TAG = [
  {
    status: 'ROUND_ROBIN',
    color: 'blue',
  },
  {
    status: 'WEIGHT',
    color: 'green',
  },
  {
    status: 'SPECIFIED_INSTANCE',
    color: 'orange',
  },
];

// 执行策略
export const EXECUTIVE_STRATEGY_CONSTANT = {
  ROUND_ROBIN: 'ROUND_ROBIN',
  WEIGHT: 'WEIGHT',
  SPECIFIED_INSTANCE: 'SPECIFIED_INSTANCE',
};

// MOCK模板类型
export const MOCK_TEMPLATE_TYPE_TAG = [
  {
    status: 'TXT',
    color: 'blue',
  },
  {
    status: 'JSON',
    color: 'green',
  },
  {
    status: 'FILE',
    color: 'gold',
  },
];

// mock的tabKey
export const MOCK_TAB_KEYS = {
  HEADER: 'HEADER',
  GET: 'GET',
  PATH: 'PATH',
  BODY: 'BODY',
};

// 请求/响应
export const ACTION_TYPE_CONSTANT = {
  REQ: 'REQ',
  RESP: 'RESP',
};

// 参数类型
export const PARAM_TYPE_CONSTANT = {
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  FILE: 'FILE',
  RAW: 'RAW',
  DATE_TIME: 'DATE_TIME',
};

export const TEMPLATE_TYPE_CONSTANT = {
  JSON: 'JSON',
  TXT: 'TXT',
  FILE: 'FILE',
};

export const GATEWAY_RATE_LIMIT_DIMENSION = {
  ORIGIN: 'ORIGIN',
  USER: 'USER',
  ROLE: 'ROLE',
  URL: 'URL',
};

// MOCK模板类型
export const VERSION_TAG = [
  {
    status: 'v1',
    color: 'blue',
  },
  {
    status: 'v2',
    color: 'green',
  },
];

export const ENABLE_TAG = [
  {
    status: '1',
    color: 'green',
    text: '启用',
  },
  {
    status: '0',
    color: 'red',
    text: '禁用',
  },
];

export const FORWARD_MATCH_TYPE_CONSTANT = {
  USER: 'USER',
  TENANT: 'TENANT',
};

// 用户/租户
export const USER_TENANT_TAG = [
  {
    status: 'USER',
    color: 'blue',
  },
  {
    status: 'TENANT',
    color: 'green',
  },
];

export const EXECUTION_TYPE_CONSTANT = {
  SELECT: 'SELECT',
  UPDATE: 'UPDATE',
  INSERT: 'INSERT',
  DELETE: 'DELETE',
};

export const DESENSITIZE_WAY_CONSTANTS = {
  MASK: 'MASK',
  SENSITIVE: 'SENSITIVE',
  HASH: 'HASH',
  REPLACE: 'REPLACE',
  TRUNCATION: 'TRUNCATION',
};
export const EXPR_TYPE_CONSTANTS = {
  DBO: 'DBO',
  SQL: 'SQL',
};
// 脱敏方式
export const DESENSITIZE_WAY_TAG = [
  {
    status: 'MASK',
    color: 'blue',
  },
  {
    status: 'TRUNCATION',
    color: 'green',
  },
  {
    status: 'HASH',
    color: 'orange',
  },
  {
    status: 'REPLACE',
    color: 'gold',
  },
  {
    status: 'SENSITIVE',
    color: 'red',
  },
];
// 来源类型
export const SOURCE_TYPE_TAG = [
  {
    status: 'SELF_DEFINE',
    color: 'green',
  },
  {
    status: 'PREDEFINE',
    color: 'orange',
  },
];
// 来源类型
export const SOURCE_TYPE_CONSTANTS = {
  SELF_DEFINE: 'SELF_DEFINE',
};
// 脱敏格式
export const DESENSITIZE_TYPE_CONSTANTS = {
  FRONT: 'FRONT',
  BEHIND: 'BEHIND',
  MIDDLE: 'MIDDLE',
};
// 加密方向
export const PACKET_ENCRYPT_DIRECTION_CONSTANTS = {
  IN: 'IN',
  OUT: 'OUT',
};
// 审批类型
export const APPROVAL_TYPE_CONSTANTS = {
  FUNCTION: 'FUNCTION',
  WORKFLOW: 'WORKFLOW',
};
// 审批状态
export const APPROVAL_STATUS_TAGS = [
  {
    status: 'NEW',
    color: 'blue',
  },
  {
    status: 'PENDING_REVIEW',
    color: 'orange',
  },
  {
    status: 'APPROVED',
    color: 'green',
  },
  {
    status: 'PROCESSING',
    color: 'cyan',
  },
  {
    status: 'RECALLED',
    color: 'gold',
  },
  {
    status: 'REJECTED',
    color: 'red',
  },
];
// 审批状态
export const APPROVAL_STATUS_CONSTANTS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  NEW: 'NEW',
  RECALLED: 'RECALLED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const SOAP11_REQUEST = {
  VERSION: 'SOAP11',
  SOAP12: 'SOAP12',
  REQUEST_HEADER: 'text/xml',
  SOAP12_REQUEST_HEADER: 'application/soap+xml',
};

export const SOAP12_REQUEST = {
  VERSION: 'SOAP12',
  REQUEST_HEADER: 'application/soap+xml',
};

// 导入状态
export const IMPORT_STATUS_TAGS = [
  {
    status: 'RUNNING',
    color: 'blue',
  },
  {
    status: 'PENDING',
    color: 'orange',
  },
  {
    status: 'COMPLETE',
    color: 'green',
  },
  {
    status: 'FAILED',
    color: 'red',
  },
];

// 平台接口响应状态
export const RESPONSE_STATUS_TAGS = [
  {
    status: 'success',
    color: 'green',
    text: intl.get('hzero.common.status.success').d('成功'),
  },
  {
    status: 'fail',
    color: 'red',
    text: intl.get('hzero.common.status.failure').d('失败'),
  },
];
// 调用方式
export const ASYNC_FLAG_TAGS = [
  {
    status: 0,
    color: 'blue',
    text: intl.get('hzero.common.status.sync').d('同步'),
  },
  {
    status: 1,
    color: 'purple',
    text: intl.get('hzero.common.status.async').d('异步'),
  },
];

// 调用方式
export const INVOKE_TYPE_TAGS = [
  {
    status: 'NORMAL',
    color: 'green',
  },
  {
    status: 'HEALTH-CHECK',
    color: 'blue',
  },
  {
    status: 'USECASE',
    color: 'orange',
  },
  {
    status: 'RETRY',
    color: 'gold',
  },
];

// 限流类型
export const RATE_LIMIT_TYPE_CONSTANTS = {
  SIGNAL: 'SIGNAL',
  FIXED_RATE: 'FIXED_RATE',
};

// 自定义/预定义
export const SOURCE_TAGS = [
  {
    status: 'default',
    color: 'orange',
  },
  {
    status: 'custom',
    color: 'green',
  },
];

// 自定义/预定义
export const SOURCE_TYPE_TAGS = [
  {
    status: 'PREDEFINE',
    color: 'orange',
  },
  {
    status: 'SELF_DEFINE',
    color: 'green',
  },
];

// 自定义/预定义
export const STATISTIC_LEVEL_TAGS = [
  {
    status: 'CLIENT',
    color: 'green',
  },
  {
    status: 'ROLE',
    color: 'orange',
  },
  {
    status: 'TENANT',
    color: 'blue',
  },
];

// 认证层级
export const AUTH_LEVEL_TAG = [
  {
    status: 'CLIENT',
    color: 'blue',
  },
  {
    status: 'INTERFACE',
    color: 'green',
  },
  {
    status: 'TENANT',
    color: 'orange',
  },
  {
    status: 'ROLE',
    color: 'gold',
  },
];
