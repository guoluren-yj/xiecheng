import React from 'react';
import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';
import { StoreProvider } from './store/index';

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BASIC_INFO`, // 基础信息
      `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.PROCESS_NODE`, // 流程节点配置
      `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_STAGE`, // 征询阶段
      `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_SCORE_STAGE`, // 专家评分阶段
      'SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BUSINESS_DEFAULT_SETTING', // 业务默认配置项
    ],
  }),
  formatterCollections({ code: ['ssrc.rfTemplate'] })
)(Index);
