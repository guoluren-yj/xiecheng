// searchBar样式前缀
export const stylePrefix = 'ssrc-c7n-pro-table-search-bar';

// lov,select下拉菜单样式名, 方便覆盖下拉框样式
export const selectOrLovPopupCls = `${stylePrefix}-pop-cls`;

// 聚合字段name
export const MergeFieldName = '_mergeField';

// 筛选条件字段后缀
export const ComparisonSetFieldSuffix = '_comparisonSet';

// meaing字段后置
export const MeaingFieldSuffix = '_meaning';

// 范围类型组件开始字段后置
export const RangeStartFieldSuffix = 'Before';

// 范围类型组件结束字段后置
export const RangeEndFieldSuffix = 'After';

// 排序查询字段name
export const SortFieldName = 'customizeOrderField';

export const noop = () => {};

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

// 组件默认筛选条件
export const ComponentDefaultComparsion = ['IN', '=', 'L_LIKE', 'R_LIKE', 'LIKE'];

// 过滤重置
export const omitFieldProps = [
  'name',
  'label',
  'type',
  'format',
  'textField',
  'valueField',
  'lookupCode',
  'lovCode',
  'multiple',
  'options',
];

// 支持范围类型组件
export const RANGE_COMPONENTS = ['DATE_PICKER', 'INPUT_NUMBER'];
// export const RANGE_COMPONENTS = ['DATE_PICKER'];

// 支持组件
export const SUPPORT_COMPONENTS = ['INPUT', 'INPUT_NUMBER', 'DATE_PICKER', 'LOV', 'SELECT'];
