import React, { Component } from 'react';
import { Form, Output, TextArea, Spin } from 'choerodon-ui/pro';

export default class HeaderInfo extends Component {
  render() {
    const { formDs } = this.props;
    return (
      <Spin dataSet={formDs}>
        <Form dataSet={formDs} columns={3} labelWidth={130}>
          <Output name="billNum" />
          <Output name="supplierName" />
          <Output name="netAmount" />
          <Output name="currencyCode" />
          <Output name="supplierNum" />
          <Output name="taxAmount" />
          <Output name="taxRate" />
          <Output name="companyName" />
          <Output name="taxIncludedAmount" />
          <Output name="billStatusMeaning" />
          <Output name="ecBillNum" />
        </Form>
        <Form dataSet={formDs} labelWidth={130}>
          <TextArea name="approvedRemark" autoSize={{ minRows: 2 }} />
        </Form>
      </Spin>
    );
  }
}
