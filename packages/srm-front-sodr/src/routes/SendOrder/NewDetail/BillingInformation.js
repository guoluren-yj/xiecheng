import React, { useContext } from 'react';
import { Form, Output, Spin, SecretField } from 'choerodon-ui/pro';
import { Store } from './stores';

const BillingInformation = function BillingInformation() {
  const { headerDs } = useContext(Store);
  return (
    <Spin dataSet={headerDs}>
      <Form
        dataSet={headerDs}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
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
    </Spin>
  );
};

export default BillingInformation;
