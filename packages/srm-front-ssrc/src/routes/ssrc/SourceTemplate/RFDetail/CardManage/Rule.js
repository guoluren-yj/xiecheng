import React, { Fragment, useContext } from 'react';
import { NumberField, Select, SelectBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';

import Store from '../store/index';

export default observer(function RuleCard() {
  const {
    routerParams: { isHistory = false },
    commonDs: { ruleFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  const { current } = ruleFormDs || {};

  // 过滤评分方式
  const optionsFilterScoreType = (optionRecord) => {
    const newScoreFlag = ruleFormDs?.getState('newScoreFlag') || false;
    const optionValue = optionRecord.get('value') || null;
    if (newScoreFlag) {
      return optionValue !== 'SCORE';
    } else {
      return optionValue !== 'SCORE_NEW';
    }
  };

  return (
    <Fragment>
      <h3 className="rf-card-sub-title" style={{ marginTop: '16px' }}>
        <div className="rf-card-sub-title-line" />
        {intl.get('ssrc.rfTemplate.view.card.subtitle.consultationStage').d('征询阶段')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_STAGE`,
          dataSet: ruleFormDs,
        },
        <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" disabled={isHistory}>
          <NumberField name="minInviteSupplier" />
          <NumberField name="minQuotedSupplier" />
          <SelectBox name="sealedQuotationFlag">
            <SelectBox.Option value={1}>
              {intl.get('ssrc.rfTemplate.model.rfTemplate.sealedQuotation').d('密封')}
            </SelectBox.Option>
            <SelectBox.Option value={0}>
              {intl.get('ssrc.rfTemplate.model.rfTemplate.noSealedQuotation').d('非密封')}
            </SelectBox.Option>
          </SelectBox>
          <SelectBox name="lineItemsFlag">
            <SelectBox.Option value={1}>{intl.get('hzero.common.yes').d('是')}</SelectBox.Option>
            <SelectBox.Option value={0}>{intl.get('hzero.common.no').d('否')}</SelectBox.Option>
          </SelectBox>
          <Select name="noticeEndNodeCode" clearButton={false} showHelp="tooltip" />
        </CollapseForm>
      )}
      {ruleFormDs?.current?.get('expertScoreType') === 'ONLINE' ? (
        <Fragment>
          <h3 className="rf-card-sub-title" style={{ paddingBottom: '16px' }}>
            <div className="rf-card-sub-title-line" />
            {intl.get('ssrc.rfTemplate.view.card.subtitle.expert').d('专家评分阶段')}
          </h3>
          {customizeCollapseForm(
            {
              code: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_SCORE_STAGE`,
              dataSet: ruleFormDs,
            },
            <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" disabled={isHistory}>
              <SelectBox name="bidRuleType" />
              {current?.get('bidRuleType') === 'DIFF' && <Select name="openBidOrder" />}
              <Select name="scoreType" clearButton={false} optionsFilter={optionsFilterScoreType} />
            </CollapseForm>
          )}
        </Fragment>
      ) : null}
    </Fragment>
  );
});
