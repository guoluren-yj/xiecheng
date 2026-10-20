import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import request from 'hzero-front/lib/utils/request';
import { getEnvConfig } from "hzero-front/lib/utils/iocUtils";
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Tooltip as Ttype } from 'choerodon-ui/pro/lib/core/enum';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import PopoverField, { PopoverFieldType } from '../../../../../../components/PopoverField';
import { fieldFilterFormDS, ImportFieldTableDs, ImportStatusRenderer } from './util';
import styles from '../index.less';

const ImportFieldDetail = ({
  isInDetail = false,
  externalFeildList = [] as any[],
  templateCode = '',
  docCode = '',
  custTypeObj = {},
}) => {
  const [fieldList, setFieldList] = useState(externalFeildList as any[]);
  const importFieldTableDs = useMemo(() => new DataSet(ImportFieldTableDs()), []);
  const importFieldFromDs = useMemo(() => new DataSet(fieldFilterFormDS()), []);

  useEffect(() => {
    if(isInDetail) {
      const { HZERO_PLATFORM } = getEnvConfig();
      request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/import/template-log/details`, {
        method: "POST",
        query: {
          templateCode, docCode,
        },
      }).then(res => {
        if(getResponse(res)){
          setFieldList(res || []);
        }
      });
    }
  }, []);

  useEffect(() => {
    importFieldTableDs.loadData(fieldList);
  }, [fieldList]);
  useEffect(() => {
    importFieldFromDs.addEventListener('update', handleFieldFormUpdate);
    return () => {
      importFieldFromDs.removeEventListener('update', handleFieldFormUpdate);
    };
  }, [importFieldFromDs, importFieldTableDs]);

  const filterData = (record, data) => {
    const { status, fieldName, fieldCode, model } = record.get([
      'status',
      'fieldName',
      'fieldCode',
      'model',
    ]);
    if (!data.length) {
      return [];
    }
    if (!status && !fieldName && !fieldCode && !model) {
      return data;
    }
    return data.filter(item => {
      let flag = true;
      if (status) {
        flag = item.status && item.status === status;
      }
      if (flag && fieldName) {
        if (item.fieldName) {
          flag = item.fieldName.includes(fieldName);
        } else if (item.fieldAlias) {
          flag = item.fieldAlias.includes(fieldName);
        }
      }
      if (flag && fieldCode) {
        flag = item.fieldCode && item.fieldCode.includes(fieldCode);
      }
      if (flag && model) {
        flag = item.modelName && item.modelName.includes(model);
      }
      return flag;
    });
  };

  const handleFieldFormUpdate = ({ record }) => {
    importFieldTableDs.loadData(filterData(record, fieldList));
  };

  const renderStatusIcon = (status = 'warn') => {
    const StatusType = {
      pass: intl.get('hpfm.individual.import.status.pass').d('成功'),
      error: intl.get('hpfm.individual.import.status.error').d('失败'),
      warn: intl.get('hpfm.individual.import.status.warn').d('异常'),
    };
    const color = {
      pass: '#47B881',
      error: '#F56349',
      warn: '#FCA000',
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

  const tableCols = useCallback(
    (flag = false): ColumnProps[] => [
      {
        name: 'status',
        width: 100,
        renderer: ({ value }) => renderStatusIcon(value),
      },
      {
        name: 'fieldName',
        width: 200,
        renderer: ({ value, record }) => (
          <div className={styles['field-info']}>
            <div>
              {record!.get('custType') && (
                <Tag
                  color={
                    record!.get('custType') === 'STD' ? 'rgba(0,0,0,0.06)' : 'rgba(252,160,0,0.10)'
                  }
                  style={{
                    color: record!.get('custType') === 'STD' ? 'rgba(0,0,0,0.65)' : '#FCA000',
                  }}
                >
                  {custTypeObj[record!.get('custType')]}
                </Tag>
              )}
              <span className='field-name'>{value}</span>
            </div>
            <div>{record!.get('fieldCode') || record!.get('fieldAlias')}</div>
          </div>
        ),
      },
      { name: 'modelName', width: 200, hidden: flag },
      { name: 'message', tooltip: Ttype.overflow },
    ],
    [custTypeObj]
  );

  const renderFieldDetail = useCallback(
    (formDataSet, tableDataSet, flag) => {
      return (
        <div className={styles['history-detail']}>
          <div style={{ margin: '0 0 8px' }}>
            <PopoverField
              type={PopoverFieldType.select}
              options={[
                {
                  value: 'pass',
                  meaning: intl.get('hpfm.individual.import.status.success').d('成功'),
                },
                {
                  value: 'warn',
                  meaning: intl.get('hpfm.individual.import.status.warn').d('异常'),
                },
                {
                  value: 'error',
                  meaning: intl.get('hpfm.individual.import.status.error').d('失败'),
                },
              ]}
              dataSet={formDataSet}
              name="status"
              label={intl.get('hpfm.individual.import.status').d('状态')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="fieldName"
              label={intl.get('hpfm.individual.import.fieldName').d('字段名称')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="fieldCode"
              label={intl.get('hpfm.individual.import.fieldCode').d('字段编码')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="model"
              label={intl.get('hpfm.individual.import.model').d('所属模型')}
            />
          </div>
          <Table
            className={styles['list-table']}
            style={{maxHeight: "calc(100% - 80px)"}}
            rowHeight={40}
            dataSet={tableDataSet}
            columns={tableCols(flag)}
          />
        </div>
      );
    },
    [custTypeObj]
  );

  return renderFieldDetail(importFieldFromDs, importFieldTableDs, undefined);
};

export default ImportFieldDetail;
