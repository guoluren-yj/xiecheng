/**
 * @Description: 导入状态
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-12-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { importModalDs } from './store/importModalDS';
import { reSyncBatch } from '@/services/orderWorkspaceService';

const ImportModal = (props) => {
  const { currentRecord } = props;
  const poLineLocationId = currentRecord.get('poLineLocationId');
  const importModalDS = useMemo(() => new DataSet(importModalDs(poLineLocationId)), []);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    importModalDS.query();
  }, []);

  const handleSync = async (record) => {
    setLoading(true);
    const res = getResponse(await reSyncBatch({ data: [{ ...record.toData() }] }));
    setLoading(false);
    if (res) {
      notification.success();
      importModalDS.query();
    }
  };
  const columns = [
    {
      name: 'syncTypeMeaning',
      width: 100,
    },
    {
      name: 'syncStatusMeaning',
      width: 100,
    },
    {
      name: 'syncResponseMsg',
      width: 140,
    },
    {
      name: 'lastUpdateDate',
      width: 120,
    },
    {
      name: 'lastUpdatedName',
      width: 100,
    },
    {
      name: 'button',
      width: 120,
      renderer: ({ record }) =>
        record.get('reSync') !== 1 ? null : (
          <a onClick={() => handleSync(record)}>
            {record.get('syncStatus') === 'FAIL' &&
              intl.get(`sodr.workspace.view.button.resynchronize`).d('重新同步')}
            {record.get('syncStatus') === 'WAIT_SYNC' &&
              intl.get(`hzero.common.status.autoSignature`).d('同步')}
          </a>
        ),
    },
    {
      name: 'externalSystemCode',
      width: 100,
    },
    {
      name: 'syncType',
      width: 100,
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table columns={columns} dataSet={importModalDS} />
    </Spin>
  );
};
export default ImportModal;
