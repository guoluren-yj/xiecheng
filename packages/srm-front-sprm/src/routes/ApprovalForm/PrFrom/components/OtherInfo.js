import React from 'react';
import { Form, Row, Col, Output } from 'choerodon-ui/pro';
// import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

const OtherInfo = function OtherInfo(props) {
  const { code, ds, customizeForm } = props;

  const renderAmount = ({ record, name, text }) => {
    // 判断来源是头还是行
    const field = 'headerPriceHiddenFlag';

    if (record && record.get(field) === 1) {
      return record.get(`${name}Meaning`);
    }

    return text;
  };

  const form = customizeForm(
    {
      code,
      dataSet: ds,
    },
    <Form dataSet={ds} columns={3} labelLayout="vertical" className="c7n-pro-vertical-form-display">
      <Output name="prSourcePlatform" />
      <Output name="originalCurrency" />
      <Output name="localCurrency" />
      <Output name="localCurrencyTaxSum" renderer={renderAmount} />
      <Output name="localCurrencyNoTaxSum" renderer={renderAmount} />
      <Output name="paymentMethodName" />
      <Output name="lotNum" />
      <Output
        name="rpSourceFlag"
        renderer={({ value }) =>
          value === 1
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否')
        }
      />

      <Output name="companyName" />
      <Output name="ouName" />
      <Output name="purchaseOrgName" />
      <Output name="purchaseAgentName" />

      {/* <Output name="invoiceTitle" />
      <Output name="taxRegisterNum" />
      <Output name="taxRegisterAddress" />
      <Output name="taxRegisterTel" />
      <Output name="taxRegisterBank" />
      <Output name="taxRegisterBankAccount" />

      <Output name="invoiceMethodName" />
      <Output name="invoiceTitleTypeName" />
      <Output name="invoiceDetailTypeName" />
      <Output name="receiverContactName" />
      <Output name="receiverTelNum" />
      <Output name="receiverAddressName" />
      <Output name="invoiceAddress" />
      <Output name="invoiceContactName" />
      <Output name="invoiceTelNum" />
      <Output name="receiverEmailAddress" />
      <Output name="purchaseUnitName" /> */}
    </Form>
  );

  return (
    <Row code="otherInfo">
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default OtherInfo;
