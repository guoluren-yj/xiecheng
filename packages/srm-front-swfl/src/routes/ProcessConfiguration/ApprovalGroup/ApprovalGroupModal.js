/**
 * ApprovalGroupModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

export default function ApprovalGroupModal(props = {}) {
  const { record } = props;
  return (
    <Form record={record} labelLayout="float">
      <TextField name="defCode" />
      <TextField name="defName" />
      <TextField name="description" />
    </Form>
  );
}
