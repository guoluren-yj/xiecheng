import React from 'react';
import { Form, Select, TextField, IntlField, Lov, NumberField, Switch } from 'choerodon-ui/pro';

export default function ToDoDefineFrom(props) {
  const { formDs, isTenant, status } = props;
  return (
    <Form dataSet={formDs}>
      {!isTenant && <Lov name="tenantId" disabled={status === 'edit'} />}
      <Lov name="combineCode" disabled={status === 'edit'} />
      <TextField name="todoCode" disabled={status === 'edit'} />
      <IntlField name="todoTitle" />
      <Select name="type" disabled={status === 'edit'} />
      <NumberField name="orderSeq" precision={0} step={2} />
      <IntlField name="buttonName" />
      <TextField name="detailPageLink" />
      <TextField name="parameters" />
      <Switch name="enabledFlag" />
    </Form>
  );
}
