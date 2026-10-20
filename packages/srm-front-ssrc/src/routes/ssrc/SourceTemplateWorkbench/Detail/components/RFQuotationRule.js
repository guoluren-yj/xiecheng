import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const RFQuotationRule = () => {
  const {
    commonDs: { rfQuotationDs, rfReleaseDs },
  } = useContext(Store);

  return (
    <Form
      dataSet={rfQuotationDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="minQuotedSupplier" showHelp="label" />
      <Output
        name="sealedQuotationFlag"
        hidden={!rfReleaseDs?.current?.get('lineItemsFlag')}
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output name="replyType" />
    </Form>
  );
};

export default observer(RFQuotationRule);
