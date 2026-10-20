import React from 'react';
import { Form, TextField, Lov, Select, NumberField, Switch } from 'choerodon-ui/pro';
import { optionRenderer } from '../../components/utils/render';

export default function DynamicTypeFrom(props) {
  const { formDs, isTenant } = props;
  return (
    <Form dataSet={formDs}>
      {!isTenant && <Lov name="tenantId" />}
      <TextField name="categoryCode" />
      <TextField name="categoryName" />
      <Select
        name="color"
        style={{ width: '100%' }}
        defaultActiveFirstOption={false}
        dropdownMatchSelectWidth={false}
        optionRenderer={optionRenderer}
      />
      <NumberField name="orderSeq" precision={0} step={2} />
      <Switch name="enabledFlag" />
    </Form>
  );
}
