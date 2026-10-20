import React from 'react';
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
  DateTimePicker,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const fieldMap = {
  Lov,
  Select,
  Switch,
  TextArea,
  TextField,
  DatePicker,
  NumberField,
  DateTimePicker,
};

function C7nFromWrapper(props) {
  const {
    children,
    readOnly,
    customizeCode,
    customizeForm,
    customizeOptions = {},
    fields = [],
    ...formProps
  } = props;

  const form = (
    <Form
      labelLayout={readOnly ? 'vertical' : 'float'}
      className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
      useWidthPercent
      {...formProps}
    >
      {children ||
        fields.filter(Boolean).map((field) => {
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
            name,
            rowSpan,
            colSpan,
          };
          Object.keys(field).filter((i) => {
            if (i === 'label') {
              formFieldProps.label = label;
            }
            return undefined;
          });
          if (_type === 'empty') return <Output name={name} style={{ display: 'none' }} />;

          const ResField = FormField || fieldMap[_type] || TextField;
          return readOnly ? (
            <Output {...formFieldProps} renderer={renderer} />
          ) : (
            <ResField
              renderer={renderer}
              disabled={!readOnly}
              {...formFieldProps}
              {...editorProps}
              modalProps={{ title: modalTitle || label }}
            />
          );
        })}
    </Form>
  );
  return customizeForm && customizeCode
    ? customizeForm(
        {
          __force_record_to_update__: true,
          readOnly,
          code: customizeCode,
          enableEmpty: false,
          ...customizeOptions,
        },
        form
      )
    : form;
}

export default observer(C7nFromWrapper);
