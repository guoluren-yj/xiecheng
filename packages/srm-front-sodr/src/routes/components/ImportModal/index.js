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
import { getResponse } from 'utils/utils';
import { reSync } from '@/services/orderWorkspaceService';
import { throttle } from 'lodash';
import { importModalDs } from './store/importModalDS';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const ImportModal = (props) => {
  const { currentRecord } = props;
  const poHeaderId = currentRecord.get('poHeaderId');
  const importModalDS = useMemo(() => new DataSet(importModalDs(poHeaderId)), []);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    importModalDS.setQueryParameter('poHeaderId', poHeaderId);
    importModalDS.query();
  }, []);

  const handleSync = throttle(
    async (record) => {
      setLoading(true);
      const res = getResponse(await reSync(poHeaderId, record.toData()));
      setLoading(false);
      if (res) {
        // const newData = importModalDS.data.map((i) =>
        //   i.get('syncRecordId') === res.syncRecordId ? res : i
        // );
        // importModalDS.loadData(newData, importModalDS.currentPage);
        importModalDS.query();
      }
    },
    THROTTLE_TIME,
    { trailing: false }
  );
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
            {intl.get(`sodr.workspace.model.common.alinge`).d('重新执行')}
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
