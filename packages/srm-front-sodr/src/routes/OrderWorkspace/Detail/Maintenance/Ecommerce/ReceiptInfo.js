/*
 * ReceiptInfo - 订单明细页-收货/收单信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

const ReceiptInfo = (props) => {
  const { ds, customizeForm } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_ECOMMERCE_DETAIL.RECEIPTINFO',
    },
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <TextField name="shipToLocationAddress" />
      <TextField name="shipToLocContName" />
      <TextField name="shipToLocTelNum" />
      <TextField name="billToLocationAddress" />
      <TextField name="billToLocContName" />
      <TextField name="billToLocTelNum" />
      <TextField name="receiverEmailAddress" />
    </Form>
  );
};

export default ReceiptInfo;
