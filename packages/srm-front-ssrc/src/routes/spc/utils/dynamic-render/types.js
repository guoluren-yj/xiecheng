import React from 'react';
import {
  TextField,
  NumberField,
  DatePicker,
  DateTimePicker,
  Select,
  Lov,
  Switch,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
// import Record from 'choerodon-ui/pro/lib/data-set/Record';

export const ComponentNames = {
  INPUT: 'INPUT', // 文本框
  LONG_INPUT: 'LONG_INPUT', // 多行文本框
  TEXT_FIELD_MULTIPLE: 'TEXT_FIELD_MULTIPLE', // 文本框多标签
  INPUT_NUMBER: 'INPUT_NUMBER', // 数字框
  NUMBER_FIELD_MULTIPLE: 'NUMBER_FIELD_MULTIPLE', // 数字框多标签
  NUMBER_FIELD_RANGE: 'NUMBER_FIELD_RANGE', // 数字框范围
  DATE_PICKER: 'DATE_PICKER', // 日期选择框
  DATE_PICKER_MULTIPLE: 'DATE_PICKER_MULTIPLE', // 日期选择框多标签
  DATE_PICKER_RANGE: 'DATE_PICKER_RANGE', // 日期选择框范围
  DATE_TIME_PICKER: 'DATE_TIME_PICKER', // 日期时间选择框
  DATE_TIME_PICKER_MULTIPLE: 'DATE_TIME_PICKER_MULTIPLE', // 日期时间选择框多标签
  DATE_TIME_PICKER_RANGE: 'DATE_TIME_PICKER_RANGE', // 日期时间选择框范围
  SELECT: 'SELECT', // 下拉单选
  SELECT_MULTIPLE: 'SELECT_MULTIPLE', // 下拉多选
  LOV: 'LOV', // LOV
  LOV_MULTIPLE: 'LOV_MULTIPLE', // LOV多选
  SWITCH: 'SWITCH', // 开关
  UPLOAD: 'UPLOAD', // 开关
};

export const ComponentMap = {
  [ComponentNames.INPUT]: <TextField />,
  [ComponentNames.LONG_INPUT]: <TextArea />,
  [ComponentNames.TEXT_FIELD_MULTIPLE]: <TextField multiple />,
  [ComponentNames.INPUT_NUMBER]: <NumberField />,
  [ComponentNames.NUMBER_FIELD_MULTIPLE]: <NumberField multiple />,
  [ComponentNames.NUMBER_FIELD_RANGE]: <NumberField range />,
  [ComponentNames.DATE_PICKER]: <DatePicker />,
  [ComponentNames.DATE_PICKER_MULTIPLE]: <DatePicker multiple />,
  [ComponentNames.DATE_PICKER_RANGE]: <DatePicker range />,
  [ComponentNames.DATE_TIME_PICKER]: <DateTimePicker />,
  [ComponentNames.DATE_TIME_PICKER_MULTIPLE]: <DateTimePicker multiple />,
  [ComponentNames.DATE_TIME_PICKER_RANGE]: <DateTimePicker range />,
  [ComponentNames.SELECT]: <Select />,
  [ComponentNames.SELECT_MULTIPLE]: <Select multiple />,
  [ComponentNames.LOV]: <Lov />,
  [ComponentNames.LOV_MULTIPLE]: <Lov multiple />,
  [ComponentNames.SWITCH]: <Switch />,
  [ComponentNames.UPLOAD]: <Attachment />,
};

// 渲染配置
// export type RenderOptions = {
//   componentType: ComponentNames;
//   optionList?: ValueList; // 选项列表
//   lookupCode?: string; // 值集编码
//   optionType?: 'BUSINESS_OBJECT_OPTION' | 'LOV_VIEW'; // 视图来源 - hmde引用值列表 | hzero值集视图
//   optionCode?: string; // 引用值列表编码/值集视图编码
//   valueField?: string; // 当组件为 Select 和 LOV 时指定值字段，默认从lov配置获取
//   textField?: string; // 当组件为 Select 和 LOV 时指定文本字段，默认从lov配置获取
//   lovValueType?: 'string' | 'object'; // 当组件为 LOV 时指定返回的值类型，默认为object
//   isRequired?: boolean; // 用于选项类/lov类字段红框问题
// };
