import React from 'react';
import { Form, Select, TextField, IntlField, Lov, NumberField, Switch } from 'choerodon-ui/pro';
import { optionRenderer } from '../../components/utils/render';

export default function DynamicDefineFrom(props) {
  const { formDs, isTenant } = props;
  return (
    <Form dataSet={formDs}>
      {!isTenant && <Lov name="tenantId" />}
      <Lov name="combineCode" />
      <TextField name="actionCode" />
      <IntlField name="actionTitle" />
      {/* {isTenant ? <Select name="categoryId" /> : <Lov name="categoryId" />} */}
      {/* <Lov name="categoryId" /> */}
      {/* <Select name="dynamicType" /> */}
      <Select
        name="color"
        style={{ width: '100%' }}
        defaultActiveFirstOption={false}
        dropdownMatchSelectWidth={false}
        optionRenderer={optionRenderer}
      />
      {<Select name="triggerMethod" />}
      <IntlField name="actionDesc" />
      <Select name="executeFrequency" />
      <Select name="priority" />
      <NumberField name="orderSeq" precision={0} step={2} />
      <Switch name="enabledFlag" />
    </Form>
  );
}
