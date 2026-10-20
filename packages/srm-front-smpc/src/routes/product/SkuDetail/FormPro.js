import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Lov,
  Output,
  Select,
  Switch,
  TextArea,
  TextField,
  DatePicker,
  NumberField,
} from 'choerodon-ui/pro';

const fieldMap = {
  Lov,
  Select,
  Switch,
  TextArea,
  TextField,
  DatePicker,
  NumberField,
};

export default observer(function FormPro(props) {
  const { children, readOnly, customizeCode, customizeForm, fields = [], ...formProps } = props;
  const filterFields = fields.filter((f) => f.show || !('show' in f));
  const form = (
    <Form
      labelLayout={readOnly ? 'vertical' : 'float'}
      className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
      useWidthPercent
      {...formProps}
    >
      {children ||
        filterFields.map((field) => {
          const {
            _type,
            name,
            label,
            rowSpan,
            colSpan,
            modalTitle,
            FormField,
            renderer,
            ...editorProps
          } = field;

          const formFieldProps = {
            name: String(name),
            rowSpan,
            colSpan,
          };
          if ('label' in field) formFieldProps.label = label;
          if (_type === 'empty') return <div />;

          const ResField = FormField || fieldMap[_type] || TextField;
          return readOnly ? (
            <Output {...formFieldProps} renderer={renderer} />
          ) : (
            <ResField
              {...formFieldProps}
              {...editorProps}
              modalProps={{ title: modalTitle || label }}
            />
          );
        })}
    </Form>
  );
  return customizeForm && customizeCode
    ? customizeForm({ code: customizeCode, readOnly }, form)
    : form;
});
