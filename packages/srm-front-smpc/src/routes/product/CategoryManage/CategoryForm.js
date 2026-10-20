import React from 'react';
import { Form, Switch, IntlField, TextField } from 'choerodon-ui/pro';

import './index.less';

export default function (props) {
  const { dataSet, level } = props;
  return (
    <div className="category-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        {level !== 1 && <TextField name="parentCategoryName" />}
        <IntlField name="categoryName" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={45}>
        <Switch name="enabledFlag" />
      </Form>
    </div>
  );
}
