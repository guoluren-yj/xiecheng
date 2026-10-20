import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { isNil } from 'lodash';

import PopoverField from '../PopoverField';
import { importStatusRenderer, sortRecordList, recordDetailTableDS, StatusColor } from './util';
import styles from './index.less';

function RecordDetail({ currentRecord }) {
  const [tableData, setTableData] = useState([]);
  const queryDs = useMemo(() => new DataSet({}), []);
  const tableDs = useMemo(() => new DataSet(recordDetailTableDS()), []);
  const handleFilter = useCallback(
    ({ record }) => {
      if (!tableData.length) {
        return;
      }
      const {
        categoryCode,
        categoryDescription,
        documentCode,
        documentDescription,
        importStatus,
      } = record.get([
        'importStatus',
        'categoryCode',
        'categoryDescription',
        'documentCode',
        'documentDescription',
      ]);
      if (
        isNil(importStatus) &&
        isNil(categoryCode) &&
        isNil(categoryDescription) &&
        isNil(documentCode) &&
        isNil(documentDescription)
      ) {
        tableDs.loadData(tableData);
        return;
      }
      tableDs.loadData(
        tableData.filter((item) => {
          let flag = true;
          if (!isNil(importStatus)) {
            flag = item.importStatus === importStatus;
          }
          if (flag && !isNil(categoryCode)) {
            flag =
              !!item.categoryCode &&
              item.categoryCode.toLowerCase().includes(categoryCode.toLowerCase());
          }
          if (flag && !isNil(categoryDescription)) {
            flag =
              !!item.categoryDescription &&
              item.categoryDescription.toLowerCase().includes(categoryDescription.toLowerCase());
          }
          if (flag && !isNil(documentCode)) {
            flag =
              !!item.documentCode &&
              item.documentCode.toLowerCase().includes(documentCode.toLowerCase());
          }
          if (flag && !isNil(documentDescription)) {
            flag =
              !!item.documentDescription &&
              item.documentDescription.toLowerCase().includes(documentDescription.toLowerCase());
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
    if (currentRecord && currentRecord.confList && currentRecord.confList.length) {
      data = sortRecordList(currentRecord.confList, 'importStatus');
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
        width: 90,
        renderer: ({ value }) => renderStatus(value),
      },
      { name: 'categoryCode' },
      { name: 'categoryDescription' },
      { name: 'documentCode' },
      { name: 'documentDescription' },
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
          type="select"
          options={[
            { value: 'SUCCESS', meaning: intl.get('srm.common.import.status.success').d('成功') },
            { value: 'ERROR', meaning: intl.get('srm.common.import.status.error').d('失败') },
          ]}
        />
        <PopoverField
          key="categoryCode"
          dataSet={queryDs}
          name="categoryCode"
          label={intl.get('swfl.processAppoint.model.processClassify.code').d('流程分类编码')}
        />
        <PopoverField
          key="categoryDescription"
          dataSet={queryDs}
          name="categoryDescription"
          label={intl.get('swfl.processAppoint.model.processClassify.describe').d('流程分类描述')}
        />
        <PopoverField
          key="documentCode"
          dataSet={queryDs}
          name="documentCode"
          label={intl.get('swfl.processAppoint.model.processSecurity.code').d('流程单据编码')}
        />
        <PopoverField
          key="documentDescription"
          dataSet={queryDs}
          name="documentDescription"
          label={intl.get('swfl.processAppoint.model.processSecurity.describe').d('流程单据描述')}
        />
      </div>
      <div className={styles.list}>
        <Table dataSet={tableDs} columns={columns} autoHeight />
      </div>
    </div>
  );
}

export default memo(RecordDetail);
