import React, { useEffect, useMemo, useState } from 'react';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse } from '@/utils/utils';

import RiskIncidentDetail from '../components/RiskIncidentDetail';

import { EventListDS, IncidentDetailDS } from '../../store/monitorOrgManagementDs';
import styles from './index.less';

const riskEventKey = Modal.key();
const organizationId = getCurrentOrganizationId();

const EventList = (props) => {
  const incidentDetailDS = useMemo(() => new DataSet(IncidentDetailDS()), []);

  const { eventListDS, match = {} } = props;

  const socialCode = match?.params?.id;
  const enterpriseName = match?.params?.enterpriseName;

  const [levelMap, setLevelMap] = useState({});

  useEffect(() => {
    queryMapIdpValue({
      levelList: 'SDAT.WORKBENCH_EVENT_LEVEL',
    }).then((res) => {
      if (getResponse(res)) {
        const levelList = res?.levelList ?? [];
        if (levelList.length) {
          const obj = {};
          if (levelList.length) {
            levelList.forEach((item) => {
              obj[item.value] = item.meaning;
            });
          }
          setLevelMap(obj);
        }
      }
    });

    if (socialCode) {
      eventListDS.setQueryParameter('socialCode', socialCode);
      eventListDS.setQueryParameter('sort', 'lastUpdateTime,desc');
      eventListDS.query();
    }
  }, []);

  /**
   * 查看事件详情
   * @param {*} record
   */
  const handleViewDetail = (record) => {
    let modal = null;

    const item = record?.toData() ?? {};

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.title.riskIncidentDetail').d('风险事件详情'),
      children: <RiskIncidentDetail localRecord={item} dataSet={incidentDetailDS} />,
      key: riskEventKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const columns = () => {
    return [
      {
        name: 'eventNumber',
        width: 200,
        renderer: ({ record }) => {
          return <a onClick={() => handleViewDetail(record)}>{record?.get('eventNumber')}</a>;
        },
      },
      {
        name: 'eventLevel',
        width: 120,
        renderer: ({ text }) => {
          const classnames = [3, '3'].includes(text)
            ? styles['incident-item-tag-high']
            : [2, '2'].includes(text)
            ? styles['incident-item-tag-middle']
            : styles['incident-item-tag-low'];

          return <Tag className={classnames}>{levelMap[String(text)]}</Tag>;
        },
      },
      { name: 'eventType' },
      { name: 'eventName' },
      { name: 'eventTime', width: 180 },
    ];
  };

  return (
    <div className={styles['risk-detail-basic']}>
      <Header
        useDefaultTitle={false}
        title={intl.get('sdat.monitorOrgManagement.view.pageTitle.viewRiskEvent', {
          name: enterpriseName,
        })}
        backPath="/sdat/monitor-org-management/list"
      >
        <ExcelExportPro
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            style: { border: 'none' },
          }}
          defaultSelectAll
          requestUrl={`${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-events/manager-event-export`}
          queryParams={{
            sort: 'lastUpdateTime,desc',
            socialCode,
          }}
          buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
        />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 186px)' }}>
          <Table
            dataSet={eventListDS}
            columns={columns()}
            queryBar="none"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: [
    'sdat.monitorOrgManagement',
    'sdat.riskControl',
    'sdat.monitorBusiness',
    'sdat.riskDefinition',
    'sdat.monitorStuff',
  ],
})(
  withProps(
    () => {
      const eventListDS = new DataSet({ ...EventListDS() });

      return { eventListDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(EventList)
);
