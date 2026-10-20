import React from 'react';
import { Form, Switch, Select, TextField, IntlField } from 'choerodon-ui/pro';

import './index.less';

export default function (props) {
  const { dataSet } = props;
  return (
    <div className="attr-manage-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Select name="attrValueType" />
        <TextField name="attrValueCode" />
        <IntlField name="attrValueName" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={45}>
        <Switch name="enabledFlag" />
      </Form>
    </div>
  );
}
