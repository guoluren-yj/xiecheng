/*
 * BasicInfo - 订单明细页-收货/收单信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

const ReceiptInfo = (props) => {
  const { ds, customizeForm } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.RECEIPTINFO',
    },
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="shipToLocationAddress" />
      <Output name="shipToLocContName" />
      <Output name="shipToLocTelNum" />
      <Output name="billToLocationAddress" />
      <Output name="billToLocContName" />
      <Output name="billToLocTelNum" />
      <Output name="receiverEmailAddress" />
    </Form>
  );
};

export default ReceiptInfo;
