import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

const ReturnToPretrialContet = (props) => {
  const { dataSet } = props;
  return (
    <Form dataSet={dataSet} columns={1} labelLayout="float">
      <TextArea name="backPretrialRemark" />
    </Form>
  );
};

export default ReturnToPretrialContet;
