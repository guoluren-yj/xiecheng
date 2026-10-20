import React from 'react';
import { Form, Lov, TextField } from 'choerodon-ui/pro';

export default function (props) {
  const { dataSet } = props;

  return (
    <Form dataSet={dataSet} labelLayout="float" columns={1}>
      <Lov name="categoryLov" />
      <TextField name="categoryName" />
      <Lov name="itemLov" />
      <TextField name="itemName" />
    </Form>
  );
}
