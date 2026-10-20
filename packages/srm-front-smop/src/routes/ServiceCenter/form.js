import React, { useEffect } from 'react';
import { Form, Select, TextField } from 'choerodon-ui/pro';

export default function ServiceForm(props) {
  const { formDS, record } = props;
  useEffect(() => {
    formDS.create(record?.toData() || {});
  }, []);

  return (
    <Form dataSet={formDS} labelLayout="float">
      <Select name="menuDeployId" />
      <TextField name="interfaceCode" />
      <TextField name="name" />
      <TextField name="introduction" />
      <TextField name="dailRequestAmount" />
      <Select name="interactionMode" />
      <TextField name="caller" />
      <Select name="necessity" />
      <Select name="status" />
      <Select name="detailsLink" />
    </Form>
  );
}
