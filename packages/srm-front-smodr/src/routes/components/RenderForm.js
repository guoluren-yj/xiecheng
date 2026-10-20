import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

function RenderForm(props) {
  const {
    fields = [],
    code,
    customizeForm,
    useLabel,
    readFormProps = {
      labelLayout: 'vertical',
      className: 'c7n-pro-vertical-form-display',
      useWidthPercent: true,
    },
    ...otherProps
  } = props;
  return (
    <>
      {code ? (
        customizeForm(
          { code, readOnly: true },
          <Form {...readFormProps} {...otherProps}>
            {fields.map((m) => {
              const { label, ...rest } = m;
              if (useLabel) {
                return <Output {...m} />;
              }
              return <Output {...rest} />;
            })}
          </Form>
        )
      ) : (
        <Form {...readFormProps} {...otherProps}>
          {fields.map((m) => {
            return <Output {...m} />;
          })}
        </Form>
      )}
    </>
  );
}

export default RenderForm;
