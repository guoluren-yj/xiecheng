import React, { Component } from 'react';
import { Form, TextField, DatePicker, Select, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class searchForm extends Component {
  render() {
    const { ds } = this.props;
    return (
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <Select name="sourceMethod" />
        <TextField name="rfxNum" />
        <DatePicker name="quotationStartDate" />
        <DatePicker name="quotationEndDate" />
        <TextField name="rfxTitle" />
        <Select name="quotationType" />
        <Select name="rfxStatus" />
        <Lov name="purOrganizationLov" />
        <Lov name="ouLov" />
        <Lov
          name="sourceProjectLov"
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProject`).d('寻源项目')}
        />
        <Lov
          name="currencyLov"
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
        />
        <Select name="sealedQuotationFlag" />
        <Select name="auctionDirection" />
        <Lov
          name="createdLov"
          placeholder={intl.get(`ssrc.common.model.common.createdByName`).d('创建人')}
        />
        <TextField name="supplierCompanyName" />
        <DatePicker name="creationDate" />
        <TextField name="prNum" />
        <TextField name="prLineNum" />
        <Lov name="purchaseAgentLov" />
      </Form>
    );
  }
}
