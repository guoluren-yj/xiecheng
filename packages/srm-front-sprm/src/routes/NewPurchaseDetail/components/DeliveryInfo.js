/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-02-24 19:18:26
 */
import React, { useContext } from 'react';
import { Form, Row, Col, Output } from 'choerodon-ui/pro';
import { Store } from '../stores';

const DeliveryInfo = function DeliveryInfo({ code }) {
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
      <Output name="receiverContactName" />
      <Output
        name="receiverTelNum"
        disabled
        renderer={({ text, record }) => (
          <span>
            {record?.get('internationalTelCode')} {text}
          </span>
        )}
      />
      <Output name="receiverAddressName" />
      <Output name="invoiceAddressLov" />
      <Output name="invoiceContactName" />
      <Output name="invoiceTelNum" />
      <Output name="receiverEmailAddress" />
      <Output name="purchaseUnitName" />
    </Form>
  );

  return (
    <Row code="deliveryInfo">
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default DeliveryInfo;
