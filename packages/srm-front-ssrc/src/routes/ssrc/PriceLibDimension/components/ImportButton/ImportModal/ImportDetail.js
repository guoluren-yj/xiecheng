import React, { useEffect, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { ImportPriceTableDS, ImportStatusRenderer, getCurrentStatusConfig } from './util';
import styles from '../index.less';

const ImportDetail = ({ batchId }) => {
  const importPriceTableDs = useMemo(() => new DataSet(ImportPriceTableDS(batchId)), [batchId]);

  useEffect(() => {
    if (!batchId) {
      return;
    }
    importPriceTableDs.query();
  }, [batchId]);

  const importPriceTableCols = useMemo(
    () => [
      {
        name: 'status',
        width: 100,
        renderer: ({ value, record }) => renderStatusIcon(value, record),
      },
      {
        name: 'templateName',
        width: 150,
      },
      {
        name: 'errorMessage',
        tooltip: 'overflow',
      },
      { name: 'unimported', tooltip: 'overflow' },
    ],
    []
  );

  const renderStatusIcon = (status, record) => {
    const { color } = getCurrentStatusConfig(status);
    return (
      <span className={styles['list-item-icon']} style={{ color }}>
        {ImportStatusRenderer(status)}
        {record.get('statusMeaning')}
      </span>
    );
  };

  return (
    <div className={styles['content-wrapper']}>
      <div className="history-detail-title">
        {intl.get('hpfm.individual.view.title.pageImportResult').d('页面导入结果')}
      </div>
      <div style={{ margin: '16px 0 8px' }}>
        <Table
          border={false}
          rowHeight={40}
          queryFieldsLimit={2}
          dataSet={importPriceTableDs}
          columns={importPriceTableCols}
          className={styles['list-table']}
        />
      </div>
    </div>
  );
};

export default ImportDetail;
