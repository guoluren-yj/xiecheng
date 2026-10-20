import React from 'react';
import {
  Form,
  Select,
  // CheckBox,
} from 'choerodon-ui/pro';

export default function RiskItemModal({ dataSet }) {
  return (
    <>
      <Form columns={1} dataSet={dataSet} labelLayout="float">
        <Select name="filterScriptCode" />
      </Form>
    </>
  );
}
