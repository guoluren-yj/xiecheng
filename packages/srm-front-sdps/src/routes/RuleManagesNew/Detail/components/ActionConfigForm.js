/**
 * 规则配置详情 - 策略配置（平台级）
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Form, TextField, NumberField, TextArea } from 'choerodon-ui/pro';

export default function ActionConfigForm(props = {}) {
  const { record } = props;

  return (
    <Form record={record} labelLayout="float" columns={2}>
      <TextField name="actionName" colSpan={1} />
      <NumberField name="priority" colSpan={1} />
      <TextArea name="description" colSpan={2} />
      <TextArea name="conditionExpression" colSpan={2} />
      <TextArea name="value" colSpan={2} />
    </Form>
  );
}
