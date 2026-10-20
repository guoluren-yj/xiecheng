/**
 * EmailApproveFormModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, Switch, Lov, TextArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function ProcessFormModal(props = {}) {
  const { record } = props;
  return (
    <Form record={record} labelLayout="float">
      <TextField name="templateCode" />
      <TextField name="templateName" />
      <Lov name="interface" />
      <TextField name="templateRemark" />
      <TextArea
        name="templateContent"
        rows={15}
        placeholder={intl
          .get('hwfp.common.view.message.placeholder.pleaseInput')
          .d('请输入完整的HTML代码,并且将<#assign json=text?eval />嵌入到<html>后面......')}
      />
      <Switch name="enabledFlag" />
    </Form>
  );
}
