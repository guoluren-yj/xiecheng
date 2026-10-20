import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

const RenameModal = (props) => {
  const { dataSet } = props;

  return (
    <Form
      labelLayout={LabelLayout.float}
      // style={{ padding: '0 20px 20px 20px' }}
      dataSet={dataSet}
      // useColon={false}
    >
      <TextField name="templateName" />
    </Form>
  );
};

export default RenameModal;
