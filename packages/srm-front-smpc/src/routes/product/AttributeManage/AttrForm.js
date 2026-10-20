import React from 'react';
import { Form, Switch, IntlField } from 'choerodon-ui/pro';

import './index.less';

export default function (props) {
  const { dataSet } = props;
  return (
    <div className="attr-manage-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <IntlField name="attributeName" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={45}>
        <Switch name="enabledFlag" />
      </Form>
    </div>
  );
}
