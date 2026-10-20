import React, { useContext, useEffect } from 'react';
import { Output, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';

import Store from '../../store/index';

export default observer(function BasicInfoCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { scoreBasicFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  const { current } = scoreBasicFormDs;

  useEffect(() => {
    scoreBasicFormDs.query();
  }, []);

  return customizeCollapseForm(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_HEADER_INFO_${sourceCategory}`,
      dataSet: scoreBasicFormDs,
    },
    <CollapseForm
      dataSet={scoreBasicFormDs}
      columns={3}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfTitle" />
      {current?.get('sourceFrom') === 'PROJECT' && (
        <Output
          name="sourceProjectName"
          renderer={({ record, value }) => (
            <Tooltip
              title={`${record?.get('sourceProjectNum')} - ${record?.get('sourceProjectName')}`}
            >
              {value}
            </Tooltip>
          )}
        />
      )}
      <Output name="bidRuleType" />
      <Output name="openBidOrder" />
    </CollapseForm>
  );
});
