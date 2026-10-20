import React, { memo } from 'react';
import { Form, TextField, Select } from 'choerodon-ui/pro';

const MenuGroupModal = ({ record }) => {
  return (
    <Form record={record} labelLayout="float">
      <TextField name="tenantName" />
      <TextField name="code" />
      <TextField name="name" disabled={record.get('alreadyUsed')} />
      <Select name="functionGroupTemplate" disabled={record.get('alreadyUsed')} />
    </Form>
  );
};

export default memo(MenuGroupModal);
