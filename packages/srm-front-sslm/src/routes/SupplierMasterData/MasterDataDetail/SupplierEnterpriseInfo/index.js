/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Card, Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import React, { useState, useCallback, useMemo, useContext } from 'react';

import intl from 'utils/intl';

import { getTooltipShow } from '@/routes/components/utils';

import { Context } from '../../Context';
import { getBasicInfoTab } from './utils/getTabList';
import styles from '../../styles.less';

const { TabPane } = Tabs;

const Index = () => {
  const context = useContext(Context);

  const { customizeTabPane, platformCoincideConfigList = [] } = context;

  const [activeKey, setActiveKey] = useState('basic');

  const panelList = useMemo(() => getBasicInfoTab({ platformCoincideConfigList }), [
    platformCoincideConfigList,
  ]);

  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  return !isEmpty(panelList) ? (
    <div className="supplier-detail-content">
      <Alert
        showIcon
        type="info"
        className={styles['enterprise-alert']}
        message={intl
          .get('sslm.supplierDetail.view.title.enterpriseBasicInfoTips')
          .d(
            '如需修改以下信息，请在右上角切换租户，切换至您所属企业对应租户下，搜索“企业信息变更”菜单，新建单据变更相关内容'
          )}
      />
      <Card
        bordered={false}
        title={intl.get('sslm.supplierDetail.view.title.enterpriseBasicInfo').d('企业基础信息')}
      >
        {customizeTabPane(
          {
            code: 'SUPPLIER_MASTER_DATA.ENTERPRISE_TABS',
            custDefaultActive: key => handleTabsChange(key || activeKey),
          },
          <Tabs
            tabPosition="left"
            customizable={false}
            activeKey={activeKey}
            onChange={handleTabsChange}
          >
            {panelList.map(panel => {
              const { key, investigaConfig } = panel;
              let componentProps = {};
              if (investigaConfig) {
                componentProps = { config: investigaConfig };
              }
              return (
                <TabPane
                  forceRender
                  tab={<div>{getTooltipShow(panel.lable, 14, 120)}</div>}
                  key={key}
                >
                  <panel.component {...componentProps} />
                </TabPane>
              );
            })}
          </Tabs>
        )}
      </Card>
    </div>
  ) : null;
};

export default Index;
