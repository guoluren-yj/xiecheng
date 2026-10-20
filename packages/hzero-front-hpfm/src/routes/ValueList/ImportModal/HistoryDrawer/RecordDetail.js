import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { isNil } from 'lodash';

import PopoverField, { PopoverFieldType } from '@/components/PopoverField';
import { importStatusRenderer, sortRecordList, recordDetailTableDS, StatusColor } from '../util';
import styles from './index.less';

function RecordDetail({ currentRecord }) {
  const [tableData, setTableData] = useState([]);
  const queryDs = useMemo(() => new DataSet({}), []);
  const tableDs = useMemo(() => new DataSet(recordDetailTableDS()), []);
  const handleFilter = useCallback(({ record }) => {
    if (!tableData.length) {
      return;
    }
    const { lovCode, lovName, importStatus } = record.get(['lovCode', 'lovName', 'importStatus']);
    if (isNil(importStatus) && isNil(lovCode) && isNil(lovName)) {
      tableDs.loadData(tableData);
      return;
    }
    tableDs.loadData(
      tableData.filter(item => {
        let flag = true;
        if (!isNil(importStatus)) {
          flag = item.importStatus === importStatus;
        }
        if (flag && !isNil(lovCode)) {
          flag = !!item.lovCode && item.lovCode.toLowerCase().includes(lovCode.toLowerCase());
        }
        if (flag && !isNil(lovName)) {
          flag = !!item.lovName && item.lovName.toLowerCase().includes(lovName.toLowerCase());
        }
        return flag;
      })
    );
  }, [tableData, tableDs]);

  useEffect(() => {
    queryDs.addEventListener('update', handleFilter);
    return () => {
      queryDs.removeEventListener('update', handleFilter);
    };
  }, [queryDs, handleFilter]);


  useEffect(() => {
    let data = [];
    if (currentRecord && currentRecord.lovList && currentRecord.lovList.length) {
      data = sortRecordList(currentRecord.lovList, 'importStatus');
    }
    setTableData(data);
    queryDs.loadData([]);
    tableDs.loadData(data);
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
      { name: 'lovCode' },
      { name: 'lovName' },
      { name: 'message' },
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
            { value: 'NOT_PROCESS', meaning: intl.get('srm.common.import.status.noPass').d('未处理') },
          ]}
        />
        <PopoverField
          key="lovCode"
          dataSet={queryDs}
          name="lovCode"
          label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}
        />
        <PopoverField
          key="lovName"
          dataSet={queryDs}
          name="lovName"
          label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
        />
      </div>
      <div className={styles.list}>
        <Table
          dataSet={tableDs}
          columns={columns}
          autoHeight
        />
      </div>
    </div>
  );
};

export default memo(RecordDetail);