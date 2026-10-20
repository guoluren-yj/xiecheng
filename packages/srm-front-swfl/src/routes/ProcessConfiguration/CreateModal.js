/**
 * CreateModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form, IntlField, Lov, TextField, Switch, NumberField } from 'choerodon-ui/pro';

export default function CreateModal(props = {}) {
  const { dataSet, isEditCategories = true } = props;
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField name="documentCode" disabled={isEditCategories} />
      <IntlField name="description" disabled={isEditCategories} />
      <Lov name="category" />
      <Lov name="cuszDoc" disabled />
      <TextField name="categoryCode" />
      <IntlField name="categoryDescription" />
      <NumberField name="orderSeq" precision={0} min={1} />
      {!isEditCategories && <Switch name="enabledFlag" />}
    </Form>
  );
}
