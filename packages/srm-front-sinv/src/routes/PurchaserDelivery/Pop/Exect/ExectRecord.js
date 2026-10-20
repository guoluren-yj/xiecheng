/**
 * ExectRecord - 导入
 * @date: 2022-5-12
 * @author: Mya
 * @version: 0.0.1
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { async } from '@/services/purchaserDeliveryService';
import { getResponse } from 'utils/utils';
import { ExectDataSet } from './ExectDS';

const ExectRecord = (props) => {
  const { asnHeaderId } = props;
  const ExectDS = useMemo(() => new DataSet(ExectDataSet()), []);

  useEffect(() => {
    ExectDS.setQueryParameter('asnHeaderIds', asnHeaderId);
    ExectDS.query();
  }, []);

  // 重新同步
  const resSync = async (recordId) => {
    const res = await async({ asnInterRecordIds: [recordId] });
    if (getResponse(res)) {
      ExectDS.query();
    }
  };

  const columns = [
    {
      name: 'importStatusMeaning',
      width: 150,
      renderer: ({ record }) =>
        record.get('importStatus') === 'SUCCESS' ? (
          <span style={{ color: '#29BECE' }}> {record.get('importStatusMeaning')} </span>
        ) : record.get('importStatus') === 'FAIL' ? (
          <span style={{ color: 'red' }}> {record.get('importStatusMeaning')} </span>
        ) : (
          <span> {record.get('importStatusMeaning')} </span>
        ),
    },
    {
      name: 'sync',
      width: 150,
      renderer: ({ record }) =>
        record.get('importStatus') === 'SUCCESS' ||
        record.get('importStatus') === 'IMPORTING' ? null : (
          <a onClick={() => resSync(record.get('recordId'))}>
            {intl.get(`sinv.common.model.common.sync`).d('重新同步')}
          </a>
        ),
    },
    {
      name: 'importMessage',
      width: 150,
    },
    {
      name: 'sourceCode',
      width: 150,
    },
    {
      name: 'importType',
      width: 150,
    },
    {
      name: 'interName',
      width: 150,
    },
  ];

  return (
    <Fragment>
      <Table columns={columns} dataSet={ExectDS} />
    </Fragment>
  );
};

export default ExectRecord;
