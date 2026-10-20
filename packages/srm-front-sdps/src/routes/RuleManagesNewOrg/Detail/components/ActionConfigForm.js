/**
 * 规则配置详情 - 策略配置（租户级）
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Form, IntlField, NumberField, TextArea } from 'choerodon-ui/pro';

export default function ActionConfigForm(props = {}) {
  const { record } = props;

  return (
    <Form record={record} labelLayout="float" columns={2}>
      <IntlField name="actionName" colSpan={1} />
      <NumberField name="priority" colSpan={1} />
      <IntlField name="description" colSpan={2} type="multipleLine" />
      <TextArea name="conditionExpression" colSpan={2} />
      <TextArea name="value" colSpan={2} />
    </Form>
  );
}
