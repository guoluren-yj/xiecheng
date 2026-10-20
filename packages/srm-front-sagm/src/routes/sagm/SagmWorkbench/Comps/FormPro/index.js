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
};

function FormPro(props) {
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
        fields
          .filter(f => {
            if (!('show' in f)) return true;
            if (typeof f.show === 'function') {
              return f.show({ record: formProps.dataSet.current });
            }
            return f.show;
          })
          .map(field => {
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
            if ('label' in field) formFieldProps.label = label;
            if (_type === 'empty') return <Output name={name} style={{ display: 'none' }} />;

            const ResField = FormField || fieldMap[_type] || TextField;
            return readOnly ? (
              <Output {...formFieldProps} renderer={renderer} />
            ) : (
              <ResField
                {...formFieldProps}
                {...editorProps}
                modalProps={{ title: modalTitle || label }}
                renderer={renderer}
              />
            );
          })}
    </Form>
  );
  return customizeForm && customizeCode
    ? customizeForm({ code: customizeCode, enableEmpty: true, ...customizeOptions }, form)
    : form;
}

export default observer(FormPro);
