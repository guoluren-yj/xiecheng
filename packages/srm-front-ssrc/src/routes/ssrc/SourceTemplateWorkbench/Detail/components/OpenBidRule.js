import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const OpenBidRule = () => {
  const {
    commonDs: { openBidDs },
  } = useContext(Store);

  return (
    <Form
      dataSet={openBidDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="passwordFlag" renderer={({ value }) => yesOrNoRender(value)} showHelp="label" />
    </Form>
  );
};

export default observer(OpenBidRule);
