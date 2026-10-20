import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

function RenderForm(props) {
  const {
    fields = [],
    code,
    customizeForm,
    readFormProps = {
      labelLayout: 'vertical',
      className: 'c7n-pro-vertical-form-display',
    },
    ...otherProps
  } = props;
  return (
    <>
      {code ? (
        customizeForm(
          { code },
          <Form {...readFormProps} {...otherProps}>
            {fields.map((m) => {
              return <Output {...m} />;
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
