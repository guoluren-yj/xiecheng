/*
 * BillingInfo - 开票信息
 * @date: 2021/07/08 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, TextField, SecretField } from 'choerodon-ui/pro';

const BillingInfo = (props) => {
  const { ds, customizeForm } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_ECOMMERCE_DETAIL.BILLINGINFO',
      __force_record_to_update__: true,
    },
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <TextField name="taxRegisterAddress" />
      <TextField name="taxRegisterNum" />
      <TextField name="taxRegisterBank" />
      <SecretField name="taxRegisterBankAccount" />
      <TextField name="invoiceTitle" />
      <TextField name="taxRegisterTel" />
      <TextField name="invoiceTitleTypeName" />
      <TextField name="invoiceMethodName" />
      <TextField name="invoiceTypeName" />
      <TextField name="invoiceDetailTypeName" />
    </Form>
  );
};

export default BillingInfo;
