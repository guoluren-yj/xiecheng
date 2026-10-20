import React, { useMemo, useCallback } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { Commands } from 'choerodon-ui/pro/lib/table/Table';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { listDS } from './storeDS';
import { statusTagRender } from '../../../Components/StatusTag';

const LineSyncDetail = (props) => {
  const { topRecord, topListDs } = props;
  const listDs = useMemo<DataSet>(() => new DataSet(listDS(topRecord)), [topRecord]);

  const handleReSync = useCallback(async (record: DSRecord) => {
    Object.assign(record, { status: 'update' }); // 触发 dirty 提交
    const res = await listDs.setState('submitType', 'reSync').forceSubmit();
    if (!res) return;
    topListDs.query();
  }, [listDs, topListDs]);

  const columns = useMemo<ColumnProps[]>(
    () => [
      { name: 'recordTypeMeaning', width: 150 },
      { name: 'recordStatus', width: 150, renderer: statusTagRender },
      { name: 'recordMessage', width: 300 },
      { name: 'lastUpdateDate', width: 150 },
      { name: 'createdByName', width: 150 },
      {
        name: 'operation',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        align: ColumnAlign.left,
        command: ({ record }) => {
          const recordStatus = record?.get('recordStatus');
          return [
            (['SYNC_FAILURE', 'UNSYNCHRONIZED'].includes(recordStatus) && (
              <Button funcType={FuncType.link} color={ButtonColor.primary} wait={1000} onClick={() => handleReSync(record)}>
                {intl.get('ssta.purchaseSettle.view.button.reSync').d('重新同步')}
              </Button>
            )) as Commands,
          ];
        },
      },
    ],
    [handleReSync],
  );

  return (
    <Table dataSet={listDs} columns={columns} style={{ maxHeight: 'calc(100vh - 200px)' }} />
  );
};

export default LineSyncDetail;