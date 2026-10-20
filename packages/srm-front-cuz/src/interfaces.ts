import { ReactElement, ReactNode } from 'react';

export interface Item {
  item: any;
}

export interface ItemCollectons {
  [fieldCode: string]: Item;
}

export interface FormItem {
  item: ReactElement | ReactNode;
  row: number;
  col: number;
  colProps?: any;
  rowProps?: any;

  [extProp: string]: any;
}

export interface ColumnItem extends Item {
  seq: number;
}

export interface FormItemCollectons {
  [fieldCode: string]: FormItem;
}

export interface ColumnCollectons {
  [fieldCode: string]: ColumnItem;
}

export interface UnitConfig {
  fields: FieldConfig[];
  maxCol?: number;
  readOnly?: boolean;
  unitCode?: string;
  unitType?: string;
  unitAlias?: UnitAlias[];
  labelCol?: number;
  wrapperCol?: number;
  gridSummary?: 1 | 0 | -1;
  gridMaxPageCount?: number;

  [extProp: string]: any;
}

export interface FieldConfig {
  fieldCode: string;
  fieldName?: string;
  seq?: number;
  formRow?: number;
  formCol?: number;
  fixed?: string;
  width?: number;
  fieldType?: string;
  defaultActive?: number;
  required: number;
  editable: number;
  visible: number;
  asText?: number;
  multipleFlag?: number;
  defaultValueMeaning?: any;
  lovMappings?: {
    sourceCode: string;
    targetCode: string;
    lovInfo?: { valueField: string, displayField: string },
    sourceDisplayField?: string;
  }[];
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
  labelCol?: number;
  wrapperCol?: number;
  defaultValue?: any;
  renderRule?: string;
  renderOptions?: string;
  dateFormat?: string;
  /** 调整，非接口返回属性 */
  conValidDTO?: ConValid;
  /** 调整，非接口返回属性 */
  defaultValueConDTO?: ConValid;
  /** 调整，非接口返回属性 */
  fieldNameConDTO?: ConValid;
  /** 气泡提示fx，非接口返回属性 */
  helpMessageConDTO?: ConValid;
  attachmentTplConDTO?: ConValid;
  conditionHeaderDTOs?: ConditionHeaderDTO[];
  selfValid?: Function; // 非接口返回属性
  paramList?: ParamList[];
  lovInfo?: any;
  bindField?: string;
  defaultValueMetadata?: any;
  isStandardField?: boolean | 0 | 1;
  bucketName?: string;
  bucketDirectory?: string;
  templateUUID?: string;
  proDefaultFlag?: 0 | 1;
  hiddenNumFlag?: 0 | 1;
  placeholder?: string;
  uploadShowFlag?: boolean | number;
  showFieldFlag?: number;
  allowThousandth?: number;
  breakpointResumeFlag?: number; // 断点续传标志
  uploadRecordFlag?: number; // 展示操作记录
  isLovAutoExt?: boolean; // 自动生成字段标识,非ui接口返回
  aggregationCode?: string;
  aggregationFlag?: boolean;
  defaultValueReplaceFlag?: boolean; // 默认值是否取代当前值，只对c7nui生效

  attachmentType?: "normal" | "picture";
  /** 是否启用日历定义 */
  autoDisabledDate?: 1 | 0 | -1;
  /** 特性值，逗号分隔字符串*/
  specialProps?: string;
  [extProp: string]: any;

  includeNowDayFlag?: 0 | 1;
  attachmentLimitNum?: number;
  columnLength?: number;
  autoCast?: -1 | string;
  isH0?: boolean;
  trimFlag?: number;
}

export interface ParamList {
  paramKey: string;
  paramType: string;
  paramValue?: string;
  paramUnitCode?: string;
  paramFieldCode?: string;
}

export interface ConValid {
  conValidList: {
    conExpression?: string;
    errorMessage?: string;
    [extProp: string]: any;
  }[];
  conLineList: {
    conCode: string | number;
    sourceFieldCode: string;
    sourceUnitCode: string;
    conExpression: string;
    targetType: string;
    targetFieldCode?: string;
    targetValue: any;
  }[];
}

export interface ConditionHeaderDTO {
  conLineList: any;
  conType: string;
  conExpression?: string;
  lines: {
    conCode: string | number;
    sourceFieldCode: string;
    sourceUnitCode: string;
    conExpression: string;
    targetType: string;
    targetFieldCode?: string;
    targetValue: any;
  }[];
}

export interface UnitAlias {
  unitCode: string;
  alias: string;
}

export interface CtxParams {
  ctx: {
    encryptId: string;
    id: number | string;
    tenantId: number | string;
    organizationId: number | string;
    loginName: string;
    realName: string;
    currentRoleCode: string;
    currentRoleId: number;
    currentRoleLabels: string[];
    currentRoleLevel: string;
    currentRoleName: string;
    additionInfo: {
      defaultCompanyId: number | string;
      organizationNum: string;
    };
  };
  url: any;
  self: any;
}

/** 记录个性化按钮回调可能的参数类型 */
function EventListenerCallback (cache, ctxParams, data: object | undefined, a4: "record" | {dataSource, form},  others: {setLoading}) {

}