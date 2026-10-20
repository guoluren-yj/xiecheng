import React, { FC, useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'srm-front-boot/lib/utils/intl';
import { isNil } from 'lodash';

import PopoverField from '@/components/PopoverField';
import { PopoverFieldType } from '@/components/PopoverField/enum';
import { ImportStatusRenderer, sortRecordList } from '../util';
import styles from './index.less';

interface IRecordDetail {
  currentRecord: any;
}

const RecordDetail: FC<IRecordDetail> = ({ currentRecord }) => {
  const { importTemplateScene = false } = currentRecord || {};
  const [tableData, setTableData] = useState<any[]>([]);
  const queryDs = useMemo(() => new DataSet({}), []);
  const tableDs = useMemo(() => new DataSet({
    selection: false,
    paging: false,
    fields: [
      { name: 'recordStatus', label: intl.get('srm.common.import.status').d('状态') },
      { name: 'entityName' },
      { name: 'entityCode' },
      { name: 'errorMessage', label: intl.get('srm.common.model.combineBusinessObject.error').d('错误信息') },
    ],
  }), []);
  const handleFilter = useCallback(({ record }) => {
    const { recordStatus, entityCode, templateName, templateCode } = record.get(['recordStatus', 'entityCode', 'templateName', 'templateCode']);
    if (!tableData.length) {
      return;
    }
    if (isNil(recordStatus) && isNil(entityCode) && isNil(templateName) && isNil(templateCode)) {
      tableDs.loadData(tableData);
      return;
    }
    tableDs.loadData(
      tableData.filter(item => {
        let flag = true;
        if (!isNil(recordStatus)) {
          flag = item.recordStatus === recordStatus;
        }
        if (flag && !isNil(templateName)) {
          flag = item.entityName && item.entityName.toLowerCase().includes(templateName.toLowerCase());
        }
        if (flag && !isNil(templateCode)) {
          flag = item.entityCode && item.entityCode.toLowerCase().includes(templateCode.toLowerCase());
        }
        if (flag && !isNil(entityCode)) {
          flag = item.expand && item.expand.combineCode && item.expand.combineCode.toLowerCase().includes(entityCode.toLowerCase());
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
  }, [handleFilter]);


  useEffect(() => {
    let data: any[] = [];
    if (currentRecord && currentRecord.importCombineObjectRecords && currentRecord.importCombineObjectRecords.length) {
      data = sortRecordList(currentRecord.importCombineObjectRecords, 'recordStatus');
    }
    setTableData(data);
    queryDs.loadData([]);
    tableDs.loadData(data);
  }, [currentRecord]);

  const renderStatus = useCallback((status = 'ERROR') => {
    const StatusType = {
      SUCCESS: intl.get('srm.common.import.status.pass').d('成功'),
      ERROR: intl.get('srm.common.import.status.error').d('失败'),
    };
    const color = {
      SUCCESS: '#47B881',
      ERROR: '#F56349',
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
  }, []);

  const columns = [
    {
      name: 'recordStatus',
      width: 120,
      renderer: ({ value }) => renderStatus(value),
    },
    importTemplateScene && {
      name: 'entityCode',
      title: intl.get('srm.common.model.combineBusinessObject.code').d('组合业务对象编码'),
      renderer: ({ record }) => {
        return record && record.get('expand') && record.get('expand').combineCode;
      },
    },
    importTemplateScene && {
      name: 'type',
      title: intl.get('hmde.common.templateCategory').d('模板类型'),
      renderer: ({ record }) => {
        if (!record || !record.get('expand')) {
          return;
        }
        const { recordType } = record && record.get('expand');
        return recordType === 'EXPORT_TEMPLATE' ? intl.get('hmde.boComposition.view.message.tab.exportTemplate').d('导出模板')
          : intl.get('hmde.boComposition.view.message.tab.importTemplate').d('导入模板');
      },
    },
    {
      name: 'entityName',
      title:
        importTemplateScene ?
          intl.get('srm.common.model.combineBusinessObject.template.name').d('模板名称')
          : intl.get('srm.common.model.combineBusinessObject.name').d('组合业务对象名称'),
    },
    {
      name: 'entityCode',
      title:
        importTemplateScene ?
          intl.get('srm.common.model.combineBusinessObject.template.code').d('模板编码')
          : intl.get('srm.common.model.combineBusinessObject.code').d('组合业务对象编码'),
    },
    { name: 'errorMessage' },
  ].filter(Boolean) as ColumnProps[];

  return (
    <div className={styles['list-table']} key={currentRecord && currentRecord.id}>
      <div>
        <PopoverField
          key="recordStatus"
          dataSet={queryDs}
          name="recordStatus"
          label={intl.get('srm.common.import.status').d('状态')}
          type={PopoverFieldType.select}
          options={[
            { value: 'SUCCESS', meaning: intl.get('srm.common.import.status.success').d('成功') },
            { value: 'ERROR', meaning: intl.get('srm.common.import.status.error').d('失败') },
          ]}
        />
        <PopoverField
          key="entityCode"
          dataSet={queryDs}
          name="entityCode"
          label={intl.get('srm.common.model.combineBusinessObject.code').d('组合业务对象编码')}
        />
        {importTemplateScene && (
          <>
            <PopoverField
              key="templateName"
              dataSet={queryDs}
              name="templateName"
              label={intl.get('srm.common.model.combineBusinessObject.template.name').d('模板名称')}
            />
            <PopoverField
              key="templateCode"
              dataSet={queryDs}
              name="templateCode"
              label={intl.get('srm.common.model.combineBusinessObject.template.code').d('模板编码')}
            />
          </>
        )}
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