import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const BargainRule = () => {
  const {
    commonDs: { bargainRuleDs },
  } = useContext(Store);

  return (
    <Form
      dataSet={bargainRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="bargainRule" showHelp="label" />
      <Output
        name="bargainOfflineFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
    </Form>
  );
};

export default observer(BargainRule);
