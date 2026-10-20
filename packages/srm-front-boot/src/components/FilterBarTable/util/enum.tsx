export enum FieldEditMode {
  OUTPUT = 'output', // 文本展示
  INPUT = 'input', // 输入
}

// filterBar样式前缀
export const stylePrefix = 'c7n-pro-table-filter-bar';

// 聚合字段name
export const MergeFieldName = '_mergeField';

// meaing字段后置
export const MeaingFieldSuffix = '_meaning';

// 范围类型组件开始字段后置
export const RangeStartFieldSuffix = 'Before';

// 范围类型组件结束字段后置
export const RangeEndFieldSuffix = 'After';

// 排序查询字段name
export const SortFieldName = 'customizeOrderField';

export const noop = () => { };

// filter类型
export const FilterType = {
  SYSTEM: 'system', // 预定义
  CUSTOM: 'custom', // 自定义
};

export const FilterStatus = {
  UPDATE: 'update', // 更新
  CREATE: 'create', // 新建
  DELETE: 'delete', // 删除
};

export const FieldFlag = {
  LOCK: 'lock', // 固定字段
  DISPLAY: 'display', // 显示字段
  INPUT: 'input', // 输入框内字段
  VIRTUAL: 'virtual', // 虚拟字段，用于前端临时存值处理，不传给后端
  SORT: 'sortFlag', // 排序字段
  SKIP_CLEAR: 'skip_clear', // 清空时跳过
};

// 支持范围类型组件
export const RANGE_COMPONENTS = ['DATE_PICKER', 'INPUT_NUMBER'];

// 支持组件
export const SUPPORT_COMPONENTS = ['INPUT', 'INPUT_NUMBER', 'DATE_PICKER', 'LOV', 'SELECT'];

// ds 初始化标识
export const INIT_FLAG = '__init_flag__';