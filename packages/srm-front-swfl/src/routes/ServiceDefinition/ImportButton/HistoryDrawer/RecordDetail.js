import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { isNil } from 'lodash';
import { connect } from 'dva';

import PopoverField, { PopoverFieldType } from '@/components/PopoverField';
import {
  importStatusRenderer,
  sortRecordList,
  recordDetailTableDS,
  StatusColor,
  tagRenderer,
} from '../util';
import styles from './index.less';

function RecordDetail({ serviceDefinition, currentRecord }) {
  const { serviceTypeList } = serviceDefinition || {};
  const [tableData, setTableData] = useState([]);
  const queryDs = useMemo(() => new DataSet({}), []);
  const tableDs = useMemo(() => new DataSet(recordDetailTableDS()), []);
  const handleFilter = useCallback(
    ({ record }) => {
      if (!tableData.length) {
        return;
      }
      const { description, serviceType, importStatus } = record.get([
        'description',
        'serviceType',
        'importStatus',
      ]);
      if (isNil(importStatus) && isNil(serviceType) && isNil(description)) {
        tableDs.loadData(tableData);
        return;
      }
      tableDs.loadData(
        tableData.filter((item) => {
          let flag = true;
          if (!isNil(importStatus)) {
            flag = item.importStatus === importStatus;
          }
          if (flag && !isNil(serviceType)) {
            flag =
              !!item.serviceType &&
              item.serviceType.toLowerCase().includes(serviceType.toLowerCase());
          }
          if (flag && !isNil(description)) {
            flag =
              !!item.description &&
              item.description.toLowerCase().includes(description.toLowerCase());
          }
          return flag;
        })
      );
    },
    [tableData, tableDs]
  );

  useEffect(() => {
    queryDs.addEventListener('update', handleFilter);
    return () => {
      queryDs.removeEventListener('update', handleFilter);
    };
  }, [queryDs, handleFilter]);

  useEffect(() => {
    let data = [];
    try {
      if (currentRecord && currentRecord.messageBody) {
        data = sortRecordList(JSON.parse(currentRecord.messageBody), 'importStatus');
      }
    } finally {
      setTableData(data);
      queryDs.loadData([]);
      tableDs.loadData(data);
    }
  }, [currentRecord]);

  const renderStatus = useCallback((status = 'ERROR') => {
    if (!status) {
      return;
    }
    return (
      <span className={styles['list-item-icon']} style={{ color: StatusColor[status] }}>
        {importStatusRenderer(status, true)}
      </span>
    );
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'importStatus',
        width: 120,
        renderer: ({ value }) => renderStatus(value),
      },
      {
        header: intl.get('srm.common.import.serviceDefinition.serviceInfo').d('服务类型/名称/编码'),
        renderer: ({ record }) => {
          if (!record) {
            return '-';
          }
          const { serviceType, serviceTypeMeaning, serviceCode, description } = record.get([
            'serviceType',
            'serviceTypeMeaning',
            'serviceCode',
            'description',
          ]);
          return (
            <div style={{ lineHeight: '20px' }}>
              <div>
                {tagRenderer(serviceType, serviceTypeMeaning)}
                {description}
              </div>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{serviceCode}</div>
            </div>
          );
        },
      },
      { name: 'importMessage' },
    ];
  }, [renderStatus]);

  return (
    <div className={styles['list-table']} key={currentRecord && currentRecord.id}>
      <div>
        <PopoverField
          key="importStatus"
          dataSet={queryDs}
          name="importStatus"
          label={intl.get('srm.common.import.status').d('状态')}
          type={PopoverFieldType.select}
          options={[
            { value: 'SUCCESS', meaning: intl.get('srm.common.import.status.success').d('成功') },
            { value: 'ERROR', meaning: intl.get('srm.common.import.status.error').d('失败') },
          ]}
        />
        <PopoverField
          key="serviceType"
          dataSet={queryDs}
          name="serviceType"
          label={intl.get('srm.common.model.serviceDefinition.serviceType').d('服务类型')}
          type={PopoverFieldType.select}
          options={serviceTypeList || []}
        />
        <PopoverField
          key="description"
          dataSet={queryDs}
          name="description"
          label={intl.get('srm.common.model.serviceDefinition.serviceName').d('服务名称')}
        />
      </div>
      <div className={styles.list}>
        <Table dataSet={tableDs} rowHeight={48} columns={columns} autoHeight />
      </div>
    </div>
  );
}

export default connect(({ serviceDefinition }) => ({
  serviceDefinition,
}))(RecordDetail);
