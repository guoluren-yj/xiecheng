import React, { useMemo, useEffect, useState } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { queryMapIdpValue } from 'services/api';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import { getResponse } from '@/utils/utils';
import StaticSearchBar from '@/components/StaticSearchBar';

import { RiskEventListDS, IncidentDetailDS } from '../stores/eventUpdateSummaryDS';
import RiskIncidentDetail from '../RiskIncidentDetail';
import OperationRecord from '../OperationRecord';
// import OperationList from '../OperationList';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const modalKey = Modal.key();
const recordKey = Modal.key();

export default function RightPanel(props) {
  const { localRecord, client } = props;

  const listDS = useMemo(() => new DataSet({ ...RiskEventListDS() }), []);
  const incidentDetailDS = useMemo(() => new DataSet({ ...IncidentDetailDS() }), []);

  const [levelMap, setLevelMap] = useState({});
  // const [approveMap, setApproveMap] = useState({});
  const [statusMap, setStatusMap] = useState({});

  const userId = localRecord?.userId ?? '';

  useEffect(() => {
    queryMapIdpValue({
      approveList: 'SDAT.PROCESS_STATUS',
      statusList: 'SDAT.WORKBENCH_EVENT_STATUS',
      levelList: 'SDAT.WORKBENCH_EVENT_LEVEL',
    }).then(res => {
      if (getResponse(res)) {
        // const obj3 = {};
        const obj = {};
        const obj2 = {};

        // if (res.approveList && res.approveList.length) {
        //   res.approveList.forEach(item => {
        //     obj3[item.value] = item.meaning;
        //   });
        // }

        if (res.levelList && res.levelList.length) {
          res.levelList.forEach(item => {
            obj2[item.value] = item.meaning;
          });
        }

        if (res.statusList && res.statusList.length) {
          res.statusList.forEach(item => {
            obj[item.value] = item.meaning;
          });
        }
        setStatusMap(obj);
        // setApproveMap(obj3);
        setLevelMap(obj2);
      }
    });
  }, []);

  useEffect(() => {
    const tenantId = localRecord?.tenantId ?? '';
    if (userId && tenantId) {
      listDS.setQueryParameter('userId', userId);
      listDS.setQueryParameter('tenantId', tenantId);
      listDS.setQueryParameter('emptyFlag', false);
      listDS.setQueryParameter('sort', 'lastUpdateTime,desc');
      listDS.query();
    }
  }, [userId]);

  const handleFilterQueryAll = ({ params }) => {
    const tenantId = localRecord?.tenantId ?? '';
    const timeRange = params?.updateTime_range?.split(',') ?? [];
    const startDate = timeRange && timeRange.length && timeRange[0] ? `${timeRange[0]}` : '';
    const endDate = timeRange && timeRange.length > 1 && timeRange[1] ? `${timeRange[1]}` : '';

    listDS.queryDataSet.data = [
      {
        ...params,
        tenantId,
        emptyFlag: false,
        userId,
        startDate,
        endDate,
        statusList: params?.status_range,
        codeList: params?.type_range,
        levelList: params?.level_range,
        status_range: '',
        type_range: '',
        level_range: '',
      },
    ];
    if (tenantId && userId) {
      listDS.setQueryParameter('sort', params?.customizeOrderField ?? 'lastUpdateTime,desc');
      listDS.query();
    }
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  /**
   * 查看操作记录
   */
  const openOperationRecordModal = item => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录'),
      children: (
        <OperationRecord
          localRecord={item}
          client={client}
          modalType="riskDetail"
          tenantId={localRecord?.tenantId}
          userId={userId}
        />
      ),
      key: recordKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '432px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * ⻛险事件详情
   * @param {*} item
   */
  const openEventDetail = item => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.title.riskIncidentDetail').d('风险事件详情'),
      children: (
        <RiskIncidentDetail
          localRecord={item}
          tenantId={localRecord?.tenantId}
          userId={userId}
          dataSet={incidentDetailDS}
        />
      ),
      key: modalKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
          <Button onClick={() => openOperationRecordModal(item)}>
            {intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录')}
          </Button>
        </div>
      ),
    });
  };

  const classnames = {
    3: styles['incident-item-tag-high'],
    2: styles['incident-item-tag-middle'],
    1: styles['incident-item-tag-low'],
  };

  const classesMap = {
    PENDING: styles['incident-item-tag-pending'],
    HANDLING: styles['incident-item-tag-handle'],
    FINISH: styles['incident-item-tag-finish'],
  };

  const columns = () => {
    return [
      {
        name: 'status',
        width: 120,
        renderer: ({ text }) => {
          const approveNames = classesMap[text];
          return <Tag className={approveNames}>{statusMap[String(text)]}</Tag>;
        },
      },
      {
        name: 'eventNumber',
        width: 200,
        renderer: ({ text, record }) => {
          const item = record && record.toData ? record.toData() : {};
          return <a onClick={() => openEventDetail(item)}>{text}</a>;
        },
      },
      {
        name: 'eventLevel',
        width: 120,
        renderer: ({ text }) => {
          const approveNames = classnames[text];
          return <Tag className={approveNames}>{levelMap[String(text)]}</Tag>;
        },
      },
      { name: 'eventName' },
      { name: 'eventTime', width: 180 },
      { name: 'lastUpdateDate', width: 180 },
    ];
  };

  return (
    <div className={styles['event-update-summary-detail-right']}>
      <div className={styles['event-update-summary-detail-right-searchBar']}>
        <StaticSearchBar
          key="eve-upt-sum"
          cacheState
          clearButton
          searchCode="SDAT.EVENT_UPDATE_SUMMARY_DETAIL_QUERY_BAR"
          filters={getFilters()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          showLoading={false}
          // defaultExpand={false}
        />
      </div>
      <div style={{ height: 'calc(100vh - 300px)' }}>
        <Table
          dataSet={listDS}
          columns={columns()}
          queryBar="none"
          autoHeight={{ type: 'maxHeight', diff: 40 }}
        />
      </div>
    </div>
  );
}
