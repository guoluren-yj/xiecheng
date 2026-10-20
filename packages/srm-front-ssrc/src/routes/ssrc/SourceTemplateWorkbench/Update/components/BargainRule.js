import React, { useContext } from 'react';
import { Select, CheckBox, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const BargainRule = ({ scoreFlag = false }) => {
  const {
    commonDs: { bargainRuleDs },
  } = useContext(Store);

  // 议价规则选项过滤
  const renderBargainRule = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (!scoreFlag) {
      return !['NONE', 'SCORE', 'ALL'].includes(optionValue);
    }
    return optionValue !== 'NONE';
  };

  return (
    <Form dataSet={bargainRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <Select
        name="bargainRule"
        optionsFilter={renderBargainRule}
        clearButton={false}
        showHelp="tooltip"
      />
      <CheckBox name="bargainOfflineFlag" showHelp="tooltip" />
    </Form>
  );
};

export default observer(BargainRule);
