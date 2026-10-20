import React, { useMemo, useState, useEffect } from 'react';
import intl from 'utils/intl';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Tag, Tabs } from 'choerodon-ui';

// import { getResponse } from '@/utils/utils';
import StaticSearchBar from '@/components/StaticSearchBar';

import { MonitorListDS, RiskListDS } from '../stores/eventUpdateSummaryDS';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const { TabPane } = Tabs;

export default function RightListPanel(props) {
  const { localRecord, history } = props;
  const { location } = history;
  const { search = '' } = location;

  const monitorListDS = useMemo(() => new DataSet({ ...MonitorListDS() }), []);
  const riskListDS = useMemo(() => new DataSet({ ...RiskListDS() }), []);

  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    if (search && search.includes('activeTab')) {
      setActiveKey('2');
    }
  }, [search]);

  useEffect(() => {
    if (localRecord && localRecord.tenantId) {
      monitorListDS.setQueryParameter('tenantId', localRecord.tenantId);
      monitorListDS.setQueryParameter('sort', 'addMonitorTime:desc');
      riskListDS.setQueryParameter('tenantId', localRecord.tenantId);
      riskListDS.setQueryParameter('sort', 'lastUpdateDate:desc');
      monitorListDS.query();
      riskListDS.query();
    }
  }, [localRecord]);

  const handleJumpDetail = (record) => {
    const tenantId = record?.get('tenantId') ?? '';
    const socialCode = record?.get('socialCode') ?? '';
    const client = record?.get('client') ?? '';
    const enterpriseName = record?.get('enterpriseName') ?? '';
    if (tenantId) {
      history.push(
        `/sdat/event-update-summary/monitor-detail/${tenantId}/${socialCode}/${client}/${enterpriseName}`
      );
    }
  };

  const handleQueryMonitor = ({ params }) => {
    monitorListDS.queryDataSet.data = [
      {
        ...params,
        tenantId: localRecord?.tenantId ?? '',
        sort: params?.customizeOrderField ?? '',
      },
    ];
    if (localRecord && localRecord.tenantId) {
      monitorListDS.setQueryParameter('sort', params?.customizeOrderField ?? 'addMonitorTime:desc');
      monitorListDS.query();
    }
  };

  const handleQueryRisk = ({ params }) => {
    const timeRange = params?.dateRange_range?.split(',') ?? [];
    const startDate = timeRange && timeRange.length && timeRange[0] ? `${timeRange[0]}` : '';
    const endDate = timeRange && timeRange.length > 1 && timeRange[1] ? `${timeRange[1]}` : '';
    riskListDS.queryDataSet.data = [
      {
        ...params,
        tenantId: localRecord?.tenantId ?? '',
        sort: params.customizeOrderField,
        startDate,
        endDate,
        dateRange_range: '',
      },
    ];
    if (localRecord && localRecord.tenantId) {
      riskListDS.setQueryParameter('sort', params?.customizeOrderField ?? 'lastUpdateDate:desc');
      riskListDS.query();
    }
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const monitorStatusMap = {
    1: styles['business-tag-monitor'],
    0: styles['business-tag-monitor-removed'],
  };

  const levelStyleMap = {
    1: styles['business-tag-level-1'], // 高风险
    2: styles['business-tag-level-2'], // 较高风险,
    3: styles['business-tag-level-3'], // 中风险,
    4: styles['business-tag-level-4'], // 较低风险,
    5: styles['business-tag-level-5'], // 低风险,
  };

  const monitorColumns = () => {
    return [
      {
        name: 'monitorStatus',
        width: 100,
        renderer: ({ text, value }) => {
          const classNames = monitorStatusMap[value];
          return <Tag className={classNames}>{text}</Tag>;
        },
      },
      { name: 'appId', width: 100 },
      {
        name: 'enterpriseName',
        width: 200,
        renderer: ({ text, record }) => {
          return <a onClick={() => handleJumpDetail(record)}>{text}</a>;
        },
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ text, value }) => {
          const classNames = levelStyleMap[value];
          return <Tag className={classNames}>{text}</Tag>;
        },
      },
      { name: 'socialCode' },
      { name: 'addMonitorTime', width: 180 },
      { name: 'cancelMonitorTime', width: 180 },
    ];
  };

  /**
   * 编辑操作
   * @param {*} record
   */
  const handleEditItem = async (record) => {
    if (record.get('defineId')) {
      history.push(
        `/sdat/event-update-summary/risk-definition/${record.get('defineId')}/${
          localRecord?.tenantId ?? ''
        }/${record?.get('groupCode') ?? ''}`
      );
    }
  };

  const riskColumns = () => {
    return [
      {
        name: 'enableFlag',
        width: 100,
        renderer: ({ text }) => {
          return text === '1' ? (
            <Tag className={styles['risk-definition-status-tag-enabled']}>
              {intl.get('sdat.common.model.status.enable').d('启用')}
            </Tag>
          ) : text === '0' ? (
            <Tag className={styles['risk-definition-status-tag-disabled']}>
              {intl.get('sdat.common.model.status.disable').d('禁用')}
            </Tag>
          ) : (
            <Tag className={styles['risk-definition-status-tag-draft']}>
              {intl.get('sdat.common.view.title.create').d('新建')}
            </Tag>
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => handleEditItem(record)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </span>
          );
        },
      },
      { name: 'scope', width: 120 },
      { name: 'outerCount' },
      { name: 'businessCount' },
      { name: 'disasterCount' },
      { name: 'updateName' },
      { name: 'updateTime', width: 180 },
    ].filter(Boolean);
  };

  return (
    <div className={styles['event-update-summary-right-panel']}>
      <Tabs activeKey={activeKey} onChange={handleChangeTab}>
        <TabPane
          tab={intl.get('sdat.eventUpdateSummary.view.title.companyMonitor').d('监控企业')}
          key="1"
        >
          <div className={styles['event-update-summary-right-monitor-searchBar']}>
            <StaticSearchBar
              key="eve-upt-monitor-lst"
              cacheState
              clearButton
              searchCode="SDAT.EVENT_UPDATE_SUMMARY_MONITOR_QUERY_BAR"
              filters={getFilters()}
              dataSet={[monitorListDS]}
              onQuery={handleQueryMonitor}
              showLoading={false}
            />
          </div>
          <div style={{ height: 'calc(100vh - 320px)', paddingBottom: '10px' }}>
            <Table
              dataSet={monitorListDS}
              columns={monitorColumns()}
              queryBar="none"
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        </TabPane>
        <TabPane
          tab={intl.get('sdat.eventUpdateSummary.view.title.riskDefinition').d('风险定义')}
          key="2"
        >
          <div className={styles['event-update-summary-right-risk-searchBar']}>
            <StaticSearchBar
              key="eve-upt-risk-lst"
              cacheState
              clearButton
              searchCode="SDAT.EVENT_UPDATE_SUMMARY_RISKLIST_QUERY_BAR"
              filters={getFilters()}
              dataSet={[riskListDS]}
              onQuery={handleQueryRisk}
              showLoading={false}
              // defaultExpand={false}
            />
          </div>
          <div style={{ height: 'calc(100vh - 320px)', paddingBottom: '10px' }}>
            <Table
              dataSet={riskListDS}
              columns={riskColumns()}
              queryBar="none"
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}
