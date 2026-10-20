import React, { useContext } from 'react';
import { Form, Output, Spin } from 'choerodon-ui/pro';
import { Store } from './stores';

const DeliveryInformationHeader = function DeliveryInformationHeader() {
  const { headerDs, customizeForm, sourceFromCancel } = useContext(Store);
  const { current } = headerDs;
  const { poSourcePlatform } = current ? current.get(['poSourcePlatform']) : {};
  const form = customizeForm(
    {
      code: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA'
        : 'SODR.SEND_ORDER_DETAIL.DELIVERY_CATA',
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      <Output name="shipToLocationAddress" />
      <Output name="shipToLocContName" newLine />
      <Output name="shipToLocTelNum" />
      <Output name="billToLocationAddress" newLine />
      {poSourcePlatform === 'E-COMMERCE' && (
        <>
          <Output name="billToLocContName" newLine />
          <Output name="billToLocTelNum" />
        </>
      )}
    </Form>
  );
  return <Spin dataSet={headerDs}>{form}</Spin>;
};

export default DeliveryInformationHeader;
