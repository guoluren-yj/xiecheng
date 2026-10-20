import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const ScoreRule = () => {
  const {
    commonDs: { scoreRuleDs, quotationRuleDs, baseInfoDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  return customizeForm(
    {
      code: getCustomizeUnitCode('scoreRule'),
      dataSet: scoreRuleDs,
    },
    <Form
      dataSet={scoreRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="bidRuleType" showHelp="label" />
      <Output
        name="openBidOrder"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('bidRuleType') === 'NONE'}
      />
      <Output name="initialReview" showHelp="label" />
      <Output name="expertSource" showHelp="label" />
      <Output name="templateScoreType" showHelp="label" />
      <Output
        name="scoreIndicFlag"
        showHelp="label"
        hidden
        // hidden={!openBidFlag}
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="noneExpertFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="noneIndicateFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="leaderNoScoreFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output name="scoringReportGenerationCtrl" showHelp="label" />
      <Output
        name="businessTechSee"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('bidRuleType') !== 'NONE'}
      />
      <Output name="minExpertNum" showHelp="label" />
      <Output
        name="expertExtractFlag"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('expertSource') !== 'EXPERT_LIBRARY'}
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="expertRequirementsRule"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('expertExtractFlag') !== 1}
      />
      <Output
        name="expertReplyFlag"
        showHelp="label"
        hidden={
          scoreRuleDs?.current?.get('expertSource') !== 'EXPERT_LIBRARY' ||
          !scoreRuleDs?.current?.get('expertExtractFlag')
        }
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="repeatScoreFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="clarifyRuleFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <Output
        name="scoreHideSupplierRule"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('bidRuleType') === 'NONE'}
      />
      <Output
        name="autoScorePriceType"
        showHelp="label"
        hidden={
          ['NEW_BID', 'RFQ'].includes(baseInfoDs?.current?.get('sourceCategory')) &&
          quotationRuleDs?.current?.get('quotationScope') !== 'ALL_QUOTATION'
        }
      />
      <Output
        name="reviewHidePrice"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('initialReview') === 'NONE'}
      />
      <Output
        name="onlyReviewExpertFlag"
        showHelp="label"
        hidden={scoreRuleDs?.current?.get('initialReview') === 'NONE'}
        renderer={({ value }) => yesOrNoRender(value)}
      />
    </Form>
  );
};

export default observer(ScoreRule);
