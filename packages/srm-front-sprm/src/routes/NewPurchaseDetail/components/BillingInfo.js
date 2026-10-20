/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-02-24 19:18:46
 */
import React, { useContext } from 'react';
import { Form, Row, Col, Output } from 'choerodon-ui/pro';
import { Store } from '../stores';

const BillingInfo = function BillingInfo({ code }) {
  const { headerDs, customizeForm } = useContext(Store);

  const form = customizeForm(
    {
      code,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      <Output name="invoiceTitle" />
      <Output name="taxRegisterNum" />
      <Output name="taxRegisterAddress" />
      <Output name="taxRegisterTel" />
      <Output name="taxRegisterBank" />
      <Output name="taxRegisterBankAccount" />
      <Output name="invoiceMethodName" />
      <Output name="invoiceTypeName" />
      <Output name="invoiceTitleTypeName" />
      <Output name="invoiceDetailTypeName" />
    </Form>
  );

  return (
    <Row code="billIngInfo">
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default BillingInfo;
