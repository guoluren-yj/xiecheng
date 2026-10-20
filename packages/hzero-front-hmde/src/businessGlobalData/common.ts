export interface OperatorsItem {
  key: string;
  ele: any;
  len: number;
  title: string;
}

export type Operators = (OperatorsItem | boolean)[];

export enum PublishStatus {
  PUBLISHED = 'PUBLISHED', // 已发布
  MODIFIED = 'MODIFIED', // 已修改
  UNPUBLISHED = 'UNPUBLISHED', // 未发布
}

export const blockReg = /#(.[^#(\s)]*)#/g;

export const drillFormulaReg = /CASCADE\(.*?\)/g;

export const expBlock = /CASCADE\(.*?\)/g;

export interface IBlockDataItemProps {
  endColumn: number;
  endLineNumber: number;
  startColumn: number;
  startLineNumber: number;
}

export enum SourceType {
  PREDEFINE = 'PREDEFINE', // 系统预置
  PLATFORM = 'PLATFORM', // 平台自定义
  TENANT = 'TENANT', // 租户自定义
}

// 业务对象左侧菜单类型
export enum ObjectMenuType {
  baseInfo = 'baseInfo', // 基础信息
  fieldList = 'fieldList', // 字段列表
  exportTemplate = 'exportTemplate', // 导出模板
  importTemplate = 'importTemplate', // 导入模板
  optionList = 'optionList', // 值列表
  pages = 'pages', // 页面布局
  buttons = 'buttons', // 按钮管理
  rules = 'rules', // 业务规则
  erDiagram = 'erDiagram', // ER图
}

// 业务对象事件流程条件节点创建模式
export enum ConditionMode {
  simple = 'SIMPLE_MODE',
  expression = 'EXPRESSION_MODE',
}
