/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-07 17:19:58
 */
import React, { useContext } from 'react';
import { Output, Lov, Form, Row, Col } from 'choerodon-ui/pro';
import { Store } from '../stores';

const DeliveryInfo = function DeliveryInfo() {
  const { headerDs, customizeForm } = useContext(Store);

  const form = customizeForm(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.DELIVERYINFO',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
      <Output name="receiverContactName" disabled />
      <Output
        name="receiverTelNum"
        disabled
        renderer={({ text, record }) => (
          <span>
            {record?.get('internationalTelCode')} {text}
          </span>
        )}
      />
      <Output name="receiverAddressName" disabled />
      <Lov name="invoiceAddressLov" />
      <Output name="invoiceContactName" disabled />
      <Output name="invoiceTelNum" disabled />
      <Output name="receiverEmailAddress" disabled />
      <Output name="purchaseUnitName" disabled />
    </Form>
  );

  return (
    <Row code="deliveryInfo">
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default DeliveryInfo;
