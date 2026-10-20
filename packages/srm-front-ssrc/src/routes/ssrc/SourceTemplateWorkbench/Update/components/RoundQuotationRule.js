import React, { useContext, useMemo } from 'react';
import { Form, Select, CheckBox, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const RoundQuotationRule = ({ scoreFlag = false }) => {
  const {
    commonDs: { roundQuotationRuleDs },
  } = useContext(Store);

  // 过滤多轮报价节点
  const renderRoundQuotationRule = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (!scoreFlag) {
      return optionValue !== 'NONE' && optionValue !== 'SCORE' && optionValue !== 'AUTO_SCORE';
    }
    return optionValue !== 'NONE';
  };

  // 多轮报价节点flag
  const roundQuotationRuleFlag = useMemo(() => {
    return ['AUTO', 'AUTO_CHECK', 'AUTO_SCORE'].includes(
      roundQuotationRuleDs?.current?.get('roundQuotationRule')
    );
  }, [roundQuotationRuleDs?.current?.get('roundQuotationRule')]);

  return (
    <Form dataSet={roundQuotationRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <Select
        name="roundQuotationRule"
        optionsFilter={renderRoundQuotationRule}
        clearButton={false}
        showHelp="tooltip"
      />
      <CheckBox name="openEliminateFlag" showHelp="tooltip" />
      <CheckBox name="roundQuotationRankFlag" showHelp="tooltip" />
      <Select name="roundQuotationRankRule" clearButton={false} showHelp="tooltip" />
      <NumberField name="quotationRounds" showHelp="tooltip" hidden={!roundQuotationRuleFlag} />
    </Form>
  );
};

export default observer(RoundQuotationRule);
