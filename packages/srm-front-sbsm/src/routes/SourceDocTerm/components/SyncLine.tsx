import React, { useContext, useMemo, Fragment, useCallback } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';

const TermLine = () => {

  const { sourceDocSyncListDs, sourceDocHeaderDs } = useContext<StoreValueType>(Store);
  const { docTermStatus } = sourceDocHeaderDs.current?.get(['docTermStatus']) || {};

  const handleSync = useCallback(async(record) => {
    const syncType = record?.get('syncType');
    const res = await sourceDocSyncListDs.setState('syncData', sourceDocHeaderDs?.current?.toData()).setState('submitType', syncType).submit();
    if (!res) return;
    sourceDocHeaderDs.query();
  }, [sourceDocHeaderDs, sourceDocSyncListDs]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'syncStatus',
      },
      {
        name: 'syncFunction',
      },
      {
        name: 'syncFeedBack',
      },
      {
        name: 'operate',
        renderer: ({ record }) => (
          !['SYNC_SUCCESS', 'CANCEL_SUCCESS'].includes(record?.get('syncStatus')) && docTermStatus === 'PUBLISHED' ? (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleSync(record)}
            >
              {intl.get('sbsm.common.button.sync').d('同步')}
            </Button>
          ) : '-'
        ),
      },
    ];
  }, [handleSync, docTermStatus]);

  return (
    <Fragment>
      <Table
        columns={columns}
        dataSet={sourceDocSyncListDs}
        style={{ maxHeight: 430 }}
        selectionMode={SelectionMode.none}
      />
    </Fragment>
  );
};

export default observer(TermLine);
