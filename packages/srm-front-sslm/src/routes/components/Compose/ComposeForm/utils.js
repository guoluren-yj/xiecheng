/* eslint-disable no-new-func */
/**
 * utils
 * @date 2018/9/28
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react'; // 这个 React 是为了上传组件, 当为预览模式时,上传组件还是要显示
import {
  forEach,
  cloneDeep,
  isInteger,
  min,
  isFunction,
  isString,
  startsWith,
  get,
  // toNumber,
  // isNaN,
  toInteger,
  isNil,
  isNumber,
  isEmpty,
  toString,
  round,
  isUndefined,
  camelCase,
} from 'lodash';
import moment from 'moment';
// import uuidv4 from 'uuid/v4';
import { Input, DatePicker, InputNumber, Badge, Cascader } from 'hzero-ui';

import intl from 'utils/intl';
import { getDateFormat, getCurrentLanguage } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT, DEFAULT_TIME_FORMAT } from 'utils/constants';

import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';
// import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import TLEditor from 'components/TLEditor';
// import Upload from 'components/Upload';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import UploadModal from '@/routes/components/UploadModal';
import Lov from '../../Lov'; // lov父级品类不可选
import { getDisplayFieldCode, getDefaultValue } from '../utils';

const { TextArea } = Input;
const language = getCurrentLanguage();

// 为了 防止 webpack 过度优化
const components = {
  DatePicker,
  ValueList,
  TextArea,
  Input,
  InputNumber,
  Lov,
  Switch,
  Checkbox,
  Upload,
  UploadModal,
  TransferLov,
  Badge,
  TLEditor,
  Cascader,
};

const contextPrefix = 'this.';

/**
 * 合并 Descriptor 后的属性
 * @param {Object} dealProps2 - 组件属性处理后的属性
 * @param {Object} contextProps - context 属性
 */
function mergeProps(dealProps2, contextProps) {
  const dealProps3 = cloneDeep(dealProps2);
  forEach(contextProps, (_, contextPropKey) => {
    Object.defineProperty(
      dealProps3,
      contextPropKey,
      Object.getOwnPropertyDescriptor(contextProps, contextPropKey)
    );
  });
  return dealProps3;
}

/**
 * 处理context属性 以及将 属性转为对象
 * @param {*} props - 属性
 * @param {*} context - 外面传进来的 this
 */
export function commonDealForProps(props, context) {
  const contextProps = {};
  const dealProps1 = {};
  forEach(props, prop => {
    let dealProp = prop.attributeValue;
    if (isString(dealProp) && startsWith(dealProp, contextPrefix)) {
      const attributePath = dealProp.substr(5);
      dealProp = undefined;
      Object.defineProperty(contextProps, prop.attributeName, {
        get: () => get(context, attributePath),
        enumerable: true,
      });
    }
    if (dealProp !== undefined) {
      dealProps1[prop.attributeName] = dealProp;
    }
  });
  return { contextProps, dealProps1 };
}

// TODO 数值 判断需要改一下
// 获取组件属性

export const propUtils = {
  Checkbox: getCheckboxProps,
  DatePicker: getDatePickerProps,
  DateTimePicker: getDateTimePickerProps,
  Lov: getLovProps,
  InputNumber: getInputNumberProps,
  Switch: getSwitchProps,
  TextArea: getTextAreaProps,
  Input: getInputProps,
  ValueList: getValueListProps,
  Upload: getUploadProps,
  TransferLov: getTransferLovProps,
  TLEditor: getTLEditorProps,
  Cascader: getCascaderProps,
};

/**
 * 获取 Cascader 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
// function getCascaderProps(props, context) {
//   const { contextProps, dealProps1 } = commonDealForProps(props, context);
//   return mergeProps(
//     {
//       // todo 不确定租户id 到底怎么弄
//       // changeOnSelect: true,
//       // showSearch: false,
//       style: { width: '100%' },
//       fieldNames: { label: 'regionName', value: 'regionId' },
//       ...dealProps1,
//     },
//     contextProps
//   );
// }

/**
 * 获取 Checkbox 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getCheckboxProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(dealProps1, contextProps);
}

/**
 * 获取 Checkbox 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getUploadProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(
    // {
    //   // templateAttachmentUUID: `${field.investigateTemplateId}-${field.investgCfLineId}`,
    //   ...dealProps1,
    // },
    {
      ...dealProps1,
      crossTenant: true,
      bucketDirectory: 'sslm-lifecycle',
    },
    contextProps
  );
}

/**
 * 获取 DatePicker 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getDatePickerProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(
    { style: { width: '100%' }, format: DEFAULT_DATE_FORMAT, placeholder: '', ...dealProps1 },
    contextProps
  );
}

/**
 * 获取 TimePicker 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getDateTimePickerProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(
    {
      style: { width: '100%' },
      format: DEFAULT_DATETIME_FORMAT,
      placeholder: '',
      showTime: true,
      ...dealProps1,
    },
    contextProps
  );
}

/**
 * 获取 Lov 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 * @param {Object} field - 字段
 */
function getLovProps(props, context, field) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  const { queryParams = {} } = dealProps1;
  // 处理queryParams属性不填写问题
  const params = queryParams || {};
  const newQueryParams = {
    tenantId: field.tenantId,
    ...params,
  };
  // 调查表 不会出现 租户id 动态的情况
  return mergeProps(
    {
      code: field.lovCode,
      style: { width: '100%' },
      textField: getDisplayFieldCode(field), // lov 的 显示字段
      ...dealProps1,
      // todo 不确定租户id 到底怎么弄
      queryParams: newQueryParams,
      originTenantId: field.tenantId,
    },
    contextProps
  );
}

/**
 * 获取 TransferLov 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 * @param {Object} field - 字段
 */
function getTransferLovProps(props, context, field) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  // 调查表 不会出现 租户id 动态的情况
  // 处理360查询对于穿梭框的queryUsePost后端返回数据为1和0的情况
  const { queryUsePost = false, queryParams = {} } = dealProps1;
  let postFlag = queryUsePost;
  if (queryUsePost === '0') {
    postFlag = false;
  }
  if (queryUsePost === '1') {
    postFlag = true;
  }
  // 处理queryParams为null的情况
  const params = queryParams || {};
  const newQueryParams = {
    tenantId: field.tenantId,
    ...params,
  };

  return mergeProps(
    {
      code: field.lovCode,
      style: { width: '100%' },
      // translateData: getDisplayFieldCode(field), // lov 的 显示字段
      ...dealProps1,
      // todo 不确定租户id 到底怎么弄
      queryParams: newQueryParams,
      queryUsePost: postFlag,
      originTenantId: field.tenantId,
      textField: getDisplayFieldCode(field), // lov 的 显示字段
    },
    contextProps
  );
}

/**
 * 获取 InputNumber 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getInputNumberProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(
    {
      style: { width: '100%', lineHeight: '28px', padding: '0 1px' },
      ...dealProps1,
    },
    contextProps
  );
}

/**
 * 获取 Switch 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getSwitchProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(dealProps1, contextProps);
}

/**
 * 获取 TextArea 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getTextAreaProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(dealProps1, contextProps);
}

/**
 * 获取 Input 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getInputProps(props, context) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  const { pattern, ...other } = dealProps1;
  const rules = {};
  if (pattern) {
    rules.pattern = new RegExp(pattern, 'g');
  }
  return mergeProps(
    {
      ...other,
      ...rules,
    },
    contextProps
  );
}

/**
 * 获取 TLEditor 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 */
function getTLEditorProps(props, context, field) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  return mergeProps(
    {
      label: field.fieldDescription,
      field: field.fieldCode,
      ...dealProps1,
    },
    contextProps
  );
}

/**
 * 获取 ValueList 组件的属性
 * @param {Object[]} props - 属性
 * @param {Object} context - 外面传进来的 this
 * @param {Object} field - 字段
 */
function getValueListProps(props, context, field) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  const { multiple = false, ...other } = dealProps1;
  const defaultValueMeaning = getDefaultValue(props);
  return mergeProps(
    {
      lovCode: field.lovCode,
      style: { width: '100%' },
      queryParams: {
        tenantId: field.tenantId,
        organizationId: field.tenantId,
      },
      textField: getDisplayFieldCode(field), // lov 的 显示字段
      ...other,
      mode: multiple ? 'multiple' : 'default',
      lazyLoad: !multiple,
      defaultValueMeaning,
    },
    contextProps
  );
}

// 获取Cascader组件属性
function getCascaderProps(props, context, field, otherProps = {}) {
  const { contextProps, dealProps1 } = commonDealForProps(props, context);
  const { attachmentTypeList = [] } = otherProps;
  const { placeholder } = dealProps1;
  return mergeProps(
    {
      style: { width: '100%' },
      fieldNames: { label: 'meaning', value: 'value', children: 'children' },
      options: attachmentTypeList.filter(n => n.children),
      expandTrigger: 'hover',
      ...dealProps1,
      placeholder: placeholder || ' ', // 不给''因为在渲染时用了filterNullValueObject过滤了属性为空的属性
    },
    contextProps
  );
}

/**
 * colLayout - Col 的属性
 */
const colLayout = {
  1: {
    span: 24,
  },
  2: {
    span: 12,
  },
  3: {
    span: 8,
  },
  4: {
    span: 6,
  },
};

/**
 * getColLayout - 获取字段布局 包含对应的 style
 * @param {Number} [col=3] 每行 列数
 * @param {Number} colspan 字段宽度
 */
export function getColLayout(col = 3, colspan) {
  const colL = cloneDeep(colLayout[col] || colLayout[3]);
  if (isInteger(colspan) && colspan > 1) {
    colL.span = min([24, colL.span * colspan]);
  }
  return colL;
}

function getDatePickerFormat(field, defaultFormat) {
  let format = defaultFormat;
  forEach(field.props, prop => {
    if (prop.attributeName === 'format') {
      format = prop.attributeValue;
      return false;
    }
  });
  return format;
}

/**
 * 从组件的 onChange return String 给 Form 表单
 * @param dateMoment
 * @returns {*}
 */
function dateGetValueFromEventFunc(dateMoment) {
  return dateMoment && dateMoment.format(DEFAULT_DATE_FORMAT);
}

/**
 * 从组件的 onChange return String 给 Form 表单
 * @param dateMoment
 * @returns {*}
 */
function timeGetValueFromEventFunc(timeMoment) {
  return timeMoment && timeMoment.format(DEFAULT_TIME_FORMAT);
}

/**
 * 从组件的 onChange return String 给 Form 表单
 * @param dateMoment
 * @returns {*}
 */
function dateTimeGetValueFromEventFunc(dateTimeMoment) {
  return dateTimeMoment && dateTimeMoment.format(DEFAULT_DATETIME_FORMAT);
}

/**
 * 从 Form 表单 将 String 转为 moment 给组件
 * @param dateStr
 * @returns {{value: (*|moment.Moment)}}
 */
function dateGetValuePropFunc(dateStr) {
  return { value: dateStr && moment(dateStr, DEFAULT_DATE_FORMAT) };
}

/**
 * 从 Form 表单 将 String 转为 moment 给组件
 * @param dateStr
 * @returns {{value: (*|moment.Moment)}}
 */
function timeGetValuePropFunc(dateStr) {
  return { value: dateStr && moment(dateStr, DEFAULT_TIME_FORMAT) };
}

/**
 * 从 Form 表单 将 String 转为 moment 给组件
 * @param dateStr
 * @returns {{value: (*|moment.Moment)}}
 */
function dateTimeGetValuePropFunc(dateStr) {
  return { value: dateStr && moment(dateStr, DEFAULT_DATETIME_FORMAT) };
}

/**
 * Form 字段 获取 getValueProp 属性
 * @param field
 * @returns {*}
 */
export function getGetValuePropFunc(field) {
  switch (field.componentType) {
    case 'DatePicker':
      return dateGetValuePropFunc;
    case 'TimePicker':
      return timeGetValuePropFunc;
    case 'DateTimePicker':
      return dateTimeGetValuePropFunc;
    default:
      return undefined;
  }
}

/**
 * Form 字段 获取 getValueFromEvent 属性
 * @param componentType
 * @returns {*}
 */
export function getGetValueFromEventFunc(componentType) {
  switch (componentType) {
    case 'DatePicker':
      return dateGetValueFromEventFunc;
    case 'TimePicker':
      return timeGetValueFromEventFunc;
    case 'DateTimePicker':
      return dateTimeGetValueFromEventFunc;
    default:
      return undefined;
  }
}

/**
 * 从 dataSource 获取初始值
 * @param {*} field - 字段
 * @param {*} dataSource - 数据源
 */
export function getInitialValue({
  field,
  dataSource = {},
  configName = '',
  supplierAttRequired,
  form: { getFieldValue = () => {} } = {},
}) {
  const { defaultValueType, express } = field;

  // 后端返回值
  let v = dataSource[field.fieldCode];
  // 默认值
  let defaultValue = null;

  if (!isEmpty(field.props)) {
    if (defaultValueType === 'EXPRESSION') {
      // 处理公式配置默认值
      if (express) {
        const {
          expressionLinesObj,
          expressionConfig: { customizeConditionCombination },
        } = JSON.parse(express);
        let finalValueStr = customizeConditionCombination;

        Object.keys(expressionLinesObj).forEach(key => {
          const caseFieldName = camelCase(expressionLinesObj[key].fieldName);
          const val = getFieldValue(caseFieldName) || 0;
          finalValueStr = finalValueStr.replace(/\b\w+\b/g, item => {
            if (key === item) {
              return val;
            } else {
              return item;
            }
          });
        });
        defaultValue = new Function(`return ${finalValueStr};`)();
      }
    } else {
      // 后端无返回, 固定默认值生效
      //  固定值默认值
      const { attributeValue } =
        field.props.find(item => item.attributeName === 'defaultValue') || {};
      defaultValue = attributeValue;
    }
    v = isUndefined(v) ? defaultValue : v;
  }

  if (
    configName === 'sslmInvestgAddress' &&
    field.componentType === 'Input' &&
    field.fieldCode === 'regionId'
  ) {
    return dataSource.regionPathName || v;
  }

  if (field.fieldCode === 'supplierAttFlag') {
    if (isNil(v)) {
      return supplierAttRequired ? 1 : 0;
    } else {
      return v;
    }
  }
  if (configName === 'sslmInvestgBasic' && field.fieldCode === 'registeredCapital') {
    return language === 'en_US' ? (v ? round(v / 100, 8) : v) : v;
  }
  // 附件页签-记账冻结字段默认初始值为0，解决模板配置必填问题
  if (configName === 'sslmInvestgAttachment' && field.fieldCode === 'freezeControlFlag') {
    return v || 0;
  }

  if (
    field.fieldCode === 'attachmentType' &&
    configName === 'sslmInvestgAttachment' &&
    field.componentType === 'Cascader'
  ) {
    return dataSource.parentAttachmentType && dataSource.attachmentType
      ? [dataSource.parentAttachmentType, dataSource.attachmentType]
      : null;
  }

  let multipleFlag = false;
  if (field.componentType === 'ValueList') {
    if (!isEmpty(field.props)) {
      const { attributeValue = false } =
        field.props.find(item => item.attributeName === 'multiple') || {};
      multipleFlag = !!attributeValue;
    }
  }

  switch (field.componentType) {
    case 'Switch':
      if (typeof v === 'string') {
        return +v ? 1 : 0;
      } else {
        return v || 0;
      }
    case 'Checkbox':
      if (typeof v === 'string') {
        return +v ? 1 : 0;
      } else {
        return v || 0;
      }
    case 'Upload':
      return v;
    // return dataSource[field.fieldCode] || 0;
    case 'ValueList':
      return multipleFlag ? (v && toString(v).split(',')) || [] : isNumber(v) ? `${v}` : v;
    default:
      return v;
  }
}

/**
 * 获取组件的类型
 * @param {*} field - 字段
 */
export function getComponentType(field, componentProps = {}) {
  switch (field.componentType) {
    case 'InputNumber':
      return components.InputNumber;
    case 'TextArea':
      return TextArea;
    case 'DatePicker':
      return components.DatePicker;
    case 'DateTimePicker':
      return components.DatePicker;
    case 'Switch':
      return components.Switch;
    case 'Checkbox':
      return components.Checkbox;
    case 'Lov':
      return components.Lov;
    case 'ValueList':
      return components.ValueList;
    case 'Upload':
      if (componentProps.isAttachmentUrl) {
        return components.UploadModal;
      } else {
        return components.Upload;
      }
    case 'TransferLov':
      return components.TransferLov;
    case 'Badge':
      return components.Badge;
    case 'TLEditor':
      return components.TLEditor;
    case 'Cascader':
      return components.Cascader;
    case 'Input':
    default:
      return components.Input;
  }
}

/**
 * 获取组件的属性
 * @param {Object} field - 字段
 * @param {String} componentType - 组件类型
 * @param {Object} context - Page的this
 */
export function getComponentProps({
  field = {},
  componentType = 'Input',
  context,
  otherProps = {},
}) {
  const propFunc = propUtils[componentType];
  if (isFunction(propFunc)) {
    return propFunc(field.props || field.investigateConfigComponents, context, field, otherProps);
  } else {
    return getInputProps(field.props, context, field);
  }
}

function getDisplayValue({ field, dataSource = {}, componentProps = {}, configName }) {
  let format;
  let dateStr;
  let value;
  let fieldValue = dataSource[field.fieldCode];
  if (configName === 'sslmInvestgBasic' && field.fieldCode === 'registeredCapital') {
    fieldValue =
      language === 'en_US' ? (fieldValue ? round(fieldValue / 100, 8) : fieldValue) : fieldValue;
  }
  switch (field.componentType) {
    case 'ValueList':
    case 'Lov':
    case 'Cascader':
      value =
        dataSource[componentProps.displayField] ||
        dataSource[`${field.fieldCode}Meaning`] ||
        dataSource[field.fieldCode];
      return value;
    case 'DatePicker':
      format = getDatePickerFormat(field, getDateFormat());
      dateStr = dataSource[componentProps.displayField] || dataSource[field.fieldCode];
      return dateStr && moment(dateStr, DEFAULT_DATE_FORMAT).format(format);
    case 'TimePicker':
      format = getDatePickerFormat(field, DEFAULT_TIME_FORMAT);
      dateStr = dataSource[componentProps.displayField] || dataSource[field.fieldCode];
      return dateStr && moment(dateStr, DEFAULT_TIME_FORMAT).format(format);
    case 'DateTimePicker':
      format = getDatePickerFormat(field, DEFAULT_DATETIME_FORMAT);
      dateStr = dataSource[componentProps.displayField] || dataSource[field.fieldCode];
      return dateStr && moment(dateStr, DEFAULT_DATETIME_FORMAT).format(format);
    case 'Checkbox':
    case 'Switch':
      value = dataSource[componentProps.displayField] || dataSource[field.fieldCode];
      if (isNil(value)) {
        return;
      }
      return toInteger(value) === 1
        ? intl.get('hzero.common.status.yes')
        : intl.get('hzero.common.status.no');
    default:
      return dataSource[componentProps.displayField] || fieldValue;
  }
}

export function renderDisabledField({
  field,
  dataSource,
  organizationId,
  disableStyle = 'value',
  componentProps = {},
  configName,
  _status,
  referenceRangeErrorList,
}) {
  switch (field.componentType) {
    case 'Upload':
      if (componentProps.isAttachmentUrl) {
        return (
          <UploadModal
            {...componentProps}
            attachment={getDisplayValue({ field, dataSource, componentProps }) || []}
            isViewOnly
            organizationId={organizationId}
          />
        );
      } else {
        return (
          <Upload
            {...componentProps}
            viewOnly
            attachmentUUID={getDisplayValue({ field, dataSource, componentProps })}
            organizationId={organizationId}
            filePreview
          />
        );
      }
    case 'TransferLov':
      return (
        <TransferLov
          code={field.lovCode}
          value={getDisplayValue({ field, dataSource, componentProps })}
          queryParams={{ tenantId: field.tenantId }}
          viewOnly
        />
      );
    default:
      return (
        <div
          className={` compose-field-value-disabled ${
            disableStyle === 'value' ? '' : 'ant-input ant-input-disabled'
          }`}
          style={{
            color:
              _status === 'approval' && referenceRangeErrorList.includes(field.fieldCode) && 'red',
          }}
        >
          {getDisplayValue({ field, dataSource, componentProps, configName })}
        </div>
      );
  }
}
