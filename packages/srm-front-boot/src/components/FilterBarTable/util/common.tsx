import type { ReactNode } from 'react';
import React from 'react';
import moment from 'moment';
import type { DataSet } from 'choerodon-ui/pro';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import type { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { isString, isEmpty, isNil, isEqual, isArray, keys } from 'lodash';

import { lovQueryAxiosConfig } from '../../../utils/c7nUiConfig';
import styles from "../index.less";

import {
  FieldFlag,
  MeaingFieldSuffix,
  RangeStartFieldSuffix,
  RangeEndFieldSuffix,
} from './enum';

// 个性化单元字段
export interface fieldProperties extends FieldProps {
  fieldName?: string; // 字段名称
  widget?: any; // 组件
  displayField?: string; // 值集显示字段
  defaultValueMeaning?: any; // 默认值翻译,适用于Lov、Select
  display?: boolean; // 是否为显示字段标识
  lock?: boolean; // 是的为固定字段标识
  rangeTime?: boolean; // DatePicker是否为范围日期选择标识
  record?: Record | undefined; // DateSet Record
  lovInfo?: any; // 值集配置
  virtual?: boolean; // 虚拟字段
  rank?: number; // 排序
  fieldWidget?: string; // 组件类型
  editorProps?: object; // 组件属性
  modelCode?: string; // 字段所属模型
  fieldCode?: string; // 字段编码
  fieldAlias?: string; // 字段别名
  lovValueRecords?: object; // lov翻译数据
  showFlag?: 0 | 1; // 字段显示在可选列表下标识，0-不显示，1-显示
  usedFlag?: 0 | 1; // 字段显示标识，0-不显示，1-显示
  fixedFlag?: 0 | 1; // 字段固定标识，0-不固定，1-固定
  sortedFlag?: 0 | 1; // 字段可排序标识，0-不可排序，1-可排序
  fieldVisible?: 0 | 1; // 字段显示隐藏标识，0-不显示，1-显示
  gridSeq?: number; // 位置,
  originDefaultValue?: any; // 原始默认值，用于保存公式类型默认值
  proDefaultFlag?: 0 | 1; // 默认值类型，0-固定值，1-公式
  fieldEditable?: 0 | 1; // 是否可编辑，0-否，1-是
  helpMessage?: string; // 气泡提示
  originFieldCode?: string; // 虚拟字段关联的原字段
  backgroundText?: string; // 背景文字
  forceQuery?: boolean; // 强制查询，不受显示隐藏影响
  custType?: string; // 字段类型，STD:标准字段
  multipleFlag?: boolean;
  optionsData?: any[]; // 下拉框选项数据
  transformValue?: (value: any, record: Record) => any; // 转换参数值
  lovParamProps?: any; // lov 查询参数属性
}

// 不绑定个性化单元时的字段
export interface normalField extends FieldProps {
  merge?: boolean; // 合并查询, 默认为false
  sortFlag?: boolean; // 支持排序, 默认为false
  lock?: boolean; // 固定字段，不可隐藏, 默认为false
  display?: boolean; // 默认显示, 默认为false
  visible?: boolean; // 可选,默认为true，设为false后不可选
  forceQuery?: boolean; // 可选,默认为false,固定查询,无论是否隐藏
  optionsData?: any[]; // 下拉框选项数据
  transformValue?: (value: any, record: Record) => any; // 转换参数值
  lovParamProps?: any; // lov 查询参数属性
}

export interface queryProps {
  params: object;
  fields: [fieldProperties];
  dataSet: DataSet;
}

export interface fieldChangeProps {
  dataSet: DataSet;
  record: Record;
  name: string;
  value: any;
  oldValue: any;
}

export interface FilterBarConfigProperties {
  mergeSearchValue?: string | string[]; // 合并查询
  mergeFieldProps?: Omit<FieldProps & { transformValue?: (value: any) => any }, 'name' | 'type'>; // 合并查询字段属性
  autoQuery?: boolean; // 自动查询，默认为true
  defaultExpand?: boolean; // 默认展开或收起字段，默认展开
  expandable?: boolean; // 启用展开收起字段功能，false不启用
  expand?: boolean; // 展开收起字段状态控制
  defaultCollpase?: boolean; // 默认展开或收起筛选，默认展开
  collpaseble?: boolean; // 启用展开收起筛选功能，false不启用
  collpase?: boolean; // 展开收起筛选状态控制
  editorProps?: object; // 组件属性
  beforeQuery?: (props: queryProps) => PromiseLike<boolean> | boolean; // 查询前回调，返回false则不执行查询
  onQuery?: (props: queryProps) => void; // 自定义查询
  onReset?: () => void; // 重置回调
  onClear?: () => void; // 清空回调
  onRefresh?: () => void; // 刷新回调
  onFieldChange?: (props: fieldChangeProps) => void; // 筛选器字段更改时回调
  onLoad?: (dataSet: DataSet, record: Record) => void; // 初始化加载完成后回调
  left?: filterBarLeftProperties; // filterBar 左侧容器
  right?: filterBarRightProperties; // filterBar 右侧容器
  cacheKey?: string; // 缓存key
  autoParseUrlParams?: boolean; // 自动解析url参数
  parseUrlParamsKey?: string; // 解析url参数key
  fields?: normalField[]; // 不绑定个性化单元时使用fields作为字段来源
  sortFieldName?: string; // 排序字段参数key
  defaultSortedField?: string; // 默认排序字段
  defaultSortedOrder?: string; // 默认排序顺序
  refreshButton?: boolean; // 是否显示刷新按钮
  checkDataSetStatus?: boolean; // 查询前校验ds状态，默认为true
  loading?: boolean; // loading状态
  manualQuery?: boolean; // 手动查询
}
export interface filterBarLeftProperties {
  render?: (dataSet: DataSet) => ReactNode; // 自定义渲染函数
}

export interface filterBarRightProperties {
  render?: (dataSet: DataSet) => ReactNode; // 自定义渲染函数
}

export interface ICacheData {
  queryDsData: any;
  searchInputDsData: any;
  fields: fieldProperties[];
  customizeDs: DataSet;
  state: any;
  location: string;
}

// 通用范围日期字段-开始时间字段name
export function getRangeBeforeFieldName(fieldName) {
  return `_${fieldName}${RangeStartFieldSuffix}`;
}

// 通用范围日期字段-结算时间字段name
export function getRangeAfterFieldName(fieldName) {
  return `_${fieldName}${RangeEndFieldSuffix}`;
}

export function getRangeFieldName(fieldName) {
  return `${fieldName}_range`;
}

export function getInFieldName(fieldName) {
  return `_${fieldName}_In`;
}

export function getDateTimeMinFormat(format) {
  return `${format} 00:00:00`;
}

export function getDateTimeMaxFormat(format) {
  return `${format} 23:59:59`;
}

export function getMeaningFieldName(fieldName) {
  return `${fieldName}${MeaingFieldSuffix}`;
}

export function filterTempFields(fields) {
  if (isEmpty(fields)) {
    return [];
  }
  return fields.filter(item => !item[FieldFlag.VIRTUAL]);
}

export function checkValueValid(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (isArray(value)) {
    return value.filter(Boolean).length > 0;
  }
  if (typeof value === 'object' && isEmpty(value)) {
    return false;
  }
  return true;
}

export function sortFields(fields: any, sortBy: string) {
  fields.sort((before, after) => before[sortBy] - after[sortBy]);
  return fields;
}

// 根据字段name获取所有关联字段
export function getRelatedFilterFields(
  fields: fieldProperties[] = [],
  targetFeild: fieldProperties
) {
  const { name } = targetFeild;
  const relatedFields = fields.filter(item => {
    const { name: fieldName } = item;
    return (
      fieldName === name ||
      fieldName === getRangeAfterFieldName(name) ||
      fieldName === getRangeBeforeFieldName(name)
    );
  });
  // rank, display, proDefaultFlag 属性保留
  return relatedFields.map(item => ({
    ...item,
    defaultValue: undefined,
    defaultValueMeaning: undefined,
    rank: targetFeild.rank,
    display: targetFeild.display,
    proDefaultFlag: targetFeild.proDefaultFlag,
    // defaultValueCon: targetFeild.defaultValueCon,
  }));
}

// 比较字段值是否发生更改
export function checkFieldValueModified(field: fieldProperties, value: any, oldValue: any) {
  const { fieldWidget, format, multiple } = field;
  let newValue = !isNil(value) ? value : undefined;
  let originValue = !isNil(oldValue) ? oldValue : undefined;
  if (fieldWidget === 'DATE_PICKER') {
    const formatMoment = (momentValue, formatter) => {
      if (momentValue instanceof moment) {
        return (momentValue as any).format(formatter);
      } else if (isString(momentValue)) {
        return moment(momentValue).format(formatter);
      } else {
        return momentValue;
      }
    };
    if (!multiple) {
      newValue = !isNil(newValue) ? formatMoment(newValue, format) : undefined;
      originValue = !isNil(originValue) ? formatMoment(originValue, format) : undefined;
    } else {
      newValue =
        !isNil(newValue) && isArray(newValue)
          ? newValue.map(item => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
      originValue =
        !isNil(originValue) && isArray(originValue)
          ? originValue.map(item => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
    }
  } else if (fieldWidget === 'INPUT_NUMBER' && multiple) {
    newValue =
      !isNil(newValue) && isArray(newValue)
        ? newValue.filter(item => !isNil(item)).join(',')
        : undefined;
    originValue =
      !isNil(originValue) && isArray(originValue)
        ? originValue.filter(item => !isNil(item)).join(',')
        : undefined;
  }
  return newValue !== originValue;
}

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

export const isObjectEqual = (targetObj, sourceObj) => {
  const objKeys = keys(targetObj);
  if (!isEqual(objKeys, keys(sourceObj))) {
    return false;
  }
  if (objKeys.length < 1) {
    return true;
  }
  return objKeys.every(item => {
    const targetValue = isNil(targetObj[item]) ? undefined : targetObj[item];
    const sourceValue = isNil(sourceObj[item]) ? undefined : sourceObj[item];
    return targetValue === sourceValue;
  });
};

export const transformNilValue = (value, nilValue) => {
  return isNil(value) ? nilValue : value;
};

export const getSortUpIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1">
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g id="编组-22" transform="translate(1.300000, 2.500000)">
                <path d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z" id="形状结合" fillOpacity="0.85" fill="#000000" fillRule="nonzero" />
                <polygon id="路径" className={styles["sort-up-or-down-icon-them"]} fill="#00B8CC" points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const getSortDownIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" style={{ marginTop: '2px' }}>
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g id="编组-22" transform="translate(6.983333, 6.992496) scale(1, -1) translate(-6.983333, -6.992496) translate(1.300000, 2.500000)">
                <path d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z" id="形状结合" fillOpacity="0.85" fill="#000000" fillRule="nonzero" />
                <polygon className={styles["sort-up-or-down-icon-them"]} id="路径" fill="#00B8CC" points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
