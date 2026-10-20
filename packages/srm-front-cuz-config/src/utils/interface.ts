/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export interface CtxParams{
  ctx: {
    tenantId: number|string;
    organizationId: number|string;
    loginName: string;
    realName: string;
    currentRoleCode: string;
    currentRoleId: number;
    currentRoleLabels: string[];
    currentRoleLevel: string;
    currentRoleName: string;
  };
  url: any;
  self: any;
}
export enum FieldType {
  NUMBER = "NUMBER",
  LOV = "LOV",
}
export interface Field {
  /** 聚合目标字段编码 */
  aggregationCode?: string;
  /** 是否为聚合字段 */
  aggregationFlag?: boolean;
  /** 跨列 */
  colSpan?: number;
  /** 跨行 */
  rowSpan?: number;
  /** 行 */
  formRow?: number;
  /** 列 */
  formCol?: number;
  /** 标签比例 */
  labelCol?: number;
  /** 组件比例 */
  wrapperCol?: number;
  /** 字段顺序 */
  gridSeq?: number;
  /** 冻结 */
  gridFixed?: "L" | "R" | "N";
  /** 列宽度 */
  gridWidth?: number;
  /** 字段属性？ */
  field: {
    defaultValue?: string;
    /** @deprecated */
    fieldCategory?: "TABLE_FIELD" | "VIRTUAL_FIELD";
    /** 字段编码（下划线） */
    fieldCode: string;
    /** 字段编码（驼峰） */
    fieldCodeCamel: string;
    /** 模型字段ID */
    fieldId: number | -1;
    /** 是否为多语言字段 */
    fieldMultiLang?: 0 | 1;
    /** 模型字段名称 */
    fieldName?: string;
    /** 是否为主键 */
    fieldPrimaryKey: boolean;
    /** 模型组件类型 */
    fieldType?: FieldType;
    /** 模型编码 */
    modelCode?: string;
  }
  /** 字段编码 */
  fieldCode: string;
  /** 编码别名，可为空 */
  fieldAlias?: string;
  /** 编码别名，为空时值为fieldCode的驼峰形式 */
  fieldCodeAlias: string;
  /** 可编辑？ */
  fieldEditable?: 0 | 1 | -1;
  /** 必输？ */
  fieldRequired?: 0 | 1 | -1;
  /** 显示 */
  visible?: 0 | 1 | -1;
  /** 模型字段ID */
  fieldId: number | -1;
  /** 字段名称 */
  fieldName?: string;
  /** ??? */
  mergeFlag?: 0 | 1;
  /** @deprecated 模型id */
  modelId: number;
  /** 启用默认值公式 */
  proDefaultFlag?: 0 | 1;
  /** 渲染方式：组件/文本 */
  renderOptions?: "WIDGET" | "TEXT";
  /** 是否预展示字段 */
  showFieldFlag?: 0 | 1;
  /** ??? */
  sortedFlag?: 0 | 1;
  /** 可排序 */
  sorter?: 0 | 1;
  /** 租户Id */
  tenantId?: number;
  /** 单元编码 */
  unitCode?: string;
  /** 是否在平台级必输 */
  unitFieldRequired?: 0 | 1 | -1;
  /** 单元Id */
  unitId?: number;
  /** ??? */
  unitSortedFlag?: number;
  /** 用户Id */
  userId?: number;
  /** 隐藏数字标记 */
  hiddenNumFlag?: 0 | 1;
  /** 组件配置 */
  widget?: {
    multipleFlag?: number;
    defaultValueMeaning?: any;
    lovCode?: string;
    linkTitle?: string;
    linkHref?: string;
    linkNewWindow?: string;
    numberMax?: number;
    numberMin?: number;
    areaMaxLine?: number;
    textMaxLength?: number;
    textMinLength?: number;
    numberPrecision?: number;
    defaultValue?: any;
    renderRule?: string;
    dateFormat?: string;
    bindField?: string;
    defaultValueMetadata?: any;
    isStandardField?: boolean|0|1;
    bucketName?: string;
    bucketDirectory?: string
    placeholder?: string;
    uploadShowFlag?: boolean | number;
    allowThousandth?: number;
    includeNowDayFlag?: 0 | 1;
  }
}