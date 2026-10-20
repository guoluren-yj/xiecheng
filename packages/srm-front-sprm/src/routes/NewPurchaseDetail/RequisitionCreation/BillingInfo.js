/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-07 17:19:54
 */
import React, { useContext } from 'react';
import { TextField, Select, Form, Row, Col } from 'choerodon-ui/pro';
import { Store } from '../stores';

const BillingInfo = function BillingInfo() {
  const { headerDs, customizeForm } = useContext(Store);

  const form = customizeForm(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.BILLINGINFO',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
      <TextField name="invoiceTitle" disabled />
      <TextField name="taxRegisterNum" disabled />
      <TextField name="taxRegisterAddress" disabled />
      <TextField name="taxRegisterTel" disabled />
      <TextField name="taxRegisterBank" disabled />
      <TextField name="taxRegisterBankAccount" disabled />
      <Select name="invoiceMethodCodeLov" />
      <Select name="invoiceTypeCodeLov" />
      <Select name="invoiceTitleTypeCodeLov" />
      <Select name="invoiceDetailTypeCodeLov" />
    </Form>
  );

  return (
    <Row code="billIngInfo">
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default BillingInfo;
