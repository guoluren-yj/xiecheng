import React from 'react';
import {
  TextField,
  IntlField,
  NumberField,
  Select,
  Lov,
  Switch,
  DatePicker,
  TextArea,
  Output,
  CheckBox,
} from 'choerodon-ui/pro';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { yesOrNoRender } from 'utils/renderer';

export default function ConstructForm(props) {
  const { formType, isEdit, ...otherProps } = props;
  if (!isEdit) {
    const specielProps = {};
    if (formType === 'CheckBox') {
      Object.assign(specielProps, { renderer: ({ value }) => yesOrNoRender(value) });
    }
    return <Output {...otherProps} {...specielProps} />;
  }
  let refactorForm;
  switch (formType) {
    case 'IntlField':
      refactorForm = <IntlField {...otherProps} />;
      break;

    case 'NumberField':
      refactorForm = <NumberField {...otherProps} />;
      break;
    case 'TextField':
      refactorForm = <TextField {...otherProps} />;
      break;
    case 'Select':
      refactorForm = <Select {...otherProps} />;
      break;
    case 'Lov':
      refactorForm = <Lov {...otherProps} />;
      break;
    case 'Switch':
      refactorForm = <Switch {...otherProps} />;
      break;
    case 'DatePicker':
      refactorForm = <DatePicker {...otherProps} />;
      break;
    case 'TextArea':
      refactorForm = <TextArea {...otherProps} />;
      break;
    case 'DateTimePicker':
      refactorForm = <DatePicker {...otherProps} mode="dateTime" />;
      break;
    case 'SupplierLov':
      refactorForm = <SupplierLov {...otherProps} />;
      break;
    case 'CheckBox':
      refactorForm = <CheckBox {...otherProps} />;
      break;
    default:
      refactorForm = <Output {...otherProps} />;
      break;
  }
  return refactorForm;
}
