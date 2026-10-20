/**
 * 规则配置详情 - 基本参数（只读）（平台级）
 * @date: 2021-01-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, useEffect } from 'react';
import { Form, TextField, Select, TextArea, NumberField, Lov } from 'choerodon-ui/pro';

export default function BasicParam(props = {}) {
  const { formDs } = props;

  useEffect(() => {
    if (!formDs.current?.get('emptyRetStrategy')) {
      // eslint-disable-next-line no-unused-expressions
      formDs.current?.set('emptyRetStrategy', 'RETURN_NULL');
    }
  });

  return (
    <Form dataSet={formDs} labelLayout="float" columns={3}>
      <TextField name="ruleCode" colSpan={1} disabled />
      <TextField name="name" colSpan={1} disabled />
      <Select name="type" colSpan={1} disabled />
      {formDs.current?.get('type') === '1' && (
        <Fragment>
          <Lov name="service" colSpan={1} disabled />
          <TextField name="serviceCode" colSpan={1} disabled />
          <TextField name="servicePath" colSpan={1} disabled />
        </Fragment>
      )}
      {formDs.current?.get('type') !== '1' && <Select name="defaultRet" colSpan={1} disabled />}
      <Select name="defaultRetLine" colSpan={1} disabled />
      {formDs.current?.get('type') !== '1' && (
        <Fragment>
          <Select name="defaultRetEmpty" colSpan={1} disabled />
          <NumberField name="retEmpty" colSpan={1} disabled />
        </Fragment>
      )}
      <Select name="defaultRetFail" colSpan={1} disabled />
      <Select name="emptyRetStrategy" colSpan={1} disabled />
      <TextArea name="description" colSpan={3} newLine disabled />
    </Form>
  );
}
