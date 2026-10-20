/*
 * @Date: 2023-08-31 11:16:50
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head } from 'lodash';
import { Tabs } from 'choerodon-ui/pro';
import React, { useMemo, useContext, useState, useEffect } from 'react';

import intl from 'utils/intl';

import { Context } from '../../Context';
import { getEnterpriseTabPane } from '../utils';

const { TabPane } = Tabs;

const Index = () => {
  const context = useContext(Context);
  const {
    dsObj,
    custLoading,
    requisitionId,
    toStageCode,
    relTableList = [],
    customizeForm,
    customizeTable,
    customizeTabPane,
  } = context;

  const tabPaneList = useMemo(() => getEnterpriseTabPane({ toStageCode, relTableList }), [
    toStageCode,
    relTableList,
  ]);

  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    handleTabChange();
  }, [toStageCode]);

  const handleTabChange = key => {
    setActiveKey(key || (head(tabPaneList) || {}).key);
  };

  const commonProps = {
    isEdit: false,
    requisitionId,
    custLoading,
    customizeForm,
    customizeTable,
    sourceKey: 'APPROVAL_FORM',
  };

  return (
    <div className="card-wrap">
      <div className="enterprise-title">
        <div className="card-detail-title">
          {intl.get('sslm.common.view.title.enterpriseInfo').d('企业信息')}
        </div>
      </div>
      {customizeTabPane(
        {
          code: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.TABS',
          custDefaultActive: key => handleTabChange(key || activeKey),
        },
        <Tabs
          tabPosition="left"
          activeKey={activeKey}
          onChange={handleTabChange}
          custLoading={custLoading}
        >
          {tabPaneList.map(tabPane => (
            <TabPane key={tabPane.key} tab={tabPane.tab}>
              {tabPane.type === 'DynamicTable' ? (
                <tabPane.component
                  c7nButton
                  modelTable={tabPane.modelTable}
                  readOnly
                  relationId={requisitionId}
                  viewSaveButton={!!requisitionId}
                />
              ) : (
                <tabPane.component
                  {...commonProps}
                  dataSet={dsObj[tabPane.key]}
                  customizeUnitCode={tabPane.customizeUnitCode}
                />
              )}
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Index;
