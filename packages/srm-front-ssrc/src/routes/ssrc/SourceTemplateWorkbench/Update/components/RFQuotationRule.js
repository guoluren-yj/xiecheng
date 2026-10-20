import React, { useContext } from 'react';
import { NumberField, Form, Select, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const RFQuotationRule = () => {
  const {
    commonDs: { rfQuotationDs, rfReleaseDs },
  } = useContext(Store);

  return (
    <Form dataSet={rfQuotationDs} columns={3} labelLayout="float" useWidthPercent>
      <NumberField name="minQuotedSupplier" showHelp="tooltip" />
      <CheckBox
        name="sealedQuotationFlag"
        showHelp="tooltip"
        hidden={!rfReleaseDs?.current?.get('lineItemsFlag')}
      />
      <Select name="replyType" />
    </Form>
  );
};

export default observer(RFQuotationRule);
