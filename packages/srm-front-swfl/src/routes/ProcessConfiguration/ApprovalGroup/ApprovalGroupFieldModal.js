/**
 * ApprovalGroupFieldModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, Select } from 'choerodon-ui/pro';

export default function ApprovalGroupFieldModal(props = {}) {
  const { record } = props;
  const handleOutputType = (value) => {
    // EMPLOYEE 员工 ROLE 角色 POSITION 岗位
    if (value === 'EMPLOYEE') {
      record.set('lovCode', 'HWFP.EMPLOYEE');
    } else if (value === 'ROLE') {
      record.set('lovCode', 'HWFP.TENANT.ROLE.WORKFLOW');
    } else if (value === 'POSITION') {
      record.set('lovCode', 'HWFP.APPROVE_RULE_POSITION');
    } else if (!value) {
      record.set('lovCode', '');
    }
  };

  return (
    <Form record={record} labelLayout="float">
      <TextField name="fieldCode" disabled={record.get('editFlag') === 0} />
      <TextField name="fieldName" disabled={record.get('editFlag') === 0} />
      <Select
        name="outputType"
        onChange={handleOutputType}
        disabled={record.get('editFlag') === 0}
      />
      <Select name="fieldComponentType" disabled={record.get('editFlag') === 0} />
      <TextField name="lovCode" disabled={record.get('editFlag') === 0} />
      <Select name="searchFlag" />
    </Form>
  );
}
