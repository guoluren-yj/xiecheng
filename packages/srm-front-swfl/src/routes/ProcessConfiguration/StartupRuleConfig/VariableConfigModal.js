/**
 * VariableConfigModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, NumberField, Lov, Select, Switch } from 'choerodon-ui/pro';

export default function VariableConfigModal(props = {}) {
  const { record } = props;
  return (
    <Form record={record} labelLayout="float">
      <NumberField name="orderSeq" />
      <Lov name="variable" />
      <TextField name="description" />
      <Select name="variableFieldType" />
      <Lov name="variableValueSourceLov" />
      <NumberField name="variableColumnWidth" />
      <Switch name="searchFlag" />
    </Form>
  );
}
