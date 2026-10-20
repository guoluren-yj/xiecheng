/*
 * RegisterAuthenticationManage - 注册认证管理
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useCallback, useMemo } from 'react';
import { compose } from 'lodash';

import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { useSetState } from '@/routes/components/utils';

import { getAccountDS } from './stores/getAccountDS';
import { getEnterpriseManageDS } from './stores/getEnterpriseManageDS';
import { getRegisterStrategyDS } from './stores/getRegisterStrategyDS';
import { getPanelList } from './utils/utils';

const Index = ({
  dispatch,
  accountDs,
  enterpriseManageDs,
  registerStrategyDs,
  customizeTable,
  mixObj = {},
}) => {
  const tabs = useMemo(() => getPanelList(), []);

  const [state, setState] = useSetState({
    activeKey: mixObj.currentKey || 'account',
  });

  const { activeKey, allLoading = false } = state;

  /**
   * tab切换
   */
  const handleTabChange = useCallback(
    key => {
      setState({
        activeKey: key,
      });
      // eslint-disable-next-line no-param-reassign
      mixObj.currentKey = key;
    },
    [activeKey]
  );

  const componentProps = {
    account: {
      dataSet: accountDs,
    },
    enterprise: {
      dataSet: enterpriseManageDs,
    },
    registerStrategy: {
      dataSet: registerStrategyDs,
      dispatch,
    },
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('sslm.registerAuthManage.view.title.registerAuthManage').d('注册认证管理')}
      />
      <Content>
        <Spin spinning={allLoading}>
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            {tabs.map(pane => {
              const { tab, key, searchCode, customizeUnitCode } = pane;
              return (
                <Tabs.TabPane tab={tab} key={key}>
                  <pane.component
                    {...componentProps[key]}
                    customizeTable={customizeTable}
                    searchCode={searchCode}
                    customizeUnitCode={customizeUnitCode}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.registerAuthManage', 'sslm.common'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.REGISTER_AUTH_MANAGE.ACCOUNT.LIST',
      'SSLM.REGISTER_AUTH_MANAGE.ENTERPRISE.LIST',
      'SSLM.REGISTER_AUTH_MANAGE.REGISTER_STRATEGY.LIST',
    ],
  }),
  withProps(
    () => {
      const accountDs = new DataSet(getAccountDS());
      const enterpriseManageDs = new DataSet(getEnterpriseManageDS());
      const registerStrategyDs = new DataSet(getRegisterStrategyDS());
      const mixObj = {
        currentKey: 'account',
      };
      return { accountDs, enterpriseManageDs, registerStrategyDs, mixObj };
    },
    { cacheState: true }
  )
)(Index);
