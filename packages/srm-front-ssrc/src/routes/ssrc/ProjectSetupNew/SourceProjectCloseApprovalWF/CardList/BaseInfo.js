import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';

// 基础信息卡片
const BaseInfoCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('basicInfoForm'),
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="sourceProjectNum" />
      <Output name="sourceProjectName" />
      <Output name="budgetAmount" />
      <Output name="totalEstimatedAmount" />
      <Output name="estimatedDate" />
      <Output name="sourceDate" />
      <Output name="sourceProjectRemark" />
    </Form>
  );
});

export default BaseInfoCmp;
