/*
 * Supplement - 信息补录
 * @Date: 2024-02-06 11:08:50
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getTabPaneList } from './utils';

const { TabPane } = Tabs;

const Index = ({
  pageCode,
  stageCode,
  custLoading,
  templateCode,
  requisitionId,
  customizeForm,
  customizeTable,
  templateVersion,
  customizeTabPane,
  queryTemplateConfig,
  supplementBaseInfoDs,
  supplementAbilityDs,
  supplementClassifyDs,
  supplementPurHeaderDs,
  supplementPurLineDs,
}) => {
  const [activeKey, setActiveKey] = useState('baseInfo');

  const tabPaneList = useMemo(() => getTabPaneList(), []);

  useEffect(() => {
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // tab发生改变时的回调
  const handleTabChange = key => {
    setActiveKey(key);
  };

  const commonProps = {
    requisitionId,
    isEdit: true,
    custLoading,
    customizeForm,
    customizeTable,
    readOnlyFlag: false,
    sourceKey: 'SUPPLEMENT',
  };

  const dataSetObj = {
    baseInfo: supplementBaseInfoDs,
    otherInfo: supplementBaseInfoDs,
    supplierAbility: supplementAbilityDs,
    supplierClassify: supplementClassifyDs,
    purchaseInfo: {
      purchaseHeaderDs: supplementPurHeaderDs,
      purchaseLineDs: supplementPurLineDs,
    },
    attachmentInfo: supplementBaseInfoDs,
  };

  return customizeTabPane(
    {
      code: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL_SUPPLEMENT.TABS',
      custDefaultActive: key => handleTabChange(key || activeKey),
    },
    <Tabs
      tabPosition="left"
      activeKey={activeKey}
      onChange={handleTabChange}
      custLoading={custLoading}
    >
      {tabPaneList.map(item => (
        <TabPane forceRender key={item.key} tab={item.tab}>
          <item.component
            {...commonProps}
            {...item.componentProps}
            dataSet={dataSetObj[item.key]}
          />
        </TabPane>
      ))}
    </Tabs>
  );
};

export default withCustomize({ isTemplate: true })(Index);
