import React from 'react';
import { Form, Lov, TextField, Switch } from 'choerodon-ui/pro';

export default function EditModal({ detailDS, localRecord }) {
  return (
    <>
      <Form dataSet={detailDS} columns={1} labelLayout="float">
        <Lov name="tenantObj" disabled={!!localRecord} />
        <TextField name="systemCode" />
        <TextField name="licenseCode" />
        <TextField name="payTypeCode" />
        <TextField name="settleModeCode" />
        <TextField name="host" />
        <TextField name="salt" />
        <Switch name="enabledFlag" />
      </Form>
    </>
  );
}
