import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const RFReleaseRule = () => {
  const {
    commonDs: { rfReleaseDs },
  } = useContext(Store);

  return (
    <Form
      dataSet={rfReleaseDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="lineItemsFlag" renderer={({ value }) => yesOrNoRender(value)} />
      <Output name="minVendorNumber" showHelp="label" />
      <Output name="noticeEndNodeCode" showHelp="label" />
    </Form>
  );
};

export default observer(RFReleaseRule);
