import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'srm-front-boot/lib/utils/intl';
import { isNil } from 'lodash';

import PopoverField from '../../../../components/PopoverField';
import { PopoverFieldType } from '../../../../components/PopoverField/enum';
import { IImportHistory, importStatusRenderer, sortRecordList, recordDetailTableDS, IReport, StatusColor } from '../util';
import styles from './index.less';

interface IRecordDetail {
  currentRecord?: IImportHistory;
}

function RecordDetail({ currentRecord }: IRecordDetail) {
  const [tableData, setTableData] = useState<IReport[]>([]);
  const queryDs = useMemo(() => new DataSet({}), []);
  const tableDs = useMemo(() => new DataSet(recordDetailTableDS()), []);
  const handleFilter = useCallback(({ record }) => {
    if (!tableData.length) {
      return;
    }
    const { reportCode, reportName, importStatus } = record.get(['reportCode', 'reportName', 'importStatus']);
    if (isNil(importStatus) && isNil(reportCode) && isNil(reportName)) {
      tableDs.loadData(tableData);
      return;
    }
    tableDs.loadData(
      tableData.filter(item => {
        let flag = true;
        if (!isNil(importStatus)) {
          flag = item.importStatus === importStatus;
        }
        if (flag && !isNil(reportCode)) {
          flag = !!item.reportCode && item.reportCode.toLowerCase().includes(reportCode.toLowerCase());
        }
        if (flag && !isNil(reportName)) {
          flag = !!item.reportName && item.reportName.toLowerCase().includes(reportName.toLowerCase());
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
    let data: IReport[] = [];
    if (currentRecord && currentRecord.reportList && currentRecord.reportList.length) {
      data = sortRecordList(currentRecord.reportList, 'importStatus');
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

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'importStatus',
        width: 120,
        renderer: ({ value }) => renderStatus(value),
      },
      { name: 'reportCode' },
      { name: 'reportName' },
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
          ]}
        />
        <PopoverField
          key="reportName"
          dataSet={queryDs}
          name="reportName"
          label={intl.get('srm.common.model.reportTemplate.name').d('打印模板名称')}
        />
        <PopoverField
          key="reportCode"
          dataSet={queryDs}
          name="reportCode"
          label={intl.get('srm.common.model.reportTemplate.code').d('打印模板编码')}
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