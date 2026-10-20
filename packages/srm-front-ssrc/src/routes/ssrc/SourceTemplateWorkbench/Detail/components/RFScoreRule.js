import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const RFQuotationRule = () => {
  const {
    commonDs: { rfExpertScoreDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  return customizeForm(
    {
      code: getCustomizeUnitCode('rfScoreRule'),
      dataSet: rfExpertScoreDs,
    },
    <Form
      dataSet={rfExpertScoreDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="bidRuleType" />
      <Output
        name="openBidOrder"
        hidden={rfExpertScoreDs?.current?.get('bidRuleType') === 'NONE'}
      />
      <Output name="scoreType" />
    </Form>
  );
};

export default observer(RFQuotationRule);
