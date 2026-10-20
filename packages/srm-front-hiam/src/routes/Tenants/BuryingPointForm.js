import React from 'react';
import { Form, Switch, TextArea } from 'choerodon-ui/pro';

function BuryingPointForm(props) {
  const { dataSet } = props;
  return (
    <Form dataSet={dataSet} labelWidth="auto">
      <TextArea name="scriptTracking" resize="vertical" rows={20} />
      <Switch name="scriptTrackingFlag" />
    </Form>
  );
}

export default BuryingPointForm;
