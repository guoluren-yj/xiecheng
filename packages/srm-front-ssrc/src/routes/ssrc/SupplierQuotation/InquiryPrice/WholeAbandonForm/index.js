import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const WholeAbandonForm = (props = {}) => {
  const { wholeAbadonDS } = props || {};

  return (
    <Form dataSet={wholeAbadonDS} columns={1} labelLayout="float">
      <TextArea name="abandonRemark" resize="vertical" />
    </Form>
  );
};

export default observer(WholeAbandonForm);
