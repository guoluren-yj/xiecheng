import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

export default ({ ds }) => {
  return (
    <Form columns={2} dataSet={ds}>
      <TextArea name="processRemark" />
    </Form>
  );
};
