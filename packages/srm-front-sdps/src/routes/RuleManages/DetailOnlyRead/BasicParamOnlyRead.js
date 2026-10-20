/**
 * 规则配置详情 - 基本参数（只读）
 * @date: 2021-09-02
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Form, TextField, Select, Lov, TextArea, NumberField } from 'choerodon-ui/pro';

export default function BasicParamOnlyRead(props = {}) {
  const { formDs } = props;
  return (
    <Form dataSet={formDs} labelLayout="float" columns={3} disabled>
      <TextField name="fullPathCode" colSpan={1} disabled />
      <TextField name="name" colSpan={1} disabled />
      <Select name="type" colSpan={1} disabled />
      <Lov name="service" colSpan={1} disabled />
      <TextField name="serviceCode" disabled colSpan={1} />
      <TextField name="servicePath" disabled colSpan={1} />
      <Select name="defaultRet" colSpan={1} disabled />
      <Select name="defaultRetLine" colSpan={1} disabled />
      <Select name="defaultRetEmpty" colSpan={1} disabled />
      <NumberField name="retEmpty" colSpan={1} disabled />
      <Select name="defaultRetFail" colSpan={1} disabled />
      <TextArea name="description" colSpan={3} newLine disabled />
    </Form>
  );
}
