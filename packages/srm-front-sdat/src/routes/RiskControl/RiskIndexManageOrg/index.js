/**
 * 风险指标管理 租户级
 */

import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { compose } from 'lodash';
import withProps from 'utils/withProps';
import { DataSet, Tabs } from 'choerodon-ui/pro'; // Button, Modal

import {
  RiskItemListDS,
  RiskMenuDetailDS,
  RiskDetailDS,
  RiskPlatformDetailDS,
} from './stores/riskItemDS';
import { ScanItemListDS, ScanMenuDetailDS, ScanDetailDS } from './stores/scanItemDS';

import RiskItemManage from './RiskItemManage';
import ScanItemManage from './ScanItemManage';

const { TabPane } = Tabs;
const RiskIndexManage = (props) => {
  const { riskItemListDS, scanItemListDS } = props;

  const riskMenuDetailDS = useMemo(() => new DataSet(RiskMenuDetailDS()), []);
  const riskDetailDS = useMemo(() => new DataSet(RiskDetailDS()), []);
  const riskPlatformDetailDS = useMemo(() => new DataSet(RiskPlatformDetailDS()), []);

  const scanMenuDetailDS = useMemo(() => new DataSet(ScanMenuDetailDS()), []);
  const scanDetailDS = useMemo(() => new DataSet(ScanDetailDS()), []);

  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    riskItemListDS.setQueryParameter('scanFlag', 0); // 风险项
    scanItemListDS.setQueryParameter('scanFlag', 1); // 扫描项
  }, []);

  const handleChangeTabs = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <Header
        title={intl.get('sdat.riskItemConfig.view.title.riskIndexManage').d('风险指标管理')}
        backPath="/sdat/risk-workbench-new/list"
      />
      <Content>
        <Tabs activeKey={activeKey} onChange={handleChangeTabs}>
          <TabPane
            tab={intl.get('sdat.riskItemConfig.view.title.riskItemManage').d('风险项管理')}
            key="1"
          >
            <RiskItemManage
              riskItemListDS={riskItemListDS}
              riskMenuDetailDS={riskMenuDetailDS}
              riskDetailDS={riskDetailDS}
              riskPlatformDetailDS={riskPlatformDetailDS}
            />
          </TabPane>
          <TabPane
            tab={intl.get('sdat.riskItemConfig.view.title.scanItemManage').d('企业信息补充项管理')}
            key="2"
          >
            <ScanItemManage
              scanItemListDS={scanItemListDS}
              scanMenuDetailDS={scanMenuDetailDS}
              scanDetailDS={scanDetailDS}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default compose(
  connect((state) => state),
  formatterCollections({
    code: ['sdat.common', 'sdat.riskItemConfig'],
  }),
  withProps(
    () => {
      const riskItemListDS = new DataSet(RiskItemListDS());
      const scanItemListDS = new DataSet(ScanItemListDS());

      return {
        riskItemListDS,
        scanItemListDS,
      };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )
)(RiskIndexManage);
