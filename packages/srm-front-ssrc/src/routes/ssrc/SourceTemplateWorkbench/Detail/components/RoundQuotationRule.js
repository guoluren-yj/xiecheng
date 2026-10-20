import React, { useContext, useMemo } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const RoundQuotationRule = () => {
  const {
    commonDs: { roundQuotationRuleDs },
  } = useContext(Store);

  // 多轮报价节点flag
  const roundQuotationRuleFlag = useMemo(() => {
    return ['AUTO', 'AUTO_CHECK', 'AUTO_SCORE'].includes(
      roundQuotationRuleDs?.current?.get('roundQuotationRule')
    );
  }, [roundQuotationRuleDs?.current?.get('roundQuotationRule')]);

  return (
    <Form
      dataSet={roundQuotationRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="roundQuotationRule" showHelp="label" />
      <Output
        name="openEliminateFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="roundQuotationRankFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output name="roundQuotationRankRule" showHelp="label" />
      <Output name="quotationRounds" showHelp="label" hidden={!roundQuotationRuleFlag} />
    </Form>
  );
};

export default observer(RoundQuotationRule);
