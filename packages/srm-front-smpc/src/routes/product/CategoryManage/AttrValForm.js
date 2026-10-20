import React from 'react';
import { Form, Switch, Lov } from 'choerodon-ui/pro';

export default function (props) {
  const { dataSet } = props;

  return (
    <div className="category-attr-Val-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Lov name="attrValLov" />
      </Form>
      <Form dataSet={dataSet} columns={1}>
        <Switch name="enabledFlag" />
      </Form>
    </div>
  );
}
