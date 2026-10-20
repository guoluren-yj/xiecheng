import React, { memo, useCallback, useMemo } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { statusTagRender } from '@/routes/components/StatusTag';
import { SyncStutusLineDS } from './SyncStatusLineDS';

const SyncStutusModal = props => {
  const { sourceHeaderId } = props;

  const lineDS = useMemo(() => new DataSet(SyncStutusLineDS(sourceHeaderId)), [sourceHeaderId]);

  const handleReSync = useCallback(
    async record => {
      // eslint-disable-next-line no-param-reassign
      record.status = 'update';
      lineDS.submit();
    },
    [lineDS]
  );

  const columns = useMemo(
    () => [
      {
        name: 'syncStatusMeaning',
        renderer: ({ record, text, dataSet }) => {
          return text
            ? statusTagRender({
                text,
                record,
                dataSet,
                name: 'syncStatus',
              })
            : null;
        },
        width: 120,
      },
      { name: 'syncTypeNodeMeaning', width: 150 },
      { name: 'syncResponseMessage' },
      { name: 'lastUpdateDate', width: 120 },
      { name: 'realName', width: 120 },
      {
        name: 'reSync',
        width: 120,
        renderer: ({ record }) => {
          const syncStatus = record.get('syncStatus');
          return ['FAILED'].includes(syncStatus) ? (
            <Button funcType="link" onClick={() => handleReSync(record)}>
              {intl.get(`ssrc.projectSetup.view.button.title.reSync`).d('重新同步')}
            </Button>
          ) : null;
        },
      },
      { name: 'externalSystemCode', width: 120 },
      { name: 'interfaceCode', width: 120 },
    ],
    [handleReSync]
  );

  return <Table dataSet={lineDS} columns={columns} style={{ maxHeight: 'calc(100% - 35px)' }} />;
};

export default memo(SyncStutusModal);
