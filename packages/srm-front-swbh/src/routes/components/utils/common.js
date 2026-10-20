const PublishStatus = {
  // es索引发布(创建)状态，默认 `UNPUBLISH`<br />- `UNPUBLISH` 未发布<br />- `PUBLISH` 已发布 | 发布状态
  PUBLISHED: 'PUBLISHED', // 已发布
  UNPUBLISHED: 'UNPUBLISHED', // 未发布
  PENDING: 'PENDING', // 待发布
  ENABLE: 1, // 启用
  DISABLE: 0, // 禁用
  NORMAL: 'NORMAL', // 普通状态
  REMIND: 'REMIND', // 提醒状态
  WARN: 'WARN', // 警告状态
};
// 单据对象详情左侧菜单类型
const ObjectMenuType = {
  baseInfo: 'baseInfo', // 基础信息
  fieldList: 'fieldList', // 字段列表
  templateManagement: 'templateManagement', // 模板管理
  dynamicType: 'dynamicType', // 动态类型
  dynamicDefine: 'dynamicDefine', // 动态定义
  toDoDefine: 'toDoDefine', // 待办定义
  RFI: 'RFI',
  RFP: 'RFP',
  RFQ: 'RFQ',
};
export { PublishStatus, ObjectMenuType };
