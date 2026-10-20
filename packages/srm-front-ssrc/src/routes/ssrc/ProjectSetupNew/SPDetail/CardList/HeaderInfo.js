import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';

import { StoreContext } from '../store/StoreProvider';

// 基础信息卡片
const BaseInfoCmp = observer(() => {
  const { commonDs: { headerDs } = {}, getCustomizeUnitCode, customizeCollapseForm } = useContext(
    StoreContext
  );

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('baseInfoForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      showLines={3}
      useWidthPercent
    >
      <Output name="sourceProjectNum" />
      <Output name="sourceProjectName" />
      <Output name="budgetAmount" />
      <Output name="totalEstimatedAmount" />
      <Output name="estimatedDate" />
      <Output name="sourceDate" />
      <Output name="subjectMatterRuleMeaning" />
      <Output name="sourceProjectRemark" newLine colSpan={2} />
    </CollapseForm>
  );
});

export default BaseInfoCmp;
