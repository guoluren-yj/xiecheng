import React, { useContext } from 'react';
import { Select, CheckBox, Form, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const ScoreRule = () => {
  const {
    commonDs: { scoreRuleDs, quotationRuleDs, baseInfoDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  // 过滤评分方式
  const renderTemplateScoreType = (optionRecord) => {
    const newScoreFlag = scoreRuleDs?.getState('newScoreFlag') || false;
    const optionValue = optionRecord.get('value') || null;
    if (newScoreFlag) {
      return optionValue !== 'SCORE';
    } else {
      return optionValue !== 'SCORE_NEW';
    }
  };

  // 切换专家抽取
  const handleChangeExpertExtractFlag = (value) => {
    if (!scoreRuleDs?.current) return;
    if (value === 1) {
      scoreRuleDs.current.set('expertRequirementsRule', 'NONE');
    } else {
      scoreRuleDs.current.set('expertRequirementsRule', null);
    }
  };

  // 切换符合性检查
  const handleChangeInitialReview = (value) => {
    if (!scoreRuleDs?.current) return;
    scoreRuleDs.current.set('reviewHidePrice', 'NO_HIDE');
    if (value === 'NONE') {
      scoreRuleDs.current.set({
        onlyReviewExpertFlag: 0,
      });
    }
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('scoreRule'),
      dataSet: scoreRuleDs,
    },
    <Form dataSet={scoreRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <Select name="bidRuleType" clearButton={false} showHelp="tooltip" />
      <Select
        name="openBidOrder"
        hidden={scoreRuleDs?.current?.get('bidRuleType') === 'NONE'}
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        name="initialReview"
        clearButton={false}
        showHelp="tooltip"
        onChange={handleChangeInitialReview}
      />
      <Select name="expertSource" clearButton={false} showHelp="tooltip" />
      <Select
        name="templateScoreType"
        clearButton={false}
        showHelp="tooltip"
        optionsFilter={renderTemplateScoreType}
      />
      <CheckBox name="scoreIndicFlag" hidden />
      <CheckBox name="noneExpertFlag" showHelp="tooltip" />
      <CheckBox name="noneIndicateFlag" showHelp="tooltip" />
      <CheckBox name="leaderNoScoreFlag" showHelp="tooltip" />
      <Select name="scoringReportGenerationCtrl" clearButton={false} showHelp="tooltip" />
      <Select
        name="businessTechSee"
        hidden={scoreRuleDs?.current?.get('bidRuleType') !== 'NONE'}
        clearButton={false}
        showHelp="tooltip"
      />
      <NumberField name="minExpertNum" showHelp="tooltip" />
      <CheckBox
        name="expertExtractFlag"
        showHelp="tooltip"
        hidden={scoreRuleDs?.current?.get('expertSource') !== 'EXPERT_LIBRARY'}
        onChange={handleChangeExpertExtractFlag}
      />
      <Select
        name="expertRequirementsRule"
        showHelp="tooltip"
        hidden={scoreRuleDs?.current?.get('expertExtractFlag') !== 1}
      />
      <CheckBox
        name="expertReplyFlag"
        showHelp="tooltip"
        hidden={
          scoreRuleDs?.current?.get('expertSource') !== 'EXPERT_LIBRARY' ||
          !scoreRuleDs?.current?.get('expertExtractFlag')
        }
      />
      <CheckBox name="repeatScoreFlag" showHelp="tooltip" />
      <CheckBox name="clarifyRuleFlag" showHelp="tooltip" />
      <Select
        name="scoreHideSupplierRule"
        hidden={scoreRuleDs?.current?.get('bidRuleType') === 'NONE'}
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        clearButton={false}
        name="autoScorePriceType"
        showHelp="tooltip"
        hidden={
          ['NEW_BID', 'RFQ'].includes(baseInfoDs?.current?.get('sourceCategory')) &&
          quotationRuleDs?.current?.get('quotationScope') !== 'ALL_QUOTATION'
        }
      />
      <Select
        clearButton={false}
        name="reviewHidePrice"
        showHelp="tooltip"
        hidden={scoreRuleDs?.current?.get('initialReview') === 'NONE'}
      />
      <CheckBox
        name="onlyReviewExpertFlag"
        showHelp="tooltip"
        hidden={scoreRuleDs?.current?.get('initialReview') === 'NONE'}
      />
    </Form>
  );
};

export default observer(ScoreRule);
