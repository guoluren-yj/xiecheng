import React, { useContext } from 'react';
import { Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const RFQuotationRule = () => {
  const {
    commonDs: { rfExpertScoreDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  // 过滤评分方式
  const optionsFilterScoreType = (optionRecord) => {
    const newScoreFlag = rfExpertScoreDs?.getState('newScoreFlag') || false;
    const optionValue = optionRecord.get('value') || null;
    if (newScoreFlag) {
      return optionValue !== 'SCORE';
    } else {
      return optionValue !== 'SCORE_NEW';
    }
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('rfScoreRule'),
      dataSet: rfExpertScoreDs,
    },
    <Form dataSet={rfExpertScoreDs} columns={3} labelLayout="float" useWidthPercent>
      <Select name="bidRuleType" />
      <Select
        name="openBidOrder"
        hidden={rfExpertScoreDs?.current?.get('bidRuleType') === 'NONE'}
      />
      <Select name="scoreType" optionsFilter={optionsFilterScoreType} />
    </Form>
  );
};

export default observer(RFQuotationRule);
