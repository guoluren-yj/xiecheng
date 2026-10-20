import { Moment } from 'moment';
import { ColumnAlign, LovFieldType } from './enum';
import { FieldType } from './data-set/enum';
import { FieldProps } from './data-set/Field';
import { DataSetProps } from './data-set/DataSet';

export type TimeStep = {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface TimeZoneFormatOptions {
  // 为 min 和 max 值格式化时区， 一般用于校验提示
  boundaryType?: 'max' | 'min';
}

export type TimeZone = string | ((moment: Moment, options: TimeZoneFormatOptions) => string);

export interface Form {
  getFields();

  getField(name: string);
}

export interface LovConfigItem {
  display?: string;
  conditionField?: string;
  conditionFieldLovCode?: string;
  conditionFieldType?: FieldType | LovFieldType;
  conditionFieldName?: string;
  conditionFieldSelectCode?: string;
  conditionFieldSelectUrl?: string;
  conditionFieldSelectTf?: string;
  conditionFieldSelectVf?: string;
  conditionFieldSequence: number;
  conditionFieldRequired?: boolean;
  conditionFieldDefaultSelect?: boolean;
  gridField?: string;
  gridFieldName?: string;
  gridFieldWidth?: number;
  gridFieldAlign?: ColumnAlign;
  gridFieldSequence: number;
  fieldProps?: Partial<FieldProps>;
}

export interface LovConfig {
  title?: string;
  width?: number;
  height?: number;
  customUrl?: string;
  lovPageSize?: string;
  lovItems: LovConfigItem[] | null;
  treeFlag?: 'Y' | 'N';
  parentIdField?: string;
  idField?: string;
  textField?: string;
  valueField?: string;
  placeholder?: string;
  editableFlag?: 'Y' | 'N';
  queryColumns?: number;
  dataSetProps?: DataSetProps | ((p: DataSetProps) => DataSetProps);
  transformSelectedData?: (value: object) => object;
}
