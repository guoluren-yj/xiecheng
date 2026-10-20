/**
 * ConditionFieldModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, Lov, Select } from 'choerodon-ui/pro';

export default function ConditionFieldModal(props = {}) {
  const { record } = props;
  return (
    <Form record={record} labelLayout="float">
      <Lov name="field" disabled={record.get('editFlag') === 0} />
      <TextField name="fieldCode" disabled={record.get('editFlag') === 0} />
      <Select name="fieldComponentType" disabled={record.get('editFlag') === 0} />
      <TextField name="lovCode" disabled={record.get('editFlag') === 0} />
      <Select name="searchFlag" />
    </Form>
  );
}
