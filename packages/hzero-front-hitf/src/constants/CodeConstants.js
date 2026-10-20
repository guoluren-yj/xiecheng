import intl from 'hzero-front/lib/utils/intl';

/**
 * 集值
 */

// 计费类型
export const CHARGE_TYPE = 'HITF.CHARGE_TYPE';
export const CHARGE_TYPE_FIELDS = {
  // 接口
  INTERFACE: 'INTERFACE',
  // 服务
  SERVER: 'SERVER',
};

// 计费类型Tag
export const CHARGE_TYPE_TAGS = [
  {
    status: 'INTERFACE',
    color: 'blue',
  },
  {
    status: 'SERVER',
    color: 'green',
  },
];

// 结算周期
export const SETTLEMENT_PERIOD = 'HITF.SETTLEMENT_PERIOD';

// 付费模式
export const PAYMENT_MODEL = 'HCHG.RULE.PAYMENT_MODEL';
export const PAYMENT_MODEL_FIELDS = {
  // 预付费
  BEFORE: 'BEFORE',
  // 后付费
  AFTER: 'AFTER',
};

// 付费模式Tag
export const PAYMENT_MODEL_TAGS = [
  {
    status: 'BEFORE',
    color: 'blue',
  },
  {
    status: 'AFTER',
    color: 'green',
  },
];

// 计费方式
export const CHARGE_METHOD = 'HCHG.RULE.CHARGE_METHOD';
export const CHARGE_METHOD_FIELDS = {
  // 计量
  COUNT: 'COUNT',
  // 总包
  PACKAGE: 'PACKAGE',
};

// 计费方式Tag
export const CHARGE_METHOD_TAGS = [
  {
    status: 'COUNT',
    color: 'blue',
  },
  {
    status: 'PACKAGE',
    color: 'green',
  },
];

// 计费设置状态
export const CHARGE_SET_STATUS = 'HITF.CHARGE_SET_STATUS';
export const CHARGE_SET_STATUS_FIELDS = {
  // 新建
  NEW: 'NEW',
  // 已发布
  PUBLISHED: 'PUBLISHED',
  // 已撤销
  CANCELLED: 'CANCELLED',
};

// 计费设置状态Tag
export const CHARGE_SET_STATUS_TAGS = [
  {
    status: 'NEW',
    color: 'blue',
  },
  {
    status: 'PUBLISHED',
    color: 'green',
  },
  {
    status: 'CANCELLED',
    color: 'red',
  },
];

// 组合计费设置状态
export const CHARGE_GROUP_STATUS = 'HITF.CHARGE_GROUP_STATUS';
export const CHARGE_GROUP_STATUS_FIELDS = {
  // 新建
  NEW: 'NEW',
  // 已发布
  PUBLISHED: 'PUBLISHED',
  // 已撤销
  CANCELLED: 'CANCELLED',
};

// 组合计费设置状态Tag
export const CHARGE_GROUP_STATUS_TAGS = [
  {
    status: 'NEW',
    color: 'blue',
  },
  {
    status: 'PUBLISHED',
    color: 'green',
  },
  {
    status: 'CANCELLED',
    color: 'red',
  },
];

// 组合计费服务类型
export const GROUP_SERVER_TYPE = 'HITF.GROUP_SERVER_TYPE';
export const GROUP_SERVER_TYPE_FIELDS = {
  // 接口
  INTERFACE: 'INTERFACE',
  // 服务
  SERVER: 'SERVER',
};

// 组合计费类型Tag
export const GROUP_SERVER_TYPE_TAGS = [
  {
    status: 'INTERFACE',
    color: 'blue',
  },
  {
    status: 'SERVER',
    color: 'green',
  },
];

// 计费规则Lov
export const CHARGE_RULE = 'HCHG.RULE_HEADER';

// 计费服务Lov
export const CHARGE_SERVER = 'HITF.CHARGE_SERVER';

// 计费接口Lov
export const CHARGE_INTERFACE = 'HITF.CHARGE_INTERFACE';

// 服务类型
export const PURCHASE_TYPE = 'HITF.PURCHASE_TYPE';
export const PURCHASE_TYPE_FIELDS = {
  // 接口
  INTERFACE: 'INTERFACE',
  // 服务
  SERVER: 'SERVER',
  // 组合
  GROUP: 'GROUP',
};

// 服务类型Tag
export const PURCHASE_TYPE_TAGS = [
  {
    status: 'INTERFACE',
    color: 'blue',
  },
  {
    status: 'SERVER',
    color: 'green',
  },
  {
    status: 'GROUP',
    color: 'orange',
  },
];

// 服务可用状态
export const AVAILABLE_STATUS = 'HITF.AVAILABLE_STATUS';
export const AVAILABLE_STATUS_FIELDS = {
  // 账单支付
  NEED_PAY: 'NEED_PAY',
  // 可用
  AVAILABLE: 'AVAILABLE',
  // 结算中
  BILLING: 'BILLING',
  // 已到期
  USE_UP: 'USE_UP',
};

// 服务类型Tag
export const AVAILABLE_STATUS_TAGS = [
  {
    status: 'NEED_PAY',
    color: 'blue',
  },
  {
    status: 'AVAILABLE',
    color: 'green',
  },
  {
    status: 'BILLING',
    color: 'orange',
  },
  {
    status: 'USE_UP',
    color: 'red',
  },
];
// 租户
export const TENANT = 'HPFM.TENANT';
// 服务地址
export const ROUTE_INFORMATION = 'HADM.ROUTE_INFORMATION';
// 证书
export const CERTIFICATE = 'HPFM.CERTIFICATE';
// 证书 - 租户
export const CERTIFICATE_ORG = 'HITF.CERTIFICATE';
// 加密方式
export const SOAP_WSS_PASSWORD_TYPE = 'HITF.SOAP_WSS_PASSWORD_TYPE';
// SOAP版本
export const SOAP_VERSION = 'HITF.SOAP_VERSION';

export const SOAP_REQUEST_TEMPLATE = 'HITF.SOAP_REQUEST_TEMPLATE';
// 请求方式
export const REQUEST_METHOD = 'HITF.REQUEST_METHOD';
// 请求头
export const REQUEST_HEADER = 'HITF.REQUEST_HEADER';
// 发布类型
export const SERVICE_TYPE = 'HITF.SERVICE_TYPE';
// 发布类型
export const INTERFACE_STATUS = 'HITF.INTERFACE_STATUS';
// 服务类别
export const SERVICE_CATEGORY = 'HITF.SERVICE_CATEGORY';
// 协议
export const PROTOCOL = 'HITF.PROTOCOL';
// 数据源类型
export const DATABASE_TYPE = 'HPFM.DATABASE_TYPE';
// 数据源
export const DATA_SOURCE = 'HITF.DATASOURCE';
// 表达式类型
export const EXPRESSION_TYPE = 'HITF.SVC.EXPRESSION_TYPE';
// 属性字段类型
export const SVC_COL_TYPE = 'HITF.SVC.COL_TYPE';
// 参数类型
export const SVC_PARAM_TYPE = 'HITF.SVC.PARAM_TYPE';
// 操作符
export const SVC_MODEL_OPERATOR = 'HITF.SVC.MODEL_OPERATOR';
// 数据源执行类型
export const SVC_MODEL_EXECUTION_TYPE = 'HITF.SVC.MODEL_EXECUTION_TYPE';
// 队列信息消费方式
export const MQ_CONSUME_METHOD = 'HITF.MQ_CONSUME_METHOD';
// 队列消费者类型
export const CONSUMER_TYPE = 'HITF.CONSUMER_TYPE';
//  消息队列tag
export const MQ_TOPIC_TAG = 'HITF.MQ_TOPIC_TAG';
// 消息队列topic
export const MQ_TOPIC = 'HITF.MQ_TOPIC';
// 消息队列组
export const MQ_GROUP = 'HITF.MQ_GROUP';
// 队列消费者列表
export const MQ_CONSUMER_LIST = 'HIFT.MQ_CONSUMER_LIST';

// 结构分类
export const STRUCTURE_CATEGORY = 'HITF.STRUCTURE_CATEGORY';
export const STRUCTURE_CATEGORY_FIELDS = {
  // 结构映射
  MAPPING: 'MAPPING',
};

// 结构分类Tags
export const STRUCTURE_CATEGORY_TAGS = [
  {
    status: 'MAPPING',
    color: 'blue',
  },
];

// 业务用途
export const STRUCTURE_BIZ_USAGE = 'HITF.STRCTURE.LINE.BIZ_USAGE';

// 业务用途Tags
export const STRUCTURE_BIZ_USAGE_TAGS = [
  {
    status: 'ITG_PAYLOAD',
    color: 'blue',
  },
];

// 启用/禁用
export const ENABLED_FLAG = 'HPFM.ENABLED_FLAG';
// 是/否
export const YES_OR_NO_FLAG = 'HPFM.FLAG';
export const ENABLED_FLAG_FIELDS = {
  // 是
  YES: 1,
  // 否
  NO: 0,
};

// 字段类型
export const STRUCTURE_FIELD_TYPE = 'HITF.STRCTURE.LINE.FILED_TYPE';
export const STRUCTURE_FIELD_TYPE_FIELDS = {
  // 对象
  OBJECT: 'OBJECT',
  // 数组
  ARRAY: 'ARRAY',
  // 字符
  STRING: 'STRING',
  // 数字
  DIGITAL: 'DIGITAL',
  // 布尔
  BOOL: 'BOOL',
};
export const STRUCTURE_FIELD_TYPE_VALUES = {
  OBJECT: {
    value: 'OBJECT',
    meaning: intl.get('hitf.structureField.model.structureField.object').d('对象'),
  },
  ARRAY: {
    value: 'ARRAY',
    meaning: intl.get('hitf.structureField.model.structureField.array').d('数组'),
  },
  STRING: {
    value: 'STRING',
    meaning: intl.get('hitf.structureField.model.structureField.char').d('字符'),
  },
  DIGITAL: {
    value: 'DIGITAL',
    meaning: intl.get('hitf.structureField.model.structureField.number').d('数字'),
  },
  BOOL: {
    value: 'BOOL',
    meaning: intl.get('hitf.structureField.model.structureField.boolean').d('布尔'),
  },
};

// 构建方式
export const STRUCTURE_COMPOSITION = 'HITF.STRCTURE.COMPOSITION';
export const STRUCTURE_COMPOSITION_FIELDS = {
  // 行结构
  ROW: 'ROW',
  // 树结构
  TREE: 'TREE',
};

// 构建方式Tags
export const STRUCTURE_COMPOSITION_TAGS = [
  {
    status: 'ROW',
    color: 'blue',
  },
  {
    status: 'TREE',
    color: 'green',
  },
];

// 中间件类型
export const DYNAMIC_MQ_BINDER_TYPE = 'HITF.DYNAMIC_MQ.BINDER_TYPE';
// 绑定类型
export const DYNAMIC_MQ_BINDING_TYPE = 'HITF.DYNAMIC_MQ.BINDING_TYPE';
// 字符集
export const CHARSET = 'HITF.CHARSET';
// 内容类型
export const CONTENT_TYPE = 'HITF.CONTENT_TYPE';
// 参数类型
export const PARAM_VALUE_TYPE = 'HITF.PARAM_VALUE_TYPE';
// 断言主题
export const ASSERTION_SUBJECT = 'HITF.ORCH.ASSERTION_SUBJECT';
// 断言操作符
export const ASSERTION_CONDITION = 'HITF.ORCH.ASSERTION_CONDITION';
// 映射转化类型
export const TRANSFORM_TYPE = 'HITF.TRANSFORM_TYPE';
// 数据转换来源数据类型
export const CAST_DATA_TYPE = 'HITF.CAST_DATA_TYPE';
// 数据转换类型
export const CAST_TYPE = 'HITF.CAST_TYPE';
// 映射字段类型
export const MAPPING_FIELD_TYPE = 'HITF.MAPPING_FIELD_TYPE';
// 映射 - 平台级
export const TRANSFORM_LIST_SITE = 'HITF.TRANSFORM_LIST.SITE';
// 映射
export const TRANSFORM_LIST = 'HITF.TRANSFORM_LIST';
// 转化 - 平台级
export const CAST_LIST_SITE = 'HITF.CAST_LIST.SITE';
// 转化
export const CAST_LIST = 'HITF.CAST_LIST';
// 数据转化比较判定条件类型
export const CAST_COMPARISON_TYPE = 'HITF.CAST_COMPARISON_TYPE';
// 数据转化映射来源多条件连接符
export const CAST_CONJUNCTION_TYPE = 'HITF.CAST_CONJUNCTION_TYPE';
// 数据转化表达式字段来源类型
export const CAST_EXPR_FIELD_SOURCE_TYPE = 'HITF.CAST_EXPR_FIELD_SOURCE_TYPE';
// 语言
export const LANGUAGE = 'HITF.LANGUAGE';
// 字段映射版本状态
export const TRANSFORM_STATUS = 'HITF.TRANSFORM_STATUS';
// 数据映射映射版本状态
export const CAST_HEADER_STATUS = 'HITF.CAST_HEADER.STATUS';
// 数据源
export const DATASOURCE = 'HITF.DATASOURCE';
// 服务领域
export const SERVER_DOMAIN_LIST = 'HITF.SERVER_DOMAIN_LIST';
// 来源类型
export const SOURCE_TYPE = 'HITF.SOURCE_TYPE';
// 请求状态
export const RESPONSE_STATUS = 'HITF.RESPONSE_STATUS';
// 清除类型
export const CLEAR_TYPE = 'HITF.TRACE_LOG.CLEAR_TYPE';
// 服务状态
export const SERVICE_STATUS = 'HITF.INTERFACE_SERVER.STATUS';
// 日志业务状态
export const BUSINESS_STATE = 'HITF.BUSINESS_STATE';
// 日志调用详情
export const LOG_RECORD_TYPE = 'HITF.LOG_RECORD_TYPE';
// 告警代码
export const ALERT_CODE = 'HITF.ALERT_CODE';
// 角色权限
export const PERMISSION_ROLE = 'HITF.PERMISSION_ROLE';
// 透传调用频次耗时统计频次
export const INVOKE_STATISTICS_FREQUENCY = 'HITF.INVOKE_STATISTICS.FREQUENCY';
// 透传调用频次耗时统计层级
export const INVOKE_STATISTICS_LEVEL = 'HITF.INVOKE_STATISTICS.LEVEL';
// 接口透传
export const INVOKE_ABLE_INTERFACE = 'HITF.INVOKEABLE_INTERFACE';
// 透传调用频次耗时统计指标
export const INVOKE_STATISTICS_INDICATOR = 'HITF.INVOKE_STATISTICS.INDICATOR';
// 映射层级值
export const PACKET_MAPPING_LEVEL = 'HITF.PACKET_MAPPING.LEVEL';
// 模型可执行API
export const MODELER_EXE_API = 'HITF.MODELER_EXE_API';
// 模型应用
export const MODELER_APP_LIST = 'HITF.MODELER_APP_SQL';
// 应用视图
export const MODELER_DARASOURCE = 'HITF.MODELER_DARASOURCE';
// 透传调用频次耗时对应的时间间隔
export const INVOKE_STATISTICS_TIME_GAP = 'HITF.INVOKE_STATISTICS.TIME_GAP';
// 认证层级
export const AUTH_LEVEL = 'HITF.AUTH_LEVEL';
// 认证模式
export const AUTH_TYPE = 'HITF.AUTH_TYPE';
// 认证层级值
export const SELF_TENANT_ORG = 'HITF.SELF_TENANT';
// 认证层级值
export const USER_ROLE = 'HITF.USER_ROLE';
// 认证层级值
export const APPLICATION_CLIENT = 'HITF.APPLICATION.CLIENT';
// 独立值集——平台
export const SITE_LOV_IDP = 'HITF.PLATFORM_IDP_LOV';
// 独立值集——租户
export const LOV_IDP = 'HPFM.LOV_IDP';
// 时区
export const TIME_ZONE = 'HIAM.TIME_ZONE';
// 时间格式
export const DATE_FORMAT = 'HITF.DATE_FORMAT';
// 版本
export const INVOKE_VERSION = 'HITF.INVOKE_VERSION';
// 透传地址版本
export const INVOKE_URL_VERSION = 'HITF.INVOKE_URL_VERSION';
// DS请求方法
export const DS_REQUEST_METHOD = 'HITF.DS_REQUEST_METHOD';
// 执行策略
export const EXECUTIVE_STRATEGY = 'HITF.EXECUTIVE_STRATEGY';
// 模板类型
export const MOCK_TEMPLATE_TYPE = 'HITF.MOCK_TEMPLATE_TYPE';
// HTTP状态码
export const HTTP_STATUS_CODE = 'HITF.HTTP_STATUS_CODE';
// MOCK参数可用父节点
export const MOCK_PARAM_PARENT = 'HITF.MOCK_PARAM_PARENT';
// 用户
export const USER = 'HITF.USER';
// 用户-租户级
export const USER_ORG = 'HITF.USER.ORG';
// 角色
export const ROLE = 'HITF.RATE_LIMIT.ROLE';
// 接口MOCK
export const MOCK_GROUP_LIST = 'HITF.MOCK_GROUP_LIST';
// 服务路由
export const SERVICE_ROUTE = 'HITF.SERVICE_ROUTE';
// 接口
export const SERVER_INTERFACE = 'HITF.SERVER_INTERFACE';
// 类型
export const FORWARD_MATCH_TYPE = 'HITF.FORWARD_MATCH_TYPE';
// 用户
export const INTERFACE_FORWARD_USER = 'HITF.INTERFACE_FORWARD_USER';
// 租户
export const INTERFACE_FORWARD_TENANT = 'HITF.INTERFACE_FORWARD_TENANT';
// 脱敏方式
export const DESENSITIZE_WAY = 'HITF.DESENSITIZE_WAY';
// 脱敏规则
export const DESENSITIZE_RULE = 'HITF.DESENSITIZE_RULE';
export const DESENSITIZE_RULE_ORG = 'HITF.DESENSITIZE_RULE_ORG';
// 来源类型
export const DESENSITIZE_SOURCE_TYPE = 'HITF.DESENSITIZE_SOURCE_TYPE';
// 脱敏格式
export const DESENSITIZE_TYPE = 'HITF.DESENSITIZE_TYPE';
// 掩码字符
export const MASK_STR = 'HITF.MASK_STR';
// 加密策略
export const PACKET_ENCRYPT_POLICY = 'HITF.SVC.PACKET_ENCRYPT_POLICY';
// 加密算法
export const PACKET_ENCRYPT_ALGORITHM = 'HITF.SVC.PACKET_ENCRYPT_ALGORITHM';
// 加密方向
export const PACKET_ENCRYPT_DIRECTION = 'HITF.SVC.PACKET_ENCRYPT_DIRECTION';
// 消息发送配置
export const MSG_SEND_CONFIG = 'HALT.MSG_SEND_CONFIG';
// 审批类型
export const APPROVAL_TYPE = 'HITF.APPROVAL_TYPE';
// 工作流
export const DEF_WORKFLOW = 'HWKF.GL.DEF_WORKFLOW';
// 审批状态
export const APPLY_STATUS = 'HITF.APPLY_STATUS';
// 导入状态
export const IMPORT_STATUS = 'HITF.IMPORT_STATUS';
// 调用类型
export const INVOKE_TYPE = 'HITF.INVOKE_TYPE';
// 清空类型
export const INTERFACE_LOG_CLEAR_TYPE = 'HITF.INTERFACE_LOG.CLEAR_TYPE';
// 限流类型
export const RATE_LIMIT_TYPE = 'HADM.RATE_LIMIT_TYPE';
// 可创建限流规则的接口
export const RATE_LIMIT_AVALIABLE_INTERFACE = 'HITF.RATE_LIMIT_AVALIABLE_ITF';
export const RATE_LIMIT_AVALIABLE_INTERFACE_ORG = 'HITF.RATE_LIMIT_AVALIABLE_ITF_ORG';
// 测试用例-平台
export const SITE_USE_CASE = 'HITF.SITE.USE_CASE';
// 测试用例-租户
export const USE_CASE = 'HITF.USE_CASE';
// 可选参数
export const HTTP_CONFIG_PROPERTY = 'HITF.HTTP_CONFIG_PROPERTY';
// 角色来源
export const HIAM_ROLE_SOURCE = 'HIAM.ROLE_SOURCE';
// 角色层级
export const HIAM_RESOURCE_LEVEL = 'HIAM.RESOURCE_LEVEL';
// 统计维度
export const STATISTICS_LEVEL = 'HITF.STATISTICS_LEVEL';
// 角色-租户级
export const ROLES_ORG = 'HITF.TENANT.ROLES_ORG';
// 角色
export const ROLES = 'HITF.TENANT.ROLES';
// 来源类型
export const SOURCE = 'HITF.SOURCE';
// 请求类型
export const BUS_EXECUTION_TYPE = 'HITF.BUS_EXECUTION_TYPE';
// 值类型
export const BUS_OBJ_VALUE_TYPE = 'HITF.BUS_OBJ_VALUE_TYPE';
// 环境变量
export const BUS_OBJ_EVN_VAR = 'HITF.BUS_OBJ_EVN_VAR';
// 操作符
export const BUS_OBJ_OPERATOR = 'HITF.BUS_OBJ_OPERATOR';
// 组合应用定义 - 编排策略
export const COMPOSE_POLICY = 'HITF.COMPOSE_POLICY';
// 组合应用定义 - 服务类型
export const APP_SERVICE_TYPE = 'HITF.APP_SERVICE_TYPE';
// 组合应用定义 - 开放接口
export const COMPOSE_ENTRY_INTERFACE = 'HITF.COMPOSE_ENTRY_INTERFACE';
// 应用大类
export const APP_MAJOR_CATEGORY = 'HITF.APP_MAJOR_CATEGORY';
// 应用小类
export const APP_MINOR_CATEGORY = 'HITF.APP_MINOR_CATEGORY';
// 组合应用定义 - 实例接口
export const COMPOSE_INST_INTERFACE_ORG = 'HITF.COMPOSE_INST_INTERFACE_ORG';
export const COMPOSE_INST_INTERFACE = 'HITF.COMPOSE_INST_INTERFACE';
