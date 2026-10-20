import React from 'react';
import { compose } from 'lodash';

import remote from 'hzero-front/lib/utils/remote';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { StoreProvider } from './store/index';
import Page from './Page';

const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default compose(
  remote({
    code: 'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL',
  }),
  WithCustomizeC7N({
    unitCode: [
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.BASE_INFO',
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.QUOTATION_RULE',
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.CHECK_PRICE_RULE',
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.DELAYED_PRICE_BIDDING_RULE', // 延时竞价规则
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.EXPERT_SCORE_RULE', // 询价专家评分规则
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.RF_EXPERT_SCORE_RULE', // RFI、RFP专家评分规则
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.RELEASE_RULE', // 询价招标竞价 发布规则
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.RF_APPROVE_RULE', // RF 全局规则
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.ATTACHMENT_REQUIREMENTS', // 询价-全局规则-附件要求
    ],
  }),
  formatterCollections({
    code: [
      'ssrc.sourceTemplate',
      'ssrc.common',
      'ssrc.inquiryHall',
      'ssrc.rulesDefinition',
      'ssrc.rfTemplate',
      'sscux.ssrc',
    ],
  })
)(Index);
