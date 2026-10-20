/**
 * 风险事件tab卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useCallback } from 'react';
import { SelectBox } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';

import RiskStuffTrend from './RiskStuffTrend';
import RiskLevelDistribution from './RiskLevelDistribution';
import RiskTypeDistrubution from './RiskTypeDistrubution';

const { TabPane } = Tabs;
const { Option } = SelectBox;

export default function PublicOpinionDistribution(props = {}) {
  const { canSearch = false } = props;
  const [rangeValue, setRangeValue] = useState('week');

  const renderTab = useCallback(
    (title) => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{title}</span>,
    []
  );

  const renderExtraOptions = (
    <SelectBox
      mode="button"
      value={rangeValue}
      onChange={(value) => {
        setRangeValue(value);
      }}
    >
      <Option value="week" style={{ fontWeight: rangeValue === 'week' ? 500 : 400 }}>
        {intl.get('sdat.supplierRiskMonitor.view.tab.oneWeek').d('近一周')}
      </Option>
      <Option value="month" style={{ fontWeight: rangeValue === 'month' ? 500 : 400 }}>
        {intl.get('sdat.supplierRiskMonitor.view.tab.oneMonth').d('近一月')}
      </Option>
    </SelectBox>
  );

  return (
    <Tabs
      defaultActiveKey="1"
      tabBarStyle={{ margin: '22px 22px 0 22px', borderBottom: 'transparent 0px solid' }}
      inkBarStyle={{ backgroundColor: 'transparent' }}
      tabBarExtraContent={renderExtraOptions}
    >
      <TabPane
        tab={renderTab}
        title={intl.get('sdat.supplierRiskMonitor.view.title.riskStuffTrend').d('风险事件趋势')}
        key="1"
      >
        <RiskStuffTrend rangeValue={rangeValue} canSearch={canSearch} />
      </TabPane>
      <TabPane
        tab={renderTab}
        title={intl
          .get('sdat.supplierRiskMonitor.view.title.riskLevelDistribution')
          .d('风险级别分布')}
        key="2"
      >
        <RiskLevelDistribution rangeValue={rangeValue} canSearch={canSearch} />
      </TabPane>
      <TabPane
        tab={renderTab}
        title={intl
          .get('sdat.supplierRiskMonitor.view.title.riskTypeDistribution')
          .d('风险类型分布')}
        key="3"
      >
        <RiskTypeDistrubution rangeValue={rangeValue} canSearch={canSearch} />
      </TabPane>
    </Tabs>
  );
}
