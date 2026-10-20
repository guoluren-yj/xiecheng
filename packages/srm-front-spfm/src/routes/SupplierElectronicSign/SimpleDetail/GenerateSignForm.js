import React from 'react';
import { Form, TextField, Select } from 'choerodon-ui/pro';

export default function GenerateSignForm(props) {
  const { dataSet } = props;

  return (
    <>
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <TextField name="signCode" />
        <TextField name="signName" />
        <Select name="templateType" />
        <TextField name="signColor" />
        <TextField name="horizontalText" />
        <TextField name="lastText" />
      </Form>
    </>
  );
}
