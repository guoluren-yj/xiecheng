/*
 * @Date: 2022-08-03 10:45:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import {
  TextField,
  Output,
  Lov,
  Select,
  IntlField,
  DatePicker,
  DateTimePicker,
  NumberField,
  CheckBox,
  TextArea,
  Attachment,
  SecretField,
  Switch,
  SelectBox,
} from 'choerodon-ui/pro';

import SupplierLov from '_components/SupplierLov';
import { filterNullValueObject } from 'utils/utils';

const FormField = (props) => {
  const { isEdit, name, componentType, renderer, label, ...rest } = props;
  // componentType转换成大写，方便各个地方调用。
  const selfComponentType = componentType && componentType.toUpperCase();
  const getComponentType = () => {
    switch (selfComponentType) {
      case 'LOV':
      case 'TRANSFERLOV':
        return Lov;
      case 'SELECT':
      case 'VALUELIST':
        return Select;
      case 'INTLFIELD':
      case 'TLEDITOR':
        return IntlField;
      case 'DATEPICKER':
        return DatePicker;
      case 'NUMBERFIELD':
      case 'INPUTENUMBER':
        return NumberField;
      case 'CHECKBOX':
        return CheckBox;
      case 'TEXTAREA':
        return TextArea;
      case 'SECRETFIELD':
        return SecretField;
      case 'DATETIMEPICKER':
        return DateTimePicker;
      case 'SWITCH':
        return Switch;
      case 'SELECTBOX':
        return SelectBox;
      case 'ATTACHMENT':
        return Attachment;
      case 'SUPPLIERLOV':
        return SupplierLov;
      default:
        return TextField;
    }
  };

  const getComponentProps = () => {
    switch (selfComponentType) {
      case 'DATETIMEPICKER':
        return {
          mode: 'dateTime',
        };
      default:
        return {};
    }
  };

  const ComponentType = getComponentType();

  const cascadeProps = getComponentProps();

  const outPutLable = label ? { label } : { name };

  // 脱敏组件没有Output形式， 并且没有自定义的renderer 用displayOutput控制展示文本
  const newIsEdit = ['SECRETFIELD'].includes(selfComponentType) && !renderer ? true : isEdit;

  return newIsEdit
    ? React.createElement(ComponentType, Object.assign({}, { name, ...rest, ...cascadeProps }))
    : React.createElement(
        Output,
        filterNullValueObject(Object.assign({}, { ...outPutLable, renderer }))
      );
};

export default FormField;
