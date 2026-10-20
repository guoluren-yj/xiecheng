import React, { useContext } from 'react';
import { NumberField, Form, Select, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const RFReleaseRule = () => {
  const {
    commonDs: { rfReleaseDs },
  } = useContext(Store);

  return (
    <Form dataSet={rfReleaseDs} columns={3} labelLayout="float" useWidthPercent>
      <CheckBox name="lineItemsFlag" showHelp="tooltip" />
      <NumberField name="minVendorNumber" showHelp="tooltip" />
      <Select name="noticeEndNodeCode" clearButton={false} showHelp="tooltip" />
    </Form>
  );
};

export default observer(RFReleaseRule);
