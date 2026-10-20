import React, { useEffect, useMemo, useImperativeHandle } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import PopoverField, { PopoverFieldType } from '@/components/PopoverField';
import { unitFilterFormDS, ImportUnitTableDs, ImportStatusRenderer } from './util';
import styles from '../index.less';

const ImportDetail = ({ headerId, lineRef }) => {
  const importUnitTableDs = useMemo(() => new DataSet(ImportUnitTableDs()), []);
  const unitFilterFormDs = useMemo(() => new DataSet(unitFilterFormDS()), []);

  useEffect(() => {}, []);
  useEffect(() => {
    unitFilterFormDs.addEventListener('update', handleFilterFormDsUpdate);
    return () => {
      unitFilterFormDs.removeEventListener('update', handleFilterFormDsUpdate);
    };
  }, []);

  useImperativeHandle(lineRef, () => ({
    fetchData,
  }));

  useEffect(() => {
    unitFilterFormDs.loadData([]);
    fetchData();
  }, [headerId]);

  const fetchData = () => {
    if (!headerId) {
      return;
    }
    importUnitTableDs.setQueryParameter('headerId', headerId);
    importUnitTableDs.query();
  };

  const handleFilterFormDsUpdate = ({ record }) => {
    if (record) {
      const { status, documentCodeOrName } = record.get(['status', 'documentCodeOrName']);
      importUnitTableDs.setQueryParameter('status', status);
      importUnitTableDs.setQueryParameter('documentCodeOrName', documentCodeOrName);
    }
    importUnitTableDs.query();
  };

  const importUnitTableCols = useMemo(
    () => [
      {
        name: 'importStatus',
        width: 80,
        renderer: ({ value }) => renderStatusIcon(value),
      },
      {
        name: 'documentCode',
        width: 200,
      },
      {
        name: 'documentName',
        width: 200,
        renderer: ({ value, record }) => (
          <div className={styles['unit-info']}>
            <div>
              <span className="unit-name">{value}</span>
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>{record.get('menuName')}</div>
          </div>
        ),
      },
      { name: 'errMsg', tooltip: 'overflow', width: 350 },
      {
        width: 200,
        name: 'businessObjectName',
      },
    ],
    []
  );

  const renderStatusIcon = (status = 'WARN') => {
    const StatusType = {
      SUCCESS: intl.get('smbl.checkRules.import.status.pass').d('成功'),
      FAIL: intl.get('smbl.checkRules.import.status.error').d('失败'),
      WARN: intl.get('smbl.checkRules.import.status.warn').d('异常'),
    };
    const color = {
      SUCCESS: '#47B881',
      FAIL: '#F56349',
      WARN: '#FCA000',
    };
    if (!status) {
      return;
    }
    return (
      <span className={styles['list-item-icon']} style={{ color: color[status] }}>
        {ImportStatusRenderer(status)}
        {StatusType[status]}
      </span>
    );
  };

  return (
    <div className={styles['content-wrapper']}>
      <div className="history-detail-title">
        {intl.get('smbl.checkRules.view.title.pageImportResult').d('页面导入结果')}
      </div>
      <div style={{ margin: '16px 0 8px' }}>
        <PopoverField
          key="status"
          dataSet={unitFilterFormDs}
          name="status"
          label={intl.get('smbl.checkRules.import.status').d('状态')}
          type={PopoverFieldType.select}
          options={[
            {
              value: 'SUCCESS',
              meaning: intl.get('smbl.checkRules.import.status.success').d('成功'),
            },
            { value: 'FAIL', meaning: intl.get('smbl.checkRules.import.status.error').d('失败') },
          ]}
        />
        <PopoverField
          key="documentName"
          dataSet={unitFilterFormDs}
          name="documentCodeOrName"
          label={intl.get('smbl.checkRules.view.tag.documentCodeOrName').d('流程单据名称/编码')}
        />
        <Table
          border={false}
          rowHeight={40}
          dataSet={importUnitTableDs}
          columns={importUnitTableCols}
          className={styles['list-table']}
        />
      </div>
    </div>
  );
};

export default ImportDetail;
