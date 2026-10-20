import React, { useState } from 'react';
import { Tabs, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import UserProblemFeedback from './UserProblemFeedback';
import SameSkuBlackList from './SameSkuBlackList';
import UserWhiteList from './UserWhiteList';
import {
  getUserProblemDataSetProps,
  getSameBlackListDataSetProps,
  getUserWhiteListDataSetProps,
} from './ds';

function getWithProps() {
  const tabs = [
    {
      tabKey: 'userFeedback',
      title: intl.get('smpc.feedback.view.userProblemFeedback').d('用户问题反馈'),
      searchCode: 'SMPC.FEEDBACK.USER_PROBLEM.SEARCH_BAR',
      customizedCode: 'SMPC.FEEDBACK.USER_PROBLEM.LIST',
      getDataSetProps: getUserProblemDataSetProps,
      tabChild: UserProblemFeedback,
    },
    {
      tabKey: 'sameSkuBackList',
      title: intl.get('smpc.feedback.view.sameSkuBackList').d('同款商品黑名单'),
      searchCode: 'SMPC.FEEDBACK.SKU_BALCK_LIST.SEARCH_BAR',
      getDataSetProps: getSameBlackListDataSetProps,
      tabChild: SameSkuBlackList,
    },
    {
      tabKey: 'userWhiteList',
      title: intl.get('smpc.feedback.view.userWhiteList').d('用户白名单'),
      searchCode: 'SMPC.FEEDBACK.USER_WHITE_LIST.SEARCH_BAR',
      customizedCode: 'SMPC.FEEDBACK.USER_WHITE_LIST.LIST',
      getDataSetProps: getUserWhiteListDataSetProps,
      tabChild: UserWhiteList,
    },
  ];
  const tabList = tabs.map((m) => {
    const { getDataSetProps = (e) => e, searchCode, customizedCode, ...other } = m;
    const dataSet = new DataSet(getDataSetProps(m));
    const customizeUnitCode = `${searchCode}${customizedCode ? `,${customizedCode}` : ''}`;
    dataSet.setQueryParameter('customizeUnitCode', customizeUnitCode);
    return { ...other, dataSet, searchCode, customizedCode };
  });
  return {
    tabList,
  };
}

function SkuFeedback(props) {
  const { tabList } = props;
  const [activeKey, setActiveKey] = useState('userFeedback');
  return (
    <>
      <Header
        title={intl.get('smpc.product.model.sameSkuFeedbackManage').d('同款商品反馈管理')}
        backPath="/smpc/sku-workbench-pur/list"
      />
      <Content>
        <Tabs
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            const { dataSet } = tabList.find((f) => f.tabKey === key);
            if (dataSet.getState('queryStatus') === 'ready') {
              dataSet.query();
            }
          }}
          customizedCode="SMPC.FEEDBACK.TABS"
        >
          {tabList.map((m) => {
            const { tabKey, title, dataSet, tabChild, ...other } = m;
            return (
              <Tabs.TabPane key={tabKey} tab={title}>
                {React.createElement(tabChild, { dataSet, ...other })}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Content>
    </>
  );
}

export default formatterCollections({ code: ['smpc.product', 'smpc.feedback'] })(
  withProps(getWithProps, {
    cacheState: true,
    keepOriginDataSet: true,
  })(SkuFeedback)
);
