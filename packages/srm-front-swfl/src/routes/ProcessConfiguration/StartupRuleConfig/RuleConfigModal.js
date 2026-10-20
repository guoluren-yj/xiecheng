/**
 * VariableConfigModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, NumberField, Lov, Select } from 'choerodon-ui/pro';

export default function VariableConfigModal(props = {}) {
  const { record, variableConfig } = props;

  const renderVariableFormItem = () => {
    return variableConfig.map((config) => {
      const { variableFieldType, variableName } = config;
      const type = variableFieldType.split('/')[0];
      const name = variableName.replace(/\./g, '@');
      switch (type) {
        case 'LOV':
          return <Lov name={`${name}LOV`} />;
        case 'SELECT':
          return <Select name={name} />;
        case 'NUMBER':
          return <NumberField name={name} />;
        default:
          return <TextField name={name} />;
      }
    });
  };

  return (
    <Form record={record} labelLayout="float">
      {renderVariableFormItem()}
      <Lov name="procDef" />
      <Lov name="employee" />
      <TextField name="remark" />
    </Form>
  );
}
