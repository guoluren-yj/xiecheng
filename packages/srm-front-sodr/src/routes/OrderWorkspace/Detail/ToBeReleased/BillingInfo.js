/*
 * BillingInfo - 开票信息
 * @date: 2021/07/08 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, Output, SecretField } from 'choerodon-ui/pro';

const BillingInfo = (props) => {
  const { ds, customizeForm } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_TOBERELEASED_DETAIL.BILLINGINFO',
    },
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="taxRegisterAddress" />
      <Output name="taxRegisterNum" />
      <Output name="taxRegisterBank" />
      <SecretField readOnly name="taxRegisterBankAccount" />
      <Output name="invoiceTitle" />
      <Output name="taxRegisterTel" />
      <Output name="invoiceTitleTypeName" />
      <Output name="invoiceMethodName" />
      <Output name="invoiceTypeName" />
      <Output name="invoiceDetailTypeName" />
    </Form>
  );
};

export default BillingInfo;
