import React from 'react';
import {
  // Button,
  // DataSet,
  Form,
  TextField,
  NumberField,
  Lov,
  Select,
  Output,
  DateTimePicker,
  TextArea,
} from 'choerodon-ui/pro';

const FieldMap = {
  Lov,
  TextField,
  NumberField,
  Select,
  DateTimePicker,
  TextArea,
};
const renderForm = (ds, fields, _readOnly) => {
  return (
    <Form
      labelLayout={_readOnly ? 'vertical' : 'float'}
      dataSet={ds}
      columns={3}
      style={{ width: '75%' }}
    >
      {fields.map((item) => {
        const { fieldType, readOnly, ...other } = item;
        const Field = readOnly ? Output : FieldMap[item.fieldType] || TextField;
        return <Field {...other} />;
      })}
    </Form>
  );
};

export { renderForm };
