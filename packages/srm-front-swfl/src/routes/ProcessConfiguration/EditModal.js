/**
 * EditModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form, IntlField, Switch, TextField, Lov, NumberField } from 'choerodon-ui/pro';

export default function EditModal(props = {}) {
  const { dataSet, type } = props;
  return type === 'document' ? (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField name="documentCode" disabled />
      <IntlField name="description" />
      <Lov name="cuszDoc" disabled />
      <NumberField name="orderSeq" />
      <Switch name="enabledFlag" />
    </Form>
  ) : (
    <Form dataSet={dataSet}>
      <TextField name="categoryCode" disabled />
      <IntlField name="description" />
      <Switch name="enabledFlag" />
    </Form>
  );
}
