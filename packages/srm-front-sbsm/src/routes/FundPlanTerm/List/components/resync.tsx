import React, { useMemo, useCallback } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { resyncListDS } from '../listDS';
import { resync } from '../../utils/api';

interface ResyncProps {
  recordInfo: any;
  listDs: any;
};

const Resync = observer((props: ResyncProps) => {

  const { recordInfo, listDs } = props;
  const termHeaderId = recordInfo?.get('termHeaderId');

  const resyncListDs = useMemo(() => new DataSet(resyncListDS(termHeaderId)), [termHeaderId]);

  const handleResync = useCallback(async(record) => {
    const res = getResponse(await resync([record.toData()]));
    if (res) {
      resyncListDs.query();
      listDs.query();
    }
  }, [resyncListDs, listDs]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'syncSystem',
      },
      {
        name: 'syncStatus',
      },
      {
        name: 'syncResponseMsg',
      },
      {
        name: 'lastUpdateDate',
      },
      {
        name: 'createdByName',
      },
      {
        name: 'operation',
        renderer: ({ record }) => {
          const { syncStatus } = record?.get(['syncStatus']) || {};
          if (['SYNC_SUCCESS'].includes(syncStatus)) return null;
          return (
            <a onClick={() => handleResync(record)}>
              {intl.get('sbsm.common.button.resyncExecute').d('重新执行')}
            </a>
          );
        },
      },
    ];
  }, [handleResync]);

  return (
    <div style={{ marginTop: '16px' }}>
      <Table
        columns={columns}
        dataSet={resyncListDs}
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    </div>
  );
});

export default Resync;
