import React from 'react';
import {
  TextField,
  Select,
  Lov,
  Switch,
  DatePicker,
  TextArea,
  Output,
  NumberField,
} from 'choerodon-ui/pro';

export default function ConstructForm(props) {
  const { formType, isEdit, ...otherProps } = props;
  if (!isEdit) {
    return <Output {...otherProps} />;
  }
  let refactorForm;
  switch (formType) {
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
    case 'NumberField':
      refactorForm = <NumberField {...otherProps} />;
      break;
    default:
      refactorForm = <Output {...otherProps} />;
      break;
  }
  return refactorForm;
}
