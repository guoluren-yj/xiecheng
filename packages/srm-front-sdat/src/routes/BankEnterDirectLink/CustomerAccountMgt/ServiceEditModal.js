import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

export default function EditModal({ detailDS, localRecord }) {
  return (
    <>
      <Form dataSet={detailDS} columns={1} labelLayout="float">
        {/* <Lov name="tenantObj" disabled={!!localRecord} /> */}
        <TextField name="sceneCode" disabled={!!localRecord} />
        <TextField name="description" />
        <TextField name="salt" />
      </Form>
    </>
  );
}
