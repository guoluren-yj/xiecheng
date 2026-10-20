/**
 * 主容器组件
 */
import React, { useState, useEffect } from 'react';
import { Tabs, Spin } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { queryHistoryVersion, querySupplements } from '@/services/workspaceService';
import { ReactComponent as HistoricalVersionNoData } from '@/assets/historicalVersionNoData.svg';
import HistoricalVersion from './HistoricalVersion';
import styles from './index.less';

const { TabPane } = Tabs;

function Container(props) {
  const { record, goDetail, customizeTabPane, custConfig } = props;
  const { pcHeaderId, mainContractId } = record.get(['pcHeaderId', 'mainContractId']) || {};
  const [activeKey, setActiveKey] = useState('historicalVersion');
  const [operationList, setOperationList] = useState([]);
  const [tab2Data, setTab2Data] = useState([]);
  const [fetchOperationLoading, setOperationLoading] = useState(false);

  const getTab2 = (params) => {
    querySupplements({
      ...params,
      sort: ['creationDate,desc', 'version,desc'],
    }).then((res) => {
      if (getResponse(res)) {
        setTab2Data(res.content || []);
      }
    });
  };

  const getOperationRecords = (params) => {
    setOperationLoading(true);
    queryHistoryVersion(params)
      .then((res) => {
        if (getResponse(res)) {
          setOperationList(res);
        }
      })
      .finally(() => setOperationLoading(false));
  };

  useEffect(() => {
    const params = {
      pcHeaderId: mainContractId || pcHeaderId,
      version: record.get('version'),
    };
    getOperationRecords(params);
    getTab2(params);
    fetchTabKey();
  }, []);

  const fetchTabKey = () => {
    // 得到个性化的默认key
    const tabListFields = custConfig['SPCM.WORKSPACE_ALL.HISTORYVERSION.TABS']?.fields;
    const defaultActiveTab = tabListFields?.filter((item) => {
      return item.defaultActive === 1;
    });
    const defaultActive = defaultActiveTab?.[0]?.fieldCode || activeKey;
    handleChangeTab(defaultActive);
  };

  const handleChangeTab = (tabKey) => setActiveKey(tabKey);

  const operationProps = {
    dataSource: operationList,
    goDetail,
  };

  const renderNoData = () => {
    return (
      <div className={styles['no-data-wrapper']}>
        <HistoricalVersionNoData />
        <div className={styles['no-data']}>
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
      </div>
    );
  };

  // 是否展示补充协议
  const isSupplements = !!record.get('isExistsSupplementFlag');
  return (
    <Spin spinning={fetchOperationLoading}>
      {customizeTabPane(
        { code: 'SPCM.WORKSPACE_ALL.HISTORYVERSION.TABS' },
        <Tabs
          defaultActiveKey={activeKey}
          activeKey={activeKey}
          onChange={handleChangeTab}
          className={styles['approval-Tabs-wrapper']}
        >
          <TabPane
            key="historicalVersion"
            tab={intl.get('spcm.common.view.title.HistoricalVersion').d('历史版本')}
          >
            {operationList.length > 0 ? <HistoricalVersion {...operationProps} /> : renderNoData()}
          </TabPane>
          <TabPane
            key="contractReplenish"
            tab={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
          >
            {isSupplements && tab2Data?.length > 0 ? (
              <HistoricalVersion
                goDetail={goDetail}
                dataSource={tab2Data}
                isSupplements={isSupplements}
              />
            ) : (
              renderNoData()
            )}
          </TabPane>
        </Tabs>
      )}
    </Spin>
  );
}

export default withCustomize({
  unitCode: ['SPCM.WORKSPACE_ALL.HISTORYVERSION.TABS'],
})(Container);
